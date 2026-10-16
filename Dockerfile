# -----------------------------------------------------------------------------
# Math Treasure Hunt - production image for Render (Docker web service)
# Stack: PHP 8.3, Laravel 13, Inertia/React, MySQL client (pdo_mysql)
# -----------------------------------------------------------------------------

# ===== 1) PHP Composer dependencies ==========================================
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction \
    --ignore-platform-reqs

COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY routes ./routes
COPY artisan ./artisan
COPY public/index.php ./public/index.php

RUN composer dump-autoload --optimize --classmap-authoritative --no-dev --no-interaction


# ===== 2) Frontend assets ====================================================
# Use PHP 8.3 (Laravel 13 requires ^8.3). Debian bookworm's default php-cli is
# 8.2 and causes `php artisan` to exit 255 during Wayfinder's generate step.
FROM php:8.3-cli-bookworm AS frontend

# Node 22 binaries from the official image (vite-plus needs Node ^22.18 / >=24.11)
COPY --from=node:22-bookworm /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && node -v && npm -v && php -v

WORKDIR /app

COPY --from=vendor /app /app
COPY package.json package-lock.json .npmrc ./
COPY resources ./resources
COPY vite.config.ts tsconfig.json components.json ./
COPY public ./public

RUN mkdir -p \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        storage/app/public \
        bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

# Build-time only placeholders so artisan/Wayfinder can boot.
# Not written into a .env file, not the production APP_KEY, not used at runtime.
# No MySQL: use array/sync drivers so package:discover / wayfinder never touch DB.
ENV APP_ENV=production \
    APP_DEBUG=false \
    APP_KEY=base64:MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE= \
    APP_URL=http://localhost \
    DB_CONNECTION=sqlite \
    DB_DATABASE=:memory: \
    SESSION_DRIVER=array \
    CACHE_STORE=array \
    QUEUE_CONNECTION=sync \
    LOG_CHANNEL=stderr

# Composer installed --no-scripts, so discover packages explicitly (no DB needed).
RUN php artisan package:discover --ansi --no-interaction

# Lockfile is committed (package-lock.json). npm ci must succeed against it.
RUN npm ci

# Wayfinder runs `php artisan wayfinder:generate` inside this build.
RUN npm run build \
    && test -f public/build/manifest.json \
    && rm -f public/hot


# ===== 3) Runtime: nginx + php-fpm ===========================================
FROM php:8.3-fpm-bookworm AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        curl \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libzip-dev \
        libicu-dev \
        libonig-dev \
        gettext-base \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        bcmath \
        gd \
        zip \
        intl \
        opcache \
        pcntl \
    && rm -rf /var/lib/apt/lists/*

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/uploads.ini /usr/local/etc/php/conf.d/uploads.ini
# Keep the image's zz-docker.conf ([global] daemonize = no). Only override pool listen/env.
COPY docker/php/zzz-laravel.conf /usr/local/etc/php-fpm.d/zzz-laravel.conf

WORKDIR /var/www/html

COPY --from=vendor /app /var/www/html
COPY --from=frontend /app/public/build ./public/build

COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY routes ./routes
COPY resources/views ./resources/views
COPY public/index.php ./public/index.php
COPY public/.htaccess ./public/.htaccess
COPY public/favicon.ico ./public/favicon.ico
COPY public/favicon.svg ./public/favicon.svg
COPY public/apple-touch-icon.png ./public/apple-touch-icon.png
COPY public/robots.txt ./public/robots.txt
COPY artisan ./artisan
COPY composer.json composer.lock ./
COPY .env.example ./.env.example

COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/start-nginx.sh /usr/local/bin/start-nginx.sh

RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/start-nginx.sh \
    && rm -f /etc/nginx/sites-enabled/default \
    && mkdir -p \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        storage/app/public \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

# No .env in the image. APP_KEY and DB credentials come from Render env vars.
ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PORT=10000

EXPOSE 10000

# Shell-form CMD runs via /bin/sh -c so $PORT expands at check time.
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:$${PORT}/up" || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

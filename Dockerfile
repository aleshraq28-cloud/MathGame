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


# ===== 2) Frontend assets (Vite + Wayfinder needs PHP + vendor) ==============
FROM node:22-bookworm AS frontend

# Wayfinder runs `php artisan` during `npm run build`
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        php-cli \
        php-mbstring \
        php-xml \
        php-curl \
        php-zip \
        php-sqlite3 \
        unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=vendor /app /app
COPY package.json package-lock.json .npmrc ./
COPY resources ./resources
COPY vite.config.ts tsconfig.json components.json ./
COPY public ./public
COPY .env.example ./.env.example

# Minimal env so artisan/wayfinder can boot during the asset build only.
# This key is NOT the production APP_KEY — never bake secrets into the image.
RUN mkdir -p \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && cp .env.example .env \
    && php artisan key:generate --force --no-interaction \
    && php artisan package:discover --ansi \
    && npm ci \
    && npm run build \
    && test -f public/build/manifest.json \
    && rm -f .env public/hot


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

# PHP / php-fpm production defaults
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/uploads.ini /usr/local/etc/php/conf.d/uploads.ini
COPY docker/php/zz-docker.conf /usr/local/etc/php-fpm.d/zz-docker.conf

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

RUN chmod +x /usr/local/bin/entrypoint.sh \
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

# Shell-form CMD (not JSON) runs via /bin/sh -c so $PORT expands at check time.
# $$ becomes $ in the image; Render sets PORT (default 10000 from ENV above).
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:$${PORT}/up" || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

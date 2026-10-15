#!/usr/bin/env sh
set -eu

PORT="${PORT:-10000}"
export PORT

echo "[entrypoint] Binding HTTP on 0.0.0.0:${PORT}"

# Render (and most PaaS) terminate TLS at the load balancer.
export APP_ENV="${APP_ENV:-production}"
export APP_DEBUG="${APP_DEBUG:-false}"
export LOG_CHANNEL="${LOG_CHANNEL:-stderr}"

if [ -z "${APP_KEY:-}" ]; then
    echo "[entrypoint] ERROR: APP_KEY is not set."
    echo "Generate one locally with: php artisan key:generate --show"
    echo "Then add it as a secret environment variable in Render."
    exit 1
fi

if [ -z "${APP_URL:-}" ]; then
    echo "[entrypoint] WARNING: APP_URL is not set. Set it to your https://…onrender.com URL."
fi

# Render assigns PORT; substitute into the nginx site config.
envsubst '${PORT}' \
    < /etc/nginx/templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf

# Ensure writable runtime dirs (ephemeral disk on Render free tier).
mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    storage/app/public \
    bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R ug+rwx storage bootstrap/cache || true

# Prefer live env vars over any stale cached config from a previous boot.
php artisan config:clear --no-interaction >/dev/null 2>&1 || true

# Wait for MySQL before migrating (non-destructive: migrate only, never migrate:fresh).
if [ -n "${DB_HOST:-}" ] || [ -n "${DB_URL:-}" ]; then
    echo "[entrypoint] Waiting for database…"
    i=0
    until php artisan db:show --no-interaction >/dev/null 2>&1; do
        i=$((i + 1))
        if [ "$i" -ge 30 ]; then
            echo "[entrypoint] ERROR: database not reachable after 30 attempts."
            echo "Student names and progress require a reachable MySQL database."
            exit 1
        fi
        echo "[entrypoint] Database not ready yet (attempt ${i}/30)…"
        sleep 2
    done
    echo "[entrypoint] Database is reachable."

    if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
        echo "[entrypoint] Running php artisan migrate --force (additive only)…"
        php artisan migrate --force --no-interaction
    fi

    # Optional one-shot seed. Leave false by default so restarts never re-seed unexpectedly.
    # GameContentSeeder uses updateOrCreate and is safe, but still opt-in.
    if [ "${RUN_CONTENT_SEED:-false}" = "true" ]; then
        echo "[entrypoint] Running GameContentSeeder…"
        php artisan db:seed --class=GameContentSeeder --force --no-interaction
    fi
else
    echo "[entrypoint] WARNING: no DB_HOST/DB_URL set. App will boot but cannot save progress."
fi

# Cache config/routes/views when APP_KEY and config are present.
php artisan config:cache --no-interaction || true
php artisan route:cache --no-interaction || true
php artisan view:cache --no-interaction || true
php artisan event:cache --no-interaction || true

echo "[entrypoint] Starting supervisord (nginx + php-fpm)…"
exec "$@"

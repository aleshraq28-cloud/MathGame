#!/usr/bin/env sh
set -eu

echo "[nginx] Waiting for php-fpm on 127.0.0.1:9000…"
i=0
while ! php -r 'exit(@fsockopen("127.0.0.1", 9000) ? 0 : 1);' 2>/dev/null; do
    i=$((i + 1))
    if [ "$i" -ge 60 ]; then
        echo "[nginx] ERROR: php-fpm is not accepting connections on 127.0.0.1:9000"
        php-fpm -t || true
        exit 1
    fi
    sleep 0.5
done

echo "[nginx] php-fpm is ready — starting nginx"
exec /usr/sbin/nginx -g "daemon off;"

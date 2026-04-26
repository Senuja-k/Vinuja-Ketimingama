#!/bin/sh
set -e

# Wait for database to be ready (optional but recommended)
# sleep 10

# Run migrations
php artisan migrate --force

# Start PHP-FPM
exec "$@"

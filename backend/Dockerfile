FROM php:8.3-cli

# 必要拡張
RUN apt-get update && apt-get install -y \
    git unzip libpng-dev libonig-dev libzip-dev default-mysql-client \
 && docker-php-ext-install pdo_mysql zip

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

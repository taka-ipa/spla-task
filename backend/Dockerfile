FROM php:8.2-cli
# PHPの公式イメージをベースにする

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    zip \
    && docker-php-ext-install zip pdo_mysql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer 
#composer（PHPのパッケージ管理ツール）をインストール

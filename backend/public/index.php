<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// 環境変数を読み込む（本番はNG）
// if (getenv('APP_KEY') && empty($_ENV['APP_KEY'])) {
//     $_ENV['APP_KEY'] = $_SERVER['APP_KEY'] = getenv('APP_KEY');
// }

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());

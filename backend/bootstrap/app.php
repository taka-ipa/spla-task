<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php', //通常のWebルート（ブラウザで表示する画面用）
        api: __DIR__.'/../routes/api.php', //API用ルート（Reactなどから叩くJSON形式のデータ用）
        commands: __DIR__.'/../routes/console.php', //Artisanコマンド定義用ルート（routes/console.phpで定義）
        health: '/up', //ヘルスチェック用のエンドポイント（例： /up にアクセス → 200返す）
    )

    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();


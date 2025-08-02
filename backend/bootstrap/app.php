<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php', // 通常のWebルート
        api: __DIR__.'/../routes/api.php', // APIルート
        commands: __DIR__.'/../routes/console.php', // Artisanコマンド定義
        health: '/up', // ヘルスチェック
    )

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);

        // HandleCorsをCORS対応のためにプリペンド
        $middleware->prepend(HandleCors::class);

        // aliasは必要ないので削除してOK（使ってなければ）
    })

    ->withExceptions(function (Exceptions $exceptions) {
        //
    })

    ->create();



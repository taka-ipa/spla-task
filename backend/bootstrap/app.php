<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Routing\Middleware\SubstituteBindings;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php', // 通常のWebルート
        api: __DIR__.'/../routes/api.php', // APIルート
        commands: __DIR__.'/../routes/console.php', // Artisanコマンド定義
        health: '/up', // ヘルスチェック
    )

    ->withMiddleware(function (Middleware $middleware) {
    // SPA用の状態保持ミドルウェアは不要（Bearerトークン運用のため削除）
    // $middleware->api(prepend: [
    //     \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    // ]);

    $middleware->alias([
        'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        'firebase' => \App\Http\Middleware\FirebaseAuthMiddleware::class,
    ]);

    // CORS対応
    $middleware->prepend(HandleCors::class);
    })

    ->withExceptions(function (Exceptions $exceptions) {
        //
    })

    ->create();



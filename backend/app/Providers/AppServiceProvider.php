<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\URL;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Http\JsonResponse;

use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Routing\Router;

class AppServiceProvider extends ServiceProvider
{
    public function boot(Router $router): void
    {
        $router->aliasMiddleware('cors', HandleCors::class);

        // 明示的にcredentialsを許可するために、ヘッダーを追加してみる（最終手段）
        \Illuminate\Support\Facades\Response::macro('withCors', function ($response) {
            return $response->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                            ->header('Access-Control-Allow-Credentials', 'true');
        });
    }
}

<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Session\Middleware\StartSession;
use App\Http\Controllers\Auth\FirebaseLoginController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

Route::get('/env-check', function () {
    return response()->json([
        'app_key' => env('APP_KEY'),
        'app_env' => env('APP_ENV'),
    ]);
});
Route::get('/api-user-check', function () {
    return response()->json(['ok' => true]);
});

Route::get('/', fn () => response('OK', 200))
    ->withoutMiddleware([EncryptCookies::class, AddQueuedCookiesToResponse::class, StartSession::class]);

require __DIR__.'/auth.php';

Route::prefix('api')->middleware(['web', 'firebase'])->group(function () {
    Route::post('/auth/firebase-login', [FirebaseLoginController::class, 'login'])
        ->withoutMiddleware([VerifyCsrfToken::class]);
});
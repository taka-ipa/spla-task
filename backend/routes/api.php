<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\TaskController;

Route::post('/register', [RegisteredUserController::class, 'store'])->name('register');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('tasks', TaskController::class);
});

Route::get('/env-check', function () {
    return response()->json([
        'app_key' => env('APP_KEY'),
        'app_env' => env('APP_ENV'),
    ]);
});
Route::get('/debug-key', fn () => response()->json([
    'config_has' => (bool) config('app.key'),
    'config_key' => config('app.key'),
]));

// デバッグ用のpingエンドポイント
if (app()->environment('local')) {
    Route::get('/ping', fn() => 'pong');
}
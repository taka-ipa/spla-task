<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskResultController;
use App\Http\Controllers\TaskResultSummaryController;
use App\Http\Controllers\FirebaseLoginController;
use App\Http\Middleware\FirebaseAuthMiddleware;

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

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/task-results', [TaskResultController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/task-results', [TaskResultController::class, 'index']); // ← 追加
    Route::post('/task-results', [TaskResultController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/task-results/summary', [TaskResultSummaryController::class, 'index']);
});

// 一部だけ試すパターン
Route::middleware('firebase')->group(function () {
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/task-results', [TaskResultController::class, 'index']);
    Route::post('/task-results', [TaskResultController::class, 'store']);
    Route::get('/task-results/summary', [TaskResultSummaryController::class, 'index']);
});

// 全APIに常時かけたければ、bootstrap/app.phpで group('api', ...) を使えば個々に書かなくてOK

Route::middleware([FirebaseAuthMiddleware::class])->get('/user', function (Request $request) {
    return $request->user();
});
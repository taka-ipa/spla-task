<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

// ✅ API では CSRF 使わないので guest(web)は付けない
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->name('register');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->name('login');

// ✅ ここはトークン必須
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::get('/user', function (\Illuminate\Http\Request $request) {
        return $request->user();
    });
});

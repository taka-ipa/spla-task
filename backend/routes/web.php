<?php

use Illuminate\Support\Facades\Route;

Route::get('/env-check', function () {
    return response()->json([
        'app_key' => env('APP_KEY'),
        'app_env' => env('APP_ENV'),
    ]);
});
Route::get('/api-user-check', function () {
    return response()->json(['ok' => true]);
});

require __DIR__.'/auth.php';

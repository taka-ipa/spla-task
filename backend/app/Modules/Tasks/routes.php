<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Tasks\Controllers\TaskController;

// モジュール構成でもコントローラーは use すればOK！
Route::get('/tasks', [TaskController::class, 'index']);

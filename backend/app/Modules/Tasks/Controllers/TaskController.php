<?php

namespace App\Modules\Tasks\Controllers;

use Illuminate\Routing\Controller;

class TaskController extends Controller
{
    public function index()
    {
        return response()->json([
            ['id' => 1, 'title' => '初弾精度', 'icon' => '🎯'],
            ['id' => 2, 'title' => 'ライン管理', 'icon' => '📏'],
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        return response()->json([
            ['id' => 1, 'title' => 'エイム練習', 'status' => '○'],
            ['id' => 2, 'title' => '立ち回り反省', 'status' => '△'],
            ['id' => 3, 'title' => '打開反省', 'status' => '×'],
            ['id' => 4, 'title' => 'イカランプ確認', 'status' => '△']
        ]);
    }
}

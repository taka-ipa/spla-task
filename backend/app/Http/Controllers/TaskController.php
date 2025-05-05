<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TaskController extends Controller
{
  public function home()
  {
    return view('home');
  }

  public function index()
    {
        $tasks = [
            [
                'week' => 'Week1',
                'item_name' => '初弾精度',
                'result' => '○'
            ],
            [
                'week' => 'Week1',
                'item_name' => '距離感',
                'result' => '△'
            ]
        ];

        return response()->json($tasks);
    }
}

?>
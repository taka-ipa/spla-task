<?php

namespace App\Http\Controllers;

use App\Models\TaskResult;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskResultController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'task_id' => ['required', 'exists:tasks,id'],
            'date'    => ['required', 'date_format:Y-m-d'],
            'rating'  => ['required', Rule::in(['maru','sankaku','batsu'])],
        ]);

        // 同じ (user_id, task_id, date) は更新、無ければ作成（重複ユニーク対策）
        $result = TaskResult::updateOrCreate(
            [
                'user_id' => $user->id,
                'task_id' => $data['task_id'],
                'date'    => $data['date'],
            ],
            [
                'rating'  => $data['rating'],
            ]
        );

        return response()->json($result->fresh()->loadMissing(['task']), 201);
    }
}

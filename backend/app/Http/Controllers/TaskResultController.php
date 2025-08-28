<?php

namespace App\Http\Controllers;

use App\Models\TaskResult;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

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

    public function index(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);
        $date = $request->query('date');

        // 有効な自分のタスク一覧に、当日の評価を左外部結合で付与
        $rows = DB::table('tasks')
            ->leftJoin('task_results', function ($join) use ($user, $date) {
                $join->on('task_results.task_id', '=', 'tasks.id')
                    ->where('task_results.user_id', $user->id)
                    ->where('task_results.date', $date);
            })
            ->where('tasks.user_id', $user->id)
            ->whereNull('tasks.deleted_at')
            ->where('tasks.is_active', true)
            ->orderBy('tasks.id')
            ->get([
                'tasks.id as task_id',
                'tasks.title',
                'tasks.icon',
                'task_results.id as result_id',
                'task_results.rating',
            ]);

        return response()->json($rows);
    }
}

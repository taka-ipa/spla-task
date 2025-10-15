<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Requests\TaskStoreRequest;
use App\Http\Requests\TaskUpdateRequest;
use App\Http\Resources\TaskResource;

class TaskController extends Controller
{
    public function __construct()
    {
        // これで show/update/destroy にポリシーが自動適用される
        $this->authorizeResource(Task::class, 'task');
    }

    /**
     * GET /api/tasks
     */
    public function index(Request $request)
    {
        // ログインユーザーのタスクのみ
        $query = $request->user()
            ->tasks()
            ->orderByDesc('id');

        // 任意: is_active フィルタ
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // ページネーション対応（15件/ページ）
        $tasks = $query->paginate(15);

        // Resource で返すと data/meta/links が揃う
        return TaskResource::collection($tasks);
    }

    /**
     * POST /api/tasks
     */
    public function store(TaskStoreRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $task = Task::create($data);

        return TaskResource::make($task)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/tasks/{task}
     */
    public function show(Task $task)
    {
        // authorizeResource により所有チェック済
        return TaskResource::make($task);
    }

    /**
     * PUT /api/tasks/{task}
     */
    public function update(TaskUpdateRequest $request, Task $task)
    {
        $task->update($request->validated());

        return TaskResource::make($task->refresh());
    }

    /**
     * DELETE /api/tasks/{task}
     */
    public function destroy(Task $task)
    {
        $task->delete();

        return response()->noContent();
    }
}

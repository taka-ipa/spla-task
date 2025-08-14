<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesResources;

class TaskController extends Controller
{
    public function __construct()
    {
        // これで show/update/destroy にポリシーが自動適用される
        $this->authorizeResource(Task::class, 'task');
    }

    // GET /api/tasks
    public function index(Request $request)
    {
        $query = $request->user()->tasks()->latest();

        // 任意: is_activeフィルタ ?is_active=1/0
        if ($request->has('is_active')) {
            $query->where('is_active', (bool)$request->boolean('is_active'));
        }

        return $query->paginate(20); // or ->get()
    }

    // POST /api/tasks
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'     => ['required','string','max:100'],
            'icon'      => ['nullable','string','max:16'],
            'notes'     => ['nullable','string'],
            'is_active' => ['sometimes','boolean'],
        ]);

        $task = $request->user()->tasks()->create($validated);

        return response()->json($task, 201);
    }

    // GET /api/tasks/{task}
    public function show(Task $task)
    {
        return $task;
    }

    // PUT/PATCH /api/tasks/{task}
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title'     => ['sometimes','required','string','max:100'],
            'icon'      => ['nullable','string','max:16'],
            'notes'     => ['nullable','string'],
            'is_active' => ['sometimes','boolean'],
        ]);

        $task->update($validated);
        return $task->refresh();
    }

    // DELETE /api/tasks/{task}
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }
}

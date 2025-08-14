<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(\App\Models\User $user): bool
    {
        return true; // 自分の一覧を返すので許可
    }

    public function create(\App\Models\User $user): bool
    {
        return true; // 認証済なら作成OK
    }
    // 一覧は index で user()->tasks() だけ返してるので特に不要
    public function view(User $user, Task $task): bool     { return $task->user_id === $user->id; }
    public function update(User $user, Task $task): bool   { return $task->user_id === $user->id; }
    public function delete(User $user, Task $task): bool   { return $task->user_id === $user->id; }
    public function restore(User $user, Task $task): bool  { return $task->user_id === $user->id; }
    public function forceDelete(User $user, Task $task): bool { return false; }
}

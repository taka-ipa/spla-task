<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'date',
        'rating',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    // ユーザーとのリレーション
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // タスクとのリレーション
    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}

<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        $icons = ['🦑','🎯','🔥','✅','📈', null];

        return [
            'user_id'   => User::factory(),
            'title'     => fake()->words(3, true), // 例: "初弾精度 チェック"
            'icon'      => fake()->randomElement($icons),
            'notes'     => fake()->optional()->sentence(8),
            'is_active' => true,
        ];
    }
}

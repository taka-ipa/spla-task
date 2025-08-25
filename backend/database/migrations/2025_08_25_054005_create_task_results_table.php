<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->date('date'); // 評価日
            $table->enum('rating', ['maru', 'sankaku', 'batsu']); // ○△×を英字で保存
            $table->timestamps();

            // 同じユーザーが同じ課題を同じ日に二重登録できないようにする
            $table->unique(['user_id', 'task_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_results');
    }
};


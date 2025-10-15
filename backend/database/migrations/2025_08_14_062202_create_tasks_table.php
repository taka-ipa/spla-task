<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            // 認証ユーザー紐づけ
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // 本体
            $table->string('title', 100);
            $table->string('icon', 16)->nullable();      // 絵文字🦑など
            $table->text('notes')->nullable();           // 補足メモ
            $table->boolean('is_active')->default(true); // 一覧の表示制御などに使える

            $table->timestamps();
            $table->softDeletes();

            // よく使うカラムのインデックス
            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};

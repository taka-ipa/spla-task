<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskPolicyTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function 他人のタスクshowは403になる()
    {
        $me = User::factory()->create();
        $other = User::factory()->create();

        $othersTask = Task::factory()->for($other)->create();

        $this->actingAs($me)
            ->getJson("/api/tasks/{$othersTask->id}")
            ->assertStatus(403);
    }

    /** @test */
    public function 自分のタスクshowは200で返る()
    {
        $me = User::factory()->create();
        $myTask = Task::factory()->for($me)->create();

        $this->actingAs($me)
            ->getJson("/api/tasks/{$myTask->id}")
            ->assertOk()
            ->assertJsonFragment(['id' => $myTask->id]);
    }

    /** @test */
    public function indexは自分のタスクだけ返す()
    {
        $me = User::factory()->create();
        $other = User::factory()->create();

        $myTasks = Task::factory()->count(2)->for($me)->create();
        Task::factory()->count(2)->for($other)->create();

        $res = $this->actingAs($me)
            ->getJson('/api/tasks')
            ->assertOk()
            ->json();

        $myIds = $myTasks->pluck('id')->all();
        $returnedIds = collect($res)->pluck('id')->all();

        // 返ってきたのは全部自分のID
        $this->assertEqualsCanonicalizing($myIds, $returnedIds);
    }

    /** @test */
    public function 他人のタスクupdateは403()
    {
        $me = User::factory()->create();
        $other = User::factory()->create();
        $othersTask = Task::factory()->for($other)->create(['title' => 'old']);

        $this->actingAs($me)
            ->putJson("/api/tasks/{$othersTask->id}", ['title' => 'new'])
            ->assertStatus(403);
    }

    /** @test */
    public function 自分のタスクupdateは200()
    {
        $me = User::factory()->create();
        $myTask = Task::factory()->for($me)->create(['title' => 'old']);

        $this->actingAs($me)
            ->putJson("/api/tasks/{$myTask->id}", ['title' => 'new'])
            ->assertOk()
            ->assertJsonFragment(['title' => 'new']);
    }
}

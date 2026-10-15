<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\StudentAchievement;
use App\Models\StudentStageProgress;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\PlaysGame;
use Tests\TestCase;

class StageCompletionTest extends TestCase
{
    use PlaysGame;

    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = Student::factory()->create();
        $this->playAs($this->student);
    }

    private function progress(int $stageNumber): ?StudentStageProgress
    {
        return StudentStageProgress::query()
            ->where('student_id', $this->student->id)
            ->where('game_stage_id', $this->stage($stageNumber)->id)
            ->first();
    }

    public function test_a_stage_cannot_be_completed_while_questions_are_unanswered(): void
    {
        $attempt = $this->startAttempt($this->stage(1));

        $this->post(route('game.attempts.complete', $attempt))->assertSessionHasErrors('attempt');

        $this->assertNull($attempt->refresh()->completed_at);
        $this->get(route('game.attempts.results', $attempt))->assertRedirect(route('game.attempts.play', $attempt));
    }

    public function test_a_perfect_run_passes_with_three_stars_and_unlocks_the_next_stage(): void
    {
        $attempt = $this->completeStage($this->stage(1));
        $total = $attempt->total_questions;

        $this->assertTrue($attempt->passed);
        $this->assertTrue($attempt->is_perfect);
        $this->assertSame(3, $attempt->stars_earned);
        $this->assertSame($total * 10 + 20, $attempt->score);

        $this->assertSame(StudentStageProgress::STATUS_COMPLETED, $this->progress(1)->status);
        $this->assertSame($attempt->score, $this->progress(1)->best_score);

        $this->get(route('game.attempts.results', $attempt))
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/results')
                ->where('result.passed', true)
                ->where('result.stars', 3)
                ->where('flags.newly_completed', true)
                ->where('next_stage.slug', $this->stage(2)->slug)
                ->has('new_achievements'));

        $this->get(route('game.map'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('stages.0.status', 'completed')
                ->where('stages.0.stars', 3)
                ->where('stages.1.status', 'current')
                ->where('stages.2.status', 'locked')
                ->where('summary.completed_stages', 1)
                ->where('summary.stars', 3));

        $this->get(route('game.stages.show', $this->stage(2)))->assertOk();
    }

    public function test_failing_a_stage_keeps_the_next_stage_locked(): void
    {
        $stage = $this->stage(1);
        $attempt = $this->completeStage($stage, wrongCount: $stage->questions_per_attempt);

        $this->assertFalse($attempt->passed);
        $this->assertSame(0, $attempt->stars_earned);
        $this->assertSame(StudentStageProgress::STATUS_IN_PROGRESS, $this->progress(1)->status);
        $this->assertSame(1, $this->progress(1)->attempts_count);

        $this->get(route('game.attempts.results', $attempt))
            ->assertInertia(fn (Assert $page) => $page->component('game/results')->where('result.passed', false)->where('next_stage', null));

        $this->post(route('game.stages.start', $this->stage(2)))->assertForbidden();
    }

    public function test_completing_twice_is_idempotent(): void
    {
        $attempt = $this->completeStage($this->stage(1));
        $score = $attempt->score;

        $this->post(route('game.attempts.complete', $attempt))->assertRedirect(route('game.attempts.results', $attempt));

        $this->assertSame($score, $attempt->refresh()->score);
        $this->assertSame(1, $this->progress(1)->attempts_count);
        $this->assertSame(1, StudentAchievement::query()->where('achievement_key', 'first_stage')->count());
    }

    public function test_replaying_keeps_the_best_score_and_does_not_inflate_stars(): void
    {
        $best = $this->completeStage($this->stage(1));
        $worse = $this->completeStage($this->stage(1), wrongCount: 2);

        $this->assertNotSame($best->id, $worse->id);
        $this->assertTrue($worse->passed);
        $this->assertLessThan($best->score, $worse->score);

        $progress = $this->progress(1);
        $this->assertSame($best->score, $progress->best_score);
        $this->assertSame(3, $progress->stars_earned);
        $this->assertSame(2, $progress->attempts_count);

        $this->get(route('game.progress'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/progress')
                ->where('summary.stars', 3)
                ->where('summary.best_score_total', $best->score)
                ->where('summary.practice_points', $best->score + $worse->score));
    }

    public function test_first_stage_and_persistence_achievements_are_awarded_once(): void
    {
        $this->completeStage($this->stage(1), wrongCount: $this->stage(1)->questions_per_attempt);
        $this->assertSame(0, StudentAchievement::query()->count());

        $this->completeStage($this->stage(1));

        $keys = StudentAchievement::query()->where('student_id', $this->student->id)->pluck('achievement_key')->all();
        $this->assertContains('first_stage', $keys);
        $this->assertContains('persistent', $keys);

        $this->get(route('game.achievements'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/achievements')
                ->where('achievements.0.key', 'first_stage')
                ->where('achievements.0.earned', true));
    }

    public function test_the_treasure_stays_locked_until_every_stage_is_complete(): void
    {
        $this->markAllRegularStagesCompleted($this->student);
        StudentStageProgress::query()
            ->where('student_id', $this->student->id)
            ->where('game_stage_id', $this->stage(18)->id)
            ->delete();

        $this->post(route('game.stages.start', $this->finalStage()))->assertForbidden();
        $this->get(route('game.map'))->assertInertia(fn (Assert $page) => $page->where('stages.18.status', 'locked'));
    }

    public function test_opening_the_treasure_shows_the_victory_screen(): void
    {
        $this->markAllRegularStagesCompleted($this->student);

        $this->get(route('game.map'))->assertInertia(fn (Assert $page) => $page->where('stages.18.status', 'current'));

        $attempt = $this->completeStage($this->finalStage());

        $this->get(route('game.attempts.results', $attempt))
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/victory')
                ->where('result.passed', true)
                ->where('summary.treasure_found', true)
                ->has('achievements'));

        $this->assertDatabaseHas('student_achievements', ['student_id' => $this->student->id, 'achievement_key' => 'treasure_hunter']);
    }
}

<?php

namespace Tests\Feature;

use App\Models\GameAttempt;
use App\Models\Student;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\PlaysGame;
use Tests\TestCase;

class GameAccessTest extends TestCase
{
    use PlaysGame;

    public function test_guests_are_sent_to_the_name_page(): void
    {
        foreach ([route('game.map'), route('game.progress'), route('game.achievements'), route('game.stages.show', $this->stage(1))] as $url) {
            $this->get($url)->assertRedirect(route('welcome'));
        }
    }

    public function test_guest_json_requests_get_a_session_expired_error(): void
    {
        $student = Student::factory()->create();
        $this->playAs($student);
        $attempt = $this->startAttempt($this->stage(1));
        $this->post(route('students.switch'));

        $this->postJson(route('game.attempts.answer', $attempt), ['question_id' => 1, 'answer' => ['value' => '1']])
            ->assertUnauthorized()
            ->assertJsonPath('session_expired', true);
    }

    public function test_a_session_pointing_to_a_deleted_student_is_cleared(): void
    {
        $student = Student::factory()->create();
        $this->playAs($student);
        $student->delete();

        $this->get(route('game.map'))->assertRedirect(route('welcome'));
    }

    public function test_map_shows_all_stages_with_only_the_first_unlocked(): void
    {
        $this->playAs(Student::factory()->create());

        $this->get(route('game.map'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/map')
                ->has('stages', 19)
                ->where('stages.0.status', 'current')
                ->where('stages.1.status', 'locked')
                ->where('stages.18.status', 'locked')
                ->where('stages.18.is_final', true)
                ->where('summary.completed_stages', 0)
                ->where('summary.stars', 0));
    }

    public function test_locked_stages_cannot_be_opened_or_started(): void
    {
        $this->playAs(Student::factory()->create());

        $this->get(route('game.stages.show', $this->stage(2)))->assertRedirect(route('game.map'));
        $this->post(route('game.stages.start', $this->stage(2)))->assertForbidden();
        $this->post(route('game.stages.start', $this->finalStage()))->assertForbidden();

        $this->assertSame(0, GameAttempt::query()->count());
    }

    public function test_a_student_id_sent_by_the_browser_is_ignored(): void
    {
        $me = Student::factory()->create();
        $other = Student::factory()->create();
        $this->playAs($me);

        $this->post(route('game.stages.start', $this->stage(1)), ['student_id' => $other->id])->assertRedirect();

        $this->assertSame($me->id, GameAttempt::query()->sole()->student_id);
    }

    public function test_students_cannot_touch_another_students_attempt(): void
    {
        $owner = Student::factory()->create();
        $this->playAs($owner);
        $attempt = $this->startAttempt($this->stage(1));
        $question = $this->attemptQuestions($attempt)[0];

        $this->playAs(Student::factory()->create());

        $this->get(route('game.attempts.play', $attempt))->assertNotFound();
        $this->answer($attempt, $question, $this->correctPayload($question))->assertNotFound();
        $this->postJson(route('game.attempts.hint', [$attempt, $question->id]))->assertNotFound();
        $this->post(route('game.attempts.complete', $attempt))->assertNotFound();
        $this->get(route('game.attempts.results', $attempt))->assertNotFound();

        $this->assertSame(0, $attempt->refresh()->score);
        $this->assertSame(0, $attempt->questionAttempts()->count());
    }
}

<?php

namespace Tests\Feature;

use App\Game\QuestionType;
use App\Models\GameAttempt;
use App\Models\Question;
use App\Models\Student;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\PlaysGame;
use Tests\TestCase;

class AnswerFlowTest extends TestCase
{
    use PlaysGame;

    private GameAttempt $attempt;

    protected function setUp(): void
    {
        parent::setUp();

        $this->playAs(Student::factory()->create());
        $this->attempt = $this->startAttempt($this->stage(1));
    }

    private function questionOfType(string ...$types): Question
    {
        foreach ($this->attemptQuestions($this->attempt) as $question) {
            if (in_array($question->question_type, $types, true)) {
                return $question;
            }
        }

        $this->fail('No question of type '.implode('/', $types).' in this attempt.');
    }

    public function test_starting_a_stage_builds_an_attempt_and_resuming_reuses_it(): void
    {
        $stage = $this->stage(1);

        $this->assertSame($stage->questions_per_attempt, $this->attempt->total_questions);
        $this->assertSame($stage->questions_per_attempt, $this->attempt->attemptQuestions()->count());

        $again = $this->startAttempt($stage);
        $this->assertSame($this->attempt->id, $again->id);
        $this->assertSame(1, GameAttempt::query()->count());
    }

    public function test_the_play_page_never_contains_answers_hints_or_explanations(): void
    {
        $response = $this->get(route('game.attempts.play', $this->attempt))->assertOk();

        $response->assertInertia(fn (Assert $page) => $page
            ->component('game/activity')
            ->has('questions', $this->attempt->total_questions)
            ->has('questions.0.question', fn (Assert $q) => $q->hasAll(['id', 'type', 'text', 'data', 'difficulty', 'objective', 'points', 'has_hint']))
            ->where('questions.0.state.hint', null)
            ->where('questions.0.state.explanation', null)
            ->where('questions.0.state.reveal', null));

        $json = json_encode($response->viewData('page')['props']['questions'], JSON_UNESCAPED_UNICODE);
        foreach (['correct_answer', '"answer"', 'validation_values', 'left_value', '"moves"'] as $secret) {
            $this->assertStringNotContainsString($secret, $json);
        }

        foreach ($this->attemptQuestions($this->attempt) as $question) {
            $this->assertStringNotContainsString($question->explanation, $json);
            $this->assertStringNotContainsString($question->hint, $json);
        }
    }

    public function test_a_correct_first_try_earns_full_points(): void
    {
        $question = $this->attemptQuestions($this->attempt)[0];

        $this->answer($this->attempt, $question, $this->correctPayload($question))
            ->assertOk()
            ->assertJson(['correct' => true, 'points' => 10, 'resolved' => true, 'tries' => 1])
            ->assertJsonPath('attempt.score', 10)
            ->assertJsonPath('attempt.answered', 1);

        $this->assertSame(10, $this->attempt->refresh()->score);
        $this->assertDatabaseHas('question_attempts', ['game_attempt_id' => $this->attempt->id, 'question_id' => $question->id, 'is_correct' => true, 'attempt_number' => 1]);
    }

    public function test_wrong_answers_give_a_hint_then_reveal_the_answer_after_three_tries(): void
    {
        $question = $this->attemptQuestions($this->attempt)[0];

        $this->answer($this->attempt, $question, $this->wrongPayload($question))
            ->assertOk()
            ->assertJson(['correct' => false, 'points' => 0, 'resolved' => false, 'tries_left' => 2, 'hint' => $question->hint, 'explanation' => null, 'reveal' => null]);

        $this->answer($this->attempt, $question, $this->wrongPayload($question))->assertJson(['tries_left' => 1, 'resolved' => false]);

        $this->answer($this->attempt, $question, $this->wrongPayload($question))
            ->assertOk()
            ->assertJson(['correct' => false, 'resolved' => true, 'tries_left' => 0, 'explanation' => $question->explanation, 'reveal' => $question->correct_answer['display']]);

        $this->attempt->refresh();
        $this->assertSame(0, $this->attempt->score);
        $this->assertSame(3, $this->attempt->incorrect_answers);
    }

    public function test_a_correct_second_try_earns_reduced_points(): void
    {
        $question = $this->attemptQuestions($this->attempt)[0];

        $this->answer($this->attempt, $question, $this->wrongPayload($question));
        $this->answer($this->attempt, $question, $this->correctPayload($question))->assertJson(['correct' => true, 'points' => 5]);
    }

    public function test_using_a_hint_reduces_first_try_points(): void
    {
        $question = $this->attemptQuestions($this->attempt)[0];

        $this->postJson(route('game.attempts.hint', [$this->attempt, $question->id]))
            ->assertOk()
            ->assertJson(['hint' => $question->hint]);

        $this->answer($this->attempt, $question, $this->correctPayload($question))->assertJson(['correct' => true, 'points' => 7]);
        $this->assertSame(1, $this->attempt->refresh()->hints_used);
    }

    public function test_resubmitting_a_finished_question_does_not_add_points(): void
    {
        $question = $this->attemptQuestions($this->attempt)[0];

        $this->answer($this->attempt, $question, $this->correctPayload($question))->assertJson(['points' => 10]);
        $this->answer($this->attempt, $question, $this->correctPayload($question))->assertJson(['duplicate' => true, 'points' => 0]);

        $this->assertSame(10, $this->attempt->refresh()->score);
        $this->assertSame(1, $this->attempt->questionAttempts()->count());
    }

    public function test_scores_or_correctness_sent_by_the_browser_are_ignored(): void
    {
        $question = $this->attemptQuestions($this->attempt)[0];

        $this->answer($this->attempt, $question, $this->wrongPayload($question), ['correct' => true, 'points' => 1000, 'score' => 999])
            ->assertOk()
            ->assertJson(['correct' => false, 'points' => 0]);

        $this->assertSame(0, $this->attempt->refresh()->score);
    }

    public function test_malformed_answers_are_rejected_without_using_a_try(): void
    {
        $question = $this->questionOfType(QuestionType::NUMBER, QuestionType::CHOICE, QuestionType::MISSING);

        $this->answer($this->attempt, $question, ['value' => 'abc', 'option' => 'zzz', 'values' => []])->assertUnprocessable();
        $this->postJson(route('game.attempts.answer', $this->attempt), ['question_id' => $question->id])->assertUnprocessable();

        $this->assertSame(0, $this->attempt->attemptQuestions()->where('question_id', $question->id)->value('tries'));
    }

    public function test_questions_from_another_stage_cannot_be_answered(): void
    {
        $foreign = $this->stage(2)->questions()->firstOrFail();

        $this->answer($this->attempt, $foreign, $this->correctPayload($foreign))->assertUnprocessable();
        $this->assertSame(0, $this->attempt->refresh()->score);
    }

    public function test_arabic_indic_digits_are_accepted(): void
    {
        $question = $this->questionOfType(QuestionType::NUMBER);
        $arabic = strtr((string) $question->correct_answer['value'], ['0' => '٠', '1' => '١', '2' => '٢', '3' => '٣', '4' => '٤', '5' => '٥', '6' => '٦', '7' => '٧', '8' => '٨', '9' => '٩']);

        $this->answer($this->attempt, $question, ['value' => $arabic])->assertOk()->assertJson(['correct' => true]);
    }
}

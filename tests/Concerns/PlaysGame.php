<?php

namespace Tests\Concerns;

use App\Game\AnswerChecker;
use App\Game\QuestionType;
use App\Http\Middleware\EnsureStudentSession;
use App\Models\GameAttempt;
use App\Models\GameStage;
use App\Models\Question;
use App\Models\Student;
use App\Models\StudentStageProgress;
use Database\Seeders\GameContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;

trait PlaysGame
{
    use RefreshDatabase;

    protected bool $seed = true;

    protected string $seeder = GameContentSeeder::class;

    protected function playAs(Student $student): static
    {
        return $this->withSession([EnsureStudentSession::SESSION_KEY => $student->id]);
    }

    protected function stage(int $number): GameStage
    {
        return GameStage::query()->where('stage_number', $number)->firstOrFail();
    }

    protected function finalStage(): GameStage
    {
        return GameStage::query()->where('is_final', true)->firstOrFail();
    }

    protected function startAttempt(GameStage $stage): GameAttempt
    {
        $this->post(route('game.stages.start', $stage))->assertRedirect();

        return GameAttempt::query()->where('game_stage_id', $stage->id)->latest('id')->firstOrFail();
    }

    /** @return list<Question> */
    protected function attemptQuestions(GameAttempt $attempt): array
    {
        return $attempt->attemptQuestions()->with('question')->get()->pluck('question')->all();
    }

    /** @param  array<string, mixed>  $payload */
    protected function answer(GameAttempt $attempt, Question $question, array $payload, array $extra = []): TestResponse
    {
        return $this->postJson(route('game.attempts.answer', $attempt), ['question_id' => $question->id, 'answer' => $payload] + $extra);
    }

    /**
     * Answers every question: correctly, or wrongly three times.
     *
     * @param  int  $wrongCount  number of questions (from the start) to get wrong
     */
    protected function playThrough(GameAttempt $attempt, int $wrongCount = 0): void
    {
        foreach ($this->attemptQuestions($attempt) as $i => $question) {
            if ($i < $wrongCount) {
                foreach (range(1, 3) as $_) {
                    $this->answer($attempt, $question, $this->wrongPayload($question))->assertOk()->assertJsonPath('correct', false);
                }
            } else {
                $this->answer($attempt, $question, $this->correctPayload($question))->assertOk()->assertJsonPath('correct', true);
            }
        }
    }

    protected function completeStage(GameStage $stage, int $wrongCount = 0): GameAttempt
    {
        $attempt = $this->startAttempt($stage);
        $this->playThrough($attempt, $wrongCount);
        $this->post(route('game.attempts.complete', $attempt))->assertRedirect(route('game.attempts.results', $attempt));

        return $attempt->refresh();
    }

    /** Marks every non-final stage as completed directly in the database. */
    protected function markAllRegularStagesCompleted(Student $student): void
    {
        GameStage::query()->where('is_final', false)->get()->each(fn (GameStage $stage) => StudentStageProgress::query()->create([
            'student_id' => $student->id,
            'game_stage_id' => $stage->id,
            'status' => StudentStageProgress::STATUS_COMPLETED,
            'best_score' => 100,
            'stars_earned' => 3,
            'attempts_count' => 1,
            'completed_at' => now(),
        ]));
    }

    /** @return array<string, mixed> */
    protected function correctPayload(Question $question): array
    {
        $answer = $question->correct_answer;
        $data = $question->question_data;

        return match ($question->question_type) {
            QuestionType::CHOICE => ['option' => $answer['option']],
            QuestionType::NUMBER => ['value' => (string) $answer['value']],
            QuestionType::MISSING => ['values' => array_map('strval', $answer['values'])],
            QuestionType::MATCH => ['pairs' => $answer['pairs']],
            QuestionType::ORDER => ['order' => $answer['order']],
            QuestionType::PLACE_VALUE => ['hundreds' => intdiv($answer['value'], 100), 'tens' => intdiv($answer['value'] % 100, 10), 'ones' => $answer['value'] % 10],
            QuestionType::CLOCK_SET => ['hour' => $answer['hour'], 'minute' => $answer['minute']],
            QuestionType::SYMMETRY => ['cells' => $answer['cells']],
            QuestionType::ROUTE_BUILD => ['moves' => $this->shortestRoute($data)],
            QuestionType::ROUTE_FOLLOW => ['cell' => $answer['cell']],
            QuestionType::MONEY => ['coins' => $this->makeChange($answer['total'], $data['denominations'])],
            QuestionType::COMPARE => ['symbol' => $answer['symbol']],
        };
    }

    /** @return array<string, mixed> */
    protected function wrongPayload(Question $question): array
    {
        $answer = $question->correct_answer;
        $data = $question->question_data;

        switch ($question->question_type) {
            case QuestionType::CHOICE:
                $other = collect($data['options'])->firstWhere(fn ($o) => $o['id'] !== $answer['option']);

                return ['option' => $other['id']];
            case QuestionType::NUMBER:
                return ['value' => (string) ($answer['value'] + 1)];
            case QuestionType::MISSING:
                $values = array_map('strval', $answer['values']);
                $values[0] = (string) ($answer['values'][0] + 1);

                return ['values' => $values];
            case QuestionType::MATCH:
                $rightIds = array_column($data['right'], 'id');
                $pairs = [];
                foreach ($answer['pairs'] as $left => $right) {
                    $pairs[$left] = collect($rightIds)->first(fn ($id) => $id !== $right);
                }

                return ['pairs' => $pairs];
            case QuestionType::ORDER:
                return ['order' => array_reverse($answer['order'])];
            case QuestionType::PLACE_VALUE:
                return ['hundreds' => 0, 'tens' => 0, 'ones' => $answer['value'] === 0 ? 1 : 0];
            case QuestionType::CLOCK_SET:
                return ['hour' => $answer['hour'] % 12 + 1, 'minute' => $answer['minute']];
            case QuestionType::SYMMETRY:
                return ['cells' => $data['given']];
            case QuestionType::ROUTE_BUILD:
                foreach (['N', 'S', 'E', 'W'] as $move) {
                    $end = AnswerChecker::walk($data, [$move]);
                    if ($end !== null && $end !== $data['target']) {
                        return ['moves' => [$move]];
                    }
                }

                return ['moves' => ['N', 'S']];
            case QuestionType::ROUTE_FOLLOW:
                $cell = $answer['cell'] === [0, 0] ? [0, 1] : [0, 0];

                return ['cell' => $cell];
            case QuestionType::MONEY:
                $smallest = min($data['denominations']);

                return ['coins' => $smallest === $answer['total'] ? [$smallest, $smallest] : [$smallest]];
            case QuestionType::COMPARE:
                return ['symbol' => $answer['symbol'] === '<' ? '>' : '<'];
        }

        $this->fail("No wrong payload for {$question->question_type}");
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<string>
     */
    private function shortestRoute(array $data): array
    {
        $queue = [[$data['start'], []]];
        $seen = [implode(':', $data['start']) => true];

        while ($queue !== []) {
            [$cell, $moves] = array_shift($queue);
            if ($cell === $data['target']) {
                return $moves;
            }
            foreach (['N', 'S', 'E', 'W'] as $move) {
                $next = AnswerChecker::walk($data, [...$moves, $move]);
                if ($next !== null && ! isset($seen[implode(':', $next)])) {
                    $seen[implode(':', $next)] = true;
                    $queue[] = [$next, [...$moves, $move]];
                }
            }
        }

        $this->fail('Route target is unreachable.');
    }

    /**
     * @param  list<int>  $denominations
     * @return list<int>
     */
    private function makeChange(int $total, array $denominations): array
    {
        $best = [0 => []];
        for ($amount = 1; $amount <= $total; $amount++) {
            foreach ($denominations as $coin) {
                if ($coin <= $amount && isset($best[$amount - $coin]) && (! isset($best[$amount]) || count($best[$amount - $coin]) + 1 < count($best[$amount]))) {
                    $best[$amount] = [...$best[$amount - $coin], $coin];
                }
            }
        }

        return $best[$total] ?? $this->fail("Cannot make {$total}");
    }
}

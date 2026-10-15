<?php

namespace App\Game;

use App\Models\GameAttempt;
use App\Models\GameAttemptQuestion;
use App\Models\GameStage;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\Student;
use App\Models\StudentStageProgress;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

final class AttemptService
{
    public function __construct(
        private readonly ProgressService $progress,
        private readonly AnswerChecker $checker,
        private readonly Achievements $achievements,
    ) {}

    /**
     * Resumes the student's unfinished attempt for this stage, or starts a new
     * one with a reproducible, difficulty-ordered selection of questions.
     */
    public function start(Student $student, GameStage $stage): GameAttempt
    {
        $this->ensureUnlocked($student, $stage);

        return DB::transaction(function () use ($student, $stage) {
            Student::query()->whereKey($student->id)->lockForUpdate()->first();

            $existing = GameAttempt::query()
                ->where('student_id', $student->id)
                ->where('game_stage_id', $stage->id)
                ->whereNull('completed_at')
                ->latest('id')
                ->first();

            if ($existing) {
                return $existing;
            }

            /** @var list<Question> $pool */
            $pool = $stage->questions()->where('is_active', true)->orderBy('sort_order')->get()->all();

            if ($pool === []) {
                throw new HttpException(503, 'This stage has no questions yet.');
            }

            $attempt = GameAttempt::query()->create([
                'student_id' => $student->id,
                'game_stage_id' => $stage->id,
                'started_at' => Carbon::now(),
            ]);

            $selected = array_slice(QuestionPresenter::shuffle($pool, $attempt->id), 0, $stage->questions_per_attempt);
            usort($selected, fn (Question $a, Question $b) => [$a->difficulty, $a->sort_order] <=> [$b->difficulty, $b->sort_order]);

            foreach ($selected as $position => $question) {
                GameAttemptQuestion::query()->create([
                    'game_attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                    'position' => $position + 1,
                ]);
            }

            $questionPoints = array_sum(array_map(fn (Question $q) => $q->points, $selected));
            $attempt->update([
                'total_questions' => count($selected),
                'max_score' => $questionPoints + Scoring::COMPLETION_BONUS,
            ]);

            StudentStageProgress::query()->firstOrCreate(
                ['student_id' => $student->id, 'game_stage_id' => $stage->id],
                ['status' => StudentStageProgress::STATUS_IN_PROGRESS],
            );

            $student->forceFill(['last_played_at' => Carbon::now()])->save();

            return $attempt;
        });
    }

    /**
     * @return array{hint: string}
     */
    public function hint(GameAttempt $attempt, int $questionId): array
    {
        return DB::transaction(function () use ($attempt, $questionId) {
            $locked = $this->lockOpenAttempt($attempt);
            $row = $this->attemptQuestion($locked, $questionId);
            $question = $row->question;

            if (! $row->is_resolved && ! $row->hint_used && filled($question->hint)) {
                $row->update(['hint_used' => true]);
                $locked->increment('hints_used');
            }

            return ['hint' => (string) $question->hint];
        });
    }

    /**
     * @param  array<string, mixed>  $submitted
     * @return array<string, mixed>
     */
    public function answer(GameAttempt $attempt, int $questionId, array $submitted): array
    {
        return DB::transaction(function () use ($attempt, $questionId, $submitted) {
            $locked = $this->lockOpenAttempt($attempt);
            $row = $this->attemptQuestion($locked, $questionId);
            $question = $row->question;

            if ($row->is_resolved) {
                return $this->answerPayload($locked, $row, $question, $row->is_correct, 0, duplicate: true);
            }

            $result = $this->checker->check($question, $submitted);
            $tryNumber = $row->tries + 1;
            $points = $result['correct'] ? Scoring::pointsFor($question->points, $tryNumber, $row->hint_used) : 0;
            $resolved = $result['correct'] || $tryNumber >= Scoring::MAX_TRIES;

            QuestionAttempt::query()->create([
                'game_attempt_id' => $locked->id,
                'question_id' => $question->id,
                'submitted_answer' => $result['normalized'],
                'is_correct' => $result['correct'],
                'points_awarded' => $points,
                'attempt_number' => $tryNumber,
                'answered_at' => Carbon::now(),
            ]);

            $row->update([
                'tries' => $tryNumber,
                'is_resolved' => $resolved,
                'is_correct' => $result['correct'],
                'points_awarded' => $points,
            ]);

            $locked->update([
                'score' => $locked->score + $points,
                'correct_answers' => $locked->correct_answers + ($result['correct'] ? 1 : 0),
                'incorrect_answers' => $locked->incorrect_answers + ($result['correct'] ? 0 : 1),
            ]);

            return $this->answerPayload($locked, $row, $question, $result['correct'], $points, duplicate: false);
        });
    }

    /**
     * Finalises an attempt once every question is resolved. Safe to call more
     * than once: a completed attempt is returned unchanged.
     *
     * @return array{attempt: GameAttempt, new_achievements: list<string>, newly_completed: bool, improved: bool}
     */
    public function complete(GameAttempt $attempt): array
    {
        return DB::transaction(function () use ($attempt) {
            /** @var GameAttempt $locked */
            $locked = GameAttempt::query()->whereKey($attempt->id)->lockForUpdate()->firstOrFail();

            if ($locked->isCompleted()) {
                return ['attempt' => $locked, 'new_achievements' => [], 'newly_completed' => false, 'improved' => false];
            }

            $rows = $locked->attemptQuestions()->with('question')->get();

            if ($rows->isEmpty() || $rows->contains(fn (GameAttemptQuestion $r) => ! $r->is_resolved)) {
                throw ValidationException::withMessages(['attempt' => 'أجب عن كل الأسئلة أولاً.']);
            }

            $questionPoints = (int) $rows->sum('points_awarded');
            $maxQuestionPoints = (int) $rows->sum(fn (GameAttemptQuestion $r) => $r->question->points);
            $correct = $rows->where('is_correct', true)->count();
            $passed = Scoring::isPassed($correct, $rows->count());
            $perfect = $rows->every(fn (GameAttemptQuestion $r) => $r->is_correct && $r->tries === 1 && ! $r->hint_used);
            $score = $questionPoints + ($passed ? Scoring::COMPLETION_BONUS : 0);

            $locked->update([
                'score' => $score,
                'correct_answers' => $correct,
                'stars_earned' => Scoring::stars($questionPoints, $maxQuestionPoints, $passed),
                'passed' => $passed,
                'is_perfect' => $passed && $perfect,
                'completed_at' => Carbon::now(),
            ]);

            /** @var StudentStageProgress $progress */
            $progress = StudentStageProgress::query()
                ->where('student_id', $locked->student_id)
                ->where('game_stage_id', $locked->game_stage_id)
                ->lockForUpdate()
                ->firstOrFail();

            $wasCompleted = $progress->status === StudentStageProgress::STATUS_COMPLETED;
            $hadFailedBefore = ! $wasCompleted && $progress->attempts_count > 0;
            $improved = $passed && ($score > $progress->best_score || $locked->stars_earned > $progress->stars_earned);

            $progress->attempts_count++;
            if ($passed) {
                $progress->status = StudentStageProgress::STATUS_COMPLETED;
                $progress->completed_at ??= $locked->completed_at;
                $progress->best_score = max($progress->best_score, $score);
                $progress->stars_earned = max($progress->stars_earned, $locked->stars_earned);
            }
            $progress->save();

            $student = $locked->student;
            $new = $this->achievements->awardAfterAttempt(
                $student,
                $locked,
                $hadFailedBefore,
                $this->progress->stages(),
                $this->progress->completedIds($student),
                $this->progress->totalStars($student),
            );

            return [
                'attempt' => $locked->refresh(),
                'new_achievements' => $new,
                'newly_completed' => $passed && ! $wasCompleted,
                'improved' => $improved && $wasCompleted,
            ];
        });
    }

    public function ensureUnlocked(Student $student, GameStage $stage): void
    {
        if (! $this->progress->isUnlocked($stage, $this->progress->progressFor($student))) {
            throw new HttpException(403, 'هذه المرحلة مقفلة. أكمل المرحلة السابقة أولاً.');
        }
    }

    private function lockOpenAttempt(GameAttempt $attempt): GameAttempt
    {
        /** @var GameAttempt $locked */
        $locked = GameAttempt::query()->whereKey($attempt->id)->lockForUpdate()->firstOrFail();

        if ($locked->isCompleted()) {
            throw new HttpException(409, 'انتهت هذه المحاولة.');
        }

        return $locked;
    }

    private function attemptQuestion(GameAttempt $attempt, int $questionId): GameAttemptQuestion
    {
        /** @var GameAttemptQuestion|null $row */
        $row = GameAttemptQuestion::query()
            ->where('game_attempt_id', $attempt->id)
            ->where('question_id', $questionId)
            ->with('question')
            ->lockForUpdate()
            ->first();

        if ($row === null) {
            throw ValidationException::withMessages(['question_id' => 'هذا السؤال ليس جزءاً من هذه المرحلة.']);
        }

        return $row;
    }

    /**
     * @return array<string, mixed>
     */
    private function answerPayload(GameAttempt $attempt, GameAttemptQuestion $row, Question $question, bool $correct, int $points, bool $duplicate): array
    {
        $answered = $attempt->attemptQuestions()->where('is_resolved', true)->count();

        return [
            'question_id' => $question->id,
            'correct' => $correct,
            'duplicate' => $duplicate,
            'points' => $points,
            'tries' => $row->tries,
            'tries_left' => max(0, Scoring::MAX_TRIES - $row->tries),
            'resolved' => $row->is_resolved,
            'hint' => ! $correct && ! $row->is_resolved ? $question->hint : null,
            'explanation' => $row->is_resolved ? $question->explanation : null,
            'reveal' => $row->is_resolved && ! $correct ? ($question->correct_answer['display'] ?? null) : null,
            'reveal_answer' => $row->is_resolved && ! $correct ? $this->revealable($question) : null,
            'attempt' => [
                'score' => $attempt->score,
                'answered' => $answered,
                'total' => $attempt->total_questions,
                'all_resolved' => $answered >= $attempt->total_questions,
            ],
        ];
    }

    /**
     * Structured answer for types where showing it visually helps learning.
     * Only sent after the question is finished.
     *
     * @return array<string, mixed>|null
     */
    private function revealable(Question $question): ?array
    {
        return match ($question->question_type) {
            QuestionType::SYMMETRY => ['cells' => $question->correct_answer['cells']],
            QuestionType::ROUTE_FOLLOW => ['cell' => $question->correct_answer['cell']],
            QuestionType::CLOCK_SET => ['hour' => $question->correct_answer['hour'], 'minute' => $question->correct_answer['minute']],
            default => null,
        };
    }
}

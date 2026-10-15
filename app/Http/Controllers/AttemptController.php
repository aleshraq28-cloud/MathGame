<?php

namespace App\Http\Controllers;

use App\Game\Achievements;
use App\Game\AttemptService;
use App\Game\ProgressService;
use App\Game\QuestionPresenter;
use App\Game\Scoring;
use App\Http\Requests\SubmitAnswerRequest;
use App\Models\GameAttempt;
use App\Models\GameAttemptQuestion;
use App\Models\StudentAchievement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttemptController extends Controller
{
    public function play(Request $request, GameAttempt $attempt, QuestionPresenter $presenter, ProgressService $progress): Response|RedirectResponse
    {
        $attempt = $this->ownAttempt($request, $attempt);

        if ($attempt->isCompleted()) {
            return redirect()->route('game.attempts.results', $attempt);
        }

        $attempt->load(['stage', 'attemptQuestions.question']);

        $questions = $attempt->attemptQuestions->map(fn (GameAttemptQuestion $row) => [
            'position' => $row->position,
            'question' => $presenter->present($row->question, $attempt->id),
            'state' => [
                'tries' => $row->tries,
                'tries_left' => max(0, Scoring::MAX_TRIES - $row->tries),
                'resolved' => $row->is_resolved,
                'correct' => $row->is_correct,
                'points' => $row->points_awarded,
                'hint' => $row->hint_used || ($row->tries > 0 && ! $row->is_resolved) ? $row->question->hint : null,
                'explanation' => $row->is_resolved ? $row->question->explanation : null,
                'reveal' => $row->is_resolved && ! $row->is_correct ? ($row->question->correct_answer['display'] ?? null) : null,
            ],
        ])->values();

        return Inertia::render('game/activity', [
            'stage' => [
                ...$progress->stageCard($attempt->stage),
                'instructions' => $attempt->stage->instructions,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'score' => $attempt->score,
                'total' => $attempt->total_questions,
                'answered' => $attempt->attemptQuestions->where('is_resolved', true)->count(),
            ],
            'questions' => $questions,
            'rules' => Scoring::summary(),
        ]);
    }

    public function hint(Request $request, GameAttempt $attempt, int $question, AttemptService $attempts): JsonResponse
    {
        $attempt = $this->ownAttempt($request, $attempt);

        return response()->json($attempts->hint($attempt, $question));
    }

    public function answer(SubmitAnswerRequest $request, GameAttempt $attempt, AttemptService $attempts): JsonResponse
    {
        $attempt = $this->ownAttempt($request, $attempt);

        /** @var array<string, mixed> $answer */
        $answer = $request->validated('answer');

        return response()->json($attempts->answer($attempt, (int) $request->validated('question_id'), $answer));
    }

    public function complete(Request $request, GameAttempt $attempt, AttemptService $attempts): RedirectResponse
    {
        $attempt = $this->ownAttempt($request, $attempt);
        $result = $attempts->complete($attempt);

        return redirect()->route('game.attempts.results', $attempt)->with('result_flags', [
            'newly_completed' => $result['newly_completed'],
            'improved' => $result['improved'],
        ]);
    }

    public function results(Request $request, GameAttempt $attempt, ProgressService $progress): Response|RedirectResponse
    {
        $attempt = $this->ownAttempt($request, $attempt);

        if (! $attempt->isCompleted()) {
            return redirect()->route('game.attempts.play', $attempt);
        }

        $student = $this->student($request);
        $stage = $attempt->stage;
        $summary = $progress->summary($student);
        $catalog = Achievements::catalog();
        $newAchievements = StudentAchievement::query()
            ->where('student_id', $student->id)
            ->where('earned_at', $attempt->completed_at)
            ->get()
            ->map(fn (StudentAchievement $a) => [
                'key' => $a->achievement_key,
                'title' => $a->title,
                'description' => $a->description,
                'icon' => $catalog[$a->achievement_key]['icon'] ?? 'award',
            ])
            ->values();

        $rows = $progress->progressFor($student);
        $nextStage = $progress->stages()
            ->first(fn ($s) => $s->sort_order > $stage->sort_order && $progress->isUnlocked($s, $rows));

        $props = [
            'stage' => $progress->stageCard($stage),
            'result' => [
                'attempt_id' => $attempt->id,
                'score' => $attempt->score,
                'max_score' => $attempt->max_score,
                'correct' => $attempt->correct_answers,
                'mistakes' => $attempt->incorrect_answers,
                'total' => $attempt->total_questions,
                'hints_used' => $attempt->hints_used,
                'stars' => $attempt->stars_earned,
                'passed' => $attempt->passed,
                'perfect' => $attempt->is_perfect,
                'pass_mark' => Scoring::passMark($attempt->total_questions),
                'completion_bonus' => $attempt->passed ? Scoring::COMPLETION_BONUS : 0,
            ],
            'best' => [
                'score' => $rows->get($stage->id)->best_score ?? 0,
                'stars' => $rows->get($stage->id)->stars_earned ?? 0,
            ],
            'flags' => $request->session()->get('result_flags', ['newly_completed' => false, 'improved' => false]),
            'next_stage' => $nextStage && $attempt->passed ? $progress->stageCard($nextStage) : null,
            'new_achievements' => $newAchievements,
            'summary' => $summary,
        ];

        if ($stage->is_final && $attempt->passed) {
            $props['achievements'] = $student->achievements()->orderBy('earned_at')->get()->map(fn (StudentAchievement $a) => [
                'key' => $a->achievement_key,
                'title' => $a->title,
                'description' => $a->description,
                'icon' => $catalog[$a->achievement_key]['icon'] ?? 'award',
            ])->values();

            return Inertia::render('game/victory', $props);
        }

        return Inertia::render('game/results', $props);
    }
}

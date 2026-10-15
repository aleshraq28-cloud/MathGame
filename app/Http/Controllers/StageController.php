<?php

namespace App\Http\Controllers;

use App\Game\AttemptService;
use App\Game\ProgressService;
use App\Game\Scoring;
use App\Game\Worlds;
use App\Models\GameAttempt;
use App\Models\GameStage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StageController extends Controller
{
    public function show(Request $request, GameStage $stage, ProgressService $progress): Response|RedirectResponse
    {
        abort_unless($stage->is_active, 404);

        $student = $this->student($request);
        $rows = $progress->progressFor($student);

        if (! $progress->isUnlocked($stage, $rows)) {
            return redirect()->route('game.map')->with('notice', 'هذه المرحلة مقفلة. أكمل المرحلة السابقة لتفتحها.');
        }

        $row = $rows->get($stage->id);
        $openAttempt = GameAttempt::query()
            ->where('student_id', $student->id)
            ->where('game_stage_id', $stage->id)
            ->whereNull('completed_at')
            ->latest('id')
            ->first();

        return Inertia::render('game/stage', [
            'stage' => [
                ...$progress->stageCard($stage),
                'instructions' => $stage->instructions,
                'questions_per_attempt' => $stage->questions_per_attempt,
            ],
            'world' => Worlds::all()[$stage->world_number] ?? null,
            'progress' => [
                'status' => $row->status ?? 'new',
                'best_score' => $row->best_score ?? 0,
                'stars' => $row->stars_earned ?? 0,
                'attempts' => $row->attempts_count ?? 0,
                'completed_at' => $row?->completed_at?->toIso8601String(),
            ],
            'has_open_attempt' => $openAttempt !== null,
            'rules' => Scoring::summary(),
            'summary' => $progress->summary($student),
        ]);
    }

    public function start(Request $request, GameStage $stage, AttemptService $attempts): RedirectResponse
    {
        abort_unless($stage->is_active, 404);

        $attempt = $attempts->start($this->student($request), $stage);

        return redirect()->route('game.attempts.play', $attempt);
    }
}

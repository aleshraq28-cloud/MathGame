<?php

namespace App\Http\Controllers;

use App\Game\Achievements;
use App\Game\ProgressService;
use App\Game\Worlds;
use App\Models\StudentAchievement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgressController extends Controller
{
    public function progress(Request $request, ProgressService $progress): Response
    {
        $student = $this->student($request);

        return Inertia::render('game/progress', [
            'stages' => $progress->mapStages($student),
            'worlds' => Worlds::all(),
            'summary' => $progress->summary($student),
            'achievement_count' => $student->achievements()->count(),
        ]);
    }

    public function achievements(Request $request, ProgressService $progress): Response
    {
        $student = $this->student($request);
        $earned = $student->achievements()->get()->keyBy('achievement_key');

        $list = collect(Achievements::catalog())->map(function (array $item, string $key) use ($earned) {
            /** @var StudentAchievement|null $row */
            $row = $earned->get($key);

            return [
                'key' => $key,
                'title' => $item['title'],
                'description' => $item['description'],
                'icon' => $item['icon'],
                'earned' => $row !== null,
                'earned_at' => $row?->earned_at->toIso8601String(),
            ];
        })->values();

        return Inertia::render('game/achievements', [
            'achievements' => $list,
            'summary' => $progress->summary($student),
        ]);
    }
}

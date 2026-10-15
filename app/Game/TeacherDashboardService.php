<?php

namespace App\Game;

use App\Models\GameAttempt;
use App\Models\Student;
use App\Models\StudentStageProgress;

/**
 * Builds the player roster for the teacher dashboard.
 */
final class TeacherDashboardService
{
    public function __construct(private ProgressService $progress) {}

    /**
     * @return list<array<string, mixed>>
     */
    public function players(): array
    {
        $stages = $this->progress->stages();
        $total = $stages->count();

        return Student::query()
            ->orderByDesc('last_played_at')
            ->orderBy('name')
            ->get()
            ->map(function (Student $student) use ($total) {
                $summary = $this->progress->summary($student);
                $progress = $this->progress->progressFor($student);
                $current = collect($this->progress->mapStages($student))
                    ->first(fn (array $stage) => $stage['status'] === 'current');

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'last_played_at' => $student->last_played_at?->toIso8601String(),
                    'completed_stages' => $summary['completed_stages'],
                    'total_stages' => $total,
                    'percent' => $summary['percent'],
                    'stars' => $summary['stars'],
                    'max_stars' => $summary['max_stars'],
                    'best_score_total' => $summary['best_score_total'],
                    'practice_points' => $summary['practice_points'],
                    'treasure_found' => $summary['treasure_found'],
                    'current_stage' => $current ? [
                        'slug' => $current['slug'],
                        'title' => $current['title'],
                        'stage_number' => $current['stage_number'],
                        'world_number' => $current['world_number'],
                    ] : null,
                    'attempts_count' => (int) GameAttempt::query()
                        ->where('student_id', $student->id)
                        ->count(),
                    'in_progress_stages' => $progress
                        ->where('status', StudentStageProgress::STATUS_IN_PROGRESS)
                        ->count(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function playerDetail(Student $student): array
    {
        $summary = $this->progress->summary($student);

        return [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'last_played_at' => $student->last_played_at?->toIso8601String(),
            ],
            'summary' => $summary,
            'stages' => $this->progress->mapStages($student),
            'recent_attempts' => GameAttempt::query()
                ->with('stage:id,slug,title,stage_number')
                ->where('student_id', $student->id)
                ->orderByDesc('started_at')
                ->limit(20)
                ->get()
                ->map(fn (GameAttempt $attempt) => [
                    'id' => $attempt->id,
                    'stage_title' => $attempt->stage?->title,
                    'stage_number' => $attempt->stage?->stage_number,
                    'score' => $attempt->score,
                    'max_score' => $attempt->max_score,
                    'stars' => $attempt->stars_earned,
                    'passed' => $attempt->passed,
                    'completed_at' => $attempt->completed_at?->toIso8601String(),
                    'started_at' => $attempt->started_at->toIso8601String(),
                ])
                ->all(),
        ];
    }

    /**
     * @return array{players: int, completed_stages: int, stars: int, treasure_found: int}
     */
    public function overview(): array
    {
        $players = collect($this->players());

        return [
            'players' => $players->count(),
            'completed_stages' => (int) $players->sum('completed_stages'),
            'stars' => (int) $players->sum('stars'),
            'treasure_found' => $players->where('treasure_found', true)->count(),
        ];
    }
}

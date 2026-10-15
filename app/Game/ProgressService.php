<?php

namespace App\Game;

use App\Models\GameAttempt;
use App\Models\GameStage;
use App\Models\Student;
use App\Models\StudentStageProgress;
use Illuminate\Support\Collection;

/**
 * Computes unlock state and summaries. Unlocking is always derived from the
 * completion records stored in MySQL, never from client input.
 */
final class ProgressService
{
    /** @var Collection<int, GameStage>|null */
    private ?Collection $stages = null;

    /** @return Collection<int, GameStage> */
    public function stages(): Collection
    {
        return $this->stages ??= GameStage::query()->ordered()->get();
    }

    /** @return Collection<int, StudentStageProgress> keyed by game_stage_id */
    public function progressFor(Student $student): Collection
    {
        return $student->stageProgress()->get()->keyBy('game_stage_id');
    }

    /**
     * @param  Collection<int, StudentStageProgress>  $progress
     */
    public function isUnlocked(GameStage $stage, Collection $progress): bool
    {
        if (! $stage->is_active) {
            return false;
        }

        $stages = $this->stages();
        $completed = fn (GameStage $s): bool => $progress->get($s->id)?->status === StudentStageProgress::STATUS_COMPLETED;

        if ($stage->is_final) {
            return $stages->where('is_final', false)->every($completed);
        }

        $previous = $stages
            ->where('is_final', false)
            ->filter(fn (GameStage $s) => $s->sort_order < $stage->sort_order)
            ->last();

        return $previous === null || $completed($previous);
    }

    /**
     * @return array<int, bool> stage ids that the student has completed
     */
    public function completedIds(Student $student): array
    {
        return $student->stageProgress()
            ->where('status', StudentStageProgress::STATUS_COMPLETED)
            ->pluck('game_stage_id')
            ->mapWithKeys(fn ($id) => [$id => true])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function mapStages(Student $student): array
    {
        $progress = $this->progressFor($student);
        $currentFound = false;

        return $this->stages()->map(function (GameStage $stage) use ($progress, &$currentFound) {
            $row = $progress->get($stage->id);
            $isCompleted = $row?->status === StudentStageProgress::STATUS_COMPLETED;
            $unlocked = $this->isUnlocked($stage, $progress);

            $status = match (true) {
                $isCompleted => 'completed',
                ! $unlocked => 'locked',
                ! $currentFound => 'current',
                default => 'unlocked',
            };

            if ($status === 'current') {
                $currentFound = true;
            }

            return [
                ...$this->stageCard($stage),
                'status' => $status,
                'stars' => $row->stars_earned ?? 0,
                'best_score' => $row->best_score ?? 0,
                'attempts' => $row->attempts_count ?? 0,
            ];
        })->values()->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function stageCard(GameStage $stage): array
    {
        return [
            'id' => $stage->id,
            'slug' => $stage->slug,
            'title' => $stage->title,
            'description' => $stage->description,
            'world_number' => $stage->world_number,
            'stage_number' => $stage->stage_number,
            'topic' => $stage->topic,
            'icon' => $stage->icon,
            'difficulty' => $stage->difficulty,
            'is_final' => $stage->is_final,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function summary(Student $student): array
    {
        $progress = $this->progressFor($student);
        $stages = $this->stages();
        $completed = $progress->where('status', StudentStageProgress::STATUS_COMPLETED);

        $next = $stages->first(
            fn (GameStage $s) => $progress->get($s->id)?->status !== StudentStageProgress::STATUS_COMPLETED
                && $this->isUnlocked($s, $progress)
        );

        $total = $stages->count();

        return [
            'completed_stages' => $completed->count(),
            'total_stages' => $total,
            'percent' => $total > 0 ? (int) round($completed->count() / $total * 100) : 0,
            'stars' => (int) $progress->sum('stars_earned'),
            'max_stars' => $total * Scoring::MAX_STARS_PER_STAGE,
            'best_score_total' => (int) $progress->sum('best_score'),
            'practice_points' => (int) GameAttempt::query()
                ->where('student_id', $student->id)
                ->whereNotNull('completed_at')
                ->sum('score'),
            'next_stage' => $next ? ['slug' => $next->slug, 'title' => $next->title, 'stage_number' => $next->stage_number] : null,
            'treasure_found' => $stages->where('is_final', true)->contains(
                fn (GameStage $s) => $progress->get($s->id)?->status === StudentStageProgress::STATUS_COMPLETED
            ),
        ];
    }

    public function totalStars(Student $student): int
    {
        return (int) $student->stageProgress()->sum('stars_earned');
    }
}

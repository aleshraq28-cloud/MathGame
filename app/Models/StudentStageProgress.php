<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $game_stage_id
 * @property string $status
 * @property int $best_score
 * @property int $stars_earned
 * @property int $attempts_count
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'student_id', 'game_stage_id', 'status', 'best_score', 'stars_earned',
    'attempts_count', 'completed_at',
])]
class StudentStageProgress extends Model
{
    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_COMPLETED = 'completed';

    protected $table = 'student_stage_progress';

    protected function casts(): array
    {
        return [
            'best_score' => 'integer',
            'stars_earned' => 'integer',
            'attempts_count' => 'integer',
            'completed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Student, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** @return BelongsTo<GameStage, $this> */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(GameStage::class, 'game_stage_id');
    }
}

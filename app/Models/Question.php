<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $game_stage_id
 * @property string $key
 * @property string $question_text
 * @property string $question_type
 * @property array<string, mixed> $question_data
 * @property array<string, mixed> $correct_answer
 * @property string|null $explanation
 * @property string|null $hint
 * @property string $objective
 * @property int $difficulty
 * @property int $points
 * @property int $sort_order
 * @property bool $is_active
 * @property bool $is_custom
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'game_stage_id', 'key', 'question_text', 'question_type', 'question_data',
    'correct_answer', 'explanation', 'hint', 'objective', 'difficulty', 'points',
    'sort_order', 'is_active', 'is_custom',
])]
#[Hidden(['correct_answer', 'explanation', 'hint'])]
class Question extends Model
{
    protected function casts(): array
    {
        return [
            'question_data' => 'array',
            'correct_answer' => 'array',
            'difficulty' => 'integer',
            'points' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'is_custom' => 'boolean',
        ];
    }

    /** @return BelongsTo<GameStage, $this> */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(GameStage::class, 'game_stage_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $game_attempt_id
 * @property int $question_id
 * @property int $position
 * @property int $tries
 * @property bool $hint_used
 * @property bool $is_resolved
 * @property bool $is_correct
 * @property int $points_awarded
 * @property-read Question $question
 */
#[Fillable([
    'game_attempt_id', 'question_id', 'position', 'tries', 'hint_used',
    'is_resolved', 'is_correct', 'points_awarded',
])]
class GameAttemptQuestion extends Model
{
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'tries' => 'integer',
            'hint_used' => 'boolean',
            'is_resolved' => 'boolean',
            'is_correct' => 'boolean',
            'points_awarded' => 'integer',
        ];
    }

    /** @return BelongsTo<GameAttempt, $this> */
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(GameAttempt::class, 'game_attempt_id');
    }

    /** @return BelongsTo<Question, $this> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}

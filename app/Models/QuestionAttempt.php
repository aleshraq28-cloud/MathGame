<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $game_attempt_id
 * @property int $question_id
 * @property array<string, mixed> $submitted_answer
 * @property bool $is_correct
 * @property int $points_awarded
 * @property int $attempt_number
 * @property Carbon $answered_at
 */
#[Fillable([
    'game_attempt_id', 'question_id', 'submitted_answer', 'is_correct',
    'points_awarded', 'attempt_number', 'answered_at',
])]
class QuestionAttempt extends Model
{
    protected function casts(): array
    {
        return [
            'submitted_answer' => 'array',
            'is_correct' => 'boolean',
            'points_awarded' => 'integer',
            'attempt_number' => 'integer',
            'answered_at' => 'datetime',
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

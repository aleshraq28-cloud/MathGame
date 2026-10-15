<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $game_stage_id
 * @property int $score
 * @property int $max_score
 * @property int $correct_answers
 * @property int $incorrect_answers
 * @property int $total_questions
 * @property int $hints_used
 * @property int $stars_earned
 * @property bool $passed
 * @property bool $is_perfect
 * @property Carbon $started_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read GameStage $stage
 * @property-read Student $student
 */
#[Fillable([
    'student_id', 'game_stage_id', 'score', 'max_score', 'correct_answers',
    'incorrect_answers', 'total_questions', 'hints_used', 'stars_earned',
    'passed', 'is_perfect', 'started_at', 'completed_at',
])]
class GameAttempt extends Model
{
    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'max_score' => 'integer',
            'correct_answers' => 'integer',
            'incorrect_answers' => 'integer',
            'total_questions' => 'integer',
            'hints_used' => 'integer',
            'stars_earned' => 'integer',
            'passed' => 'boolean',
            'is_perfect' => 'boolean',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function isCompleted(): bool
    {
        return $this->completed_at !== null;
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

    /** @return HasMany<GameAttemptQuestion, $this> */
    public function attemptQuestions(): HasMany
    {
        return $this->hasMany(GameAttemptQuestion::class)->orderBy('position');
    }

    /** @return HasMany<QuestionAttempt, $this> */
    public function questionAttempts(): HasMany
    {
        return $this->hasMany(QuestionAttempt::class);
    }
}

<?php

namespace App\Models;

use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property Carbon|null $last_played_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'last_played_at'])]
class Student extends Model
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'last_played_at' => 'datetime',
        ];
    }

    /** @return HasMany<StudentStageProgress, $this> */
    public function stageProgress(): HasMany
    {
        return $this->hasMany(StudentStageProgress::class);
    }

    /** @return HasMany<GameAttempt, $this> */
    public function attempts(): HasMany
    {
        return $this->hasMany(GameAttempt::class);
    }

    /** @return HasMany<StudentAchievement, $this> */
    public function achievements(): HasMany
    {
        return $this->hasMany(StudentAchievement::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property string $achievement_key
 * @property string $title
 * @property string $description
 * @property Carbon $earned_at
 */
#[Fillable(['student_id', 'achievement_key', 'title', 'description', 'earned_at'])]
class StudentAchievement extends Model
{
    protected function casts(): array
    {
        return [
            'earned_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Student, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}

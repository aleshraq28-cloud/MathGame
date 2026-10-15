<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $slug
 * @property string $title
 * @property string $description
 * @property int $world_number
 * @property int $stage_number
 * @property string $topic
 * @property string $instructions
 * @property string $icon
 * @property int $difficulty
 * @property int $questions_per_attempt
 * @property bool $is_final
 * @property int $sort_order
 * @property bool $is_active
 * @property bool $is_custom
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'slug', 'title', 'description', 'world_number', 'stage_number', 'topic',
    'instructions', 'icon', 'difficulty', 'questions_per_attempt', 'is_final',
    'sort_order', 'is_active', 'is_custom',
])]
class GameStage extends Model
{
    protected function casts(): array
    {
        return [
            'world_number' => 'integer',
            'stage_number' => 'integer',
            'difficulty' => 'integer',
            'questions_per_attempt' => 'integer',
            'is_final' => 'boolean',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'is_custom' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** @return HasMany<Question, $this> */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * @param  Builder<GameStage>  $query
     * @return Builder<GameStage>
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}

<?php

namespace App\Game;

use App\Models\GameAttempt;
use App\Models\GameStage;
use App\Models\Student;
use App\Models\StudentAchievement;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

final class Achievements
{
    /**
     * @return array<string, array{title: string, description: string, icon: string}>
     */
    public static function catalog(): array
    {
        $catalog = [
            'first_stage' => ['title' => 'الخطوة الأولى', 'description' => 'أكملت أول مرحلة في رحلتك.', 'icon' => 'footprints'],
            'perfect_stage' => ['title' => 'إجابات مثالية', 'description' => 'أكملت مرحلة كاملة من المحاولة الأولى ودون تلميحات.', 'icon' => 'sparkles'],
            'persistent' => ['title' => 'البطل المثابر', 'description' => 'أعدت المحاولة ونجحت في مرحلة لم تنجح فيها من قبل.', 'icon' => 'mountain'],
            'stars_25' => ['title' => 'جامع النجوم', 'description' => 'جمعت 25 نجمة.', 'icon' => 'star'],
            'stars_50' => ['title' => 'نجم الجزيرة', 'description' => 'جمعت 50 نجمة.', 'icon' => 'stars'],
        ];

        foreach (Worlds::all() as $number => $world) {
            if ($number === 6) {
                continue;
            }
            $catalog["world_$number"] = [
                'title' => 'مستكشف '.$world['name'],
                'description' => 'أكملت كل مراحل '.$world['name'].'.',
                'icon' => 'map',
            ];
        }

        $catalog['treasure_hunter'] = ['title' => 'صائد الكنز', 'description' => 'فتحت صندوق الكنز وأكملت الرحلة كلها!', 'icon' => 'gem'];

        return $catalog;
    }

    /**
     * Awards any newly earned achievements after a completed attempt.
     * The unique (student_id, achievement_key) index prevents duplicates.
     *
     * @param  Collection<int, GameStage>  $stages
     * @param  array<int, bool>  $completedStageIds
     * @return list<string> keys awarded now
     */
    public function awardAfterAttempt(Student $student, GameAttempt $attempt, bool $hadFailedBefore, Collection $stages, array $completedStageIds, int $totalStars): array
    {
        $earned = [];

        if ($attempt->passed) {
            $earned[] = 'first_stage';

            if ($attempt->is_perfect) {
                $earned[] = 'perfect_stage';
            }

            if ($hadFailedBefore) {
                $earned[] = 'persistent';
            }
        }

        foreach ($stages->where('is_final', false)->groupBy('world_number') as $world => $worldStages) {
            if ($worldStages->every(fn (GameStage $s) => isset($completedStageIds[$s->id]))) {
                $earned[] = "world_$world";
            }
        }

        if ($totalStars >= 25) {
            $earned[] = 'stars_25';
        }

        if ($totalStars >= 50) {
            $earned[] = 'stars_50';
        }

        $final = $stages->firstWhere('is_final', true);
        if ($final && isset($completedStageIds[$final->id])) {
            $earned[] = 'treasure_hunter';
        }

        $existing = $student->achievements()->pluck('achievement_key')->all();
        $new = array_values(array_diff(array_unique($earned), $existing));
        $catalog = self::catalog();
        $now = $attempt->completed_at ?? Carbon::now();

        foreach ($new as $key) {
            StudentAchievement::query()->insertOrIgnore([
                'student_id' => $student->id,
                'achievement_key' => $key,
                'title' => $catalog[$key]['title'],
                'description' => $catalog[$key]['description'],
                'earned_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        return $new;
    }
}

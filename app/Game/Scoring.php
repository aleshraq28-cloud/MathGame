<?php

namespace App\Game;

/**
 * The single source of truth for points, stars and pass rules.
 *
 * - Points are earned per question; fewer points after hints or retries.
 * - Stars and best score are kept per stage (best result only), so replays
 *   can improve a stage but never inflate the permanent star total.
 * - "Practice points" (sum of every finished attempt) are tracked separately.
 */
final class Scoring
{
    public const MAX_TRIES = 3;

    public const COMPLETION_BONUS = 20;

    public const PASS_RATIO = 0.6;

    public const HINT_FACTOR = 0.7;

    /** @var array<int, float> */
    public const TRY_FACTORS = [1 => 1.0, 2 => 0.5, 3 => 0.2];

    public const MAX_STARS_PER_STAGE = 3;

    public static function pointsFor(int $basePoints, int $tryNumber, bool $hintUsed): int
    {
        $factor = self::TRY_FACTORS[$tryNumber] ?? 0.0;

        if ($tryNumber === 1 && $hintUsed) {
            $factor = self::HINT_FACTOR;
        }

        return (int) round($basePoints * $factor);
    }

    public static function passMark(int $totalQuestions): int
    {
        return (int) ceil($totalQuestions * self::PASS_RATIO);
    }

    public static function isPassed(int $correctAnswers, int $totalQuestions): bool
    {
        return $totalQuestions > 0 && $correctAnswers >= self::passMark($totalQuestions);
    }

    public static function stars(int $questionPoints, int $maxQuestionPoints, bool $passed): int
    {
        if (! $passed || $maxQuestionPoints <= 0) {
            return 0;
        }

        $ratio = $questionPoints / $maxQuestionPoints;

        return match (true) {
            $ratio >= 0.9 => 3,
            $ratio >= 0.7 => 2,
            default => 1,
        };
    }

    /**
     * Human-readable rules shown to students on the stage screen.
     *
     * @return array<string, int|float>
     */
    public static function summary(): array
    {
        return [
            'first_try' => self::pointsFor(10, 1, false),
            'after_hint' => self::pointsFor(10, 1, true),
            'second_try' => self::pointsFor(10, 2, false),
            'third_try' => self::pointsFor(10, 3, false),
            'max_tries' => self::MAX_TRIES,
            'completion_bonus' => self::COMPLETION_BONUS,
            'pass_percent' => (int) (self::PASS_RATIO * 100),
        ];
    }
}

<?php

namespace App\Game;

/**
 * Interaction types understood by the activity engine. Visual aids (blocks,
 * arrays, clocks, coins, shapes...) are described separately in question_data
 * so that any interaction can be paired with any picture.
 */
final class QuestionType
{
    public const CHOICE = 'choice';

    public const NUMBER = 'number';

    public const MISSING = 'missing';

    public const MATCH = 'match';

    public const ORDER = 'order';

    public const PLACE_VALUE = 'place_value';

    public const CLOCK_SET = 'clock_set';

    public const SYMMETRY = 'symmetry';

    public const ROUTE_BUILD = 'route_build';

    public const ROUTE_FOLLOW = 'route_follow';

    public const MONEY = 'money';

    public const COMPARE = 'compare';

    /** @return list<string> */
    public static function all(): array
    {
        return [
            self::CHOICE, self::NUMBER, self::MISSING, self::MATCH, self::ORDER,
            self::PLACE_VALUE, self::CLOCK_SET, self::SYMMETRY, self::ROUTE_BUILD,
            self::ROUTE_FOLLOW, self::MONEY, self::COMPARE,
        ];
    }
}

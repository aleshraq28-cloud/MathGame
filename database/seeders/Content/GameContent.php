<?php

namespace Database\Seeders\Content;

final class GameContent
{
    /**
     * All stage definitions in play order.
     *
     * @return list<array<string, mixed>>
     */
    public static function stages(): array
    {
        return [
            ...WorldOne::stages(),
            ...WorldTwo::stages(),
            ...WorldThree::stages(),
            ...WorldFour::stages(),
            ...WorldFive::stages(),
        ];
    }
}

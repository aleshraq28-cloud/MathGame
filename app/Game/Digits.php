<?php

namespace App\Game;

final class Digits
{
    private const MAP = [
        '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
        '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
        '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
        '٫' => '.', '،' => '', ',' => '',
    ];

    /** Converts Arabic-Indic digits to Western digits and strips separators. */
    public static function normalize(string $value): string
    {
        return trim(strtr($value, self::MAP));
    }

    public static function toNumber(mixed $value): ?float
    {
        if (is_int($value) || is_float($value)) {
            return (float) $value;
        }

        if (! is_string($value)) {
            return null;
        }

        $normalized = self::normalize($value);

        return preg_match('/^-?\d{1,7}(\.\d{1,3})?$/', $normalized) === 1 ? (float) $normalized : null;
    }
}

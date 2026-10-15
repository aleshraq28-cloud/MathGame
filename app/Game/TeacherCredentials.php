<?php

namespace App\Game;

/**
 * Compares the welcome-screen name and PIN against config/teacher.php.
 */
final class TeacherCredentials
{
    public static function isTeacherName(string $name): bool
    {
        return self::normalizeName($name) === self::normalizeName((string) config('teacher.name'));
    }

    public static function codeMatches(string $code): bool
    {
        $expected = (string) config('teacher.code');
        $given = preg_replace('/\s+/u', '', $code) ?? '';

        return $expected !== '' && hash_equals($expected, $given);
    }

    public static function normalizeName(string $name): string
    {
        return mb_strtolower(trim(preg_replace('/\s+/u', ' ', $name) ?? $name));
    }
}

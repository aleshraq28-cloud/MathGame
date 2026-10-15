<?php

namespace App\Game;

final class Worlds
{
    /**
     * @return array<int, array{name: string, tagline: string, theme: string}>
     */
    public static function all(): array
    {
        return [
            1 => ['name' => 'غابة الأعداد', 'tagline' => 'المئات والعشرات والآحاد', 'theme' => 'forest'],
            2 => ['name' => 'قرية الرياضيات اليومية', 'tagline' => 'المتجر والضرب والمضاعفات', 'theme' => 'village'],
            3 => ['name' => 'كهوف الأشكال والتماثل', 'tagline' => 'الأشكال والمجسمات والطرقات', 'theme' => 'caves'],
            4 => ['name' => 'ساحل الوقت والقياس', 'tagline' => 'النقود والوقت والبستان والقياس', 'theme' => 'coast'],
            5 => ['name' => 'جبل ألغاز الأعداد', 'tagline' => 'التقريب والجمع والطرح', 'theme' => 'mountain'],
            6 => ['name' => 'جزيرة الكنز', 'tagline' => 'التحدي الأخير', 'theme' => 'treasure'],
        ];
    }
}

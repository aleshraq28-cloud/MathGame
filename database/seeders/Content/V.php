<?php

namespace Database\Seeders\Content;

/**
 * Visual-aid descriptors. The React VisualAid component draws each kind as
 * original SVG artwork, so no external images are needed.
 */
final class V
{
    /** @return array<string, mixed> */
    public static function blocks(int $hundreds, int $tens, int $ones): array
    {
        return ['kind' => 'blocks'] + compact('hundreds', 'tens', 'ones');
    }

    /** @return array<string, mixed> */
    public static function abacus(int $hundreds, int $tens, int $ones): array
    {
        return ['kind' => 'abacus'] + compact('hundreds', 'tens', 'ones');
    }

    /** @return array<string, mixed> */
    public static function cards(int ...$digits): array
    {
        return ['kind' => 'cards', 'digits' => $digits];
    }

    /** @return array<string, mixed> */
    public static function array(int $rows, int $cols, string $icon): array
    {
        return ['kind' => 'array'] + compact('rows', 'cols', 'icon');
    }

    /** @return array<string, mixed> */
    public static function groups(int $groups, int $perGroup, string $icon, string $container = 'plate'): array
    {
        return ['kind' => 'groups', 'groups' => $groups, 'per_group' => $perGroup, 'icon' => $icon, 'container' => $container];
    }

    /**
     * @param  array<string, int>  $counts  icon => count
     * @return array<string, mixed>
     */
    public static function objects(array $counts): array
    {
        $items = [];
        foreach ($counts as $icon => $count) {
            $items[] = ['icon' => $icon, 'count' => $count];
        }

        return ['kind' => 'objects', 'items' => $items];
    }

    /** @return array<string, mixed> */
    public static function numberLine(int $start, int $end, int $step, ?int $pointer = null, bool $labelAll = true): array
    {
        return ['kind' => 'number_line', 'start' => $start, 'end' => $end, 'step' => $step, 'pointer' => $pointer, 'label_all' => $labelAll];
    }

    /** @return array<string, mixed> */
    public static function clock(int $hour, int $minute): array
    {
        return ['kind' => 'clock'] + compact('hour', 'minute');
    }

    /** @return array<string, mixed> */
    public static function digital(int $hour, int $minute): array
    {
        return ['kind' => 'digital_clock'] + compact('hour', 'minute');
    }

    /** @return array<string, mixed> */
    public static function shape(string $shape): array
    {
        return ['kind' => 'shape', 'shape' => $shape];
    }

    /**
     * @param  list<string>  $shapes
     * @return array<string, mixed>
     */
    public static function shapes(array $shapes): array
    {
        return ['kind' => 'shapes', 'shapes' => $shapes];
    }

    /** @return array<string, mixed> */
    public static function axisShape(string $shape, string $line): array
    {
        return ['kind' => 'axis_shape', 'shape' => $shape, 'line' => $line];
    }

    /** @return array<string, mixed> */
    public static function solid(string $solid): array
    {
        return ['kind' => 'solid', 'solid' => $solid];
    }

    /**
     * @param  list<array{0: int, 1: int}>  $cells
     * @return array<string, mixed>
     */
    public static function net(array $cells): array
    {
        return ['kind' => 'net', 'cells' => $cells];
    }

    /** @return array<string, mixed> */
    public static function letter(string $letter): array
    {
        return ['kind' => 'letter', 'letter' => $letter];
    }

    /**
     * @param  list<int>  $coins
     * @return array<string, mixed>
     */
    public static function coins(array $coins, string $unit = 'بيسة'): array
    {
        return ['kind' => 'coins', 'coins' => $coins, 'unit' => $unit];
    }

    /**
     * @param  list<array{icon: string, label: string, price: int}>  $items
     * @return array<string, mixed>
     */
    public static function prices(array $items, string $unit = 'بيسة'): array
    {
        return ['kind' => 'prices', 'items' => $items, 'unit' => $unit];
    }

    /**
     * @param  list<array{label: string, value: int, color?: string}>  $bars
     * @return array<string, mixed>
     */
    public static function bars(array $bars, string $unit, string $style = 'rope'): array
    {
        return ['kind' => 'bars', 'bars' => $bars, 'unit' => $unit, 'style' => $style];
    }

    /** @return array<string, mixed> */
    public static function ruler(int $length, string $object = 'pencil'): array
    {
        return ['kind' => 'ruler', 'length' => $length, 'object' => $object];
    }

    /** @return array<string, mixed> */
    public static function scale(int $value, int $max, string $unit, string $icon = 'apple'): array
    {
        return ['kind' => 'scale'] + compact('value', 'max', 'unit', 'icon');
    }

    /** @return array<string, mixed> */
    public static function jar(float $fill, int $capacity): array
    {
        return ['kind' => 'jar', 'fill' => $fill, 'capacity' => $capacity];
    }

    /**
     * @param  array{0: int, 1: int}  $start
     * @param  array{0: int, 1: int}|null  $target
     * @param  list<array{0: int, 1: int}>  $obstacles
     * @return array<string, mixed>
     */
    public static function grid(int $rows, int $cols, array $start, ?array $target = null, array $obstacles = []): array
    {
        return ['kind' => 'grid'] + compact('rows', 'cols', 'start', 'target', 'obstacles');
    }
}

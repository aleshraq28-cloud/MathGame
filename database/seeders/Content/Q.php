<?php

namespace Database\Seeders\Content;

use App\Game\AnswerChecker;
use App\Game\QuestionType;

/**
 * Builders for question definitions. Every builder stores the answer in
 * `answer` (kept server-side) and only presentation data in `data`.
 */
final class Q
{
    private const IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    /**
     * @param  list<string|array{label?: string, visual?: array<string, mixed>}>  $options
     * @param  array<string, mixed>|null  $visual
     * @return array<string, mixed>
     */
    public static function choice(string $key, string $text, array $options, int $correct, string $hint, string $explain, int $difficulty = 1, ?array $visual = null, bool $keepOrder = false): array
    {
        $opts = [];
        foreach ($options as $i => $option) {
            $option = is_string($option) ? ['label' => $option] : $option;
            $opts[] = ['id' => self::IDS[$i], 'label' => $option['label'] ?? ''] + (isset($option['visual']) ? ['visual' => $option['visual']] : []);
        }

        $display = $opts[$correct]['label'] !== '' ? $opts[$correct]['label'] : 'الخيار '.($correct + 1);

        return self::make($key, QuestionType::CHOICE, $text, ['options' => $opts, 'keep_order' => $keepOrder, 'visual' => $visual], ['option' => self::IDS[$correct], 'display' => $display], $hint, $explain, $difficulty);
    }

    /**
     * @param  array<string, mixed>|null  $visual
     * @return array<string, mixed>
     */
    public static function number(string $key, string $text, int|float $answer, string $hint, string $explain, int $difficulty = 1, ?array $visual = null, ?string $unit = null): array
    {
        return self::make($key, QuestionType::NUMBER, $text, ['visual' => $visual, 'unit' => $unit], ['value' => $answer, 'display' => trim($answer.' '.($unit ?? ''))], $hint, $explain, $difficulty);
    }

    /**
     * Number sentence or sequence with blanks (null tokens).
     *
     * @param  list<int|string|null>  $tokens
     * @param  list<int>  $answers
     * @param  array<string, mixed>|null  $visual
     * @return array<string, mixed>
     */
    public static function missing(string $key, string $text, array $tokens, array $answers, string $hint, string $explain, int $difficulty = 1, string $layout = 'equation', ?array $visual = null): array
    {
        $i = 0;
        $filled = [];
        foreach ($tokens as $token) {
            $filled[] = $token ?? $answers[$i++];
        }
        $display = implode($layout === 'sequence' ? '، ' : ' ', $filled);

        return self::make($key, QuestionType::MISSING, $text, ['layout' => $layout, 'tokens' => $tokens, 'visual' => $visual], ['values' => $answers, 'display' => $display], $hint, $explain, $difficulty);
    }

    /**
     * Addition wall: each brick is the sum of the two bricks below it.
     * Rows are listed top to bottom; null bricks are blanks, answered in
     * reading order.
     *
     * @param  list<list<int|null>>  $rows
     * @param  list<int>  $answers
     * @return array<string, mixed>
     */
    public static function wall(string $key, string $text, array $rows, array $answers, string $hint, string $explain, int $difficulty = 2): array
    {
        return self::make($key, QuestionType::MISSING, $text, ['layout' => 'wall', 'rows' => $rows], ['values' => $answers, 'display' => implode('، ', $answers)], $hint, $explain, $difficulty);
    }

    /**
     * @param  array<string, string>|list<array{0: string|array<string, mixed>, 1: string}>  $pairs
     *                                                                                               left label (or [label, visual]) => right label
     * @param  list<string>|null  $categories  for many-to-one sorting
     * @return array<string, mixed>
     */
    public static function match(string $key, string $text, array $pairs, string $hint, string $explain, int $difficulty = 1, ?array $categories = null): array
    {
        $left = [];
        $right = [];
        $answer = [];
        $rightIds = [];

        if ($categories !== null) {
            foreach ($categories as $i => $category) {
                $id = 'r'.($i + 1);
                $right[] = ['id' => $id, 'label' => $category];
                $rightIds[$category] = $id;
            }
        }

        $i = 0;
        foreach ($pairs as $l => $r) {
            if (is_int($l) && is_array($r)) {
                [$l, $r] = $r;
            }
            $leftItem = is_array($l) ? $l : ['label' => (string) $l];
            $leftId = 'l'.(++$i);
            $left[] = ['id' => $leftId, 'label' => $leftItem['label'] ?? ''] + (isset($leftItem['visual']) ? ['visual' => $leftItem['visual']] : []);

            if (! isset($rightIds[$r])) {
                $rightIds[$r] = 'r'.(count($right) + 1);
                $right[] = ['id' => $rightIds[$r], 'label' => $r];
            }
            $answer[$leftId] = $rightIds[$r];
        }

        $display = implode('، ', array_map(
            fn ($l) => ($l['label'] !== '' ? $l['label'] : 'الصورة '.substr($l['id'], 1)).' ← '.collect($right)->firstWhere('id', $answer[$l['id']])['label'],
            $left,
        ));

        return self::make($key, QuestionType::MATCH, $text, ['left' => $left, 'right' => $right, 'many_to_one' => $categories !== null], ['pairs' => $answer, 'display' => $display], $hint, $explain, $difficulty);
    }

    /**
     * @param  list<int|array{0: string, 1: int}>  $items  numbers, or [label, sortValue]
     * @return array<string, mixed>
     */
    public static function order(string $key, string $text, array $items, string $direction, string $hint, string $explain, int $difficulty = 1, ?string $firstLabel = null, ?string $lastLabel = null): array
    {
        $list = [];
        foreach ($items as $i => $item) {
            [$label, $value] = is_array($item) ? $item : [(string) $item, $item];
            $list[] = ['id' => 'i'.($i + 1), 'label' => $label, 'value' => $value];
        }

        $sorted = $list;
        usort($sorted, fn ($a, $b) => $direction === 'desc' ? $b['value'] <=> $a['value'] : $a['value'] <=> $b['value']);

        $data = [
            'items' => array_map(fn ($it) => ['id' => $it['id'], 'label' => $it['label']], $list),
            'direction' => $direction,
            'first_label' => $firstLabel ?? ($direction === 'desc' ? 'الأكبر' : 'الأصغر'),
            'last_label' => $lastLabel ?? ($direction === 'desc' ? 'الأصغر' : 'الأكبر'),
        ];

        $q = self::make($key, QuestionType::ORDER, $text, $data, [
            'order' => array_column($sorted, 'id'),
            'display' => implode('، ', array_column($sorted, 'label')),
        ], $hint, $explain, $difficulty);
        $q['validation_values'] = array_column($list, 'value', 'id');

        return $q;
    }

    /** @return array<string, mixed> */
    public static function placeValue(string $key, string $text, int $target, string $hint, string $explain, int $difficulty = 1): array
    {
        return self::make($key, QuestionType::PLACE_VALUE, $text, ['target' => $target], ['value' => $target, 'display' => sprintf('%d مئات و%d عشرات و%d آحاد', intdiv($target, 100), intdiv($target % 100, 10), $target % 10)], $hint, $explain, $difficulty);
    }

    /** @return array<string, mixed> */
    public static function clockSet(string $key, string $text, int $hour, int $minute, string $hint, string $explain, int $difficulty = 1): array
    {
        return self::make($key, QuestionType::CLOCK_SET, $text, ['minute_step' => 5], ['hour' => $hour, 'minute' => $minute, 'display' => sprintf('%d:%02d', $hour, $minute)], $hint, $explain, $difficulty);
    }

    /**
     * @param  list<array{0: int, 1: int}>  $given
     * @return array<string, mixed>
     */
    public static function symmetry(string $key, string $text, int $rows, int $cols, array $given, string $axis, string $hint, string $explain, int $difficulty = 2): array
    {
        $mirror = array_map(fn ($c) => $axis === 'horizontal' ? [$rows - 1 - $c[0], $c[1]] : [$c[0], $cols - 1 - $c[1]], $given);
        usort($mirror, fn ($a, $b) => $a <=> $b);

        return self::make($key, QuestionType::SYMMETRY, $text, ['rows' => $rows, 'cols' => $cols, 'axis' => $axis, 'given' => $given], ['cells' => $mirror, 'display' => 'انظر إلى الشكل المكتمل'], $hint, $explain, $difficulty);
    }

    /**
     * @param  array{0: int, 1: int}  $start
     * @param  array{0: int, 1: int}  $target
     * @param  list<array{0: int, 1: int}>  $obstacles
     * @return array<string, mixed>
     */
    public static function routeBuild(string $key, string $text, int $rows, int $cols, array $start, array $target, array $obstacles, string $hint, string $explain, int $difficulty = 2): array
    {
        return self::make($key, QuestionType::ROUTE_BUILD, $text, compact('rows', 'cols', 'start', 'target', 'obstacles'), ['display' => 'أي طريق يصل إلى الكنز دون المرور بالعوائق'], $hint, $explain, $difficulty);
    }

    /**
     * @param  array{0: int, 1: int}  $start
     * @param  list<string>  $moves
     * @return array<string, mixed>
     */
    public static function routeFollow(string $key, string $text, int $rows, int $cols, array $start, array $moves, string $hint, string $explain, int $difficulty = 1): array
    {
        $data = ['rows' => $rows, 'cols' => $cols, 'start' => $start, 'obstacles' => []];
        $end = AnswerChecker::walk($data, $moves);

        return self::make($key, QuestionType::ROUTE_FOLLOW, $text, $data, ['cell' => $end, 'moves' => $moves, 'display' => 'المربع المظلل'], $hint, $explain, $difficulty);
    }

    /**
     * @param  list<int>  $denominations
     * @return array<string, mixed>
     */
    public static function money(string $key, string $text, int $target, array $denominations, string $unit, string $hint, string $explain, int $difficulty = 1): array
    {
        return self::make($key, QuestionType::MONEY, $text, ['target' => $target, 'denominations' => $denominations, 'unit' => $unit], ['total' => $target, 'display' => $target.' '.$unit], $hint, $explain, $difficulty);
    }

    /** @return array<string, mixed> */
    public static function compare(string $key, string $text, string $left, int|float $leftValue, string $right, int|float $rightValue, string $hint, string $explain, int $difficulty = 1): array
    {
        $symbol = $leftValue < $rightValue ? '<' : ($leftValue > $rightValue ? '>' : '=');

        return self::make($key, QuestionType::COMPARE, $text, ['left' => $left, 'right' => $right], ['symbol' => $symbol, 'left_value' => $leftValue, 'right_value' => $rightValue, 'display' => "$left $symbol $right"], $hint, $explain, $difficulty);
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $answer
     * @return array<string, mixed>
     */
    private static function make(string $key, string $type, string $text, array $data, array $answer, string $hint, string $explain, int $difficulty): array
    {
        return [
            'key' => $key,
            'type' => $type,
            'text' => $text,
            'data' => array_filter($data, fn ($v) => $v !== null),
            'answer' => $answer,
            'hint' => $hint,
            'explanation' => $explain,
            'difficulty' => $difficulty,
        ];
    }
}

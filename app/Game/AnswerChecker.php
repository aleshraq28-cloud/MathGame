<?php

namespace App\Game;

use App\Models\Question;
use Illuminate\Validation\ValidationException;

/**
 * Verifies a submitted answer on the server. The browser never decides
 * correctness; it only sends what the student chose.
 */
final class AnswerChecker
{
    private const MAX_LIST = 40;

    /**
     * Returns a normalised copy of the submission (stored for history) and
     * whether it is correct. Throws a validation error for malformed input,
     * which does not count as a try.
     *
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    public function check(Question $question, array $submitted): array
    {
        $data = $question->question_data;
        $answer = $question->correct_answer;

        return match ($question->question_type) {
            QuestionType::CHOICE => $this->choice($data, $answer, $submitted),
            QuestionType::NUMBER => $this->number($answer, $submitted),
            QuestionType::MISSING => $this->missing($answer, $submitted),
            QuestionType::MATCH => $this->match($data, $answer, $submitted),
            QuestionType::ORDER => $this->order($data, $answer, $submitted),
            QuestionType::PLACE_VALUE => $this->placeValue($answer, $submitted),
            QuestionType::CLOCK_SET => $this->clock($answer, $submitted),
            QuestionType::SYMMETRY => $this->symmetry($data, $answer, $submitted),
            QuestionType::ROUTE_BUILD => $this->routeBuild($data, $submitted),
            QuestionType::ROUTE_FOLLOW => $this->routeFollow($data, $answer, $submitted),
            QuestionType::MONEY => $this->money($data, $answer, $submitted),
            QuestionType::COMPARE => $this->compare($answer, $submitted),
            default => throw $this->invalid(),
        };
    }

    /**
     * Simulates a list of compass moves on a grid. Returns the final cell, or
     * null when the path leaves the grid or hits an obstacle.
     *
     * @param  array<string, mixed>  $data
     * @param  list<string>  $moves
     * @return array{0: int, 1: int}|null
     */
    public static function walk(array $data, array $moves): ?array
    {
        [$row, $col] = $data['start'];
        $blocked = [];

        foreach ($data['obstacles'] ?? [] as [$r, $c]) {
            $blocked["$r:$c"] = true;
        }

        foreach ($moves as $move) {
            [$dr, $dc] = match ($move) {
                'N' => [-1, 0],
                'S' => [1, 0],
                'E' => [0, 1],
                'W' => [0, -1],
            };
            $row += $dr;
            $col += $dc;

            if ($row < 0 || $col < 0 || $row >= $data['rows'] || $col >= $data['cols'] || isset($blocked["$row:$col"])) {
                return null;
            }
        }

        return [$row, $col];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function choice(array $data, array $answer, array $submitted): array
    {
        $option = $submitted['option'] ?? null;
        $ids = array_column($data['options'], 'id');

        if (! is_string($option) || ! in_array($option, $ids, true)) {
            throw $this->invalid();
        }

        return ['normalized' => ['option' => $option], 'correct' => $option === $answer['option']];
    }

    /**
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function number(array $answer, array $submitted): array
    {
        $value = Digits::toNumber($submitted['value'] ?? null);

        if ($value === null) {
            throw $this->invalid('اكتب عدداً من فضلك.');
        }

        return ['normalized' => ['value' => $value], 'correct' => $this->same($value, $answer['value'])];
    }

    /**
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function missing(array $answer, array $submitted): array
    {
        $values = $submitted['values'] ?? null;
        $expected = $answer['values'];

        if (! is_array($values) || count($values) !== count($expected)) {
            throw $this->invalid('أكمل كل الفراغات من فضلك.');
        }

        $numbers = [];
        foreach (array_values($values) as $value) {
            $number = Digits::toNumber($value);
            if ($number === null) {
                throw $this->invalid('أكمل كل الفراغات بأعداد من فضلك.');
            }
            $numbers[] = $number;
        }

        $correct = true;
        foreach ($expected as $i => $value) {
            $correct = $correct && $this->same($numbers[$i], $value);
        }

        return ['normalized' => ['values' => $numbers], 'correct' => $correct];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function match(array $data, array $answer, array $submitted): array
    {
        $pairs = $submitted['pairs'] ?? null;
        $leftIds = array_column($data['left'], 'id');
        $rightIds = array_column($data['right'], 'id');

        if (! is_array($pairs) || count($pairs) !== count($leftIds)) {
            throw $this->invalid('صِل كل العناصر أولاً.');
        }

        $normalized = [];
        foreach ($leftIds as $leftId) {
            $rightId = $pairs[$leftId] ?? null;
            if (! is_string($rightId) || ! in_array($rightId, $rightIds, true)) {
                throw $this->invalid('صِل كل العناصر أولاً.');
            }
            $normalized[$leftId] = $rightId;
        }

        $correct = true;
        foreach ($answer['pairs'] as $leftId => $rightId) {
            $correct = $correct && ($normalized[$leftId] ?? null) === $rightId;
        }

        return ['normalized' => ['pairs' => $normalized], 'correct' => $correct];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function order(array $data, array $answer, array $submitted): array
    {
        $order = $submitted['order'] ?? null;
        $ids = array_column($data['items'], 'id');

        if (! is_array($order) || count($order) !== count($ids)) {
            throw $this->invalid();
        }

        $order = array_values($order);
        $sortedSubmitted = $order;
        $sortedIds = $ids;
        sort($sortedSubmitted);
        sort($sortedIds);

        if ($sortedSubmitted !== $sortedIds) {
            throw $this->invalid();
        }

        return ['normalized' => ['order' => $order], 'correct' => $order === $answer['order']];
    }

    /**
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function placeValue(array $answer, array $submitted): array
    {
        $parts = [];
        foreach (['hundreds', 'tens', 'ones'] as $place) {
            $value = $submitted[$place] ?? null;
            if (! is_int($value) || $value < 0 || $value > 20) {
                throw $this->invalid();
            }
            $parts[$place] = $value;
        }

        $total = $parts['hundreds'] * 100 + $parts['tens'] * 10 + $parts['ones'];

        return ['normalized' => $parts + ['total' => $total], 'correct' => $total === (int) $answer['value']];
    }

    /**
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function clock(array $answer, array $submitted): array
    {
        $hour = $submitted['hour'] ?? null;
        $minute = $submitted['minute'] ?? null;

        if (! is_int($hour) || ! is_int($minute) || $hour < 1 || $hour > 12 || $minute < 0 || $minute > 59) {
            throw $this->invalid();
        }

        return [
            'normalized' => ['hour' => $hour, 'minute' => $minute],
            'correct' => $hour === (int) $answer['hour'] && $minute === (int) $answer['minute'],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function symmetry(array $data, array $answer, array $submitted): array
    {
        $cells = $this->cells($submitted['cells'] ?? null, $data['rows'], $data['cols']);

        $key = fn (array $cell): string => $cell[0].':'.$cell[1];
        $submittedKeys = array_unique(array_map($key, $cells));
        $expectedKeys = array_map($key, $answer['cells']);
        sort($submittedKeys);
        sort($expectedKeys);

        return ['normalized' => ['cells' => $cells], 'correct' => $submittedKeys === $expectedKeys];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function routeBuild(array $data, array $submitted): array
    {
        $moves = $submitted['moves'] ?? null;

        if (! is_array($moves) || $moves === [] || count($moves) > self::MAX_LIST) {
            throw $this->invalid('ارسم الطريق أولاً.');
        }

        foreach ($moves as $move) {
            if (! in_array($move, ['N', 'S', 'E', 'W'], true)) {
                throw $this->invalid();
            }
        }

        $moves = array_values($moves);
        $end = self::walk($data, $moves);

        return ['normalized' => ['moves' => $moves], 'correct' => $end !== null && $end === $data['target']];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function routeFollow(array $data, array $answer, array $submitted): array
    {
        $cells = $this->cells([$submitted['cell'] ?? null], $data['rows'], $data['cols']);

        return ['normalized' => ['cell' => $cells[0]], 'correct' => $cells[0] === $answer['cell']];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function money(array $data, array $answer, array $submitted): array
    {
        $coins = $submitted['coins'] ?? null;

        if (! is_array($coins) || $coins === [] || count($coins) > self::MAX_LIST) {
            throw $this->invalid('اختر بعض النقود أولاً.');
        }

        foreach ($coins as $coin) {
            if (! is_int($coin) || ! in_array($coin, $data['denominations'], true)) {
                throw $this->invalid();
            }
        }

        $total = array_sum($coins);

        return ['normalized' => ['coins' => array_values($coins), 'total' => $total], 'correct' => $total === (int) $answer['total']];
    }

    /**
     * @param  array<string, mixed>  $answer
     * @param  array<string, mixed>  $submitted
     * @return array{normalized: array<string, mixed>, correct: bool}
     */
    private function compare(array $answer, array $submitted): array
    {
        $symbol = $submitted['symbol'] ?? null;

        if (! in_array($symbol, ['<', '>', '='], true)) {
            throw $this->invalid();
        }

        return ['normalized' => ['symbol' => $symbol], 'correct' => $symbol === $answer['symbol']];
    }

    /**
     * @return list<array{0: int, 1: int}>
     */
    private function cells(mixed $cells, int $rows, int $cols): array
    {
        if (! is_array($cells) || count($cells) > $rows * $cols) {
            throw $this->invalid();
        }

        $result = [];
        foreach ($cells as $cell) {
            if (! is_array($cell) || count($cell) !== 2) {
                throw $this->invalid('اختر مربعاً أولاً.');
            }
            [$r, $c] = array_values($cell);
            if (! is_int($r) || ! is_int($c) || $r < 0 || $c < 0 || $r >= $rows || $c >= $cols) {
                throw $this->invalid();
            }
            $result[] = [$r, $c];
        }

        return $result;
    }

    private function same(float $a, mixed $b): bool
    {
        return abs($a - (float) $b) < 0.0001;
    }

    private function invalid(string $message = 'الإجابة غير مكتملة، حاول مرة أخرى.'): ValidationException
    {
        return ValidationException::withMessages(['answer' => $message]);
    }
}

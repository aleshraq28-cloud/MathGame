<?php

namespace App\Game;

use InvalidArgumentException;

/**
 * Checks that a seeded question definition is structurally valid and that
 * its stored answer is mathematically consistent with its data. Used by the
 * content seeder and by the test suite.
 */
final class QuestionDefinitionValidator
{
    /**
     * @param  array<string, mixed>  $q
     * @return list<string> Problems found (empty when valid).
     */
    public function errors(array $q): array
    {
        $errors = [];
        $type = $q['type'] ?? null;
        $data = $q['data'] ?? [];
        $answer = $q['answer'] ?? [];

        foreach (['key', 'text', 'hint', 'explanation'] as $field) {
            if (! is_string($q[$field] ?? null) || trim($q[$field]) === '') {
                $errors[] = "missing $field";
            }
        }

        if (! in_array($type, QuestionType::all(), true)) {
            return [...$errors, "unknown type $type"];
        }

        if (! is_string($answer['display'] ?? null) || $answer['display'] === '') {
            $errors[] = 'answer.display is required';
        }

        $check = function (bool $ok, string $message) use (&$errors): void {
            if (! $ok) {
                $errors[] = $message;
            }
        };

        switch ($type) {
            case QuestionType::CHOICE:
                $ids = array_column($data['options'] ?? [], 'id');
                $check(count($ids) >= 2 && count($ids) === count(array_unique($ids)), 'choice needs 2+ unique options');
                $check(in_array($answer['option'] ?? null, $ids, true), 'choice answer must be an option');
                $labels = array_map(fn ($o) => ($o['label'] ?? '').json_encode($o['visual'] ?? null), $data['options'] ?? []);
                $check(count($labels) === count(array_unique($labels)), 'choice options must be distinct');
                break;

            case QuestionType::NUMBER:
                $check(is_int($answer['value'] ?? null) || is_float($answer['value'] ?? null), 'number answer must be numeric');
                break;

            case QuestionType::MISSING:
                $this->validateMissing($data, $answer, $check);
                break;

            case QuestionType::MATCH:
                $left = array_column($data['left'] ?? [], 'id');
                $right = array_column($data['right'] ?? [], 'id');
                $pairs = $answer['pairs'] ?? [];
                $check(count($left) >= 2 && count($left) === count($pairs), 'match needs a pair for every left item');
                foreach ($pairs as $l => $r) {
                    $check(in_array($l, $left, true) && in_array($r, $right, true), "bad match pair $l");
                }
                if (empty($data['many_to_one'])) {
                    $check(count(array_unique($pairs)) === count($pairs), 'one-to-one match must not reuse targets');
                }
                break;

            case QuestionType::ORDER:
                $items = $data['items'] ?? [];
                $ids = array_column($items, 'id');
                $order = $answer['order'] ?? [];
                $sortedOrder = $order;
                sort($sortedOrder);
                sort($ids);
                $check($sortedOrder === $ids, 'order answer must be a permutation of items');
                $values = $q['validation_values'] ?? array_column($items, 'value', 'id');
                if (count($values) === count($items)) {
                    $sequence = array_map(fn ($id) => $values[$id], $order);
                    $expected = $sequence;
                    ($data['direction'] ?? 'asc') === 'desc' ? rsort($expected) : sort($expected);
                    $check($sequence === $expected && count(array_unique($sequence)) === count($sequence), 'order answer is not correctly sorted');
                }
                break;

            case QuestionType::PLACE_VALUE:
                $check(($data['target'] ?? null) === ($answer['value'] ?? false) && $answer['value'] >= 0 && $answer['value'] <= 999, 'place value target mismatch');
                break;

            case QuestionType::CLOCK_SET:
                $check(in_array($answer['hour'] ?? 0, range(1, 12), true) && in_array($answer['minute'] ?? -1, range(0, 55, 5), true), 'clock answer out of range');
                break;

            case QuestionType::SYMMETRY:
                $expected = $this->mirror($data);
                $check($expected === $this->sortCells($answer['cells'] ?? []), 'symmetry answer must mirror the given cells');
                $check(array_intersect(array_map('json_encode', $expected), array_map('json_encode', $data['given'] ?? [])) === [], 'symmetry given cells must not touch the mirror line');
                break;

            case QuestionType::ROUTE_BUILD:
                $check($this->reachable($data), 'route target must be reachable');
                $check(! isset($answer['cell']), 'route_build must not store a fixed cell');
                break;

            case QuestionType::ROUTE_FOLLOW:
                $end = AnswerChecker::walk($data, $answer['moves'] ?? []);
                $check($end !== null && $end === ($answer['cell'] ?? null), 'route_follow answer must equal the walked path');
                $check(! isset($data['target']) && ! isset($data['moves']), 'route_follow must not expose the target');
                break;

            case QuestionType::MONEY:
                $check($this->composable((int) ($answer['total'] ?? 0), $data['denominations'] ?? []), 'money total is not composable');
                $check(($data['target'] ?? null) === ($answer['total'] ?? false), 'money target mismatch');
                break;

            case QuestionType::COMPARE:
                $l = $answer['left_value'] ?? null;
                $r = $answer['right_value'] ?? null;
                $check(! isset($data['left_value']) && ! isset($data['right_value']), 'compare must not expose values');
                $symbol = $l < $r ? '<' : ($l > $r ? '>' : '=');
                $check($l !== null && $r !== null && ($answer['symbol'] ?? null) === $symbol, 'compare symbol inconsistent with values');
                break;
        }

        return $errors;
    }

    /**
     * @param  array<string, mixed>  $q
     */
    public function assertValid(array $q): void
    {
        $errors = $this->errors($q);

        if ($errors !== []) {
            throw new InvalidArgumentException(sprintf('Question "%s": %s', $q['key'] ?? '?', implode('; ', $errors)));
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $answer
     */
    private function validateMissing(array $data, array $answer, callable $check): void
    {
        $values = $answer['values'] ?? [];

        if (($data['layout'] ?? null) === 'wall') {
            $rows = $data['rows'];
            $filled = [];
            $i = 0;
            foreach ($rows as $r => $row) {
                foreach ($row as $c => $cell) {
                    $filled[$r][$c] = $cell ?? ($values[$i++] ?? null);
                }
            }
            $check($i === count($values), 'wall blanks/answers count mismatch');
            for ($r = 0; $r < count($rows) - 1; $r++) {
                foreach ($filled[$r] as $c => $cell) {
                    $check($cell === $filled[$r + 1][$c] + $filled[$r + 1][$c + 1], "wall cell $r:$c is not the sum below it");
                }
            }

            return;
        }

        $tokens = $data['tokens'] ?? [];
        $blanks = count(array_filter($tokens, fn ($t) => $t === null));
        $check($blanks > 0 && $blanks === count($values), 'missing blanks/answers count mismatch');

        $i = 0;
        $filled = [];
        foreach ($tokens as $token) {
            $filled[] = $token ?? $values[$i++] ?? null;
        }

        if (($data['layout'] ?? null) === 'sequence') {
            $steps = [];
            for ($k = 1; $k < count($filled); $k++) {
                $steps[] = $filled[$k] - $filled[$k - 1];
            }
            $check(count(array_unique($steps)) === 1, 'sequence answer must keep a constant step');

            return;
        }

        $check($this->equationHolds($filled), 'equation does not hold with the answer');
    }

    /**
     * Evaluates "a op b op c = d" style token lists (left to right, no precedence).
     *
     * @param  list<int|float|string|null>  $tokens
     */
    private function equationHolds(array $tokens): bool
    {
        $eq = array_search('=', $tokens, true);
        if ($eq === false) {
            return false;
        }

        $evaluate = function (array $side): ?float {
            $total = (float) array_shift($side);
            while ($side !== []) {
                $op = array_shift($side);
                $n = (float) array_shift($side);
                $total = match ($op) {
                    '+' => $total + $n,
                    '-' => $total - $n,
                    '×' => $total * $n,
                    '÷' => $n == 0 ? NAN : $total / $n,
                    default => NAN,
                };
            }

            return is_nan($total) ? null : $total;
        };

        $left = $evaluate(array_slice($tokens, 0, $eq));
        $right = $evaluate(array_slice($tokens, $eq + 1));

        return $left !== null && $right !== null && abs($left - $right) < 0.0001;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<array{0: int, 1: int}>
     */
    private function mirror(array $data): array
    {
        $cells = array_map(function ($cell) use ($data) {
            [$r, $c] = $cell;

            return $data['axis'] === 'horizontal'
                ? [$data['rows'] - 1 - $r, $c]
                : [$r, $data['cols'] - 1 - $c];
        }, $data['given'] ?? []);

        return $this->sortCells($cells);
    }

    /**
     * @param  list<array{0: int, 1: int}>  $cells
     * @return list<array{0: int, 1: int}>
     */
    private function sortCells(array $cells): array
    {
        usort($cells, fn ($a, $b) => [$a[0], $a[1]] <=> [$b[0], $b[1]]);

        return $cells;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function reachable(array $data): bool
    {
        $blocked = [];
        foreach ($data['obstacles'] ?? [] as [$r, $c]) {
            $blocked["$r:$c"] = true;
        }

        $queue = [$data['start']];
        $seen = [implode(':', $data['start']) => true];

        while ($queue !== []) {
            [$r, $c] = array_shift($queue);
            if ([$r, $c] === $data['target']) {
                return true;
            }
            foreach ([[-1, 0], [1, 0], [0, 1], [0, -1]] as [$dr, $dc]) {
                $nr = $r + $dr;
                $nc = $c + $dc;
                $k = "$nr:$nc";
                if ($nr >= 0 && $nc >= 0 && $nr < $data['rows'] && $nc < $data['cols'] && ! isset($blocked[$k]) && ! isset($seen[$k])) {
                    $seen[$k] = true;
                    $queue[] = [$nr, $nc];
                }
            }
        }

        return false;
    }

    /**
     * @param  list<int>  $denominations
     */
    private function composable(int $total, array $denominations): bool
    {
        $possible = [0 => true];
        for ($t = 1; $t <= $total; $t++) {
            foreach ($denominations as $d) {
                if ($t - $d >= 0 && isset($possible[$t - $d])) {
                    $possible[$t] = true;
                    break;
                }
            }
        }

        return isset($possible[$total]);
    }
}

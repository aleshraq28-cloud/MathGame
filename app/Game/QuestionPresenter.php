<?php

namespace App\Game;

use App\Models\Question;
use Random\Engine\Mt19937;
use Random\Randomizer;

/**
 * Builds the browser-safe version of a question. Only question_data is sent;
 * correct_answer, hint and explanation stay on the server until needed.
 */
final class QuestionPresenter
{
    /**
     * @return array<string, mixed>
     */
    public function present(Question $question, int $seed): array
    {
        $data = $question->question_data;
        $randomizer = new Randomizer(new Mt19937($seed * 7919 + $question->id));

        if ($question->question_type === QuestionType::CHOICE && empty($data['keep_order'])) {
            $data['options'] = $randomizer->shuffleArray($data['options']);
        }

        if ($question->question_type === QuestionType::MATCH) {
            $data['right'] = $randomizer->shuffleArray($data['right']);
        }

        if ($question->question_type === QuestionType::ORDER) {
            $data['items'] = $randomizer->shuffleArray($data['items']);
        }

        return [
            'id' => $question->id,
            'type' => $question->question_type,
            'text' => $question->question_text,
            'data' => $data,
            'difficulty' => $question->difficulty,
            'objective' => $question->objective,
            'points' => $question->points,
            'has_hint' => filled($question->hint),
        ];
    }

    /**
     * Seeded Fisher–Yates selection so an attempt's question set is
     * reproducible from its seed.
     *
     * @template T
     *
     * @param  list<T>  $items
     * @return list<T>
     */
    public static function shuffle(array $items, int $seed): array
    {
        return (new Randomizer(new Mt19937($seed)))->shuffleArray($items);
    }
}

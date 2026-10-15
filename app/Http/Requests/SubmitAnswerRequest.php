<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the envelope of an answer. The shape of `answer` depends on the
 * question type and is validated by App\Game\AnswerChecker.
 */
class SubmitAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'question_id' => ['required', 'integer', 'min:1'],
            'answer' => ['required', 'array', 'max:12'],
        ];
    }
}

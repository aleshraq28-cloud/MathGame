<?php

namespace App\Http\Requests;

use App\Game\QuestionDefinitionValidator;
use App\Game\QuestionType;
use App\Models\GameStage;
use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTeacherQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        foreach (['question_data', 'correct_answer'] as $field) {
            $value = $this->input($field);

            if (is_string($value)) {
                $decoded = json_decode($value, true);
                $this->merge([$field => is_array($decoded) ? $decoded : $value]);
            }
        }

        if ($this->filled('key')) {
            $key = strtolower(trim((string) preg_replace('/[^a-zA-Z0-9\-_]+/', '-', (string) $this->input('key')), '-'));
            $this->merge(['key' => $key]);
        }

        $this->merge([
            'is_active' => $this->boolean('is_active', true),
            'points' => (int) $this->input('points', 10),
            'difficulty' => (int) $this->input('difficulty', 1),
            'sort_order' => (int) $this->input('sort_order', 1),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var GameStage $stage */
        $stage = $this->route('stage');
        /** @var Question|null $question */
        $question = $this->route('question');

        return [
            'key' => [
                'required',
                'string',
                'max:80',
                'regex:/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/',
                Rule::unique('questions', 'key')
                    ->where(fn ($query) => $query->where('game_stage_id', $stage->id))
                    ->ignore($question?->id),
            ],
            'question_text' => ['required', 'string', 'max:2000'],
            'question_type' => ['required', 'string', Rule::in(QuestionType::all())],
            'question_data' => ['required', 'array'],
            'correct_answer' => ['required', 'array'],
            'hint' => ['required', 'string', 'max:1000'],
            'explanation' => ['required', 'string', 'max:2000'],
            'objective' => ['nullable', 'string', 'max:80'],
            'difficulty' => ['required', 'integer', 'min:1', 'max:5'],
            'points' => ['required', 'integer', 'min:1', 'max:50'],
            'sort_order' => ['required', 'integer', 'min:1', 'max:500'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'key.unique' => 'يوجد سؤال بهذا المعرّف في المرحلة.',
            'key.regex' => 'المعرّف يجب أن يكون بالإنجليزية الصغيرة مع شرطات فقط.',
            'question_text.required' => 'اكتبي نص السؤال.',
            'question_type.in' => 'نوع السؤال غير معروف.',
            'hint.required' => 'اكتبي تلميحاً للطالب.',
            'explanation.required' => 'اكتبي شرحاً للإجابة.',
            'question_data.required' => 'بيانات السؤال مطلوبة.',
            'correct_answer.required' => 'الإجابة الصحيحة مطلوبة.',
            'question_data.array' => 'بيانات السؤال يجب أن تكون بصيغة JSON صحيحة.',
            'correct_answer.array' => 'الإجابة يجب أن تكون بصيغة JSON صحيحة.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            /** @var GameStage $stage */
            $stage = $this->route('stage');

            $definition = [
                'key' => $this->input('key'),
                'type' => $this->input('question_type'),
                'text' => $this->input('question_text'),
                'data' => $this->input('question_data'),
                'answer' => $this->input('correct_answer'),
                'hint' => $this->input('hint'),
                'explanation' => $this->input('explanation'),
                'difficulty' => (int) $this->input('difficulty'),
                'objective' => $this->input('objective') ?: $stage->topic,
            ];

            $errors = app(QuestionDefinitionValidator::class)->errors($definition);

            foreach ($errors as $error) {
                $validator->errors()->add('correct_answer', 'السؤال غير صالح: '.$error);
            }
        });
    }
}

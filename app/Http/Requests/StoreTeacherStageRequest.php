<?php

namespace App\Http\Requests;

use App\Models\GameStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherStageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('slug')) {
            $slug = strtolower(trim((string) preg_replace('/[^a-zA-Z0-9\-]+/', '-', (string) $this->input('slug')), '-'));
            $this->merge(['slug' => $slug]);
        }

        $this->merge([
            'is_final' => $this->boolean('is_final'),
            'is_active' => $this->boolean('is_active', true),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var GameStage|null $stage */
        $stage = $this->route('stage');

        return [
            'slug' => [
                'required',
                'string',
                'max:80',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('game_stages', 'slug')->ignore($stage?->id),
            ],
            'title' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:1000'],
            'world_number' => ['required', 'integer', 'min:1', 'max:20'],
            'stage_number' => [
                'required',
                'integer',
                'min:1',
                'max:200',
                Rule::unique('game_stages', 'stage_number')->ignore($stage?->id),
            ],
            'topic' => ['required', 'string', 'max:120'],
            'instructions' => ['required', 'string', 'max:2000'],
            'icon' => ['required', 'string', 'max:40'],
            'difficulty' => ['required', 'integer', 'min:1', 'max:5'],
            'questions_per_attempt' => ['required', 'integer', 'min:1', 'max:20'],
            'sort_order' => ['required', 'integer', 'min:1', 'max:5000'],
            'is_final' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.unique' => 'يوجد مرحلة بهذا المعرّف مسبقاً.',
            'slug.regex' => 'المعرّف يجب أن يكون بالإنجليزية الصغيرة مع شرطات فقط.',
            'stage_number.unique' => 'رقم المرحلة مستخدم مسبقاً.',
            'title.required' => 'اكتبي عنوان المرحلة.',
            'description.required' => 'اكتبي وصفاً قصيراً للمرحلة.',
            'instructions.required' => 'اكتبي تعليمات المرحلة.',
        ];
    }
}

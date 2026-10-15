<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');

        if (is_string($name)) {
            $this->merge(['name' => trim((string) preg_replace('/\s+/u', ' ', $name))]);
        }
    }

    /**
     * Letters from any language (Arabic, English...), combining marks such as
     * Arabic diacritics, spaces, hyphens, apostrophes and dots.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[\p{L}\p{M}][\p{L}\p{M}\s\'’.\-]*$/u',
                'regex:/\p{L}.*\p{L}/u',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'اكتب اسمك من فضلك.',
            'name.min' => 'الاسم قصير جداً، اكتب حرفين على الأقل.',
            'name.max' => 'الاسم طويل جداً، اكتب 100 حرف أو أقل.',
            'name.regex' => 'اكتب اسمك بالحروف فقط (عربية أو إنجليزية).',
            'name.string' => 'اكتب اسمك من فضلك.',
        ];
    }
}

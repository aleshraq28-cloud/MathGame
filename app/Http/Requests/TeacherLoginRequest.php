<?php

namespace App\Http\Requests;

use App\Game\TeacherCredentials;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class TeacherLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');
        $code = $this->input('code');

        if (is_string($name)) {
            $this->merge(['name' => trim((string) preg_replace('/\s+/u', ' ', $name))]);
        }

        if (is_string($code)) {
            $this->merge(['code' => preg_replace('/\s+/u', '', $code) ?? $code]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'code' => ['required', 'string', 'min:4', 'max:32'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'اكتبي اسم المعلمة من فضلك.',
            'code.required' => 'اكتبي الرمز السري من فضلك.',
            'code.min' => 'الرمز السري غير صحيح.',
            'code.max' => 'الرمز السري غير صحيح.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $name = (string) $this->input('name');
            $code = (string) $this->input('code');

            if (! TeacherCredentials::isTeacherName($name) || ! TeacherCredentials::codeMatches($code)) {
                $validator->errors()->add('code', 'الاسم أو الرمز السري غير صحيح.');
            }
        });
    }
}

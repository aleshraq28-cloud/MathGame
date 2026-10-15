<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Only the active student's own id and name are ever shared.
     * Teacher session is separate and never mixed into student props.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $student = EnsureStudentSession::resolve($request);
        $teacherName = EnsureTeacherSession::name($request);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'student' => $student ? ['id' => $student->id, 'name' => $student->name] : null,
            'teacher' => $teacherName ? ['name' => $teacherName] : null,
            'teacher_name' => (string) config('teacher.name'),
            'flash' => [
                'notice' => fn () => $request->session()->get('notice'),
            ],
        ];
    }
}

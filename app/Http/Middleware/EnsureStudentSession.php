<?php

namespace App\Http\Middleware;

use App\Models\Student;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the active student from the Laravel session. The student id is
 * never accepted from request input.
 */
class EnsureStudentSession
{
    public const SESSION_KEY = 'student_id';

    public function handle(Request $request, Closure $next): Response
    {
        $student = self::resolve($request);

        if ($student === null) {
            $request->session()->forget(self::SESSION_KEY);

            if ($request->expectsJson() && ! $request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'انتهت الجلسة. اكتب اسمك من جديد لمتابعة المغامرة.',
                    'session_expired' => true,
                ], 401);
            }

            return redirect()->route('welcome')
                ->with('notice', 'مرحباً! اكتب اسمك لتبدأ المغامرة.');
        }

        $request->attributes->set('student', $student);

        return $next($request);
    }

    public static function resolve(Request $request): ?Student
    {
        if ($request->attributes->has('student')) {
            return $request->attributes->get('student');
        }

        $id = $request->session()->get(self::SESSION_KEY);

        if (! is_int($id) && ! ctype_digit((string) $id)) {
            return null;
        }

        $student = Student::query()->find((int) $id);
        $request->attributes->set('student', $student);

        return $student;
    }
}

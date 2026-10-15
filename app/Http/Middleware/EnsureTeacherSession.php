<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Protects the teacher area. The teacher flag lives only in the session;
 * it is never accepted from request input.
 */
class EnsureTeacherSession
{
    public const SESSION_KEY = 'teacher_authenticated';

    public const NAME_KEY = 'teacher_name';

    public function handle(Request $request, Closure $next): Response
    {
        if (! self::check($request)) {
            $request->session()->forget([self::SESSION_KEY, self::NAME_KEY]);

            return redirect()->route('welcome')
                ->with('notice', 'ادخلي باسم المعلمة والرمز السري للوصول إلى لوحة التحكم.');
        }

        return $next($request);
    }

    public static function check(Request $request): bool
    {
        return (bool) $request->session()->get(self::SESSION_KEY);
    }

    public static function name(Request $request): ?string
    {
        if (! self::check($request)) {
            return null;
        }

        $name = $request->session()->get(self::NAME_KEY);

        return is_string($name) && $name !== '' ? $name : config('teacher.name');
    }
}

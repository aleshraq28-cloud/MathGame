<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureStudentSession;
use App\Http\Middleware\EnsureTeacherSession;
use App\Http\Requests\TeacherLoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TeacherAuthController extends Controller
{
    public function login(TeacherLoginRequest $request): RedirectResponse
    {
        $request->session()->forget(EnsureStudentSession::SESSION_KEY);
        $request->session()->regenerate();
        $request->session()->put(EnsureTeacherSession::SESSION_KEY, true);
        $request->session()->put(EnsureTeacherSession::NAME_KEY, $request->validated('name'));

        return redirect()->route('teacher.dashboard')
            ->with('notice', 'مرحباً '.config('teacher.name').'! لوحة المعلمة جاهزة.');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget([
            EnsureTeacherSession::SESSION_KEY,
            EnsureTeacherSession::NAME_KEY,
        ]);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('welcome')
            ->with('notice', 'تم تسجيل الخروج من حساب المعلمة.');
    }
}

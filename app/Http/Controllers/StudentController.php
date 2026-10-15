<?php

namespace App\Http\Controllers;

use App\Game\TeacherCredentials;
use App\Http\Middleware\EnsureStudentSession;
use App\Http\Middleware\EnsureTeacherSession;
use App\Http\Requests\StoreStudentRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function home(Request $request): RedirectResponse
    {
        if (EnsureTeacherSession::check($request)) {
            return redirect()->route('teacher.dashboard');
        }

        return EnsureStudentSession::resolve($request)
            ? redirect()->route('game.map')
            : redirect()->route('welcome');
    }

    public function welcome(Request $request): Response|RedirectResponse
    {
        if (EnsureTeacherSession::check($request)) {
            return redirect()->route('teacher.dashboard');
        }

        if (EnsureStudentSession::resolve($request)) {
            return redirect()->route('game.map');
        }

        return Inertia::render('welcome');
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        if (EnsureStudentSession::resolve($request)) {
            return redirect()->route('game.map');
        }

        $name = $request->validated('name');

        if (TeacherCredentials::isTeacherName($name)) {
            return redirect()->route('welcome')
                ->withInput(['name' => $name])
                ->withErrors(['code' => 'اكتبي الرمز السري لحساب المعلمة.']);
        }

        // Each name is one account: returning students continue where they left off.
        $student = Student::query()->firstOrCreate(
            ['name' => $name],
            ['last_played_at' => Carbon::now()],
        );

        $student->forceFill(['last_played_at' => Carbon::now()])->save();

        $request->session()->forget([
            EnsureTeacherSession::SESSION_KEY,
            EnsureTeacherSession::NAME_KEY,
        ]);
        $request->session()->regenerate();
        $request->session()->put(EnsureStudentSession::SESSION_KEY, $student->id);

        return redirect()->route('game.map');
    }

    public function switch(Request $request): RedirectResponse
    {
        $request->session()->forget(EnsureStudentSession::SESSION_KEY);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('welcome');
    }
}

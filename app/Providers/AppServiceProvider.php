<?php

namespace App\Providers;

use App\Http\Middleware\EnsureStudentSession;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(app()->isProduction());

        RateLimiter::for('student-entry', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));

        RateLimiter::for('teacher-login', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));

        RateLimiter::for('game', fn (Request $request) => Limit::perMinute(180)->by(
            $request->session()->get(EnsureStudentSession::SESSION_KEY) ?: $request->ip()
        ));
    }
}

<?php

namespace App\Http\Controllers\Teacher;

use App\Game\TeacherDashboardService;
use App\Game\Worlds;
use App\Http\Controllers\Controller;
use App\Models\GameStage;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class TeacherDashboardController extends Controller
{
    public function __construct(private TeacherDashboardService $dashboard) {}

    public function index(): Response
    {
        return Inertia::render('teacher/dashboard', [
            'overview' => $this->dashboard->overview(),
            'stages_count' => GameStage::query()->count(),
            'active_stages' => GameStage::query()->where('is_active', true)->count(),
            'worlds' => Worlds::all(),
        ]);
    }

    public function players(): Response
    {
        return Inertia::render('teacher/players', [
            'players' => $this->dashboard->players(),
            'overview' => $this->dashboard->overview(),
        ]);
    }

    public function player(Student $student): Response
    {
        return Inertia::render('teacher/player', $this->dashboard->playerDetail($student));
    }
}

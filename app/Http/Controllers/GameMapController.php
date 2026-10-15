<?php

namespace App\Http\Controllers;

use App\Game\ProgressService;
use App\Game\Worlds;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GameMapController extends Controller
{
    public function __invoke(Request $request, ProgressService $progress): Response
    {
        $student = $this->student($request);

        return Inertia::render('game/map', [
            'stages' => $progress->mapStages($student),
            'worlds' => Worlds::all(),
            'summary' => $progress->summary($student),
        ]);
    }
}

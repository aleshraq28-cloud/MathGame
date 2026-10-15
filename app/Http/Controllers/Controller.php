<?php

namespace App\Http\Controllers;

use App\Models\GameAttempt;
use App\Models\Student;
use Illuminate\Http\Request;

abstract class Controller
{
    protected function student(Request $request): Student
    {
        return $request->attributes->get('student');
    }

    /**
     * Attempts belonging to other students are reported as missing so their
     * existence is not revealed.
     */
    protected function ownAttempt(Request $request, GameAttempt $attempt): GameAttempt
    {
        abort_unless($attempt->student_id === $this->student($request)->id, 404);

        return $attempt;
    }
}

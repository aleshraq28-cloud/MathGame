<?php

use App\Http\Controllers\AttemptController;
use App\Http\Controllers\GameMapController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\StageController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\Teacher\TeacherAuthController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use App\Http\Controllers\Teacher\TeacherQuestionController;
use App\Http\Controllers\Teacher\TeacherStageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [StudentController::class, 'home'])->name('home');
Route::get('/welcome', [StudentController::class, 'welcome'])->name('welcome');
Route::post('/students', [StudentController::class, 'store'])
    ->middleware('throttle:student-entry')
    ->name('students.store');
Route::post('/students/switch', [StudentController::class, 'switch'])->name('students.switch');

Route::post('/teacher/login', [TeacherAuthController::class, 'login'])
    ->middleware('throttle:teacher-login')
    ->name('teacher.login');

Route::middleware(['student', 'throttle:game'])->prefix('game')->name('game.')->group(function () {
    Route::get('/map', GameMapController::class)->name('map');
    Route::get('/progress', [ProgressController::class, 'progress'])->name('progress');
    Route::get('/achievements', [ProgressController::class, 'achievements'])->name('achievements');

    Route::get('/stages/{stage}', [StageController::class, 'show'])->name('stages.show');
    Route::post('/stages/{stage}/start', [StageController::class, 'start'])->name('stages.start');

    Route::get('/attempts/{attempt}', [AttemptController::class, 'play'])->name('attempts.play');
    Route::post('/attempts/{attempt}/answer', [AttemptController::class, 'answer'])->name('attempts.answer');
    Route::post('/attempts/{attempt}/questions/{question}/hint', [AttemptController::class, 'hint'])
        ->whereNumber('question')
        ->name('attempts.hint');
    Route::post('/attempts/{attempt}/complete', [AttemptController::class, 'complete'])->name('attempts.complete');
    Route::get('/attempts/{attempt}/results', [AttemptController::class, 'results'])->name('attempts.results');
});

Route::middleware('teacher')->prefix('teacher')->name('teacher.')->group(function () {
    Route::post('/logout', [TeacherAuthController::class, 'logout'])->name('logout');

    Route::get('/', [TeacherDashboardController::class, 'index'])->name('dashboard');
    Route::get('/players', [TeacherDashboardController::class, 'players'])->name('players');
    Route::get('/players/{student}', [TeacherDashboardController::class, 'player'])->name('players.show');

    Route::get('/stages', [TeacherStageController::class, 'index'])->name('stages.index');
    Route::get('/stages/create', [TeacherStageController::class, 'create'])->name('stages.create');
    Route::post('/stages', [TeacherStageController::class, 'store'])->name('stages.store');
    Route::get('/stages/{stage}/edit', [TeacherStageController::class, 'edit'])->name('stages.edit');
    Route::put('/stages/{stage}', [TeacherStageController::class, 'update'])->name('stages.update');
    Route::delete('/stages/{stage}', [TeacherStageController::class, 'destroy'])->name('stages.destroy');

    Route::get('/stages/{stage}/questions', [TeacherQuestionController::class, 'index'])->name('stages.questions.index');
    Route::get('/stages/{stage}/questions/create', [TeacherQuestionController::class, 'create'])->name('stages.questions.create');
    Route::post('/stages/{stage}/questions', [TeacherQuestionController::class, 'store'])->name('stages.questions.store');
    Route::get('/stages/{stage}/questions/{question}/edit', [TeacherQuestionController::class, 'edit'])->name('stages.questions.edit');
    Route::put('/stages/{stage}/questions/{question}', [TeacherQuestionController::class, 'update'])->name('stages.questions.update');
    Route::delete('/stages/{stage}/questions/{question}', [TeacherQuestionController::class, 'destroy'])->name('stages.questions.destroy');
});

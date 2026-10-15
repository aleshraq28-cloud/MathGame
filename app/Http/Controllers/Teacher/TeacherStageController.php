<?php

namespace App\Http\Controllers\Teacher;

use App\Game\Worlds;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherStageRequest;
use App\Models\GameStage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeacherStageController extends Controller
{
    /** @var list<string> */
    public const ICONS = [
        'blocks', 'bridge', 'cards', 'store', 'scale', 'flower', 'gate',
        'shapes', 'box', 'mirror', 'compass', 'coins', 'clock', 'hourglass',
        'apple', 'ruler', 'mountain', 'treasure', 'target',
    ];

    public function index(): Response
    {
        $stages = GameStage::query()
            ->withCount(['questions as questions_count' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('sort_order')
            ->get()
            ->map(fn (GameStage $stage) => [
                ...$stage->only([
                    'id', 'slug', 'title', 'description', 'world_number', 'stage_number',
                    'topic', 'icon', 'difficulty', 'questions_per_attempt', 'is_final',
                    'sort_order', 'is_active', 'is_custom',
                ]),
                'questions_count' => $stage->questions_count,
            ]);

        return Inertia::render('teacher/stages/index', [
            'stages' => $stages,
            'worlds' => Worlds::all(),
        ]);
    }

    public function create(): Response
    {
        $nextNumber = ((int) GameStage::query()->max('stage_number')) + 1;
        $nextOrder = ((int) GameStage::query()->max('sort_order')) + 10;

        return Inertia::render('teacher/stages/form', [
            'stage' => null,
            'worlds' => Worlds::all(),
            'icons' => self::ICONS,
            'defaults' => [
                'world_number' => 1,
                'stage_number' => $nextNumber,
                'sort_order' => $nextOrder,
                'difficulty' => 1,
                'questions_per_attempt' => 8,
                'icon' => 'target',
                'is_final' => false,
                'is_active' => true,
            ],
        ]);
    }

    public function store(StoreTeacherStageRequest $request): RedirectResponse
    {
        $stage = GameStage::query()->create([
            ...$request->validated(),
            'is_custom' => true,
        ]);

        return redirect()
            ->route('teacher.stages.questions.index', $stage)
            ->with('notice', 'أُضيفت المرحلة. يمكنك الآن إضافة الأسئلة.');
    }

    public function edit(GameStage $stage): Response
    {
        return Inertia::render('teacher/stages/form', [
            'stage' => $stage->only([
                'id', 'slug', 'title', 'description', 'world_number', 'stage_number',
                'topic', 'instructions', 'icon', 'difficulty', 'questions_per_attempt',
                'is_final', 'sort_order', 'is_active', 'is_custom',
            ]),
            'worlds' => Worlds::all(),
            'icons' => self::ICONS,
            'defaults' => null,
        ]);
    }

    public function update(StoreTeacherStageRequest $request, GameStage $stage): RedirectResponse
    {
        $stage->update([
            ...$request->validated(),
            'is_custom' => true,
        ]);

        return redirect()
            ->route('teacher.stages.index')
            ->with('notice', 'تم حفظ تعديلات المرحلة.');
    }

    public function destroy(GameStage $stage): RedirectResponse
    {
        if (! $stage->is_custom) {
            $stage->update(['is_active' => false, 'is_custom' => true]);

            return redirect()
                ->route('teacher.stages.index')
                ->with('notice', 'أُخفيت المرحلة الأصلية عن اللعبة (يمكن إظهارها لاحقاً).');
        }

        $stage->delete();

        return redirect()
            ->route('teacher.stages.index')
            ->with('notice', 'حُذفت المرحلة.');
    }
}

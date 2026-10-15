<?php

namespace App\Http\Controllers\Teacher;

use App\Game\QuestionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherQuestionRequest;
use App\Models\GameStage;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeacherQuestionController extends Controller
{
    public function index(GameStage $stage): Response
    {
        $questions = $stage->questions()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Question $question) => [
                'id' => $question->id,
                'key' => $question->key,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'difficulty' => $question->difficulty,
                'points' => $question->points,
                'sort_order' => $question->sort_order,
                'is_active' => $question->is_active,
                'is_custom' => $question->is_custom,
                'answer_display' => $question->correct_answer['display'] ?? null,
            ]);

        return Inertia::render('teacher/questions/index', [
            'stage' => $stage->only(['id', 'slug', 'title', 'stage_number', 'topic', 'is_custom']),
            'questions' => $questions,
            'types' => QuestionType::all(),
        ]);
    }

    public function create(GameStage $stage): Response
    {
        $nextOrder = ((int) $stage->questions()->max('sort_order')) + 1;

        return Inertia::render('teacher/questions/form', [
            'stage' => $stage->only(['id', 'slug', 'title', 'stage_number', 'topic']),
            'question' => null,
            'types' => QuestionType::all(),
            'type_labels' => $this->typeLabels(),
            'defaults' => [
                'key' => 'q-'.$nextOrder,
                'question_type' => QuestionType::CHOICE,
                'question_data' => [
                    'options' => [
                        ['id' => 'a', 'label' => ''],
                        ['id' => 'b', 'label' => ''],
                        ['id' => 'c', 'label' => ''],
                        ['id' => 'd', 'label' => ''],
                    ],
                    'keep_order' => true,
                    'visual' => null,
                ],
                'correct_answer' => [
                    'option' => 'a',
                    'display' => '',
                ],
                'difficulty' => 1,
                'points' => 10,
                'sort_order' => $nextOrder,
                'objective' => $stage->topic,
                'is_active' => true,
            ],
        ]);
    }

    public function store(StoreTeacherQuestionRequest $request, GameStage $stage): RedirectResponse
    {
        $data = $request->validated();

        $stage->questions()->create([
            ...$data,
            'objective' => $data['objective'] ?: $stage->topic,
            'is_custom' => true,
        ]);

        return redirect()
            ->route('teacher.stages.questions.index', $stage)
            ->with('notice', 'أُضيف السؤال بنجاح.');
    }

    public function edit(GameStage $stage, Question $question): Response
    {
        abort_unless($question->game_stage_id === $stage->id, 404);

        // Teachers need to see answers; makeHidden is not enough for makeVisible.
        $question->makeVisible(['correct_answer', 'hint', 'explanation']);

        return Inertia::render('teacher/questions/form', [
            'stage' => $stage->only(['id', 'slug', 'title', 'stage_number', 'topic']),
            'question' => [
                'id' => $question->id,
                'key' => $question->key,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'question_data' => $question->question_data,
                'correct_answer' => $question->correct_answer,
                'hint' => $question->hint,
                'explanation' => $question->explanation,
                'objective' => $question->objective,
                'difficulty' => $question->difficulty,
                'points' => $question->points,
                'sort_order' => $question->sort_order,
                'is_active' => $question->is_active,
                'is_custom' => $question->is_custom,
            ],
            'types' => QuestionType::all(),
            'type_labels' => $this->typeLabels(),
            'defaults' => null,
        ]);
    }

    public function update(StoreTeacherQuestionRequest $request, GameStage $stage, Question $question): RedirectResponse
    {
        abort_unless($question->game_stage_id === $stage->id, 404);

        $data = $request->validated();

        $question->update([
            ...$data,
            'objective' => $data['objective'] ?: $stage->topic,
            'is_custom' => true,
        ]);

        return redirect()
            ->route('teacher.stages.questions.index', $stage)
            ->with('notice', 'تم حفظ تعديلات السؤال.');
    }

    public function destroy(GameStage $stage, Question $question): RedirectResponse
    {
        abort_unless($question->game_stage_id === $stage->id, 404);

        if (! $question->is_custom) {
            $question->update(['is_active' => false, 'is_custom' => true]);

            return redirect()
                ->route('teacher.stages.questions.index', $stage)
                ->with('notice', 'أُخفي السؤال الأصلي عن اللعبة.');
        }

        $question->delete();

        return redirect()
            ->route('teacher.stages.questions.index', $stage)
            ->with('notice', 'حُذف السؤال.');
    }

    /**
     * @return array<string, string>
     */
    private function typeLabels(): array
    {
        return [
            QuestionType::CHOICE => 'اختيار من متعدد',
            QuestionType::NUMBER => 'إدخال عدد',
            QuestionType::MISSING => 'إكمال الناقص',
            QuestionType::MATCH => 'مطابقة',
            QuestionType::ORDER => 'ترتيب',
            QuestionType::PLACE_VALUE => 'قيمة منزلية',
            QuestionType::CLOCK_SET => 'ضبط الساعة',
            QuestionType::SYMMETRY => 'تماثل',
            QuestionType::ROUTE_BUILD => 'رسم طريق',
            QuestionType::ROUTE_FOLLOW => 'اتباع طريق',
            QuestionType::MONEY => 'نقود',
            QuestionType::COMPARE => 'مقارنة',
        ];
    }
}

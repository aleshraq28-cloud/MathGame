<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureTeacherSession;
use App\Models\GameStage;
use App\Models\Question;
use App\Models\Student;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\PlaysGame;
use Tests\TestCase;

class TeacherAccessTest extends TestCase
{
    use PlaysGame;

    public function test_teacher_can_log_in_with_name_and_code(): void
    {
        $this->post(route('teacher.login'), [
            'name' => 'سالمة',
            'code' => '12230',
        ])->assertRedirect(route('teacher.dashboard'));

        $this->assertTrue(session(EnsureTeacherSession::SESSION_KEY));
        $this->assertSame('سالمة', session(EnsureTeacherSession::NAME_KEY));

        $this->get(route('teacher.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/dashboard')
                ->where('teacher.name', 'سالمة'));
    }

    public function test_wrong_code_is_rejected(): void
    {
        $this->from(route('welcome'))
            ->post(route('teacher.login'), [
                'name' => 'سالمة',
                'code' => '00000',
            ])
            ->assertRedirect(route('welcome'))
            ->assertSessionHasErrors('code');

        $this->assertNull(session(EnsureTeacherSession::SESSION_KEY));
    }

    public function test_teacher_name_cannot_create_a_student_without_the_code(): void
    {
        $this->from(route('welcome'))
            ->post(route('students.store'), ['name' => 'سالمة'])
            ->assertRedirect(route('welcome'))
            ->assertSessionHasErrors('code');

        $this->assertSame(0, Student::query()->count());
    }

    public function test_guest_cannot_open_teacher_pages(): void
    {
        $this->get(route('teacher.dashboard'))->assertRedirect(route('welcome'));
        $this->get(route('teacher.players'))->assertRedirect(route('welcome'));
        $this->get(route('teacher.stages.index'))->assertRedirect(route('welcome'));
    }

    public function test_teacher_can_view_players_and_create_a_stage_with_a_question(): void
    {
        $this->loginAsTeacher();

        $student = Student::factory()->create(['name' => 'جود']);
        $this->playAs($student);
        $this->completeStage($this->stage(1));

        $this->withSession([
            EnsureTeacherSession::SESSION_KEY => true,
            EnsureTeacherSession::NAME_KEY => 'سالمة',
        ]);

        $this->get(route('teacher.players'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/players')
                ->has('players', 1)
                ->where('players.0.name', 'جود')
                ->where('players.0.completed_stages', 1));

        $this->post(route('teacher.stages.store'), [
            'slug' => 'teacher-extra-stage',
            'title' => 'مرحلة المعلمة',
            'description' => 'مرحلة أضافتها المعلمة للتمرين.',
            'world_number' => 1,
            'stage_number' => 100,
            'topic' => 'تمرين إضافي',
            'instructions' => 'أجيبي عن الأسئلة.',
            'icon' => 'target',
            'difficulty' => 1,
            'questions_per_attempt' => 4,
            'sort_order' => 1000,
            'is_final' => '0',
            'is_active' => '1',
        ])->assertRedirect();

        $stage = GameStage::query()->where('slug', 'teacher-extra-stage')->sole();
        $this->assertTrue($stage->is_custom);

        $this->post(route('teacher.stages.questions.store', $stage), [
            'key' => 'extra-choice-1',
            'question_text' => 'كم يساوي 2 + 2؟',
            'question_type' => 'choice',
            'question_data' => [
                'options' => [
                    ['id' => 'a', 'label' => '3'],
                    ['id' => 'b', 'label' => '4'],
                    ['id' => 'c', 'label' => '5'],
                    ['id' => 'd', 'label' => '6'],
                ],
                'keep_order' => true,
                'visual' => null,
            ],
            'correct_answer' => [
                'option' => 'b',
                'display' => '4',
            ],
            'hint' => 'اجمعي إصبعين مع إصبعين.',
            'explanation' => '2 + 2 = 4.',
            'objective' => 'تمرين إضافي',
            'difficulty' => 1,
            'points' => 10,
            'sort_order' => 1,
            'is_active' => true,
        ])->assertRedirect(route('teacher.stages.questions.index', $stage));

        $question = Question::query()->where('key', 'extra-choice-1')->sole();
        $this->assertTrue($question->is_custom);
        $this->assertSame('b', $question->correct_answer['option']);
    }

    public function test_teacher_can_edit_an_existing_question_answer(): void
    {
        $this->loginAsTeacher();

        $stage = $this->stage(1);
        $question = $stage->questions()->where('question_type', 'number')->firstOrFail();

        $this->put(route('teacher.stages.questions.update', [$stage, $question]), [
            'key' => $question->key,
            'question_text' => $question->question_text,
            'question_type' => $question->question_type,
            'question_data' => $question->question_data,
            'correct_answer' => [
                'value' => 999,
                'display' => '999',
            ],
            'hint' => $question->hint,
            'explanation' => 'تعديل من المعلمة.',
            'objective' => $question->objective,
            'difficulty' => $question->difficulty,
            'points' => $question->points,
            'sort_order' => $question->sort_order,
            'is_active' => true,
        ])->assertRedirect(route('teacher.stages.questions.index', $stage));

        $question->refresh();
        $this->assertTrue($question->is_custom);
        $this->assertSame(999, $question->correct_answer['value']);
        $this->assertSame('تعديل من المعلمة.', $question->explanation);
    }

    public function test_teacher_login_is_rate_limited(): void
    {
        foreach (range(1, 5) as $_) {
            $this->post(route('teacher.login'), [
                'name' => 'سالمة',
                'code' => '00000',
            ])->assertSessionHasErrors('code');
        }

        $this->post(route('teacher.login'), [
            'name' => 'سالمة',
            'code' => '12230',
        ])->assertStatus(429);
    }

    private function loginAsTeacher(): void
    {
        $this->post(route('teacher.login'), [
            'name' => 'سالمة',
            'code' => '12230',
        ])->assertRedirect(route('teacher.dashboard'));
    }
}

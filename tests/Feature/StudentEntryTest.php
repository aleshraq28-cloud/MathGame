<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureStudentSession;
use App\Models\Student;
use App\Models\StudentStageProgress;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\PlaysGame;
use Tests\TestCase;

class StudentEntryTest extends TestCase
{
    use PlaysGame;

    public function test_guest_sees_the_name_entry_page(): void
    {
        $this->get('/')->assertRedirect(route('welcome'));

        $this->get(route('welcome'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('welcome')->where('student', null));
    }

    public function test_student_can_start_with_an_arabic_name(): void
    {
        $this->post(route('students.store'), ['name' => 'سارة'])->assertRedirect(route('game.map'));

        $student = Student::query()->sole();
        $this->assertSame('سارة', $student->name);
        $this->assertSame($student->id, session(EnsureStudentSession::SESSION_KEY));

        $this->get(route('game.map'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('game/map')->where('student.name', 'سارة'));
    }

    public function test_student_can_start_with_an_english_name_and_spaces_are_tidied(): void
    {
        $this->post(route('students.store'), ['name' => '  Omar   Al-Harthy '])->assertRedirect(route('game.map'));

        $this->assertSame('Omar Al-Harthy', Student::query()->sole()->name);
    }

    public function test_a_name_of_exactly_100_characters_is_accepted(): void
    {
        $this->post(route('students.store'), ['name' => str_repeat('م', 100)])->assertRedirect(route('game.map'));

        $this->assertSame(1, Student::query()->count());
    }

    /** @return array<string, array{0: string}> */
    public static function invalidNames(): array
    {
        return [
            'empty' => [''],
            'only spaces' => ['    '],
            'one letter' => ['a'],
            'too long' => [str_repeat('ب', 101)],
            'html' => ['<script>alert(1)</script>'],
            'digits only' => ['12345'],
            'emoji' => ['😀😀'],
        ];
    }

    #[DataProvider('invalidNames')]
    public function test_invalid_names_are_rejected(string $name): void
    {
        $this->from(route('welcome'))
            ->post(route('students.store'), ['name' => $name])
            ->assertRedirect(route('welcome'))
            ->assertSessionHasErrors('name');

        $this->assertSame(0, Student::query()->count());
        $this->assertNull(session(EnsureStudentSession::SESSION_KEY));
    }

    public function test_returning_with_the_same_name_resumes_the_same_account(): void
    {
        $this->post(route('students.store'), ['name' => 'Ali'])->assertRedirect(route('game.map'));
        $student = Student::query()->sole();
        $this->completeStage($this->stage(1));

        $this->post(route('students.switch'))->assertRedirect(route('welcome'));
        $this->assertNull(session(EnsureStudentSession::SESSION_KEY));

        $this->post(route('students.store'), ['name' => 'Ali'])->assertRedirect(route('game.map'));

        $this->assertSame(1, Student::query()->where('name', 'Ali')->count());
        $this->assertSame($student->id, session(EnsureStudentSession::SESSION_KEY));
        $this->assertDatabaseHas('student_stage_progress', [
            'student_id' => $student->id,
            'status' => StudentStageProgress::STATUS_COMPLETED,
        ]);

        $this->get(route('game.map'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/map')
                ->where('student.name', 'Ali')
                ->where('summary.completed_stages', 1));
    }

    public function test_student_names_are_unique_in_the_database(): void
    {
        Student::factory()->create(['name' => 'Layla']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        Student::factory()->create(['name' => 'Layla']);
    }

    public function test_switching_student_clears_the_session_but_keeps_saved_progress(): void
    {
        $this->post(route('students.store'), ['name' => 'Huda']);
        $student = Student::query()->sole();
        $this->completeStage($this->stage(1));

        $this->post(route('students.switch'))->assertRedirect(route('welcome'));

        $this->assertNull(session(EnsureStudentSession::SESSION_KEY));
        $this->get(route('game.map'))->assertRedirect(route('welcome'));
        $this->assertDatabaseHas('student_stage_progress', [
            'student_id' => $student->id,
            'status' => StudentStageProgress::STATUS_COMPLETED,
        ]);
    }

    public function test_name_entry_is_rate_limited(): void
    {
        foreach (range(1, 10) as $_) {
            $this->post(route('students.store'), ['name' => ''])->assertSessionHasErrors('name');
        }

        $this->post(route('students.store'), ['name' => 'Salim'])->assertStatus(429);
    }
}

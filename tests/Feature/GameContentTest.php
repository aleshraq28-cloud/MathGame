<?php

namespace Tests\Feature;

use App\Game\QuestionDefinitionValidator;
use App\Game\QuestionType;
use App\Models\GameStage;
use App\Models\Question;
use App\Models\Student;
use App\Models\StudentStageProgress;
use Database\Seeders\Content\GameContent;
use Database\Seeders\GameContentSeeder;
use Tests\Concerns\PlaysGame;
use Tests\TestCase;

class GameContentTest extends TestCase
{
    use PlaysGame;

    public function test_every_question_definition_is_valid(): void
    {
        $validator = new QuestionDefinitionValidator;
        $errors = [];

        foreach (GameContent::stages() as $stage) {
            foreach ($stage['questions'] as $question) {
                foreach ($validator->errors($question) as $error) {
                    $errors[] = "{$stage['slug']}/{$question['key']}: {$error}";
                }
            }
        }

        $this->assertSame([], $errors);
    }

    public function test_the_seeded_journey_has_eighteen_stages_and_a_final_treasure(): void
    {
        $stages = GameStage::query()->ordered()->get();

        $this->assertCount(19, $stages);
        $this->assertSame([1, 2, 3, 4, 5, 6], $stages->pluck('world_number')->unique()->values()->all());
        $this->assertTrue($stages->last()->is_final);
        $this->assertSame(1, $stages->where('is_final', true)->count());

        foreach ($stages as $stage) {
            $this->assertGreaterThanOrEqual($stage->questions_per_attempt, $stage->questions()->where('is_active', true)->count(), "{$stage->slug} needs enough questions");
        }
    }

    public function test_the_core_activity_types_are_all_used(): void
    {
        $used = Question::query()->distinct()->pluck('question_type')->all();

        foreach (QuestionType::all() as $type) {
            $this->assertContains($type, $used, "Question type {$type} is never used");
        }
    }

    public function test_the_seeder_can_run_again_without_touching_students_or_progress(): void
    {
        $student = Student::factory()->create();
        $this->playAs($student);
        $this->completeStage($this->stage(1));

        $stageCount = GameStage::query()->count();
        $questionCount = Question::query()->count();

        $this->seed(GameContentSeeder::class);
        $this->seed(GameContentSeeder::class);

        $this->assertSame($stageCount, GameStage::query()->count());
        $this->assertSame($questionCount, Question::query()->count());
        $this->assertModelExists($student);
        $this->assertSame(1, StudentStageProgress::query()->where('student_id', $student->id)->where('status', 'completed')->count());
        $this->assertSame(1, $student->attempts()->count());
    }
}

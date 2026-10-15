<?php

namespace Database\Seeders;

use App\Game\QuestionDefinitionValidator;
use App\Models\GameStage;
use App\Models\Question;
use Database\Seeders\Content\GameContent;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Safe to run repeatedly: stages are matched by slug and questions by
 * (stage, key). Nothing is deleted; questions removed from the content are
 * only deactivated, so student history stays intact.
 *
 * Teacher-edited rows (`is_custom`) are never overwritten or auto-hidden.
 */
class GameContentSeeder extends Seeder
{
    public function run(QuestionDefinitionValidator $validator): void
    {
        $stages = GameContent::stages();

        foreach ($stages as $stage) {
            foreach ($stage['questions'] as $question) {
                $validator->assertValid($question);
            }
        }

        DB::transaction(function () use ($stages) {
            foreach ($stages as $index => $definition) {
                $existing = GameStage::query()->where('slug', $definition['slug'])->first();

                if ($existing?->is_custom) {
                    $stage = $existing;
                } else {
                    $stage = GameStage::query()->updateOrCreate(
                        ['slug' => $definition['slug']],
                        [
                            'title' => $definition['title'],
                            'description' => $definition['description'],
                            'world_number' => $definition['world'],
                            'stage_number' => $definition['stage_number'],
                            'topic' => $definition['topic'],
                            'instructions' => $definition['instructions'],
                            'icon' => $definition['icon'],
                            'difficulty' => $definition['difficulty'],
                            'questions_per_attempt' => $definition['questions_per_attempt'] ?? 8,
                            'is_final' => $definition['is_final'] ?? false,
                            'sort_order' => ($index + 1) * 10,
                            'is_active' => true,
                            'is_custom' => false,
                        ],
                    );
                }

                $keys = [];
                foreach ($definition['questions'] as $order => $q) {
                    $keys[] = $q['key'];

                    $existingQuestion = Question::query()
                        ->where('game_stage_id', $stage->id)
                        ->where('key', $q['key'])
                        ->first();

                    if ($existingQuestion?->is_custom) {
                        continue;
                    }

                    Question::query()->updateOrCreate(
                        ['game_stage_id' => $stage->id, 'key' => $q['key']],
                        [
                            'question_text' => $q['text'],
                            'question_type' => $q['type'],
                            'question_data' => $q['data'],
                            'correct_answer' => $q['answer'],
                            'hint' => $q['hint'],
                            'explanation' => $q['explanation'],
                            'objective' => $q['objective'] ?? $definition['objective'],
                            'difficulty' => $q['difficulty'],
                            'points' => $q['points'] ?? 10,
                            'sort_order' => $order + 1,
                            'is_active' => true,
                            'is_custom' => false,
                        ],
                    );
                }

                Question::query()
                    ->where('game_stage_id', $stage->id)
                    ->where('is_custom', false)
                    ->whereNotIn('key', $keys)
                    ->update(['is_active' => false]);
            }
        });
    }
}

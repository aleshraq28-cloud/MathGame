<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_stage_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_stage_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20)->default('in_progress');
            $table->unsignedInteger('best_score')->default(0);
            $table->unsignedTinyInteger('stars_earned')->default(0);
            $table->unsignedInteger('attempts_count')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'game_stage_id']);
        });

        Schema::create('game_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_stage_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('score')->default(0);
            $table->unsignedInteger('max_score')->default(0);
            $table->unsignedSmallInteger('correct_answers')->default(0);
            $table->unsignedSmallInteger('incorrect_answers')->default(0);
            $table->unsignedSmallInteger('total_questions')->default(0);
            $table->unsignedSmallInteger('hints_used')->default(0);
            $table->unsignedTinyInteger('stars_earned')->default(0);
            $table->boolean('passed')->default(false);
            $table->boolean('is_perfect')->default(false);
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'game_stage_id', 'completed_at']);
        });

        Schema::create('game_attempt_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('position');
            $table->unsignedTinyInteger('tries')->default(0);
            $table->boolean('hint_used')->default(false);
            $table->boolean('is_resolved')->default(false);
            $table->boolean('is_correct')->default(false);
            $table->unsignedSmallInteger('points_awarded')->default(0);
            $table->timestamps();

            $table->unique(['game_attempt_id', 'question_id']);
            $table->unique(['game_attempt_id', 'position']);
        });

        Schema::create('question_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->json('submitted_answer');
            $table->boolean('is_correct');
            $table->unsignedSmallInteger('points_awarded')->default(0);
            $table->unsignedTinyInteger('attempt_number');
            $table->timestamp('answered_at');
            $table->timestamps();

            $table->unique(['game_attempt_id', 'question_id', 'attempt_number'], 'question_attempts_unique_try');
        });

        Schema::create('student_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('achievement_key', 60);
            $table->string('title');
            $table->string('description');
            $table->timestamp('earned_at');
            $table->timestamps();

            $table->unique(['student_id', 'achievement_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_achievements');
        Schema::dropIfExists('question_attempts');
        Schema::dropIfExists('game_attempt_questions');
        Schema::dropIfExists('game_attempts');
        Schema::dropIfExists('student_stage_progress');
    }
};

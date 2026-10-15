<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_stage_id')->constrained()->cascadeOnDelete();
            $table->string('key', 80);
            $table->text('question_text');
            $table->string('question_type', 40);
            $table->json('question_data');
            $table->json('correct_answer');
            $table->text('explanation')->nullable();
            $table->text('hint')->nullable();
            $table->string('objective', 80);
            $table->unsignedTinyInteger('difficulty')->default(1);
            $table->unsignedSmallInteger('points')->default(10);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['game_stage_id', 'key']);
            $table->index(['game_stage_id', 'is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};

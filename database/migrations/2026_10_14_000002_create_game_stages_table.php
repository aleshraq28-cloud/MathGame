<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_stages', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('title');
            $table->text('description');
            $table->unsignedTinyInteger('world_number');
            $table->unsignedSmallInteger('stage_number')->unique();
            $table->string('topic');
            $table->text('instructions');
            $table->string('icon', 40);
            $table->unsignedTinyInteger('difficulty')->default(1);
            $table->unsignedSmallInteger('questions_per_attempt')->default(8);
            $table->boolean('is_final')->default(false);
            $table->unsignedSmallInteger('sort_order');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_stages');
    }
};

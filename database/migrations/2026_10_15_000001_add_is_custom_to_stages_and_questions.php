<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_stages', function (Blueprint $table) {
            $table->boolean('is_custom')->default(false)->after('is_active');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->boolean('is_custom')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('game_stages', function (Blueprint $table) {
            $table->dropColumn('is_custom');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('is_custom');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Keep the oldest row for each name; rename later duplicates so the
        // unique index can be added without losing any student's progress.
        $duplicates = DB::table('students')
            ->select('name', DB::raw('MIN(id) as keep_id'))
            ->groupBy('name')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $group) {
            $extras = DB::table('students')
                ->where('name', $group->name)
                ->where('id', '!=', $group->keep_id)
                ->orderBy('id')
                ->get();

            $n = 2;
            foreach ($extras as $extra) {
                $candidate = mb_substr($group->name.' ('.$n.')', 0, 100);
                while (DB::table('students')->where('name', $candidate)->exists()) {
                    $n++;
                    $candidate = mb_substr($group->name.' ('.$n.')', 0, 100);
                }

                DB::table('students')->where('id', $extra->id)->update(['name' => $candidate]);
                $n++;
            }
        }

        Schema::table('students', function (Blueprint $table) {
            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
    }
};

<?php

namespace Tests\Unit;

use App\Game\Digits;
use App\Game\Scoring;
use PHPUnit\Framework\TestCase;

class ScoringTest extends TestCase
{
    public function test_points_depend_on_try_number_and_hints(): void
    {
        $this->assertSame(10, Scoring::pointsFor(10, 1, false));
        $this->assertSame(7, Scoring::pointsFor(10, 1, true));
        $this->assertSame(5, Scoring::pointsFor(10, 2, false));
        $this->assertSame(5, Scoring::pointsFor(10, 2, true));
        $this->assertSame(2, Scoring::pointsFor(10, 3, false));
        $this->assertSame(0, Scoring::pointsFor(10, 4, false));
    }

    public function test_pass_mark_is_sixty_percent_rounded_up(): void
    {
        $this->assertSame(5, Scoring::passMark(8));
        $this->assertSame(6, Scoring::passMark(10));
        $this->assertTrue(Scoring::isPassed(5, 8));
        $this->assertFalse(Scoring::isPassed(4, 8));
        $this->assertFalse(Scoring::isPassed(0, 0));
    }

    public function test_stars_follow_the_share_of_question_points(): void
    {
        $this->assertSame(3, Scoring::stars(72, 80, true));
        $this->assertSame(2, Scoring::stars(56, 80, true));
        $this->assertSame(1, Scoring::stars(40, 80, true));
        $this->assertSame(0, Scoring::stars(80, 80, false));
    }

    public function test_digits_are_normalised_from_arabic_indic(): void
    {
        $this->assertSame(345.0, Digits::toNumber('٣٤٥'));
        $this->assertSame(2.5, Digits::toNumber('2.5'));
        $this->assertNull(Digits::toNumber('abc'));
        $this->assertNull(Digits::toNumber(''));
    }
}

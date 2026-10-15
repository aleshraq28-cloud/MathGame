<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    /**
     * Refuse to run against anything but the dedicated test database so a
     * cached config can never let RefreshDatabase wipe development data.
     */
    protected function refreshApplication(): void
    {
        parent::refreshApplication();

        $connection = config('database.default');
        $database = (string) config("database.connections.{$connection}.database");

        if (! str_ends_with($database, '_testing') && $database !== ':memory:') {
            throw new RuntimeException("Tests must use a *_testing database, [{$database}] given.");
        }
    }
}

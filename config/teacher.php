<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Teacher display name
    |--------------------------------------------------------------------------
    |
    | Entering this name on the welcome screen asks for the access code
    | instead of creating a student account.
    |
    */
    'name' => env('TEACHER_NAME', 'سالمة'),

    /*
    |--------------------------------------------------------------------------
    | Teacher access code
    |--------------------------------------------------------------------------
    |
    | Keep this in .env in production. Compared with hash_equals after
    | normalizing whitespace.
    |
    */
    'code' => env('TEACHER_ACCESS_CODE', '12230'),

];

<?php

use Laravel\Sanctum\Sanctum;

return [
    'stateful' => array_filter(explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:8000,127.0.0.1:8000'.Sanctum::currentApplicationUrlWithPort()))),
    'guard' => ['web'],
    'expiration' => (int) env('SANCTUM_EXPIRATION', 1440),
    'token_prefix' => '',
];

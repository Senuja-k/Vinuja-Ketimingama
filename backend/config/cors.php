<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://127.0.0.1:8000', 'https://www.tokoxpress.com', 'https://tokoxpress.com'],

    'allowed_origins_patterns' => ['^https:\/\/[a-z0-9-]+\.vercel\.app$'],


    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

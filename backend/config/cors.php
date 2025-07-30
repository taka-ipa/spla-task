<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // ワイルドカード * ではなく、明示的に許可する
    'allowed_origins' => ['http://localhost:3000'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // これをtrueにしないとwithCredentialsで弾かれる！
    'supports_credentials' => true,

    'max_age' => 0,

];

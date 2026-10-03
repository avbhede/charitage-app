<?php
// backend-php/config/config.php

// Simple .env parser if .env exists
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            // Remove quotes if present
            if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                $value = substr($value, 1, -1);
            }
            if (!getenv($key) && !isset($_ENV[$key]) && !isset($_SERVER[$key])) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

if (!function_exists('env')) {
    function env($key, $default = null) {
        $val = getenv($key);
        if ($val === false || $val === null) {
            $val = $_ENV[$key] ?? $_SERVER[$key] ?? $default;
        }
        return $val;
    }
}

return [
    'db' => [
        'host' => env('DB_HOST', 'localhost'),
        'port' => env('DB_PORT', '3306'),
        'database' => env('DB_NAME', 'charitage'),
        'username' => env('DB_USER', 'root'),
        'password' => env('DB_PASS', ''),
    ],
    'jwt' => [
        'secret' => env('JWT_SECRET_KEY', 'a3f8c2e1d94b7056f1e2a3c4d5b6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4'),
        'algo' => 'HS256',
        'expire_minutes' => (int)env('JWT_EXPIRE_MINUTES', 1440),
    ],
    'razorpay' => [
        'key_id' => env('RAZORPAY_KEY_ID', 'rzp_test_SP6qUkjR3eUzoI'),
        'key_secret' => env('RAZORPAY_KEY_SECRET', 'Os0gyXK42VjJDCJRbYFKaCUb'),
    ],
    'cors' => [
        'origins' => env('CORS_ORIGINS', '*'),
    ]
];

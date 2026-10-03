<?php
// backend-php/helpers/response.php

require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/../config/database.php';

function handle_cors() {
    $config = require __DIR__ . '/../config/config.php';
    $allowedOrigins = $config['cors']['origins'] ?? '*';
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

    if ($allowedOrigins === '*' || in_array($origin, explode(',', $allowedOrigins))) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: *");
    }

    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

function send_json($data, int $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

function send_error(string $message, int $statusCode = 400) {
    send_json(['detail' => $message], $statusCode);
}

function get_json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function get_bearer_token(): ?string {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }

    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/i', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function require_auth(): array {
    $token = get_bearer_token();
    if (!$token) {
        send_error("Authentication token required", 401);
    }

    $config = require __DIR__ . '/../config/config.php';
    $payload = JWT::decode($token, $config['jwt']['secret']);

    if (!$payload || !isset($payload['sub'])) {
        send_error("Invalid or expired token", 401);
    }

    $db = Database::getConnection();
    $stmt = $db->prepare("SELECT id, email, name, phone, pan, role, created_at FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$payload['sub']]);
    $user = $stmt->fetch();

    if (!$user) {
        send_error("User not found", 401);
    }

    return $user;
}

function require_admin(): array {
    $user = require_auth();
    if ($user['role'] !== 'admin') {
        send_error("Admin privileges required", 403);
    }
    return $user;
}

function uuid_v4(): string {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // version 4
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // variant
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

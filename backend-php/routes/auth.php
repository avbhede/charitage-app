<?php
// backend-php/routes/auth.php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

function handle_auth_routes(string $method, array $segments) {
    $db = Database::getConnection();
    $action = $segments[0] ?? '';

    if ($method === 'POST' && $action === 'register') {
        $input = get_json_input();
        $email = strtolower(trim($input['email'] ?? ''));
        $password = $input['password'] ?? '';
        $name = trim($input['name'] ?? '');
        $phone = $input['phone'] ?? null;
        $pan = $input['pan'] ?? null;
        $role = $input['role'] ?? 'donor';

        if (!$email || !$password || !$name) {
            send_error("Email, password, and name are required", 400);
        }

        // Check existing
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            send_error("Email already registered", 400);
        }

        $userId = uuid_v4();
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $createdAt = date('Y-m-d H:i:s');

        $insert = $db->prepare("INSERT INTO users (id, email, name, phone, pan, role, hashed_password, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $insert->execute([$userId, $email, $name, $phone, $pan, $role, $hashed, $createdAt]);

        $user = [
            'id' => $userId,
            'email' => $email,
            'name' => $name,
            'phone' => $phone,
            'pan' => $pan,
            'role' => $role,
            'created_at' => $createdAt
        ];

        $config = require __DIR__ . '/../config/config.php';
        $token = JWT::encode(['sub' => $email, 'role' => $role], $config['jwt']['secret'], $config['jwt']['expire_minutes']);

        send_json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $user
        ], 200);
    }

    if ($method === 'POST' && $action === 'login') {
        $input = get_json_input();
        $email = strtolower(trim($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            send_error("Email and password are required", 400);
        }

        $stmt = $db->prepare("SELECT id, email, name, phone, pan, role, hashed_password, created_at FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['hashed_password'])) {
            send_error("Incorrect email or password", 401);
        }

        unset($user['hashed_password']);

        $config = require __DIR__ . '/../config/config.php';
        $token = JWT::encode(['sub' => $user['email'], 'role' => $user['role']], $config['jwt']['secret'], $config['jwt']['expire_minutes']);

        send_json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $user
        ], 200);
    }

    if ($method === 'POST' && $action === 'forgot-password') {
        send_json([
            'message' => 'If this email is registered, password reset instructions will be sent.'
        ], 200);
    }

    if ($method === 'GET' && $action === 'me') {
        $user = require_auth();
        send_json($user, 200);
    }

    send_error("Auth endpoint not found", 404);
}

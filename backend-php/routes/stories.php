<?php
// backend-php/routes/stories.php

require_once __DIR__ . '/../helpers/response.php';

function handle_story_routes(string $method, array $segments) {
    $db = Database::getConnection();
    $id = $segments[0] ?? null;

    if ($method === 'GET' && !$id) {
        $stmt = $db->query("SELECT * FROM stories ORDER BY created_at DESC");
        $stories = $stmt->fetchAll();
        send_json($stories, 200);
    }

    if ($method === 'GET' && $id) {
        $stmt = $db->prepare("SELECT * FROM stories WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $story = $stmt->fetch();
        if (!$story) {
            send_error("Story not found", 404);
        }
        send_json($story, 200);
    }

    if ($method === 'POST') {
        require_admin();
        $input = get_json_input();
        $id = uuid_v4();
        $createdAt = date('Y-m-d H:i:s');

        $stmt = $db->prepare("INSERT INTO stories (id, title, description, featured_image, category, author, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $input['title'] ?? '',
            $input['description'] ?? '',
            $input['featured_image'] ?? '',
            $input['category'] ?? 'Impact Story',
            $input['author'] ?? 'Charitage Team',
            $createdAt
        ]);

        $stmt = $db->prepare("SELECT * FROM stories WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        send_json($stmt->fetch(), 201);
    }

    send_error("Story route not found", 404);
}

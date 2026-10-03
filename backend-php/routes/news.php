<?php
// backend-php/routes/news.php

require_once __DIR__ . '/../helpers/response.php';

function handle_news_routes(string $method, array $segments) {
    $db = Database::getConnection();
    $id = $segments[0] ?? null;

    if ($method === 'GET' && !$id) {
        $stmt = $db->query("SELECT * FROM news ORDER BY published_at DESC, created_at DESC");
        $news = $stmt->fetchAll();
        foreach ($news as &$n) {
            $n['tags'] = json_decode($n['tags'] ?: '[]', true);
        }
        send_json($news, 200);
    }

    if ($method === 'GET' && $id) {
        $stmt = $db->prepare("SELECT * FROM news WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        if (!$item) {
            send_error("News item not found", 404);
        }
        $item['tags'] = json_decode($item['tags'] ?: '[]', true);
        send_json($item, 200);
    }

    if ($method === 'POST') {
        require_admin();
        $input = get_json_input();
        $newId = uuid_v4();
        $now = date('Y-m-d H:i:s');

        $stmt = $db->prepare("INSERT INTO news (id, title, content, excerpt, image_url, video_url, category, tags, author, published_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $newId,
            $input['title'] ?? '',
            $input['content'] ?? '',
            $input['excerpt'] ?? '',
            $input['image_url'] ?? '',
            $input['video_url'] ?? null,
            $input['category'] ?? 'Press Release',
            json_encode($input['tags'] ?? []),
            $input['author'] ?? 'Charitage News Desk',
            $input['published_at'] ?? $now,
            $now
        ]);

        $stmt = $db->prepare("SELECT * FROM news WHERE id = ? LIMIT 1");
        $stmt->execute([$newId]);
        $created = $stmt->fetch();
        $created['tags'] = json_decode($created['tags'] ?: '[]', true);
        send_json($created, 201);
    }

    send_error("News route not found", 404);
}

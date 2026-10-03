<?php
// backend-php/routes/blogs.php

require_once __DIR__ . '/../helpers/response.php';

function handle_blog_routes(string $method, array $segments) {
    $db = Database::getConnection();
    $slugOrId = $segments[0] ?? null;

    if ($method === 'GET' && !$slugOrId) {
        $stmt = $db->query("SELECT * FROM blogs WHERE published = 1 ORDER BY created_at DESC");
        $blogs = $stmt->fetchAll();
        foreach ($blogs as &$b) {
            $b['tags'] = json_decode($b['tags'] ?: '[]', true);
            $b['published'] = (bool)$b['published'];
        }
        send_json($blogs, 200);
    }

    if ($method === 'GET' && $slugOrId) {
        $stmt = $db->prepare("SELECT * FROM blogs WHERE slug = ? OR id = ? LIMIT 1");
        $stmt->execute([$slugOrId, $slugOrId]);
        $blog = $stmt->fetch();
        if (!$blog) {
            send_error("Blog not found", 404);
        }
        $blog['tags'] = json_decode($blog['tags'] ?: '[]', true);
        $blog['published'] = (bool)$blog['published'];
        send_json($blog, 200);
    }

    if ($method === 'POST') {
        require_admin();
        $input = get_json_input();
        $id = uuid_v4();
        $title = $input['title'] ?? '';
        $slug = $input['slug'] ?? strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        $createdAt = date('Y-m-d H:i:s');

        $stmt = $db->prepare("INSERT INTO blogs (id, title, slug, excerpt, content, author, image_url, category, tags, published, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id,
            $title,
            $slug,
            $input['excerpt'] ?? '',
            $input['content'] ?? '',
            $input['author'] ?? 'Charitage Team',
            $input['image_url'] ?? '',
            $input['category'] ?? 'General',
            json_encode($input['tags'] ?? []),
            isset($input['published']) ? ((int)$input['published']) : 1,
            $createdAt
        ]);

        $stmt = $db->prepare("SELECT * FROM blogs WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $created = $stmt->fetch();
        $created['tags'] = json_decode($created['tags'] ?: '[]', true);
        send_json($created, 201);
    }

    send_error("Blog route not found", 404);
}

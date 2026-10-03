<?php
// backend-php/routes/activities.php

require_once __DIR__ . '/../helpers/response.php';

function handle_activity_routes(string $method, array $segments) {
    $db = Database::getConnection();
    $id = $segments[0] ?? null;

    if ($method === 'GET' && !$id) {
        $stmt = $db->query("SELECT * FROM activities ORDER BY created_at DESC");
        $activities = $stmt->fetchAll();
        foreach ($activities as &$a) {
            $a['gallery_urls'] = json_decode($a['gallery_urls'] ?: '[]', true);
            $a['participants_count'] = (int)($a['participants_count'] ?? 0);
        }
        send_json($activities, 200);
    }

    if ($method === 'GET' && $id) {
        $stmt = $db->prepare("SELECT * FROM activities WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $activity = $stmt->fetch();
        if (!$activity) {
            send_error("Activity not found", 404);
        }
        $activity['gallery_urls'] = json_decode($activity['gallery_urls'] ?: '[]', true);
        $activity['participants_count'] = (int)($activity['participants_count'] ?? 0);
        send_json($activity, 200);
    }

    if ($method === 'POST') {
        require_admin();
        $input = get_json_input();
        $newId = uuid_v4();
        $createdAt = date('Y-m-d H:i:s');

        $stmt = $db->prepare("INSERT INTO activities (id, title, description, category, media_type, media_url, gallery_urls, event_date, location, participants_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $newId,
            $input['title'] ?? '',
            $input['description'] ?? '',
            $input['category'] ?? 'Community',
            $input['media_type'] ?? 'image',
            $input['media_url'] ?? '',
            json_encode($input['gallery_urls'] ?? []),
            $input['event_date'] ?? null,
            $input['location'] ?? null,
            $input['participants_count'] ?? 0,
            $createdAt
        ]);

        $stmt = $db->prepare("SELECT * FROM activities WHERE id = ? LIMIT 1");
        $stmt->execute([$newId]);
        $act = $stmt->fetch();
        $act['gallery_urls'] = json_decode($act['gallery_urls'] ?: '[]', true);
        send_json($act, 201);
    }

    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM activities WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['message' => 'Activity deleted successfully'], 200);
    }

    send_error("Activity route not found", 404);
}

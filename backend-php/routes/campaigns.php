<?php
// backend-php/routes/campaigns.php

require_once __DIR__ . '/../helpers/response.php';

function handle_campaign_routes(string $method, array $segments) {
    $db = Database::getConnection();
    $id = $segments[0] ?? null;

    if ($method === 'GET' && !$id) {
        $status = $_GET['status'] ?? null;
        if ($status) {
            $stmt = $db->prepare("SELECT * FROM campaigns WHERE status = ? ORDER BY created_at DESC");
            $stmt->execute([$status]);
        } else {
            $stmt = $db->query("SELECT * FROM campaigns ORDER BY created_at DESC");
        }
        $campaigns = $stmt->fetchAll();
        foreach ($campaigns as &$c) {
            $c['goal_amount'] = (float)$c['goal_amount'];
            $c['raised_amount'] = (float)$c['raised_amount'];
            $c['beneficiaries_count'] = (int)$c['beneficiaries_count'];
        }
        send_json($campaigns, 200);
    }

    if ($method === 'GET' && $id) {
        $stmt = $db->prepare("SELECT * FROM campaigns WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $campaign = $stmt->fetch();
        if (!$campaign) {
            send_error("Campaign not found", 404);
        }
        $campaign['goal_amount'] = (float)$campaign['goal_amount'];
        $campaign['raised_amount'] = (float)$campaign['raised_amount'];
        $campaign['beneficiaries_count'] = (int)$campaign['beneficiaries_count'];
        send_json($campaign, 200);
    }

    if ($method === 'POST' && !$id) {
        require_admin();
        $input = get_json_input();
        $newId = uuid_v4();
        $createdAt = date('Y-m-d H:i:s');

        $stmt = $db->prepare("INSERT INTO campaigns (id, title, description, category, goal_amount, raised_amount, image_url, status, beneficiaries_count, submitted_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $newId,
            $input['title'] ?? '',
            $input['description'] ?? '',
            $input['category'] ?? 'General',
            $input['goal_amount'] ?? 0,
            $input['raised_amount'] ?? 0,
            $input['image_url'] ?? '',
            $input['status'] ?? 'active',
            $input['beneficiaries_count'] ?? 0,
            null,
            $createdAt
        ]);

        $stmt = $db->prepare("SELECT * FROM campaigns WHERE id = ? LIMIT 1");
        $stmt->execute([$newId]);
        $camp = $stmt->fetch();
        $camp['goal_amount'] = (float)$camp['goal_amount'];
        $camp['raised_amount'] = (float)$camp['raised_amount'];
        $camp['beneficiaries_count'] = (int)$camp['beneficiaries_count'];
        send_json($camp, 201);
    }

    if ($method === 'PUT' && $id) {
        require_admin();
        $input = get_json_input();

        $stmt = $db->prepare("SELECT * FROM campaigns WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            send_error("Campaign not found", 404);
        }

        $title = $input['title'] ?? $existing['title'];
        $description = $input['description'] ?? $existing['description'];
        $category = $input['category'] ?? $existing['category'];
        $goal_amount = isset($input['goal_amount']) ? (float)$input['goal_amount'] : (float)$existing['goal_amount'];
        $raised_amount = isset($input['raised_amount']) ? (float)$input['raised_amount'] : (float)$existing['raised_amount'];
        $image_url = $input['image_url'] ?? $existing['image_url'];
        $status = $input['status'] ?? $existing['status'];
        $beneficiaries_count = isset($input['beneficiaries_count']) ? (int)$input['beneficiaries_count'] : (int)$existing['beneficiaries_count'];

        $update = $db->prepare("UPDATE campaigns SET title = ?, description = ?, category = ?, goal_amount = ?, raised_amount = ?, image_url = ?, status = ?, beneficiaries_count = ? WHERE id = ?");
        $update->execute([$title, $description, $category, $goal_amount, $raised_amount, $image_url, $status, $beneficiaries_count, $id]);

        $stmt = $db->prepare("SELECT * FROM campaigns WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $camp = $stmt->fetch();
        $camp['goal_amount'] = (float)$camp['goal_amount'];
        $camp['raised_amount'] = (float)$camp['raised_amount'];
        $camp['beneficiaries_count'] = (int)$camp['beneficiaries_count'];
        send_json($camp, 200);
    }

    if ($method === 'DELETE' && $id) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM campaigns WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['message' => 'Campaign deleted successfully'], 200);
    }

    send_error("Route not found", 404);
}

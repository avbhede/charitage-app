<?php
// backend-php/routes/interactions.php

require_once __DIR__ . '/../helpers/response.php';

function handle_interaction_routes(string $resource, string $method, array $segments) {
    $db = Database::getConnection();

    // 1. Volunteers
    if ($resource === 'volunteers' && $method === 'POST') {
        $input = get_json_input();
        $id = uuid_v4();
        $createdAt = date('Y-m-d H:i:s');

        $stmt = $db->prepare("INSERT INTO volunteers (id, name, email, phone, city, occupation, interests, availability, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)");
        $stmt->execute([
            $id,
            $input['name'] ?? '',
            $input['email'] ?? '',
            $input['phone'] ?? null,
            $input['city'] ?? null,
            $input['occupation'] ?? null,
            $input['interests'] ?? null,
            $input['availability'] ?? null,
            $createdAt
        ]);

        $stmt = $db->prepare("SELECT * FROM volunteers WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        send_json($stmt->fetch(), 201);
    }

    // 2. Inquiries
    if ($resource === 'inquiries' && $method === 'POST') {
        $input = get_json_input();
        $id = uuid_v4();
        $createdAt = date('Y-m-d H:i:s');

        $stmt = $db->prepare("INSERT INTO inquiries (id, name, email, phone, company_name, area_of_interest, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)");
        $stmt->execute([
            $id,
            $input['name'] ?? '',
            $input['email'] ?? '',
            $input['phone'] ?? null,
            $input['company_name'] ?? null,
            $input['area_of_interest'] ?? null,
            $input['subject'] ?? null,
            $input['message'] ?? '',
            $createdAt
        ]);

        $stmt = $db->prepare("SELECT * FROM inquiries WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        send_json($stmt->fetch(), 201);
    }

    // 3. Memberships
    if ($resource === 'memberships' && $method === 'POST') {
        $input = get_json_input();
        $id = uuid_v4();
        $createdAt = date('Y-m-d H:i:s');

        $stmt = $db->prepare("INSERT INTO memberships (id, name, email, phone, pan, address, membership_type, amount, razorpay_payment_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)");
        $stmt->execute([
            $id,
            $input['name'] ?? '',
            $input['email'] ?? '',
            $input['phone'] ?? null,
            $input['pan'] ?? null,
            $input['address'] ?? null,
            $input['membership_type'] ?? 'Annual',
            (float)($input['amount'] ?? 0),
            $input['razorpay_payment_id'] ?? null,
            $createdAt
        ]);

        $stmt = $db->prepare("SELECT * FROM memberships WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        send_json($stmt->fetch(), 201);
    }

    // 4. Team
    if ($resource === 'team' && $method === 'GET') {
        $stmt = $db->query("SELECT * FROM team ORDER BY created_at ASC");
        $team = $stmt->fetchAll();
        foreach ($team as &$t) {
            $t['social_links'] = json_decode($t['social_links'] ?: '{}', true);
        }
        send_json($team, 200);
    }

    // 5. Gallery
    if ($resource === 'gallery' && $method === 'GET') {
        $stmt = $db->query("SELECT * FROM gallery ORDER BY created_at DESC");
        send_json($stmt->fetchAll(), 200);
    }

    // 6. Documents
    if ($resource === 'documents' && $method === 'GET') {
        $stmt = $db->query("SELECT * FROM documents ORDER BY created_at DESC");
        send_json($stmt->fetchAll(), 200);
    }

    // 7. Stats
    if ($resource === 'stats' && $method === 'GET') {
        $campQuery = $db->query("SELECT SUM(raised_amount) as total_raised, SUM(beneficiaries_count) as total_beneficiaries, COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns FROM campaigns");
        $campRow = $campQuery->fetch();

        $volQuery = $db->query("SELECT COUNT(*) as approved_vols FROM volunteers WHERE status = 'approved'");
        $volRow = $volQuery->fetch();

        send_json([
            'total_beneficiaries' => (int)($campRow['total_beneficiaries'] ?? 0),
            'total_funds_raised' => (float)($campRow['total_raised'] ?? 0),
            'active_campaigns' => (int)($campRow['active_campaigns'] ?? 0),
            'volunteers' => (int)($volRow['approved_vols'] ?? 0)
        ], 200);
    }

    send_error("Resource route not found", 404);
}

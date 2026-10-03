<?php
// backend-php/routes/admin.php

require_once __DIR__ . '/../helpers/response.php';

function handle_admin_routes(string $method, array $segments) {
    require_admin();
    $db = Database::getConnection();

    $action = $segments[0] ?? '';
    $id = $segments[1] ?? null;
    $subAction = $segments[2] ?? null;

    // 1. Stats
    if ($method === 'GET' && $action === 'stats') {
        $campQuery = $db->query("SELECT COUNT(*) as total_campaigns, SUM(raised_amount) as total_raised, SUM(beneficiaries_count) as total_beneficiaries, COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns FROM campaigns");
        $camp = $campQuery->fetch();

        $volQuery = $db->query("SELECT COUNT(*) as total_volunteers, COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_volunteers FROM volunteers");
        $vol = $volQuery->fetch();

        $memQuery = $db->query("SELECT COUNT(*) as total_memberships FROM memberships");
        $mem = $memQuery->fetch();

        $inqQuery = $db->query("SELECT COUNT(*) as total_inquiries FROM inquiries");
        $inq = $inqQuery->fetch();

        $donQuery = $db->query("SELECT COUNT(*) as total_donations FROM donations WHERE status = 'completed'");
        $don = $donQuery->fetch();

        $userQuery = $db->query("SELECT COUNT(*) as total_users FROM users");
        $users = $userQuery->fetch();

        $blogQuery = $db->query("SELECT COUNT(*) as total_blogs FROM blogs");
        $blogs = $blogQuery->fetch();

        $fundQuery = $db->query("SELECT COUNT(*) as pending_fundseekers FROM campaigns WHERE status = 'pending'");
        $funds = $fundQuery->fetch();

        send_json([
            'total_funds_raised' => (float)($camp['total_raised'] ?? 0),
            'total_beneficiaries' => (int)($camp['total_beneficiaries'] ?? 0),
            'active_campaigns' => (int)($camp['active_campaigns'] ?? 0),
            'total_campaigns' => (int)($camp['total_campaigns'] ?? 0),
            'total_volunteers' => (int)($vol['total_volunteers'] ?? 0),
            'approved_volunteers' => (int)($vol['approved_volunteers'] ?? 0),
            'total_memberships' => (int)($mem['total_memberships'] ?? 0),
            'total_inquiries' => (int)($inq['total_inquiries'] ?? 0),
            'pending_fundseekers' => (int)($funds['pending_fundseekers'] ?? 0),
            'total_donations' => (int)($don['total_donations'] ?? 0),
            'total_blogs' => (int)($blogs['total_blogs'] ?? 0),
            'total_users' => (int)($users['total_users'] ?? 0),
        ], 200);
    }

    // 2. Volunteers
    if ($method === 'GET' && $action === 'volunteers') {
        $stmt = $db->query("SELECT * FROM volunteers ORDER BY created_at DESC");
        send_json($stmt->fetchAll(), 200);
    }

    // 3. Donations
    if ($method === 'GET' && $action === 'donations') {
        $stmt = $db->query("
            SELECT d.*, c.title as campaign_title 
            FROM donations d 
            LEFT JOIN campaigns c ON d.campaign_id = c.id 
            ORDER BY d.created_at DESC
        ");
        $donations = $stmt->fetchAll();
        foreach ($donations as &$d) {
            $d['amount'] = (float)$d['amount'];
            $d['tip_amount'] = (float)$d['tip_amount'];
            $d['is_recurring'] = (bool)$d['is_recurring'];
            $d['is_anonymous'] = (bool)$d['is_anonymous'];
        }
        send_json($donations, 200);
    }

    // 4. Users
    if ($method === 'GET' && $action === 'users') {
        $stmt = $db->query("SELECT id, email, name, phone, pan, role, created_at FROM users ORDER BY created_at DESC");
        send_json($stmt->fetchAll(), 200);
    }

    // 5. Memberships
    if ($action === 'memberships') {
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM memberships ORDER BY created_at DESC");
            $memberships = $stmt->fetchAll();
            foreach ($memberships as &$m) {
                $m['amount'] = (float)$m['amount'];
            }
            send_json($memberships, 200);
        }
        if ($method === 'PUT' && $id && $subAction === 'status') {
            $input = get_json_input();
            $newStatus = $input['status'] ?? 'active';
            $stmt = $db->prepare("UPDATE memberships SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $id]);
            send_json(['message' => 'Status updated successfully', 'status' => $newStatus], 200);
        }
    }

    // 6. Inquiries
    if ($action === 'inquiries') {
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM inquiries ORDER BY created_at DESC");
            send_json($stmt->fetchAll(), 200);
        }
        if ($method === 'PUT' && $id && $subAction === 'status') {
            $input = get_json_input();
            $newStatus = $input['status'] ?? 'in_review';
            $stmt = $db->prepare("UPDATE inquiries SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $id]);
            send_json(['message' => 'Status updated successfully', 'status' => $newStatus], 200);
        }
    }

    // 7. Fundseekers
    if ($action === 'fundseekers') {
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM campaigns WHERE submitted_by IS NOT NULL ORDER BY created_at DESC");
            $camps = $stmt->fetchAll();
            foreach ($camps as &$c) {
                $c['goal_amount'] = (float)$c['goal_amount'];
                $c['raised_amount'] = (float)$c['raised_amount'];
            }
            send_json($camps, 200);
        }
        if ($method === 'POST' && $id && $subAction === 'approve') {
            $stmt = $db->prepare("UPDATE campaigns SET status = 'active' WHERE id = ?");
            $stmt->execute([$id]);
            send_json(['message' => 'Campaign approved successfully', 'status' => 'active'], 200);
        }
        if ($method === 'POST' && $id && $subAction === 'reject') {
            $stmt = $db->prepare("UPDATE campaigns SET status = 'rejected' WHERE id = ?");
            $stmt->execute([$id]);
            send_json(['message' => 'Campaign rejected', 'status' => 'rejected'], 200);
        }
    }

    send_error("Admin route not found", 404);
}

<?php
// backend-php/index.php
// Charitage Foundation PHP API Gateway & Router

error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/campaigns.php';
require_once __DIR__ . '/routes/donations.php';
require_once __DIR__ . '/routes/blogs.php';
require_once __DIR__ . '/routes/activities.php';
require_once __DIR__ . '/routes/stories.php';
require_once __DIR__ . '/routes/news.php';
require_once __DIR__ . '/routes/interactions.php';
require_once __DIR__ . '/routes/admin.php';

// Handle CORS Preflight and headers
handle_cors();

// Parse Request URI
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedUrl = parse_url($requestUri);
$path = trim($parsedUrl['path'] ?? '/', '/');
$segments = $path !== '' ? explode('/', $path) : [];

// If 'api' is present in segments, slice everything after 'api'
$apiIndex = array_search('api', $segments);
if ($apiIndex !== false) {
    $segments = array_slice($segments, $apiIndex + 1);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$resource = $segments[0] ?? '';
$subSegments = array_slice($segments, 1);

// Root health check
if ($resource === '' || $resource === 'health') {
    send_json([
        'status' => 'ok',
        'service' => 'charitage-backend-php',
        'runtime' => 'PHP ' . PHP_VERSION,
        'database' => 'MySQL'
    ], 200);
}

// Config endpoint (Razorpay Key ID for frontend)
if ($resource === 'config' && $method === 'GET') {
    $config = require __DIR__ . '/config/config.php';
    send_json([
        'razorpay_key_id' => $config['razorpay']['key_id']
    ], 200);
}

// Route dispatching
try {
    switch ($resource) {
        case 'auth':
            handle_auth_routes($method, $subSegments);
            break;

        case 'campaigns':
            handle_campaign_routes($method, $subSegments);
            break;

        case 'donations':
            handle_donation_routes($method, $subSegments);
            break;

        case 'blogs':
            handle_blog_routes($method, $subSegments);
            break;

        case 'activities':
            handle_activity_routes($method, $subSegments);
            break;

        case 'stories':
            handle_story_routes($method, $subSegments);
            break;

        case 'news':
            handle_news_routes($method, $subSegments);
            break;

        case 'admin':
            handle_admin_routes($method, $subSegments);
            break;

        case 'volunteers':
        case 'inquiries':
        case 'memberships':
        case 'team':
        case 'gallery':
        case 'documents':
        case 'stats':
            handle_interaction_routes($resource, $method, $subSegments);
            break;

        default:
            send_error("API endpoint not found: /$resource", 404);
            break;
    }
} catch (Exception $e) {
    send_error("Internal Server Error: " . $e->getMessage(), 500);
}

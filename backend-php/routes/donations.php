<?php
// backend-php/routes/donations.php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/razorpay.php';

function handle_donation_routes(string $method, array $segments) {
    $db = Database::getConnection();
    $action = $segments[0] ?? '';
    $subAction = $segments[1] ?? '';

    $razorpay = new RazorpayService();

    // 1. Create order
    if ($method === 'POST' && $action === 'create-order') {
        $input = get_json_input();
        $amount = (float)($input['amount'] ?? 0);
        $tipAmount = (float)($input['tip_amount'] ?? 0);
        $totalAmount = $amount + $tipAmount;

        if ($totalAmount <= 0) {
            send_error("Invalid donation amount", 400);
        }

        $amountInPaise = (int)round($totalAmount * 100);
        $isRecurring = !empty($input['is_recurring']);
        $donationId = uuid_v4();
        $createdAt = date('Y-m-d H:i:s');

        $userId = $input['user_id'] ?? null;
        $campaignId = $input['campaign_id'] ?? null;
        $donorName = $input['donor_name'] ?? 'Anonymous';
        $donorEmail = $input['donor_email'] ?? '';
        $donorPhone = $input['donor_phone'] ?? null;
        $donorPan = $input['donor_pan'] ?? null;
        $giftAddress = $input['gift_address'] ?? null;
        $isAnonymous = !empty($input['is_anonymous']) ? 1 : 0;
        $durationMonths = (int)($input['duration_months'] ?? 12);

        try {
            if ($isRecurring) {
                // Subscription mode or monthly order
                $order = $razorpay->createOrder($amountInPaise, 'INR', ['donation_id' => $donationId, 'recurring' => 'true']);
                $orderId = $order['id'];

                $stmt = $db->prepare("INSERT INTO donations (id, user_id, campaign_id, amount, tip_amount, donor_name, donor_email, donor_phone, donor_pan, gift_address, is_anonymous, is_recurring, duration_months, razorpay_order_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'pending', ?)");
                $stmt->execute([$donationId, $userId, $campaignId, $amount, $tipAmount, $donorName, $donorEmail, $donorPhone, $donorPan, $giftAddress, $isAnonymous, $durationMonths, $orderId, $createdAt]);

                send_json([
                    'type' => 'subscription',
                    'order_id' => $orderId,
                    'amount' => $amountInPaise,
                    'currency' => 'INR',
                    'donation_id' => $donationId,
                    'key_id' => $razorpay->getKeyId()
                ], 200);
            } else {
                $order = $razorpay->createOrder($amountInPaise, 'INR', ['donation_id' => $donationId]);
                $orderId = $order['id'];

                $stmt = $db->prepare("INSERT INTO donations (id, user_id, campaign_id, amount, tip_amount, donor_name, donor_email, donor_phone, donor_pan, gift_address, is_anonymous, is_recurring, duration_months, razorpay_order_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'pending', ?)");
                $stmt->execute([$donationId, $userId, $campaignId, $amount, $tipAmount, $donorName, $donorEmail, $donorPhone, $donorPan, $giftAddress, $isAnonymous, $durationMonths, $orderId, $createdAt]);

                send_json([
                    'type' => 'order',
                    'order_id' => $orderId,
                    'amount' => $amountInPaise,
                    'currency' => 'INR',
                    'donation_id' => $donationId,
                    'key_id' => $razorpay->getKeyId()
                ], 200);
            }
        } catch (Exception $e) {
            send_error("Failed to create order: " . $e->getMessage(), 500);
        }
    }

    // 2. Verify payment signature
    if ($method === 'POST' && $action === 'verify') {
        $data = get_json_input();
        $orderId = $data['razorpay_order_id'] ?? '';
        $paymentId = $data['razorpay_payment_id'] ?? '';
        $signature = $data['razorpay_signature'] ?? '';
        $subscriptionId = $data['razorpay_subscription_id'] ?? '';

        try {
            $isValid = false;
            if ($subscriptionId) {
                $isValid = $razorpay->verifySubscriptionSignature($subscriptionId, $paymentId, $signature);
            } else {
                $isValid = $razorpay->verifyPaymentSignature($orderId, $paymentId, $signature);
            }

            if (!$isValid) {
                send_error("Payment verification failed: Invalid signature", 400);
            }

            // Update donation status
            $stmt = $db->prepare("UPDATE donations SET status = 'completed', razorpay_payment_id = ?, razorpay_signature = ? WHERE razorpay_order_id = ? OR razorpay_subscription_id = ?");
            $stmt->execute([$paymentId, $signature, $orderId, $subscriptionId]);

            // Find donation record
            $find = $db->prepare("SELECT * FROM donations WHERE razorpay_order_id = ? OR razorpay_subscription_id = ? LIMIT 1");
            $find->execute([$orderId, $subscriptionId]);
            $donation = $find->fetch();

            if ($donation && !empty($donation['campaign_id'])) {
                $inc = $db->prepare("UPDATE campaigns SET raised_amount = raised_amount + ? WHERE id = ?");
                $inc->execute([$donation['amount'], $donation['campaign_id']]);
            }

            send_json([
                'status' => 'success',
                'message' => 'Payment verified successfully! Donation receipt generated.',
                'donation_id' => $donation['id'] ?? null
            ], 200);
        } catch (Exception $e) {
            send_error("Payment verification failed: " . $e->getMessage(), 400);
        }
    }

    // 3. Top Donors
    if ($method === 'GET' && $action === 'top-donors') {
        $stmt = $db->query("
            SELECT d.id, d.donor_name, d.amount, d.is_recurring, d.is_anonymous, d.created_at, c.title as campaign_title
            FROM donations d
            LEFT JOIN campaigns c ON d.campaign_id = c.id
            WHERE d.amount >= 5000 AND d.status = 'completed'
            ORDER BY d.amount DESC
            LIMIT 20
        ");
        $donations = $stmt->fetchAll();

        $result = [];
        foreach ($donations as $d) {
            $name = $d['is_anonymous'] ? 'Anonymous Donor' : ($d['donor_name'] ?: 'Anonymous');
            $result[] = [
                'id' => $d['id'],
                'donor_name' => $name,
                'amount' => (float)$d['amount'],
                'is_recurring' => (bool)$d['is_recurring'],
                'campaign_title' => $d['campaign_title'] ?: 'General Donation',
                'created_at' => $d['created_at']
            ];
        }
        send_json($result, 200);
    }

    // 4. Receipt
    if ($method === 'GET' && $action === 'receipt' && $subAction) {
        $stmt = $db->prepare("
            SELECT d.*, c.title as campaign_title
            FROM donations d
            LEFT JOIN campaigns c ON d.campaign_id = c.id
            WHERE d.id = ? LIMIT 1
        ");
        $stmt->execute([$subAction]);
        $donation = $stmt->fetch();

        if (!$donation) {
            send_error("Donation record not found", 404);
        }

        $receiptData = [
            'receipt_number' => 'REC-' . date('Ymd') . '-' . strtoupper(substr($donation['id'], 0, 6)),
            'date' => $donation['created_at'],
            'donor_name' => $donation['donor_name'],
            'donor_email' => $donation['donor_email'],
            'donor_phone' => $donation['donor_phone'],
            'donor_pan' => $donation['donor_pan'] ?: 'N/A',
            'amount' => (float)$donation['amount'],
            'tip_amount' => (float)$donation['tip_amount'],
            'total_paid' => (float)$donation['amount'] + (float)$donation['tip_amount'],
            'is_recurring' => (bool)$donation['is_recurring'],
            'duration_months' => (int)$donation['duration_months'],
            'payment_id' => $donation['razorpay_payment_id'] ?: ($donation['razorpay_order_id'] ?: 'PAY-SUCCESS'),
            'campaign_title' => $donation['campaign_title'] ?: 'Direct Foundation Support',
            'foundation_name' => 'Charitage Foundation',
            'reg_no' => '12A / 80G Tax Exempt: AAATC1234F20231',
            'address' => 'Plot 42, Service Road, BKC, Mumbai, MS 400051',
        ];

        send_json($receiptData, 200);
    }

    // 5. User Donations
    if ($method === 'GET' && $action === 'user' && $subAction) {
        $stmt = $db->prepare("
            SELECT d.*, c.title as campaign_title
            FROM donations d
            LEFT JOIN campaigns c ON d.campaign_id = c.id
            WHERE d.user_id = ?
            ORDER BY d.created_at DESC
        ");
        $stmt->execute([$subAction]);
        $donations = $stmt->fetchAll();
        foreach ($donations as &$d) {
            $d['amount'] = (float)$d['amount'];
            $d['tip_amount'] = (float)$d['tip_amount'];
            $d['is_recurring'] = (bool)$d['is_recurring'];
            $d['is_anonymous'] = (bool)$d['is_anonymous'];
        }
        send_json($donations, 200);
    }

    send_error("Donation route not found", 404);
}

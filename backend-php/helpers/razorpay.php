<?php
// backend-php/helpers/razorpay.php

class RazorpayService {
    private string $keyId;
    private string $keySecret;

    public function __construct() {
        $config = require __DIR__ . '/../config/config.php';
        $this->keyId = $config['razorpay']['key_id'] ?? '';
        $this->keySecret = $config['razorpay']['key_secret'] ?? '';
    }

    public function getKeyId(): string {
        return $this->keyId;
    }

    public function createOrder(int $amountInPaise, string $currency = 'INR', array $notes = []): array {
        $url = 'https://api.razorpay.com/v1/orders';
        $payload = [
            'amount' => $amountInPaise,
            'currency' => $currency,
            'payment_capture' => 1,
            'notes' => $notes,
        ];

        return $this->makeRequest('POST', $url, $payload);
    }

    public function createSubscription(string $planId, int $totalCount = 12, int $amountInPaise = 0): array {
        $url = 'https://api.razorpay.com/v1/subscriptions';
        $payload = [
            'plan_id' => $planId,
            'total_count' => $totalCount,
            'quantity' => 1,
            'customer_notify' => 1,
        ];

        return $this->makeRequest('POST', $url, $payload);
    }

    public function verifyPaymentSignature(string $orderId, string $paymentId, string $signature): bool {
        $generatedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $this->keySecret);
        return hash_equals($generatedSignature, $signature);
    }

    public function verifySubscriptionSignature(string $subscriptionId, string $paymentId, string $signature): bool {
        $generatedSignature = hash_hmac('sha256', $paymentId . '|' . $subscriptionId, $this->keySecret);
        return hash_equals($generatedSignature, $signature);
    }

    private function makeRequest(string $method, string $url, array $data = []): array {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, $this->keyId . ':' . $this->keySecret);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("Razorpay cURL Error: " . $error);
        }

        $decoded = json_decode($response, true);
        if ($httpCode >= 400) {
            $msg = $decoded['error']['description'] ?? "Razorpay API error ($httpCode)";
            throw new Exception($msg);
        }

        return $decoded ?: [];
    }
}

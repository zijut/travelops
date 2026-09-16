<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\JwtService;
use App\Models\User;
use App\Models\Package;

$jwtSecret = env('JWT_SECRET', 'travelops-super-secret-jwt-key-2026-production');

function getTokenForUser($email) {
    global $jwtSecret;
    $user = User::where('email', $email)->first();
    if (!$user) return null;

    $payload = [
        'id' => $user->custom_id ?? (string)$user->id,
        'email' => $user->email,
        'role' => $user->role,
        'iat' => time(),
        'exp' => time() + 3600
    ];

    return JwtService::encode($payload, $jwtSecret);
}

function req($method, $url, $token = null, $data = null) {
    $ch = curl_init($url);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $status, 'body' => json_decode($response, true)];
}

echo "=== TRAVELOPS PROMPT 8: PAYMENT & FINANCE INTEGRATION AUTOMATED TEST SUITE ===" . PHP_EOL . PHP_EOL;

$superAdminToken = getTokenForUser('superadmin@travelops.com');
$travelAdminToken = getTokenForUser('abdullah@alharamain.id');
$barokahAdminToken = getTokenForUser('budi@partner.id');
$jamaahToken = getTokenForUser('pklkesatu7166@gmail.com');

$passed = 0;
$total = 0;

function assertTest($title, $condition, $res = null) {
    global $passed, $total;
    $total++;
    if ($condition) {
        $passed++;
        echo "✅ [PASS] {$title}" . PHP_EOL;
    } else {
        $msg = is_array($res) ? ("Status: " . ($res['status'] ?? 'N/A') . " | Body: " . json_encode($res['body'] ?? [])) : $res;
        echo "❌ [FAIL] {$title} -> {$msg}" . PHP_EOL;
    }
}

// 1. Create a fresh booking for payment tests
$pkg = Package::first();
$pkgId = $pkg->custom_id ?? (string)$pkg->id;

$resBkg = req('POST', 'http://localhost:8000/api/bookings', $jamaahToken, [
    'package_id' => $pkgId,
    'pax_count' => 1,
    'notes' => 'Test Booking for Payment Flow'
]);
$bookingId = $resBkg['body']['booking']['id'] ?? null;
$totalPrice = $resBkg['body']['booking']['total_price'] ?? 35000000;

assertTest("Setup: Fresh Booking Created", $resBkg['status'] === 201 && !empty($bookingId));

if ($bookingId) {
    // 2. Submit partial payment
    echo PHP_EOL . "1. Submitting Partial Payment..." . PHP_EOL;
    $partialAmount = 10000000;
    $resPay1 = req('POST', "http://localhost:8000/api/bookings/{$bookingId}/payments", $jamaahToken, [
        'amount' => $partialAmount,
        'payment_method' => 'Bank Mandiri Transfer',
        'notes' => 'Pembayaran DP 1'
    ]);
    assertTest("POST payment (Partial DP)", $resPay1['status'] === 201 && isset($resPay1['body']['payment']['invoice_number']), $resPay1);
    assertTest("Payment status is PARTIAL", ($resPay1['body']['booking_summary']['payment_status'] ?? '') === 'PARTIAL');

    // 3. Payment exceeding remaining balance rejected
    echo PHP_EOL . "2. Testing Overpayment Rejection..." . PHP_EOL;
    $overAmount = $totalPrice + 5000000;
    $resOver = req('POST', "http://localhost:8000/api/bookings/{$bookingId}/payments", $jamaahToken, [
        'amount' => $overAmount
    ]);
    assertTest("Payment exceeding remaining balance rejected", $resOver['status'] === 400, $resOver);

    // 4. Pay remaining balance to achieve PAID
    echo PHP_EOL . "3. Submitting Remaining Payment to Full Pay..." . PHP_EOL;
    $remaining = $resPay1['body']['booking_summary']['remaining_balance'] ?? ($totalPrice - $partialAmount);
    $resPay2 = req('POST', "http://localhost:8000/api/bookings/{$bookingId}/payments", $jamaahToken, [
        'amount' => $remaining,
        'payment_method' => 'BCA Virtual Account'
    ]);
    assertTest("POST payment (Full Settlement)", $resPay2['status'] === 201, $resPay2);
    assertTest("Payment status updated to PAID", ($resPay2['body']['booking_summary']['payment_status'] ?? '') === 'PAID');
    assertTest("Remaining balance is 0", ($resPay2['body']['booking_summary']['remaining_balance'] ?? 1) == 0);

    // 5. Get payments list
    echo PHP_EOL . "4. Fetching Payment History..." . PHP_EOL;
    $resHistory = req('GET', "http://localhost:8000/api/bookings/{$bookingId}/payments", $jamaahToken);
    assertTest("GET /api/bookings/{id}/payments", $resHistory['status'] === 200 && count($resHistory['body']['payments'] ?? []) === 2, $resHistory);

    // 6. Cross-agency payment security check
    echo PHP_EOL . "5. Security & Authorization Checks..." . PHP_EOL;
    $resCross = req('GET', "http://localhost:8000/api/bookings/{$bookingId}/payments", $barokahAdminToken);
    assertTest("Barokah Travel Admin blocked from Al-Haramain payments", $resCross['status'] === 403, $resCross);

    // 7. Customer cannot delete Finance transactions
    $resFinDelete = req('DELETE', 'http://localhost:8000/api/finance/1', $jamaahToken);
    assertTest("Customer blocked from deleting Finance transaction", $resFinDelete['status'] === 403, $resFinDelete);
}

echo PHP_EOL . "==========================================" . PHP_EOL;
echo "PROMPT 8 PAYMENT TEST RESULTS: {$passed}/{$total} PASSED" . PHP_EOL;
echo "==========================================" . PHP_EOL;

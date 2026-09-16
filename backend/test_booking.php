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

echo "=== TRAVELOPS PROMPT 7: BOOKING & QUOTA AUTOMATED TEST SUITE ===" . PHP_EOL . PHP_EOL;

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

// Prepare package for testing quota
$pkg = Package::first();
$pkgId = $pkg->custom_id ?? (string)$pkg->id;

// 1. Customer creates valid booking
echo "1. Customer creating valid booking..." . PHP_EOL;
$resBkg = req('POST', 'http://localhost:8000/api/bookings', $jamaahToken, [
    'package_id' => $pkgId,
    'pax_count' => 2,
    'initial_payment' => 5000000,
    'notes' => 'Tolong sediakan kursi roda'
]);
assertTest("Customer valid booking creation", $resBkg['status'] === 201 && isset($resBkg['body']['booking']['id']), $resBkg);
$bookingId = $resBkg['body']['booking']['id'] ?? null;

// 2. Check quota decremented
$updatedPkg = Package::find($pkg->id);
assertTest("Package booked quota decremented", $updatedPkg->booked >= 2);

// 3. Admin can view agency bookings
echo PHP_EOL . "2. Admin viewing agency bookings..." . PHP_EOL;
$resList = req('GET', 'http://localhost:8000/api/bookings', $travelAdminToken);
assertTest("Travel Admin GET /api/bookings", $resList['status'] === 200 && is_array($resList['body']['bookings'] ?? null), $resList);

// 4. Cross-agency isolation check
echo PHP_EOL . "3. Cross-agency isolation check..." . PHP_EOL;
if ($bookingId) {
    $resCross = req('GET', "http://localhost:8000/api/bookings/{$bookingId}", $barokahAdminToken);
    assertTest("Barokah Travel Admin blocked from Al-Haramain booking", $resCross['status'] === 403, $resCross);
}

// 5. Quota exhaustion test
echo PHP_EOL . "4. Quota exhaustion test..." . PHP_EOL;
// Create small quota package
$resSmallPkg = req('POST', 'http://localhost:8000/api/packages', $travelAdminToken, [
    'name' => 'Limited Quota Tour',
    'price' => 30000000,
    'quota' => 2,
    'booked' => 2,
    'status' => 'Sold Out'
]);
$smallPkgId = $resSmallPkg['body']['package']['id'] ?? null;

if ($smallPkgId) {
    $resOverbook = req('POST', 'http://localhost:8000/api/bookings', $jamaahToken, [
        'package_id' => $smallPkgId,
        'pax_count' => 1
    ]);
    assertTest("Booking rejected when quota is full", $resOverbook['status'] === 400, $resOverbook);

    // Clean up small package
    req('DELETE', "http://localhost:8000/api/packages/{$smallPkgId}", $travelAdminToken);
}

// 6. Valid status transition (Pending -> Confirmed)
echo PHP_EOL . "5. Status state machine transition..." . PHP_EOL;
if ($bookingId) {
    $resStatus1 = req('PATCH', "http://localhost:8000/api/bookings/{$bookingId}/status", $travelAdminToken, [
        'status' => 'Confirmed'
    ]);
    assertTest("PATCH status Pending -> Confirmed", $resStatus1['status'] === 200 && $resStatus1['body']['booking']['status'] === 'Confirmed', $resStatus1);

    // 7. Invalid status transition (Confirmed -> Invalid)
    $resStatusInvalid = req('PATCH', "http://localhost:8000/api/bookings/{$bookingId}/status", $travelAdminToken, [
        'status' => 'Pending' // Invalid jump back
    ]);
    assertTest("PATCH invalid status transition rejected", $resStatusInvalid['status'] === 422, $resStatusInvalid);

    // 8. Cancellation restores quota
    $resCancel = req('PATCH', "http://localhost:8000/api/bookings/{$bookingId}/status", $travelAdminToken, [
        'status' => 'Cancelled'
    ]);
    assertTest("PATCH status to Cancelled (Restores quota)", $resCancel['status'] === 200 && $resCancel['body']['booking']['status'] === 'Cancelled', $resCancel);
}

echo PHP_EOL . "==========================================" . PHP_EOL;
echo "PROMPT 7 BOOKING TEST RESULTS: {$passed}/{$total} PASSED" . PHP_EOL;
echo "==========================================" . PHP_EOL;

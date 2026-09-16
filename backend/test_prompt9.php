<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\JwtService;
use App\Models\User;
use App\Models\Package;
use App\Models\Jamaah;

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

echo "=== TRAVELOPS PROMPT 9: VISA, DOCUMENTS & DEPARTURE AUTOMATED TEST SUITE ===" . PHP_EOL . PHP_EOL;

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

$jamaah = Jamaah::first();
$jamaahId = $jamaah->custom_id ?? (string)$jamaah->id;

// 1. Visa Update & Verification
echo "1. Visa Verification & Management..." . PHP_EOL;
$resVisaUpdate = req('PUT', "http://localhost:8000/api/visa/{$jamaahId}", $travelAdminToken, [
    'passport' => 'VERIFIED',
    'visa' => 'VERIFIED',
    'vaccine' => 'VERIFIED'
]);
assertTest("PUT /api/visa/{jamaahId} update", $resVisaUpdate['status'] === 200 && ($resVisaUpdate['body']['visaRecord']['visa'] ?? '') === 'VERIFIED', $resVisaUpdate);

// 2. Operational Checklist
echo PHP_EOL . "2. Operational Checklist Query..." . PHP_EOL;
$resChecklist = req('GET', "http://localhost:8000/api/jamaah/{$jamaahId}/checklist", $travelAdminToken);
assertTest("GET /api/jamaah/{id}/checklist", $resChecklist['status'] === 200 && isset($resChecklist['body']['checklist']['visa_verified']), $resChecklist);

// 3. Document Verification RBAC Check
echo PHP_EOL . "3. Document Verification Security Check..." . PHP_EOL;
$resCustVerify = req('PATCH', 'http://localhost:8000/api/documents/DOC1001/verify', $jamaahToken, [
    'status' => 'Verified'
]);
assertTest("Customer blocked from self-verifying documents", $resCustVerify['status'] === 403, $resCustVerify);

// 4. Departure Schedule Management
echo PHP_EOL . "4. Departure Management..." . PHP_EOL;
$pkg = Package::first();
$pkgId = $pkg->custom_id ?? (string)$pkg->id;

$resCreateDep = req('POST', 'http://localhost:8000/api/departures', $travelAdminToken, [
    'package_id' => $pkgId,
    'kloter' => 'Kloter Test B',
    'flight_number' => 'GA-980',
    'airline' => 'Garuda Indonesia',
    'capacity' => 45
]);
assertTest("POST /api/departures (Travel Admin)", $resCreateDep['status'] === 201 && isset($resCreateDep['body']['departure']['id']), $resCreateDep);
$depId = $resCreateDep['body']['departure']['id'] ?? null;

if ($depId) {
    // Customer blocked from creating/modifying departures
    $resCustDep = req('POST', 'http://localhost:8000/api/departures', $jamaahToken, [
        'package_id' => $pkgId,
        'kloter' => 'Hacker Kloter'
    ]);
    assertTest("Customer blocked from creating departure schedule", $resCustDep['status'] === 403, $resCustDep);

    // Admin update status
    $resDepStatus = req('PATCH', "http://localhost:8000/api/departures/{$depId}/status", $travelAdminToken, [
        'status' => 'Ready'
    ]);
    assertTest("PATCH /api/departures/{id}/status to Ready", $resDepStatus['status'] === 200 && $resDepStatus['body']['departure']['status'] === 'Ready', $resDepStatus);

    // Cross-agency departure isolation check
    $resCrossDep = req('GET', "http://localhost:8000/api/departures/{$depId}", $barokahAdminToken);
    assertTest("Barokah Travel Admin blocked from Al-Haramain departure", $resCrossDep['status'] === 403, $resCrossDep);
}

echo PHP_EOL . "==========================================" . PHP_EOL;
echo "PROMPT 9 VISA & DEPARTURE TEST RESULTS: {$passed}/{$total} PASSED" . PHP_EOL;
echo "==========================================" . PHP_EOL;

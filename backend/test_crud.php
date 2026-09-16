<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\JwtService;
use App\Models\User;

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

echo "=== TRAVELOPS CORE DATA CRUD AUTOMATED TEST SUITE ===" . PHP_EOL . PHP_EOL;

$superAdminToken = getTokenForUser('superadmin@travelops.com');
$travelAdminToken = getTokenForUser('abdullah@alharamain.id');
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

// 1. PACKAGES CRUD
echo "--- 1. Packages Module ---" . PHP_EOL;
$res = req('GET', 'http://localhost:8000/api/packages', $superAdminToken);
assertTest("GET /api/packages (Super Admin)", $res['status'] === 200 && count($res['body']['packages'] ?? []) >= 1, "Count: " . count($res['body']['packages'] ?? []));

$resCreatePkg = req('POST', 'http://localhost:8000/api/packages', $travelAdminToken, [
    'name' => 'Umroh Ramadan Vip 2026',
    'price' => 45000000,
    'quota' => 40,
    'duration' => 12,
    'airline' => 'Garuda Indonesia'
]);
assertTest("POST /api/packages (Travel Admin)", $resCreatePkg['status'] === 201 && isset($resCreatePkg['body']['package']['id']), "ID: " . ($resCreatePkg['body']['package']['id'] ?? 'N/A'));
$newPkgId = $resCreatePkg['body']['package']['id'] ?? null;

if ($newPkgId) {
    $resPkgDetail = req('GET', "http://localhost:8000/api/packages/{$newPkgId}", $travelAdminToken);
    assertTest("GET /api/packages/{id}", $resPkgDetail['status'] === 200 && $resPkgDetail['body']['package']['name'] === 'Umroh Ramadan Vip 2026');

    $resDeletePkg = req('DELETE', "http://localhost:8000/api/packages/{$newPkgId}", $travelAdminToken);
    assertTest("DELETE /api/packages/{id}", $resDeletePkg['status'] === 200);
}

// 2. JAMAAH CRUD
echo PHP_EOL . "--- 2. Jamaah & Visa Module ---" . PHP_EOL;
$resJamaahList = req('GET', 'http://localhost:8000/api/jamaah', $travelAdminToken);
assertTest("GET /api/jamaah (Travel Admin)", $resJamaahList['status'] === 200 && is_array($resJamaahList['body']['jamaah'] ?? null), $resJamaahList);

$resCreateJamaah = req('POST', 'http://localhost:8000/api/jamaah', $travelAdminToken, [
    'name' => 'Ahmad Test Pilgrim',
    'phone' => '081234567890',
    'email' => 'ahmad.test@gmail.com',
    'gender' => 'L',
    'total_price' => 38000000,
    'paid_amount' => 10000000
]);
assertTest("POST /api/jamaah (Auto-creates linked Visa)", $resCreateJamaah['status'] === 201 && isset($resCreateJamaah['body']['jamaah']['id']), $resCreateJamaah);
$newJamaahId = $resCreateJamaah['body']['jamaah']['id'] ?? null;

if ($newJamaahId) {
    $resVisaDetail = req('GET', "http://localhost:8000/api/visa/{$newJamaahId}", $travelAdminToken);
    assertTest("GET /api/visa/{jamaahId} (Auto created visa)", $resVisaDetail['status'] === 200 && isset($resVisaDetail['body']['visaRecord']), $resVisaDetail);

    $resDeleteJamaah = req('DELETE', "http://localhost:8000/api/jamaah/{$newJamaahId}", $travelAdminToken);
    assertTest("DELETE /api/jamaah/{id} (Cascade deletes linked Visa)", $resDeleteJamaah['status'] === 200, $resDeleteJamaah);
}

// 3. TASKS CRUD
echo PHP_EOL . "--- 3. Operations Tasks Module ---" . PHP_EOL;
$resCreateTask = req('POST', 'http://localhost:8000/api/tasks', $travelAdminToken, [
    'title' => 'Verifikasi Paspor Kloter 2',
    'priority' => 'High',
    'category' => 'Pre-Departure'
]);
assertTest("POST /api/tasks", $resCreateTask['status'] === 201 && isset($resCreateTask['body']['task']['id']), $resCreateTask);
$newTaskId = $resCreateTask['body']['task']['id'] ?? null;

if ($newTaskId) {
    $resToggleTask = req('PATCH', "http://localhost:8000/api/tasks/{$newTaskId}/toggle", $travelAdminToken);
    assertTest("PATCH /api/tasks/{id}/toggle", $resToggleTask['status'] === 200 && $resToggleTask['body']['task']['completed'] === true);

    $resDeleteTask = req('DELETE', "http://localhost:8000/api/tasks/{$newTaskId}", $travelAdminToken);
    assertTest("DELETE /api/tasks/{id}", $resDeleteTask['status'] === 200);
}

// 4. FINANCE CRUD
echo PHP_EOL . "--- 4. Finance Module ---" . PHP_EOL;
$resFinanceSummary = req('GET', 'http://localhost:8000/api/finance/summary', $travelAdminToken);
assertTest("GET /api/finance/summary", $resFinanceSummary['status'] === 200 && isset($resFinanceSummary['body']['summary']['netBalance']));

$resCreateTx = req('POST', 'http://localhost:8000/api/finance', $travelAdminToken, [
    'amount' => 15000000,
    'type' => 'INCOME',
    'category' => 'Pelunas Umroh',
    'description' => 'Test Transaction'
]);
assertTest("POST /api/finance", $resCreateTx['status'] === 201 && isset($resCreateTx['body']['transaction']['id']));
$newTxId = $resCreateTx['body']['transaction']['id'] ?? null;

if ($newTxId) {
    $resDeleteTx = req('DELETE', "http://localhost:8000/api/finance/{$newTxId}", $travelAdminToken);
    assertTest("DELETE /api/finance/{id}", $resDeleteTx['status'] === 200);
}

// 5. NOTIFICATIONS
echo PHP_EOL . "--- 5. Notifications Module ---" . PHP_EOL;
$resCreateNotif = req('POST', 'http://localhost:8000/api/notifications', $travelAdminToken, [
    'titleEn' => 'Test Notification',
    'titleId' => 'Test Notifikasi',
    'type' => 'info'
]);
assertTest("POST /api/notifications", $resCreateNotif['status'] === 201 && isset($resCreateNotif['body']['notification']['id']));

$resMarkAllRead = req('PATCH', 'http://localhost:8000/api/notifications/read-all', $travelAdminToken);
assertTest("PATCH /api/notifications/read-all", $resMarkAllRead['status'] === 200);

echo PHP_EOL . "==========================================" . PHP_EOL;
echo "TEST RESULTS SUMMARY: {$passed}/{$total} PASSED" . PHP_EOL;
echo "==========================================" . PHP_EOL;

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

echo "=== RBAC & AUTHORIZATION AUTOMATED TEST SUITE ===" . PHP_EOL . PHP_EOL;

$superAdminToken = getTokenForUser('superadmin@travelops.com');
$travelAdminToken = getTokenForUser('abdullah@alharamain.id');
$opsStaffToken = getTokenForUser('siti@alharamain.id');
$fieldAgentToken = getTokenForUser('budi@partner.id');
$jamaahToken = getTokenForUser('pklkesatu7166@gmail.com');

// 1. Super Admin access /api/admin/users
echo "1. Super Admin accessing GET /api/admin/users..." . PHP_EOL;
$res = req('GET', 'http://localhost:8000/api/admin/users', $superAdminToken);
echo "   Status: {$res['status']} | Total Users Received: " . count($res['body']['users'] ?? []) . PHP_EOL;

// 2. Travel Admin access /api/admin/users (agency isolated)
echo "2. Travel Admin (Al-Haramain) accessing GET /api/admin/users..." . PHP_EOL;
$res = req('GET', 'http://localhost:8000/api/admin/users', $travelAdminToken);
echo "   Status: {$res['status']} | Total Users Received: " . count($res['body']['users'] ?? []) . " (Expected: agency users only)" . PHP_EOL;

// 3. Field Agent attempt access /api/admin/users
echo "3. Field Agent accessing GET /api/admin/users..." . PHP_EOL;
$res = req('GET', 'http://localhost:8000/api/admin/users', $fieldAgentToken);
echo "   Status: {$res['status']} (Expected: 403 Forbidden)" . PHP_EOL;

// 4. Jamaah/User attempt access /api/admin/users
echo "4. Jamaah accessing GET /api/admin/users..." . PHP_EOL;
$res = req('GET', 'http://localhost:8000/api/admin/users', $jamaahToken);
echo "   Status: {$res['status']} (Expected: 403 Forbidden)" . PHP_EOL;

// 5. Travel Admin attempt access Super Admin stats /api/admin/stats
echo "5. Travel Admin attempting GET /api/admin/stats..." . PHP_EOL;
$res = req('GET', 'http://localhost:8000/api/admin/stats', $travelAdminToken);
echo "   Status: {$res['status']} (Expected: 403 Forbidden)" . PHP_EOL;

// 6. Super Admin access /api/admin/stats
echo "6. Super Admin accessing GET /api/admin/stats..." . PHP_EOL;
$res = req('GET', 'http://localhost:8000/api/admin/stats', $superAdminToken);
echo "   Status: {$res['status']} | Active Users Stat: " . ($res['body']['stats']['activeUsers'] ?? 'N/A') . PHP_EOL;

// 7. Travel Admin attempt privilege escalation (creating Super Admin)
echo "7. Travel Admin attempting POST /api/admin/users to create Super Admin..." . PHP_EOL;
$res = req('POST', 'http://localhost:8000/api/admin/users', $travelAdminToken, [
    'name' => 'Hacker Admin',
    'email' => 'hacker@test.com',
    'role' => 'Super Admin'
]);
echo "   Status: {$res['status']} (Expected: 403 Forbidden)" . PHP_EOL;
echo "   Message: " . ($res['body']['message'] ?? 'N/A') . PHP_EOL;

// 8. Travel Admin access details of user in ANOTHER agency (Budi - Barokah Tour)
echo "8. Travel Admin (Al-Haramain) attempting GET /api/admin/users/usr_budi (Barokah Tour)..." . PHP_EOL;
$res = req('GET', 'http://localhost:8000/api/admin/users/usr_budi', $travelAdminToken);
echo "   Status: {$res['status']} (Expected: 403 Forbidden)" . PHP_EOL;

// 9. Travel Admin update user status (Suspended) for staff in same agency (usr_siti)
echo "9. Travel Admin suspending staff user in same agency (usr_siti)..." . PHP_EOL;
$res = req('PUT', 'http://localhost:8000/api/admin/users/usr_siti', $travelAdminToken, [
    'status' => 'Suspended'
]);
echo "   Status: {$res['status']} | Updated Status: " . ($res['body']['user']['status'] ?? 'N/A') . PHP_EOL;

// 10. Suspended user attempt login
echo "10. Suspended user (siti@alharamain.id) attempting login..." . PHP_EOL;
$res = req('POST', 'http://localhost:8000/api/auth/login', null, [
    'email' => 'siti@alharamain.id',
    'password' => 'password123'
]);
echo "   Status: {$res['status']} (Expected: 403 Forbidden)" . PHP_EOL;
echo "   Message: " . ($res['body']['message'] ?? 'N/A') . PHP_EOL;

// Re-activate user Siti for system consistency
req('PUT', 'http://localhost:8000/api/admin/users/usr_siti', $travelAdminToken, ['status' => 'Active']);
echo "   (Restored usr_siti status to Active)" . PHP_EOL;

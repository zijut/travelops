<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

function testPost($url, $data, $token = null) {
    $ch = curl_init($url);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $status, 'body' => json_decode($response, true)];
}

function testGet($url, $token = null) {
    $ch = curl_init($url);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $status, 'body' => json_decode($response, true)];
}

function testPut($url, $data, $token = null) {
    $ch = curl_init($url);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $status, 'body' => json_decode($response, true)];
}

echo "=== FULL AUTHENTICATION API TEST MATRIX ===" . PHP_EOL;

// 1. Test Login Existing Seeded User
echo "1. Testing Login (abdullah@alharamain.id)..." . PHP_EOL;
$loginRes = testPost('http://localhost:8000/api/auth/login', [
    'email' => 'abdullah@alharamain.id',
    'password' => 'password123'
]);
echo "   Status: {$loginRes['status']}" . PHP_EOL;
echo "   Response: " . json_encode($loginRes['body']) . PHP_EOL;
$token = $loginRes['body']['token'] ?? null;

// 2. Test Get Me (Authenticated)
if ($token) {
    echo "2. Testing GET /api/auth/me..." . PHP_EOL;
    $meRes = testGet('http://localhost:8000/api/auth/me', $token);
    echo "   Status: {$meRes['status']}" . PHP_EOL;
    echo "   User Email: " . ($meRes['body']['user']['email'] ?? 'N/A') . PHP_EOL;
}

// 3. Test Unauthenticated access to /api/auth/me
echo "3. Testing GET /api/auth/me without token..." . PHP_EOL;
$unauthRes = testGet('http://localhost:8000/api/auth/me');
echo "   Status: {$unauthRes['status']} (Expected: 401)" . PHP_EOL;

// 4. Test Update Profile
if ($token) {
    echo "4. Testing PUT /api/auth/profile..." . PHP_EOL;
    $profileRes = testPut('http://localhost:8000/api/auth/profile', [
        'phone' => '+62 812-9999-0000',
        'region' => 'Jakarta & Madinah'
    ], $token);
    echo "   Status: {$profileRes['status']}" . PHP_EOL;
    echo "   Updated Phone: " . ($profileRes['body']['user']['phone'] ?? 'N/A') . PHP_EOL;
}

// 5. Test Register New Unique User
$uniqueEmail = 'newuser_' . time() . '@agency.com';
echo "5. Testing Register ({$uniqueEmail})..." . PHP_EOL;
$regRes = testPost('http://localhost:8000/api/auth/register', [
    'name' => 'Bambang Tri',
    'email' => $uniqueEmail,
    'password' => 'secret123',
    'phone' => '+6281987654321',
    'agency' => 'Bambang Express Tour'
]);
echo "   Status: {$regRes['status']}" . PHP_EOL;
echo "   Message: " . ($regRes['body']['message'] ?? 'N/A') . PHP_EOL;
echo "   Token: " . (isset($regRes['body']['token']) ? 'GENERATED OK' : 'MISSING') . PHP_EOL;

// 6. Test Logout
if ($token) {
    echo "6. Testing POST /api/auth/logout..." . PHP_EOL;
    $logoutRes = testPost('http://localhost:8000/api/auth/logout', [], $token);
    echo "   Status: {$logoutRes['status']}" . PHP_EOL;
    echo "   Message: " . ($logoutRes['body']['message'] ?? 'N/A') . PHP_EOL;
}

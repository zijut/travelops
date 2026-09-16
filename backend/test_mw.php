<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Http\Middleware\RequireRole;
use Illuminate\Http\Request;

$middleware = new RequireRole();

// Test 1: Super Admin
$superAdmin = User::where('email', 'superadmin@travelops.com')->first();
$req1 = new Request();
$req1->setUserResolver(fn() => $superAdmin);
$res1 = $middleware->handle($req1, fn() => response('PASSED'), 'Super Admin', 'Travel Admin');
echo "Test 1 (Super Admin): " . ($res1->getContent() === 'PASSED' ? 'PASSED' : $res1->getStatusCode()) . PHP_EOL;

// Test 2: Travel Admin
$travelAdmin = User::where('email', 'abdullah@alharamain.id')->first();
$req2 = new Request();
$req2->setUserResolver(fn() => $travelAdmin);
$res2 = $middleware->handle($req2, fn() => response('PASSED'), 'Super Admin', 'Travel Admin');
echo "Test 2 (Travel Admin): " . ($res2->getContent() === 'PASSED' ? 'PASSED' : $res2->getStatusCode()) . PHP_EOL;

// Test 3: Field Agent
$fieldAgent = User::where('email', 'budi@partner.id')->first();
$req3 = new Request();
$req3->setUserResolver(fn() => $fieldAgent);
$res3 = $middleware->handle($req3, fn() => response('PASSED'), 'Super Admin', 'Travel Admin');
echo "Test 3 (Field Agent): " . ($res3->getContent() === 'PASSED' ? 'PASSED' : $res3->getStatusCode()) . PHP_EOL;

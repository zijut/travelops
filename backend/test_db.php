<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DATABASE RECORD VERIFICATION ===" . PHP_EOL;
echo "Agencies:      " . \App\Models\Agency::count() . PHP_EOL;
echo "Users:         " . \App\Models\User::count() . PHP_EOL;
echo "Packages:      " . \App\Models\Package::count() . PHP_EOL;
echo "Jamaah:        " . \App\Models\Jamaah::count() . PHP_EOL;
echo "Visas:         " . \App\Models\Visa::count() . PHP_EOL;
echo "Tasks:         " . \App\Models\Task::count() . PHP_EOL;
echo "Finances:      " . \App\Models\Finance::count() . PHP_EOL;
echo "Notifications: " . \App\Models\Notification::count() . PHP_EOL;
echo "AuditLogs:     " . \App\Models\AuditLog::count() . PHP_EOL;

echo PHP_EOL . "=== ELOQUENT RELATIONSHIP TEST ===" . PHP_EOL;
$agency = \App\Models\Agency::where('name', 'Al-Haramain Travel')->first();
if ($agency) {
    echo "Agency '{$agency->name}' has:" . PHP_EOL;
    echo " - Users: " . $agency->users()->count() . PHP_EOL;
    echo " - Packages: " . $agency->packages()->count() . PHP_EOL;
    echo " - Jamaah: " . $agency->jamaah()->count() . PHP_EOL;
    echo " - Tasks: " . $agency->tasks()->count() . PHP_EOL;
    echo " - Finances: " . $agency->finances()->count() . PHP_EOL;
}

$jamaah = \App\Models\Jamaah::where('custom_id', 'JMH001')->first();
if ($jamaah) {
    echo "Jamaah '{$jamaah->name}' (JMH001):" . PHP_EOL;
    echo " - Belongs to Agency: " . $jamaah->agency->name . PHP_EOL;
    echo " - Belongs to Package: " . ($jamaah->package ? $jamaah->package->name : 'N/A') . PHP_EOL;
    echo " - Has Visa Passport Status: " . ($jamaah->visa ? $jamaah->visa->passport_status : 'N/A') . PHP_EOL;
}

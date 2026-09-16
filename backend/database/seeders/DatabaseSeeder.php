<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\AuditLog;
use App\Models\Finance;
use App\Models\Jamaah;
use App\Models\Notification;
use App\Models\Package;
use App\Models\Task;
use App\Models\User;
use App\Models\Visa;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $jsonPath = base_path('../server/data/travelops_db.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("Source JSON file not found at: {$jsonPath}");
            return;
        }

        $rawContent = File::get($jsonPath);
        $data = json_decode($rawContent, true);

        if (!$data) {
            $this->command->error("Failed to parse JSON file.");
            return;
        }

        // 1. Seed Agencies
        $agencyMap = []; // agency_name => Agency model instance
        $agencyEmails = [
            'TravelOps Global Headquarter' => 'superadmin@travelops.com',
            'Al-Haramain Travel' => 'abdullah@alharamain.id',
            'Barokah Tour & Travel' => 'budi@partner.id',
        ];

        foreach ($agencyEmails as $agencyName => $email) {
            $agency = Agency::updateOrCreate(
                ['name' => $agencyName],
                [
                    'email' => $email,
                    'phone' => '+62 812-3456-7890',
                    'address' => 'Indonesia & Saudi Arabia',
                    'status' => 'Active',
                ]
            );
            $agencyMap[$agencyName] = $agency;
            $agencyMap[$email] = $agency; // Map by email as well
        }

        // Default fallback agency
        $defaultAgency = $agencyMap['Al-Haramain Travel'];

        // 2. Seed Users
        $userMap = []; // custom_id => User model instance
        if (isset($data['users']) && is_array($data['users'])) {
            foreach ($data['users'] as $u) {
                $agencyInstance = isset($u['agency']) && isset($agencyMap[$u['agency']]) 
                    ? $agencyMap[$u['agency']] 
                    : $defaultAgency;

                // Hash password securely or use existing bcrypt hash from server
                $password = isset($u['password']) && str_starts_with($u['password'], '$2b$')
                    ? Hash::make('password123') // standardize demo password securely
                    : Hash::make('password123');

                $user = User::updateOrCreate(
                    ['email' => $u['email']],
                    [
                        'custom_id' => $u['id'] ?? null,
                        'name' => $u['name'] ?? 'User',
                        'password' => $password,
                        'phone' => $u['phone'] ?? null,
                        'photo' => $u['photo'] ?? null,
                        'region' => $u['region'] ?? null,
                        'address' => $u['address'] ?? null,
                        'status' => $u['status'] ?? 'Active',
                    ]
                );

                // Set guarded attributes directly
                $user->role = $u['role'] ?? 'Travel Admin';
                $user->agency_id = $agencyInstance->id;
                $user->save();

                if (isset($u['id'])) {
                    $userMap[$u['id']] = $user;
                }
            }
        }

        // 3. Seed Packages
        $packageMap = []; // package_name => Package model
        if (isset($data['packages']) && is_array($data['packages'])) {
            foreach ($data['packages'] as $p) {
                $agencyInstance = isset($p['agencyEmail']) && isset($agencyMap[$p['agencyEmail']]) 
                    ? $agencyMap[$p['agencyEmail']] 
                    : $defaultAgency;

                $pkg = new Package([
                    'custom_id' => $p['id'] ?? null,
                    'name' => $p['name'],
                    'duration' => $p['duration'] ?? 12,
                    'price' => $p['price'] ?? 0,
                    'airline' => $p['airline'] ?? 'Saudia Airlines',
                    'hotel' => $p['hotel'] ?? '5 Bintang',
                    'hotel_makkah' => $p['hotelMakkah'] ?? null,
                    'hotel_madinah' => $p['hotelMadinah'] ?? null,
                    'quota' => $p['quota'] ?? 50,
                    'booked' => $p['booked'] ?? 0,
                    'status' => $p['status'] ?? 'Published',
                    'description' => $p['description'] ?? null,
                    'included' => $p['included'] ?? [],
                    'excluded' => $p['excluded'] ?? [],
                ]);

                $pkg->agency_id = $agencyInstance->id;
                $pkg->save();

                $packageMap[$p['name']] = $pkg;
            }
        }

        // 4. Seed Jamaah & Visa Records
        $jamaahMap = []; // custom_id => Jamaah model
        $visaRecords = $data['visaRecords'] ?? [];

        if (isset($data['jamaah']) && is_array($data['jamaah'])) {
            foreach ($data['jamaah'] as $j) {
                $agencyInstance = isset($j['agencyEmail']) && isset($agencyMap[$j['agencyEmail']]) 
                    ? $agencyMap[$j['agencyEmail']] 
                    : $defaultAgency;

                $pkgInstance = isset($j['package']) && isset($packageMap[$j['package']])
                    ? $packageMap[$j['package']]
                    : null;

                $jamaah = new Jamaah([
                    'custom_id' => $j['id'],
                    'name' => $j['name'],
                    'phone' => $j['phone'] ?? null,
                    'email' => $j['email'] ?? null,
                    'avatar_url' => $j['avatarUrl'] ?? null,
                    'package_name' => $j['package'] ?? null,
                    'departure_date' => $j['departureDate'] ?? null,
                    'status' => $j['status'] ?? 'Booked',
                    'kloter' => $j['kloter'] ?? 'Kloter A',
                    'passport_number' => $j['passportNumber'] ?? null,
                    'ktp_number' => $j['ktpNumber'] ?? null,
                    'gender' => $j['gender'] ?? null,
                    'blood_type' => $j['bloodType'] ?? null,
                    'city' => $j['city'] ?? null,
                    'emergency_contact_name' => $j['emergencyContactName'] ?? null,
                    'emergency_contact_phone' => $j['emergencyContactPhone'] ?? null,
                    'emergency_relation' => $j['emergencyRelation'] ?? null,
                    'hotel_makkah' => $j['hotelMakkah'] ?? null,
                    'room_makkah' => $j['roomMakkah'] ?? null,
                    'hotel_madinah' => $j['hotelMadinah'] ?? null,
                    'room_madinah' => $j['roomMadinah'] ?? null,
                    'room_type' => $j['roomType'] ?? null,
                    'bus_number' => $j['busNumber'] ?? null,
                    'bus_seat_number' => $j['busSeatNumber'] ?? null,
                    'total_price' => $j['totalPrice'] ?? 0,
                    'paid_amount' => $j['paidAmount'] ?? 0,
                    'payment_status' => $j['paymentStatus'] ?? 'Belum Bayar',
                    'visa_number' => $j['visaNumber'] ?? null,
                    'vaccine_status' => $j['vaccineStatus'] ?? 'Pending',
                ]);

                $jamaah->agency_id = $agencyInstance->id;
                $jamaah->package_id = $pkgInstance?->id;
                $jamaah->save();

                $jamaahMap[$j['id']] = $jamaah;

                // Create Visa record for this Jamaah
                $vData = $visaRecords[$j['id']] ?? null;
                Visa::create([
                    'jamaah_id' => $jamaah->id,
                    'passport_status' => $vData['passport'] ?? 'PENDING',
                    'visa_status' => $vData['visa'] ?? 'PENDING',
                    'ktp_status' => $vData['ktp'] ?? 'PENDING',
                    'vaccine_status' => $vData['vaccine'] ?? 'PENDING',
                    'passport_number' => $vData['passportNumber'] ?? $j['passportNumber'] ?? null,
                ]);
            }
        }

        // 5. Seed Tasks
        if (isset($data['tasks']) && is_array($data['tasks'])) {
            foreach ($data['tasks'] as $t) {
                $agencyInstance = isset($t['agencyEmail']) && isset($agencyMap[$t['agencyEmail']]) 
                    ? $agencyMap[$t['agencyEmail']] 
                    : $defaultAgency;

                $task = new Task([
                    'custom_id' => (string)($t['id'] ?? null),
                    'title' => $t['title'],
                    'category' => $t['category'] ?? 'Pre-Departure',
                    'due_date' => $t['dueDate'] ?? null,
                    'completed' => $t['completed'] ?? false,
                    'assignee' => $t['assignee'] ?? null,
                    'priority' => $t['priority'] ?? 'Medium',
                    'description' => $t['description'] ?? null,
                    'subtasks' => $t['subtasks'] ?? [],
                    'kloter' => $t['kloter'] ?? null,
                ]);

                $task->agency_id = $agencyInstance->id;
                $task->save();
            }
        }

        // 6. Seed Finance Records
        if (isset($data['finance']) && is_array($data['finance'])) {
            foreach ($data['finance'] as $f) {
                $agencyInstance = isset($f['agencyEmail']) && isset($agencyMap[$f['agencyEmail']]) 
                    ? $agencyMap[$f['agencyEmail']] 
                    : $defaultAgency;

                $fin = new Finance([
                    'custom_id' => $f['id'] ?? null,
                    'date' => $f['date'] ?? now()->toDateString(),
                    'category' => $f['category'] ?? 'General',
                    'description' => $f['description'] ?? null,
                    'amount' => $f['amount'] ?? 0,
                    'type' => $f['type'] ?? 'EXPENSE',
                    'status' => $f['status'] ?? 'COMPLETED',
                ]);

                $fin->agency_id = $agencyInstance->id;
                $fin->save();
            }
        }

        // 7. Seed Notifications
        if (isset($data['notifications']) && is_array($data['notifications'])) {
            foreach ($data['notifications'] as $n) {
                $agencyInstance = isset($n['agencyEmail']) && isset($agencyMap[$n['agencyEmail']]) 
                    ? $agencyMap[$n['agencyEmail']] 
                    : $defaultAgency;

                $notif = new Notification([
                    'custom_id' => (string)($n['id'] ?? null),
                    'title_en' => $n['titleEn'] ?? '',
                    'title_id' => $n['titleId'] ?? '',
                    'desc_en' => $n['descEn'] ?? '',
                    'desc_id' => $n['descId'] ?? '',
                    'timestamp_str' => $n['timestamp'] ?? 'Just now',
                    'read' => $n['read'] ?? false,
                    'type' => $n['type'] ?? 'info',
                ]);

                $notif->agency_id = $agencyInstance->id;
                $notif->save();
            }
        }

        // 8. Seed Audit Logs
        if (isset($data['auditLogs']) && is_array($data['auditLogs'])) {
            foreach ($data['auditLogs'] as $al) {
                $userInstance = isset($al['userId']) && isset($userMap[$al['userId']])
                    ? $userMap[$al['userId']]
                    : null;

                $log = new AuditLog([
                    'custom_id' => $al['id'] ?? null,
                    'logged_at' => $al['timestamp'] ?? now(),
                    'user_name' => $al['userName'] ?? 'System',
                    'role' => $al['role'] ?? 'System',
                    'action' => $al['action'] ?? 'UNKNOWN',
                    'details' => $al['details'] ?? null,
                    'ip_address' => $al['ipAddress'] ?? '127.0.0.1',
                    'status' => $al['status'] ?? 'SUCCESS',
                ]);

                $log->user_id = $userInstance?->id;
                $log->save();
            }
        }

        $this->command->info('TravelOps database migrated and seeded successfully!');
    }
}

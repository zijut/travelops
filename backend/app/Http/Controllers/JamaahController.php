<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Jamaah;
use App\Models\Package;
use App\Models\Visa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class JamaahController extends Controller
{
    /**
     * Format Jamaah object to match frontend expectations
     */
    private function formatJamaah(Jamaah $j): array
    {
        $j->loadMissing(['package', 'visa', 'agency']);

        return [
            'id' => $j->custom_id ?? (string)$j->id,
            'db_id' => $j->id,
            'name' => $j->name,
            'phone' => $j->phone ?? '',
            'email' => $j->email ?? '',
            'avatar_url' => $j->avatar_url ?? "https://picsum.photos/seed/{$j->id}/100/100",
            'package_name' => $j->package ? $j->package->name : ($j->package_name ?? 'Paket Standard'),
            'package_id' => $j->package ? ($j->package->custom_id ?? (string)$j->package->id) : null,
            'departure_date' => $j->departure_date ? (is_string($j->departure_date) ? substr($j->departure_date, 0, 10) : $j->departure_date->format('Y-m-d')) : null,
            'status' => $j->status ?? 'Booked',
            'kloter' => $j->kloter ?? 'Kloter 1',
            'passport_number' => $j->passport_number ?? '',
            'passport_expiry' => $j->passport_expiry ? (is_string($j->passport_expiry) ? substr($j->passport_expiry, 0, 10) : $j->passport_expiry->format('Y-m-d')) : null,
            'ktp_number' => $j->ktp_number ?? '',
            'birth_date' => $j->birth_date ? (is_string($j->birth_date) ? substr($j->birth_date, 0, 10) : $j->birth_date->format('Y-m-d')) : null,
            'gender' => $j->gender ?? 'L',
            'blood_type' => $j->blood_type ?? 'O',
            'city' => $j->city ?? 'Jakarta',
            'emergency_contact' => [
                'name' => $j->emergency_contact_name ?? '',
                'phone' => $j->emergency_contact_phone ?? '',
                'relation' => $j->emergency_relation ?? '',
            ],
            'hotel_makkah' => $j->hotel_makkah ?? 'Hotel Makkah 5*',
            'room_makkah' => $j->room_makkah ?? '101',
            'hotel_madinah' => $j->hotel_madinah ?? 'Hotel Madinah 5*',
            'room_madinah' => $j->room_madinah ?? '201',
            'room_type' => $j->room_type ?? 'Quad',
            'bus_number' => $j->bus_number ?? 'Bus 01',
            'bus_seat_number' => $j->bus_seat_number ?? 1,
            'total_price' => (float)($j->total_price ?? 35000000),
            'paid_amount' => (float)($j->paid_amount ?? 0),
            'payment_status' => $j->payment_status ?? 'DP',
            'visa_number' => $j->visa ? $j->visa->passport_number : ($j->visa_number ?? ''),
            'visa_issue_date' => $j->visa_issue_date ? (is_string($j->visa_issue_date) ? substr($j->visa_issue_date, 0, 10) : $j->visa_issue_date->format('Y-m-d')) : null,
            'visa_expiry_date' => $j->visa_expiry_date ? (is_string($j->visa_expiry_date) ? substr($j->visa_expiry_date, 0, 10) : $j->visa_expiry_date->format('Y-m-d')) : null,
            'vaccine_status' => $j->vaccine_status ?? 'Verified',
            'agencyEmail' => $j->agency ? $j->agency->email : null,
            'createdAt' => $j->created_at ? $j->created_at->toISOString() : null,
        ];
    }

    /**
     * GET /api/jamaah - Retrieve jamaah list (Agency isolated & Jamaah role isolated)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Jamaah::with(['package', 'visa', 'agency']);

        if ($user->role === 'Jamaah' || $user->role === 'User') {
            $query->where('email', $user->email);
        } elseif ($user->role !== 'Super Admin') {
            $query->where('agency_id', $user->agency_id);
        }

        $jamaahs = $query->orderBy('created_at', 'desc')->get()->map(fn ($j) => $this->formatJamaah($j));

        return response()->json([
            'success' => true,
            'jamaah' => $jamaahs,
        ]);
    }

    /**
     * GET /api/jamaah/{id} - Retrieve single jamaah
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $j = Jamaah::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$j) {
            return response()->json([
                'success' => false,
                'message' => 'Jamaah record not found.',
            ], 404);
        }

        if ($user->role === 'Jamaah' || $user->role === 'User') {
            if (strtolower($j->email) !== strtolower($user->email)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this jamaah record.',
                ], 403);
            }
        } elseif ($user->role !== 'Super Admin' && $j->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this jamaah record.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'jamaah' => $this->formatJamaah($j),
        ]);
    }

    /**
     * POST /api/jamaah - Create jamaah with auto Visa record in DB Transaction
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'passport_number' => 'nullable|string|max:100',
            'ktp_number' => 'nullable|string|max:100',
            'package_id' => 'nullable|string',
            'gender' => 'nullable|string|in:L,P',
            'total_price' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
        ], [
            'name.required' => 'Jamaah name is required.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        return DB::transaction(function () use ($request, $user) {
            $pkg = null;
            if ($request->filled('package_id')) {
                $pkg = Package::where('custom_id', $request->input('package_id'))
                    ->orWhere('id', $request->input('package_id'))
                    ->first();
            }

            $newJamaah = new Jamaah([
                'custom_id' => 'JAM' . sprintf('%04d', rand(1000, 9999)),
                'name' => trim($request->input('name')),
                'phone' => $request->input('phone', ''),
                'email' => strtolower($request->input('email', '')),
                'avatar_url' => $request->input('avatar_url', "https://picsum.photos/seed/" . rand(1, 1000) . "/100/100"),
                'package_name' => $pkg ? $pkg->name : $request->input('package_name', 'Paket Standard'),
                'departure_date' => $pkg ? $pkg->departure_date : $request->input('departure_date', now()->addMonth()),
                'status' => $request->input('status', 'Booked'),
                'kloter' => $request->input('kloter', 'Kloter 1'),
                'passport_number' => $request->input('passport_number', 'A' . rand(1000000, 9999999)),
                'passport_expiry' => $request->input('passport_expiry', now()->addYears(5)),
                'ktp_number' => $request->input('ktp_number', '320' . rand(100000000000, 999999999999)),
                'birth_date' => $request->input('birth_date', '1985-05-15'),
                'gender' => $request->input('gender', 'L'),
                'blood_type' => $request->input('blood_type', 'O'),
                'city' => $request->input('city', 'Jakarta'),
                'emergency_contact_name' => $request->input('emergency_contact.name', $request->input('emergency_contact_name', '')),
                'emergency_contact_phone' => $request->input('emergency_contact.phone', $request->input('emergency_contact_phone', '')),
                'emergency_relation' => $request->input('emergency_contact.relation', $request->input('emergency_relation', 'Family')),
                'hotel_makkah' => $request->input('hotel_makkah', 'Hotel Makkah 5*'),
                'room_makkah' => $request->input('room_makkah', '101'),
                'hotel_madinah' => $request->input('hotel_madinah', 'Hotel Madinah 5*'),
                'room_madinah' => $request->input('room_madinah', '201'),
                'room_type' => $request->input('room_type', 'Quad'),
                'bus_number' => $request->input('bus_number', 'Bus 01'),
                'bus_seat_number' => (int)$request->input('bus_seat_number', 1),
                'total_price' => (float)$request->input('total_price', $pkg ? $pkg->price : 35000000),
                'paid_amount' => (float)$request->input('paid_amount', 10000000),
                'payment_status' => $request->input('payment_status', 'DP'),
                'visa_number' => $request->input('visa_number', ''),
                'vaccine_status' => $request->input('vaccine_status', 'Verified'),
            ]);

            $newJamaah->agency_id = $user->agency_id;
            if ($pkg) {
                $newJamaah->package_id = $pkg->id;
                $pkg->increment('booked');
            }
            $newJamaah->save();

            // Auto create linked Visa record
            $visa = new Visa([
                'passport_status' => 'VERIFIED',
                'visa_status' => 'VERIFIED',
                'ktp_status' => 'VERIFIED',
                'vaccine_status' => 'VERIFIED',
                'passport_number' => $newJamaah->passport_number,
            ]);
            $visa->jamaah_id = $newJamaah->id;
            $visa->save();

            AuditLog::create([
                'custom_id' => 'log_' . uniqid(),
                'logged_at' => now(),
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $user->role,
                'action' => 'CREATE_JAMAAH',
                'details' => "Registered new jamaah \"{$newJamaah->name}\" ({$newJamaah->custom_id}).",
                'ip_address' => $request->ip() ?? '127.0.0.1',
                'status' => 'SUCCESS',
            ]);

            return response()->json([
                'success' => true,
                'jamaah' => $this->formatJamaah($newJamaah),
            ], 201);
        });
    }

    /**
     * PUT /api/jamaah/{id} - Update jamaah details
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $j = Jamaah::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$j) {
            return response()->json([
                'success' => false,
                'message' => 'Jamaah record not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $j->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to update this jamaah record.',
            ], 403);
        }

        if ($request->filled('name')) $j->name = trim($request->input('name'));
        if ($request->has('phone')) $j->phone = $request->input('phone');
        if ($request->has('email')) $j->email = strtolower($request->input('email'));
        if ($request->has('status')) $j->status = $request->input('status');
        if ($request->has('kloter')) $j->kloter = $request->input('kloter');
        if ($request->has('passport_number')) $j->passport_number = $request->input('passport_number');
        if ($request->has('ktp_number')) $j->ktp_number = $request->input('ktp_number');
        if ($request->has('payment_status')) $j->payment_status = $request->input('payment_status');
        if ($request->has('total_price')) $j->total_price = (float)$request->input('total_price');
        if ($request->has('paid_amount')) $j->paid_amount = (float)$request->input('paid_amount');

        $j->save();

        return response()->json([
            'success' => true,
            'jamaah' => $this->formatJamaah($j),
        ]);
    }

    /**
     * DELETE /api/jamaah/{id} - Delete jamaah record
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $j = Jamaah::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$j) {
            return response()->json([
                'success' => false,
                'message' => 'Jamaah record not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $j->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to delete this jamaah record.',
            ], 403);
        }

        return DB::transaction(function () use ($j, $user, $request) {
            $name = $j->name;
            $customId = $j->custom_id;

            // Delete associated visa record
            Visa::where('jamaah_id', $j->id)->delete();
            $j->delete();

            AuditLog::create([
                'custom_id' => 'log_' . uniqid(),
                'logged_at' => now(),
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $user->role,
                'action' => 'DELETE_JAMAAH',
                'details' => "Deleted jamaah \"{$name}\" ({$customId}).",
                'ip_address' => $request->ip() ?? '127.0.0.1',
                'status' => 'SUCCESS',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Jamaah record deleted successfully.',
            ]);
        });
    }
}

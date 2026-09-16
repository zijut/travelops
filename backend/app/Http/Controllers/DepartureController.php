<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Departure;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DepartureController extends Controller
{
    /**
     * Format Departure object
     */
    private function formatDeparture(Departure $d): array
    {
        $d->loadMissing(['package', 'agency']);

        return [
            'id' => $d->custom_id ?? (string)$d->id,
            'db_id' => $d->id,
            'package_id' => $d->package ? ($d->package->custom_id ?? (string)$d->package->id) : null,
            'package_name' => $d->package ? $d->package->name : 'N/A',
            'kloter' => $d->kloter,
            'flight_number' => $d->flight_number,
            'airline' => $d->airline,
            'departure_date' => $d->departure_date ? $d->departure_date->toISOString() : null,
            'departure_location' => $d->departure_location,
            'capacity' => $d->capacity,
            'participants_count' => $d->participants_count,
            'remaining_capacity' => $d->remainingCapacity(),
            'status' => $d->status,
            'agencyEmail' => $d->agency ? $d->agency->email : null,
            'createdAt' => $d->created_at ? $d->created_at->toISOString() : null,
        ];
    }

    /**
     * GET /api/departures - Get departures list (Filtered by agency)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Departure::with(['package', 'agency']);

        if ($user->role !== 'Super Admin') {
            $query->where('agency_id', $user->agency_id);
        }

        $departures = $query->orderBy('departure_date', 'asc')->get()->map(fn ($d) => $this->formatDeparture($d));

        return response()->json([
            'success' => true,
            'departures' => $departures,
        ]);
    }

    /**
     * GET /api/departures/{id} - Get departure detail
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $d = Departure::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$d) {
            return response()->json(['success' => false, 'message' => 'Departure record not found.'], 404);
        }

        if ($user->role !== 'Super Admin' && $d->agency_id !== $user->agency_id) {
            return response()->json(['success' => false, 'message' => 'Access denied to this departure schedule.'], 403);
        }

        return response()->json([
            'success' => true,
            'departure' => $this->formatDeparture($d),
        ]);
    }

    /**
     * POST /api/departures - Create departure schedule (Super Admin & Travel Admin)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['Jamaah', 'User'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only Administrators can create departure schedules.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'package_id' => 'required|string',
            'kloter' => 'nullable|string|max:100',
            'flight_number' => 'nullable|string|max:100',
            'airline' => 'nullable|string|max:100',
            'departure_date' => 'nullable|date',
            'departure_location' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $pkg = Package::where('custom_id', $request->input('package_id'))
            ->orWhere('id', $request->input('package_id'))
            ->first();

        if (!$pkg) {
            return response()->json(['success' => false, 'message' => 'Package not found.'], 404);
        }

        $dep = new Departure([
            'custom_id' => 'DEP' . sprintf('%04d', rand(1000, 9999)),
            'kloter' => $request->input('kloter', 'Kloter 1'),
            'flight_number' => $request->input('flight_number', 'SV-816'),
            'airline' => $request->input('airline', 'Saudia Airlines'),
            'departure_date' => $request->input('departure_date', now()->addMonth()),
            'departure_location' => $request->input('departure_location', 'Bandara Soekarno-Hatta (CGK), Terminal 3'),
            'capacity' => (int)$request->input('capacity', $pkg->quota ?? 45),
            'participants_count' => (int)$request->input('participants_count', $pkg->booked ?? 0),
            'status' => 'Scheduled',
        ]);

        $dep->agency_id = $pkg->agency_id;
        $dep->package_id = $pkg->id;
        $dep->save();

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'action' => 'CREATE_DEPARTURE',
            'details' => "Scheduled departure flight {$dep->flight_number} ({$dep->kloter}).",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Departure schedule created successfully!',
            'departure' => $this->formatDeparture($dep),
        ], 201);
    }

    /**
     * PUT /api/departures/{id} - Update departure
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['Jamaah', 'User'])) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $dep = Departure::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$dep) {
            return response()->json(['success' => false, 'message' => 'Departure schedule not found.'], 404);
        }

        if ($user->role !== 'Super Admin' && $dep->agency_id !== $user->agency_id) {
            return response()->json(['success' => false, 'message' => 'Access denied to this departure schedule.'], 403);
        }

        if ($request->has('kloter')) $dep->kloter = $request->input('kloter');
        if ($request->has('flight_number')) $dep->flight_number = $request->input('flight_number');
        if ($request->has('airline')) $dep->airline = $request->input('airline');
        if ($request->has('departure_date')) $dep->departure_date = $request->input('departure_date');
        if ($request->has('departure_location')) $dep->departure_location = $request->input('departure_location');
        if ($request->has('capacity')) $dep->capacity = (int)$request->input('capacity');
        if ($request->has('status')) $dep->status = $request->input('status');

        $dep->save();

        return response()->json([
            'success' => true,
            'message' => 'Departure schedule updated successfully!',
            'departure' => $this->formatDeparture($dep),
        ]);
    }

    /**
     * PATCH /api/departures/{id}/status - Update status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['Jamaah', 'User'])) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:Scheduled,Ready,Departed,Completed,Cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $dep = Departure::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$dep) {
            return response()->json(['success' => false, 'message' => 'Departure schedule not found.'], 404);
        }

        if ($user->role !== 'Super Admin' && $dep->agency_id !== $user->agency_id) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        $dep->status = $request->input('status');
        $dep->save();

        return response()->json([
            'success' => true,
            'message' => "Departure status updated to {$dep->status}.",
            'departure' => $this->formatDeparture($dep),
        ]);
    }
}

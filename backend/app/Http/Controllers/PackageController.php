<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PackageController extends Controller
{
    /**
     * Format Package response for frontend compatibility
     */
    private function formatPackage(Package $pkg): array
    {
        return [
            'id' => $pkg->custom_id ?? (string)$pkg->id,
            'db_id' => $pkg->id,
            'name' => $pkg->name,
            'duration' => $pkg->duration ?? 9,
            'price' => (float)$pkg->price,
            'airline' => $pkg->airline ?? 'Saudia Airlines',
            'hotel' => $pkg->hotel ?? '5 Bintang',
            'hotel_makkah' => $pkg->hotel_makkah ?? $pkg->hotel,
            'hotel_madinah' => $pkg->hotel_madinah ?? $pkg->hotel,
            'quota' => $pkg->quota ?? 50,
            'booked' => $pkg->booked ?? 0,
            'status' => $pkg->status ?? 'Draft',
            'departure_date' => $pkg->departure_date ? $pkg->departure_date->format('Y-m-d') : null,
            'return_date' => $pkg->return_date ? $pkg->return_date->format('Y-m-d') : null,
            'description' => $pkg->description ?? '',
            'included' => $pkg->included ?? [],
            'excluded' => $pkg->excluded ?? [],
            'agencyEmail' => $pkg->agency ? $pkg->agency->email : null,
            'createdAt' => $pkg->created_at ? $pkg->created_at->toISOString() : null,
        ];
    }

    /**
     * GET /api/packages - Get all packages (Filtered by agency for non-Super Admin)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Package::with('agency');

        if ($user->role !== 'Super Admin') {
            $query->where('agency_id', $user->agency_id);
        }

        $packages = $query->orderBy('created_at', 'desc')->get()->map(fn ($p) => $this->formatPackage($p));

        return response()->json([
            'success' => true,
            'packages' => $packages,
        ]);
    }

    /**
     * GET /api/packages/{id} - Get single package details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $pkg = Package::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$pkg) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $pkg->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this package.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'package' => $this->formatPackage($pkg),
        ]);
    }

    /**
     * POST /api/packages - Create package (Super Admin & Travel Admin)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'duration' => 'nullable|integer|min:1',
            'price' => 'required|numeric|min:0',
            'airline' => 'nullable|string|max:255',
            'hotel' => 'nullable|string|max:255',
            'quota' => 'nullable|integer|min:0',
            'booked' => 'nullable|integer|min:0',
            'status' => 'nullable|string|in:Draft,Published,Sold Out',
            'departure_date' => 'nullable|date',
            'return_date' => 'nullable|date',
        ], [
            'name.required' => 'Package name is required.',
            'price.required' => 'Price is required.',
            'price.numeric' => 'Price must be a valid positive number.',
            'quota.min' => 'Quota cannot be negative.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $quota = (int)$request->input('quota', 50);
        $booked = (int)$request->input('booked', 0);

        if ($booked > $quota) {
            return response()->json([
                'success' => false,
                'message' => 'Booked slots cannot exceed total quota.',
            ], 400);
        }

        $status = $request->input('status');
        if (!$status) {
            $status = ($booked >= $quota) ? 'Sold Out' : 'Draft';
        }

        $pkg = new Package([
            'custom_id' => 'PKG' . sprintf('%04d', rand(1000, 9999)),
            'name' => trim($request->input('name')),
            'duration' => (int)$request->input('duration', 9),
            'price' => (float)$request->input('price'),
            'airline' => $request->input('airline', 'Saudia Airlines'),
            'hotel' => $request->input('hotel', '5 Bintang'),
            'hotel_makkah' => $request->input('hotel_makkah', $request->input('hotel', '5 Bintang')),
            'hotel_madinah' => $request->input('hotel_madinah', $request->input('hotel', '5 Bintang')),
            'quota' => $quota,
            'booked' => $booked,
            'status' => $status,
            'departure_date' => $request->input('departure_date'),
            'return_date' => $request->input('return_date'),
            'description' => $request->input('description', ''),
            'included' => $request->input('included', []),
            'excluded' => $request->input('excluded', []),
        ]);

        $pkg->agency_id = $user->agency_id;
        $pkg->save();

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'action' => 'CREATE_PACKAGE',
            'details' => "Created package \"{$pkg->name}\" ({$pkg->custom_id}).",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'package' => $this->formatPackage($pkg),
        ], 201);
    }

    /**
     * PUT /api/packages/{id} - Update package (Super Admin & Travel Admin)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $pkg = Package::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$pkg) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $pkg->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to update this package.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'duration' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'airline' => 'nullable|string|max:255',
            'hotel' => 'nullable|string|max:255',
            'quota' => 'nullable|integer|min:0',
            'booked' => 'nullable|integer|min:0',
            'status' => 'nullable|string|in:Draft,Published,Sold Out',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        if ($request->filled('name')) $pkg->name = trim($request->input('name'));
        if ($request->has('duration')) $pkg->duration = (int)$request->input('duration');
        if ($request->has('price')) $pkg->price = (float)$request->input('price');
        if ($request->has('airline')) $pkg->airline = $request->input('airline');
        if ($request->has('hotel')) $pkg->hotel = $request->input('hotel');
        if ($request->has('quota')) $pkg->quota = (int)$request->input('quota');
        if ($request->has('booked')) $pkg->booked = (int)$request->input('booked');
        if ($request->has('status')) $pkg->status = $request->input('status');
        if ($request->has('departure_date')) $pkg->departure_date = $request->input('departure_date');
        if ($request->has('return_date')) $pkg->return_date = $request->input('return_date');

        $pkg->save();

        return response()->json([
            'success' => true,
            'package' => $this->formatPackage($pkg),
        ]);
    }

    /**
     * DELETE /api/packages/{id} - Delete package
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $pkg = Package::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$pkg) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $pkg->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to delete this package.',
            ], 403);
        }

        $name = $pkg->name;
        $customId = $pkg->custom_id;
        $pkg->delete();

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'action' => 'DELETE_PACKAGE',
            'details' => "Deleted package \"{$name}\" ({$customId}).",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Package deleted successfully.',
        ]);
    }
}

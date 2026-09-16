<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Issue a JWT token compatible with both Express backend and Laravel backend
     */
    private function generateJwtToken(User $user): string
    {
        $jwtSecret = env('JWT_SECRET', 'travelops-super-secret-jwt-key-2026-production');
        
        $payload = [
            'id' => $user->custom_id ?? (string)$user->id,
            'email' => $user->email,
            'role' => $user->role,
            'iat' => time(),
            'exp' => time() + (7 * 24 * 60 * 60), // 7 days expiration
        ];

        return JwtService::encode($payload, $jwtSecret);
    }

    /**
     * Format user array to match frontend React expected shape
     */
    private function formatUserResponse(User $user): array
    {
        $user->loadMissing('agency');

        return [
            'id' => $user->custom_id ?? (string)$user->id,
            'db_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? '',
            'photo' => $user->photo ?? "https://picsum.photos/seed/{$user->id}/100/100",
            'agency' => $user->agency ? $user->agency->name : 'TravelOps Global Headquarter',
            'agencyEmail' => $user->agency ? $user->agency->email : $user->email,
            'role' => $user->role,
            'region' => $user->region ?? 'Indonesia & Saudi Arabia',
            'address' => $user->address ?? '',
            'status' => $user->status ?? 'Active',
            'createdAt' => $user->created_at ? $user->created_at->toISOString() : now()->toISOString(),
            'lastLogin' => $user->last_login_at ? $user->last_login_at->toISOString() : null,
        ];
    }

    /**
     * POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:50',
            'agency' => 'nullable|string|max:255',
            'role' => 'nullable|string',
            'region' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ], [
            'name.required' => 'Name, email, and password are required fields.',
            'email.required' => 'Name, email, and password are required fields.',
            'password.required' => 'Name, email, and password are required fields.',
            'email.unique' => 'Email address is already registered. Please sign in.',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $message = $errors->first();
            
            $statusCode = $errors->has('email') && str_contains($errors->first('email'), 'already registered') ? 409 : 400;

            return response()->json([
                'success' => false,
                'message' => $message,
            ], $statusCode);
        }

        $roleRequested = $request->input('role');
        if ($roleRequested === 'Super Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Registration as Super Admin is forbidden.',
            ], 403);
        }

        $assignedRole = in_array($roleRequested, ['Travel Admin', 'Ops Staff', 'Field Agent']) 
            ? $roleRequested 
            : 'Travel Admin';

        $agencyName = $request->input('agency') ?: ($request->input('name') . ' Group Travel');
        
        $agency = Agency::firstOrCreate(
            ['name' => $agencyName],
            [
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'address' => $request->input('address'),
                'status' => 'Active',
            ]
        );

        $user = new User([
            'custom_id' => 'usr_' . uniqid(),
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'phone' => $request->input('phone', ''),
            'region' => $request->input('region', 'Indonesia & Saudi Arabia'),
            'address' => $request->input('address', 'Kantor Pusat ' . $request->input('name')),
            'status' => 'Active',
        ]);

        // Explicitly set guarded attributes
        $user->role = $assignedRole;
        $user->agency_id = $agency->id;
        $user->save();

        // Create JWT Token
        $token = $this->generateJwtToken($user);

        // Log Audit
        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'action' => 'USER_REGISTER',
            'details' => "New agency account registered for {$agency->name} ({$user->email}).",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful!',
            'token' => $token,
            'user' => $this->formatUserResponse($user),
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'Please provide both email address and password.',
            'password.required' => 'Please provide both email address and password.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $user = User::where('email', $request->input('email'))->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email address not found in our database.',
            ], 401);
        }

        if ($user->status === 'Suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended by an Administrator.',
            ], 403);
        }

        if (!Hash::check($request->input('password'), $user->password)) {
            AuditLog::create([
                'custom_id' => 'log_' . uniqid(),
                'logged_at' => now(),
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $user->role,
                'action' => 'FAILED_LOGIN',
                'details' => "Invalid password attempt for account {$user->email}.",
                'ip_address' => $request->ip() ?? '127.0.0.1',
                'status' => 'FAILED',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Incorrect password. Please verify and try again.',
            ], 401);
        }

        // Update last login
        $user->last_login_at = now();
        $user->save();

        // Issue JWT Token
        $token = $this->generateJwtToken($user);

        // Log Audit
        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'action' => 'USER_LOGIN',
            'details' => "User {$user->name} logged into " . ($user->agency ? $user->agency->name : 'TravelOps') . ".",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Logged in successfully!',
            'token' => $token,
            'user' => $this->formatUserResponse($user),
        ]);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'user' => $this->formatUserResponse($user),
        ]);
    }

    /**
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        if ($request->has('name')) {
            $user->name = $request->input('name');
        }
        if ($request->has('phone')) {
            $user->phone = $request->input('phone');
        }
        if ($request->has('photo')) {
            $user->photo = $request->input('photo');
        }
        if ($request->has('region')) {
            $user->region = $request->input('region');
        }
        if ($request->has('address')) {
            $user->address = $request->input('address');
        }
        if ($request->filled('password') && strlen(trim($request->input('password'))) >= 6) {
            $user->password = Hash::make($request->input('password'));
        }

        $user->save();

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'action' => 'PROFILE_UPDATE',
            'details' => "User profile updated for {$user->email}.",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully!',
            'user' => $this->formatUserResponse($user),
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            AuditLog::create([
                'custom_id' => 'log_' . uniqid(),
                'logged_at' => now(),
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $user->role,
                'action' => 'USER_LOGOUT',
                'details' => "User {$user->name} logged out.",
                'ip_address' => $request->ip() ?? '127.0.0.1',
                'status' => 'SUCCESS',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}

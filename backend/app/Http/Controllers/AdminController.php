<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\AuditLog;
use App\Models\Finance;
use App\Models\Jamaah;
use App\Models\Package;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Format user data safely for API response (hides password hashes)
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
     * GET /api/admin/users - Get platform users
     */
    public function index(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        if (Gate::denies('viewAny', User::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. You do not have permission to view user management list.'
            ], 403);
        }

        $query = User::with('agency');

        // Agency isolation: Travel Admin & Ops Staff only get users in their agency
        if ($currentUser->role !== 'Super Admin') {
            $query->where('agency_id', $currentUser->agency_id);
        }

        $users = $query->get()->map(fn ($u) => $this->formatUserResponse($u));

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    /**
     * GET /api/admin/users/{id} - Get user detail by custom_id or numeric ID
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $targetUser = User::where('custom_id', $id)
            ->orWhere('id', $id)
            ->first();

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        if (Gate::denies('view', $targetUser)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. User belongs to another agency.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'user' => $this->formatUserResponse($targetUser),
        ]);
    }

    /**
     * POST /api/admin/users - Create new user from Admin panel
     */
    public function store(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        if (Gate::denies('create', User::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only Administrators can create new user accounts.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string',
            'agency' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Suspended',
        ], [
            'name.required' => 'Name and email are required.',
            'email.required' => 'Name and email are required.',
            'email.unique' => 'User with this email already exists.',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $statusCode = $errors->has('email') && str_contains($errors->first('email'), 'already exists') ? 409 : 422;

            return response()->json([
                'success' => false,
                'message' => $errors->first(),
            ], $statusCode);
        }

        $requestedRole = $request->input('role', 'Ops Staff');

        // Privilege escalation safeguards
        if ($currentUser->role !== 'Super Admin') {
            if ($requestedRole === 'Super Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only Super Administrators can create Super Admin accounts.'
                ], 403);
            }
            if ($requestedRole === 'Travel Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Travel Admins cannot create other Travel Admin accounts.'
                ], 403);
            }
        }

        // Determine agency
        if ($currentUser->role === 'Super Admin' && $request->filled('agency')) {
            $agency = Agency::firstOrCreate(['name' => $request->input('agency')]);
            $agencyId = $agency->id;
        } else {
            $agencyId = $currentUser->agency_id;
        }

        $newUser = new User([
            'custom_id' => 'usr_' . uniqid(),
            'name' => $request->input('name'),
            'email' => strtolower($request->input('email')),
            'password' => Hash::make($request->input('password', 'TravelOps2026!')),
            'phone' => $request->input('phone', ''),
            'region' => $request->input('region', 'Indonesia'),
            'address' => $request->input('address', ''),
            'status' => $request->input('status', 'Active'),
        ]);

        $newUser->role = $requestedRole;
        $newUser->agency_id = $agencyId;
        $newUser->save();

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $currentUser->id,
            'user_name' => $currentUser->name,
            'role' => $currentUser->role,
            'action' => 'ADMIN_CREATE_USER',
            'details' => "Created new user {$newUser->name} ({$newUser->email}) with role {$newUser->role}.",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => "User {$newUser->name} created successfully!",
            'user' => $this->formatUserResponse($newUser),
        ], 201);
    }

    /**
     * PUT /api/admin/users/{id} - Update user details, role, status, or password
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $currentUser = $request->user();

        $targetUser = User::where('custom_id', $id)
            ->orWhere('id', $id)
            ->first();

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        if (Gate::denies('update', $targetUser)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. You do not have permission to modify this user account.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $targetUser->id,
            'phone' => 'nullable|string|max:50',
            'role' => 'nullable|string',
            'agency' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Suspended',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        // Privilege escalation check on role update
        if ($request->has('role')) {
            $newRole = $request->input('role');
            if ($newRole === 'Super Admin' && $currentUser->role !== 'Super Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only Super Administrators can assign Super Admin role.'
                ], 403);
            }

            if ($currentUser->role === 'Super Admin') {
                $targetUser->role = $newRole;
            } elseif ($currentUser->role === 'Travel Admin' && in_array($newRole, ['Ops Staff', 'Field Agent', 'Jamaah', 'User'])) {
                $targetUser->role = $newRole;
            }
        }

        if ($request->has('agency') && $currentUser->role === 'Super Admin') {
            $agency = Agency::firstOrCreate(['name' => $request->input('agency')]);
            $targetUser->agency_id = $agency->id;
        }

        if ($request->filled('name')) {
            $targetUser->name = $request->input('name');
        }
        if ($request->filled('email')) {
            $targetUser->email = strtolower($request->input('email'));
        }
        if ($request->has('phone')) {
            $targetUser->phone = $request->input('phone');
        }
        if ($request->filled('region')) {
            $targetUser->region = $request->input('region');
        }
        if ($request->has('address')) {
            $targetUser->address = $request->input('address');
        }
        if ($request->filled('status')) {
            $targetUser->status = $request->input('status');
        }
        if ($request->filled('password') && strlen(trim($request->input('password'))) >= 6) {
            $targetUser->password = Hash::make($request->input('password'));
        }

        $targetUser->save();

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $currentUser->id,
            'user_name' => $currentUser->name,
            'role' => $currentUser->role,
            'action' => 'ADMIN_UPDATE_USER',
            'details' => "Updated user account {$targetUser->email} (Status: {$targetUser->status}, Role: {$targetUser->role}).",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully!',
            'user' => $this->formatUserResponse($targetUser),
        ]);
    }

    /**
     * DELETE /api/admin/users/{id} - Delete a user
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $currentUser = $request->user();

        $targetUser = User::where('custom_id', $id)
            ->orWhere('id', $id)
            ->first();

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        if ($targetUser->id === $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account while logged in.'
            ], 400);
        }

        if (Gate::denies('delete', $targetUser)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. You do not have permission to delete this user account.'
            ], 403);
        }

        $deletedName = $targetUser->name;
        $deletedEmail = $targetUser->email;
        $targetUser->delete();

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $currentUser->id,
            'user_name' => $currentUser->name,
            'role' => $currentUser->role,
            'action' => 'ADMIN_DELETE_USER',
            'details' => "Deleted user account {$deletedName} ({$deletedEmail}).",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => "User {$deletedName} deleted successfully."
        ]);
    }

    /**
     * GET /api/admin/stats - Telemetry and platform overview metrics (Super Admin ONLY)
     */
    public function stats(Request $request): JsonResponse
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'Active')->count();
        $suspendedUsers = User::where('status', 'Suspended')->count();
        $totalAgencies = Agency::count();
        $totalPackages = Package::count();
        $totalJamaah = Jamaah::count();
        $totalTasks = Task::count();
        $completedTasks = Task::where('completed', true)->count();
        $totalFinanceTransactions = Finance::count();

        $totalIncome = (float) Finance::where('type', 'INCOME')->where('status', 'COMPLETED')->sum('amount');
        $totalExpense = (float) Finance::where('type', 'EXPENSE')->where('status', 'COMPLETED')->sum('amount');

        return response()->json([
            'success' => true,
            'stats' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'suspendedUsers' => $suspendedUsers,
                'totalAgencies' => $totalAgencies,
                'totalPackages' => $totalPackages,
                'totalJamaah' => $totalJamaah,
                'totalTasks' => $totalTasks,
                'completedTasks' => $completedTasks,
                'totalFinanceTransactions' => $totalFinanceTransactions,
                'totalIncome' => $totalIncome,
                'totalExpense' => $totalExpense,
                'netProfit' => $totalIncome - $totalExpense,
                'totalAuditLogs' => AuditLog::count(),
                'serverUptime' => 'Laravel Live Server',
                'environment' => config('app.env'),
                'apiVersion' => 'v3.0.0-laravel'
            ]
        ]);
    }

    /**
     * GET /api/admin/audit-logs - Retrieve system audit logs (Super Admin ONLY)
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $limit = (int)$request->query('limit', 100);
        $logs = AuditLog::orderBy('logged_at', 'desc')->take($limit)->get();

        return response()->json([
            'success' => true,
            'logs' => $logs,
        ]);
    }

    /**
     * POST /api/admin/reset-seeds - Restore demo dataset (Super Admin ONLY)
     */
    public function resetSeeds(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $currentUser->id,
            'user_name' => $currentUser->name,
            'role' => $currentUser->role,
            'action' => 'SYSTEM_SEED_RESET',
            'details' => 'Restored default demo seed dataset.',
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Database reset to default seed data successfully!'
        ]);
    }
}

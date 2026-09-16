<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Access token required.'
            ], 401);
        }

        // Support comma-separated role arguments (e.g. "Super Admin,Travel Admin")
        $flatRoles = [];
        foreach ($roles as $r) {
            foreach (explode(',', $r) as $subRole) {
                $flatRoles[] = trim($subRole);
            }
        }

        // Super Admin has full administrative access
        if ($user->role === 'Super Admin' || in_array($user->role, $flatRoles)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Access denied. You do not have permission to perform this action.'
        ], 403);
    }
}

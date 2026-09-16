<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthenticate
{
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization');
        
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
            return response()->json([
                'success' => false,
                'message' => 'Access token required. Please log in.'
            ], 401);
        }

        $jwtToken = $matches[1];
        $jwtSecret = env('JWT_SECRET', 'travelops-super-secret-jwt-key-2026-production');

        $decoded = JwtService::decode($jwtToken, $jwtSecret);

        if (!$decoded) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired session token.'
            ], 401);
        }

        $userId = $decoded->id ?? null;
        $user = null;

        if ($userId) {
            $user = User::where('custom_id', $userId)
                ->orWhere('id', $userId)
                ->first();
        }

        if (!$user && isset($decoded->email)) {
            $user = User::where('email', $decoded->email)->first();
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User account no longer exists.'
            ], 401);
        }

        if ($user->status === 'Suspended') {
            return response()->json([
                'success' => false,
                'message' => 'User account is currently suspended. Please contact administrator.'
            ], 403);
        }

        $request->setUserResolver(fn () => $user);
        \Illuminate\Support\Facades\Auth::setUser($user);

        return $next($request);
    }
}

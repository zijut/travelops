<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Format Notification object
     */
    private function formatNotification(Notification $n): array
    {
        return [
            'id' => $n->custom_id ?? (string)$n->id,
            'db_id' => $n->id,
            'titleEn' => $n->title_en ?? 'System Notification',
            'titleId' => $n->title_id ?? 'Notifikasi Sistem',
            'descEn' => $n->desc_en ?? '',
            'descId' => $n->desc_id ?? '',
            'timestamp' => $n->timestamp_str ?? ($n->created_at ? $n->created_at->diffForHumans() : 'Baru saja'),
            'read' => (bool)$n->read,
            'type' => $n->type ?? 'info',
            'agencyEmail' => $n->agency ? $n->agency->email : null,
            'createdAt' => $n->created_at ? $n->created_at->toISOString() : null,
        ];
    }

    /**
     * GET /api/notifications - Get notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Notification::with('agency');

        if ($user->role !== 'Super Admin') {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('agency_id', $user->agency_id)
                  ->orWhereNull('agency_id');
            });
        }

        $notifications = $query->orderBy('created_at', 'desc')->get()->map(fn ($n) => $this->formatNotification($n));

        return response()->json([
            'success' => true,
            'notifications' => $notifications,
        ]);
    }

    /**
     * POST /api/notifications - Create notification
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $n = new Notification([
            'custom_id' => 'NTF' . sprintf('%04d', rand(1000, 9999)),
            'title_en' => $request->input('titleEn', 'System Notification'),
            'title_id' => $request->input('titleId', 'Notifikasi Sistem'),
            'desc_en' => $request->input('descEn', ''),
            'desc_id' => $request->input('descId', ''),
            'timestamp_str' => 'Baru saja',
            'read' => false,
            'type' => $request->input('type', 'info'),
        ]);

        $n->agency_id = $user->agency_id;
        $n->user_id = $user->id;
        $n->save();

        return response()->json([
            'success' => true,
            'notification' => $this->formatNotification($n),
        ], 201);
    }

    /**
     * PATCH /api/notifications/{id}/read - Mark single notification as read
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $n = Notification::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$n) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $n->agency_id && $n->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this notification.',
            ], 403);
        }

        $n->read = true;
        $n->save();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    /**
     * PATCH /api/notifications/read-all - Mark all notifications as read
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Notification::query();

        if ($user->role !== 'Super Admin') {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('agency_id', $user->agency_id)
                  ->orWhereNull('agency_id');
            });
        }

        $query->update(['read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }
}

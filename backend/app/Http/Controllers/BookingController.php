<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Finance;
use App\Models\Jamaah;
use App\Models\Package;
use App\Models\Visa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Format Booking object for API response
     */
    private function formatBooking(Booking $b): array
    {
        $b->loadMissing(['package', 'jamaah', 'agency', 'user', 'payments']);

        return [
            'id' => $b->custom_id ?? (string)$b->id,
            'db_id' => $b->id,
            'package_id' => $b->package ? ($b->package->custom_id ?? (string)$b->package->id) : null,
            'package_name' => $b->package ? $b->package->name : 'N/A',
            'jamaah_id' => $b->jamaah ? ($b->jamaah->custom_id ?? (string)$b->jamaah->id) : null,
            'jamaah_name' => $b->jamaah ? $b->jamaah->name : ($b->user ? $b->user->name : 'Customer'),
            'user_id' => $b->user ? ($b->user->custom_id ?? (string)$b->user->id) : null,
            'user_email' => $b->user ? $b->user->email : null,
            'pax_count' => $b->pax_count,
            'total_price' => (float)$b->total_price,
            'paid_amount' => (float)$b->paid_amount,
            'remaining_balance' => (float)$b->remainingBalance(),
            'payment_status' => $b->payment_status,
            'status' => $b->status,
            'booking_date' => $b->booking_date ? $b->booking_date->toISOString() : null,
            'notes' => $b->notes ?? '',
            'agencyEmail' => $b->agency ? $b->agency->email : null,
            'createdAt' => $b->created_at ? $b->created_at->toISOString() : null,
            'payments' => $b->payments ? $b->payments->map(fn ($p) => [
                'id' => $p->custom_id,
                'invoice_number' => $p->invoice_number,
                'amount' => (float)$p->amount,
                'payment_date' => $p->payment_date ? $p->payment_date->format('Y-m-d') : null,
                'payment_method' => $p->payment_method,
                'status' => $p->status,
            ]) : [],
        ];
    }

    /**
     * GET /api/bookings - Retrieve booking list (RBAC filtered)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Booking::with(['package', 'jamaah', 'agency', 'user', 'payments']);

        if ($user->role === 'Jamaah' || $user->role === 'User') {
            $query->where('user_id', $user->id);
        } elseif ($user->role !== 'Super Admin') {
            $query->where('agency_id', $user->agency_id);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get()->map(fn ($b) => $this->formatBooking($b));

        return response()->json([
            'success' => true,
            'bookings' => $bookings,
        ]);
    }

    /**
     * GET /api/bookings/{id} - Get single booking details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $b = Booking::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$b) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        if ($user->role === 'Jamaah' || $user->role === 'User') {
            if ($b->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. You can only view your own bookings.',
                ], 403);
            }
        } elseif ($user->role !== 'Super Admin' && $b->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this booking.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'booking' => $this->formatBooking($b),
        ]);
    }

    /**
     * POST /api/bookings - Create new booking with atomic quota lock & DB transaction
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'package_id' => 'required|string',
            'pax_count' => 'nullable|integer|min:1',
            'initial_payment' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ], [
            'package_id.required' => 'Package ID is required.',
            'pax_count.min' => 'Number of pax must be at least 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $paxCount = (int)$request->input('pax_count', 1);

        return DB::transaction(function () use ($request, $user, $paxCount) {
            // Pessimistic locking on Package to prevent concurrent quota overbooking
            $pkg = Package::where('custom_id', $request->input('package_id'))
                ->orWhere('id', $request->input('package_id'))
                ->lockForUpdate()
                ->first();

            if (!$pkg) {
                return response()->json([
                    'success' => false,
                    'message' => 'Package not found.',
                ], 404);
            }

            $remainingQuota = max(0, $pkg->quota - $pkg->booked);
            if ($paxCount > $remainingQuota || $pkg->status === 'Sold Out') {
                return response()->json([
                    'success' => false,
                    'message' => "Package quota is full. Remaining available quota: {$remainingQuota} pax.",
                ], 400);
            }

            // Decrement available quota
            $pkg->booked += $paxCount;
            if ($pkg->booked >= $pkg->quota) {
                $pkg->status = 'Sold Out';
            }
            $pkg->save();

            // Link or find Jamaah record
            $jamaah = Jamaah::where('email', $user->email)->first();
            if (!$jamaah) {
                $jamaah = new Jamaah([
                    'custom_id' => 'JAM' . sprintf('%04d', rand(1000, 9999)),
                    'name' => $user->name . ($paxCount > 1 ? " (+{$paxCount} Family)" : ''),
                    'phone' => $user->phone ?? '',
                    'email' => $user->email,
                    'package_name' => $pkg->name,
                    'departure_date' => $pkg->departure_date ?? now()->addMonth(),
                    'status' => 'Booked',
                    'total_price' => (float)($pkg->price * $paxCount),
                    'paid_amount' => 0,
                    'payment_status' => 'Belum Bayar',
                ]);
                $jamaah->agency_id = $pkg->agency_id;
                $jamaah->package_id = $pkg->id;
                $jamaah->save();

                $visa = new Visa([
                    'passport_status' => 'PENDING',
                    'visa_status' => 'PENDING',
                    'ktp_status' => 'PENDING',
                    'vaccine_status' => 'PENDING',
                    'passport_number' => 'B' . rand(1000000, 9999999),
                ]);
                $visa->jamaah_id = $jamaah->id;
                $visa->save();
            }

            $totalPrice = (float)($pkg->price * $paxCount);
            $initialPayment = (float)$request->input('initial_payment', 0);

            if ($initialPayment > $totalPrice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Initial payment amount cannot exceed total booking price.',
                ], 400);
            }

            $paymentStatus = 'UNPAID';
            if ($initialPayment >= $totalPrice && $totalPrice > 0) {
                $paymentStatus = 'PAID';
            } elseif ($initialPayment > 0) {
                $paymentStatus = 'PARTIAL';
            }

            $booking = new Booking([
                'custom_id' => 'BKG' . sprintf('%04d', rand(1000, 9999)),
                'pax_count' => $paxCount,
                'total_price' => $totalPrice,
                'paid_amount' => $initialPayment,
                'payment_status' => $paymentStatus,
                'status' => 'Pending',
                'booking_date' => now(),
                'notes' => $request->input('notes', ''),
            ]);

            $booking->agency_id = $pkg->agency_id;
            $booking->package_id = $pkg->id;
            $booking->jamaah_id = $jamaah->id;
            $booking->user_id = $user->id;
            $booking->save();

            // Record initial finance transaction if payment provided
            if ($initialPayment > 0) {
                $f = new Finance([
                    'custom_id' => 'TX' . sprintf('%04d', rand(1000, 9999)),
                    'date' => now()->format('Y-m-d'),
                    'category' => 'Pembayaran Booking',
                    'description' => "DP/Pembayaran Booking {$booking->custom_id} oleh {$user->name}",
                    'amount' => $initialPayment,
                    'type' => 'INCOME',
                    'status' => 'COMPLETED',
                ]);
                $f->agency_id = $pkg->agency_id;
                $f->save();
            }

            AuditLog::create([
                'custom_id' => 'log_' . uniqid(),
                'logged_at' => now(),
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $user->role,
                'action' => 'CREATE_BOOKING',
                'details' => "Created booking {$booking->custom_id} for package {$pkg->name} ({$paxCount} pax).",
                'ip_address' => $request->ip() ?? '127.0.0.1',
                'status' => 'SUCCESS',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking request submitted successfully!',
                'booking' => $this->formatBooking($booking),
            ], 201);
        });
    }

    /**
     * PATCH /api/bookings/{id}/status - Update booking status with state machine & quota restoration
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:Pending,Confirmed,Completed,Cancelled',
        ], [
            'status.required' => 'Target status is required.',
            'status.in' => 'Invalid status value. Allowed: Pending, Confirmed, Completed, Cancelled.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $targetStatus = $request->input('status');

        return DB::transaction(function () use ($user, $id, $targetStatus, $request) {
            $booking = Booking::where('custom_id', $id)->orWhere('id', $id)->first();

            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found.',
                ], 404);
            }

            // Customer cannot change status to Confirmed or Completed
            if ($user->role === 'Jamaah' || $user->role === 'User') {
                if ($targetStatus !== 'Cancelled') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Access denied. Customers can only cancel pending bookings.',
                    ], 403);
                }
                if ($booking->user_id !== $user->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Access denied to this booking.',
                    ], 403);
                }
            } elseif ($user->role !== 'Super Admin' && $booking->agency_id !== $user->agency_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to update booking status.',
                ], 403);
            }

            $currentStatus = $booking->status;

            // State Machine Transition Rules
            $allowedTransitions = [
                'Pending' => ['Confirmed', 'Cancelled'],
                'Confirmed' => ['Completed', 'Cancelled'],
                'Completed' => [],
                'Cancelled' => [],
            ];

            if ($currentStatus !== $targetStatus && (!isset($allowedTransitions[$currentStatus]) || !in_array($targetStatus, $allowedTransitions[$currentStatus]))) {
                return response()->json([
                    'success' => false,
                    'message' => "Invalid status transition from '{$currentStatus}' to '{$targetStatus}'.",
                ], 422);
            }

            $booking->status = $targetStatus;
            $booking->save();

            // If booking cancelled, restore package booked quota
            if ($targetStatus === 'Cancelled' && $currentStatus !== 'Cancelled') {
                $pkg = Package::find($booking->package_id);
                if ($pkg) {
                    $pkg->booked = max(0, $pkg->booked - $booking->pax_count);
                    if ($pkg->booked < $pkg->quota && $pkg->status === 'Sold Out') {
                        $pkg->status = 'Published';
                    }
                    $pkg->save();
                }
            }

            AuditLog::create([
                'custom_id' => 'log_' . uniqid(),
                'logged_at' => now(),
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $user->role,
                'action' => 'UPDATE_BOOKING_STATUS',
                'details' => "Updated status of booking {$booking->custom_id} from {$currentStatus} to {$targetStatus}.",
                'ip_address' => $request->ip() ?? '127.0.0.1',
                'status' => 'SUCCESS',
            ]);

            return response()->json([
                'success' => true,
                'message' => "Booking status updated to {$targetStatus} successfully!",
                'booking' => $this->formatBooking($booking),
            ]);
        });
    }

    /**
     * DELETE /api/bookings/{id} - Delete booking record
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $b = Booking::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$b) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $b->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to delete this booking.',
            ], 403);
        }

        $b->delete();

        return response()->json([
            'success' => true,
            'message' => 'Booking deleted successfully.',
        ]);
    }
}

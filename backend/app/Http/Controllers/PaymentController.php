<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Finance;
use App\Models\Jamaah;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Format Payment object for API response
     */
    private function formatPayment(Payment $p): array
    {
        $p->loadMissing(['booking', 'agency', 'jamaah', 'user', 'finance']);

        return [
            'id' => $p->custom_id ?? (string)$p->id,
            'db_id' => $p->id,
            'invoice_number' => $p->invoice_number,
            'booking_id' => $p->booking ? ($p->booking->custom_id ?? (string)$p->booking->id) : null,
            'amount' => (float)$p->amount,
            'payment_date' => $p->payment_date ? $p->payment_date->format('Y-m-d') : null,
            'payment_method' => $p->payment_method ?? 'Bank Transfer',
            'status' => $p->status ?? 'COMPLETED',
            'notes' => $p->notes ?? '',
            'agencyEmail' => $p->agency ? $p->agency->email : null,
            'userEmail' => $p->user ? $p->user->email : null,
            'createdAt' => $p->created_at ? $p->created_at->toISOString() : null,
        ];
    }

    /**
     * GET /api/bookings/{id}/payments - Get payments for a booking
     */
    public function getByBooking(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $booking = Booking::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        if ($user->role === 'Jamaah' || $user->role === 'User') {
            if ($booking->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to view payments for this booking.',
                ], 403);
            }
        } elseif ($user->role !== 'Super Admin' && $booking->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to view payments for this booking.',
            ], 403);
        }

        $payments = Payment::where('booking_id', $booking->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($p) => $this->formatPayment($p));

        return response()->json([
            'success' => true,
            'payments' => $payments,
            'summary' => [
                'total_price' => (float)$booking->total_price,
                'paid_amount' => (float)$booking->paid_amount,
                'remaining_balance' => (float)$booking->remainingBalance(),
                'payment_status' => $booking->payment_status,
            ]
        ]);
    }

    /**
     * POST /api/bookings/{id}/payments - Submit payment for a booking with atomic DB transaction
     */
    public function store(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ], [
            'amount.required' => 'Payment amount is required.',
            'amount.numeric' => 'Payment amount must be a positive number.',
            'amount.min' => 'Payment amount must be greater than zero.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $amount = (float)$request->input('amount');

        return DB::transaction(function () use ($request, $user, $id, $amount) {
            $booking = Booking::where('custom_id', $id)->orWhere('id', $id)->lockForUpdate()->first();

            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found.',
                ], 404);
            }

            if ($user->role === 'Jamaah' || $user->role === 'User') {
                if ($booking->user_id !== $user->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Access denied to submit payment for this booking.',
                    ], 403);
                }
            } elseif ($user->role !== 'Super Admin' && $booking->agency_id !== $user->agency_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to submit payment for this booking.',
                ], 403);
            }

            $remaining = (float)$booking->remainingBalance();
            if ($amount > $remaining) {
                return response()->json([
                    'success' => false,
                    'message' => "Payment amount (Rp " . number_format($amount, 0, ',', '.') . ") exceeds remaining balance (Rp " . number_format($remaining, 0, ',', '.') . ").",
                ], 400);
            }

            // Create Finance transaction record
            $finance = new Finance([
                'custom_id' => 'TX' . sprintf('%04d', rand(1000, 9999)),
                'date' => now()->format('Y-m-d'),
                'category' => 'Pembayaran Booking',
                'description' => "Pembayaran angsuran/lunas booking {$booking->custom_id}",
                'amount' => $amount,
                'type' => 'INCOME',
                'status' => 'COMPLETED',
            ]);
            $finance->agency_id = $booking->agency_id;
            $finance->save();

            $invNumber = 'INV-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            $payment = new Payment([
                'custom_id' => 'PAY' . sprintf('%04d', rand(1000, 9999)),
                'invoice_number' => $invNumber,
                'amount' => $amount,
                'payment_date' => now()->format('Y-m-d'),
                'payment_method' => $request->input('payment_method', 'Bank Transfer'),
                'status' => 'COMPLETED',
                'notes' => $request->input('notes', ''),
            ]);

            $payment->booking_id = $booking->id;
            $payment->agency_id = $booking->agency_id;
            $payment->jamaah_id = $booking->jamaah_id;
            $payment->user_id = $user->id;
            $payment->finance_id = $finance->id;
            $payment->save();

            // Update Booking paid_amount and payment_status
            $booking->paid_amount += $amount;
            if ($booking->paid_amount >= $booking->total_price) {
                $booking->payment_status = 'PAID';
            } elseif ($booking->paid_amount > 0) {
                $booking->payment_status = 'PARTIAL';
            }
            $booking->save();

            // Update Jamaah payment status
            if ($booking->jamaah) {
                $j = $booking->jamaah;
                $j->paid_amount += $amount;
                $j->payment_status = ($j->paid_amount >= $j->total_price) ? 'Lunas' : 'DP';
                $j->save();
            }

            AuditLog::create([
                'custom_id' => 'log_' . uniqid(),
                'logged_at' => now(),
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $user->role,
                'action' => 'SUBMIT_PAYMENT',
                'details' => "Recorded payment {$payment->invoice_number} of Rp " . number_format($amount, 0, ',', '.') . " for booking {$booking->custom_id}.",
                'ip_address' => $request->ip() ?? '127.0.0.1',
                'status' => 'SUCCESS',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully!',
                'payment' => $this->formatPayment($payment),
                'booking_summary' => [
                    'total_price' => (float)$booking->total_price,
                    'paid_amount' => (float)$booking->paid_amount,
                    'remaining_balance' => (float)$booking->remainingBalance(),
                    'payment_status' => $booking->payment_status,
                ]
            ], 201);
        });
    }

    /**
     * GET /api/payments/{id} - Get single payment detail
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $p = Payment::where('custom_id', $id)
            ->orWhere('id', $id)
            ->orWhere('invoice_number', $id)
            ->first();

        if (!$p) {
            return response()->json([
                'success' => false,
                'message' => 'Payment record not found.',
            ], 404);
        }

        if ($user->role === 'Jamaah' || $user->role === 'User') {
            if ($p->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this payment record.',
                ], 403);
            }
        } elseif ($user->role !== 'Super Admin' && $p->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this payment record.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'payment' => $this->formatPayment($p),
        ]);
    }

    /**
     * PATCH /api/payments/{id}/status - Update payment status (Admin only)
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['Jamaah', 'User'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only Administrators can update payment status.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:COMPLETED,PENDING,CANCELLED',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $newStatus = $request->input('status');

        return DB::transaction(function () use ($user, $id, $newStatus, $request) {
            $p = Payment::where('custom_id', $id)->orWhere('id', $id)->first();

            if (!$p) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment record not found.',
                ], 404);
            }

            if ($user->role !== 'Super Admin' && $p->agency_id !== $user->agency_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to update this payment.',
                ], 403);
            }

            $oldStatus = $p->status;
            $p->status = $newStatus;
            $p->save();

            // If status changed to CANCELLED, deduct paid amount from booking
            if ($newStatus === 'CANCELLED' && $oldStatus !== 'CANCELLED') {
                $booking = Booking::find($p->booking_id);
                if ($booking) {
                    $booking->paid_amount = max(0, $booking->paid_amount - $p->amount);
                    if ($booking->paid_amount <= 0) {
                        $booking->payment_status = 'UNPAID';
                    } elseif ($booking->paid_amount < $booking->total_price) {
                        $booking->payment_status = 'PARTIAL';
                    }
                    $booking->save();
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Payment status updated to {$newStatus}.",
                'payment' => $this->formatPayment($p),
            ]);
        });
    }
}

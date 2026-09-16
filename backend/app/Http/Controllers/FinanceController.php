<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Finance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FinanceController extends Controller
{
    /**
     * Format Finance transaction object
     */
    private function formatFinance(Finance $f): array
    {
        return [
            'id' => $f->custom_id ?? (string)$f->id,
            'db_id' => $f->id,
            'date' => $f->date ? $f->date->format('Y-m-d') : null,
            'category' => $f->category ?? 'Pembayaran Jamaah',
            'description' => $f->description ?? '',
            'amount' => (float)$f->amount,
            'type' => $f->type ?? 'INCOME',
            'status' => $f->status ?? 'COMPLETED',
            'agencyEmail' => $f->agency ? $f->agency->email : null,
            'createdAt' => $f->created_at ? $f->created_at->toISOString() : null,
        ];
    }

    /**
     * GET /api/finance - Get finance transactions (Agency isolated)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Finance::with('agency');

        if ($user->role !== 'Super Admin') {
            $query->where('agency_id', $user->agency_id);
        }

        $financeList = $query->orderBy('date', 'desc')->get()->map(fn ($f) => $this->formatFinance($f));

        return response()->json([
            'success' => true,
            'finance' => $financeList,
        ]);
    }

    /**
     * GET /api/finance/summary - Financial metrics summary
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Finance::query();

        if ($user->role !== 'Super Admin') {
            $query->where('agency_id', $user->agency_id);
        }

        $totalIncome = (float)(clone $query)->where('type', 'INCOME')->where('status', 'COMPLETED')->sum('amount');
        $totalExpense = (float)(clone $query)->where('type', 'EXPENSE')->where('status', 'COMPLETED')->sum('amount');
        $pendingCount = (clone $query)->where('status', 'PENDING')->count();
        $completedCount = (clone $query)->where('status', 'COMPLETED')->count();

        return response()->json([
            'success' => true,
            'summary' => [
                'totalIncome' => $totalIncome,
                'totalExpense' => $totalExpense,
                'netBalance' => $totalIncome - $totalExpense,
                'pendingTransactions' => $pendingCount,
                'completedTransactions' => $completedCount,
            ]
        ]);
    }

    /**
     * POST /api/finance - Create finance transaction
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|string|in:INCOME,EXPENSE',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:COMPLETED,PENDING,CANCELLED',
        ], [
            'amount.required' => 'Amount is required.',
            'amount.numeric' => 'Amount must be a valid positive number.',
            'type.required' => 'Transaction type is required.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $f = new Finance([
            'custom_id' => 'TX' . sprintf('%04d', rand(1000, 9999)),
            'date' => $request->input('date', now()->format('Y-m-d')),
            'category' => $request->input('category', 'Operasional'),
            'description' => $request->input('description', 'Transaksi Keuangan'),
            'amount' => (float)$request->input('amount'),
            'type' => strtoupper($request->input('type')),
            'status' => strtoupper($request->input('status', 'COMPLETED')),
        ]);

        $f->agency_id = $user->agency_id;
        $f->save();

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'action' => 'CREATE_FINANCE_TRANSACTION',
            'details' => "Recorded {$f->type} transaction of IDR {$f->amount} ({$f->custom_id}).",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'transaction' => $this->formatFinance($f),
        ], 201);
    }

    /**
     * DELETE /api/finance/{id} - Delete transaction
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $f = Finance::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$f) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $f->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to delete this transaction.',
            ], 403);
        }

        $f->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaction deleted successfully.',
        ]);
    }
}

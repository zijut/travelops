<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Jamaah;
use App\Models\Visa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VisaController extends Controller
{
    /**
     * Format Visa record for response
     */
    private function formatVisa(Visa $v): array
    {
        return [
            'passport' => $v->passport_status ?? 'Verified',
            'visa' => $v->visa_status ?? 'Issued',
            'ktp' => $v->ktp_status ?? 'Verified',
            'vaccine' => $v->vaccine_status ?? 'Verified',
            'passport_number' => $v->passport_number ?? '',
            'updatedAt' => $v->updated_at ? $v->updated_at->toISOString() : null,
        ];
    }

    /**
     * GET /api/visa - Retrieve map of visa records keyed by jamaah custom_id
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Jamaah::with('visa');

        if ($user->role !== 'Super Admin') {
            $query->where('agency_id', $user->agency_id);
        }

        $jamaahs = $query->get();
        $visaRecords = [];

        foreach ($jamaahs as $j) {
            $key = $j->custom_id ?? (string)$j->id;
            if ($j->visa) {
                $visaRecords[$key] = $this->formatVisa($j->visa);
            } else {
                $visaRecords[$key] = [
                    'passport' => 'Verified',
                    'visa' => 'Issued',
                    'ktp' => 'Verified',
                    'vaccine' => 'Verified',
                    'passport_number' => $j->passport_number ?? '',
                ];
            }
        }

        return response()->json([
            'success' => true,
            'visaRecords' => $visaRecords,
        ]);
    }

    /**
     * GET /api/visa/{jamaahId} - Get visa record for single jamaah
     */
    public function getByJamaahId(Request $request, string $jamaahId): JsonResponse
    {
        $user = $request->user();
        $j = Jamaah::where('custom_id', $jamaahId)->orWhere('id', $jamaahId)->first();

        if (!$j) {
            return response()->json([
                'success' => false,
                'message' => "Visa record for pilgrim ID {$jamaahId} not found.",
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $j->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this pilgrim visa record.',
            ], 403);
        }

        $v = Visa::where('jamaah_id', $j->id)->first();
        if (!$v) {
            $v = new Visa([
                'passport_status' => 'Verified',
                'visa_status' => 'Issued',
                'ktp_status' => 'Verified',
                'vaccine_status' => 'Verified',
                'passport_number' => $j->passport_number ?? '',
            ]);
            $v->jamaah_id = $j->id;
            $v->save();
        }

        return response()->json([
            'success' => true,
            'visaRecord' => $this->formatVisa($v),
        ]);
    }

    /**
     * PUT /api/visa/{jamaahId} - Update visa record for single jamaah
     */
    public function update(Request $request, string $jamaahId): JsonResponse
    {
        $user = $request->user();
        $j = Jamaah::where('custom_id', $jamaahId)->orWhere('id', $jamaahId)->first();

        if (!$j) {
            return response()->json([
                'success' => false,
                'message' => 'Jamaah record not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $j->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to update this pilgrim visa record.',
            ], 403);
        }

        $v = Visa::where('jamaah_id', $j->id)->first();
        if (!$v) {
            $v = new Visa();
            $v->jamaah_id = $j->id;
        }

        if ($request->has('passport')) $v->passport_status = $request->input('passport');
        if ($request->has('visa')) $v->visa_status = $request->input('visa');
        if ($request->has('ktp')) $v->ktp_status = $request->input('ktp');
        if ($request->has('vaccine')) $v->vaccine_status = $request->input('vaccine');
        if ($request->has('passport_number')) $v->passport_number = $request->input('passport_number');

        $v->save();

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'action' => 'UPDATE_VISA',
            'details' => "Updated visa verification status for pilgrim ID {$jamaahId}.",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'visaRecord' => $this->formatVisa($v),
        ]);
    }
}

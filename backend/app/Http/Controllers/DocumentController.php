<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Jamaah;
use App\Models\JamaahDocument;
use App\Models\Notification;
use App\Models\Visa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    /**
     * Format Document response
     */
    private function formatDocument(JamaahDocument $d): array
    {
        return [
            'id' => $d->custom_id ?? (string)$d->id,
            'db_id' => $d->id,
            'document_type' => $d->document_type,
            'file_name' => $d->file_name,
            'mime_type' => $d->mime_type,
            'file_size' => $d->file_size,
            'status' => $d->status,
            'notes' => $d->notes ?? '',
            'download_url' => "/api/documents/{$d->custom_id}/download",
            'createdAt' => $d->created_at ? $d->created_at->toISOString() : null,
        ];
    }

    /**
     * GET /api/jamaah/{id}/documents - Retrieve documents for a Jamaah
     */
    public function index(Request $request, string $jamaahId): JsonResponse
    {
        $user = $request->user();
        $j = Jamaah::where('custom_id', $jamaahId)->orWhere('id', $jamaahId)->first();

        if (!$j) {
            return response()->json([
                'success' => false,
                'message' => 'Jamaah not found.',
            ], 404);
        }

        if ($user->role === 'Jamaah' || $user->role === 'User') {
            if (strtolower($j->email) !== strtolower($user->email)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. You can only view your own documents.',
                ], 403);
            }
        } elseif ($user->role !== 'Super Admin' && $j->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this jamaah documents.',
            ], 403);
        }

        $docs = JamaahDocument::where('jamaah_id', $j->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($d) => $this->formatDocument($d));

        return response()->json([
            'success' => true,
            'documents' => $docs,
        ]);
    }

    /**
     * POST /api/jamaah/{id}/documents - Upload document file
     */
    public function upload(Request $request, string $jamaahId): JsonResponse
    {
        $user = $request->user();
        $j = Jamaah::where('custom_id', $jamaahId)->orWhere('id', $jamaahId)->first();

        if (!$j) {
            return response()->json([
                'success' => false,
                'message' => 'Jamaah not found.',
            ], 404);
        }

        if ($user->role === 'Jamaah' || $user->role === 'User') {
            if (strtolower($j->email) !== strtolower($user->email)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. You can only upload documents for your own account.',
                ], 403);
            }
        } elseif ($user->role !== 'Super Admin' && $j->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to upload documents for this jamaah.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'document_type' => 'required|string|in:Passport,KTP,Vaccine,Photo,Other',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
        ], [
            'document_type.required' => 'Document type is required.',
            'file.required' => 'Document file is required.',
            'file.mimes' => 'Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed.',
            'file.max' => 'File size exceeds maximum limit of 5MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Safe storage path with randomized file name
        $path = $file->store('documents', 'public');

        $doc = new JamaahDocument([
            'custom_id' => 'DOC' . sprintf('%04d', rand(1000, 9999)),
            'document_type' => $request->input('document_type'),
            'file_path' => $path,
            'file_name' => $fileName,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
            'status' => 'Submitted',
            'notes' => $request->input('notes', ''),
        ]);

        $doc->jamaah_id = $j->id;
        $doc->agency_id = $j->agency_id;
        $doc->save();

        AuditLog::create([
            'custom_id' => 'log_' . uniqid(),
            'logged_at' => now(),
            'user_id' => $user->id,
            'user_name' => $user->name,
            'role' => $user->role,
            'action' => 'UPLOAD_DOCUMENT',
            'details' => "Uploaded {$doc->document_type} document for {$j->name}.",
            'ip_address' => $request->ip() ?? '127.0.0.1',
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully!',
            'document' => $this->formatDocument($doc),
        ], 201);
    }

    /**
     * PATCH /api/documents/{id}/verify - Verify document (Admin/Staff ONLY)
     */
    public function verify(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        // Customer blocked from verifying documents
        if (in_array($user->role, ['Jamaah', 'User'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Customers are not allowed to verify their own documents.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:Verified,Rejected,Pending,Submitted',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $doc = JamaahDocument::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$doc) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $doc->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to verify this document.',
            ], 403);
        }

        $doc->status = $request->input('status');
        if ($request->has('notes')) $doc->notes = $request->input('notes');
        $doc->save();

        // Also sync Visa table status if document type is Passport/KTP/Vaccine
        $v = Visa::where('jamaah_id', $doc->jamaah_id)->first();
        if ($v) {
            $upperStatus = strtoupper($doc->status);
            if ($doc->document_type === 'Passport') $v->passport_status = $upperStatus;
            if ($doc->document_type === 'KTP') $v->ktp_status = $upperStatus;
            if ($doc->document_type === 'Vaccine') $v->vaccine_status = $upperStatus;
            $v->save();
        }

        // Send Notification event
        $n = new Notification([
            'custom_id' => 'NTF' . sprintf('%04d', rand(1000, 9999)),
            'title_en' => "Document {$doc->document_type} " . $doc->status,
            'title_id' => "Dokumen {$doc->document_type} " . ($doc->status === 'Verified' ? 'Disetujui' : 'Ditolak'),
            'desc_en' => "Verification status for {$doc->document_type} updated to {$doc->status}.",
            'desc_id' => "Status verifikasi dokumen {$doc->document_type} telah diubah menjadi {$doc->status}.",
            'timestamp_str' => 'Baru saja',
            'read' => false,
            'type' => $doc->status === 'Verified' ? 'success' : 'warning',
        ]);
        $n->agency_id = $doc->agency_id;
        $n->save();

        return response()->json([
            'success' => true,
            'message' => "Document verification status updated to {$doc->status}.",
            'document' => $this->formatDocument($doc),
        ]);
    }

    /**
     * GET /api/documents/{id}/download - Authorized stream download
     */
    public function download(Request $request, string $id)
    {
        $user = $request->user();
        $doc = JamaahDocument::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Document not found.'], 404);
        }

        $j = Jamaah::find($doc->jamaah_id);
        if ($user->role === 'Jamaah' || $user->role === 'User') {
            if (!$j || strtolower($j->email) !== strtolower($user->email)) {
                return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
            }
        } elseif ($user->role !== 'Super Admin' && $doc->agency_id !== $user->agency_id) {
            return response()->json(['success' => false, 'message' => 'Access denied.'], 403);
        }

        if (!Storage::disk('public')->exists($doc->file_path)) {
            return response()->json(['success' => false, 'message' => 'Physical file not found on server storage.'], 404);
        }

        return Storage::disk('public')->download($doc->file_path, $doc->file_name);
    }

    /**
     * GET /api/jamaah/{id}/checklist - Compute operational checklist for Jamaah
     */
    public function checklist(Request $request, string $jamaahId): JsonResponse
    {
        $user = $request->user();
        $j = Jamaah::where('custom_id', $jamaahId)->orWhere('id', $jamaahId)->first();

        if (!$j) {
            return response()->json(['success' => false, 'message' => 'Jamaah not found.'], 404);
        }

        $v = Visa::where('jamaah_id', $j->id)->first();
        $b = Booking::where('jamaah_id', $j->id)->latest()->first();

        $passportVerified = ($v && strtoupper($v->passport_status) === 'VERIFIED');
        $visaVerified = ($v && strtoupper($v->visa_status) === 'VERIFIED');
        $paymentVerified = ($b && $b->payment_status === 'PAID') || ($j->payment_status === 'Lunas');
        $vaccineVerified = ($v && strtoupper($v->vaccine_status) === 'VERIFIED');
        $ktpVerified = ($v && strtoupper($v->ktp_status) === 'VERIFIED');

        $readyForDeparture = $passportVerified && $visaVerified && $paymentVerified;

        return response()->json([
            'success' => true,
            'checklist' => [
                'jamaah_name' => $j->name,
                'passport_verified' => $passportVerified,
                'visa_verified' => $visaVerified,
                'payment_verified' => $paymentVerified,
                'vaccine_verified' => $vaccineVerified,
                'ktp_verified' => $ktpVerified,
                'ready_for_departure' => $readyForDeparture,
                'status_summary' => $readyForDeparture ? 'Siap Berangkat (Ready for Departure)' : 'Dokumen / Pembayaran Belum Lengkap',
            ]
        ]);
    }
}

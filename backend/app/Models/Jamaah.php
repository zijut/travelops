<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Jamaah extends Model
{
    use HasFactory;

    protected $table = 'jamaah';

    protected $fillable = [
        'custom_id',
        'name',
        'phone',
        'email',
        'avatar_url',
        'package_name',
        'departure_date',
        'status',
        'kloter',
        'passport_number',
        'passport_expiry',
        'ktp_number',
        'birth_date',
        'gender',
        'blood_type',
        'city',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_relation',
        'hotel_makkah',
        'room_makkah',
        'hotel_madinah',
        'room_madinah',
        'room_type',
        'bus_number',
        'bus_seat_number',
        'total_price',
        'paid_amount',
        'payment_status',
        'visa_number',
        'visa_issue_date',
        'visa_expiry_date',
        'vaccine_status',
    ];

    protected $guarded = [
        'id',
        'agency_id',
        'package_id',
    ];

    protected $casts = [
        'passport_expiry' => 'date',
        'birth_date' => 'date',
        'visa_issue_date' => 'date',
        'visa_expiry_date' => 'date',
        'total_price' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'bus_seat_number' => 'integer',
    ];

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function visa(): HasOne
    {
        return $this->hasOne(Visa::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_id',
        'pax_count',
        'total_price',
        'paid_amount',
        'payment_status',
        'status',
        'booking_date',
        'notes',
    ];

    protected $guarded = [
        'id',
        'agency_id',
        'package_id',
        'jamaah_id',
        'user_id',
    ];

    protected $casts = [
        'pax_count' => 'integer',
        'total_price' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'booking_date' => 'datetime',
    ];

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function remainingBalance(): float
    {
        return max(0, (float)$this->total_price - (float)$this->paid_amount);
    }
}

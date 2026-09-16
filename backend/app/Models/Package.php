<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_id',
        'name',
        'duration',
        'price',
        'airline',
        'hotel',
        'hotel_makkah',
        'hotel_madinah',
        'quota',
        'booked',
        'status',
        'departure_date',
        'return_date',
        'description',
        'included',
        'excluded',
    ];

    protected $guarded = [
        'id',
        'agency_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration' => 'integer',
        'quota' => 'integer',
        'booked' => 'integer',
        'departure_date' => 'date',
        'return_date' => 'date',
        'included' => 'array',
        'excluded' => 'array',
    ];

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function jamaah(): HasMany
    {
        return $this->hasMany(Jamaah::class);
    }
}

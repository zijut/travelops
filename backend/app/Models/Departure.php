<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Departure extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_id',
        'kloter',
        'flight_number',
        'airline',
        'departure_date',
        'departure_location',
        'capacity',
        'participants_count',
        'status',
    ];

    protected $guarded = [
        'id',
        'agency_id',
        'package_id',
    ];

    protected $casts = [
        'departure_date' => 'datetime',
        'capacity' => 'integer',
        'participants_count' => 'integer',
    ];

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function remainingCapacity(): int
    {
        return max(0, $this->capacity - $this->participants_count);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visa extends Model
{
    use HasFactory;

    protected $fillable = [
        'passport_status',
        'visa_status',
        'ktp_status',
        'vaccine_status',
        'passport_number',
    ];

    protected $guarded = [
        'id',
        'jamaah_id',
    ];

    public function jamaah(): BelongsTo
    {
        return $this->belongsTo(Jamaah::class);
    }
}

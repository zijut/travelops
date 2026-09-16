<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_id',
        'title_en',
        'title_id',
        'desc_en',
        'desc_id',
        'timestamp_str',
        'read',
        'type',
    ];

    protected $guarded = [
        'id',
        'agency_id',
        'user_id',
    ];

    protected $casts = [
        'read' => 'boolean',
    ];

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

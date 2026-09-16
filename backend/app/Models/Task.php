<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_id',
        'title',
        'category',
        'due_date',
        'completed',
        'assignee',
        'priority',
        'description',
        'subtasks',
        'kloter',
    ];

    protected $guarded = [
        'id',
        'agency_id',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed' => 'boolean',
        'subtasks' => 'array',
    ];

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }
}

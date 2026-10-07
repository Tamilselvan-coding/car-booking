<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'banner_image', 'actual_price', 'offer_price',
        'from_date', 'to_date', 'is_active', 'created_by',
    ];

    protected $hidden = ['active_slot'];

    protected function casts(): array
    {
        return [
            'actual_price' => 'decimal:2',
            'offer_price' => 'decimal:2',
            'from_date' => 'date:Y-m-d',
            'to_date' => 'date:Y-m-d',
            'is_active' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeCurrentlyActive(Builder $query): Builder
    {
        $today = today()->toDateString();

        return $query->where('is_active', true)
            ->where('from_date', '<=', $today)
            ->where('to_date', '>=', $today);
    }
}

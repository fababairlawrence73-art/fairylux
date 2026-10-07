<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_variant_id',
        'user_id',
        'old_stock_level',
        'quantity_change',
        'new_stock_level',
        'type',
        'reference_note',
    ];

    protected $casts = [
        'old_stock_level' => 'integer',
        'quantity_change' => 'integer',
        'new_stock_level' => 'integer',
    ];

    protected $appends = [
        'previous_stock',
    ];

    /**
     * Helper accessor for previous stock level, falling back to calculation if old_stock_level is null.
     */
    public function getPreviousStockAttribute(): int
    {
        return $this->old_stock_level ?? ($this->new_stock_level - $this->quantity_change);
    }

    /**
     * Product variant relationship.
     */
    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * User (staff/admin) who recorded the inventory log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

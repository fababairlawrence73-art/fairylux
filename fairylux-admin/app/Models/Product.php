<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'short_description',
        'material',
        'occasion',
        'base_price',
        'sale_price',
        'featured_image',
        'images',
        'color_images',
        'status',
        'is_featured',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'images' => 'array',
        'color_images' => 'array',
        'is_featured' => 'boolean',
    ];

    protected $appends = [
        'total_stock',
        'featured_image_url',
        'color_image_urls',
    ];

    /**
     * Category relationship.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Product variants relationship.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Inventory logs relationship via variants.
     */
    public function inventories(): HasManyThrough
    {
        return $this->hasManyThrough(Inventory::class, ProductVariant::class);
    }

    /**
     * Total stock accessor across all variants.
     */
    public function getTotalStockAttribute(): int
    {
        if ($this->relationLoaded('variants')) {
            return (int) $this->variants->sum('stock_quantity');
        }
        return (int) $this->variants()->sum('stock_quantity');
    }

    /**
     * Get URL for featured image.
     */
    public function getFeaturedImageUrlAttribute(): ?string
    {
        if (!$this->featured_image) {
            return null;
        }

        if (str_starts_with($this->featured_image, 'http://') || str_starts_with($this->featured_image, 'https://')) {
            return $this->featured_image;
        }

        return Storage::disk('public')->url($this->featured_image);
    }

    /**
     * Get URLs for color-specific images mapped by color ID.
     */
    public function getColorImageUrlsAttribute(): array
    {
        if (empty($this->color_images) || !is_array($this->color_images)) {
            return [];
        }

        $urls = [];
        foreach ($this->color_images as $colorId => $path) {
            if ($path) {
                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    $urls[$colorId] = $path;
                } else {
                    $urls[$colorId] = Storage::disk('public')->url($path);
                }
            }
        }
        return $urls;
    }

    /**
     * Filter scope for search, category, status, and featured.
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('material', 'like', "%{$search}%")
                      ->orWhere('occasion', 'like', "%{$search}%")
                      ->orWhereHas('variants', function ($vq) use ($search) {
                          $vq->where('sku', 'like', "%{$search}%");
                      });
                });
            })
            ->when($filters['category_id'] ?? null, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                if ($status !== 'all') {
                    $query->where('status', $status);
                }
            })
            ->when(isset($filters['is_featured']) && $filters['is_featured'] !== '' && $filters['is_featured'] !== 'all', function ($query) use ($filters) {
                $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN));
            })
            ->when($filters['stock_status'] ?? null, function ($query, $stockStatus) {
                if ($stockStatus === 'in_stock') {
                    $query->whereHas('variants', function ($q) {
                        $q->havingRaw('SUM(stock_quantity) > 0');
                    });
                } elseif ($stockStatus === 'low_stock') {
                    $query->whereHas('variants', function ($q) {
                        $q->havingRaw('SUM(stock_quantity) > 0 AND SUM(stock_quantity) <= 5');
                    });
                } elseif ($stockStatus === 'out_of_stock') {
                    $query->whereDoesntHave('variants', function ($q) {
                        $q->havingRaw('SUM(stock_quantity) > 0');
                    });
                }
            });
    }
}

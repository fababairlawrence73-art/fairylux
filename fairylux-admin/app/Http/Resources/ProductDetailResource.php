<?php

namespace App\Http\Resources;

use App\Support\ImageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductDetailResource extends JsonResource
{
    /**
     * Transform the full product details into an array for customers.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $activeVariants = $this->relationLoaded('variants')
            ? $this->variants->where('is_active', true)->values()
            : $this->variants()->where('is_active', true)->with(['color', 'size'])->get();

        $totalStock = (int) $activeVariants->sum('stock_quantity');

        // Extract unique available colors from active variants
        $colorImages = is_array($this->color_images) ? $this->color_images : [];
        $availableColors = $activeVariants
            ->pluck('color')
            ->filter()
            ->unique('id')
            ->values()
            ->map(function ($color) use ($colorImages) {
                $colorImg = $colorImages[$color->id] ?? null;
                return [
                    'id' => $color->id,
                    'name' => $color->name,
                    'hex_code' => $color->hex_code,
                    'image_url' => ImageUrl::format($colorImg),
                ];
            });

        // Extract unique available sizes from active variants (ordered by sort_order)
        $availableSizes = $activeVariants
            ->pluck('size')
            ->filter()
            ->unique('id')
            ->sortBy('sort_order')
            ->values()
            ->map(function ($size) {
                return [
                    'id' => $size->id,
                    'name' => $size->name,
                    'code' => $size->code,
                    'sort_order' => (int) $size->sort_order,
                ];
            });

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'category' => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'material' => $this->material,
            'occasion' => $this->occasion,
            'base_price' => (float) $this->base_price,
            'sale_price' => $this->sale_price !== null ? (float) $this->sale_price : null,
            'main_image' => ImageUrl::format($this->featured_image),
            'gallery_images' => ImageUrl::formatArray($this->images),
            'is_featured' => (bool) $this->is_featured,
            'total_stock' => $totalStock,
            'in_stock' => $totalStock > 0,
            'created_at' => $this->created_at?->toISOString(),
            'available_colors' => $availableColors,
            'available_sizes' => $availableSizes,
            'variants' => ProductVariantResource::collection($activeVariants),
        ];
    }
}

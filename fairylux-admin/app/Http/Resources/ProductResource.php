<?php

namespace App\Http\Resources;

use App\Support\ImageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the product into a catalog list item array for customers.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Calculate stock from eager-loaded variants if available
        $totalStock = $this->relationLoaded('variants')
            ? (int) $this->variants->sum('stock_quantity')
            : (int) $this->total_stock;

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
        ];
    }
}

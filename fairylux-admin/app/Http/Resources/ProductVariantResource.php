<?php

namespace App\Http\Resources;

use App\Support\ImageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    /**
     * Transform the variant into an array for customers.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $product = $this->product ?? ($this->resource->relationLoaded('product') ? $this->resource->product : null);

        // Image priority: variant's image_path -> product's color_images[color_id] -> product's featured_image
        $colorImages = is_array($product?->color_images) ? $product->color_images : [];
        $colorSpecificImage = $colorImages[$this->color_id] ?? null;
        $imagePath = $this->image_path ?: $colorSpecificImage;

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'price' => (float) ($this->price ?? $product?->base_price ?? 0),
            'stock_quantity' => (int) $this->stock_quantity,
            'in_stock' => (int) $this->stock_quantity > 0,
            'image_url' => ImageUrl::format($imagePath),
            'color' => $this->color ? [
                'id' => $this->color->id,
                'name' => $this->color->name,
                'hex_code' => $this->color->hex_code,
            ] : null,
            'size' => $this->size ? [
                'id' => $this->size->id,
                'name' => $this->size->name,
                'code' => $this->size->code,
                'sort_order' => (int) $this->size->sort_order,
            ] : null,
        ];
    }
}

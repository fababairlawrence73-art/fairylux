<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FreshSetupTest extends TestCase
{
    use RefreshDatabase;

    public function test_fresh_catalog_has_photos_and_reseeding_preserves_local_edits(): void
    {
        Storage::fake('public');
        $this->seed();

        $this->assertSame(25, Product::count());
        $withPhotos = Product::whereNotNull('featured_image')->get();
        // Adelaide has no supplied photo and keeps the application's no-photo state.
        $this->assertCount(24, $withPhotos);
        foreach ($withPhotos as $product) {
            Storage::disk('public')->assertExists($product->featured_image);
        }
        $this->getJson('/api/products')->assertOk()->assertJsonPath('meta.total', 23);

        $product = Product::first();
        $variant = ProductVariant::first();
        $product->update(['name' => 'Classmate edited this gown', 'featured_image' => 'products/custom.jpg']);
        $variant->update(['stock_quantity' => 42]);
        $this->seed();

        $this->assertSame('Classmate edited this gown', $product->fresh()->name);
        $this->assertSame('products/custom.jpg', $product->fresh()->featured_image);
        $this->assertSame(42, $variant->fresh()->stock_quantity);
    }
}

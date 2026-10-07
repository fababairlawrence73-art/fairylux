<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_products_index(): void
    {
        $response = $this->get(route('products.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_customers_cannot_view_products_index(): void
    {
        $customer = User::factory()->customer()->create();

        $response = $this->actingAs($customer)->get(route('products.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_view_products_index(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('products.index'));

        $response->assertOk();
    }

    public function test_admin_can_view_product_show_page(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::create([
            'name' => 'Bridal Gowns',
            'slug' => 'bridal-gowns',
            'is_active' => true,
        ]);
        $size = Size::create(['name' => 'Small', 'code' => 'S']);
        $color = Color::create(['name' => 'Ivory Pearl', 'hex_code' => '#FFFDF9']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Aurelia Royal Ball Gown',
            'slug' => 'aurelia-royal-ball-gown',
            'sku' => 'FL-AUR-001',
            'base_price' => 3200.00,
            'status' => 'active',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'FL-AUR-001-S-IVO',
            'stock_quantity' => 4,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get(route('products.show', $product->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Products/Show')
            ->has('product')
            ->has('recentInventory')
        );
    }

    public function test_admin_can_adjust_variant_stock(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::create([
            'name' => 'Evening Wear',
            'slug' => 'evening-wear',
            'is_active' => true,
        ]);
        $size = Size::create(['name' => 'Medium', 'code' => 'M']);
        $color = Color::create(['name' => 'Midnight Navy', 'hex_code' => '#0A1128']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Celeste Velvet Gown',
            'slug' => 'celeste-velvet-gown',
            'sku' => 'FL-CEL-002',
            'base_price' => 1950.00,
            'status' => 'active',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'FL-CEL-002-M-NAV',
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post(route('products.adjust-stock', $variant->id), [
            'quantity_change' => 3,
            'type' => 'restock',
            'reference_note' => 'Atelier spring shipment received',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals(8, $variant->fresh()->stock_quantity);

        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $variant->id,
            'quantity_change' => 3,
            'new_stock_level' => 8,
            'type' => 'restock',
            'reference_note' => 'Atelier spring shipment received',
        ]);
    }

    public function test_admin_cannot_reduce_stock_below_zero(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::create(['name' => 'Cocktail', 'slug' => 'cocktail', 'is_active' => true]);
        $size = Size::create(['name' => 'Large', 'code' => 'L']);
        $color = Color::create(['name' => 'Emerald Green', 'hex_code' => '#0B6623']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Seraphina Silk Mini',
            'slug' => 'seraphina-silk-mini',
            'sku' => 'FL-SER-003',
            'base_price' => 1200.00,
            'status' => 'active',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'FL-SER-003-L-EME',
            'stock_quantity' => 2,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post(route('products.adjust-stock', $variant->id), [
            'quantity_change' => -5,
            'type' => 'adjustment',
        ]);

        $response->assertSessionHasErrors('quantity_change');
        $this->assertEquals(2, $variant->fresh()->stock_quantity);
    }

    public function test_admin_can_delete_product(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::create(['name' => 'Bridal', 'slug' => 'bridal', 'is_active' => true]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Old Sample Gown',
            'slug' => 'old-sample-gown',
            'sku' => 'FL-OLD-099',
            'base_price' => 800.00,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($admin)->delete(route('products.destroy', $product->id));

        $response->assertRedirect(route('products.index'));
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_admin_can_view_edit_product_page(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::create(['name' => 'Bridal', 'slug' => 'bridal', 'is_active' => true]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Rose Petal Silk Gown',
            'slug' => 'rose-petal-silk-gown',
            'sku' => 'FL-ROS-001',
            'base_price' => 2100.00,
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)->get(route('products.edit', $product->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Products/Edit')
            ->has('product')
            ->has('categories')
            ->has('sizes')
            ->has('colors')
        );
    }

    public function test_admin_can_create_product_with_color_specific_images_and_variants_reuse_image(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');
        $admin = User::factory()->admin()->create();
        $category = Category::create(['name' => 'Couture', 'slug' => 'couture', 'is_active' => true]);
        $sizeS = Size::create(['name' => 'Small', 'code' => 'S']);
        $sizeM = Size::create(['name' => 'Medium', 'code' => 'M']);
        $colorRed = Color::create(['name' => 'Crimson Red', 'hex_code' => '#DC2626']);

        $colorImageFile = \Illuminate\Http\UploadedFile::fake()->create('crimson-red.jpg', 100, 'image/jpeg');

        $response = $this->actingAs($admin)->post(route('products.store'), [
            'name' => 'Crimson Queen Velvet Gown',
            'category_id' => $category->id,
            'sku' => 'FL-CQV-001',
            'base_price' => 2800.00,
            'status' => 'active',
            'color_images' => [
                $colorRed->id => $colorImageFile,
            ],
            'variants' => [
                [
                    'size_id' => $sizeS->id,
                    'color_id' => $colorRed->id,
                    'sku' => 'FL-CQV-001-S-RED',
                    'stock_quantity' => 3,
                    'is_active' => true,
                ],
                [
                    'size_id' => $sizeM->id,
                    'color_id' => $colorRed->id,
                    'sku' => 'FL-CQV-001-M-RED',
                    'stock_quantity' => 5,
                    'is_active' => true,
                ],
            ],
        ]);

        $response->assertRedirect(route('products.index'));

        $product = Product::where('sku', 'FL-CQV-001')->first();
        $this->assertNotNull($product);
        $this->assertNotNull($product->color_images);
        $this->assertArrayHasKey($colorRed->id, $product->color_images);

        $storedPath = $product->color_images[$colorRed->id];
        \Illuminate\Support\Facades\Storage::disk('public')->assertExists($storedPath);

        // Verify that both variants share the same color image
        $variantS = ProductVariant::where('sku', 'FL-CQV-001-S-RED')->first();
        $variantM = ProductVariant::where('sku', 'FL-CQV-001-M-RED')->first();

        $this->assertNotNull($variantS->image_path);
        $this->assertEquals($storedPath, $variantS->image_path);
        $this->assertEquals($storedPath, $variantM->image_path);
        $this->assertEquals($variantS->image_url, $variantM->image_url);
    }

    public function test_admin_can_update_product_color_images_and_remove_them(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');
        $admin = User::factory()->admin()->create();
        $category = Category::create(['name' => 'Evening', 'slug' => 'evening', 'is_active' => true]);
        $size = Size::create(['name' => 'Small', 'code' => 'S']);
        $color = Color::create(['name' => 'Royal Sapphire', 'hex_code' => '#0F52BA']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Sapphire Dream Gown',
            'slug' => 'sapphire-dream-gown',
            'sku' => 'FL-SAP-001',
            'base_price' => 1800.00,
            'status' => 'active',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'FL-SAP-001-S-BLU',
            'stock_quantity' => 4,
            'is_active' => true,
        ]);

        // 1. Upload color image via update
        $blueImageFile = \Illuminate\Http\UploadedFile::fake()->create('sapphire.jpg', 100, 'image/jpeg');

        $response = $this->actingAs($admin)->put(route('products.update', $product->id), [
            'name' => 'Sapphire Dream Gown',
            'category_id' => $category->id,
            'sku' => 'FL-SAP-001',
            'base_price' => 1800.00,
            'status' => 'active',
            'color_images' => [
                $color->id => $blueImageFile,
            ],
            'variants' => [
                [
                    'id' => $variant->id,
                    'size_id' => $size->id,
                    'color_id' => $color->id,
                    'sku' => 'FL-SAP-001-S-BLU',
                    'stock_quantity' => 4,
                    'is_active' => true,
                ],
            ],
        ]);

        $response->assertRedirect(route('products.show', $product->id));

        $product->refresh();
        $this->assertNotNull($product->color_images);
        $uploadedPath = $product->color_images[$color->id];
        \Illuminate\Support\Facades\Storage::disk('public')->assertExists($uploadedPath);
        $this->assertEquals($uploadedPath, $variant->fresh()->image_path);

        // 2. Remove color image via update
        $responseRemove = $this->actingAs($admin)->put(route('products.update', $product->id), [
            'name' => 'Sapphire Dream Gown',
            'category_id' => $category->id,
            'sku' => 'FL-SAP-001',
            'base_price' => 1800.00,
            'status' => 'active',
            'remove_color_images' => [$color->id],
            'variants' => [
                [
                    'id' => $variant->id,
                    'size_id' => $size->id,
                    'color_id' => $color->id,
                    'sku' => 'FL-SAP-001-S-BLU',
                    'stock_quantity' => 4,
                    'is_active' => true,
                ],
            ],
        ]);

        $responseRemove->assertRedirect(route('products.show', $product->id));

        $product->refresh();
        $this->assertEmpty($product->color_images);
        \Illuminate\Support\Facades\Storage::disk('public')->assertMissing($uploadedPath);
        $this->assertNull($variant->fresh()->image_path);
    }
}

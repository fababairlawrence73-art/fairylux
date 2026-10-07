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
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_inventory(): void
    {
        $response = $this->get(route('inventory.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_customers_cannot_view_inventory(): void
    {
        $customer = User::factory()->customer()->create();

        $response = $this->actingAs($customer)->get(route('inventory.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_view_inventory_with_accurate_metrics(): void
    {
        $admin = User::factory()->admin()->create();

        $category = Category::create([
            'name' => 'Bridal',
            'slug' => 'bridal',
            'is_active' => true,
        ]);

        $sizeS = Size::create(['name' => 'Small', 'code' => 'S', 'sort_order' => 1]);
        $sizeM = Size::create(['name' => 'Medium', 'code' => 'M', 'sort_order' => 2]);
        $sizeL = Size::create(['name' => 'Large', 'code' => 'L', 'sort_order' => 3]);
        $color = Color::create(['name' => 'Ivory', 'hex_code' => '#FFFFF0']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Aurora Bridal Gown',
            'slug' => 'aurora-bridal-gown',
            'sku' => 'AUR-001',
            'base_price' => 30000,
            'status' => 'active',
        ]);

        // Variant 1: In stock (10 units)
        ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $sizeS->id,
            'color_id' => $color->id,
            'sku' => 'AUR-001-S-IVO',
            'stock_quantity' => 10,
        ]);

        // Variant 2: Low stock (2 units)
        ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $sizeM->id,
            'color_id' => $color->id,
            'sku' => 'AUR-001-M-IVO',
            'stock_quantity' => 2,
        ]);

        // Variant 3: Out of stock (0 units)
        ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $sizeL->id,
            'color_id' => $color->id,
            'sku' => 'AUR-001-L-IVO',
            'stock_quantity' => 0,
        ]);

        $response = $this->actingAs($admin)->get(route('inventory.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Inventory/Index')
            ->has('summary', fn (Assert $summary) => $summary
                ->where('total_units', 12)
                ->where('total_variants', 3)
                ->where('in_stock_variants', 1)
                ->where('low_stock_variants', 1)
                ->where('out_of_stock_variants', 1)
                ->where('threshold', 3)
            )
            ->has('variants.data', 3)
            ->has('categories')
            ->has('sizes')
            ->has('colors')
        );
    }

    public function test_admin_can_filter_inventory_by_stock_status(): void
    {
        $admin = User::factory()->admin()->create();

        $category = Category::create(['name' => 'Ball Gowns', 'slug' => 'ball-gowns', 'is_active' => true]);
        $sizeS = Size::create(['name' => 'Small', 'code' => 'S']);
        $sizeM = Size::create(['name' => 'Medium', 'code' => 'M']);
        $color = Color::create(['name' => 'Midnight Blue', 'hex_code' => '#191970']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Cinderella Silhouette',
            'slug' => 'cinderella-silhouette',
            'sku' => 'CIN-001',
            'base_price' => 45000,
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $sizeS->id,
            'color_id' => $color->id,
            'sku' => 'CIN-001-S-BLU',
            'stock_quantity' => 15,
        ]);

        ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $sizeM->id,
            'color_id' => $color->id,
            'sku' => 'CIN-001-M-BLU',
            'stock_quantity' => 0,
        ]);

        // Filter for out_of_stock only
        $response = $this->actingAs($admin)->get(route('inventory.index', ['stock_status' => 'out_of_stock']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Inventory/Index')
            ->has('variants.data', 1)
            ->where('variants.data.0.sku', 'CIN-001-M-BLU')
        );
    }

    public function test_admin_can_add_stock_to_variant_with_audit_log(): void
    {
        $admin = User::factory()->admin()->create(['name' => 'FairyLux Head Admin']);

        $category = Category::create(['name' => 'Evening Wear', 'slug' => 'evening-wear', 'is_active' => true]);
        $size = Size::create(['name' => 'Large', 'code' => 'L']);
        $color = Color::create(['name' => 'Burgundy', 'hex_code' => '#800020']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Seraphina Velvet Gown',
            'slug' => 'seraphina-velvet-gown',
            'sku' => 'SER-001',
            'base_price' => 38000,
            'status' => 'active',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'SER-001-L-BUR',
            'stock_quantity' => 4,
        ]);

        // Add 10 units (Restock)
        $response = $this->actingAs($admin)->post(route('inventory.adjust-stock', $variant), [
            'action' => 'add',
            'quantity' => 10,
            'reason' => 'restock',
            'reference_note' => 'Atelier Shipment Batch #20',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $variant->refresh();
        $this->assertEquals(14, $variant->stock_quantity);

        // Verify inventory log
        $log = Inventory::where('product_variant_id', $variant->id)->latest()->first();
        $this->assertNotNull($log);
        $this->assertEquals(4, $log->old_stock_level);
        $this->assertEquals(10, $log->quantity_change);
        $this->assertEquals(14, $log->new_stock_level);
        $this->assertEquals('restock', $log->type);
        $this->assertEquals('Atelier Shipment Batch #20', $log->reference_note);
        $this->assertEquals($admin->id, $log->user_id);
    }

    public function test_admin_can_reduce_stock_to_variant_with_audit_log(): void
    {
        $admin = User::factory()->admin()->create();

        $category = Category::create(['name' => 'Couture', 'slug' => 'couture', 'is_active' => true]);
        $size = Size::create(['name' => 'Small', 'code' => 'S']);
        $color = Color::create(['name' => 'Gold', 'hex_code' => '#FFD700']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Golden Empress Gown',
            'slug' => 'golden-empress-gown',
            'sku' => 'EMP-001',
            'base_price' => 60000,
            'status' => 'active',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'EMP-001-S-GLD',
            'stock_quantity' => 8,
        ]);

        // Reduce 3 units (Damaged)
        $response = $this->actingAs($admin)->post(route('inventory.adjust-stock', $variant), [
            'action' => 'reduce',
            'quantity' => 3,
            'reason' => 'damaged',
            'reference_note' => 'Beadwork loose on train',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $variant->refresh();
        $this->assertEquals(5, $variant->stock_quantity);

        $log = Inventory::where('product_variant_id', $variant->id)->latest()->first();
        $this->assertNotNull($log);
        $this->assertEquals(8, $log->old_stock_level);
        $this->assertEquals(-3, $log->quantity_change);
        $this->assertEquals(5, $log->new_stock_level);
        $this->assertEquals('damaged', $log->type);
    }

    public function test_admin_cannot_reduce_stock_below_zero(): void
    {
        $admin = User::factory()->admin()->create();

        $category = Category::create(['name' => 'Couture', 'slug' => 'couture', 'is_active' => true]);
        $size = Size::create(['name' => 'Small', 'code' => 'S']);
        $color = Color::create(['name' => 'Rose', 'hex_code' => '#FF007F']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Rose Silhouette Gown',
            'slug' => 'rose-silhouette-gown',
            'sku' => 'ROS-001',
            'base_price' => 25000,
            'status' => 'active',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'ROS-001-S-ROS',
            'stock_quantity' => 2,
        ]);

        // Try reducing 5 units on a variant that only has 2
        $response = $this->actingAs($admin)->post(route('inventory.adjust-stock', $variant), [
            'action' => 'reduce',
            'quantity' => 5,
            'reason' => 'damaged',
        ]);

        $response->assertSessionHasErrors(['quantity']);

        // Verify stock remains unchanged
        $variant->refresh();
        $this->assertEquals(2, $variant->stock_quantity);
    }

    public function test_admin_can_fetch_variant_history_json(): void
    {
        $admin = User::factory()->admin()->create(['name' => 'Lead Gown Curator']);

        $category = Category::create(['name' => 'Bridal', 'slug' => 'bridal', 'is_active' => true]);
        $size = Size::create(['name' => 'Medium', 'code' => 'M']);
        $color = Color::create(['name' => 'Ivory', 'hex_code' => '#FFFFF0']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Athena Gown',
            'slug' => 'athena-gown',
            'sku' => 'ATH-001',
            'base_price' => 35000,
            'status' => 'active',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'ATH-001-M-IVO',
            'stock_quantity' => 12,
        ]);

        Inventory::create([
            'product_variant_id' => $variant->id,
            'user_id' => $admin->id,
            'old_stock_level' => 2,
            'quantity_change' => 10,
            'new_stock_level' => 12,
            'type' => 'restock',
            'reference_note' => 'Initial boutique stock load',
        ]);

        $response = $this->actingAs($admin)->get(route('inventory.variant-history', $variant));

        $response->assertOk();
        $response->assertJsonStructure([
            'variant_id',
            'sku',
            'product_name',
            'current_stock',
            'history' => [
                '*' => ['id', 'old_stock', 'quantity_change', 'new_stock', 'type', 'reference_note', 'admin_name', 'date', 'time_ago']
            ]
        ]);

        $this->assertEquals('ATH-001-M-IVO', $response->json('sku'));
        $this->assertEquals(10, $response->json('history.0.quantity_change'));
        $this->assertEquals('Lead Gown Curator', $response->json('history.0.admin_name'));
    }
}

<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_dashboard(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect(route('login'));
    }

    public function test_customers_cannot_view_dashboard(): void
    {
        $customer = User::factory()->customer()->create();

        $response = $this->actingAs($customer)->get('/dashboard');

        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_view_dashboard_with_accurate_metrics(): void
    {
        $admin = User::factory()->admin()->create();

        $category = Category::create([
            'name' => 'Bridal Gowns',
            'slug' => 'bridal-gowns',
            'is_active' => true,
        ]);

        $size = Size::create(['name' => 'Small', 'code' => 'S']);
        $color = Color::create(['name' => 'Pearl White', 'hex_code' => '#FFFFFF']);

        // Gown 1: Active with 10 units in stock
        $product1 = Product::create([
            'category_id' => $category->id,
            'name' => 'Aurelia Crystal Gown',
            'slug' => 'aurelia-crystal-gown',
            'sku' => 'AUR-001',
            'base_price' => 25000,
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $product1->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'AUR-001-S-WHT',
            'stock_quantity' => 10,
        ]);

        // Gown 2: Active with 3 units in stock (low stock alert)
        $product2 = Product::create([
            'category_id' => $category->id,
            'name' => 'Celeste Silk Gown',
            'slug' => 'celeste-silk-gown',
            'sku' => 'CEL-002',
            'base_price' => 18000,
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $product2->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'CEL-002-S-WHT',
            'stock_quantity' => 3,
        ]);

        // Gown 3: Draft with 0 units in stock (out of stock alert)
        Product::create([
            'category_id' => $category->id,
            'name' => 'Midnight Velvet Gown',
            'slug' => 'midnight-velvet-gown',
            'sku' => 'MID-003',
            'base_price' => 22000,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('stats', fn (Assert $stats) => $stats
                ->where('total_products', 3)
                ->where('active_products', 2)
                ->where('total_stock_units', 13)
                ->where('low_stock_products', 1)
                ->where('out_of_stock_products', 1)
                ->where('total_categories', 1)
                ->where('active_categories', 1)
                ->where('total_sales_revenue', 0)
                ->where('total_orders', 0)
                ->where('pending_orders', 0)
                ->where('total_customers', 0)
            )
            ->has('inventory_alerts', 2)
        );
    }
}

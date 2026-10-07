<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_categories_index(): void
    {
        $response = $this->get(route('categories.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_customer_cannot_view_categories_index(): void
    {
        $customer = User::factory()->customer()->create();

        $response = $this->actingAs($customer)->get(route('categories.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_view_categories_index_with_sizes_and_colors(): void
    {
        $admin = User::factory()->admin()->create();

        Category::create(['name' => 'Bridal', 'slug' => 'bridal', 'is_active' => true]);
        Size::create(['name' => 'Small', 'code' => 'S']);
        Color::create(['name' => 'Champagne', 'hex_code' => '#F7E7CE']);

        $response = $this->actingAs($admin)->get(route('categories.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Categories/Index')
            ->has('categories')
            ->has('sizes')
            ->has('colors')
        );
    }

    public function test_admin_can_create_category(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('categories.store'), [
            'name' => 'Haute Couture Debutante',
            'description' => 'Royal debutante custom-tailored gowns',
            'is_active' => true,
            'sort_order' => 10,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('categories', [
            'name' => 'Haute Couture Debutante',
            'slug' => 'haute-couture-debutante',
        ]);
    }

    public function test_admin_can_update_category(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::create([
            'name' => 'Old Collection',
            'slug' => 'old-collection',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->put(route('categories.update', $category->id), [
            'name' => 'Updated Collection',
            'description' => 'Modern updated luxury gowns',
            'is_active' => true,
            'sort_order' => 5,
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('Updated Collection', $category->fresh()->name);
        $this->assertEquals('updated-collection', $category->fresh()->slug);
    }

    public function test_admin_cannot_delete_category_with_active_products(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::create([
            'name' => 'Evening Wear',
            'slug' => 'evening-wear',
            'is_active' => true,
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Velvet Gala Gown',
            'slug' => 'velvet-gala-gown',
            'sku' => 'FL-VEL-001',
            'base_price' => 2400.00,
            'status' => 'active',
        ]);

        $response = $this->actingAs($admin)->delete(route('categories.destroy', $category->id));

        $response->assertSessionHasErrors('general');
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_admin_can_create_size(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('sizes.store'), [
            'name' => 'Extra Small Petite',
            'code' => 'XSP',
            'sort_order' => 1,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('sizes', [
            'code' => 'XSP',
        ]);
    }

    public function test_admin_cannot_delete_size_used_in_variants(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::create(['name' => 'Bridal', 'slug' => 'bridal', 'is_active' => true]);
        $size = Size::create(['name' => 'Medium', 'code' => 'M']);
        $color = Color::create(['name' => 'White', 'hex_code' => '#FFFFFF']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Gown Example',
            'slug' => 'gown-example',
            'sku' => 'FL-EX-001',
            'base_price' => 1000.00,
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'FL-EX-001-M-WHI',
            'stock_quantity' => 2,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->delete(route('sizes.destroy', $size->id));

        $response->assertSessionHasErrors('general');
        $this->assertDatabaseHas('sizes', ['id' => $size->id]);
    }

    public function test_admin_can_create_color(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('colors.store'), [
            'name' => 'Rose Quartz Gold',
            'hex_code' => '#E8B4B8',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('colors', [
            'name' => 'Rose Quartz Gold',
            'hex_code' => '#E8B4B8',
        ]);
    }

    public function test_admin_cannot_delete_color_used_in_variants(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::create(['name' => 'Bridal', 'slug' => 'bridal', 'is_active' => true]);
        $size = Size::create(['name' => 'Small', 'code' => 'S']);
        $color = Color::create(['name' => 'Royal Gold', 'hex_code' => '#D4AF37']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Gold Gown',
            'slug' => 'gold-gown',
            'sku' => 'FL-GLD-001',
            'base_price' => 2800.00,
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $product->id,
            'size_id' => $size->id,
            'color_id' => $color->id,
            'sku' => 'FL-GLD-001-S-GLD',
            'stock_quantity' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->delete(route('colors.destroy', $color->id));

        $response->assertSessionHasErrors('general');
        $this->assertDatabaseHas('colors', ['id' => $color->id]);
    }
}

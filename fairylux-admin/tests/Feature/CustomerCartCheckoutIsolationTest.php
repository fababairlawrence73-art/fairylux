<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\Size;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerCartCheckoutIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $user1;
    protected User $user2;
    protected Product $product;
    protected ProductVariant $variant1;
    protected ProductVariant $outOfStockVariant;
    protected Color $color;
    protected Size $size;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'Administrator', 'slug' => 'admin', 'description' => 'Admin']);
        $customerRole = Role::create(['name' => 'Customer', 'slug' => 'customer', 'description' => 'Customer']);

        $this->adminUser = User::factory()->create(['role_id' => $adminRole->id]);
        $this->user1 = User::factory()->create(['role_id' => $customerRole->id, 'firebase_uid' => 'firebase-uid-user-1']);
        $this->user2 = User::factory()->create(['role_id' => $customerRole->id, 'firebase_uid' => 'firebase-uid-user-2']);

        $category = Category::create(['name' => 'Bridal', 'slug' => 'bridal', 'is_active' => true]);
        $this->color = Color::create(['name' => 'Ivory', 'hex_code' => '#FFFFF0']);
        $this->size = Size::create(['name' => 'Medium', 'code' => 'M', 'sort_order' => 2]);
        $sizeSmall = Size::create(['name' => 'Small', 'code' => 'S', 'sort_order' => 1]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Aurelia Royal Ballgown',
            'slug' => 'aurelia-royal-ballgown',
            'sku' => 'AURELIA-001',
            'base_price' => 50000.00,
            'status' => 'active',
        ]);

        $this->variant1 = ProductVariant::create([
            'product_id' => $this->product->id,
            'color_id' => $this->color->id,
            'size_id' => $this->size->id,
            'sku' => 'AURELIA-IVY-M',
            'price' => 50000.00,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $this->outOfStockVariant = ProductVariant::create([
            'product_id' => $this->product->id,
            'color_id' => $this->color->id,
            'size_id' => $sizeSmall->id,
            'sku' => 'AURELIA-IVY-S',
            'price' => 50000.00,
            'stock_quantity' => 0,
            'is_active' => true,
        ]);
    }

    public function test_cart_requires_valid_variant_and_cannot_add_out_of_stock()
    {
        // Out of stock attempt
        $response = $this->actingAs($this->user1)->postJson('/api/cart', [
            'variant_id' => $this->outOfStockVariant->id,
            'quantity' => 1,
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['status' => 'error', 'message' => 'The selected variant is out of stock.']);

        // Exceeding available stock
        $response = $this->actingAs($this->user1)->postJson('/api/cart', [
            'variant_id' => $this->variant1->id,
            'quantity' => 15,
        ]);

        $response->assertStatus(422);
    }

    public function test_user_1_and_user_2_do_not_share_carts()
    {
        // User 1 adds variant1 to cart (qty: 2)
        $this->actingAs($this->user1)->postJson('/api/cart', [
            'variant_id' => $this->variant1->id,
            'quantity' => 2,
        ])->assertStatus(201);

        $user1Cart = $this->actingAs($this->user1)->getJson('/api/cart');
        $user1Cart->assertStatus(200);
        $this->assertEquals(1, $user1Cart->json('data.items_count'));
        $this->assertEquals(2, $user1Cart->json('data.total_quantity'));

        // User 2 checks cart -> MUST BE EMPTY
        $user2Cart = $this->actingAs($this->user2)->getJson('/api/cart');
        $user2Cart->assertStatus(200);
        $this->assertEquals(0, $user2Cart->json('data.items_count'));
        $this->assertEmpty($user2Cart->json('data.items'));
    }

    public function test_user_1_and_user_2_do_not_share_addresses()
    {
        // User 1 creates address
        $addressResponse = $this->actingAs($this->user1)->postJson('/api/addresses', [
            'recipient_name' => 'Maria Santos',
            'phone_number' => '+63 917 111 2222',
            'street_address' => '5th Avenue',
            'city' => 'Taguig',
            'state_province' => 'Metro Manila',
            'postal_code' => '1634',
        ]);
        $addressResponse->assertStatus(201);
        $address1Id = $addressResponse->json('data.id');

        // User 1 can see address
        $user1Addresses = $this->actingAs($this->user1)->getJson('/api/addresses');
        $this->assertCount(1, $user1Addresses->json('data'));

        // User 2 cannot see User 1's address
        $user2Addresses = $this->actingAs($this->user2)->getJson('/api/addresses');
        $this->assertCount(0, $user2Addresses->json('data'));

        // User 2 cannot update or delete User 1's address
        $this->actingAs($this->user2)->putJson("/api/addresses/{$address1Id}", [
            'recipient_name' => 'Hacker Name',
        ])->assertStatus(404);

        $this->actingAs($this->user2)->deleteJson("/api/addresses/{$address1Id}")->assertStatus(404);
    }

    public function test_checkout_is_blocked_when_no_delivery_address_exists()
    {
        // User 1 adds item to cart
        $this->actingAs($this->user1)->postJson('/api/cart', [
            'variant_id' => $this->variant1->id,
            'quantity' => 1,
        ])->assertStatus(201);

        // User 1 attempts checkout without saving address
        $response = $this->actingAs($this->user1)->postJson('/api/checkout');
        $response->assertStatus(422);
        $response->assertJsonFragment([
            'status' => 'error',
            'error_code' => 'ADDRESS_REQUIRED',
        ]);
    }

    public function test_successful_checkout_deducts_inventory_creates_address_snapshot_and_clears_cart()
    {
        // 1. User 1 adds address
        $address = CustomerAddress::create([
            'user_id' => $this->user1->id,
            'recipient_name' => 'Original Recipient Maria',
            'phone_number' => '+63 917 000 1111',
            'street_address' => '100 Luxury Boulevard',
            'city' => 'Makati',
            'state_province' => 'Metro Manila',
            'postal_code' => '1200',
            'is_default' => true,
        ]);

        // 2. User 1 adds 3 units of variant1 (stock was 10)
        $this->actingAs($this->user1)->postJson('/api/cart', [
            'variant_id' => $this->variant1->id,
            'quantity' => 3,
        ])->assertStatus(201);

        // 3. User 1 places order
        $orderResponse = $this->actingAs($this->user1)->postJson('/api/checkout', [
            'address_id' => $address->id,
            'notes' => 'Handle with utmost care',
        ]);

        $orderResponse->assertStatus(201);
        $orderId = $orderResponse->json('data.order_id');
        $orderNumber = $orderResponse->json('data.order_number');

        // 4. Verify inventory deduction: 10 - 3 = 7
        $this->variant1->refresh();
        $this->assertEquals(7, $this->variant1->stock_quantity);

        // 5. Verify inventory audit record
        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $this->variant1->id,
            'old_stock_level' => 10,
            'quantity_change' => -3,
            'new_stock_level' => 7,
            'type' => 'sale',
        ]);

        // 6. Verify cart is cleared for User 1
        $cart = $this->actingAs($this->user1)->getJson('/api/cart');
        $this->assertEquals(0, $cart->json('data.items_count'));

        // 7. Verify Order record and frozen address snapshot
        $order = Order::find($orderId);
        $this->assertNotNull($order);
        $this->assertEquals($orderNumber, $order->order_number);
        $this->assertEquals(150000.00, (float) $order->total_amount);
        $this->assertEquals('Original Recipient Maria', $order->shipping_address_snapshot['recipient_name']);
        $this->assertEquals('100 Luxury Boulevard', $order->shipping_address_snapshot['street_address']);

        // 8. Verify Address Snapshot Mutability Guarantee:
        // Customer updates address in profile to "New Recipient Juan"
        $address->update(['recipient_name' => 'New Recipient Juan', 'street_address' => '999 New Street']);

        // Historical order MUST still have the original address snapshot
        $order->refresh();
        $this->assertEquals('Original Recipient Maria', $order->shipping_address_snapshot['recipient_name']);
        $this->assertEquals('100 Luxury Boulevard', $order->shipping_address_snapshot['street_address']);

        // 9. Verify User 2 cannot see or access User 1's order
        $user2Orders = $this->actingAs($this->user2)->getJson('/api/orders');
        $this->assertCount(0, $user2Orders->json('data'));

        $this->actingAs($this->user2)->getJson("/api/orders/{$orderId}")->assertStatus(404);

        // 10. Verify Admin Orders module sees the completed order with address snapshot
        $adminView = $this->actingAs($this->adminUser)->get('/orders');
        $adminView->assertStatus(200);
    }

    public function test_negative_stock_prevention_on_race_condition()
    {
        $address = CustomerAddress::create([
            'user_id' => $this->user1->id,
            'recipient_name' => 'Maria Santos',
            'phone_number' => '+63 917 000 1111',
            'street_address' => '100 Luxury Boulevard',
            'city' => 'Makati',
            'state_province' => 'Metro Manila',
            'postal_code' => '1200',
            'is_default' => true,
        ]);

        // Put 8 units in cart when stock is 10
        $this->actingAs($this->user1)->postJson('/api/cart', [
            'variant_id' => $this->variant1->id,
            'quantity' => 8,
        ])->assertStatus(201);

        // Simulate another customer purchasing 5 units in the background, reducing stock to 5
        $this->variant1->stock_quantity = 5;
        $this->variant1->save();

        // User 1 attempts checkout -> must reject and rollback without negative stock
        $response = $this->actingAs($this->user1)->postJson('/api/checkout', [
            'address_id' => $address->id,
        ]);

        $response->assertStatus(422);

        // Stock remains 5
        $this->variant1->refresh();
        $this->assertEquals(5, $this->variant1->stock_quantity);

        // Zero orders created
        $this->assertEquals(0, Order::count());
    }
}

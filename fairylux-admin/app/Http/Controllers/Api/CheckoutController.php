<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\CustomerAddress;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    /**
     * Process checkout and create real order with atomic inventory deduction.
     */
    public function placeOrder(Request $request)
    {
        $user = Auth::user();

        // 1. Verify delivery address requirement
        $addressId = $request->input('address_id');
        $addressQuery = CustomerAddress::where('user_id', $user->id);

        if ($addressId) {
            $address = (clone $addressQuery)->where('id', $addressId)->first();
        } else {
            // Default to primary address if no ID provided
            $address = (clone $addressQuery)->where('is_default', true)->first()
                ?? (clone $addressQuery)->orderByDesc('created_at')->first();
        }

        if (!$address) {
            return response()->json([
                'status' => 'error',
                'error_code' => 'ADDRESS_REQUIRED',
                'message' => 'Please set up a delivery address before proceeding to checkout.',
            ], 422);
        }

        // 2. Build immutable Address Snapshot
        $addressSnapshot = [
            'recipient_name' => $address->recipient_name,
            'phone_number' => $address->phone_number,
            'street_address' => $address->street_address,
            'apartment_suite' => $address->apartment_suite,
            'barangay' => $address->barangay,
            'city' => $address->city,
            'state_province' => $address->state_province,
            'postal_code' => $address->postal_code,
            'country' => $address->country ?? 'Philippines',
            'landmark' => $address->landmark,
            'formatted_address' => implode(', ', array_filter([
                $address->apartment_suite,
                $address->street_address,
                $address->barangay,
                $address->city,
                $address->state_province,
                $address->postal_code,
                $address->country ?? 'Philippines',
            ])),
        ];

        // 3. Retrieve customer's cart items
        $cartItems = CartItem::where('user_id', $user->id)
            ->with(['product', 'variant.color', 'variant.size'])
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Your shopping bag is empty. Please add items before checking out.',
            ], 422);
        }

        // 4. Pre-validate all items before beginning database transaction
        foreach ($cartItems as $item) {
            $variant = $item->variant;
            $product = $item->product;

            if (!$product || $product->status !== 'active') {
                return response()->json([
                    'status' => 'error',
                    'message' => "Item '{$item->product?->name}' is no longer available in the boutique.",
                ], 422);
            }

            if (!$variant || !$variant->is_active) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Selected variant for '{$product->name}' is no longer active.",
                ], 422);
            }

            if ($variant->stock_quantity < $item->quantity) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Insufficient stock for '{$product->name}' ({$variant->color?->name} / {$variant->size?->name}). Available: {$variant->stock_quantity}, requested: {$item->quantity}.",
                ], 422);
            }
        }

        // 5. Execute Order Creation + Inventory Deduction inside atomic DB transaction
        try {
            $order = DB::transaction(function () use ($user, $address, $addressSnapshot, $cartItems, $request) {
                // Generate unique luxury order number: e.g. FL-20260911-A8F2K
                $orderNumber = 'FL-' . date('Ymd') . '-' . strtoupper(Str::random(5));

                $subtotal = 0.00;
                $lineItemsData = [];

                // Re-check and lock each variant row to prevent race conditions & negative stock
                foreach ($cartItems as $item) {
                    $variant = ProductVariant::where('id', $item->product_variant_id)
                        ->lockForUpdate()
                        ->first();

                    if (!$variant || $variant->stock_quantity < $item->quantity) {
                        throw new Exception("Stock changed during checkout for '{$item->product->name}'. Available: " . ($variant?->stock_quantity ?? 0));
                    }

                    $product = $item->product;
                    $unitPrice = (float) ($variant->price ?? $product->sale_price ?? $product->base_price);
                    $lineTotal = round($unitPrice * $item->quantity, 2);
                    $subtotal += $lineTotal;

                    $colorName = $variant->color?->name ?? 'Standard';
                    $sizeName = $variant->size?->name ?? ($variant->size?->code ?? 'Standard');
                    $variantInfoStr = "{$colorName} / {$sizeName} (SKU: {$variant->sku})";

                    $lineItemsData[] = [
                        'variant' => $variant,
                        'product_name' => $product->name,
                        'variant_info' => $variantInfoStr,
                        'sku' => $variant->sku,
                        'color_name' => $colorName,
                        'size_name' => $sizeName,
                        'quantity' => $item->quantity,
                        'unit_price' => $unitPrice,
                        'line_total' => $lineTotal,
                    ];
                }

                // Create Order record
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $user->id,
                    'shipping_address_id' => $address->id,
                    'shipping_address_snapshot' => $addressSnapshot,
                    'status' => 'pending',
                    'payment_status' => 'unpaid',
                    'payment_method' => 'cash_on_delivery',
                    'subtotal' => round($subtotal, 2),
                    'tax_amount' => 0.00,
                    'shipping_fee' => 0.00,
                    'discount_amount' => 0.00,
                    'total_amount' => round($subtotal, 2),
                    'notes' => $request->input('notes'),
                ]);

                // Create Order Items and deduct inventory atomically
                foreach ($lineItemsData as $lineItem) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_variant_id' => $lineItem['variant']->id,
                        'product_name' => $lineItem['product_name'],
                        'variant_info' => $lineItem['variant_info'],
                        'quantity' => $lineItem['quantity'],
                        'unit_price' => $lineItem['unit_price'],
                        'total_price' => $lineItem['line_total'],
                    ]);

                    // Deduct stock
                    $variant = $lineItem['variant'];
                    $oldStock = (int) $variant->stock_quantity;
                    $newStock = $oldStock - $lineItem['quantity'];

                    if ($newStock < 0) {
                        throw new Exception("Stock deduction would result in negative stock for {$variant->sku}.");
                    }

                    $variant->stock_quantity = $newStock;
                    $variant->save();

                    // Record audit log in inventories table
                    Inventory::create([
                        'product_variant_id' => $variant->id,
                        'user_id' => $user->id,
                        'old_stock_level' => $oldStock,
                        'quantity_change' => -$lineItem['quantity'],
                        'new_stock_level' => $newStock,
                        'type' => 'sale',
                        'reference_note' => "Mobile Order #{$order->order_number}",
                    ]);
                }

                // Clear customer's cart only after full success
                CartItem::where('user_id', $user->id)->delete();

                return $order;
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Your order has been placed successfully.',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => (float) $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toISOString(),
                ],
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Checkout failed: ' . $e->getMessage(),
            ], 422);
        }
    }
}

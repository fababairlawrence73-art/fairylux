<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Support\ImageUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Display the authenticated customer's cart.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $cartItems = CartItem::where('user_id', $user->id)
            ->with(['product', 'variant.color', 'variant.size'])
            ->orderByDesc('created_at')
            ->get();

        $formattedItems = [];
        $subtotal = 0.00;
        $totalQuantity = 0;

        foreach ($cartItems as $item) {
            $variant = $item->variant;
            $product = $item->product;

            if (!$variant || !$product || $product->status !== 'active' || !$variant->is_active) {
                // Skip or remove invalid/deleted variant
                continue;
            }

            // Real current price from variant, or product sale_price, or base_price
            $unitPrice = (float) ($variant->price ?? $product->sale_price ?? $product->base_price);
            $availableStock = (int) $variant->stock_quantity;

            // Cap cart quantity if it exceeds current inventory
            $quantity = min($item->quantity, max(1, $availableStock));
            if ($quantity !== $item->quantity && $availableStock > 0) {
                $item->quantity = $quantity;
                $item->save();
            }

            $lineTotal = round($unitPrice * $quantity, 2);
            $subtotal += $lineTotal;
            $totalQuantity += $quantity;

            // Determine image: color specific image if available, else product featured image
            $colorImages = is_array($product->color_images) ? $product->color_images : [];
            $variantImg = ($variant->color_id && isset($colorImages[$variant->color_id]))
                ? $colorImages[$variant->color_id]
                : $product->featured_image;

            $formattedItems[] = [
                'id' => $item->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_slug' => $product->slug,
                'image_url' => ImageUrl::format($variantImg),
                'variant_id' => $variant->id,
                'sku' => $variant->sku,
                'color' => $variant->color ? [
                    'id' => $variant->color->id,
                    'name' => $variant->color->name,
                    'hex_code' => $variant->color->hex_code,
                ] : null,
                'size' => $variant->size ? [
                    'id' => $variant->size->id,
                    'name' => $variant->size->name,
                    'code' => $variant->size->code,
                ] : null,
                'unit_price' => $unitPrice,
                'quantity' => $quantity,
                'available_stock' => $availableStock,
                'is_in_stock' => $availableStock > 0,
                'line_total' => $lineTotal,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'items' => $formattedItems,
                'items_count' => count($formattedItems),
                'total_quantity' => $totalQuantity,
                'subtotal' => round($subtotal, 2),
                'shipping_fee' => 0.00,
                'total' => round($subtotal, 2),
            ],
        ]);
    }

    /**
     * Add an item to the authenticated customer's cart.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $quantity = (int) ($validated['quantity'] ?? 1);

        $variant = ProductVariant::with('product')
            ->where('id', $validated['variant_id'])
            ->where('is_active', true)
            ->first();

        if (!$variant || !$variant->product || $variant->product->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'The selected product variant is currently unavailable.',
            ], 422);
        }

        if ($variant->stock_quantity <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'The selected variant is out of stock.',
            ], 422);
        }

        // Find existing cart item for this customer
        $cartItem = CartItem::where('user_id', $user->id)
            ->where('product_variant_id', $variant->id)
            ->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $quantity;
            if ($newQuantity > $variant->stock_quantity) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Cannot add more. Available stock for this variant is {$variant->stock_quantity}.",
                ], 422);
            }
            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            if ($quantity > $variant->stock_quantity) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Requested quantity exceeds available stock ({$variant->stock_quantity}).",
                ], 422);
            }

            $cartItem = CartItem::create([
                'user_id' => $user->id,
                'product_id' => $variant->product_id,
                'product_variant_id' => $variant->id,
                'quantity' => $quantity,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Item added to your shopping bag.',
            'data' => [
                'cart_item_id' => $cartItem->id,
                'quantity' => $cartItem->quantity,
            ],
        ], 201);
    }

    /**
     * Update quantity of a cart item.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $user->id)
            ->with('variant')
            ->first();

        if (!$cartItem) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cart item not found.',
            ], 404);
        }

        $variant = $cartItem->variant;
        if (!$variant || $variant->stock_quantity <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'This variant is currently out of stock.',
            ], 422);
        }

        $newQuantity = (int) $validated['quantity'];
        if ($newQuantity > $variant->stock_quantity) {
            return response()->json([
                'status' => 'error',
                'message' => "Only {$variant->stock_quantity} units available in atelier inventory.",
            ], 422);
        }

        $cartItem->quantity = $newQuantity;
        $cartItem->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Cart quantity updated.',
            'data' => [
                'id' => $cartItem->id,
                'quantity' => $cartItem->quantity,
            ],
        ]);
    }

    /**
     * Remove an item from the cart.
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cart item not found.',
            ], 404);
        }

        $cartItem->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Item removed from shopping bag.',
        ]);
    }
}

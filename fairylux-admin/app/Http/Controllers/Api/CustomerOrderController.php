<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\ImageUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomerOrderController extends Controller
{
    /**
     * List all orders for the authenticated customer.
     */
    public function index()
    {
        $user = Auth::user();

        $orders = Order::where('user_id', $user->id)
            ->with(['items.productVariant.product', 'items.productVariant.color'])
            ->orderByDesc('created_at')
            ->get();

        $data = $orders->map(function ($order) {
            $firstItem = $order->items->first();
            $product = $firstItem?->productVariant?->product;
            $color = $firstItem?->productVariant?->color;

            $colorImages = ($product && is_array($product->color_images)) ? $product->color_images : [];
            $previewImg = ($color && isset($colorImages[$color->id]))
                ? $colorImages[$color->id]
                : $product?->featured_image;

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'total_amount' => (float) $order->total_amount,
                'items_count' => $order->items->sum('quantity'),
                'created_at' => $order->created_at->toISOString(),
                'formatted_date' => $order->created_at->format('M d, Y h:i A'),
                'preview_image' => ImageUrl::format($previewImg),
                'preview_title' => $firstItem ? $firstItem->product_name : 'FairyLux Order',
                'preview_variant' => $firstItem ? $firstItem->variant_info : '',
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * Display full details of a specific order belonging to the authenticated customer.
     */
    public function show($id)
    {
        $user = Auth::user();

        $order = Order::where('user_id', $user->id)
            ->where(function ($q) use ($id) {
                if (is_numeric($id)) {
                    $q->where('id', $id)->orWhere('order_number', $id);
                } else {
                    $q->where('order_number', $id);
                }
            })
            ->with(['items.productVariant.product', 'items.productVariant.color', 'shippingAddress'])
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found or unauthorized access.',
            ], 404);
        }

        // Delivery address snapshot takes precedence over current editable address
        $addressSnapshot = $order->shipping_address_snapshot;
        if (!$addressSnapshot && $order->shippingAddress) {
            $addr = $order->shippingAddress;
            $addressSnapshot = [
                'recipient_name' => $addr->recipient_name,
                'phone_number' => $addr->phone_number,
                'street_address' => $addr->street_address,
                'apartment_suite' => $addr->apartment_suite,
                'barangay' => $addr->barangay,
                'city' => $addr->city,
                'state_province' => $addr->state_province,
                'postal_code' => $addr->postal_code,
                'country' => $addr->country ?? 'Philippines',
                'landmark' => $addr->landmark,
                'formatted_address' => implode(', ', array_filter([
                    $addr->apartment_suite,
                    $addr->street_address,
                    $addr->barangay,
                    $addr->city,
                    $addr->state_province,
                    $addr->postal_code,
                    $addr->country ?? 'Philippines',
                ])),
            ];
        }

        $items = $order->items->map(function ($item) {
            $product = $item->productVariant?->product;
            $color = $item->productVariant?->color;
            $colorImages = ($product && is_array($product->color_images)) ? $product->color_images : [];
            $img = ($color && isset($colorImages[$color->id]))
                ? $colorImages[$color->id]
                : $product?->featured_image;

            return [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'variant_info' => $item->variant_info,
                'quantity' => (int) $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total_price' => (float) $item->total_price,
                'image_url' => ImageUrl::format($img),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'subtotal' => (float) $order->subtotal,
                'shipping_fee' => (float) $order->shipping_fee,
                'total_amount' => (float) $order->total_amount,
                'notes' => $order->notes,
                'created_at' => $order->created_at->toISOString(),
                'formatted_date' => $order->created_at->format('F d, Y h:i A'),
                'delivery_address' => $addressSnapshot,
                'items' => $items,
            ],
        ]);
    }
}

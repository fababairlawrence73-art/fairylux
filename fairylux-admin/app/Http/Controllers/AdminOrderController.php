<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Services\FirestoreService;
use App\Support\ImageUrl;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminOrderController extends Controller
{
    /**
     * Valid status transitions.
     * Key = current status, value = array of statuses that may follow.
     */
    private const VALID_TRANSITIONS = [
        'pending'    => ['confirmed', 'cancelled'],
        'confirmed'  => ['processing', 'cancelled'],
        'processing' => ['completed', 'cancelled'],
        // Terminal statuses — no further transitions allowed
        'completed'  => [],
        'cancelled'  => [],
        // Legacy statuses (kept for backwards compatibility)
        'shipped'    => ['delivered', 'cancelled'],
        'delivered'  => [],
    ];

    /**
     * Human-readable notification copy for each target status.
     */
    private const NOTIFICATION_COPY = [
        'confirmed'  => [
            'title'   => 'Order Confirmed',
            'message' => 'Your FairyLux order #{order_number} has been confirmed. Our atelier team is preparing your order.',
        ],
        'processing' => [
            'title'   => 'Order Processing',
            'message' => 'Your FairyLux order #{order_number} is now being processed and crafted by our master couturiers.',
        ],
        'completed'  => [
            'title'   => 'Order Completed',
            'message' => 'Your FairyLux order #{order_number} has been completed. Thank you for choosing FairyLux Haute Couture!',
        ],
        'cancelled'  => [
            'title'   => 'Order Cancelled',
            'message' => 'Your FairyLux order #{order_number} has been cancelled. If you have questions, please contact our concierge.',
        ],
        'shipped'    => [
            'title'   => 'Order Shipped',
            'message' => 'Your FairyLux order #{order_number} has been shipped and is on its way to you.',
        ],
        'delivered'  => [
            'title'   => 'Order Delivered',
            'message' => 'Your FairyLux order #{order_number} has been delivered. We hope you love it!',
        ],
    ];

    /**
     * Display all customer orders in the boutique admin portal.
     */
    public function index(Request $request)
    {
        $statusFilter = $request->query('status');
        $search       = $request->query('search');

        $query = Order::with([
            'user',
            'items.productVariant.color',
            'items.productVariant.size',
            'items.productVariant.product',
            'shippingAddress',
        ])->orderByDesc('created_at');

        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->paginate(20)->withQueryString();

        $formattedOrders = $orders->through(function ($order) {
            $address = $order->shipping_address_snapshot;
            if (!$address && $order->shippingAddress) {
                $addr    = $order->shippingAddress;
                $address = [
                    'recipient_name'  => $addr->recipient_name,
                    'phone_number'    => $addr->phone_number,
                    'street_address'  => $addr->street_address,
                    'apartment_suite' => $addr->apartment_suite,
                    'barangay'        => $addr->barangay,
                    'city'            => $addr->city,
                    'state_province'  => $addr->state_province,
                    'postal_code'     => $addr->postal_code,
                    'country'         => $addr->country ?? 'Philippines',
                    'landmark'        => $addr->landmark,
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
                $product    = $item->productVariant?->product;
                $color      = $item->productVariant?->color;
                $colorImages = ($product && is_array($product->color_images)) ? $product->color_images : [];
                $img         = ($color && isset($colorImages[$color->id]))
                    ? $colorImages[$color->id]
                    : $product?->featured_image;

                return [
                    'id'           => $item->id,
                    'product_name' => $item->product_name,
                    'variant_info' => $item->variant_info,
                    'quantity'     => (int) $item->quantity,
                    'unit_price'   => (float) $item->unit_price,
                    'total_price'  => (float) $item->total_price,
                    'image_url'    => ImageUrl::format($img),
                ];
            });

            return [
                'id'               => $order->id,
                'order_number'     => $order->order_number,
                'customer_name'    => $order->user?->name ?? 'Guest / Customer',
                'customer_email'   => $order->user?->email ?? '—',
                'customer_phone'   => $address['phone_number'] ?? ($order->user?->phone_number ?? '—'),
                'status'           => $order->status,
                'payment_status'   => $order->payment_status,
                'payment_method'   => $order->payment_method ?? 'Cash on Delivery',
                'subtotal'         => (float) $order->subtotal,
                'shipping_fee'     => (float) $order->shipping_fee,
                'total_amount'     => (float) $order->total_amount,
                'notes'            => $order->notes,
                'created_at'       => $order->created_at->format('M d, Y h:i A'),
                'delivery_address' => $address,
                'items'            => $items,
                'items_count'      => $order->items->sum('quantity'),
            ];
        });

        $counts = [
            'all'        => Order::count(),
            'pending'    => Order::where('status', 'pending')->count(),
            'confirmed'  => Order::where('status', 'confirmed')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'completed'  => Order::where('status', 'completed')->count(),
            'cancelled'  => Order::where('status', 'cancelled')->count(),
            'shipped'    => Order::where('status', 'shipped')->count(),
            'delivered'  => Order::where('status', 'delivered')->count(),
        ];

        return Inertia::render('Orders/Index', [
            'orders'  => $formattedOrders,
            'filters' => [
                'status' => $statusFilter ?? 'all',
                'search' => $search ?? '',
            ],
            'counts'  => $counts,
        ]);
    }

    /**
     * Update order status with validated transition, optional inventory restoration,
     * and realtime Firestore customer notification.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,completed,cancelled,shipped,delivered',
        ]);

        $newStatus  = $validated['status'];
        $oldStatus  = $order->status;

        // 1. No-op: same status — silently redirect without doing anything
        if ($newStatus === $oldStatus) {
            return redirect()->back()->with('info', "Order #{$order->order_number} is already {$oldStatus}.");
        }

        // 2. Validate transition
        $allowed = self::VALID_TRANSITIONS[$oldStatus] ?? [];
        if (!in_array($newStatus, $allowed, true)) {
            return redirect()->back()->withErrors([
                'status' => "Cannot transition order from '{$oldStatus}' to '{$newStatus}'. Invalid status transition.",
            ]);
        }

        // 3. Execute inside a DB transaction
        try {
            DB::transaction(function () use ($order, $newStatus, $oldStatus) {
                // 3a. Restore inventory if cancelling
                if ($newStatus === 'cancelled') {
                    $this->restoreInventory($order);
                }

                // 3b. Update the MySQL order status
                $order->status     = $newStatus;
                $order->updated_at = now();
                $order->save();
            });
        } catch (Exception $e) {
            Log::error("[AdminOrderController] Status update transaction failed.", [
                'order_id'   => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'error'      => $e->getMessage(),
            ]);
            return redirect()->back()->withErrors([
                'status' => 'Order update failed: ' . $e->getMessage(),
            ]);
        }

        // 4. Dispatch Firestore notification (outside the DB transaction — non-critical)
        $this->dispatchFirestoreNotification($order, $newStatus);

        return redirect()->back()->with('success', "Order #{$order->order_number} status updated to {$newStatus}.");
    }

    /**
     * Restore inventory for all items in a cancelled order.
     * Idempotent: if the order is already cancelled, restoration is skipped.
     */
    private function restoreInventory(Order $order): void
    {
        // Guard: only restore if transitioning INTO cancelled for the first time
        if ($order->status === 'cancelled') {
            Log::info("[AdminOrderController] Order #{$order->order_number} is already cancelled. Stock NOT restored again.");
            return;
        }

        $orderItems = $order->load('items')->items;

        foreach ($orderItems as $item) {
            if (!$item->product_variant_id) {
                continue;
            }

            // Lock the variant row to prevent race conditions
            $variant = ProductVariant::where('id', $item->product_variant_id)
                ->lockForUpdate()
                ->first();

            if (!$variant) {
                Log::warning("[AdminOrderController] Variant {$item->product_variant_id} not found during stock restoration for order #{$order->order_number}.");
                continue;
            }

            $oldStock = (int) $variant->stock_quantity;
            $newStock = $oldStock + (int) $item->quantity;

            $variant->stock_quantity = $newStock;
            $variant->save();

            // Audit log
            Inventory::create([
                'product_variant_id' => $variant->id,
                'user_id'            => null,
                'old_stock_level'    => $oldStock,
                'quantity_change'    => (int) $item->quantity,
                'new_stock_level'    => $newStock,
                'type'               => 'cancellation_restore',
                'reference_note'     => "Order Cancelled #{$order->order_number} — stock restored",
            ]);

            Log::info("[AdminOrderController] Stock restored for variant {$variant->sku}.", [
                'order_number'   => $order->order_number,
                'old_stock'      => $oldStock,
                'restored_qty'   => $item->quantity,
                'new_stock'      => $newStock,
            ]);
        }
    }

    /**
     * Write a realtime Firestore notification for the customer.
     * Non-throwing — failures are logged but do not break the order update.
     */
    private function dispatchFirestoreNotification(Order $order, string $newStatus): void
    {
        $copy = self::NOTIFICATION_COPY[$newStatus] ?? null;
        if (!$copy) {
            return; // No notification copy for this status
        }

        // Resolve Firebase UID from the order's customer
        $order->load('user');
        $firebaseUid = $order->user?->firebase_uid;

        if (!$firebaseUid) {
            Log::warning("[AdminOrderController] No firebase_uid on user for order #{$order->order_number}. Notification NOT sent.", [
                'order_id' => $order->id,
                'user_id'  => $order->user_id,
            ]);
            return;
        }

        $message = str_replace('{order_number}', $order->order_number, $copy['message']);

        $firestoreService = app(FirestoreService::class);
        $firestoreService->createNotification($firebaseUid, [
            'type'        => 'order_status',
            'title'       => $copy['title'],
            'message'     => $message,
            'orderId'     => $order->id,
            'orderNumber' => $order->order_number,
            'orderStatus' => $newStatus,
        ]);
    }
}

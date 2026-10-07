<?php

namespace App\Http\Controllers;

use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of all customers with real database records.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $statusFilter = $request->query('status'); // 'all', 'active', 'inactive'
        $sourceFilter = $request->query('source'); // 'all', 'firebase', 'direct'

        // Base query: all users with customer role
        $query = User::whereHas('role', function ($q) {
            $q->where('slug', 'customer');
        })->with([
            'addresses' => function ($q) {
                $q->orderByDesc('is_default')->orderByDesc('id');
            },
            'orders' => function ($q) {
                $q->with('items')->orderByDesc('created_at');
            },
        ])->withCount('orders');

        // Search by name, email, phone, or firebase_uid
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('firebase_uid', 'like', "%{$search}%")
                  ->orWhereHas('addresses', function ($aq) use ($search) {
                      $aq->where('recipient_name', 'like', "%{$search}%")
                         ->orWhere('phone_number', 'like', "%{$search}%")
                         ->orWhere('city', 'like', "%{$search}%")
                         ->orWhere('barangay', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by active status
        if ($statusFilter === 'active') {
            $query->where('is_active', true);
        } elseif ($statusFilter === 'inactive') {
            $query->where('is_active', false);
        }

        // Filter by account source
        if ($sourceFilter === 'firebase') {
            $query->whereNotNull('firebase_uid');
        } elseif ($sourceFilter === 'direct') {
            $query->whereNull('firebase_uid');
        }

        // Ordering: latest registered first
        $query->orderByDesc('created_at');

        $paginated = $query->paginate(15)->withQueryString();

        // Transform customers data
        $customers = $paginated->through(function ($user) {
            $orders = $user->orders;
            $addresses = $user->addresses;

            $totalSpent = (float) $orders->where('status', '!=', 'cancelled')->sum('total_amount');
            $latestOrder = $orders->first();

            // Best phone number available: user's direct phone or address phone
            $defaultAddr = $addresses->firstWhere('is_default', true) ?? $addresses->first();
            $resolvedPhone = $user->phone_number ?: ($defaultAddr?->phone_number ?: null);

            // Format address list
            $formattedAddresses = $addresses->map(function ($addr) {
                return [
                    'id' => $addr->id,
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
                    'is_default' => (bool) $addr->is_default,
                    'formatted' => implode(', ', array_filter([
                        $addr->apartment_suite,
                        $addr->street_address,
                        $addr->barangay,
                        $addr->city,
                        $addr->state_province,
                        $addr->postal_code,
                        $addr->country ?? 'Philippines',
                    ])),
                ];
            });

            // Format orders list
            $formattedOrders = $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method ?? 'Cash on Delivery',
                    'total_amount' => (float) $order->total_amount,
                    'subtotal' => (float) $order->subtotal,
                    'shipping_fee' => (float) $order->shipping_fee,
                    'items_count' => (int) $order->items->sum('quantity'),
                    'created_at' => $order->created_at->format('M d, Y h:i A'),
                    'created_at_raw' => $order->created_at->toISOString(),
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_name' => $item->product_name,
                            'variant_info' => $item->variant_info,
                            'quantity' => (int) $item->quantity,
                            'unit_price' => (float) $item->unit_price,
                            'total_price' => (float) $item->total_price,
                        ];
                    }),
                ];
            });

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $resolvedPhone,
                'has_phone' => !empty($resolvedPhone),
                'firebase_uid' => $user->firebase_uid,
                'account_source' => $user->firebase_uid ? 'Firebase Auth (Mobile App)' : 'Direct / Seeded Account',
                'account_source_badge' => $user->firebase_uid ? 'firebase' : 'direct',
                'is_active' => (bool) $user->is_active,
                'created_at' => $user->created_at ? $user->created_at->format('M d, Y') : '—',
                'created_at_time' => $user->created_at ? $user->created_at->format('M d, Y h:i A') : '—',
                'total_orders' => (int) $user->orders_count,
                'total_spent' => $totalSpent,
                'last_order' => $latestOrder ? [
                    'order_number' => $latestOrder->order_number,
                    'date' => $latestOrder->created_at->format('M d, Y'),
                    'status' => $latestOrder->status,
                    'total_amount' => (float) $latestOrder->total_amount,
                ] : null,
                'addresses' => $formattedAddresses,
                'addresses_count' => $addresses->count(),
                'orders' => $formattedOrders,
            ];
        });

        // Overview Summary Statistics
        $baseCustomers = User::whereHas('role', fn($q) => $q->where('slug', 'customer'));
        $stats = [
            'total_customers' => (clone $baseCustomers)->count(),
            'active_customers' => (clone $baseCustomers)->where('is_active', true)->count(),
            'inactive_customers' => (clone $baseCustomers)->where('is_active', false)->count(),
            'firebase_customers' => (clone $baseCustomers)->whereNotNull('firebase_uid')->count(),
            'direct_customers' => (clone $baseCustomers)->whereNull('firebase_uid')->count(),
            'customers_with_orders' => (clone $baseCustomers)->has('orders')->count(),
            'total_customer_spent' => (float) Order::where('status', '!=', 'cancelled')->sum('total_amount'),
        ];

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?? '',
                'status' => $statusFilter ?? 'all',
                'source' => $sourceFilter ?? 'all',
            ],
            'selected_id' => $request->query('view') ? (int) $request->query('view') : null,
        ]);
    }

    /**
     * Toggle active/inactive status of a customer account.
     */
    public function toggleStatus(User $customer)
    {
        if ($customer->isAdmin()) {
            return back()->with('error', 'Cannot modify status of administrator accounts.');
        }

        $customer->is_active = !$customer->is_active;
        $customer->save();

        $action = $customer->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Customer {$customer->name} has been {$action} successfully.");
    }
}

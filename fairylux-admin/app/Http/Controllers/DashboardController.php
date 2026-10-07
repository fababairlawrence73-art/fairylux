<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the e-commerce overview dashboard with real database metrics.
     */
    public function index()
    {
        $totalProducts = Product::count();
        $activeProducts = Product::where('status', 'active')->count();
        $totalStockUnits = (int) ProductVariant::sum('stock_quantity');
        $totalCategories = Category::count();
        $activeCategories = Category::where('is_active', true)->count();

        // Real Analytics Metrics from MySQL database
        // Total sales revenue: actual sum of order totals excluding cancelled orders
        $totalSalesRevenue = (float) (Order::where('status', '!=', 'cancelled')->sum('total_amount') ?? 0);
        
        // Total orders: count of all placed customer orders
        $totalOrders = Order::count();

        // Pending orders: count of orders awaiting confirmation/processing
        $pendingOrders = Order::where('status', 'pending')->count();

        // Total customers: count of actual customer accounts (excluding admin users)
        $totalCustomers = User::whereHas('role', function ($query) {
            $query->where('slug', 'customer');
        })->count();

        // Load products with relations to compute accurate stock levels for alerts
        $products = Product::with(['category', 'variants.size', 'variants.color'])
            ->orderByDesc('updated_at')
            ->get();

        $outOfStockList = [];
        $lowStockList = [];

        foreach ($products as $product) {
            $stock = $product->total_stock;
            $itemData = [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category_name' => $product->category?->name ?? 'Uncategorized',
                'base_price' => $product->base_price,
                'sale_price' => $product->sale_price,
                'total_stock' => $stock,
                'status' => $product->status,
                'featured_image_url' => $product->featured_image_url,
                'variants_count' => $product->variants->count(),
            ];

            if ($stock === 0) {
                $outOfStockList[] = $itemData;
            } elseif ($stock <= 5) {
                $lowStockList[] = $itemData;
            }
        }

        $outOfStockCount = count($outOfStockList);
        $lowStockCount = count($lowStockList);

        // Combined inventory items needing attention (up to 8 items)
        $inventoryAlerts = array_slice(array_merge($outOfStockList, $lowStockList), 0, 8);

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'total_stock_units' => $totalStockUnits,
                'low_stock_products' => $lowStockCount,
                'out_of_stock_products' => $outOfStockCount,
                'total_categories' => $totalCategories,
                'active_categories' => $activeCategories,
                'total_sales_revenue' => $totalSalesRevenue,
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'total_customers' => $totalCustomers,
            ],
            'inventory_alerts' => $inventoryAlerts,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Color;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display inventory matrix with real database summary metrics and variant-level controls.
     */
    public function index(Request $request)
    {
        $lowStockThreshold = 3;

        // Real dynamic database calculations for summary cards
        $totalUnits = (int) ProductVariant::sum('stock_quantity');
        $totalVariants = ProductVariant::count();
        $inStockCount = ProductVariant::where('stock_quantity', '>', $lowStockThreshold)->count();
        $lowStockCount = ProductVariant::whereBetween('stock_quantity', [1, $lowStockThreshold])->count();
        $outOfStockCount = ProductVariant::where('stock_quantity', '<=', 0)->count() + Product::doesntHave('variants')->count();

        // Build query joining products with variants to include products with 0 variants
        $query = DB::table('products as p')
            ->leftJoin('product_variants as pv', 'pv.product_id', '=', 'p.id')
            ->leftJoin('categories as c', 'c.id', '=', 'p.category_id')
            ->leftJoin('sizes as s', 's.id', '=', 'pv.size_id')
            ->leftJoin('colors as col', 'col.id', '=', 'pv.color_id')
            ->select([
                'pv.id as variant_id',
                'p.id as product_id',
                'p.name as product_name',
                'p.slug as product_slug',
                'p.sku as product_sku',
                'c.name as category_name',
                'pv.sku as variant_sku',
                's.id as size_id',
                's.name as size_name',
                's.code as size_code',
                'col.id as color_id',
                'col.name as color_name',
                'col.hex_code as color_hex_code',
                DB::raw('COALESCE(pv.price, p.base_price, 0) as effective_price'),
                DB::raw('COALESCE(pv.stock_quantity, 0) as stock_quantity'),
                'pv.image_path as variant_image_path',
                'p.featured_image as product_featured_image',
                DB::raw('COALESCE(pv.updated_at, p.updated_at) as row_updated_at'),
                DB::raw('COALESCE(pv.created_at, p.created_at) as row_created_at'),
                DB::raw('CASE WHEN pv.id IS NOT NULL THEN 1 ELSE 0 END as has_variant'),
            ]);

        // Search filter: Product name, Product SKU, or Variant SKU
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('p.name', 'like', "%{$search}%")
                    ->orWhere('p.sku', 'like', "%{$search}%")
                    ->orWhere('pv.sku', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category_id')) {
            $query->where('p.category_id', $request->category_id);
        }

        // Stock status filter
        if ($request->filled('stock_status')) {
            switch ($request->stock_status) {
                case 'in_stock':
                    $query->where('pv.stock_quantity', '>', $lowStockThreshold);
                    break;
                case 'low_stock':
                    $query->whereBetween('pv.stock_quantity', [1, $lowStockThreshold]);
                    break;
                case 'out_of_stock':
                    $query->where(function ($q) {
                        $q->whereNull('pv.id')
                            ->orWhere('pv.stock_quantity', '<=', 0);
                    });
                    break;
            }
        }

        // Color filter
        if ($request->filled('color_id')) {
            $query->where('pv.color_id', $request->color_id);
        }

        // Size filter
        if ($request->filled('size_id')) {
            $query->where('pv.size_id', $request->size_id);
        }

        // Sort order
        $sortBy = $request->get('sort_by', 'updated_at');
        $sortOrder = $request->get('sort_order', 'desc') === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'stock_quantity') {
            $query->orderByRaw("COALESCE(pv.stock_quantity, 0) {$sortOrder}");
        } elseif ($sortBy === 'created_at') {
            $query->orderByRaw("COALESCE(pv.created_at, p.created_at) {$sortOrder}");
        } else {
            $query->orderByRaw("COALESCE(pv.updated_at, p.updated_at) {$sortOrder}");
        }

        $variants = $query->paginate(15)->withQueryString()->through(function ($v) use ($lowStockThreshold) {
            $hasVariant = (bool) $v->has_variant;
            $stock = (int) $v->stock_quantity;

            if (!$hasVariant) {
                $status = 'out_of_stock';
            } else {
                $status = $stock <= 0 ? 'out_of_stock' : ($stock <= $lowStockThreshold ? 'low_stock' : 'in_stock');
            }

            $imagePath = $v->variant_image_path ?: $v->product_featured_image;
            $imageUrl = null;
            if ($imagePath) {
                $imageUrl = (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://'))
                    ? $imagePath
                    : Storage::disk('public')->url($imagePath);
            }

            $updatedAt = $v->row_updated_at ? \Carbon\Carbon::parse($v->row_updated_at) : null;

            return [
                'id' => $v->variant_id,
                'product_id' => $v->product_id,
                'product_name' => $v->product_name ?? 'Unknown Gown',
                'product_slug' => $v->product_slug ?? '',
                'category_name' => $v->category_name ?? 'Uncategorized',
                'sku' => $hasVariant ? ($v->variant_sku ?? '—') : '—',
                'product_sku' => $v->product_sku ?? '—',
                'has_variants' => $hasVariant,
                'size' => [
                    'id' => $v->size_id,
                    'name' => $hasVariant ? ($v->size_name ?? 'Standard') : '—',
                    'code' => $hasVariant ? ($v->size_code ?? 'STD') : '—',
                ],
                'color' => [
                    'id' => $v->color_id,
                    'name' => $hasVariant ? ($v->color_name ?? 'Standard') : '—',
                    'hex_code' => $hasVariant ? ($v->color_hex_code ?? '#CCCCCC') : null,
                ],
                'price' => (float) $v->effective_price,
                'stock_quantity' => $stock,
                'stock_status' => $status,
                'inventory_status' => $hasVariant ? null : 'No variants configured',
                'image_url' => $imageUrl,
                'last_updated' => $updatedAt ? $updatedAt->format('M d, Y h:i A') : '—',
                'last_updated_human' => $updatedAt ? $updatedAt->diffForHumans() : '—',
            ];
        });

        // Filter dropdown choices
        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $sizes = Size::orderBy('sort_order')->get(['id', 'name', 'code']);
        $colors = Color::orderBy('name')->get(['id', 'name', 'hex_code']);

        // Recent boutique-wide stock adjustment logs
        $recentLogs = Inventory::with(['productVariant.product', 'productVariant.size', 'productVariant.color', 'user'])
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'variant_id' => $log->product_variant_id,
                    'product_name' => $log->productVariant?->product?->name ?? 'Unknown Gown',
                    'sku' => $log->productVariant?->sku ?? '—',
                    'size' => $log->productVariant?->size?->code ?? $log->productVariant?->size?->name ?? '—',
                    'color' => $log->productVariant?->color?->name ?? '—',
                    'color_hex' => $log->productVariant?->color?->hex_code ?? '#CCCCCC',
                    'old_stock' => $log->previous_stock,
                    'quantity_change' => $log->quantity_change,
                    'new_stock' => $log->new_stock_level,
                    'type' => $log->type,
                    'reference_note' => $log->reference_note,
                    'admin_name' => $log->user?->name ?? 'Boutique Admin',
                    'date' => $log->created_at->format('M d, Y h:i A'),
                    'time_ago' => $log->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Inventory/Index', [
            'summary' => [
                'total_units' => $totalUnits,
                'total_variants' => $totalVariants,
                'in_stock_variants' => $inStockCount,
                'low_stock_variants' => $lowStockCount,
                'out_of_stock_variants' => $outOfStockCount,
                'threshold' => $lowStockThreshold,
            ],
            'variants' => $variants,
            'recentLogs' => $recentLogs,
            'categories' => $categories,
            'sizes' => $sizes,
            'colors' => $colors,
            'filters' => $request->only(['search', 'category_id', 'stock_status', 'color_id', 'size_id', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Adjust stock for a specific variant (Add or Reduce).
     */
    public function adjustStock(Request $request, ProductVariant $variant)
    {
        $validated = $request->validate([
            'action' => 'required|in:add,reduce',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:50',
            'reference_note' => 'nullable|string|max:500',
        ]);

        $quantityChange = $validated['action'] === 'add'
            ? $validated['quantity']
            : -$validated['quantity'];

        $oldStock = $variant->stock_quantity;
        $newStock = $oldStock + $quantityChange;

        if ($newStock < 0) {
            return back()->withErrors([
                'quantity' => "Stock cannot become negative. Current stock is {$oldStock} units."
            ]);
        }

        DB::beginTransaction();
        try {
            $variant->update([
                'stock_quantity' => $newStock,
            ]);

            Inventory::create([
                'product_variant_id' => $variant->id,
                'user_id' => Auth::id(),
                'old_stock_level' => $oldStock,
                'quantity_change' => $quantityChange,
                'new_stock_level' => $newStock,
                'type' => $validated['reason'],
                'reference_note' => $validated['reference_note'] ?? null,
            ]);

            DB::commit();

            return back()->with('success', "Stock for {$variant->sku} adjusted successfully ({$oldStock} → {$newStock}).");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'general' => 'Failed to adjust stock: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get stock adjustment history for a specific variant (JSON).
     */
    public function variantHistory(ProductVariant $variant)
    {
        $history = $variant->inventories()
            ->with('user')
            ->latest()
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'old_stock' => $log->previous_stock,
                    'quantity_change' => $log->quantity_change,
                    'new_stock' => $log->new_stock_level,
                    'type' => $log->type,
                    'reference_note' => $log->reference_note,
                    'admin_name' => $log->user?->name ?? 'Boutique Admin',
                    'date' => $log->created_at->format('M d, Y h:i A'),
                    'time_ago' => $log->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'variant_id' => $variant->id,
            'sku' => $variant->sku,
            'product_name' => $variant->product?->name ?? 'Gown',
            'current_stock' => $variant->stock_quantity,
            'history' => $history,
        ]);
    }
}

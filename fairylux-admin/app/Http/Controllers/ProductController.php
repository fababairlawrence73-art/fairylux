<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Color;
use App\Models\Inventory;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display paginated product list with filters and stats.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'category_id', 'status', 'is_featured', 'stock_status']);

        $products = Product::with(['category', 'variants.size', 'variants.color'])
            ->filter($filters)
            ->orderByDesc('updated_at')
            ->paginate(12)
            ->withQueryString();

        $categories = Category::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'slug']);

        // Summary statistics
        $stats = [
            'total' => Product::count(),
            'active' => Product::where('status', 'active')->count(),
            'inactive' => Product::where('status', 'inactive')->count(),
            'featured' => Product::where('is_featured', true)->count(),
            'out_of_stock' => Product::whereDoesntHave('variants', function ($q) {
                $q->where('stock_quantity', '>', 0);
            })->count(),
            'total_stock' => ProductVariant::sum('stock_quantity'),
        ];

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $filters,
            'stats' => $stats,
        ]);
    }

    /**
     * Show create product form.
     */
    public function create()
    {
        $categories = Category::where('is_active', true)->orderBy('sort_order')->get(['id', 'name']);
        $sizes = Size::orderBy('sort_order')->get(['id', 'name', 'code']);
        $colors = Color::orderBy('name')->get(['id', 'name', 'hex_code']);

        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'sizes' => $sizes,
            'colors' => $colors,
        ]);
    }

    /**
     * Store a new product with variants.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'sku' => 'required|string|max:50|unique:products,sku',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'material' => 'nullable|string|max:255',
            'occasion' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:10000',
            'short_description' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive,draft,archived',
            'is_featured' => 'boolean',
            'featured_image' => 'nullable|image|max:5120',
            'gallery_images.*' => 'nullable|image|max:5120',
            'color_images' => 'nullable|array',
            'color_images.*' => 'nullable|image|max:5120',
            'variants' => 'nullable|array',
            'variants.*.size_id' => 'required|exists:sizes,id',
            'variants.*.color_id' => 'required|exists:colors,id',
            'variants.*.sku' => 'required|string|max:80|distinct',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.is_active' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            $slug = Str::slug($validated['name']);
            // Ensure unique slug
            $originalSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }

            // Handle featured image upload
            $featuredImagePath = null;
            if ($request->hasFile('featured_image')) {
                $featuredImagePath = $request->file('featured_image')
                    ->store('products/' . $slug, 'public');
            }

            // Handle gallery images upload
            $galleryPaths = [];
            if ($request->hasFile('gallery_images')) {
                foreach ($request->file('gallery_images') as $image) {
                    $galleryPaths[] = $image->store('products/' . $slug . '/gallery', 'public');
                }
            }

            // Handle color-specific images upload
            $colorImagePaths = [];
            if ($request->hasFile('color_images')) {
                foreach ($request->file('color_images') as $colorId => $colorFile) {
                    if ($colorFile) {
                        $colorImagePaths[$colorId] = $colorFile->store('products/' . $slug . '/colors', 'public');
                    }
                }
            }

            $product = Product::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $slug,
                'sku' => $validated['sku'],
                'base_price' => $validated['base_price'],
                'sale_price' => $validated['sale_price'] ?? null,
                'material' => $validated['material'] ?? null,
                'occasion' => $validated['occasion'] ?? null,
                'description' => $validated['description'] ?? null,
                'short_description' => $validated['short_description'] ?? null,
                'status' => $validated['status'],
                'is_featured' => $validated['is_featured'] ?? false,
                'featured_image' => $featuredImagePath,
                'images' => $galleryPaths,
                'color_images' => !empty($colorImagePaths) ? $colorImagePaths : null,
            ]);

            // Create variants
            if (!empty($validated['variants'])) {
                foreach ($validated['variants'] as $variantData) {
                    // Check for unique variant SKU
                    if (ProductVariant::where('sku', $variantData['sku'])->exists()) {
                        throw new \Exception("Variant SKU '{$variantData['sku']}' already exists.");
                    }

                    $variant = ProductVariant::create([
                        'product_id' => $product->id,
                        'size_id' => $variantData['size_id'],
                        'color_id' => $variantData['color_id'],
                        'sku' => $variantData['sku'],
                        'price' => $variantData['price'] ?? null,
                        'stock_quantity' => $variantData['stock_quantity'],
                        'image_path' => $colorImagePaths[$variantData['color_id']] ?? null,
                        'is_active' => $variantData['is_active'] ?? true,
                    ]);

                    // Create initial inventory log
                    if ($variantData['stock_quantity'] > 0) {
                        Inventory::create([
                            'product_variant_id' => $variant->id,
                            'user_id' => Auth::id(),
                            'quantity_change' => $variantData['stock_quantity'],
                            'new_stock_level' => $variantData['stock_quantity'],
                            'type' => 'restock',
                            'reference_note' => 'Initial stock on product creation',
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()->route('products.index')->with('success', 'Product created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'Failed to create product: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Display product details.
     */
    public function show(Product $product)
    {
        $product->load([
            'category',
            'variants.size',
            'variants.color',
            'variants.inventories' => function ($q) {
                $q->latest()->limit(10);
            },
            'variants.inventories.user',
        ]);

        // Get recent inventory activity across all variants
        $recentInventory = Inventory::whereIn('product_variant_id', $product->variants->pluck('id'))
            ->with(['productVariant.size', 'productVariant.color', 'user'])
            ->latest()
            ->limit(20)
            ->get();

        return Inertia::render('Products/Show', [
            'product' => $product,
            'recentInventory' => $recentInventory,
        ]);
    }

    /**
     * Show edit product form.
     */
    public function edit(Product $product)
    {
        $product->load(['category', 'variants.size', 'variants.color']);

        $categories = Category::where('is_active', true)->orderBy('sort_order')->get(['id', 'name']);
        $sizes = Size::orderBy('sort_order')->get(['id', 'name', 'code']);
        $colors = Color::orderBy('name')->get(['id', 'name', 'hex_code']);

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'sizes' => $sizes,
            'colors' => $colors,
        ]);
    }

    /**
     * Update an existing product with variants.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'sku' => 'required|string|max:50|unique:products,sku,' . $product->id,
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'material' => 'nullable|string|max:255',
            'occasion' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:10000',
            'short_description' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive,draft,archived',
            'is_featured' => 'boolean',
            'featured_image' => 'nullable|image|max:5120',
            'remove_featured_image' => 'nullable|boolean',
            'gallery_images.*' => 'nullable|image|max:5120',
            'remove_gallery_images' => 'nullable|array',
            'remove_gallery_images.*' => 'string',
            'color_images' => 'nullable|array',
            'color_images.*' => 'nullable|image|max:5120',
            'remove_color_images' => 'nullable|array',
            'remove_color_images.*' => 'nullable',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|integer',
            'variants.*.size_id' => 'required|exists:sizes,id',
            'variants.*.color_id' => 'required|exists:colors,id',
            'variants.*.sku' => 'required|string|max:80',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.is_active' => 'boolean',
            'removed_variant_ids' => 'nullable|array',
            'removed_variant_ids.*' => 'integer',
        ]);

        DB::beginTransaction();
        try {
            // Handle slug update
            $slug = Str::slug($validated['name']);
            if ($product->slug !== $slug) {
                $originalSlug = $slug;
                $counter = 1;
                while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                    $slug = $originalSlug . '-' . $counter++;
                }
            } else {
                $slug = $product->slug;
            }

            // Handle featured image
            $featuredImagePath = $product->featured_image;
            if ($request->boolean('remove_featured_image') && $product->featured_image) {
                Storage::disk('public')->delete($product->featured_image);
                $featuredImagePath = null;
            }
            if ($request->hasFile('featured_image')) {
                if ($product->featured_image) {
                    Storage::disk('public')->delete($product->featured_image);
                }
                $featuredImagePath = $request->file('featured_image')
                    ->store('products/' . $slug, 'public');
            }

            // Handle gallery images
            $existingGallery = $product->images ?? [];
            // Remove specified gallery images
            if (!empty($validated['remove_gallery_images'])) {
                foreach ($validated['remove_gallery_images'] as $path) {
                    Storage::disk('public')->delete($path);
                    $existingGallery = array_filter($existingGallery, fn($p) => $p !== $path);
                }
            }
            // Add new gallery images
            if ($request->hasFile('gallery_images')) {
                foreach ($request->file('gallery_images') as $image) {
                    $existingGallery[] = $image->store('products/' . $slug . '/gallery', 'public');
                }
            }

            // Handle color-specific images
            $existingColorImages = $product->color_images ?? [];

            // Remove specified color images
            if (!empty($validated['remove_color_images'])) {
                foreach ($validated['remove_color_images'] as $colorId) {
                    if (!empty($existingColorImages[$colorId])) {
                        Storage::disk('public')->delete($existingColorImages[$colorId]);
                        unset($existingColorImages[$colorId]);
                    }
                    ProductVariant::where('product_id', $product->id)
                        ->where('color_id', $colorId)
                        ->update(['image_path' => null]);
                }
            }

            // Upload new color images
            if ($request->hasFile('color_images')) {
                foreach ($request->file('color_images') as $colorId => $colorFile) {
                    if ($colorFile) {
                        if (!empty($existingColorImages[$colorId])) {
                            Storage::disk('public')->delete($existingColorImages[$colorId]);
                        }
                        $path = $colorFile->store('products/' . $slug . '/colors', 'public');
                        $existingColorImages[$colorId] = $path;

                        ProductVariant::where('product_id', $product->id)
                            ->where('color_id', $colorId)
                            ->update(['image_path' => $path]);
                    }
                }
            }

            $product->update([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $slug,
                'sku' => $validated['sku'],
                'base_price' => $validated['base_price'],
                'sale_price' => $validated['sale_price'] ?? null,
                'material' => $validated['material'] ?? null,
                'occasion' => $validated['occasion'] ?? null,
                'description' => $validated['description'] ?? null,
                'short_description' => $validated['short_description'] ?? null,
                'status' => $validated['status'],
                'is_featured' => $validated['is_featured'] ?? false,
                'featured_image' => $featuredImagePath,
                'images' => array_values($existingGallery),
                'color_images' => !empty($existingColorImages) ? $existingColorImages : null,
            ]);

            // Remove deleted variants
            if (!empty($validated['removed_variant_ids'])) {
                ProductVariant::where('product_id', $product->id)
                    ->whereIn('id', $validated['removed_variant_ids'])
                    ->delete();
            }

            // Update/create variants
            if (!empty($validated['variants'])) {
                foreach ($validated['variants'] as $variantData) {
                    $variantColorImage = $existingColorImages[$variantData['color_id']] ?? null;

                    if (!empty($variantData['id'])) {
                        // Update existing variant
                        $variant = ProductVariant::where('id', $variantData['id'])
                            ->where('product_id', $product->id)
                            ->first();

                        if ($variant) {
                            $oldStock = $variant->stock_quantity;
                            $newStock = $variantData['stock_quantity'];

                            $variant->update([
                                'size_id' => $variantData['size_id'],
                                'color_id' => $variantData['color_id'],
                                'sku' => $variantData['sku'],
                                'price' => $variantData['price'] ?? null,
                                'stock_quantity' => $newStock,
                                'image_path' => $variantColorImage,
                                'is_active' => $variantData['is_active'] ?? true,
                            ]);

                            // Log inventory change if stock changed
                            if ($oldStock !== $newStock) {
                                Inventory::create([
                                    'product_variant_id' => $variant->id,
                                    'user_id' => Auth::id(),
                                    'quantity_change' => $newStock - $oldStock,
                                    'new_stock_level' => $newStock,
                                    'type' => 'adjustment',
                                    'reference_note' => 'Stock adjusted during product edit',
                                ]);
                            }
                        }
                    } else {
                        // Create new variant
                        if (ProductVariant::where('sku', $variantData['sku'])->exists()) {
                            throw new \Exception("Variant SKU '{$variantData['sku']}' already exists.");
                        }

                        $variant = ProductVariant::create([
                            'product_id' => $product->id,
                            'size_id' => $variantData['size_id'],
                            'color_id' => $variantData['color_id'],
                            'sku' => $variantData['sku'],
                            'price' => $variantData['price'] ?? null,
                            'stock_quantity' => $variantData['stock_quantity'],
                            'image_path' => $variantColorImage,
                            'is_active' => $variantData['is_active'] ?? true,
                        ]);

                        if ($variantData['stock_quantity'] > 0) {
                            Inventory::create([
                                'product_variant_id' => $variant->id,
                                'user_id' => Auth::id(),
                                'quantity_change' => $variantData['stock_quantity'],
                                'new_stock_level' => $variantData['stock_quantity'],
                                'type' => 'restock',
                                'reference_note' => 'Initial stock on variant creation',
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return redirect()->route('products.show', $product)->with('success', 'Product updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'Failed to update product: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Delete a product and its images.
     *
     * The order_items table uses restrictOnDelete on product_variant_id, which would block
     * the cascade-delete of product_variants when the product is deleted. To preserve order
     * history while still allowing product deletion, we explicitly null out order_items rows
     * tied to this product's variants before proceeding (order history is safe because
     * order_items already stores product_name and variant_info as immutable snapshots).
     */
    public function destroy(Product $product)
    {
        DB::beginTransaction();
        try {
            // Collect all variant IDs for this product
            $variantIds = $product->variants()->pluck('id');

            // Null out order_items.product_variant_id for this product's variants so
            // the restrictOnDelete FK does not block the cascade-delete of variants.
            // Order history is preserved via the product_name and variant_info snapshot columns.
            if ($variantIds->isNotEmpty()) {
                OrderItem::whereIn('product_variant_id', $variantIds)
                    ->update(['product_variant_id' => null]);
            }

            // Delete product images from storage
            if ($product->featured_image) {
                Storage::disk('public')->delete($product->featured_image);
            }
            if (!empty($product->images)) {
                foreach ($product->images as $imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
            if (!empty($product->color_images)) {
                foreach ($product->color_images as $imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
            // Delete the product directory if it exists
            $productDir = 'products/' . $product->slug;
            if (Storage::disk('public')->exists($productDir)) {
                Storage::disk('public')->deleteDirectory($productDir);
            }

            // Deleting the product cascades to product_variants (via DB cascade),
            // and product_variants cascade to inventories.
            $product->delete();
            DB::commit();

            return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'Failed to delete product: ' . $e->getMessage()]);
        }
    }

    /**
     * Quick stock adjustment for a variant.
     */
    public function adjustStock(Request $request, ProductVariant $variant)
    {
        $validated = $request->validate([
            'quantity_change' => 'required|integer',
            'type' => 'required|in:restock,sale,return,adjustment,rental,damaged',
            'reference_note' => 'nullable|string|max:500',
        ]);

        $newStock = $variant->stock_quantity + $validated['quantity_change'];
        if ($newStock < 0) {
            return back()->withErrors(['quantity_change' => 'Stock cannot go below zero.']);
        }

        DB::beginTransaction();
        try {
            $variant->update(['stock_quantity' => $newStock]);

            Inventory::create([
                'product_variant_id' => $variant->id,
                'user_id' => Auth::id(),
                'quantity_change' => $validated['quantity_change'],
                'new_stock_level' => $newStock,
                'type' => $validated['type'],
                'reference_note' => $validated['reference_note'] ?? null,
            ]);

            DB::commit();

            return back()->with('success', 'Stock adjusted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'Failed to adjust stock: ' . $e->getMessage()]);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display active products for customer catalog with filtering and search.
     */
    public function index(Request $request)
    {
        $query = Product::where('status', 'active')
            ->with(['category', 'variants']);

        // Filter by category: supports category name, slug, or numeric ID
        if ($category = $request->query('category')) {
            $query->whereHas('category', function ($q) use ($category) {
                if (is_numeric($category)) {
                    $q->where('id', $category);
                } else {
                    $q->where('slug', $category)
                      ->orWhere('name', $category);
                }
            });
        }

        // Search in product name, SKU, material, occasion, description, short_description
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('material', 'like', "%{$search}%")
                  ->orWhere('occasion', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Filter by featured status (?featured=1, ?featured=true, ?featured=0)
        if ($request->has('featured')) {
            $featured = filter_var($request->query('featured'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($featured !== null) {
                $query->where('is_featured', $featured);
            }
        }

        // Sorting options: 'newest' (default), 'price_asc', 'price_desc', 'name_asc'
        $sort = $request->query('sort', 'newest');
        if ($sort === 'price_asc') {
            $query->orderBy('base_price', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('base_price', 'desc');
        } elseif ($sort === 'name_asc') {
            $query->orderBy('name', 'asc');
        } else {
            $query->orderByDesc('created_at');
        }

        // Pagination: default 50 items per page
        $perPage = (int) $request->query('per_page', 50);
        $products = $query->paginate(max(1, min($perPage, 100)))->withQueryString();

        return ProductResource::collection($products);
    }

    /**
     * Display customer-facing product details.
     * Supports lookup by numeric product ID or slug.
     */
    public function show(string $id)
    {
        $product = Product::where('status', 'active')
            ->where(function ($q) use ($id) {
                if (is_numeric($id)) {
                    $q->where('id', (int) $id)->orWhere('slug', $id);
                } else {
                    $q->where('slug', $id);
                }
            })
            ->with([
                'category',
                'variants' => function ($q) {
                    $q->where('is_active', true)->with(['color', 'size']);
                },
            ])
            ->first();

        if (!$product) {
            return response()->json([
                'message' => 'Product not found or currently unavailable.',
            ], 404);
        }

        return new ProductDetailResource($product);
    }
}

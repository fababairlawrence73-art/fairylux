<?php

/**
 * FairyLux – Sync Local Images to Database
 *
 * Scans the prepared folder structure and updates the database so that:
 *   - products/{slug}/main.{jpg|jpeg|png|webp}     → products.featured_image
 *   - products/{slug}/gallery/*.{jpg|...}           → products.images (array)
 *   - products/{slug}/{color-slug}/color.{jpg|...}  → products.color_images[color_id]
 *                                                      + product_variants.image_path (all sizes of that color)
 *
 * Run whenever you add or update images:
 *   php sync_product_images.php
 *
 * OPTIONS:
 *   --dry-run    Preview changes without writing to DB
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Color;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

$dryRun   = in_array('--dry-run', $argv ?? []);
$disk     = Storage::disk('public');
$imgExts  = ['jpg', 'jpeg', 'png', 'webp'];
$changes  = 0;

echo "=== FairyLux Image Sync" . ($dryRun ? ' [DRY RUN]' : '') . " ===\n\n";

// Build color slug → id map
$colorMap = Color::all()->mapWithKeys(fn($c) => [Str::slug($c->name) => $c->id])->toArray();

$products = Product::with(['variants.color'])->orderBy('id')->get();

foreach ($products as $product) {
    $slug   = $product->slug;
    $root   = "products/{$slug}";
    $hasAny = false;

    // ── 1. Main image ──────────────────────────────────────────────────────────
    $mainPath = null;
    foreach ($imgExts as $ext) {
        $candidate = "{$root}/main.{$ext}";
        if ($disk->exists($candidate)) {
            $mainPath = $candidate;
            break;
        }
    }

    if ($mainPath && $product->featured_image !== $mainPath) {
        echo "[{$slug}] main image → {$mainPath}\n";
        if (!$dryRun) {
            $product->featured_image = $mainPath;
            $hasAny = true;
        }
        $changes++;
    }

    // ── 2. Gallery images ──────────────────────────────────────────────────────
    $galleryFolder = "{$root}/gallery";
    $galleryPaths  = [];
    if ($disk->exists($galleryFolder)) {
        foreach ($disk->files($galleryFolder) as $file) {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($ext, $imgExts)) {
                $galleryPaths[] = $file;
            }
        }
    }

    if (!empty($galleryPaths)) {
        $existing = $product->images ?? [];
        sort($galleryPaths);
        sort($existing);
        if ($galleryPaths !== $existing) {
            echo "[{$slug}] gallery → " . implode(', ', $galleryPaths) . "\n";
            if (!$dryRun) {
                $product->images = $galleryPaths;
                $hasAny = true;
            }
            $changes++;
        }
    }

    // ── 3. Color-specific images ───────────────────────────────────────────────
    $existingColorImages = $product->color_images ?? [];
    $newColorImages      = $existingColorImages;
    $colorChanged        = false;

    foreach ($colorMap as $colorSlug => $colorId) {
        $colorFolder = "{$root}/{$colorSlug}";
        if (!$disk->exists($colorFolder)) {
            continue;
        }

        $colorPath = null;
        foreach ($imgExts as $ext) {
            $candidate = "{$colorFolder}/color.{$ext}";
            if ($disk->exists($candidate)) {
                $colorPath = $candidate;
                break;
            }
        }

        if ($colorPath) {
            if (($existingColorImages[$colorId] ?? null) !== $colorPath) {
                echo "[{$slug}] color image [{$colorSlug}] → {$colorPath}\n";
                $newColorImages[$colorId] = $colorPath;
                $colorChanged = true;
                $changes++;

                // Update all variants of this color under this product
                if (!$dryRun) {
                    ProductVariant::where('product_id', $product->id)
                        ->where('color_id', $colorId)
                        ->update(['image_path' => $colorPath]);
                }
            }
        }
    }

    if ($colorChanged && !$dryRun) {
        $product->color_images = $newColorImages;
        $hasAny = true;
    }

    if ($hasAny) {
        $product->save();
    }
}

echo "\n" . ($dryRun ? 'Would apply' : 'Applied') . " {$changes} change(s).\n";
echo "Done.\n";

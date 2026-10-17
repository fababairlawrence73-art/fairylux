<?php

namespace Database\Seeders;

use App\Models\Color;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        $source = database_path('seeders/assets/products');
        $disk = Storage::disk('public');
        $colors = Color::all();

        foreach (Product::where('sku', 'like', 'FL-%')->get() as $product) {
            $folder = $source.'/'.$product->slug;
            if (! File::isDirectory($folder)) {
                continue;
            }

            // Copy bundled demo photos without overwriting anybody's local uploads.
            foreach (File::allFiles($folder) as $file) {
                $relative = str_replace('\\', '/', $file->getRelativePathname());
                $path = 'products/'.$product->slug.'/'.$relative;
                if (! $disk->exists($path)) {
                    $disk->put($path, File::get($file->getPathname()));
                }
            }

            $root = 'products/'.$product->slug;
            if (! $product->featured_image) {
                $product->featured_image = $this->findImage($root, 'main');
            }
            if (empty($product->images)) {
                $product->images = collect($disk->files($root.'/gallery'))
                    ->filter(fn ($path) => $this->isImage($path))->sort()->values()->all();
            }

            $colorImages = $product->color_images ?? [];
            foreach ($colors as $color) {
                $path = $this->findImage($root.'/'.Str::slug($color->name), 'color');
                if ($path && empty($colorImages[$color->id])) {
                    $colorImages[$color->id] = $path;
                    $product->variants()->where('color_id', $color->id)->whereNull('image_path')
                        ->update(['image_path' => $path]);
                }
            }
            $product->color_images = $colorImages;
            $product->save();
        }
    }

    private function findImage(string $directory, string $name): ?string
    {
        foreach (['jpg', 'jpeg', 'png', 'webp'] as $extension) {
            $path = $directory.'/'.$name.'.'.$extension;
            if (Storage::disk('public')->exists($path)) {
                return $path;
            }
        }

        return null;
    }

    private function isImage(string $path): bool
    {
        return in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'webp'], true);
    }
}

<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class ImageUrl
{
    /**
     * Convert relative storage path or external URL to a client-ready absolute URL.
     */
    public static function format(?string $path): ?string
    {
        if (!$path || !is_string($path)) {
            return null;
        }

        $trimmed = trim($path);

        // If already an absolute HTTP/HTTPS URL or data URI, keep as is
        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://') || str_starts_with($trimmed, 'data:')) {
            return $trimmed;
        }

        $cleanPath = ltrim($trimmed, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        // Check if request has Host header so device / emulator receives matching host
        if (request() && request()->hasHeader('Host')) {
            return url('storage/' . $cleanPath);
        }

        return Storage::disk('public')->url($cleanPath);
    }

    /**
     * Format an array of image paths to URLs.
     */
    public static function formatArray(?array $paths): array
    {
        if (empty($paths) || !is_array($paths)) {
            return [];
        }

        $urls = [];
        foreach ($paths as $path) {
            if ($formatted = self::format($path)) {
                $urls[] = $formatted;
            }
        }

        return array_values($urls);
    }
}

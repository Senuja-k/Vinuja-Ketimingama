<?php

namespace App\Traits;

trait NormalizesStorageUrl
{
    /**
     * Normalize an image storage path or URL so it always resolves correctly.
     *
     * - strips repeated /storage prefixes
     * - preserves full URLs
     * - converts 127.0.0.1 to localhost for CSP consistency
     */
    protected function normalizeStorageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $path = trim($path);

        // Full URLs can be returned as a normalized storage URL when they contain a storage path,
        // otherwise preserve the host but normalize 127.0.0.1 to localhost.
        if (preg_match('/^https?:\/\//i', $path)) {
            $normalizedPath = parse_url($path, PHP_URL_PATH);
            if ($normalizedPath) {
                $normalizedPath = preg_replace('#^/*(public/)?(storage/)+#i', '', $normalizedPath);
                if ($normalizedPath !== '') {
                    return asset('storage/' . ltrim($normalizedPath, '/'));
                }
            }

            return str_replace('127.0.0.1', 'localhost', $path);
        }

        // Remove any leading public/storage/ or repeated storage/ prefixes for legacy relative paths.
        $path = preg_replace('#^/*(public/)?(storage/)+#i', '', $path);

        return asset('storage/' . ltrim($path, '/'));
    }
}

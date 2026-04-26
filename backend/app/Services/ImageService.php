<?php

namespace App\Services;

use App\Traits\NormalizesStorageUrl;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageService
{
    use NormalizesStorageUrl;
    /**
     * Store an uploaded image with the naming format: type-YYYY-MM-DD-HH-MM-SS.ext
     * Examples:
     *   - Product image: pro-2026-04-12-07-13-44.jpg
     *   - NIC image:     nic-2026-04-12-07-13-44.jpg
     *   - Slip image:    slip-2026-04-12-07-13-44.jpg
     *
     * @param UploadedFile $file   The uploaded file
     * @param string       $type   Short prefix: 'pro', 'nic', 'slip', etc.
     * @param string       $disk   Storage disk (default: 'public')
     * @return string              Relative path stored (used to build URL via asset('storage/...'))
     */
    public function store(UploadedFile $file, string $type, string $disk = 'public'): string
    {
        // Strict Validation
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        
        $mimeType = $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension());
        $size = $file->getSize(); // in bytes

        if (!in_array($mimeType, $allowedMimeTypes)) {
            throw new \InvalidArgumentException("Invalid MIME type: {$mimeType}. Allowed: " . implode(', ', $allowedMimeTypes));
        }

        if (!in_array($extension, $allowedExtensions)) {
            throw new \InvalidArgumentException("Invalid extension: .{$extension}. Allowed: ." . implode(', .', $allowedExtensions));
        }

        // 5MB Limit
        if ($size > 5 * 1024 * 1024) {
            throw new \InvalidArgumentException("File size exceeds 5MB limit.");
        }

        $timestamp  = now()->format('Y-m-d-H-i-s-v');
        $filename   = "{$type}-{$timestamp}.{$extension}";
        $directory  = 'images';

        // Store at storage/app/public/images/<filename>
        $file->storeAs($directory, $filename, $disk);

        return "{$directory}/{$filename}";
    }

    /**
     * Delete a stored image.
     */
    public function delete(string $path, string $disk = 'public'): void
    {
        if ($path && Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }

    /**
     * Return the public accessible URL for a stored image path.
     */
    public function url(string $path): string
    {
        return $this->normalizeStorageUrl($path);
    }
}

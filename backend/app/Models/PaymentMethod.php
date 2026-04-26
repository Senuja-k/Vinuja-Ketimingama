<?php

namespace App\Models;

use App\Traits\NormalizesStorageUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;
    use NormalizesStorageUrl;

    protected $fillable = [
        'name',
        'icon',
        'is_active',
        'is_disabled',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_disabled' => 'boolean',
    ];

    protected $appends = ['icon_url'];

    /**
     * Returns the full public URL for image-based icons, or null for emoji icons.
     */
    public function getIconUrlAttribute(): ?string
    {
        if (!$this->icon) return null;
        // If the icon contains a dot it is a file path (e.g. images/payment_methods-....jpg)
        if (str_contains($this->icon, '.')) {
            return $this->normalizeStorageUrl($this->icon);
        }
        // Otherwise it's an emoji – return null so the frontend falls back to the raw icon field
        return null;
    }
}

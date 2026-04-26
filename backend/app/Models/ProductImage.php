<?php

namespace App\Models;

use App\Traits\NormalizesStorageUrl;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use NormalizesStorageUrl;

    protected $fillable = ['product_id', 'image_path', 'sort_order', 'color', 'size'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Return the public URL for this image.
     */
    public function getUrlAttribute(): string
    {
        return $this->normalizeStorageUrl($this->image_path);
    }

    protected $appends = ['url'];
}

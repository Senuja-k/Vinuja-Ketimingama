<?php

namespace App\Models;

use App\Traits\NormalizesStorageUrl;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use NormalizesStorageUrl;

    protected $fillable = [
        'image_path',
        'order',
        'is_active'
    ];

    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        return $this->normalizeStorageUrl($this->image_path);
    }
}

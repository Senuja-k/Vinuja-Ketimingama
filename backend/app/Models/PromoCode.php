<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    protected $fillable = ['code', 'type', 'marketeer_id', 'seller_id', 'discount_percent'];

    protected $casts = [
        'type'             => 'integer',
        'discount_percent' => 'integer',
    ];

    public function marketeer()
    {
        return $this->belongsTo(Marketeer::class);
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }
}

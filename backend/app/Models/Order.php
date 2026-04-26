<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id', 'product_id', 'seller_id', 'quantity',
        'delivery_address', 'contact_no', 'delivery_fee',
        'payment_method', 'promo_code_id', 'status', 'total_amount',
        'commission_distributed', 'size', 'color',
        'admin_commission_amount', 'seller_marketeer_amount', 'product_marketeer_amount',
        'seller_marketeer_id', 'seller_marketeer_type', 'product_marketeer_id',
        'admin_commission_percent', 'payment_slip'
    ];

    protected $casts = [
        'quantity'       => 'integer',
        'delivery_fee'   => 'integer',
        'payment_method' => 'integer',
        'status'         => 'integer',
        'total_amount'   => 'integer',
        'admin_commission_amount' => 'float',
        'seller_marketeer_amount' => 'float',
        'product_marketeer_amount' => 'float',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function productMarketeer()
    {
        return $this->belongsTo(Marketeer::class, 'product_marketeer_id');
    }

    public function sellerMarketeer()
    {
        return $this->morphTo();
    }
}

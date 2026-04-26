<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'seller_id', 'name', 'description', 'marked_price', 'final_price',
        'discount_rate', 'commission', 'quantity', 'size', 'color',
        'approval_status', 'reject_reason', 'rating_avg', 'rating_count',
        'delivery_fee', 'delivery_timeline', 'return_policy_days',
    ];

    protected $casts = [
        'marked_price'    => 'integer',
        'final_price'     => 'integer',
        'discount_rate'   => 'integer',
        'commission'      => 'integer',
        'quantity'        => 'integer',
        'approval_status' => 'integer',
        'rating_avg'      => 'decimal:2',
        'rating_count'    => 'integer',
        'delivery_fee'    => 'integer',
        'return_policy_days' => 'integer',
    ];

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    /**
     * Many-to-many: a product can belong to many categories.
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'product_categories');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }
}

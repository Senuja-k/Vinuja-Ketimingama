<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionRequest extends Model
{
    protected $fillable = ['seller_id', 'requested_amount', 'status', 'slip_image'];

    protected $casts = [
        'requested_amount' => 'integer',
        'status'           => 'integer',
    ];

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }
}

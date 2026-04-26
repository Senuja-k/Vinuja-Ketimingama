<?php

namespace App\Models;

use App\Traits\NormalizesStorageUrl;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Seller extends Authenticatable
{
    use HasApiTokens;
    use NormalizesStorageUrl;

    protected $fillable = [
        'first_name', 'last_name', 'username', 'password', 'email', 'contact',
        'nic', 'address', 'store_name', 'profile_picture', 'ref_no', 'status',
        'bank_name', 'branch', 'account_no', 'account_holder_name',
        'wallet_balance', 'claimed_amount', 'nic_image', 'nic_back', 'promo_code',
        'referred_by_marketeer_id', 'referred_by_seller_id', 'total_commission', 'paid_commission', 'payment_slip'
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'password' => 'hashed',
        'status' => 'integer',
        'wallet_balance' => 'float',
        'claimed_amount' => 'float',
        'total_commission' => 'float',
        'paid_commission' => 'float',
    ];

    use NormalizesStorageUrl;

    public function getProfilePictureUrlAttribute(): ?string
    {
        return $this->normalizeStorageUrl($this->profile_picture);
    }

    protected $appends = ['profile_picture_url'];

    protected static function booted()
    {
        static::creating(function ($seller) {
            if (empty($seller->promo_code)) {
                // Find max TXSB number from both Sellers and Marketeers
                $lastSeller = static::where('promo_code', 'like', 'TXSB%')
                    ->latest('promo_code')
                    ->first();
                
                $lastMarketeer = Marketeer::where('type', 1)
                    ->where('promo_code', 'like', 'TXSB%')
                    ->latest('promo_code')
                    ->first();

                $lastNumS = $lastSeller ? (int) substr($lastSeller->promo_code, 4) : 0;
                $lastNumM = $lastMarketeer ? (int) substr($lastMarketeer->promo_code, 4) : 0;
                
                $num = max($lastNumS, $lastNumM) + 1;
                $seller->promo_code = 'TXSB' . str_pad($num, 3, '0', STR_PAD_LEFT);
                \Illuminate\Support\Facades\Log::info("Auto-generated PromoCode for Seller: " . $seller->promo_code);
            }
        });

        static::created(function ($seller) {
            // Create a PromoCode record for this seller
            PromoCode::create([
                'code' => $seller->promo_code,
                'type' => 1, // 1: Seller Based (TXSB)
                'seller_id' => $seller->id,
                'discount_percent' => 0
            ]);
        });

        static::updated(function ($seller) {
            if ($seller->isDirty('promo_code')) {
                PromoCode::where('seller_id', $seller->id)->update(['code' => $seller->promo_code]);
            }
        });

        static::deleted(function ($seller) {
            PromoCode::where('seller_id', $seller->id)->delete();
        });
    }

    public function referredByMarketeer()
    {
        return $this->belongsTo(Marketeer::class, 'referred_by_marketeer_id');
    }

    public function referredBySeller()
    {
        return $this->belongsTo(Seller::class, 'referred_by_seller_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function transactionRequests()
    {
        return $this->hasMany(TransactionRequest::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}

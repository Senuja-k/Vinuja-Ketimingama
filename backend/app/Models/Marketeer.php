<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Marketeer extends Model
{
    protected $fillable = [
        'first_name', 'last_name', 'email', 'contact', 'nic', 'address', 'type', 'wallet_balance', 'total_commission', 'promo_code', 'paid_commission', 'payment_slip'
    ];

    protected $casts = [
        'wallet_balance' => 'float',
        'total_commission' => 'float',
        'paid_commission' => 'float',
        'type' => 'integer',
    ];

    protected static function booted()
    {
        static::creating(function ($marketeer) {
            if (!$marketeer->promo_code) {
                $prefix = $marketeer->type == 1 ? 'TXSB' : 'TXPB';
                
                if ($prefix === 'TXSB') {
                    // Sync with Sellers for TXSB
                    $lastM = static::where('type', 1)
                        ->where('promo_code', 'like', 'TXSB%')
                        ->latest('promo_code')
                        ->first();
                    $lastS = Seller::where('promo_code', 'like', 'TXSB%')
                        ->latest('promo_code')
                        ->first();
                    
                    $lastNumM = $lastM ? (int) substr($lastM->promo_code, 4) : 0;
                    $lastNumS = $lastS ? (int) substr($lastS->promo_code, 4) : 0;
                    $num = max($lastNumM, $lastNumS) + 1;
                } else {
                    // TXPB only in Marketeers
                    $last = static::where('type', 0)
                        ->where('promo_code', 'like', 'TXPB%')
                        ->latest('promo_code')
                        ->first();
                    $num = $last ? (int) substr($last->promo_code, 4) + 1 : 1;
                }
                
                $marketeer->promo_code = $prefix . str_pad($num, 3, '0', STR_PAD_LEFT);

                // Create a PromoCode record for compatibility
                PromoCode::create([
                    'code' => $marketeer->promo_code,
                    'type' => $marketeer->type, // 0: PB, 1: SB
                    'marketeer_id' => null,
                    'discount_percent' => 0
                ]);
            }
        });

        static::created(function ($marketeer) {
            // Update the back-reference if needed
            PromoCode::where('code', $marketeer->promo_code)->update(['marketeer_id' => $marketeer->id]);
        });
    }

    public function promoCodes()
    {
        return $this->hasMany(PromoCode::class);
    }
}

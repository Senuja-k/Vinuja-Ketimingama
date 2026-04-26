<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'first_name', 'last_name', 'username', 'password', 'email',
        'contact', 'nic', 'address', 'postal_code', 'province',
    ];

    protected $hidden = ['password'];

    protected $casts = ['password' => 'hashed'];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }
}

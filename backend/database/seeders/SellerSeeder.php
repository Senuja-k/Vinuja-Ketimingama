<?php

namespace Database\Seeders;

use App\Models\Seller;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SellerSeeder extends Seeder
{
    public function run(): void
    {
        Seller::firstOrCreate(
            ['username' => 'Sithum'],
            [
                'first_name' => 'Sithum',
                'last_name' => 'Seller',
                'password' => Hash::make('789'),
                'email' => 'sithum@example.com',
                'contact' => '0712345678',
                'nic' => '987654321V',
                'address' => '123 Seller St, Colombo',
                'store_name' => 'Sithum Store',
                'status' => 1,
                'wallet_balance' => 0,
                'claimed_amount' => 0,
            ]
        );
    }
}

<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'first_name' => 'Hirushan',
                'last_name' => 'Admin',
                'username' => 'Hirushan',
                'password' => '123',
            ],
            [
                'first_name' => 'Yoshika',
                'last_name' => 'Admin',
                'username' => 'Yoshika',
                'password' => '456', // the frontend allowed either yoshika or yokisha with 456
            ],
            [
                'first_name' => 'Yokisha',
                'last_name' => 'Admin',
                'username' => 'Yokisha',
                'password' => '456',
            ],
        ];

        foreach ($admins as $admin) {
            Admin::firstOrCreate(
                ['username' => $admin['username']],
                [
                    'first_name' => $admin['first_name'],
                    'last_name' => $admin['last_name'],
                    'password' => Hash::make($admin['password']),
                ]
            );
        }
    }
}

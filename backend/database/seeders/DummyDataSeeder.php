<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class DummyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        $seller = DB::table('sellers')->first();
        if (!$seller) {
            echo "No seller found to attach data to.\n";
            return;
        }
        $sellerId = $seller->id;

        $customer = DB::table('customers')->first();
        $customerId = $customer ? $customer->id : null;

        if (!$customerId) {
            $customerId = DB::table('customers')->insertGetId([
                'first_name' => 'John',
                'last_name' => 'Doe',
                'username' => 'johndoe123',
                'email' => 'customer'.time().'@test.com',
                'contact' => '077'.rand(1000000,9999999),
                'address' => 'Test Address',
                'password' => Hash::make('password'),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        
        $products = [
            [
                'seller_id' => $sellerId,
                'name' => 'Premium Cotton Sarong',
                'description' => 'Unisex premium cotton sarong with traditional designs.',
                'marked_price' => 2000,
                'final_price' => 2000,
                'discount_rate' => 0,
                'commission' => 0,
                'quantity' => 50,
                'size' => 'Free Size',
                'color' => 'Blue & Black',
                'approval_status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'seller_id' => $sellerId,
                'name' => 'Stylish Lungi',
                'description' => 'Modern stylish lungi with comfortable fabric.',
                'marked_price' => 1500,
                'final_price' => 1350,
                'discount_rate' => 10,
                'commission' => 0,
                'quantity' => 20,
                'size' => 'L',
                'color' => 'Red & White',
                'approval_status' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'seller_id' => $sellerId,
                'name' => 'Casual Printed Sarong',
                'description' => 'Casual printed sarong, best for home use.',
                'marked_price' => 1200,
                'final_price' => 1200,
                'discount_rate' => 0,
                'commission' => 0,
                'quantity' => 100,
                'size' => 'Free Size',
                'color' => 'Green & Yellow',
                'approval_status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ];

        DB::table('products')->insertOrIgnore($products);
        
        $product1 = DB::table('products')->where('name', 'Premium Cotton Sarong')->first();
        $product2 = DB::table('products')->where('name', 'Stylish Lungi')->first();
        $product3 = DB::table('products')->where('name', 'Casual Printed Sarong')->first();

        $category1 = DB::table('categories')->where('id', 1)->first() ?: DB::table('categories')->first();
        $category2 = DB::table('categories')->where('id', 2)->first();

        $productCategories = [];
        if ($category1 && $product1 && $product3) {
            $productCategories[] = ['product_id' => $product1->id, 'category_id' => $category1->id];
            $productCategories[] = ['product_id' => $product3->id, 'category_id' => $category1->id];
        }
        if ($category2 && $product2 && $product3) {
            $productCategories[] = ['product_id' => $product2->id, 'category_id' => $category2->id];
            $productCategories[] = ['product_id' => $product3->id, 'category_id' => $category2->id];
        }

        if (!empty($productCategories)) {
            DB::table('product_categories')->insertOrIgnore($productCategories);
        }

        $orders = [
            [
                'customer_id' => $customerId,
                'product_id' => $product1->id ?? 1,
                'seller_id' => $sellerId,
                'quantity' => 2,
                'delivery_address' => 'No.4, 3rd lane, thelewala rd, ratmalana',
                'contact_no' => '0775768164',
                'delivery_fee' => 250,
                'payment_method' => 1,
                'status' => 0,
                'total_amount' => 4250,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'customer_id' => $customerId,
                'product_id' => $product3->id ?? 1,
                'seller_id' => $sellerId,
                'quantity' => 1,
                'delivery_address' => 'No.4, 3rd lane, ratmalana',
                'contact_no' => '0775768164',
                'delivery_fee' => 250,
                'payment_method' => 0,
                'status' => 1,
                'total_amount' => 1450,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ];

        DB::table('orders')->insertOrIgnore($orders);

        $feedbacks = [
            [
                'customer_id' => $customerId,
                'message' => 'Great product quality and fast delivery. Very satisfied!',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'customer_id' => $customerId,
                'message' => 'The sarong color was slightly different than the picture, but still good.',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ];

        DB::table('feedbacks')->insertOrIgnore($feedbacks);

        $transactions = [
            [
                'seller_id' => $sellerId,
                'requested_amount' => 15000,
                'status' => 0,
                'created_at' => clone $now->subDays(2),
                'updated_at' => clone $now->subDays(2),
            ],
            [
                'seller_id' => $sellerId,
                'requested_amount' => 20000,
                'status' => 1,
                'created_at' => clone $now->subDays(10),
                'updated_at' => clone $now->subDays(10),
            ]
        ];

        DB::table('transaction_requests')->insertOrIgnore($transactions);
    }
}

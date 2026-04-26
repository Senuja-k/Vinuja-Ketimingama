<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('sellers')->onDelete('cascade');
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->string('delivery_address', 300);
            $table->string('contact_no', 15);
            $table->unsignedSmallInteger('delivery_fee')->default(250);
            // payment_method: 0=COD, 1=card, 2=koko
            $table->tinyInteger('payment_method')->default(0);
            $table->foreignId('promo_code_id')->nullable()->constrained('promo_codes')->nullOnDelete();
            // status: 0=pending, 1=accepted, 2=sent_to_seller, 3=completed
            $table->tinyInteger('status')->default(0);
            $table->unsignedInteger('total_amount')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('icon', 10)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert Default Defaults needed for backwards compatibility of historical orders 
        // 0=Cash, 1=Card, 2=Koko Pay (the original hardcoded logic uses ID matches implicitly 0,1,2, but DB starts at 1, so let's adjust logic if needed, but wait: Eloquent auto-increment starts at 1. We must force assign IDs to perfectly match the hardcoded values currently in production DB).
        DB::table('payment_methods')->insert([
            ['id' => 1, 'name' => 'Cash On Delivery', 'icon' => '🚚', 'is_active' => true],
            ['id' => 2, 'name' => 'Credit / Debit Card', 'icon' => '💳', 'is_active' => true],
            ['id' => 3, 'name' => 'Koko Pay', 'icon' => '🟣', 'is_active' => true],
        ]);

        // Fix existing orders that used 0, 1, 2
        // COD was 0 -> now 1
        // Card was 1 -> now 2
        // Koko was 2 -> now 3
        DB::table('orders')->where('payment_method', 2)->update(['payment_method' => 3]);
        DB::table('orders')->where('payment_method', 1)->update(['payment_method' => 2]);
        DB::table('orders')->where('payment_method', 0)->update(['payment_method' => 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};

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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('size', 20)->nullable()->after('total_amount');
            $table->string('color', 50)->nullable()->after('size');
            $table->unsignedBigInteger('seller_marketeer_id')->nullable()->after('color');
            $table->string('seller_marketeer_type')->nullable()->after('seller_marketeer_id');
            $table->foreignId('product_marketeer_id')->nullable()->after('seller_marketeer_type')->constrained('marketeers')->nullOnDelete();
            $table->unsignedTinyInteger('admin_commission_percent')->default(0)->after('product_marketeer_id');
            $table->decimal('admin_commission_amount', 10, 2)->default(0)->after('admin_commission_percent');
            $table->decimal('seller_marketeer_amount', 10, 2)->default(0)->after('admin_commission_amount');
            $table->decimal('product_marketeer_amount', 10, 2)->default(0)->after('seller_marketeer_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'size', 'color', 'seller_marketeer_id', 'seller_marketeer_type', 
                'product_marketeer_id', 'admin_commission_percent', 'admin_commission_amount', 
                'seller_marketeer_amount', 'product_marketeer_amount'
            ]);
        });
    }
};

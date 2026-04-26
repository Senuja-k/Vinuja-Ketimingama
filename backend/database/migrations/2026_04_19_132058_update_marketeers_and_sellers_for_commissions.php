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
        Schema::table('marketeers', function (Blueprint $table) {
            $table->tinyInteger('type')->default(0)->comment('0: Product Based, 1: Seller Based');
            $table->decimal('wallet_balance', 15, 2)->default(0);
            $table->decimal('total_commission', 15, 2)->default(0);
            $table->string('promo_code')->nullable()->unique();
        });

        Schema::table('sellers', function (Blueprint $table) {
            $table->string('promo_code')->nullable()->unique();
            $table->unsignedBigInteger('referred_by_marketeer_id')->nullable();
            $table->unsignedBigInteger('referred_by_seller_id')->nullable();

            $table->foreign('referred_by_marketeer_id')->references('id')->on('marketeers')->onDelete('set null');
            $table->foreign('referred_by_seller_id')->references('id')->on('sellers')->onDelete('set null');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('commission_distributed')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('commission_distributed');
        });

        Schema::table('sellers', function (Blueprint $table) {
            $table->dropForeign(['referred_by_marketeer_id']);
            $table->dropForeign(['referred_by_seller_id']);
            $table->dropColumn(['promo_code', 'referred_by_marketeer_id', 'referred_by_seller_id']);
        });

        Schema::table('marketeers', function (Blueprint $table) {
            $table->dropColumn(['type', 'wallet_balance', 'total_commission', 'promo_code']);
        });
    }
};

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
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('delivery_fee')->default(250)->after('quantity');
            $table->string('delivery_timeline', 50)->nullable()->after('delivery_fee');
            $table->unsignedTinyInteger('return_policy_days')->default(14)->after('delivery_timeline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['delivery_fee', 'delivery_timeline', 'return_policy_days']);
        });
    }
};

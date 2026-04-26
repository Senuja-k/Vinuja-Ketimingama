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
        Schema::table('admins', function (Blueprint $table) {
            if (!Schema::hasColumn('admins', 'paid_commission')) {
                $table->decimal('paid_commission', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('admins', 'payment_slip')) {
                $table->string('payment_slip')->nullable();
            }
        });

        Schema::table('sellers', function (Blueprint $table) {
            if (!Schema::hasColumn('sellers', 'paid_commission')) {
                $table->decimal('paid_commission', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('sellers', 'payment_slip')) {
                $table->string('payment_slip')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['paid_commission', 'payment_slip']);
        });

        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn(['paid_commission', 'payment_slip']);
        });
    }
};

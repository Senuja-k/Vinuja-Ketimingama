<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sellers', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('username', 50)->unique();
            $table->string('password');
            $table->string('email', 100)->unique();
            $table->string('contact', 15);
            $table->string('nic', 12)->unique();
            $table->string('address', 200);
            $table->string('store_name', 100);
            $table->string('ref_no', 10)->unique()->nullable();
            // status: 0=inactive, 1=active
            $table->tinyInteger('status')->default(1);
            $table->string('bank_name', 100)->nullable();
            $table->string('branch', 100)->nullable();
            $table->string('account_no', 30)->nullable();
            $table->string('account_holder_name', 100)->nullable();
            $table->unsignedInteger('wallet_balance')->default(0);
            $table->unsignedInteger('claimed_amount')->default(0);
            $table->string('nic_image', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sellers');
    }
};

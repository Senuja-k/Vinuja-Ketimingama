<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('sellers')->onDelete('cascade');
            $table->string('name', 150);
            $table->text('description');
            $table->unsignedInteger('marked_price');
            $table->unsignedInteger('final_price')->default(0);
            // discount_rate stored as tinyint (0-100%)
            $table->tinyInteger('discount_rate')->default(0);
            // commission set by admin (0-100%)
            $table->tinyInteger('commission')->default(0);
            $table->unsignedSmallInteger('quantity')->default(0);
            $table->string('size', 20)->nullable();
            $table->string('color', 50)->nullable();
            // approval_status: 0=pending, 1=approved, 2=rejected
            $table->tinyInteger('approval_status')->default(0);
            $table->text('reject_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

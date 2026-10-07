<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Make order_items.product_variant_id nullable with nullOnDelete
     * so that deleting a product (and its variants via cascade) does not
     * violate the foreign key constraint on order_items.
     * Order history is preserved via the product_name and variant_info snapshot columns.
     */
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Drop the existing restrictOnDelete foreign key constraint first
            $table->dropForeign(['product_variant_id']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            // Change the column to nullable and re-add the FK with nullOnDelete
            $table->unsignedBigInteger('product_variant_id')->nullable()->change();
            $table->foreign('product_variant_id')
                ->references('id')
                ->on('product_variants')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_variant_id']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->unsignedBigInteger('product_variant_id')->nullable(false)->change();
            $table->foreign('product_variant_id')
                ->references('id')
                ->on('product_variants')
                ->restrictOnDelete();
        });
    }
};

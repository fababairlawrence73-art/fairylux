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
            if (!Schema::hasColumn('products', 'material')) {
                $table->string('material')->nullable()->after('sale_price');
            }
            if (!Schema::hasColumn('products', 'occasion')) {
                $table->string('occasion')->nullable()->after('material');
            }
        });

        // Ensure status column can hold 'inactive' as well
        // We alter status to string if needed or keep default 'active'
        Schema::table('products', function (Blueprint $table) {
            $table->string('status', 30)->default('active')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'material')) {
                $table->dropColumn('material');
            }
            if (Schema::hasColumn('products', 'occasion')) {
                $table->dropColumn('occasion');
            }
            $table->enum('status', ['draft', 'active', 'archived'])->default('active')->change();
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banner_activation_locks', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id')->primary();
        });

        // A permanent row can be locked even when there are no banners yet.
        DB::table('banner_activation_locks')->insert(['id' => 1]);

        Schema::create('banners', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('banner_image');
            $table->decimal('actual_price', 12, 2);
            $table->decimal('offer_price', 12, 2);
            $table->date('from_date');
            $table->date('to_date');
            $table->boolean('is_active')->default(false);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->index(['is_active', 'from_date', 'to_date']);

            // Inactive rows evaluate to NULL, so only active rows compete for 1.
            // MySQL and SQLite both allow multiple NULL values in a unique index.
            $table->unsignedTinyInteger('active_slot')->nullable()
                ->storedAs('CASE WHEN is_active <> 0 THEN 1 ELSE NULL END');
            $table->unique('active_slot', 'banners_one_active_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
        Schema::dropIfExists('banner_activation_locks');
    }
};

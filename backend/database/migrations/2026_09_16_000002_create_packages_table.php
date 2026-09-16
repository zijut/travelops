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
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->nullable()->unique();
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->string('name');
            $table->integer('duration'); // in days
            $table->decimal('price', 15, 2);
            $table->string('airline');
            $table->string('hotel');
            $table->string('hotel_makkah')->nullable();
            $table->string('hotel_madinah')->nullable();
            $table->integer('quota')->default(0);
            $table->integer('booked')->default(0);
            $table->enum('status', ['Draft', 'Published', 'Sold Out'])->default('Draft');
            $table->date('departure_date')->nullable();
            $table->date('return_date')->nullable();
            $table->text('description')->nullable();
            $table->json('included')->nullable();
            $table->json('excluded')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};

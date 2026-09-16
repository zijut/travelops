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
        Schema::create('departures', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique(); // e.g. DEP1001
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained('packages')->cascadeOnDelete();
            $table->string('kloter')->default('Kloter A');
            $table->string('flight_number')->default('SV-816');
            $table->string('airline')->default('Saudia Airlines');
            $table->dateTime('departure_date')->nullable();
            $table->string('departure_location')->default('Bandara Soekarno-Hatta (CGK), Terminal 3');
            $table->integer('capacity')->default(45);
            $table->integer('participants_count')->default(0);
            $table->enum('status', ['Scheduled', 'Ready', 'Departed', 'Completed', 'Cancelled'])->default('Scheduled');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departures');
    }
};

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
        Schema::create('visas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jamaah_id')->constrained('jamaah')->cascadeOnDelete();
            $table->enum('passport_status', ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->enum('visa_status', ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->enum('ktp_status', ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->enum('vaccine_status', ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->string('passport_number')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visas');
    }
};

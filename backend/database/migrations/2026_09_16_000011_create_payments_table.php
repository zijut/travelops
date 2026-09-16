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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique(); // e.g. PAY1001 or INV-2026-XXXX
            $table->string('invoice_number')->unique();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->foreignId('jamaah_id')->nullable()->constrained('jamaah')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('finance_id')->nullable()->constrained('finances')->nullOnDelete();
            $table->decimal('amount', 15, 2);
            $table->date('payment_date')->useCurrent();
            $table->string('payment_method')->default('Bank Transfer');
            $table->enum('status', ['COMPLETED', 'PENDING', 'CANCELLED'])->default('COMPLETED');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

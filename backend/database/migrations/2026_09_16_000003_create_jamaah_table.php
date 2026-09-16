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
        Schema::create('jamaah', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique(); // e.g. JMH001
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('packages')->nullOnDelete();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('package_name')->nullable();
            $table->string('departure_date')->nullable();
            $table->enum('status', [
                'Inquiry',
                'Booked',
                'Paid',
                'Visa Approved',
                'Departed',
                'Returned',
                'Cancelled'
            ])->default('Booked');
            $table->string('kloter')->default('Kloter A');
            $table->string('passport_number')->nullable();
            $table->date('passport_expiry')->nullable();
            $table->string('ktp_number')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['L', 'P'])->nullable();
            $table->string('blood_type')->nullable();
            $table->string('city')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_relation')->nullable();
            $table->string('hotel_makkah')->nullable();
            $table->string('room_makkah')->nullable();
            $table->string('hotel_madinah')->nullable();
            $table->string('room_madinah')->nullable();
            $table->enum('room_type', ['Quad', 'Triple', 'Double', 'Single'])->nullable();
            $table->string('bus_number')->nullable();
            $table->integer('bus_seat_number')->nullable();
            $table->decimal('total_price', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->enum('payment_status', ['Lunas', 'DP', 'Belum Bayar'])->default('Belum Bayar');
            $table->string('visa_number')->nullable();
            $table->date('visa_issue_date')->nullable();
            $table->date('visa_expiry_date')->nullable();
            $table->enum('vaccine_status', ['Verified', 'Pending', 'Missing'])->default('Pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jamaah');
    }
};

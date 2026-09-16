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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->nullable()->unique();
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->string('title');
            $table->enum('category', ['Pre-Departure', 'In-Saudi', 'Post-Return'])->default('Pre-Departure');
            $table->date('due_date')->nullable();
            $table->boolean('completed')->default(false);
            $table->string('assignee')->nullable();
            $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium');
            $table->text('description')->nullable();
            $table->json('subtasks')->nullable();
            $table->string('kloter')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};

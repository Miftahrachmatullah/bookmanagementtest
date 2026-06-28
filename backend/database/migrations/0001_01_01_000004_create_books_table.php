<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')
                  ->constrained('authors')
                  ->onDelete('cascade');
            $table->string('title', 255);
            $table->string('isbn', 20)->unique();
            $table->smallInteger('published_year');
            $table->text('description')->nullable();
            $table->string('status', 20)->default('AVAILABLE');
            $table->string('cover_image_path', 2048)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};

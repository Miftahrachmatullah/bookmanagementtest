<?php

use App\Http\Controllers\Api\V1\AuthorController;
use App\Http\Controllers\Api\V1\BookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Authors
    Route::apiResource('authors', AuthorController::class);

    // Books
    Route::apiResource('books', BookController::class);

    // Database Reset
    Route::post('reset', function () {
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
        return response()->json(['message' => 'Database reset successfully']);
    });

});

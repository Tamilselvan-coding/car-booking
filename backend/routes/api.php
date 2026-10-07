<?php

use App\Http\Controllers\ActiveBannerController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\BannerController;
use Illuminate\Support\Facades\Route;

Route::get('banners/active', ActiveBannerController::class)->name('banners.active');

Route::prefix('admin')->name('admin.')->group(function (): void {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:admin-login')->name('login');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');

        Route::middleware('admin')->group(function (): void {
            Route::patch('banners/{banner}/status', [BannerController::class, 'status'])->name('banners.status');
            Route::apiResource('banners', BannerController::class);
        });
    });
});

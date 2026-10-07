<?php

use App\Http\Controllers\Admin\PanelController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/admin');
Route::get('/offers/preview', [PanelController::class, 'preview'])->name('offers.preview');

Route::middleware('guest:web')->group(function (): void {
    Route::get('/admin/login', [PanelController::class, 'signIn'])->name('admin.sign-in');
    Route::post('/admin/login', [PanelController::class, 'login'])->middleware('throttle:admin-login')->name('admin.session.login');
});

Route::middleware(['auth:web', 'admin'])->group(function (): void {
    Route::get('/admin', [PanelController::class, 'dashboard'])->name('admin.dashboard');
});

Route::post('/admin/logout', [PanelController::class, 'logout'])->middleware('auth:web')->name('admin.session.logout');

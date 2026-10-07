<?php

use App\Http\Controllers\AttributeController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root redirect
Route::get('/', function () {
    if (Auth::check() && Auth::user()->isAdmin()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

// Protected Admin Dashboard & Module Routes (RBAC: Admin Role Required)
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Products CRUD ──
    Route::resource('products', ProductController::class);
    Route::post('/products/variants/{variant}/adjust-stock', [ProductController::class, 'adjustStock'])
        ->name('products.adjust-stock');

    // ── Categories CRUD ──
    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);

    // ── Sizes Management ──
    Route::post('/sizes', [AttributeController::class, 'storeSize'])->name('sizes.store');
    Route::put('/sizes/{size}', [AttributeController::class, 'updateSize'])->name('sizes.update');
    Route::delete('/sizes/{size}', [AttributeController::class, 'destroySize'])->name('sizes.destroy');

    // ── Colors Management ──
    Route::post('/colors', [AttributeController::class, 'storeColor'])->name('colors.store');
    Route::put('/colors/{color}', [AttributeController::class, 'updateColor'])->name('colors.update');
    Route::delete('/colors/{color}', [AttributeController::class, 'destroyColor'])->name('colors.destroy');

    // ── Orders Module ──
    Route::get('/orders', [\App\Http\Controllers\AdminOrderController::class, 'index'])->name('orders.index');
    Route::patch('/orders/{order}/status', [\App\Http\Controllers\AdminOrderController::class, 'updateStatus'])->name('orders.update-status');

    // ── Customers Module ──
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::patch('/customers/{customer}/toggle-status', [CustomerController::class, 'toggleStatus'])->name('customers.toggle-status');

    // ── Inventory Management ──
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory/variants/{variant}/adjust', [InventoryController::class, 'adjustStock'])->name('inventory.adjust-stock');
    Route::get('/inventory/variants/{variant}/history', [InventoryController::class, 'variantHistory'])->name('inventory.variant-history');

    Route::get('/reports', function () {
        return Inertia::render('Reports/Index');
    })->name('reports.index');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

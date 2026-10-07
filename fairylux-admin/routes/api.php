<?php

use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CustomerAddressController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FairyLux Customer Catalog API Routes (Public)
|--------------------------------------------------------------------------
|
| These endpoints allow the React Native customer mobile app to browse
| real active categories, products, variants, colors, sizes, and stock.
|
*/

Route::get('/categories', [CategoryController::class, 'index'])->name('api.categories.index');
Route::get('/products', [ProductController::class, 'index'])->name('api.products.index');
Route::get('/products/{id}', [ProductController::class, 'show'])->name('api.products.show');

/*
|--------------------------------------------------------------------------
| FairyLux Authenticated Customer API Routes (Firebase Auth Protected)
|--------------------------------------------------------------------------
|
| These endpoints are strictly isolated per authenticated Firebase customer.
| The customer is determined by verified server-side Firebase ID token.
|
*/

Route::middleware('auth.firebase')->group(function () {
    // ── Customer Cart ──
    Route::get('/cart', [CartController::class, 'index'])->name('api.cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('api.cart.store');
    Route::put('/cart/{id}', [CartController::class, 'update'])->name('api.cart.update');
    Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('api.cart.destroy');

    // ── Customer Delivery Addresses ──
    Route::get('/addresses', [CustomerAddressController::class, 'index'])->name('api.addresses.index');
    Route::post('/addresses', [CustomerAddressController::class, 'store'])->name('api.addresses.store');
    Route::put('/addresses/{id}', [CustomerAddressController::class, 'update'])->name('api.addresses.update');
    Route::delete('/addresses/{id}', [CustomerAddressController::class, 'destroy'])->name('api.addresses.destroy');

    // ── Checkout & Orders ──
    Route::post('/checkout', [CheckoutController::class, 'placeOrder'])->name('api.checkout.place');
    Route::get('/orders', [CustomerOrderController::class, 'index'])->name('api.orders.index');
    Route::get('/orders/{id}', [CustomerOrderController::class, 'show'])->name('api.orders.show');
});

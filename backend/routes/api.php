<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\SellerController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\BannerController;


// Public routes with Rate Limiting
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/admin/login', [AuthController::class, 'adminLogin']);
    Route::post('/seller/login', [AuthController::class, 'sellerLogin']);
    Route::post('/seller/register', [AuthController::class, 'sellerRegister']);
    Route::post('/customer/login', [AuthController::class, 'customerLogin']);
    Route::post('/customer/register', [AuthController::class, 'customerRegister']);
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/settings', [PublicController::class, 'getGlobalSettings']);
Route::get('/payment-methods', [PublicController::class, 'getPaymentMethods']);
Route::post('/fingerprint', [PublicController::class, 'logFingerprint']);
Route::get('/banners', [BannerController::class, 'index']);


// Protected Admin Routes
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AdminController::class, 'getProfile']);
    Route::put('/profile', [AdminController::class, 'updateProfile']);
    
    Route::get('/products/pending', [AdminController::class, 'pendingProducts']);
    Route::post('/products/{id}/approve', [AdminController::class, 'approveProduct']);
    Route::post('/products/{id}/reject', [AdminController::class, 'rejectProduct']);

    Route::get('/orders', [AdminController::class, 'orders']);
    Route::post('/orders/{id}/accept', [AdminController::class, 'acceptOrder']);
    Route::post('/orders/{id}/send', [AdminController::class, 'sendOrderToSeller']);

    Route::get('/sellers', [AdminController::class, 'sellers']);
    Route::put('/sellers/{id}', [AdminController::class, 'updateSeller']);
    Route::delete('/sellers/{id}', [AdminController::class, 'deleteSeller']);
    Route::put('/sellers/{id}/status', [AdminController::class, 'updateStoreStatus']);

    Route::get('/feedbacks', [AdminController::class, 'feedbacks']);
    Route::delete('/feedbacks/{id}', [AdminController::class, 'deleteFeedback']);

    Route::get('/transactions', [AdminController::class, 'transactions']);
    Route::post('/transactions/{id}/approve', [AdminController::class, 'approveTransaction']);

    Route::get('/marketeers', [AdminController::class, 'marketeers']);
    Route::post('/marketeers', [AdminController::class, 'storeMarketeer']);
    Route::post('/marketeers/pay', [AdminController::class, 'payMarketeer']);
    Route::delete('/marketeers/{id}', [AdminController::class, 'deleteMarketeer']);
    
    Route::get('/admins', [AdminController::class, 'admins']);
    Route::post('/admins', [AdminController::class, 'storeAdmin']);
    Route::delete('/admins/{id}', [AdminController::class, 'deleteAdmin']);
    
    Route::get('/statistics', [AdminController::class, 'statistics']);
    
    Route::get('/customers', [AdminController::class, 'customers']);
    Route::put('/customers/{id}', [AdminController::class, 'updateCustomer']);
    Route::delete('/customers/{id}', [AdminController::class, 'deleteCustomer']);

    Route::get('/settings', [AdminController::class, 'getSettings']);
    Route::put('/settings', [AdminController::class, 'updateSettings']);
    Route::get('/fingerprints', [AdminController::class, 'getFingerprints']);
    Route::get('/download-file', [AdminController::class, 'downloadFile']);

    Route::get('/payment-methods', [AdminController::class, 'getPaymentMethods']);
    Route::post('/payment-methods', [AdminController::class, 'storePaymentMethod']);
    Route::put('/payment-methods/{id}', [AdminController::class, 'updatePaymentMethod']);
    Route::delete('/payment-methods/{id}', [AdminController::class, 'deletePaymentMethod']);

    Route::get('/banners', [BannerController::class, 'adminIndex']);
    Route::post('/banners', [BannerController::class, 'store']);
    Route::put('/banners/{id}', [BannerController::class, 'update']);
    Route::delete('/banners/{id}', [BannerController::class, 'destroy']);
});


// Protected Seller Routes
Route::middleware(['auth:sanctum', 'role:seller'])->prefix('seller')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [SellerController::class, 'getProfile']);
    Route::put('/profile', [SellerController::class, 'updateProfile']);
    Route::put('/store-details', [SellerController::class, 'updateStoreDetails']);
    
    Route::get('/dashboard', [SellerController::class, 'dashboard']);
    Route::put('/status', [SellerController::class, 'updateStoreStatus']);
    Route::get('/products', [SellerController::class, 'products']);
    Route::get('/orders', [SellerController::class, 'orders']);
    Route::put('/orders/{id}/status', [SellerController::class, 'updateOrderStatus']);
    Route::get('/approvals', [SellerController::class, 'approvals']);
    Route::get('/transactions', [SellerController::class, 'transactions']);
    Route::get('/download-file', [SellerController::class, 'downloadFile']);
    Route::post('/transactions/request', [SellerController::class, 'requestTransaction']);

    // Product management for specific seller
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
});

// Protected Customer Routes
Route::middleware(['auth:sanctum', 'role:customer'])->prefix('customer')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [CustomerController::class, 'getProfile']);
    Route::put('/profile', [CustomerController::class, 'updateProfile']);
    Route::put('/update-shipping', [CustomerController::class, 'updateShippingInfo']);
    
    Route::post('/orders', [CustomerController::class, 'placeOrder']);
    Route::get('/orders', [CustomerController::class, 'orders']);
    Route::post('/orders/{id}/cancel', [CustomerController::class, 'cancelOrder']);
    Route::get('/pending-reviews', [CustomerController::class, 'pendingReviews']);
    Route::post('/feedback', [CustomerController::class, 'submitFeedback']);
    Route::post('/validate-promo', [CustomerController::class, 'validatePromo']);
});

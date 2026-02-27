<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PolarController;

Route::get('/', [PolarController::class, 'index']);
Route::get('/checkout', [PolarController::class, 'checkout']);
Route::get('/portal', [PolarController::class, 'portal']);
Route::post('/polar/webhooks', [PolarController::class, 'webhooks']);

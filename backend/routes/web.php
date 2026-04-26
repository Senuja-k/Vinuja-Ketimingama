<?php

use Illuminate\Support\Facades\Route;

Route::get('{any}', function () {
    $path = public_path('index.html');
    if (file_exists($path)) {
        return file_get_contents($path);
    }
    return "TokoXpress Backend is Running. Please build the frontend and place it in the public folder.";
})->where('any', '.*');

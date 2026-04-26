<?php
$baseUrl = 'http://localhost:8000/api';

function runTest($name, $method, $url, $data = [], $headers = [], $sleepMs = 0) {
    if ($sleepMs > 0) usleep($sleepMs * 1000);
    echo "Running: $name... ";
    
    $ch = curl_init();
    $fullUrl = $GLOBALS['baseUrl'] . $url;
    
    $curlHeaders = ['Accept: application/json', 'Content-Type: application/json'];
    foreach ($headers as $k => $v) {
        $curlHeaders[] = "$k: $v";
    }

    $options = [
        CURLOPT_URL => $fullUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => strtoupper($method),
        CURLOPT_HTTPHEADER => $curlHeaders,
    ];

    if ($method !== 'GET' && !empty($data)) {
        $options[CURLOPT_POSTFIELDS] = json_encode($data);
    }

    curl_setopt_array($ch, $options);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        echo "✅ PASS ($httpCode)\n";
        return json_decode($response, true);
    } else {
        echo "❌ FAIL ($httpCode)\n";
        echo "Response: $response\n";
        return null;
    }
}

echo "=== STARTING E2E BACKEND VERIFICATION ===\n\n";

// 1. Settings
runTest("Fetch Platform Settings", "GET", "/settings");

// 2. Auth - Admin
$adminData = runTest("Admin Login", "POST", "/admin/login", ['username' => 'Hirushan', 'password' => 'password'], [], 500);
$adminToken = $adminData['token'] ?? null;

// 3. Auth - Customer Registration & Login
$randomUser = "testcust" . rand(1000, 9999);
sleep(2); // wait to avoid rate limit
$custRegData = runTest("Customer Signup", "POST", "/customer/register", [
    'first_name' => 'John', 'last_name' => 'Doe', 'username' => $randomUser, 
    'password' => 'password123', 'email' => "$randomUser@example.com"
]);
$custToken = $custRegData['token'] ?? null;

if (!$custToken) {
    // try login if already exists
    $custLoginData = runTest("Customer Login Fallback", "POST", "/customer/login", [
        'username' => $randomUser, 'password' => 'password123'
    ], [], 1000);
    $custToken = $custLoginData['token'] ?? null;
}

// 4. Auth - Seller
$randomSeller = "testsell" . rand(1000, 9999);
$nicSuffix = substr(time(), -6);
sleep(2); // wait to avoid rate limit
$sellerRegData = runTest("Seller Signup", "POST", "/seller/register", [
    'first_name' => 'Jane', 'last_name' => 'Doe', 'username' => $randomSeller,
    'password' => 'password123', 'email' => "$randomSeller@example.com",
    'contact' => '1234567890', 'nic' => "{$nicSuffix}789V",
    'address' => '123 Test St', 'store_name' => 'Test Store'
]);

$sellerLoginData = runTest("Seller Login", "POST", "/seller/login", [
    'username' => $randomSeller, 'password' => 'password123'
], [], 1000);
$sellerToken = $sellerLoginData['token'] ?? null;

// 5. Products parsing and fetching
$products = runTest("Fetch Active Products", "GET", "/products?page=1");
$productId = $products[0]['id'] ?? 1;

runTest("Fetch Product Details & Parsing JSON variants", "GET", "/products/$productId");

// 6. Orders
if ($custToken) {
    runTest("Customer Place Order", "POST", "/customer/orders", [
        'product_id' => $productId,
        'seller_id' => 1,
        'quantity' => 1,
        'delivery_address' => '123 Example St',
        'contact_no' => '0701234567',
        'delivery_fee' => 250,
        'payment_method' => 1,
        'total_amount' => 1500
    ], ['Authorization' => "Bearer $custToken"]);

    runTest("Customer Fetch Own Orders", "GET", "/customer/orders", [], ['Authorization' => "Bearer $custToken"]);
}

// 7. Admin Reports & CRUD Checks
if ($adminToken) {
    $headers = ['Authorization' => "Bearer $adminToken"];

    runTest("Admin – Fetch Orders (Order Status Report)", "GET", "/admin/orders", [], $headers);
    runTest("Admin – Fetch All Customers", "GET", "/admin/customers", [], $headers);
    runTest("Admin – Fetch Sellers", "GET", "/admin/sellers", [], $headers);
    runTest("Admin – Fetch Statistics/Charts", "GET", "/admin/statistics", [], $headers);
    runTest("Admin – Fetch Settings", "GET", "/admin/settings", [], $headers);
    runTest("Admin – Fetch Payment Methods", "GET", "/admin/payment-methods", [], $headers);
    runTest("Admin – Fetch Marketeers", "GET", "/admin/marketeers", [], $headers);
    runTest("Admin – Fetch Transactions", "GET", "/admin/transactions", [], $headers);
    runTest("Admin – Fetch Pending Products", "GET", "/admin/products/pending", [], $headers);
    runTest("Admin – Fetch Feedback", "GET", "/admin/feedbacks", [], $headers);
}

echo "\n=== VERIFICATION COMPLETE ===\n";

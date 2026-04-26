<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Customer;
use App\Models\Seller;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

use App\Models\Marketeer;
use App\Models\PromoCode;

class AuthController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function adminLogin(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('username', $request->username)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            $logMsg = "[AUTH FAILED] Admin login failed for username: {$request->username} from IP: " . $request->ip();
            Log::warning($logMsg);
            error_log("\033[31m$logMsg\033[0m");

            return response()->json(['message' => 'Invalid username or password.'], 401);
        }

        return response()->json([
            'message' => 'Admin logged in',
            'token' => $admin->createToken('admin_token', ['role:admin'])->plainTextToken,
            'name' => $admin->first_name . ' ' . $admin->last_name,
        ]);
    }

    public function sellerLogin(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $seller = Seller::where('username', $request->username)->first();

        if (!$seller || !Hash::check($request->password, $seller->password)) {
            $logMsg = "[AUTH FAILED] Seller login failed for username: {$request->username} from IP: " . $request->ip();
            Log::warning($logMsg);
            error_log("\033[31m$logMsg\033[0m");

            return response()->json(['message' => 'Invalid username or password.'], 401);
        }

        if ($seller->status !== 1) {
            return response()->json(['message' => 'Your store is pending activation or has been suspended. Please contact admin.'], 403);
        }

        return response()->json([
            'message' => 'Seller logged in',
            'token' => $seller->createToken('seller_token', ['role:seller'])->plainTextToken,
            'name' => $seller->first_name,
        ]);
    }

    public function sellerRegister(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'username' => 'required|string|unique:sellers|max:50',
            'password' => 'required|string|min:6',
            'email' => 'required|email|unique:sellers',
            'contact' => 'required|string',
            'nic' => 'required|string|unique:sellers',
            'address' => 'required|string',
            'store_name' => 'required|string',
            'bank_name' => 'nullable|string',
            'branch' => 'nullable|string',
            'account_no' => 'nullable|string',
            'account_holder_name' => 'nullable|string',
            'nic_front' => 'nullable|image|max:5120',
            'nic_back' => 'nullable|image|max:5120',
            'referral_code' => 'nullable|string',
        ]);

        $nicFrontPath = null;
        if ($request->hasFile('nic_front')) {
            $nicFrontPath = $this->imageService->store($request->file('nic_front'), 'nic');
        }

        $nicBackPath = null;
        if ($request->hasFile('nic_back')) {
            $nicBackPath = $this->imageService->store($request->file('nic_back'), 'nic');
        }

        $seller = Seller::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'email' => $request->email,
            'contact' => $request->contact,
            'nic' => $request->nic,
            'address' => $request->address,
            'store_name' => $request->store_name,
            'bank_name' => $request->bank_name,
            'branch' => $request->branch,
            'account_no' => $request->account_no,
            'account_holder_name' => $request->account_holder_name,
            'nic_image' => $nicFrontPath,
            'nic_back' => $nicBackPath,
            'status' => 0, // Inactive until admin approves
            'wallet_balance' => 0,
            'claimed_amount' => 0,
            'referred_by_marketeer_id' => $request->referral_code ? Marketeer::where('promo_code', $request->referral_code)->where('type', 1)->value('id') : null,
            'referred_by_seller_id' => $request->referral_code ? Seller::where('promo_code', $request->referral_code)->value('id') : null,
        ]);

        return response()->json([
            'message' => 'Seller registered successfully',
        ], 201);
    }

    public function customerLogin(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $customer = Customer::where('username', $request->username)->first();

        if (!$customer || !Hash::check($request->password, $customer->password)) {
            $logMsg = "[AUTH FAILED] Customer login failed for username: {$request->username} from IP: " . $request->ip();
            Log::warning($logMsg);
            error_log("\033[31m$logMsg\033[0m");

            return response()->json(['message' => 'Invalid username or password.'], 401);
        }

        return response()->json([
            'message' => 'Customer logged in',
            'token' => $customer->createToken('customer_token', ['role:customer'])->plainTextToken,
            'customer' => [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'contact' => $customer->contact,
                'address' => $customer->address,
            ],
        ]);
    }

    public function customerRegister(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'username' => 'required|string|unique:customers|max:50',
            'password' => 'required|string|min:6',
            'email' => 'required|email|unique:customers',
            'contact' => 'nullable|string',
            'nic' => 'nullable|string',
            'address' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'province' => 'nullable|string',
        ]);

        $customer = Customer::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'email' => $request->email,
            'contact' => $request->contact,
            'nic' => $request->nic,
            'address' => $request->address,
            'postal_code' => $request->postal_code,
            'province' => $request->province,
        ]);

        return response()->json([
            'message' => 'Customer registered successfully',
            'token' => $customer->createToken('customer_token', ['role:customer'])->plainTextToken,
            'customer' => [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'contact' => $customer->contact,
                'address' => $customer->address,
            ],
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}

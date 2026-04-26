<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Marketeer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Customer;
use App\Models\TransactionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\PromoCode;
use App\Models\Setting;
use App\Models\DeviceFingerprint;
use App\Models\PaymentMethod;
use App\Models\Admin;


class AdminController extends Controller
{
    public function getProfile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $admin = $request->user();
        
        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'username' => 'required|string|max:50|unique:admins,username,' . $admin->id,
            'password' => 'nullable|string|min:6'
        ]);

        $data = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
        ];

        if ($request->password) {
            $data['password'] = $request->password; // Model hashes it via cast
        }

        $admin->update($data);

        return response()->json(['message' => 'Profile updated successfully', 'admin' => $admin]);
    }

    public function pendingProducts()
    {
        return response()->json(Product::with(['seller', 'categories', 'images'])->where('approval_status', 0)->latest()->paginate(10));
    }

    public function approveProduct(Request $request, $id)
    {
        $request->validate(['commission' => 'required|integer|min:0|max:100']);
        $product = Product::findOrFail($id);
        
        $final_price = $product->marked_price + ($product->marked_price * ($request->commission / 100));
        
        $product->update([
            'approval_status' => 1,
            'commission' => $request->commission,
            'final_price' => $final_price
        ]);
        
        return response()->json(['message' => 'Product approved', 'product' => $product]);
    }

    public function rejectProduct(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);
        $product = Product::findOrFail($id);
        $product->update(['approval_status' => 2, 'reject_reason' => $request->reason]);
        return response()->json(['message' => 'Product rejected']);
    }

    public function orders()
    {
        return response()->json(Order::with(['customer', 'product.seller', 'promoCode.seller', 'sellerMarketeer', 'productMarketeer'])->latest()->paginate(10));
    }

    public function acceptOrder($id)
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => 1]);
        return response()->json(['message' => 'Order accepted']);
    }

    public function sendOrderToSeller($id)
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => 2]);
        return response()->json(['message' => 'Order sent to seller']);
    }

    public function sellers()
    {
        return response()->json(Seller::withSum('orders as total_sales', 'total_amount')->latest()->paginate(10));
    }

    public function deleteSeller($id)
    {
        Seller::findOrFail($id)->delete();
        return response()->json(['message' => 'Seller deleted']);
    }

    public function downloadFile(Request $request)
    {
        $path = $request->query('path');
        if (!$path) return response()->json(['message' => 'Path is required'], 400);

        // Sanitize path (get relative path from URL)
        // e.g. http://localhost:8000/storage/nic/abc.jpg -> nic/abc.jpg
        $relativePath = parse_url($path, PHP_URL_PATH);
        $relativePath = str_replace('/storage/', '', $relativePath);
        
        if (Storage::disk('public')->exists($relativePath)) {
            return Storage::disk('public')->response($relativePath);
        }

        return response()->json(['message' => 'File not found: ' . $relativePath], 404);
    }

    public function feedbacks()
    {
        return response()->json(Feedback::with('customer')->latest()->paginate(10));
    }

    public function deleteFeedback($id)
    {
        Feedback::findOrFail($id)->delete();
        return response()->json(['message' => 'Feedback deleted']);
    }

    public function transactions()
    {
        return response()->json(TransactionRequest::with(['seller' => function($q) {
            $q->withSum('orders as total_sales', 'total_amount');
        }])->latest()->paginate(10));
    }

    public function approveTransaction(Request $request, $id)
    {
        // Approval could include uploading slip image
        $tx = TransactionRequest::findOrFail($id);
        
        if ($tx->status == 1) {
            return response()->json(['message' => 'Transaction has already been approved.'], 400);
        }
        
        $slipPath = null;
        if ($request->hasFile('slip_image')) {
            $imageService = app(\App\Services\ImageService::class);
            $slipPath = $imageService->store($request->file('slip_image'), 'slip');
        }

        $tx->update(['status' => 1, 'slip_image' => $slipPath]);
        
        // Update seller claimed amount and wallet
        $seller = $tx->seller;
        $seller->claimed_amount += $tx->requested_amount;
        $seller->wallet_balance -= $tx->requested_amount;
        $seller->save();

        return response()->json(['message' => 'Transaction approved']);
    }

    public function updateStoreStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|integer|in:0,1']);
        $seller = Seller::findOrFail($id);
        $seller->update(['status' => $request->status]);
        return response()->json(['message' => 'Store status updated', 'status' => $seller->status]);
    }

    public function marketeers()
    {
        $marketeers = Marketeer::all()->map(function($m) {
            return [
                'id' => $m->id,
                'name' => $m->first_name . ' ' . $m->last_name,
                'promoCode' => $m->promo_code,
                'wallet_balance' => (float)$m->wallet_balance,
                'total_commission' => (float)$m->total_commission,
                'paid_commission' => (float)$m->paid_commission,
                'type' => $m->type == 1 ? 'sb' : 'pb',
                'isMarketeer' => true,
                'details' => $m
            ];
        });

        $sellers = Seller::all()->map(function($s) {
            return [
                'id' => $s->id,
                'name' => $s->first_name . ' ' . $s->last_name,
                'promoCode' => $s->promo_code,
                'wallet_balance' => (float)$s->wallet_balance,
                'total_commission' => (float)$s->total_commission,
                'type' => 'sb',
                'isMarketeer' => false,
                'details' => $s
            ];
        });

        $combined = $marketeers->concat($sellers);
        $page = request()->query('page', 1);
        $perPage = 10;
        $offset = ($page - 1) * $perPage;
        
        $paginated = new \Illuminate\Pagination\LengthAwarePaginator(
            $combined->slice($offset, $perPage)->values(),
            $combined->count(),
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );

        return response()->json($paginated);
    }

    public function admins()
    {
        return response()->json(\App\Models\Admin::latest()->paginate(10));
    }

    public function storeAdmin(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'username' => 'required|string|max:50|unique:admins,username',
            'password' => 'required|string|min:6',
            'nic' => 'nullable|string|max:12',
            'address' => 'nullable|string|max:200'
        ]);

        $admin = \App\Models\Admin::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'password' => $request->password,
            'nic' => $request->nic,
            'address' => $request->address
        ]);

        return response()->json(['message' => 'Admin created successfully', 'admin' => $admin], 201);
    }

    public function storeMarketeer(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'email' => 'required|email|max:100|unique:marketeers,email',
            'contact' => 'nullable|string|max:15',
            'nic' => 'required|string|max:12|unique:marketeers,nic',
            'address' => 'nullable|string|max:200',
            'type' => 'required|string|in:product,customer'
        ]);

        $marketeer = Marketeer::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'contact' => $request->contact,
            'nic' => $request->nic,
            'address' => $request->address,
            'type' => $request->type === 'product' ? 0 : 1
        ]);

        return response()->json(['message' => 'Marketeer created successfully', 'marketeer' => $marketeer], 201);
    }

    public function customers()
    {
        return response()->json(Customer::latest()->paginate(10));
    }

    public function deleteCustomer($id)
    {
        Customer::findOrFail($id)->delete();
        return response()->json(['message' => 'Customer deleted']);
    }

    public function deleteMarketeer($id)
    {
        Marketeer::findOrFail($id)->delete();
        return response()->json(['message' => 'Marketeer deleted']);
    }

    public function deleteAdmin($id)
    {
        \App\Models\Admin::findOrFail($id)->delete();
        return response()->json(['message' => 'Admin deleted']);
    }

    public function statistics(Request $request)
    {
        $timeframe = $request->timeframe;
        $year = $request->year ?? date('Y');
        $month = $request->month ?? date('m');
        $week = $request->week ?? date('W');

        // Helper to apply filters to any query
        $applyFilters = function ($q) use ($timeframe, $year, $month, $week) {
            if ($timeframe === 'Yearly') {
                $q->whereYear('orders.created_at', $year);
            } elseif ($timeframe === 'Monthly') {
                $q->whereYear('orders.created_at', $year)->whereMonth('orders.created_at', $month);
            } elseif ($timeframe === 'Weekly') {
                $q->whereYear('orders.created_at', $year)->where(\Illuminate\Support\Facades\DB::raw('WEEK(orders.created_at, 1)'), $week);
            }
            return $q;
        };

        // Total Sales: Sum of all non-cancelled orders
        $totalSales = $applyFilters(Order::where('orders.status', '!=', 4))->sum('orders.total_amount');
        
        // Total Income: All projected/realized commission from non-cancelled orders
        // Fallback to product commission if order commission is 0 (legacy orders)
        $totalIncome = $applyFilters(Order::where('orders.status', '!=', 4))
            ->join('products', 'orders.product_id', '=', 'products.id')
            ->sum(\Illuminate\Support\Facades\DB::raw('(orders.total_amount - orders.delivery_fee) * (CASE WHEN orders.admin_commission_percent > 0 THEN orders.admin_commission_percent ELSE products.commission END / 100)'));

        // Order Summary (Pending/Processing)
        $orderStatusCount = $applyFilters(Order::where('orders.status', '<', 2))->count();

        // Total Orders (Filtered)
        $totalOrders = $applyFilters(Order::query())->count();

        return response()->json([
            'total_sales' => (float)$totalSales,
            'total_income' => (float)$totalIncome,
            'total_orders' => $totalOrders,
            'total_products' => Product::count(), // Lifetime
            'total_stores' => Seller::count(),
            'active_stores' => Seller::where('status', 1)->count(),
            'total_customers' => Customer::count(),
            'total_feedbacks' => Feedback::count(),
            'transaction_history' => TransactionRequest::where('status', 1)->count(),
            'pending_transactions' => TransactionRequest::where('status', 0)->count(),
            'order_status' => $orderStatusCount,
        ]);
    }

    public function getSettings()
    {
        return response()->json(Setting::all()->pluck('value', 'key'));
    }

    public function updateSettings(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function getFingerprints()
    {
        return response()->json(DeviceFingerprint::latest()->get());
    }

    public function getPaymentMethods()
    {
        return response()->json(PaymentMethod::latest()->get());
    }

    public function storePaymentMethod(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50',
            'icon' => 'nullable|file|image|max:2048',
        ]);

        $data = $request->only(['name']);
        $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        $data['is_disabled'] = filter_var($request->is_disabled, FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('icon')) {
            $imageService = app(\App\Services\ImageService::class);
            $data['icon'] = $imageService->store($request->file('icon'), 'payment_methods');
        }

        $pm = PaymentMethod::create($data);
        return response()->json(['message' => 'Payment method created', 'payment_method' => $pm]);
    }

    public function updatePaymentMethod(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:50',
            'icon' => 'nullable|file|image|max:2048',
        ]);

        $pm = PaymentMethod::findOrFail($id);
        $data = $request->only(['name']);
        $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        $data['is_disabled'] = filter_var($request->is_disabled, FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('icon')) {
            $imageService = app(\App\Services\ImageService::class);
            $data['icon'] = $imageService->store($request->file('icon'), 'payment_methods');
        }

        $pm->update($data);
        return response()->json(['message' => 'Payment method updated', 'payment_method' => $pm]);
    }

    public function deletePaymentMethod($id)
    {
        PaymentMethod::findOrFail($id)->delete();
        return response()->json(['message' => 'Payment method deleted']);
    }

    public function updateSeller(Request $request, $id)
    {
        $seller = Seller::findOrFail($id);
        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'username' => 'required|string|max:50|unique:sellers,username,' . $id,
            'email' => 'required|email|max:100|unique:sellers,email,' . $id,
            'password' => 'nullable|string|min:6'
        ]);

        $data = $request->only(['first_name', 'last_name', 'username', 'email']);
        if ($request->password) {
            $data['password'] = $request->password;
        }

        $seller->update($data);
        return response()->json(['message' => 'Seller updated successfully', 'seller' => $seller]);
    }

    public function updateCustomer(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'username' => 'required|string|max:50|unique:customers,username,' . $id,
            'email' => 'required|email|max:100|unique:customers,email,' . $id,
            'password' => 'nullable|string|min:6'
        ]);

        $data = $request->only(['first_name', 'last_name', 'username', 'email']);
        if ($request->password) {
            $data['password'] = $request->password;
        }

        $customer->update($data);
        return response()->json(['message' => 'Customer updated successfully', 'customer' => $customer]);
    }

    public function payMarketeer(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'amount' => 'required|numeric|min:0.01',
            'isMarketeer' => 'required',
            'slip' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $amount = $request->amount;
        $id = $request->id;
        $isMarketeer = filter_var($request->isMarketeer, FILTER_VALIDATE_BOOLEAN);

        $slipPath = null;
        if ($request->hasFile('slip')) {
            $slipPath = $request->file('slip')->store('payment_slips', 'public');
        }

        if ($isMarketeer) {
            $marketeer = \App\Models\Marketeer::findOrFail($id);
            $marketeer->total_commission -= $amount;
            $marketeer->paid_commission += $amount;
            if ($slipPath) {
                $marketeer->payment_slip = $slipPath;
            }
            // If it's a seller-based marketeer (type 1), deduct from wallet too
            if ($marketeer->type == 1) {
                $marketeer->wallet_balance -= $amount;
            }
            $marketeer->save();
        } else {
            // Seller acting as marketeer
            $seller = \App\Models\Seller::findOrFail($id);
            $seller->total_commission -= $amount;
            $seller->paid_commission += $amount;
            if ($slipPath) {
                $seller->payment_slip = $slipPath;
            }
            $seller->wallet_balance -= $amount;
            $seller->save();
        }

        return response()->json(['message' => 'Payment recorded successfully']);
    }
}

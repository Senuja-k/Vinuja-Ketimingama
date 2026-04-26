<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\TransactionRequest;
use Illuminate\Http\Request;

class SellerController extends Controller
{
    public function getProfile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $seller = $request->user();
        
        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'username' => 'required|string|max:50|unique:sellers,username,' . $seller->id,
            'password' => 'nullable|string|min:6'
        ]);

        $data = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
        ];

        if ($request->password) {
            $data['password'] = $request->password;
        }

        $seller->update($data);

        return response()->json(['message' => 'Profile updated successfully', 'seller' => $seller]);
    }

    public function updateStoreDetails(Request $request)
    {
        $seller = $request->user();

        $request->validate([
            'store_name' => 'required|string|max:100',
            'address' => 'required|string|max:200',
            'email' => 'required|email|max:100',
            'contact' => 'required|string|max:15',
            'bank_name' => 'required|string|max:100',
            'branch' => 'required|string|max:100',
            'account_no' => 'required|string|max:50',
            'account_holder_name' => 'required|string|max:100',
            'profile_picture' => 'nullable|image|max:2048',
        ]);

        $data = $request->only([
            'store_name', 'address', 'email', 'contact',
            'bank_name', 'branch', 'account_no', 'account_holder_name'
        ]);

        if ($request->hasFile('profile_picture')) {
            $imageService = app(\App\Services\ImageService::class);
            $data['profile_picture'] = $imageService->store($request->file('profile_picture'), 'seller');
        }

        $seller->update($data);

        return response()->json(['message' => 'Store details updated successfully', 'seller' => $seller]);
    }

    public function dashboard(Request $request)
    {
        $sellerId = $request->user()->id;
        $user = \App\Models\Seller::find($sellerId);
        
        $wallet = $user->wallet_balance;
        $claimed = $user->claimed_amount;
        
        $salesQuery = \Illuminate\Support\Facades\DB::table('orders')
            ->join('products', 'orders.product_id', '=', 'products.id')
            ->where('orders.seller_id', $sellerId)
            ->where('orders.status', 3);

        $orderCountQuery = Order::where('seller_id', $sellerId)->where('status', '>=', 2);

        if ($request->timeframe === 'Yearly') {
            $year = $request->year ?? date('Y');
            $salesQuery->whereYear('orders.created_at', $year);
            $orderCountQuery->whereYear('created_at', $year);
        } elseif ($request->timeframe === 'Monthly') {
            $year = $request->year ?? date('Y');
            $month = $request->month ?? date('m');
            $salesQuery->whereYear('orders.created_at', $year)->whereMonth('orders.created_at', $month);
            $orderCountQuery->whereYear('created_at', $year)->whereMonth('created_at', $month);
        } elseif ($request->timeframe === 'Weekly') {
            $year = $request->year ?? date('Y');
            $week = $request->week ?? date('W');
            $salesQuery->whereYear('orders.created_at', $year)->where(\Illuminate\Support\Facades\DB::raw('WEEK(orders.created_at, 1)'), $week);
            $orderCountQuery->whereYear('created_at', $year)->where(\Illuminate\Support\Facades\DB::raw('WEEK(created_at, 1)'), $week);
        }

        $totalSalesAmount = $salesQuery->selectRaw('SUM(products.marked_price * orders.quantity) as total_sales')->value('total_sales') ?? 0;
        $totalOrdersCount = $orderCountQuery->count();
        
        $productsCount = \App\Models\Product::where('seller_id', $sellerId)->where('approval_status', 1)->count();
        $pendingApprovalsCount = \App\Models\Product::where('seller_id', $sellerId)->whereIn('approval_status', [0, 2])->count();

        $pendingTx = TransactionRequest::where('seller_id', $sellerId)->where('status', 0)->first();

        return response()->json([
            'wallet_balance' => $wallet,
            'claimed_amount' => $claimed,
            'total_sales_amount' => $totalSalesAmount,
            'total_orders_count' => $totalOrdersCount,
            'products_count' => $productsCount,
            'pending_approvals_count' => $pendingApprovalsCount,
            'store_status' => $request->user()->status,
            'total_commission' => (float)$user->total_commission,
            'requested_amount' => $pendingTx ? $pendingTx->requested_amount : 0,
            'request_status' => $pendingTx ? 'pending' : 'idle'
        ]);
    }

    public function updateStoreStatus(Request $request)
    {
        $request->validate(['status' => 'required|integer|in:0,1']);
        $request->user()->update(['status' => $request->status]);
        return response()->json(['message' => 'Store status updated']);
    }

    public function orders(Request $request)
    {
        return response()->json(
            Order::with(['customer', 'product'])
                ->where('seller_id', $request->user()->id)
                ->where('status', '>=', 2)
                ->orderBy('id', 'desc')
                ->paginate(10)
        );
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|integer|in:0,1,2,3,4']);
        $order = Order::with(['product', 'seller', 'promoCode'])->where('seller_id', $request->user()->id)->findOrFail($id);
        
        $oldStatus = $order->status;
        $order->update(['status' => $request->status]);

        if ($request->status == 3 && !$order->commission_distributed && $order->product) {
            $totalMarked = (float) $order->product->marked_price * $order->quantity;
            $commissionPercent = (float) $order->product->commission;
            $totalCommissionPool = $totalMarked * ($commissionPercent / 100);

            $sellerMarketeerAmount = 0;
            $productMarketeerAmount = 0;
            $sellerMarketeerId = null;
            $sellerMarketeerType = null;
            $productMarketeerId = null;

            // 1. Identify Seller Marketeer (Referral)
            if ($order->seller) {
                if ($order->seller->referred_by_marketeer_id) {
                    $earner = \App\Models\Marketeer::find($order->seller->referred_by_marketeer_id);
                    if ($earner) {
                        $sellerMarketeerAmount = $totalMarked * 0.03;
                        $earner->increment('wallet_balance', $sellerMarketeerAmount);
                        $earner->increment('total_commission', $sellerMarketeerAmount);
                        $sellerMarketeerId = $earner->id;
                        $sellerMarketeerType = \App\Models\Marketeer::class;
                    }
                } elseif ($order->seller->referred_by_seller_id) {
                    $earner = \App\Models\Seller::find($order->seller->referred_by_seller_id);
                    if ($earner) {
                        $sellerMarketeerAmount = $totalMarked * 0.03;
                        $earner->increment('wallet_balance', $sellerMarketeerAmount);
                        $earner->increment('total_commission', $sellerMarketeerAmount);
                        $sellerMarketeerId = $earner->id;
                        $sellerMarketeerType = \App\Models\Seller::class;
                    }
                }
            }

            // 2. Identify Product Marketeer (Promo Code)
            if ($order->promoCode && $order->promoCode->type == 0) { // Product Based
                $earner = \App\Models\Marketeer::find($order->promoCode->marketeer_id);
                if ($earner) {
                    $productMarketeerAmount = $totalMarked * 0.03;
                    $earner->increment('wallet_balance', $productMarketeerAmount);
                    $earner->increment('total_commission', $productMarketeerAmount);
                    $productMarketeerId = $earner->id;
                }
            }

            // 3. Admin Net Commission
            $adminNetCommission = $totalCommissionPool - $sellerMarketeerAmount - $productMarketeerAmount;

            // 4. Final seller payout (Marked price)
            if ($order->seller) {
                $order->seller->increment('wallet_balance', $totalMarked);
            }

            // 5. Save split details to order record
            $order->update([
                'commission_distributed' => true,
                'admin_commission_amount' => $adminNetCommission,
                'seller_marketeer_amount' => $sellerMarketeerAmount,
                'product_marketeer_amount' => $productMarketeerAmount,
                'seller_marketeer_id' => $sellerMarketeerId,
                'seller_marketeer_type' => $sellerMarketeerType,
                'product_marketeer_id' => $productMarketeerId,
                'admin_commission_percent' => $commissionPercent
            ]);
        }

        return response()->json(['message' => 'Order status updated']);
    }

    public function approvals(Request $request)
    {
        return response()->json(
            \App\Models\Product::where('seller_id', $request->user()->id)
                ->whereIn('approval_status', [0, 2])
                ->with('categories')
                ->latest()
                ->paginate(10)
        );
    }

    public function products(Request $request)
    {
        return response()->json(
            \App\Models\Product::where('seller_id', $request->user()->id)
                ->where('approval_status', 1)
                ->with(['categories', 'images'])
                ->orderBy('id', 'desc')
                ->paginate(10)
        );
    }

    public function requestTransaction(Request $request)
    {
        $request->validate(['requested_amount' => 'required|integer|min:1']);
        
        if ($request->user()->wallet_balance < $request->requested_amount) {
            return response()->json(['message' => 'Insufficient wallet balance'], 400);
        }

        TransactionRequest::create([
            'seller_id' => $request->user()->id,
            'requested_amount' => $request->requested_amount,
            'status' => 0
        ]);

        return response()->json(['message' => 'Transaction requested']);
    }

    public function transactions(Request $request)
    {
        return response()->json(
            TransactionRequest::where('seller_id', $request->user()->id)
                ->latest()
                ->paginate(10)
        );
    }

    public function downloadFile(Request $request)
    {
        $path = $request->query('path');
        if (!$path) return response()->json(['message' => 'Path is required'], 400);

        $relativePath = parse_url($path, PHP_URL_PATH);
        $relativePath = str_replace('/storage/', '', $relativePath);
        
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($relativePath)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->response($relativePath);
        }

        return response()->json(['message' => 'File not found: ' . $relativePath], 404);
    }
}

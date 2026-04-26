<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Order;
use App\Models\PromoCode;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function placeOrder(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'seller_id' => 'required|exists:sellers,id',
            'quantity' => 'required|integer|min:1',
            'delivery_address' => 'required|string',
            'contact_no' => 'required|string',
            'delivery_fee' => 'required|integer',
            'payment_method' => 'required|integer|exists:payment_methods,id',
            'promo_code_id' => 'nullable|exists:promo_codes,id',
            'total_amount' => 'required|integer',
            'size' => 'nullable|string',
            'color' => 'nullable|string',
            'payment_slip' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:2048',
        ]);

        $slipPath = null;
        if ($request->hasFile('payment_slip')) {
            $file = $request->file('payment_slip');
            $filename = time() . '_' . $request->user()->id . '.' . $file->getClientOriginalExtension();
            $slipPath = $file->storeAs('slips', $filename, 'public');
        }

        $product = \App\Models\Product::findOrFail($request->product_id);

        // Check global stock first
        if ($product->quantity < $request->quantity) {
            return response()->json(['message' => 'Insufficient total stock available.'], 400);
        }

        // Handle variant-level stock if it exists (JSON in color column)
        $productColorData = $product->color;
        if ($request->size && $request->color && !empty($productColorData)) {
            try {
                $variants = json_decode($productColorData, true);
                if (is_array($variants)) {
                    $foundVariant = false;
                    foreach ($variants as &$sizeGroup) {
                        if (isset($sizeGroup['size']) && strtoupper($sizeGroup['size']) === strtoupper($request->size)) {
                            foreach ($sizeGroup['variants'] as &$v) {
                                if (isset($v['color']) && $v['color'] === $request->color) {
                                    if ($v['qty'] < $request->quantity) {
                                        return response()->json(['message' => "Insufficient stock for size {$request->size} in this color."], 400);
                                    }
                                    $v['qty'] -= $request->quantity;
                                    $foundVariant = true;
                                    break;
                                }
                            }
                        }
                        if ($foundVariant) break;
                    }

                    if ($foundVariant) {
                        $product->color = json_encode($variants);
                    }
                }
            } catch (\Exception $e) {
                // Not JSON or other error, fallback to global check only
                \Illuminate\Support\Facades\Log::warning("Failed to process variant stock for product {$product->id}: " . $e->getMessage());
            }
        }

        // Decrement global stock
        $product->quantity -= $request->quantity;
        $product->save();

        $owner = $product->seller;
        $sellerMarketeerId = null;
        $sellerMarketeerType = null;

        if ($owner->referred_by_marketeer_id) {
            $sellerMarketeerId = $owner->referred_by_marketeer_id;
            $sellerMarketeerType = 'App\Models\Marketeer';
        } elseif ($owner->referred_by_seller_id) {
            $sellerMarketeerId = $owner->referred_by_seller_id;
            $sellerMarketeerType = 'App\Models\Seller';
        }

        $productMarketeerId = null;
        if ($request->promo_code_id) {
            $promo = PromoCode::find($request->promo_code_id);
            if ($promo) {
                $productMarketeerId = $promo->marketeer_id;
            }
        }

        $totalMarked = (float)$product->marked_price * $request->quantity;
        $commissionPercent = (float)$product->commission;
        $adminCommissionAmount = ($totalMarked * $commissionPercent) / 100;

        $order = Order::create([
            'customer_id' => $request->user()->id,
            'product_id' => $request->product_id,
            'seller_id' => $request->seller_id,
            'quantity' => $request->quantity,
            'size' => $request->size,
            'color' => $request->color,
            'delivery_address' => $request->delivery_address,
            'contact_no' => $request->contact_no,
            'delivery_fee' => $request->delivery_fee,
            'payment_method' => $request->payment_method,
            'promo_code_id' => $request->promo_code_id,
            'seller_marketeer_id' => $sellerMarketeerId,
            'seller_marketeer_type' => $sellerMarketeerType,
            'product_marketeer_id' => $productMarketeerId,
            'admin_commission_percent' => $commissionPercent,
            'admin_commission_amount' => $adminCommissionAmount,
            'status' => 0,
            'total_amount' => $request->total_amount,
            'payment_slip' => $slipPath,
        ]);

        return response()->json(['message' => 'Order placed successfully', 'order' => $order]);
    }

    public function orders(Request $request)
    {
        return response()->json(
            Order::with('product.images')->where('customer_id', $request->user()->id)->latest()->get()
        );
    }

    public function submitFeedback(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'message' => 'required|string'
        ]);

        $customerId = $request->user()->id;
        $productId = $request->product_id;

        $hasPurchased = \App\Models\Order::where('customer_id', $customerId)
            ->where('product_id', $productId)
            ->where('status', 3) // Must be Delivered
            ->exists();

        if (!$hasPurchased) {
            return response()->json(['message' => 'You can only leave a review after the product has been delivered.'], 403);
        }
        
        $feedback = Feedback::create([
            'customer_id' => $customerId,
            'product_id' => $productId,
            'message' => $request->message,
            'rating' => $request->rating
        ]);

        // Recalculate Product Rating
        $product = \App\Models\Product::find($productId);
        if ($product) {
            $feedbacks = Feedback::where('product_id', $productId)->whereNotNull('rating')->get();
            $product->rating_count = $feedbacks->count();
            $product->rating_avg = $feedbacks->avg('rating');
            $product->save();
        }

        return response()->json(['message' => 'Review submitted successfully', 'feedback' => $feedback]);
    }

    public function validatePromo(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        $promo = PromoCode::where('code', $request->code)->first();
        
        if (!$promo) {
            return response()->json(['message' => 'Invalid promo code'], 400);
        }

        return response()->json($promo);
    }

    public function cancelOrder($id)
    {
        $order = Order::where('customer_id', auth()->id())->findOrFail($id);
        
        if ($order->status !== 0) {
            return response()->json(['message' => 'Only pending orders can be cancelled.'], 400);
        }

        $order->status = 4; // Cancelled
        $order->save();

        return response()->json(['message' => 'Order cancelled successfully']);
    }

    public function getProfile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $customer = $request->user();
        
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'contact' => 'required|string|max:20',
            'address' => 'required|string',
            'nic' => 'nullable|string|max:20',
            'email' => 'required|email|unique:customers,email,' . $customer->id,
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $data = $request->only(['first_name', 'last_name', 'contact', 'address', 'nic', 'email']);
        
        if ($request->password) {
            $data['password'] = $request->password;
        }

        $customer->update($data);

        return response()->json(['message' => 'Profile updated successfully', 'customer' => $customer]);
    }

    public function updateShippingInfo(Request $request)
    {
        $request->validate([
            'address' => 'required|string',
            'contact' => 'required|string|max:20',
        ]);

        $customer = $request->user();
        $customer->update([
            'address' => $request->address,
            'contact' => $request->contact,
        ]);

        return response()->json(['message' => 'Shipping information updated successfully']);
    }

    public function pendingReviews(Request $request)
    {
        $customerId = $request->user()->id;

        $orderedProductIds = \App\Models\Order::where('customer_id', $customerId)
            ->where('status', 3)
            ->pluck('product_id')
            ->unique();

        $reviewedProductIds = \App\Models\Feedback::where('customer_id', $customerId)
            ->pluck('product_id')
            ->unique();

        $pendingProductIds = $orderedProductIds->diff($reviewedProductIds);

        if ($pendingProductIds->isEmpty()) {
            return response()->json([]);
        }

        $products = \App\Models\Product::with('images')
            ->whereIn('id', $pendingProductIds)
            ->latest()
            ->get();

        return response()->json($products);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\DeviceFingerprint;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function getGlobalSettings()
    {
        return response()->json(Setting::all()->pluck('value', 'key'));
    }
    
    public function getPaymentMethods()
    {
        return response()->json(PaymentMethod::where('is_active', true)->get());
    }

    public function logFingerprint(Request $request)
    {
        $request->validate(['fingerprint' => 'required|string']);

        DeviceFingerprint::create([
            'fingerprint' => $request->fingerprint,
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);

        return response()->json(['message' => 'Fingerprint logged successfully']);
    }
}

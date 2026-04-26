<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Add a listener conceptually or just log at the end, but the request says: "prints auth events to the terminal"
        // Let's just log every API request passing through this middleware, or if auth is present.
        
        $user = $request->user();
        if ($user) {
            // Determine role by getting table or class
            $className = class_basename($user);
            $username = $user->username ?? $user->email ?? 'unknown';
            $ip = $request->ip();
            $path = $request->path();
            $method = $request->method();

            $logMsg = "[AUTH ACCESS] $className: $username accessed $method $path from $ip at " . now()->toDateTimeString();
            
            // Log to laravel log
            Log::info($logMsg);
            // Print to terminal for 'php artisan serve'
            error_log("\033[36m$logMsg\033[0m"); // Cyan color
        }

        return $next($request);
    }
}

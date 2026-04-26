<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Token abilities can be used or just checking the class type.
        // Sanctum allows setting abilities like ['role:admin']
        // We'll check if the current user object's class matches the expected role.
        $className = strtolower(class_basename($user));
        
        $hasRole = false;
        foreach ($roles as $role) {
            if ($className === strtolower($role)) {
                $hasRole = true;
                break;
            }
        }

        if (!$hasRole) {
            return response()->json(['message' => 'Forbidden. Insufficient role.'], 403);
        }

        return $next($request);
    }
}

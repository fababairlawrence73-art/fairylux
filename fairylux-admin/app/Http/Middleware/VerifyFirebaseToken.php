<?php

namespace App\Http\Middleware;

use App\Services\FirebaseTokenService;
use Closure;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VerifyFirebaseToken
{
    public function __construct(
        protected FirebaseTokenService $firebaseTokenService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization');

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Missing or malformed Bearer token.',
            ], 401);
        }

        $token = substr($header, 7);

        try {
            $payload = $this->firebaseTokenService->verifyIdToken($token);
            $user = $this->firebaseTokenService->resolveUser($payload);

            if (!$user->is_active) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer account is deactivated. Please contact concierge support.',
                ], 403);
            }

            // Set user on Auth facade and request resolver
            Auth::setUser($user);
            $request->setUserResolver(fn() => $user);

            return $next($request);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: ' . $e->getMessage(),
            ], 401);
        }
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Kreait\Firebase\Auth as FirebaseAuth;
use App\Models\User;

class FirebaseAuthMiddleware
{
    public function __construct(private FirebaseAuth $firebaseAuth) {}

    public function handle($request, Closure $next)
    {
        $idToken = $request->bearerToken();
        if (!$idToken) abort(401, 'Missing bearer token');

        try {
            $verified = $this->firebaseAuth->verifyIdToken($idToken);
            $uid = $verified->claims()->get('sub');

            $user = User::firstOrCreate(
                ['firebase_uid' => $uid],
                ['email' => null] // 必要に応じて初期値
            );

            Auth::login($user);
        } catch (\Throwable $e) {
            abort(401, 'Invalid token');
        }

        return $next($request);
    }
}

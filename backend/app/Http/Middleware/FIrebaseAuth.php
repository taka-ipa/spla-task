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
            $uid = $verified->claims()->get('sub'); // Firebase UID

            // JITプロビジョニング（なければ作る）
            $user = User::firstOrCreate(
                ['firebase_uid' => $uid],
                ['email' => null] // 必要なら他の初期値を
            );

            Auth::login($user); // 以降は $request->user() で取れる
        } catch (\Throwable $e) {
            abort(401, 'Invalid token');
        }

        return $next($request);
    }
}

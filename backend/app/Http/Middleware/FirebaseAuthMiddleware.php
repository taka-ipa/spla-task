<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Kreait\Firebase\JWT\IdTokenVerifier;

class FirebaseAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $idToken = $request->bearerToken();
        if (!$idToken) {
            return response()->json(['message' => 'Missing bearer token'], 401);
        }

        // ① IDトークン検証（ここだけ401）
        try {
            $verifier = IdTokenVerifier::createWithProjectId(env('FIREBASE_PROJECT_ID'));
            $token    = $verifier->verifyIdToken($idToken);
        } catch (\Throwable $e) {
            Log::error('firebase-login verify failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Invalid Firebase token'], 401);
        }

        // ② claims 抽出
        [$uid, $email, $claims] = $this->extractClaimsStrong($token, $idToken);
        Log::info('firebase-login claims', ['uid' => $uid, 'email' => $email, 'claims' => $claims]);

        if (!$uid) {
            return response()->json(['message' => 'Firebase UID not found'], 401);
        }

        // ③ DB操作（失敗は500）
        try {
            $user = User::where('firebase_uid', $uid)->first();
            if (!$user && $email) {
                $user = User::where('email', $email)->first();
            }

            if ($user) {
                if (empty($user->firebase_uid)) {
                    $user->firebase_uid = $uid;
                    $user->save();
                }
            } else {
                $user = User::create([
                    'firebase_uid' => $uid,
                    'email'        => $email,
                    'name'         => $email ? strtok($email, '@') : 'FirebaseUser',
                    'password'     => bcrypt(str()->random(40)),
                ]);
            }

            Auth::login($user, true);
        } catch (\Throwable $e) {
            Log::error('firebase-login user attach failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Login failed'], 500);
        }

        return $next($request);
    }

    private function extractClaimsStrong(object $token, string $raw): array
    {
        $uid = null; $email = null; $all = [];

        if (method_exists($token, 'claims')) {
            $c = $token->claims();
            if (is_object($c) && method_exists($c, 'get')) {
                $uid   = $c->get('sub') ?? $c->get('user_id') ?? $c->get('uid');
                $email = $c->get('email');
                $all   = method_exists($c, 'all') ? ($c->all() ?? []) : $all;
                if ($uid) return [$uid, $email, $all];
            }
            if (is_array($c)) {
                $uid   = $c['sub'] ?? $c['user_id'] ?? $c['uid'] ?? null;
                $email = $c['email'] ?? null;
                $all   = $c;
                if ($uid) return [$uid, $email, $all];
            }
        }

        if (method_exists($token, 'getClaim')) {
            try {
                $uid   = $token->getClaim('sub') ?? $token->getClaim('user_id') ?? $token->getClaim('uid');
                $email = $token->getClaim('email');
                if ($uid) return [$uid, $email, $all];
            } catch (\Throwable $e) {}
        }

        $parts = explode('.', $raw);
        if (count($parts) === 3) {
            $replaced = strtr($parts[1], '-_', '+/');
            $padded   = $replaced . str_repeat('=', (4 - strlen($replaced) % 4) % 4);
            $json     = base64_decode($padded, true);
            $payload  = $json ? json_decode($json, true) : [];
            if ($payload) {
                $uid   = $uid   ?? ($payload['sub'] ?? $payload['user_id'] ?? $payload['uid'] ?? null);
                $email = $email ?? ($payload['email'] ?? null);
                $all   = $payload;
            }
        }

        return [$uid, $email, $all];
    }
}

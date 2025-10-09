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

    // ① IDトークン検証（401のみ返す）
    try {
        // プロジェクトIDは.envから必須
        $projectId = env('FIREBASE_PROJECT_ID');
        if (!$projectId) {
            // 設定不備はサーバ側の問題なので500にするのが本来だが、
            // 運用を優先して401でも可。ここでは500にしておく。
            return response()->json(['message' => 'Server misconfigured (FIREBASE_PROJECT_ID)'], 500);
        }

        $verifier = IdTokenVerifier::createWithProjectId($projectId);
        $tokenObj = $verifier->verifyIdToken($idToken); // 署名/iss/aud/exp等も検証される

    } catch (\Throwable $e) {
        // 検証失敗は401
        \Log::warning('firebase idToken verify failed', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Invalid Firebase token'], 401);
    }

    // ② claims 抽出（堅牢関数そのまま活用）
    [$uid, $email, $claims] = $this->extractClaimsStrong($tokenObj, $idToken);
    if (!$uid) {
        return response()->json(['message' => 'Firebase UID not found'], 401);
    }

    // 任意：メール未検証ユーザーを弾きたい場合
    // if (($claims['email_verified'] ?? false) !== true) {
    //     return response()->json(['message' => 'Email not verified'], 403);
    // }

    // ③ ユーザーJIT & ログイン（DB/認証エラーは500）
    try {
        // 既存優先：firebase_uid → email
        $user = User::where('firebase_uid', $uid)->first();
        if (!$user && $email) {
            $user = User::where('email', $email)->first();
        }

        if ($user) {
            // 片付け：firebase_uid が空なら紐付け
            if (empty($user->firebase_uid)) {
                $user->firebase_uid = $uid;
                $user->save();
            }
        } else {
            $user = User::create([
                'firebase_uid' => $uid,
                'email'        => $email,
                // displayName 相当が token の name に載ることがある
                'name'         => $claims['name'] ?? ($email ? strtok($email, '@') : 'FirebaseUser'),
                'password'     => bcrypt(str()->random(40)), // ダミー
            ]);
        }

        Auth::login($user, true); // remember=true
        // 任意：明示的にガード指定したいなら Auth::guard('web')->login($user, true);

    } catch (\Throwable $e) {
        \Log::error('firebase-login user attach failed', ['error' => $e->getMessage()]);
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

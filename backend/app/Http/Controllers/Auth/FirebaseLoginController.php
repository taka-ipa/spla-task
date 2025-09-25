<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;

class FirebaseLoginController extends Controller
{
    public function login(Request $request)
    {
        // ミドルウェアで詰めた情報を取り出す（キー名は環境に合わせて）
        $claims = $request->attributes->get('firebase_claims'); // 推奨: 全クレーム
        $uid    = data_get($claims, 'uid') ?? $request->attributes->get('firebase_uid');
        $email  = data_get($claims, 'email') ?? $request->input('email'); // email無いケースもある
        $emailVerified = (bool) data_get($claims, 'email_verified');

        if (!$uid) {
            return response()->json(['message' => 'Firebase UID not found'], 401);
        }

        // 1) firebase_uid で紐付け
        $user = User::where('firebase_uid', $uid)->first();

        // 2) なければ email で既存ユーザーと紐付け（同一人物の初回ログイン想定）
        if (!$user && $email) {
            $user = User::where('email', $email)->first();
        }

        // 3) なければ新規作成（方針：自動作成）
        if (!$user) {
            $user = User::create([
                'firebase_uid'      => $uid,
                'name'              => $email ? Str::before($email, '@') : ('user_' . Str::random(8)),
                'email'             => $email ?? (Str::uuid().'@no-email.example'), // email無い対応
                'email_verified_at' => $emailVerified ? Carbon::now() : null,
                'password'          => bcrypt(Str::random(32)), // 使わないけど必須のため
            ]);
        } else {
            // 既存ユーザーの情報を最新に寄せる（任意）
            $dirty = false;
            if (!$user->firebase_uid) { $user->firebase_uid = $uid; $dirty = true; }
            if ($email && !$user->email) { $user->email = $email; $dirty = true; }
            if ($emailVerified && !$user->email_verified_at) { $user->email_verified_at = Carbon::now(); $dirty = true; }
            if ($dirty) { $user->save(); }
        }

        // セッションログイン（webミドルウェア配下なので有効）
        Auth::login($user, true);

        // フロントは `withCredentials: true` で受け取る（Set-Cookie: laravel_session）
        return response()->json([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
        ], 200);
    }
}
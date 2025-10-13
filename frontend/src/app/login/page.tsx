"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login as loginLaravel } from "@/lib/laravelAuth";
import { authAdapter } from "@/lib/GoogleAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();

  const rawNext = sp?.get("next");
  const nextPath =
    typeof rawNext === "string" && rawNext.startsWith("/") ? rawNext : "/dashboard";

  // メール/パスワードログイン
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (process.env.NEXT_PUBLIC_AUTH_PROVIDER === "firebase") {
        await authAdapter.signIn(email, password); // Firebaseログイン＋Laravelリンク済み
        router.push(nextPath);
      } else {
        await loginLaravel(email, password);
        router.push(nextPath);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "ログインに失敗しました";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Googleログイン
  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await authAdapter.signInWithGoogle(); // 同じく内部でLaravelリンク
      router.push(nextPath);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Googleログインに失敗しました";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 border rounded-2xl space-y-4">
      <h1 className="text-xl font-semibold">ログイン</h1>

      {/* Googleボタン */}
      {process.env.NEXT_PUBLIC_AUTH_PROVIDER === "firebase" && (
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full px-4 py-2 rounded-2xl border"
        >
          {loading ? "処理中…" : "Googleでログイン"}
        </button>
      )}

      {/* メール/パスワードフォーム */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded-2xl"
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded-2xl"
          autoComplete="current-password"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-2xl bg-blue-600 text-white"
        >
          {loading ? "送信中…" : "ログイン"}
        </button>
      </form>
    </div>
  );
}

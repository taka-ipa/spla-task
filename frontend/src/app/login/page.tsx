"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login as loginLaravel } from "@/lib/laravelAuth"; // Laravelログイン用
import { authAdapter } from "@/lib/GoogleAuth";           // 👈 ここでimport
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const hydrate = useAuthStore((s) => s.hydrate);

  const rawNext = sp?.get("next");
  const nextPath =
    typeof rawNext === "string" && rawNext.startsWith("/") ? rawNext : "/dashboard";

  const goNext = async () => {
    await hydrate();  // /api/user -> store に反映
    router.push(nextPath);
  };

  // メール/パスワードログイン
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (process.env.NEXT_PUBLIC_AUTH_PROVIDER === "firebase") {
        await authAdapter.signIn(email, password);
        router.push(nextPath); // ここだけでOK！
      } else {
        await loginLaravel(email, password);
        await goNext(); // Laravelの時だけhydrate()必要
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "ログインに失敗しました";
      setError(msg);
    }
  };

  // Googleログイン
  const handleGoogle = async () => {
    setError("");
    try {
      await authAdapter.signInWithGoogle();
      router.push(nextPath);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Googleログインに失敗しました";
      setError(msg);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 border rounded space-y-4">
      <h1 className="text-xl">ログイン</h1>

      {/* Googleボタン */}
      {process.env.NEXT_PUBLIC_AUTH_PROVIDER === "firebase" && (
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full bg-red-500 text-white px-4 py-2 rounded"
        >
          Googleでログイン
        </button>
      )}

      {/* メール/パスワード用フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          autoComplete="current-password"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}

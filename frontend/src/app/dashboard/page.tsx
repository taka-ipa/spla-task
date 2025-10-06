"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { api } from "@/lib/api";

type Me = { id: number; email?: string | null; /* 必要に応じて */ };

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // 未ログインは /login へ
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // ログイン済みなら /api/user 取得
  useEffect(() => {
    if (!loading && user) {
      api.get("/api/user")
        .then((res) => setMe(res.data))
        .catch((e) => setErr(e?.response?.data?.message || "取得に失敗しました"));
    }
  }, [loading, user]);

  if (loading || (!user && !err)) return <div className="p-4">読み込み中…</div>;
  if (err) return <div className="p-4 text-red-600">エラー: {err}</div>;
  if (!me) return <div className="p-4">ユーザー情報取得中…</div>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      <p>ようこそ！ユーザーID: {me.id}</p>
      {/* ここにカードやグラフなど足していく */}
    </main>
  );
}

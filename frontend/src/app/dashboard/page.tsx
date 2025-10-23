"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { api } from "@/lib/api";
import { Me } from "@/types/user";

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

  // ★ 表示名の決定ロジック（優先度：Firebase → Laravel name → Laravel email）
  const displayName = useMemo(() => {
    return (
      user?.displayName ||
      me?.name ||
      me?.email ||
      "ゲスト"
    );
  }, [user?.displayName, me?.name, me?.email]);

  if (loading || (!user && !err)) return <div className="p-4">読み込み中…</div>;
  if (err) return <div className="p-4 text-red-600">エラー: {err}</div>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      <p className="text-lg">ようこそ、<span className="font-semibold">{displayName}</span> さん！</p>
    </main>
  );
}

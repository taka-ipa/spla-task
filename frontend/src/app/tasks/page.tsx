"use client";

import { useEffect, useState } from "react";
import { listTasks, createTask, deleteTask } from "@/lib/apiTasks";
import type { Task } from "@/types/task";
import { toast } from "sonner";

export default function TasksPage() {
  const [items, setItems] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // 追加ボタンのローディング
  const [loading, setLoading] = useState(false);

  // 初回ロード
  const load = async () => {
    try {
      const data = await listTasks();
      setItems(data);
      setErr(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "取得失敗";
      setErr(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 追加
  const add = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const t = await createTask({ title, is_active: true });
      setItems((prev) => [t, ...prev]);
      setTitle("");
      setErr(null);
      toast.success("タスクを追加しました 🎉");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "作成失敗";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 削除（オプティミスティック→失敗したら戻す）
  const remove = async (id: number) => {
    const prev = items;
    setItems(prev.filter((x) => x.id !== id)); // optimistic
    try {
      await deleteTask(id);
      toast.success("タスクを削除しました");
    } catch (e) {
      setItems(prev); // rollback
      toast.error("削除に失敗しました");
    }
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">課題</h1>

      {/* 入力＋追加ボタン（スピナー対応） */}
      <div className="flex gap-2">
        <input
          className="border p-2 rounded-2xl flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="課題名"
          disabled={loading} // 追加中は入力ロック
        />
        <button
          onClick={add}
          disabled={loading}
          className="px-4 py-2 rounded-2xl border flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                aria-label="loading"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>追加中…</span>
            </>
          ) : (
            "追加"
          )}
        </button>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      <ul className="space-y-2">
        {items.map((t) => (
          <li
            key={t.id}
            className="border rounded-2xl px-3 py-2 flex justify-between"
          >
            <span>{t.title}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-sm underline"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

'use client';

import { useEffect, useState } from "react";
import { useTodayTasks } from "@/hooks/useTodayTasks";
import { RatingButtons } from "@/components/RatingButtons";

type Flash = { message: string; key: number } | null;

export default function TodayPage() {
  const { items, loading, err, savingTaskId, saveRating } = useTodayTasks();
  const [flash, setFlash] = useState<Flash>(null);

  // トーストを3秒で消す
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  const handleChange = (taskId: number, r: "maru" | "sankaku" | "batsu" | null) => {
    saveRating(taskId, r)
      .then((result) => {
        if (result === "noop") return;
        const msg =
          result === "created"
            ? "保存しました"
            : result === "updated"
            ? "更新しました"
            : "未選択に戻しました";
        setFlash({ message: msg, key: Date.now() });
      })
      .catch(() => {
        alert("保存に失敗しました。もう一度お試しください。");
      });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6 text-red-600">
        今日の課題を取得できませんでした。時間をおいて再度お試しください。
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <div className="p-6">課題がまだありません。まずは課題を登録してね。</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">今日の課題一覧</h1>

      <ul className="grid gap-3">
        {items.map((it) => {
          const disabled = savingTaskId === it.taskId;
          return (
            <li
              key={it.taskId}
              className="flex items-center justify-between rounded-2xl border p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{it.icon ?? "📝"}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{it.title}</span>
                  <span className="text-xs text-gray-500">ID: {it.taskId}</span>
                </div>
              </div>

              <RatingButtons
                value={it.rating}
                disabled={disabled}
                onChange={(r) =>
                  saveRating(it.taskId, r).catch(() =>
                    alert("保存に失敗しました。もう一度お試しください。")
                  )
                }
              />
            </li>
          );
        })}
      </ul>

      {/* 成功トースト */}
      {flash && (
        <div
          key={flash.key}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <span className="mr-2">✅</span>
          <span className="font-medium">{flash.message}</span>
        </div>
      )}
    </div>
  );
}

'use client';

import { useTodayTasks } from "@/hooks/useTodayTasks";
import { RatingButtons } from "@/components/RatingButtons";

export default function TodayPage() {
  const { items, loading, err, savingTaskId, saveRating } = useTodayTasks();

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
    </div>
  );
}

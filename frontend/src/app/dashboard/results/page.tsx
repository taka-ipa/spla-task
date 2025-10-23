"use client";

import { useEffect, useMemo, useState } from "react";
import { listTasks } from "@/lib/apiTasks";
import { createTaskResult, type Rating, listTaskResultsByDate } from "@/lib/apiTaskResults";
import type { Task } from "@/types/task";
import { toast } from "sonner";

const RATING_LABEL: Record<Rating, string> = {
  circle: "○",
  triangle: "△",
  cross: "×",
};

export default function TodayResultsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ratings, setRatings] = useState<Record<number, Rating | null>>({});
  const [loading, setLoading] = useState(false);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    (async () => {
      const t = await listTasks();
      setTasks(t);
      // 既存評価があれば初期反映
      const existing = await listTaskResultsByDate(today);
      const map: Record<number, Rating | null> = {};
      for (const r of existing) map[r.task_id] = r.rating;
      setRatings(map);
    })();
  }, [today]);

  const set = (taskId: number, value: Rating) => {
    setRatings(prev => ({ ...prev, [taskId]: value }));
  };

  const save = async () => {
    setLoading(true);
    try {
      const promises = Object.entries(ratings)
        .filter(([, v]) => !!v)
        .map(([taskId, rating]) =>
          createTaskResult({ task_id: Number(taskId), rating: rating as Rating, date: today })
        );
      await Promise.all(promises);
      toast.success("今日の評価を保存しました");
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">今日の評価（{today}）</h1>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="border rounded-2xl px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{t.title}</span>
              <div className="flex gap-2">
                {(["circle", "triangle", "cross"] as Rating[]).map((r) => {
                  const active = ratings[t.id] === r;
                  return (
                    <button
                      key={r}
                      onClick={() => set(t.id, r)}
                      className={`px-3 py-1 rounded-2xl border min-w-12 text-center ${
                        active ? "bg-blue-600 text-white" : "bg-white"
                      }`}
                    >
                      {RATING_LABEL[r]}
                    </button>
                  );
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={save}
        disabled={loading}
        className="px-4 py-2 rounded-2xl border disabled:opacity-60"
      >
        {loading ? "保存中…" : "保存"}
      </button>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { listTasks } from "@/lib/apiTasks";
import { listTaskResultsByDate } from "@/lib/apiTaskResults";
import type { Task } from "@/types/task";

export default function HistoryPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [results, setResults] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { listTasks().then(setTasks); }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listTaskResultsByDate(date);
        const map: Record<number, string> = {};
        for (const r of data) map[r.task_id] = r.rating; // "circle"/"triangle"/"cross"
        setResults(map);
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  const symbol = (r?: string) => (r === "circle" ? "○" : r === "triangle" ? "△" : r === "cross" ? "×" : "—");

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">評価履歴</h1>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-2xl px-3 py-2"
        />
        {loading && <span className="text-sm text-gray-500">読み込み中…</span>}
      </div>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="border rounded-2xl px-3 py-2 flex justify-between">
            <span>{t.title}</span>
            <span className="font-bold">{symbol(results[t.id])}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

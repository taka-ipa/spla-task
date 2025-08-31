'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchTasks, fetchTaskResultsByDate } from '@/lib/api';
import { todayJST } from '@/lib/date';
import type { Task, TaskResult, Rating } from '@/lib/types';

type TodayItem = {
  taskId: number;
  title: string;
  icon?: string | null;
  rating: Rating; // 今日の評価（なければnull）
  resultId?: number; // 既存レコードがある場合
};

export function useTodayTasks() {
  const [items, setItems] = useState<TodayItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<unknown>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const date = todayJST();
        const [results, tasks] = await Promise.all([
          fetchTaskResultsByDate(date),
          // 結果にtaskが含まれるなら空配列を返してもOK。
          // でもAPIを決め切ってない間は両方取ってマージが安全。
          fetchTasks().catch(() => [] as Task[]),
        ]);

        // 結果に task オブジェクトが含まれるか判定
        const resultsHaveTask = results.length > 0 && (results as any)[0]?.task;

        let base: TodayItem[];
        if (resultsHaveTask) {
          base = (results as (TaskResult & { task: Task })[]).map(r => ({
            taskId: r.task_id,
            title: r.task.title,
            icon: r.task.icon,
            rating: r.rating,
            resultId: r.id,
          }));
        } else {
          // 全タスク × 今日の結果を突合
          const resultByTaskId = new Map<number, TaskResult>();
          results.forEach(r => resultByTaskId.set(r.task_id, r));

          base = (tasks as Task[]).map(t => {
            const hit = resultByTaskId.get(t.id);
            return {
              taskId: t.id,
              title: t.title,
              icon: t.icon,
              rating: hit?.rating ?? null,
              resultId: hit?.id,
            };
          });
        }

        // 表示順：未評価→○→△→× のように並べたい場合（任意）
        const order = { null: 0, maru: 1, sankaku: 2, batsu: 3 } as const;
        base.sort((a, b) => (order[String(a.rating) as keyof typeof order] - order[String(b.rating) as keyof typeof order])
          || a.taskId - b.taskId);

        setItems(base);
      } catch (e) {
        setErr(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { items, loading, err };
}

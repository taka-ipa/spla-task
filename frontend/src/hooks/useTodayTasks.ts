// src/hooks/useTodayTasks.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  fetchTasks,
  fetchTaskResultsByDate,
  postTaskResult,
  updateTaskResult,
} from '@/lib/api';
import { todayJST } from '@/lib/date';
import type { Task, TaskResult, Rating } from '@/lib/types';

export type TodayItem = {
  taskId: number;
  title: string;
  icon?: string | null;
  rating: Rating;       // 'maru' | 'sankaku' | 'batsu' | null
  resultId?: number;    // 既存レコードがある場合
};

export function useTodayTasks() {
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<unknown>(null);
  const [savingTaskId, setSavingTaskId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const date = todayJST();
        const [results, tasks] = await Promise.all([
          fetchTaskResultsByDate(date),
          // 結果に task が含まれない場合に備えて全タスク取得
          fetchTasks().catch(() => [] as Task[]),
        ]);

        const resultsHaveTask = results.length > 0 && (results as any)[0]?.task;
        let base: TodayItem[];

        if (resultsHaveTask) {
          base = (results as (TaskResult & { task: Task })[]).map((r) => ({
            taskId: r.task_id,
            title: r.task.title,
            icon: r.task.icon,
            rating: r.rating,
            resultId: r.id,
          }));
        } else {
          const map = new Map<number, TaskResult>();
          results.forEach((r) => map.set(r.task_id, r));
          base = (tasks as Task[]).map((t) => {
            const hit = map.get(t.id);
            return {
              taskId: t.id,
              title: t.title,
              icon: t.icon,
              rating: hit?.rating ?? null,
              resultId: hit?.id,
            };
          });
        }

        // 任意：未評価→○→△→× の順で表示
        const order = { null: 0, maru: 1, sankaku: 2, batsu: 3 } as const;
        base.sort(
          (a, b) =>
            order[String(a.rating) as keyof typeof order] -
              order[String(b.rating) as keyof typeof order] ||
            a.taskId - b.taskId
        );

        setItems(base);
      } catch (e) {
        setErr(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** ○△×保存（同じボタン再クリックで null に戻す＝トグル） */
  const saveRating = useCallback(
    async (taskId: number, next: Rating) => {
      const target = items.find((i) => i.taskId === taskId);
      if (!target) return;

      // トグル：同じ値なら未選択(null)へ
      const newRating: Rating = target.rating === next ? null : next;

      // 楽観更新
      const prev = items;
      const optimistic = items.map((i) =>
        i.taskId === taskId ? { ...i, rating: newRating } : i
      );
      setItems(optimistic);
      setSavingTaskId(taskId);

      try {
        if (target.resultId) {
          // 既存レコード → 更新（null も許容）
          await updateTaskResult(target.resultId, newRating);
        } else {
          // 新規作成：未選択(null)は送らない
          if (newRating !== null) {
            const created = await postTaskResult({
              task_id: taskId,
              date: todayJST(),
              rating: newRating,
            });
            // 作成された result の id を反映
            setItems((cur) =>
              cur.map((i) =>
                i.taskId === taskId ? { ...i, resultId: created.id } : i
              )
            );
          }
        }
      } catch (e) {
        // 失敗したら元に戻す
        setItems(prev);
        throw e;
      } finally {
        setSavingTaskId(null);
      }
    },
    [items]
  );

  return { items, loading, err, savingTaskId, saveRating };
}

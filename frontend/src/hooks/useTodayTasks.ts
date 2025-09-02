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
  rating: Rating;        // 'maru' | 'sankaku' | 'batsu' | null
  resultId?: number;     // 既存レコードがある場合
};

export type SaveResult = 'created' | 'updated' | 'cleared' | 'noop';

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
  const saveRating: (taskId: number, next: Rating) => Promise<SaveResult> =
    useCallback(async (taskId, next) => {
      const target = items.find((i) => i.taskId === taskId);
      if (!target) return 'noop';

      const newRating: Rating = target.rating === next ? null : next;

      // 新規で未選択 → noop
      if (target.resultId == null && newRating === null) {
        return 'noop';
      }

      const prev = items;
      const optimistic = items.map((i) =>
        i.taskId === taskId ? { ...i, rating: newRating } : i
      );
      setItems(optimistic);
      setSavingTaskId(taskId);

      try {
        if (target.resultId) {
          await updateTaskResult(target.resultId, newRating);
          return newRating === null ? 'cleared' : 'updated';
        } else {
          const created = await postTaskResult({
            task_id: taskId,
            date: todayJST(),
            rating: newRating as Exclude<Rating, null>,
          });
          setItems((cur) =>
            cur.map((i) =>
              i.taskId === taskId ? { ...i, resultId: created.id } : i
            )
          );
          return 'created';
        }
      } catch (e) {
        setItems(prev); // ロールバック
        throw e;
      } finally {
        setSavingTaskId(null);
      }
    }, [items]);

  return { items, loading, err, savingTaskId, saveRating };
}

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
import { upsertTaskResult } from '@/lib/api';

export type TodayItem = {
  taskId: number;
  title: string;
  icon?: string | null;
  rating: Rating;        // 'maru' | 'sankaku' | 'batsu' | null
  resultId?: number;     // 既存レコードがある場合
};

export type SaveResult = 'created' | 'updated' | 'cleared' | 'noop';

function isArray(a: unknown): a is any[] {
  return Array.isArray(a);
}

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
        const results = await fetchTaskResultsByDate(date);

        if (!isArray(results)) {
          throw new Error('task-results response is not an array');
        }

        // ▼ shape 判定
        // A) バックエンドが task 同梱: { id?, task_id, rating, task:{title,icon} }
        // B) フロント用まとめレスポンス: { task_id, title, icon, result_id?, rating }
        const first = results[0] ?? {};
        const hasInlineTask = !!(first as any)?.task;
        const hasFlatTitle = typeof (first as any)?.title === 'string';

        let base: TodayItem[];

        if (hasInlineTask) {
          // A) task 同梱
          base = (results as (TaskResult & { task: Task })[]).map((r) => ({
            taskId: r.task_id,
            title: r.task.title,
            icon: r.task.icon,
            rating: r.rating ?? null,
            // id があるはずだが無い実装も考慮
            resultId: (r as any)?.id ?? (r as any)?.result_id ?? undefined,
          }));
        } else if (hasFlatTitle) {
          // B) すでに {title, icon, result_id, rating} がフラットで返る
          base = (results as any[]).map((r) => ({
            taskId: Number(r.task_id),
            title: String(r.title ?? '（無題）'),
            icon: r.icon ?? null,
            rating: (r.rating ?? null) as Rating,
            resultId: typeof r.result_id === 'number' ? r.result_id : (typeof r.id === 'number' ? r.id : undefined),
          }));
        } else {
          // C) 古い形（結果のみ）→ /api/tasks と突合
          const tasks = await fetchTasks().catch(() => [] as Task[]);
          const map = new Map<number, TaskResult>();
          (results as TaskResult[]).forEach((r) => map.set(r.task_id, r));
          base = tasks.map((t) => {
            const hit = map.get(t.id) as any;
            return {
              taskId: t.id,
              title: t.title,
              icon: t.icon,
              rating: (hit?.rating ?? null) as Rating,
              resultId: (hit?.id ?? hit?.result_id) as number | undefined,
            };
          });
        }

        // 表示順：未評価→○→△→×
        const order = { null: 0, maru: 1, sankaku: 2, batsu: 3 } as const;
        base.sort((a, b) => {
          const oa = order[String(a.rating) as keyof typeof order] ?? 0;
          const ob = order[String(b.rating) as keyof typeof order] ?? 0;
          return oa - ob || a.taskId - b.taskId;
        });

        setItems(base);
      } catch (e) {
        console.error('[useTodayTasks] fetch error:', e);
        setErr(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** ○△×保存（同じボタン再クリックで null＝未選択に戻す） */
  const saveRating: (taskId: number, next: Rating) => Promise<SaveResult> =
  useCallback(async (taskId, next) => {
    const target = items.find((i) => i.taskId === taskId);
    if (!target) return 'noop';

    const newRating: Rating = target.rating === next ? null : next;
      // 変更が無い → 何もしない

      // 新規で未選択 → 何もしない
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
      if (target.resultId != null) {
        // まずは id での PUT を試す
        try {
          await updateTaskResult(target.resultId, newRating);
        } catch (e: any) {
          const status = e?.response?.status;
          // 404 or 405 → id更新ルートが無い or 禁止 → POSTでアップサートに切替
          if (status === 404 || status === 405) {
            await upsertTaskResult({
              task_id: taskId,
              date: todayJST(),
              rating: newRating,
            });
          } else {
            throw e;
          }
        }
        return newRating === null ? 'cleared' : 'updated';
        } else {
          // もともと resultId が無いなら POST（アップサート）
          const created = await upsertTaskResult({
            task_id: taskId,
            date: todayJST(),
            rating: newRating as Exclude<Rating, null>,
          });

          // id / result_id どちらでも対応
          const newId =
            (created as any)?.id ??
            (created as any)?.result_id ??
            undefined;

          setItems((cur) =>
            cur.map((i) =>
              i.taskId === taskId ? { ...i, resultId: newId } : i
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

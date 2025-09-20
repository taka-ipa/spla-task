import type { TaskResultsSummaryResponse } from '@/types/summary';

export function toCountsPerTask(data: TaskResultsSummaryResponse) {
  // 円グラフや積み上げ棒に使える形
  return data.summary.map(s => ({
    taskId: s.task_id,
    maru: s.counts.maru,
    sankaku: s.counts.sankaku,
    batsu: s.counts.batsu,
    total: s.counts.total,
  }));
}

export function toRatePerTask(data: TaskResultsSummaryResponse) {
  // 達成率（0〜100）
  return data.summary.map(s => ({
    taskId: s.task_id,
    ratePct: Math.round(s.achieveRate * 100),
    total: s.counts.total,
  }));
}
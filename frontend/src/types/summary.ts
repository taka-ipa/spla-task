export type TaskSummaryItem = {
  task_id: number;
  counts: { maru: number; sankaku: number; batsu: number; total: number };
  achieveRate: number; // 0〜1
};

export type TaskResultsSummaryResponse = {
  range: { from?: string; to?: string };
  summary: TaskSummaryItem[];
};
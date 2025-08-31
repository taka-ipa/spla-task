export type Rating = 'maru' | 'sankaku' | 'batsu' | null;

export interface Task {
  id: number;
  title: string;
  icon?: string | null; // 絵文字など
  // ほか必要なら追加
}

export interface TaskResult {
  id: number;
  task_id: number;
  date: string; // '2025-08-31'
  rating: Rating;
  // もしAPIがタスク情報を含むなら: task?: Task;
}

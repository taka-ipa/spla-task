export type TaskResult = {
  id: number;
  user_id: number;
  task_id: number;
  date: string;   // 'YYYY-MM-DD'
  rating: "o" | "d" | "x";
  created_at: string;
  updated_at: string;
};
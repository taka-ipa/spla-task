import { api } from "./api";
import type { Task } from "@/types/task";

export async function listTasks(): Promise<Task[]> {
  const { data } = await api.get("/api/tasks", { withCredentials: true });

  // 👇 ここでレスポンスの全体を確認できる！
  console.log("🚀 /api/tasks response:", data);

  return data.data;
}
export async function createTask(payload: { title: string; icon?: string|null }): Promise<Task> {
  const { data } = await api.post("/api/tasks", payload, { withCredentials: true });
  return data;
}
export async function updateTask(id: number, payload: Partial<{ title: string; icon: string|null }>): Promise<Task> {
  const { data } = await api.put(`/api/tasks/${id}`, payload, { withCredentials: true });
  return data;
}
export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/api/tasks/${id}`, { withCredentials: true });
}

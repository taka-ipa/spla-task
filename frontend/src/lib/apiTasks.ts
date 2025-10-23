import { api } from "./api";
import type { Task } from "@/types/task";

/** APIの生データを Task 形に正規化 */
const normalizeTask = (t: any): Task => ({
  id: Number(t?.id),
  title: t?.title ?? "",
  is_active: Boolean(t?.is_active),
  // ↓ Task型に無いなら削ってOK（icon/notes/created_at等）
  icon: t?.icon ?? null,
  notes: t?.notes ?? null,
  created_at: t?.created_at ?? null,
  updated_at: t?.updated_at ?? null,
});

/** レスポンスから配列部分を安全に取り出す（paginate or array両対応） */
const pickArray = (res: any): any[] => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data; // { data: [...] } (Resource + paginate)
  return []; // 想定外でも落ちない
};

/** レスポンスから単体オブジェクトを安全に取り出す（Resource/非Resource両対応） */
const pickObject = (res: any): any => {
  const d = res?.data;
  return d?.data ?? d; // { data: {...} } or {...}
};

export async function listTasks(params?: {
  is_active?: boolean;
  page?: number;
  per_page?: number;
}): Promise<Task[]> {
  const res = await api.get("/api/tasks", {
    params,
    withCredentials: true,
  });
  return pickArray(res).map(normalizeTask);
}

export async function createTask(payload: {
  title: string;
  is_active?: boolean;
  icon?: string | null;
  notes?: string | null;
}): Promise<Task> {
  const res = await api.post("/api/tasks", payload, { withCredentials: true });
  return normalizeTask(pickObject(res));
}

export async function updateTask(
  id: number,
  payload: Partial<{ title: string; is_active: boolean; icon: string | null; notes: string | null }>
): Promise<Task> {
  const res = await api.put(`/api/tasks/${id}`, payload, { withCredentials: true });
  return normalizeTask(pickObject(res));
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/api/tasks/${id}`, { withCredentials: true });
}
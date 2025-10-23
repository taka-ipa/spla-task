import { api } from "./api";

export type Rating = "circle" | "triangle" | "cross";

export async function listTaskResultsByDate(date: string) {
  const res = await api.get("/api/task-results", {
    params: { date },
    withCredentials: true,
  });
  // { data: [{ task_id, rating, ... }], ... } 前提
  return Array.isArray(res.data?.data) ? res.data.data : res.data;
}

export async function createTaskResult(input: { task_id: number; rating: Rating; date?: string }) {
  const res = await api.post("/api/task-results", input, { withCredentials: true });
  return res.data?.data ?? res.data;
}

export async function getSummary() {
  const res = await api.get("/api/task-results/summary", { withCredentials: true });
  return res.data?.data ?? res.data; // [{ title, success, total }]
}

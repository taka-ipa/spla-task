import axios, { AxiosError } from "axios";
import { authAdapter } from "@/lib/GoogleAuth"; // ★ 追加：FirebaseのIDトークン取得に使う
import type { Task, TaskResult, Rating } from "./types";
import type { TaskResultsSummaryResponse } from "@/types/summary";

/** ====== 環境切替（Firebase or Laravel） ====== */
const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? "laravel"; // 'firebase' | 'laravel'

/** ====== Axios 基本設定 ====== */
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8000";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? BASE_URL,
  // FirebaseはBearerで自己完結 → Cookie不要、LaravelはCookieありの可能性 → withCredentials切替
  withCredentials: AUTH_PROVIDER !== "firebase",
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 15_000,
});

/** ====== 認証トークン 管理（Laravelローカルトークン用） ====== */
const TOKEN_KEY = "token";

export function setAuthToken(token: string) {
  if (AUTH_PROVIDER === "firebase") {
    // FirebaseモードではlocalStorageは使わない（IDトークンは毎回取得）
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
  if (AUTH_PROVIDER !== "firebase" && typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
  delete api.defaults.headers.common.Authorization;
}

// 起動時：localStorageにトークンがあれば即セット（Laravelモードのみ）
if (AUTH_PROVIDER !== "firebase" && typeof window !== "undefined") {
  const saved = localStorage.getItem(TOKEN_KEY);
  if (saved) api.defaults.headers.common.Authorization = `Bearer ${saved}`;
}

/** ====== インターセプタ ====== */
api.interceptors.request.use(async (config) => {
  if (AUTH_PROVIDER === "firebase") {
  let idToken = await authAdapter.getIdToken();
  if (!idToken) {
    // 直後は currentUser がまだ乗らない事があるので少し待って再取得
    await new Promise(r => setTimeout(r, 200));
    idToken = await authAdapter.getIdToken();
  }

  config.headers = config.headers ?? {};
  if (idToken) {
    config.headers.Authorization = `Bearer ${idToken}`;
  } else {
    delete (config.headers as any).Authorization;
  }
}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    const status = error.response?.status;

    if (status === 401) {
      // 未認証 → トークン破棄してログインへ
      clearAuthToken();
      if (typeof window !== "undefined") {
        const next = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = `/login?next=${next}`;
        }
      }
    }
    // 403: 権限なし → UI側でメッセ表示を想定
    // 419: セッション/トークン期限切れの類 → UI側で再ログイン促し
    // 422: バリデーション → normalizeApiErrorで整形してUIへ
    return Promise.reject(error);
  }
);

/** ====== エラー整形（UIで使いやすく） ====== */
export function normalizeApiError(err: unknown): {
  status?: number;
  message: string;
  details?: Record<string, string[]>;
} {
  if (!axios.isAxiosError(err)) return { message: "不明なエラーが発生しました。" };

  const status = err.response?.status;
  const data: any = err.response?.data ?? {};
  const details =
    data?.errors && typeof data.errors === "object" ? data.errors : undefined;

  let message =
    data?.message ||
    (status === 0
      ? "ネットワークエラー：サーバーに到達できません。"
      : `エラーが発生しました（${status}）`);

  if (status === 401) message = "認証が切れました。再ログインしてください。";
  if (status === 403) message = "権限がありません。";
  if (status === 404) message = "存在しないリソースです。";
  if (status === 422 && !data?.message) message = "入力内容を確認してください。";
  if (status === 419) message = "セッション期限が切れました。再ログインしてください。";

  return { status, message, details };
}

/** ====== エンドポイント呼び出しラッパ ====== */
// 1) 課題一覧（アイコンなど含む想定）
export async function fetchTasks(): Promise<Task[]> {
  const { data } = await api.get("/api/tasks");
  return data;
}

// 2) 指定日（JSTのYYYY-MM-DD推奨）の結果一覧
export async function fetchTaskResultsByDate(date: string): Promise<TaskResult[]> {
  const { data } = await api.get("/api/task-results", { params: { date } });
  return data;
}

// 3) 今日の○△×を新規保存（存在しない場合）
export async function postTaskResult(params: {
  task_id: number;
  date: string; // 'YYYY-MM-DD'
  rating: Rating; // 'maru' | 'sankaku' | 'batsu'
}): Promise<TaskResult> {
  const { data } = await api.post("/api/task-results", params);
  return data;
}

// 4) 既存レコードを更新（resultIdがある時）
export async function updateTaskResult(
  resultId: number,
  rating: Rating
): Promise<TaskResult> {
  const { data } = await api.put(`/api/task-results/${resultId}`, { rating });
  return data;
}

// 追加: task_id + date で更新するAPI（あなたのバックエンドに合わせて）
export async function upsertTaskResult(params: {
  task_id: number;
  date: string;
  rating: Rating; // null もそのまま送る（サーバが許容するならクリア扱い）
}): Promise<TaskResult> {
  const { data } = await api.post("/api/task-results", params);
  return data;
}

// 5) 課題結果のサマリ取得
export async function getTaskResultsSummary(params?: { from?: string; to?: string }) {
  const res = await api.get<TaskResultsSummaryResponse>("/api/task-results/summary", {
    params,
  });
  return res.data;
}

export default api;

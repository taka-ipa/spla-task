// frontend/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  withCredentials: false,                 // ← トークン方式なので false
  headers: { Accept: "application/json" },
  timeout: 15000,
});

// リクエスト時にBearer付与
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 共通エラーハンドリング
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // 未認証 → トークン破棄してログインへ
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = `/login?next=${next}`;
        }
      }
    }
    // 403はポリシー違反（権限）なのでUI側でメッセ出す想定
    return Promise.reject(error);
  }
);

// ここがポイント：両方エクスポート
export { api };
export default api;

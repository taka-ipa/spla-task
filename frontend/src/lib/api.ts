// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000',
  withCredentials: true,                 // ★重要（クッキー送受信）
  headers: { Accept: "application/json"} // 明示しておくと無難
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        if (!location.pathname.startsWith('/login')) {
          location.href = `/login?next=${encodeURIComponent(location.pathname)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;


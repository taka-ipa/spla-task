import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // トークン方式なので不要
});

// 以降の全APIに Bearer 自動付与
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const t = localStorage.getItem("token");
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export default api;


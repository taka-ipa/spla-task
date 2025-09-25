
import { api } from './api';
import { useAuthStore } from '@/store/auth'; // なくてもOK（後述）

export async function login(email: string, password: string) {
  const res = await api.post('/api/login', { email, password }); // ←ここが /api/login
  const { token, user } = res.data;
  localStorage.setItem('token', token);
  return user;
}

export async function fetchUser() {
  const res = await api.get('/api/user');
  return res.data;
}

export async function logout() {
  try { await api.post('/api/logout'); } catch {}
  localStorage.removeItem('token');
}


// app/login/actions.ts
import { api } from '@/lib/api';

export async function loginAndFetchUser(email: string, password: string) {
  // Breeze(API)なら /login が token と user を返す構成がデフォ
  const res = await api.post('/login', { email, password });
  const { token, user } = res.data;

  // 保存（必要なら httpOnly クッキー運用に変えるが、今回はBearerでlocalStorage）
  localStorage.setItem('token', token);

  // 念のため /api/user で検証＆最新化
  const me = await api.get('/api/user');
  return me.data;
}

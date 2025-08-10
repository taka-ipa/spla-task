'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/api/register', form);

      // Breeze(API)の返し方に合わせて網羅的に拾う
      const token =
        res?.data?.token ??
        res?.data?.plain_text_token ??
        res?.data?.access_token ??
        null;

      if (token) {
        localStorage.setItem('token', token);
        // 即座にこのページからの通信にも反映したい場合
        api.defaults.headers.Authorization = `Bearer ${token}`;
        router.push('/');
      } else {
        // tokenが返らない実装の場合はログインへ
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">新規登録</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input name="name" placeholder="名前" value={form.name} onChange={onChange} className="border px-3 py-2 rounded" required />
        <input name="email" type="email" placeholder="メールアドレス" value={form.email} onChange={onChange} className="border px-3 py-2 rounded" required />
        <input name="password" type="password" placeholder="パスワード" value={form.password} onChange={onChange} className="border px-3 py-2 rounded" required />
        <input name="password_confirmation" type="password" placeholder="パスワード（確認）" value={form.password_confirmation} onChange={onChange} className="border px-3 py-2 rounded" required />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60">
          {loading ? '登録中…' : '登録'}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}

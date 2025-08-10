'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

type LoginResponse = {
  token?: string;
  access_token?: string;
  user?: { id: number; name: string; email: string };
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/api/login', form);
      const token = res.data.token ?? res.data.access_token;
      if (!token) throw new Error('No token in response');

      localStorage.setItem('token', token);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('メールまたはパスワードが違います。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">ログイン</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input name="email" type="email" placeholder="メールアドレス" value={form.email} onChange={onChange} className="border px-3 py-2 rounded" required />
        <input name="password" type="password" placeholder="パスワード" value={form.password} onChange={onChange} className="border px-3 py-2 rounded" required />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60">
          {loading ? 'ログイン中…' : 'ログイン'}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
      <p className="mt-3 text-sm text-gray-500">
        アカウントがない？ <a className="underline" href="/register">新規登録</a>
      </p>
    </div>
  );
}

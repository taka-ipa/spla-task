'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/auth';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const sp = useSearchParams();
  const hydrate = useAuthStore((s) => s.hydrate);

  // 生のnextを取得（クエリになければ null）
  const rawNext = sp?.get('next');

  // 文字列で、先頭が'/'の時だけ採用。それ以外は安全に /dashboard へ
  const nextPath = typeof rawNext === 'string' && rawNext.startsWith('/')
    ? rawNext
    : '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password); // /api/login
      await hydrate();              // /api/user -> store.user 反映
      router.push(nextPath);        // ← ここは必ず文字列
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'ログインに失敗しました');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 border rounded">
      <h1 className="text-xl mb-4">ログイン</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          ログイン
        </button>
      </form>
    </div>
  );
}
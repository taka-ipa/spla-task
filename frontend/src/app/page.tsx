'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

type User = { id: number; name: string; email: string };

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.get<User>('/api/user')
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    try {
      await api.post('/api/logout'); // Breeze(API) は現在のトークンをrevokeする実装が入っている想定
    } catch {}
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">ホーム</h1>
      {user ? (
        <div className="space-y-2">
          <p>ようこそ、{user.name} さん</p>
          <button onClick={logout} className="bg-gray-800 text-white px-3 py-1 rounded">ログアウト</button>
        </div>
      ) : (
        <div className="space-x-3">
          <a href="/login" className="underline">ログイン</a>
          <a href="/register" className="underline">新規登録</a>
        </div>
      )}
    </main>
  );
}


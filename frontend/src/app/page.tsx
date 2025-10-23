'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

type User = { id: number; name: string; email: string };

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // ここで「ログイン済みか」だけ判定
    api.get<User>('/api/user')
      .then(() => {
        setLoggedIn(true);
        // 履歴汚さないなら replace が良い
        router.replace('/dashboard');
      })
      .catch(() => {
        setLoggedIn(false);
      })
      .finally(() => setChecking(false));
  }, [router]);

  // 判定中は何も出さない（チラつき対策）
  if (checking) return null;

  // 未ログインだけ表示
  if (loggedIn === false) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">ホーム</h1>
        <div className="space-x-3">
          <Link href="/login" className="underline">ログイン</Link>
          <Link href="/register" className="underline">新規登録</Link>
        </div>
      </main>
    );
  }

  // ここに来る頃には /dashboard へ飛んでいるので描画しない
  return null;
}

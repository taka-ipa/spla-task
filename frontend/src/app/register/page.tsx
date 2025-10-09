'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api, { setAuthToken } from '@/lib/api';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import '@/lib/firebase'; // 初期化してるやつ

const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? 'laravel';

export default function RegisterPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextRaw = sp?.get('next');
  const nextPath = typeof nextRaw === 'string' && nextRaw.startsWith('/') ? nextRaw : '/dashboard';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.password_confirmation) {
      setError('パスワード確認が一致しません');
      return;
    }

    setLoading(true);
    try {
      if (AUTH_PROVIDER === 'firebase') {
        // ============ Firebase登録 ============
        const auth = getAuth();
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);

        // 表示名を設定（任意）
        if (form.name) {
          await updateProfile(cred.user, { displayName: form.name });
        }

        // ここで Laravel 側ユーザーは /dashboard で /api/user を叩いたときに JIT 作成される
        router.replace(nextPath);
      } else {
        // ============ Laravel直登録 ============
        const res = await api.post('/api/register', {
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        });

        // Breezeや実装によりキー名が違うため網羅
        const token =
          res?.data?.token ??
          res?.data?.plain_text_token ??
          res?.data?.access_token ??
          null;

        if (token) {
          setAuthToken(token); // ← localStorage + axios.defaults を一元化
          router.replace(nextPath);
        } else {
          // トークン返さない実装ならログインへ誘導
          router.replace('/login?next=' + encodeURIComponent(nextPath));
        }
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        '登録に失敗しました';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">新規登録</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* Firebaseでも名前はdisplayNameとして使えるので残してOK（任意） */}
        <input
          name="name"
          placeholder="名前"
          value={form.name}
          onChange={onChange}
          className="border px-3 py-2 rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="メールアドレス"
          value={form.email}
          onChange={onChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="パスワード"
          value={form.password}
          onChange={onChange}
          className="border px-3 py-2 rounded"
          required
          autoComplete="new-password"
        />
        <input
          name="password_confirmation"
          type="password"
          placeholder="パスワード（確認）"
          value={form.password_confirmation}
          onChange={onChange}
          className="border px-3 py-2 rounded"
          required
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? '登録中…' : '登録'}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}

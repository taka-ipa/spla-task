// components/RequireAuth.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  /**
   * ログイン不要ページで使いたいときに false にできる（任意）
   */
  enabled?: boolean;
  /**
   * ローディング中に見せるUI（未指定なら簡易表示）
   */
  fallback?: React.ReactNode;
};

export default function RequireAuth({ children, enabled = true, fallback }: Props) {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams()?.toString();

  useEffect(() => {
    if (!enabled) return;
    if (loading) return; // まずはhydrateの完了待ち
    if (!user) {
      const next = search ? `${pathname}?${search}` : pathname;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [enabled, loading, user, router, pathname, search]);

  if (!enabled) return <>{children}</>;

  // 初回hydrate中 or 未ログイン判定中はフォールバック
  if (loading || !user) {
    return (
      <div className="p-6 text-gray-600">
        {fallback ?? '読み込み中…'}
      </div>
    );
  }

  return <>{children}</>;
}

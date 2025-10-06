// components/RequireAuth.tsx
'use client';

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider"; 


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
  const { user, loading } = useAuth(); // ★ZustandではなくAuthProvider由来
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams()?.toString();

  useEffect(() => {
    if (!enabled) return;
    if (loading) return; // Firebaseの確定を待つ
    if (!user) {
      const next = search ? `${pathname}?${search}` : pathname;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [enabled, loading, user, router, pathname, search]);

  if (!enabled) return <>{children}</>;

  // ここでの表示制御：
  // - loading中はフォールバック表示
  // - !user のときは redirect 中なので何も描かない（チラつき防止）
  if (loading) return <div className="p-6 text-gray-600">{fallback ?? "読み込み中…"}</div>;
  if (!user) return null;

  return <>{children}</>;
}

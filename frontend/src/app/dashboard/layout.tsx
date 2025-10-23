'use client'; // ← RequireAuth が client component なら必要

import Link from 'next/link';
import RequireAuth from '@/components/RequireAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="min-h-dvh">
        <nav className="p-3 border-b flex gap-4 text-sm">
          <Link href="/dashboard/tasks" className="underline">課題</Link>
          <Link href="/dashboard/today" className="underline">今日</Link>
          <Link href="/dashboard/history" className="underline">履歴</Link>
          <Link href="/dashboard/summary" className="underline">集計</Link>
        </nav>
        <main className="p-4">{children}</main>
      </div>
    </RequireAuth>
  );
}

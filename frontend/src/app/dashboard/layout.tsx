// app/dashboard/layout.tsx
import RequireAuth from '@/components/RequireAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

<nav className="p-3 border-b flex gap-4 text-sm">
  <a href="/dashboard/tasks" className="underline">課題</a>
  <a href="/dashboard/today" className="underline">今日</a>
  <a href="/dashboard/history" className="underline">履歴</a>
  <a href="/dashboard/summary" className="underline">集計</a>
</nav>



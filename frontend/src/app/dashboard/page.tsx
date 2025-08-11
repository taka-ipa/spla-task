// app/dashboard/page.tsx
import AppHeader from '@/components/AppHeader';

export default function DashboardPage() {
  return (
    <div>
      <AppHeader />
      <main className="p-4">
        <h1 className="text-xl font-bold">ダッシュボード</h1>
        {/* 本体 */}
      </main>
    </div>
  );
}

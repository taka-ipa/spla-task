// components/AppHeader.tsx
'use client';

import { useAuthStore } from '@/store/auth';
import LogoutButton from './LogoutButton';

export default function AppHeader() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <div className="font-semibold">スプラ課題アプリ2</div>
      <div className="flex items-center gap-3">
        {user && <span className="text-sm text-gray-700">{user.name}</span>}
        <LogoutButton />
      </div>
    </header>
  );
}

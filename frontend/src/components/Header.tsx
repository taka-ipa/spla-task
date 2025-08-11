// components/Header.tsx
'use client';

import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header>
      <button onClick={handleLogout}>ログアウト</button>
    </header>
  );
}

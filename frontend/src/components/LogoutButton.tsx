'use client';

import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
    >
      ログアウト
    </button>
  );
}

// components/AuthInit.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export default function AuthInit() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return null;
}

// store/auth.ts
'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';

export type User = {
  id: number;
  name: string;
  email: string | null;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (u) => set({ user: u }),

  // アプリ起動時 / 画面遷移時に、tokenがあれば /api/user で同期
  hydrate: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ user: null, loading: false });
      return;
    }
    try {
      const res = await api.get('/api/user');
      set({ user: res.data, loading: false });
    } catch {
      // トークン無効なら破棄
      localStorage.removeItem('token');
      set({ user: null, loading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch {}
    localStorage.removeItem('token');
    set({ user: null });
  },
}));

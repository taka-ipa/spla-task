"use client";
import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import "@/lib/firebase"; // すでに初期化してる想定

type Ctx = { user: User | null; loading: boolean; };
const AuthContext = createContext<Ctx>({ user: null, loading: true });

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

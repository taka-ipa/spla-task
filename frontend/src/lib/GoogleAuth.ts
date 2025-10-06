import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import axios from "axios";

// URL環境変数のゆらぎを吸収
const RAW = process.env.NEXT_PUBLIC_API_BASE_URL
  ?? process.env.NEXT_PUBLIC_API_BASE
  ?? "http://localhost:8000";
const API = RAW.replace(/\/+$/, "") + (RAW.endsWith("/api") ? "" : "/api");

export const authAdapter = {
  // ★ 追加：IDトークン取得
  async getIdToken(force = false): Promise<string | null> {
    const u = auth.currentUser;
    try {
      return u ? await u.getIdToken(force) : null;
    } catch {
      return null;
    }
  },

  async signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
    await this.linkLaravel(); // ← Cookie連携を使わないなら削ってOK
  },

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    await this.linkLaravel(); // ← 同上。不要なら削除OK
  },

  async linkLaravel() {
    const idToken = await this.getIdToken(true);
    if (!idToken) throw new Error("Firebase未ログイン");
    await axios.post(`${API}/auth/firebase-login`, null, {
      headers: { Authorization: `Bearer ${idToken}` },
      withCredentials: true, // サーバがCookieを返す想定
    });
  },

  async logout() {
    await signOut(auth);
  },
};
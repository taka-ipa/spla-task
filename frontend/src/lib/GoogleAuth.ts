import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const authAdapter = {
  async signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
    await this.linkLaravel();
  },

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    await this.linkLaravel();
  },

  async linkLaravel() {
    const u = auth.currentUser;
    if (!u) throw new Error("Firebase未ログイン");
    const idToken = await u.getIdToken(true);

    await axios.post(`${API}/auth/firebase-login`, null, {
      headers: { Authorization: `Bearer ${idToken}` },
      withCredentials: true,
    });
  },

  async logout() {
    await signOut(auth);
  },
};

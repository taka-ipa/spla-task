import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged as onChange,
} from "firebase/auth";
import type { AuthAdapter, UserLike } from "./types";

export const firebaseAdapter: AuthAdapter = {
  async signUp(email, pw) {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    return { id: cred.user.uid, email: cred.user.email };
  },
  async signIn(email, pw) {
    const cred = await signInWithEmailAndPassword(auth, email, pw);
    return { id: cred.user.uid, email: cred.user.email };
  },
  async signOut() { await auth.signOut(); },
  onAuthStateChanged(cb) {
    return onChange(auth, (u) => cb(u ? { id: u.uid, email: u.email } : null));
  },
  async getIdToken() { return auth.currentUser ? auth.currentUser.getIdToken() : null; },
};
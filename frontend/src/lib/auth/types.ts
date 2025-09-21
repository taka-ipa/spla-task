export type UserLike = { id: string; email: string | null };
export interface AuthAdapter {
  signUp(email: string, password: string): Promise<UserLike>;
  signIn(email: string, password: string): Promise<UserLike>;
  signOut(): Promise<void>;
  onAuthStateChanged(cb: (u: UserLike | null) => void): () => void;
  getIdToken(): Promise<string | null>;
}
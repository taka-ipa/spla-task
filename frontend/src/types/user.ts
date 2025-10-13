export type Me = {
  id: number;
  email: string | null;
  name: string | null;
  firebase_uid: string;
  created_at: string; // ISO形式 (例: 2025-10-14T00:00:00Z)
  updated_at: string;
};
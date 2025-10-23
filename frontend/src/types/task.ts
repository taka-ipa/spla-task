export type Task = {
  id: number;
  user_id?: number; // ← ? でオプショナルに
  title: string;
  icon?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type Paginated<T> = {
  data: T[];
  meta?: { current_page: number; last_page: number; };
  links?: { next?: string | null; prev?: string | null; };
};

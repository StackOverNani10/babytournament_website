export interface Guest {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

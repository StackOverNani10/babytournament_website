export interface GenderPrediction {
  id: string;
  event_id: string;
  guest_id: string;
  prediction: 'boy' | 'girl';
  name_suggestion: string;
  created_at: string;
  message?: string | null;
}

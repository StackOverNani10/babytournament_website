// This file is now deprecated. Please use the new structure in src/lib/supabase/
// Re-export everything from the new location
export * from './supabase';

// For backward compatibility
export { supabase } from './supabase/client';

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string;
          date: string;
          location: string;
          user_id: string;
          is_public: boolean;
        };
        Insert: Omit<{
          id?: string;
          created_at?: string;
          name: string;
          description?: string;
          date: string;
          location: string;
          user_id: string;
          is_public?: boolean;
        }, 'id' | 'created_at'>;
        Update: Partial<{
          name: string;
          description: string;
          date: string;
          location: string;
          is_public: boolean;
        }>;
      };
      guests: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          phone: string;
          event_id: string;
          status: 'pending' | 'confirmed' | 'declined';
        };
        Insert: Omit<{
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          phone?: string;
          event_id: string;
          status?: 'pending' | 'confirmed' | 'declined';
        }, 'id' | 'created_at'>;
        Update: Partial<{
          name: string;
          email: string;
          phone: string;
          status: 'pending' | 'confirmed' | 'declined';
        }>;
      };
      gifts: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string;
          price: number;
          image_url: string;
          event_id: string;
          is_reserved: boolean;
        };
        Insert: Omit<{
          id?: string;
          created_at?: string;
          name: string;
          description: string;
          price: number;
          image_url: string;
          event_id: string;
          is_reserved?: boolean;
        }, 'id' | 'created_at' | 'is_reserved'>;
        Update: Partial<{
          name: string;
          description: string;
          price: number;
          image_url: string;
          is_reserved: boolean;
        }>;
      };
      reservations: {
        Row: {
          id: string;
          created_at: string;
          guest_id: string;
          gift_id: string;
          status: 'pending' | 'confirmed' | 'cancelled';
        };
        Insert: Omit<{
          id?: string;
          created_at?: string;
          guest_id: string;
          gift_id: string;
          status?: 'pending' | 'confirmed' | 'cancelled';
        }, 'id' | 'created_at'>;
        Update: Partial<{
          status: 'pending' | 'confirmed' | 'cancelled';
        }>;
      };
    };
  };
};

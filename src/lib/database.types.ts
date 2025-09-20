export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type EventType = 'gender-reveal' | 'baby-shower' | 'birth';

type SectionType = 
  | 'countdown' 
  | 'predictions' 
  | 'gift-catalog' 
  | 'activity-voting' 
  | 'raffle' 
  | 'wishes'
  | 'gallery';

interface SectionConfig {
  id: SectionType;
  enabled: boolean;
  title?: string;
  description?: string;
  order: number;
  config?: Record<string, unknown>;
}

type EventSections = {
  [key: string]: SectionConfig;
};

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          type: EventType;
          title: string;
          subtitle: string | null;
          date: string;
          time: string | null;
          location: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          sections: EventSections;
          user_id: string;
        };
        Insert: {
          id?: string;
          type: EventType;
          title: string;
          subtitle?: string | null;
          date: string;
          time?: string | null;
          location: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          sections: EventSections;
          user_id: string;
        };
        Update: {
          id?: string;
          type?: EventType;
          title?: string;
          subtitle?: string | null;
          date?: string;
          time?: string | null;
          location?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
          sections?: EventSections;
          user_id?: string;
        };
      };
      guests: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          email: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          email: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          category_id: string;
          store_id: string | null;
          event_id: string;
          is_reserved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          category_id: string;
          store_id?: string | null;
          event_id: string;
          is_reserved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          category_id?: string;
          store_id?: string | null;
          event_id?: string;
          is_reserved?: boolean;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          website: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          website?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          website?: string | null;
          logo_url?: string | null;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          guest_id: string;
          product_id: string;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          product_id: string;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_id?: string;
          product_id?: string;
          status?: 'pending' | 'confirmed' | 'cancelled';
          updated_at?: string;
        };
      };
      predictions: {
        Row: {
          id: string;
          event_id: string;
          guest_id: string;
          prediction: 'boy' | 'girl';
          name_suggestion: string | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          guest_id: string;
          prediction: 'boy' | 'girl';
          name_suggestion?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          guest_id?: string;
          prediction?: 'boy' | 'girl';
          name_suggestion?: string | null;
          message?: string | null;
        };
      };
      event_sections: {
        Row: {
          id: string;
          event_id: string;
          section_id: string;
          enabled: boolean;
          title: string | null;
          description: string | null;
          order: number | null;
          config: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          section_id: string;
          enabled?: boolean;
          title?: string | null;
          description?: string | null;
          order?: number | null;
          config?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          section_id?: string;
          enabled?: boolean;
          title?: string | null;
          description?: string | null;
          order?: number | null;
          config?: Json | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

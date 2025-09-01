export type EventType = 'gender-reveal' | 'baby-shower' | 'birth';

export type SectionType = 
  | 'countdown' 
  | 'predictions' 
  | 'gift-catalog' 
  | 'activity-voting' 
  | 'raffle' 
  | 'wishes';

export interface SectionConfig {
  id: SectionType;
  enabled: boolean;
  title?: string;
  description?: string;
  order: number;
  config?: Record<string, unknown>;
}

export interface EventSections {
  [key: string]: SectionConfig;
}

export interface Event {
  id: string;
  type: EventType;
  title: string;
  subtitle: string | null;
  date: string;
  time: string | null;
  location: string;
  description: string | null;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  sections: EventSections;
}

import { Product } from '../../../features/gifts/types/products';

export interface EventStats {
  totalProducts: number;
  reservedProducts: number;
  totalInvitations: number;
  completionPercentage: number;
  popularProducts: Array<{
    product: Product;
    reservations: number;
  }>;
}

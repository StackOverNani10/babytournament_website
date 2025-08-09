export type EventType = 'gender-reveal' | 'baby-shower' | 'birth';

export interface Event {
  id: string;
  type: EventType;
  title: string;
  subtitle?: string;
  date: string;
  time?: string;
  location: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface Store {
  id: string;
  name: string;
  logo?: string;
  website?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  storeId: string;
  price: number;
  imageUrl: string;
  description?: string;
  suggestedQuantity: number;
  maxQuantity?: number;
  eventType?: EventType[];
  isActive: boolean;
}

export interface GiftReservation {
  id: string;
  eventId: string;
  productId: string;
  guestName: string;
  guestEmail: string;
  quantity: number;
  message?: string;
  createdAt: string;
  status: 'reserved' | 'confirmed' | 'cancelled';
}

export interface GenderPrediction {
  id: string;
  eventId: string;
  guestName: string;
  guestEmail: string;
  predictedGender: 'boy' | 'girl';
  suggestedName: string;
  message?: string;
  predictedDate?: string; // The date when the prediction was made
  createdAt: string;
}

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
import { EventType } from '../../event/types/events';

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
  color?: string;
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
  productUrl?: string;
}

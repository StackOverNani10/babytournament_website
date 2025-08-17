import { Product } from '../../gifts/types/products';

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
  product?: Product; // Relación opcional para cuando se necesite el producto completo
}

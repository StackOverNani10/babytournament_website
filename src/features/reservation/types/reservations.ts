import { Product } from '../../gifts/types/products';

export type ReservationStatus = 'reserved' | 'confirmed' | 'cancelled' | 'pending' | 'rejected';

export interface GiftReservation {
  id: string;
  eventId: string;
  productId: string;
  guestName: string;
  guestEmail: string;
  quantity: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
  status: ReservationStatus;
  product?: Product; // Relación opcional para cuando se necesite el producto completo
}

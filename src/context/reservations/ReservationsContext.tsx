import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/browser/useLocalStorage';
import { GiftReservation } from '../../features/reservation/types/reservations';
import { Product } from '../../features/gifts/types/products';

interface ReservationsContextType {
  reservations: GiftReservation[];
  addReservation: (reservation: Omit<GiftReservation, 'id' | 'createdAt' | 'status'>) => void;
  cancelReservation: (id: string) => void;
  getAvailableQuantity: (product: Product) => number;
  isProductAvailable: (product: Product) => boolean;
  getProductReservations: (productId: string) => GiftReservation[];
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

interface ReservationsProviderProps {
  children: ReactNode;
  initialReservations?: GiftReservation[];
}

export function ReservationsProvider({ 
  children, 
  initialReservations = [] 
}: ReservationsProviderProps) {
  const [reservations, setReservations] = useLocalStorage<GiftReservation[]>(
    'gift-reservations', 
    initialReservations
  );

  const addReservation = useCallback((
    reservation: Omit<GiftReservation, 'id' | 'createdAt' | 'status'>
  ) => {
    const newReservation: GiftReservation = {
      ...reservation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'reserved' as const
    };
    
    setReservations(prev => [...prev, newReservation]);
  }, [setReservations]);

  const cancelReservation = useCallback((id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  }, [setReservations]);

  const getAvailableQuantity = useCallback((product: Product) => {
    if (!product.maxQuantity) return 999;
    
    const totalReserved = reservations
      .filter(r => r.productId === product.id && r.status === 'reserved')
      .reduce((sum, r) => sum + r.quantity, 0);
    
    return Math.max(0, product.maxQuantity - totalReserved);
  }, [reservations]);

  const isProductAvailable = useCallback((product: Product) => {
    return getAvailableQuantity(product) > 0;
  }, [getAvailableQuantity]);

  const getProductReservations = useCallback((productId: string) => {
    return reservations.filter(r => 
      r.productId === productId && r.status === 'reserved'
    );
  }, [reservations]);

  const value = {
    reservations,
    addReservation,
    cancelReservation,
    getAvailableQuantity,
    isProductAvailable,
    getProductReservations
  };

  return (
    <ReservationsContext.Provider value={value}>
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationsContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationsProvider');
  }
  return context;
}

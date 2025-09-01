import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { dataService } from '@/lib/data/dataService';
import { GiftReservation, ReservationStatus } from '../../features/reservation/types/reservations';
import { Product } from '../../features/gifts/types/products';
import { supabase } from '@/lib/supabase';

interface ReservationsContextType {
  reservations: GiftReservation[];
  loading: boolean;
  error: string | null;
  addReservation: (reservation: Omit<GiftReservation, 'id' | 'createdAt' | 'status'>) => Promise<GiftReservation>;
  cancelReservation: (id: string) => Promise<void>;
  getAvailableQuantity: (product: Product) => number;
  isProductAvailable: (product: Product) => boolean;
  getProductReservations: (productId: string) => GiftReservation[];
  refreshReservations: () => Promise<void>;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

interface ReservationsProviderProps {
  children: ReactNode;
  initialReservations?: GiftReservation[];
}

  const mapDbReservationToReservation = (dbReservation: any, guestData: any): GiftReservation => {
    const validStatuses: ReservationStatus[] = ['pending', 'confirmed', 'cancelled'];
    const status = validStatuses.includes(dbReservation.status) 
      ? dbReservation.status as ReservationStatus 
      : 'pending';
      
    return {
      id: dbReservation.id,
      productId: dbReservation.product_id,
      eventId: guestData?.event_id || '',
      guestName: guestData?.name || 'Guest',
      guestEmail: guestData?.email || '',
      status,
      quantity: dbReservation.quantity || 1,
      createdAt: dbReservation.created_at || new Date().toISOString(),
      updatedAt: dbReservation.updated_at || new Date().toISOString()
    };
  };

export function ReservationsProvider({ 
  children, 
  initialReservations = [] 
}: ReservationsProviderProps) {
  const [reservations, setReservations] = useState<GiftReservation[]>(initialReservations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all reservations
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('*');
      
      if (reservationsError) throw reservationsError;
      if (!reservations) return;
      
      // Get all unique guest IDs
      const guestIds = [...new Set(reservations.map(r => r.guest_id))];
      
      // Fetch all guests in one query
      const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .select('*')
        .in('id', guestIds);
      
      if (guestsError) throw guestsError;
      
      // Create a map of guest ID to guest data for quick lookup
      const guestsMap = new Map(guests?.map(g => [g.id, g]) || []);
      
      // Map reservations with guest data
      const mappedReservations = reservations.map(reservation => {
        const guestData = guestsMap.get(reservation.guest_id);
        return mapDbReservationToReservation(reservation, guestData);
      });
      
      setReservations(mappedReservations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reservations');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const refreshReservations = useCallback(async () => {
    await fetchReservations();
  }, [fetchReservations]);

  const addReservation = useCallback(async (reservation: Omit<GiftReservation, 'id' | 'createdAt' | 'status'>): Promise<GiftReservation> => {
    try {
      setLoading(true);
      
      // First, find or create the guest
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('email', reservation.guestEmail)
        .single();

      let guestId: string;
      if (!guestError && guest) {
        guestId = guest.id;
      } else {
        // Create new guest if not exists
        const { data: newGuest, error: createError } = await supabase
          .from('guests')
          .insert({
            name: reservation.guestName,
            email: reservation.guestEmail,
            event_id: reservation.eventId
          })
          .select()
          .single();

        if (createError) throw createError;
        if (!newGuest) throw new Error('Failed to create guest');
        guestId = newGuest.id;
      }

      // Create the reservation
      const { data: newReservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          guest_id: guestId,
          product_id: reservation.productId,
          quantity: reservation.quantity || 1,
          status: 'pending'
        })
        .select()
        .single();

      if (reservationError) throw reservationError;
      if (!newReservation) throw new Error('Failed to create reservation');

      // Fetch the created reservation with guest data
      // Refetch the reservation with guest data
      const { data: fullReservation, error: fetchError } = await supabase
        .from('reservations')
        .select('*, guests(*)')
        .eq('id', newReservation.id)
        .single();

      if (fetchError) throw fetchError;
      if (!fullReservation || !fullReservation.guests) {
        throw new Error('Failed to fetch created reservation with guest data');
      }

      // Update local state
      const mappedReservation = mapDbReservationToReservation(
        fullReservation,
        fullReservation.guests
      );
      
      setReservations(prev => [...prev, mappedReservation]);
      return mappedReservation;
    } catch (error) {
      console.error('Error adding reservation:', error);
      throw error;
    }
  }, [setReservations]);

  const cancelReservation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await dataService.update('reservations', id, { status: 'cancelled' });
      setReservations(prev => 
        prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setReservations]);

  const getAvailableQuantity = useCallback((product: Product) => {
    const reserved = reservations
      .filter(r => r.productId === product.id && r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.quantity || 1), 0);
    // Use suggestedQuantity as the base quantity since maxQuantity is optional
    const maxAvailable = product.maxQuantity || product.suggestedQuantity || 1;
    return Math.max(0, maxAvailable - reserved);
  }, [reservations]);

  const isProductAvailable = useCallback((product: Product) => {
    const reserved = reservations
      .filter(r => r.productId === product.id && r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.quantity || 1), 0);
    const maxAvailable = product.maxQuantity || product.suggestedQuantity || 1;
    return reserved < maxAvailable;
  }, [reservations]);

  const getProductReservations = useCallback((productId: string) => {
    return reservations.filter(r => r.productId === productId);
  }, [reservations]);

  const contextValue = {
    reservations,
    loading,
    error,
    addReservation,
    cancelReservation,
    getAvailableQuantity,
    isProductAvailable,
    getProductReservations,
    refreshReservations
  };

  return (
    <ReservationsContext.Provider value={contextValue}>
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

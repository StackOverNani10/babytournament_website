import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Guest } from '@/features/guests/types/guests';
import { useEvents } from '../events/EventsContext';
import { Event as AppEvent } from '@/features/event/types/events';

interface GuestsContextType {
  guests: Guest[];
  loading: boolean;
  error: string | null;
  addGuest: (guest: Omit<Guest, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Guest | null>;
  getGuestByEmail: (email: string) => Promise<Guest | null>;
  currentEvent: AppEvent | null;
}

const GuestsContext = createContext<GuestsContextType | undefined>(undefined);

interface GuestsProviderProps {
  children: ReactNode;
}

export function GuestsProvider({ children }: GuestsProviderProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentEvent } = useEvents();

  const addGuest = useCallback(async (guest: Omit<Guest, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guests')
        .insert([guest])
        .select();

      if (error) throw error;

      if (data) {
        const newGuest = data[0] as Guest;
        setGuests(prev => [...prev, newGuest]);
        return newGuest;
      }
      return null;
    } catch (err) {
      console.error('Error adding guest:', err);
      setError('Error al agregar el invitado');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGuestByEmail = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Guest;
    } catch (err) {
      console.error('Error fetching guest by email:', err);
      return null;
    }
  }, []);

  return (
    <GuestsContext.Provider
      value={{
        guests,
        loading,
        error,
        addGuest,
        getGuestByEmail,
        currentEvent
      }}
    >
      {children}
    </GuestsContext.Provider>
  );
}

export function useGuests() {
  const context = useContext(GuestsContext);
  if (context === undefined) {
    throw new Error('useGuests must be used within a GuestsProvider');
  }
  return context;
}

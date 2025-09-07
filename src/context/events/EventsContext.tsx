import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { dataService } from '@/lib/data/dataService';
import { Event } from '../../features/event/types/events';
import { toast } from 'sonner';

interface EventsContextType {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  error: string | null;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<Event>;
  setActiveEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  getEventById: (id: string) => Event | undefined;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: ReactNode;
  initialEvents?: Event[];
}

export function EventsProvider({ children, initialEvents }: EventsProviderProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents || []);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching events...');
      
      const dbEvents = await dataService.fetchAll('events');
      console.log('📊 Events data:', dbEvents);
      
      if (!dbEvents || !Array.isArray(dbEvents)) {
        console.warn('No se recibieron eventos o el formato es incorrecto:', dbEvents);
        setEvents([]);
        setCurrentEvent(null);
        return;
      }
      
      const mappedEvents = dbEvents.map(dbEvent => ({
        id: dbEvent.id || '',
        type: dbEvent.type || 'baby-shower',
        title: dbEvent.title || 'Sin título',
        subtitle: dbEvent.subtitle || '',
        date: dbEvent.date || new Date().toISOString().split('T')[0],
        time: dbEvent.time || '18:00',
        location: dbEvent.location || '',
        description: dbEvent.description || '',
        imageUrl: dbEvent.image_url || undefined,
        isActive: dbEvent.is_active !== undefined ? dbEvent.is_active : true,
        createdAt: dbEvent.created_at || new Date().toISOString(),
        sections: dbEvent.sections || {}
      }));
      
      setEvents(mappedEvents);
      
      // Update currentEvent based on active status
      if (mappedEvents.length > 0) {
        const currentEventExists = currentEvent && mappedEvents.some(e => e.id === currentEvent.id);
        
        // Find the first active event
        const activeEvent = mappedEvents.find(e => e.isActive);
        
        if (activeEvent) {
          // If we found an active event, use it
          if (!currentEvent || currentEvent.id !== activeEvent.id) {
            setCurrentEvent(activeEvent);
          }
        } else if (!currentEvent || !currentEventExists) {
          // If no active event found, fall back to the first event
          setCurrentEvent(mappedEvents[0]);
        }
      } else {
        setCurrentEvent(null);
      }
      
      return mappedEvents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar eventos';
      setError(errorMessage);
      console.error('Error loading events:', err);
      toast.error('Error al cargar los eventos');
      throw err; // Re-throw to allow callers to handle the error
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const updateEvent = useCallback(async (id: string, updates: Partial<Event>): Promise<Event> => {
    try {
      setLoading(true);
      setError(null);
      
      // First verify the event exists in our local state
      const existingEvent = events.find(e => e.id === id);
      if (!existingEvent) {
        throw new Error(`No se encontró ningún evento con el ID: ${id}`);
      }
      
      // Convert camelCase to snake_case for database
      const dbUpdates: Record<string, any> = { ...updates };
      
      // Handle imageUrl conversion
      if ('imageUrl' in updates) {
        dbUpdates.image_url = updates.imageUrl;
        delete dbUpdates.imageUrl;
      }
      
      // Ensure sections are properly preserved
      if ('sections' in updates) {
        dbUpdates.sections = updates.sections;
      } else if (existingEvent.sections) {
        // If sections weren't updated, preserve the existing sections
        dbUpdates.sections = existingEvent.sections;
      }
      
      // Add updated_at timestamp
      dbUpdates.updated_at = new Date().toISOString();
      
      try {
        // Show loading toast
        const toastId = toast.loading('Actualizando evento...');
        
        try {
          // Try to update with returning the updated record
          const dbEvent = await dataService.update('events', id, dbUpdates) as any;
          
          // Map the database event to our Event type
          const updatedEvent: Event = {
            id: dbEvent.id,
            type: dbEvent.type,
            title: dbEvent.title,
            subtitle: dbEvent.subtitle || '',
            date: dbEvent.date,
            time: dbEvent.time || '',
            location: dbEvent.location || '',
            description: dbEvent.description || '',
            imageUrl: dbEvent.image_url || undefined,
            isActive: dbEvent.is_active !== undefined ? dbEvent.is_active : true,
            createdAt: dbEvent.created_at || new Date().toISOString(),
            sections: dbEvent.sections || {}
          };
          
          // Update local state with the returned event
          setEvents(prev => 
            prev.map(event => event.id === id ? updatedEvent : event)
          );
          
          // If there's a current event being edited, update it too
          if (currentEvent?.id === id) {
            setCurrentEvent(updatedEvent);
          }
          
          // Show success toast
          toast.success('Evento actualizado exitosamente', { id: toastId });
          
          return updatedEvent;
        } catch (error) {
          // If we get here, the update might have succeeded but didn't return the record
          // So we'll fetch the updated record
          const dbEvent = await dataService.fetchById('events', id) as any;
          
          // Map the database event to our Event type
          const updatedEvent: Event = {
            id: dbEvent.id,
            type: dbEvent.type,
            title: dbEvent.title,
            subtitle: dbEvent.subtitle || '',
            date: dbEvent.date,
            time: dbEvent.time || '',
            location: dbEvent.location || '',
            description: dbEvent.description || '',
            imageUrl: dbEvent.image_url || undefined,
            isActive: dbEvent.is_active !== undefined ? dbEvent.is_active : true,
            createdAt: dbEvent.created_at || new Date().toISOString(),
            sections: dbEvent.sections || {}
          };
          
          // Update local state with the fetched event
          setEvents(prev => 
            prev.map(event => event.id === id ? updatedEvent : event)
          );
          
          // If there's a current event being edited, update it too
          if (currentEvent?.id === id) {
            setCurrentEvent(updatedEvent);
          }
          
          // Show success toast
          toast.success('Evento actualizado exitosamente', { id: toastId });
          
          return updatedEvent as Event;
        }
      } catch (dbError) {
        console.error('Database error updating event:', dbError);
        
        // If the error is about missing row, try to refresh the events list
        if (dbError instanceof Error && (dbError.message.includes('PGRST116') || dbError.message.includes('not found'))) {
          console.log('Event not found in database, refreshing events...');
          try {
            // First refresh the events list
            await fetchEvents();
            
            // Check if the event exists in the database
            const refreshedEvents = await dataService.fetchAll('events');
            const refreshedEvent = refreshedEvents.find((e: any) => e.id === id);
            
            if (!refreshedEvent) {
              // If event still doesn't exist, remove it from local state
              setEvents(prev => prev.filter(e => e.id !== id));
              if (currentEvent?.id === id) {
                setCurrentEvent(null);
              }
              throw new Error('El evento no se encontró en la base de datos después de actualizar la lista.');
            }
            
            // If we found the event, try the update again with the latest data
            console.log('Retrying update after refresh...');
            const retryResult = await dataService.update('events', id, dbUpdates);
            
            if (!retryResult) {
              throw new Error('No se pudo actualizar el evento después de reintentar');
            }
            
            // Show success toast for retry
            toast.success('Evento actualizado exitosamente después de reintentar');
            
            // Update local state with the retry result
            const updatedEvent: Event = {
              id: retryResult.id,
              type: retryResult.type,
              title: retryResult.title,
              subtitle: retryResult.subtitle,
              date: retryResult.date,
              time: retryResult.time,
              location: retryResult.location,
              description: retryResult.description,
              imageUrl: retryResult.image_url || undefined,
              isActive: retryResult.is_active ?? true,
              createdAt: retryResult.created_at,
              sections: retryResult.sections || existingEvent.sections || {}
            };
            
            setEvents(prev => 
              prev.map(event => event.id === id ? updatedEvent : event)
            );
            
            if (currentEvent?.id === id) {
              setCurrentEvent(updatedEvent);
            }
            
            return updatedEvent;
          } catch (refreshError) {
            console.error('Error during refresh and retry:', refreshError);
            const errorMessage = refreshError instanceof Error ? 
              refreshError.message : 'Error al intentar actualizar el evento';
            
            // Show error toast
            toast.error(errorMessage, {
              description: 'Por favor intenta nuevamente',
              action: {
                label: 'Reintentar',
                onClick: () => updateEvent(id, updates)
              }
            });
            throw new Error(`No se pudo actualizar el evento: ${errorMessage}`);
          }
        }
        
        // For other database errors, rethrow them
        const errorMessage = dbError instanceof Error ? 
          `Error en la base de datos: ${dbError.message}` : 'Error desconocido';
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? 
        err.message : 'Error desconocido al actualizar el evento';
      setError(errorMessage);
      console.error('Error in updateEvent:', err);
      throw err; // Re-throw to allow component to handle it
    } finally {
      setLoading(false);
    }
  }, [events, currentEvent, fetchEvents]);

  const setActiveEvent = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setCurrentEvent(event);
    }
  };

  const refreshEvents = async () => {
    await fetchEvents();
  };

  const getEventById = useCallback((id: string) => {
    return events.find(event => event.id === id);
  }, [events]);

  const eventsContextValue = {
    events,
    currentEvent,
    loading,
    error,
    updateEvent,
    setActiveEvent,
    refreshEvents,
    getEventById
  };

  return (
    <EventsContext.Provider value={eventsContextValue}>
      {children}
    </EventsContext.Provider>
  );
}

// This follows React's rules of hooks and ensures stable references
export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

// This helps with Fast Refresh by ensuring the component name is preserved
useEvents.displayName = 'useEvents';

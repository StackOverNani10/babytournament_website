import { createContext, useContext, ReactNode, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Event, Product, Category, Store, GiftReservation, GenderPrediction } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { dataService } from '../lib/data/dataService';
import { supabase } from '@/lib/supabase/client';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { EventsProvider } from './events/EventsContext';
import { ReservationsProvider } from './reservations/ReservationsContext';
import { PredictionsProvider } from './predictions/PredictionsContext';
import { GuestsProvider } from './guests/GuestsContext';

// Helper function to map database event to app event type
const mapDbEventToAppEvent = (dbEvent: any): Event => {
  // Parse the sections if it's a string (from Supabase JSONB)
  let sections = {};
  try {
    sections = typeof dbEvent.sections === 'string'
      ? JSON.parse(dbEvent.sections)
      : dbEvent.sections || {};
  } catch (error) {
    console.error('Error parsing event sections:', error);
    sections = {};
  }

  return {
    id: dbEvent.id,
    type: dbEvent.type as 'gender-reveal' | 'baby-shower' | 'birth',
    title: dbEvent.title,
    subtitle: dbEvent.subtitle || null,
    date: dbEvent.date,
    time: dbEvent.time || '18:00',
    location: dbEvent.location,
    description: dbEvent.description || null,
    imageUrl: dbEvent.image_url || '/default-event.jpg',
    isActive: dbEvent.is_active || false,
    createdAt: dbEvent.created_at || new Date().toISOString(),
    sections: sections
  };
};

// Helper function to map database product to app product type
const mapDbProductToAppProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description || undefined,
  price: dbProduct.price || 0,
  imageUrl: dbProduct.image_url || '/default-product.jpg',
  categoryId: dbProduct.category_id,
  storeId: dbProduct.store_id,
  suggestedQuantity: dbProduct.suggested_quantity || 1,
  maxQuantity: dbProduct.max_quantity || 1,
  eventType: Array.isArray(dbProduct.event_type) ? dbProduct.event_type : (dbProduct.event_type ? [dbProduct.event_type] : []),
  isActive: dbProduct.is_active !== false, // Default to true if not specified
  productUrl: dbProduct.product_url || undefined
});

// Helper function to map database category to app category type
const mapDbCategoryToAppCategory = (dbCategory: any): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  icon: dbCategory.icon || 'gift',
  order: dbCategory.order || 0
});

// Helper function to map database store to app store type
const mapDbStoreToAppStore = (dbStore: any): Store => ({
  id: dbStore.id,
  name: dbStore.name,
  logo: dbStore.logo || undefined,
  website: dbStore.website || undefined,
  color: dbStore.color || undefined
});

type Theme = 'boy' | 'girl' | 'neutral';

interface AppContextType {
  currentEvent: Event | null;
  events: Event[];
  products: Product[];
  categories: Category[];
  stores: Store[];
  reservations: GiftReservation[];
  predictions: GenderPrediction[];
  selectedTheme: Theme;
  theme: Theme;
  isLoading: boolean;
  error: string | null;
  setSelectedTheme: (theme: Theme) => void;
  addReservation: (reservation: Omit<GiftReservation, 'id' | 'createdAt'>) => void;
  addPrediction: (prediction: Omit<GenderPrediction, 'id' | 'createdAt' | 'guest_id'> & { guest_name: string; guest_email: string }) => Promise<GenderPrediction | null>;
  cancelReservation: (id: string) => void;
  getAvailableQuantity: (productId: string) => number;
  isProductAvailable: (productId: string) => boolean;
  getProductReservations: (productId: string) => GiftReservation[];
  updateEvent: (id: string, updates: Partial<Event>) => void;
  setActiveEvent: (id: string) => void;
  showConfirmDialog: <T = void>(title: string, message: string, onConfirm: () => Promise<T>) => Promise<T | false>;
  refreshEvents: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [reservations, setReservations] = useState<GiftReservation[]>([]);
  const [predictions, setPredictions] = useState<GenderPrediction[]>([]);
  const [selectedTheme, setSelectedTheme] = useLocalStorage<Theme>('selected-theme', 'neutral');
  const resolveRef = useRef<((value: any) => void) | null>(null);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    onConfirm: async () => { },
    onCancel: () => { }
  });
  
  // Function to show confirmation dialog
  const showConfirmDialog = useCallback(<T = void>(title: string, message: string, onConfirm: () => Promise<T>): Promise<T | false> => {
    return new Promise<T | false>((resolve) => {
      // Store the resolve function in the ref
      const currentResolve = (value: T | false) => {
        resolve(value);
        setShowConfirmation(false);
      };
      
      // Store the resolve function in the ref
      resolveRef.current = currentResolve;
      
      // Handle confirm action
      const handleConfirm = async () => {
        try {
          const result = await onConfirm();
          currentResolve(result as T);
        } catch (error) {
          console.error('Error in confirmation:', error);
          currentResolve(false);
        }
      };

      // Handle cancel action
      const handleCancel = () => {
        currentResolve(false);
      };

      // Update the confirmation config
      setConfirmationConfig({
        title,
        message: message.replace(/\n/g, '\n'),
        onConfirm: handleConfirm,
        onCancel: handleCancel
      });
      

      // Show the confirmation dialog
      setShowConfirmation(true);
    });
  }, []);

  // State for data from Supabase
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to map database prediction to app prediction type
  const mapDbPredictionToAppPrediction = (dbPrediction: any): GenderPrediction => {
    return {
      id: dbPrediction.id,
      event_id: dbPrediction.event_id,
      guest_id: dbPrediction.guest_id,
      prediction: dbPrediction.prediction as 'boy' | 'girl',
      name_suggestion: dbPrediction.name_suggestion || '',
      created_at: dbPrediction.created_at,
      message: dbPrediction.message || ''
    };
  };

  // Fetch predictions from the database
  const fetchPredictions = useCallback(async () => {
    try {
      if (!currentEvent?.id) return;
      
      const dbPredictions = await dataService.fetchByEventId('predictions', currentEvent.id);
      if (!Array.isArray(dbPredictions)) {
        throw new Error('Invalid predictions data received');
      }
      
      const mappedPredictions = await Promise.all(
        dbPredictions.map((p: any) => mapDbPredictionToAppPrediction(p))
      );
      
      setPredictions(mappedPredictions);
      setError(null);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setError('Error al cargar las predicciones');
      setPredictions([]);
    }
  }, [currentEvent?.id, setPredictions, setError]);

  const fetchReservations = useCallback(async () => {
    try {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*');
      
      if (error) throw error;
      if (!reservations) return [];
      
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
      return reservations.map(reservation => {
        const guestData = guestsMap.get(reservation.guest_id);
        return {
          id: reservation.id,
          productId: reservation.product_id,
          eventId: guestData?.event_id || '',
          guestName: guestData?.name || 'Guest',
          guestEmail: guestData?.email || '',
          status: reservation.status as 'pending' | 'confirmed' | 'cancelled',
          quantity: reservation.quantity || 1,
          createdAt: reservation.created_at || new Date().toISOString(),
          updatedAt: reservation.updated_at || new Date().toISOString()
        };
      });
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Error al cargar las reservaciones');
      return [];
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from Supabase...');
        setIsLoading(true);

        // Fetch all data in parallel
        console.log('Starting to fetch data...');
        const [
          eventsData, 
          productsData, 
          categoriesData, 
          storesData,
          reservationsData
        ] = await Promise.all([
          dataService.fetchAll('events').catch(err => {
            console.error('Error fetching events:', err);
            return [];
          }),
          dataService.fetchAll('products').catch(err => {
            console.error('Error fetching products:', err);
            return [];
          }),
          dataService.fetchAll('categories').catch(err => {
            console.error('Error fetching categories:', err);
            return [];
          }),
          dataService.fetchAll('stores').catch(err => {
            console.error('Error fetching stores:', err);
            return [];
          }),
          fetchReservations().catch(err => {
            console.error('Error fetching reservations:', err);
            return [];
          })
        ]);

        console.log('Raw data from Supabase:', {
          eventsData,
          productsData,
          categoriesData,
          storesData,
          reservationsData
        });

        // Map database data to application types
        const mappedEvents = Array.isArray(eventsData)
          ? eventsData.map(mapDbEventToAppEvent)
          : [];

        const mappedProducts = Array.isArray(productsData)
          ? productsData.map(mapDbProductToAppProduct)
          : [];

        const mappedCategories = Array.isArray(categoriesData)
          ? categoriesData.map(mapDbCategoryToAppCategory)
          : [];

        const mappedStores = Array.isArray(storesData)
          ? storesData.map(mapDbStoreToAppStore)
          : [];

        console.log('Mapped data:', {
          events: mappedEvents,
          products: mappedProducts,
          categories: mappedCategories,
          stores: mappedStores
        });

        setEvents(mappedEvents);
        setProducts(mappedProducts);
        setCategories(mappedCategories);
        setStores(mappedStores);
        setReservations(reservationsData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debug currentEvent changes
  useEffect(() => {
    console.log('currentEvent changed:', currentEvent);
  }, [currentEvent]);

  // Set the first event as active by default if none is active
  useEffect(() => {
    // Only run this effect if we have events and no current event is set
    if (events && events.length > 0 && !currentEvent) {
      console.log('Initial events load. Total events:', events.length);
      const activeEvent = events.find(event => event.isActive) || events[0];
      console.log('Setting initial current event:', activeEvent);
      setCurrentEvent(activeEvent);
    } else if (events && events.length === 0) {
      console.warn('No events available to set as current event');
      setCurrentEvent(null);
    }
  }, [events, currentEvent]);

  // Update currentEvent if the active event changes in the events array
  useEffect(() => {
    if (events && events.length > 0 && currentEvent) {
      const activeEvent = events.find(event => event.isActive);
      if (activeEvent && activeEvent.id !== currentEvent.id) {
        console.log('Active event changed, updating current event:', activeEvent);
        setCurrentEvent(activeEvent);
      }
    }
  }, [events, currentEvent]);

  // Load predictions when currentEvent changes
  useEffect(() => {
    if (currentEvent) {
      fetchPredictions();
    }
  }, [currentEvent, fetchPredictions]);

  const addReservation = useCallback(async (reservation: Omit<GiftReservation, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'eventId'> & { eventId?: string }): Promise<GiftReservation | null> => {
    // Use provided eventId or fall back to currentEvent
    const targetEventId = reservation.eventId || currentEvent?.id;
    console.log('Attempting to make reservation. Event ID:', targetEventId, 'Current event:', currentEvent);
    
    if (!targetEventId) {
      const errorMsg = 'No se pudo determinar el evento para la reservación';
      console.error(errorMsg, { 
        providedEventId: reservation.eventId, 
        currentEventId: currentEvent?.id,
        availableEvents: events
      });
      throw new Error(errorMsg);
    }
    
    // Extract guest info and remove eventId from reservation
    const { eventId: _, ...reservationInfo } = reservation;
    
    try {

      // Validate required fields
      if (!reservation.guestName || reservation.guestName.trim() === '') {
        throw new Error('El nombre del invitado es requerido');
      }

      // Validate email format
      const guestEmail = reservation.guestEmail.trim().toLowerCase();
      if (!guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        throw new Error('Por favor ingrese un correo electrónico válido');
      }

      // Validate quantity
      if (reservation.quantity < 1) {
        throw new Error('La cantidad debe ser al menos 1');
      }

      // First, try to find existing guest
      const { data: existingGuest } = await supabase
        .from('guests')
        .select('*')
        .eq('email', guestEmail)
        .eq('event_id', targetEventId)
        .single();

      let guestData;

      // Manejar invitado existente
      if (existingGuest) {
        // Update existing guest
              const { error: updateError } = await supabase
          .from('guests')
                .update({
            name: reservation.guestName.trim(),
                  updated_at: new Date().toISOString()
                })
          .eq('id', existingGuest.id);
              
              if (updateError) throw updateError;
        // Use the existing guest data since the update doesn't return the updated row
        guestData = { ...existingGuest, name: reservation.guestName.trim() };
      } else {
        // Crear nuevo invitado
        const { data: newGuest, error: createError } = await supabase
          .from('guests')
          .insert({
            event_id: targetEventId,
            name: reservation.guestName.trim(),
            email: guestEmail,
            phone: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        guestData = newGuest;
      }

      if (!guestData) throw new Error('No se pudo crear o actualizar el invitado');

      // Prepare reservation data with proper typing
      const newReservationData = {
        guest_id: guestData.id,
        product_id: reservationInfo.productId,
        status: 'confirmed',
        quantity: reservationInfo.quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create reservation in database
      const { data: createdReservation, error: reservationError } = await supabase
        .from('reservations')
        .insert(newReservationData)
        .select()
        .single();

      if (reservationError) throw reservationError;
      if (!createdReservation) throw new Error('No se pudo crear la reserva');

      // Create the full reservation object
      const newReservation: GiftReservation = {
        id: createdReservation.id,
        eventId: targetEventId,
        productId: reservationInfo.productId,
        guestName: reservationInfo.guestName.trim(),
        guestEmail: guestEmail,
        quantity: reservationInfo.quantity,
        status: 'reserved',
        createdAt: createdReservation.created_at,
        updatedAt: createdReservation.updated_at
      };

      // Update local state
      setReservations(prev => [...prev, newReservation]);
      
      return newReservation;
      
    } catch (error) {
      console.error('Error adding reservation:', error);
      throw error;
    }
  }, [fetchReservations]);

  const addPrediction = useCallback(async (prediction: Omit<GenderPrediction, 'id' | 'createdAt' | 'guest_id'> & { guest_name: string; guest_email: string }) => {
    if (!currentEvent) {
      throw new Error('No hay un evento activo');
    }

    try {
      // Validate email first
      const guestEmail = prediction.guest_email.trim().toLowerCase();
      if (!guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        throw new Error('Por favor ingrese un correo electrónico válido');
      }

      // Check if guest exists by email and event
      const { data: existingGuest, error: fetchError } = await supabase
        .from('guests')
        .select('id, name')
        .eq('email', guestEmail)
        .eq('event_id', currentEvent.id)
        .maybeSingle();

      let guestId = existingGuest?.id;
      
      // If guest doesn't exist, create a new one
      if (!existingGuest || fetchError) {
        const { data: newGuest, error: createError } = await supabase
          .from('guests')
          .insert([
            {
              name: prediction.guest_name.trim(),
              email: guestEmail,
              event_id: currentEvent.id,
            },
          ])
          .select('id, name')
          .single();

        if (createError || !newGuest) {
          throw new Error('Error al crear el invitado: ' + (createError?.message || 'Error desconocido'));
        }
        
        guestId = newGuest.id;
      }

      if (!guestId) {
        throw new Error('No se pudo obtener el ID del invitado');
      }

      // Check if guest already has a prediction for this event
      const existingPrediction = predictions.find(
        p => p.guest_id === guestId && p.event_id === currentEvent.id
      );

      // Create the prediction data
      const predictionData = {
        event_id: currentEvent.id,
        guest_id: guestId,
        prediction: prediction.prediction,
        name_suggestion: prediction.name_suggestion?.trim() || '',
        message: prediction.message?.trim() || '',
        created_at: new Date().toISOString()
      };

      let result;

      if (existingPrediction) {
        // Show confirmation dialog for update
        const currentGender = existingPrediction.prediction === 'boy' ? 'Niño 👶' : 'Niña 👧';
        const newGender = prediction.prediction === 'boy' ? 'Niño 👶' : 'Niña 👧';

        const message = [
          'Ya tienes una predicción registrada para este evento.',
          '',
          '📌 Predicción actual:',
          `• Género: ${currentGender}`,
          `• Nombre: ${existingPrediction.name_suggestion || 'No especificado'}`,
          '',
          '✨ Nueva predicción:',
          `• Género: ${newGender}`,
          `• Nombre: ${prediction.name_suggestion || 'No especificado'}`,
          '',
          '¿Deseas actualizar tu predicción?',
          '(La predicción anterior será reemplazada)'
        ].join('\n');

        const confirmed = await showConfirmDialog(
          'Actualizar predicción',
          message,
          async () => {
            const updateData = {
              ...predictionData,
              updated_at: new Date().toISOString()
            };
            
            const { data: updatedPrediction, error: updateError } = await supabase
              .from('predictions')
              .update(updateData)
              .eq('id', existingPrediction.id)
              .select()
              .single();

            if (updateError || !updatedPrediction) {
              throw new Error('Error al actualizar la predicción: ' + (updateError?.message || 'Error desconocido'));
            }
            return updatedPrediction;
          }
        );

        if (!confirmed) {
          return existingPrediction;
        }

        // Update local state
        setPredictions(prev =>
          prev.map(p =>
            p.id === existingPrediction.id ? { ...p, ...predictionData } : p
          )
        );
        result = { ...existingPrediction, ...predictionData };
      } else {
        // Create new prediction
        const { data: newPrediction, error: predictionError } = await supabase
          .from('predictions')
          .insert(predictionData)
          .select()
          .single();

        if (predictionError || !newPrediction) {
          throw new Error('Error al guardar la predicción: ' + (predictionError?.message || 'Error desconocido'));
        }

        // Update local state
        setPredictions(prev => [...prev, newPrediction as GenderPrediction]);
        result = newPrediction;
      }

      return result as GenderPrediction;
    } catch (error) {
      console.error('Error adding prediction:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar la predicción';
      setError(errorMessage);
      throw error; // Re-throw to allow the caller to handle it
    }
  }, [currentEvent, predictions, setPredictions, showConfirmDialog]);

  const cancelReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  const getAvailableQuantity = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    const reservedQuantity = reservations
      .filter(r => r.productId === productId && r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.quantity || 1), 0);
      
    return Math.max(0, (product.maxQuantity || 1) - reservedQuantity);
  }, [products, reservations]);

  const isProductAvailable = useCallback((productId: string) => {
    return getAvailableQuantity(productId) > 0;
  }, [getAvailableQuantity]);

  const getProductReservations = useCallback((productId: string) => {
    return reservations.filter(r => r.productId === productId);
  }, [reservations]);

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === id ? { ...event, ...updates } : event
      )
    );
  };

  const setActiveEvent = (id: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event => ({
        ...event,
        isActive: event.id === id
      }))
    );
  };

  const refreshEvents = useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error refreshing events:', error);
        throw error;
      }
      
      if (data) {
        const mappedEvents = data.map(mapDbEventToAppEvent);
        setEvents(mappedEvents);
        
        // If there's a current event, update it with the latest data
        setCurrentEvent(prevCurrentEvent => {
          if (!prevCurrentEvent && mappedEvents.length > 0) {
            // If no current event, set the first one
            return mappedEvents[0];
          } else if (prevCurrentEvent) {
            // Otherwise, find and update the current event
            const updatedCurrentEvent = mappedEvents.find(event => event.id === prevCurrentEvent.id);
            return updatedCurrentEvent || prevCurrentEvent;
          }
          return prevCurrentEvent;
        });
      }
    } catch (error) {
      console.error('Error in refreshEvents:', error);
      throw error;
    }
  }, []);

    // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentEvent,
    events,
    products,
    categories,
    stores,
    reservations,
    predictions,
    selectedTheme,
    theme: selectedTheme,
    isLoading,
    error,
    setSelectedTheme,
    addReservation,
    addPrediction,
    cancelReservation,
    getAvailableQuantity,
    isProductAvailable,
    getProductReservations,
    updateEvent,
    setActiveEvent,
    showConfirmDialog,
    refreshEvents,
  }), [
    currentEvent,
    events,
    products,
    categories,
    stores,
    reservations,
    predictions,
    selectedTheme,
    isLoading,
    error,
    addReservation,
    addPrediction,
    getAvailableQuantity,
    isProductAvailable,
    getProductReservations,
    showConfirmDialog,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={confirmationConfig.onCancel}
        onConfirm={confirmationConfig.onConfirm}
        onCancel={confirmationConfig.onCancel}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        confirmText="Actualizar"
        cancelText="Cancelar"
        variant="default"
      />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
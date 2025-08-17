import React, { createContext, useContext, ReactNode } from 'react';
import { Event, Product, Category, Store, GiftReservation, GenderPrediction } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { mockEvents, mockEvent, products as mockProducts, categories, stores } from '../data/mockData';

type Theme = 'boy' | 'girl' | 'neutral';

interface AppContextType {
  currentEvent: Event;
  events: Event[];
  products: Product[];
  categories: Category[];
  stores: Store[];
  reservations: GiftReservation[];
  predictions: GenderPrediction[];
  selectedTheme: Theme;
  theme: Theme;
  setSelectedTheme: (theme: Theme) => void;
  addReservation: (reservation: Omit<GiftReservation, 'id' | 'createdAt'>) => void;
  addPrediction: (prediction: Omit<GenderPrediction, 'id' | 'createdAt'>) => void;
  cancelReservation: (id: string) => void;
  getAvailableQuantity: (productId: string) => number;
  isProductAvailable: (productId: string) => boolean;
  getProductReservations: (productId: string) => GiftReservation[];
  updateEvent: (id: string, updates: Partial<Event>) => void;
  setActiveEvent: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [reservations, setReservations] = useLocalStorage<GiftReservation[]>('gift-reservations', []);
  const [predictions, setPredictions] = useLocalStorage<GenderPrediction[]>('gender-predictions', []);
  const [selectedTheme, setSelectedTheme] = useLocalStorage<Theme>('selected-theme', 'neutral');
  const [events, setEvents] = useLocalStorage<Event[]>('events', mockEvents);
  
  const currentEvent = events.find(event => event.isActive) || events[0];

  const addReservation = (reservation: Omit<GiftReservation, 'id' | 'createdAt'>) => {
    const newReservation: GiftReservation = {
      ...reservation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'reserved'
    };
    setReservations(prev => [...prev, newReservation]);
  };

  const addPrediction = (prediction: Omit<GenderPrediction, 'id' | 'createdAt'>) => {
    const newPrediction: GenderPrediction = {
      ...prediction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setPredictions(prev => [...prev, newPrediction]);
  };

  const cancelReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  const getAvailableQuantity = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (!product?.maxQuantity) return 999;
    
    const totalReserved = reservations
      .filter(r => r.productId === productId && r.status === 'reserved')
      .reduce((sum, r) => sum + r.quantity, 0);
    
    return Math.max(0, product.maxQuantity - totalReserved);
  };

  const isProductAvailable = (productId: string) => {
    return getAvailableQuantity(productId) > 0;
  };

  const getProductReservations = (productId: string) => {
    return reservations.filter(r => r.productId === productId && r.status === 'reserved');
  };

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

  const value = {
    currentEvent,
    events,
    products: mockProducts,
    categories,
    stores,
    reservations,
    predictions,
    selectedTheme,
    theme: selectedTheme, // Alias for backward compatibility
    setSelectedTheme,
    addReservation,
    addPrediction,
    cancelReservation,
    getAvailableQuantity,
    isProductAvailable,
    getProductReservations,
    updateEvent,
    setActiveEvent,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
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
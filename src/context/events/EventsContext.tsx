import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/browser/useLocalStorage';
import { Event } from '../../features/event/types/events';
import { mockEvents } from '../../data/mockData';

interface EventsContextType {
  events: Event[];
  currentEvent: Event;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  setActiveEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: ReactNode;
  initialEvents?: Event[];
}

export function EventsProvider({ 
  children, 
  initialEvents = mockEvents 
}: EventsProviderProps) {
  const [events, setEvents] = useLocalStorage<Event[]>('events', initialEvents);
  
  const currentEvent = events.find(event => event.isActive) || events[0];

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === id ? { ...event, ...updates } : event
      )
    );
  }, [setEvents]);

  const setActiveEvent = useCallback((id: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => ({
        ...event,
        isActive: event.id === id
      }))
    );
  }, [setEvents]);

  const getEventById = useCallback((id: string) => {
    return events.find(event => event.id === id);
  }, [events]);

  const value = {
    events,
    currentEvent,
    updateEvent,
    setActiveEvent,
    getEventById
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}

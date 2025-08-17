// Tipos de eventos
export type {
  EventType,
  SectionType,
  SectionConfig,
  EventSections,
  Event,
  EventStats
} from '../features/event/types/events';

// Tipos de productos y categorías
export type {
  Category,
  Store,
  Product
} from '../features/gifts/types/products';

// Tipos de reservas
export type {
  GiftReservation
} from '../features/reservation/types/reservations';

// Tipos de predicciones
export type {
  GenderPrediction
} from '../features/predictions/types/predictions';

// Re-exportar todo para compatibilidad con importaciones existentes
export * from '../features/event/types/events';
export * from '../features/gifts/types/products';
export * from '../features/reservation/types/reservations';
export * from '../features/predictions/types/predictions';
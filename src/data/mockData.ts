import { Event, Category, Store, Product, EventType } from '../types';

import { EventSections, SectionConfig } from '../types';

// Secciones por defecto para cada tipo de evento
const defaultGenderRevealSections: EventSections = {
  countdown: {
    id: 'countdown' as const,
    enabled: true,
    title: 'Cuenta Regresiva',
    description: 'Muestra un contador para el evento',
    order: 1,
    config: { showDays: true, showHours: true, showMinutes: true }
  },
  predictions: {
    id: 'predictions' as const,
    enabled: true,
    title: 'Predicciones',
    description: 'Permite a los invitados predecir el género del bebé',
    order: 2,
    config: { allowNameSuggestions: true, showPredictions: true }
  },
  'gift-catalog': {
    id: 'gift-catalog' as const,
    enabled: true,
    title: 'Lista de Regalos',
    description: 'Catálogo de regalos para el bebé',
    order: 3,
    config: { showCategories: true, showStores: true }
  },
  wishes: {
    id: 'wishes' as const,
    enabled: true,
    title: 'Mensajes',
    description: 'Espacio para que los invitados dejen mensajes',
    order: 4,
    config: { maxLength: 500 }
  }
};

const defaultBabyShowerSections: EventSections = {
  countdown: {
    id: 'countdown' as const,
    enabled: true,
    title: 'Faltan',
    description: 'Cuenta regresiva para el baby shower',
    order: 1,
    config: { showDays: true, showHours: true, showMinutes: true }
  },
  'gift-catalog': {
    id: 'gift-catalog' as const,
    enabled: true,
    title: 'Lista de Regalos',
    description: 'Regalos que necesitamos para el bebé',
    order: 2,
    config: { showCategories: true, showStores: true }
  },
  'activity-voting': {
    id: 'activity-voting' as const,
    enabled: true,
    title: 'Votación de Actividades',
    description: 'Vota por las actividades que te gustaría hacer en el evento',
    order: 3,
    config: { maxVotes: 3, showResults: true }
  },
  raffle: {
    id: 'raffle' as const,
    enabled: true,
    title: 'Sorteo',
    description: 'Participa en nuestro sorteo especial',
    order: 4,
    config: { showPrizes: true, showWinners: true }
  },
  wishes: {
    id: 'wishes' as const,
    enabled: true,
    title: 'Dedicatorias',
    description: 'Deja un mensaje para los futuros papás',
    order: 5,
    config: { maxLength: 500 }
  }
};

export const mockEvents: Event[] = [
  {
    id: '1',
    type: 'gender-reveal',
    title: '¿Niño o Niña?',
    subtitle: 'Gender Reveal de Rocío y Moisés',
    date: '2025-09-15',
    time: '15:00',
    location: 'Casa de los abuelos - Av. Principal #123',
    description: '¡La gran revelación está cerca! Únete a nosotros para descubrir si nuestro bebé será un príncipe o una princesa. Haz tu predicción, sugiere un nombre y ayúdanos a preparar todo para la llegada de nuestro pequeño tesoro.',
    imageUrl: 'https://images.pexels.com/photos/1556652/pexels-photo-1556652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    sections: defaultGenderRevealSections
  },
  {
    id: '2',
    type: 'baby-shower',
    title: 'Baby Shower Especial',
    subtitle: 'Celebrando la llegada de nuestro bebé',
    date: '2025-10-20',
    time: '16:00',
    location: 'Salón de Eventos Las Gardenias',
    description: 'Únete a nosotros para celebrar la próxima llegada de nuestro pequeño milagro. Comparte con nosotros este momento tan especial.',
    imageUrl: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    isActive: false,
    createdAt: '2025-02-15T00:00:00Z',
    sections: defaultBabyShowerSections
  }
];

// For backward compatibility
export const mockEvent = mockEvents.find(event => event.isActive) || mockEvents[0];

export const categories: Category[] = [
  { id: '1', name: 'Pañales', icon: 'Baby', order: 1 },
  { id: '2', name: 'Ropita', icon: 'Shirt', order: 2 },
  { id: '3', name: 'Higiene', icon: 'Droplets', order: 3 },
  { id: '4', name: 'Alimentación', icon: 'Milk', order: 4 },
  { id: '5', name: 'Juguetes', icon: 'Gamepad2', order: 5 },
  { id: '6', name: 'Wipes', icon: 'Package', order: 6 }
];

export const stores: Store[] = [
  { id: '1', name: 'PriceSmart', website: 'https://pricesmart.com' },
  { id: '2', name: 'Sirena', website: 'https://sirena.do' },
  { id: '3', name: 'Jumbo', website: 'https://jumbo.com.do' },
  { id: '4', name: 'El Nacional', website: 'https://supermercadosnacional.com' },
  { id: '5', name: 'Amazon', website: 'https://amazon.com' }
];

// Mock data for guests
export const mockGuests = [
  {
    id: 'guest-1',
    event_id: '1',
    name: 'Ana García',
    email: 'ana.garcia@example.com',
    phone: '809-555-1234',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'guest-2',
    event_id: '1',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    phone: '809-555-5678',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'guest-3',
    event_id: '2',
    name: 'María López',
    email: 'maria.lopez@example.com',
    phone: '829-555-9012',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock data for predictions
export const mockPredictions = [
  {
    id: 'pred-1',
    event_id: '1',
    guest_id: 'guest-1',
    prediction: 'girl' as const,
    name_suggestion: 'Sofía',
    created_at: new Date().toISOString()
  },
  {
    id: 'pred-2',
    event_id: '1',
    guest_id: 'guest-2',
    prediction: 'boy' as const,
    name_suggestion: 'Mateo',
    created_at: new Date().toISOString()
  }
];

// Mock data for reservations
export const mockReservations = [
  {
    id: 'res-1',
    guest_id: 'guest-1',
    product_id: '1',
    status: 'confirmed' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'res-2',
    guest_id: 'guest-2',
    product_id: '2',
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Pañales Huggies Recién Nacido',
    categoryId: '1',
    storeId: '1',
    price: 15.99,
    imageUrl: 'https://res.cloudinary.com/deqtp71ut/image/upload/v1754699074/Detallazo%20WebSite/pa%C3%B1ales_sjjxbk.jpg',
    description: 'Paquete de 84 pañales talla RN',
    suggestedQuantity: 5,
    maxQuantity: 10,
    eventType: ['baby-shower', 'birth', 'gender-reveal'],
    isActive: true
  },
  {
    id: '2',
    name: 'Pañales Pampers Talla 1',
    categoryId: '1',
    storeId: '2',
    price: 18.50,
    imageUrl: 'https://res.cloudinary.com/deqtp71ut/image/upload/v1754699074/Detallazo%20WebSite/pa%C3%B1ales_sjjxbk.jpg',
    description: 'Paquete de 76 pañales talla 1',
    suggestedQuantity: 8,
    maxQuantity: 15,
    eventType: ['baby-shower', 'birth', 'gender-reveal'],
    isActive: true
  },
  {
    id: '3',
    name: 'Body Manga Larga',
    categoryId: '2',
    storeId: '3',
    price: 12.00,
    imageUrl: 'https://res.cloudinary.com/deqtp71ut/image/upload/v1754699334/Detallazo%20WebSite/white-baby-clothes-pink-background-copy-space_hozafb.jpg',
    description: 'Body 100% algodón talla 0-3 meses',
    suggestedQuantity: 3,
    maxQuantity: 6,
    eventType: ['baby-shower', 'birth', 'gender-reveal'],
    isActive: true
  },
  {
    id: '4',
    name: 'Shampoo Johnson\'s Baby',
    categoryId: '3',
    storeId: '1',
    price: 8.75,
    imageUrl: 'https://res.cloudinary.com/deqtp71ut/image/upload/v1754699222/Detallazo%20WebSite/1549_kn5yx8.jpg',
    description: 'Shampoo suave para bebé 400ml',
    suggestedQuantity: 2,
    maxQuantity: 4,
    eventType: ['baby-shower', 'birth', 'gender-reveal'],
    isActive: true
  },
  {
    id: '5',
    name: 'Biberón Avent 260ml',
    categoryId: '4',
    storeId: '4',
    price: 22.00,
    imageUrl: 'https://res.cloudinary.com/deqtp71ut/image/upload/v1754699755/Detallazo%20WebSite/10352129_i9yyft.jpg',
    description: 'Biberón anticólicos con tetina de silicona',
    suggestedQuantity: 1,
    maxQuantity: 3,
    eventType: ['baby-shower', 'birth', 'gender-reveal'],
    isActive: true
  },
  {
    id: '6',
    name: 'Kit juguetes',
    categoryId: '5',
    storeId: '5',
    price: 14.99,
    imageUrl: 'https://res.cloudinary.com/deqtp71ut/image/upload/v1754699856/Detallazo%20WebSite/vida-muerta-de-la-caja-postparto_iqpttn.jpg',
    suggestedQuantity: 1,
    maxQuantity: 2,
    eventType: ['baby-shower', 'birth', 'gender-reveal'],
    isActive: true
  },
  {
    id: '7',
    name: 'Toallas Húmedas Huggies',
    categoryId: '6',
    storeId: '1',
    price: 4.25,
    imageUrl: 'https://res.cloudinary.com/deqtp71ut/image/upload/v1754699998/Detallazo%20WebSite/envase-blanco-de-toallitas-humedas-aisladas_qzaq7d.jpg',
    description: 'Paquete de 80 toallas húmedas',
    suggestedQuantity: 6,
    maxQuantity: 12,
    eventType: ['baby-shower', 'birth', 'gender-reveal'],
    isActive: true
  },
  {
    id: '8',
    name: 'Pañales Talla 2 - Team Niña',
    categoryId: '1',
    storeId: '2',
    price: 19.99,
    imageUrl: 'https://res.cloudinary.com/deqtp71ut/image/upload/v1754699074/Detallazo%20WebSite/pa%C3%B1ales_sjjxbk.jpg', 
    description: 'Paquete especial para el equipo niña',
    suggestedQuantity: 4,
    maxQuantity: 8,
    eventType: ['gender-reveal'],
    isActive: true
  }
];
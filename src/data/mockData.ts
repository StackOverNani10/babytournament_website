import { Event, Category, Store, Product, EventType } from '../types';

export const mockEvent: Event = {
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
  createdAt: '2025-01-01T00:00:00Z'
};

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
  { id: '2', name: 'Sirena', website: 'https://sirena.com.pa' },
  { id: '3', name: 'Jumbo', website: 'https://jumbo.com.do' },
  { id: '4', name: 'El Nacional', website: 'https://supermercadosnacional.com' },
  { id: '5', name: 'Amazon', website: 'https://amazon.com' }
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
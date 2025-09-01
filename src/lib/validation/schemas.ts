import { z } from 'zod';
import type { EventType } from '../database.types';

export const eventSchema = z.object({
  type: z.enum(['gender-reveal', 'baby-shower', 'birth']) as z.ZodType<EventType>,
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  date: z.string().datetime(),
  time: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  sections: z.record(z.string(), z.any()).optional(),
});

export const guestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  phone: z.string().optional(),
  event_id: z.string().min(1, 'Event ID is required'),
  is_attending: z.boolean().default(true),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  image_url: z.string().url().optional(),
  event_id: z.string().uuid('Invalid event ID'),
  category_id: z.string().uuid('Invalid category ID').optional(),
  store_id: z.string().uuid('Invalid store ID').optional(),
  is_available: z.boolean().default(true),
});

export const reservationSchema = z.object({
  guest_id: z.string().uuid('Invalid guest ID'),
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
  notes: z.string().optional(),
});

export const predictionSchema = z.object({
  event_id: z.string().min(1, 'Event ID is required'),
  guest_id: z.string().uuid('Invalid guest ID'),
  prediction: z.string().min(1, 'Prediction is required'),
  name_suggestion: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  is_correct: z.boolean().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;
export type GuestInput = z.infer<typeof guestSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type PredictionInput = z.infer<typeof predictionSchema>;

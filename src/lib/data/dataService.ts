import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import type { Database } from '../database.types';
import { 
  eventSchema, 
  guestSchema, 
  productSchema, 
  reservationSchema, 
  predictionSchema,
  type EventInput,
  type GuestInput,
  type ProductInput,
  type ReservationInput,
  type PredictionInput
} from '../validation/schemas';
import { 
  handleError, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError,
  AppError,
  ConflictError
} from '../utils/errors';
import { cache } from '../utils/cache';

type TableName = keyof Database['public']['Tables'];

type InsertType<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type UpdateType<T extends TableName> = Database['public']['Tables'][T]['Update'];
type RowType<T extends TableName> = Database['public']['Tables'][T]['Row'];

type SubscriptionCallback<T extends Record<string, any>> = (payload: RealtimePostgresChangesPayload<T>) => void;
type UnsubscribeFunction = () => void;

// Type guards with proper error handling and type safety
const isEvent = (data: unknown): data is EventInput => {
  const result = eventSchema.safeParse(data);
  if (!result.success) {
    console.warn('Event validation failed:', result.error.format());
  }
  return result.success;
};

const isGuest = (data: unknown): data is GuestInput => {
  const result = guestSchema.safeParse(data);
  if (!result.success) {
    console.warn('Guest validation failed:', result.error.format());
  }
  return result.success;
};

const isProduct = (data: unknown): data is ProductInput => {
  const result = productSchema.safeParse(data);
  if (!result.success) {
    console.warn('Product validation failed:', result.error.format());
  }
  return result.success;
};

const isReservation = (data: unknown): data is ReservationInput => {
  const result = reservationSchema.safeParse(data);
  if (!result.success) {
    console.warn('Reservation validation failed:', result.error.format());
  }
  return result.success;
};

const isPrediction = (data: unknown): data is PredictionInput => {
  const result = predictionSchema.safeParse(data);
  if (!result.success) {
    console.warn('Prediction validation failed:', result.error.format());
  }
  return result.success;
};

export interface DataService {
  // Common methods for all tables
  fetchAll<T extends TableName>(
    table: T, 
    options?: { skipCache?: boolean }
  ): Promise<RowType<T>[]>;
  
  fetchById<T extends TableName>(
    table: T, 
    id: string, 
    options?: { skipCache?: boolean }
  ): Promise<RowType<T>>;
  
  create<T extends TableName>(
    table: T, 
    data: InsertType<T>,
    options?: { 
      validate?: boolean;
      invalidateQueries?: boolean;
    }
  ): Promise<RowType<T>>;
  
  update<T extends TableName>(
    table: T,
    id: string,
    data: UpdateType<T>,
    options?: {
      validate?: boolean;
      invalidateQueries?: boolean;
    }
  ): Promise<RowType<T>>;
  
  delete(
    table: TableName, 
    id: string,
    options?: { invalidateQueries?: boolean }
  ): Promise<boolean>;
  
  // Real-time subscriptions
  subscribe<T extends TableName>(
    table: T,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    filter: string,
    callback: SubscriptionCallback<RowType<T>>
  ): Promise<RealtimeChannel>;
  
  // Custom methods
  fetchByEventId<T extends TableName>(
    table: T, 
    eventId: string, 
    options?: { skipCache?: boolean }
  ): Promise<RowType<T>[]>;
  
  fetchEventWithDetails(
    eventId: string,
    options?: { skipCache?: boolean }
  ): Promise<{
    event: RowType<'events'>;
    guests: RowType<'guests'>[];
    products: RowType<'products'>[];
    categories: RowType<'categories'>[];
    stores: RowType<'stores'>[];
    predictions: RowType<'predictions'>[];
  }>;
  
  // Cache management
  invalidateQueries(table: TableName, id?: string): void;
}

class SupabaseDataService implements DataService {
  private activeSubscriptions: Map<string, RealtimeChannel> = new Map();
  
  private getCacheKey(table: TableName, id?: string, params: Record<string, any> = {}): string {
    return cache.generateKey(table, id ? { ...params, id } : params);
  }
  
  private invalidateTableCache(table: TableName): void {
    // This is a simple implementation that clears all cache for the table
    // In a real app, you might want to be more granular
    const prefix = `${table}:`;
    const keysToDelete: string[] = [];
    
    // @ts-ignore - private access to cache map
    for (const key of cache.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => cache.delete(key));
  }
  
  private validateData<T extends TableName>(
    table: T, 
    data: unknown,
    isUpdate: boolean = false
  ): asserts data is InsertType<T> | UpdateType<T> {
    if (!data || typeof data !== 'object') {
      throw new ValidationError(
        `Invalid ${table} data: Expected an object`,
        { _errors: ['Expected an object'] }
      );
    }

    let result;
    
    try {
      switch (table) {
        case 'events':
          result = eventSchema.safeParse(data);
          break;
        case 'guests':
          result = guestSchema.safeParse(data);
          break;
        case 'products':
          result = productSchema.safeParse(data);
          break;
        case 'reservations':
          result = reservationSchema.safeParse(data);
          break;
        case 'predictions':
          result = predictionSchema.safeParse(data);
          break;
        default:
          // For tables without schema, do basic validation
          if (isUpdate && !('id' in data)) {
            throw new ValidationError(
              `Missing required field 'id' for ${table} update`,
              { _errors: ['Missing required field: id'] }
            );
          }
          return;
      }

      if (result && !result.success) {
        const errorDetails = result.error.format();
        console.error(`Validation failed for ${table}:`, JSON.stringify({
          data,
          errors: errorDetails,
          issues: result.error.issues
        }, null, 2));
        throw new ValidationError(
          `Invalid ${table} data`,
          errorDetails
        );
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to validate ${table} data`,
        { _errors: ['Validation failed'] }
      );
    }
  }

  /**
   * Fetches all records from the specified table
   * @param table - The table name to fetch records from
   * @returns A promise that resolves to an array of records
   * @throws {NotFoundError} If no records are found
   * @throws {AppError} For other errors
   */
  async fetchAll<T extends TableName>(
    table: T, 
    options: { skipCache?: boolean } = {}
  ): Promise<RowType<T>[]> {
    const cacheKey = this.getCacheKey(table);
    
    // Try to get from cache first
    if (!options.skipCache) {
      const cached = cache.get<RowType<T>[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new NotFoundError(`No ${table} found`);
      }
      
      // Cache the result
      cache.set(cacheKey, data);
      
      return data as RowType<T>[];
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Fetches a single record by ID
   * @param table - The table name
   * @param id - The ID of the record to fetch
   * @returns A promise that resolves to the requested record
   * @throws {NotFoundError} If the record is not found
   * @throws {AppError} For other errors
   */
  async fetchById<T extends TableName>(
    table: T, 
    id: string, 
    options: { skipCache?: boolean } = {}
  ): Promise<RowType<T>> {
    const cacheKey = this.getCacheKey(table, id);
    
    // Try to get from cache first
    if (!options.skipCache) {
      const cached = cache.get<RowType<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          throw new NotFoundError(table, id);
        }
        throw error;
      }
      
      if (!data) {
        throw new NotFoundError(table, id);
      }
      
      // Cache the result
      cache.set(cacheKey, data);
      
      return data as RowType<T>;
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Creates a new record in the specified table
   * @param table - The table name
   * @param data - The data to insert
   * @param validate - Whether to validate the input data (default: true)
   * @returns A promise that resolves to the created record
   * @throws {ValidationError} If validation fails
   * @throws {AppError} For other errors
   */
  async create<T extends TableName>(
    table: T, 
    data: InsertType<T>,
    options: { 
      validate?: boolean;
      invalidateQueries?: boolean;
    } = { validate: true, invalidateQueries: true }
  ): Promise<RowType<T>> {
    try {
      if (options.validate ?? true) {
        this.validateData(table, data);
      }

      const { data: result, error } = await supabase
        .from(table)
        .insert(data as any)
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new ConflictError(`A ${table} with these details already exists`);
        }
        throw error;
      }
      
      if (!result) {
        throw new AppError(`Failed to create ${table}`);
      }
      
      // Invalidate relevant caches
      if (options.invalidateQueries ?? true) {
        this.invalidateTableCache(table);
      }
      
      return result as RowType<T>;
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Updates an existing record
   * @param table - The table name
   * @param id - The ID of the record to update
   * @param data - The data to update
   * @param options - Update options including validation and cache invalidation
   * @returns A promise that resolves to the updated record
   * @throws {NotFoundError} If the record is not found
   * @throws {ValidationError} If validation fails
   * @throws {AppError} For other errors
   */
  async update<T extends TableName>(
    table: T,
    id: string,
    data: UpdateType<T>,
    options: {
      validate?: boolean;
      invalidateQueries?: boolean;
    } = { validate: true, invalidateQueries: true }
  ): Promise<RowType<T>> {
    try {
      if (options.validate ?? true) {
        this.validateData(table, data, true);
      }

      // Prepare the data for update, ensuring JSON fields are properly handled
      const updateData = { ...data } as any;
      
      // Handle JSON fields like sections
      if (updateData.sections && typeof updateData.sections === 'object') {
        updateData.sections = JSON.stringify(updateData.sections);
      }

      // First try to update with returning the updated record
      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        // If we get a 406 or PGRST116 error, try a different approach
        if (updateError.code === 'PGRST116' || updateError.code === '406') {
          // First, check if the record exists
          const { data: existing } = await supabase
            .from(table)
            .select('id')
            .eq('id', id)
            .maybeSingle();

          if (!existing) {
            throw new NotFoundError(table, id);
          }

  // If it exists, try to update without returning the record
          const { error: updateWithoutReturnError } = await supabase
            .from(table)
            .update(updateData)
            .eq('id', id);

          if (updateWithoutReturnError) {
            throw new AppError(
              `Failed to update ${table} with id ${id}: ${updateWithoutReturnError.message}`,
              500,
              'UPDATE_ERROR',
              { details: updateWithoutReturnError }
            );
          }

          // If update was successful, fetch the updated record
          const { data: updated, error: fetchError } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError || !updated) {
            throw new AppError(
              `Failed to fetch updated ${table} with id ${id}`,
              500,
              'UPDATE_ERROR',
              { details: fetchError || 'No data returned' }
            );
          }

          // Invalidate caches if needed
          if (options.invalidateQueries ?? true) {
            this.invalidateTableCache(table);
            cache.delete(this.getCacheKey(table, id));
          }
          
          return updated as RowType<T>;
        }

        // If it's a different error, rethrow it
        throw updateError;
      }

      if (!result) {
        throw new NotFoundError(table, id);
      }

      // Invalidate caches if needed
      if (options.invalidateQueries ?? true) {
        this.invalidateTableCache(table);
        cache.delete(this.getCacheKey(table, id));
      }

      return result as RowType<T>;
    } catch (error) {
      if (error instanceof AppError || error instanceof NotFoundError) {
        throw error;
      }
      
      return handleError(error);
    }
  }

  /**
   * Deletes a record by ID
   * @param table - The table name
   * @param id - The ID of the record to delete
   * @returns A promise that resolves to true if the deletion was successful
   * @throws {NotFoundError} If the record is not found
   * @throws {AppError} For other errors
   */
  async delete(
    table: TableName, 
    id: string,
    options: { invalidateQueries?: boolean } = { invalidateQueries: true }
  ): Promise<boolean> {
    try {
      const { data: existing } = await supabase
        .from(table)
        .select('id')
        .eq('id', id)
        .single();
      
      if (!existing) {
        throw new NotFoundError(table, id);
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        if (error.code === '23503') { // Foreign key violation
          throw new ConflictError(
            `Cannot delete ${table} with ID ${id} because it is referenced by other records`
          );
        }
        throw error;
      }
      
      // Invalidate relevant caches
      if (options.invalidateQueries ?? true) {
        this.invalidateTableCache(table);
        cache.delete(this.getCacheKey(table, id));
      }
      
      return true;
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Fetches all records associated with a specific event
   * @param table - The table name
   * @param eventId - The event ID to filter by
   * @returns A promise that resolves to an array of records
   * @throws {NotFoundError} If no records are found for the event
   * @throws {AppError} For other errors
   */
  async fetchByEventId<T extends TableName>(
    table: T, 
    eventId: string, 
    options: { skipCache?: boolean } = {}
  ): Promise<RowType<T>[]> {
    const cacheKey = this.getCacheKey(table, undefined, { eventId });
    
    // Try to get from cache first
    if (!options.skipCache) {
      const cached = cache.get<RowType<T>[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new NotFoundError(`${table} for event ${eventId}`);
      }
      
      // Cache the result
      cache.set(cacheKey, data);
      
      return data as RowType<T>[];
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Fetches an event with all its associated data
   * @param eventId - The ID of the event to fetch
   * @returns A promise that resolves to an object containing the event and all related data
   * @throws {NotFoundError} If the event is not found
   * @throws {AppError} For other errors
   */
  async fetchEventWithDetails(
    eventId: string,
    options: { skipCache?: boolean } = {}
  ) {
    const cacheKey = this.getCacheKey('events', eventId, { details: true });
    
    // Try to get from cache first
    if (!options.skipCache) {
      const cached = cache.get<{
        event: RowType<'events'>;
        guests: RowType<'guests'>[];
        products: RowType<'products'>[];
        categories: RowType<'categories'>[];
        stores: RowType<'stores'>[];
        predictions: RowType<'predictions'>[];
      }>(cacheKey);
      
      if (cached) {
        return cached;
      }
    }
    
    try {
      const [event, guests, products, categories, stores, predictions] = await Promise.all([
        this.fetchById('events', eventId, options),
        this.fetchByEventId('guests', eventId, options).catch(() => []), // Return empty array if no guests
        this.fetchByEventId('products', eventId, options).catch(() => []), // Return empty array if no products
        this.fetchAll('categories', options).catch(() => []), // Return empty array if no categories
        this.fetchAll('stores', options).catch(() => []), // Return empty array if no stores
        this.fetchByEventId('predictions', eventId, options).catch(() => []), // Return empty array if no predictions
      ]);

      const result = {
        event,
        guests,
        products,
        categories,
        stores,
        predictions,
      };
      
      // Cache the result
      cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      return handleError(error);
    }
  }
  
  /**
   * Subscribe to real-time changes for a table
   * @param table - The table to subscribe to
   * @param event - The event type to listen for ('INSERT', 'UPDATE', 'DELETE', or '*' for all)
   * @param filter - The filter to apply (e.g., 'event_id=eq.1')
   * @param callback - The callback function to call when an event occurs
   * @returns A promise that resolves to the real-time channel
   */
  async subscribe<T extends TableName>(
    table: T,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    filter: string,
    callback: SubscriptionCallback<RowType<T>>
  ): Promise<RealtimeChannel> {
    try {
      const channel = supabase.channel(`${table}_changes`);
      
      // Use type assertion to bypass the type checking for the event type
      const eventType = event === '*' ? '*' : event.toLowerCase() as 'insert' | 'update' | 'delete';
      
      // Set up the subscription with proper typing
      channel
        .on('postgres_changes' as any, {
          event: eventType,
          schema: 'public',
          table: table.toString(),
          ...(filter && { filter })
        }, (payload: RealtimePostgresChangesPayload<RowType<T>>) => {
          // Invalidate relevant caches when data changes
          this.invalidateTableCache(table);
          
          // Call the provided callback
          callback(payload);
        })
        .subscribe();
      
      // Store the subscription for later cleanup
      const subscriptionKey = `${table}:${event}:${filter}`;
      this.activeSubscriptions.set(subscriptionKey, channel);
      
      return channel;
    } catch (error) {
      return handleError(error);
    }
  }
  
  /**
   * Invalidate cache for specific queries
   * @param table - The table to invalidate cache for
   * @param id - Optional ID to invalidate a specific record
   */
  invalidateQueries(table: TableName, id?: string): void {
    if (id) {
      // Invalidate specific ID cache
      cache.delete(this.getCacheKey(table, id));
    } else {
      // Invalidate all caches for the table
      this.invalidateTableCache(table);
    }
  }
}

// Mock implementation for testing
class MockDataService implements DataService {
  private mockData: Record<TableName, any[]> = {
    events: [],
    guests: [],
    products: [],
    categories: [],
    stores: [],
    reservations: [],
    event_sections: [],
    predictions: [],
  };

  async fetchAll<T extends TableName>(table: T): Promise<RowType<T>[]> {
    return [...this.mockData[table]] as RowType<T>[];
  }

  async fetchById<T extends TableName>(table: T, id: string): Promise<RowType<T>> {
    const item = this.mockData[table].find((item: any) => item.id === id);
    if (!item) {
      throw new Error(`Record with ID ${id} not found in ${table}`);
    }
    return item as RowType<T>;
  }

  async create<T extends TableName>(
    table: T,
    data: InsertType<T>
  ): Promise<RowType<T>> {
    const now = new Date().toISOString();
    const newItem = {
      ...data,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    this.mockData[table].push(newItem);
    return newItem as RowType<T>;
  }

  async update<T extends TableName>(
    table: T,
    id: string,
    data: UpdateType<T>
  ): Promise<RowType<T>> {
    const index = this.mockData[table].findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${table}`);
    }
    this.mockData[table][index] = { ...this.mockData[table][index], ...data };
    return this.mockData[table][index];
  }

  async delete(table: TableName, id: string): Promise<boolean> {
    const initialLength = this.mockData[table].length;
    this.mockData[table] = this.mockData[table].filter((item) => item.id !== id);
    return this.mockData[table].length < initialLength;
  }

  async fetchByEventId<T extends TableName>(table: T, eventId: string): Promise<RowType<T>[]> {
    return this.mockData[table].filter((item) => item.event_id === eventId) as RowType<T>[];
  }

  async fetchEventWithDetails(
    eventId: string,
    options: { skipCache?: boolean } = {}
  ) {
    const event = await this.fetchById('events', eventId);
    // fetchById will throw an error if event is not found, so we don't need to check for null

    const [guests, products, categories, stores, predictions] = await Promise.all([
      this.fetchByEventId('guests', eventId),
      this.fetchByEventId('products', eventId),
      this.fetchAll('categories'),
      this.fetchAll('stores'),
      this.fetchByEventId('predictions', eventId),
    ]);

    return {
      event: event as RowType<'events'>,
      guests: guests as RowType<'guests'>[],
      products: products as RowType<'products'>[],
      categories: categories as RowType<'categories'>[],
      stores: stores as RowType<'stores'>[],
      predictions: predictions as RowType<'predictions'>[],
    };
  }

  // Mock implementation of subscribe method
  async subscribe<T extends TableName>(
    _table: T,
    _event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    _filter: string,
    _callback: SubscriptionCallback<RowType<T>>
  ): Promise<RealtimeChannel> {
    // In a real implementation, this would set up a subscription
    // For the mock, we'll just return a mock channel
    return {
      channel: {
        topic: `${_table}:${_event}:${_filter}`,
        send: () => {},
        on: () => {},
        off: () => {},
        unsubscribe: () => {}
      },
      on: () => ({}),
      off: () => {},
      send: () => ({}),
      subscribe: () => ({}),
      unsubscribe: () => {}
    } as unknown as RealtimeChannel;
  }

  // Mock implementation of invalidateQueries method
  invalidateQueries(table: TableName, id?: string): void {
    // In a real implementation, this would invalidate the cache for the specified table/record
    // For the mock, we don't need to do anything as we're not caching
    console.log(`[Mock] Invalidating cache for ${table}${id ? `#${id}` : ''}`);
  }
}

// Factory function to get the appropriate service
export function getDataService(): DataService {
  const useMock = String(import.meta.env.VITE_USE_MOCK_DATA).toLowerCase() === 'true';
  
  console.log('Environment Variables:', {
    VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
    useMock
  });
  
  if (useMock) {
    console.log('Using MOCK data service');
    return new MockDataService();
  }
  
  console.log('Using SUPABASE data service');
  return new SupabaseDataService();
}

export const dataService = getDataService();

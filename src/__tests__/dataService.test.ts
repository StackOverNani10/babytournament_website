import { dataService } from '../lib/data/dataService';
import { supabase } from '../lib/supabase/client';
import { cache } from '../lib/utils/cache';

// Create a mock implementation that matches the Supabase client structure
const createMockSupabaseClient = () => {
  return {
    from: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    })),
    channel: jest.fn().mockReturnThis(),
  };
};

// Mock Supabase client
jest.mock('../lib/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

// Mock the data service to avoid circular dependencies
jest.mock('../lib/data/dataService', () => {
  const originalModule = jest.requireActual('../lib/data/dataService');
  return {
    ...originalModule,
    dataService: {
      ...originalModule.dataService,
      // Add any additional mocks or overrides here
    },
  };
});

// Mock cache
jest.mock('../lib/utils/cache');

describe('DataService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset cache mock
    (cache.get as jest.Mock).mockReset();
    (cache.set as jest.Mock).mockReset();
    (cache.delete as jest.Mock).mockReset();
  });

  describe('fetchAll', () => {
    it('should fetch all items from a table', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          data: mockData,
          error: null,
        })
      }));

      const result = await dataService.fetchAll('events');
      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('events');
      expect(cache.set).toHaveBeenCalledWith('events', mockData);
    });

    it('should handle errors when fetching items', async () => {
      const errorMessage = 'Error fetching items';
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          data: null,
          error: { message: errorMessage },
        })
      }));

      await expect(dataService.fetchAll('events')).rejects.toThrow(errorMessage);
    });

    it('should return cached data if available', async () => {
      const cachedData = [{ id: '1', name: 'Cached Event' }];
      (cache.get as jest.Mock).mockReturnValueOnce(cachedData);

      const result = await dataService.fetchAll('events');
      expect(result).toBe(cachedData);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('fetchById', () => {
    it('should fetch an item by id', async () => {
      const mockItem = { id: '1', name: 'Test Event' };
      
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockItem,
          error: null,
        }),
      }));

      const result = await dataService.fetchById('events', '1');
      expect(result).toEqual(mockItem);
      expect(supabase.from).toHaveBeenCalledWith('events');
      expect(cache.set).toHaveBeenCalledWith('events:1', mockItem);
    });

    it('should return cached item if available', async () => {
      const cachedItem = { id: '1', name: 'Cached Event' };
      (cache.get as jest.Mock).mockReturnValueOnce(cachedItem);

      const result = await dataService.fetchById('events', '1');
      expect(result).toBe(cachedItem);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should throw an error when item not found', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Item not found' },
        }),
      }));

      await expect(dataService.fetchById('events', '999')).rejects.toThrow('Item not found');
    });
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const newEvent = {
        type: 'gender-reveal' as const,
        title: 'Test Gender Reveal',
        date: '2025-12-31',
        location: 'Test Location',
        user_id: 'user-123',
        isActive: true,
        createdAt: new Date().toISOString(),
        sections: {}
      };
      const createdEvent = { id: 'event-123', ...newEvent };
      
      (supabase.from as jest.Mock).mockImplementation(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: createdEvent,
            error: null,
          }),
        }),
      }));

      const result = await dataService.create('events', newEvent);
      expect(result).toEqual(createdEvent);
      expect(cache.delete).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      const updates = { 
        title: 'Updated Event Title',
        location: 'Updated Location' 
      };
      const updatedItem = { 
        id: '1',
        type: 'baby-shower' as const,
        title: 'Updated Event Title',
        date: '2025-12-31',
        location: 'Updated Location',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        sections: {}
      };
      
      (supabase.from('events').select as jest.Mock).mockReturnValueOnce({
        data: { 
          id: '1',
          type: 'baby-shower',
          title: 'Original Title',
          date: '2025-12-31',
          location: 'Original Location',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          sections: {}
        },
        error: null,
      });
      
      (supabase.from('events').update as jest.Mock).mockReturnValueOnce({
        data: updatedItem,
        error: null,
      });

      const result = await dataService.update('events', '1', updates);
      expect(result).toEqual(updatedItem);
      expect(supabase.from('events').update).toHaveBeenCalledWith(updates);
      expect(cache.delete).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an item', async () => {
      (supabase.from('events').select as jest.Mock).mockReturnValueOnce({
        data: { 
          id: '1',
          type: 'baby-shower',
          title: 'Event to Delete',
          date: '2025-12-31',
          location: 'Test Location',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          sections: {}
        },
        error: null,
      });
      
      (supabase.from('events').delete as jest.Mock).mockReturnValueOnce({
        error: null,
      });

      const result = await dataService.delete('events', '1');
      expect(result).toBe(true);
      expect(supabase.from('events').delete).toHaveBeenCalled();
      expect(cache.delete).toHaveBeenCalled();
    });
  });

  describe('fetchByEventId', () => {
    it('should fetch items by event id', async () => {
      const mockItems = [{ id: '1', event_id: 'event1' }];
      (supabase.from('guests').select as jest.Mock).mockReturnValueOnce({
        data: mockItems,
        error: null,
      });

      const result = await dataService.fetchByEventId('guests', 'event1');
      expect(result).toEqual(mockItems);
      expect(supabase.from('guests').select).toHaveBeenCalled();
    });
  });

  describe('fetchEventWithDetails', () => {
    it('should fetch event with all related data', async () => {
      const mockEvent = { id: '1', name: 'Event 1' };
      const mockGuests = [{ id: '1', event_id: '1', name: 'Guest 1' }];
      const mockProducts = [{ id: '1', event_id: '1', name: 'Product 1' }];
      const mockCategories = [{ id: '1', name: 'Category 1' }];
      const mockStores = [{ id: '1', name: 'Store 1' }];
      const mockPredictions = [{ id: '1', event_id: '1', prediction: 'Test' }];

      // Mock all the individual fetch calls
      (supabase.from as jest.Mock).mockImplementation((table) => {
        switch (table) {
          case 'events':
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValueOnce({ data: mockEvent, error: null }),
            };
          case 'guests':
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValueOnce({ data: mockGuests, error: null }),
            };
          case 'products':
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValueOnce({ data: mockProducts, error: null }),
            };
          case 'categories':
            return {
              select: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValueOnce({ data: mockCategories, error: null }),
            };
          case 'stores':
            return {
              select: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValueOnce({ data: mockStores, error: null }),
            };
          case 'predictions':
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValueOnce({ data: mockPredictions, error: null }),
            };
          default:
            return {
              select: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
            };
        }
      });

      const result = await dataService.fetchEventWithDetails('1');
      
      expect(result).toEqual({
        event: mockEvent,
        guests: mockGuests,
        products: mockProducts,
        categories: mockCategories,
        stores: mockStores,
        predictions: mockPredictions,
      });
    });
  });

  describe('subscribe', () => {
    it('should subscribe to table changes', async () => {
      const mockChannel = { on: jest.fn().mockReturnThis(), subscribe: jest.fn() };
      const callback = jest.fn();
      const tableName = 'events';
      const eventId = '1';
      
      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
      
      await dataService.subscribe(tableName, 'INSERT', `event_id=eq.${eventId}`, callback);
      
      expect(supabase.channel).toHaveBeenCalledWith(`${tableName}_changes`);
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName,
          filter: { filter: `event_id=eq.${eventId}` },
        },
        expect.any(Function)
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe('invalidateQueries', () => {
    it('should invalidate cache for a table', () => {
      const tableName = 'test';
      // Accessing private method for testing
      (dataService as any).invalidateQueries(tableName);
      expect(cache.delete).toHaveBeenCalledWith(tableName);
      expect(cache.delete).toHaveBeenCalledWith(expect.stringContaining(`${tableName}:`));
    });
  });
});

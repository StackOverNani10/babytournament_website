interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number; // in milliseconds

  private constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param data - The data to cache
   * @param ttl - Time to live in milliseconds (optional, uses default if not provided)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      data,
      expiresAt
    });
  }

  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached data or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }

    // Check if the item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return item.data as T;
  }

  /**
   * Remove an item from the cache
   * @param key - The cache key to remove
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Generate a cache key based on table and parameters
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}:${value}`)
      .join('&');
    
    return `${prefix}:${sortedParams}`;
  }
}

export const cache = CacheService.getInstance();

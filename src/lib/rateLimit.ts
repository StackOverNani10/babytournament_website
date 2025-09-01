import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export const rateLimit = (options?: Options) => {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 1 minute by default
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        
        tokenCount[0] += 1;
        
        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;
        
        // Add rate limit headers
        const headers = new Headers();
        headers.set('X-RateLimit-Limit', limit.toString());
        headers.set('X-RateLimit-Remaining', isRateLimited ? '0' : (limit - currentUsage).toString());
        
        return isRateLimited ? reject(new Error('Rate limit exceeded')) : resolve();
      }),
  };
};

// Client-side rate limiting utility
export const clientRateLimit = {
  // Track the last request time for each endpoint
  lastRequestTimes: new Map<string, number>(),
  
  // Default rate limit: 1 request per second per endpoint
  check: async (endpoint: string, minInterval: number = 1000): Promise<boolean> => {
    const now = Date.now();
    const lastRequestTime = clientRateLimit.lastRequestTimes.get(endpoint) || 0;
    
    if (now - lastRequestTime < minInterval) {
      return false;
    }
    
    clientRateLimit.lastRequestTimes.set(endpoint, now);
    return true;
  },
  
  // Clear rate limit for a specific endpoint
  clear: (endpoint: string) => {
    clientRateLimit.lastRequestTimes.delete(endpoint);
  },
  
  // Clear all rate limits
  clearAll: () => {
    clientRateLimit.lastRequestTimes.clear();
  },
};

// Server-side rate limiting middleware
export const rateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
});

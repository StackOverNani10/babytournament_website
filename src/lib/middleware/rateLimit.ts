import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';

// Properly type the Response to include Express response methods
interface Response extends ExpressResponse {
  header(field: string, value: string): this;
  status(code: number): this;
  json(body: any): this;
}

// Extend the Request type to include the necessary properties
interface Request extends ExpressRequest {
  ip?: string;
  headers: {
    [key: string]: string | string[] | undefined;
    'x-real-ip'?: string;
    'x-forwarded-for'?: string;
    'authorization'?: string | string[];
  };
}
import { Redis } from '@upstash/redis';
import { supabase } from '@/lib/supabase/client';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limiting configuration
const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 100, // Max requests per window
};

// IP-based rate limiting
const rateLimitByIp = async (ip: string) => {
  const key = `rate_limit:ip:${ip}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    // Set expiry only on first request in the window
    await redis.expire(key, RATE_LIMIT.WINDOW_MS / 1000);
  }
  
  return {
    current,
    remaining: Math.max(0, RATE_LIMIT.MAX_REQUESTS - current),
    reset: Math.ceil((Date.now() + RATE_LIMIT.WINDOW_MS) / 1000),
    limit: RATE_LIMIT.MAX_REQUESTS,
  };
};

// User-based rate limiting (if authenticated)
const rateLimitByUser = async (userId: string) => {
  const key = `rate_limit:user:${userId}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    // Set expiry only on first request in the window
    await redis.expire(key, RATE_LIMIT.WINDOW_MS / 1000);
  }
  
  return {
    current,
    remaining: Math.max(0, RATE_LIMIT.MAX_REQUESTS - current),
    reset: Math.ceil((Date.now() + RATE_LIMIT.WINDOW_MS) / 1000),
    limit: RATE_LIMIT.MAX_REQUESTS,
  };
};

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Get client IP
  const ip = req.ip || req.headers['x-real-ip'] || (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';
  
  // Get user ID if authenticated
  const authHeader = req.headers['authorization'];
  const authToken = authHeader ? (Array.isArray(authHeader) ? authHeader[0] : authHeader).split(' ')[1] : null;
  const userId = authToken ? await getUserIdFromToken(authToken) : null;
  
  try {
    let rateLimitInfo;
    
    if (userId) {
      // Apply user-based rate limiting for authenticated users
      rateLimitInfo = await rateLimitByUser(userId);
    } else {
      // Fall back to IP-based rate limiting for unauthenticated users
      rateLimitInfo = await rateLimitByIp(ip);
    }
    
    // Set rate limit headers
    res.header('X-RateLimit-Limit', rateLimitInfo.limit.toString());
    res.header('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
    res.header('X-RateLimit-Reset', rateLimitInfo.reset.toString());
    
    // Check if rate limit is exceeded
    if (rateLimitInfo.current > rateLimitInfo.limit) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open in case of Redis errors to avoid blocking traffic
    next();
  }
};

// Helper function to get user ID from token
async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    // Verify the token and extract user ID
    // This is a placeholder - implement your actual token verification logic
    const { data: { user } } = await supabase.auth.getUser(token);
    return user?.id || null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

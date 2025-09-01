import { Request, Response, NextFunction } from 'express';

type ResponseWithStatus = Response & {
  status: (code: number) => ResponseWithStatus;
  json: (body?: any) => ResponseWithStatus;
};

type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
  | 'FORBIDDEN'
  | 'UNAUTHORIZED';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public type: ErrorType = 'INTERNAL_SERVER_ERROR',
    public details?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 400, 'VALIDATION_ERROR', { errors });
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('Too many requests, please try again later', 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request & { path: string; method: string },
  res: ResponseWithStatus,
  _next: NextFunction // Prefix with underscore to indicate it's intentionally unused
) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle different error types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        type: err.type,
        details: err.details,
      },
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        type: 'AUTH_ERROR',
      },
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      type: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request & { method: string; path: string }, res: ResponseWithStatus) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.path}`,
      type: 'NOT_FOUND',
    },
  });
};

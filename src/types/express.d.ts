import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request extends ExpressRequest {
      user?: {
        id: string;
        email: string;
        role: 'admin' | 'user';
      };
    }
    
    interface Response extends ExpressResponse {
      // Add any custom response properties here
    }
  }
}

export {};

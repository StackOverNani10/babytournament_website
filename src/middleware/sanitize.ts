import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { AppError } from '@/lib/errors';

export const sanitizeInput = (fields: string | string[]): ValidationChain[] => {
  const fieldArray = Array.isArray(fields) ? fields : [fields];
  
  return fieldArray.map(field => 
    body(field)
      .trim()
      .escape()
      .notEmpty()
      .withMessage(`${field} is required`)
  );
};

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map((err: any) => ({
      field: err.path || err.param || 'unknown',
      message: err.msg,
    }));

    throw new AppError(
      'Validation failed', 
      400, 
      'VALIDATION_ERROR', 
      { errors: errorMessages }
    );
  };
};

interface RequestBody {
  [key: string]: any;
}

interface QueryParams {
  [key: string]: any;
}

export const sanitizeRequest = (req: Request<{}, any, RequestBody, QueryParams> & { body: RequestBody, query: QueryParams }, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string).trim();
      }
    });
  }
  
  next();
};

// Common validation rules
export const commonValidations = {
  email: body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address'),
    
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
    
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
};

// XSS Protection middleware
export const xssProtection = (req: Request, res: Response & { setHeader: (name: string, value: string) => Response }, next: NextFunction) => {
  // Set security headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
};

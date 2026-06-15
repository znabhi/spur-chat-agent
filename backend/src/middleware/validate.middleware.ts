import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../types/errors';

// Augment express Request to carry validated data
declare global {
  namespace Express {
    interface Request {
      validated?: unknown;
    }
  }
}

// Reusable middleware factory — one schema per route
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      ...req.body,
      ...req.params,
      ...req.query,
    });

    if (!result.success) {
      return next(new ValidationError(result.error.errors[0]?.message ?? 'Invalid input'));
    }

    req.validated = result.data;
    next();
  };
}

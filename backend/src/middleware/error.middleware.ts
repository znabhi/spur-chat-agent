import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';
import { ZodError } from 'zod';
import { config } from '../config/env';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Always log the real error internally
  console.error(`[error] ${new Date().toISOString()} ${err.name}: ${err.message}`);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  // Known application errors — use their statusCode and userMessage
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.userMessage });
    return;
  }

  // Zod validation errors (from validate middleware)
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.errors[0]?.message ?? 'Invalid input' });
    return;
  }

  // Unknown errors — generic message, never leak internals
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
}

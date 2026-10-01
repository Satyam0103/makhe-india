import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  logger.error(`[API Error] ${req.method} ${req.path} - ${message}`);

  if (!isProd && err.stack) {
    console.error(err.stack);
  }

  // Never expose raw internal stack traces to production clients
  return res.status(statusCode).json({
    success: false,
    message,
    errors: isProd ? [] : (err.errors || [message]),
  });
}

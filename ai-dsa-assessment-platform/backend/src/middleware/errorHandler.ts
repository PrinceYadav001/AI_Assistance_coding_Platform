import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  errors?: unknown[];
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  // Never expose stack traces in production
  const response: Record<string, unknown> = {
    success: false,
    message,
    code,
    errors: err.errors || [],
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  console.error(`[ERROR] ${statusCode} - ${message}`, {
    code,
    errors: err.errors,
  });

  res.status(statusCode).json(response);
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
}

export function createError(message: string, statusCode: number, code: string, errors?: unknown[]): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  err.errors = errors;
  return err;
}

import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI request limit exceeded, please wait',
    code: 'AI_RATE_LIMIT_EXCEEDED',
  },
});

export const executionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Code execution limit exceeded',
    code: 'EXECUTION_RATE_LIMIT_EXCEEDED',
  },
});

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const requestId = Math.random().toString(36).substring(2, 10);
  (req as Request & { requestId: string }).requestId = requestId;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${requestId}] ${req.method} ${req.path}`);
  }
  next();
}

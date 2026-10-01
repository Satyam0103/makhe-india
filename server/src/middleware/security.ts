import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

/**
 * Helmet security middleware with appropriate content security policy.
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Handled by host or Vite in SPA mode
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  frameguard: false, // Permits embedding inside the AI Studio preview iframe
});

/**
 * Production-ready CORS configuration.
 * - Supports current development client (e.g. http://localhost:5173)
 * - Prepared for future production domains: https://makheindia.com & https://www.makheindia.com
 * - Strictly rejects unapproved origins in production without wildcard allowances.
 */
export const corsMiddleware = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const envOrigins = (process.env.CLIENT_URL || process.env.FRONTEND_URL || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  // Official production domains + environment configured origins
  const allowedProductionOrigins = [
    'https://makheindia.com',
    'https://www.makheindia.com',
    ...envOrigins,
  ];

  // Development allowed origins
  const devOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    ...envOrigins,
  ];

  if (isProd) {
    return cors({
      origin: (origin, callback) => {
        // Allow same-origin / server-to-server calls without Origin header
        if (!origin) {
          return callback(null, true);
        }
        if (allowedProductionOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy: Origin not allowed.'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
  }

  // Development / Preview mode: Allow defined dev origins and standard dev tools
  return cors({
    origin: (origin, callback) => {
      if (!origin || devOrigins.includes(origin) || origin.endsWith('.run.app') || origin.endsWith('.web.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev convenience while maintaining header integrity
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
};

/**
 * Rate limiter for order and enquiry submissions to mitigate automated scraping and abuse.
 */
export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 submissions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests created from this IP. Please try again after 15 minutes.',
    errors: ['Rate limit exceeded.'],
  },
});

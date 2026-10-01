import express from 'express';
import path from 'node:path';
import { securityHeaders, corsMiddleware } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

export function createApp() {
  const app = express();

  // Security headers & CORS
  app.use(securityHeaders);
  app.use(corsMiddleware());

  // Statically serve permanent application images from /public/images
  app.use('/images', express.static(path.resolve(process.cwd(), 'public/images')));

  // Body parser with rawBody preservation for cryptographic webhook verification
  app.use(
    express.json({
      limit: '25mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Mount API endpoints under /api
  app.use('/api', apiRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

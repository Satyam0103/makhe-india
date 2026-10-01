import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hostinger / Cloud platform port detection with 3000 default
const PORT = Number(process.env.PORT) || 3000;

export async function startProductionServer() {
  const app = express();

  // Mount API backend from server/src/app (handles /api/*, /images, security, CORS, etc.)
  const apiApp = createApp();
  app.use(apiApp);

  // Locate compiled client files in dist/client or fallback to dist
  const clientDir = fs.existsSync(path.resolve(process.cwd(), 'dist/client'))
    ? path.resolve(process.cwd(), 'dist/client')
    : fs.existsSync(path.resolve(__dirname, '../client'))
    ? path.resolve(__dirname, '../client')
    : path.resolve(process.cwd(), 'dist');

  logger.info(`[Production] Serving compiled static frontend from: ${clientDir}`);

  // Serve static assets from compiled frontend
  app.use(express.static(clientDir));

  // Serve permanent brand / public assets if present
  const publicDir = path.resolve(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  // SPA fallback for all non-API GET routes (including /admin, /admin/login, /admin/orders/:id, etc.)
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/images')) {
      return next();
    }
    const indexHtml = path.resolve(clientDir, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      next();
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`[Server] Makhé India Production Server listening on port ${PORT}`);
    logger.info(`[Server] Environment: ${process.env.NODE_ENV || 'production'}`);
    // Connect to database
    connectDB().catch((err) => {
      logger.warn('[Database] Background database initialization note:', err?.message || 'Database notice');
    });
  });
}

startProductionServer().catch((err) => {
  logger.error('[Production] Fatal server startup error:', err);
  process.exit(1);
});

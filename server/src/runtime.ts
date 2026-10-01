import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { createServer as createViteServer } from 'vite';
import { createApp } from './app';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT) || 3000;

export async function bootstrapServer() {
  const app = express();

  // Mount API backend from server/src/app
  const apiApp = createApp();
  app.use(apiApp);

  // In production, mount static client build; in development, mount Vite SPA middleware
  if (process.env.NODE_ENV === 'production') {
    const clientDir = fs.existsSync(path.resolve(process.cwd(), 'dist/client'))
      ? path.resolve(process.cwd(), 'dist/client')
      : path.resolve(process.cwd(), 'dist');
    app.use(express.static(clientDir));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/images')) {
        return next();
      }
      res.sendFile('index.html', { root: clientDir });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Guaranteed SPA HTML fallback for /admin, /admin/login, /admin/orders/:id, etc.
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/images')) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`[Server] Makhé India Full-Stack application running on http://0.0.0.0:${PORT}`);
    // Connect to database or initialize in-memory fallback
    connectDB().catch((err) => {
      logger.warn('[Database] Background database initialization note:', err?.message || 'Database notice');
    });
  });
}

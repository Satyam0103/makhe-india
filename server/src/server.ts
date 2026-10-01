import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    logger.info(`[Server] Makhé India Production Backend running on port ${PORT}`);
    logger.info(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

bootstrap().catch((err) => {
  logger.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

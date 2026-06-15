import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { requestLogger } from './middleware/logger.middleware';
import { globalErrorHandler } from './middleware/error.middleware';
import chatRoutes from './features/chat/chat.routes';
import { checkDbConnection } from './db/client';
import { config } from './config/env';

export function createApp(): express.Application {
  const app = express();

  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use(requestLogger);

  app.get('/health', async (_req: Request, res: Response) => {
    const dbOk = await checkDbConnection();
    res.status(dbOk ? 200 : 503).json({
      status: dbOk ? 'ok' : 'degraded',
      db: dbOk ? 'connected' : 'error',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/chat', chatRoutes);

  if (config.nodeEnv === 'production') {
    const frontendDist = path.join(__dirname, '../../frontend/dist');

    app.use(express.static(frontendDist));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  } else {
    app.use((_req: Request, res: Response) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  app.use(globalErrorHandler);

  return app;
}

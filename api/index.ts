import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Express } from 'express';
import { createServer } from 'http';
import { registerRoutes } from '../SocialJusticeHub/server/routes';
import { serveStatic, log } from '../SocialJusticeHub/server/vite';
import { storage, DatabaseStorage } from '../SocialJusticeHub/server/storage';
import { securityHeaders, corsConfig } from '../SocialJusticeHub/server/middleware';

let app: Express | null = null;

async function getApp(): Promise<Express> {
  if (app) return app;

  app = express();

  // Security middleware
  app.use(securityHeaders());
  app.use(corsConfig());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Initialize database (best-effort in serverless)
  if (storage instanceof DatabaseStorage) {
    log('Initializing database and sample data...');
    await storage.initSampleData();
    log('Database initialized successfully');
  }

  // Register routes (dummy server kept for signature compatibility)
  const dummyServer = createServer();
  await registerRoutes(app);
  dummyServer.close();

  // Error handler
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      console.error('Error:', err);
      res.status(status).json({ message });
    },
  );

  // Serve static files in production
  serveStatic(app);

  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = await getApp();
  return expressApp(req, res);
}


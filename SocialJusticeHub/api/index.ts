import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Express } from 'express';
import { createServer } from 'http';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';
import { storage, DatabaseStorage } from '../server/storage';
import { log } from '../server/vite';
import { securityHeaders, corsConfig } from '../server/middleware';

let app: Express | null = null;

async function getApp(): Promise<Express> {
  if (app) {
    return app;
  }

  app = express();

  // Security middleware
  app.use(securityHeaders());
  app.use(corsConfig());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Initialize database
  if (storage instanceof DatabaseStorage) {
    log('Initializing database and sample data...');
    await storage.initSampleData();
    log('Database initialized successfully');
  }

  // Register routes (create a dummy server for the function signature, but we don't use it)
  const dummyServer = createServer();
  await registerRoutes(app);
  // Close the dummy server since we don't need it in serverless
  dummyServer.close();

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error('Error:', err);
    res.status(status).json({ message });
  });

  // Serve static files in production
  serveStatic(app);

  return app;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const expressApp = await getApp();
  return expressApp(req, res);
}

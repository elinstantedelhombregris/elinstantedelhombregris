import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Express } from 'express';
import { registerRoutes } from './routes';
import { storage, DatabaseStorage } from './storage';
import { securityHeaders, corsConfig } from './middleware';

let app: Express | null = null;

function maybeRestoreOriginalApiPath(req: VercelRequest) {
  const raw = (req.query as any)?.path;
  const pathPart = Array.isArray(raw) ? raw[0] : raw;
  if (typeof pathPart !== 'string' || !pathPart) return;

  const currentUrl = new URL(req.url || '/', 'http://localhost');
  currentUrl.searchParams.delete('path');
  const remainingQuery = currentUrl.searchParams.toString();

  const normalized = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  req.url = `/api${normalized}${remainingQuery ? `?${remainingQuery}` : ''}`;
}

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
    console.log('[vercel] Initializing database and sample data...');
    await storage.initSampleData();
    console.log('[vercel] Database initialized successfully');
  }

  // Register routes
  await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error('Error:', err);
    res.status(status).json({ message });
  });

  // Static files are served by Vercel CDN, no need for express.static here

  return app;
}

function neutralizeVercelBodyGetter(req: VercelRequest) {
  // Vercel's Rust runtime adds a body getter that eagerly parses JSON and
  // consumes the underlying stream. If it throws ("Invalid JSON"), the
  // stream is left partially consumed and Express's body-parser also fails.
  //
  // Fix: replace the getter with a plain undefined BEFORE it is ever
  // invoked, preserving the raw stream for Express's body-parser.
  const descriptor = Object.getOwnPropertyDescriptor(req, 'body')
    || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(req), 'body');
  if (descriptor?.get) {
    Object.defineProperty(req, 'body', {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  // Do NOT set req._body — let Express's json() middleware parse the stream
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    maybeRestoreOriginalApiPath(req);
    neutralizeVercelBodyGetter(req);
    const expressApp = await getApp();
    return expressApp(req, res);
  } catch (error: any) {
    console.error('[vercel handler] Fatal error:', error);
    res.status(500).json({
      error: 'Server initialization failed',
      message: error?.message || 'Unknown error',
      stack: error?.stack?.split('\n').slice(0, 5),
    });
  }
}

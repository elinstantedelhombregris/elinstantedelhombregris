import './config'; // garantiza que dotenv cargue antes de leer DATABASE_URL
import { neon } from '@neondatabase/serverless';
import ws from 'ws';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it to your Neon connection string.");
}

const db = drizzleHttp(neon(databaseUrl), { schema });

/**
 * El resto de la plataforma conserva el transporte HTTP. Sólo el commit
 * cívico usa WebSocket porque neon-http no soporta transacciones interactivas:
 * un claim y su evento append-only deben confirmar o retroceder juntos.
 */
const civicTransactionDb = drizzleServerless({ connection: databaseUrl, ws, schema });

export { civicTransactionDb, db };

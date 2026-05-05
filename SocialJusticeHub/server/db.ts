import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it to your Neon connection string.");
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

export { db };

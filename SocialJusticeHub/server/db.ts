import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema-sqlite";

// Para desarrollo local, usar SQLite si no hay PostgreSQL configurado
const databaseUrl = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle>;

// Always use SQLite for this project
console.log("📦 Using SQLite for local development");
const sqlite = new Database('./local.db');
db = drizzle(sqlite, { schema });

export { db };
import { defineConfig } from 'drizzle-kit';

// Config de drizzle-kit para expo-sqlite: `npx drizzle-kit generate`
// escribe las migraciones en ./drizzle (incluye migrations.js para Metro).
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/db/schema.ts',
  out: './drizzle',
});

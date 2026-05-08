import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit reads env from CWD; ensure we honor v2/.env when running
// from a workspace package. The unpooled URL is preferred for migrations
// (pooled connections sometimes mis-handle long-running DDL).
config({ path: new URL('../../.env', import.meta.url).pathname });

const url = process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL_UNPOOLED (or DATABASE_URL) is required for drizzle-kit');
}

export default defineConfig({
  out: './migrations',
  // List individual schema files. drizzle-kit runs in CJS and chokes
  // on the `.js`-suffixed ESM-relative imports inside index.ts, so we
  // bypass the barrel here and add new files explicitly when domains
  // are introduced.
  schema: ['./src/schema/users.ts'],
  dialect: 'postgresql',
  dbCredentials: { url },
  verbose: true,
  strict: true,
});

// One-off: crea la tabla ensayo_likes (likes de ensayos estáticos, keyed por slug).
// Uso: npx tsx scripts/create-ensayo-likes-table.ts
import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from '../server/db';

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ensayo_likes (
      id serial PRIMARY KEY,
      slug text NOT NULL,
      user_id integer REFERENCES users(id),
      session_id text,
      created_at text DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS ensayo_likes_slug_user_uq ON ensayo_likes (slug, user_id);
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS ensayo_likes_slug_session_uq ON ensayo_likes (slug, session_id);
  `);
  console.log('ensayo_likes lista.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

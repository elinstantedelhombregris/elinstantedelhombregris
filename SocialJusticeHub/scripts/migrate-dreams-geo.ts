// scripts/migrate-dreams-geo.ts
// Migración aditiva: agrega dreams.province y dreams.city (idempotente).
// Uso: npx tsx scripts/migrate-dreams-geo.ts
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required in .env');

const sql = neon(databaseUrl);

async function main() {
  await sql`ALTER TABLE dreams ADD COLUMN IF NOT EXISTS province TEXT`;
  await sql`ALTER TABLE dreams ADD COLUMN IF NOT EXISTS city TEXT`;
  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'dreams' AND column_name IN ('province', 'city')`;
  console.log('✅ dreams geo columns:', cols.map((c: any) => c.column_name).join(', '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

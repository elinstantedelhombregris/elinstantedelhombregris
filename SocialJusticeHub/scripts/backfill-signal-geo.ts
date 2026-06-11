// scripts/backfill-signal-geo.ts
// Asigna province/city a señales históricas que tienen coordenadas pero no
// provincia (dreams, user_commitments, user_resources). NO redondea
// coordenadas históricas (irreversible) — el snap aplica solo a datos nuevos.
// Idempotente. Uso: npx tsx scripts/backfill-signal-geo.ts
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { resolveProvince, nearestCity, type CityCandidate } from '../server/geo-resolver';

dotenv.config();
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in .env');
const sql = neon(process.env.DATABASE_URL);

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

async function loadCitiesByProvince(): Promise<Map<string, CityCandidate[]>> {
  const rows = (await sql`
    SELECT c.name, c.latitude, c.longitude, p.name AS province_name
    FROM geographic_locations c
    JOIN geographic_locations p ON p.id = c.parent_id
    WHERE c.type = 'city' AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL`) as Array<{
    name: string;
    latitude: number;
    longitude: number;
    province_name: string;
  }>;
  const map = new Map<string, CityCandidate[]>();
  for (const r of rows) {
    const key = normalize(r.province_name);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ name: r.name, latitude: r.latitude, longitude: r.longitude });
  }
  return map;
}

async function backfillTable(
  table: 'dreams' | 'user_commitments' | 'user_resources',
  citiesByProvince: Map<string, CityCandidate[]>,
) {
  const rows = (await sql(
    `SELECT id, latitude::text AS lat, longitude::text AS lng FROM ${table}
     WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND province IS NULL`,
  )) as Array<{ id: number; lat: string; lng: string }>;
  let updated = 0;
  let unresolved = 0;
  for (const row of rows) {
    const lat = parseFloat(row.lat);
    const lng = parseFloat(row.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      unresolved++;
      continue;
    }
    const province = resolveProvince(lat, lng);
    if (!province) {
      unresolved++;
      continue;
    }
    const city = nearestCity(lat, lng, citiesByProvince.get(normalize(province)) ?? []);
    await sql(`UPDATE ${table} SET province = $1, city = $2 WHERE id = $3`, [
      province,
      city,
      row.id,
    ]);
    updated++;
  }
  console.log(`${table}: ${rows.length} candidatas → ${updated} actualizadas, ${unresolved} sin resolver`);
}

async function main() {
  const cities = await loadCitiesByProvince();
  console.log(`Provincias con ciudades georreferenciadas: ${cities.size}`);
  for (const t of ['dreams', 'user_commitments', 'user_resources'] as const) {
    await backfillTable(t, cities);
  }
  console.log('✅ Backfill terminado');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

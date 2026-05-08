#!/usr/bin/env tsx
/**
 * Seed Argentina's 24 provinces (23 + CABA) into geographic_locations.
 * Idempotent: skips rows that already exist.
 *
 * Coordinates are approximate centroids — fine for province-level
 * pinning. Cities will be backfilled later.
 */
import { config } from 'dotenv';

config({ path: new URL('../../../.env', import.meta.url).pathname });

if (!process.env['DATABASE_URL']) {
  throw new Error('DATABASE_URL is required');
}

const { getDb } = await import('../src/client.js');
const { geographicLocations } = await import('../src/schema/geographic.js');
const { and, eq } = await import('drizzle-orm');

interface ProvinceSeed {
  name: string;
  isoCode: string;
  latitude: string;
  longitude: string;
}

const PROVINCES: ProvinceSeed[] = [
  { name: 'Ciudad Autónoma de Buenos Aires', isoCode: 'AR-C', latitude: '-34.603722', longitude: '-58.381592' },
  { name: 'Buenos Aires', isoCode: 'AR-B', latitude: '-37.000000', longitude: '-60.000000' },
  { name: 'Catamarca', isoCode: 'AR-K', latitude: '-28.469570', longitude: '-65.779000' },
  { name: 'Chaco', isoCode: 'AR-H', latitude: '-26.500000', longitude: '-60.500000' },
  { name: 'Chubut', isoCode: 'AR-U', latitude: '-44.000000', longitude: '-69.000000' },
  { name: 'Córdoba', isoCode: 'AR-X', latitude: '-32.142932', longitude: '-63.801753' },
  { name: 'Corrientes', isoCode: 'AR-W', latitude: '-28.751000', longitude: '-57.812000' },
  { name: 'Entre Ríos', isoCode: 'AR-E', latitude: '-32.500000', longitude: '-59.500000' },
  { name: 'Formosa', isoCode: 'AR-P', latitude: '-25.000000', longitude: '-59.500000' },
  { name: 'Jujuy', isoCode: 'AR-Y', latitude: '-23.500000', longitude: '-65.800000' },
  { name: 'La Pampa', isoCode: 'AR-L', latitude: '-37.000000', longitude: '-65.500000' },
  { name: 'La Rioja', isoCode: 'AR-F', latitude: '-29.700000', longitude: '-67.500000' },
  { name: 'Mendoza', isoCode: 'AR-M', latitude: '-34.500000', longitude: '-68.500000' },
  { name: 'Misiones', isoCode: 'AR-N', latitude: '-26.800000', longitude: '-54.500000' },
  { name: 'Neuquén', isoCode: 'AR-Q', latitude: '-38.500000', longitude: '-69.500000' },
  { name: 'Río Negro', isoCode: 'AR-R', latitude: '-40.500000', longitude: '-67.500000' },
  { name: 'Salta', isoCode: 'AR-A', latitude: '-25.500000', longitude: '-65.000000' },
  { name: 'San Juan', isoCode: 'AR-J', latitude: '-31.500000', longitude: '-69.000000' },
  { name: 'San Luis', isoCode: 'AR-D', latitude: '-33.500000', longitude: '-66.000000' },
  { name: 'Santa Cruz', isoCode: 'AR-Z', latitude: '-49.000000', longitude: '-70.000000' },
  { name: 'Santa Fe', isoCode: 'AR-S', latitude: '-30.500000', longitude: '-60.800000' },
  { name: 'Santiago del Estero', isoCode: 'AR-G', latitude: '-27.800000', longitude: '-63.500000' },
  { name: 'Tierra del Fuego', isoCode: 'AR-V', latitude: '-54.000000', longitude: '-67.500000' },
  { name: 'Tucumán', isoCode: 'AR-T', latitude: '-26.800000', longitude: '-65.300000' },
];

const db = getDb();
let inserted = 0;
let skipped = 0;

for (const province of PROVINCES) {
  const [existing] = await db
    .select()
    .from(geographicLocations)
    .where(and(eq(geographicLocations.level, 'province'), eq(geographicLocations.name, province.name)))
    .limit(1);
  if (existing) {
    skipped++;
    continue;
  }
  await db.insert(geographicLocations).values({
    level: 'province',
    name: province.name,
    isoCode: province.isoCode,
    latitude: province.latitude,
    longitude: province.longitude,
  });
  inserted++;
}

process.stdout.write(`Provinces seed: inserted=${String(inserted)} skipped=${String(skipped)}\n`);
process.exit(0);

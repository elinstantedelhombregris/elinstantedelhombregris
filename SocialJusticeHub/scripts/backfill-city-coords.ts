// scripts/backfill-city-coords.ts
// Completa lat/lng de las ciudades de geographic_locations desde el API
// georef oficial (apis.datos.gob.ar). Idempotente: solo toca filas con NULL.
// Uso: npx tsx scripts/backfill-city-coords.ts
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in .env');
const sql = neon(process.env.DATABASE_URL);

const normalize = (s: string) => {
  const n = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  // georef: "tierra del fuego, antartida e islas del atlantico sur" → DB: "tierra del fuego"
  return n.startsWith('tierra del fuego') ? 'tierra del fuego' : n;
};

interface GeorefRow {
  nombre: string;
  centroide_lat: number;
  centroide_lon: number;
  provincia_nombre: string;
}

async function fetchGeoref(endpoint: 'municipios' | 'localidades' | 'departamentos'): Promise<GeorefRow[]> {
  const out: GeorefRow[] = [];
  for (let inicio = 0; ; inicio += 1000) {
    const url = `https://apis.datos.gob.ar/georef/api/${endpoint}?campos=nombre,centroide.lat,centroide.lon,provincia.nombre&max=1000&inicio=${inicio}&aplanar=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`georef ${endpoint} HTTP ${res.status}`);
    const json = (await res.json()) as Record<string, unknown> & { total: number };
    const rows = json[endpoint] as GeorefRow[];
    out.push(...rows);
    if (inicio + 1000 >= json.total) break;
  }
  console.log(`georef ${endpoint}: ${out.length} filas`);
  return out;
}

async function main() {
  const cities = (await sql`
    SELECT c.id, c.name, p.name AS province_name
    FROM geographic_locations c
    JOIN geographic_locations p ON p.id = c.parent_id
    WHERE c.type = 'city' AND (c.latitude IS NULL OR c.longitude IS NULL)`) as Array<{
    id: number;
    name: string;
    province_name: string;
  }>;
  console.log(`Ciudades sin coordenadas: ${cities.length}`);
  if (!cities.length) return;

  // municipios primero (centroides más representativos); localidades completan
  // municipios primero (mejores centroides), luego localidades, luego departamentos
  const georef = [...(await fetchGeoref('municipios')), ...(await fetchGeoref('localidades')), ...(await fetchGeoref('departamentos'))];
  const index = new Map<string, GeorefRow>();
  for (const r of georef) {
    if (r.centroide_lat == null || r.centroide_lon == null) continue;
    const key = `${normalize(r.provincia_nombre)}|${normalize(r.nombre)}`;
    if (!index.has(key)) index.set(key, r);
  }

  // Variantes de nombre para mejorar el match:
  //  - "Comuna 4 (La Boca, Barracas, …)" (CABA) → primer barrio del paréntesis
  //  - números en palabras → dígitos ("Nueve de Julio" → "9 de Julio")
  const NUMBER_WORDS: Record<string, string> = {
    'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4', 'cinco': '5',
    'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9', 'diez': '10',
    'doce': '12', 'veinte': '20', 'veinticinco': '25', 'treinta': '30',
  };
  const candidateKeys = (provinceName: string, cityName: string): string[] => {
    const prov = normalize(provinceName);
    const keys = [`${prov}|${normalize(cityName)}`];
    const parens = cityName.match(/\(([^)]+)\)/);
    if (parens) {
      for (const part of parens[1].split(',')) keys.push(`${prov}|${normalize(part)}`);
    }
    const numbered = normalize(cityName).replace(/^([a-z]+)\b/, (m) => NUMBER_WORDS[m] ?? m);
    keys.push(`${prov}|${numbered}`);
    return keys;
  };

  let updated = 0;
  let missed = 0;
  const missedNames: string[] = [];
  for (const c of cities) {
    let hit: GeorefRow | undefined;
    for (const key of candidateKeys(c.province_name, c.name)) {
      hit = index.get(key);
      if (hit) break;
    }
    if (!hit) {
      missed++;
      if (missedNames.length < 10) missedNames.push(`${c.name} (${c.province_name})`);
      continue;
    }
    await sql`UPDATE geographic_locations SET latitude = ${hit.centroide_lat}, longitude = ${hit.centroide_lon} WHERE id = ${c.id}`;
    updated++;
  }
  console.log(`✅ Actualizadas: ${updated} · Sin match en georef: ${missed}`);
  if (missedNames.length) console.log('Ejemplos sin match:', missedNames.join(' · '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

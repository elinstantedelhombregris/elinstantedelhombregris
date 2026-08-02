/**
 * Backfill de `province_id` a partir del punto — D-001 en `docs/DEUDAS.md`.
 *
 * El arreglo de D-001 hace que toda voz NUEVA resuelva su provincia al
 * escribirse. Las que ya estaban guardadas siguen con `province_id` en null y
 * siguen invisibles en el coroplético, en el detalle por provincia y en todo
 * lo que agrega por territorio. Esto las repara.
 *
 * Es idempotente: solo toca filas que tienen punto y NO tienen provincia.
 * Correrlo dos veces no cambia nada la segunda.
 *
 *   pnpm geo:backfill           # muestra qué haría, no escribe
 *   pnpm geo:backfill --aplicar # escribe
 */
import '../../load-env.js';

import { and, dreams, eq, getDb, isNotNull, isNull } from '@v2/db';

import { provinciaIdDePunto } from './provincias.js';

async function main(): Promise<void> {
  const aplicar = process.argv.includes('--aplicar');
  const db = getDb();

  const pendientes = await db
    .select({ id: dreams.id, lat: dreams.lat, lng: dreams.lng, body: dreams.body })
    .from(dreams)
    .where(and(isNull(dreams.provinceId), isNotNull(dreams.lat), isNotNull(dreams.lng)));

  process.stdout.write(`${pendientes.length} voces con punto y sin provincia\n\n`);

  let resueltas = 0;
  let afuera = 0;

  for (const voz of pendientes) {
    const provinceId = await provinciaIdDePunto(db, {
      lat: Number(voz.lat),
      lng: Number(voz.lng),
    });
    const etiqueta = `${String(voz.id).padStart(5)}  ${voz.body.slice(0, 45)}`;

    if (provinceId === null) {
      afuera += 1;
      process.stdout.write(`  ·  sin provincia  ${etiqueta}\n`);
      continue;
    }

    resueltas += 1;
    process.stdout.write(`  ✓  → ${String(provinceId).padStart(4)}       ${etiqueta}\n`);

    if (aplicar) {
      await db.update(dreams).set({ provinceId }).where(eq(dreams.id, voz.id));
    }
  }

  process.stdout.write(
    `\n${resueltas} resueltas · ${afuera} sin provincia (punto fuera del país o provincia ausente del catálogo)\n`,
  );
  process.stdout.write(
    aplicar ? 'Escrito.\n' : 'Simulacro: nada se escribió. Volvé a correr con --aplicar.\n',
  );
}

void main();

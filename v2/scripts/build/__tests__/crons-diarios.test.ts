/**
 * Ningún cron de `vercel.json` corre más de una vez por día.
 *
 * Vercel Hobby rechaza el despliegue entero —no sólo el cron— si una tarea se agenda más de una
 * vez por día, y no sabemos en qué plan va a correr cada despliegue. La preparación de
 * exportaciones, que era la única tarea por minuto, avanza ahora en pedido
 * (`apps/api/src/features/exportaciones/en-pedido.ts`) y su cron quedó diario.
 *
 * Una expresión de cinco campos corre a lo sumo una vez por día cuando minuto y hora son números
 * únicos: día del mes, mes y día de la semana sólo pueden restringirla más.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const raizV2 = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

interface Vercel {
  crons?: { path: string; schedule: string }[];
}
const crons = (JSON.parse(readFileSync(join(raizV2, 'vercel.json'), 'utf8')) as Vercel).crons ?? [];

/** `true` si la expresión corre a lo sumo una vez por día. */
const esDiaria = (schedule: string) => {
  const campos = schedule.trim().split(/\s+/);
  const [minuto, hora] = campos;
  return campos.length === 5 && /^\d{1,2}$/.test(minuto ?? '') && /^\d{1,2}$/.test(hora ?? '');
};

describe('Los crons de vercel.json', () => {
  it('hay crons declarados', () => {
    expect(crons.length).toBeGreaterThan(0);
  });

  it.each(crons.map((c) => [c.path, c.schedule] as const))(
    '%s (%s) corre a lo sumo una vez por día',
    (_ruta, schedule) => {
      expect(esDiaria(schedule)).toBe(true);
    },
  );

  it('la guarda distingue lo diario de lo que no lo es', () => {
    for (const buena of ['0 6 * * *', '30 5 * * *', '0 6 * * 1', '15 3 1 * *'])
      expect(esDiaria(buena), buena).toBe(true);
    for (const mala of [
      '* * * * *',
      '*/5 * * * *',
      '0 * * * *',
      '0 */6 * * *',
      '0 6,18 * * *',
      '0-30 6 * * *',
      '0 6 * *',
    ])
      expect(esDiaria(mala), mala).toBe(false);
  });
});

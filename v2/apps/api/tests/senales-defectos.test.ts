/**
 * Los dos defectos que encontró la revisión adversaria del 14/8/2026.
 *
 * Vive en su propio archivo y no pegado a `senales-ingesta` por una razón
 * mecánica: `anonSubmitRateLimit` topea en **30 POST por hora por IP** y el
 * router es un singleton de módulo, así que un segundo `createApp()` comparte
 * el contador. Vitest sí aísla por ARCHIVO, y ahí el contador arranca de cero.
 * Meter estos ocho envíos en la suite grande la empujaba arriba del techo y la
 * ponía roja con 429 — un rojo que no habla del código.
 *
 * **Escribe filas, y en DOS tablas** — `senales` por la ruta nueva y `dreams`
 * por la vieja, que este archivo también prueba. Exige
 * `DATABASE_URL_DESCARTABLE` y se saltea sin ella: ver el comentario de
 * `dsuite`, que cuenta cómo se descubrió que hacía falta.
 */
import { randomUUID } from 'node:crypto';

import '../src/load-env.js';

// El cliente de `@v2/db` cachea el pool con el `DATABASE_URL` que encuentre en
// la primera llamada, así que la rama descartable tiene que quedar puesta
// ANTES de que se importe la app. Por eso este bloque va arriba de todo.
const DESCARTABLE = process.env['DATABASE_URL_DESCARTABLE'];
if (DESCARTABLE !== undefined && DESCARTABLE !== '') {
  process.env['DATABASE_URL'] = DESCARTABLE;
}

import { CONTRATO_SENAL } from '@v2/shared';
import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

/**
 * **Este archivo se NIEGA a correr contra producción.**
 *
 * Antes usaba `hasDatabaseUrl`, o sea que corría contra lo que dijera
 * `DATABASE_URL`. Con la variable de rama efímera puesta iba a la rama; sin
 * ella —un `pnpm test` a secas, que es lo normal— **iba a producción y
 * escribía**. Dejó dos filas de prueba en `dreams` de la base real, visibles en
 * el mapa público, porque el `afterAll` sólo limpiaba `senales`.
 *
 * El `hasDatabaseUrl` no alcanzaba y el problema no era ese: era que un archivo
 * que ESCRIBE no puede decidir su destino por «hay una URL». Ahora exige la
 * rama descartable explícita, y sin ella se saltea con su razón.
 */
const dsuite =
  DESCARTABLE !== undefined && DESCARTABLE !== '' && hasDatabaseUrl ? describe : describe.skip;

if (DESCARTABLE === undefined || DESCARTABLE === '') {
  process.stderr.write(
    '\n[senales-ingesta] Se saltea: falta DATABASE_URL_DESCARTABLE.\n' +
      '  Este archivo ESCRIBE filas —en `senales` Y en `dreams`, por la ruta vieja— así que\n' +
      '  no corre contra DATABASE_URL. Poné el DSN de una rama efímera de Neon.\n\n',
  );
}

const RUTA = '/api/v1/civic/senales';

/** El cuerpo mínimo válido. Cada test cambia sólo lo que le importa. */
function cuerpo(over: Record<string, unknown> = {}) {
  return {
    contrato: CONTRATO_SENAL,
    idLocal: randomUUID(),
    tipo: 'basta',
    texto: 'El semáforo de la esquina no anda hace tres meses.',
    cedeLicencia: true,
    casa: 'no',
    ...over,
  };
}

dsuite('Defectos de la revisión adversaria', () => {
  const request = supertest(createApp());
  const creadas: string[] = [];

  const soltar = async (body: Record<string, unknown>, esperado = 201) => {
    const res = await request.post(RUTA).send(body);
    if (res.status !== esperado) {
      throw new Error(
        `Esperaba ${String(esperado)} y vino ${String(res.status)}: ${JSON.stringify(res.body)}`,
      );
    }
    if (res.status === 201) creadas.push(res.body.data.idPublico);
    return res;
  };

  afterAll(async () => {
    if (creadas.length === 0) return;
    const { getDb, inArray, senales } = await import('@v2/db');
    await getDb().delete(senales).where(inArray(senales.idPublico, creadas));
  });

    /**
     * `senales_rechazo_chk` exige `casa='propia' AND location_role='subject'`, y
     * el servicio comprobaba sólo la primera. En los cinco tipos cuyo rol no es
     * `subject` esto era un 500 con la señal perdida.
     */
    const SIN_SUBJECT = ['práctica', 'saber', 'sueño', 'propuesta', 'pregunta'];

    it.each(SIN_SUBJECT)(
      'un %s con casa propia y engrosado rechazado entra, no revienta',
      async (tipo) => {
        const extra: Record<string, unknown> =
          tipo === 'práctica'
            ? { periodicidad: 'semanal' }
            : tipo === 'saber'
              ? { fuente: 'Lo vi.' }
              : {};
        const res = await soltar(
          cuerpo({ tipo, casa: 'propia', aceptaEngrosado: false, ...extra }),
        );
        // Y se DICE que el rechazo no se pudo honrar, en vez de asentar en
        // silencio el rechazo de una propuesta que nunca se hizo.
        expect((res.body.data.avisos as string[]).join(' ')).toMatch(/no quedó registrado/i);
      },
    );

    it('en los tipos que sí son subject, el rechazo se honra', async () => {
      const res = await soltar(cuerpo({ tipo: 'basta', casa: 'propia', aceptaEngrosado: false }));
      expect((res.body.data.avisos as string[]).join(' ')).not.toMatch(/no quedó registrado/i);
    });

    it('un reintento con OTRO cuerpo describe la fila guardada, no la que llegó', async () => {
      const idLocal = randomUUID();
      const primera = await soltar(cuerpo({ idLocal, tipo: 'sueño', texto: 'Que la plaza tenga sombra.' }));

      // Mismo idLocal, cuerpo distinto: el contrato dice que `idLocal` ES la
      // idempotencia, así que esto NO sobrescribe.
      const segunda = await request
        .post(RUTA)
        .send(cuerpo({ idLocal, tipo: 'basta', texto: 'Otra cosa completamente distinta.' }));

      expect(segunda.status).toBe(201);
      expect(segunda.body.data.yaExistia).toBe(true);
      expect(segunda.body.data.idPublico).toBe(primera.body.data.idPublico);
      // Lo que se contesta es lo GUARDADO, no lo que se acaba de mandar.
      expect(segunda.body.data.tipo).toBe('sueño');
      expect(segunda.body.data.clase).toBe('deseo');
      // Y se avisa que no se sobrescribió, para que un outbox se entere.
      expect((segunda.body.data.avisos as string[]).join(' ')).toMatch(/no se sobrescribió/i);
    });
  });

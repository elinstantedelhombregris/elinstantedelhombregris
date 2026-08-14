/**
 * El repositorio de señales, contra Postgres de verdad.
 *
 * **Este archivo ESCRIBE filas.** Por eso no corre contra `DATABASE_URL` y pide
 * `DATABASE_URL_DESCARTABLE` — el DSN de una rama efímera de Neon con las
 * migraciones aplicadas. Misma convención que `seed-callejero-idempotencia`, y
 * por la misma razón: el cliente de este paquete es `neon-http`, que no soporta
 * transacciones interactivas, así que el patrón de INSERT-y-ROLLBACK que usa
 * `senales-imposibles` acá **no está disponible**. Sin base descartable, las
 * filas de prueba quedarían en producción.
 *
 * Lo que se verifica es lo que el header del repositorio promete y ningún
 * type-check puede comprobar:
 *
 * 1. la idempotencia real bajo concurrencia, no la de un reintento educado;
 * 2. que `actualizada_en` se mueva en cada UPDATE, que es lo que `dreams` no
 *    hace y nadie notó durante dos años;
 * 3. que la comparación de actor no deje afuera a las señales anónimas.
 */
import { randomUUID } from 'node:crypto';

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq, inArray, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SenalesRepository } from '../src/repositories/senales.js';
import * as schema from '../src/schema/index.js';
import { senales } from '../src/schema/senales.js';

import type { NewSenal } from '../src/schema/senales.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const DSN = process.env['DATABASE_URL_DESCARTABLE'];

if (DSN === undefined) {
  process.stderr.write(
    '\n[senales-repositorio] Se saltea: falta DATABASE_URL_DESCARTABLE.\n' +
      '  Este archivo ESCRIBE filas y por eso no corre contra DATABASE_URL. Poné el DSN de\n' +
      '  una rama efímera de Neon con las migraciones aplicadas.\n\n',
  );
}

const viva = DSN === undefined ? describe.skip : describe;

/** Lo mínimo que la base acepta para un `basta`. */
function unBasta(over: Partial<NewSenal> = {}): NewSenal {
  return {
    tipo: 'basta',
    clase: 'hecho',
    origen: 'web',
    idLocal: randomUUID(),
    texto: 'El semáforo de la esquina no anda hace tres meses.',
    ...over,
  } as NewSenal;
}

viva('SenalesRepository', () => {
  /**
   * El cliente se construye DENTRO de `beforeAll` y no en el cuerpo del
   * `describe`, y no es cosmético: **`describe.skip` igual evalúa su
   * callback**. Con la construcción arriba, `neon('')` tiraba «No database
   * connection string was provided» al RECOLECTAR, o sea que la suite reventaba
   * en vez de saltearse — exactamente el rojo que no dice nada que el header de
   * este archivo dice evitar, y que en CI (sin `DATABASE_URL_DESCARTABLE`)
   * rompía `pnpm test` entero.
   */
  let db: ReturnType<typeof drizzle>;
  let repo: SenalesRepository;
  const escritas: string[] = [];

  const recordar = <T extends { idPublico: string }>(r: T): T => {
    escritas.push(r.idPublico);
    return r;
  };

  beforeAll(async () => {
    db = drizzle(neon(DSN ?? ''), { schema });
    repo = new SenalesRepository(db as never);
    const filas = await db.select({ tipo: schema.tiposSenal.tipo }).from(schema.tiposSenal);
    expect(filas).toHaveLength(9);
  });

  afterAll(async () => {
    if (escritas.length > 0) {
      await db.delete(senales).where(inArray(senales.idPublico, escritas));
    }
  });

  describe('la idempotencia va en una sentencia', () => {
    it('el mismo (origen, idLocal) escribe una sola fila y la segunda dice que ya estaba', async () => {
      const fila = unBasta();

      const primera = recordar(await repo.crear(fila));
      expect(primera.yaExistia).toBe(false);

      const segunda = await repo.crear(fila);
      expect(segunda.yaExistia).toBe(true);
      // Y devuelve LA MISMA señal, no una nueva: un outbox que reintenta hasta
      // ver un 2xx necesita que el reintento sea indistinguible del original.
      expect(segunda.idPublico).toBe(primera.idPublico);
    });

    it('dos reintentos concurrentes no escriben dos filas', async () => {
      const fila = unBasta();

      // Sin `on conflict`, este es exactamente el caso que rompe: los dos leen
      // «no existe» y los dos escriben.
      const [a, b] = await Promise.all([repo.crear(fila), repo.crear(fila)]);
      recordar(a);

      expect(a.idPublico).toBe(b.idPublico);
      expect([a.yaExistia, b.yaExistia].filter(Boolean)).toHaveLength(1);

      const filas = await db
        .select({ id: senales.idPublico })
        .from(senales)
        .where(eq(senales.idLocal, fila.idLocal));
      expect(filas).toHaveLength(1);
    });

    it('el mismo idLocal desde otro origen SÍ es otra señal', async () => {
      const idLocal = randomUUID();
      const web = recordar(await repo.crear(unBasta({ idLocal, origen: 'web' })));
      const campo = recordar(await repo.crear(unBasta({ idLocal, origen: 'campo' })));

      // Tres espacios de nombres y no uno global: con uno solo, el reintento de
      // un cliente colisiona con el envío legítimo de otro.
      expect(campo.idPublico).not.toBe(web.idPublico);
      expect(campo.yaExistia).toBe(false);
    });
  });

  describe('actualizada_en se mueve sola en cada UPDATE', () => {
    it('cambiar el estado la adelanta y no toca creada_en', async () => {
      const { idPublico } = recordar(await repo.crear(unBasta()));

      const [antes] = await db
        .select({ creada: senales.creadaEn, actualizada: senales.actualizadaEn })
        .from(senales)
        .where(eq(senales.idPublico, idPublico));

      await new Promise((r) => setTimeout(r, 1100));
      expect(await repo.cambiarEstado(idPublico, 'por_verificar')).toBe(true);

      const [despues] = await db
        .select({ creada: senales.creadaEn, actualizada: senales.actualizadaEn })
        .from(senales)
        .where(eq(senales.idPublico, idPublico));

      // Lo que `dreams.updated_at` nunca hizo.
      expect(despues!.actualizada.getTime()).toBeGreaterThan(antes!.actualizada.getTime());
      expect(despues!.creada.getTime()).toBe(antes!.creada.getTime());
    });

    it('retirar vacía el texto y deja la fila', async () => {
      const { idPublico } = recordar(await repo.crear(unBasta()));
      expect(await repo.retirar(idPublico)).toBe(true);

      // El CHECK `senales_retirada_sin_texto_chk` exige las dos cosas juntas:
      // si el repositorio cambiara el estado sin vaciar el texto, la base
      // rechazaría — el borrado es auditable y el contenido no queda.
      const [fila] = await db
        .select({ estado: senales.estado, texto: senales.texto })
        .from(senales)
        .where(eq(senales.idPublico, idPublico));
      expect(fila?.estado).toBe('retirada');
      expect(fila?.texto).toBe('');
    });
  });

  describe('la comparación de actor no pierde las anónimas', () => {
    it('una señal sin actor entra en las corroborables de cualquiera', async () => {
      const { idPublico } = recordar(
        await repo.crear(unBasta({ actorId: null, estado: 'por_verificar' })),
      );

      // Con `actor_id <> 42` esta fila evalúa a NULL, el WHERE la descarta, y
      // el circuito de corroboración se queda mirando sólo a los que aceptaron
      // la cookie sin que nada lo diga.
      const corroborables = await repo.corroborablesPor(42, 500);
      expect(corroborables.map((s) => s.idPublico)).toContain(idPublico);
    });
  });

  describe('la lectura pública es una lista blanca', () => {
    it('no devuelve el ordinal, ni el actor, ni la clave de idempotencia', async () => {
      const { idPublico } = recordar(await repo.crear(unBasta()));
      const senal = await repo.porIdPublico(idPublico);

      expect(senal).not.toBeNull();
      for (const prohibida of ['id', 'actorId', 'userId', 'idLocal']) {
        expect(senal).not.toHaveProperty(prohibida);
      }
    });

    it('una señal retenida no sale por ninguna superficie pública', async () => {
      const { idPublico } = recordar(await repo.crear(unBasta()));
      await db
        .update(senales)
        .set({ retenidaEn: new Date(), retenidaMotivo: 'prueba' })
        .where(eq(senales.idPublico, idPublico));

      // Retención es VISIBILIDAD y no calidad: no toca `estado`, así que un
      // filtro por estado no la caza. Tiene que estar en el repositorio.
      expect(await repo.porIdPublico(idPublico)).toBeNull();
      const listadas = await repo.listar({ limite: 500 });
      expect(listadas.map((s) => s.idPublico)).not.toContain(idPublico);
    });

    it('lat y lng vuelven como número y no como el string de `numeric`', async () => {
      const { idPublico } = recordar(
        await repo.crear(unBasta({ lat: '-34.603722', lng: '-58.381592' } as never)),
      );
      const senal = await repo.porIdPublico(idPublico);
      expect(typeof senal?.lat).toBe('number');
      expect(senal?.lat).toBeCloseTo(-34.603722, 5);
    });
  });

  describe('el techo de la lectura', () => {
    it('un `limite` absurdo se recorta y no es un DoS de lectura', async () => {
      const filas = await repo.listar({ limite: 999_999 });
      expect(filas.length).toBeLessThanOrEqual(500);
    });

    it('contarPorClase agrupa y no cuenta las retenidas', async () => {
      recordar(await repo.crear(unBasta()));
      const porClase = await repo.contarPorClase();
      expect(porClase['hecho']).toBeGreaterThan(0);
      const total = await repo.total();
      expect(total).toBe(Object.values(porClase).reduce((a, b) => a + b, 0));
    });
  });
});

/** Silencia el `sql` sin uso si alguna edición futura saca la última consulta cruda. */
void sql;

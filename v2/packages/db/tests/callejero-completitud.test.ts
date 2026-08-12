/**
 * «La completitud se afirma contra `count(*)` de la tabla», contra Postgres.
 *
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 5, Step 6.
 *
 * ── QUÉ AFIRMA, Y POR QUÉ NO SE PUEDE AFIRMAR SIN BASE ─────────────────────
 *
 * La verificación anterior era circular: comparaba `filas_escritas` contra
 * `total_declarado`, y los dos los escribía el seed leyendo la fuente. **Si las
 * filas no llegaban a la tabla, los dos números coincidían igual y el
 * verificador pasaba en verde con el 4% del país faltando.**
 *
 * Que la verificación nueva NO sea circular es una propiedad de la consulta:
 * el `count(*)` sale del motor y no de ningún contador nuestro. El único lugar
 * donde se puede ver eso es borrando filas de una tabla de verdad y comprobando
 * que el verificador lo nota. Sin Postgres esto no se puede afirmar; con
 * Postgres se afirma en tres líneas.
 *
 * ── POR QUÉ ESTE ARCHIVO NO CORRE CONTRA `DATABASE_URL` ────────────────────
 *
 * **Escribe filas.** Necesita `DATABASE_URL_DESCARTABLE`, una variable propia
 * que nadie tiene puesta por accidente, y se saltea con un mensaje cuando no
 * está. Mismo criterio que `seed-callejero-idempotencia.test.ts`.
 *
 *   DATABASE_URL_DESCARTABLE=... pnpm --filter @v2/db test:integration
 */
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { and, eq, inArray, like, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  decidirPublicacion,
  elegirCorrida,
  evaluarCompletitud,
} from '../scripts/callejero/corrida.js';
import {
  asegurarIndices,
  bajarIndices,
  completitudDeLaCorrida,
  corridaVigente,
  corridasPublicadas,
  faltantesDeIndices,
  indicesPresentes,
  INDICES_DE_CALLES,
  publicarVersion,
  RegistroDeProgreso,
} from '../scripts/callejero/escribir.js';
import { GeoCallesRepository } from '../src/repositories/geo-calles.js';
import { geoCalles } from '../src/schema/geo-calles.js';
import { geoCatalogoVersion, geoSeedProgreso } from '../src/schema/geo-seed.js';
import { geographicLocations } from '../src/schema/geographic.js';
import * as schema from '../src/schema/index.js';

import type { Db } from '../src/client.js';
import type { CalleParaSembrar } from '../src/repositories/geo-calles.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const url = process.env.DATABASE_URL_DESCARTABLE;
const dsuite = url ? describe : describe.skip;

if (!url) {
  process.stdout.write(
    '\n[callejero-completitud] Se saltea: falta DATABASE_URL_DESCARTABLE.\n' +
      '  Este archivo ESCRIBE filas y por eso no corre contra DATABASE_URL. Poné el DSN de\n' +
      '  una rama efímera de Neon (con las migraciones aplicadas) para que hable.\n\n',
  );
}

/** Arriba del espacio del Estado, para que el `afterAll` borre exactamente lo suyo. */
const PREFIJO = '9999998';
const CALLE = (sufijo: string): string => `${PREFIJO}${sufijo.padStart(6, '0')}`;
const CORRIDA = 'ensayo-completitud';
/** La partición: el `georef_id` del departamento de prueba. */
const PARTICION = `${PREFIJO}1`;

dsuite('la completitud se mide contra `count(*)` de la tabla', () => {
  let db: Db;
  let repo: GeoCallesRepository;
  let registro: RegistroDeProgreso;
  let provinciaId = 0;
  let departamentoId = 0;
  let localidadId = 0;

  const calle = (sufijo: string): CalleParaSembrar => ({
    georefId: CALLE(sufijo),
    localidadId,
    departamentoId,
    provinciaId,
    nombre: `CALLE DE PRUEBA ${sufijo}`,
    nombreNorm: `DE PRUEBA ${sufijo}`,
    nombreClase: 'nominada',
    categoria: 'CALLE',
    rango: { tipo: 'completo', desde: 100, hasta: 900 },
  });

  /** Lo que el verificador ve para NUESTRA partición, y nada más. */
  const leerParticion = async (): Promise<{
    enTabla: number;
    duplicados: number;
    huerfanas: number;
    totalDeclarado: number | null;
  }> => {
    const filas = await completitudDeLaCorrida(db, CORRIDA);
    const nuestra = filas.find((f) => f.particion === PARTICION);
    expect(nuestra).toBeDefined();
    return {
      enTabla: nuestra?.enTabla ?? -1,
      duplicados: nuestra?.duplicados ?? -1,
      huerfanas: nuestra?.huerfanas ?? -1,
      totalDeclarado: nuestra?.totalDeclarado ?? null,
    };
  };

  /** El progreso tal como lo dejaría un seed que dice haber cerrado con `n` filas. */
  const declararCerrada = async (total: number): Promise<void> => {
    await registro.guardar({
      recurso: 'calles',
      particion: PARTICION,
      estado: 'completa',
      totalDeclarado: total,
      filasEscritas: total,
      offsetSiguiente: 0,
      hashFuente: 'huella-de-prueba',
    });
  };

  beforeAll(async () => {
    db = drizzle(neon(url ?? ''), { schema });
    repo = new GeoCallesRepository(db);
    registro = new RegistroDeProgreso(db, CORRIDA);

    const { rows } = await db.execute<{ id: number }>(sql`
      WITH nuevo AS (SELECT nextval('geographic_locations_id_seq')::int AS id)
      INSERT INTO geographic_locations (id, province_id, level, name, georef_id, name_norm)
      SELECT nuevo.id, nuevo.id, 'province', 'Provincia de completitud', ${`${PREFIJO}0`}, 'PROVINCIA DE COMPLETITUD'
        FROM nuevo
      ON CONFLICT (georef_id) DO UPDATE SET name_norm = EXCLUDED.name_norm
      RETURNING id`);
    provinciaId = rows[0]?.id ?? 0;
    expect(provinciaId).toBeGreaterThan(0);

    const crear = async (nivel: string, nombre: string, georefId: string): Promise<number> => {
      const [fila] = await db
        .insert(geographicLocations)
        .values({
          level: nivel,
          name: nombre,
          nameNorm: nombre.toUpperCase(),
          provinceId: provinciaId,
          parentId: provinciaId,
          georefId,
        })
        .onConflictDoUpdate({
          target: geographicLocations.georefId,
          set: { name: sql`excluded.name` },
        })
        .returning({ id: geographicLocations.id });
      return fila?.id ?? 0;
    };

    departamentoId = await crear('department', 'Departamento de completitud', PARTICION);
    localidadId = await crear('locality', 'Localidad de completitud', `${PREFIJO}2`);
  });

  afterAll(async () => {
    if (provinciaId === 0) return;
    await db.delete(geoSeedProgreso).where(eq(geoSeedProgreso.corrida, CORRIDA));
    await db.delete(geoCalles).where(like(geoCalles.georefId, `${PREFIJO}%`));
    await db.delete(geographicLocations).where(like(geographicLocations.georefId, `${PREFIJO}%`));
  });

  it('cuando la tabla tiene lo que la fuente declaró, cierra', async () => {
    await repo.upsertLote([calle('1'), calle('2'), calle('3'), calle('4'), calle('5')]);
    await declararCerrada(5);

    const nuestra = await leerParticion();
    expect(nuestra.enTabla).toBe(5);
    expect(nuestra.totalDeclarado).toBe(5);

    const { rotas } = evaluarCompletitud(await completitudDeLaCorrida(db, CORRIDA));
    expect(rotas).toEqual([]);
  });

  /**
   * **LA afirmación.** El progreso sigue diciendo `completa` con
   * `filas_escritas = total_declarado = 5`: la verificación vieja pasaba en
   * verde exactamente acá.
   */
  it('las filas que NO llegaron a la tabla se ven, aunque el progreso diga que cerró', async () => {
    await repo.upsertLote([calle('1'), calle('2'), calle('3'), calle('4'), calle('5')]);
    await declararCerrada(5);

    await db
      .delete(geoCalles)
      .where(and(like(geoCalles.georefId, `${PREFIJO}%`), eq(geoCalles.georefId, CALLE('4'))));
    await db
      .delete(geoCalles)
      .where(and(like(geoCalles.georefId, `${PREFIJO}%`), eq(geoCalles.georefId, CALLE('5'))));

    const nuestra = await leerParticion();
    expect(nuestra.enTabla).toBe(3);

    const { rotas } = evaluarCompletitud(await completitudDeLaCorrida(db, CORRIDA));
    expect(rotas).toHaveLength(1);
    expect(rotas[0]?.particion).toBe(PARTICION);
    expect(rotas[0]?.motivo).toContain('faltan 2');
  });

  it('una calle RETIRADA no cuenta: la fuente ya no la declara', async () => {
    await repo.upsertLote([calle('1'), calle('2'), calle('3')]);
    await db
      .update(geoCalles)
      .set({ vigenteHasta: new Date() })
      .where(eq(geoCalles.georefId, CALLE('3')));
    await declararCerrada(2);

    expect((await leerParticion()).enTabla).toBe(2);
    const { rotas } = evaluarCompletitud(await completitudDeLaCorrida(db, CORRIDA));
    expect(rotas).toEqual([]);

    await db
      .update(geoCalles)
      .set({ vigenteHasta: null })
      .where(eq(geoCalles.georefId, CALLE('3')));
  });

  /**
   * Las anotaciones son lo que hace posible cerrar una partición que tiene filas
   * que la fuente entregó y que la tabla no puede guardar — y que la suma del
   * verificador siga cerrando exacta.
   */
  it('las huérfanas anotadas cierran la suma y quedan a la vista, aparte', async () => {
    await repo.upsertLote([calle('1'), calle('2'), calle('3')]);
    await declararCerrada(5);
    await registro.anotar({
      recurso: 'calles',
      particion: PARTICION,
      duplicados: 0,
      huerfanas: 2,
      yaAnotadas: new Set(),
    });

    const nuestra = await leerParticion();
    expect(nuestra.enTabla).toBe(3);
    expect(nuestra.huerfanas).toBe(2);

    const { rotas, toleradas } = evaluarCompletitud(await completitudDeLaCorrida(db, CORRIDA));
    expect(rotas).toEqual([]);
    expect(toleradas).toHaveLength(1);
  });

  it('la anotación sobrevive a la reanudación, y se borra cuando ya no hace falta', async () => {
    await registro.anotar({
      recurso: 'calles',
      particion: PARTICION,
      duplicados: 4,
      huerfanas: 0,
      yaAnotadas: new Set(),
    });
    // Una corrida que retoma lee el progreso de la base: ahí está la anotación.
    const alRetomar = await registro.cargar();
    expect(alRetomar.get(`calles|${PARTICION}:duplicados`)?.filasEscritas).toBe(4);

    // Y la partición que se vuelve a correr y esta vez entra entera no puede
    // quedar arrastrando la anotación vieja: la suma cerraría de más.
    await registro.anotar({
      recurso: 'calles',
      particion: PARTICION,
      duplicados: 0,
      huerfanas: 0,
      yaAnotadas: new Set(alRetomar.keys()),
    });
    expect((await registro.cargar()).has(`calles|${PARTICION}:duplicados`)).toBe(false);
  });

  it('las anotaciones NO se cuentan como particiones', async () => {
    await declararCerrada(3);
    await registro.anotar({
      recurso: 'calles',
      particion: PARTICION,
      duplicados: 1,
      huerfanas: 1,
      yaAnotadas: new Set(),
    });
    const filas = await completitudDeLaCorrida(db, CORRIDA);
    expect(filas.filter((f) => f.particion.includes(':'))).toEqual([]);
    expect(filas).toHaveLength(1);
  });

  // ── EL GATE DE PUBLICACIÓN, contra la tabla y no contra la fuente ───────
  //
  // La completitud ya sabía que faltaban filas; lo que faltaba era que fuera
  // ELLA la que decide. El 2026-08-11 el gate consultaba la contabilidad de la
  // fuente, donde `entraron` es lo planificado, y el catálogo se publicó con el
  // 1,2% del país faltando.

  /** Deja en la tabla exactamente estas calles, y ninguna otra de la prueba. */
  const soloEstasCalles = async (sufijos: readonly string[]): Promise<void> => {
    await db.delete(geoCalles).where(like(geoCalles.georefId, `${PREFIJO}%`));
    await repo.upsertLote(sufijos.map(calle));
  };

  /** Borra las anotaciones que dejaron los `it` de arriba: acá no explican nada. */
  const sinAnotaciones = async (): Promise<void> => {
    await registro.anotar({
      recurso: 'calles',
      particion: PARTICION,
      duplicados: 0,
      huerfanas: 0,
      yaAnotadas: new Set((await registro.cargar()).keys()),
    });
  };

  const decidir = async (): Promise<ReturnType<typeof decidirPublicacion>> =>
    decidirPublicacion(evaluarCompletitud(await completitudDeLaCorrida(db, CORRIDA)), CORRIDA);

  it('la corrida a la que le faltan filas EN LA TABLA no se publica, y dice cuántas', async () => {
    await soloEstasCalles(['1', '2', '3']);
    await sinAnotaciones();
    // El seed dice haber cerrado con 5: `filas_escritas = total_declarado`, que
    // es exactamente lo que la verificación circular miraba y aprobaba.
    await declararCerrada(5);

    const decision = await decidir();
    expect(decision.tipo).toBe('no_publica');
    if (decision.tipo !== 'no_publica') return;
    expect(decision.codigoDeSalida).not.toBe(0);
    expect(decision.faltan).toBe(2);
    expect(decision.aviso).toContain(`calles/${PARTICION}`);
    expect(decision.aviso).toContain('NO se marca vigente');
  });

  it('y la que sí cierra se publica igual que antes', async () => {
    await soloEstasCalles(['1', '2', '3', '4', '5']);
    await sinAnotaciones();
    await declararCerrada(5);
    expect(await decidir()).toEqual({ tipo: 'publica' });
  });

  /** Un SIGKILL no ejecuta el `finally` del seed que repone los btree. */
  it('los cuatro índices de geo_calles están puestos en la base de verdad', async () => {
    const presentes = await indicesPresentes(db);
    expect(faltantesDeIndices(presentes)).toEqual([]);
  });

  /**
   * El ida y vuelta completo de los índices, contra el motor.
   *
   * Es lo que el seed hace en cada corrida —bajar los tres btree, cargar,
   * reponerlos en el `finally`— y lo que el verificador tiene que poder ver
   * cuando el `finally` no llegó a correr. Las tres afirmaciones que importan
   * son: que bajarlos los baja de verdad, que el verificador los extraña, y que
   * reponerlos los repone con la MISMA definición que la `0013`.
   *
   * El unique **no se baja nunca**: es el que sostiene el `ON CONFLICT` del
   * upsert. Que siga en pie después de `bajarIndices` es parte de lo que se
   * afirma acá.
   */
  it('bajar los tres btree se nota, y reponerlos los devuelve enteros', async () => {
    const definicionDe = async (nombre: string): Promise<string | undefined> => {
      const { rows } = await db.execute<{ indexdef: string }>(
        sql`select indexdef from pg_indexes where tablename = 'geo_calles' and indexname = ${nombre}`,
      );
      return rows[0]?.indexdef;
    };
    const antes = new Map<string, string | undefined>();
    for (const indice of INDICES_DE_CALLES) {
      antes.set(indice.nombre, await definicionDe(indice.nombre));
    }

    const bajados = await bajarIndices(db);
    expect(bajados.sort()).toEqual(INDICES_DE_CALLES.map((i) => i.nombre).sort());

    // Con los btree abajo el verificador los extraña, y el unique sigue en pie.
    const conLosBtreeAbajo = await indicesPresentes(db);
    expect(faltantesDeIndices(conLosBtreeAbajo).map((i) => i.nombre).sort()).toEqual(
      INDICES_DE_CALLES.map((i) => i.nombre).sort(),
    );
    expect(conLosBtreeAbajo.has('geo_calles_georef_unique')).toBe(true);

    const rehechos = await asegurarIndices(db);
    expect(rehechos.sort()).toEqual(INDICES_DE_CALLES.map((i) => i.nombre).sort());
    expect(faltantesDeIndices(await indicesPresentes(db))).toEqual([]);

    // Y vuelven IGUALES: si estas líneas y la `0013` divergieran, `drizzle-kit
    // check` empezaría a ver deriva de esquema donde no la hay.
    for (const indice of INDICES_DE_CALLES) {
      expect(await definicionDe(indice.nombre)).toBe(antes.get(indice.nombre));
    }
  });
});

/**
 * ── PUBLICAR, PUBLICAR OTRA VEZ, Y LA PRIMERA YA NO SE ELIGE SOLA ──────────
 *
 * `elegirCorrida` excluía sólo a la corrida vigente DE ESE MOMENTO. Cuando una
 * segunda corrida se publica, la primera deja de ser vigente y vuelve a parecer
 * abierta —con todas sus particiones en `completa`, indistinguible de la corrida
 * que la reanudación existe para cubrir—. Medido: se borraron 300 calles de La
 * Matanza, se corrió el comando plano, el seed reanudó la corrida vieja, tomó el
 * atajo `ya_completa` y **reportó éxito sin reparar nada**.
 *
 * La decisión es pura y está afirmada en `seed-callejero.test.ts`. Lo que sólo
 * se puede ver contra la base es la otra mitad: que `corridasPublicadas` las
 * devuelva a las DOS, incluida la que ya dejó de ser vigente.
 */
dsuite('una corrida ya publicada no vuelve a ser candidata', () => {
  let db: Db;
  const PRIMERA = 'ensayo-publicada-1';
  const SEGUNDA = 'ensayo-publicada-2';
  /** La vigente que había antes de esta prueba: se apaga al publicar y vuelve. */
  let vigentePrevia: string | undefined;

  const publicar = async (corrida: string): Promise<void> =>
    publicarVersion(db, {
      corrida,
      fuente: 'ensayo',
      fechaDeCorte: new Date('2026-08-12T00:00:00.000Z'),
      totales: {
        provincias: 0,
        departamentos: 0,
        municipios: 0,
        localidades: 0,
        asentamientos: 0,
        calles: 0,
      },
      cobertura: {},
    });

  beforeAll(async () => {
    db = drizzle(neon(url ?? ''), { schema });
    vigentePrevia = await corridaVigente(db);
  });

  afterAll(async () => {
    await db
      .delete(geoCatalogoVersion)
      .where(inArray(geoCatalogoVersion.corrida, [PRIMERA, SEGUNDA]));
    // El unique parcial `ON (vigente) WHERE vigente` obliga a este orden: primero
    // se van las nuestras, después vuelve la que estaba.
    if (vigentePrevia !== undefined) {
      await db
        .update(geoCatalogoVersion)
        .set({ vigente: true })
        .where(eq(geoCatalogoVersion.corrida, vigentePrevia));
    }
  });

  it('publicada, reemplazada, y aun así el seed NO la reanuda', async () => {
    await publicar(PRIMERA);
    expect(await corridaVigente(db)).toBe(PRIMERA);
    await publicar(SEGUNDA);
    expect(await corridaVigente(db)).toBe(SEGUNDA);

    // La primera ya no es vigente, y sin embargo se publicó: las dos están.
    const publicadas = await corridasPublicadas(db);
    expect(publicadas).toContain(PRIMERA);
    expect(publicadas).toContain(SEGUNDA);

    // Lo que el seed ve al arrancar: dos corridas con todo `completa`.
    const eleccion = elegirCorrida({
      progresos: [
        { corrida: PRIMERA, estado: 'completa', actualizadoEn: new Date() },
        { corrida: SEGUNDA, estado: 'completa', actualizadoEn: new Date() },
      ],
      publicadas,
      ahora: new Date(),
    });
    expect(eleccion.tipo).toBe('nueva');
    expect(eleccion.corrida).not.toBe(PRIMERA);
    expect(eleccion.corrida).not.toBe(SEGUNDA);
  });
});

/**
 * Que sea imposible mezclar.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §2.10 y §3.9.
 *
 * Estas guardas no prueban que el esquema `simulacion` funcione: prueban que
 * **no pueda tocar el corpus real**, que es la única propiedad por la que el
 * dueño pidió un esquema aparte en vez de una columna `es_simulacion`. Todas
 * corren sin Postgres, y por eso corren siempre. La que sí necesita motor vive
 * en `tests/simulacion-aislamiento.test.ts` y se saltea con su razón cuando no
 * hay una base descartable.
 *
 * La forma de fallar que estas guardas cazan es la peor de todas: no es un
 * error, es un número plausible. Una fila sintética que entra en un conteo real
 * no rompe nada — dibuja un país que nadie habitó, y hay que descubrirlo
 * mirando. Eso es `D-002`, y costó meses.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { is } from 'drizzle-orm';
import { getTableConfig, PgTable } from 'drizzle-orm/pg-core';
import { describe, expect, it, vi } from 'vitest';

import { elegirBaseParaSembrar, HOSTS_DONDE_NO_SE_SIEMBRA } from '../base-descartable.js';
import {
  abrirEscritorDeSimulacion,
  destinoDe,
  enLotes,
  EscrituraFueraDeSimulacion,
  EscritorDeSimulacion,
} from '../repositories/simulacion.js';
import { dreams } from '../schema/dreams.js';
import * as corpusReal from '../schema/index.js';
import { NOMBRE_DEL_ESQUEMA } from '../schema/simulacion-esquema.js';
import * as ensayo from '../schema/simulacion.js';

import type { Db } from '../client.js';

const RAIZ = fileURLToPath(new URL('../../../../', import.meta.url));
const MIGRACION = fileURLToPath(new URL('../../migrations/0021_simulacion.sql', import.meta.url));

function tablasDe(modulo: Record<string, unknown>): PgTable[] {
  return Object.values(modulo).filter((v): v is PgTable => is(v, PgTable));
}

const TABLAS_DEL_ENSAYO = tablasDe(ensayo);
const TABLAS_REALES = tablasDe(corpusReal);

const esquemaDe = (t: PgTable): string => getTableConfig(t).schema ?? 'public';
const nombreDe = (t: PgTable): string => getTableConfig(t).name;

// ---------------------------------------------------------------------------
// 1 · El borde, visto desde las tablas
// ---------------------------------------------------------------------------

describe('el esquema simulacion está físicamente aparte', () => {
  it('tiene tablas, y todas viven en `simulacion`', () => {
    // Sin esta primera afirmación, un módulo que deje de exportar tablas haría
    // pasar todas las guardas de abajo sin haber mirado nada.
    expect(TABLAS_DEL_ENSAYO.length).toBeGreaterThanOrEqual(11);
    expect(TABLAS_DEL_ENSAYO.map(esquemaDe)).toEqual(
      TABLAS_DEL_ENSAYO.map(() => NOMBRE_DEL_ESQUEMA),
    );
  });

  it('ningún nombre de tabla se repite entre `simulacion` y el corpus real', () => {
    // Ésta es la guarda que hace estructuralmente imposible el accidente: una
    // consulta sin calificar resuelve por `search_path`, y si existieran
    // `public.senales` y `simulacion.senales` a la vez, un `select … from
    // senales` alcanzaría una fila sintética SIN dar error. Con nombres que no
    // colisionan no hay nada que resolver, y la consulta revienta.
    const reales = new Set(TABLAS_REALES.map(nombreDe));
    const chocan = TABLAS_DEL_ENSAYO.map(nombreDe).filter((n) => reales.has(n));
    expect(chocan).toEqual([]);
  });

  it('ninguna clave foránea del ensayo apunta afuera de `simulacion`', () => {
    // Una FK de acá hacia `public` haría que el ensayo no se pueda tirar sin
    // permiso de una tabla real. Por eso los ids territoriales son enteros
    // pelados: se paga la integridad referencial para no perder el borde.
    const fugas: string[] = [];
    for (const tabla of TABLAS_DEL_ENSAYO) {
      for (const fk of getTableConfig(tabla).foreignKeys) {
        const destino = fk.reference().foreignTable;
        if (esquemaDe(destino) !== NOMBRE_DEL_ESQUEMA) {
          fugas.push(`${nombreDe(tabla)} → ${esquemaDe(destino)}.${nombreDe(destino)}`);
        }
      }
    }
    expect(fugas).toEqual([]);
  });

  it('ninguna clave foránea del corpus real apunta a `simulacion`', () => {
    // La dirección peligrosa: si algo de `public` dependiera del ensayo,
    // `DROP SCHEMA simulacion CASCADE` se llevaría dato real puesto, y el
    // comando que existe para deshacer sería el que rompe.
    const fugas: string[] = [];
    for (const tabla of TABLAS_REALES) {
      for (const fk of getTableConfig(tabla).foreignKeys) {
        const destino = fk.reference().foreignTable;
        if (esquemaDe(destino) === NOMBRE_DEL_ESQUEMA) {
          fugas.push(`${nombreDe(tabla)} → ${nombreDe(destino)}`);
        }
      }
    }
    expect(fugas).toEqual([]);
  });

  it('el barril del corpus real no exporta una sola tabla del ensayo', () => {
    // `client.ts` construye el cliente de Drizzle con este barril. Lo que no
    // esté acá no existe para la API de consultas que sirve la web: el corpus
    // real no puede nombrar una tabla sintética ni queriendo.
    expect(TABLAS_REALES.filter((t) => esquemaDe(t) === NOMBRE_DEL_ESQUEMA)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2 · El borde, visto desde el código que importa
// ---------------------------------------------------------------------------

/** Los únicos archivos que pueden nombrar el esquema del ensayo. */
const IMPORTADORES_PERMITIDOS: readonly string[] = [
  'packages/db/src/schema/simulacion.ts',
  'packages/db/src/schema/simulacion-esquema.ts',
  'packages/db/src/schema/simulacion-elenco.ts',
  'packages/db/src/schema/simulacion-corrida.ts',
  'packages/db/src/schema/simulacion-ensayo.ts',
  'packages/db/src/repositories/simulacion.ts',
  'packages/db/scripts/simulacion-tirar.ts',
  'packages/db/drizzle.config.ts',
];

const ARBOLES: readonly string[] = [
  'packages/db/src',
  'packages/db/scripts',
  'packages/civic-core/src',
  'packages/shared/src',
  'apps/api/src',
  'apps/web/src',
  'scripts',
];

function fuentes(directorio: string): string[] {
  const raiz = `${RAIZ}${directorio}`;
  const encontrados: string[] = [];
  const caminar = (ruta: string): void => {
    let entradas: string[];
    try {
      entradas = readdirSync(ruta);
    } catch {
      return; // Un árbol que no existe no es un incumplimiento.
    }
    for (const entrada of entradas) {
      if (entrada === 'node_modules' || entrada === 'dist') continue;
      const completa = `${ruta}/${entrada}`;
      if (statSync(completa).isDirectory()) caminar(completa);
      else if (/\.(ts|tsx)$/.test(entrada)) encontrados.push(completa);
    }
  };
  caminar(raiz);
  return encontrados;
}

describe('nadie más puede nombrar el ensayo', () => {
  const todos = ARBOLES.flatMap(fuentes);

  it('encuentra fuentes (si no, la guarda de abajo no probaría nada)', () => {
    expect(todos.length).toBeGreaterThan(200);
  });

  it('sólo el escritor y sus propios archivos importan `schema/simulacion*`', () => {
    const intrusos: string[] = [];
    for (const archivo of todos) {
      const relativo = archivo.slice(RAIZ.length);
      if (IMPORTADORES_PERMITIDOS.includes(relativo)) continue;
      if (relativo.includes('__tests__') || relativo.includes('/tests/')) continue;
      const texto = readFileSync(archivo, 'utf8');
      if (/from\s+['"][^'"]*schema\/simulacion/.test(texto)) intrusos.push(relativo);
    }
    expect(intrusos).toEqual([]);
  });

  it('el barril de repositorios no expone el escritor', () => {
    // Ese barril lo importa la API. Que el escritor no esté ahí es lo que evita
    // que un handler HTTP tenga a mano el objeto que escribe filas sintéticas.
    const barril = readFileSync(`${RAIZ}packages/db/src/repositories/index.ts`, 'utf8');
    expect(barril).not.toMatch(/simulacion/);
  });
});

// ---------------------------------------------------------------------------
// 3 · El borde, visto desde la migración
// ---------------------------------------------------------------------------

describe('la migración 0021 no toca nada que no sea suyo', () => {
  const sql = readFileSync(MIGRACION, 'utf8');

  it('crea el esquema una sola vez', () => {
    expect(sql.match(/CREATE SCHEMA/g)).toEqual(['CREATE SCHEMA']);
    expect(sql).toContain(`CREATE SCHEMA "${NOMBRE_DEL_ESQUEMA}";`);
  });

  it('cada objeto que crea o altera está calificado con `simulacion`', () => {
    const objetos = [...sql.matchAll(/(?:CREATE TABLE|ALTER TABLE|ON)\s+("[^"]+"(?:\."[^"]+")?)/g)]
      .map((m) => m[1] ?? '')
      .filter((o) => o.length > 0);
    expect(objetos.length).toBeGreaterThan(10);
    const sinCalificar = objetos.filter((o) => !o.startsWith(`"${NOMBRE_DEL_ESQUEMA}".`));
    expect(sinCalificar).toEqual([]);
  });

  it('no nombra `public` en ningún lado', () => {
    // Una migración del ensayo que mencione `public` está tocando el corpus
    // real, sea para leerlo o para referenciarlo. Las dos cosas están fuera.
    expect(sql).not.toMatch(/\bpublic\b/);
  });

  it('no borra ni altera nada preexistente', () => {
    expect(sql).not.toMatch(/\bDROP\b/);
  });
});

// ---------------------------------------------------------------------------
// 4 · El escritor: la puerta que tira en vez de escribir
// ---------------------------------------------------------------------------

/** Un `Db` de mentira que anota qué se le pidió. Ninguna guarda de acá abre un socket. */
function dbEspia(): { db: Db; insertadas: unknown[] } {
  const insertadas: unknown[] = [];
  const db = {
    insert: (tabla: unknown) => ({
      values: (filas: unknown) => ({
        onConflictDoNothing: async () => {
          insertadas.push({ tabla, filas });
          return Promise.resolve();
        },
      }),
    }),
    execute: async (texto: unknown) => {
      insertadas.push({ ejecutado: texto });
      return Promise.resolve();
    },
  } as unknown as Db;
  return { db, insertadas };
}

describe('el escritor no escribe fuera de simulacion', () => {
  it('reconoce un destino del ensayo', () => {
    const destino = destinoDe(ensayo.simSenalesEnsayadas);
    expect(destino).toEqual({ permitido: true, tabla: 'senales_ensayadas' });
  });

  it('rechaza una tabla del corpus real, y lo dice con nombre y esquema', () => {
    const destino = destinoDe(dreams);
    expect(destino.permitido).toBe(false);
    if (destino.permitido) throw new Error('inalcanzable');
    expect(destino.esquema).toBe('public');
    expect(destino.tabla).toBe('dreams');
  });

  it('tira ANTES de escribir: ni una fila llega al motor', async () => {
    const { db, insertadas } = dbEspia();
    const escritor = new EscritorDeSimulacion(db);
    await expect(
      escritor.insertar(dreams, [{ userId: 1, content: 'no' } as never]),
    ).rejects.toBeInstanceOf(EscrituraFueraDeSimulacion);
    // Lo que importa no es que tire: es que no haya escrito media cosa antes.
    expect(insertadas).toEqual([]);
  });

  it('sí escribe cuando el destino es del ensayo, y en lotes', async () => {
    const { db, insertadas } = dbEspia();
    const escritor = new EscritorDeSimulacion(db);
    const filas = Array.from({ length: 5 }, (_, i) => ({
      funcionId: 'f',
      senalId: 1,
      personaId: i,
      ronda: 1,
    }));
    await expect(escritor.insertar(ensayo.simAdhesionesEnsayadas, filas, 2)).resolves.toBe(5);
    expect(insertadas).toHaveLength(3);
  });

  it('un lote de cero sería un bucle infinito, así que no se permite', () => {
    expect(() => enLotes([1, 2, 3], 0)).toThrow(RangeError);
    expect(enLotes([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
  });
});

// ---------------------------------------------------------------------------
// 5 · A qué base se le permite sembrar
// ---------------------------------------------------------------------------

describe('la siembra no llega a la rama por defecto', () => {
  const PROHIBIDA_POOLED = `postgresql://u:p@${HOSTS_DONDE_NO_SE_SIEMBRA[0] ?? ''}-pooler.c-3.us-east-2.aws.neon.tech/neondb`;
  const PROHIBIDA_DIRECTA = `postgresql://u:p@${HOSTS_DONDE_NO_SE_SIEMBRA[0] ?? ''}.c-3.us-east-2.aws.neon.tech/neondb`;
  const EFIMERA = 'postgresql://u:p@ep-otra-rama-123.c-3.us-east-2.aws.neon.tech/neondb';

  it('la rama por defecto se rechaza aunque NO haya ninguna base viva declarada', () => {
    // Éste es el agujero que la lista negra literal tapa: comparar contra
    // `DATABASE_URL` sólo protege mientras `DATABASE_URL` esté puesta, y una
    // terminal sin `.env` cargado convertiría la comparación en un «adelante».
    expect(elegirBaseParaSembrar(PROHIBIDA_POOLED, [])).toEqual({
      siembra: false,
      motivo: 'rama_por_defecto',
    });
    expect(elegirBaseParaSembrar(PROHIBIDA_DIRECTA, [])).toEqual({
      siembra: false,
      motivo: 'rama_por_defecto',
    });
  });

  it('sin DSN no se siembra, y no cae a DATABASE_URL', () => {
    expect(elegirBaseParaSembrar(undefined, [EFIMERA])).toEqual({
      siembra: false,
      motivo: 'ausente',
    });
  });

  it('una rama efímera sí', () => {
    expect(elegirBaseParaSembrar(EFIMERA, [PROHIBIDA_POOLED])).toEqual({
      siembra: true,
      url: EFIMERA,
    });
  });

  it('la fábrica del escritor no llega a construir el cliente cuando la base no habilita', () => {
    const armar = vi.fn();
    expect(() =>
      abrirEscritorDeSimulacion({ url: PROHIBIDA_POOLED, vivas: [] }, armar as never),
    ).toThrow(/rama POR DEFECTO/);
    // Ni siquiera se abre la conexión: la decisión es anterior al cliente.
    expect(armar).not.toHaveBeenCalled();
  });
});

/**
 * FaltasRepository — el registro público de lo que le falta a la plataforma.
 *
 * Spec: `docs/specs/2026-08-12-lo-que-falta.md`.
 *
 * Nada de lo que sale de acá lleva `llaveHash` ni el `id` interno: la
 * proyección pública se arma en `aFaltaPublica()`, una sola vez, y todas las
 * lecturas pasan por ahí. Un `select()` pelado que devuelva la fila entera es
 * la forma exacta en que `submittedAs` filtró el UUID del teléfono.
 *
 * **Sin `db.transaction()`.** El driver es `neon-http` y tira «No transactions
 * support in neon-http driver» (ver `client.ts`). Donde hacía falta atomicidad
 * hay o una sola sentencia que se basta —el `insert … select` que numera— o un
 * `db.batch()`, que sí envuelve en BEGIN/COMMIT y viaja en una sola petición.
 */
import { createHash, randomBytes } from 'node:crypto';

import {
  idPublicoDeFalta,
  vaciaContenido,
  type EstadoDeFalta,
  type OrigenDeFalta,
  type SeveridadDeFalta,
  type SuperficieDeFalta,
} from '@v2/civic-core';
import { and, desc, eq, lt, notInArray, sql } from 'drizzle-orm';

import { faltas, faltasFirmas } from '../schema/faltas.js';

import type { Db } from '../client.js';
import type { ContextoDeFalta, Falta, NuevaFalta } from '../schema/faltas.js';

/** Lo que ve cualquiera. No incluye `llaveHash` ni el id interno. */
export interface FaltaPublica {
  idPublico: string;
  origen: OrigenDeFalta;
  superficie: SuperficieDeFalta;
  titulo: string;
  cuerpo: string;
  contexto: ContextoDeFalta | null;
  severidad: SeveridadDeFalta | null;
  estado: EstadoDeFalta;
  razon: string | null;
  anotadaComo: string | null;
  cierreUrl: string | null;
  firmas: number;
  creadaEn: string;
  movidaEn: string;
}

export interface ConsultaDeFaltas {
  estado?: EstadoDeFalta | undefined;
  superficie?: SuperficieDeFalta | undefined;
  origen?: OrigenDeFalta | undefined;
  /** Keyset sobre `creadaEn`: el ISO de la última fila de la página anterior. */
  cursor?: string | undefined;
  limite?: number | undefined;
}

export interface PaginaDeFaltas {
  faltas: FaltaPublica[];
  /** El cursor para pedir la siguiente. `null` cuando no hay más. */
  siguiente: string | null;
}

export interface FaltaDejada {
  idPublico: string;
  /** Se devuelve UNA sola vez. El servidor guarda sólo su hash. */
  llave: string;
}

export interface EntradaImportada {
  idPublico: string;
  titulo: string;
  cuerpo: string;
  severidad: SeveridadDeFalta | null;
  resuelta: boolean;
}

export interface ResultadoDeImportacion {
  creadas: number;
  actualizadas: number;
  /** Las que estaban bajadas y por eso el importador no pisó. */
  intactas: string[];
  huerfanas: string[];
}

export const LIMITE_DE_PAGINA_POR_DEFECTO = 40;
export const LIMITE_DE_PAGINA_MAXIMO = 100;

/** Cuántas veces se reintenta el `insert … select` que numera, ante colisión. */
const REINTENTOS_DE_NUMERACION = 4;

/** El texto que se muestra cuando una falta se bajó. El id y la fecha quedan. */
export const CONTENIDO_BAJADO = '[contenido retirado]';

export function hashDeLlave(llave: string): string {
  return createHash('sha256').update(llave).digest('hex');
}

export function nuevaLlave(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * La única proyección pública. Cambiarla es cambiar lo que el país puede leer,
 * así que el test de fuga la muestrea por nombre de campo y no por forma.
 */
export function aFaltaPublica(fila: Falta): FaltaPublica {
  return {
    idPublico: fila.idPublico,
    origen: fila.origen as OrigenDeFalta,
    superficie: fila.superficie as SuperficieDeFalta,
    titulo: fila.titulo,
    cuerpo: fila.cuerpo,
    contexto: fila.contexto ?? null,
    severidad: (fila.severidad as SeveridadDeFalta | null) ?? null,
    estado: fila.estado as EstadoDeFalta,
    razon: fila.razon ?? null,
    anotadaComo: fila.anotadaComo ?? null,
    cierreUrl: fila.cierreUrl ?? null,
    firmas: fila.firmas,
    creadaEn: fila.creadaEn.toISOString(),
    movidaEn: fila.movidaEn.toISOString(),
  };
}

export class FaltasRepository {
  constructor(private readonly db: Db) {}

  /**
   * Deja una falta de afuera y devuelve la llave UNA sola vez.
   *
   * El id público se numera dentro de la misma sentencia que inserta —un
   * `insert … select max()+1 from faltas`— porque sin transacciones no hay
   * forma de leer el máximo y escribir después sin una ventana en el medio.
   * Dos envíos simultáneos pueden leer el mismo máximo; el unique de
   * `id_publico` frena al segundo y el reintento le da el siguiente número. La
   * corrección la garantiza el índice, no el reintento: el reintento sólo
   * evita que el segundo vea un error.
   */
  async dejar(input: {
    superficie: SuperficieDeFalta;
    titulo: string;
    cuerpo: string;
    contexto?: ContextoDeFalta | undefined;
  }): Promise<FaltaDejada> {
    const llave = nuevaLlave();
    const llaveHash = hashDeLlave(llave);

    for (let intento = 0; intento < REINTENTOS_DE_NUMERACION; intento += 1) {
      const siguiente = idPublicoDeFalta('afuera', (await this.maximoDeAfuera()) + 1);
      try {
        await this.db.insert(faltas).values({
          idPublico: siguiente,
          origen: 'afuera',
          superficie: input.superficie,
          titulo: input.titulo,
          cuerpo: input.cuerpo,
          contexto: input.contexto ?? null,
          llaveHash,
        });
        return { idPublico: siguiente, llave };
      } catch (error) {
        if (!esColisionDeUnico(error) || intento === REINTENTOS_DE_NUMERACION - 1) throw error;
      }
    }

    // Inalcanzable: el bucle o devuelve o relanza en la última vuelta.
    throw new Error('No se pudo numerar la falta');
  }

  async leer(idPublico: string): Promise<FaltaPublica | undefined> {
    const fila = await this.filaPorIdPublico(idPublico);
    return fila ? aFaltaPublica(fila) : undefined;
  }

  /**
   * Cronológico descendente, siempre. El orden no lo decide la popularidad
   * (§2.4): las firmas se muestran y no reordenan.
   */
  async listar(consulta: ConsultaDeFaltas = {}): Promise<PaginaDeFaltas> {
    const limite = Math.min(
      Math.max(consulta.limite ?? LIMITE_DE_PAGINA_POR_DEFECTO, 1),
      LIMITE_DE_PAGINA_MAXIMO,
    );

    const condiciones = [];
    if (consulta.estado) condiciones.push(eq(faltas.estado, consulta.estado));
    if (consulta.superficie) condiciones.push(eq(faltas.superficie, consulta.superficie));
    if (consulta.origen) condiciones.push(eq(faltas.origen, consulta.origen));
    if (consulta.cursor) {
      const desde = new Date(consulta.cursor);
      if (!Number.isNaN(desde.getTime())) condiciones.push(lt(faltas.creadaEn, desde));
    }

    const base = this.db.select().from(faltas);
    const filas = await (condiciones.length ? base.where(and(...condiciones)) : base)
      .orderBy(desc(faltas.creadaEn), desc(faltas.id))
      // Una de más: es cómo se sabe que hay siguiente sin un count aparte.
      .limit(limite + 1);

    const hayMas = filas.length > limite;
    const pagina = hayMas ? filas.slice(0, limite) : filas;
    const ultima = pagina.at(-1);

    return {
      faltas: pagina.map(aFaltaPublica),
      siguiente: hayMas && ultima ? ultima.creadaEn.toISOString() : null,
    };
  }

  /** Cuántas hay por estado. Es el conteo de la cabecera; no sale del listado. */
  async contarPorEstado(): Promise<Record<string, number>> {
    const filas = await this.db
      .select({ estado: faltas.estado, total: sql<number>`count(*)::int` })
      .from(faltas)
      .groupBy(faltas.estado);
    return Object.fromEntries(filas.map((f) => [f.estado, f.total]));
  }

  /**
   * Firmar es «me pasa lo mismo». Idempotente por llave.
   *
   * El unique de `faltas_firmas` es la verdad; `faltas.firmas` es una
   * denormalización. Por eso el contador **se recalcula desde la tabla de
   * firmas** en vez de incrementarse: un `+1` condicionado al resultado del
   * insert necesitaría una transacción, y un recuento no necesita nada — dos
   * corridas seguidas dejan el mismo número. Las dos sentencias viajan en un
   * `batch()`, que es la única forma de BEGIN/COMMIT que este driver tiene.
   */
  async firmar(idPublico: string, llave: string): Promise<{ firmas: number; nueva: boolean }> {
    const fila = await this.filaPorIdPublico(idPublico);
    if (!fila) throw new Error(`No existe la falta ${idPublico}`);

    const [insertadas, recontadas] = await this.db.batch([
      this.db
        .insert(faltasFirmas)
        .values({ faltaId: fila.id, llaveHash: hashDeLlave(llave) })
        .onConflictDoNothing()
        .returning({ id: faltasFirmas.id }),
      this.db
        .update(faltas)
        .set({
          firmas: sql`(select count(*)::int from ${faltasFirmas} where ${faltasFirmas.faltaId} = ${fila.id})`,
        })
        .where(eq(faltas.id, fila.id))
        .returning({ firmas: faltas.firmas }),
    ]);

    return {
      firmas: recontadas[0]?.firmas ?? fila.firmas,
      nueva: insertadas.length > 0,
    };
  }

  /**
   * Mueve el estado. **No valida la transición**: eso lo hace
   * `transicionValida()` de `@v2/civic-core` en la boca, que es donde se puede
   * devolver el mensaje. Acá se aplica el efecto, incluido el vaciado del
   * contenido cuando el estado lo pide (§2.2) — la fila nunca se borra.
   */
  async mover(
    idPublico: string,
    estado: EstadoDeFalta,
    patch: {
      razon?: string | undefined;
      anotadaComo?: string | undefined;
      cierreUrl?: string | undefined;
    } = {},
  ): Promise<FaltaPublica | undefined> {
    const set: Partial<NuevaFalta> = { estado, movidaEn: new Date() };
    if (patch.razon !== undefined) set.razon = patch.razon;
    if (patch.anotadaComo !== undefined) set.anotadaComo = patch.anotadaComo;
    if (patch.cierreUrl !== undefined) set.cierreUrl = patch.cierreUrl;
    if (vaciaContenido(estado)) {
      set.titulo = CONTENIDO_BAJADO;
      set.cuerpo = CONTENIDO_BAJADO;
      set.contexto = null;
    }

    const [fila] = await this.db
      .update(faltas)
      .set(set)
      .where(eq(faltas.idPublico, idPublico))
      .returning();
    return fila ? aFaltaPublica(fila) : undefined;
  }

  /** ¿Esta llave es la de quien dejó esta falta? Para retirar lo propio. */
  async llaveCoincide(idPublico: string, llave: string): Promise<boolean> {
    const fila = await this.filaPorIdPublico(idPublico);
    if (!fila?.llaveHash) return false;
    return fila.llaveHash === hashDeLlave(llave);
  }

  /** El estado actual, para que la boca pueda validar la transición. */
  async estadoDe(idPublico: string): Promise<EstadoDeFalta | undefined> {
    const fila = await this.filaPorIdPublico(idPublico);
    return fila ? (fila.estado as EstadoDeFalta) : undefined;
  }

  /**
   * El upsert del importador de `docs/DEUDAS.md` (§2.7).
   *
   * Idempotente por id público. Una entrada marcada resuelta en el archivo
   * mueve la falta a `hecha`. Una falta que ya está `bajada` no la pisa nadie:
   * bajar es definitivo y una corrida del importador no la resucita. Y lo que
   * la base tiene y el archivo ya no menciona **no se borra**: se marca
   * `huerfana` y se devuelve para el log — un registro que se vacía solo
   * pierde la memoria de por qué las cosas están como están.
   */
  async importarDeudas(entradas: EntradaImportada[]): Promise<ResultadoDeImportacion> {
    const existentes = new Map<string, EstadoDeFalta>(
      (
        await this.db
          .select({ idPublico: faltas.idPublico, estado: faltas.estado })
          .from(faltas)
          .where(eq(faltas.origen, 'adentro'))
      ).map((f) => [f.idPublico, f.estado as EstadoDeFalta]),
    );

    const resultado: ResultadoDeImportacion = {
      creadas: 0,
      actualizadas: 0,
      intactas: [],
      huerfanas: [],
    };

    for (const entrada of entradas) {
      const estadoActual = existentes.get(entrada.idPublico);

      if (estadoActual === 'bajada') {
        resultado.intactas.push(entrada.idPublico);
        continue;
      }

      const estado: EstadoDeFalta = entrada.resuelta ? 'hecha' : (estadoActual ?? 'anotada');

      if (estadoActual === undefined) {
        await this.db.insert(faltas).values({
          idPublico: entrada.idPublico,
          origen: 'adentro',
          superficie: 'la-plataforma',
          titulo: entrada.titulo,
          cuerpo: entrada.cuerpo,
          severidad: entrada.severidad,
          estado,
        });
        resultado.creadas += 1;
      } else {
        await this.db
          .update(faltas)
          .set({
            titulo: entrada.titulo,
            cuerpo: entrada.cuerpo,
            severidad: entrada.severidad,
            estado,
            huerfana: false,
            movidaEn: new Date(),
          })
          .where(eq(faltas.idPublico, entrada.idPublico));
        resultado.actualizadas += 1;
      }
    }

    const vistos = entradas.map((e) => e.idPublico);
    const marcadas = await this.db
      .update(faltas)
      .set({ huerfana: true })
      .where(
        and(
          eq(faltas.origen, 'adentro'),
          eq(faltas.huerfana, false),
          ...(vistos.length ? [notInArray(faltas.idPublico, vistos)] : []),
        ),
      )
      .returning({ idPublico: faltas.idPublico });

    resultado.huerfanas = marcadas.map((m) => m.idPublico);
    return resultado;
  }

  /** Las de adentro que el archivo dejó de mencionar. Nunca se borran. */
  async listarHuerfanas(): Promise<string[]> {
    const filas = await this.db
      .select({ idPublico: faltas.idPublico })
      .from(faltas)
      .where(and(eq(faltas.origen, 'adentro'), eq(faltas.huerfana, true)));
    return filas.map((f) => f.idPublico);
  }

  private async maximoDeAfuera(): Promise<number> {
    const [fila] = await this.db
      .select({
        numero: sql<number>`coalesce(max(substring(${faltas.idPublico} from 3)::int), 0)`,
      })
      .from(faltas)
      .where(eq(faltas.origen, 'afuera'));
    return fila?.numero ?? 0;
  }

  private async filaPorIdPublico(idPublico: string): Promise<Falta | undefined> {
    const [fila] = await this.db
      .select()
      .from(faltas)
      .where(eq(faltas.idPublico, idPublico))
      .limit(1);
    return fila;
  }
}

/** El 23505 de Postgres: violación de índice único. */
function esColisionDeUnico(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const codigo = (error as { code?: unknown }).code;
  if (codigo === '23505') return true;
  const mensaje = (error as { message?: unknown }).message;
  return typeof mensaje === 'string' && mensaje.includes('faltas_id_publico_unique');
}

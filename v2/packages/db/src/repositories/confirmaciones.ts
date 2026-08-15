/**
 * ConfirmacionesRepository — el segundo par de ojos, y la transición.
 *
 * Spec: `docs/specs/2026-08-11-c-la-corroboracion.md` §2.1, §2.2 y §2.4.
 *
 * Este archivo es el que cierra el circuito: hasta que existió, las señales
 * llegaban a `por_verificar` y se quedaban ahí para siempre, y la nitidez de
 * todo el país era cero — «hay hechos sin confirmar», que era literalmente
 * cierto porque no había forma de confirmarlos.
 */
import { and, eq, sql } from 'drizzle-orm';

import { confirmaciones } from '../schema/confirmaciones.js';
import { senales } from '../schema/senales.js';

import type { Db } from '../client.js';

export type MotivoDeRechazo =
  | 'noExiste'
  | 'noSeVerifica'
  | 'esTuya'
  | 'yaConfirmaste'
  | 'sinActor';

export interface ResultadoDeConfirmacion {
  readonly ok: true;
  /** Cuántas confirmaciones que CUENTAN lleva esta ronda. */
  readonly cuentan: number;
  readonly correcciones: number;
  readonly umbral: number;
  /** El estado en que quedó la señal. */
  readonly estado: string;
  /** `true` cuando esta confirmación fue la que la corroboró. */
  readonly corroboroAhora: boolean;
}

export type Confirmada = ResultadoDeConfirmacion | { readonly ok: false; readonly motivo: MotivoDeRechazo };

export interface EntradaDeConfirmacion {
  readonly idPublico: string;
  readonly actorId: number | null;
  readonly veredicto: string;
  readonly metodo: string;
  readonly proximidad: string;
  readonly cuenta: boolean;
  readonly umbral: number;
  readonly nota: string | null;
}

export class ConfirmacionesRepository {
  constructor(private readonly db: Db) {}

  /**
   * Escribir una confirmación y, si corresponde, corroborar la señal.
   *
   * Las cuatro puertas, en orden, y ninguna es opcional:
   *
   * 1. **La señal existe y está en `por_verificar`.** Confirmar algo que ya está
   *    corroborado o que nunca se publicó no significa nada.
   * 2. **No es tuya.** `s.actor_id IS DISTINCT FROM $actor` **y**
   *    `s.actor_id is not null`: una señal sin autor atribuible no entra al
   *    circuito, porque no se puede saber si quien confirma es otra persona.
   *    Con `<>` en vez de `IS DISTINCT FROM`, una señal anónima sería
   *    auto-confirmable.
   * 3. **Hace falta actor.** Sin él no hay independencia que verificar.
   * 4. **Una por persona por ronda**, que la impone el `UNIQUE`.
   */
  async confirmar(e: EntradaDeConfirmacion): Promise<Confirmada> {
    if (e.actorId === null) return { ok: false, motivo: 'sinActor' };

    const [senal] = await this.db
      .select({
        id: senales.id,
        estado: senales.estado,
        clase: senales.clase,
        ronda: senales.ronda,
        autor: senales.actorId,
      })
      .from(senales)
      .where(and(eq(senales.idPublico, e.idPublico), sql`${senales.retenidaEn} is null`))
      .limit(1);

    if (senal === undefined) return { ok: false, motivo: 'noExiste' };
    if (senal.estado !== 'por_verificar') return { ok: false, motivo: 'noSeVerifica' };

    /**
     * `IS DISTINCT FROM` en JavaScript: el autor nulo NO habilita a nadie.
     * Una señal sin autor atribuible queda fuera del circuito entero —es la
     * regla de B §4.3— y por eso el nulo se rechaza acá y no se ignora.
     */
    if (senal.autor === null) return { ok: false, motivo: 'esTuya' };
    if (senal.autor === e.actorId) return { ok: false, motivo: 'esTuya' };

    const escritas = await this.db
      .insert(confirmaciones)
      .values({
        senalId: senal.id,
        ronda: senal.ronda,
        actorId: e.actorId,
        veredicto: e.veredicto,
        metodo: e.metodo,
        proximidad: e.proximidad,
        cuenta: e.cuenta,
        umbralVigente: e.umbral,
        nota: e.nota,
      })
      .onConflictDoNothing()
      .returning({ id: confirmaciones.id });

    if (escritas.length === 0) return { ok: false, motivo: 'yaConfirmaste' };

    return this.recontar(senal.id, senal.ronda, e.umbral);
  }

  /**
   * Recontar la ronda y mover el estado si corresponde.
   *
   * **Las correcciones netas bloquean.** `corrects >= confirms` impide la
   * transición: si alguien dice que el dato está mal, contar sólo los «sí»
   * sería sordera con forma de algoritmo.
   */
  private async recontar(senalId: number, ronda: number, umbral: number): Promise<ResultadoDeConfirmacion> {
    const [conteo] = await this.db
      .select({
        cuentan: sql<number>`count(*) filter (where ${confirmaciones.veredicto} = 'confirm' and ${confirmaciones.cuenta})::int`,
        correcciones: sql<number>`count(*) filter (where ${confirmaciones.veredicto} = 'correct')::int`,
      })
      .from(confirmaciones)
      .where(and(eq(confirmaciones.senalId, senalId), eq(confirmaciones.ronda, ronda)));

    const cuentan = conteo?.cuentan ?? 0;
    const correcciones = conteo?.correcciones ?? 0;
    const corrobora = cuentan >= umbral && correcciones < cuentan;

    let estado = 'por_verificar';
    if (corrobora) {
      await this.db
        .update(senales)
        .set({ estado: 'corroborada', estadoDesde: new Date(), actualizadaEn: new Date() })
        .where(and(eq(senales.id, senalId), eq(senales.estado, 'por_verificar')));
      estado = 'corroborada';
    }

    return { ok: true, cuentan, correcciones, umbral, estado, corroboroAhora: corrobora };
  }

  /** Las confirmaciones de una señal, para su ficha. Sin actor: nunca sale quién. */
  async deSenal(idPublico: string): Promise<
    { veredicto: string; metodo: string; proximidad: string; cuenta: boolean; creadaEn: string }[]
  > {
    const filas = await this.db
      .select({
        veredicto: confirmaciones.veredicto,
        metodo: confirmaciones.metodo,
        proximidad: confirmaciones.proximidad,
        cuenta: confirmaciones.cuenta,
        creadaEn: confirmaciones.creadaEn,
      })
      .from(confirmaciones)
      .innerJoin(senales, eq(senales.id, confirmaciones.senalId))
      .where(eq(senales.idPublico, idPublico))
      .orderBy(confirmaciones.creadaEn);

    return filas.map((f) => ({ ...f, creadaEn: f.creadaEn.toISOString() }));
  }
}

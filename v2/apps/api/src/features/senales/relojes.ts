/**
 * Los relojes — que lo que envejece se caiga solo.
 *
 * Spec: `docs/specs/2026-08-11-c-la-corroboracion.md` §2.5.
 *
 * ## Por qué esto existe
 *
 * Lo que se afirma es **un hecho vigente, no un hecho eterno**. Un pozo tapado
 * hace ocho meses sigue en el mapa si nadie lo saca, y un mapa que no olvida es
 * un mapa que miente con datos que alguna vez fueron ciertos — la peor clase de
 * mentira, porque cada fila es defendible por separado.
 *
 * Los dos relojes se setean al publicar y no al corroborarse: **un hecho que
 * nadie confirma también envejece**. Sin este barrido se quedarían en
 * `por_verificar` para siempre, contando en el denominador de la nitidez de su
 * territorio sin que nada los mueva.
 *
 * ## Qué hace y qué NO hace
 *
 * Mueve a `desactualizada` lo que pasó su fecha de revisión, con el motivo
 * escrito. **No borra nada**: una señal desactualizada sigue contando en el
 * denominador de la nitidez, porque un hecho caído es precisamente un hecho que
 * pide otra mirada. Si quedara afuera, un barrio donde todo el conocimiento se
 * pudrió se dibujaría tan nítido como uno que nunca tuvo nada que comprobar.
 */
import { getDb, sql } from '@v2/db';

import { logger } from '../../lib/logger.js';

export interface BarridoDeRelojes {
  readonly desactualizadas: number;
  readonly compromisosVencidos: number;
  readonly ms: number;
}

/**
 * Barrer los relojes vencidos.
 *
 * Dos pasadas, y las dos con su motivo distinto — el vocabulario de `motivo` es
 * cerrado justamente para que «se resolvió» y «se cayó del mapa por olvido» no
 * se escriban con la misma palabra.
 */
export async function barrerRelojes(): Promise<BarridoDeRelojes> {
  const db = getDb();
  const arranque = Date.now();

  /**
   * 1 · Los hechos que pasaron su revisión.
   *
   * Sólo `hecho`, y sólo desde los estados publicados: una `enviada` nunca
   * estuvo a la vista de nadie, así que no envejeció — lo que envejece es lo
   * que se afirmó en público.
   */
  const hechos = await db.execute<{ n: number }>(sql`
    with movidas as (
      update senales
      set estado = 'desactualizada',
          estado_desde = now(),
          actualizada_en = now(),
          motivo = 'revision_de_vigencia'
      where clase = 'hecho'
        and estado in ('por_verificar','corroborada')
        and vence_el_revision is not null
        and vence_el_revision < now()
        and retenida_en is null
      returning 1
    )
    select count(*)::int as n from movidas
  `);

  /**
   * 2 · Los compromisos cuya fecha pasó sin que nadie confirmara el cumplimiento.
   *
   * `desenlace` va a `vencido` y el estado a `desactualizada`, que es el par que
   * el CHECK `senales_acto_coherente_chk` exige. **No es `no_cumplida`**: eso lo
   * declara una persona mirando, no un reloj. La diferencia importa — un
   * compromiso vencido es uno que nadie fue a ver, y decirle incumplido sería
   * acusar a alguien por un cron.
   */
  const actos = await db.execute<{ n: number }>(sql`
    with movidos as (
      update senales
      set estado = 'desactualizada',
          desenlace = 'vencido',
          estado_desde = now(),
          actualizada_en = now(),
          motivo = 'compromiso_vencido'
      where clase = 'acto'
        and estado in ('enviada','por_verificar','corroborada')
        and desenlace = 'abierto'
        and comprometido_para is not null
        and comprometido_para < current_date
        and retenida_en is null
      returning 1
    )
    select count(*)::int as n from movidos
  `);

  const salida: BarridoDeRelojes = {
    desactualizadas: hechos.rows[0]?.n ?? 0,
    compromisosVencidos: actos.rows[0]?.n ?? 0,
    ms: Date.now() - arranque,
  };

  logger.info(
    { ...salida },
    'barrido de relojes: lo que envejeció se movió, con su motivo escrito',
  );
  return salida;
}

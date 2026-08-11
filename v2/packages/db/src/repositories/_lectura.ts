/**
 * El techo de tiempo de una lectura, compartido por los repositorios que sirven
 * endpoints públicos.
 *
 * Existe porque el costo por request de `/api/v1/geo/*` no lo acota el limitador
 * de tasa: `generalRateLimit()` guarda su estado en memoria de proceso y la API
 * corre como función serverless (ADR 0008), así que bajo concurrencia son 120
 * req/min **por instancia** y deja de ser un límite. Lo que sí acota es el
 * `LIMIT` que el servidor pone siempre más un techo que hace cumplir el motor.
 *
 * Es **opcional y apagado por defecto** a propósito: el mismo repositorio lo usa
 * el seed del callejero, que escribe lotes de miles de filas y para el que dos
 * segundos serían una corrida rota. El techo lo pide quien sirve una request, no
 * quien siembra.
 */
import { conTechoDeTiempo } from '../client.js';

import type { ConsultaPendiente, Db } from '../client.js';

export interface OpcionesDeLectura {
  /**
   * Milisegundos de `statement_timeout`. Ausente = sin techo, que es lo que
   * necesitan los scripts. Ver `conTechoDeTiempo` para por qué esto no puede
   * ponerse en la conexión con el driver que usa esta base.
   */
  techoMs?: number;
}

/** Con techo, un batch de dos sentencias en un viaje; sin techo, la consulta pelada. */
export function correrConTecho<R>(
  db: Db,
  opciones: OpcionesDeLectura,
  consulta: ConsultaPendiente<R>,
): Promise<R> {
  const { techoMs } = opciones;
  if (techoMs === undefined) return Promise.resolve(consulta);
  return conTechoDeTiempo(db, techoMs, consulta);
}

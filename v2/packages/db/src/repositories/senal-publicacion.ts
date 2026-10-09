import { TEXTO_RESERVADO } from '@v2/shared';
import { sql } from 'drizzle-orm';

import { senales } from '../schema/senales.js';

/**
 * La frase como literal SQL y no como parámetro: esta expresión se usa en varios lugares de una
 * misma consulta (SELECT, y a veces agrupaciones), y un `$n` distinto en cada uno haría que
 * Postgres los viera como expresiones diferentes. El valor es una constante nuestra, no entrada.
 */
const LITERAL_RESERVADO = sql.raw(`'${TEXTO_RESERVADO.replaceAll("'", "''")}'`);

/** La autorización se aplica antes de devolver datos al navegador. */
export const textoDeSenalPublica = sql<string>`case when ${senales.cesionLicencia}
  then ${senales.texto} else ${LITERAL_RESERVADO} end`;
export const tituloDeSenalPublica = sql<string | null>`case when ${senales.cesionLicencia}
  then ${senales.titulo} else null end`;

/**
 * La frase de «texto reservado», sin base.
 *
 * Que la base mande exactamente `TEXTO_RESERVADO` cuando la autoría no cedió la licencia es lo
 * que permite a la web reconocerla. Acá se afirma que el SQL la lleva como literal (no como
 * parámetro) y que sale del paquete compartido; que Postgres devuelva la fila correcta está en
 * `apps/api/tests/mapa-lectura.test.ts` y `fichas.test.ts`, que la comparan contra el texto
 * escrito a mano.
 */
import { TEXTO_RESERVADO } from '@v2/shared';
import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';

import { textoDeSenalPublica } from '../repositories/senal-publicacion.js';

describe('textoDeSenalPublica', () => {
  const { sql: consulta, params } = new PgDialect().sqlToQuery(textoDeSenalPublica);

  it('devuelve el texto o, si la autoría no cedió la licencia, la frase compartida', () => {
    expect(consulta).toContain(`else '${TEXTO_RESERVADO}' end`);
    expect(consulta).toMatch(/^case when .*cesion_licencia.* then .*texto.* else /s);
  });

  it('lleva la frase como literal y no como parámetro', () => {
    // Un `$n` por uso haría que Postgres viera dos expresiones distintas donde hay una.
    expect(params).toEqual([]);
  });
});

/**
 * Lo que la migración `0022` tiene que volver **imposible**.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §3.1, §3.3, §3.4 y §3.5.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 11.
 *
 * ── Dos suites, y la línea que las separa es si hace falta Postgres ────────
 *
 * **La primera no toca la base.** Lee el `.sql` de la migración y afirma que el
 * vocabulario sembrado es exactamente el de `@v2/civic-core`, y que los pares
 * imposibles no están escritos en ninguna parte. Corre siempre, incluso sin
 * base. Es la que hace que esta suite valga algo hoy, con la migración escrita
 * y sin aplicar.
 *
 * **La segunda no escribe una sola fila.** Hace INSERTs que TIENEN que fallar,
 * cada uno dentro de una transacción que siempre termina en ROLLBACK — así, el
 * día que un CHECK no esté, el test se pone rojo y la fila igual no queda. Se
 * saltea con su razón mientras la `0022` no esté aplicada: que se saltee es
 * correcto; que reviente con «relation "senales" does not exist» sería un rojo
 * que no dice nada.
 *
 * ── Por qué la primera suite existe ────────────────────────────────────────
 *
 * Ningún archivo de `src/schema/` importa `@v2/civic-core` —drizzle-kit corre en
 * CJS y se atraganta con los imports ESM sufijados en `.js` del barril—, y los
 * INSERT de catálogo se escriben a mano en el `.sql`. O sea que hay **dos
 * copias** del vocabulario: la del núcleo y la de la migración. Dos copias sin
 * guarda son dos copias que van a divergir, y la divergencia no se ve como un
 * error sino como filas que la FK compuesta rechaza sin que nadie entienda por
 * qué.
 */
import { readFileSync } from 'node:fs';

import { CLASE_DE_TIPO, TIPOS_SENAL, checkDeAltura, claseDe } from '@v2/civic-core';
import { config } from 'dotenv';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { CUERPO_ALTURA_CHK } from '../src/schema/_senales-direccion.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const MIGRACION = new URL('../migrations/0022_senales.sql', import.meta.url);
const SQL_0022 = readFileSync(MIGRACION, 'utf8');

// ---------------------------------------------------------------------------
// Leer el catálogo del `.sql`, sin base
// ---------------------------------------------------------------------------

/** Una fila de catálogo tal como quedó escrita: los literales entre paréntesis. */
type FilaCruda = readonly string[];

/**
 * Las tuplas del `VALUES` de un INSERT del `.sql`.
 *
 * Se parsea el archivo y no se importa una constante de TypeScript **a
 * propósito**: lo que se quiere afirmar es que el texto que la base va a
 * ejecutar dice lo mismo que el núcleo. Una constante compartida haría que el
 * test comparara una cosa contra sí misma, que es exactamente el fallo abierto
 * que esta suite existe para no tener.
 */
function filasDe(tabla: string): readonly FilaCruda[] {
  const bloque = new RegExp(`INSERT INTO "${tabla}"[^;]*?VALUES([\\s\\S]*?)ON CONFLICT`, 'u');
  const encontrado = bloque.exec(SQL_0022);
  if (encontrado === null) throw new Error(`la 0022 no siembra "${tabla}"`);
  const cuerpo = encontrado[1] ?? '';
  return [...cuerpo.matchAll(/\(([^)]*)\)/gu)].map((m) =>
    (m[1] ?? '')
      .split(',')
      .map((campo) => campo.trim().replace(/^'|'$/gu, '')),
  );
}

/** Los 20 pares `(clase, estado)` que la spec declara, en orden de ciclo de vida. */
const ESTADOS_POR_CLASE: Readonly<Record<string, readonly string[]>> = {
  hecho: ['enviada', 'por_verificar', 'corroborada', 'resuelta', 'desactualizada', 'retirada'],
  acto: [
    'enviada',
    'por_verificar',
    'corroborada',
    'resuelta',
    'no_cumplida',
    'desactualizada',
    'retirada',
  ],
  deseo: ['enviada', 'desactualizada', 'retirada'],
  meta: ['enviada', 'resuelta', 'desactualizada', 'retirada'],
};

const TEMAS = [
  'alimento',
  'vivienda',
  'trabajo',
  'cuidado',
  'salud',
  'educación',
  'ambiente',
  'movilidad',
  'seguridad',
  'cultura',
  'democracia',
];

describe('el vocabulario de la migración y el del núcleo son el mismo', () => {
  it('los nueve tipos entran con la clase que dice `CLASE_DE_TIPO`, y en el orden de `TIPOS_SENAL`', () => {
    expect(filasDe('tipos_senal')).toEqual(
      TIPOS_SENAL.map((tipo, i) => [tipo, claseDe(tipo), String(i + 1)]),
    );
  });

  it('el par (sueño, hecho) no existe', () => {
    // No hay CHECK que lo prohíba: lo prohíbe la ausencia de la fila, que es lo
    // que hace fallar la clave foránea compuesta de `senales`.
    const pares = filasDe('tipos_senal').map(([tipo, clase]) => `${String(tipo)}/${String(clase)}`);
    expect(pares).not.toContain('sueño/hecho');
    expect(CLASE_DE_TIPO['sueño']).toBe('deseo');
  });

  it('son 20 pares de estado y no 22: 6 de hecho, 7 de acto, 3 de deseo y 4 de meta', () => {
    const filas = filasDe('estados_senal');
    // El número va afirmado y no sólo derivado: sin esta línea, el día que
    // alguien borre un estado de la tabla Y de la unión de TypeScript, la guarda
    // sigue verde y el vocabulario se achicó sin que nadie lo decidiera.
    expect(filas).toHaveLength(20);
    expect(filas).toEqual(
      Object.entries(ESTADOS_POR_CLASE).flatMap(([clase, estados]) =>
        estados.map((estado, i) => [estado, clase, String(i + 1)]),
      ),
    );
  });

  it('el par (corroborada, deseo) no existe', () => {
    const pares = filasDe('estados_senal').map(
      ([estado, clase]) => `${String(estado)}/${String(clase)}`,
    );
    expect(pares).not.toContain('corroborada/deseo');
    // Y su gemelo, que es la razón por la que `acto` no puede quedarse afuera:
    // sin este par la máquina del compromiso no arranca nunca.
    expect(pares).toContain('corroborada/acto');
  });

  it('`borrador` no llega al servidor', () => {
    const estados = filasDe('estados_senal').map(([estado]) => estado);
    expect(estados).not.toContain('borrador');
  });

  it('los once temas entran con su etiqueta y en orden', () => {
    expect(filasDe('temas')).toEqual(
      TEMAS.map((clave, i) => [
        clave,
        `${clave.charAt(0).toUpperCase()}${clave.slice(1)}`,
        String(i + 1),
      ]),
    );
  });

  it('el techo de la altura es el de civic-core y no un número escrito dos veces', () => {
    expect(CUERPO_ALTURA_CHK).toBe(checkDeAltura('altura'));
    expect(SQL_0022).toContain(CUERPO_ALTURA_CHK);
  });

  it('los nueve CHECK de dirección están en la migración que crea la tabla', () => {
    for (const nombre of [
      'senales_direccion_chk',
      'senales_direccion_origen_chk',
      'senales_altura_chk',
      'senales_direccion_texto_len_chk',
      'senales_altura_punto_chk',
      'senales_altura_rol_chk',
      'senales_texto_libre_rol_chk',
      'senales_direccion_protegida_chk',
      'senales_origen_provincia_chk',
    ]) {
      expect(SQL_0022).toContain(nombre);
    }
  });

  it('`senales_calle_idx` se crea UNA sola vez', () => {
    // A lo declara al cerrar su bloque y B lo repite en su lista de siete, con
    // el mismo nombre. Concatenar los dos bloques aborta la migración con
    // `relation "senales_calle_idx" already exists`.
    expect(SQL_0022.match(/senales_calle_idx/gu)).toHaveLength(1);
  });

  it('las seis tablas viejas quedan, con el aviso adentro de la base', () => {
    for (const tabla of [
      'dreams',
      'pulse_signals',
      'proposals',
      'proposal_votes',
      'proposal_status_history',
      'mandate_suggestions',
    ]) {
      expect(SQL_0022).toContain(`COMMENT ON TABLE "${tabla}"`);
      expect(SQL_0022).not.toContain(`DROP TABLE "${tabla}"`);
    }
    // La fecha y el número van adentro del comentario: quien abre `psql` para
    // entender una tabla rara casi nunca tiene el repo al lado.
    expect(SQL_0022).toContain('RETIRADA 2026-08-13 (migración 0022)');
  });
});

// ---------------------------------------------------------------------------
// Los imposibles, contra Postgres
// ---------------------------------------------------------------------------

const URL_BASE = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

async function tablaExiste(): Promise<boolean> {
  if (URL_BASE === undefined || URL_BASE.length === 0) return false;
  const pool = new pg.Pool({ connectionString: URL_BASE, max: 1 });
  try {
    const { rows } = await pool.query<{ hay: boolean }>(
      `select to_regclass('public.senales') is not null as hay`,
    );
    return rows[0]?.hay === true;
  } finally {
    await pool.end();
  }
}

const APLICADA = await tablaExiste();
if (!APLICADA) {
  process.stdout.write(
    '\n[senales-imposibles] Los imposibles contra Postgres se saltean: la 0022 no está aplicada\n' +
      '  (o no hay DATABASE_URL). Es el estado correcto mientras la migración esté escrita y sin\n' +
      '  correr. Las afirmaciones sobre el vocabulario del .sql corren igual y no necesitan base.\n' +
      '  Para habilitarlos:  pnpm --filter @v2/db db:migrate\n\n',
  );
}
const suiteViva = APLICADA ? describe : describe.skip;

suiteViva('lo que la base tiene que rechazar', () => {
  let pool: pg.Pool;

  beforeAll(() => {
    pool = new pg.Pool({ connectionString: URL_BASE, max: 1 });
  });
  afterAll(async () => {
    await pool.end();
  });

  /**
   * Corre una sentencia y devuelve el error del motor, siempre con ROLLBACK.
   *
   * Nunca deja una fila: si el INSERT llegara a entrar —que es justo el defecto
   * que se busca—, el ROLLBACK la saca y la aserción se pone roja igual.
   */
  const rechazo = async (sentencia: string): Promise<string> => {
    const cliente = await pool.connect();
    try {
      await cliente.query('begin');
      await cliente.query(sentencia);
      return '';
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    } finally {
      await cliente.query('rollback');
      cliente.release();
    }
  };

  /** El molde mínimo de una señal válida, para variarle una sola cosa por test. */
  const senal = (campos: Record<string, string>): string => {
    const base: Record<string, string> = {
      tipo: `'basta'`,
      clase: `'hecho'`,
      origen: `'web'`,
      id_local: 'gen_random_uuid()',
      texto: `'hay un pozo'`,
      ...campos,
    };
    const columnas = Object.keys(base).join(', ');
    const valores = Object.values(base).join(', ');
    return `insert into senales (${columnas}) values (${valores})`;
  };

  it('un sueño no puede ser un hecho', async () => {
    expect(await rechazo(senal({ tipo: `'sueño'`, clase: `'hecho'` }))).toContain(
      'senales_tipo_clase_fk',
    );
  });

  it('un deseo no se corrobora', async () => {
    expect(
      await rechazo(senal({ tipo: `'sueño'`, clase: `'deseo'`, estado: `'corroborada'` })),
    ).toContain('senales_estado_clase_fk');
  });

  it('un compromiso sin fecha no entra', async () => {
    expect(
      await rechazo(
        senal({ tipo: `'compromiso'`, clase: `'acto'`, desenlace: `'abierto'` }),
      ),
    ).toContain('senales_acto_tiene_fecha_chk');
  });

  it('un saber sin fuente no entra', async () => {
    expect(await rechazo(senal({ tipo: `'saber'` }))).toContain('senales_saber_trae_fuente_chk');
  });

  it('una práctica sin periodicidad no entra', async () => {
    expect(await rechazo(senal({ tipo: `'práctica'` }))).toContain(
      'senales_practica_tiene_periodicidad_chk',
    );
  });

  it('un compromiso incumplido no dice resuelta', async () => {
    expect(
      await rechazo(
        senal({
          tipo: `'compromiso'`,
          clase: `'acto'`,
          comprometido_para: `'2026-12-01'`,
          desenlace: `'no_cumplido'`,
          estado: `'resuelta'`,
        }),
      ),
    ).toContain('senales_acto_coherente_chk');
  });

  it('una altura con rol `subject` no entra', async () => {
    expect(
      await rechazo(
        senal({
          altura: '1450',
          calle_id: '1',
          direccion_estado: `'altura_sin_rango'`,
          direccion_texto: `'RIVADAVIA 1450'`,
          location_role: `'subject'`,
          sensitivity: `'low'`,
        }),
      ),
    ).toContain('senales_altura_rol_chk');
  });

  it('un `texto_libre` con rol `subject` no entra', async () => {
    expect(
      await rechazo(
        senal({
          direccion_estado: `'texto_libre'`,
          direccion_texto: `'atrás de la escuela'`,
          location_role: `'subject'`,
          sensitivity: `'low'`,
        }),
      ),
    ).toContain('senales_texto_libre_rol_chk');
  });

  it('una dirección con `subject` + `high` no entra', async () => {
    expect(
      await rechazo(
        senal({
          calle_id: '1',
          direccion_estado: `'calle'`,
          direccion_texto: `'RIVADAVIA'`,
          location_role: `'subject'`,
          sensitivity: `'high'`,
        }),
      ),
    ).toContain('senales_direccion_protegida_chk');
  });

  it('una altura con punto y precisión gruesa no entra', async () => {
    expect(
      await rechazo(
        senal({
          altura: '1450',
          calle_id: '1',
          direccion_estado: `'altura_sin_rango'`,
          direccion_texto: `'RIVADAVIA 1450'`,
          location_role: `'capture'`,
          sensitivity: `'low'`,
          lat: '-34.61',
          lng: '-58.38',
          precision: `'500m'`,
        }),
      ),
    ).toContain('senales_altura_punto_chk');
  });

  it('`province_id` con `ubicacion_origen = ninguna` no entra', async () => {
    expect(await rechazo(senal({ province_id: '1' }))).toContain('senales_origen_provincia_chk');
  });

  it('el cero de una altura no entra', async () => {
    expect(
      await rechazo(
        senal({
          altura: '0',
          calle_id: '1',
          direccion_estado: `'altura_sin_rango'`,
          direccion_texto: `'RIVADAVIA'`,
          location_role: `'capture'`,
          sensitivity: `'low'`,
        }),
      ),
    ).toContain('senales_altura_chk');
  });

  it('nadie rechaza el engrosado de una casa ajena', async () => {
    expect(
      await rechazo(senal({ casa: `'ajena'`, engrosado_rechazado: 'true' })),
    ).toContain('senales_rechazo_chk');
  });

  it('una pregunta no se responde con un sueño', async () => {
    expect(
      await rechazo(
        `insert into respuestas (pregunta_id, pregunta_clase, senal_id, senal_clase)
         values (1, 'meta', 2, 'deseo')`,
      ),
    ).toContain('respuestas_senal_clase_chk');
  });

  it('una necesidad no es una pregunta', async () => {
    expect(
      await rechazo(
        `insert into respuestas (pregunta_id, pregunta_clase, senal_id, senal_clase)
         values (1, 'hecho', 2, 'hecho')`,
      ),
    ).toContain('respuestas_pregunta_clase_chk');
  });

  it('dos adhesiones de la misma persona son una', async () => {
    expect(
      await rechazo(
        `insert into adhesiones (senal_id, actor_id) values (1, 1), (1, 1)`,
      ),
    ).toContain('adhesiones_pk');
  });

  it('un actor retirado no conserva su hash', async () => {
    expect(
      await rechazo(
        `insert into actores (origen, actor_hash, retirado_en)
         values ('web', '\\x00'::bytea, now())`,
      ),
    ).toContain('actores_retiro_chk');
  });
});

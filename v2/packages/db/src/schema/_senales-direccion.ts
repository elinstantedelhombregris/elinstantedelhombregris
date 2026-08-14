/**
 * Los nueve CHECK de la dirección, sobre `senales`.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §3.4.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 11.
 *
 * Viven en un archivo propio y no adentro de `senales.ts` por dos razones, y la
 * segunda es la que importa:
 *
 * 1. `senales.ts` con todo adentro pasa las 300 líneas que el CLAUDE.md de v2
 *    fija por archivo de schema.
 * 2. **Son la mitad de A de una tabla que es de B.** A define la dirección y B
 *    la aplica; tenerlos juntos y aparte hace que se puedan leer y auditar como
 *    la unidad que son, y que la próxima tabla que necesite dirección los
 *    consuma en vez de copiarlos.
 *
 * Van en la MISMA migración que crea la tabla, no en una posterior: `senales` es
 * la única ingesta del sistema y toda la defensa de A §2.6 depende de que estén
 * desde el primer minuto. Sin ellos, la regla pasa a depender de que alguien
 * llame a `ubicacionPublicable`, o sea de la costumbre que A rechaza tres veces.
 *
 * **Se escriben con `sql.raw` y nombres de columna crudos**, no con `${t.col}`,
 * porque el array se arma antes de que exista la tabla. Los nombres son los de
 * `direccionColumns` y `geoColumns` de `_geo-columns.ts`; el test de la
 * migración los verifica contra el `.sql` generado.
 */
import { sql } from 'drizzle-orm';
import { check } from 'drizzle-orm/pg-core';

/**
 * El cuerpo de `senales_altura_chk`, que es el de `checkDeAltura('altura')` de
 * `@v2/civic-core` — `ALTURA_PISO_EXCLUSIVO` 0 y `ALTURA_TECHO_EXCLUSIVO`
 * 1.000.000.
 *
 * **No se importa a propósito**, y no es descuido: ningún archivo de
 * `src/schema/` importa `@v2/civic-core`, porque drizzle-kit corre en CJS y se
 * atraganta con los imports ESM sufijados en `.js` del barril del núcleo. Lo que
 * cierra el hueco es el test: `tests/senales-imposibles.test.ts` compara este
 * texto contra `checkDeAltura('altura')` y se pone rojo si alguien mueve el
 * techo de un solo lado.
 */
export const CUERPO_ALTURA_CHK = 'altura IS NULL OR (altura > 0 AND altura < 1000000)';

/**
 * Los nueve, en el orden de A §3.4. Se spread-ean en la config extra de
 * `senales`.
 *
 * El décimo objeto de ese bloque de la spec —`senales_calle_idx`— va **una sola
 * vez** y con la tabla, no acá: A lo declara al cerrar su bloque y B lo repite
 * en su lista de siete, con el mismo nombre y el mismo predicado. Quien escriba
 * la migración concatenando los dos bloques aborta con `relation
 * "senales_calle_idx" already exists` en la migración que crea la tabla.
 */
export const checksDeDireccion = [
  /**
   * La unión discriminada de A §2.5, hecha cumplir por la base. Cada rama fija
   * QUÉ columnas tienen que estar y cuáles faltar, y de paso cierra el dominio
   * de `direccion_estado`: un valor desconocido no satisface ninguna rama y la
   * fila se rechaza. Por eso no hay un CHECK de enum aparte.
   */
  check(
    'senales_direccion_chk',
    sql.raw(
      `(direccion_estado = 'sin_direccion'
          AND calle_id IS NULL AND altura IS NULL AND direccion_texto IS NULL)
   OR (direccion_estado = 'calle'
          AND calle_id IS NOT NULL AND altura IS NULL AND direccion_texto IS NOT NULL)
   OR (direccion_estado IN ('altura_en_rango','altura_sin_rango','altura_fuera_de_rango')
          AND calle_id IS NOT NULL AND altura IS NOT NULL AND direccion_texto IS NOT NULL)
   OR (direccion_estado = 'texto_libre'
          AND calle_id IS NULL AND altura IS NULL AND direccion_texto IS NOT NULL)`,
    ),
  ),

  check(
    'senales_direccion_origen_chk',
    sql.raw(`ubicacion_origen IN ('catalogo','punto','declarada','ninguna')`),
  ),

  check('senales_altura_chk', sql.raw(CUERPO_ALTURA_CHK)),

  /** El tope 120 es el de `normalizedLocationLabel`, y acá sí hecho cumplir. */
  check(
    'senales_direccion_texto_len_chk',
    sql.raw('direccion_texto IS NULL OR length(direccion_texto) <= 120'),
  ),

  /**
   * Una altura al lado de un punto engrosado a 500 m lo vuelve a afinar y anula
   * el engrosado por la ventana.
   */
  /** `precision` va entre comillas: es palabra clave no reservada de Postgres
   *  —`DOUBLE PRECISION`— y una columna que se llama como un keyword se cita. */
  check(
    'senales_altura_punto_chk',
    sql.raw(`altura IS NULL OR lat IS NULL OR "precision" = 'exact'`),
  ),

  /**
   * Los dos de rol **enumeran los roles que sí pueden llevar altura** en vez de
   * decir `<> 'subject'`. Es la diferencia entre «no es una persona» y «es una
   * cosa»: `service_area` no es ninguna de las dos y caía en el medio, así que
   * bajo la regla vieja un `saber` sobre la casa de otro salía con calle, altura
   * y texto libre, y sin piso posible.
   */
  check(
    'senales_altura_rol_chk',
    sql.raw(`altura IS NULL OR location_role IN ('capture','meeting_point')`),
  ),
  check(
    'senales_texto_libre_rol_chk',
    sql.raw(`direccion_estado <> 'texto_libre' OR location_role IN ('capture','meeting_point')`),
  ),

  check(
    'senales_direccion_protegida_chk',
    sql.raw(
      `NOT (location_role = 'subject' AND sensitivity = 'high')
       OR direccion_estado = 'sin_direccion'`,
    ),
  ),

  /**
   * A §2.7: una fila con provincia tiene que decir de dónde salió, o el conjunto
   * de D-011 —las filas cuya provincia sale de un polígono que puede estar mal—
   * queda incompleto sin que nada avise.
   */
  check(
    'senales_origen_provincia_chk',
    sql.raw(`province_id IS NULL OR ubicacion_origen <> 'ninguna'`),
  ),
] as const;

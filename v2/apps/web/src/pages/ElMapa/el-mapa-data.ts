import {
  CLASE_BORDE,
  CLASE_FONDO,
  CLASE_TEXTO,
  PROMPT_DE_TIPO,
  PROMPT_NEUTRO,
  TIPOS_SENAL,
  claseDe,
  leerTipoSenal,
  type ClaseSenal,
  type TipoSenal,
} from '~/lib/vocabulario';

/**
 * Las tablas de color del mapa sobre PAPEL, llaveadas por CLASE.
 *
 * Antes eran tres `Record<TipoVoz, string>` de seis entradas cada una, más las
 * dos del chrome oscuro, más la del chip: cinco tablas paralelas que había que
 * editar juntas o el vocabulario quedaba a medias. Ahora son punteros a las
 * cuatro de `lib/vocabulario.ts`, y el color de un tipo nuevo sale solo de
 * haberlo clasificado.
 */
export { TIPOS_SENAL, claseDe };
export type { ClaseSenal, TipoSenal };

/** Relleno de los puntos del mapa. */
export const FILL_CLASE: Readonly<Record<ClaseSenal, string>> = {
  hecho: 'fill-ambar',
  deseo: 'fill-violeta',
  acto: 'fill-verde',
  meta: 'fill-cian',
};

/** Color del label en el feed (sobre papel). */
export const TEXTO_CLASE = CLASE_TEXTO;

/** Borde izquierdo del popover — el color va en el borde y no en texto sobre oscuro (AA). */
export const BORDE_CLASE = CLASE_BORDE;

export const FONDO_CLASE = CLASE_FONDO;

export const PLACEHOLDER_NEUTRO = PROMPT_NEUTRO;
export const PLACEHOLDER_TIPO = PROMPT_DE_TIPO;

/**
 * La clase de una categoría que viene de la base, para PINTAR.
 *
 * Devuelve `null` cuando no la reconoce. El `tipoDeCategoria` que reemplaza
 * hacía `?? 'valor'` y por eso una fila con un tipo mal escrito se pintaba como
 * si fuera algo — indistinguible de una legítima, y sesgando cualquier cuenta
 * que se hiciera sobre esa lectura.
 */
export function claseDeCategoria(categoria: string | null): ClaseSenal | null {
  const lectura = leerTipoSenal(categoria ?? '');
  return lectura.reconocido ? claseDe(lectura.tipo) : null;
}

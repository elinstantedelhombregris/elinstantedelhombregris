import {
  PROMPT_DE_TIPO,
  PROMPT_NEUTRO,
  TIPOS_SENAL,
  claseDe,
  leerTipoSenal,
  type ClaseSenal,
  type TipoSenal,
} from '~/lib/vocabulario';

/**
 * Lo que la página del mapa toma del vocabulario: los tipos, su clase y los
 * textos de ayuda del formulario. Los colores por clase viven en
 * `lib/vocabulario.ts` (`CLASE_*`) y cada pantalla los lee de ahí.
 */
export { TIPOS_SENAL, claseDe };
export type { ClaseSenal, TipoSenal };

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

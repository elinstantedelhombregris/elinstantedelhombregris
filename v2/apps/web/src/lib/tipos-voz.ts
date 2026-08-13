import type { TipoVoz } from '~/components/papel/primitives';

/**
 * Los 6 tipos de voz que la web SABE DIBUJAR, en el orden canónico (README §7).
 *
 * No son el canon. El canon vive en `civic-core` (`senal/vocabulario.ts`) y son
 * **nueve tipos en cuatro clases**, sin `valor` —un valor no tiene coordenada—.
 * Esta lista es lo que la web tiene color, rótulo y placeholder para mostrar, y
 * lo que la base tiene escrito en `dreams.category` desde antes de que el canon
 * existiera. Mientras las dos listas no coincidan, esto es una **paleta**, no un
 * vocabulario, y el test de al lado escribe exactamente cuánto falta.
 */
export const TIPOS_VOZ: readonly TipoVoz[] = ['basta', 'sueño', 'necesidad', 'compromiso', 'recurso', 'valor'];

/**
 * Leer una categoría sin sumidero.
 *
 * Unión discriminada, con la misma forma que `leerTipo` del canon y por la
 * misma razón: «es un `valor`» y «no sé qué es esto» son dos afirmaciones
 * distintas, y sólo una de las dos se puede contar en una composición.
 */
export type LecturaDeTipoVoz =
  | { readonly reconocido: true; readonly tipo: TipoVoz }
  | { readonly reconocido: false; readonly crudo: string };

export function leerTipoVoz(categoria: string | null): LecturaDeTipoVoz {
  const tipo = TIPOS_VOZ.find((t) => t === categoria);
  return tipo === undefined ? { reconocido: false, crudo: categoria ?? '' } : { reconocido: true, tipo };
}

/**
 * EL ÚNICO PLIEGUE DE LA WEB, y sólo para pintar.
 *
 * Vivía copiado en cuatro archivos —`el-mapa-data.ts`, `paleta.ts`,
 * `mandato-regimen.ts` y `VocesTicker.tsx`— como un `?? 'valor'` suelto. Tres
 * copias de un default es cómo un vocabulario muerto sobrevive dos años: cada
 * copia hay que encontrarla para migrarla, y la que no se encuentre sigue
 * plegando en silencio.
 *
 * Acá está una sola vez, con nombre y con su límite escrito: **sirve para
 * elegir un color, no para contar**. Lo que cuenta —una composición, un total
 * por tipo, cualquier cosa que después se lea como una afirmación sobre el
 * país— usa `leerTipoVoz` y separa lo que no reconoce, porque plegarlo contra
 * un tipo real sesga la cuenta por construcción. Y lo que entra al motor de la
 * Simulación no pasa por acá en absoluto: usa `leerTipo` del canon.
 */
export const TIPO_PARA_LO_QUE_NO_ESTA_EN_LA_PALETA: TipoVoz = 'valor';

export function tipoParaPintar(categoria: string | null): TipoVoz {
  const lectura = leerTipoVoz(categoria);
  return lectura.reconocido ? lectura.tipo : TIPO_PARA_LO_QUE_NO_ESTA_EN_LA_PALETA;
}

import { CLASE_COLOR_OSCURO, colorDeClase, type ClaseSenal } from '~/lib/vocabulario';

/**
 * La paleta de las señales SOBRE FONDO OSCURO, llaveada por CLASE.
 *
 * No es la misma que sobre papel y no puede serlo: el violeta normal (#5227CC)
 * se hunde en el fondo #16130E y necesita su variante clara. Los valores salen
 * de `tailwind.config.ts` y se declaran en hexadecimal porque maplibre pinta en
 * WebGL: no entiende clases de Tailwind.
 *
 * `TIPOS` —la lista de seis que vivía acá— se borró: el grep no le encontró un
 * solo consumidor.
 */
export const COLOR_CLASE: Readonly<Record<ClaseSenal, string>> = CLASE_COLOR_OSCURO;

/**
 * Con qué color se dibuja una señal sobre el chrome oscuro.
 *
 * Devuelve `null` cuando no reconoce la clase, y eso es deliberado: el
 * `?? 'valor'` que vivía acá hacía indistinguible una clase que no existe de
 * una que sí, y cualquier cuenta hecha sobre esa lectura quedaba sesgada.
 */
export function colorDe(clase: string | null): string | null {
  return colorDeClase(clase);
}

/** Superficies del chrome oscuro, para no repetir los hex por todos lados. */
export const FONDO = '#16130E';
export const FONDO_PANEL = '#241F17';
export const BORDE = '#3A362D';
export const TEXTO = '#F2EFE7';
export const TEXTO_TENUE = '#8E8A82';

/**
 * Las rampas del modo análisis. Cada una arranca casi en el fondo y termina
 * en un color del sistema: la intensidad se lee como «cuánta tinta hay»,
 * no como un semáforo.
 */
export const RAMPAS: Record<string, { nombre: string; colores: readonly string[] }> = {
  violeta: { nombre: 'Violeta', colores: ['#241F17', '#3B2A66', '#5227CC', '#9D85E8'] },
  sello: { nombre: 'Sello', colores: ['#241F17', '#5A2417', '#C23B22', '#E8846F'] },
  verde: { nombre: 'Verde', colores: ['#241F17', '#14402C', '#1A7A4A', '#5FCF97'] },
  ambar: { nombre: 'Ámbar', colores: ['#241F17', '#4A3208', '#A16C00', '#E0AE4A'] },
};

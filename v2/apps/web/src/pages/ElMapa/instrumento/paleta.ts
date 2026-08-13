import type { TipoVoz } from '~/components/papel/primitives';

import { tipoParaPintar } from '~/lib/tipos-voz';

/**
 * La paleta de las señales SOBRE FONDO OSCURO.
 *
 * No es la misma que sobre papel, y no puede serlo: `tinta` (#16130E) es el
 * color del tipo «valor» sobre papel y es exactamente el color del fondo acá —
 * sería un punto invisible. Lo mismo con el violeta, que sobre oscuro necesita
 * su variante clara para leerse.
 *
 * Todos los valores salen de `tailwind.config.ts`. Se declaran en hexadecimal
 * porque maplibre pinta en WebGL: no entiende clases de Tailwind.
 */
export const COLOR_TIPO: Record<TipoVoz, string> = {
  basta: '#C23B22', // sello
  sueño: '#9D85E8', // violeta claro — el violeta normal se hunde en el fondo
  necesidad: '#A16C00', // ámbar
  compromiso: '#1A7A4A', // verde
  recurso: '#0F6B8A', // cian
  valor: '#C9C5BA', // oscuro-secundario — sobre papel es tinta, acá sería el fondo
};

/** El orden del panel y de la barra de composición. */
export const TIPOS: readonly TipoVoz[] = [
  'basta',
  'sueño',
  'necesidad',
  'compromiso',
  'recurso',
  'valor',
];

/**
 * Con qué color se dibuja una categoría sobre el chrome oscuro.
 *
 * El pliegue de lo que no está en la paleta vive UNA vez, en
 * `lib/tipos-voz.ts`. Acá pintar es lo único que se hace con el resultado: lo
 * que **cuenta** usa `leerTipoVoz`, y lo que entra al motor de la Simulación
 * usa `leerTipo` del canon y no pasa por esta paleta.
 */
export function tipoDe(categoria: string | null): TipoVoz {
  return tipoParaPintar(categoria);
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

import { type Tema } from '../radiografia-data';

import type { RadiografiaPublica } from '~/lib/queries/radiografia';

/**
 * § El régimen degenerado — la advertencia que sostiene todo lo de abajo.
 *
 * El grafo de convergencia le busca a cada señal sus `k` vecinas más
 * parecidas, y esa elección es de dónde sale la partición en núcleos. Cuando
 * hay `n ≤ k + 1` señales analizadas, **no hay nada que elegir**: cada señal
 * queda vecina de todas las demás por aritmética, antes de leer una sola
 * frase. Los núcleos que se dibujan salen del método, no del corpus.
 *
 * Se dice **con palabras y arriba**, no con un ícono ni en un pie. Va donde el
 * lector saca la conclusión —justo antes de la constelación y de la lista—
 * porque una advertencia que llega después de la imagen ya llegó tarde.
 *
 * Y no se dice como un error de sistema, porque no lo es: es hasta dónde llega
 * el instrumento con el corpus que hay. Se desarma solo cuando el corpus crece,
 * igual que el cielo vacío: la página no tiene ningún flag que alguien tenga
 * que acordarse de bajar.
 */

export interface RegimenDegeneradoProps {
  /** Lo que manda el servidor. `null` es «no aplica» y no dibuja nada. */
  regimen: RadiografiaPublica['regimenDegenerado'];
  tema: Tema;
}

const numero = (v: number): string => new Intl.NumberFormat('es-AR').format(v);

/** `8 señales analizadas` · `1 señal analizada`. La concordancia importa. */
const analizadas = (n: number): string =>
  `${numero(n)} ${n === 1 ? 'señal analizada' : 'señales analizadas'}`;

const vecinas = (k: number): string => `${numero(k)} ${k === 1 ? 'vecina' : 'vecinas'}`;

export function RegimenDegenerado({ regimen, tema }: RegimenDegeneradoProps) {
  if (!regimen) return null;

  const { n, k } = regimen;
  const nocturno = tema === 'nocturno';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-tinta';
  const rotulo = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  const secundario = nocturno ? 'text-oscuro-secundario' : 'text-tinta-75';

  return (
    <section aria-label="Hasta dónde llega este corte" className={`border-2 ${borde} mb-8 p-6`}>
      <p className={`font-space mb-3 text-[11px] font-bold uppercase tracking-[0.14em] ${rotulo}`}>
        El instrumento, en su límite
      </p>

      <p className={`font-archivo text-[19px] leading-[1.35] ${texto}`}>
        Con {analizadas(n)}, los núcleos de acá abajo no dependen de lo que dijo nadie.
      </p>

      <p className={`mt-3 max-w-[70ch] text-[15px] leading-[1.6] ${secundario}`}>
        Para armar los núcleos, el método le busca a cada señal hasta {vecinas(k)}: las más
        parecidas que encuentre. Hoy hay {analizadas(n)}, así que no hay entre quiénes elegir — a
        cada una le tocan como vecinas todas las demás. El grafo queda completo antes de leer una
        sola frase, y lo que se ve acá abajo es esa aritmética dibujada.
      </p>

      <p className={`mt-3 max-w-[70ch] text-[13px] leading-[1.55] ${rotulo}`}>
        Se puede mirar. No se puede leer como una medición de lo que la gente escribió, ni mover el
        umbral y sacar conclusiones de cómo se funden las islas. Esto no es un error: es hasta dónde
        llega el instrumento con el corpus que hay, y se desarma solo — desde las{' '}
        {analizadas(k + 2)}, quién queda vecino de quién vuelve a depender del contenido.
      </p>
    </section>
  );
}

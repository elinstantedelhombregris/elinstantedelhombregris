import { type Tema } from '../radiografia-data';

import type { RadiografiaPublica } from '~/lib/queries/radiografia';

/**
 * § El régimen degenerado — la advertencia que sostiene todo lo de abajo.
 *
 * El grafo de convergencia le busca a cada aporte sus `k` vecinos más
 * parecidos, y esa elección es de dónde sale la partición en grupos. Cuando
 * hay `n ≤ k + 1` aportes analizados, **no hay nada que elegir**: cada aporte
 * queda vecino de todos los demás por aritmética, antes de leer una sola
 * frase. Los grupos que se dibujan salen del método, no del corpus.
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

/** `8 aportes analizados` · `1 aporte analizado`. La concordancia importa. */
const analizadas = (n: number): string =>
  `${numero(n)} ${n === 1 ? 'aporte analizado' : 'aportes analizados'}`;

const vecinas = (k: number): string => `${numero(k)} ${k === 1 ? 'vecino' : 'vecinos'}`;

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
        Un límite de esta lectura
      </p>

      <p className={`font-archivo text-[19px] leading-[1.35] ${texto}`}>
        Con {analizadas(n)}, los grupos de acá abajo no dependen de lo que dijo nadie.
      </p>

      <p className={`mt-3 max-w-[70ch] text-[15px] leading-[1.6] ${secundario}`}>
        Para armar los grupos, el método le busca a cada aporte hasta {vecinas(k)}: los más
        parecidos que encuentre. Hoy hay {analizadas(n)}, así que no hay entre quiénes elegir: a
        cada uno le tocan como vecinos todos los demás. Las relaciones quedan completas antes de
        leer una sola frase, y lo que se ve acá abajo es esa aritmética dibujada.
      </p>

      <p className={`mt-3 max-w-[70ch] text-[13px] leading-[1.55] ${rotulo}`}>
        Se puede mirar. No se puede leer como una medición de lo que la gente escribió, ni mover el
        nivel de parecido para sacar conclusiones de cómo se juntan los grupos. Esto no es un error:
        es hasta dónde llega el instrumento con los aportes que hay, y se desarma solo. Desde{' '}
        {analizadas(k + 2)}, quién queda vecino de quién vuelve a depender del contenido.
      </p>
    </section>
  );
}

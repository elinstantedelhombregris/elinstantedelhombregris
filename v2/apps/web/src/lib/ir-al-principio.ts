import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Cuánto esperamos a que aparezca el ancla antes de rendirnos e ir arriba.
 * Las páginas se cargan con `lazy()`: cuando corre el efecto todavía se ve
 * el fallback de Suspense y la sección no existe.
 */
const ESPERA_MAXIMA_DEL_ANCLA_MS = 2000;

function irArriba(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

/** El ancla de la dirección actual («ensayos» en `/biblioteca#ensayos`), o ''. */
export function anclaActual(): string {
  return window.location.hash.replace('#', '');
}

/**
 * Salta a una sección por su ancla. Devuelve `false` si no existe, para que
 * el que llama sepa que no hizo nada.
 *
 * `suave` distingue los dos momentos, que no son el mismo:
 * - **Llegando** a la página (`suave: false`): la sección tiene que estar ya
 *   puesta cuando aparece la página. Deslizarse desde arriba de un documento
 *   recién cargado no muestra nada —no hay contexto que recorrer— y encima
 *   compite con el layout que todavía se está acomodando.
 * - **Adentro** de la página (`suave: true`): ahí el deslizamiento sí dice
 *   algo, porque el lector estaba en algún lado y ve hacia dónde va.
 * En los dos casos manda `prefers-reduced-motion`.
 */
export function saltarASeccion(ancla: string, { suave = true } = {}): boolean {
  const destino = document.getElementById(ancla);
  if (!destino) return false;
  const quietito = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  destino.scrollIntoView({ behavior: suave && !quietito ? 'smooth' : 'auto', block: 'start' });
  return true;
}

/**
 * Un link del menú a una sección (`/biblioteca#ensayos`), resuelto contra la
 * página actual. Devuelve `true` si ya saltó —y entonces el que llama tiene
 * que cancelar la navegación— y `false` si el link tiene que seguir su curso
 * normal, sea porque va a otra página o porque la sección no existe.
 */
export function saltarSiEsLaMismaPagina(href: string, location: string): boolean {
  const [ruta = '', ancla] = href.split('#');
  if (ancla === undefined || ruta !== location) return false;
  return saltarASeccion(ancla);
}

/**
 * Toda navegación empieza donde empieza la página.
 *
 * Sin esto wouter cambia el contenido y no toca el scroll: entrás a un
 * ensayo desde el pie de la biblioteca y caés a la mitad del ensayo. El
 * navegador tampoco ayuda solo — con `pushState` no hay salto de ancla
 * nativo.
 *
 * Con ancla en la dirección (`/biblioteca#ensayos`) vamos a esa sección;
 * sin ancla, arriba de todo.
 *
 * Apagamos la restauración del navegador (`scrollRestoration = 'manual'`)
 * para que no pelee con nosotros al volver atrás. El costo aceptado: «atrás»
 * también te deja arriba y no donde estabas leyendo.
 */
export function useIrAlPrincipio(): void {
  const [location] = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const ancla = anclaActual();
    if (ancla === '') {
      irArriba();
      return;
    }

    // Llegando: instantáneo. Ver la nota de `saltarASeccion`.
    if (saltarASeccion(ancla, { suave: false })) return;

    // Todavía no está: la página es lazy y se está viendo el fallback de
    // Suspense. Esperamos a que el DOM cambie —no a que haya frames: una
    // pestaña en segundo plano no tiene, y ahí el salto nunca ocurriría— y
    // revisamos en cada cambio hasta que la sección aparezca.
    let plazo = 0;
    const observador = new MutationObserver(() => {
      if (saltarASeccion(ancla, { suave: false })) dejarDeEsperar();
    });

    function dejarDeEsperar(): void {
      observador.disconnect();
      window.clearTimeout(plazo);
    }

    observador.observe(document.body, { childList: true, subtree: true });
    // Si la sección no aparece nunca (un ancla vieja, contenido que ya no
    // está), no dejamos al lector colgado a media página anterior.
    plazo = window.setTimeout(() => {
      dejarDeEsperar();
      irArriba();
    }, ESPERA_MAXIMA_DEL_ANCLA_MS);

    return dejarDeEsperar;
  }, [location]);
}

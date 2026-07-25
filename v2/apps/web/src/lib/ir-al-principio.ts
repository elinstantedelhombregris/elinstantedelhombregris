import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Cuántos frames esperamos a que aparezca el ancla. Las páginas se cargan
 * con `lazy()`, así que en la primera pasada del efecto el destino todavía
 * no está montado: seguimos mirando hasta ~1s (60fps) y si no aparece nos
 * rendimos y vamos arriba, que es el comportamiento por defecto.
 */
const FRAMES_ESPERANDO_EL_ANCLA = 60;

function irArriba(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

/** El ancla de la dirección actual («ensayos» en `/biblioteca#ensayos`), o ''. */
export function anclaActual(): string {
  return window.location.hash.replace('#', '');
}

/**
 * Salta a una sección de la página en la que ya estamos.
 *
 * Hace falta porque el `location` de wouter es solo el camino, sin ancla:
 * si estás en `/biblioteca` y tocás «Los ensayos», nada cambia, el efecto
 * de {@link useIrAlPrincipio} no corre y te quedás donde estabas. Devuelve
 * `false` si la sección no existe, para que el link siga su curso normal.
 */
export function saltarASeccion(ancla: string): boolean {
  const destino = document.getElementById(ancla);
  if (!destino) return false;
  const quietito = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  destino.scrollIntoView({ behavior: quietito ? 'auto' : 'smooth', block: 'start' });
  return true;
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

    let frames = 0;
    let pedido = window.requestAnimationFrame(function buscar() {
      if (saltarASeccion(ancla)) return;
      if (frames < FRAMES_ESPERANDO_EL_ANCLA) {
        frames += 1;
        pedido = window.requestAnimationFrame(buscar);
        return;
      }
      irArriba();
    });

    return () => {
      window.cancelAnimationFrame(pedido);
    };
  }, [location]);
}

import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * El rito de la tinta corre entero UNA vez por pestaña.
 *
 * Antes corría en cada navegación: el H1 se entintaba letra por letra y el
 * cuerpo entraba con `fadeup` retrasado, y durante uno o dos segundos la
 * página llegaba vacía — en Sembrar el asistente flotaba bajo un hueco, en
 * la bitácora el título quedaba a medio entintar. La firma es la primera
 * vez; la segunda es espera.
 *
 * El estado vive en `sessionStorage` (una pestaña, una sesión) y se expresa
 * como la clase `rito-visto` en `<html>`: `index.css` lleva a duración cero
 * las animaciones de ENTRADA (`inkfill`, `inkfill-claro`, `vpop`, `fadeup`)
 * y deja intactas las de interacción (`stampin`, `dropin`, `growbar`,
 * `fadeup-rapido`).
 */
const CLAVE = 'basta_rito_visto';
export const CLASE_RITO_VISTO = 'rito-visto';

export function ritoVisto(): boolean {
  try {
    return window.sessionStorage.getItem(CLAVE) === '1';
  } catch {
    return false;
  }
}

export function marcarRitoVisto(): void {
  try {
    window.sessionStorage.setItem(CLAVE, '1');
  } catch {
    // Sin storage el rito corre en cada carga, que es lo que hacía antes.
  }
}

/** Una decisión por carga de página: la segunda llamada (StrictMode, remontajes) no cambia nada. */
let decididoEnEstaCarga = false;

/**
 * Al montar el layout: si el rito ya corrió en esta pestaña, la clase entra
 * ya y la página llega leída; si no, corre entero y queda marcado como visto
 * para la próxima carga. Devuelve si la clase quedó puesta.
 *
 * Se decide UNA vez por carga: en desarrollo StrictMode monta dos veces, y
 * sin la guarda la segunda pasada leía la marca que dejó la primera y
 * apagaba el rito en la misma carga que tenía que correrlo.
 */
export function aplicarRitoAlMontar(html: HTMLElement): boolean {
  if (decididoEnEstaCarga) return html.classList.contains(CLASE_RITO_VISTO);
  decididoEnEstaCarga = true;
  if (ritoVisto()) {
    html.classList.add(CLASE_RITO_VISTO);
    return true;
  }
  marcarRitoVisto();
  return false;
}

/** Solo para tests: vuelve a la situación de una carga nueva. */
export function reiniciarRitoParaTests(): void {
  decididoEnEstaCarga = false;
}

/** Hook del layout: primera carga con rito; desde la primera navegación, sin él. */
export function useRitoUnaVezPorSesion(): void {
  const [location] = useLocation();
  const inicial = useRef(location);

  useEffect(() => {
    aplicarRitoAlMontar(document.documentElement);
  }, []);

  useEffect(() => {
    if (location !== inicial.current) {
      document.documentElement.classList.add(CLASE_RITO_VISTO);
    }
  }, [location]);
}

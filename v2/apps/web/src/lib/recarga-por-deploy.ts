/**
 * Una pestaña abierta antes de un deploy sigue pidiendo los chunks del
 * build anterior, que ya no existen: el import dinámico de una página
 * perezosa falla y la ruta queda en blanco. Vite avisa con
 * `vite:preloadError`; la salida es recargar para traer el index nuevo.
 *
 * Se recarga una sola vez por ventana de tiempo: si el chunk falta también
 * después de recargar, el problema no es un deploy y el error tiene que
 * verse, no convertirse en un bucle de recargas.
 */
const CLAVE = 'basta_recarga_por_deploy';
const VENTANA_MS = 10_000;

export function instalarRecargaPorDeploy(): void {
  window.addEventListener('vite:preloadError', () => {
    let ultima = 0;
    try {
      ultima = Number(sessionStorage.getItem(CLAVE)) || 0;
    } catch {
      // Sin sessionStorage no hay cómo cortar el bucle: que el error se vea.
      return;
    }
    if (Date.now() - ultima < VENTANA_MS) return;

    // Sin preventDefault: si no, el import resuelve `undefined` y el wrapper
    // de `lazy` revienta con un TypeError engañoso antes de que la recarga
    // llegue. El error real se propaga y la recarga lo tapa igual.
    try {
      sessionStorage.setItem(CLAVE, String(Date.now()));
    } catch {
      return;
    }
    window.location.reload();
  });
}

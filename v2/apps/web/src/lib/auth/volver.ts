import { rutaDeVuelta } from '@v2/shared';

/** El retorno de sesión permanece dentro de la aplicación. La regla vive en `@v2/shared`: la API la usa igual. */
export function volverTrasIngresar(search: string): string {
  return rutaDeVuelta(new URLSearchParams(search).get('volver'));
}

/**
 * Enlace a `/ingresar` (o `/registrarse`) que, al terminar, devuelve a `destino`.
 * Sin destino, vuelve a la página actual: quien ingresa desde una campaña, una
 * ficha o un análisis no tiene por qué caer en Mi espacio.
 */
export function hrefIngresar(
  destino?: string,
  ruta: '/ingresar' | '/registrarse' = '/ingresar',
): string {
  const actual =
    destino ??
    (typeof window === 'undefined'
      ? '/mi-espacio'
      : `${window.location.pathname}${window.location.search}${window.location.hash}`);
  const volver = volverTrasIngresar(`?volver=${encodeURIComponent(actual)}`);
  return `${ruta}?volver=${encodeURIComponent(volver)}`;
}

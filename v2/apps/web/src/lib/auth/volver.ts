/** El retorno de sesión permanece dentro de la aplicación. */
export function volverTrasIngresar(search: string): string {
  const raw = new URLSearchParams(search).get('volver');
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.length > 1500)
    return '/mi-espacio';
  try {
    const url = new URL(raw, 'https://basta.invalid');
    if (
      url.origin !== 'https://basta.invalid' ||
      ['/ingresar', '/registrarse', '/2fa-desafio'].includes(url.pathname)
    )
      return '/mi-espacio';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/mi-espacio';
  }
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

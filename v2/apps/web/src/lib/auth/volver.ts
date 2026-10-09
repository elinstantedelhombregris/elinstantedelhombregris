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

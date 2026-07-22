/**
 * Rutas ya migradas al sistema «Papel y Tinta». A medida que se rediseña
 * cada página se agrega acá; cuando estén todas, el chrome viejo se borra.
 */
const PAPEL_ROUTES = new Set(['/', '/la-idea', '/el-mapa', '/mandato-vivo']);

/**
 * Prefijos papel para rutas dinámicas (los anexos del mandato:
 * `/mandato-vivo/pulso/:id` y `/mandato-vivo/propuesta/:id`). El Set de
 * arriba matchea por igualdad exacta — los anexos, al ser dinámicos,
 * necesitan además un match por prefijo. Excepción sancionada (spec 2.3,
 * Decisión 10: «`PAPEL_ROUTES` aprende prefijos»).
 */
const PAPEL_PREFIXES = ['/mandato-vivo/'];

/**
 * ¿La ruta recibe el chrome papel? Igualdad exacta o prefijo dinámico —
 * pura y testeada (separada de `RootLayout.tsx` para no romper la regla
 * de fast-refresh de solo-exportar-componentes).
 */
export function esRutaPapel(location: string): boolean {
  return PAPEL_ROUTES.has(location) || PAPEL_PREFIXES.some((prefijo) => location.startsWith(prefijo));
}

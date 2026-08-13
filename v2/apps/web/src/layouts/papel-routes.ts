/**
 * Rutas ya migradas al sistema «Papel y Tinta». A medida que se rediseña
 * cada página se agrega acá; cuando estén todas, el chrome viejo se borra.
 */
const PAPEL_ROUTES = new Set([
  '/',
  '/la-idea',
  '/el-mapa',
  // La cuarta superficie (spec 2026-08-12-la-radiografia.md). Nace papel: su
  // interruptor nocturno gobierna la constelación, no el chrome del sitio.
  '/la-radiografia',
  '/mandato-vivo',
  '/planes',
  '/sembrar',
  '/biblioteca',
  // El frame del redirect a /biblioteca no debe mostrar el chrome v1.
  '/ensayos',
  '/manifiesto',
  '/bitacora',
  // El frame del redirect de /blog a /bitacora no debe mostrar el chrome v1.
  '/blog',
  '/entrenamientos',
  '/cronica',
  // Sin entrada en el recorrido: se llega solo desde la franja del footer.
  '/quien-esta-detras',
  // El canal de escucha, que comparte esa franja (spec 2026-08-12-lo-que-falta.md).
  '/lo-que-falta',
]);

/**
 * Prefijos papel para rutas dinámicas (los anexos del mandato:
 * `/mandato-vivo/pulso/:id` y `/mandato-vivo/propuesta/:id`; los
 * expedientes del catálogo: `/planes/:slug`; el lector de ensayo:
 * `/ensayos/:slug`; el lector de crónica: `/bitacora/:slug`; las
 * direcciones viejas: `/blog/:slug`); los entrenamientos: `/entrenamientos/:slug`,
 * `/entrenamientos/:slug/leccion/:n` y `/entrenamientos/:slug/practica`
 * (spec 3.5 — la ruta nace papel con la primera página, T5). El Set de
 * arriba matchea por igualdad exacta — las dinámicas necesitan además un
 * match por prefijo. Excepción sancionada (spec 2.3, Decisión 10:
 * «`PAPEL_ROUTES` aprende prefijos»).
 */
const PAPEL_PREFIXES = [
  '/mandato-vivo/',
  '/planes/',
  '/ensayos/',
  '/bitacora/',
  '/blog/',
  '/entrenamientos/',
  // La ficha de una falta: `/lo-que-falta/:idPublico`.
  '/lo-que-falta/',
];

/**
 * Rutas que matchean un prefijo de arriba pero NO reciben chrome papel:
 * `/blog/escribir` es una herramienta de plataforma (Fase 5), no una
 * crónica — spec 3.4, Decisión 11. Se consulta ANTES que los prefijos.
 */
const SIN_PAPEL = new Set(['/blog/escribir']);

/**
 * ¿La ruta recibe el chrome papel? Igualdad exacta o prefijo dinámico,
 * salvo excepción explícita — pura y testeada (separada de
 * `RootLayout.tsx` para no romper la regla de fast-refresh de
 * solo-exportar-componentes).
 */
export function esRutaPapel(location: string): boolean {
  if (SIN_PAPEL.has(location)) return false;
  return PAPEL_ROUTES.has(location) || PAPEL_PREFIXES.some((prefijo) => location.startsWith(prefijo));
}

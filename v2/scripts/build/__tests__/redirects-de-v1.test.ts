/**
 * Guardia del corte: ninguna URL pública de v1 puede quedar en 404 cuando v2
 * tome el dominio.
 *
 * `URLS_DE_V1` es un snapshot congelado de `SocialJusticeHub/client/src/App.tsx`
 * tomado el 2026-08-04. Se congela a propósito: v1 se retira, su lista de URLs
 * ya no se mueve más, y un test que leyera el archivo vivo se rompería el día
 * que ese archivo se borre. Es historia, no un objetivo móvil.
 *
 * Cada URL de v1 tiene que estar cubierta por una de dos cosas:
 *   1. una ruta de v2 con el mismo patrón —el link sigue funcionando solo—, o
 *   2. un redirect en `vercel.json`.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');

/** Snapshot congelado de las rutas de v1 (2026-08-04). */
const URLS_DE_V1: readonly string[] = [
  '/',
  '/admin/feedback',
  '/apoya-al-movimiento',
  '/bienvenida',
  '/blog-vlog',
  '/blog-vlog/:slug',
  '/challenges',
  '/challenges/:id',
  '/checkin-semanal',
  '/circulos',
  '/coaching',
  '/community',
  '/community/:id',
  '/community/job/create',
  '/community/job/edit/:id',
  '/community/project/create',
  '/community/project/edit/:id',
  '/community/resource/create',
  '/community/resource/edit/:id',
  '/dashboard',
  '/dashboard-legacy',
  '/datos-abiertos',
  '/detalles-calculo-costo-humano',
  '/el-instante-del-hombre-gris',
  '/el-mandato-vivo',
  '/el-mapa',
  '/el-pulso',
  '/evaluacion',
  '/explorar-datos',
  '/feedback',
  '/kit-de-prensa',
  '/la-semilla-de-basta',
  '/la-vision',
  '/life-areas',
  '/life-areas/:areaId',
  '/life-areas/:areaId/quiz',
  '/login',
  '/mandato-publico/:level/:name',
  '/mandato/:level/:name',
  '/mandato/propuesta/:id',
  '/mandato/pulso/:id',
  '/manifiesto',
  '/metas',
  '/mision/:slug',
  '/politica-privacidad',
  '/profile',
  '/propuesta/:id',
  '/pulso/:id',
  '/radar',
  '/recursos',
  '/recursos/blog',
  '/recursos/blog/:slug',
  '/recursos/el-arquitecto',
  '/recursos/ensayos',
  '/recursos/ensayos/:slug',
  '/recursos/guias-estudio',
  '/recursos/guias-estudio/:courseSlug/leccion/:lessonId',
  '/recursos/guias-estudio/:courseSlug/quiz',
  '/recursos/guias-estudio/:slug',
  '/recursos/iniciativas',
  '/recursos/iniciativas/:slug',
  '/recursos/iniciativas/:slug/documento',
  '/recursos/ruta',
  '/recursos/ruta/iniciativas/:slug',
  '/recursos/ruta/iniciativas/:slug/documento',
  '/recursos/vlog',
  '/recursos/vlog/:slug',
  '/register',
  '/resources/:id',
  '/u/:username',
  '/una-ruta-para-argentina',
];

/**
 * Rutas de v1 que se retiran a propósito y no se redirigen: son superficie
 * interna, no links que alguien haya compartido.
 */
const RETIRADAS_A_PROPOSITO: ReadonlySet<string> = new Set([
  '/admin/feedback',
  '/community/job/create',
  '/community/job/edit/:id',
  '/community/project/create',
  '/community/project/edit/:id',
  '/community/resource/create',
  '/community/resource/edit/:id',
]);

interface VercelJson {
  readonly redirects?: readonly { readonly source: string; readonly destination: string }[];
}

/** Un patrón de ruta (`/blog/:slug`, `/community/:resto*`) como regex. */
function aRegex(patron: string): RegExp {
  const cuerpo = patron
    .split('/')
    .map((seg) => {
      if (seg.startsWith(':') && seg.endsWith('*')) return '.*';
      if (seg.startsWith(':')) return '[^/]+';
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp(`^${cuerpo}$`);
}

/** Una URL de v1 con sus `:params` reemplazados por un valor concreto. */
function comoUrlConcreta(patron: string): string {
  return patron
    .split('/')
    .map((seg) => (seg.startsWith(':') ? 'x' : seg))
    .join('/');
}

function leerVercelJson(): VercelJson {
  return JSON.parse(readFileSync(join(raizV2, 'vercel.json'), 'utf8')) as VercelJson;
}

function rutasDeV2(): readonly string[] {
  const fuente = readFileSync(join(raizV2, 'apps', 'web', 'src', 'app-routes.tsx'), 'utf8');
  return [...fuente.matchAll(/path="([^"]+)"/g)].map((m) => m[1] ?? '');
}

describe('el corte de v1 a v2 no deja links rotos', () => {
  it('toda URL de v1 está cubierta por una ruta de v2 o por un redirect', () => {
    const redirects = leerVercelJson().redirects ?? [];
    const rutas = rutasDeV2();

    const huerfanas = URLS_DE_V1.filter((url) => {
      if (RETIRADAS_A_PROPOSITO.has(url)) return false;
      const concreta = comoUrlConcreta(url);
      const laSirveV2 = rutas.some((r) => aRegex(r).test(concreta));
      const laRedirige = redirects.some((r) => aRegex(r.source).test(concreta));
      return !laSirveV2 && !laRedirige;
    });

    expect(huerfanas, `URLs de v1 que caerían en 404: ${huerfanas.join(', ')}`).toEqual([]);
  });

  it('todo redirect apunta a una ruta que v2 sirve de verdad', () => {
    const redirects = leerVercelJson().redirects ?? [];
    const rutas = rutasDeV2();

    const alVacio = redirects
      .map((r) => r.destination)
      .filter((destino) => !rutas.some((r) => aRegex(r).test(comoUrlConcreta(destino))));

    expect(alVacio, `redirects que apuntan a una ruta inexistente: ${alVacio.join(', ')}`).toEqual(
      [],
    );
  });

  it('ningún redirect se come una ruta que v2 sirve por sí misma', () => {
    const redirects = leerVercelJson().redirects ?? [];
    const rutas = rutasDeV2();

    // Un redirect corre antes que el fallback de SPA: si su patrón matchea una
    // ruta viva de v2, esa página se vuelve inalcanzable.
    const tapadas = rutas.filter((ruta) =>
      redirects.some((r) => aRegex(r.source).test(comoUrlConcreta(ruta))),
    );

    expect(tapadas, `rutas de v2 tapadas por un redirect: ${tapadas.join(', ')}`).toEqual([]);
  });
});

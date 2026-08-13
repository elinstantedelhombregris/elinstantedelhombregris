/**
 * El puente entre la política compartida y `vercel.json`.
 *
 * Acá viven las funciones puras —el generador de al lado sólo las escribe en
 * disco, y el test `scripts/build/__tests__/csp-vercel.test.ts` las vuelve a
 * correr para verificar que el archivo commiteado no quedó viejo—.
 *
 * ## Por qué hace falta un puente
 *
 * `vercel.json` lo lee Vercel antes de que exista ningún proceso nuestro: no
 * puede importar TypeScript, no admite comentarios y no tiene helmet. Pero es
 * el único lugar donde se le pueden poner cabeceras al documento, porque el
 * documento no lo sirve Express —el rewrite `"/((?!api/).*)" → /index.html`
 * lo despacha desde el filesystem de Vercel—. De ahí la asimetría que causó
 * [D-048]: la CSP existía, estaba bien escrita, tenía test, y el navegador
 * nunca la veía.
 *
 * ## Qué recibe cada superficie
 *
 * Las mismas cabeceras, y la misma CSP carácter por carácter. La justificación
 * de cada directiva está en `packages/shared/src/seguridad/csp.ts`, que es la
 * fuente; repetirla acá sería crear una segunda verdad.
 *
 * Dos cosas que la API tiene y `vercel.json` no:
 *
 *   - **`Strict-Transport-Security`.** Vercel ya la manda en todo el dominio
 *     con `max-age=63072000` —verificado con `curl -sI` sobre producción—, el
 *     doble de la de helmet. Declararla acá la acortaría a la mitad. Se la deja
 *     a la plataforma a propósito.
 *   - **CORS.** `corsMiddleware()` sólo tiene sentido sobre una API con
 *     credenciales; el documento no lo necesita.
 *
 * Y una que `vercel.json` cubre y la API no: estas cabeceras salen también en
 * los estáticos (`/assets/*`, `/tiles/*.pmtiles`, `/fonts-ui/*`), porque el
 * patrón es «todo lo que no sea `/api/`». En un `.js` la CSP no hace nada, pero
 * `X-Content-Type-Options: nosniff` sí.
 */
import { CABECERAS_DE_SEGURIDAD, CSP, serializarCsp } from '@v2/shared/seguridad';

/**
 * A qué rutas se les aplican las cabeceras.
 *
 * El mismo lookahead negativo que ya usan los `rewrites`, y por el mismo
 * motivo: `/api/*` lo contesta Express, que pone las suyas. Si el patrón las
 * abarcara, cada respuesta de la API llevaría dos `Content-Security-Policy` —el
 * navegador aplica la intersección, así que no rompería nada, pero un header
 * duplicado es una divergencia esperando a pasar—.
 *
 * Vercel matchea `headers.source` contra la URL **entrante**, antes de los
 * rewrites: `/el-mapa` entra acá y recién después se convierte en
 * `/index.html`.
 */
export const RUTA_DE_LA_PAGINA = '/((?!api/).*)';

/** Un par `{ key, value }` como los quiere `vercel.json`. */
export interface CabeceraVercel {
  readonly key: string;
  readonly value: string;
}

/** Las cabeceras del documento: la CSP primero, después el resto de la tabla. */
export function cabecerasDeLaPagina(): CabeceraVercel[] {
  return [
    { key: 'Content-Security-Policy', value: serializarCsp(CSP) },
    ...Object.entries(CABECERAS_DE_SEGURIDAD).map(([key, value]) => ({ key, value })),
  ];
}

/**
 * El bloque `"headers"` tal como tiene que aparecer en `vercel.json`.
 *
 * Se serializa a mano, con un par por línea, para que el estilo case con el de
 * los `redirects` que ya están en el archivo y el diff se lea. `JSON.stringify`
 * del archivo entero reformatearía las 50 líneas de redirects de arriba.
 */
export function bloqueDeHeaders(): string {
  const pares = cabecerasDeLaPagina()
    .map((c) => `        { "key": ${JSON.stringify(c.key)}, "value": ${JSON.stringify(c.value)} }`)
    .join(',\n');

  return [
    '  "headers": [',
    '    {',
    `      "source": ${JSON.stringify(RUTA_DE_LA_PAGINA)},`,
    '      "headers": [',
    pares,
    '      ]',
    '    }',
    '  ],',
  ].join('\n');
}

/** Encuentra el bloque `"headers"` de primer nivel ya escrito, si lo hay. */
const BLOQUE_EXISTENTE = /^ {2}"headers": \[[\s\S]*?^ {2}\],$/m;

/** Ancla de inserción cuando todavía no existe: el bloque va antes de los rewrites. */
const ANTES_DE = /^ {2}"rewrites": \[/m;

/**
 * Devuelve el texto de `vercel.json` con el bloque de cabeceras al día.
 *
 * Es una función de texto y no de objeto a propósito: reemplaza sólo su propio
 * bloque y deja el resto del archivo byte por byte como estaba. Es idempotente
 * —correrla dos veces da lo mismo que correrla una—, y eso es justo lo que le
 * permite al test comparar contra el archivo commiteado.
 */
export function conBloqueDeHeaders(vercelJson: string): string {
  const bloque = bloqueDeHeaders();

  if (BLOQUE_EXISTENTE.test(vercelJson)) {
    return vercelJson.replace(BLOQUE_EXISTENTE, bloque);
  }
  if (!ANTES_DE.test(vercelJson)) {
    throw new Error(
      'No encontré ni un bloque "headers" ni la clave "rewrites" en vercel.json: ' +
        'el archivo cambió de forma y este generador ya no sabe dónde escribir.',
    );
  }
  return vercelJson.replace(ANTES_DE, `${bloque}\n  "rewrites": [`);
}

/**
 * Los hosts que el documento sale a buscar por su cuenta.
 *
 * Lo que `index.html` pide se resuelve **antes** de que corra una línea de
 * nuestro JavaScript, así que ninguna decisión del bundle lo puede arreglar: si
 * ahí aparece un dominio ajeno, o la CSP lo nombra —y entonces le entregamos la
 * IP de cada visitante a un tercero— o el recurso no carga. Hasta el 13/8/2026
 * había dos, `fonts.googleapis.com` y `fonts.gstatic.com`, y por eso D-048
 * pedía cerrar D-049 primero. Hoy no hay ninguno, y el test lo mantiene así.
 */
export function hostsExternosDe(html: string): string[] {
  const encontrados = html.matchAll(/\bhttps?:\/\/([a-zA-Z0-9.-]+)/g);
  const hosts = new Set<string>();
  for (const m of encontrados) {
    const host = m[1];
    if (host !== undefined) hosts.add(host);
  }
  return [...hosts].sort();
}

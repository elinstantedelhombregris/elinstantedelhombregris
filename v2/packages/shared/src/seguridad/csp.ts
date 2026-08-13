/**
 * Las cabeceras de seguridad del producto — una sola tabla para las dos
 * superficies que lo sirven.
 *
 * ## Por qué esto vive acá y no adentro del middleware
 *
 * Hasta el 13/8/2026 la política estaba escrita dentro de
 * `apps/api/src/middleware/security.ts`, y por lo tanto **sólo la emitía
 * Express**. En producción Express contesta únicamente `/api/*`: el documento
 * lo sirve Vercel desde su filesystem, sin pasar por un solo middleware
 * nuestro. O sea que la CSP llegaba en las respuestas JSON —donde no corre
 * JavaScript de nadie— y no llegaba en la página, que es el único lugar donde
 * una CSP hace algo. Eso es [D-048], y es el peor modo de falla de una
 * defensa: no la ausencia, sino la apariencia.
 *
 * La corrección tiene dos mitades y ésta es la que evita que vuelvan a
 * separarse: **la política se escribe una vez, acá**, y de esta tabla salen
 * las dos superficies —el `helmet()` de la API y el bloque `headers` de
 * `vercel.json`—. `vercel.json` es JSON estático que Vercel lee antes de que
 * exista ningún proceso nuestro, así que no puede importar este módulo: lo
 * genera `pnpm csp:generar` y un test (`scripts/build/__tests__/csp-vercel.test.ts`)
 * falla si el archivo quedó viejo. Divergir deja de ser posible en silencio.
 *
 * ## La misma política para las dos, y no por comodidad
 *
 * Se podría pensar que la página necesita permisos que la API no. Es al revés:
 * esta política **ya estaba escrita para la página** —los estilos inline de
 * Radix, los `blob:` del worker de maplibre, el `data:` de los SVG— aunque la
 * emitiera un servidor que no sirve páginas. Lo que faltaba no era otra
 * política; era que ésta llegara. Por eso las dos superficies comparten la
 * tabla entera y cualquier permiso de más queda a la vista de las dos.
 *
 * Lo que la página necesita y esta tabla ya contempla, directiva por directiva,
 * está justificado abajo, en cada línea.
 */

/** Las fuentes de una directiva. Vacío = directiva sin valor (`upgrade-insecure-requests`). */
export type FuentesCsp = readonly string[];

/** Nombre de directiva (en kebab-case, como viaja en el header) → fuentes. */
export type DirectivasCsp = Readonly<Record<string, FuentesCsp>>;

/**
 * La política entera. **Ningún host de terceros, y ése es el punto**: cada
 * dominio ajeno en `img-src`, `connect-src` o `font-src` es la dirección IP de
 * cada persona que abre la página, entregada a alguien más, encima sobre una
 * pantalla donde se miran señales políticas. Si estás por agregar uno, empaquetá
 * el recurso: así están servidos `/maps/`, `/fonts/`, `/fonts-ui/` y `/tiles/`.
 *
 * El orden de las claves es el orden en que salen en el header. Se mantiene
 * estable para que el diff de `vercel.json` sea legible.
 */
export const CSP: DirectivasCsp = {
  // Todo lo que no tenga directiva propia sale de este origen y de ninguno más.
  'default-src': ["'self'"],

  // El bundle de Vite son módulos ES del propio origen: `index.html` no lleva
  // un solo `<script>` inline ni un `onclick=` (React liga los handlers por
  // JS, no por atributo). Sin `'unsafe-inline'` y sin `'unsafe-eval'`: no
  // hacen falta, y ponerlos «por las dudas» es vaciar la directiva —con
  // `'unsafe-inline'` cualquier XSS reflejado vuelve a ejecutar—. maplibre no
  // compila expresiones con `eval`; si algún día una dependencia lo necesita,
  // el navegador va a decirlo con una violación y se decide ahí, no antes.
  'script-src': ["'self'"],
  'script-src-attr': ["'none'"],

  // `'unsafe-inline'` acá sí, y es la única concesión de la política. Radix y
  // sonner insertan `<style>` en tiempo de ejecución, y maplibre escribe
  // atributos `style` sobre el canvas y sus controles. Un nonce no alcanza
  // para eso —el HTML lo sirve un CDN estático, no hay proceso que lo
  // inyecte—. El riesgo que abre es de exfiltración por CSS, no de ejecución.
  'style-src': ["'self'", "'unsafe-inline'"],

  // `data:` por los SVG embebidos; `blob:` porque maplibre arma texturas y
  // sprites en memoria y se los pasa al canvas como blob.
  'img-src': ["'self'", 'data:', 'blob:'],

  // Las seis familias de la interfaz salen de `/fonts-ui/` y los glyphs del
  // mapa de `/fonts/` desde D-049 y D-003. `data:` queda por las fuentes que
  // alguna librería pueda embeber en su propio CSS.
  'font-src': ["'self'", 'data:'],

  // La API es del mismo origen (`/api/*`), y el `.pmtiles` también: el mapa no
  // llama a un servidor de teselas, pide rangos de bytes de un archivo nuestro.
  'connect-src': ["'self'"],

  // maplibre arma su worker desde un `blob:` (así lo empaqueta la librería).
  'worker-src': ["'self'", 'blob:'],
  // `child-src` es el fallback de `worker-src` en los navegadores que no
  // implementan la directiva nueva —Safari anterior a 15.4—. Sin esta línea el
  // worker cae en `default-src 'self'` ahí y el mapa queda mudo sin error de
  // red que mirar. No afloja los iframes: `frame-src` es explícito y gana.
  'child-src': ["'self'", 'blob:'],

  // No hay plugins ni iframes en todo el producto: se verificó que no exista
  // un solo `<iframe>` ni en `apps/web/src` ni en `content/`.
  'object-src': ["'none'"],
  'frame-src': ["'none'"],
  // Nadie nos embebe. Va con `X-Frame-Options: SAMEORIGIN` para los navegadores
  // que todavía no leen `frame-ancestors`.
  'frame-ancestors': ["'self'"],

  // Un `<base>` inyectado reescribe todas las URLs relativas de la página; y
  // los formularios sólo postean a casa.
  'base-uri': ["'self'"],
  'form-action': ["'self'"],

  // Si algo quedó escrito con `http://`, que el navegador lo pida por HTTPS en
  // vez de fallar o filtrar.
  'upgrade-insecure-requests': [],
};

/**
 * Las cabeceras de seguridad que no son la CSP.
 *
 * Los valores son **los que helmet ya emite hoy** en la API —capturados de la
 * respuesta real, no elegidos de nuevo—: nueve son sus defaults y dos
 * (`Cross-Origin-Resource-Policy`, `Referrer-Policy`) están configuradas a mano
 * en el middleware. Esta tabla es el espejo que necesita `vercel.json`, que no
 * tiene helmet; que siga siendo un espejo fiel lo garantiza
 * `apps/api/tests/cabeceras-seguridad.test.ts`, que compara contra lo que la
 * API contesta de verdad.
 *
 * **`Strict-Transport-Security` no está acá a propósito.** Vercel ya la manda
 * en todas las respuestas del dominio con `max-age=63072000`, el doble de la de
 * helmet; declararla nosotros la acortaría. Ver la nota en el generador.
 *
 * `Cross-Origin-Embedder-Policy` tampoco: el middleware la apaga
 * explícitamente, y activarla exigiría CORP en cada recurso de terceros que
 * ya no existe.
 */
export const CABECERAS_DE_SEGURIDAD: Readonly<Record<string, string>> = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
  'Origin-Agent-Cluster': '?1',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-XSS-Protection': '0',
};

/**
 * Serializa la política al formato del header.
 *
 * Separador `;` sin espacio, que es exactamente lo que emite helmet: así el
 * test de la API puede comparar strings sin normalizar nada.
 */
export function serializarCsp(directivas: DirectivasCsp): string {
  return Object.entries(directivas)
    .map(([nombre, fuentes]) => (fuentes.length === 0 ? nombre : `${nombre} ${fuentes.join(' ')}`))
    .join(';');
}

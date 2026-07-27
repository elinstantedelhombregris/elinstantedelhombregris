# ADR 0007 — Indexación, origen canónico y host de v2

**Status:** Accepted · 2026-07-26
**Fuente:** `docs/specs/2026-07-26-el-sustrato.md` (①, «El sustrato»), decisiones D1–D4.

En castellano, como la spec de la que sale: este ADR la transcribe, no la reinterpreta.

## Contexto

`apps/web` es una SPA de Vite pura: un `index.html` de 25 líneas, sin SSR, sin
prerender, y `apps/api` nunca sirve HTML. No existía ninguna configuración de
despliegue dentro de `v2/`. Compartir cualquiera de las ~493 URLs daba el mismo
`<head>`, sin una sola etiqueta `og:`.

## Decisiones

**D1 · Origen canónico y host.** El origen es `https://elinstantedelhombregris.com`,
parametrizado por `VITE_SITE_ORIGIN`. v2 reemplaza a v1 en ese dominio cuando esté
terminado. El host es Vercel, declarado en un `v2/vercel.json` propio, hermano del
de la raíz (que publica v1) y sin tocarlo. La fecha de salida no es parte de ①; la
elección de host sí, porque el fallback SPA, los 301, los headers y la caché no
existen en ninguna otra parte.

**D2 · Alcance de la indexación: híbrido.** `<head>` sellado en build para todas las
URLs, más prerender de HTML real para las URLs de planes y ensayos. No se usa
`react-dom/server` ni `hydrateRoot`: `main.tsx` se queda con `createRoot` y el
prerender le sirve al scraper y al `<noscript>`, no al LCP.

**D3 · Contraste: escala dual + `aria-hidden`.** Los hex actuales quedan para bordes,
divisores, superficies y palitos; se agregan tokens de texto con valores AA; la
numeración de expediente y la flecha `→` se marcan `aria-hidden` por ser decoración.

**D4 · El pie deja de declarar prototipo.** «Prototipo con datos de demostración» se
reemplaza por una declaración positiva y auditable, con link a `/datos-abiertos`.
Ningún número visible sale de una constante escrita a mano.

## Consecuencias

- SSR en runtime y la inyección por request siguen prohibidos (ADR 0001).
- `hydrateRoot` y la auditoría de mismatch que habilitaría quedan para un ADR propio.
- El asterisco de «datos demo» deja de ser mandato del design-system (§5, §7, §11.3).

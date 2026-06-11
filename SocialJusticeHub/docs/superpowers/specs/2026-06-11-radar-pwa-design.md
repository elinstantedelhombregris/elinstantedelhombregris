# Radar ¡BASTA! — colector móvil de la Radiografía (PWA)

**Fecha:** 2026-06-11
**Estado:** Diseño aprobado en modo autónomo (el usuario pidió "go full steam" antes de dormirse; las decisiones de diseño quedan documentadas acá con su justificación).

## Propósito

Una herramienta de teléfono, separada de la web principal pero con la misma base de datos,
para que cualquier persona capture en segundos las señales que alimentan La Radiografía
(`/explorar-datos`): el gemelo digital de lo que ¡BASTA! quiere hacer visible.

Criterios del pedido original:
- App de teléfono accesible desde iPhone y Android.
- Herramienta separada, base de datos compartida.
- Extremadamente fácil de usar.
- Que construya el gemelo digital del territorio.

## Decisión de plataforma: PWA instalable, no app nativa

**Elegido: PWA (Progressive Web App) montada en la ruta `/radar` del sitio existente.**

Alternativas evaluadas:

1. **PWA en `/radar` (elegida).** Instalable en Android (manifest + service worker →
   "Agregar a pantalla de inicio" con ícono y modo standalone) y en iOS (Safari →
   Compartir → Agregar a inicio; meta tags `apple-mobile-web-app-*`). Cero fricción de
   distribución: se comparte como un link. Misma base Neon vía la misma API Express.
   Mismo deploy de Vercel — riesgo de infraestructura nulo.
2. **App separada (Vite nuevo + deploy Vercel propio).** "Más separada", pero exige
   proyecto Vercel nuevo, CORS, env vars duplicadas, dominio — riesgo alto para una
   noche y ningún beneficio funcional.
3. **React Native / Expo.** App "de verdad", pero inaccesible sin App Store / Play Store
   (semanas de revisión, cuentas de developer) — incumple "accesible ya".

La PWA es la única opción que cumple "accesible desde Apple y Android" hoy mismo.
"Separada" se cumple a nivel de producto: shell propio a pantalla completa (sin header
ni footer del sitio), manifest propio con scope `/radar`, ícono propio, service worker
propio. La separación es de experiencia, no de repositorio.

## Las señales (modelo de datos compartido)

El Radar captura los mismos seis tipos que la Radiografía visualiza:

| Tipo | Tabla destino | Auth |
|------|---------------|------|
| Sueño (`dream`) | `dreams` | anónimo OK |
| Valor (`value`) | `dreams` | anónimo OK |
| Necesidad (`need`) | `dreams` | anónimo OK |
| ¡Basta! (`basta`) | `dreams` | anónimo OK |
| Compromiso (`compromiso`) | `user_commitments` | requiere login |
| Recurso (`recurso`) | `user_resources` | requiere login |

Razón del corte: `dreams.userId` es nullable (anónimo posible hoy mismo), mientras que
compromisos y recursos están modelados como declaraciones personales con userId.
El Radar muestra los 6 tipos; para los 2 que requieren cuenta, si no hay sesión muestra
un aviso amable con link a `/login` (mismo origen → el token de localStorage se comparte
con la web principal automáticamente).

## API nueva: `server/routes-radar.ts`

- `POST /api/radar/senal` — `optionalAuth` + rate limit propio (anti-spam anónimo).
  Body validado con Zod (mensajes en castellano): `{ type, text, location?, latitude?, longitude? }`.
  - `dream|value|need|basta` → inserta en `dreams` (columna según tipo, `userId` si hay sesión).
  - `compromiso` → 401 sin sesión; con sesión inserta en `user_commitments` (type `initial`).
  - `recurso` → 401 sin sesión; con sesión inserta en `user_resources` (categoría elegible, default `other`).
- `GET /api/radar/resumen` — un solo fetch para el gemelo digital móvil:
  totales por tipo (sueños/valores/necesidades/bastas/compromisos/recursos),
  total general, y las últimas N señales sanitizadas (tipo, extracto, lugar, fecha —
  sin IDs de usuario). Cache corto en memoria (60s) para no castigar Neon.

No se toca ningún endpoint existente.

## Cliente: `/radar` (pantalla completa, mobile-first)

Páginas/estados dentro de una sola ruta lazy (`pages/Radar.tsx` + `components/radar/`):

1. **Captura** (pantalla principal): grilla de 6 tipos con ícono y color del sistema de
   la Radiografía → textarea con placeholder específico por tipo → chip de ubicación
   (geolocalización del navegador, opcional, con nombre de lugar editable) → botón
   grande "Enviar señal". Micro-celebración al enviar (`bloom`) + texto
   "Tu señal ya es parte de la Radiografía".
2. **El Pulso** (gemelo digital): contadores animados por tipo, feed de señales
   recientes, link "Ver la Radiografía completa" → `/explorar-datos`.
3. **Cola offline**: si no hay red, la señal queda en localStorage con badge
   "esperando conexión"; se reenvía sola al volver la red o al abrir la app.
4. **Instalación**: Android — capturar `beforeinstallprompt` y ofrecer botón "Instalar";
   iOS — hoja de instrucciones (Compartir → Agregar a inicio). Solo se ofrece si aún
   no está instalada (`display-mode: standalone`).

Idioma: castellano rioplatense. Estética: sistema plata/vidrio/violeta
(`design-tokens.ts`), fondo `#0a0a0a`, targets táctiles ≥ 44px.

## PWA plumbing

- `client/public/radar.webmanifest`: `start_url: /radar`, `scope: /radar`,
  `display: standalone`, colores `#0a0a0a` / `#7D5BDE`, íconos 192/512 + maskable.
- Íconos generados (violeta, motivo radar/pulso) y commiteados como PNG.
- `client/public/radar-sw.js`: network-first con fallback a cache (app shell + assets),
  scope `/radar`.
- `client/src/main.tsx` hoy desregistra TODOS los service workers (limpieza de Workbox
  viejo). Cambio: desregistrar todos **excepto** el de scope `/radar`, y registrar
  `radar-sw.js` solo cuando `location.pathname` empieza con `/radar`.
- El manifest y los meta tags de iOS se inyectan dinámicamente al montar la página
  Radar (no afectan el resto del sitio).
- Ruta agregada a `App.tsx` con `React.lazy` + `useImmersion()` para ocultar el chrome global.

## Manejo de errores

- Validación Zod con mensajes en castellano; el cliente muestra el mensaje del server.
- Sin geolocalización (permiso denegado): la señal va sin coordenadas — el campo lugar
  textual sigue disponible. Nunca se bloquea el envío por falta de GPS.
- Sin red: cola offline, nunca se pierde una señal escrita.
- Rate limit: mensaje claro de "esperá un momento".

## Testing / verificación

- `npm run check` + `npm run check:routes` + `npm run build` (suite estándar del repo).
- Prueba end-to-end en dev server con viewport móvil: capturar señal anónima,
  verla aparecer en el resumen; revisar consola sin errores.

## Fuera de alcance (YAGNI)

- Fotos/adjuntos (no hay storage de archivos en el stack actual).
- Push notifications.
- Mapa Deck.GL dentro del móvil (demasiado pesado; el Pulso enlaza a la Radiografía).
- App store / TWA wrapper (puede agregarse después sobre esta misma PWA).

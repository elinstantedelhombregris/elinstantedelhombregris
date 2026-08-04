# ADR 0008 — Dónde corre `apps/api` en producción

**Status:** Accepted · 2026-08-04
**Fuente:** decisión pedida al preparar el pasaje de v2 a producción. Depende de
`0007-sustrato-indexacion-y-host.md` D1 (host = Vercel, `v2/vercel.json`, Root Directory = `v2`).

## Contexto

`apps/api` es hoy un proceso largo: `src/index.ts` hace `app.listen()`, engancha
`SIGTERM`/`SIGINT` y cierra con un `setTimeout(...).unref()` de gracia. La spec de ①
lo dice con todas las letras al descartar `@vercel/og`: *«un target serverless que no
existe — `apps/api` es un proceso largo»*.

Eso describe el **entry point**, no la aplicación. La aplicación está en `src/app.ts`,
que es una factory pura (`createApp(): Express`) sin estado propio, y hay que decidir
dónde corre antes de que exista `v2/vercel.json` — porque el contenido de ese archivo
depende de la respuesta.

La superficie no es opcional: 32 archivos de `apps/web` pegan contra ~30 endpoints, y
la portada misma pide `/api/analytics/cifras` y `/api/analytics/voces-count`. Un v2
en producción sin API es un v2 con la portada rota.

### Lo que se verificó en el código, no se supuso

1. **El driver ya es serverless.** `packages/db/src/client.ts` usa
   `@neondatabase/serverless` con `drizzle-orm/neon-http`: HTTP sin estado, sin pool
   de conexiones abierto. No hay nada que un proceso largo esté sosteniendo.
2. **No hay scheduler adentro del proceso.** Cero `setInterval`, cero `node-cron` en
   `apps/api/src`. Los dos crons son funciones puras (`runRankingCron`,
   el motor de mandato) con entrada de CLI, y sus cabeceras **ya nombran una entrada
   de Vercel como el invocador de producción**. Una de las dos existe desde antes de
   este ADR: `apps/api/api/cron/gamification-rankings.ts`.
3. **No hay estado de request en memoria.** El único `Set` a nivel de módulo es
   `SAFE` en `middleware/csrf.ts`, que es una constante de métodos HTTP. Las sesiones
   viven en `auth_sessions`; el CSRF es double-submit cookie, que no guarda nada.
4. **La única víctima real es el rate limiter.** Los siete limitadores de
   `middleware/rate-limit.ts` usan el `MemoryStore` por defecto de
   `express-rate-limit`. Cuatro de ellos son controles de seguridad, no de cortesía:
   login (5/15 min), registro (3/h), reset de contraseña (1/h) y verificación 2FA
   (5/15 min).
5. **El patrón ya está probado en este repo.** v1 corre Express adentro de una
   función de Vercel (`api/index.ts` en la raíz, con `vercel.json` ruteando
   `/api/(.*)` ahí). No es una apuesta: es lo que sirve el dominio hoy.
6. **Lo compilado de `apps/api` no arranca en Node.** Buscando qué tenía que
   importar la función apareció que `dist/src/app.js` importa `@v2/db`, que resuelve
   a `packages/db/src/index.ts` — TypeScript crudo, porque los tres paquetes del
   workspace publican `./src/*.ts` en `main` y en `exports`. Queda anotado como
   `D-029` en `../../docs/DEUDAS.md`; acá sólo importa que **la función no puede
   depender de la resolución de módulos del workspace en runtime**.

## Decisiones

**D1 · La API corre como función de Vercel, en el mismo proyecto y el mismo origen
que la web.** Un único handler catch-all envuelve `createApp()`. `src/index.ts` se
queda donde está y sigue siendo el entry de desarrollo y de los tests de integración
— no se borra, no se reescribe.

El motivo decisivo no es el costo: es el **origen único**. Web y API bajo
`elinstantedelhombregris.com` eliminan de un saque el CORS entre orígenes, el
`COOKIE_DOMAIN` compartido y las cookies `SameSite=None` que exige un host aparte.
El auth de v2 es httpOnly + double-submit CSRF (`../CLAUDE.md`, regla dura): cada
frontera de origen que se agrega es una superficie más donde esa regla se afloja.
Un host siempre encendido conserva el proceso, pero paga ese precio, suma un servicio
más que operar y un segundo lugar donde viven los secretos.

**D2 · El directorio de funciones es `v2/api/`, no `apps/api/api/`.** Con Root
Directory = `v2` (ADR 0007 D1), Vercel sólo mira `v2/api/`. La entrada de cron que
existe hoy en `apps/api/api/cron/gamification-rankings.ts` está en una ruta que la
plataforma **nunca va a leer** bajo esa raíz, y los comentarios de las dos `cron.ts`
que la citan fueron escritos antes de que se decidiera la raíz. Se mueven a
`v2/api/cron/`, y los comentarios se corrigen en el mismo commit para que no queden
apuntando a un camino muerto.

**D3 · Los crons se agendan en `v2/vercel.json` y se protegen con `CRON_SECRET`.**
Un endpoint HTTP público que recalcula rankings o quema cuota de LLM es un DoS
gratis. Cada handler compara `Authorization: Bearer $CRON_SECRET` antes de trabajar
y devuelve 401 sin tocar la base si no coincide.

**D4 · El rate limiting deja el `MemoryStore` antes de aceptar registros públicos.**
Entre invocaciones no se comparte nada: con N instancias tibias, un límite de 5
intentos de login se vuelve 5·N. Para el limitador general (120/min) eso es
degradación tolerable. Para los cuatro controles de seguridad **no lo es**, y no se
tapa con un comentario: los cuatro pasan a un store respaldado por Postgres sobre la
misma Neon, o el registro público no se abre. Hasta que eso exista, el preview corre
con registro cerrado.

**D5 · El cron de mandato se mide antes de agendarlo.** `BATCH_SIZE = 50` con
`CONCURRENCY = 4` y una llamada de LLM por señal puede pasarse del techo de duración
de una función. El diseño ya es incremental —«el cron corre cada 15 minutos y va
mordiendo»—, así que la salida es bajar el batch hasta que una corrida entre cómoda
en el techo del plan, con la medición escrita en el commit. No se agenda a ciegas.

**D7 · La función se sirve de un bundle, no del árbol de `node_modules`.** Un paso
de esbuild toma `apps/api/src/app.ts` y emite un solo `.mjs` con los tres paquetes
del workspace adentro. Es la respuesta directa al hecho 6: si nada bare-import de
`@v2/*` sobrevive al build, la resolución rota de D-029 no llega a producción, y de
paso Vercel no tiene que rastrear symlinks de pnpm para armar la función.

Se descartó arreglar los `exports` de los tres paquetes en este movimiento: es la
salida correcta a largo plazo y está escrita en D-029, pero toca doce entradas y tres
configs de herramienta por debajo de 182 tests de integración verdes. Estrenar host y
cambiar la resolución de módulos del workspace en el mismo commit deja dos causas
posibles para cualquier rotura.

**D6 · No se copia el arranque de v1.** `api/index.ts` de v1 llama a
`storage.initSampleData()` en cada cold start. v2 no hace trabajo de datos en el
arranque de una función: el handler cachea la app entre invocaciones tibias y nada
más.

## Cómo quedó en producción (2026-08-04)

- **Proyecto `el-instante-v2`**, cuenta `elinstantedelhombregris777-3087`, scope
  `juans-projects-0a7acadb`. **Root Directory = `v2`**, framework `Other`, build
  `pnpm build && pnpm api:bundle`, output `apps/web/dist`.
- **`elinstantedelhombregris.com` y su `www` cuelgan de este proyecto.** v1 sigue
  entero en su proyecto `elinstantedelhombregris`, con su base intacta. Volver
  atrás es un comando: `vercel domains add elinstantedelhombregris.com
  elinstantedelhombregris --force`, y lo mismo con el `www`.
- **El repo está conectado por Git**, así que un push a `main` despliega el sitio
  vivo. Al proyecto viejo se le **desconectó** la integración de Git: seguía atado
  al mismo repo y cada push le disparaba una build de v1 que no servía a nadie.
  Desconectar no borra nada — sus deployments de producción siguen ahí, que es lo
  único que el rollback necesita.
- **`vercel git connect` no corre desde `v2/`**: busca el `.git` en el directorio
  de trabajo y la raíz del repo es el padre. Hay que pasarle la URL del repo.
- **Dos cosas del ruteo que sólo aparecen contra un deploy real** y que no
  conviene volver a descubrir: Vercel publica cada archivo de `api/` en su ruta
  **exacta**, y la ruta catch-all `api/[...path].mjs` **atiende un segmento pero
  no dos**. El porqué del rewrite explícito está en la cabecera de
  `apps/api/src/vercel/handler.ts`.
- **El registro público sigue abierto y no debería**, por D4. Es lo primero de la
  lista después del corte.

## Consecuencias

- `v2/vercel.json` nace acá, con lo mínimo para que un deploy exista: build,
  fallback de SPA, ruteo de `/api/(.*)` y el bloque `crons`. **B11 del plan D del
  Sustrato lo extiende** con los 301, los headers y la caché que le tocan, y no
  renegocia los bloques de API y de cron que fija este ADR.
- `apps/api/src/index.ts` deja de ser el entry de producción y pasa a ser el de
  desarrollo y tests. La ergonomía local no cambia.
- Los 182 tests de integración siguen importando `createApp()` directo: no ven la
  capa serverless, y eso es deliberado.
- D4 es un prerrequisito de aceptar usuarios reales, no del deploy. Se puede
  desplegar y verificar el recorrido público sin él; no se puede abrir el registro.
- Si algún día entra WebSocket, streaming largo o un scheduler en proceso, este ADR
  se revisa: ninguna de las tres cosas sobrevive bien en una función.

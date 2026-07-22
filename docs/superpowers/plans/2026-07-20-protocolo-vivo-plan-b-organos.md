# Rediseño Protocolo Vivo — Plan B: los órganos y la navegación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restaurar el asombro-primero en el FTUE (primera estrella <60s, pacto de datos diferido al primer aporte colectivo), plegar expediciones dentro de misiones tipo relevamiento, y reorganizar la navegación alrededor de los cinco órganos (dock nuevo, QR dentro de La Corriente).

**Architecture:** Cambios de UI/flujo sobre el núcleo del Plan A (motor puro intacto). Una migración chica (0018: `expedition_id` en `pv_misiones`). El FTUE vuelve al patrón del juego original (SkyView + crearEstrella) que ya existe en el repo; el pacto cívico se convierte en interstitial one-time dentro de La Escucha.

**Tech Stack:** El mismo del Plan A (Expo SDK 57, expo-router, drizzle, NativeWind, vitest).

## Global Constraints

- Igual que Plan A: rioplatense en todo, violeta `#7D5BDE` solo acción primaria, a11y en cada Pressable, handlers con flag anti-doble-tap + try/catch + nota inline, fuego privado/pulso social, jamás un score visible.
- **FTUE < 60 segundos hasta la primera estrella. Sin registro, sin permisos, sin pantallas de contrato.**
- **El pacto de datos aparece UNA sola vez** (primera elección de "Sumar al pulso colectivo") y nunca más; se persiste en settings.
- La suite actual (**375 tests**) queda verde en cada commit; `npx tsc --noEmit` limpio; `npx expo export --platform web` OK por task de UI. Comandos desde `juego/`.
- Migraciones vía `npx drizzle-kit generate` + registro en `drizzle/migrations.js` (patrón 0017; recordar que el snapshot 0017 es cumulativo y sano).
- Commits estilo repo con trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Nada de `.env`.
- Rutas nuevas/renombradas: mantener el idioma `as never` para pushes tipados (typedRoutes desactualizado headless).

## Mapa de archivos

```
juego/
  src/content/textos-ui.ts        # + FTUE_ASOMBRO (copy del juego original); FTUE cívico queda (lo usa el pacto)
  src/app/ftue.tsx                # REESCRITO: pregunta → nacimiento → tooltips → cielo
  src/app/escuchar.tsx            # + interstitial del pacto (one-time) en el paso destino
  src/db/repos.ts                 # + CLAVES.pactoAceptado
  src/db/schema.ts                # pv_misiones + expedition_id (nullable)
  drizzle/0018_mision_expedicion.sql
  src/db/repos-protocolo.ts       # fundarMision acepta plantilla opcional → expedición vinculada
  src/civic/protocolo-migration-0018.test.ts
  src/app/misiones/fundar.tsx     # tipo Relevamiento → picker de plantillas (opcional)
  src/app/misiones/[id].tsx       # misión con expedición: progreso + "Capturar" + resolver gate
  src/app/obras/publicar.tsx      # prefill de resumen desde la expedición vinculada
  src/app/index.tsx               # pills: solo La Escucha; dock: corriente/territorio/album/bitacora/ajustes
  src/app/territorio/index.tsx    # + card "Expediciones"
  src/app/corriente.tsx           # header right: puntos de presupuesto + ícono QR
```

---

### Task 1: FTUE asombro-primero

**Files:**
- Modify: `juego/src/content/textos-ui.ts` (agregar `FTUE_ASOMBRO`; NO tocar el `FTUE` cívico existente — lo usa el Task 2)
- Rewrite: `juego/src/app/ftue.tsx`

**Interfaces:**
- Consumes: `SkyView` de `@/cielo/SkyView`; `crearEstrella`, `ganarBrasasUnaVez`, `getSetting`, `setSetting`, `CLAVES` de `@/db/repos`; `GANANCIAS`, `MOTIVOS` de `@/game/brasas`; `useJuego` de `@/stores/juego`; `LuzOrb` de `@/components/juego/LuzOrb`; `AccentButton`, `GlassCard`, `Pressable97`; `haptic`; variants `fadeUp`, `fadeIn`, `bloom`.
- Produces: el FTUE de tres fases (`pregunta` → `nacimiento` → `tooltips`) que termina con `setSetting(CLAVES.ftueCompleto, '1')` + `router.replace('/')`. La redirección existente de `index.tsx` (`getSetting(CLAVES.ftueCompleto) !== '1' → /ftue`) no se toca.

- [ ] **Step 1: Agregar `FTUE_ASOMBRO` a textos-ui.ts** (después del `FTUE` cívico):

```ts
/** FTUE del asombro: del cielo vacío a la primera estrella en <60s (spec §3.6). */
export const FTUE_ASOMBRO = {
  pregunta: '¿Qué falta acá donde estás parado?',
  placeholderRespuesta: 'Una línea alcanza. Lo que ves, lo que falta, lo que duele.',
  nacimiento: 'Así se enciende un país.',
  bienvenidaBrasas: 'Cinco brasas de bienvenida: el fuego arranca prendido.',
  tooltips: {
    ver: 'VER es una pregunta por día. La respondés para vos: nadie la lee, nadie la corrige.',
    encender: 'ENCENDER captura lo que ves — un sueño, una falta, un recurso. Cada captura es una estrella tuya.',
    dar: 'DAR es un compromiso chiquito. Mañana el juego te pregunta si lo hiciste. Nadie verifica: la confianza es la mecánica.',
  },
  saltearTour: 'Saltear — ya voy a descubrirlo',
} as const;
```

- [ ] **Step 2: Reescribir ftue.tsx** con tres fases (la estructura del juego original, que sigue en el historial git como referencia — `git show 7d70292:juego/src/app/ftue.tsx` NO existe; usar esta especificación como fuente):
  - Guard arriba: si `getSetting(CLAVES.ftueCompleto) === '1'` → `<Redirect href="/" />`.
  - Fondo: `<SkyView estrellas={estrella ? [estrella] : []} rachaViva nuevaEstrellaId={fase === 'nacimiento' ? estrella?.id : null} />` en un View absoluto `pointerEvents="none"`.
  - **Fase pregunta**: `FTUE_ASOMBRO.pregunta` en `font-serif text-4xl text-plata`, TextInput (`maxLength={280}`, placeholder `FTUE_ASOMBRO.placeholderRespuesta`, `returnKeyType="done"`, `onSubmitEditing` = encender), AccentButton "Que se encienda" `disabled={!texto.trim()}` con flag `encendiendo`. Al encender: `crearEstrella({ tipo: 'need', texto: texto.trim() })` + `ganarBrasasUnaVez(GANANCIAS.bienvenida, MOTIVOS.bienvenida)` (idempotente — si `MOTIVOS.bienvenida` no existe con ese nombre, buscar el motivo real en `src/game/brasas.ts` con grep y usar ese) + `useJuego.getState().setNewStar(estrella.id)` + `haptic.celebrate()` → fase nacimiento.
  - **Fase nacimiento**: la estrella florece en el SkyView; texto `FTUE_ASOMBRO.nacimiento` en `font-serif-italic text-3xl`, línea `bienvenidaBrasas` en slate, AccentButton "Seguir" → fase tooltips.
  - **Fase tooltips**: los tres `LuzOrb` (ver/encender/dar, encendida=false, el del medio elevado como en `index.tsx`), el orbe activo a opacidad 1 y el resto 0.35; GlassCard con `FTUE_ASOMBRO.tooltips[luzActiva]`; tres puntitos de progreso; AccentButton "Siguiente"/"A mi cielo"; link discreto `saltearTour`. `terminar()` = `setSetting(CLAVES.ftueCompleto, '1')` + `useJuego.getState().clearNewStar()` + `router.replace('/')`.
  - KeyboardAvoidingView en la fase pregunta (`behavior` iOS padding). Animaciones con los variants (`fadeUp`/`bloom`/`fadeIn`) — recordá el patrón `native()` interno de variants.ts, no lo re-inventes.
  - El handoff cívico anterior (propósito/pacto/elección) se ELIMINA de ftue.tsx; el copy cívico `FTUE` queda en textos-ui para el Task 2.

- [ ] **Step 3: Verificar** — `npx tsc --noEmit` limpio; `npx vitest run` 375 verdes; `npx expo export --platform web 2>&1 | tail -2` OK.

- [ ] **Step 4: Commit**

```bash
git add juego/src/app/ftue.tsx juego/src/content/textos-ui.ts
git commit -m "feat: FTUE asombro-primero — primera estrella en menos de un minuto

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: El pacto de datos, diferido y one-time

**Files:**
- Modify: `juego/src/db/repos.ts` (agregar `pactoAceptado: 'pacto_aceptado'` a `CLAVES`)
- Modify: `juego/src/app/escuchar.tsx`

**Interfaces:**
- Consumes: `FTUE.pacto`, `FTUE.pactoTitulo`, `FTUE.pactoDetalle` de `@/content/textos-ui` (el copy cívico existente); `getSetting`/`setSetting`/`CLAVES`.
- Produces: en el paso destino (step 4, donde viven los radios `'private' | 'collective'` — hoy ~líneas 480-531): cuando `destination === 'collective'` y `getSetting(CLAVES.pactoAceptado) !== '1'`, se muestra el pacto inline y el CTA de guardar queda bloqueado hasta aceptarlo.

- [ ] **Step 1: Implementar el interstitial inline** en escuchar.tsx:
  - Estado `pactoAceptado` inicializado con lazy useState desde `getSetting(CLAVES.pactoAceptado) === '1'`.
  - Cuando `destination === 'collective' && !pactoAceptado`: debajo de los radios, una GlassCard con `FTUE.pactoTitulo` (serif), `FTUE.pactoDetalle` (slate), los tres ítems de `FTUE.pacto` (title en `text-emerald-200`, detail en slate — el mismo estilo del FTUE cívico viejo), y un botón `Pressable97` "Acepto el pacto" (NO violeta — borde emerald, el violeta queda para Guardar) con a11y label; al tocarlo `setSetting(CLAVES.pactoAceptado, '1')` + `setPactoAceptado(true)` + `haptic.tick()`.
  - El AccentButton de guardar (línea ~531): cuando `step === 4 && destination === 'collective' && !pactoAceptado` → `disabled` con label "Aceptá el pacto para contribuir". En destino privado, nada cambia.
  - Si el usuario ya aceptó alguna vez, jamás vuelve a ver la card.

- [ ] **Step 2: Verificar** — tsc limpio, 375 verdes, export OK.

- [ ] **Step 3: Commit**

```bash
git add juego/src/app/escuchar.tsx juego/src/db/repos.ts
git commit -m "feat: pacto de datos diferido — one-time al primer aporte colectivo

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Migración 0018 — misión ↔ expedición

**Files:**
- Modify: `juego/src/db/schema.ts` (`pvMisiones` + `expeditionId: text('expedition_id')` nullable)
- Create (generada): `juego/drizzle/0018_mision_expedicion.sql`
- Modify: `juego/drizzle/migrations.js` (registrar 0018, patrón 0017)
- Modify: `juego/src/db/repos-protocolo.ts`
- Test: `juego/src/civic/protocolo-migration-0018.test.ts`

**Interfaces:**
- Produces: `fundarMision` acepta un campo opcional `plantilla?: { plantillaId: string; titulo: string; zona: string; meta: number }`. Si viene y `tipo === 'relevamiento'`: después de crear la misión llama `fundarExpedicion({ ...plantilla, origen: 'precargada' })` (gratis — la misión es el contenedor; NO cobrar brasas) y actualiza `pv_misiones.expedition_id`. Si `fundarExpedicion` tira, se captura: la misión sobrevive sin expedición (local single-user; documentar en comentario). `PvMisionRow` gana `expeditionId: string | null`.

- [ ] **Step 1: Schema + generate + registro** — agregar la columna, `npx drizzle-kit generate --name mision_expedicion`, revisar que el SQL sea SOLO `ALTER TABLE pv_misiones ADD COLUMN expedition_id text;` (si drizzle-kit re-emite tablas por el gap histórico de snapshots, recortar a mano como se hizo en 0017 — el snapshot 0017 es cumulativo así que no debería), registrar en migrations.js.

- [ ] **Step 2: Test de migración** (patrón DatabaseSync del 0017): aplicar 0017 y 0018 en memoria, insertar una misión con `expedition_id` y una sin, leer ambas.

- [ ] **Step 3: repos-protocolo** — extender `fundarMision` como arriba (la expedición se crea FUERA de la transacción de la misión — `fundarExpedicion` abre la suya propia; comentar por qué). Exportar también `vincularExpedicion(misionId, expeditionId)` (update simple) por si la UI necesita re-vincular.

- [ ] **Step 4: Verificar** — tsc limpio; `npx vitest run` verde (375 + nuevos); export OK.

- [ ] **Step 5: Commit**

```bash
git add juego/src/db/ juego/drizzle/ juego/src/civic/protocolo-migration-0018.test.ts
git commit -m "feat: misión↔expedición — migración 0018 y fundación con plantilla

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Relevamiento jugable — plantillas al fundar, captura y resolver desde la misión

**Files:**
- Modify: `juego/src/app/misiones/fundar.tsx`
- Modify: `juego/src/app/misiones/[id].tsx`
- Modify: `juego/src/app/obras/publicar.tsx`

**Interfaces:**
- Consumes: las plantillas precargadas de `@/content` (el export que usa `src/app/expediciones/index.tsx` — grep para el nombre exacto y su shape: plantillaId/titulo/zona/meta); el getter de expedición que usa `src/app/expediciones/[id].tsx` (grep — algo como `expedicionPorId`/progreso); `vincularExpedicion` y el `fundarMision` extendido del Task 3.
- Produces: el flujo relevamiento completo dentro de misiones.

- [ ] **Step 1: fundar.tsx** — al elegir tipo `Relevamiento`, aparece un bloque opcional "Arrancar desde una plantilla" con las plantillas precargadas como chips/cards chicas (título + meta); elegir una es opcional (se puede des-seleccionar). Al fundar con plantilla, pasar `plantilla` a `fundarMision`. La zona de la expedición = `territorio` de la misión si está, si no el default de la plantilla.

- [ ] **Step 2: [id].tsx** — si `mision.expeditionId`:
  - Card "Expedición vinculada" con progreso (capturas/meta — usar el mismo cálculo que expediciones/[id].tsx) y botón "Capturar" (push a `/expediciones/[id]` con el id vinculado, `as never`) visible en estados `activa` y `verificacion`.
  - En `activa`, "Presentar resultado" queda como está (no gate duro por meta — la gobernanza humana decide), pero si la meta está incompleta mostrar una línea informativa ("La expedición va N de M — podés presentar igual").

- [ ] **Step 3: publicar.tsx** — con `misionId` cuya misión tiene `expeditionId`: prefill de `resumen` (si el usuario no escribió nada) con "Expedición «{titulo}»: {capturas} de {meta} capturas en {zona}." — editable, jamás pisa texto ya tipeado.

- [ ] **Step 4: Verificar** — tsc limpio, suite verde, export OK.

- [ ] **Step 5: Commit**

```bash
git add juego/src/app/misiones/ juego/src/app/obras/publicar.tsx
git commit -m "feat: relevamiento jugable — plantillas al fundar, captura y prefill de obra

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: El dock de los órganos + QR en La Corriente

**Files:**
- Modify: `juego/src/app/index.tsx`
- Modify: `juego/src/app/territorio/index.tsx`
- Modify: `juego/src/app/corriente.tsx`

**Interfaces / cambios exactos:**

- [ ] **Step 1: index.tsx** —
  - Pills de arriba (~líneas 130-150): queda SOLO "La Escucha" (centrada); la pill "Territorio" se elimina (el Territorio vive en el dock).
  - Dock (~línea 206): de `[corriente, expediciones, album, bitacora, qr, ajustes]` a **cinco órganos**: `[corriente ('pulse-outline', 'La Corriente'), territorio ('earth-outline', 'Territorio'), album ('star-outline', 'Álbum'), bitacora ('book-outline', 'Bitácora'), ajustes ('settings-outline', 'Ajustes')]`. Los accesos a expediciones y QR se van del dock (viven en Territorio y Corriente respectivamente). Mantener el contador de brasas como está.

- [ ] **Step 2: territorio/index.tsx** — agregar card "Expediciones" (ícono 'map-outline', descripción una línea: "Quests de datos con pasos guiados.") junto a la card de Misiones, mismo idioma de cards del hub, push a `/expediciones`.

- [ ] **Step 3: corriente.tsx** — en el `right` del PanelHeader (hoy los puntos de presupuesto), envolver en una fila: los puntos + un `Pressable97` con Ionicons `qr-code-outline` (a11y "Chispas y círculos", push `/qr` `as never`). Separación `gap-3`.

- [ ] **Step 4: Verificar** — tsc limpio, suite verde, export OK.

- [ ] **Step 5: Commit**

```bash
git add juego/src/app/index.tsx juego/src/app/territorio/index.tsx juego/src/app/corriente.tsx
git commit -m "feat: dock de los cinco órganos — QR en La Corriente, expediciones en Territorio

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Verificación final del Plan B

- [ ] **Step 1:** `npx tsc --noEmit && npx vitest run 2>&1 | tail -3 && npx expo export --platform web 2>&1 | tail -2` — todo verde/OK.
- [ ] **Step 2 (controller):** walkthrough en el preview con DB fresca: FTUE nuevo (pregunta → estrella <60s → tooltips → cielo con la estrella), escucha con destino colectivo (pacto aparece una vez, aceptar, guardar; segunda escucha colectiva NO muestra pacto), fundar misión relevamiento con plantilla → capturar (expedición) → presentar → resolver → obra con prefill → Corriente (ícono QR presente) → dock nuevo de 5. Screenshots.
- [ ] **Step 3:** push a origin main.

## Self-review

1. **Cobertura vs objetivos B**: FTUE asombro ✓ T1; pacto diferido ✓ T2; expediciones→misiones ✓ T3+T4; QR en Corriente + dock órganos ✓ T5. Extension points de C/D intactos (no se toca motor puro salvo firma aditiva de fundarMision).
2. **Placeholder scan**: los dos greps delegados (nombre del export de plantillas, getter de expedición, motivo bienvenida) son verificaciones concretas con instrucción, no huecos; el copy nuevo está completo en T1.
3. **Consistencia**: `plantilla` shape de T3 = lo que T4/fundar pasa; `expeditionId` fluye schema→repos→[id]→publicar; CLAVES nuevas una sola vez.

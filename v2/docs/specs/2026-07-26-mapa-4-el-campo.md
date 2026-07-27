# Mapa · 4 — El campo

**Fecha:** 2026-07-26
**Paraguas:** `docs/specs/2026-07-26-el-mapa-instrumento-territorial.md` — implementa §7
**Decisiones que aplica:** D6 (captura en campo hacia el mapa público), D7 (exactitud por defecto)
**Depende de:** spec 2 (el núcleo, la precisión, el esquema), spec 3 (el instrumento donde aparece)
**Blueprint:** `docs/plans/2026-07-24-v2-integrated-civic-platform-mobile-blueprint.md` §1.1 — *la API cívica versionada y el ledger de eventos son el único puente*

> **Qué entrega.** Que lo que alguien levanta caminando aparezca en el mapa. Hoy la app móvil captura con GPS, guarda con custodia y encola para sincronizar — contra un servidor que no existe.

---

## 1. El hallazgo que define este sub-proyecto

`juego/src/civic/sync.ts` (331 líneas) tiene un outbox completo y serio: batching de 12, arriendo de envío con vencimiento, barrido de reintentos cada 30 segundos, cursor de feed persistido, autenticación por dispositivo, y corte inmediato del pull además del flag persistente. `community-api.ts` habla un contrato versionado con nombre propio: `basta-civic-custody-grants/v1`.

Postea a `/api/v1/civic/custody/grants/respond`, `/api/v1/civic/custody/grants/revoke`, `/api/circulos`, `/api/notifications/read-all`.

**Ninguno existe en `v2/apps/api`.** El único router `civic` que hay es `civic-assessment`, que es otra cosa. El móvil tiene un puente construido hasta la mitad del río.

Este sub-proyecto construye la otra mitad — la parte que el mapa necesita, no el contrato entero.

---

## 2. Alcance

**Entra:** el prefijo `/api/v1/civic`, el endpoint de ingesta de capturas, la verificación de identidad de dispositivo, el recibo de divulgación devuelto al móvil, y que las capturas aparezcan en el mapa público con su precisión.

**No entra:** círculos, notificaciones, misiones, el feed operativo, el contrato completo de grants de custodia. Son parte del blueprint y tienen sus propias specs. Acá se hace **la ruta de la captura al mapa**, nada más.

---

## 3. Corrección a la spec 2: el prefijo versionado

La spec 2 propone `GET /api/civic/map/signals`, sin versión. El móvil ya habla `/api/v1/civic/*` y el blueprint pide explícitamente una API cívica **versionada** como único puente.

Se unifica: **todo lo cívico cuelga de `/api/v1/civic/`**.

```
GET  /api/v1/civic/map/signals      ← era /api/civic/map/signals en la spec 2
POST /api/v1/civic/capturas
```

En `app.ts`: `app.use('/api/v1/civic', civicRouter)`. La spec 2 se corrige en su §5; queda anotado acá porque el hallazgo salió escribiendo esta.

---

## 4. La ingesta

```
POST /api/v1/civic/capturas
```

Body — una captura del outbox del móvil:

```ts
{
  contrato: 'basta-civic-captura/v1',
  idLocal: string,           // UUID del móvil; idempotencia
  tipo: 'observation' | 'need' | 'resource',
  texto: string,
  punto: { lat: number; lng: number } | null,
  precisionPedida: LocationPrecision,
  role: LocationRole,
  sensitivity: CivicSensitivity,
  capturadoEn: string,       // ISO, del dispositivo
}
```

El servidor:

1. **Verifica el dispositivo** — el token que `device-auth.ts` ya emite del lado del móvil. El lado servidor no existe y se construye acá.
2. **Aplica `publishedPrecision`** — del núcleo compartido (spec 2 §3), en el servidor. **El servidor no confía en la precisión que el cliente dice haber aplicado**: la recalcula desde `role`, `sensitivity` y la audiencia. Un cliente modificado no puede publicar más fino de lo que la política permite.
3. **Deriva el punto público** con `publicLocation()`. Cuando la precisión publicada es `exact`, el punto queda como vino.
4. **Escribe** en la tabla de la capa que corresponda, con las columnas de geografía de la spec 2 §4.1.
5. **Devuelve el recibo.**

`idLocal` es único: reenviar la misma captura no duplica. El outbox del móvil reintenta y hay que sostenerlo.

### 4.1 El recibo

```ts
{
  idLocal: string,
  idPublico: string,                  // "voz:8123" — el mismo id del mapa
  precisionPublicada: LocationPrecision,
  engrosado: string | null,           // el `coarsenedBecause` de publishedPrecision
  url: string,                        // dónde verlo en el mapa
}
```

`disclosure-receipt.ts` del móvil ya modela recibos. El recibo del servidor alimenta el ledger local para que la persona pueda, en su propia app, ver qué publicó, dónde quedó, y con qué precisión.

**La promesa que el recibo tiene que cumplir:** que nadie se entere después de que su punto se publicó distinto de lo que creía. Si el servidor engrosó, el recibo lo dice y explica por qué.

---

## 5. Lo que aparece en el mapa

Una captura sincronizada es una señal más en `/api/v1/civic/map/signals`. No hay capa nueva ni tratamiento especial: entra en la capa que le toca por su tipo, se dibuja con la precisión que se le publicó (spec 1 §5), y cae dentro o fuera de un lazo como cualquier otra.

Lo único propio: **el origen se muestra**. Una señal levantada en campo dice que se levantó en campo. No para jerarquizarla sobre las demás, sino porque su procedencia es parte del dato.

---

## 6. La celda muda como misión

El puente en el otro sentido, y el que cierra el círculo.

La cobertura de la spec 3 §5.4 marca celdas mudas dentro de un área. `missions.ts` y `mission-cell-visit.ts` del móvil ya modelan visitas a celdas.

Desde un área lazada en la web, una acción: **«llevar esta zona al campo»** — las celdas mudas se ofrecen como misión, y quien tenga la app las ve como celdas por visitar.

La web encuentra el silencio, el móvil lo va a caminar, y lo que se levanta vuelve al mapa. Ese es el bucle completo de D6.

**Esta parte es la más grande de este sub-proyecto y la que más depende del contrato de misiones**, que es del blueprint y no de esta spec. Si el contrato no está listo, se entrega §4 y §5 sin esto, y el bucle se cierra después. Se declara acá para que no se diseñe nada que lo impida.

---

## 7. Cómo se verifica

- **Idempotencia** — la misma captura enviada tres veces produce una fila y tres recibos idénticos
- **El servidor no confía en el cliente** — una captura que declara `precision: 'exact'` con `role: 'subject'` y `sensitivity: 'high'` se publica engrosada, y el recibo lo dice
- **El punto exacto llega exacto** — una captura de un `observation` con `role: 'capture'` y precisión `exact` se publica en su punto, sin corrimiento. Es lo que D7 existe para permitir
- **Dispositivo no verificado** — se rechaza sin escribir nada
- **Fin a fin** — captura → ingesta → aparece en `/map/signals` → cae dentro de un lazo dibujado sobre su ubicación
- **≥1 test de integración por endpoint** contra Postgres real, según el estándar de `v2/CLAUDE.md`

---

## 8. Listo cuando

1. `pnpm verify` verde
2. El outbox del móvil vacía contra v2 sin errores y sin duplicar
3. Una captura de campo aparece en el mapa público en su punto, y el lazo la agarra
4. El recibo dice la verdad, incluido cuando el servidor engrosó
5. Todo lo cívico cuelga de `/api/v1/civic/` y la spec 2 quedó corregida

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Se construye medio contrato de custodia por accidente | El alcance de §2 es explícito: la ruta de la captura al mapa. Círculos, feed y grants son otras specs |
| Un cliente modificado publica más fino de lo permitido | El servidor recalcula `publishedPrecision` y nunca confía en la precisión declarada (§4) |
| El outbox reintenta y duplica | `idLocal` único con test de idempotencia (§7) |
| El bucle de misiones bloquea la entrega | §6 es separable: §4 y §5 se entregan solos |
| La ingesta abre una vía de spam sin cuenta | Va detrás de identidad de dispositivo, con límite de tasa como el resto de la API |

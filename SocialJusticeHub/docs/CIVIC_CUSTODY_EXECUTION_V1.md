# Ejecución privada de custodia v1

Contrato: `basta-civic-custody-execution/v1`.

Esta superficie convierte una coordinación aceptada en una secuencia mínima de
reserva, preparación, traslado, recepción y seguimiento. Es privada: no publica
eventos en el ledger cívico, no expone la necesidad y no acepta texto, contacto,
ubicación, relato ni payload libre.

## Despliegue

Aplicar `migrations/20260714_civic_custody_execution.sql` después de grants,
responses, coordination y `20260714_civic_custody_integrity_hardening.sql`.
No sustituir esa secuencia por un `db:push` directo: la migración instala y
audita funciones, constraints y triggers que forman parte del contrato. Puede
reaplicarse de forma segura y falla cerrado si encuentra historia contradictoria.

## Rutas

- `POST /api/v1/civic/custody/execution/events`
- `GET /api/v1/civic/custody/execution/status?proposalId=...`
- `GET /api/v1/civic/custody/execution/inbox?limit=&cursor=`

Todas requieren autenticación de cuenta y responden con
`Cache-Control: private, no-store`. Las acciones del grantor también requieren
el `X-Civic-Device-Token` exacto que es dueño del grant. Otro coordinador del
mismo círculo no puede reemplazar al proponente: el coordinador de la ejecución
es siempre `proposal.proposerUserId` y debe seguir activo en ese rol.

## Escritura

`POST` usa un cuerpo discriminado estricto, sin wrapper:

```json
{
  "eventId": "UUID-v4",
  "proposalId": "UUID-v4",
  "expectedVersion": "sha256-hex",
  "type": "reserve"
}
```

Tipos admitidos:

- `reserve`, `grantor_ready`, `coordinator_ready`, `start_delivery`, `withdraw`:
  no admiten campos adicionales.
- `report_delivery`: admite `quantity` sólo cuando la capacidad es cuantificada.
- `confirm_receipt`: requiere `receipt` (`full`, `partial`, `not_received`) y
  admite `quantity` según la referencia cuantificada.
- `record_follow_up`: requiere `followUp` (`need_met`, `still_open`).

La clave es fija y forma parte de la identidad indivisible del comando:

```text
Idempotency-Key: custody:{proposalId}:execution:event:{eventId}
```

Un aplicado nuevo responde `201` con `status: "accepted"`; un replay exacto,
`200` con `status: "duplicate"`. Ambos incluyen:

```json
{
  "contract": "basta-civic-custody-execution/v1",
  "status": "accepted",
  "recordedEvent": {},
  "execution": {},
  "refreshedAt": "2026-07-14T15:00:00.000Z"
}
```

`recordedEvent` es la constancia histórica exacta del evento, aunque otro evento
haya avanzado la proyección al reintentar. `execution` y `refreshedAt` siempre
son actuales al reloj de base de datos del request, también en replays.

Un conflicto de versión o transición es igualmente durable y responde `409`:

```json
{
  "contract": "basta-civic-custody-execution/v1",
  "status": "rejected",
  "reason": "version_changed",
  "eventId": "UUID-v4",
  "recordedEvent": null,
  "execution": {},
  "refreshedAt": "2026-07-14T15:00:00.000Z"
}
```

El mismo `eventId` rechazado nunca puede aplicarse después: el rechazo queda en
el ledger. Reusar `eventId` o la clave con otro contenido es un conflicto de
idempotencia, no una nueva transición.

## Proyección exacta

`ExecutionView` contiene únicamente:

```text
proposalId, state, version, capacity, delivery, receipt, followUp,
readiness, reconciliation, milestones, createdAt, expiresAt, updatedAt
```

`reconciliation` es:

```json
{
  "receiptAvailableAt": "start + 24h, o null antes de start",
  "receiptWindowOpen": false,
  "withdrawnBy": "coordinator | grantor | null"
}
```

`receiptWindowOpen` se deriva con reloj de base de datos. Sólo puede abrirse
después de `start_delivery`, por un reporte, por retiro del coordinador o al
cumplirse el plazo de 24 horas. Es monotónico: una vez abierto permanece `true`
después de receipt/follow-up. No significa por sí solo que la acción esté
habilitada; confirmar exige además grantor exacto y ausencia de receipt previo.
El cliente puede refrescar al llegar `receiptAvailableAt`, pero nunca autorizar
comparando ese plazo con su propio reloj.

Estados:

```text
awaiting_reservation | reserved | ready | in_transit | delivery_reported |
received | needs_follow_up | completed | disputed | cancelled | expired | closed
```

Una propuesta aceptada sin eventos ya tiene ejecución virtual con
`awaiting_reservation` y la versión SHA-256 canónica de `[]`. Las dos señales de
readiness pueden ocurrir antes de `reserve`; el estado sigue
`awaiting_reservation` hasta reservar y sólo pasa a `ready` cuando existen las
tres señales.

## Transiciones y cantidades

- `start_delivery` requiere reserve y ambas readiness.
- El coordinador reporta. Con capacidad cuantificada debe informar
  `0 < quantity <= capacity`; el servidor fija la unidad. Sin capacidad,
  quantity y unit permanecen nulas.
- El grantor confirma después de report. Sin report sólo puede hacerlo tras
  retiro del coordinador o 24 horas desde start.
- `full` omitido se normaliza a la cantidad/unidad del report o capacidad.
- `partial` cuantificado exige `0 < quantity < reference`; no cuantificado puede
  omitir cantidad. `not_received` no admite cantidad.
- Una confirmación sin report nunca inventa `delivery`; sólo registra la
  declaración del grantor en `receipt`.
- Hay un solo follow-up tras `full` o `partial`: `need_met` completa y
  `still_open` deja seguimiento necesario. No existe follow-up tras
  `not_received`.
- Cualquiera de las dos partes puede retirar antes de receipt. El retiro corta
  nuevos eventos del coordinador, pero no impide conciliación posterior del
  grantor. Retiro pre-start no abre la ventana de receipt.

Recepción, disputa y follow-up terminal prevalecen en la proyección sobre un
cierre o vencimiento externo. Eso permite conciliar una entrega ya iniciada sin
reabrir el grant ni devolver acceso al coordinador.

## Lecturas

Status responde:

```json
{
  "contract": "basta-civic-custody-execution/v1",
  "scope": "private-custody-execution-status",
  "execution": {},
  "refreshedAt": "timestamp DB"
}
```

Inbox es sólo para el proponente que aún es coordinador activo. Incluye
aceptaciones todavía sin raíz o eventos y responde:

```json
{
  "contract": "basta-civic-custody-execution/v1",
  "scope": "private-custody-execution-coordinator-inbox",
  "executions": [],
  "refreshedAt": "timestamp DB",
  "nextCursor": null
}
```

El límite por defecto es 50 y el máximo 100. El cursor es opaco, por keyset y
ligado a un corte temporal. ACL, corte y página se fijan juntos; los eventos de
todas las ejecuciones de la página se leen en un único lote, sin N+1.

## Persistencia y concurrencia

`civic_custody_executions` es una raíz inmutable por `proposal_id`: congela
decision accept, grant, ambas partes, dispositivo owner, capacidad, vencimiento
y fecha de aceptación. `civic_custody_execution_commands` es el único ledger;
`applied=true` forma la cadena operacional y `applied=false` conserva rechazos.

Cada aplicado es único por milestone y secuencia. `expectedVersion` encadena el
hash anterior; locks y triggers serializan en orden grant → execution →
proposal/decision → users/device/membership/circle. Ambas tablas rechazan
UPDATE/DELETE. La migración audita columnas allowlist, constraints, índices,
triggers, raíces y continuidad de la cadena al instalarse o reaplicarse.

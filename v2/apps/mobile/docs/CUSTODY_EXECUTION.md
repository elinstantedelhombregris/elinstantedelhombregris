# Ejecución privada de apoyo v1

## Qué resuelve

`basta-civic-custody-execution/v1` convierte una coordinación aceptada en un
ledger operativo mínimo: reserva, disposición de las dos partes, inicio,
entrega declarada, recepción independiente, seguimiento y retiro. No crea un
`match`, no entra a Tramas, al feed ni al outbox público y no afirma contacto,
entrega o resolución por inferencia.

La vista contiene únicamente `proposalId`, capacidad/cantidad controlada,
unidad controlada, hitos UTC, estado derivado y señales de reconciliación. No
admite `needId`, relato, teléfono, domicilio, coordenadas, nombres ni texto
libre. Es información privada con ACL, pero hoy se guarda en SQLite/IndexedDB y
viaja como JSON sobre el canal autenticado: no hay cifrado E2E ni cifrado propio
de estos campos en reposo.

## Autoridad y eventos

| Evento | Autoridad |
| --- | --- |
| `reserve`, `coordinator_ready`, `start_delivery`, `report_delivery` | cuenta coordinadora activa del círculo |
| `grantor_ready`, `confirm_receipt`, `record_follow_up` | misma cuenta grantora + mismo dispositivo owner |
| `withdraw` | cualquiera de las dos partes, con rol registrado |

Las disposiciones pueden registrarse antes o después de `reserve`; el movimiento
exige reserva y ambas disposiciones. Una entrega declarada por coordinación no
equivale a recepción. Sólo la cuenta grantora puede registrar `full`, `partial`
o `not_received`, y sólo después de que exista report, que coordinación se haya
retirado, o que hayan pasado 24 horas autoritativas desde el inicio. Después de
`full` o `partial`, la misma cuenta registra `need_met` o `still_open`.

Retiro, vencimiento, revocación o pérdida de coordinación cortan nuevas acciones
coordinadoras, pero no borran hitos. Después de comenzar el movimiento, la
cuenta grantora aún puede reconciliar recepción y seguimiento bajo las reglas
anteriores.

## Vista y reloj autoritativo

`execution.reconciliation` evita habilitar acciones con el reloj del teléfono:

- `receiptAvailableAt` es `deliveryStartedAt + 24 h`, o `null` antes del inicio;
- `receiptWindowOpen` pasa de `false` a `true` por report, retiro de coordinación
  o vencimiento del plazo según hora de PostgreSQL, y nunca vuelve a `false`;
- `withdrawnBy` conserva `coordinator`, `grantor` o `null` junto al hito.

Status, inbox y cada recibo POST incluyen `refreshedAt` calculado en la misma
transacción/lectura de base. El cliente valida tiempos y `receiptWindowOpen`
contra ese valor; un timer local sólo solicita refresh al llegar al plazo, no
abre la acción.

## Transporte exacto y replay

Cada POST usa un cuerpo plano y cerrado:

```json
{
  "eventId": "uuid-v4",
  "proposalId": "uuid-v4",
  "expectedVersion": "sha256-hex",
  "type": "confirm_receipt",
  "receipt": "full"
}
```

La clave es exactamente
`custody:{proposalId}:execution:event:{eventId}`. `eventId` nace de
`expo-crypto.randomUUID()`; no existe fallback pseudoaleatorio. Para capacidad
cuantificada, `full` omitido se normaliza a la cantidad/unidad del report o de
la capacidad; `partial` exige una cantidad menor. Un caso no cuantificado omite
cantidad y unidad.

Un éxito nuevo devuelve `201/accepted`; un replay exacto, `200/duplicate`. Ambos
separan `recordedEvent` —el evento histórico exacto— de `execution` —la vista
actual, que puede haber avanzado— e incluyen `refreshedAt`. Un conflicto de
versión o transición devuelve un `409/rejected` cerrado, con
`recordedEvent:null`, la vista autoritativa y el mismo `eventId`. Otros 4xx/409,
errores de ACL, respuestas incompletas o claves extra no prueban no-aplicación.

## Intención durable del cliente

La migración `0016_civic_custody_execution_intents` mantiene una sola intención
por cuenta+propuesta. Antes del HTTP:

1. fija UUID, versión, cuerpo, snapshot y `refreshedAt` observado;
2. escribe la fila local;
3. en web confirma el snapshot IndexedDB;
4. recién entonces envía el cuerpo exacto.

Un timeout, cierre de proceso o cambio de sesión conserva la fila. El reintento
reutiliza byte por byte cuerpo e idempotency key. Sólo un `accepted`, `duplicate`
o `rejected` estrictamente validado limpia la fila, y el borrado también se
confirma durablemente. Si falla esa confirmación, la intención se restaura.

Una fila local dañada no bloquea la lectura de las demás. El inventario la
expone como `CustodyExecutionIntentIncident` sanitizado, conserva su fila,
bloquea la propuesta si su UUID aún es verificable y jamás inventa ni reenvía
un comando. No expone el JSON corrupto, que podría contener datos inesperados.

## Cache, exportación y borrado

La cuenta grantora guarda en su `civic_need_access_grants` sólo la última vista
exacta validada y `remote_execution_observed_at = refreshedAt`. El parser exige
campos cerrados, pares cantidad/unidad, cronología, estados derivados, vínculo
de reconciliación y avance monotónico de hitos. Un error conserva el cache
anterior. La cuenta coordinadora consume su inbox privado y no escribe en el
grant local de otra cuenta.

La exportación local v10 incluye el cache y
`custodyExecutionIntents`. Es JSON sensible en texto plano. `borrarTodo` se
bloquea mientras exista cualquier intención de ejecución, sana o dañada: perder
la fila podría perder la única identidad necesaria para recuperar una
constancia remota ambigua.

## Evidencia automatizada

- `custody-execution.test.ts`: contrato cerrado, estados, tiempos,
  reconciliación, normalización y replay histórico;
- `custody-execution-flow.test.ts`: persist-before-send, caída/reinicio, sesión,
  receipts, cache, paginación, autoridad local e incidentes aislados;
- `custody-execution-intent-migration.test.ts`: checks SQL, unicidad y registro
  de migración;
- `local-data-sovereignty.test.ts`: exportación v10 y bloqueo de borrado.

# Coordinación privada de grants v1

Este contrato cubre un único paso posterior a `support_available`:

> una coordinación vigente formula una propuesta mínima y la persona dueña
> del grant la acepta o declina con la prueba del dispositivo exacto.

`accepted` significa únicamente consentimiento bilateral para abrir en el
futuro otro paso protegido. No reserva capacidad, no crea contacto, no promete
entrega y no resuelve la necesidad.

## Separación del ledger público

El contrato es `basta-civic-custody-coordination/v1`. No usa
`civic_match_participants`, `civic_action_links`, `civic_events` ni el feed.
Esos modelos públicos contienen referencias a necesidad, recurso y actores y
no son aptos para un caso bajo custodia.

La migración incremental
`migrations/20260714_civic_custody_coordination.sql` se aplica después de
`20260714_civic_custody_responses.sql`. También mueve los owners de necesidades
referidas por grants, cuando no tienen evento público, desde
`entity_type = need` a `custody_need`. Si el identificador interno de una de
esas necesidades ya existe como evento público `need` o aparece como `needId`
en el payload de un evento público `match`, la migración falla antes de cambiar
datos. Esto cubre también cualquier `civic_action_link` dependiente de ese match,
porque la acción sólo referencia su `matchId`. Un índice parcial impide que `need` y `custody_need`
compartan identificador en el futuro; `grantId` permanece separado de ese
`needId` interno.

Después se aplica
`migrations/20260714_civic_custody_integrity_hardening.sql`, que congela el
grant padre y valida contra él cada recibo de revocación bajo lock. También
serializa con advisory locks el namespace de la necesidad: ni un owner
custodial puede convivir con un evento público `need`/`match`, ni una carrera
entre ambas escrituras puede eludir esa separación.

La migración de coordinación verifica el catálogo completo antes de aceptar un
piloto previo: tipo y columnas de PK/UNIQUE/FK, acciones de FK, checks,
nulabilidad, defaults, no-diferibilidad e índices. No alcanza con reutilizar el
nombre esperado para una constraint de semántica distinta; el upgrade falla y
revierte toda la transacción.

## Proyección permitida

El campo `proposal` y cada elemento del array `proposals` usan esta forma
exacta:

```json
{
  "proposalId": "636f6f72-642d-4072-af70-6f73616c2f30",
  "grantId": "00000000-0000-4000-8000-000000000201",
  "state": "proposed",
  "terminalDecision": null,
  "capacity": { "quantity": 6, "unit": "meals" },
  "createdAt": "2026-07-14T17:00:00.000Z",
  "expiresAt": "2026-07-15T17:00:00.000Z",
  "decidedAt": null
}
```

`state` es el estado operativo efectivo: `proposed`, `accepted`, `declined`,
`expired` o `closed`. `terminalDecision` es una constancia histórica separada:
`accept`, `decline` o `null`. Es `null` exactamente cuando `decidedAt` también
lo es. Mientras el grant y el rol coordinador siguen operables, `accept` exige
`state = accepted`, `decline` exige `state = declined` y la ausencia de decisión
exige `state = proposed`.

Revocación o cierre del grant prevalecen sólo sobre `state`; el vencimiento
produce `expired`. Ninguno de esos cambios borra `terminalDecision` ni
`decidedAt`. La pérdida de toda otra cuenta coordinadora actualmente autorizada
también proyecta `closed`: un acuerdo no se presenta como operativo cuando ya
no existe ese rol de contraparte. Por eso `closed` y `expired` pueden acompañar
una decisión terminal previa, pero nunca autorizan una decisión nueva.

Esta separación prueba dos asientos y dos roles de cuenta; no prueba que haya
dos personas distintas, independencia organizacional ni una segunda mirada
sobre la necesidad.

`capacity` copia exactamente cantidad y unidad de la última respuesta aplicada
`support_available`; ambas pueden ser `null`. `expiresAt` copia exactamente el
vencimiento del grant. Nunca vuelven `needId`, `sourceResponseId`, ids de cuenta,
actor o círculo, ubicación, texto, contacto ni historial.

## Crear propuesta

`POST /api/v1/civic/custody/coordination/proposals`

Requiere cuenta e `Idempotency-Key`. Body estricto:

```json
{
  "proposalId": "636f6f72-642d-4072-af70-6f73616c2f30",
  "grantId": "00000000-0000-4000-8000-000000000201",
  "expectedResponseVersion": "4d26b9d97c8d4d7c13058d0f7d30162577532d736b354d62d094322b7c4fca77"
}
```

Sólo otra cuenta activa que actualmente coordina el círculo custodial
destinatario puede crearla: su cuenta debe ser distinta de la cuenta grantora.
El grant debe seguir activo y su última respuesta aplicada debe ser
`support_available`. Crear constituye el asentimiento del lado círculo.

El inbox de grants entrega para cada respuesta una `responseVersion` opaca
(SHA-256 con dominio separado del `responseId`, que nunca sale). La creación
debe devolverla como `expectedResponseVersion`. Bajo el lock del grant, el
servidor compara esa precondición con la última respuesta: si cambió entre la
lectura y la confirmación responde `409 CUSTODY_COORDINATION_RESPONSE_CHANGED`
y no crea nada.

Existe una sola propuesta, para siempre, por grant. El servidor deriva y
congela los términos; el cliente no envía cantidad, unidad, plazo ni texto.
Después de la propuesta se rechaza cualquier nueva revisión
`support_available`. Un replay exacto de la respuesta que originó la propuesta
sigue siendo idempotente. Si su recibo HTTP se perdió, la cuenta coordinadora
actual puede recuperarlo aun después de revocación o vencimiento: la respuesta
será `duplicate` y la vista del grant será terminal. La autenticación de cuenta,
rol y círculo precede esa búsqueda; cualquier respuesta nueva permanece
bloqueada.

`proposalId` no es un UUID libre: se deriva byte a byte de `grantId` mediante
XOR con la máscara ASCII `coord-proposal-1` y luego se fijan versión 4 y variante
RFC 4122. `decisionId` aplica el mismo procedimiento sobre `proposalId` con
`coord-decision-1`. Servicio, esquema y constraints SQL exigen exactamente esos
valores. Un piloto con IDs alternativos bloquea el upgrade para evitar operaciones
que el cliente ya no podría recuperar de forma determinista.

Respuesta nueva: `201`; replay exacto: `200`.

El replay exacto de esta creación también devuelve `200` si el grant venció o
fue revocado después de persistirse, siempre que la misma cuenta conserve la
coordinación actual del círculo. El servidor resuelve esa identidad después de
autenticar la capability y antes de evaluar operabilidad; no permite crear una
propuesta nueva sobre un grant cerrado.

```json
{
  "contract": "basta-civic-custody-coordination/v1",
  "status": "accepted",
  "proposal": {}
}
```

El ejemplo abrevia la proyección descripta arriba.

El `status: "accepted"` de este sobre confirma que el servidor aceptó la
escritura; no es el estado bilateral. En una creación nueva,
`proposal.state` sigue siendo `proposed` hasta que el grantor decida.

## Decidir como grantor

`POST /api/v1/civic/custody/coordination/proposals/decide`

Requiere cuenta, `X-Civic-Device-Token` e `Idempotency-Key`:

```json
{
  "proposalId": "636f6f72-642d-4072-af70-6f73616c2f30",
  "decisionId": "00000000-0000-4417-8c19-1c1a0e020201",
  "decision": "accept"
}
```

`decision` sólo admite `accept` o `decline`. La cuenta debe ser el grantor y el
token debe identificar exactamente `ownerActorKey`, todavía no revocado y
vinculado a esa cuenta. Otro dispositivo de la misma cuenta no alcanza. La
decisión es terminal y append-only.

`decisionId` debe ser exactamente la derivación determinista de `proposalId`;
otro UUID falla con `422` antes de buscar o mutar la propuesta.

Una decisión nueva también exige que exista otra cuenta coordinadora activa en
el círculo todavía custodial y que el grant no esté revocado, cerrado ni
vencido. Una vez que falta cualquiera de esas condiciones, no puede agregarse
una decisión: la operación falla cerrada con el error genérico de no disponible.

Nueva decisión: `201`. Si esa misma decisión ya quedó asentada, su replay
exacto devuelve `200` incluso cuando el grant fue revocado o venció después.
El servidor autentica primero la misma cuenta grantora activa y el dispositivo
autor exacto, busca la misma combinación de `decisionId`, `Idempotency-Key`, body,
cuenta y actor, y sólo entonces permite recuperar el recibo perdido. Otro
dispositivo de la misma cuenta, una cuenta distinta, un dispositivo revocado o
cualquier contenido diferente no califican como replay. Esta excepción de
recuperación no habilita una decisión nueva tras el cierre.

Reusar sólo uno de `decisionId` o `Idempotency-Key` produce conflicto.

También aquí `status: "accepted"` describe la escritura. El resultado histórico
se lee en `proposal.terminalDecision`; para una escritura nueva,
`proposal.state` será `accepted` o `declined`. En un replay posterior al cierre
o vencimiento, `state` puede ser `closed` o `expired` mientras
`terminalDecision` conserva `accept` o `decline`.

## Lecturas privadas

`GET /api/v1/civic/custody/coordination/proposals?limit=50[&cursor=…]` requiere cuenta y
devuelve únicamente propuestas de grants activos en círculos que esa cuenta
coordina ahora. `limit` admite enteros de 1 a 100 y por defecto vale 50:

```json
{
  "contract": "basta-civic-custody-coordination/v1",
  "scope": "private-circle-coordinator-coordination",
  "proposals": [],
  "refreshedAt": "2026-07-14T17:00:00.000Z",
  "truncated": false,
  "nextCursor": null
}
```

La primera página fija un `asOf` PostgreSQL milisegundo y el cursor recorre por
serial descendente, sin offset. Su esquema estricto contiene sólo dominio,
`asOf` y serial: nunca needId, grantId, actores, usuarios, círculo ni términos.
Las páginas siguientes excluyen altas posteriores al corte, vuelven a validar
ACL y cierres actuales, y comparan vencimiento contra el reloj DB real para que
un cursor histórico no reabra una propuesta. `truncated: true` requiere cursor;
el cliente oficial recorre hasta 20 páginas/1.000 propuestas y declara
explícitamente si aún queda otra. La lectura fija también el `userId` de la
sesión inicial y se descarta completa si la cuenta cambia antes de entregarla.

Las bandejas completas de grants y propuestas todavía son dos lecturas, no una
transacción distribuida. El cliente reconcilia cada propuesta con el grant
sanitizado correspondiente. Si una carrera deja una propuesta sin grant
verificable, conserva las conocidas, marca la lectura como parcial y trata toda
ausencia como desconocida; no habilita revisar capacidad, aunque sí puede
reintentar la misma propuesta determinista.

`POST /api/v1/civic/custody/coordination/status` requiere cuenta y el token del
owner exacto. El body es `{ "grantId": "..." }`; usar POST mantiene el id fuera
de URL y logs. Devuelve:

```json
{
  "contract": "basta-civic-custody-coordination/v1",
  "scope": "private-grantor-coordination-status",
  "grantId": "00000000-0000-4000-8000-000000000201",
  "proposal": null,
  "refreshedAt": "2026-07-14T17:00:00.000Z"
}
```

La lectura del grantor puede reconciliar `expired` o `closed` sin perder
`terminalDecision`. La bandeja de coordinación no conserva historia de grants
que ya no están activos.

El status del grantor es un snapshot transaccional: bloquea primero el grant y
luego su propuesta, y dentro de esa misma transacción lee decisión, elegibilidad
coordinadora y hora de PostgreSQL. La creación toma esa hora autoritativa
después de obtener el lock del grant, de modo que una espera cerca del
vencimiento no reutiliza un reloj anterior al bloqueo.

`terminalDecision` es una clave obligatoria de toda proyección de propuesta,
aunque valga `null`. El contrato de wire conserva el nombre
`basta-civic-custody-coordination/v1`, por lo que backend y cliente que agregan
este campo deben desplegarse coordinadamente; un cliente anterior falla cerrado
ante el envelope ampliado.

Todas las rutas envían `Cache-Control: private, no-store`, rate limit y errores
sin registrar body, headers o ids. Las tablas de propuestas y decisiones son
append-only. Los triggers toman el lock del grant antes de validar, por lo que
create, respond, decide y revoke quedan serializados.

## Límite semántico

Este contrato termina en consentimiento bilateral. Aunque
`proposal.state = "accepted"`, todavía no existe:

- asignación o reserva de un recurso o de capacidad concreta;
- canal de contacto o mensajería entre las partes;
- promesa, evidencia o confirmación de entrega y recepción;
- resolución de la necesidad, resultado o seguimiento.

Esos pasos requieren contratos protegidos posteriores. No deben inferirse de
la propuesta ni implementarse reutilizando el feed, matches o acciones del
ledger público.

Vencimiento, cierre y revocación tampoco equivalen a borrado remoto. Las filas
de grants, respuestas, propuestas y decisiones siguen append-only; hoy no hay
un ejecutor de retención, borrado verificable de backups ni evidencia de
eliminación física. El contrato sólo retira capacidad operativa.

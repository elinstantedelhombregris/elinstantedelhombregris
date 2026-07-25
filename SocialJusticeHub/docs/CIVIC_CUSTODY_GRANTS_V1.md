# Grants privados de necesidades bajo custodia v1

Este canal resuelve una sola transición:

> una persona entrega una proyección mínima de una necesidad propia a la
> coordinación autenticada de un círculo privado o célula, por un tiempo
> limitado y con revocación.

No es una nueva audiencia del ledger público, no alimenta La Radiografía, no
aparece en open data y no se mezcla con `GET /api/v1/civic/feed`.

## Límite de confianza

El servidor hoy puede comprobar tres cosas relevantes:

1. una cuenta mediante su access token;
2. posesión de una identidad cívica móvil mediante un token de dispositivo;
3. membresía y rol vigentes dentro de un círculo.

No existe todavía una tabla de organizaciones con representantes, roles,
vigencia y revocación. Un nombre escrito por una persona no demuestra que una
organización exista ni que alguien pueda actuar por ella. Por eso v1 admite
`recipient.type = "circle"` y responde
`ORGANIZATION_IDENTITY_UNAVAILABLE` ante `"organization"`. Ese rechazo es una
garantía, no un pendiente maquillado como seguridad.

Dentro de un círculo, el grant se dirige a su función de coordinación:

- quien entrega debe ser miembro actual del círculo;
- el círculo debe ser privado o de tipo `celula`;
- debe existir al menos una coordinación;
- sólo cuentas con rol actual `coordinador` pueden enumerar el inbox;
- salir del círculo, perder el rol o volver público el círculo corta la lectura
  en la consulta siguiente.

## Persistencia y despliegue

Para una instalación nueva, aplicar:

```text
migrations/20260713_civic_event_core.sql
migrations/20260714_civic_custody_grants.sql
migrations/20260714_civic_custody_responses.sql
migrations/20260714_civic_custody_coordination.sql
migrations/20260714_civic_custody_integrity_hardening.sql
migrations/20260714_civic_custody_execution.sql
```

Esas migraciones fresh ya incluyen columnas temporales/`jsonb`, UUID canónicos
y el índice parcial que permite un solo grant abierto por necesidad.

Si el ambiente piloto ya había aplicado un draft anterior de esas tablas,
aplicar en cambio los hardenings, en este orden, después de verificar un backup:

```text
migrations/20260713_civic_event_core_hardening.sql
migrations/20260714_civic_custody_grants_hardening.sql
migrations/20260714_civic_custody_responses.sql
migrations/20260714_civic_custody_coordination.sql
migrations/20260714_civic_custody_integrity_hardening.sql
migrations/20260714_civic_custody_execution.sql
```

El segundo canonicaliza datos legados, convierte tipos y cierra duplicados
abiertos antes de crear el índice único. Falla cerrado ante colisiones de
identidad o referencias huérfanas; esos casos requieren resolución explícita.

La migración crea:

- `civic_custody_grants`: capability temporal, destinatario y proyección
  allowlisted;
- `civic_custody_grant_revocations`: recibo mínimo para que retirar también
  tenga replay idempotente;
- `civic_custody_grant_responses`: ledger append-only de estados mínimos de la
  coordinación, incluidos recibos idempotentes no aplicados.
- `civic_custody_coordination_proposals` y
  `civic_custody_coordination_decisions`: propuesta mínima y decisión terminal
  bajo un contrato separado, nunca bajo el feed público.
- `civic_custody_executions` y `civic_custody_execution_commands`: raíz
  inmutable y ledger privado append-only para ejecutar y conciliar un acuerdo.

La última migración también separa la propiedad de necesidades privadas bajo
`entity_type = custody_need`. Falla si el identificador interno de una
necesidad custodial referida por un grant ya aparece como evento `need` público
y crea una exclusión cruzada para que esa colisión no pueda reaparecer. El
`grantId` sigue siendo un identificador distinto de ese `needId` interno.

El hardening final congela identidad, owner, destinatario, payload, vigencia e
idempotencia del grant en PostgreSQL. Sólo admite cierres monotónicos
`open -> expired` y `open -> revoked`, revalida la autoridad del revocador con
el reloj de la base y vuelve append-only el ledger de recibos. Un recibo tardío
legítimo conserva el instante autoritativo de la revocación sin reabrir ni
reescribir el grant. Los inserts de grants vuelven a comprobar cuenta,
dispositivo, membresía, círculo, owner y ventana temporal dentro de la base. El
owner custodial es append-only y comparte un advisory lock con los eventos
públicos `need`/`match`, de modo que la separación también resiste carreras
entre sesiones.

La base repite controles de tamaño, claves permitidas, categorías, unidades,
coordenadas, precisión y vigencia. La validación de aplicación no es la única
barrera contra guardar relato o contacto por error.

El campo `response` es obligatorio en toda vista del grant, aunque sea `null`.
Backend y cliente estricto deben desplegarse coordinadamente: el cliente nuevo
rechaza un servidor sin ese campo y un cliente anterior rechaza la clave nueva,
en ambos casos sin aceptar silenciosamente un contrato ambiguo.

## Crear un grant

`POST /api/v1/civic/custody/grants`

Headers obligatorios:

```http
Authorization: Bearer <access-token-de-cuenta>
X-Civic-Device-Token: <token-del-dispositivo>
Idempotency-Key: custody:<need-id>:<circle-id>:v1
Content-Type: application/json
```

La cuenta debe estar activa y el dispositivo debe seguir habilitado y
vinculado a esa misma cuenta. Son dos pruebas separadas. Si la necesidad ya
tiene dueño cívico, ese dueño debe estar vinculado a la cuenta; si todavía era
un borrador privado, el commit reclama su dueño sin publicarla ni crear un
evento colectivo.

Body:

```json
{
  "grantId": "4cd2c1e1-1f65-4d79-97a9-93ad56ec9ab1",
  "needId": "a797a9ca-d9bb-40a1-aa77-b3737ce8288a",
  "recipient": { "type": "circle", "id": 42 },
  "expiresAt": "2026-08-13T15:00:00.000Z",
  "need": {
    "category": "food",
    "quantity": 12,
    "unit": "meals",
    "urgency": 4,
    "location": {
      "lat": -32.887172,
      "lng": -68.843589,
      "precision": "500m"
    }
  }
}
```

Vigencia: entre cinco minutos y noventa días. El cliente debe enviar el centro
de una zona ya reducida y el servidor lo vuelve a calcular: si no coincide con
su grilla autoritativa, rechaza el grant en vez de recibir una coordenada cruda
disfrazada. Se admiten `500m`, `neighborhood` y `city`, nunca `exact` ni `100m`
para este pedido sensible.

Categorías:

```text
food housing work care health education environment mobility safety culture democracy
```

Unidades:

```text
people meals units hours kilograms liters trips days beds kits other
```

No hay unidad de texto libre. `other` no transporta una explicación escondida.

Respuesta nueva: `201`; replay idéntico: `200` con `status: "duplicate"`.
Reusar `grantId` o la clave idempotente con otra proyección responde `409
CUSTODY_IDEMPOTENCY_CONFLICT`.

El sobre informa `state`: `active`, `expired`, `revoked` o `closed`. Este último
identifica un grant legado que el upgrade cerró como duplicado (`superseded`).
Un cliente sólo debe considerar entregada una capability con estado `active`;
cualquier otro estado falla cerrado y no aparece en el inbox.

También incluye `response`, inicialmente `null`. Cuando existe, contiene sólo
`disposition`, `quantity`, `unit`, `responseVersion` y `recordedAt`;
`responseVersion` es un SHA-256 opaco y con dominio separado que permite una
precondición sin revelar el `responseId`. Nunca vuelven ids internos, identidad
de la coordinación ni historial.

## Allowlist de datos

El `payload` guardado y entregado tiene exactamente estas cinco claves:

```json
{
  "category": "food",
  "quantity": 12,
  "unit": "meals",
  "urgency": 4,
  "location": {
    "lat": -32.887172,
    "lng": -68.843589,
    "precision": "500m"
  }
}
```

`quantity`, `unit` y `location` pueden ser `null`. No se admiten claves
adicionales. En particular nunca viajan:

- relato, descripción, resultado deseado o título libre;
- teléfono, correo, dirección o vía de contacto;
- nombre de persona, atribución o clave de actor;
- nombre del custodio, referente u organización;
- coordenada exacta, evidencia, foto o URI local.

`grantId`, destino, vencimiento y fechas están en el sobre de la capability,
no dentro del payload de la necesidad. `needId` se recibe para demostrar y
conservar propiedad, pero no vuelve en la respuesta ni en el inbox: así dos
destinatarios no obtienen un identificador estable con el cual enlazar el mismo
caso. El servidor conserva internamente necesidad, emisor y revocador para
autorizar; esos ids tampoco salen en el inbox.

## Leer el inbox privado

`GET /api/v1/civic/custody/grants?limit=50[&cursor=…]`

Requiere sólo el token de cuenta: perder el teléfono no debe impedir que una
coordinación cumpla su responsabilidad o que el emisor retire. La consulta une
cada fila con la membresía actual y sólo devuelve grants:

- destinados a un círculo privado/célula donde la cuenta coordina;
- no revocados;
- no vencidos.

La respuesta usa `Cache-Control: private, no-store`. La primera página fija un
`asOf` PostgreSQL truncado a milisegundo; las siguientes lo transportan dentro
de un cursor opaco y recorren por `id DESC`, sin offset. El cursor tiene esquema
estricto y sólo contiene versión, dominio, `asOf` y el serial técnico del
keyset: nunca `needId`, grantId, actores, usuarios, círculo ni payload. Cada
página vuelve a validar cuenta, membresía, revocación y cierre actuales. La
expiración se compara contra `statement_timestamp()` real, no contra el `asOf`
no firmado, de modo que un cursor histórico no resucita permisos; un `asOf`
futuro se acota al reloj DB y se rechaza si ya no coincide.

El cliente debe reemplazar su vista al refrescar; un grant retirado o vencido
simplemente deja de estar. No se entrega total de casos ni existe endpoint para
enumerar otro círculo.

```json
{
  "contract": "basta-civic-custody-grants/v1",
  "scope": "private-circle-coordinator-inbox",
  "grants": [],
  "refreshedAt": "2026-07-14T15:00:00.000Z",
  "truncated": false,
  "nextCursor": null
}
```

`truncated: true` exige exactamente `limit` filas y un `nextCursor`; la última
página exige `nextCursor: null`. El cliente oficial sigue hasta 20 páginas
(1.000 permisos con el límite por defecto). Si todavía queda cursor, conserva
`truncated: true` y la UI declara el corte: nunca presenta ese tope local como
una bandeja completa. Todas las páginas quedan además fijadas al `userId` de la
sesión inicial; un logout o cambio de cuenta durante la lectura descarta el
resultado entero en vez de mezclar dos ACL.

Cada grant del array incluye su última respuesta aplicada en `response`. Los
recibos no aplicados y las revisiones anteriores nunca se enumeran.

## Responder desde la coordinación

`POST /api/v1/civic/custody/grants/respond`

Requiere token de cuenta e `Idempotency-Key`. No requiere ni utiliza prueba de
dispositivo. Body estricto:

```json
{
  "grantId": "4cd2c1e1-1f65-4d79-97a9-93ad56ec9ab1",
  "responseId": "8b573b8f-c04c-42c2-95f1-01ed4b1bb222",
  "disposition": "support_available",
  "quantity": 6
}
```

Sólo puede escribir una cuenta activa que siga siendo `coordinador` del
círculo destinatario mientras éste continúe privado o sea una `celula`, y sólo
mientras el grant esté abierto, no revocado y no vencido. La autorización se
revalida también en un replay; perderla devuelve el mismo `404` que un grant
inexistente.

La máquina es estricta y monotónica:

| Estado actual | Solicitud | Resultado |
| --- | --- | --- |
| `pending` | `assessing` | nueva respuesta aplicada |
| `pending` | `support_available` | `409`, primero debe evaluar |
| `assessing` | `assessing` | `already_recorded`, recibo durable no aplicado |
| `assessing` | `support_available` | nueva respuesta aplicada |
| `support_available` | `assessing` | `409`, no admite regresión |
| `support_available` | `support_available` | revisión append-only aplicada |

Una vez creada una propuesta de coordinación privada, la capacidad queda
congelada: una revisión nueva de `support_available` responde `409
CUSTODY_COORDINATION_PROPOSAL_EXISTS`. El replay exacto de la respuesta ya
asentada conserva `duplicate`. La propuesta y su aceptación viven en
`basta-civic-custody-coordination/v1`; no alteran la forma de este contrato de
grants. La propuesta y la decisión se documentan en
`docs/CIVIC_CUSTODY_COORDINATION_V1.md`.

`assessing` nunca admite `quantity`. En `support_available`, `quantity` es
opcional. Si se omite, la respuesta devuelve `quantity: null, unit: null`. Si
se incluye, el grant debe contener conjuntamente cantidad y unidad, la cantidad
ofrecida debe ser positiva y no superar la solicitada, y el servidor deriva la
misma unidad; el request nunca envía `unit`.

Una escritura aplicada devuelve `201` y `status: "accepted"`; un replay exacto
devuelve `200` y `"duplicate"`; un segundo `assessing` con identidad nueva
devuelve `200` y `"already_recorded"`. Este último también reserva de forma
durable `responseId` e `Idempotency-Key`, pero `grant.response` conserva el
primer `assessing`. Reusar sólo uno de esos identificadores o cambiar el body
responde `409 CUSTODY_RESPONSE_IDEMPOTENCY_CONFLICT`.

La mutación devuelve el mismo grant sanitizado que el inbox y, por separado,
`recordedResponse`: la constancia exacta de esta identidad idempotente. Esta
separación es necesaria porque un replay de una oferta de 12 puede ocurrir
después de que otra revisión válida haya dejado la capacidad vigente en 6;
`grant.response` muestra 6 y `recordedResponse` sigue probando 12.

```json
{
  "contract": "basta-civic-custody-grants/v1",
  "status": "accepted",
  "grant": {
    "grantId": "4cd2c1e1-1f65-4d79-97a9-93ad56ec9ab1",
    "response": {
      "disposition": "support_available",
      "quantity": 6,
      "unit": "meals",
      "responseVersion": "4d26b9d97c8d4d7c13058d0f7d30162577532d736b354d62d094322b7c4fca77",
      "recordedAt": "2026-07-14T17:00:00.000Z"
    }
  },
  "recordedResponse": {
    "responseId": "8b573b8f-c04c-42c2-95f1-01ed4b1bb222",
    "disposition": "support_available",
    "quantity": 6,
    "unit": "meals",
    "responseVersion": "4d26b9d97c8d4d7c13058d0f7d30162577532d736b354d62d094322b7c4fca77",
    "recordedAt": "2026-07-14T17:00:00.000Z"
  }
}
```

El ejemplo abrevia los demás campos públicos del grant. `responseId` sólo
regresa dentro de la constancia privada a la misma cuenta que acaba de
presentarlo; nunca entra al inbox ni a la coordinación. Nunca vuelven
`responderUserId`, `needId`, claves ni la historia completa de respuestas. El
hash opaco `responseVersion` sólo sirve para confirmar exactamente la versión
vista al crear una propuesta; no es una identidad pública ni prueba de entrega.
Como el parser cliente es estricto, la incorporación de `recordedResponse` al
wire v1 exige desplegar backend y cliente de forma coordinada.

## Revocar o rechazar la custodia

`POST /api/v1/civic/custody/grants/revoke`

Headers: token de cuenta e `Idempotency-Key`. Body:

```json
{ "grantId": "4cd2c1e1-1f65-4d79-97a9-93ad56ec9ab1" }
```

El id va en el body —que el logger no registra— y no en la URL.

Puede revocar:

- la cuenta que otorgó el grant, incluso si perdió el dispositivo;
- una coordinación actual del círculo destinatario, para rechazar o cerrar la
  recepción.

La primera escritura devuelve `status: "revoked"` y su replay exacto devuelve
`"duplicate"`. Si el emisor autorizado usa otra clave después de un retiro,
recibe `"already_revoked"`. Una coordinación receptora también puede repetir
su clave original, pero una clave nueva después del cierre recibe `404`: el
cierre no debe convertir la ruta en confirmación permanente de existencia.
Una cuenta ajena recibe el mismo `404` que ante un id inexistente.

## Adaptación desde el grant local del juego

El recibo local `basta.need-grant.v1` puede conservar propósito, etiqueta del
destinatario e historia de decisiones para la persona dueña del teléfono. Eso
no autoriza a sincronizar esos campos. El adaptador del juego:

1. resolver `recipient.kind = circle` a un `circles.id` numérico real;
2. mapear únicamente categoría, cantidad, unidad cerrada, urgencia y
   `safeArea >= 500m`;
3. omitir propósito, `scope` narrativo, etiquetas, custodio y motivo de
   revocación;
4. mantener el grant organizacional sólo local y mostrar el rechazo explícito
   del servidor;
5. no marcar “entregado” hasta recibir `accepted` o `duplicate` del endpoint.

El cliente ya invoca creación, respuesta, revocación e inbox, pero sólo detrás
de acciones explícitas de la persona: no sincroniza grants en segundo plano ni
mediante el outbox colectivo. `purpose` y el `scope` narrativo permanecen
exclusivamente locales y nunca entran al request. Tener un contrato local y
tener un destinatario autenticado siguen siendo estados distintos.

## Propiedades y límites conocidos

Propiedades de v1:

- autenticación obligatoria en toda lectura y mutación;
- prueba conjunta cuenta–dispositivo al entregar;
- autorización reevaluada con membresía actual en cada lectura;
- idempotencia persistida para alta y revocación;
- idempotencia durable y transiciones monotónicas para respuestas mínimas;
- propuesta bilateral única por grant y decisión terminal bajo un contrato
  privado separado;
- vencimiento y revocación fail-closed;
- payload sin texto libre, relato, contacto ni custodio;
- rechazo de coordenadas crudas aunque declaren una precisión aproximada;
- logs de error sin body, headers ni ids de la necesidad.

No afirma resolver todavía:

- identidad o representación organizacional;
- aceptación nominada de una organización o de una persona específica;
- intercambio de contacto, mensajería o seguimiento del caso;
- reserva de un recurso o de capacidad, entrega, recepción o resolución de la
  necesidad: incluso el estado de coordinación `accepted` es sólo un acuerdo
  para intentar el paso siguiente;
- notificaciones y SLA de respuesta;
- cifrado de extremo a extremo frente al operador de la base;
- borrado físico por política de retención;
- exportación o analítica de casos individuales.

En particular, `expiresAt`, cierre y revocación cortan acceso operativo; no
eliminan filas. Los grants, respuestas, retiros, propuestas y decisiones están
protegidos actualmente como historiales append-only y no existe todavía un job
de redacción/borrado remoto, prueba de eliminación en backups ni política
ejecutable que permita prometer retención física.

Para habilitar organizaciones se necesita primero un registro organizacional,
representantes con roles acotados, alta verificable, vigencia, revocación,
auditoría y apelación. Reutilizar `initiative`, una etiqueta local o un nombre
de perfil no satisface ese requisito.

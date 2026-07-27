# Arquitectura de datos cívicos

## Capas de información

| Capa | Ejemplos | Sincronización | Exposición |
| --- | --- | --- | --- |
| Personal privada | Bitácora, preferencias, borradores | La app no la sincroniza por defecto | Almacenamiento local; todavía sin cifrado propio de la app |
| Cívica privada | ubicación exacta, consentimiento, grant y coordinación custodial | Exacto/contacto quedan locales; una proyección mínima de necesidad y su acuerdo bilateral circulan sólo por contratos autenticados separados | SQLite/IndexedDB local sin cifrado propio; canal privado con ACL, todavía sin E2E |
| Cívica operativa | necesidades, recursos, verificaciones, acciones | Sí | Participantes del flujo |
| Pública agregada | cobertura, conteos, tendencias, resoluciones | Derivada | Radiografía/API abierta |

## Modelo mínimo

- `territories`: zona guardada o dibujada.
- `campaigns`: definición versionada de una expedición.
- `civic_missions`: pasaporte versionado que declara propósito, custodia,
  método, precisión, retención, destinatario de decisión y condición de cierre.
- `civic_mission_cells`: denominador territorial planificado, geometría local,
  asignación seudónima y vínculo con la observación que recorrió cada celda.
- `civic_record_contexts`: pasaporte por registro que separa punto preciso
  local, error horizontal, fuente, punto público, precisión autorizada,
  audiencia, sensibilidad y firma visible.
- `civic_disclosure_receipts`: ledger local append-only de cada publicación,
  corrección y revocación, con campos efectivos, audiencia, precisión, firma,
  propósito, política y relación `revokesReceiptId`.
- `civic_need_access_grants`: acta local nominativa, proyección congelada,
  vencimiento, estado de entrega, último snapshot de respuesta controlada y
  snapshot mínimo de propuesta bilateral, con estado operativo y decisión
  terminal en campos separados, último snapshot validado de ejecución y deuda
  de revocación. Sólo el adaptador de
  custodia puede enviar una allowlist a un círculo verificado; nunca entra al
  outbox/feed colectivo.
- `civic_custody_execution_intents`: un comando exacto pendiente por
  cuenta+propuesta. Conserva identidad, versión y vista cerrada antes del HTTP;
  no guarda texto, contacto ni coordenadas y nunca entra al outbox.
- `civic_custody_coordination_proposals` y
  `civic_custody_coordination_decisions`: historial remoto privado y append-only
  de una propuesta por grant y una decisión terminal. No son `matches`, Tramas
  ni entidades del feed.
- `observations`: hecho o percepción capturada en territorio.
- `needs`: demanda estructurada con cantidad, urgencia y vigencia.
- `resources`: capacidad ofrecida con disponibilidad y radio.
- `verifications`: confirmar, corregir, duplicar, marcar insegura o desactualizada.
- `matches`: propuesta de conexión entre una necesidad y un recurso.
- `actions`: compromiso operativo y su resultado.
- `consents`: permiso versionado, finalidad y fecha de revocación.
- `outbox`: eventos idempotentes pendientes de sincronización.

## Estados

Observación: `draft → queued → synced → needs_review → corroborated → stale | withdrawn`

Necesidad: `draft → submitted → needs_review → corroborated → matched → in_progress → resolved → reopened | withdrawn`

Recurso: `draft → available → reserved → depleted | expired | withdrawn`

Conexión: `proposed → accepted → in_progress → fulfilled → confirmed | declined | cancelled`

Misión: `planning → active ↔ paused → completed → archived`

Celda territorial: `unknown → assigned → observed → corroborated | contested | stale`

Respuesta de custodia: `pending → assessing → support_available`; antes de una
propuesta, una nueva `support_available` es una revisión append-only, no una
entrega ni un cierre. Crear la propuesta congela la última respuesta aplicada y
bloquea revisiones nuevas, aunque el replay exacto permanece idempotente. Si el
grant se cierra antes de recuperar un recibo perdido, sólo ese replay exacto
puede devolver la vista terminal a una cuenta que todavía coordina el círculo;
una respuesta nueva sigue prohibida.

Coordinación custodial: `proposed → accepted | declined | expired | closed`.
`accepted` significa acuerdo para intentar coordinar la capacidad congelada; no
es match con un recurso, reserva, contacto, entrega ni resolución. Revocar o
vencer el grant prevalece y cierra o vence la propuesta. Este `state` es una
proyección operativa; `terminalDecision = accept | decline | null` conserva por
separado el asiento histórico. `closed` o `expired` pueden coexistir con una
decisión anterior, pero no habilitan una nueva.

Ejecución custodial: `awaiting_reservation → reserved → ready → in_transit →
delivery_reported → received → completed | needs_follow_up`; `disputed`,
`cancelled`, `expired` y `closed` son salidas explícitas. Readiness puede
preceder a reserve; start exige ambos. El estado se deriva de un ledger privado,
no del reloj ni de optimismo cliente. Recepción y seguimiento pueden conservar
hitos posteriores a retiro/cierre sin borrar la historia.

`observed` exige una captura de la misma campaña dentro de la celda, tomada con
GPS actual y error horizontal de hasta 250 m. Un pin manual sigue siendo un
reporte válido, pero no acredita que una persona recorrió esa celda. Una
captura sin ubicación, con precisión insuficiente o fuera del área permanece
en la bitácora y en su flujo cívico normal, pero no altera el denominador de
cobertura ni se vincula al territorio de la misión.

Una cancelación de conexión reabre la necesidad si el resultado todavía no fue
confirmado. El recurso vuelve a estar disponible sólo antes de una entrega
declarada; después de ese hito queda agotado para no prometerlo dos veces. Un
resultado confirmado no puede reabrirse por esa transición local.

Las transiciones se validan también en el repositorio, no sólo en la pantalla:
los saltos imposibles y la reapertura de estados terminales se rechazan. El
resultado de una acción se fusiona de forma acumulativa para conservar quién
declaró la entrega, quién confirmó la recepción y cualquier retiro posterior.

## Sincronización

- IDs UUID nacen en el dispositivo.
- Cada mutación autorizada para publicación genera un evento `outbox`; los borradores privados no salen del dispositivo.
- `idempotencyKey` es único y estable por mutación.
- La propuesta y la decisión custodiales usan IDs deterministas y transporte
  privado directo. El cliente sólo actualiza su snapshot después de validar un
  recibo o estado exacto, incluido el vínculo entre `state`,
  `terminalDecision` y `decidedAt`; no las encola en el outbox público.
- La migración `0014_civic_custody_terminal_decision` agrega
  `remoteCoordinationTerminalDecision` al snapshot local.
- La migración `0015_civic_custody_response_intents` persiste antes del HTTP
  cada comando receptor pendiente, ligado a cuenta+grant y a su cuerpo exacto.
  Guarda sólo la proyección sanitizada necesaria para validar el recibo, se
  conserva al cerrar sesión y se elimina únicamente tras una constancia válida.
  La exportación v10 enumera esta deuda y la decisión terminal junto con el
  estado efectivo, sin confundirlos.
- La migración `0016_civic_custody_execution_intents` agrega el cache grantor y
  un comando `execution/v1` durable por cuenta+propuesta. Usa UUID criptográfico,
  cuerpo e idempotencia estables; sólo un recibo exacto o un rechazo cerrado
  limpia la fila. Una fila corrupta se aísla y sigue bloqueando su propuesta;
  `borrarTodo` no procede mientras exista esta deuda.
- Los endpoints custodiales reciben el `userId` esperado por la vista y usan un
  token ligado a esa cuenta. Las pantallas descartan lecturas tardías mediante
  epoch y revalidan sesión antes de aplicar recibos; el refresh de tokens hace
  CAS sobre la misma identidad para no sobreescribir otro login. El logout
  normal aplica el mismo CAS y no puede retirar una sesión posterior.
- La respuesta custodiada valida `recordedResponse` contra el UUID y cuerpo
  durable exactos; `grant.response` representa sólo el estado monotónico vigente
  y puede contener una revisión posterior de capacidad.
- Publicar o corregir crea el recibo local inmediatamente antes del outbox con
  la misma clave. Retirar agrega recibos de revocación y un tombstone `update`;
  nunca borra ni reescribe el asiento anterior.
- Las capturas cívicas persisten un `captureAttemptId`; estrella, entrada,
  recompensa base e hitos derivan claves estables, y observación/necesidad se
  recuperan por sus vínculos antes de crear otra fila.
- El servidor confirma eventos individualmente; nunca se elimina un evento antes del acuse.
- Errores permanentes van a `dead_letter`; errores de red reintentan con backoff.
- Conflictos de estado se resuelven con reglas de dominio, no con “último write gana” para todo.
- La UI siempre distingue `solo en este teléfono`, `pendiente`, `sincronizado` y `requiere atención`.
- Las misiones y sus celdas permanecen locales en esta etapa. No entran al
  outbox hasta que el servidor pueda restringirlas por círculo, campaña,
  territorio y asignación; evitar una filtración de rutas importa más que una
  sincronización prematura.
- La georreferencia exacta de `civic_record_contexts` tampoco entra al outbox.
  La entidad madre lleva únicamente el punto ya reducido y la metadata segura
  de su recibo. Nombre visible significa firma declarada, no verificación de
  identidad.
- `locationConsent` y `attributionConsent` gobiernan materialmente el payload:
  si faltan, coordenadas, referencia y firma se omiten aunque existan localmente.
- La última barrera cliente redacta teléfonos y correos dentro de cualquier
  texto libre antes de persistir el evento en el outbox.

## Límite de servidor v1

- una instalación se enrola con secreto aleatorio y recibe un token `civic:write`;
- `civic_events` es append-only y tiene unicidad por `eventId` e `idempotencyKey`;
- `civic_entity_owners` fija el actor de origen de cada entidad;
- verificaciones, participantes de conexiones y acciones tienen claims separados;
- el servidor rechaza estado de confianza decidido por el cliente;
- la cuenta comunitaria es opt-in y se vincula con prueba simultánea de cuenta y dispositivo;
- círculos y campañas usan la identidad de cuenta; la captura básica no la exige.
- el servidor vuelve a encajar cada coordenada en su grilla pública declarada;
  no confía en la reducción hecha por el cliente;
- el feed `basta-civic-feed/v1` exige esa vinculación y entrega sólo registros
  con audiencia `collective`; las audiencias privadas, de círculo o de
  contraparte no entran allí. El canal separado de custodia acepta sólo grants
  de necesidad para círculos con ACL comprobable. Las respuestas del círculo
  son append-only y monotónicas (`assessing → support_available`), sin texto ni
  identidad en su vista; el cliente conserva sólo la última proyección segura.
  `basta-civic-custody-coordination/v1` agrega una propuesta inmutable por grant,
  creada por otra cuenta coordinadora activa, distinta de la grantora, y una
  decisión terminal separada de la misma cuenta grantora y del mismo dispositivo
  actor que otorgó el grant. `terminalDecision` conserva esa decisión aunque el
  estado efectivo pase a `closed` o `expired`. Una decisión nueva exige un grant
  operable; el replay exacto de una ya asentada sigue devolviendo `200` tras
  revocación o vencimiento sólo para esa cuenta y dispositivo owner. Sus vistas
  no exponen relato, contacto, ubicación, `needId` ni identidades;
  los snapshots del grantor y sus vencimientos se calculan con hora de
  PostgreSQL dentro del orden de locks grant→proposal, no con el reloj local;
  `basta-civic-custody-execution/v1` agrega un ledger cerrado y versionado.
  `refreshedAt` de base gobierna la ventana de recepción; report o retiro
  coordinador la abren de inmediato y, de otro modo, abre a las 24 horas del
  inicio. La vista no contiene relato, contacto, ubicación ni identidad;
- el servidor asigna los casos custodiales al namespace `custody_need`, separado
  de las entidades públicas `need`, y rechaza colisiones entre ambos. Así un ID
  privado no puede volverse matchable ni aparecer en el feed por reutilización;
- teléfonos y correos embebidos en texto libre son rechazados antes de entrar
  al log compartido;
- conexiones y acciones se proyectan únicamente a sus participantes; aceptación, entrega y confirmación se persisten como claims de servidor;
- dos actores de dispositivo vinculados a la misma cuenta siguen representando
  esa misma cuenta. La propuesta custodial exige otra cuenta coordinadora y la
  decisión un asiento separado de la cuenta grantora; este control no demuestra
  personas distintas ni independencia organizacional.

## Contrato público

La Radiografía nunca consume filas privadas. Consume agregados que incluyen:

- período y versión de campaña;
- precisión territorial;
- cobertura observada y objetivo;
- cantidad bruta, corroborada y desactualizada;
- nivel de confianza y método;
- supresiones aplicadas por privacidad;
- fecha de actualización.

El endpoint `GET /api/v1/civic/aggregates` aplica un mínimo de cinco contribuyentes distintos por grupo, devuelve bandas en lugar de cantidades exactas de personas y omite por completo grupos pequeños. Su contrato versionado es `basta-civic-aggregate/v1`.

Los agregados se identifican por celda geográfica normalizada según la
precisión declarada, nunca por textos como “Mi barrio”. La etiqueta humana se
conserva sólo si alcanza por sí misma el umbral de contribuyentes
independientes; de otro modo se omite. El servidor descarta pares de
coordenadas incompletos, no finitos o fuera de rango antes de contar.

`GET /api/v1/civic/listening-insights` usa el contrato
`basta-civic-listening-insights/v2`. Sólo acepta `escucha-v1` colectiva con
punto público y precisión allowlisted. Publica facetas globales y cohortes
territoriales sin identificador: k se aplica primero a la celda interna y luego
a cada valor de faceta. Correcciones reemplazan la proyección y revocaciones la
retiran; nunca salen puntos, claves de grilla, etiquetas, ids, actores o texto.

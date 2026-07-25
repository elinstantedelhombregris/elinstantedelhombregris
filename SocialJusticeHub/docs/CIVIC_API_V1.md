# API cívica v1 de ¡BASTA!

Esta API recibe el outbox offline-first del juego sin convertir un dispositivo en una cuenta ni una cuenta en autoridad. El límite es deliberado: el auto-enrolamiento demuestra continuidad de una instalación seudónima; los permisos de coordinación siguen pasando por cuentas y membresías de círculos.

## Despliegue

1. En una instalación nueva, aplicar `migrations/20260713_civic_event_core.sql`,
   luego `migrations/20260714_civic_custody_grants.sql`,
   `migrations/20260714_civic_custody_responses.sql` y, al final,
   `migrations/20260714_civic_custody_coordination.sql`, seguida por
   `migrations/20260714_civic_custody_integrity_hardening.sql` y
   `migrations/20260714_civic_custody_execution.sql`. Si el ambiente ya
   tenía un draft piloto, aplicar en su lugar
   `migrations/20260713_civic_event_core_hardening.sql` y después
   `migrations/20260714_civic_custody_grants_hardening.sql`; después aplicar la
   migración de responses, la de coordinación, el hardening de integridad y la
   migración de ejecución.
   Estos upgrades
   fallan cerrado ante identidades ambiguas, referencias huérfanas o una
   colisión entre una necesidad custodial y una necesidad del ledger público.
2. Definir `CIVIC_DEVICE_PEPPER` con un secreto aleatorio independiente de al menos 32 caracteres.
3. Mantener `CIVIC_AGGREGATE_MIN_ACTORS` en 5 o más.
4. Incluir los orígenes web permitidos en `CORS_ORIGIN`; las apps nativas no envían origin.
5. Configurar el cliente con `EXPO_PUBLIC_CIVIC_API_URL=https://...` y compilarlo de nuevo.

Cambiar `CIVIC_DEVICE_PEPPER` invalida las credenciales de enrolamiento existentes. Cambiar `JWT_SECRET` invalida además los tokens activos. Es una rotación operativa válida, pero debe comunicarse como re-enrolamiento.

## Flujo de confianza

1. La app crea `actor_<uuid-v4>` y 32 bytes aleatorios.
2. `POST /api/v1/civic/devices/enroll` guarda sólo un HMAC con pepper y entrega un JWT corto con scope `civic:write`.
3. Cada evento usa `Authorization: Bearer <device-token>` e `Idempotency-Key` estable.
4. El servidor ata la entidad a ese actor, valida referencias y conserva un log append-only.
5. Una cuenta del sitio puede vincularse opcionalmente con `POST /api/v1/civic/devices/link`, presentando simultáneamente el JWT de cuenta y `X-Civic-Device-Token`.
6. La vinculación habilita un feed operativo redacted entre teléfonos. Capturar y enviar sigue funcionando sin cuenta; leer datos de otras personas no.

El secreto de dispositivo no entra a SQLite, eventos, respuestas de error ni logs. La contraseña de cuenta nunca se guarda en la app.

## Endpoints

### `POST /api/v1/civic/devices/enroll`

Body: `actorKey`, `deviceSecret`, `platform`, `clientVersion`. La primera llamada crea una identidad con rol `contributor`; las siguientes deben demostrar el mismo secreto. Una identidad revocada no puede re-enrolarse.

### `POST /api/v1/civic/events`

Contrato del sobre:

```json
{
  "eventId": "uuid-v4",
  "entityType": "observation",
  "entityId": "uuid-v4",
  "operation": "create",
  "payload": {},
  "createdAt": "2026-07-13T17:00:00.000Z"
}
```

- `201 accepted`: evento nuevo.
- `200 duplicate`: replay idéntico y seguro.
- `409 IDEMPOTENCY_CONFLICT`: la clave o el id se reutilizó con otro contenido.
- `422`: contrato, privacidad o referencia inválida.
- `403`: el actor intenta modificar otra entidad, auto-verificarse, aceptar ambos lados o confirmar desde el lado incorrecto.

El límite por payload es 64 KiB. Se rechazan ubicación exacta, campos de
contacto, teléfonos o correos embebidos en texto libre, `photoUri`, URI
`file://`, `content://`, `ph://`, medios inline y metadatos EXIF/GPS. Los
puntos públicos y pares `publicLat/publicLng` deben estar completos, ser
finitos y caer dentro de WGS84. Antes de calcular idempotencia y persistir, el
servidor los vuelve a encajar en la grilla autoritativa `100m`, `500m`,
`neighborhood` o `city`; cualquier otro sobre coordinado se rechaza. Para
observaciones, necesidades y recursos, la única audiencia admitida hoy en el
log compartido es `collective`. El servidor deriva estados de confianza; no
acepta que el cliente se declare corroborado.

La máquina de estados persiste cada lado de una conexión. `accepted` exige las dos aceptaciones; `fulfilled` sólo puede llegar después y desde quien aporta; `confirmed` sólo después de la entrega y desde quien recibe. Dos teléfonos vinculados a la misma cuenta no cuentan como dos personas.

#### Corrección y retiro auditable

Una corrección de observación, necesidad o recurso usa `operation: "update"`,
conserva el mismo `entityId` y envía una proyección pública completa. Sólo el
actor que creó la entidad puede hacerlo. El cliente crea otro recibo local y
otra clave idempotente; no reescribe el evento anterior.

`status` y `confidence` no son corregibles por el dueño: el servidor los quita
de snapshots legados antes de hashear y guardar. La confianza se deriva de
miradas independientes y los estados operativos de conexiones y entregas usan
sus transiciones autorizadas; editar lugar, texto o firma nunca otorga esos
estados.

Retirar nunca usa `delete`. Usa un tombstone mínimo `update`, también reservado
al dueño:

```json
{
  "id": "uuid-de-la-entidad",
  "campaignKey": "luminarias-v1",
  "audience": "collective",
  "revokedAt": "2026-07-14T12:00:00.000Z",
  "updatedAt": "2026-07-14T12:00:00.000Z"
}
```

`campaignKey` es obligatorio sólo para observaciones, para preservar la
separación de canales como `escucha-v1`. El sobre no admite motivo, texto,
ubicación ni otros campos. La audiencia colectiva permite que el feed y las
proyecciones que vieron el dato reciban su retiro. El log histórico se
conserva; las proyecciones reconstruyen el estado en orden append-only.

### `GET /api/v1/civic/feed?after=0&limit=200`

Contrato `basta-civic-feed/v1`. Requiere token de dispositivo y una cuenta vinculada. Devuelve una proyección incremental para corroboración y conexión, no el log crudo:

- observaciones, necesidades y recursos con precisión pública;
- verificaciones sin nota, evidencia o identidad del verificador;
- conexiones y acciones sólo cuando el actor autenticado es una de las partes;
- `ownedByMe` y estado de cada lado, nunca claves de actor;
- fuente y error horizontal de la captura, audiencia y firma declarada cuando
  la persona las autorizó para ese registro;
- cursor monotónico, máximo 200 eventos por página.
- correcciones completas y tombstones de retiro para actualizar o sacar de
  circulación la copia local sin borrar el historial.

Observaciones, necesidades y recursos sin `audience: collective` fallan
cerrados y no aparecen. `circle` y `counterpart` permanecerán deshabilitados
hasta que el evento incluya un destinatario verificable y el servidor pueda
comprobar membresía o grant.

No contiene contacto, consentimientos, coordenadas exactas, URI locales, claves de actor ni relaciones de conexión ajenas. Al desvincular la cuenta, el cliente retira esta proyección recibida y conserva sus capturas propias.

`attributionName` es presentación declarada, no prueba de identidad. La cuenta
vinculada conserva su autoridad separada y el feed no debe convertir un nombre
libre en rol, reputación o verificación.

Las observaciones de `escucha-v1` no entran al feed, ni siquiera para su creador. La escucha pública existe sólo como facetas agregadas con supresión por grupo.

### Grants privados de necesidades bajo custodia

`POST/GET /api/v1/civic/custody/grants` implementa un canal separado del feed.
La creación exige simultáneamente cuenta y dispositivo vinculados; el inbox se
resuelve contra rol y membresía actuales y sólo llega a coordinaciones de
círculos privados o células. Los grants vencen, pueden revocarse y no contienen
texto libre, relato, contacto, atribución ni custodio. La ubicación opcional se
envía ya reducida, se verifica de nuevo en servidor y nunca supera precisión
`500m`; una coordenada cruda disfrazada se rechaza.

Los dos inbox privados usan `limit` + cursor keyset opaco, conservan un `asOf`
DB entre páginas y revalidan ACL/cierre/vencimiento actuales. El cursor sólo
porta corte, dominio y serial técnico; nunca identificadores de necesidad ni
actores. El cliente oficial alcanza registros 51+ y declara explícitamente su
tope seguro de 20 páginas/1.000 elementos.

La propiedad interna de la necesidad usa el namespace `custody_need`, separado
de `need`. La migración falla si el identificador de una necesidad custodial ya
aparece como necesidad pública y el índice parcial impide que ambos namespaces
compartan un identificador. Ni el grant ni sus pasos posteriores crean un
evento público, aparecen en el feed o alimentan La Radiografía.

Las organizaciones fallan cerradas porque la plataforma todavía no posee una
identidad organizacional con representantes verificables. Contrato, matriz de
autorización, payload allowlisted y límites: `docs/CIVIC_CUSTODY_GRANTS_V1.md`.

`POST /api/v1/civic/custody/grants/respond` permite únicamente a una
coordinación actual registrar `assessing` y luego `support_available`. Es un
ledger mínimo append-only: no recibe texto, contacto, unidad, persona ni
`needId`; la cantidad es opcional, acotada al pedido y la unidad se deriva en
servidor. Una propuesta posterior congela esa capacidad: no se aceptan nuevas
revisiones de `support_available`, aunque el replay exacto de la respuesta que
la originó conserva su idempotencia. El recibo separa `recordedResponse`
(la escritura exacta recuperada) de `grant.response` (la respuesta aplicada
más reciente), para que una revisión posterior no vuelva irrecuperable un HTTP
perdido.

`POST /api/v1/civic/custody/grants/revoke` permite al grantor o a una
coordinación vigente cerrar la capability sin borrar su historial. Contrato,
matriz de autorización, payload allowlisted y límites:
`docs/CIVIC_CUSTODY_GRANTS_V1.md`.

### Propuesta y acuerdo privado de coordinación

El contrato separado `basta-civic-custody-coordination/v1` expone:

- `POST /api/v1/civic/custody/coordination/proposals`: una coordinación actual,
  distinta del grantor, propone sobre la última capacidad
  `support_available`; exige el `proposalId` derivado del grant y la
  `expectedResponseVersion` opaca que mostró el inbox;
- `GET /api/v1/civic/custody/coordination/proposals?limit=50[&cursor=…]`:
  bandeja privada paginada por keyset de coordinaciones vigentes;
- `POST /api/v1/civic/custody/coordination/status`: consulta puntual del
  grantor, con prueba del dispositivo dueño exacto;
- `POST /api/v1/civic/custody/coordination/proposals/decide`: aceptación o
  declinación terminal del grantor, también con cuenta y dispositivo dueño.

La proyección sólo puede estar `proposed`, `accepted`, `declined`, `expired` o
`closed`. Cantidad, unidad y vencimiento se congelan desde la respuesta y el
grant autoritativos; no se reciben como términos del cliente. `accepted`
significa solamente acuerdo bilateral para intentar una coordinación: no
reserva un recurso o capacidad, no abre contacto, no demuestra entrega y no
resuelve la necesidad. Los IDs de propuesta/decisión son deterministas y la
creación falla si la respuesta cambió desde la confirmación. La pérdida de toda
coordinación elegible proyecta `closed`. Contrato completo y límites:
`docs/CIVIC_CUSTODY_COORDINATION_V1.md`.

### Ejecución privada de una coordinación aceptada

El contrato `basta-civic-custody-execution/v1` agrega reserva, preparación de
ambas partes, inicio, reporte, recepción, seguimiento y retiro sobre un ledger
privado append-only. No abre contacto ni publica necesidad, relato o ubicación.
Sus rutas, roles exactos, conciliación y semántica de reintentos están en
`docs/CIVIC_CUSTODY_EXECUTION_V1.md`.

### Cuenta y círculos

- `POST /api/v1/civic/devices/link`
- `POST /api/v1/civic/devices/unlink`
- APIs existentes `/api/circulos`, invitaciones, reportes, campañas y notificaciones.

La vinculación habilita pertenencia y el feed operativo; no sube bitácora, borradores, fotos locales ni coordenadas exactas.

### `GET /api/v1/civic/aggregates?period=30d`

Contrato `basta-civic-aggregate/v1` para La Radiografía. Sólo publica grupos con
al menos cinco creadores distintos de observaciones, necesidades o recursos.
Los verificadores pueden modificar la calidad de una señal, pero nunca elevar
un grupo por encima del umbral de privacidad. Los eventos se agrupan por celda
geográfica normalizada a su precisión pública; `locationLabel` jamás identifica
el grupo y sólo se presenta si esa misma etiqueta alcanza el umbral de actores
independientes. El endpoint agrupa el número de contribuyentes fuente en bandas
y expone conteos de cobertura, corroboración, necesidades, recursos y
resoluciones. Nunca devuelve actores, ids de filas, puntos, evidencia o grupos
suprimidos. Períodos permitidos: `7d`, `30d`, `90d`.

La proyección procesa `create → update → revocación` en secuencia del servidor:
una corrección mueve el dato a su nueva celda y una revocación lo retira del
conteo. El evento anterior permanece en el ledger auditable.

### `GET /api/v1/civic/listening-insights?period=30d`

Contrato `basta-civic-listening-insights/v2`. Proyecta exclusivamente observaciones
`escucha-v1` con `audience: "collective"`, un punto público válido y una
`locationPrecision` allowlisted (`100m`, `500m`, `neighborhood` o `city`). Las
observaciones sin punto, sin audiencia colectiva o con precisión inválida se
omiten de forma cerrada; tampoco entran en las facetas globales.

La respuesta conserva las cuatro facetas globales allowlisted (`theme`, `kind`,
`horizon` y `scope`) y agrega `territories`. Cada territorio se calcula con una
celda de grilla pública derivada en servidor del punto más la precisión
declarada. La clave de celda es sólo interna: la respuesta expone la precisión,
conteos de observaciones, una banda de contribuyentes y las cuatro facetas, pero
nunca el punto, la clave de celda, un id, `locationLabel`, texto libre o una
clave de actor. `locationLabel` se ignora por completo para agrupar, de modo que
dos lugares con la misma etiqueta jamás se mezclan.

Se aplican dos umbrales independientes: primero cada celda debe reunir al menos
cinco creadores distintos y luego cada valor de cada faceta dentro de esa celda
debe reunir por sí mismo cinco creadores. Los valores territoriales suprimidos
no se enumeran ni se informa cuántos hay dentro de una celda, para evitar
inferencias por eliminación en allowlists pequeñas. Las facetas globales también
aplican k por valor. Períodos permitidos: `7d`, `30d`, `90d`.

Las correcciones completas reemplazan las facetas y la cohorte territorial de
esa entidad; un tombstone válido la retira de ambos resultados. Ninguna de esas
operaciones expone el relato o el identificador en la respuesta.

Forma resumida de la respuesta:

```json
{
  "meta": {
    "contract": "basta-civic-listening-insights/v2",
    "privacy": {
      "minimumDistinctSourceContributors": 5,
      "collectiveAudienceRequired": true,
      "publicPointRequired": true,
      "identifiersExposed": false,
      "locationsExposed": false,
      "locationLabelsExposed": false,
      "cellKeysExposed": false
    }
  },
  "facets": {
    "theme": [], "kind": [], "horizon": [], "scope": []
  },
  "territories": [
    {
      "precision": "500m",
      "observations": 12,
      "contributors": { "band": "10–24", "minimumApplied": 5 },
      "facets": {
        "theme": [], "kind": [], "horizon": [], "scope": []
      }
    }
  ]
}
```

### `GET /api/v1/civic/intelligence?period=30d`

Contrato `basta-civic-intelligence/v1`. Es una capa determinista de apoyo a
decisiones construida exclusivamente sobre los grupos ya protegidos de La
Radiografía. Devuelve:

- balance por categoría y tasas explícitas de verificación y resolución;
- prioridades explicables con evidencia, próximos pasos y límites de lectura;
- oportunidades agregadas cuando categoría, etiqueta territorial protegida y
  precisión coinciden entre necesidades y recursos;
- borradores de mandato con destinatario, evidencia, requisitos de revisión y
  salvaguardas.

Una oportunidad agregada no es una asignación ni una coincidencia individual:
la etiqueta territorial no demuestra cercanía: distancia, vigencia, cantidad y
consentimiento se comprueban en el motor
operativo privado. Un borrador siempre lleva `nonBinding: true`, exige
deliberación humana y nunca se declara listo si falta denominador de cobertura,
calidad suficiente o revisión de daño. La respuesta no contiene eventos crudos,
actores, personas, puntos, contactos ni grupos suprimidos.

El orden de prioridades también es auditable: una marca de posible daño se
revisa antes que cualquier oportunidad operativa; dentro del mismo nivel se
ordenan necesidades abiertas, brechas de corroboración y posibles puentes. No
hay ranking individual, perfil ideológico ni modelo oculto.

### Compatibilidad legada de Mandato Vivo

Los endpoints históricos `POST /api/mandates/generate` y
`POST /api/pulsos/generate` leen testimonios fila por fila y pueden invocar un
modelo externo. Permanecen cerrados en todos los entornos salvo que un operador
administrador habilite explícitamente
`DANGEROUSLY_ENABLE_LEGACY_AI_MANDATE_ENGINE=true`. El cron exige además
`DANGEROUSLY_ENABLE_AUTOMATIC_AI_MANDATE_CRON=true`; una sola variable nunca lo
activa. Publicar mandatos, cambiar estados de propuestas y ejecutar el scanner
legado también requiere administración.

Esta ruta existe sólo por compatibilidad y no es la base del programa cívico.
La alternativa soportada es esta inteligencia determinista sobre agregados
protegidos, seguida por deliberación humana, acta, responsable, plazo y
apelación.

## Reglas que no deben relajarse

- autor, verificador y confirmador son capacidades separadas;
- una conexión exige dos identidades distintas;
- dos dispositivos de la misma cuenta siguen siendo una sola parte;
- el feed operativo exige cuenta vinculada y nunca expone claves de actor;
- entregar corresponde a quien aporta; confirmar corresponde a quien recibe;
- aceptar una propuesta custodial no equivale a reservar, contactar, entregar
  ni resolver;
- toda revocación remota debe ser auditable, no un delete arbitrario;
- La Radiografía consume agregados, nunca `civic_events` directamente;
- la inteligencia cívica consume La Radiografía protegida, sugiere y explica,
  pero no determina verdad, derechos, presupuesto ni mandatos vinculantes;
- textos cívicos, contacto y coordenadas no entran a logs técnicos.

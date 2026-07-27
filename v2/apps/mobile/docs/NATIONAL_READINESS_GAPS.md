# Brechas de preparación nacional: retención, borrado, recuperación y cifrado

Fecha de corte: 2026-07-14
Alcance: cliente `juego`, almacenamiento local, credenciales del dispositivo, exportación y fronteras visibles de privacidad. No evalúa la eliminación física ni los backups del servidor.

## Dictamen

La app tiene controles útiles de minimización antes de sincronizar, recibos locales y retiro lógico. Sin embargo, **todavía no está preparada para recolectar a escala nacional datos sensibles o coordenadas exactas de hogares**.

La distinción central es ésta:

- **vigencia**: el dato deja de participar en mapa, matching o análisis;
- **retiro**: se agrega una revocación y deja de circular;
- **borrado lógico**: desaparece una fila de la base activa;
- **eliminación física verificable**: no queda legible en SQLite, IndexedDB, archivos, cache, backups ni dispositivos perdidos.

Hoy existen las tres primeras de manera parcial. La cuarta no está implementada ni puede prometerse. Desde esta auditoría, exportación/borrado ya incluyen custodia y grants en su inventario, el borrado web espera la fotografía vacía y el cliente intenta eliminar evidencia del cache controlado; eso cierra omisiones concretas, no equivale a borrado físico.

El nuevo contrato privado de coordinación tampoco cambia este dictamen. Mantiene
la propuesta fuera del feed y de Tramas, pero el servidor todavía puede leer su
estado, la decisión depende del dispositivo autor y `accepted` sólo significa
acuerdo para intentar coordinar: no existe aún oferta concreta, reserva,
contacto protegido, entrega ni resolución.

## Hallazgos priorizados

### P0. “Retención” es actualmente vigencia, no retención ejecutable

**Evidencia**

- `src/civic/missions.ts:368-388`: `retentionDays` sólo calcula `expiresAt` y lo escribe en observación/necesidad.
- `src/civic/repo.ts:867-875`: vencer significa que un predicado devuelve `true`; no muta, redacta ni borra.
- `src/civic/repo.ts:973-984`, `src/app/territorio/mapa.tsx:93-108`: los vencidos se excluyen de operaciones visibles.
- `src/db/schema.ts:259-287`: el pasaporte geográfico conserva `exactLat`, `exactLng`, precisión, referencia y autoría sin fecha propia de purga.
- `src/db/schema.ts:54-78`, `src/db/schema.ts:327-354`: texto, foto y coordenadas también están duplicados en estrellas, observaciones y bitácora.
- `src/civic/record-context.ts:172-206`: retirar la audiencia conserva deliberadamente el punto preciso local.

**Impacto**

Una misión que declara “60 días de retención” sigue conservando después del día 60 relato, evidencia, URI de foto, coordenadas exactas, pasaporte, celdas y recibos. Los registros con `expiresAt = null` pueden permanecer indefinidamente. Restaurar un backup o export anterior también resucita el contenido completo.

**Condición de cierre**

Definir plazos separados para dato exacto, relato, evidencia, proyección operativa, ledger y backup. Ejecutar un barrido idempotente que retire primero, espere o registre el acuse, redacte o borre cada copia y deje sólo el recibo mínimo que la política autorice. La UI debe decir **vigencia** hasta que esto exista.

### P0. El borrado total no cubre todos los artefactos ni es borrado físico

**Evidencia**

- `src/db/schema.ts:393-415`: `civic_need_custodies` guarda custodio, destinatario y vía de contacto.
- Hallazgo original corregido: export v10 incluye ahora
  `civic_need_custodies`, `civic_need_access_grants` y su snapshot privado de
  coordinación, con `remoteCoordinationTerminalDecision` separado del estado
  operativo, además del cache y las intenciones privadas pendientes de recibo
  o ejecución. El borrado se bloquea si perdería una intención execution.
- `src/app/ajustes.tsx:443-458`: la interfaz afirma que elimina datos cívicos, consentimientos, identidad y sesión.
- `src/db/repos.ts:713-740`: se ejecutan `DELETE`; no hay `PRAGMA secure_delete`, `VACUUM`, borrado del archivo SQLite ni verificación posterior.
- Hallazgo original corregido: Ajustes espera `flushWebDatabaseSnapshot` después del borrado lógico web.
- `src/app/encender.tsx:55-60`, `src/db/schema.ts:55-61`: la cámara deja un URI local asociado a la estrella.
- `src/app/ajustes.tsx:197-208`: el export sensible se escribe en cache y nunca se elimina después de compartir.

**Impacto**

- El inventario actual ya cubre custodia y grants, pero sigue siendo manual y puede volver a quedar desactualizado.
- La recarga web inmediata ya espera una fotografía vacía; falta una prueba end-to-end de borrar y reiniciar en cada plataforma.
- Fotos de cámara, el JSON exportado, páginas libres de SQLite y backups quedan fuera de la garantía.
- Cada tabla nueva puede volver a romper export/borrado porque ambos inventarios son listas manuales independientes.

**Condición de cierre**

Crear un inventario único y testeable que cubra las tablas actuales y futuras;
borrar archivos de evidencia/export; confirmar cero filas; en web persistir o
eliminar IndexedDB antes de navegar; en nativo aplicar una estrategia
verificable de borrado/cripto-borrado. Probar reinicio inmediato y restauración
desde backup.

### P0. Borrar el dispositivo puede destruir una revocación remota pendiente

**Evidencia**

- `src/civic/repo.ts:900-963`: retirar encola un `update` con `revokedAt`.
- `src/civic/sync.ts:127-153`: el outbox se elimina sólo junto con el acuse exitoso del servidor.
- Hallazgo original mitigado para grants privados: Ajustes cuenta cualquier
  `delivering`, `delivered`, `failed` o `revocation_pending`, aun si el reloj
  local lo muestra vencido o el estado local ya dice `revoked`; ofrece enviarlo
  primero y bloquea filas y credenciales hasta `revoked_remote`. La frase
  `BORRAR IGUAL` queda limitada a retiros colectivos sin acuse.
- `src/civic/need-access-grant-delivery.ts`: una respuesta ambigua conserva la
  cuenta grantora y el grantId local para revocar; una cuenta distinta no puede
  fingir el retiro.
- `borrarTodo` todavía elimina `sync_outbox`; el modo emergencia declara que puede perder esa deuda.

**Impacto**

Una persona puede retirar offline y luego perder el teléfono. La app ya no
permite que `BORRAR IGUAL` destruya grantId o vínculo con la cuenta antes del
acuse, pero una pérdida física sigue haciéndolo; además el modo de emergencia
todavía puede destruir retiros colectivos del outbox. El dato remoto puede
seguir vigente aunque la persona ya expresó lo contrario.

**Condición de cierre**

Separar dos operaciones:

1. **borrado de emergencia local inmediato**, que advierte qué solicitudes remotas quedarán pendientes;
2. **retirar de la red y luego borrar**, cuya deuda queda asociada a la cuenta/servidor y sobrevive a la pérdida del dispositivo.

Nunca hacer depender el derecho de retiro de conservar un teléfono inseguro.

### P0. Los datos sensibles locales están en texto claro para la app

**Evidencia**

- `src/db/client.ts:35-45`: nativo abre `basta.db` con Expo SQLite sin capa de cifrado de aplicación.
- `src/db/client.ts:118-168`, `src/db/client.ts:206-213`: web guarda una copia lógica de todas las filas como objetos en IndexedDB.
- `src/db/schema.ts:55-61`, `src/db/schema.ts:72-78`, `src/db/schema.ts:229-250`, `src/db/schema.ts:263-287`: relato, reflexiones, URI de fotos y coordenadas exactas son columnas legibles.
- `src/civic/device-auth.ts:16-26`, `src/civic/identity.ts:11-21`, `src/civic/community-auth.ts:36-46`: SecureStore protege claves/tokens sólo en nativo; web usa AsyncStorage.
- `app.json:11-29`: no se declara política de backup, protección de archivo ni bloqueo de aplicación.

**Impacto**

“Local” describe residencia, no confidencialidad. Quien acceda al archivo SQLite, al perfil web, a un backup o a un dispositivo desbloqueado puede leer material que la UI llama privado. En web, una inyección de script del mismo origen también alcanza snapshot y credenciales.

**Condición de cierre**

Cifrar por campo o usar una bóveda compatible con la plataforma, con clave no exportable en Keychain/Keystore; definir si web admite datos sensibles y, si los admite, usar WebCrypto, CSP estricta y aislamiento de origen. Agregar bloqueo de app, modo dispositivo compartido, exclusiones/política de backup y cripto-borrado por destrucción de claves.

### P0. La pérdida del dispositivo no tiene un protocolo de recuperación comprobable

**Evidencia**

- `src/civic/identity.ts:23-39`: si falta `actorKey`, se crea otro; no existe restauración, delegación ni clave de recuperación.
- `src/db/repos.ts:675-679`: el export excluye explícitamente credenciales e identidad segura.
- `src/civic/community-auth.ts:118-175`: el cliente ofrece registro, login y refresh; no ofrece recuperación de cuenta.
- `src/civic/community-auth.ts:221-238`: el único unlink visible actúa desde el dispositivo que todavía posee la sesión; no hay inventario/revocación de dispositivos perdidos.
- `src/civic/feed.ts:37-51`, `src/civic/feed.ts:138-180`, `src/civic/feed.ts:214-247`: el feed puede traer una proyección marcada `ownedByMe`, pero es redacted y no restaura bitácora, puntos exactos, fotos, recibos ni outbox.
- `src/civic/custody-coordination.ts`: la decisión de una propuesta exige la
  prueba del mismo actor de dispositivo que otorgó el grant; la cuenta sola no
  recupera esa autoridad.
- No existe ruta de importación para `basta-export.json`.

**Impacto**

- Sin cuenta vinculada, perder el dispositivo hace irrecuperables la identidad seudónima, la memoria privada y la autoridad práctica sobre lo enviado.
- Con cuenta vinculada hay ingredientes para una recuperación parcial de filas operativas, pero no existe contrato/UI/prueba que garantice adopción legítima del actor anterior, corrección/retiro posterior o prevención de falsa independencia.
- Una propuesta custodial puede seguir visible o vigente en red, pero otro
  dispositivo no puede aceptar, rechazar o administrar con seguridad la
  autoridad exacta del grantor perdido.
- El JSON exportado es una copia de lectura, no un backup restaurable.

**Condición de cierre**

Permitir que una cuenta verificada recupere o delegue autoridad sobre sus actores anteriores sin fusionarlos y sin permitir auto-verificación. Incorporar lista/revocación de dispositivos, recovery de cuenta, export remoto y un import local validado. La prueba debe partir de un teléfono perdido, no de un logout limpio.

### Hallazgo corregido que debe conservarse: HTTPS fail-closed

**Evidencia**

- `src/civic/device-auth.ts:89-110`: el secreto del dispositivo se envía al endpoint de enrolamiento y el comentario afirma que viaja por HTTPS.
- Hallazgo corregido: `src/civic/config.ts` rechaza protocolos no HTTP(S), credenciales embebidas y todo HTTP salvo loopback en desarrollo; `device-auth.ts` vuelve a validar antes de leer/crear el secreto.
- `.env.example:1-3`: el ejemplo usa HTTP sólo para loopback de desarrollo; la
  validación ejecutable impide trasladar esa excepción a un origen remoto.

**Impacto**

El riesgo original era enviar secreto, tokens y eventos por un origen HTTP mal
configurado. La invariancia ejecutable lo bloquea hoy; una regresión futura
volvería a abrir esa exposición.

**Condición de cierre**

Mantener pruebas que rechacen HTTP remoto antes de leer o enviar el secreto y
que permitan sólo loopback de desarrollo explícito. Verificar la misma
precondición en cada nuevo transporte autenticado.

### P1. El export es valioso para inspección, pero inseguro e incompleto como portabilidad

**Evidencia positiva**

- `src/db/repos.ts:680-709`: la lectura ocurre en una transacción y tiene versión/timestamp.
- `src/app/ajustes.tsx:408-413`: la UI advierte correctamente que contiene relatos y coordenadas exactas y no contiene credenciales.

**Brechas**

- Es JSON sin cifrado, passphrase, integridad criptográfica ni firma.
- Ya incluye `civic_need_custodies`, `civic_need_access_grants` y el snapshot de
  coordinación, pero cualquier tabla futura se omite si no se agrega al
  inventario manual.
- Incluye URI de fotos, no los archivos: no es portable y puede exponer rutas locales.
- En nativo queda una copia sensible en `Paths.cache` (`src/app/ajustes.tsx:197-208`).
- Sólo exporta el SQLite local; no existe export de cuenta/servidor ni estado de solicitudes de eliminación.
- No existe import, migración de restore, manifiesto de attachments ni verificación round-trip.

**Condición de cierre**

Llamarlo “export local sensible”, ofrecer un contenedor cifrado con manifiesto y checksum, incluir attachments consentidos o declarar su ausencia, eliminar temporales y crear import versionado. La portabilidad nacional debe sumar un DSAR de cuenta con procedencia y recibo.

### P1. No hay política verificable para backups, cache y dispositivo compartido

El app config no explicita si SQLite, fotos o export quedan en backups del sistema; tampoco existe bloqueo biométrico, cierre por inactividad, ocultamiento en el selector de apps ni modo compartido. Hasta definirlo, la frase “sólo este dispositivo” debe entenderse como “la app no lo sincroniza”, no como “sólo yo puedo leerlo”.

## Afirmaciones actuales demasiado fuertes

| Afirmación | Evidencia que la contradice o limita | Redacción segura hoy |
| --- | --- | --- |
| `app.json:16` y `app.json:49`: “Tu ubicación… Nunca sale de tu teléfono.” | La publicación sincroniza una proyección geográfica consentida; el export comparte coordenadas exactas. | “Usamos tu ubicación para situar la captura. Sólo se comparte la zona y precisión que confirmes; el punto exacto no se envía al mapa común.” |
| `src/app/escuchar.tsx:202`: “nadie puede leerla.” | El relato está en SQLite/IndexedDB sin cifrado de aplicación ni bloqueo. | “La app no la sincroniza. Queda almacenada en este dispositivo o perfil; protegelo si otras personas pueden acceder.” |
| `src/app/ajustes.tsx:81`: “Los eventos expiran en silencio.” | `expiresAt` sólo los excluye de operaciones; no elimina contenido. | “Al vencer dejan de participar en operaciones. Hoy permanecen en tu historial hasta que los retires o borres localmente.” |
| `src/app/ajustes.tsx:443-458`: “Elimina la base local… datos cívicos…” | Las filas de custodia ya están inventariadas y web espera persistencia, pero fotos/cache/backups/páginas libres de SQLite quedan fuera. | “Solicita borrar las filas y credenciales cubiertas en este dispositivo. No borra copias remotas ni garantiza todavía eliminación de archivos o backups.” |
| `docs/PLAYABLE_RELEASE.md:26`: secreto “en Keychain/Keystore”. | En web, secreto, actor y tokens usan AsyncStorage. | “Keychain/Keystore en nativo; almacenamiento web pendiente de endurecimiento.” |
| `docs/LA_TRAMA_VIVA.md:102-105` y `:128`: export/borrado “completos”. | El inventario manual puede volver a desactualizarse y no cubre eliminación física, archivos o backups. | “Export/borrado local parcial con inventario auditado en cada versión.” |
| `src/civic/safety.ts:14`: “ningún texto libre sale… con contacto.” | La redacción por regex reduce riesgo, pero no detecta toda ofuscación o formato. | “Barrera heurística de redacción; no sustituye campos estructurados ni validación servidor.” |
| `src/app/tramas/[id].tsx:451-455`: la sala “nunca” muestra coordenadas exactas. | Títulos libres se filtran con regex de email/teléfono/domicilio, no pares de coordenadas ni todas las formas de dirección. | “La sala oculta campos técnicos y aplica redacción preventiva; no escribas contacto ni ubicación exacta en texto libre.” |

## Secuencia recomendada

### Antes de ampliar incluso un piloto de bajo riesgo

1. Corregir permisos y copy absoluto; distinguir local, cifrado, vigente, retirado y eliminado.
2. Reparar el inventario de export/borrado y agregar una prueba que falle al sumar una tabla sin política.
3. Hacer que revocaciones pendientes sobrevivan del lado de la cuenta/servidor; la advertencia de emergencia local no reemplaza esa garantía.
4. Mantener la invariancia HTTPS ya implementada en pruebas de build y despliegue.
5. Verificar borrado durable web después de recarga inmediata y ampliar limpieza más allá del cache controlado.

### Antes de recolectar salud, violencia, niñez, migración, política o domicilios

1. Bóveda cifrada, bloqueo de app y política de backups.
2. Retención física ejecutable por clase de dato y campaña.
3. Recuperación de cuenta/actor y revocación de dispositivo perdido.
4. Export cifrado + import probado + derechos remotos con comprobante.
5. Revisión legal, seguridad independiente y gobierno comunitario del plazo de retención.

### Antes de escala nacional

1. Catálogo/ROPA por campo, finalidad, base legal, custodio, procesadores y transferencias.
2. Pruebas periódicas de restauración, eliminación de backups, recuperación y abuso interno.
3. Gestión de incidentes, notificación, apelación y SLAs de retiro/eliminación.
4. Auditoría de dispositivos compartidos, accesibilidad, coerción y riesgo territorial diferencial.

## Pruebas de aceptación mínimas

- Copiar SQLite e IndexedDB no revela relato, contacto ni coordenadas exactas.
- Adelantar el reloj y ejecutar retención elimina/redacta todas las copias definidas, también tras restaurar backup.
- Insertar un canario en cada tabla y archivo, borrar, reiniciar inmediatamente y comprobar ausencia; repetir en web, Android e iOS.
- Retirar offline, borrar el teléfono y comprobar que la revocación remota sigue pendiente y finalmente se acusa.
- Perder un dispositivo vinculado, entrar desde otro y retirar sólo registros propios sin crear una falsa verificación independiente.
- Exportar, importar en instalación limpia y comparar manifiesto/attachments; una passphrase incorrecta no revela contenido.
- La app rechaza una URL HTTP de producción antes de enviar secreto o payload.
- Una prueba de inventario falla automáticamente cuando aparece una tabla sin regla explícita de exportación, retención y borrado.

## Regla de decisión

Hasta cerrar los P0, la app puede pilotear mecánicas y captura de bajo riesgo con personas informadas, pero no debe presentarse como bóveda privada ni como sistema con retención/eliminación nacional garantizada. **Si la plataforma no puede devolver autoridad después de perder el teléfono y demostrar qué copias borró, todavía no debe pedir el dato sensible.**

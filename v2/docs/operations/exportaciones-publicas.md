# Operación de exportaciones públicas

Implementación aditiva: migración `0030_exportaciones_durables.sql`, esquema y snapshot de Drizzle. No usa un disco efímero ni una promesa desprendida de una función HTTP. Las partes autorizadas, el cursor, la fase y el lease viven en Postgres. No exige una cuenta.

## Recorrido y contratos

- `POST /api/v1/exportaciones/trabajos`: CSRF obligatorio; formato CSV, JSONL o GeoJSON, filtros públicos e `idSolicitud` UUID. El cliente conserva este control antes de enviar; repetirlo con el mismo cuerpo recupera el mismo trabajo. Otro cuerpo devuelve 409.
- `GET /api/v1/exportaciones/trabajos/:id`: estado `solicitado`, `preparando`, `disponible`, `vencido` o `fallido`, corte, progreso, vencimiento y enlace. No expone el control, el lease ni datos de cuenta.
- `POST /api/v1/exportaciones/trabajos/:id/cancelar`: CSRF y `idSolicitud` original. Conocer el UUID público no permite cancelar. Un trabajo cancelado es `fallido` y dice por qué.
- `GET /api/v1/exportaciones/trabajos/:id/archivo`: ZIP por flujo, sin Blob ni descarga de todas las filas a memoria del navegador. El servidor lee una parte por consulta y aplica contrapresión de 64 KiB. Los paquetes incompletos nunca están disponibles.

Cada paquete contiene `senales.<formato>`, `procesos.json`, `manifest.json` y `LEEME.txt`. Si se pide desde Radiografía con parámetros, incluye `analisis.json`, su cobertura y límites. Las señales recorren todas las páginas de 100 filas; los procesos también se paginan. Se reutiliza la proyección pública: texto sin cesión omitido, ubicación protegida, sin identidades, actores, secretos, matrices, respuestas individuales ni vectores.

El manifiesto v2 incluye un índice de fragmentos con archivo, orden, longitud UTF-8 y SHA256. Su SHA256 verifica `JSON.stringify(fragmentos)`. Para verificar un archivo, separá sus bytes en las longitudes declaradas, en orden, y comprobá cada suma. Este significado está declarado en LEEME; no se presenta como hash del ZIP completo ni del JSON de una exportación v1. CRC32 verifica además cada entrada del ZIP.

## Worker y despliegue

Desde `v2/`, con las variables de la base v2 configuradas, ejecutá:

```sh
pnpm --filter @v2/api exportaciones:once
```

Un lote toma el siguiente trabajo, ejecuta hasta veinte pasos durante un presupuesto de 35 segundos y libera el lease. Cada parte se guarda junto con su cursor en una sentencia atómica. Repetí este comando desde un supervisor o un cron del host. Un proceso que muere se retoma al vencer el lease de 90 segundos. Tres errores consecutivos sin progreso producen un fallo explícito; un paso exitoso reinicia ese contador.

La función `/api/cron/exportaciones` usa la guarda compartida de `CRON_SECRET`; la configuración de Vercel la agenda por minuto, con duración máxima de 60 segundos. El empaquetador incluye su entry y su stub está versionado. El proveedor debe admitir esa frecuencia: [la documentación de Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing) limita Hobby a tareas diarias y admite tareas por minuto en Pro. En un host con otra política, ejecutá el CLI con un supervisor o invocá el cron protegido desde el programador autorizado. No sustituyas esta cola por llamadas públicas que ejecuten el worker.

La entrega usa respuesta transmitida por flujo; `api/index.mjs` tiene duración máxima de 300 segundos para permitir archivos grandes. [Vercel indica streaming para respuestas grandes](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions). Cualquier proxy del despliegue debe conservar ese flujo y `no-store, no-transform`. Antes de lanzar, verificá un paquete de más de 4,5 MB en el host elegido; esta implementación se verificó en local, sin desplegar ni tocar bases remotas. Con una red lenta o un host de menor duración, dividí el alcance por zona, tema o fechas.

## Permisos, corte y retención

El corte fija creación, no una instantánea histórica. Los triggers de UPDATE/DELETE sobre señales, contribuciones, campañas y fichas incrementan una revisión pública. Es una invalidación conservadora: un cambio puede invalidar también un paquete cuyo alcance no contenía esa fuente. El estado, la preparación y cada parte transmitida comprueban vigencia y revisión; una corrección, retención, retiro o cambio de licencia bloquea la entrega preparada y borra sus partes. Si ocurre durante una entrega, el flujo se interrumpe y no se cierra un ZIP válido. Una copia descargada previamente no se puede recuperar.

Los INSERT posteriores al corte no invalidan los trabajos: una ola de aportes puede continuar mientras se prepara una lectura. Si una transacción incorpora tarde una fuente cuya creación es anterior al corte, sólo se invalidan los trabajos con ese corte o uno posterior. La misma guarda cubre un contexto nuevo ligado a una señal anterior. Así no se anuncia completo un conjunto que pudo cambiar detrás del cursor.

El archivo vence a las 24 horas de pedirlo. Las partes fallidas o vencidas se borran en la siguiente lectura o barrido del worker; las referencias de trabajos se purgan siete días después de su vencimiento. El worker debe mantenerse activo para el barrido periódico. Límites declarados: 100 trabajos en cola, 20 pedidos por IP/hora, 100.000 señales, 256 MiB de contenido, 10.000 partes y 2 MiB por parte. Alcances excesivos fallan con explicación y nunca se recortan anunciando un archivo completo.

## Evidencia local

`apps/api/tests/exportaciones-trabajos.test.ts` verifica los cuatro endpoints con Postgres real: más de 500 filas, reintentos, CSRF, control de cancelación, lease recuperable, expiración, licencia vigente, ZIP/CRC32/sumas, CSV seguro, GeoJSON protegido, límite de memoria y continuidad frente a aportes posteriores al corte. `DescargarDatos.test.tsx` verifica el pedido antes del POST, recuperación tras recarga y enlace de descarga directo. El cron rechaza una invocación sin autorización.

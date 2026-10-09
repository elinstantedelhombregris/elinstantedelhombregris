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

La preparación avanza por tres caminos, y los tres usan la misma función acotada (`prepararExportaciones`):

1. **En pedido (el camino normal).** Consultar un trabajo `solicitado` o `preparando` (`GET /api/v1/exportaciones/trabajos/:id`) y crearlo (`POST`) avanza un tramo antes de responder: hasta 20 pasos o 10 segundos, lo que ocurra primero. El tramo se espera con `await` antes de responder; nunca queda trabajo corriendo después de `res.end()`, porque la función de Vercel se congela al responder y no hay `waitUntil`. El navegador consulta cada 3 segundos, de modo que el archivo se prepara mientras la persona tiene la página abierta. Si la cierra, el trabajo queda donde estaba y sigue cuando vuelva a consultarlo (o cuando pase el cron). Un tramo en pedido no corre el barrido de vencidos (`limpiar: false`): esa tarea es de la operación.
2. **Cron diario.** `/api/cron/exportaciones` usa la guarda compartida de `CRON_SECRET`, corre una vez por día (`0 6 * * *`) con duración máxima de 60 segundos, barre vencidos y fallidos y retoma trabajos que nadie volvió a consultar. Una frecuencia mayor a una vez por día hace fallar el despliegue en Vercel Hobby ([documentación de Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing)), y una prueba de `pnpm test:scripts` lo impide. El empaquetador incluye su entry y su stub está versionado.
3. **CLI.** Desde `v2/`, con las variables de la base v2 configuradas, `pnpm --filter @v2/api exportaciones:once` ejecuta un lote (hasta veinte pasos durante 35 segundos) para un supervisor o un host sin cron.

### Por qué es seguro ejecutar el worker desde una consulta pública

Este documento prohibía antes ejecutar el worker desde llamadas públicas. Lo que se permite ahora no es una ejecución libre sino un paso acotado y protegido por el lease:

- El tramo es corto y de tope fijo; una consulta no puede pedir más trabajo del que el código decide.
- `tomar()` reclama un único trabajo con `for update skip locked` y un lease de 90 segundos. Dos consultas simultáneas no preparan el mismo trabajo: la que no obtiene el lease no hace nada y devuelve el estado.
- Cada fragmento avanza sólo si coinciden lease, orden y estado, y se guarda junto con su cursor en una sentencia atómica: ningún fragmento se duplica ni se salta.
- Se toma el trabajo más antiguo de la cola, no necesariamente el consultado: quien consulta colabora con la cola entera y no puede adelantar su trabajo a costa de otro.
- Cada consulta que avanza un tramo puede tardar hasta unos 10 segundos en responder; el navegador espera la respuesta antes de volver a consultar, así que no se acumulan pedidos.
- Un fallo del worker no llega a la respuesta. Se registra, se devuelve el estado actual y la contabilidad del propio trabajo decide si reintenta o falla: tres errores consecutivos sin progreso producen un fallo explícito; un paso exitoso reinicia ese contador. Un proceso que muere se retoma al vencer el lease.
- Sigue valiendo el límite de 20 pedidos por IP y hora para crear trabajos y el tope de 100 trabajos en cola.

`EXPORTACIONES_EN_PEDIDO=0` apaga el camino en pedido y deja la preparación al cron diario y al CLI; sirve para diagnosticar o para un host con su propio programador. Por defecto (variable ausente o vacía) está prendido.

La entrega usa respuesta transmitida por flujo; `api/index.mjs` tiene duración máxima de 300 segundos para permitir archivos grandes. [Vercel indica streaming para respuestas grandes](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions). Cualquier proxy del despliegue debe conservar ese flujo y `no-store, no-transform`. Antes de lanzar, verificá un paquete de más de 4,5 MB en el host elegido; esta implementación se verificó en local, sin desplegar ni tocar bases remotas. Con una red lenta o un host de menor duración, dividí el alcance por zona, tema o fechas.

## Permisos, corte y retención

El corte fija creación, no una instantánea histórica. Los triggers de UPDATE/DELETE sobre señales, contribuciones, campañas y fichas incrementan una revisión pública. Es una invalidación conservadora: un cambio puede invalidar también un paquete cuyo alcance no contenía esa fuente. El estado, la preparación y cada parte transmitida comprueban vigencia y revisión; una corrección, retención, retiro o cambio de licencia bloquea la entrega preparada y borra sus partes. Si ocurre durante una entrega, el flujo se interrumpe y no se cierra un ZIP válido. Una copia descargada previamente no se puede recuperar.

Los INSERT posteriores al corte no invalidan los trabajos: una ola de aportes puede continuar mientras se prepara una lectura. Si una transacción incorpora tarde una fuente cuya creación es anterior al corte, sólo se invalidan los trabajos con ese corte o uno posterior. La misma guarda cubre un contexto nuevo ligado a una señal anterior. Así no se anuncia completo un conjunto que pudo cambiar detrás del cursor.

El archivo vence a las 24 horas de pedirlo. Las partes fallidas o vencidas se borran en la siguiente lectura del propio trabajo o en el barrido del cron diario; las referencias de trabajos se purgan siete días después de su vencimiento. El cron diario (o el CLI) debe mantenerse activo para ese barrido: el avance en pedido no lo ejecuta. Límites declarados: 100 trabajos en cola, 20 pedidos por IP/hora, 100.000 señales, 256 MiB de contenido, 10.000 partes y 2 MiB por parte. Alcances excesivos fallan con explicación y nunca se recortan anunciando un archivo completo.

## Evidencia local

`apps/api/tests/exportaciones-trabajos.test.ts` verifica los cuatro endpoints con Postgres real: más de 500 filas, reintentos, CSRF, control de cancelación, lease recuperable, expiración, licencia vigente, ZIP/CRC32/sumas, CSV seguro, GeoJSON protegido, límite de memoria y continuidad frente a aportes posteriores al corte. `DescargarDatos.test.tsx` verifica el pedido antes del POST, recuperación tras recarga y enlace de descarga directo. El cron rechaza una invocación sin autorización. Con `EXPORTACIONES_EN_PEDIDO` prendido, la misma suite prueba que sondear el trabajo lo lleva a `disponible` sin worker externo y que dos consultas simultáneas no duplican partes; `scripts/build/__tests__/crons-diarios.test.ts` verifica que ningún cron de `vercel.json` corra más de una vez por día.

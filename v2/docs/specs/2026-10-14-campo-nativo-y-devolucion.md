# Campo nativo y devolución a las fichas

La persona acepta e inicia una tarea de escucha en la web, vincula su teléfono desde
su cuenta y descarga la tarea. En el teléfono prepara notas privadas y un resumen
público separado. Sólo el resumen autorizado entra a la cola; repetir un envío
recupera el mismo recibo. Una versión vieja se conserva como conflicto.

1. Credencial específica de campo: secreto aleatorio de 256 bits, sólo su hash en
   Postgres, caducidad de 30 días, nombre y revocación desde la web. SecureStore en
   iOS/Android. No reutilizar la identidad anónima ni los tokens comunitarios v1.
   No habilitar esta credencial en la versión web de Expo.
2. Descargar únicamente tareas de escucha asignadas a la cuenta. Envío y retiro
   restringidos al autor; no concede administración, revisión ni acceso general.
3. Cola local persistente por cuenta y origen, sin secretos. Guardar antes de
   enviar, conservar el cuerpo y UUID ante respuestas perdidas, reintento manual
   y al recuperar conexión mientras la pantalla está abierta. No prometer trabajo
   de fondo con la app cerrada. Las notas privadas nunca salen del teléfono.
4. Vincular explícitamente una tarea no derivada con una ficha requiere administrar
   la iniciativa y editar la ficha. Cambiar el vínculo modifica la revisión de la
   tarea y obliga a revisar cualquier envío preparado previamente.
5. La ficha muestra la evidencia vigente, su procedencia, límites y revisión.
   No copia los textos: retirarlos elimina también su lectura en la ficha.
   Avisos genéricos a seguidores con avisos habilitados, sin contenido personal,
   deduplicados por evidencia/revisión. No alterar por sí solo el futuro acordado.
6. Verificar permisos, caducidad, revocación, duplicados, conflictos, aislamiento de
   cuentas, retiro, avisos y persistencia. Actualizar ejemplos y plan con alcance real.

No sustituye el piloto real, la cartografía versionada ni las fuentes verificadas.

# Reservas por tarea y cuaderno de campo

## Propósito

Continuar E3.3 y E5.1: identificar qué recursos se acordaron para una tarea y conservar resultados de escucha cuando se corta la conexión. Ejemplo cotidiano: reservar una sala para escuchar horarios de apoyo escolar, tomar notas privadas, preparar un resumen autorizado y enviarlo al volver la red.

## Contratos

1. Una reserva completa se vincula a una única tarea. Solo quien la solicitó y administra o tiene asignada la tarea puede vincularla. En tareas derivadas de una prueba, la ficha debe coincidir. Se exige reserva aceptada, tarea activa y revisiones actuales. Desvincular no cancela el acuerdo ni libera stock; el solicitante puede hacerlo aunque haya perdido su rol. Ambas partes consultan la vinculación; las cantidades y condiciones privadas no se publican en el historial ni se extienden a otros integrantes.
2. Se lee el estado actual de la reserva, incluso entrega parcial, discrepancia o cancelación. Vincular no vuelve a descontar disponibilidad. Recibir un recurso no acredita ejecución ni revisión de resultados. Serialización: recibo, capacidad y luego iniciativa; los otros circuitos nunca adquieren esos bloqueos en orden inverso.
3. Cuaderno web por cuenta y tarea en IndexedDB. Notas privadas separadas de un resumen publicable. Guardado explícito con detección de ediciones entre pestañas, error de almacenamiento visible y sin falsas confirmaciones. No se promete apertura inicial sin red: cargar la web y tarea antes de salir. La app nativa mantiene su circuito propio; esta entrega conecta la escucha de iniciativas desde la web móvil.
4. Autorizar congela un sobre de publicación con UUID, cuenta, tarea, revisión, período, observaciones, ausencias, límites y próximo paso. Nunca incluye notas privadas. Solo ese sobre entra en la cola. Sin autorización no hay sincronización. Reintentos conservan sobre y recibo, incluyendo respuesta perdida después de commit. La API verifica cuenta esperada en cada envío para impedir publicaciones bajo otra sesión.
5. El envío declara la ejecución y aporta evidencia en una sola transacción para una escucha asignada y en curso, o agrega evidencia a una ya realizada con permisos. No revisa automáticamente. Un cambio de revisión, permiso o alcance detiene el envío y exige recuperar la versión actual; no rebase silencioso. Reintentos manuales y al recuperar conexión con la pantalla abierta, con espera creciente y máximo de intentos. Las colas de otra cuenta no se envían. Un envío de resultado incierto conserva su recibo hasta reconciliarlo; borrar localmente no retira publicaciones.

## Verificación

- [x] Migración aditiva y contratos compartidos.
- [x] API y UI de vinculación, privacidad, concurrencia y cantidad parcial.
- [x] API de campo atómica, idempotente, cuenta esperada y conflictos.
- [x] Cuaderno y cola persistente, consentimiento explícito, aislamiento de cuenta y recuperación.
- [x] Ejemplo claro, pruebas de comportamiento y navegador en cuatro anchos.
- [x] `pnpm verify`, actualización del plan y registro de límites pendientes.

No se importan datos ficticios al mapa ni se despliega la migración en producción. Fuentes verificadas, piloto con personas reales, síntesis nacional y escenarios conservan sus condiciones de aceptación en el plan principal.

Verificado: `pnpm verify` con Postgres local descartable, 3.364 pruebas aprobadas y 20 omisiones existentes. Regresión Playwright de campo aprobada; revisión visual en cuatro anchos. D-129 sigue abierta por el fallo HTTP observado antes de la corrida completa aprobada.

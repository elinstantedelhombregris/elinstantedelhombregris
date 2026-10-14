# De una alternativa a una acción organizada

Fecha: 14/10/2026. Entrega parcial E5.1.

## Problema y alcance

Las pruebas de una ficha ya conservan aceptación, observaciones, evidencia, revisión por otra cuenta y avisos a seguidores. Las iniciativas tienen tareas e hitos, pero esos dos circuitos no están conectados. Unirlos permite organizar una alternativa sin crear un segundo estado de avance que pueda contradecir el primero.

Quien creó la prueba o aceptó su responsabilidad puede vincularla una vez a una iniciativa comunitaria nueva o a una existente que administra. La operación crea un hito de revisión y una tarea con el alcance y la fecha de la prueba. Una iniciativa nueva queda a cargo de quien la crea. La vinculación no acepta una tarea por ninguna otra persona. Un miembro de la iniciativa puede aceptar explícitamente una prueba todavía propuesta, con firma pública; solo entonces se asigna la tarea a su cuenta.

La tarea refleja el estado de la prueba: pendiente, en curso, pausada o ejecución declarada. Terminar la ejecución no confirma resultados. El hito registra que se revisó el resultado, sin atribuir éxito ni causalidad. La revisión mantiene el requisito de una cuenta distinta de la creadora y responsable. Los recursos y condiciones se describen públicamente, sin exponer solicitudes de reserva privadas ni volver a descontar existencias.

La vinculación y las transiciones toman el mismo bloqueo de la prueba y usan revisiones esperadas. Reintentar el mismo recibo no duplica iniciativa, hito ni tarea. Cambiar el contenido de un recibo o vincular una prueba ya vinculada produce conflicto. Las lecturas públicas no devuelven IDs de usuarios, recibos ni huellas. El listado de acciones de una iniciativa tiene cursor estable y carga incremental.

## Plan y aceptación

- [x] Contratos, vínculo con claves foráneas y migración local.
- [x] Vinculación atómica, permisos, aceptación y sincronización de tarea/hito.
- [x] Formulario desde la prueba, lectura desde iniciativa y enlaces a ficha/evidencia.
- [x] Integración en Postgres: nueva/existente, roles, revisión, concurrencia, reintento, fases y paginación.
- [x] Componentes, anchos móviles, lint, tipos y verificación completa.

Ejemplo: la alternativa de apoyo escolar propone dos encuentros; se crea la iniciativa «Aprender cerca de casa», una tarea para preparar y realizar los encuentros y el hito «Revisar horarios y asistencia». Una persona integrante acepta organizarla. El equipo registra lo realizado, observa si los horarios sirvieron y otra cuenta revisa la evidencia. Una reserva de sala sigue requiriendo la aceptación del oferente y la confirmación de recepción.

Quedan fuera de esta entrega la administración general de iniciativas, edición de tareas independientes, transferencia de responsabilidad, corroboración de identidad y el trabajo presencial del piloto. No se publica ni migra producción como parte de esta implementación.

## Verificación

`pnpm verify` completo pasó en dos bases Postgres locales descartables: 3.332 pruebas aprobadas y 20 omisiones condicionales preexistentes; lint, tipos, corpus y compilación correctos. La integración específica cubre la carrera entre vincular y aceptar, además de reintentos, permisos y paginación. Revisión visual a 360, 390, 768 y 1440 píxeles sin desborde ni errores JavaScript, con todas las APIs interceptadas y una única escritura simulada al confirmar el formulario.

La lectura general de diseño conserva el límite anterior de cien alternativas/pruebas (D-128); el listado de acciones de iniciativa sí está paginado. La administración de membresías conserva los problemas anteriores registrados en D-130. Estas restricciones no se presentan como resueltas por el vínculo de ejecución.

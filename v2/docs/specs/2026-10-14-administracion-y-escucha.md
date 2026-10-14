# Administración de iniciativas y escucha territorial

## Resultado esperado

Una persona puede crear una iniciativa comunitaria, editar su propósito, administrar su equipo, organizar hitos y tareas, aceptar responsabilidad, registrar evidencia y revisar resultados. Una tarea de escucha conserva objetivo, zona pública, método, canal, convocatoria, fecha y límites. Las tareas derivadas de pruebas siguen gestionándose desde su ficha: no se introduce una segunda autoridad sobre ellas.

## Contrato

- Iniciativas abiertas, en curso, pausadas, completadas o archivadas; los planes editoriales conservan su circuito. Creación con consentimiento; cambios de revisión esperada y recibo idempotente.
- Contadores de membresía atómicos. El ingreso duplicado y la salida repetida no alteran a otras personas. Propiedad y administración son permisos distintos. La transferencia de propiedad se propone a una persona integrante y necesita su aceptación. No se puede retirar a quien conserva tareas activas; primero debe liberar su responsabilidad. El propietario no puede salir sin transferir.
- Hitos y tareas independientes tienen revisión. Solo se cambia el alcance de una tarea mientras no tiene responsable y sigue pendiente. Una persona integrante acepta por sí misma con firma; puede iniciar, pausar, retomar, liberar o declarar ejecución. La ejecución no confirma el resultado.
- Evidencia pública mínima mediante texto y enlace opcional HTTP(S), con consentimiento. Una cuenta integrante distinta de quien creó la tarea, de la autora de evidencia y de la responsable puede revisar; la revisión no acredita independencia personal. Retirar evidencia borra texto/enlace y revoca su revisión. Los hitos se cierran con nota cuando todas sus tareas tienen ejecución y evidencia revisada, sin atribuir éxito a resultados adversos.
- Escucha: zona pública sin domicilios, territorio de catálogo opcional, método, canal y convocatoria. Unidad y versión de relevamiento declaradas, sin confundirlas con grilla geográfica. Resultado: período observado, número de encuentros/observaciones (no personas únicas), resumen, ausencias, límites y próximo paso. Las cifras de diferentes métodos no se suman como cobertura poblacional.
- El relato privado de campo no se importa. La web enlaza al circuito de aportes existente para publicar solamente aquello autorizado; el cierre de escucha es un resumen revisado por quien lo envía. Las operaciones web fallidas conservan borrador y recibo; no se anuncia sincronización sin conexión.
- Lecturas paginadas; permisos de equipo personalizados y sin caché pública. Registro de cambios con actor de cuenta y tipo de operación, sin duplicar cuerpos de evidencia retirables.

## Plan

1. [x] Contratos y migración de administración, tareas y evidencia.
2. [x] Repositorios transaccionales, permisos, recibos y control de revisiones.
3. [x] API y pruebas reales en Postgres para todos los endpoints.
4. [x] Administración web de propósito, equipo, hitos, tareas y resultados.
5. [x] Entrada de escucha desde Cobertura, ejemplos cotidianos y consulta paginada.
6. [x] Revisión móvil, pruebas de componentes y `pnpm verify` completo.

No se inventan relevamientos realizados, participantes ni geografías que el catálogo todavía no provee. El trabajo presencial y la comprobación de representatividad siguen requiriendo evidencia de campo. No se despliega ni migra producción durante la implementación.

## Recorrido disponible

- `/escucha-territorial`: consulta pública con zona, canal, unidad/versiones declaradas y límites de convocatoria; enlace directo a la tarea, también fuera de su primera página.
- `/iniciativas`: iniciativas propias o que se integran, con acceso desde Mi espacio. `/iniciativas/nueva?escucha=si` permite elegir una administrada y preparar escucha.
- `/iniciativas/:slug`: tareas, hitos, acciones derivadas de fichas, equipo y propósito, historial. Los documentos editables se muestran como texto, sin interpretar HTML ajeno.
- `/iniciativas/ejemplo`: seis pasos ficticios de apoyo escolar, sin escrituras.

Migración 0036 aditiva, con recibos y conciliación de contadores de membresía existentes. No agrega una segunda autoridad sobre las tareas derivadas de pruebas. Las consultas personales y de evidencia no usan caché pública.

## Verificación

`pnpm verify` terminó correctamente: lint, TypeScript, 2.450 pruebas unitarias, 244 de scripts y 655 de integración; 20 omisiones por condiciones existentes. Compilación web/API y control de entrenamientos aprobados. Dos bases locales temporales, eliminadas al terminar; sin conexiones de escritura a producción.

El navegador comprobó escucha, ejemplo, creación, tareas, hitos y equipo a 360, 390, 768 y 1440 px, sin desbordes. Con respuestas simuladas se verificaron aceptación y revisión (dos escrituras), fallo de consulta y reintento, sin errores de JavaScript. Revisión visual de la pantalla de escucha y del formulario móvil y ejemplo en escritorio.

D-130 resuelta en código. D-129 sigue abierta: una corrida de integración falló transitoriamente en ingreso y lectura de reserva; las 24 pruebas afectadas pasaron aisladas y la repetición completa pasó. No se atribuye una causa sin reproducirla.

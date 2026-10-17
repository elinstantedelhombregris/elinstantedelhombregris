# Recorrido escolar con API y Postgres locales

La simulación anterior explica el servicio, pero no permite comprobar cuentas, permisos ni persistencia. Este ensayo usa las rutas reales con datos ficticios, separados de producción.

1. [x] Arranque reproducible con Postgres persistente en `127.0.0.1:55441/basta_escuela_local`, API en `127.0.0.1:4000`, sin cargar `.env` ni proveedores externos.
2. [x] Preparación idempotente de tres cuentas, una campaña abierta, una ficha con desacuerdo explícito y una iniciativa con tarea libre y sin destino. Reiniciar conserva el progreso.
3. [x] Guía visible desde el ejemplo escolar únicamente cuando responde el servidor del ensayo. Explica qué cuenta decide, ejecuta y revisa, y enlaza los objetos reales.
4. [x] Prueba de navegador contra API/Postgres reales: ingreso, selección de ficha, ingreso al equipo, aceptación personal, ejecución, evidencia, revisión de otra cuenta y retorno a la ficha. Usar una tarea técnica separada para dejar libre la práctica del usuario.
5. [x] Documentar arranque, parada, alcance de la verificación y pendientes del piloto humano; dejar ambos servidores funcionando.

No se cambia el modelo de permisos ni se agrega un inicio de sesión automático. La fecha inicial del ensayo se conserva y la guía muestra las fechas efectivas. Los horarios son material sintético, sin escuela, empresa, menores ni domicilios identificables. El ensayo técnico no acredita mejora de puntualidad ni revisión independiente entre personas reales.

## Verificación y entrega

`pnpm verify` aprobó lint, tipos, pruebas, corpus y compilación con bases temporales separadas. La suite de guardia local quedó incluida en `test:unit` (40 pruebas de API aprobadas); las cuatro pruebas del recorrido y la guía aprobaron. Playwright completó el ciclo contra la API local, con contraseña/cookies/CSRF reales y sin interceptar respuestas: vínculo, ingreso al equipo, aceptación, ejecución, evidencia pendiente en la ficha, revisión de otra cuenta y devolución en la campaña.

Se retiraron exclusivamente las seis tareas técnicas fallidas creadas durante el desarrollo de la prueba. Se conservan dos verificaciones completas identificadas y sus resultados; la tarea de práctica sigue libre y sin vínculo. Las cuentas participante y revisora salieron del equipo para permitir probar el ingreso. El reinicio recupera los mismos objetos. El piloto con personas reales y la comprobación de puntualidad siguen pendientes.

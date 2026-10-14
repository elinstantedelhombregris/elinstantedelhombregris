# Una sala y una escucha: operación de reservas y campo

Recorrido ficticio de referencia: `/iniciativas/ejemplo`. No crea reservas ni resultados reales.

## Cómo se operaría

1. Un espacio publica su disponibilidad en Capacidades. La persona que organiza el apoyo escolar solicita seis horas desde la ficha que puede editar. El espacio acepta la solicitud.
2. Quien solicitó entra a la tarea que administra o tiene asignada, abre **Ver reservas de recursos → Vincular una de mis reservas aceptadas** y elige la sala. La reserva completa queda asociada a esa tarea; vincularla no descuenta otra vez sus horas.
3. Si se usaron cuatro horas, el espacio declara cuatro y la otra parte confirma recepción. Las otras dos vuelven a la disponibilidad según el protocolo de capacidades. En la tarea se ven seis acordadas y cuatro recibidas; su ejecución todavía requiere un resultado. Solo las partes ven los detalles del acuerdo.
4. La persona acepta e inicia su tarea de escucha con conexión. Abre **Cuaderno de campo**. La web guarda una copia del alcance y su revisión junto al borrador local. Se puede continuar escribiendo sin red mientras esa pantalla siga cargada.
5. Escribe notas privadas y guarda el borrador. Prepara aparte un resumen público: período, número de encuentros u observaciones, método, ausencias, límites y próximo paso. El número no representa personas únicas ni porcentaje de población.
6. Revisa lo escrito, declara la ejecución y autoriza el resumen. La cola congela esos campos; las notas privadas no entran al envío. Puede quitar la autorización antes del primer intento. Después de un intento incierto conserva el recibo para comprobar qué recibió el servidor.
7. Con la pantalla abierta, la cola reintenta al recuperar la conexión y con espera creciente. **Sincronizar resúmenes autorizados** permite reintentar manualmente. Una sesión diferente no puede publicar el sobre con otra cuenta.
8. Si la tarea cambió, el envío se detiene. **Consultar versión actual para revisar** muestra alcance, fecha, zona, método e invitación. La persona recupera el borrador sin autorización, lo corrige y decide nuevamente qué publicar.
9. El recibo confirma que llegó el resumen. Otra cuenta revisa después la evidencia y sus límites. La tarea no obtiene revisión por el solo hecho de recibir recursos o sincronizar.
10. Eliminar la copia local borra las notas de ese navegador; para retirar evidencia pública se usa el control de retiro en la tarea.

## Verificación técnica

- Integración con Postgres local: permisos, dos destinos compitiendo por la misma reserva, revisiones, recepción parcial, stock, privacidad, reintentos y ejecución/evidencia atómica.
- Componentes y cola: autorización, error de almacenamiento, conservación del texto, cuenta correcta, espera, límite de intentos y conflicto entre versiones.
- Navegador con API simulada: vinculación, persistencia después de recargar, guardado sin red, respuesta perdida después de recepción simulada, recibo reutilizado, notas excluidas y cuentas aisladas. Revisión visual a 360, 390, 768 y 1440 píxeles.

La migración 0037 se preparó para despliegue, pero no se aplicó a producción. Este cuaderno no sustituye el circuito nativo ni una visita real a territorio. Los resultados del ejemplo no son evidencia sobre una comunidad.

Regresión reproducible: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4179 pnpm exec playwright test tests/e2e/campo.spec.ts`, desde `v2`, con el frontend local iniciado. La prueba intercepta todas las API. Para la verificación completa usá el procedimiento de integración local con bases descartables; no ejecutes pruebas contra el `.env` de producción.

Resultado: **3.364 pruebas aprobadas** en `pnpm verify`, 20 omisiones existentes y una prueba Playwright adicional aprobada. D-129 sigue abierta: hubo un fallo HTTP intermitente antes de la repetición completa aprobada.

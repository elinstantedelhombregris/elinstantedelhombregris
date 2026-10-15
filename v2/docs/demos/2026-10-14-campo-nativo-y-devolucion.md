# De una tarea en el teléfono a una ficha

## Ejemplo: horarios de apoyo escolar

1. En una iniciativa propia, crear una tarea de escucha. En «Elegir ficha de
   devolución», pegar el enlace de una ficha que la misma cuenta pueda editar.
   El destino queda fijo cuando se publica la primera evidencia.
2. La persona responsable entra al equipo, acepta e inicia la tarea en la web.
3. En `/campo`, abrir «Vincular la app nativa con mis tareas», nombrar el teléfono
   y generar una clave. La web la muestra una sola vez. Se puede revocar allí.
4. En la app instalada: Territorio → Tareas de campo v2 → pegar la clave →
   Descargar mis tareas asignadas. La app debe compilarse con
   `EXPO_PUBLIC_V2_API_URL` apuntando al origen HTTPS de la web v2. En desarrollo
   sólo se admite HTTP de loopback; en un teléfono físico usar HTTPS accesible.
5. Abrir la tarea y escribir notas privadas. El ejemplo puede registrar dos
   encuentros, explicar que faltaron familias que trabajan de noche y proponer
   escuchar por la mañana. Guardar esos límites en el resumen público separado.
6. Confirmar que se realizó la escucha y autorizar el resumen. Con la pantalla
   abierta, la app lo envía cuando hay conexión. Cinco intentos automáticos como
   máximo, con espera; luego se puede reintentar manualmente. Una respuesta
   perdida conserva el mismo cuerpo y recibo. Un conflicto exige recuperar la
   tarea, revisar el destino y volver a autorizar.
7. En la ficha, «Lo que volvió del territorio» muestra el resultado pendiente.
   Otra persona integrante revisa desde la tarea. La ficha refleja esa revisión.
   Quienes la siguen reciben un aviso interno si sus preferencias lo permiten.
8. Desde el teléfono se puede autorizar el retiro de la evidencia propia, consultando primero su estado vigente con conexión. Se
   sincroniza con su propio recibo; se retira también el texto de la ficha.
   Borrar un cuaderno local no retira contenido público.

## Alcance y preparación

- La credencial sólo sirve para tareas de campo propias y su evidencia; no permite
  administrar iniciativas ni revisar resultados ajenos. Caduca a los 30 días.
- El teléfono y el navegador conservan cuadernos distintos. No se copian notas
  privadas automáticamente ni se guardan credenciales en SQLite o exportaciones.
- Desconectar el teléfono oculta los cuadernos y detiene nuevos envíos; no borra las
  notas. Vincular la misma cuenta y origen permite recuperarlas. Revocar desde la
  web invalida la clave; una solicitud ya autorizada en curso puede terminar.
- No hay sincronización prometida con la app cerrada ni autenticación nativa web.
- Postgres: migración `0038_campo_nativo_devolucion.sql`, preparada sin aplicarla a
  producción. SQLite: `0020_cuadernos_campo_v2.sql`, incluida en el arranque.
- La exportación local completa de Mis datos incluye los nuevos cuadernos y su
  borrado local completo también los elimina. Nunca incluye la clave SecureStore.

## Validación

Se comprueban permisos, CSRF al emitir/revocar, cuenta esperada, caducidad,
revocación, SQL local con comparación de versiones, respuesta perdida, reintento,
conflictos, retiro y avisos deduplicados según preferencias. El navegador usa API
simuladas a 360, 390, 768 y 1440 px. Se compilan los paquetes iOS y Android; esto no sustituye una
prueba de instalación y uso en un dispositivo físico.

Resultado final: `pnpm verify` completo en Postgres temporal local (3.370 pruebas
aprobadas, 20 omisiones históricas); 342 pruebas nativas, TypeScript y lint de
mobile; dos pruebas de navegador con API simuladas; paquetes JavaScript/Hermes
para iOS y Android generados. No se instalaron en teléfonos físicos ni se aplicó
ninguna migración en producción.

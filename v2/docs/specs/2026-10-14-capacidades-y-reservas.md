# Capacidades declaradas y reservas acordadas

Una señal de recurso o práctica puede ofrecer una capacidad concreta para un período. La cuenta autora declara tipo, unidad, cantidad entera en esa unidad (o sin cuantificar), lugar de servicio, restricciones y firma pública propia o de una organización que autoriza la oferta. El catálogo editorial `resources` no participa. La autorización es declarada, no una verificación institucional.

Cada oferta conserva sus condiciones originales. Se puede reconfirmar o cerrar a nuevas solicitudes; cambiar condiciones exige otra oferta. Una oferta vencida o cuyo aporte fue retirado/retenido no acepta nuevas reservas. Las reservas anteriores siguen accesibles a sus dos partes para resolver entregas pendientes.

Quien edita una ficha propone una solicitud explicando necesidad y compatibilidad. La cercanía no demuestra compatibilidad. Solicitar no descuenta disponibilidad. La persona que ofrece acepta o rechaza; aceptar descuenta cantidad. Ambas partes pueden cancelar antes de declarar entrega. Quien ofrece declara la entrega con una nota; quien solicitó confirma recepción o deja una discrepancia. Una discrepancia mantiene la cantidad comprometida hasta completar y volver a declarar la entrega. Una discrepancia nunca libera una cantidad posiblemente entregada. Una entrega confirmada no vuelve al inventario. Las ofertas sin cantidad requieren evaluación manual y no muestran disponibilidad numérica inventada.

La lectura pública muestra condiciones y cantidades agregadas. Solicitudes, notas y fichas vinculadas solo se muestran a las dos cuentas involucradas. No se exponen identificadores de cuenta ni contactos. Cerrar sesión separa las cachés. Los ejemplos se operan localmente y nunca escriben datos ficticios en el corpus.

## Invariantes y concurrencia

- Cantidades enteras positivas hasta un millón; para fracciones elegir una unidad menor (minutos, gramos). Cero disponible es válido; cantidad desconocida es `null`.
- Solicitante distinto del oferente, ficha existente y editable al proponer, señal propia de tipo recurso/práctica al ofrecer. Fecha de solicitud dentro del período, aún no vencida.
- Cada mutación toma primero el bloqueo de la fila de capacidad dentro de `db.batch`. La siguiente sentencia usa un snapshot nuevo bajo READ COMMITTED: ve las reservas que terminó el anterior poseedor del bloqueo. Todas las operaciones usan ese orden. No se usa una suma previa fuera de transacción.
- Cantidad reservada + entregada nunca supera cantidad declarada. Una reserva aceptada y vencida conserva su compromiso hasta resolución explícita: no se libera una entrega pendiente por reloj.
- Creación con recibo y huella inmutable. Reintentar entrega, aceptación o cancelación no duplica cantidades. Cambiar el cuerpo con el mismo recibo devuelve conflicto.
- Fechas del contrato son días UTC; interfaz explicita el período. El servidor valida vencimiento.

## Plan de implementación

1. [x] Contratos, tablas y migración versionada.
2. [x] Repositorio transaccional, permisos, estados e idempotencia; API con CSRF.
3. [x] Interfaz desde aportes, fichas y Mi espacio; solicitudes y seguimiento por las dos partes.
4. [x] Ejemplo interactivo de cantidad compartida, rechazo por falta de disponibilidad y recepción.
5. [x] Pruebas de concurrencia real, permisos, privacidad, fechas y reintentos; componentes y recorrido móvil.
6. [x] Verificación completa aislada, guía y actualización del plan principal.

La cuenta oferente debe seguir activa para recibir solicitudes. Cerrar una oferta no borra reservas ni convierte entregas pendientes en recibidas. Pruebas: carrera real entre dos aceptaciones de 6/10, reintentos, permisos, cierre/retiro, fechas, cantidad desconocida y paginación. Interfaz comprobada en 360, 390, 768 y 1440 píxeles con API simulada, sin escrituras externas.

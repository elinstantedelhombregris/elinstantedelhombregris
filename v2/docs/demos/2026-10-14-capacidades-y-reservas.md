# Cómo operar capacidades y reservas

## Probar sin publicar

Abrí `/capacidades/ejemplo` o entrá desde los ejemplos de fichas. Recorré el caso de una sala con diez horas disponibles: solicitar seis no descuenta; aceptar reserva seis; intentar aceptar otras cinco falla; declarar entrega sigue esperando recepción; confirmar recepción registra seis utilizadas y cuatro restantes. El ejercicio vive en el navegador y no escribe en las tablas públicas.

## Ofrecer algo real

1. Ingresá con la cuenta autora de un aporte de tipo recurso o práctica. Abrilo desde Mi espacio y elegí **Ver ofertas o declarar disponibilidad**.
2. Detallá qué ofrecés, unidad, cantidad total del período, fechas, territorio y zona, condiciones y firma pública. Cantidad vacía significa evaluación manual; no significa cero ni disponibilidad ilimitada. Para fracciones usá una unidad menor.
3. Confirmá que podés disponer de esa capacidad o que la organización te autorizó. La plataforma registra esa declaración; no certifica representación institucional.
4. Publicá. Podés reconfirmar las mismas condiciones o cerrar a nuevas solicitudes. Para cambiarlas, cerrá y creá otra oferta. No dupliques el mismo stock en ofertas simultáneas: la protección transaccional opera dentro de cada oferta identificada.

## Solicitar y acordar

1. Desde una ficha elegí **Buscar capacidades para esta ficha**. Abrí una oferta y revisá fechas, lugar, restricciones y última confirmación.
2. Con una cuenta editora de la ficha, solicitá cantidad y fecha. Explicá necesidad y compatibilidad, y aceptá las condiciones. Si no tienen cantidad, acordá manualmente la prestación antes de aceptar.
3. Quien ofrece encuentra la solicitud en **Mi espacio → Mis capacidades, reservas y entregas**. Puede aceptarla o rechazarla. Aceptar revisa disponibilidad dentro de la transacción; dos aceptaciones simultáneas no pueden gastar la misma cantidad.
4. Antes de la entrega declarada, cualquiera de las dos partes puede cancelar. La cantidad vuelve a quedar disponible. Una fecha pasada conserva la reserva pendiente hasta resolverla.

## Entregar y revisar

Quien ofrece declara qué entregó y cuántas unidades fueron. Quien solicitó confirma esa cantidad y el cierre de la reserva, o registra una discrepancia. En una entrega parcial, solo después de confirmar se libera el saldo que no se entregó. Cero permite acordar el cierre de una prestación no realizada. Una pantalla anterior no puede confirmar otra declaración: debe volver a revisarla. La discrepancia conserva la cantidad comprometida; se puede completar y volver a declarar la entrega. Mientras se resuelve, la cantidad no vuelve a ofrecerse. La cantidad recibida no vuelve a estar disponible durante ese período. Un préstamo devuelto se ofrece en un período nuevo.

Confirmar horas de sala no demuestra una mejora educativa: ese resultado necesita la evidencia y revisión de la ficha. Las solicitudes, la ficha vinculada y las notas de entrega solo son visibles para ambas cuentas. Los visitantes ven condiciones y totales agregados.

## Alcance de esta entrega

Persistencia en Postgres con migración `0033_capacidades_reservas.sql` y `0034_recepcion_parcial.sql`, preparada y probada en bases descartables. Sin despliegue ni migración de producción en esta tarea. No hay pagos, habilitaciones profesionales ni préstamos recurrentes automatizados; los requisitos de cada prestación quedan en sus condiciones.

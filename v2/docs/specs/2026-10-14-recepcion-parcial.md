# Recepciones parciales sin liberar lo ya utilizado

Quien ofrece puede declarar una cantidad entregada entre cero y la cantidad reservada, explicando la diferencia. Quien solicita ve esa cantidad y decide si confirma el cierre o deja una discrepancia. Hasta la confirmación se conserva toda la reserva. Al confirmar se registra la cantidad declarada como recibida y solo el saldo restante vuelve a estar disponible. Cero permite cerrar por acuerdo una prestación no realizada; no se interpreta automáticamente como cancelación.

Cada acción lleva la revisión que vio la persona. Una pantalla vieja no puede confirmar una declaración que cambió durante una discrepancia. Reintentar la misma transición reconoce la revisión inmediatamente posterior sin repetirla. Cantidades y notas diferentes con la misma revisión generan conflicto.

No se puede cancelar una entrega declarada ni una discrepancia para liberar material que quizá ya se entregó. La resolución exige nueva declaración y confirmación de la otra parte. Para capacidades sin cantidad se mantiene la evaluación manual.

1. [x] Columnas de cantidad declarada y revisión, migración y contratos.
2. [x] Guardas de revisión y cálculo de disponibilidad/recepción con cantidad real.
3. [x] Interfaz para declarar, revisar y cerrar entregas parciales.
4. [x] Pruebas de saldo, cero, discrepancia, reintento y pantallas viejas.

Prueba con Postgres local: se reservan diez unidades, se declara seis, la otra parte observa cuatro; una declaración revisada de cuatro requiere nueva confirmación y libera seis. Otra reserva cerrada con cero recibido libera solo después de confirmar. Se comprueba rechazo de una revisión vieja y reintento idéntico sin movimiento duplicado.

Validación final: `pnpm verify` completo aprobado con cuatro procesos por paquete, 3.322 pruebas aprobadas y 20 omitidas por condiciones existentes. Compilación, tipos, lint y corpus aprobados. Migraciones 0033–0034 comprobadas en Postgres local; no se aplicaron a producción.

# Validación espacial y migración 0039

## Objetivo

Comprobar los límites realmente publicados y aplicar la cadena pendiente hasta
0039 al proyecto v2 de Neon (`cool-bird-63087148`), por pedido expreso del usuario.
No se cambia el dominio ni se publica una versión de la aplicación por este paso.

## Contrato

- Cada informe identifica edición, huellas de los tres archivos, motor y método.
- Se comprueban validez de polígonos, solapamientos del mismo nivel, pertenencia
  provincial por código y cobertura departamental dentro del marco publicado.
- Las áreas se miden en una proyección equivalente, nunca en grados cuadrados.
  Se declara el umbral numérico; no equivale a una tolerancia jurídica.
- Geometrías inválidas se informan y excluyen de operaciones que no pueden
  calcularse con fiabilidad; no se reparan ni se certifica cobertura completa.
- Los municipios no se suponen una partición exhaustiva del país. Una coincidencia
  de código con el censo no prueba equivalencia de límites o comparabilidad temporal.
- El informe público ofrece resumen, incidencias localizables y descarga íntegra.
  Una edición nueva no hereda controles de una anterior.
- Antes de migrar se identifica el destino, se coteja el diario remoto con las
  huellas locales y se revisan las migraciones pendientes. Se conserva una copia
  de seguridad privada y se ensaya la cadena. La aplicación es transaccional y
  serializada; un diario divergente o un destino desconocido bloquean la escritura.
- Se comprueban después el diario, tabla, columnas y restricciones de 0039. No se
  crean cuentas, fichas ni resultados ficticios en producción.

## Pasos

1. Inventariar destino y diario de migraciones; revisar diferencias pendientes.
2. Incorporar auditoría espacial reproducible y probar casos geométricos adversos.
3. Ejecutarla sobre la edición activa y mostrar sus resultados en conciliación.
4. Ensayar y aplicar las migraciones autorizadas, con copia y comprobación posterior.
5. Ejecutar verificación completa y documentar resultados y límites pendientes.

El piloto con personas reales, los radios/áreas habitadas, la homologación censal
y el despliegue/distribución nativa conservan sus requisitos propios.

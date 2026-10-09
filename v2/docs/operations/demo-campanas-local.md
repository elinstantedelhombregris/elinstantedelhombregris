# Campañas de ejemplo en el entorno local

La repetición provenía de datos persistidos por pruebas, no de una duplicación visual. `participacion-ideal.test.ts`, `equipo-continuidad.test.ts` y `diseno-ideal.test.ts` creaban cuentas, campañas y fichas con UUID nuevos en cada corrida y no tenían limpieza final. Una campaña cuyo contrato volvió a borrador conserva su edición pública anterior: ese archivo legítimo hacía visibles también varios fixtures de preparación.

El saneamiento del 8 de octubre de 2026 se ejecutó exclusivamente en `basta_descartable_test` de `127.0.0.1:55440`. Se acreditaron cuentas por marcadores de prueba, contratos originales/historiales y relaciones a sus IDs; no se seleccionó ni ocultó sólo por títulos iguales. Se retiraron 20 campañas, 15 fichas, 52 cuentas de fixture y 18 señales propias. Los UUID están en `output/preview/saneamiento-fixtures-campanas.json`. El aporte manual `af81507f-f3fb-4a80-99f3-28f0f2377947` conservó exactamente su fila, verificada mediante hash antes y después.

Las tres suites ahora capturan sus IDs y limpian sus objetos y propietarios en `afterAll`. Los cuerpos de señales conservan además sus `idLocal`: una contribución anónima no acreditada bloquea toda la limpieza, incluso mediante una guarda dentro de la transacción. La limpieza rechaza cuentas sin marcador de prueba y participación de cuentas ajenas. Las pruebas focales verifican que una cuenta independiente se conserva. No hay truncados globales.

## Demo curada

- Campaña: `demo-local-aprender-mendoza`, `6e71cb0e-fb06-4605-8f0d-83489caa0f8f`, en pausa.
- Ficha: `4eaa8cb4-ff48-40fa-9214-4759b77e4e9b`, vinculada a esa campaña.
- Ámbito oficial: Mendoza, provincia 13. No se inventan coordenadas ni domicilios.

La campaña y la ficha dicen **Ejemplo local**. Fechas, fases y equipo son ilustrativos. No existe un equipo operativo, participantes civiles ni compromiso institucional. Su propietario de documentación está inactivo y no tiene una credencial de acceso. El frontend distingue el ejemplo de una convocatoria abierta y no ofrece publicar en la fase pausada.

Por pedido de revisión, se añadieron tres señales sintéticas pequeñas: sueño, necesidad y práctica. Cada texto empieza `[Ejemplo local]` y aclara su carácter hipotético; la práctica no se presenta como actividad en funcionamiento. Tienen cesión explícita, actor y cuenta participante nulos, ámbito provincial, sin puntos ni vectores. El contexto usa `demostracion_local`; no se las etiqueta como envíos de ciudadanos. Las relaciones de la ficha son inspira, describe y capacidad. Sus IDs y condiciones están en `output/preview/demo-campanas-aportes.json`. No se fabrican opiniones ni resultados de Radiografía.

## Herramienta acotada

Desde `v2/packages/db`, `pnpm exec tsx scripts/preparar-demo-campanas.ts` sólo imprime el inventario. `--aplicar` ejecuta limpieza de fixtures acreditados y prepara la demo. El script rechaza cualquier host remoto y cualquier base diferente de `basta_descartable_test`; nunca carga una URL de producción por defecto. Las contribuciones anónimas no acreditadas se bloquean también en el saneamiento: no se infiere propiedad por pertenecer a una campaña.

Los tres aportes de documentación se validan con los contratos vigentes y reglas territoriales del núcleo. Se incorporaron fuera de la ingesta ciudadana de la campaña pausada, mediante la herramienta local autorizada; no son una excepción pública al control de fases.

El catálogo conserva campañas distintas aunque tengan el mismo título. Consulta nombres geográficos mediante endpoints existentes; los enlaces de participación de campañas abiertas llegan al mapa con UUID y edición. Análisis, descargas y revisión conservan esa edición. Después de cambiar datos desde la herramienta local, recargá la página para renovar el catálogo.

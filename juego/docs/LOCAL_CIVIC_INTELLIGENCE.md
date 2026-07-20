# Inteligencia cívica local — decisiones de diseño

## Propósito

`/territorio/inteligencia` es una superficie offline de apoyo a decisiones. Lee
las tablas locales que ya alimentan Territorio, Corroborar, Conectar y Misiones;
no descarga un tablero alternativo ni crea una segunda verdad.

Su contrato puro es `basta-local-civic-intelligence/v1`. Es deliberadamente
distinto de `basta-civic-intelligence/v1`: el contrato del servidor trabaja
sobre grupos públicos protegidos por umbral; esta pantalla trabaja sobre los
registros operativos accesibles en una instalación. Cuando se integre la capa
nacional, ambas lecturas deben conservar su procedencia y nunca sumarse como si
tuvieran el mismo universo.

## Dos fuentes, nunca un total combinado

La Sala ofrece dos pestañas mutuamente excluyentes:

- **Esta instalación**: lectura operativa local, disponible offline.
- **Red pública**: consulta opcional de
  `GET /api/v1/civic/intelligence?period=30d`.

La consulta pública no empieza hasta que la persona elige esa pestaña. Cambiar
de fuente reemplaza toda la superficie de lectura: las cabeceras, cifras,
prioridades y límites no se muestran lado a lado ni se suman. El informe local
no se envía para producir la lectura pública.

La proyección pública identifica dentro de la UI:

- contrato y contrato fuente;
- período solicitado, inicio y fecha de generación;
- mínimo de fuentes distintas exigido por grupo;
- cantidad de grupos pequeños suprimidos;
- cantidad de grupos efectivamente publicados;
- truncamiento declarado de la ventana fuente;
- grupos con y sin denominador de cobertura.

Un grupo suprimido no se representa como cero. Si `truncated=true`, la pantalla
marca la lectura como parcial y prohíbe interpretarla como cobertura completa
del período.

## Validación defensiva de la red pública

`src/civic/public-intelligence.ts` copia sólo campos validados; no hace un cast
optimista del JSON. La pantalla falla cerrada cuando no coinciden:

- `basta-civic-intelligence/v1` y su fuente
  `basta-civic-aggregate/v1`;
- principios de apoyo a decisiones, no ranking y deliberación humana;
- tipos, rangos y no-negatividad de conteos y porcentajes;
- fechas, períodos y precisiones públicas permitidas;
- forma de categorías, prioridades, límites y oportunidades;
- autoridad no vinculante del informe.

Una oportunidad agregada sólo se acepta si trae una etiqueta territorial
pública no vacía y una precisión permitida. Categoría sin territorio no produce
una tarjeta. Incluso una oportunidad válida es sólo informativa: no abre
Conectar porque el agregado no entrega filas, identidades ni compatibilidad
privada. Distancia, cantidad, vigencia y consentimiento siguen requiriendo
confirmación humana.

Los estados de red son explícitos y no destructivos:

| Estado | Consecuencia |
| --- | --- |
| no configurada | no ofrece un reintento inútil; conserva acceso local |
| sin conexión | permite reintentar o volver a la fuente local |
| contrato inválido | no muestra ningún valor no verificado |
| indisponible o limitado | explica la espera y mantiene intacto lo local |
| listo | muestra únicamente la copia saneada del contrato |

Los únicos CTAs de la lectura pública son acciones cuya validez es comprobable:
actualizar esa misma fuente, reintentar una consulta posible o volver a la
lectura local. Las prioridades y oportunidades agregadas muestran próximos
pasos como texto, no como botones que podrían desembocar en una cola local sin
los registros correspondientes.

## Inclusión y exclusión

- Calidad y vigencia usan hechos de campo publicados (`queued`, `synced`,
  `needs_review`, `corroborated`, `stale`, `unsafe`).
- Las derivaciones de escucha (`escucha-v1`) no entran como hechos verificables:
  sueños, propuestas y necesidades expresadas no se convierten en “verdad” por
  corroboración de campo.
- Borradores y registros retirados no integran los indicadores operativos. Sus
  conteos quedan explícitos en el reporte puro para poder auditar la exclusión.
- Una necesidad está abierta mientras requiere respuesta; `draft`, `resolved` y
  `withdrawn` no se mezclan con ese conjunto.
- Sólo recursos `available` se cuentan como capacidad disponible.
- La cola de corroboración de la pantalla usa únicamente señales remotas que
  esta instalación puede mirar sin auto-verificarse.

## Denominadores

Cada razón visual muestra numerador y denominador. Si la base vale cero, la UI
dice “Sin denominador” y no dibuja un 0% ficticio.

| Lectura | Numerador | Denominador |
| --- | --- | --- |
| Corroboración | señales corroboradas | hechos de campo vigentes en el circuito analítico |
| Vigencia | hechos que no están vencidos | hechos de campo en el circuito analítico |
| Resolución | necesidades resueltas | necesidades abiertas + resueltas |
| Cobertura | celdas recorridas | celdas planificadas en misiones no archivadas |

Una celda se considera recorrida cuando está `observed`, `contested`,
`corroborated` o `stale`. `assigned` no equivale a una visita. La cobertura
mide cumplimiento del plan de trabajo, no porcentaje de habitantes ni
prevalencia de un problema. Señales fuera de las misiones quedan identificadas
como casos sin denominador territorial.

## Necesidades y recursos

El balance agrupa por categoría y usa una única escala visual para todas las
filas. `potentialBridges = min(necesidades abiertas, recursos disponibles)` es
un techo categórico, no una coincidencia individual. Antes de proponer un
puente, Conectar debe confirmar distancia, cantidad, vigencia, seguridad y
consentimiento.

## Prioridades explicables

No se muestra un “puntaje de importancia” sintético. Las reglas tienen un orden
lexicográfico fijo:

1. posible daño o exposición;
2. corroboración independiente pendiente;
3. pérdida de vigencia;
4. falta o incompletitud del denominador territorial;
5. seguimiento de puentes ya abiertos;
6. oportunidades categóricas de conexión;
7. necesidades sin capacidad registrada.

Dentro de cada nivel se ordena por volumen pendiente y luego alfabéticamente.
Cada tarjeta explica el dato que activó la regla y lleva a la herramienta que
puede actuar. Una marca de seguridad no ofrece acción automática: exige
custodia humana.

## Límites de representatividad

La pantalla conserva siempre estas advertencias:

- registros no equivalen a personas únicas, votos ni población;
- ausencia de registros no equivale a ausencia de problemas;
- la participación puede concentrarse donde hay más acceso y organización;
- celdas superpuestas pueden contar una zona en más de una misión;
- los casos fuera de misión no permiten estimar cobertura;
- prioridades organizan trabajo, pero no asignan derechos, presupuesto ni
  mandato vinculante.

## Lectura móvil y accesibilidad

- Las barras son redundantes con etiquetas y conteos visibles: el color nunca
  porta significado por sí solo.
- Las tarjetas de razón exponen una frase accesible completa con numerador,
  denominador, porcentaje y observaciones.
- La comparación por categoría evita ejes diminutos u horizontales: se lee en
  una columna de ancho móvil y conserva una escala común.
- Corroborar, Conectar y Misiones tienen accesos directos con el trabajo
  pendiente visible.
- El estado vacío explica que no hay base suficiente y ofrece iniciar escucha o
  misión sin inventar indicadores.

## Verificación

La lógica de `src/civic/analytics.ts` es pura y determinista. Sus pruebas cubren
vacío honesto, exclusiones, calidad/vigencia, resolución, denominador de
cobertura, prioridad de seguridad y límites de las oportunidades categóricas.

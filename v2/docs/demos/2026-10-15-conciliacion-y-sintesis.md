# Conciliar territorios y preparar una síntesis

## Recorrido

1. En `/fuentes`, entrar a **Conciliar territorios y Censo 2022**. Elegir unidad y provincia; revisar diferencias, registros residuales y unidades sin geometría. El informe usa el catálogo de la base conectada y no altera sus filas.
2. Abrir los originales o el nomenclador descargable. Se conservaron las cuatro planillas del INDEC con su SHA-256 y fila de procedencia. Coincidencia de códigos no significa equivalencia de límites.
3. En `/vision-compartida`, entrar a la síntesis. `/sintesis-nacional/nueva` permite seleccionar hasta doce objetivos, documentar alcance, selección, método, ausencias y próxima revisión. Para cada objetivo se explicitan variantes, recursos, alternativas, tensiones y tarea.
4. Elegir qué sostiene cada lectura: propuesta, acuerdos del proceso o resultado de campo revisado. El servidor comprueba la versión de la ficha, permisos de edición y disponibilidad de los apoyos. Los hechos requieren un resultado revisado por otra cuenta. La categoría no transforma el futuro deseado en un hecho logrado.
5. Guardar y compartir el enlace con otra persona editora de todas las fichas seleccionadas. Puede incorporarse mediante las invitaciones existentes de cada ficha. Los borradores son visibles para esos equipos. El autor no puede confirmar su propia revisión.
6. La segunda persona revisa y confirma. Se publica la edición con autor, revisor, fechas, fuentes, versiones y criterio. Puede descargarse como JSON citable; antes de descargar se consulta nuevamente su vigencia.
7. Retirar un argumento o resultado, cambiar una ficha o una unidad citada: la edición conserva su identidad, pero oculta texto editorial y apoyos. Autor o revisor también pueden retirar directamente la edición. Los archivos ya descargados no son revocables.
8. Para corregir contenido vigente, preparar otra edición enlazada a la anterior. Si el texto anterior quedó oculto, reconstruir la lectura desde las fichas actuales: no se recupera automáticamente una copia sensible.

## Ejemplos y escenarios

`/sintesis-nacional/ejemplo` presenta agua en casa, viaje a la escuela y acceso a turnos. Son situaciones ficticias; no se insertan participantes ni resultados en el corpus.

En una alternativa de una ficha se puede explorar disponibilidad: comparar la situación de referencia con la propuesta mediante horas de equipo, actividades y plazas. El ejemplo tiene valores inventados; una alternativa real empieza vacía. No calcula calidad, accesibilidad, equidad ni impacto. Al editar un supuesto, se invalida el resultado visible hasta calcular nuevamente.

## Datos y operación

Nomenclador `indec-c2022-codigos-20261015-r1`: 24 jurisdicciones, 529 departamentos, 2.315 registros de gobiernos locales (incluye categorías residuales) y 4.023 localidades. Fuente: documentación oficial del Censo 2022 en REDATAM, consultada el 15/10/2026. Los archivos de jurisdicciones, departamentos y localidades declaran actualización 22/10/2025; no se los presenta como un relevamiento territorial de 2026.

Regeneración sin red ni base de datos:

```sh
python3 scripts/build/censo/extraer.py apps/web/public/geo/censo/indec-c2022-codigos-20261015-r1
```

Requiere solo Python estándar. Valida códigos, duplicados y pertenencias antes de escribir; se niega a reemplazar una edición diferente. Activa el archivo derivado por reemplazo atómico. Una fuente nueva exige otra edición y revisión de sus diferencias; no se cambia el identificador para disimular una modificación. El importador IGN actualiza también su índice de códigos dentro del grupo de archivos con rollback.

Migración aditiva `0039_sintesis_nacional`, probada en Postgres temporal local. No aplicada a producción. La API y la web deben desplegarse con la misma edición de datos. El piloto con interlocutores reales, la comparación espacial entre límites y los radios/áreas habitadas siguen pendientes; este recorrido comprueba herramientas, no resultados nacionales reales.

## Verificación de la entrega

`pnpm verify` aprobado contra dos bases temporales de Postgres local: 3.411 pruebas aprobadas y 20 omisiones preexistentes, más lint, tipos, comprobación de contenido y compilación web/API. La aplicación nativa conserva 342 pruebas aprobadas y su comprobación de tipos pasa. Tres recorridos de Playwright aprobados con API simulada y red externa bloqueada: fuentes, conciliación y ciclo de síntesis. Incluyen 360, 390, 768 y 1440 píxeles, fallo/recuperación, cambio de cuenta para revisar, descarga JSON y retiro. Las nuevas API se comprueban por separado con Postgres real, incluida concurrencia y cambio de unidad territorial. Capturas de teléfono revisadas visualmente.

La vista de síntesis comprueba vigencia al montarse, recuperar foco y cada treinta segundos mientras está abierta; una consulta fallida oculta el contenido conservado en memoria. La descarga hace una consulta nueva. Esto no permite retirar copias que alguien ya descargó.

Las intermitencias previas de infraestructura están registradas en D-129. La última corrida completa pasó con dos procesos por paquete y el servidor HTTP persistente en la suite de adhesiones; no se considera identificada la causa general de los fallos anteriores.

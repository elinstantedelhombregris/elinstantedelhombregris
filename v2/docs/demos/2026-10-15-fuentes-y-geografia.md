# Fuentes y geografía: recorrido comprobable

1. Abrí `/fuentes`. Encontrás cuatro indicadores del Censo 2022, en dos temas: servicios básicos y conectividad. Leé el universo antes de comparar: son personas en viviendas particulares, a escala nacional; no hogares ni una medición actual del barrio.
2. Abrí «Comprobar en INDEC · página 9». La edición consultada reemplazó el archivo original el 27/9/2024. La huella del PDF permite distinguirlo si el organismo vuelve a corregir la misma URL. La página explica que contrastar procedencia y transcripción no constituye auditoría estadística independiente.
3. Usá «Enlace a esta edición» o descargá la selección JSON. Las ediciones anteriores permanecen en el catálogo cuando se publica una nueva.
4. En una ficha propia, abrí «Evidencia y objetivos», editá y elegí «Agregar desde el catálogo». Incorporar no publica todavía. El dato conserva alcance nacional; después publicá la revisión del cuaderno. Para modificar la fuente, elegí «Desvincular para adaptar»: pierde la referencia contrastada. El servidor también rechaza alterar valor, fecha o territorio conservando esa referencia.
5. Ejemplo de uso: el dato nacional de agua ayuda a formular una pregunta local. Una tarea de escucha puede documentar horarios de cortes y zonas afectadas. Su resumen autorizado vuelve a la ficha como evidencia local separada; no convierte el porcentaje nacional en una medición del barrio.
6. En «Qué geografía usa el mapa», consultá edición, fecha, controles, límites y archivos descargables. Provincias, departamentos y municipios se identifican por código dentro de esa versión. La correspondencia municipal con el catálogo operativo sigue pendiente. No se habilita análisis municipal o departamental a partir de esta descarga.
7. «Imaginar mi Argentina» abre tres preguntas dentro del mapa: futuro deseado, obstáculos y aporte posible. La cabecera explica el recorrido. Al cerrar el panel se recupera la vista de exploración; se conservan los mecanismos de borrador y contexto territorial existentes.

## Actualización editorial, fuera del servidor público

Las herramientas preparan archivos del repositorio para revisión y despliegue conjunto. No modifican Postgres ni actualizan automáticamente un sitio ya publicado.

```sh
# Importar una selección cuyos valores y metadatos ya fueron contrastados.
# El original debe coincidir con archivoSha256 del candidato.
pnpm fuentes:importar -- --candidato=/ruta/seleccion.json --original=/ruta/publicacion.pdf

# Conservar y validar una salida geográfica existente.
pnpm geo:versionar -- --fuente=/ruta/capas --obtenida=2026-09-22

# Descargar y procesar una nueva fuente IGN con fecha de obtención explícita.
pnpm geo:ign -- --fuente=/ruta/crudos --bajar --obtenida=AAAA-MM-DD
```

Las herramientas conservan versiones y escriben intentos en `apps/web/public/{fuentes,geo}/intentos/` y el estado más reciente en `ultimo-intento.json`. Un error no reemplaza el catálogo activo; una falla de capa conserva también el resolvedor provincial. Los archivos originales grandes quedan fuera del repositorio: conservá una copia de trabajo y comprobá su huella antes de revisar una nueva selección.

Después revisá el diff, ejecutá la verificación aislada y desplegá web y API como una edición. No ejecutes el importador sobre los archivos de un servidor en uso. Un proceso terminado abruptamente puede dejar un archivo `.importacion.lock`; comprobá que no hay otro importador ejecutándose antes de retirarlo. Los GeoJSON sin versión se conservan por compatibilidad; el mapa y la simulación ya consumen las rutas de la edición declarada.

## Pendientes que esta entrega no acredita

Conciliar códigos departamentales/municipales con el catálogo operativo; incorporar radios censales y áreas habitadas con su edición; comprobar equivalencias entre censos; realizar el piloto con participantes; revisar una síntesis por objetivos; exportar el documento citable con propagación de retiros; conectar escenarios a evidencia revisada. La app nativa conserva pendiente su comprobación física y la configuración de despliegue.

## Comprobación local

`pnpm verify`: 3.384 pruebas aprobadas; 20 omisiones existentes. App nativa: tipos y 342 pruebas aprobados. Navegador: recorrido de fuentes, cita de edición, enlaces geográficos y menú aprobado en cuatro anchos (360, 390, 768 y 1440 px), sin llamadas a la API real. La prueba de importación incompleta conserva la edición anterior; la prueba HTTP rechaza atribuir a un municipio el dato nacional conservando la referencia contrastada.

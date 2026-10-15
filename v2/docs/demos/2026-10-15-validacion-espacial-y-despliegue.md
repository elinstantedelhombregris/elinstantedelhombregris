# Límites comprobables y esquema puesto en servicio

## Recorrido

1. Abrí `/validacion-espacial`, desde Fuentes, Conciliación o la procedencia de la
   lectura del mapa. El primer filtro muestra polígonos inválidos.
2. Buscá un nombre o código. Capa y tipo de control permiten distinguir un
   polígono inválido, una superposición, una diferencia de pertenencia o un control
   que no pudo calcularse. Cada cambio de filtro vuelve a la primera página.
3. Consultá el método y descargá el JSON íntegro. La página comprueba su huella
   SHA-256 y la edición de los tres archivos antes de mostrar resultados.
4. Para una ficha sobre agua, documentá el hallazgo en la fuente y dejá pendiente
   el cálculo territorial hasta conseguir límites adecuados. No deduzcas población
   de estas áreas ni de una coincidencia de código.

## Resultado del 15/10/2026

Edición `ign-20260922-eff8b13b48b0`, obtenida el 22/9, sin reemplazar archivos:

| Capa | Rasgos | Polígonos inválidos |
| --- | ---: | ---: |
| Provincias | 24 | 1 |
| Departamentos | 528 | 5 |
| Municipios | 2.113 | 5 |

Además: 29 pares con superposición, 726 diferencias de pertenencia provincial,
20 diferencias de cobertura departamental, diez geometrías municipales sin código
y 283 controles no calculables. Son 1.079 observaciones/controles pendientes, no
1.079 errores legales ni personas sin cobertura. El umbral de 1 m² solo descarta
ruido numérico. Las áreas son aproximaciones en Albers equivalente; la
simplificación separada de las capas puede producir diferencias.

Los 11 casos inválidos quedan en D-131. No se repararon automáticamente. La
homologación espacial con el Censo 2022, la comparabilidad temporal, radios y áreas
habitadas continúan pendientes. El INDEC describe sus departamentos como unidades
estadísticas con límites usados por las direcciones provinciales; no basta que el
código sea igual al IGN: [metadatos primarios](https://geonode.indec.gob.ar/layers/geonode_data%3Ageonode%3Adepartamentos).

## Reproducir y publicar el informe

Desde `v2/`, Python 3.11 y un entorno aislado:

```sh
python3.11 -m venv /private/tmp/vision-geo-venv
/private/tmp/vision-geo-venv/bin/pip install -r scripts/build/geo/requirements.txt
/private/tmp/vision-geo-venv/bin/python -m unittest discover -s scripts/build/geo -p 'test_*.py'
/private/tmp/vision-geo-venv/bin/python scripts/build/geo/auditar_espacio.py \
  apps/web/public/geo/versiones/ign-20260922-eff8b13b48b0 \
  --salida=/private/tmp/nuevo-informe-espacial.json
node --import tsx scripts/build/geo/publicar-auditoria.ts \
  --informe=/private/tmp/nuevo-informe-espacial.json
```

La salida exige archivo nuevo, se archiva por huella y el puntero activo se
actualiza atómicamente. Si cambia la cartografía, la interfaz deja de mostrar el
informe viejo como vigente. Las pruebas comprueban las huellas de los archivos.

Para importar una edición nueva, fijá `GEO_PYTHON` al Python del entorno aislado.
`publicarGeografia` comprueba todos los polígonos antes de cualquier activación.
Sin motor, con polígonos inválidos o ante un error, conserva la edición anterior.
Este control de entrada no certifica equivalencia entre capas; hay que generar y
revisar el informe completo para la nueva edición.

Método: [Shapely / validez](https://shapely.readthedocs.io/en/stable/reference/shapely.is_valid_reason.html)
y [transformación y orden de coordenadas](https://shapely.readthedocs.io/en/stable/manual.html#shapely.ops.transform).

## Despliegue de 0039

Se aplicaron **0032 a 0039** en el proyecto v2 `cool-bird-63087148`, host directo
`ep-flat-art-ajjmw0zc.c-3.us-east-2.aws.neon.tech`, base `neondb`.

- El diario anterior tenía 29 entradas, hasta 0031, sin divergencias de huellas.
- Respaldo privado de 5.232.272 bytes, restaurado con éxito en PostgreSQL local
  descartable. SHA-256:
  `ed707884cace7f4d927a70a7e6935394cfe67de255658cd88a6795fa44d5adcb`.
- El ensayo aplicó las ocho migraciones y comprobó un segundo intento idempotente.
- Aplicación con conexión TLS verificada, candado y transacción de Drizzle. La
  comprobación final del 15/10 a las 21:51 UTC encontró 37 entradas del diario,
  cero migraciones pendientes, las 13 columnas y siete restricciones de
  `sintesis_nacionales`, cero síntesis y cero contadores de iniciativas divergentes.
- La primera comprobación auxiliar esperaba erróneamente 14 columnas; se corrigió
  a la lista exacta de las 13 declaradas en 0039 y se repitió solo la lectura.
  La migración ya había finalizado correctamente y no se reescribió el esquema.
- Respaldo, inventario y comprobación privados en
  `v2/.operations/2026-10-15-migracion-0039/` (fuera de Git y del sitio).

El comando de migración dejó de cargar `.env`. Para futuras operaciones hay que
inyectar explícitamente la conexión en `DATABASE_URL_UNPOOLED`. En remoto exige
`--remoto=<host v2> --hasta=<última migración revisada>` y `--comprobar` para leer o
`--aplicar` para escribir. Rechaza otros destinos y diarios divergentes. Los
scripts antiguos de siembra todavía se registran en D-122.

Este despliegue es del esquema. La nueva web/API sigue siendo una entrega del
repositorio; no se hizo push a `main`, ni publicación Vercel, ni distribución nativa.

## Verificación final

`pnpm verify` aprobado con dos bases locales descartables: 3.419 pruebas aprobadas,
20 omisiones preexistentes, lint, tipos y compilación web/API correctos. Seis
pruebas Python comprueban geometrías adversas y reproducen los hallazgos archivados.
Cinco recorridos Playwright aprobados: informe, archivo alterado, Fuentes,
Conciliación y circuito de síntesis; anchos 360, 390, 768 y 1440 sin desborde.
Tipos de la app nativa aprobados. Total de pruebas ejecutadas aprobadas: 3.430.

La primera corrida completa encontró la intermitencia HTTP de D-129 en gestión de
iniciativas; la suite pasó al servidor persistente ya usado en otras suites y la
segunda corrida completa pasó. No se relajaron aserciones ni se agregaron reintentos.

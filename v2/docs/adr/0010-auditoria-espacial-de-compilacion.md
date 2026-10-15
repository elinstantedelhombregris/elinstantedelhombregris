# ADR 0010 — Motor de auditoría espacial fuera del producto

Estado: aceptada, 15/10/2026.

Los controles de anillos y códigos no detectan auto-intersecciones, huecos ni
solapamientos entre capas. Implementar un motor de geometría casero añadiría una
fuente de errores a un producto que necesita mostrar el alcance real de sus datos.

Se usa Shapely 2.1.2 (GEOS) y pyproj 3.7.2 (PROJ) en un entorno Python aislado de
compilación. Versiones fijadas en `scripts/build/geo/requirements.txt`. No son
dependencias de la web, la API ni la app nativa. La salida es JSON versionado y
verificable contra las huellas de los GeoJSON; no agrega trabajo geométrico al
navegador. No se ejecutan reparaciones automáticas de la fuente.

La proyección equivalente Albers para el marco continental permite comparar
áreas aproximadas en metros cuadrados. El informe publica parámetros, umbral y
exclusiones. No sustituye una delimitación legal ni una homologación censal.

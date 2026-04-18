# Expansión de la mini novela "Imaginá Qué Pasaría"

**Fecha:** 2026-04-17
**Ámbito:** `client/src/pages/UnaRutaParaArgentina.tsx` — sección `#imagina` (líneas 519-660)

## Problema

La mini novela actual tiene 3-4 `NarratorBlock` por capítulo. Se lee como una colección de frases sueltas, no como una narración. No muestra cómo la gente empezó a usar las herramientas (El Mapa, Mandato Vivo, Paneles Ciudadanos) ni cómo el cambio se propagó. Falta el pilar central del movimiento: el cambio en la forma de ser de las personas.

## Principios del rediseño

1. **El motor del cambio es humano, no institucional.** El seed no es una empresa — es una persona que deja de esperar. Sin referencias a Empresas Bastardas, aseguradoras cooperativas ni otros mecanismos económicos.
2. **Arranque con incredulidad.** 135 años de fracaso como sentido común. El cinismo como sabiduría popular. El cambio entra por la grieta del "algunos probaron".
3. **Los 22 planes son consolidación de señales ciudadanas.** PLANAGUA nace de 300 mil vecinos marcando pozos. PLANEDU de maestros y pibes. No se diseñan desde arriba — se consolidan desde abajo.
4. **Uplifting con fricción.** Los problemas aparecen pero se resuelven rápido por la misma comunidad. Admitir errores se muestra como fortaleza exportable. Ningún capítulo se oscurece.
5. **Zoom in / zoom out.** Viñetas íntimas (una maestra en Tafí, un jubilado en Caballito) alternadas con panoramas (36 mil personas, 3 mil barrios, 100 mil Paneles). Escala por acumulación.
6. **Fuego al principio, institución después.** Cap 1-2 compactos (2026-2027, un año cada uno). Cap 4-5 con más espacio (5+ años cada uno) para construcción institucional y reverbero global.
7. **Cierre emocional por capítulo.** No cliffhanger. Una frase que resuene y que quede. La gente habla distinto. Alguien dijo "nos está saliendo bien" y nadie se rió. Una escuela de Senegal escribe a Humahuaca.

## Arco por capítulo

### Cap 1 — La Semilla (2026)
- **Epígrafe:** "Dejar de esperar — ese fue el verbo que faltaba."
- **Tono:** incredulidad al comienzo → actos mínimos dispersos → contagio sin coordinación
- **Escenas ancla:** maestra jubilada en Tafí marca un pozo en El Mapa / jubilado en Caballito sube una señal / pibe en Resistencia escribe una propuesta
- **Cierre:** "La herramienta no cambió a la gente. La gente cambió cuando se animó a usarla."
- **Bloques:** ~14

### Cap 2 — La Prueba (2026-2027)
- **Epígrafe:** "Gobernar no es mandar. Gobernar es escuchar."
- **Tono:** un pueblo pequeño se anima, se ríen de él, el pueblo funciona, contagio a 4 → 40 → 400 → 1.200 municipios
- **Escenas ancla:** maestra jubilada propone solución al agua / intendente resistente llora en un Panel / concejal inflando señales detectado en 3 días
- **Cierre:** "El idioma cambió primero. Y cuando el idioma de un país cambia, todo lo demás termina cediendo."
- **Bloques:** ~18

### Cap 3 — La Circunscripción (2027-2029)
- **Epígrafe:** "No fue un partido. Fue una forma de vivir que se expandió."
- **Tono:** primera provincia, escepticismo vuelve amplificado, Diseño Idealizado escrito por miles, PLANAGUA/PLANEDU/PLANSAL emergen desde las señales
- **Escenas ancla:** 3 mil barrios usando El Mapa / narco intentando capturar Panel detectado en 48h / intendente comprando señales expulsado por asamblea / periodista alemán
- **Cierre:** "Nos está saliendo bien — y nadie se rió."
- **Bloques:** ~18

### Cap 4 — La Cabecera de Puente (2029-2034)
- **Epígrafe:** "Veintidós planes. Un organismo vivo, hecho por millones de manos."
- **Tono:** elecciones nacionales, vecinos-legisladores, 22 planes articulados, legitimidad vive en los barrios, primeros países extranjeros adaptan
- **Escenas ancla:** fotografía del Congreso como fotografía del país / sabotaje técnico-legal que falla / Brasil, México, España, Filipinas, Nigeria adaptando sus versiones / escuela de Senegal escribe a escuela de Humahuaca
- **Cierre:** la maestra lee en voz alta, una nena pregunta "¿Podemos contestar?"
- **Bloques:** ~20
- **Corrección factual:** cambiar "16 planes" a "22 planes" (verificado contra `shared/strategic-initiatives.ts`)

### Cap 5 — La Ejecución (2034-2040+)
- **Epígrafe:** "La crisis llegó. Pero esta vez el pueblo ya no esperaba."
- **Tono:** crisis cíclica, 72h de despliegue, Paneles coordinan asistencia, errores admitidos en público como fortaleza exportable, reverbero global
- **Escenas ancla:** Rosario redirigiendo alimentos / Jujuy coordinando con altiplano / villas y countries en mismos Paneles / adultos mayores quedaron afuera 5 días (error admitido) / Grecia, Chile, Túnez copiando protocolo / chico de 14 en Córdoba a tío en Madrid
- **Cierre:** "le dimos permiso al mundo entero para que también pudiera."
- **Bloques:** ~22

## Cambios estructurales
- Reemplazar íntegramente las 5 `CinematicChapter` (líneas 546-657 del archivo).
- Mantener: paletas, índices, componentes (`ChapterTitle`, `NarratorBlock`).
- Actualizar fechas en `subtitle` de cada capítulo.
- Actualizar epígrafes.
- Expandir `NarratorBlock`s según arco arriba.

## Verificación
- `npm run check` debe pasar (sólo cambia contenido JSX dentro de strings).
- `npm run check:routes` no afectado.
- No hay cambios de componentes ni props — el cambio es 100% contenido.

# F · Guía del sistema (PDF)

> Informe de subagente (Sonnet), 2026-10-09, rama `codex/argentina-ideal`. Citas verificadas por muestreo; el resto es su lectura.

**Veredicto:** la maquetación es sólida y ordenada. El texto es denso, abstracto y suena a IA. Además quedó desactualizado: dice «propuesta» sobre cosas que la web ya tiene. Revisé las 47 páginas como imagen y el texto extraído.

## 1. Qué es
Guía de diseño v2.0 del 8/10/2026, «Mi Argentina ideal», de 47 páginas A4. Está escrita para el equipo de producto y diseño: propone la entrada ciudadana, el análisis (PCA, K-means, convergencia), las campañas, la memoria y el orden de construcción. Estructura, según el índice de la p.3:
- Portada (p.1) y lectura rápida (pp.2–3).
- Propósito, PLANes y diseño idealizado (pp.4–7).
- Experiencia, privacidad y datos (pp.8–13).
- Algoritmos y límites (pp.14–19).
- Mapa, visión, alternativas y memoria (pp.20–26).
- Campañas (pp.27–35).
- Comunidad, gobernanza y arquitectura (pp.36–39).
- Entregas, piloto y glosario (pp.40–42).
- Referencias S01–S24 y L01–L12 (pp.43–47).

## 2. Copy
| p. | Texto actual | Problema | Propuesta |
|---|---|---|---|
| 2 | «No se cambiaron las páginas de la plataforma» | Desactualizado: el commit `4c3bf2bb` (22:10) implementó /imaginar, campañas, fichas y Mi espacio. El PDF es de las 15:27. | Fechar el estado y marcar qué ya existe. |
| 9 | «El contrato actual de señales es público y no ofrece por sí solo este recorrido privado» | Mismo problema: la web ya tiene Borradores, Revisión y Asistencia. | Reescribir contra el código. Lo mismo vale para «capas a construir» (p.39). |
| 4 | «La calidad de vida orienta la arquitectura del sistema.» | Abstracto, suena a eslogan. | «Armamos el sistema a partir de cómo vive la gente.» |
| 4 | «PROMESA CENTRAL… más claridad, conexión y capacidad de actuar» | Tríada, y «promesa» suena a compromiso. | «Qué tiene que pasar: que cada persona sepa qué hicimos con lo que contó.» |
| 47 | «Imaginar con libertad, devolver con fidelidad y aprender de las correcciones.» | Tríada que cierra como eslogan. | Cerrar con la acción concreta: probar la entrada y escribir el contrato de una campaña. |
| 24, 29, 36, 42 | «Aprender. Diseñar. Experimentar. Analizar.» | Casi todos los títulos son antítesis o tríadas. | Títulos que digan el contenido: «Las cuatro etapas del ciclo». |
| 39 | «Una tabla o un contrato no demuestra una función completa. Un comentario histórico no prueba…» | La fórmula «no demuestra/prueba/certifica» aparece unas 15 veces. | «Que exista una tabla no alcanza: probalo en un entorno de prueba.» |
| 21 | «Un grafo bonito no demuestra efectos nacionales.» | Aforismo. | «El gráfico muestra relaciones posibles; no mide efectos.» |
| 19 | «Tampoco comparar posiciones de gráficos recalculados sin alinear y evaluar las proyecciones.» | Mal construida. | «No compares posiciones entre gráficos recalculados sin alinearlos antes.» |
| 5 | «Las cinco misiones y los tramos de ejecución simplifican coordinación.» | Falta el artículo y las «cinco misiones» no se explican. | «…sirven para coordinar; no limitan lo que se puede imaginar.» |
| 41 | «La métrica norte añade condiciones deseadas… conserva la resolución confirmada de necesidades sin exposición.» | Opaco. | Partir en dos frases y decir qué se mide. |
| 10 | «Un valor puede orientar una condición deseada sin convertirse en un punto geográfico.» | Alude al tipo `valor`, que ya no existe, sin decirlo. | «Valor ya no es un tipo de señal: no tiene lugar en el mapa.» |
| 2 | «Estas otras voces se relacionan, si existen y si autorizaron publicarlas.» | Enredada. | «Si hay otras voces parecidas y sus autores las publicaron, te las mostramos.» |
| 14–17 | «PC1: 30.6 %», «0.410» frente a «0,134» | Separador decimal mezclado. | Coma en todo el documento. |
| 35, refs | «-por ejemplo…-», «04-07», «Abrir fuente - …» | Guion donde va raya o semirraya. | Usar — y –. |
| 8 | «Texto / audio / aporte asistido», botón «CONTINUAR» | La web no tiene audio y dice «Seguir imaginando» o «Revisar lo que voy a compartir». | Copiar los textos reales. |
| 8, 11 y 27, 31 | «asistido» | Significa IA en unas páginas y acompañamiento humano en otras. | Separar «lectura asistida por IA» de «encuentro con facilitador». |
| 20 | «La spec de septiembre…» | Jerga interna. Lo mismo pasa con «grafo», «gemelo nacional» y «adaptador». | Explicar o sacar. El glosario (p.42) no define PCA, silueta ni exposición. |
| 25, 28, 36 | «CRECIMIENTO CON PROPÓSITO», «PERMANENCIA HUMANA» | Rótulos abstractos. | «Cómo medir si se difunde», «Cuánto pedirle a la gente». |

## 3. Diseño y maquetación
- **Las negritas no salen.** Los dos TTF de Archivo comparten el nombre PostScript `ArchivoSemiBold-Regular`, y `pdffonts` lista una sola Archivo. Los títulos de tarjetas (p.2), los `<b>` de los recuadros y los IDs de referencias salen en peso regular. La jerarquía queda plana.
- **Tamaños chicos para imprimir.** Notas de 8,5 pt, pie y «FUENTES» en mono de 7,2 pt, cabeceras de tabla de 8,1 pt.
- **Contraste.** El gris atenuado da 4,97:1, justo para AA. El sello rojo de la portada da 3,48:1 con 8,6 pt y no llega a 4,5.
- **Densidad despareja.** Las pp.2, 16, 25, 26 y 39 dejan unos 91–99 pt libres, y las pp.43–46 entre 133 y 147. Las pp.14, 20, 28, 31, 33, 35 y 42 llegan a 1–8 pt del límite de 747.
- **Los colores de los recuadros no siguen una regla.** «LÍMITE DE CONFIANZA» (p.9) es verde y «ALCANCE DEL INDICADOR» (p.17) es ámbar. «PROMESA CENTRAL» es verde y «PROMESA HONESTA» es ámbar. El ámbar #946200 no es el token web #A16C00.
- **p.34.** Violeta y cian tienen 1,38:1 entre sí, difícil para daltonismo. Además, en `lib/vocabulario.ts` violeta es *deseo* y cian es *meta*, que no es lo que significan acá.
- **p.17.** «Grupo A/B/C» y «propuesta A/B» comparten letras. La leyenda está lejos de las barras.
- **Doble numeración sin rótulo.** Los kickers van de 01 a 39 y las páginas de 02 a 47. La p.3 dice «leé 8, 27, 30 y 40», que son páginas. Pero la p.27 lleva el kicker «24 /» y la p.30 el kicker «27 /».
- **Detalles.**
  - Las comillas « » en Anton se leen como «<<» (p.28).
  - En la matriz de la p.12 el «.» de dato faltante casi no se ve.
  - El mapa de la p.20 está aislado de las cinco lentes.
- **Metadatos.** `Tagged: no`, `Creator: anonymous`. El nombre del archivo dice «pais-en-comun», pero el título es «Mi Argentina ideal».
- **Qué flaggea `layout-audit.json`:** nada. Registra el fin de contenido por página y 528 cajas de texto. Verifica 0 glifos fuera de página, 0 caracteres de reemplazo, 21 enlaces, 8 destinos del índice y ningún solapamiento. La única caja fuera del límite es el pie de portada, que es aceptable. No mide contraste, viudas ni fuentes, por eso no vio el defecto de las negritas.

## 4. Terminología vs. web
| PDF | Web (archivo) | ¿Coincide? |
|---|---|---|
| aporte | «Mis aportes» (`MiEspacio.tsx`), «Ubicación de mi aporte» (`Imaginar/Revision.tsx`) | Sí |
| señal | Ruta `/senal/:id` (`Senal.tsx`); la interfaz dice «voz» | Parcial: en el PDF compite con aporte, relato y voz |
| voz | «Tu voz quedó registrada» (`Recibo.tsx`), «La voz que quiero compartir» (`Revision.tsx`) | Parcial |
| relato (18×) | Casi no aparece. Usa «reflexión» («Reflexiones que siguen con vos», `Borradores.tsx`) y «posibilidad» | No |
| campaña, contrato | `Campanas/CamposContrato.tsx` | Sí. El PDF tiene 10 campos y la web 9 |
| proceso | `MisProcesos.tsx` («Los diseños que estás cuidando») | Parcial |
| ficha de futuro | `Fichas.tsx` | Sí |
| Mi espacio | `MiEspacio.tsx` | El PDF no lo nombra (0×) |
| Radiografía | `LaRadiografia.tsx` | El PDF no la nombra (0×), aunque las pp.12–19 tratan su tema |
| «cinco lentes» (Situación…Seguimiento) | El mapa tiene modos: Mapa, Análisis, Línea de tiempo, Cobertura, Simulación (`catalogo-modos.ts`). Las «lentes» de la Radiografía son otras (`lentes.ts`) | No |
| 9 tipos, 4 clases | `civic-core/vocabulario.ts` | Sí |

## 5. Canon
- **Cantidades de PLANes:**
  - p.5: «27 PLANes temáticos y PLANRUTA». La tabla de esa página lista 27 códigos y sí suma 27.
  - p.46 (L02): lo mismo.
  - p.5 (nota): «cinco misiones».
  - p.47: «28 ensayos».
  - `PLAN_REGISTRY.yml` dice `thematic_count: 27` y `total_documents: 28`.
  - La web todavía dice «22 PLANes» en `Bienvenida.tsx:23`, `UnaRutaParaArgentina` («Los 22 PLANs») y el resumen de PLANGEO en `planes-index.generated.ts`. Otras partes usan un `PLAN_COUNT` dinámico.
  - No decido cuál vale.
- **¡BASTA!:** 101 apariciones, todas con ambos signos y ninguna mal. «Papel y Tinta» está bien.
- **Voseo:** hay 0 formas de «tú» o «usted». Hay voseo en pp.1–3, 8, 11 y 27, pero el cuerpo va en infinitivo impersonal, sin un registro único.
- **Hombre Gris:** solo figura en las referencias S18 y S19. No dice «acero».
- **Diseño idealizado:** bien sostenido. «Los PLANes inspiran diseños; sus metas… no se usan como resultados» (p.3), «ejemplos abiertos al examen» (p.5). Ningún PLAN aparece como compromiso. Lo único que roza es «PROMESA CENTRAL» y «PROMESA HONESTA», que rotulan como promesa lo que el propio PDF llama propuesta.

Archivos: `/Users/juanb/Desktop/ElInstantedelHombreGris/output/pdf/basta-pais-en-comun-guia-del-sistema.pdf`, `.../basta-pais-en-comun-source/build_pdf.py` y `.../layout-audit.json`.

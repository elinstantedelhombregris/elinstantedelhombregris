# Deudas del sistema

Registro vivo de deficiencias encontradas. **Se anota cuando se encuentra, no cuando se resuelve** — el punto es que nada se pierda entre una sesión y la siguiente.

Este archivo cubre v1 (`SocialJusticeHub/`) y v2 (`v2/`). Para el diagnóstico general de v1 —god-files, esquemas duplicados, falta de tests— ver [`REPORT_THIS_PROJECT_IS_UTTER_SHIT.md`](REPORT_THIS_PROJECT_IS_UTTER_SHIT.md), que sigue vigente y no se duplica acá.

## Cómo se usa

Cada deuda tiene un id correlativo que no se reusa. Cuando se resuelve, la entrada **no se borra**: se marca resuelta con fecha y commit. Un registro que se vacía pierde la memoria de por qué las cosas están como están.

Formato de una entrada nueva:

```markdown
### D-0NN · Título en una línea

**Dónde:** ruta del archivo o componente
**Encontrada:** AAAA-MM-DD, cómo apareció
**Severidad:** bloqueante | alta | media | baja
**Estado:** abierta

Qué pasa, por qué importa, y qué haría falta para arreglarlo.
```

## Índice

| Id | Deuda | Severidad | Estado |
|---|---|---|---|
| [D-001](#d-001--no-hay-resolución-geográfica-en-el-servidor) | No hay resolución geográfica en el servidor | Bloqueante | **Resuelta** |
| [D-002](#d-002--la-base-de-v2-tiene-12-filas-y-las-12-son-de-demostración) | La base de v2 tiene 12 filas, y las 12 son de demostración | Alta | **Resuelta** |
| [D-003](#d-003--glyphs-y-teselas-del-mapa-salen-de-cdn-de-terceros) | Glyphs y teselas del mapa salen de CDN de terceros | Media | **Resuelta** |
| [D-004](#d-004--falta-la-capa-de-departamentos) | Falta la capa de departamentos | Media | **Resuelta** |
| [D-005](#d-005--falta-la-capa-de-municipios) | Falta la capa de municipios | Media | **Parcial** |
| [D-006](#d-006--las-73-dependencias-entre-planes-viven-solo-en-v1) | Las dependencias entre PLANes viven solo en v1 (ya son 208) | Media | Abierta |
| [D-007](#d-007--dos-majors-de-typesreact-conviven-por-parche-de-pnpm) | Dos majors de `@types/react` conviven por parche de pnpm | Media | Abierta |
| [D-008](#d-008--los-parches-de-dependencias-están-atados-a-versión-exacta) | Los parches de dependencias están atados a versión exacta | Baja | Abierta |
| [D-009](#d-009--tres-planes-del-corpus-fuente-no-están-migrados-a-v2) | Tres PLANes del corpus fuente no están migrados a v2 | Alta | **Resuelta** |
| [D-010](#d-010--sesiones-concurrentes-se-tragan-los-cambios-de-otras) | Sesiones concurrentes se tragan los cambios de otras | Media | Abierta |
| [D-011](#d-011--la-geometría-de-provincias-erra-en-los-bordes) | La geometría de provincias erra en los bordes | Alta | **Resuelta** |
| [D-012](#d-012--el-geojson-usaba-un-nombre-no-canónico-para-caba) | El GeoJSON usaba un nombre no canónico para CABA | Alta | **Resuelta** |
| [D-013](#d-013--el-test-del-corpus-de-planes-tiene-el-total-a-mano-y-se-rompe-cada-vez) | El test del corpus de PLANes tiene el total a mano y se rompe cada vez | Media | Abierta |
| [D-014](#d-014--los-tests-de-integración-ensucian-el-mapa-que-el-sitio-sirve) | Los tests de integración ensucian el mapa que el sitio sirve | Alta | **Resuelta** |
| [D-015](#d-015--las-cifras-del-bloque-de-atracción-de-plansus-no-tenían-fuente-externa--resuelta-parcial) | Las cifras del bloque de atracción de PLANSUS no tenían fuente externa | Media | **Parcial** |
| [D-016](#d-016--este-mismo-archivo-usa-el-id-d-013-dos-veces) | Este mismo archivo usa el id D-013 dos veces | Media | **Resuelta** |
| [D-017](#d-017--plangeo-promete-secciones-interno-que-no-existen) | PLANGEO promete secciones `[INTERNO]` que no existen | Media | Abierta |
| [D-018](#d-018--budget_class-del-registro-no-es-monótono-en-dólares) | `budget_class` del registro no ordena por presupuesto | Media | Abierta |
| [D-019](#d-019--v-fin-05-suma-el-piso-sustitutivo-a-los-pisos-que-sustituye--resuelta) | V-FIN-05 suma el piso sustitutivo a los pisos que sustituye | Media | **Resuelta** |
| [D-020](#d-020--el-conteo-canónico-vive-hardcodeado-en-siete-lugares-y-ninguno-avisa-cuando-queda-viejo--resuelta) | El conteo canónico vive hardcodeado en siete lugares y ninguno avisa cuando queda viejo | Media | **Resuelta** |
| [D-021](#d-021--quedan-conteos-viejos-en-la-prosa-publicada-y-ninguna-guardia-los-mira) | Quedan conteos viejos en la prosa publicada, y ninguna guardia los mira | Baja | **Parcial** |
| [D-022](#d-022--los-cuatro-planes-de-julio-nunca-entraron-a-presupuesto_consolidado_bastamd) | Los cuatro PLANes de julio nunca entraron a `PRESUPUESTO_CONSOLIDADO_BASTA.md` | Media | Abierta |
| [D-023](#d-023--la-sección-9-de-planpuerta-se-pasó-248-palabras-del-techo-y-nadie-lo-vio) | La SECCIÓN 9 de PLANPUERTA se pasó 248 palabras del techo | Baja | Abierta |
| [D-024](#d-024--hay-dos-suites-de-tests-en-el-repo-y-sólo-una-corre-en-ci) | Hay dos suites de tests en el repo y sólo una corre en CI | Media | Abierta |
| [D-028](#d-028--editar-la-portada-de-un-plan-corre-todas-sus-anclas-de-remisión) | Editar la portada de un PLAN corre todas sus anclas de remisión | Media | Abierta |
| [D-032](#d-032--los-ensayos-del-ciclo-i-glosan-planmesa-como-soberanía-alimentaria-y-hace-meses-que-no-lo-es) | Los ensayos del Ciclo I glosan PLANMESA como soberanía alimentaria | Media | Abierta |
| [D-033](#d-033--pnpm-formatcheck-falla-en-564-archivos-preexistentes-scriptscontent-incluido) | `pnpm format:check` falla en 564 archivos preexistentes, `scripts/content/` incluido | Baja | Abierta |
| [D-045](#d-045--platform_feedback-es-una-tabla-muerta-que-modela-lo-contrario-del-canal-de-escucha) | `platform_feedback` es una tabla muerta que modela lo contrario del canal de escucha | Media | Abierta |
| [D-046](#d-046--la-guardia-de-este-mismo-archivo-está-en-rojo-y-nadie-la-corre) | La guardia de este mismo archivo está en rojo y nadie la corre | Alta | **Resuelta** |
| [D-047](#d-047--el-basemap-se-congela-en-la-fecha-en-que-se-extrajo-y-nadie-se-entera) | El basemap se congela en la fecha en que se extrajo y nadie se entera | Baja | Abierta |
| [D-048](#d-048--la-csp-viaja-sólo-en-las-respuestas-de-api-y-nunca-llega-al-documento) | La CSP viaja sólo en las respuestas de `/api/` y nunca llega al documento | Alta | **Resuelta** |
| [D-049](#d-049--las-tipografías-de-la-interfaz-salen-de-google-fonts-en-todas-las-páginas) | Las tipografías de la interfaz salen de Google Fonts en todas las páginas | Media | **Resuelta** |
| [D-050](#d-050--el-borde-del-recorte-de-teselas-se-ve-en-el-agua) | El borde del recorte de teselas se ve en el agua | Baja | Abierta |
| [D-051](#d-051--el-pmtiles-de-12-gb-no-está-publicado-en-ningún-lado) | El `.pmtiles` de 1,2 GB no está publicado en ningún lado | Alta | Abierta |
| [D-052](#d-052--el-37-del-corpus-de-entrenamientos-es-texto-generado-y-repetido) | El 37% del corpus de entrenamientos es texto generado y repetido | Alta | **Resuelta** |
| [D-053](#d-053--el-catálogo-anunciaba-53-horas-de-entrenamiento-y-se-lee-en-16--resuelta) | El catálogo anunciaba 53 horas de entrenamiento y se lee en 16 | Alta | **Resuelta** |
| [D-054](#d-054--la-mitad-de-las-lecciones-está-escrita-en-tuteo-y-no-en-rioplatense) | La mitad de las lecciones está escrita en tuteo, y no en rioplatense | Media | **Resuelta** |
| [D-055](#d-055--contentfile-no-resuelve-en-ninguna-de-las-329-lecciones-y-el-schema-lo-exige) | `contentFile` no resuelve en ninguna de las 329 lecciones, y el schema lo exige | Media | **Resuelta** |
| [D-056](#d-056--ninguna-lección-cita-una-fuente-ni-nombra-un-plan) | Ninguna lección cita una fuente ni nombra un PLAN | Alta | **Resuelta** |
| [D-057](#d-057--la-política-de-privacidad-espera-tres-datos-que-sólo-puede-dar-el-dueño) | La política de privacidad espera tres datos que sólo puede dar el dueño | Media | Abierta |
| [D-058](#d-058--un-cron-que-falla-no-le-avisa-a-nadie-y-ahora-uno-de-ellos-sostiene-una-promesa-legal) | Un cron que falla no le avisa a nadie, y ahora uno de ellos sostiene una promesa legal | Media | Abierta |
| [D-059](#d-059--la-csp-del-documento-necesita-unsafe-inline-en-los-estilos-y-el-hosting-estático-no-deja-sacarlo) | La CSP del documento necesita `'unsafe-inline'` en los estilos, y el hosting estático no deja sacarlo | Baja | Abierta |
| [D-060](#d-060--la-suite-de-integración-de-la-api-no-la-linta-nadie) | La suite de integración de la API no la linta nadie | Baja | Abierta |
| [D-061](#d-061--153-lecciones-usan-encabezados-más-profundos-que-los-dos-que-el-plan-permite) | 153 lecciones usan encabezados más profundos que los dos que el plan permite | Baja | **Resuelta** |
| [D-025](#d-025--tsc-de-la-app-de-campo-está-en-rojo-por-una-fuga-de-typesreact18) | tsc de la app de campo está en rojo por una fuga de @types/react@18 | Baja | **Resuelta** |
| [D-026](#d-026--no-hay-población-por-celda-así-que-el-brillo-del-mapa-no-se-puede-normalizar-todavía) | No hay población por celda, así que el brillo del mapa no se puede normalizar todavía | Media | Abierta |
| [D-027](#d-027--dos-librerías-de-mapa-en-v2-contra-la-regla-de-una-sola-de-cada-cosa) | Dos librerías de mapa en v2, contra la regla de una sola de cada cosa | Media | Abierta |
| [D-029](#d-029--los-paquetes-del-workspace-publican-typescript-así-que-nada-compilado-de-v2-arranca-en-node) | Los paquetes del workspace publican TypeScript, así que nada compilado de v2 arranca en Node | Alta | **Resuelta** |
| [D-030](#d-030--las-misiones-de-relevamiento-y-las-campañas-cívicas-perdieron-su-captura-guiada-por-celda) | Las misiones de relevamiento y las campañas cívicas perdieron su captura guiada por celda | Media | Abierta |
| [D-031](#d-031--cabos-sueltos-menores-del-borrado-del-juego-r2-task-5) | Cabos sueltos menores del borrado del juego (R2 Task 5) | Baja | Abierta |
| [D-062](#d-062--post-apiopen-datadreams-dejaba-que-el-cliente-eligiera-cuánta-protección-quería) | POST /api/open-data/dreams dejaba que el cliente eligiera cuánta protección quería | Alta | **Resuelta** |
| [D-063](#d-063--las-capturas-de-campo-entran-a-la-radiografía-mal-clasificadas) | Las capturas de campo entran a La Radiografía mal clasificadas | Media | Abierta |
| [D-064](#d-064--la-capa-voz-del-mapa-lee-dos-tablas-y-eso-es-transitorio) | La capa voz del mapa lee dos tablas, y eso es transitorio | Baja | Abierta |
| [D-065](#d-065--un-test-de-integración-escribía-en-la-base-real-y-dejó-filas-visibles-en-el-mapa) | Un test de integración escribía en la base real y dejó filas visibles en el mapa | Media | **Resuelta** |
| [D-066](#d-066--engrosado_rechazado-comprobaba-una-de-las-dos-condiciones-de-su-check) | engrosado_rechazado comprobaba una de las dos condiciones de su CHECK | Alta | **Resuelta** |
| [D-067](#d-067--el-recibo-de-un-reintento-describía-la-fila-que-llegó-no-la-guardada) | El recibo de un reintento describía la fila que llegó, no la guardada | Media | **Resuelta** |
| [D-068](#d-068--la-radiografía-leía-una-tabla-retirada-y-los-163-tests-estaban-en-verde) | La Radiografía leía una tabla retirada, y los 163 tests estaban en verde | Alta | **Resuelta** |
| [D-069](#d-069--el-techo-de-adhesiones-por-actor-no-se-ve-en-ninguna-pantalla-y-no-es-el-techo-que-hace-falta) | El techo de adhesiones por actor no se ve en ninguna pantalla, y no es el techo que hace falta | Media | Abierta |
| [D-070](#d-070--el-canon-de-la-señal-vive-en-tres-tablas-que-la-aplicación-puede-escribir) | El canon de la señal vive en tres tablas que la aplicación puede escribir | Media | Abierta |
| [D-071](#d-071--el-techo-de-20-altas-de-actor-por-hora-existe-en-un-comentario-y-en-ninguna-línea-de-código) | El techo de 20 altas de actor por hora existe en un comentario y en ninguna línea de código | Alta | Abierta |
| [D-072](#d-072--dos-cifras-de-la-tabla-del-ejemplo-dejaron-de-decir-nada-y-siguieron-en-pantalla) | Dos cifras de la tabla del ejemplo dejaron de decir nada y siguieron en pantalla | Media | **Resuelta** |
| [D-073](#d-073--brillo-y-nitidez-se-calculan-por-provincia-y-ninguna-pantalla-los-pide) | Brillo y nitidez se calculan por provincia y ninguna pantalla los pide | Media | Abierta |
| [D-074](#d-074--los-relojes-de-vigencia-están-escritos-y-no-los-llama-nadie) | Los relojes de vigencia están escritos y no los llama nadie | Alta | Abierta |
| [D-075](#d-075--una-pregunta-se-puede-cargar-y-no-se-puede-responder) | Una pregunta se puede cargar y no se puede responder | Media | Abierta |
| [D-076](#d-076--el-taller-de-planpuerta-y-su-mdx-dejaron-de-coincidir-y-la-guardia-está-roja-en-el-tronco) | El taller de PLANPUERTA y su `.mdx` dejaron de coincidir, y la guardia está roja en el tronco | Media | **Resuelta** |
| [D-077](#d-077--el-test-del-lector-de-crónica-se-corta-antes-de-la-firma) | El test del lector de crónica se corta antes de la firma | Baja | Abierta |
| [D-078](#d-078--el-mapa-se-desborda-en-móvil-la-barra-de-modos-no-cabe-y-la-página-entera-scrollea-de-costado) | El mapa se desborda en móvil: la barra de modos no cabe y la página entera scrollea de costado | Alta | **Resuelta** |
| [D-079](#d-079--el-sello-ejemplo-pisa-el-título-del-documento-del-mandato-en-móvil) | El sello EJEMPLO pisa el título del documento del mandato en móvil | Media | **Resuelta** |
| [D-080](#d-080--la-portada-dice-0-cinco-veces-y-el-régimen-de-cifras-dice-que-con-cero-se-habla-no-se-numera) | La portada dice «0» cinco veces, y el régimen de cifras dice que con cero se habla, no se numera | Media | **Resuelta** |
| [D-081](#d-081--las-notas-al-pie-de-los-ensayos-se-ven-crudas-basta1) | Las notas al pie de los ensayos se ven crudas | Baja | **Resuelta** |
| [D-082](#d-082--el-lector-de-planes-entrega-68000-palabras-en-una-sola-página-sin-índice-ni-posición) | El lector de PLANes entrega 68.000 palabras en una sola página sin índice ni posición | Media | **Resuelta** |
| [D-083](#d-083--el-instrumento-interpreta-un-fallo-de-consulta-como-ausencia-de-voces) | El instrumento interpreta un fallo de consulta como ausencia de voces | Alta | **Resuelta** |
| [D-084](#d-084--los-modos-analíticos-tratan-una-consulta-limitada-como-el-corpus-completo) | Los modos analíticos tratan una consulta limitada como el corpus completo | Alta | **Resuelta** |
| [D-085](#d-085--el-mandato-presenta-equivalencia-entre-necesidades-y-recursos-sin-comprobar-compatibilidad) | El mandato presenta equivalencia entre necesidades y recursos sin comprobar compatibilidad | Alta | **Resuelta** |
| [D-086](#d-086--el-sello-de-documento-auditado-se-activa-al-entrar-la-firma-en-pantalla) | El sello de documento auditado se activa al entrar la firma en pantalla | Media | **Resuelta** |
| [D-087](#d-087--el-formulario-exige-una-cesión-que-su-consentimiento-presenta-como-opcional) | El formulario exige una cesión que su consentimiento presenta como opcional | Media | **Resuelta** |
| [D-088](#d-088--el-brillo-dibujado-es-invertible-delata-cuánta-gente-habló-en-una-celda) | El brillo dibujado es invertible: delata cuánta gente habló en una celda | Alta | Abierta |
| [D-089](#d-089--el-nivel-departamento-del-modo-análisis-sigue-apagado-aunque-la-geometría-ya-está) | El nivel departamento del modo Análisis sigue apagado aunque la geometría ya está | Media | Abierta |
| [D-090](#d-090--las-voces-resueltas-por-punto-antes-del-cambio-de-geometría-conservan-la-provincia-vieja) | Las voces resueltas por punto antes del cambio de geometría conservan la provincia vieja | Media | Abierta |
| [D-091](#d-091--los-cuerpos-de-las-lecciones-traen-cifras-sin-fuente-e-historias-reales-que-nadie-puede-verificar) | Los cuerpos de las lecciones traen cifras sin fuente e «historias reales» que nadie puede verificar | Alta | **Resuelta** |
| [D-092](#d-092--cinco-planes-afirman-datos-que-sus-fuentes-contradicen) | Cinco PLANes afirman datos que sus fuentes contradicen | Media | **Resuelta** |
| [D-093](#d-093--la-voz-editorial-del-curso-contradice-lo-que-el-curso-enseña) | La voz editorial del curso contradice lo que el curso enseña | Baja | **Resuelta** |
| [D-094](#d-094--entrenamientosminutaje---escribir-reescribe-todo-el-corpus-aunque-cambie-una-lección) | `entrenamientos:minutaje --escribir` reescribe todo el corpus aunque cambie una lección | Baja | **Resuelta** |
| [D-095](#d-095--65-preguntas-de-quiz-se-contestan-sin-haber-leído-la-lección) | 65 preguntas de quiz se contestan sin haber leído la lección | Media | **Resuelta** |
| [D-096](#d-096--en-la-mitad-de-las-preguntas-de-opción-múltiple-la-correcta-es-la-opción-más-larga) | En la mitad de las preguntas de opción múltiple, la correcta es la opción más larga | Media | Abierta |
| [D-102](#d-102--cálculos-y-archivos-de-gran-volumen-necesitan-trabajos-desacoplados) | Cálculos y archivos de gran volumen necesitan trabajos desacoplados | Media | Abierta |
| [D-103](#d-103--la-adaptación-móvil-necesita-verificación-en-dispositivos-físicos) | La adaptación móvil necesita verificación en dispositivos físicos | Media | Abierta |
| [D-104](#d-104--las-pruebas-de-participación-dejan-campañas-y-fichas-públicas-repetidas) | Las pruebas de participación dejan campañas y fichas públicas repetidas | Media | **Resuelta** |
| [D-099](#d-099--datos-abiertos-muestra-un-catálogo-pendiente-y-licencias-distintas-del-contrato-vigente) | Datos Abiertos muestra un catálogo pendiente y licencias distintas del contrato vigente | Media | **Resuelta** |
| [D-100](#d-100--la-autoría-anónima-no-tiene-un-recorrido-de-recuperación-con-cuenta) | La autoría anónima no tiene un recorrido de recuperación con cuenta | Media | **Resuelta** |
| [D-101](#d-101--radiografía-recorta-a-500-señales-y-no-declara-ese-recorte-en-su-contrato-público) | Radiografía recorta a 500 señales y no declara ese recorte en su contrato público | Alta | **Resuelta** |
| [D-097](#d-097--la-convergencia-de-v1-mide-coincidencia-temática-entre-tipos-de-señal) | La convergencia de v1 mide coincidencia temática entre tipos de señal | Alta | Abierta |
| [D-098](#d-098--planpregunta-usa-un-relato-de-visión-2040-como-precedente-que-ya-dio-resultados) | PLANPREGUNTA usa un relato de Visión 2040 como precedente que ya dio resultados | Alta | Abierta |
| [D-105](#d-105--la-app-móvil-no-tiene-las-tres-preguntas-ni-la-elección-de-lugar) | La app móvil no tiene las tres preguntas ni la elección de lugar | Media | Abierta |
| [D-106](#d-106--corregir-un-aporte-con-cesión-registra-la-versión-1-y-un-texto-propio) | Corregir un aporte con cesión registra la versión 1 y un texto propio | Media | Abierta |
| [D-107](#d-107--mi-espacio-no-muestra-los-aportes-de-un-navegador-sin-cuenta) | Mi espacio no muestra los aportes de un navegador sin cuenta | Media | Abierta |
| [D-108](#d-108--ver-y-gestionar-mi-aporte-en-la-app-puede-no-reconocer-la-autoría) | «Ver y gestionar mi aporte» en la app puede no reconocer la autoría | Baja | Abierta |
| [D-109](#d-109--la-app-no-guarda-solo-el-texto-mientras-escribís) | La app no guarda solo el texto mientras escribís | Baja | Abierta |
| [D-110](#d-110--el-recibo-no-puede-decir-si-hay-aportes-parecidos) | El recibo no puede decir si hay aportes parecidos | Baja | Abierta |
| [D-111](#d-111--la-web-compara-textos-literales-con-mensajes-de-la-api) | La web compara textos literales con mensajes de la API | Baja | Abierta |
| [D-112](#d-112--fichas-alternativas-y-pruebas-sin-comparación-ni-autoría-y-una-ficha-no-se-puede-compartir) | Fichas: alternativas y pruebas sin comparación ni autoría, y una ficha no se puede compartir | Media | Abierta |
| [D-113](#d-113--las-campañas-nuevas-tienen-direcciones-ilegibles) | Las campañas nuevas tienen direcciones ilegibles | Baja | Abierta |
| [D-114](#d-114--los-pasos-de-una-campaña-están-escritos-dos-veces) | Los pasos de una campaña están escritos dos veces | Baja | Abierta |
| [D-115](#d-115--en-el-plan-gratuito-de-vercel-un-archivo-grande-solo-avanza-con-la-página-abierta) | En el plan gratuito de Vercel, un archivo grande solo avanza con la página abierta | Baja | Abierta |
| [D-116](#d-116--dos-variables-para-la-dirección-de-la-api-en-la-app) | Dos variables para la dirección de la API en la app | Baja | Abierta |
| [D-117](#d-117--los-códigos-de-respaldo-de-dos-pasos-distinguen-mayúsculas) | Los códigos de respaldo de dos pasos distinguen mayúsculas | Baja | Abierta |
| [D-118](#d-118--páginas-que-siguen-con-el-diseño-viejo-oscuro) | Páginas que siguen con el diseño viejo oscuro | Baja | Abierta |
| [D-119](#d-119--la-guía-pdf-del-sistema-quedó-desactualizada-y-sus-negritas-no-salen) | La guía PDF del sistema quedó desactualizada y sus negritas no salen | Media | Abierta |
| [D-120](#d-120--no-está-verificado-que-los-dos-más-lejanos-de-un-grupo-no-mida-entre-centros-de-provincia) | No está verificado que «los dos más lejanos» de un grupo no mida entre centros de provincia | Baja | Abierta |
| [D-121](#d-121--la-campaña-nacional-todavía-no-existe-en-producción) | La campaña nacional todavía no existe en producción | Alta | Abierta |
| [D-122](#d-122--los-scripts-de-migración-y-siembra-leen-v2env-aunque-se-les-pase-otra-base) | Los scripts de migración y siembra leen `v2/.env` aunque se les pase otra base | Media | Abierta |
| [D-123](#d-123--mi-perfil-sigue-con-la-plantilla-vieja) | Mi perfil sigue con la plantilla vieja | Baja | Abierta |
| [D-124](#d-124--el-sello-de-los-ejemplos-del-mandato-se-lee-poco-de-noche) | El sello de los ejemplos del Mandato se lee poco de noche | Baja | Abierta |
| [D-125](#d-125--la-campaña-de-ejemplo-cuenta-aportes-sintéticos-como-publicados) | La campaña de ejemplo cuenta aportes sintéticos como publicados | Baja | Abierta |
| [D-126](#d-126--cualquier-escritura-en-las-fuentes-invalida-los-archivos-de-exportación-en-preparación) | Cualquier escritura en las fuentes invalida los archivos de exportación en preparación | Media | Abierta |
| [D-127](#d-127--las-pruebas-de-la-siembra-nacional-se-rompen-el-1-de-marzo-de-2027) | Las pruebas de la siembra nacional se rompen el 1 de marzo de 2027 | Media | Abierta |
| [D-128](#d-128--la-lectura-de-diseño-de-una-ficha-conserva-un-límite-fijo-de-cien-alternativas) | La lectura de diseño de una ficha conserva un límite fijo de cien alternativas | Media | Abierta |
| [D-129](#d-129--la-verificación-local-mostró-fallos-intermitentes-fuera-de-los-cambios-nuevos) | La verificación local mostró fallos intermitentes fuera de los cambios nuevos | Baja | Abierta |
| [D-130](#d-130--la-membresía-de-iniciativas-necesita-contadores-atómicos-y-errores-visibles) | La membresía de iniciativas necesita contadores atómicos y errores visibles | Media | Resuelta en código; despliegue pendiente |
| [D-131](#d-131--la-geografía-publicada-contiene-polígonos-inválidos-y-diferencias-entre-capas) | La geografía publicada contiene polígonos inválidos y diferencias entre capas | Alta | Abierta |
| [D-132](#d-132--la-siembra-de-áreas-de-vida-falla-al-repetirse) | La siembra de áreas de vida falla al repetirse | Baja | Abierta |
| [D-133](#d-133--el-enlace-para-preparar-una-síntesis-sin-sesión-lleva-a-una-página-que-no-existe) | El enlace para preparar una síntesis sin sesión lleva a una página que no existe | Baja | **Resuelta** |
| [D-134](#d-134--la-campaña-nacional-hace-tres-preguntas-distintas) | La campaña nacional hace tres preguntas distintas | Media | **Resuelta** |
| [D-135](#d-135--el-mandato-vivo-no-tiene-entrada-desde-el-menú) | El mandato vivo no tiene entrada desde el menú | Media | Abierta |
| [D-136](#d-136--la-lectura-asistida-de-imaginar-manda-el-texto-a-un-proveedor-externo) | La lectura asistida de Imaginar manda el texto a un proveedor externo | Alta | **Resuelta** |
| [D-137](#d-137--una-adhesión-se-puede-dejar-sobre-un-aporte-retirado-o-sobre-el-propio) | Una adhesión se puede dejar sobre un aporte retirado o sobre el propio | Media | Resuelta en código |
| [D-138](#d-138--los-límites-por-ip-pueden-frenar-a-un-aula-entera-en-mirar) | Los límites por IP pueden frenar a un aula entera en Mirar | Media | Mitigada |
| [D-139](#d-139--ver-deja-deducir-por-diferencia-cuántas-personas-hay-en-una-provincia-suprimida) | Ver deja deducir por diferencia cuántas personas hay en una provincia suprimida | Media | Abierta |
| [D-140](#d-140--la-regla-de-qué-aportes-entran-en-mirar-y-en-ver-está-escrita-dos-veces) | La regla de qué aportes entran en Mirar y en Ver está escrita dos veces | Media | **Resuelta** |
| [D-141](#d-141--pnpm-testintegrationlocal----filtro-corre-la-suite-entera) | `pnpm test:integration:local -- <filtro>` corre la suite entera | Baja | Abierta |
| [D-142](#d-142--bordes-de-las-campañas-propuestas) | Bordes de las campañas propuestas | Media | Abierta |
| [D-143](#d-143--el-cliente-de-la-api-de-la-web-no-acepta-respuestas-sin-cuerpo) | El cliente de la API de la web no acepta respuestas sin cuerpo | Baja | Abierta |
| [D-144](#d-144--los-duelos-de-mirar-sólo-comparan-aportes-vistos-en-la-misma-visita) | Los duelos de Mirar sólo comparan aportes vistos en la misma visita | Baja | Abierta |
| [D-145](#d-145--el-aviso-de-un-aporte-retenido-por-reportes-no-se-repite) | El aviso de un aporte retenido por reportes no se repite | Baja | Abierta |
| [D-146](#d-146--toda-escritura-desde-el-navegador-respondía-500-en-producción) | Toda escritura desde el navegador respondía 500 en producción | Crítica | **Resuelta** |
| [D-147](#d-147--un-origen-que-cors-no-permite-recibe-500-y-no-403) | Un origen que CORS no permite recibe 500 y no 403 | Baja | Abierta |

---

### D-001 · No hay resolución geográfica en el servidor

**Dónde:** `v2/apps/api/src/features/civic-map/capturas.ts:95`
**Encontrada:** 2026-08-01, verificando por qué el modo Análisis se ve vacío
**Severidad:** bloqueante
**Estado:** ~~abierta~~ → **resuelta 2026-08-01**, ver [Resueltas](#resueltas)

`provinceId` se guarda **solo si el cliente lo manda**. No hay nada que lo derive del punto:

```ts
...(input.provinceId === undefined ? {} : { provinceId: input.provinceId }),
```

No existe ningún resolvedor en `apps/api/` ni en `packages/db/` — se buscó `pointInPolygon`, `resolverProvincia` y equivalentes, y no hay ninguno.

**Por qué es bloqueante.** El modo Análisis descarta toda señal sin provincia (`useModoAnalisis.tsx:126`, `if (s.provinceId === null) continue`). Una voz clavada en un punto exacto pero sin `provinceId` es **invisible** en el coroplético, en el detalle de provincia y —según la spec de la Simulación— en los rankings y en todo el motor, que se apoya en territorios. La plataforma acepta el dato más preciso que existe y después no lo puede contar.

Es también la causa real de lo que se reportó como «no puedo ver qué provincia habla»: el panel de detalle se construyó y funciona, pero no hay dato de provincia que mostrar.

**Qué haría falta.** Resolver la provincia (y a futuro el municipio) desde lat/lng **al escribir**, con el GeoJSON de provincias del lado del servidor y el `pointInPolygon` que ya vive en `packages/civic-core/src/lasso.ts`. Más un backfill de las filas existentes. v1 ya hace esta resolución server-side al escribir: el patrón existe y se puede portar.

---

### D-002 · La base de v2 tiene 12 filas, y las 12 son de demostración

**Dónde:** tabla `dreams`, proyecto Neon `cool-bird-63087148`, ids 3132–3143
**Encontrada:** 2026-08-01, contando voces por provincia
**Severidad:** alta
**Estado:** ~~abierta~~ → **resuelta 2026-08-02**, ver [Resueltas](#resueltas)

`SELECT count(*) FROM dreams` devuelve 12, y las 12 tienen el texto prefijado con `[prototipo]`. Todas caen en CABA y ninguna tiene `province_id`.

**Por qué importa.** Toda evaluación visual del mapa —densidad, rampas, coroplético, cobertura, línea de tiempo— se está haciendo sobre un conjunto que no representa nada. Cualquier juicio de «se ve bien» o «se ve vacío» sobre esta base es ruido.

**La decisión pendiente.** Estas filas son datos falsos en una plataforma cívica, lo cual es exactamente lo que la plataforma existe para no hacer. Pero borrarlas deja el mapa en cero y el instrumento sin nada que mostrar. Las dos salidas razonables son sembrar datos de prueba repartidos por el país y claramente marcados, o borrarlas y aceptar el mapa vacío hasta que entren voces reales. **No se borraron el 2026-08-01 al eliminar `/el-mapa/prototipo`** justamente porque son lo único que hace visible el instrumento hoy.

Relacionado: el pie de página dice «Prototipo con datos de demostración» (`PapelFooter.tsx:82`), así que la condición está declarada. Cuando esto se resuelva, esa línea también se revisa.

---

### D-003 · Glyphs y teselas del mapa salen de CDN de terceros

**Dónde:** `v2/apps/api/src/middleware/security.ts:37-44`, `v2/apps/web/public/maps/{oscuro,papel}.json`
**Encontrada:** 2026-08-01, al arreglar el mapa sin etiquetas
**Severidad:** media
**Estado:** ~~abierta~~ → **resuelta 2026-08-12**, ver [Resueltas](#resueltas)

La CSP habilita seis hosts externos: cinco de Carto para las teselas y `fonts.openmaptiles.org` para los glyphs. `v2/CLAUDE.md` dice, textual: *«Helmet with strict CSP — don't add third-party CDN allowances; bundle locally»*. Esto la viola a conciencia.

Se hizo porque auto-hospedar teselas vectoriales de todo el país es impracticable al tamaño actual, y porque Carto sirve teselas pero **no manda CORS en `/fonts/`** — sin el segundo host el mapa queda sin una sola etiqueta.

**Por qué importa igual.** Son seis terceros en el camino crítico de la página principal del producto. Si Carto cambia su política o corta el acceso anónimo, el mapa se apaga y no hay plan B. Los glyphs sí son auto-hospedables baratos (son unos pocos MB de PBF por familia tipográfica) y deberían serlo.

---

### D-004 · Falta la capa de departamentos

**Dónde:** `v2/apps/web/public/geo/` — solo hay `provincias.geojson`
**Encontrada:** 2026-07-26, spec del instrumento
**Severidad:** media
**Estado:** ~~abierta~~ → **resuelta 2026-09-22**

**Resolución.** `v2/apps/web/public/geo/departamentos.geojson`: la capa `ign:departamento` del WFS del IGN, simplificada con Douglas-Peucker topológico a 500 m (5.100.430 vértices → 39.790, 856 KB). Son 528 de los 529: «Antártida Argentina» (94028) queda fuera del marco que se dibuja. Cada rasgo trae `georefId`, el código INDEC de 5 dígitos que es también el id de georef y de `geographic_locations.georef_id`; coinciden en cantidad (529) y en forma (las comunas de CABA son `02007`…`02105`), pero no se cotejaron fila por fila contra la base porque eso pedía leer producción. Lo genera `pnpm geo:ign` (`v2/scripts/build/geo/importar-ign.ts`); procedencia, fecha y licencia en `v2/scripts/build/data/README.md`. **El nivel «departamento» del modo Análisis sigue apagado**, y ya no por la geometría: es [D-089](#d-089--el-nivel-departamento-del-modo-análisis-sigue-apagado-aunque-la-geometría-ya-está).

Las ~530 unidades del IGN no están. El modo Análisis muestra el nivel «departamento» deshabilitado con su razón a la vista, que es lo correcto, pero el análisis se queda en el escalón más grueso que existe.

Necesita un extracto de Geofabrik (~1,2 GB) procesado con osmium, o la capa del IGN directamente.

---

### D-005 · Falta la capa de municipios

**Dónde:** ídem D-004
**Encontrada:** 2026-08-01, escribiendo la spec de la Simulación
**Severidad:** media
**Estado:** **parcialmente resuelta 2026-09-22** — la geometría existe; la unión con la base no está verificada

**Resolución parcial.** `v2/apps/web/public/geo/municipios.geojson`: la capa `ign:municipio` del IGN a Douglas-Peucker 400 m (2.292.600 vértices → 68.798, 1.677 KB), con `georefId` = código INDEC de 6 dígitos. Lo que falta es la unión: el IGN trae 2.114 rasgos con 2.105 códigos distintos y la base tiene 2.082 municipios, así que **al menos 23 códigos del IGN no pueden estar en `geographic_locations`**, y no se cotejaron. Diez rasgos salen sin código: ocho que la fuente trae en blanco, más El Rabón y Hardy, que comparten el 822784 y no se adivina cuál lo tiene bien. Tampoco cubre el territorio entero: en varias provincias el municipio es un ejido y no una partición. Queda abierta hasta que alguien cruce los códigos contra la base y diga cuáles unen y cuáles no. Las dos condiciones del ranking municipal (población por municipio, supresión de grupos chicos) siguen siendo las de la spec de la tierra §7.4.

Los rankings de la Simulación (§7.3) piden municipios y el esquema los soporta, pero la geometría no existe. Hasta que esté, el ranking municipal solo puede armarse con los municipios que tengan señales geo-resueltas — lo cual hoy, por D-001, son cero.

Bloquea la rebanada 4 de `docs/specs/2026-08-01-el-mapa-simulacion.md`.

**Avance del 15/10/2026.** `/conciliacion-territorial` cruza por nivel y código el catálogo operativo, la edición IGN y los nomencladores oficiales del Censo 2022. El informe se calcula contra la base del entorno consultado, con diferencias y paginación. No se certificó la correspondencia espacial ni se leyó producción en esta entrega; la deuda conserva estado parcial. Los recuentos históricos de esta entrada no se presentan como cifras actuales.

**Conciliación operativa comprobada 15/10/2026 a las 21:53 UTC:** 24/24
jurisdicciones y 528/529 departamentos unen; 94028 queda fuera del marco.
Municipios: 2.080 coincidencias, 23 códigos solo IGN, dos solo catálogo
(740073 Nación Ranquel y 822784 El Rabón), diez geometrías sin código. Son
coincidencias documentales en esa consulta, no validaciones espaciales; D-131
registra los polígonos inválidos. La deuda conserva estado parcial.

---

### D-006 · Las 73 dependencias entre PLANes viven solo en v1

**Dónde:** `SocialJusticeHub/shared/arquitecto-data.ts` (1.120 líneas)
**Encontrada:** 2026-08-01, diseñando la palanca de orden de arranque
**Actualizada:** 2026-08-02 — el grafo creció
**Severidad:** ~~baja~~ → media
**Estado:** abierta

**208 aristas** con naturaleza (crítica/importante/menor) y tipo (financiera, institucional, técnica, legal, laboral, de datos, temporal), de las cuales 108 son anotaciones `provides`. Es contenido razonado y valioso que v2 no tiene.

Subió de severidad porque creció: el commit `95851ef` sumó las aristas de los cuatro PLANes nuevos y el grafo pasó de 22 nodos sueltos a 26 conectados. Cuanto más se invierte del lado de v1, más caro sale que v2 no lo tenga.

Sin él no existe la palanca de secuencia de la Simulación ni el chequeo de operabilidad — es lo único del motor que tendría estructura real en vez de multiplicación. Bloquea la rebanada 5, que de todos modos es opcional.

---

### D-007 · Dos majors de `@types/react` conviven por parche de pnpm

**Dónde:** `v2/package.json`, `pnpm.packageExtensions`
**Encontrada:** 2026-07-30, al meter `apps/mobile` en el workspace
**Severidad:** media
**Estado:** abierta

La web usa React 18 y el móvil React 19. Que las dos apps type-checkeen a cero exige declarar `@types/react` como peer de `wouter`, `lucide-react`, `recharts` y `react-map-gl` a mano.

Funciona, pero es un equilibrio frágil: cada dependencia nueva que consuma tipos de React puede volver a romperlo, y el síntoma —cientos de errores de tipos que aparecen de golpe en una app que no se tocó— no se parece en nada a la causa. Se resuelve de verdad cuando la web suba a React 19.

---

### D-008 · Los parches de dependencias están atados a versión exacta

**Dónde:** `v2/package.json`, `pnpm.patchedDependencies`
**Encontrada:** 2026-07-30, cuando `expo-sqlite` flotó de 57.0.0 a 57.0.1 y rompió el parche
**Severidad:** baja
**Estado:** abierta

`expo-sqlite@57.0.0` y `@shopify/react-native-skia@2.6.2` están pinneados exactos porque sus parches lo exigen. Un bump de patch rompe la instalación, y el mensaje de error no menciona el pin.

Hace falta una nota en cada parche que diga qué arregla y bajo qué condición se puede soltar.

---

### D-009 · Tres PLANes del corpus fuente no están migrados a v2

**Dónde:** `Iniciativas Estratégicas/` (26 documentos) vs. `v2/content/planes/` (23)
**Encontrada:** 2026-08-01, `pnpm test` en rojo
**Severidad:** alta
**Estado:** ~~abierta~~ → **resuelta 2026-08-01**, ver [Resueltas](#resueltas)

Faltan **PLANARCO, PLANPACTO y PLANPREGUNTA** en v2. Existen y están escritos del lado fuente; nunca corrió la migración.

`scripts/content/__tests__/split-documento-plan.test.ts:101` lo detecta —espera 23 documentos y encuentra 26— y por eso `pnpm test` y `pnpm verify` están en rojo, y con ellos CI.

**Ese test no se debe «arreglar» subiendo el número a 26.** Está funcionando como detector de deriva y encontró deriva real: la web sirve 23 PLANes mientras el canon tiene 26. Subir la constante silenciaría exactamente la señal que hace falta. Lo que corresponde es correr `pnpm planes:migrar` y regenerar el índice.

Ojo con el conteo canónico: `CLAUDE.md` dice 22 PLANes + PLANRUTA (meta, no contado). Con estos tres pasan a ser 25 + PLANRUTA, y falta PLANFOCO, cuyo documento de plan se commiteó el 2026-08-01 pero cuyo PLAN todavía no está en el corpus fuente. Al migrar hay que actualizar el conteo canónico en los dos `CLAUDE.md`.

---

### D-010 · Sesiones concurrentes se tragan los cambios de otras

**Dónde:** el repo entero
**Encontrada:** 2026-08-01, el commit `db4b1ee` se llevó borrados que no eran suyos
**Severidad:** media
**Estado:** abierta

`db4b1ee` («Add el plan del tramo D (segunda mitad) — PLANFOCO») incluye, además de su propio archivo, el borrado de `PrototipoMapa.tsx` y `InstrumentoMaplibre.tsx` — que estaban preparados por otra sesión que corría en paralelo y todavía no había commiteado.

El commit quedó con un mensaje que no menciona nada de eso. Dentro de un mes, `git log` sobre el prototipo del mapa va a decir que lo borró un commit sobre PLANFOCO.

**Causa.** Una sesión commiteó con `-a` o con `git add -A`, que barren el árbol entero sin distinguir qué cambio es de quién.

**Qué haría falta.** Regla de la casa: **commitear siempre con rutas explícitas**, nunca `-a` ni `add -A`, mientras pueda haber más de una sesión trabajando. Un hook de `pre-commit` que avise cuando el índice contiene archivos fuera del alcance declarado sería la versión que no depende de acordarse.

**Volvió a pasar el 2026-08-12, con la regla ya escrita acá.** `9d7578d` («fix(v2): escapar el NUL crudo y el rango de diacríticos en el plan del motor») se llevó el borrado de `v2/apps/web/public/maps/{dark-matter,papel}.json`, que otra sesión había preparado con `git rm` y todavía no había commiteado — 3.217 líneas de borrado que el mensaje no menciona. El árbol quedó bien y el registro quedó mal: `git log` sobre esos dos estilos va a decir que los borró un commit sobre secuencias de escape. **Dos veces en once días es la medición de que la regla escrita no alcanza**; lo que falta es el hook.

---

### D-011 · La geometría de provincias erra en los bordes

**Dónde:** `apps/web/public/geo/provincias.geojson` → `apps/api/src/features/geographic/provincias.generated.ts`
**Encontrada:** 2026-08-01, arreglando D-001 — un test que esperaba Neuquén devolvió Río Negro
**Severidad:** alta
**Estado:** ~~abierta~~ → **resuelta 2026-09-22**

**Resolución.** La geometría es la capa `ign:provincia` del WFS del IGN, bajada el 22/9/2026 y simplificada con Douglas-Peucker topológico a 200 m: 4.051.161 vértices → 29.820 (eran 684), 18 KB → 579 KB. Topológico quiere decir que dos provincias vecinas comparten el mismo borde simplificado — 100.000 puntos sorteados a unos 300 m de un borde no cayeron nunca en dos. CABA pasó de 3 vértices a más de 50. El nombre sale del canon por código INDEC, no del IGN. Se recorta al marco continental: Malvinas entra (y resuelve Tierra del Fuego), el sector antártico y las Georgias quedan afuera. Lo hace `pnpm geo:ign`, que al final corre el `pnpm geo:provincias` de siempre; procedencia y licencia en `v2/scripts/build/data/README.md`. `apps/api/tests/geo-provincias.test.ts` dejó de fijar el error: ahora afirma 22 puntos de borde —entre ellos Neuquén capital, Plottier y Cipolletti; Viedma y Carmen de Patagones; Resistencia y Corrientes; Posadas; Liniers, Villa Lugano, Núñez, Retiro, la Reserva y Aeroparque en CABA, Ciudadela y Dock Sud en provincia; Puerto Argentino— y que Salto y Encarnación no son de nadie. Contra la geometría vieja fallaban 11 de esos 24. De paso, el rectángulo inscripto de la web dejó de escaparse por los bordes finos (Corrientes se metía en Paraguay) y aprendió a restar huecos, que el IGN trae.

**Lo que dejó atrás:** [D-090](#d-090--las-voces-resueltas-por-punto-antes-del-cambio-de-geometría-conservan-la-provincia-vieja) — las filas que ya estaban guardadas no se tocaron. Y el mapa SVG precomputado (`apps/web/src/geo/pais.generated.ts`) sigue dibujando Natural Earth, pero su único consumidor, `MapaArgentina`, no lo monta ninguna página.

La geometría que tenemos promedia **29 vértices por provincia**. Alcanza para el interior y no alcanza para un límite que sigue un río.

Caso confirmado: **Neuquén capital cae en Río Negro**. La ciudad está sobre el Limay, que *es* el límite, y el polígono simplificado la deja del lado equivocado por unos 10 km. Son ~250.000 personas atribuidas a la provincia que no es. Lo mismo, más chico, con una de las 12 voces de prueba: la de la luminaria queda sin provincia porque cae fuera del borde este de CABA.

Y el caso extremo: **CABA no es un polígono simplificado, es un triángulo de tres puntos.**

```
[[-58.474192,-34.52158],[-58.541631,-34.710347],[-58.315031,-34.657195]]
```

Da la casualidad de que cubre el microcentro, así que 11 de las 12 voces de prueba caen adentro — pero no tiene nada que ver con la forma de la ciudad. Cualquier voz de Villa Lugano, Liniers o Núñez puede caer afuera según de qué lado del triángulo esté. Para la jurisdicción más densa del país, eso es inaceptable.

Está fijado en `apps/api/tests/geo-provincias.test.ts` con un test que afirma **lo que hoy pasa**, no lo que debería. Cuando entre geometría decente ese test va a fallar, y ese día se borra — es la señal de que la deuda se pagó.

**Qué haría falta.** Geometría con resolución real: el IGN publica los límites provinciales, y de paso es la misma fuente que resuelve [D-004](#d-004--falta-la-capa-de-departamentos) y [D-005](#d-005--falta-la-capa-de-municipios). Es una sola compra de datos para las tres.

Mientras tanto la elección es deliberada: una provincia equivocada en el borde es peor que ninguna, pero **ninguna provincia en ningún lado era mucho peor** — es lo que D-001 acaba de arreglar.

---

### D-013 · El test del corpus de PLANes tiene el total a mano y se rompe cada vez

**Dónde:** `v2/scripts/content/__tests__/split-documento-plan.test.ts:101`
**Encontrada:** 2026-08-02, segunda vez que rompe la suite en dos días
**Severidad:** media
**Estado:** abierta

```ts
expect(archivosCorpus).toHaveLength(27);
```

El 2026-08-01 este número era 23 y el corpus tenía 26 ([D-009](#d-009--tres-planes-del-corpus-fuente-no-están-migrados-a-v2)). Se migraron los PLANes, el número subió a 27, y hoy —con PLANPUERTA agregado a la fuente— el corpus tiene **28** y la suite está en rojo otra vez.

**El test detecta algo real** y por eso las dos veces se resolvió migrando y no bajando el número. Pero la constante a mano lo convierte en un despertador que suena a destiempo: rompe cuando alguien **agrega** un PLAN, que es trabajo legítimo, en vez de romper cuando la web **queda atrás**.

**Qué haría falta.** Comparar los dos lados en vez de contra un número: los `PLAN*_Argentina_ES.md` de `Iniciativas Estratégicas/` contra los `.mdx` de `v2/content/planes/`, y fallar solo si hay alguno en la fuente que no esté migrado, nombrándolo. Así el test dice qué falta en vez de decir cuántos hay, y agregar un PLAN deja de romper nada hasta que efectivamente se olvide de migrarlo.

Es de otra sesión y estaba en vuelo cuando se encontró: no se tocó.

---

### D-014 · Los tests de integración ensucian el mapa que el sitio sirve

**Dónde:** `v2/apps/api/tests/pulso-flows.test.ts` · `v2/apps/api/tests/gamification-hooks.test.ts`
**Encontrada:** 2026-08-02, cuando los estados vacíos no aparecían con la base supuestamente en cero
**Severidad:** alta
**Estado:** ~~a medias~~ → **resuelta 2026-09-23** — los tests de integración ya no pueden correr contra una base remota: la guardia de `packages/db/tests/helpers/neon-local.ts` los frena salvo `PERMITIR_BASE_REMOTA_EN_TESTS=1`. `pnpm test:integration:local` levanta un Postgres descartable, migra, siembra y corre las dos suites (544 tests verdes); el CI hace lo mismo con un contenedor, sin secretos. El puente `neon-http` → `pg` es el que se probó a mano el 22/9.

> **Corrección.** La primera versión de esta entrada decía que `pulso-flows.test.ts` «limpia proposals y proposalVotes y no pulseSignals». **Eso era falso**: sí las limpia, por id. El problema era otro y más fino, y está abajo.

Después de borrar las 12 voces de prototipo, `dreams` quedó en cero — pero el instrumento seguía diciendo **«voces en vista: 4»**. El endpoint del mapa consulta las cuatro capas, y las otras tres no estaban vacías:

```
pulso · «Segunda señal de prueba — el bus 12 nunca pasa»
pulso · «Auth signal.»
pulso · «Esto es una señal de prueba. Necesitamos más...»
pulso · «No alcanza la plata.»
```

«Auth signal.» sale textual de `pulso-flows.test.ts`. Los dos archivos que crean señales las limpian por id en su `afterAll`, así que la pregunta era por qué seguían ahí. Dos razones:

1. **El id se registraba DESPUÉS de afirmar.** Si un `expect` fallaba entre el POST y el `push`, la fila quedaba huérfana y nadie la borraba nunca.
2. **Un Ctrl-C mata el `afterAll`.** Si la corrida se corta, la limpieza no se ejecuta y lo creado queda para siempre. Ningún orden de líneas arregla esto.

**Por qué es alta.** Los tests de integración corren contra la misma base que sirve el sitio de desarrollo, así que cada `pnpm test` deja señales de prueba en el mapa público. No son datos de demostración que alguien decidió poner: son residuo, con textos como «Auth signal.», y nadie los mira porque aparecen de a una. Además tapan el estado vacío recién construido: la condición es `todas.length === 0`, y con cuatro sobras nunca se cumple.

**Lo que se hizo (2026-08-02).** Las dos fugas conocidas están tapadas y las cuatro filas se borraron:

- El id se registra **apenas vuelve la respuesta**, antes de cualquier `expect`, con un helper que tolera una respuesta sin id. Un assert que falle ya no puede dejar huérfana una fila.
- Los textos que cada archivo escribe son constantes, y el `afterAll` **barre también por texto**. Eso limpia lo que dejaron corridas anteriores cortadas por la mitad — que es como llegaron las cuatro que se encontraron.

Verificado: se borraron las cuatro, se corrieron los dos archivos completos, y `pulse_signals` volvió a quedar en **0**.

**Lo que falta, y es lo que importa.** Los tests siguen corriendo **contra la misma base que sirve el sitio**. El barrido por texto es un parche: solo limpia lo que un archivo sabe que escribió, y solo la próxima vez que ese archivo corra entero. Un test nuevo que olvide el patrón vuelve a ensuciar el mapa público, y nadie se entera hasta que alguien mira.

Lo que corresponde es un branch de Neon efímero por corrida, o al menos una base aparte. **Queda pendiente por decisión: no se integra ahora.**


**Actualización 2026-09-22.** Sigue igual de vigente, y peor dicho de lo que parecía: `v2/.env` apunta a `ep-flat-art`, que es el **branch `main` de `cool-bird-63087148` — la base de producción**, no una de desarrollo. Correr `vitest` en `apps/api` desde una máquina con ese `.env` escribe filas de prueba en la base que sirve el dominio (el 22/9 se corrió una vez así, por error; las filas se borraron solas en el `afterAll` y `senales` volvió a 0). Y hay residuo viejo: los **13 usuarios** de la tabla `users` de producción son cuentas `@test.local` de corridas del 8 y 12/5 (`vitest_…`, `flow_rot_…`, `pulso_…`). No hay ni un usuario real.

Lo que sí funcionó el 22/9, sin integrarlo todavía: un Postgres local descartable (`initdb` + las migraciones de `packages/db`) y un `setupFile` de vitest que le pasa al driver `neon-http` un `fetchFunction` hacia `pg`. Con eso la suite entera corre local (277 verdes). Integrarlo como `pnpm test:integration:local` es lo que cerraría esta deuda.

---

### D-091 · Los cuerpos de las lecciones traen cifras sin fuente e «historias reales» que nadie puede verificar

**Dónde:** `v2/content/courses/*/*.mdx`, el cuerpo (no los cierres)
**Encontrada:** 2026-09-22, por los 31 agentes que escribieron los cierres del Ciclo 1, que tenían orden de reportar y no reescribir
**Severidad:** alta
**Estado:** ~~abierta~~ → **resuelta 2026-09-23** — un agente por curso, los 31, con un prompt versionado (`v2/scripts/content/agentes/prompt-cuerpo.md`): cada cifra y cada hecho del cuerpo quedó con una fuente abierta antes de citarse, corregido con lo que dice la fuente, o afuera. Las citas del corpus pasaron de 492 a 1.046, y 83 lecciones llevan `revisarAntesDe` (antes 50). No queda ninguna «Historia Real»: las que no tenían fuente pública pasaron a «Un caso para pensar» o «Imaginá…», sin las cifras que funcionaban como prueba (23 casos). Los informes de los agentes trajeron además errores que corrigió el orquestador —«5 presidentes en 12 días» unificado en todo el corpus con su fuente; el agua del AMBA, que no usó una sola ley en sus tres fases; los módulos de `teoria-juegos` que repetían el mismo párrafo de relleno—.

El Ciclo 1 le puso fuente al cierre; el cuerpo quedó como vino de v1. Los errores de hecho que se pudieron comprobar se corrigieron el mismo día (Gabino Ezeiza era payador; Punto Final es anterior a los carapintadas; el cepo terminó para personas en abril de 2025; ABSA no abastece Quilmes; Fowler no es de Harvard; los equilibrios de Nash de `teoria-juegos` módulo 2 estaban mal calculados; «defeca» por «defecta»; la inflación de 2023 fue 211,4% y no 150%; y unas cuarenta más). Queda lo que no se puede corregir sin investigar:

- **«Historia Real» sin fuente, presentadas como testimonio:** Marta Sánchez, Ramiro Gutiérrez y Graciela Mendoza (`caja-herramientas`); la maestra de Villa Lugano y la asamblea de Mendoza (`liderazgo-distribuido`); Jorge, María y Graciela (`resiliencia-y-proposito`); la familia Romero, cuyas edades no cierran (`la-metamorfosis`); Lucía Ferreyra, Diego Romero y Estela Giménez (`gestion-proyectos`); la periodista de Corrientes (`narrativas`); los casos «Bahía Confianza», «Consorcio Ruta 3» y el laboratorio de crédito de Santa Fe (`teoria-juegos`). O se consigue la fuente, o se reescriben como ejemplos declarados («imaginá a…»).
- **Cifras sin fuente escritas como hechos:** «menos del 20% confía en la mayoría» (`comunicar-sin-polarizar`), «el analfabetismo cayó del 77% al 35%» y «YPF, la primera petrolera estatal del mundo» (`argentina-1810-1945`), «más de 160 impuestos», «3,5 millones de empleados públicos», «más unicornios per cápita» (`sistemas-economicos`), «la economía social es el 10% del PBI», «25.000 cooperativas» (`economia-familiar`), «el 80% cierra antes de los 3 años» (`emprendimiento`), los porcentajes por plataforma (`narrativas`), «más de 50 municipios con presupuesto participativo» (`diseno-instituciones`), «300.000 niños sin transporte escolar» (`narrativas`), y los porcentajes de productividad de casos anónimos (`diseno-idealizado`).
- **Datos que envejecieron:** «Defensoría vacante desde 2009» (en 2025 se abrió la selección); Télam como medio público; las PASO como obligatorias; la Corte con «5 miembros»; «tasas del 150%»; montos en pesos sin fecha (`sobrevivir-prosperar`, `emprendimiento`).

**Qué haría falta:** una pasada por curso con el mismo método del Ciclo 1 —abrir la fuente o sacar la afirmación— empezando por las «historias reales», que son las que más confianza piden y menos tienen.

### D-092 · Cinco PLANes afirman datos que sus fuentes contradicen

**Dónde:** `v2/content/planes/` (y su taller en `Iniciativas Estratégicas/`)
**Encontrada:** 2026-09-22, por los agentes del Ciclo 1 al verificar los puentes
**Severidad:** media
**Estado:** ~~abierta~~ → **resuelta 2026-09-23** — las cinco se corrigieron en el taller, cada una en su misma línea para no correr remisiones, y se re-derivaron los `.mdx` y las copias públicas de v1. PLANSAL: con la línea de base real (44,2%) la meta de -40% queda en ~27%, y la de la tabla de salud pasa de <50% (que ya se cumplía) a <30%.

- `PLANVIV.mdx:158`: el RENABAP fue «creado en 2018 por ley 27.453». Lo creó el Decreto 358/2017; la ley es de 2018.
- `PLANTER.mdx`: sigue hablando de la emergencia de la Ley 26.160 sin decir que el Decreto 1083/2024 la dio por terminada.
- `PLAN24CN.mdx:149`: La Plata «diseñada por Pedro Benoit». La página oficial del monumento dice que atribuírsela sólo a él es un error: el trazado fue del Departamento de Ingenieros y las diagonales de Juan Martín Burgos.
- `PLANSAL.mdx:197`: 64,9% de actividad física insuficiente «según la ENFR 2018/2019». La ENFR 2018 del INDEC da 44,2% (54,7% en 2013).
- `PLANMON.mdx:47`: el corralito «se firmó el 3/12/2001». El Decreto 1570/2001 es del 1/12/2001.

No se tocaron acá porque los `.mdx` de los PLANes se derivan del taller y editarlos a mano rompe `planes:check` (D-076). Se corrigen en el taller y se re-deriva.

### D-093 · La voz editorial del curso contradice lo que el curso enseña

**Dónde:** `argentina-sistema-viviente-primeros-principios`, `niveles-superiores-pensamiento-conciencia`, `la-vision-de-transformacion`, `inteligencia-emocional-tiempos-turbulentos`
**Encontrada:** 2026-09-22, Ciclo 1
**Severidad:** baja
**Estado:** ~~abierta~~ → **resuelta 2026-09-23** — en la misma pasada que D-091: las frases del Hombre Gris pasaron a voseo, los «saltos cuánticos» de `niveles-superiores` se alinearon con la tesis de las lentes, y la neurociencia de manual quedó con fuente seria o dicha como metáfora. También salieron el «1+1=10» de `diseno-idealizado`, la «ley de la entropía» sin el matiz de sistema aislado y la promesa de «10 lecciones basadas en neurociencia» de `la-vision-de-transformacion`.

- **Frases del Hombre Gris en tuteo** («Optimiza tu barrio, y contribuyes…», «No cambies personas, cambia sistemas»): van entre comillas y la regla de voseo no toca citas, pero no son citas de nadie — son la voz de la casa.
- **Niveles como rangos:** tres lecciones de `niveles-superiores` hablan de «salto cuántico» y «avance en la evolución de la conciencia» cuando el curso dice que las perspectivas son lentes, no escalones.
- **Neurociencia de manual de autoayuda:** «el cerebro no distingue entre vivir y visualizar», «la visión programa tu RAS», «pensar a cinco años desactiva la amígdala», el cerebro reptiliano, oxitocina y cortisol como interruptores. Se corrigieron las afirmaciones con cita equivocada (Walker, Blumenthal, Duhigg/Clear); las demás piden reescritura con fuente, no un parche.

### D-094 · `entrenamientos:minutaje --escribir` reescribe todo el corpus aunque cambie una lección

**Dónde:** `v2/scripts/content/entrenamientos-minutaje.ts`
**Encontrada:** 2026-09-22, corriendo el Ciclo 1 con 20 agentes editando lecciones en paralelo
**Severidad:** baja
**Estado:** ~~abierta~~ → **resuelta 2026-09-23** — acepta cursos como argumento, reescribe una `.mdx` sólo si todavía trae `estimatedMinutes` y un `course.json` sólo si su minutaje cambió, formateado con prettier. Corrido sobre el corpus entero no toca ningún archivo.

Reescribe las 329 `.mdx` (para sacar `estimatedMinutes`, que ya no existe en ninguna) y los 31 `course.json` con `JSON.stringify`, que no es el formato de prettier: cada corrida deja diez archivos cambiados sólo de forma, y con otros editando al mismo tiempo puede pisar una escritura en vuelo. Se evitó con un script temporal limitado a los cursos terminados. **Qué haría falta:** que acepte cursos como argumento, que no toque las `.mdx` y que formatee con prettier.

### D-095 · 65 preguntas de quiz se contestan sin haber leído la lección

**Dónde:** `v2/content/courses/*/quiz.json`, 21 cursos
**Encontrada:** 2026-09-23, auditando los cuerpos (D-091)
**Severidad:** media
**Estado:** ~~abierta~~ → **resuelta 2026-09-23** — 23 agentes, uno por curso, con `v2/scripts/content/agentes/prompt-quiz.md`: las 65 plantillas se reescribieron sobre su lección, y se corrigieron además las preguntas que evaluaban lo no enseñado, las que pedían «la más efectiva» sin ranking y las que contradecían una cifra corregida. `entrenamientos:check` rompe si la plantilla vuelve. Y como el banco de v1 ponía la correcta en la segunda posición en 145 de 254 preguntas, el lector baraja las opciones con un orden fijo por pregunta (`barajarOpciones`, `@v2/shared`). Lo que queda —la correcta suele ser la opción más larga— es D-096.

Una pasada anterior (`scripts/content/entrenamientos-mejorar-quizzes.ts`) reemplazó las preguntas que pedían reconocer el título de una lección por una plantilla: «¿Qué evidencia mostraría mejor que podés transferir «…» a una situación real?». La correcta es siempre la única opción que dice «un caso real»: se contesta sin leer. Quedan 65, en 21 cursos (16 sólo en `argentina-sistema-viviente`). La guardia dejó de ver la plantilla vieja y no aprendió a ver la nueva.

Además, algunas preguntas evalúan lo que el curso no enseña o piden «la más efectiva» cuando la lección no ordena nada: `teoria-juegos` 8 a 10, `resiliencia` 2 y 3, `redes-territoriales` 6 y 8, `diseno-idealizado`, `primeros-pasos` 9 y 10. Y después de D-091 algunas respuestas pueden contradecir la cifra corregida en la lección.

**Qué haría falta:** una pasada por curso con prompt versionado (`v2/scripts/content/agentes/prompt-quiz.md`) que reescriba cada plantilla sobre su lección, y que `entrenamientos:check` rompa si la plantilla vuelve.

### D-096 · En la mitad de las preguntas de opción múltiple, la correcta es la opción más larga

**Dónde:** `v2/content/courses/*/quiz.json`, 30 cursos
**Encontrada:** 2026-09-23, cerrando D-095
**Severidad:** media
**Estado:** abierta

En 129 de las 254 preguntas de opción múltiple la correcta es la opción más larga por más de un 30% sobre la siguiente, y muchas veces es la única con matices mientras los distractores son absurdos («Empezar puntual», «Saludo + queja + despedida»). Barajar las opciones (D-095) le saca la pista de la posición, no la del largo: quien elige siempre la más larga sigue aprobando sin leer.

**Qué haría falta:** una pasada por curso que reescriba los distractores —errores plausibles de quien leyó a medias, del mismo largo que la correcta— sin tocar la correcta ni la explicación, y una guardia en `entrenamientos:check` que mida la proporción.

## Resueltas

### D-048 · La CSP viaja sólo en las respuestas de `/api/` y nunca llega al documento

**Resuelta:** 2026-08-13
**Cómo:** la política dejó de vivir adentro del middleware. Ahora es una tabla, `v2/packages/shared/src/seguridad/csp.ts`, y de ahí salen las dos superficies: el `helmet()` de la API y un bloque `headers` nuevo en `v2/vercel.json`, que es el único lugar donde se le pueden poner cabeceras al documento —el documento lo sirve Vercel desde su filesystem, sin pasar por un middleware nuestro—.

- **Once cabeceras sobre la página**, las mismas que la API: la CSP y las diez de helmet (`X-Content-Type-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `X-Frame-Options`…). Hasta hoy el sitio no traía **ninguna**: `curl -sI` sobre producción devolvía sólo el `strict-transport-security` que agrega Vercel.
- **La misma CSP carácter por carácter en las dos.** No hizo falta una política aparte para la página: la del middleware **ya estaba escrita para la página** —los estilos inline de Radix, el `blob:` del worker de maplibre, el `data:` de los SVG— aunque la emitiera un servidor que no sirve páginas. Lo que faltaba no era otra política; era que ésta llegara.
- **`pnpm csp:generar`** escribe el bloque en `vercel.json` (JSON estático: no puede importar TypeScript ni llevar comentarios, así que la justificación de cada permiso vive en la tabla y en `v2/scripts/build/seguridad/csp-vercel.ts`). El generador **se niega a correr** si `index.html` pide un host de terceros que la CSP no nombra.
- **Dos tests cierran el lazo.** `scripts/build/__tests__/csp-vercel.test.ts` falla si `vercel.json` quedó viejo respecto de la tabla, y `apps/api/tests/cabeceras-seguridad.test.ts` falla si lo que la API contesta de verdad deja de ser esa misma tabla. Divergir en silencio deja de ser posible.

**Dos hallazgos que cambiaron la política, no sólo su transporte.**

`useDefaults: false`. Helmet mezclaba sus defaults con lo escrito, así que el header llevaba tres directivas —`frame-ancestors`, `script-src-attr` y `upgrade-insecure-requests`— **que no estaban en ningún archivo del repo**. Copiadas a `vercel.json` a ojo, se habrían perdido las tres. Ahora la tabla es la política entera y helmet no agrega nada.

`child-src 'self' blob:`, nuevo. maplibre arma su worker desde un `blob:`, y `worker-src` no existe en Safari anterior a 15.4: ahí el worker cae en `default-src 'self'` y **el mapa queda mudo sin un solo error de red que mirar**. Mientras la CSP no llegaba al navegador eso no podía pasar; desde hoy sí. `child-src` es el fallback que la especificación define, y no afloja los iframes porque `frame-src 'none'` es explícito y gana.

**Lo que no se copió, a propósito:** `Strict-Transport-Security`. Vercel ya la manda en todo el dominio con `max-age=63072000`, el doble que helmet; declararla nosotros la habría **acortado a la mitad** creyendo que se la reforzaba. Y el patrón `"/((?!api/).*)"` deja `/api/*` afuera —el mismo lookahead de los `rewrites`— para que la API no conteste con dos `Content-Security-Policy`.

**Qué se verificó, que no es que el JSON parsee.** Se levantó el build de producción detrás de un servidor que aplica exactamente el bloque de `vercel.json` (con `Range`, que es como se lee el `.pmtiles`) y se recorrieron `/`, `/el-mapa`, `/ingresar` y `/biblioteca`: **cero violaciones de CSP en consola**, el mapa dibuja con sus etiquetas —4 pedidos al `.pmtiles`, los glyphs desde `/fonts/`, el estilo desde `/maps/`—, las seis tipografías cargan desde `/fonts-ui/`, y de 36 recursos **ninguno sale a un origen ajeno**. `script-src 'self'` sin `'unsafe-inline'` ni `'unsafe-eval'`: el build de Vite no los necesita, y se comprobó que no los necesita en vez de ponerlos por las dudas.

**Lo que lo destrabó:** [D-049](#d-049--las-tipografías-de-la-interfaz-salen-de-google-fonts-en-todas-las-páginas). Esta entrada avisaba que aplicar `font-src 'self'` al documento rompería las tipografías de Google que la página seguía pidiendo. Llegaron primero al origen, así que no rompió nada.

**Lo que dejó atrás:** [D-059](#d-059--la-csp-del-documento-necesita-unsafe-inline-en-los-estilos-y-el-hosting-estático-no-deja-sacarlo).

**Lo que falta verificar después del push:** que producción emita el header. La guardia mira el archivo, no el despliegue — un `curl -sI https://elinstantedelhombregris.com/el-mapa` tiene que traer las once cabeceras.

---

### D-049 · Las tipografías de la interfaz salen de Google Fonts en todas las páginas

**Resuelta:** 2026-08-12
**Cómo:** las seis familias viven en `v2/apps/web/public/fonts-ui/` y las baja `v2/scripts/build/tipografias/bajar-tipografias.ts`. `index.html` perdió los dos `preconnect` y el `<link>` a Google, y en su lugar pide `/fonts-ui/fuentes.css`, del mismo origen.

- **32 `.woff2`, 563 KB en el repo.** Un archivo por (familia, estilo, subconjunto), con las seis licencias OFL en `fonts-ui/licencias/`.
- **Los pesos se recortaron; los subconjuntos no.** El script le pide a Google exactamente la misma query que tenía el `<link>`, así que baja los mismos pesos que el sitio declara y ni uno más. Los siete subconjuntos se quedan porque `unicode-range` los vuelve gratis en tiempo de carga: recortarlos ahorraría KB de repo y haría caer la `φ` de una fórmula a la fuente del sistema en medio de un párrafo.
- **Lo que baja un visitante no son 563 KB.** Medido en el home: **cinco archivos, 95 KB**. Los otros 27 no se piden nunca.

**Cuatro de las seis familias son variables, y eso cambia la cuenta.** Archivo, Inter, JetBrains Mono y Playfair Display sirven todo su rango de pesos desde un solo archivo — los seis pesos de Archivo son 34 KB, no seis descargas. Google igual devuelve un bloque `@font-face` por peso apuntando todos al mismo archivo; el script los colapsa en un `font-weight: 300 800`. Bajar «un archivo por peso», que es lo que uno escribe sin mirar, habría bajado los mismos bytes seis veces.

**La trampa, para no redescubrirla:** sin `User-Agent` de navegador moderno, la API `css2` de Google **devuelve TTF**. Con el UA por defecto de Node contesta una hoja que apunta a `.ttf`, que pesa el triple y **no trae `unicode-range`**, así que se bajaría todo siempre. El script manda un UA de Chrome y aborta si la hoja no menciona `woff2`.

**Qué se verificó, que no es que compile.** Una fuente que no carga cae al fallback del sistema y el sitio queda *parecido pero mal*, que es lo difícil de ver. Contra el sitio levantado: las seis familias resuelven a una cara local con estado `loaded` en las once combinaciones de peso y estilo que el sitio declara (incluidas la itálica de Archivo y los extremos 300 y 800), y el ancho de un mismo texto medido en canvas difiere del de la familia genérica en las seis — o sea que ninguna está cayendo al fallback. Siete rutas recorridas con Playwright (`/`, `/ingresar`, `/manifiesto`, `/el-mapa`, `/privacidad`, `/planes`, `/biblioteca`): **cero pedidos a un origen que no sea el propio**.

**Lo que arrastró:** `v2/content/legal/privacidad.mdx` decía que quedaba un pedido a terceros —las tipografías— y ahora no queda ninguno. La sección «Dónde viven tus datos, y qué sale del país» lo dice medido, y nombra los dos que se cerraron.

**Lo que destraba:** [D-048](#d-048--la-csp-viaja-sólo-en-las-respuestas-de-api-y-nunca-llega-al-documento). Esa entrada avisa que aplicar la CSP del middleware al documento rompería las tipografías de Google que la página seguía pidiendo. Ya no las pide: `font-src 'self'` sobre el documento no rompe nada.

---

### D-003 · Glyphs y teselas del mapa salen de CDN de terceros

**Resuelta:** 2026-08-12
**Cómo:** plan `v2/docs/plans/2026-08-12-teselas-propias.md`, commits `b477c5a`, `fbe1791`, `14730c4`, `28d550c`.

- **Glyphs propios.** Los 256 rangos PBF de `Noto Sans Regular` viven en `v2/apps/web/public/fonts/` (5,95 MB) con su licencia OFL al lado. El estilo pide `/fonts/{fontstack}/{range}.pbf`.
- **Teselas propias.** Un único `.pmtiles` estático de la Argentina entera, leído por range requests con el plugin `pmtiles` de MapLibre. **No hay servidor de teselas, no hay proceso nuevo, no hay base nueva.**
- **Estilo propio.** Generado desde `protomaps-themes-base` con `pnpm mapa:estilo` y repintado con los tokens del proyecto: 66 capas contra las 12 escritas a mano.
- **CSP a cero externos.** `imgSrc`, `connectSrc` y `fontSrc` quedaron en `'self'` más los esquemas `data:`/`blob:`. Un test de `apps/api/tests/csp-mapa.test.ts` falla si alguno de los seis hosts vuelve.

**La premisa era correcta para lo que se estaba pensando, y falsa para lo que había que hacer.** Esta entrada decía que auto-hospedar teselas del país es «impracticable al tamaño actual», y lo es **para un servidor de teselas con `.mbtiles`**: hay que correr un proceso, mantenerlo y pagarlo. Para **un archivo estático servido por rangos** el número es otro:

| | |
|---|---|
| Argentina entera a zoom 15, recortada por las 24 provincias | **1.206.728.792 bytes (1,2 GB)** |
| Proporción del planet de Protomaps (137 GB) | **0,9%** |
| Costo de generarlo | 481 range requests, 1,3 GB transferidos, **2 minutos** |

Lo que hacía impracticable la idea no era el tamaño del país: era la forma del servidor que se le suponía. Vale anotarlo porque el mismo razonamiento —«esto es demasiado grande para nosotros»— está sin medir en otros lugares del proyecto.

**Lo que apareció al arreglarlo, y que nadie sabía: el mapa estaba en blanco.** `fonts.openmaptiles.org` **no tiene** la familia `Noto Sans Regular` que el estilo pedía —su índice publica `Klokantech Noto Sans Regular`, que es otra— y ante un fontstack desconocido no devuelve 404: **devuelve su página de inicio con estado 200**. MapLibre parseaba ese HTML como protobuf, moría con `Unimplemented type: 4` y **no dibujaba ni una geometría**, no sólo las etiquetas. Cero errores de red que mirar, porque el estado era 200. La deuda estaba archivada como una fuga de privacidad y era además un mapa roto en producción, sin síntoma en la consola.

**Lo que dejó atrás:** [D-047](#d-047--el-basemap-se-congela-en-la-fecha-en-que-se-extrajo-y-nadie-se-entera), [D-048](#d-048--la-csp-viaja-sólo-en-las-respuestas-de-api-y-nunca-llega-al-documento), [D-049](#d-049--las-tipografías-de-la-interfaz-salen-de-google-fonts-en-todas-las-páginas), [D-050](#d-050--el-borde-del-recorte-de-teselas-se-ve-en-el-agua) y [D-051](#d-051--el-pmtiles-de-12-gb-no-está-publicado-en-ningún-lado).

---

### D-002 · La base de v2 tiene 12 filas, y las 12 son de demostración

**Resuelta:** 2026-08-02
**Cómo:** se borraron. `SELECT count(*) FROM dreams` devuelve **0**.

Antes de borrar se buscó de dónde traer datos reales. Producción de v1 (`sparkling-field-92271073`) tiene **una sola voz**, del 10 de marzo de 2026; no hay tabla de pulso; lo único con volumen son cursos, lecciones y las 549 localidades. **La plataforma nunca tuvo datos cívicos.**

Con eso sobre la mesa se decidió **no sembrar nada** — ni sintéticos marcados, ni modo demo en memoria, ni un branch de Neon. La razón que inclinó la balanza no fue de pureza sino de producto: la Simulación es el argumento entero de la plataforma en un gesto —arrastrás la cortina y ves de la nada al país— y **ese gesto se debilita si el lado izquierdo está lleno de voces inventadas**. Sembrar compraba cuatro lentes legibles al precio de arruinar la quinta.

El trabajo que reemplaza al sembrado está en `v2/docs/specs/2026-08-02-el-vacio-como-pieza.md`: que el vacío diga lo que tiene que decir en vez de parecer una herramienta rota.

**Lo que hay que recordar:** el pie de página decía «Prototipo con datos de demostración». Al no haber datos de demostración, esa línea también cambia — está en la spec §4.2.

---

### D-001 · No hay resolución geográfica en el servidor

**Resuelta:** 2026-08-01
**Cómo:**

- `packages/civic-core/src/provincias.ts` — `provinciaDelPunto()`, función pura sobre `pointInPolygon`. Soporta Polygon y MultiPolygon, y respeta los huecos: un anillo interior es territorio ajeno enclavado y contarlo propio le atribuiría la voz a la provincia equivocada.
- `apps/api/src/features/geographic/provincias.ts` — resuelve al nombre canónico (el GeoJSON dice «Ciudad de Buenos Aires», la base guarda «Ciudad Autónoma de Buenos Aires») y de ahí al id.
- `provincias.generated.ts` — la geometría compilada. Módulo y no `readFileSync` porque `tsc` solo emite `.js` y en serverless no hay disco confiable. Se regenera con `pnpm geo:provincias`; un test falla si se desincroniza del GeoJSON que sirve la web.
- `capturas.ts` — la provincia sale del punto **publicado**, no del crudo, para que la fila sea coherente con lo que el mapa dibuja. Si el cliente manda `provinceId`, manda el cliente: sabe cosas que la geometría no.
- `pnpm geo:backfill` — repara las filas viejas. Idempotente: solo toca las que tienen punto y no tienen provincia.

**Verificado:** 5 tests en civic-core, 12 en la API, 1 de integración contra Postgres real. El backfill resolvió 11 de 12 filas; la que falta es [D-011](#d-011--la-geometría-de-provincias-erra-en-los-bordes).

**Lo que dejó atrás:** [D-011](#d-011--la-geometría-de-provincias-erra-en-los-bordes) — el resolvedor es correcto, la geometría no alcanza en los bordes.

---

### D-012 · El GeoJSON usaba un nombre no canónico para CABA

**Encontrada y resuelta:** 2026-08-01, verificando el arreglo de D-001
**Dónde:** `apps/web/public/geo/provincias.geojson`

El GeoJSON venía de Natural Earth con **«Ciudad de Buenos Aires»**; `geographic_locations` guarda **«Ciudad Autónoma de Buenos Aires»**. De 24 nombres, **23 coincidían y uno no.**

Ese es el peor tipo de bug: el coroplético recorre las features del GeoJSON y para cada una busca su conteo en un mapa indexado por el nombre que devuelve la API. 23 provincias resolvían bien y CABA daba cero — y CABA es donde está el 100% de los datos. Arreglar D-001 no habría alcanzado: la provincia se resolvía bien y el mapa la pintaba vacía igual.

La casa ya había decidido este canon en el otro pipeline de geografía (`scripts/build/geo/capas/provincias.ts:42` tiene el renombre, y `proyeccion.test.ts:135` afirma que su salida no lo contiene). A este archivo simplemente nunca le pasaron la normalización.

**Cómo:** el nombre se corrigió en el GeoJSON, que es la fuente, y se regeneró el módulo de la API. Queda fijado por un test en `apps/api/tests/geo-provincias.test.ts` con el mismo criterio que el pipeline viejo.

---

### D-009 · Tres PLANes del corpus fuente no están migrados a v2

**Resuelta:** 2026-08-01, por otra sesión, mientras se arreglaba D-001
**Cómo:** se reintegraron los cuatro textos y el corpus pasó de 23 a 27 `.mdx` (`cf0567d`, `c49dad0`), y el test dejó de estar en rojo porque el corpus alcanzó al canon — no porque se le cambiara el número a mano.

**La nota que sobrevive:** el conteo canónico de los dos `CLAUDE.md` sigue diciendo «22 PLANes + PLANRUTA». Con 27 documentos eso ya no es cierto y hay que actualizarlo.

---

### D-019 · V-FIN-05 suma el piso sustitutivo a los pisos que sustituye — RESUELTA

> **Sobre el id.** Esta entrada nació como una segunda `D-013` y por eso existe [D-016](#d-016--este-mismo-archivo-usa-el-id-d-013-dos-veces). Se renumeró a D-019 —el próximo libre— porque era la más nueva de las dos, y con eso D-016 queda cerrada. La renumeración la hizo la misma sesión que había elegido mal el número.

**Encontrada:** 2026-08-02, cargando las aristas de los cuatro PLANes nuevos
**Resuelta:** 2026-08-03, en la sesión siguiente
**Dónde:** `SocialJusticeHub/shared/validation-engine.ts` — regla `vFin05`

La regla suma el `constitutionalFloor` de todos los nodos y avisa si pasa el 10% del PBI. Hoy avisa **11,81%**, y ese número no mide nada: son los 9,41% que reclamaban los diecisiete PLANes con piso **más** el 2,40% de PLANPACTO, que es el piso que los **reemplaza**. Sumar el sustituto a los sustituidos es exactamente la lectura aditiva que PLANPACTO existe para impedir.

El mismo bug ya se arregló en `arquitecto-data.ts` cuando se cargó el nodo: ahí vive `PISOS_SUSTITUTIVOS`, y `ECOSYSTEM_METRICS` publica las dos cifras por separado —`constitutionalFloorGross` (7,82–9,41%, lo que se reclamaba, que es el hallazgo que funda al PLAN) y `constitutionalFloorEffective` (2,40%, lo que queda)—. El motor de validación tiene su propia suma y no se enteró.

**Por qué no se arregló en el momento:** el trabajo de ese día eran las aristas del grafo, y esto es la aritmética de los pisos. Mezclarlo habría metido dos cambios sin relación en el mismo commit.

**Cómo se arregló:** `PISOS_SUSTITUTIVOS` se exporta desde `arquitecto-data.ts` y `vFin05` lo saltea, igual que `sumConstitutionalFloorsGross()`. El aviso pasa de 11,81% a callarse, porque el bruto real —9,41% en el extremo alto— está por debajo del umbral de 10.

**La elección que había que hacer, hecha: la regla vigila el BRUTO.** Las dos cifras son ciertas y contestan preguntas distintas, así que la decisión no es aritmética. El efectivo (2,40%) es lo que el ecosistema se compromete a gastar y por diseño no se mueve: vigilarlo sería poner un guardia en una puerta tapiada. El bruto es lo que los PLANes reclaman uno por uno, así que crece el día que alguien escribe un piso nuevo — que es el único evento que esta regla puede llegar a ver. El `details` del aviso nombra el efectivo al lado, para que nadie vuelva a leer el número como deuda comprometida.

**Fijado por:** `pisos-constitucionales.test.ts`, que ahora corre la regla y exige que calle; verificado con la mutación inversa —volver a incluir el sustitutivo pone el test en rojo—.

---

### D-015 · Las cifras del bloque de atracción de PLANSUS no tenían fuente externa — RESUELTA PARCIAL

**Encontrada:** 2026-08-03, escribiendo las Secciones 28 a 31 de PLANSUS
**Dónde:** `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` — Secciones 9.4, 13.2 y el bloque MARCOS DE ATRACCIÓN

El bloque nuevo se escribió sin inventar un solo número, que era la directiva. Pero eso deja huecos declarados en vez de huecos tapados, y conviene tenerlos listados por nombre para que alguien los busque con fuente en vez de rellenarlos con verosimilitud:

- **Tamaño del mercado global de turismo terapéutico.** La Sección 9.4 lo describe cualitativamente. No hay cifra porque no hay fuente verificada.
- **Costo comparado de un ensayo clínico, Argentina contra EE.UU. y la UE.** Es el argumento central de la Sección 9.2 y del tramo laboratorio de la Sección 30, y hoy se sostiene en una afirmación genérica sobre «costos operativos competitivos».
- **Plazos actuales de dictamen de ANMAT.** Son la línea de base contra la cual se fijan los acuerdos de nivel de servicio de la Sección 30.2. Sin ese número, el instrumento central de la sección no tiene contra qué medirse.
- **USD 3.000-15.000 por semana y 20.000-50.000 empleos** (Sección 9.4). Venían del documento anterior sin fuente; quedaron marcados en el texto como estimación propia sin verificar, en vez de borrados o maquillados.
- **La fila de tratamiento de no residentes de la TABLA 13.2** conserva los valores de la vieja fila de turismo, cuya base conceptual cambió. Los números pueden estar bien o mal; nadie los recalculó.

**Por qué no se arregló en el momento:** conseguir estas cifras es trabajo de investigación con fuentes primarias, no de redacción, y mezclarlo habría contaminado la prosa con números plausibles. Los últimos commits del repositorio son correcciones de cifras que una auditoría refutó: el default es no inventar.

**Cómo se arregla:** una pasada de investigación con fuente primaria por cada punto, y después una edición quirúrgica. La guardia `verificar-plansus.ts` ya tiene el mecanismo para fijarlas cuando existan — `CIFRAS_CANONICAS` exige que cada cifra aparezca con su domicilio en la misma oración.

---

**RESUELTA PARCIAL — 2026-08-03**, misma jornada, con investigación de fuentes. Se cierran cuatro de los cinco puntos y el quinto se resuelve retirando la cifra en vez de inventarla. El detalle vive ahora en el propio documento, en `## FUENTES EXTERNAS DEL BLOQUE MARCOS DE ATRACCIÓN`, con una columna de solidez por fuente.

| Punto | Estado | Qué se encontró |
|---|---|---|
| Costo comparado de ensayo clínico | **Cerrado, revisado por pares** | Qiao et al., *Clinical Trials*, 2019: América Latina al **59%** del costo de Norteamérica (RIC 50-70%), contra 78% de Europa Occidental y de Asia. Es regional y no argentino, y mide ejecución y no velocidad — las dos advertencias quedan escritas en la Sección 9.2 |
| Plazos de ANMAT | **Cerrado, norma vigente** | Disposición **4008/2017**: 3 días hábiles para declarar evaluable, 60 para el informe técnico (45 por vía acelerada), 10 para el acto administrativo, 15 para subsanar observaciones. Total ~73 días hábiles, ~58 acelerado |
| Precio por programa | **Cerrado con reserva** | Operadores legales cobran USD 200-900 por día; Beckley USD 5.900-8.900 (Países Bajos) y 4.800-9.500 (Jamaica); Oregon licenciado USD 1.500-3.500. **El techo de USD 15.000 que traía el documento no tiene respaldo** y se bajó a un rango de 1.500-9.500. Fuente interesada (los propios operadores), sirve para orden de magnitud |
| Tamaño de mercado | **Cerrado, con dispersión declarada** | Nicho de retiros psicodélicos USD 876,2M (2024) → 2.740M (2033), investigación comercial. Turismo médico USD 30.500-107.500M (2024) según la consultora, → ~142.000M (2034). La dispersión de más de 3x entre firmas queda escrita en el texto |
| Empleo del pilar | **Retirado, no resuelto** | Ver abajo |

**El hallazgo que justificó la investigación entera.** Las cifras de empleo (decenas de miles de puestos) y la fila de ingresos de la TABLA 13.2 (USD 1.000-2.000M al 2036) eran **incompatibles con el mercado que el documento decía estar atacando**: implicaban que la Argentina sola se quedaba con cerca de la mitad del nicho global de retiros psicodélicos. La corrección no fue bajar las metas sino **nombrar el mercado**: el pilar juega en turismo médico, no en el nicho psicodélico, y ahí una participación de uno o dos puntos es ambiciosa y posible.

Eso confirmó desde la aritmética lo que la Sección 29 ya había decidido por reputación — **el pilar solo cierra si es medicina** —, de modo que la reformulación de la Sección 9.4 no era cosmética. La cifra de empleo se **retiró del documento** hasta que exista un modelo que la sostenga contra el mercado correcto.

**Lo único que sigue abierto:** el aviso de la embajada de EE.UU. en el Perú de 2024 sobre lejanía médica está citado vía fuente secundaria y falta el original; y nadie recalculó la fila de la TABLA 13.2 contra el mercado correcto, lo que quedó escrito en la propia tabla como tarea de la Pre-Fase.

---

### D-016 · Este mismo archivo usa el id D-013 dos veces

**Encontrada:** 2026-08-03, al registrar la deuda del bloque de atracción de PLANSUS
**Dónde:** `docs/DEUDAS.md` — líneas 229 y 346

El id `D-013` está asignado a dos deficiencias distintas y sin relación: «El test del corpus de PLANes tiene el total a mano y se rompe cada vez» y «V-FIN-05 suma el piso sustitutivo a los pisos que sustituye». Son de sesiones distintas y ninguna de las dos sabía de la otra.

La causa es estructural y va a repetirse: **el archivo no está ordenado por id**. Las entradas viven en dos zonas —el cuerpo y un bloque posterior— y los ids se intercalan, de modo que mirar el final del archivo para averiguar el último id usado da una respuesta equivocada. Es exactamente lo que pasó al registrar D-015: se leyó «D-013» al final, se asumió que el próximo libre era D-014, y D-014 ya existía en la línea 250. Se detectó por el índice, no por el procedimiento.

**Por qué no se arregló en el momento:** renumerar una de las dos D-013 rompe los anclas del índice y cualquier referencia externa, y elegir cuál se renumera es una decisión sobre el historial ajeno. La sesión que lo encontró estaba cerrando otra cosa.

**Cómo se arregló (2026-08-03):** la segunda D-013 —la de V-FIN-05, la más nueva— pasó a [D-019](#d-019--v-fin-05-suma-el-piso-sustitutivo-a-los-pisos-que-sustituye--resuelta), con su fila de índice. La renumeración la hizo la sesión que había elegido mal el número, así que no fue una decisión sobre historial ajeno.

**Y la guardia que pedía está escrita:** `SocialJusticeHub/tests/unit/deudas-registro.test.ts`, en CI. Con una corrección sobre lo que esta entrada pedía, que corresponde dejar anotada: **prohibir que un id aparezca dos veces habría sido incorrecto.** El archivo tiene la convención de darle a una deuda resuelta un segundo encabezado con el mismo id y el mismo título —así están D-001, D-002 y D-009—, y esa guardia habría empujado a borrar el registro de cómo se cerraron, que es exactamente lo que este archivo dice que no se hace. La guardia detecta lo que esta entrada describe de verdad: **un id que nombra dos deficiencias distintas**, medido por el título y no por el conteo. Verifica además que el índice y el cuerpo se cubran en las dos direcciones — y al correrla por primera vez encontró que [D-018](#d-018--budget_class-del-registro-no-es-monótono-en-dólares) no tenía fila en el índice.

---

### D-017 · PLANGEO promete secciones `[INTERNO]` que no existen

**Dónde:** `Iniciativas Estratégicas/PLANGEO_Argentina_ES.md` — nota de clasificación estratégica del encabezado; `PLAN_REGISTRY.yml` línea 269
**Encontrada:** 2026-08-03, al escribir el spec del bloque de mecanismos de PLANGEO
**Severidad:** media
**Estado:** abierta

La nota de clasificación de PLANGEO declara que el documento «existe en dos versiones» —pública e interna— y que «las secciones marcadas como [INTERNO] en futuras versiones no se incluirán en la versión pública». El registro lo respalda: `public_visibility: interno`, `phase: research-only`, `mission_matrix: Ámbar`.

**No hay una sola marca `[INTERNO]` en las 1.570 líneas del documento, y no existe versión pública derivada.** La distinción es una promesa de la cabecera que ningún mecanismo implementa: hoy PLANGEO es un archivo único y todo su contenido tiene el mismo estatus, incluido el material que la propia corrección 13.B manda mantener fuera de la plataforma pública («doctrina antiimperialista → eliminada de plataforma pública; queda en doctrina interna»).

**Por qué importa ahora:** el spec `v2/docs/specs/2026-08-03-plangeo-mecanismos.md` necesita alojar el Registro de Presión (S27.5) con compuerta de tranche, y una compuerta declarada sin marcado real es exactamente la misma promesa vacía. El bloque puede escribirse igual —la compuerta queda como texto— pero no hay forma de hacerla operativa hasta que exista el marcado.

**Por qué no se arregló en el momento:** decidir qué secciones de PLANGEO son internas es una decisión editorial sobre material ajeno al bloque nuevo, y afecta al menos a S12 (doble capa), S13 (eje US-China) y S19 (Malvinas). La sesión estaba diseñando otra cosa.

**Cómo se arregla:** definir el criterio de marcado, aplicarlo a las secciones existentes, y agregar una guardia que falle si un documento con `public_visibility: interno` en el registro se copia a `client/public/docs/` o `dist/` sin filtrar — porque hoy `PLANGEO_Argentina_ES.md` ya está publicado tal cual en `SocialJusticeHub/client/public/docs/`, que es la consecuencia práctica de que la distinción no exista.

---

### D-018 · `budget_class` del registro no es monótono en dólares

**Dónde:** `Iniciativas Estratégicas/PLAN_REGISTRY.yml`, campo `budget_class` de las 26 entradas
**Encontrada:** 2026-08-03, escribiendo la SECCIÓN 12 de PLANPUERTA, al intentar declarar su propia clase
**Severidad:** media
**Estado:** abierta

El campo `budget_class` usa una escala `XS · S · M · L · XL` que **no ordena por presupuesto**, y no hay leyenda publicada en ningún lado del corpus que diga qué mide.

Los contraejemplos son directos, cruzando el registro contra `PRESUPUESTO_CONSOLIDADO_BASTA.md`:

| PLAN | `budget_class` | Inversión declarada |
|---|---|---|
| **PLAN24CN** | **XS** | USD 26.350-73.000M (`:33`) |
| **PLANISV** | **S** | USD 1.000-3.000M (`:35`) |
| **PLANCUL** | **S** | **USD 0** — diseño parasitario (`:41`) |

Un `XS` que cuesta veintiséis mil millones y un `S` que cuesta cero no pueden estar en la misma escala midiendo lo mismo. Las lecturas posibles son al menos tres —inversión total, gasto anual en régimen, o carga sobre el presupuesto **nacional** después de descontar autofinanciamiento— y el campo no dice cuál.

**Consecuencia inmediata:** PLANPUERTA declaró su clase **S** como *decisión de diseño* y no como medición, y lo dejó escrito así en su SECCIÓN 12. Cualquier PLAN que se escriba después tiene el mismo problema, y cualquier lector que ordene el corpus por este campo obtiene un orden falso.

**Qué haría falta:** publicar la leyenda (qué mide y con qué cortes), o derivar el campo de `PRESUPUESTO_CONSOLIDADO_BASTA.md` en vez de escribirlo a mano. Mientras tanto, ningún documento debería tratar la letra como si fuera comparable entre PLANes.

---

### D-023 · La SECCIÓN 9 de PLANPUERTA se pasó 248 palabras del techo y nadie lo vio

> **Sobre el id.** Esta entrada nació como una segunda `D-019`, colisionando con la de V-FIN-05, y **entró sin fila de índice** — que es por qué la colisión no la vio nadie leyendo el archivo. La encontró `tests/unit/deudas-registro.test.ts`, la guardia que pidió [D-016](#d-016--este-mismo-archivo-usa-el-id-d-013-dos-veces) justamente para esto, y que ya estaba en rojo antes de este tramo. Se renumeró a D-023 —el próximo libre— aplicando el precedente escrito en D-016: **se renumera la más nueva de las dos.** La de V-FIN-05 es del commit `aede891` y ésta del `3831a4d`, que es posterior. Renumerada el 2026-08-02 con la entrada de PLANPUERTA al canon.

**Dónde:** `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`, `## SECCIÓN 9: EL MARCO DE LA PUERTA`
**Encontrada:** 2026-08-03, en el fix de la Task 10, midiendo los rangos de todas las secciones
**Severidad:** baja
**Estado:** abierta

El rango de la SECCIÓN 9 es **2.000-2.400** palabras y el reporte de la Task 7 la dejó en **2.389**, dentro. Hoy mide **2.648**: **248 por encima del techo.**

El salto entra entero en un commit: `d21078a` («Fix los dos Critical y los siete Important de la revisión de la Task 8»), que le agregó a la SECCIÓN 9 el apartado **«La garantía del cruce»** y **«La fórmula del freno»**. Las dos adiciones eran correctas y necesarias —las pedía la revisión—, pero **ninguna vino con la poda compensatoria**, y el rango no se volvió a medir después de esa tarea. `2390 → 2648` entre `6a5a4bd` y `d21078a`.

Hay además dos desbordes chicos del mismo tipo: **SECCIÓN 2 en 1.411 contra un techo de 1.400** (11 de más, desde que se escribió).

**Dónde está la grasa, si alguien la poda:** el apartado *«El techo de los doce meses»* repite casi textual lo que la SECCIÓN 6 ya escribe en D11 («adentro de ese techo cada colegio fija la duración de su materia; pasarlo requiere un Caso de Mesa»), y el primer párrafo de *«La garantía del cruce»* repite el de la SECCIÓN 7 sobre el artículo 10 de la Ley 17.622.

**Por qué no se arregla acá:** el fix de la Task 10 tenía alcance escrito y la revisión aprobó la sección como pieza. Podar 248 palabras de la sección más citada del documento es trabajo propio, no un efecto lateral de otro fix.

**Qué haría falta:** que `scripts/verificar-planpuerta.ts` mida los rangos por sección y falle, en vez de dejarlos en el reporte de cada tarea. Un techo que solo vive en un `.md` de reporte se pasa el día que la tarea siguiente no lo relee.

---

### D-020 · El conteo canónico vive hardcodeado en siete lugares y ninguno avisa cuando queda viejo — RESUELTA

**Dónde:** `SocialJusticeHub/client/src/components/arquitecto/PlanEditor.tsx:8`, `SocialJusticeHub/shared/arquitecto-data.ts:2` y `:70`, `SocialJusticeHub/shared/validation-engine.ts:11`, `SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts:59`, `v2/scripts/content/verify-planes-index.ts:34`, `v2/scripts/content/planes-sources.ts:2`
**Encontrada:** 2026-08-02, migrando el canon de 26 a 27 con la entrada de PLANPUERTA
**Severidad:** media
**Estado:** **resuelta** en el mismo commit que la encontró

La autoridad del conteo es `Iniciativas Estratégicas/PLAN_REGISTRY.yml` (`thematic_count`). Pero el número está **copiado a mano en siete lugares más**, y ninguno tiene forma de enterarse cuando el registro se mueve. La migración de 22 a 26 del 2026-08-01 movió el registro y dejó atrás por lo menos dos de esas copias durante un día entero:

- **`PlanEditor.tsx:8`** decía `term: 'veintidós PLANes (al 23 de abril de 2026)'`. **Es un glosario normativo:** la lista de términos canónicos contra la que el editor marca violaciones. Con el canon en 26, ese glosario marcaba **el conteo correcto como violación** — el peor modo de falla posible para una guardia, porque es silencioso y va en la dirección equivocada.
- **`arquitecto-data.ts:2`** decía «Extracted from 22 PLANes + support documents (April 2026)», y `:70` encabezaba la tabla de nodos con «PLAN NODES (22 mandatos)» mientras la tabla tenía 26.

**Las otras cinco copias sí estaban al día en 26**, y las cinco había que moverlas a 27 en este tramo: `validation-engine.ts:11` (`EXPECTED_PLAN_COUNT`, que dispara V-REF-02 como ERROR), `pisos-constitucionales.test.ts:59` (la lista `SIN_PISO`, que es **opt-in**: un PLAN nuevo que no se agrega no rompe nada hasta que alguien mira), `verify-planes-index.ts:34` (`TEMATICOS_ESPERADOS`) y las dos cabeceras de prosa de `planes-sources.ts` y del índice generado.

**Por qué se anota aunque se resuelva.** El defecto no fue el número: fue que **ningún chequeo mira los conteos escritos en prosa dentro del código**. Las guardias del corpus vigilan los documentos; el código las escribe. Que dos de las siete copias hayan quedado viejas un día entero sin que nada fallara es la medición de ese hueco, y la próxima migración lo va a repetir salvo que alguien derive el número del registro en vez de copiarlo.

**Qué haría falta:** un test que lea `thematic_count` de `PLAN_REGISTRY.yml` y lo compare contra `EXPECTED_PLAN_COUNT`, `TEMATICOS_ESPERADOS`, `PLAN_NODES.length`, `STRATEGIC_INITIATIVES.length` y el término del glosario de `PlanEditor.tsx`. Cinco `expect` contra una sola fuente. Mientras no exista, cada migración del canon es una lista opt-in que sale verde incompleta.

---

### D-021 · Quedan conteos viejos en la prosa publicada, y ninguna guardia los mira

**Dónde:** `SocialJusticeHub/shared/strategic-initiatives.ts:1786`, `:1844`, `:2919`; `SocialJusticeHub/client/src/pages/UnaRutaParaArgentina.tsx:1093`; `SocialJusticeHub/client/src/content/ensayos.generated.ts:437` y `:536`; `SocialJusticeHub/client/src/components/arquitecto/PlanEditor.tsx:16`
**Encontrada:** 2026-08-02, barriendo conteos viejos durante la migración a 27 (ver D-020)
**Severidad:** baja
**Estado:** **parcialmente resuelta 2026-10-09** — el resumen de PLANGEO ya no fija un número; las demás filas siguen

**Resolución parcial, 2026-10-09 (rama `codex/argentina-ideal`).** La primera fila de la tabla quedó resuelta: el resumen de PLANGEO (`strategic-initiatives.ts:1786`) ya no dice «son 22 PLANes simultáneos (al 23 de abril de 2026)» sino «son muchos PLANes en marcha al mismo tiempo», sin fijar un número que el canon ya cambió. Se corrigió en la fuente y en sus copias (`v2/scripts/content/planes-sources.ts`, la ficha del plan y el índice que alimenta el listado), que un test exige que coincidan. Aparte, en v2 la web pública dejó de escribir «22» a mano: `Bienvenida`, `UnaRutaParaArgentina` y `PlanesGrid` dicen ahora el número que da el registro. Esas líneas no eran filas de esta tabla, que lista solo v1.

**Siguen abiertas** las demás filas (`:1844`, `:2919`, `UnaRutaParaArgentina.tsx:1093` de v1, los dos casos de `ensayos.generated.ts` y el historial de `PlanEditor.tsx`), y falta el chequeo de repo que las busque. Además, `strategic-initiatives.ts:1794` —un párrafo del mismo PLANGEO que dice «propone 22 PLANes simultáneos (al 23 de abril de 2026)»— no estaba en la tabla original y sigue diciendo 22.

Además de las siete copias estructurales de D-020, **el número viejo sobrevive en la prosa que se le muestra al lector**. Todos estos decían 22 y, salvo el primero (resuelto el 2026-10-09), lo siguen diciendo:

| Dónde | Qué dice | Qué es |
|---|---|---|
| `strategic-initiatives.ts:1786` | «son 22 PLANes simultáneos (al 23 de abril de 2026)» | `summary` de PLANGEO — se publica. **Resuelto 2026-10-09** |
| `strategic-initiatives.ts:1844`, `:2919` | «los 22 PLANes», «de 22 PLANes» | prosa de secciones de iniciativa |
| `UnaRutaParaArgentina.tsx:1093` | «22 mandatos» | copy de página pública |
| `ensayos.generated.ts:437`, `:536` | «los 22 PLANes» | generado desde `Ensayos/` |
| `PlanEditor.tsx:16` | «Ecosistema de 22 PLANes» | entrada `3.0.0` del historial de versiones |

**Los dos últimos casos no son iguales al resto y conviene separarlos.** El historial de versiones de `PlanEditor.tsx:16` es un **registro histórico**: la versión 3.0.0 efectivamente describía un ecosistema de 22, y reescribirlo sería falsificar el registro — ahí correspondería una entrada nueva, no una edición. Y `ensayos.generated.ts` es derivado de los ensayos de `Ensayos/`, que son texto de autor con tono propio y no se editan mecánicamente.

**Por qué no se arregló acá:** el tramo tenía alcance escrito —el acta, el registro, el nodo del grafo y las cabeceras— y ninguna de estas líneas es un conteo de record que rompa una guardia. Son prosa. Corregirlas es trabajo propio, con criterio caso por caso.

**Qué haría falta:** decidir por cada uno si es prosa fechada (se deja, con la fecha visible) o afirmación presente (se actualiza), y después un chequeo de repo que busque `\b(22|26) PLANes\b` y `veintidós PLANes` fuera de los archivos declarados como históricos.

---

### D-022 · Los cuatro PLANes de julio nunca entraron a `PRESUPUESTO_CONSOLIDADO_BASTA.md`

**Dónde:** `Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md`, tabla de la sección 1 («INVERSION TOTAL POR PLAN», `:21-37`)
**Encontrada:** 2026-08-02, al ir a anexar la fila de PLANPUERTA y ver contra qué se anexaba
**Severidad:** media
**Estado:** abierta

La tabla de inversión por PLAN llega hasta **la fila 16 (PLANCUL)** y ahí termina. **PLANPACTO (23), PLANARCO (24), PLANPREGUNTA (25) y PLANFOCO (26) no tienen fila**, aunque los cuatro tienen presupuesto declarado en su documento y en `arquitecto-data.ts`. PLANFOCO aparece una sola vez en todo el archivo, en `:419`, y no como fila sino como nota sobre quién es dueño de la publicidad oficial.

La consecuencia es que **el resumen consolidado de `:42-47` —«total acumulado», «promedio anual», «% del PBI»— se calcula sobre dieciséis PLANes de veintisiete.** Cualquiera que ordene o sume el ecosistema por este documento obtiene un número que no mide el ecosistema. Es el mismo tipo de defecto que motivó a PLANPACTO: un número consolidado que nadie recalculó cuando el conjunto cambió.

**PLANPUERTA sí tiene fila, y va en un anexo al final del archivo, no en la tabla.** El motivo está escrito ahí: la tabla arranca en `:21` y hay más de ochocientas citas `ARCHIVO:línea` en el corpus, varias contra este documento por encima de `:37`. Insertar una fila en el medio corre todas las líneas de abajo. Anexar preserva las citas y cuesta que la tabla quede partida en dos.

**Qué haría falta:** completar el anexo con los cuatro que faltan y recalcular el resumen consolidado sobre los veintisiete, dejando la tabla original intacta y marcándola como histórica. Eso es trabajo de contabilidad del corpus, no un efecto lateral de agregar un PLAN.

---

### D-024 · Hay dos suites de tests en el repo y sólo una corre en CI

**Dónde:** `v2/scripts/vitest.config.ts` (`content/__tests__/**`, `build/__tests__/**`), `v2/apps/*` y `v2/packages/*` contra `.github/workflows/socialjusticehub-ci.yml`
**Encontrada:** 2026-08-03, en la Task 13 de PLANPUERTA, corriendo la suite de v2 a mano al final del tramo
**Severidad:** media
**Estado:** abierta

El único workflow que corre sobre el corpus es `socialjusticehub-ci.yml`, y su paso de tests es `npm run test:unit` **adentro de `SocialJusticeHub/`**. Los tests de `v2/` no los corre nadie en CI.

La consecuencia es medible y ya ocurrió: **tres tests de `v2/scripts/content/__tests__/` quedaron rojos el 2026-08-02** al entrar PLANPUERTA al canon —`split-documento-plan.test.ts`, `planes-sources.test.ts` y `validar-campos-planos.test.ts`, los tres por el mismo literal de conteo— y **nadie se enteró durante un día entero**. Los encontró una corrida a mano al cierre del tramo, no una guardia. El de `split-documento-plan` venía además nombrado como roto en el registro de cierre del tramo D, sin que nada lo pusiera en rojo.

Los tres se arreglaron derivando el conteo de `PLAN_REGISTRY.yml` (`v2/scripts/content/__tests__/canon-registro.ts`), que cierra la clase de defecto. **Lo que queda abierto es la causa de que nadie se enterara.**

**Por qué no se arregla acá:** meter `v2` al workflow de `SocialJusticeHub` mezcla dos árboles con gestores de paquetes distintos (`npm` contra `pnpm`), y hacerlo bien es un job aparte con su propio `setup-node`, su propio caché y su propio `paths`. Es trabajo de infraestructura, no un efecto lateral de agregar un PLAN.

**Qué haría falta:** un job `validate-v2` en el mismo workflow o en uno propio, con `pnpm` y al menos `pnpm test:scripts` + `pnpm type-check:scripts` + `pnpm lint:scripts`, disparado por `paths` sobre `v2/**` **y** sobre `Iniciativas Estratégicas/**` — porque estos tests leen el corpus y se rompen cuando el corpus cambia, que es exactamente lo que pasó.

---

### D-025 · `tsc` de la app de campo está en rojo por una fuga de `@types/react@18`

**Dónde:** `v2/apps/mobile/src/components/ui/Pressable97.tsx`, contra `v2/node_modules/.pnpm/@types+react@18.3.28/`
**Encontrada:** 2026-08-04, corriendo `npx tsc --noEmit` al empezar el diseño de El Registro
**Severidad:** baja
**Estado:** RESUELTA 2026-08-04 — de rebote, al sacar `@shopify/react-native-skia` en la demolición del juego (rebanada 2 de El Registro). Skia era quien arrastraba la copia vieja de los tipos. `npx tsc --noEmit` en `apps/mobile` devuelve **0 errores**. No hizo falta ningún `pnpm.overrides`.

`npm run check` de `apps/mobile` devuelve **cuatro errores**, todos en el mismo archivo: uno de `createAnimatedComponent` sobre `Pressable` y tres de parámetros `e` con `any` implícito derivados del primero.

La causa no está en el código. `apps/mobile/package.json` declara `@types/react ~19.2.2`, pero el error cita el `ReactNode` de **`@types/react@18.3.28`** resuelto desde la raíz del workspace. Son dos copias de los tipos de React en el mismo árbol, y la vieja gana en ese punto.

**Por qué no se arregla acá:** el diseño de El Registro no toca el árbol de dependencias, y `Pressable97.tsx` es una de las pocas piezas de `src/` que sobrevive la reescritura. Tocar la resolución de pnpm en medio de un cambio de superficie mezcla dos causas de rotura.

**Qué haría falta:** un `pnpm.overrides` o un `resolutions` que fije `@types/react` a la 19 en todo el workspace, y volver a correr `npx tsc --noEmit` en `apps/mobile` y en `apps/web`. Si algo de la web dependía de los tipos 18, aparece ahí.

---

### D-026 · No hay población por celda, así que el brillo del mapa no se puede normalizar todavía

**Dónde:** `v2/packages/civic-core/src/simulacion/retrato.ts` (`voces ÷ población × 100.000`) y `coverage.ts`
**Encontrada:** 2026-08-04, diseñando el brillo de El Registro (`docs/specs/2026-08-04-el-registro.md` §6)
**Severidad:** media
**Estado:** abierta

El brillo de una celda se define como **voces distintas ÷ habitantes estimados**. Sin denominador, el mapa dibuja densidad de población en vez de participación: el microcentro brilla más que un pueblo donde habló el 40% de la gente. Eso choca con la regla 5 de la Constitución de producto — *«la participación no equivale a representatividad»*.

La fórmula ya existe y ya es honesta: `retrato.ts` calcula `voces ÷ población × 100.000`, guarda la procedencia del cálculo y tiene el camino `sinDato` para cuando falta el denominador. **Lo que no existe es el dato de población a nivel celda.** `retrato.ts` opera sobre territorios con un campo `poblacion`, que es escala provincia.

**Por qué no se arregla acá:** conseguir población por celda es un trabajo de datos —radios censales del INDEC, su geometría, y el reparto de esa geometría sobre una grilla que se arma dinámicamente según el recuadro—, no una función que falte.

**Qué haría falta:** los radios censales del INDEC con geometría, y una función en `civic-core` que reparta población de radio a celda por intersección de área. Mientras tanto, El Registro normaliza por provincia y marca las celdas como *sin denominador*, que se dibujan en el gris `sinDato` y **nunca oscuras** — oscuro ya significa «nadie habló».

---

### D-027 · Dos librerías de mapa en v2, contra la regla de una sola de cada cosa

**Dónde:** `v2/apps/web` (`maplibre-gl` ^5.24.0 vía `react-map-gl`) y `v2/apps/mobile` (`react-native-maps` 1.27.2, más `maplibre-gl` para el export web)
**Encontrada:** 2026-08-04, revisando dependencias al diseñar El Registro
**Severidad:** media
**Estado:** abierta

`v2/CLAUDE.md` es explícito: *«One of each: one map lib, one chart lib…»*. Hoy hay dos, y `apps/mobile` de hecho carga las dos —`react-native-maps` en nativo y `maplibre-gl` en la build web, vía los tres archivos `TerritoryMap.native.tsx` / `.web.tsx` / `.tsx`.

Hasta ahora era tolerable porque el mapa era una pantalla enterrada en `/territorio/mapa`. **Con El Registro el mapa pasa a ser la portada**, y las dos implementaciones tienen que dibujar la misma grilla de celdas con la misma rampa de brillo. Dos motores de render que se tienen que ver idénticos es una fuente de divergencia que ya no es barata.

**Por qué no se arregla acá:** unificar en MapLibre nativo (`@maplibre/maplibre-react-native`) es un cambio de dependencia pesada con su propia configuración de build en iOS y Android, y merece su propio ADR según la regla de dependencias pesadas de `v2/CLAUDE.md`.

**Qué haría falta:** un ADR que compare `@maplibre/maplibre-react-native` contra seguir con el split, midiendo tamaño de bundle, estabilidad en SDK 57 y cuánto código de capa se puede compartir de verdad. Si se unifica, `TerritoryMap.*` colapsa de tres archivos a uno.


---

### D-028 · Editar la portada de un PLAN corre todas sus anclas de remisión

**Dónde:** `v2/docs/plans/2026-08-03-plangeo-mecanismos.md` — orden de las tareas 6, 7 y 8
**Encontrada:** 2026-08-03, ejecutando el bloque MECANISMOS de PLANGEO
**Severidad:** media
**Estado:** abierta

El plan ordenó las ediciones forzadas **de abajo hacia arriba** justamente para que cada inserción no invalidara los números de la siguiente, y funcionó. Pero después puso la Task 7 —cabecera del documento a v1.2— **entre** la Task 6 y la Task 8, que es la que recalcula las anclas.

La cabecera es el bloque de portada, o sea lo más alto del archivo. Agregarle dos líneas corrió **las cuatro** anclas a la vez, incluidas `:207` y `:425`, que hasta ese momento el análisis daba por intocables porque toda edición forzada caía por debajo de ellas. Hubo que recalcular dos veces y tocar nueve archivos en lugar de cinco.

**Por qué importa más allá de este caso.** La regla «de abajo hacia arriba» se pensó para las ediciones *de contenido* y no cubrió la edición *de metadatos*. Cualquier cambio de versión, de conteo de secciones o de bloque de portada es, para las anclas, la edición más destructiva posible — y es justo la que uno hace al final, cuando ya cree que terminó.

**Cómo se arregla:** en los planes que editan un documento citado por línea, la tarea de cabecera va **antes** que la de contenido, o el recálculo de anclas va **al final de todo**, después de la cabecera. Nunca en el medio. La guardia de PLANGEO lo detectó las dos veces, así que el costo fue tiempo y no un corpus roto — pero lo detectó porque existe, y las guardias de los otros PLANes no verifican anclas ajenas.

---

### D-029 · Los paquetes del workspace publican TypeScript, así que nada compilado de v2 arranca en Node

**Dónde:** `v2/packages/{db,shared,civic-core}/package.json` (`main`, `types` y todos los `exports` apuntan a `./src/*.ts`) y, como consecuencia, `v2/apps/api/dist/`
**Encontrada:** 2026-08-04, preparando el pasaje de v2 a producción — al buscar qué importa la función de Vercel
**Severidad:** alta
**Estado:** abierta (rodeada por el bundle del ADR 0008 D7, no resuelta)

`apps/api` compila limpio (`tsc -p tsconfig.build.json` sale en verde y deja `dist/src/app.js`), pero **el resultado no se puede ejecutar**:

```
$ node -e "import('./dist/src/app.js')"
ERR_MODULE_NOT_FOUND: Cannot find module '.../packages/db/src/client.js'
  imported from .../packages/db/src/index.ts
```

`dist/src/app.js` importa `@v2/db`, que resuelve a `packages/db/src/index.ts` — TypeScript crudo. Node 22 le saca los tipos y sigue, y recién ahí se cae, en el `./client.js` que no existe porque al lado sólo hay `client.ts`.

**Por qué no se había visto.** Nada ejercita esa ruta. Los 182 tests de integración importan `createApp()` bajo vitest, que transpila al vuelo; `pnpm dev` corre con `tsx`; y `pnpm --filter @v2/api start` —el único comando que usaría `dist/`— nunca se corrió, porque v2 nunca se desplegó. El `build` verde de CI compila y no ejecuta: mide que los tipos cierran, no que el artefacto arranca.

**Por qué no se arregla acá:** la salida limpia es `exports` condicionales (`development` → `./src/index.ts`, `default` → `./dist/index.js`) en los tres paquetes, con sus cuatro subpaths, más `resolve.conditions` en vite y vitest y el equivalente para `tsx`. Son tres paquetes, doce entradas y tres configs de herramienta, todo por debajo de una suite de 182 tests de integración que hoy está verde. Cambiar la resolución de módulos de todo el workspace en el mismo movimiento que se estrena un host es mezclar dos causas de rotura.

**Qué haría falta:** los `exports` condicionales, y después un test que valide lo que el `build` no valida — importar el artefacto emitido desde Node puro y afirmar que expone lo que promete. Sin ese test, el próximo `build` verde vuelve a no significar nada.

---

### D-088 · El brillo dibujado es invertible: delata cuánta gente habló en una celda

> **Renumerada 2026-09-22.** Nació como D-028, el mismo id que ya tenía «Editar la portada de un PLAN corre todas sus anclas» (D-046). Las remisiones de las specs de la tierra, la señal, la corroboración y el registro se corrieron a D-088 en el mismo commit.

**Dónde:** `v2/packages/civic-core/src/brillo.ts` (`intensidadDeBrillo`) junto con `v2/packages/civic-core/src/coeficientes-luz.ts`, que el barril exporta
**Encontrada:** 2026-08-04, en la revisión final de la rebanada 1 de El Registro
**Severidad:** alta cuando entre la rebanada 4; hoy inerte porque no hay endpoint ni datos
**Estado:** abierta

`intensidadDeBrillo` es una función invertible y sus dos coeficientes son públicos. Con `PARTICIPACION_PLENA` y `CURVA` a la vista, cualquiera despeja:

```
voces distintas = habitantes × PARTICIPACION_PLENA × intensidad^(1/CURVA)
```

Verificado numéricamente: una intensidad de 0,1720 sobre 1.000 habitantes invierte exactamente a **1 voz**. Es decir que una celda rural encendida al mínimo publica que ahí habló **una sola persona**, y en una celda de pocos habitantes eso alcanza para saber quién.

`LuzCelda` fue diseñada sin llevar conteos crudos, y eso está bien, pero **no alcanza**: la intensidad los reconstruye. La supresión de grupos pequeños que la Constitución de producto ya exige para la Radiografía no se puede aplicar sobre las luces que salen — tiene que aplicarse sobre los `ConteoCelda` que entran.

**Por qué no se arregla acá:** la rebanada 1 no tiene endpoint ni consumidores, así que no hay nada que suprimir todavía. Y la supresión es una decisión de política —qué umbral, qué se devuelve por debajo de él— que pertenece al diseño del endpoint, no a una función pura de dibujo.

**Qué haría falta:** que `GET /api/v1/civic/map/cells` suprima antes de llamar a `luzDeCeldas`, y que la respuesta distinga «suprimida por grupo chico» de «sin denominador» y de «nadie habló» — tres estados distintos que no se pueden pintar igual, por la misma razón por la que hoy hay tres y no dos. Ojo con el orden: si la supresión llegara como una cuarta variante de `Brillo`, sería un cambio rompedor sobre una unión que para entonces van a estar importando dos apps. Conviene decidirlo al diseñar el endpoint, no después.

---

### D-030 · Las misiones de relevamiento y las campañas cívicas perdieron su captura guiada por celda

**Dónde:** `v2/apps/mobile/src/app/misiones/[id].tsx`, `v2/apps/mobile/src/app/territorio/misiones/[id].tsx` (función `capture`), `v2/apps/mobile/src/app/territorio/index.tsx` (función `play`)
**Encontrada:** 2026-08-08, en R2 Task 5 (borrado de la superficie del juego)
**Severidad:** media — el botón sigue existiendo y sigue llevando a algo real, pero la misión de relevamiento ya no acredita la celda automáticamente
**Estado:** abierta

`src/app/expediciones/[id].tsx` era, al mismo tiempo, la pantalla del juego (ritual guiado, brasas, hitos, ascenso de rango) **y** la única pantalla que sabía cerrar el círculo de una captura de misión: fundaba/reutilizaba la expedición, llamaba `recordCampaignCapture` y eso completaba la celda vía `completeActiveMissionCell`. Al borrar el juego entero (game/brasas, game/expediciones, stores/juego, stores/rangos-check, components/juego) esa pantalla no podía sobrevivir con su lógica intacta — habría significado mantener viva toda la economía de brasas y el sistema de rangos sólo para esta bisagra.

Se optó (decisión del dueño del repo, tras reportarlo) por cortar el vínculo: el botón "Hallazgo"/"Capturar →" en `misiones/[id].tsx`, `territorio/misiones/[id].tsx` y las tarjetas de campaña en `territorio/index.tsx` ahora navegan directo a `/aportar`, sin fundar expedición, sin `prepareMissionCellCapture`, sin llamar `recordCampaignCapture`. En `territorio/misiones/[id].tsx` sólo queda un camino real para cerrar una celda: "Recorrí y no registré un hallazgo" (GPS, `completeAssignedMissionCellWithoutFinding`) — que acredita el recorrido, pero nunca un hallazgo positivo.

`civic/campaigns.ts` (`recordCampaignCapture`, `campaignForExpedition`) y `civic/missions.ts` (`prepareMissionCellCapture`) quedaron sin ningún consumidor de UI. Se dejaron intactos y probados (no son juego, son Protocolo Vivo) porque la próxima captura cívica los va a necesitar de nuevo.

**Por qué no se arregla acá:** reconstruir una captura guiada por celda sin el ritual del juego es diseño de producto — qué pasos pedir, si hay micro-UI, cómo se ve — no una consecuencia mecánica de borrar el juego. R2 Task 5 es una tarea de demolición, no de reconstrucción.

**Qué haría falta:** una pantalla de captura cívica propia (sin brasas, sin rango) que reciba `missionId`/`missionCellId` como `expediciones/[id].tsx` los recibía, y que llame `recordCampaignCapture`/`completeActiveMissionCell` al cerrar. Mientras no exista, las misiones de relevamiento con plantilla sólo pueden cerrar celdas "sin hallazgo".

---

### D-031 · Cabos sueltos menores del borrado del juego (R2 Task 5)

**Dónde:** varios
**Encontrada:** 2026-08-08
**Severidad:** baja — cosmético o dead code inerte, nada roto
**Estado:** abierta

Encontrados durante la demolición, fuera del alcance explícito de la tarea (que era borrar `src/game/`, `src/cielo/`, las pantallas del juego y podar `db/repos.ts` + `src/content/`), así que quedaron sin tocar:

- `react-native-qrcode-svg` (`v2/apps/mobile/package.json`) quedó sin ningún importador — su único consumidor era `qr.tsx`, borrado. La tarea sólo pedía sacar `@shopify/react-native-skia`.
- `civic/workflow-navigation.ts` (`missionExpeditionLinkKey`) quedó sin llamador fuera de su propio test — lo usaba `territorio/misiones/[id].tsx` antes de D-030.
- `v2/apps/mobile/package.json` sigue con `"name": "juego"`.
- Copy suelta que todavía nombra "el juego" o "el Cielo" sin que rompa nada: `ajustes.tsx` (título de sección "La ética del juego", la línea de ÉTICA sobre la bitácora, el `app: '¡BASTA! — el juego'` del export JSON), `content/textos-ui.ts` (`NOTIFICACIONES.tuCieloEspera`).

**Por qué no se arregla acá:** ninguno compila mal ni rompe un test; tocarlos era ensanchar una tarea ya de por sí grande (12+ pantallas, dos archivos de infraestructura, todo `src/content/`) con cambios de producto (renombrar el paquete, reescribir copy) que nadie pidió.

**Qué haría falta:** una pasada de limpieza chica, después de que la Task 6 (renombre de `stars`→`senales` y migración) asiente el resto del vocabulario.

---

### D-032 · Los ensayos del Ciclo I glosan PLANMESA como soberanía alimentaria, y hace meses que no lo es

**Dónde:** `Ensayos/presidencia, democracia y belleza/04-arquitectura.md:211`, `Ensayos/presidencia, democracia y belleza/05-soberania.md:226`, `Ensayos/presidencia, democracia y belleza/06-belleza.md:221`, `Ensayos/00-ANALISIS.md:183`
**Encontrada:** 2026-08-10, escribiendo la Cartografía del ensayo 1 del Ciclo IV — La Mesa
**Severidad:** media — no rompe ninguna guardia ni ningún build, pero le miente al lector sobre qué es un PLAN del canon
**Estado:** abierta

Las cartografías del Ciclo I remiten a *PLANMESA* con glosas alimentarias heredadas de una versión vieja del plan:

- `04-arquitectura.md:211` — "*PLANMESA* — soberanía alimentaria."
- `05-soberania.md:226` — "*PLANMESA* — soberanía alimentaria; la mesa como la república más chica."
- `06-belleza.md:221` — "*PLANMESA* — la comida bien preparada como acto cívico."
- `00-ANALISIS.md:183` — mapea *"The sovereignty of the hearth"* a "PLANCUIDADO (cuidado), PLANMESA (alimento)".

PLANMESA hoy es, según `v2/content/planes/PLANMESA.mdx`, el **Plan Nacional de Mesa Civil, Decisión por Mérito Demostrado y República que Aprende**: Mesas Civiles, Credencial de Materia, ciclo LDEA. No tiene nada alimentario ni doméstico. La soberanía alimentaria vive en PLANISV. La "mesa" del nombre es la mesa donde se decide, no la mesa donde se come — y las cuatro glosas leen exactamente la palabra al revés.

El Ciclo II ya lo tiene bien: `Ensayos/indagaciones/06-amor-sin-apego.md` cita "*PLANMESA* (*Mesa Civil*) — cargos ejecutivos que no pertenecen a ningún partido". O sea que la deriva quedó sólo en el Ciclo I y en el análisis.

**Por qué el guardián no lo ve.** `v2/scripts/content/verificar-ciclo-la-mesa.ts` —y las guardias equivalentes— sólo verifican que el token `PLAN[A-Z0-9]+` citado en una Cartografía **exista** en `v2/content/planes/`. Nadie compara la glosa contra el `nombreInstitucional` ni contra el `summary` del PLAN. Una remisión puede apuntar a un plan real y describir otro plan y pasar en verde.

**Por qué no se arregla acá:** el spec del Ciclo IV (`v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md`) deja explícitamente fuera de alcance editar los ciclos ya publicados. Tocar cuatro cartografías del Ciclo I desde una tarea del Ciclo IV mezcla dos causas de cambio en un mismo commit, y esos cuatro archivos tienen superficie de publicación en `v2/` (`.mdx`, `content-txt`, tests de registry) que habría que mover junto.

**Qué haría falta:** reescribir las cuatro glosas contra el `nombreInstitucional` vigente de PLANMESA —y, donde la intención original era alimentaria, reapuntar la remisión a PLANISV, que es donde esa soberanía se mudó—, propagar a la superficie publicada en `v2/`, y después una guardia que cruce cada token de PLAN citado en una Cartografía contra el `summary` de su `.mdx`, aunque sea por solapamiento de sustantivos, para que la próxima mudanza de dominio entre PLANes no deje glosas huérfanas en la prosa.

---

### D-033 · `pnpm format:check` falla en 564 archivos preexistentes, `scripts/content/` incluido

**Dónde:** `v2/` — corrida completa de `pnpm format:check`
**Encontrada:** 2026-08-10, verificando la Task 10 (publicación del Ciclo IV — La Mesa a v2)
**Severidad:** baja — no bloquea build ni tests, sólo el paso de formato del checklist
**Estado:** abierta

`cd v2 && pnpm format:check` reporta 564 archivos con estilo fuera de Prettier — entre ellos todo `packages/db/src/schema/*.ts`, `packages/civic-core/src/*.ts`, y los seis scripts ya existentes en `scripts/content/` (`verify-ensayos-interdependencia.ts`, `verify-planes-index.ts`, `html-to-md.ts`, etc.). Es deriva preexistente, no algo que esta tarea haya introducido: `scripts/content/verify-ensayos-la-mesa.ts` —clonado línea por línea de `verify-ensayos-interdependencia.ts` por instrucción explícita de la Task 10— hereda el mismo desvío que su original. Ninguno de los `.mdx`/`.txt` nuevos del Ciclo IV aparece en el listado; el desvío es específicamente de los `.ts` de `scripts/` y de los paquetes, no del contenido publicado.

**Por qué no se arregla acá:** correr `pnpm format` sobre el repo entero reformatea 564 archivos ajenos a esta tarea, mezclando una limpieza de estilo con una publicación de contenido, y varios de esos archivos tienen sesiones concurrentes trabajando encima (ver D-010).

**Qué haría falta:** decidir si el `.prettierrc` vigente es el que se quiere, y si sí, una pasada de `pnpm format` de todo el repo en un commit dedicado y sin trabajo concurrente en curso; si no, revisar qué cambió en la config de Prettier para que 564 archivos ya escritos dejen de pasar el check.

---

### D-045 · `platform_feedback` es una tabla muerta que modela lo contrario del canal de escucha

**Dónde:** `v2/packages/db/src/schema/feedback.ts`, `v2/packages/db/src/repositories/feedback.ts`, migración `0005_greedy_mindworm.sql`
**Encontrada:** 2026-08-12, explorando el terreno antes de escribir el spec de `/lo-que-falta`
**Severidad:** media — no rompe nada, pero es una superficie de base de datos que nadie mantiene y que el próximo lector va a creer viva
**Estado:** abierta

`platform_feedback` existe en el esquema y en la base desde la migración `0005`, con `kind` / `subject` / `body` / `status` / `admin_response` / `page_url` / `user_agent`, y `FeedbackRepository` la envuelve en seis métodos exportados desde el barril de repositorios. **Ninguna ruta de API la toca, ninguna pantalla la muestra, ningún test la ejerce.** Las únicas referencias fuera del propio esquema están en `apps/api/dist-bundle/*.mjs`, o sea en artefactos compilados que la arrastran por el barril.

No es sólo que esté muerta: modela lo contrario de lo que la plataforma decidió. `user_id` con `references(users.id)` —o sea, feedback atado a cuenta—; el comentario dice «Admins review via the admin dashboard», un panel que en v2 no existe; `admin_response` es «visible to user via their feedback list», una lista privada por usuario; y `user_agent` se guarda crudo. Es un buzón privado, con cuenta, con panel. El canal que se construyó en su lugar (`v2/docs/specs/2026-08-12-lo-que-falta.md`) es público al instante, sin cuenta, sin dato de contacto y sin user-agent.

**Por qué no se borra acá:** sacar una tabla es una migración destructiva, y el commit que introduce `faltas` no es el lugar para mezclarla. Además hay que verificar antes que la tabla esté realmente vacía en la base de v2 y que ningún bundle desplegado la importe en runtime.

**Qué haría falta:** confirmar `select count(*) from platform_feedback` en cero, borrar `schema/feedback.ts` y `repositories/feedback.ts`, sacarlos de los dos barriles y de `drizzle.config.ts`, y una migración que haga el `drop table`. Si tuviera filas, migrarlas a `faltas` con `origen = 'afuera'` antes de borrar.

---

### D-046 · La guardia de este mismo archivo está en rojo y nadie la corre

**Dónde:** `SocialJusticeHub/tests/unit/deudas-registro.test.ts`, contra `docs/DEUDAS.md`
**Encontrada:** 2026-08-12, escribiendo el importador de este archivo al registro público de `/lo-que-falta`
**Severidad:** alta — el archivo es la memoria del proyecto y su única verificación automática lleva semanas fallando sin que nadie lo vea
**Estado:** ~~abierta~~ → **resuelta 2026-09-22**

**Resolución.** La segunda D-028 pasó a ser **D-088**, con sus remisiones corridas en las cinco specs y planes que la citaban (las que citaban la primera, la de PLANGEO, quedaron como estaban), y el índice ganó las filas que le faltaban (D-077 a D-082, D-088). `tests/unit/deudas-registro.test.ts` pasa entero por primera vez. Queda abierta la pregunta que la entrada hacía de paso: la corroboración da por resuelta a D-088 y la entrada sigue diciendo `abierta` — no se cambió porque nadie verificó el endpoint de celdas contra el diseño.

La guardia que pidió [D-016](#d-016--este-mismo-archivo-usa-el-id-d-013-dos-veces) existe y está bien escrita: verifica que un id no nombre dos deficiencias distintas y que el índice y el cuerpo se cubran **en las dos direcciones**. Corrida hoy, falla: **seis entradas del cuerpo no tienen fila en el índice** — D-025, D-026, D-027, D-029, D-030 y D-031. Son 6 de 33.

Y falla por una segunda cosa, que es la que de verdad importa: **`D-028` nombra dos deficiencias distintas y sin relación** — «Editar la portada de un PLAN corre todas sus anclas de remisión» (línea 637) y «El brillo dibujado es invertible: delata cuánta gente habló en una celda» (línea 679). Es *exactamente* lo que D-016 describió y pidió prevenir, repetido, con la guardia ya escrita mirando para otro lado. La segunda es además una deuda de privacidad, que es la peor clase para tener escondida detrás de un id compartido.

La causa de que nadie lo note es de tubería, no de disciplina. El workflow de CI corre sobre `SocialJusticeHub/**`, y las seis entradas huérfanas se escribieron desde sesiones que sólo tocaron `v2/`. O sea que **la guardia de un archivo compartido vive detrás del filtro de rutas de uno solo de los dos árboles**, y el árbol que más lo escribe hoy es el que no la dispara. Es la misma forma de D-013 (el test que se rompe cada vez): una verificación que existe y no se ejecuta es indistinguible de una que no existe, salvo por la falsa sensación de estar cubierto.

Se descubrió de rebote: el importador de `docs/DEUDAS.md` a `faltas` contó 33 entradas contra 27 filas de índice, y la diferencia llevó a correr la guardia a mano.

**Por qué no se arregló entero de una:** agregar las filas al índice es trivial, pero mover la guardia de árbol es una decisión sobre el CI de los dos proyectos, y el archivo tiene sesiones concurrentes escribiéndolo (ver [D-010](#d-010--sesiones-concurrentes-se-tragan-los-cambios-de-otras)).

**Hecho el 2026-08-18:** el índice quedó completo. Faltaban diecisiete filas y no seis —a las de D-025 a D-031 se les habían sumado las de D-062 a D-067, escritas por otra sesión sin pasar por el índice, que es la forma en que este defecto se reproduce solo—. Se generaron leyendo título, severidad y estado del cuerpo, no a mano. **Cinco de las seis comprobaciones de la guardia están en verde.**

**Lo que queda, y es lo que de verdad importa:**

1. **`D-028` sigue nombrando dos deficiencias distintas**, y es la única comprobación en rojo. Renombrar la segunda —«El brillo dibujado es invertible»— a un id libre no es editar una línea: hay **once remisiones a esa entrada en cinco documentos ajenos** (`specs/2026-08-11-c-la-corroboracion.md`, `-b-la-senal.md`, `specs/2026-08-04-el-registro.md`, `plans/2026-08-11-tierra-senal-corroboracion-registro.md`) más dos a la primera y una ambigua en `specs/2026-08-12-lo-que-falta.md`, varias escritas como «D-028 (la segunda entrada con ese id, `docs/DEUDAS.md:677`)» — o sea que el renombre tiene que arrastrar las remisiones o las deja colgadas. Es trabajo de quien tenga esos documentos en la mano.
2. **La guardia sigue detrás del filtro de rutas equivocado**, que es la causa y no el síntoma: mientras corra sólo sobre `SocialJusticeHub/**`, el árbol que más escribe este archivo es el que no la dispara, y el índice se va a volver a desincronizar. Mover la guardia a `v2/scripts/content/` con su propio paso de CI —o agregar `docs/DEUDAS.md` a los `paths` del workflow existente— sigue siendo lo que cierra esta entrada.
3. De paso: varias specs de la corroboración dan por **resuelta** a la segunda D-028 («D-028 (la segunda) resuelta por §2.9») y la entrada de acá sigue diciendo `abierta`. No se tocó desde esta sesión porque el diseño que la cerraría es de otra, pero alguien tiene que reconciliarlo.

---

### D-047 · El basemap se congela en la fecha en que se extrajo y nadie se entera

**Dónde:** `v2/apps/web/public/tiles/argentina.pmtiles`, generado por `v2/scripts/build/mapa/extraer-teselas.ts`
**Encontrada:** 2026-08-12, cerrando [D-003](#d-003--glyphs-y-teselas-del-mapa-salen-de-cdn-de-terceros) — es la contracara de dejar de depender de un CDN
**Severidad:** baja
**Estado:** abierta

Cuando las teselas las servía Carto, alguien las mantenía al día. Ahora las mantenemos nosotros, y no las mantiene nadie: el `.pmtiles` es una foto de OpenStreetMap del **12/8/2026 04:00 UTC** y va a seguir siéndolo hasta que una persona corra el script. Una calle nueva, un barrio que crece o un pueblo que se renombra no aparecen, y **no hay ningún síntoma**: el mapa se ve perfecto, sólo que viejo.

**La cadencia decidida es mensual**, y está escrita en `v2/scripts/build/mapa/README.md` junto con la fecha de la última corrida. Para un basemap cívico alcanza: lo que el mapa dibuja son provincias, calles y manzanas, que cambian en años, no en semanas.

**Por qué no se automatizó acá.** El extract necesita el binario de Go de `pmtiles`, 1,2 GB de disco y un lugar donde publicar el resultado — y ese lugar todavía no existe ([D-051](#d-051--el-pmtiles-de-12-gb-no-está-publicado-en-ningún-lado)). El cron que el proyecto ya tiene (`vercel.json` → `/api/cron/rankings`) es una función serverless: no puede correr un binario nativo ni escribir un archivo de este tamaño. Automatizarlo depende de decidir primero dónde vive el archivo; hasta entonces, un cron sería un cron que falla todos los meses.

**Qué haría falta:** una vez publicado el archivo, una tarea mensual en la máquina o el servidor que lo aloja, que invoque el script sin argumentos —resuelve solo el build vigente de Protomaps— y reemplace el archivo. Mientras tanto, la fecha del README es lo único que avisa.

---

### D-048 · La CSP viaja sólo en las respuestas de `/api/` y nunca llega al documento

**Dónde:** `v2/apps/api/src/middleware/security.ts` (montado en `apps/api/src/app.ts:44`), `v2/vercel.json`
**Encontrada:** 2026-08-12, verificando el resultado de [D-003](#d-003--glyphs-y-teselas-del-mapa-salen-de-cdn-de-terceros)
**Severidad:** alta
**Estado:** ~~abierta~~ → **resuelta 2026-08-13**, ver [Resueltas](#resueltas)

`securityHeaders()` se monta **sólo en la app de Express**, y en producción Express contesta únicamente `/api/*`: el rewrite `"/((?!api/).*)" → /index.html` de `vercel.json` sirve el documento desde el filesystem de Vercel, que no pasa por ningún middleware nuestro. `vercel.json` no tiene bloque `headers`, no hay archivo de headers estáticos y `index.html` no lleva `<meta http-equiv="Content-Security-Policy">`.

O sea que **el header `Content-Security-Policy` llega en las respuestas JSON de la API, donde no hay nada que proteger, y no llega en la página, que es donde corre el JavaScript.** La política existe, está bien escrita, tiene su test, y el navegador nunca la ve.

**Por qué importa.** Es el peor modo de falla de una defensa: no la ausencia, sino la apariencia. El código declara una CSP estricta, `v2/CLAUDE.md` la nombra como regla dura y una sesión entera de trabajo se dedicó a sacarle seis hosts de terceros — y ninguno de esos seis estaba siendo bloqueado por nadie, porque la lista nunca se aplicó. Cualquier razonamiento futuro de la forma «eso no puede pasar, lo tapa la CSP» es falso hasta que esto se arregle.

**Qué haría falta:** un bloque `headers` en `vercel.json` que sirva las mismas directivas para el documento, derivadas de la misma fuente que el middleware para que no puedan divergir. Ojo con el orden: hoy la política del middleware es `'self' data: blob:` para fuentes y tipografías, así que aplicarla al documento tal cual **rompe las tipografías de Google que la página sigue pidiendo** ([D-049](#d-049--las-tipografías-de-la-interfaz-salen-de-google-fonts-en-todas-las-páginas)). Primero se traen las tipografías, después se aplica el header.

---

### D-049 · Las tipografías de la interfaz salen de Google Fonts en todas las páginas

**Dónde:** `v2/apps/web/index.html:13-17`
**Encontrada:** 2026-08-12, midiendo qué le quedaba de terceros al mapa después de [D-003](#d-003--glyphs-y-teselas-del-mapa-salen-de-cdn-de-terceros)
**Severidad:** media
**Estado:** ~~abierta~~ → **resuelta 2026-08-12**, ver [Resueltas](#resueltas)

El `index.html` hace `preconnect` a `fonts.googleapis.com` y `fonts.gstatic.com` y carga seis familias —Anton, Archivo, Space Mono, Inter, JetBrains Mono, Playfair Display— desde ahí. Son unos siete pedidos externos por carga, **en todas las páginas del sitio**, no sólo en el mapa: Google ve la dirección IP de cualquiera que abra cualquier página.

Es la misma deficiencia que D-003 y es más grande, porque D-003 vivía en una pantalla y ésta vive en el documento base. Cerrar el mapa y dejar esto abierto sería quedarse con el gesto sin el efecto.

**Por qué se anota y no se arregla acá:** el trabajo es de la misma familia que el de los glyphs del mapa —bajar los `.woff2`, servirlos desde `/fonts/` con `@font-face` propio— pero toca el documento base y el sistema tipográfico de todo el sitio, que es superficie de diseño y no de este plan. Son seis familias con varios pesos cada una; conviene medir primero cuáles se usan de verdad, igual que se hizo con el mapa, donde de tres familias supuestas resultó que el estilo pedía una.

**Consecuencia hoy, que hay que decir en voz alta:** la política de privacidad **no puede afirmar que el navegador no le pide nada a terceros**. Puede afirmar —y afirma, desde la versión 3— que el mapa dejó de hacerlo. Ver `v2/content/legal/privacidad.mdx`, sección «Dónde viven tus datos, y qué sale del país».

---

### D-050 · El borde del recorte de teselas se ve en el agua

**Dónde:** `v2/apps/web/public/tiles/argentina.pmtiles`, recorte definido en `v2/scripts/build/mapa/extraer-teselas.ts`
**Encontrada:** 2026-08-12, al repintar el estilo (Task 5 del plan de teselas propias)
**Severidad:** baja
**Estado:** abierta — el borde marítimo tapado desde el estilo el 13/8/2026; el terrestre sigue

El archivo se recortó exactamente con las 24 provincias de `apps/web/public/geo/provincias.geojson`. Fuera de ese contorno no hay tesela, y donde no hay tesela sólo pinta la capa `background` del estilo, que es la única que cubre el lienzo entero. Mientras esa capa fue del color de la **tierra**, el mar terminaba en una línea recta y del otro lado seguía en color de tierra.

**Qué se hizo el 13/8/2026:** la capa `background` pasó al color del **agua** (`scripts/build/mapa/generar-estilo.ts`, con guardia en `estilo-oscuro.test.ts` que exige que el fondo y la capa `water` sean el mismo color). Medido en el navegador sobre `/el-mapa`, 1400×900:

| encuadre | tinta sobre agua, antes | después |
|---|---|---|
| z3,7 — la vista con la que abre la app | 18,8% del lienzo, en dos costuras verticales | 0% |
| z10 sobre Mar del Plata — un tajo vertical en el Atlántico | 37,7% | 0% |
| z5 en el Atlántico sur, la costura de la columna z4 | 29,9% | 0% |

**Lo que sigue abierto, y por qué esto no cierra:** un color plano no sabe qué hay del otro lado del recorte. Ahora el hueco se lee como mar **siempre**, así que el país vecino sin teselas se hunde: se nota de z8 para arriba pegado a un límite terrestre —Chile, Brasil, Bolivia— y en un encuadre que cae entero afuera, como Montevideo a z11, donde el 97,9% del lienzo no tiene tesela. Se eligió igual porque el reparto no es parejo: el hueco marítimo aparecía en la vista por defecto y en toda la costa, mientras que el terrestre aparece a zoom alto y sobre un encuadre que **ya está vacío de datos** —sin calles, sin etiquetas—, o sea donde el mapa ya avisó que se terminó.

**El arreglo de verdad sigue siendo el mismo:** darle un buffer a la región antes de extraer y volver a correr el script — dos minutos y unos pocos MB, según lo medido en la Task 2. Es una decisión sobre cuánto país ajeno se paga por no ver el borde, así que la toma el dueño.

**Corrección a lo que decía esta entrada:** «no se arregla en el estilo» era medio cierto y se anotó como entero. Pintar el fondo del color del agua **no** tapa el Río de la Plata —el río está adentro del recorte y lo dibuja su propia capa `water`, del mismo color— y sí hunde al vecino de al lado. Lo que el estilo no puede hacer es distinguir mar de tierra donde no hay dato; eso es lo que se cambió de creencia.

---

### D-051 · El `.pmtiles` de 1,2 GB no está publicado en ningún lado

**Dónde:** `v2/apps/web/public/tiles/argentina.pmtiles` (gitignoreado), Task 3 del plan `v2/docs/plans/2026-08-12-teselas-propias.md`
**Encontrada:** 2026-08-12, cerrando el plan con la decisión de hosting todavía abierta
**Severidad:** alta
**Estado:** abierta

El estilo apunta a `pmtiles:///tiles/argentina.pmtiles` y el archivo existe **en una sola máquina**, la de desarrollo. Está en `.gitignore` a propósito: 1,2 GB en git es irreversible. En producción no hay nada en esa ruta, así que **si esto se despliega tal cual, el mapa carga sin una sola tesela** — el fondo, las señales que dibuja React y nada más. Ningún host de terceros recibe el pedido, que era el objetivo de D-003, pero tampoco lo recibe nadie.

Las tres salidas están escritas en el plan y ninguna es de código: servidor propio con nginx (cierra la fuga del todo), Cloudflare R2 (entra cómodo, egress gratis, pero Cloudflare vuelve a ver las IPs bajo dominio propio) o descartar Vercel para un archivo de este tamaño. Lo que la decisión pide verificar a mano es una sola cosa: que el hosting devuelva **`206 Partial Content` y `accept-ranges: bytes`**. Si devuelve `200` con el archivo entero, el navegador baja 1,2 GB por tesela y hay que cambiar de hosting, no de código.

Es también la que traba a [D-047](#d-047--el-basemap-se-congela-en-la-fecha-en-que-se-extrajo-y-nadie-se-entera): no se puede automatizar la actualización de un archivo que no tiene domicilio.

### D-052 · El 37% del corpus de entrenamientos es texto generado y repetido

**Dónde:** `v2/content/courses/*/*.mdx` — 320 de las 329 lecciones
**Encontrada:** 2026-08-12, midiendo el corpus antes de proponer mejoras de contenido
**Severidad:** alta
**Estado:** ~~abierta~~ → **resuelta 2026-09-22**

**Resolución.** La cola de las cinco secciones se borró el 13/8 (`893421ee`). Lo que quedaba —el párrafo repetido hasta cuatro veces en siete lecciones de `teoria-juegos`, el `### Nuevo SVG` sin SVG, encabezados vacíos y párrafos duplicados sueltos en otros cursos— se limpió en el Ciclo 1 (22/9), curso por curso. `entrenamientos:check` vigila las dos huellas de la cola.

Las lecciones terminan con las mismas cinco secciones —«Aplicación práctica», «Cómo se ve en el territorio», «Errores comunes», «Ejercicio guiado», «Idea fuerza»— copiadas casi textualmente, con una sola variable rellenada (el ámbito del curso: «tu municipio, tu provincia» o «tu hogar, tus ingresos») y el `summary` de la lección pegado al principio. Hay **tres generaciones** distintas del mismo relleno: una con encabezados `###` en 205 lecciones, otra con `##` en 108, y una tercera en 7 lecciones de `teoria-juegos` (`Aplicación argentina` / `Errores comunes` / `Ejercicio de aplicación` / `Cierre`, con el `Cierre` byte-idéntico en las 7). La tercera apareció recién al construir el detector: la primera versión veía dos, y en esas 7 lecciones un «Errores comunes» de la tercera tapaba la cola de la primera.

Son **106.893 palabras: el 38% de las 280.966 del corpus**. Cualquiera que lea dos lecciones seguidas ve la repetición, y es la razón por la que el material se siente hecho a máquina incluso donde es bueno.

Lo que queda después de borrarlas son 174.073 palabras, y **no son todas humanas**. Medido el 2026-08-13, después del corte: 7 lecciones de `teoria-juegos-argentina-hombre-gris` conservan, *arriba* de la línea de corte, el mismo párrafo repetido hasta **cuatro veces** dentro del mismo archivo, cada vez bajo un encabezado distinto. Es el `summary` del frontmatter más una oración de plantilla («Este punto exige pasar de la definición a la lógica práctica…»). Son **28 instancias, 1.880 palabras** de texto de máquina; descontando la primera copia de cada lección, **21 copias sobrantes y 1.410 palabras, el 0,81%** de las 174.073. El detector hace bien en no tocarlas —no cumplen las tres anclas, y anclar por menos es lo que se llevaría los 168 encabezados del autor— así que salen a mano en las Tareas 7, 13 y 14.

Y el corte tuvo una consecuencia editorial en esas mismas 7: **promovió el relleno de la mitad del documento al final.** `modulo-4-senales-informacion-y-reputacion-publica.mdx` ahora cierra con cuatro secciones seguidas cuyo contenido entero es el mismo párrafo, y la última se titula `### Nuevo SVG: árbol de señales` sin ningún `<svg>` debajo. El corte no creó eso, pero lo dejó como lo último que lee quien termina la lección.

**Qué haría falta:** el borrado está especificado en `v2/docs/specs/2026-08-12-entrenamientos-ciclo-1-el-cuerpo.md`, con la parte delicada resuelta: hay 168 encabezados escritos por el autor con nombres parecidos (`Ejercicio: Mapear Bucles`, `Errores Comunes en el Diseño`) y algunas de esas secciones son lo mejor que tiene el corpus, así que el corte se ancla en tres condiciones simultáneas y lo que no las cumple va a revisión manual.

### D-053 · El catálogo anunciaba 53 horas de entrenamiento y se lee en 16 — RESUELTA

**Dónde:** `v2/content/courses/*/course.json` (`duration`), servido por `apps/web/src/lib/courses-registry.ts` a `/entrenamientos`
**Encontrada:** 2026-08-12, comparando `duration` contra el largo real de los cuerpos
**Severidad:** alta
**Estado:** **resuelta** el 2026-08-13 (Tarea 6 del Ciclo 1) — con una reserva, abajo

La suma de `duration` de los 31 cursos daba **3.163 minutos: 53 horas**. El texto propio del corpus, a la velocidad de lectura que el propio proyecto usa en blog y ensayos (`words / 220`), se lee en **957 minutos: 15,9 horas**. La cifra estaba inflada **3,3 veces**, y era un número que la página mostraba.

El caso típico: **185 lecciones declaraban 9 minutos** y su mediana era de 344 palabras propias — **1,6 minutos** de lectura. Las 38 que declaraban 8 minutos tenían 247 palabras: 1,1 minutos.

Era el caso de libro de dato inventado en pantalla, y el más visible que tenía v2. El agravante no era que el número estuviera mal calculado: **185 lecciones declaraban el mismo valor**, así que nunca se calculó.

**Cómo se resolvió.** `pnpm entrenamientos:minutaje` recalcula el `duration` de cada lección desde su cuerpo con `minutosDeLectura(contarPalabrasRenderizables(cuerpo))` —la velocidad del proyecto, `Math.max(1, Math.ceil(palabras / 220))`, por lección y sumada, nunca como división global— y reescribe `course.duration` como la suma de sus lecciones. Los 31 `course.json` pasaron de **3.163 minutos a 957**. `estimatedMinutes` salió del frontmatter de las 329 lecciones y del `lessonFrontmatterSchema`: el número vivía dos veces y ninguna de las dos era la sede.

Verificado en pantalla, que es lo único que demuestra que cambió lo que ve una persona: `accion-comunitaria` pasó de 82 minutos a 31, y la primera lección, que declaraba 9, ahora dice **3 MIN** en el navegador. Verificado también que el cambio es cirujano: los 329 `.mdx` son el archivo viejo menos exactamente la línea `estimatedMinutes`, byte a byte, y los 31 `course.json` difieren sólo en líneas `"duration"`. El corte de [D-052](#d-052--el-37-del-corpus-de-entrenamientos-es-texto-generado-y-repetido) no se tocó.

**La reserva, y es real.** `lessonFrontmatterSchema` es un `z.object` plano, no `.strict()`, así que Zod descarta las claves desconocidas en silencio: quien vuelva a escribir `estimatedMinutes` mañana no recibe ningún error, se lo ignora. Y nada impide editar un `duration` a mano en `course.json`. Lo que mantiene esto cerrado no es el schema: es la guardia que recalcula en el build, y esa se construye en la Tarea 12 del Ciclo 1. Hasta que exista, esta deuda está resuelta pero no protegida.

### D-054 · La mitad de las lecciones está escrita en tuteo, y no en rioplatense

**Dónde:** `v2/content/courses/*/*.mdx` — 151 lecciones
**Encontrada:** 2026-08-12, en la misma medición del corpus
**Severidad:** media
**Estado:** ~~a medias~~ → **resuelta 2026-09-22**

**Resolución.** La lista blanda se adjudicó a mano, curso por curso, en el Ciclo 1: de 1.870 casos quedan 380 coincidencias y todas son tercera persona («el sistema cambia», «la ley establece») o citas. Los `summary` tuteados de cinco cursos pasaron a voseo. Lo que sigue abierto es de otra naturaleza —frases del Hombre Gris escritas en tuteo— y está en D-093.

775 apariciones de formas verbales e imperativos de tuteo («tienes», «puedes», «identifica», «resume», «elige») en 151 lecciones, y **90 lecciones mezclan tú y vos en el mismo cuerpo**. El `CLAUDE.md` pide rioplatense en todo el texto de cara al usuario. Buena parte viene del relleno de [D-052](#d-052--el-37-del-corpus-de-entrenamientos-es-texto-generado-y-repetido), que está íntegramente en tuteo neutro, pero no todo: quedan cuerpos propios mezclados.

**Qué haría falta:** dos listas, no una. La dura —formas sin ambigüedad— se reemplaza y se vigila con guardia. La blanda depende del contexto: `define` aparece 127 veces y es imperativo en «Define una acción» pero indicativo en «el sistema define el resultado»; `elige` (133) y `resume` (87), lo mismo. Un reemplazo ciego ahí rompe prosa correcta. El posesivo `tu` no se toca: es idéntico en voseo.

**Lo que se hizo, y lo que se corrigió sobre la marcha.** `packages/shared/src/content/voseo.ts` implementa las dos listas y `scripts/content/entrenamientos-voseo.ts` las aplica. La corrida sobre el corpus real (no sobre oraciones sueltas) encontró que el plan original había puesto `resume`, `identifica`, `analiza`, `observa` e `imagina` en la lista **dura**, pese a que el propio análisis de arriba ya señalaba a `resume` como ambiguo igual que `define` y `elige`. Con las cinco en la dura, el primer reemplazo mecánico corrompió oraciones reales: `"La crisis nos sacó cosas", resume Diego.` (cita, 3ª persona) pasó a `resumí Diego`; `El sindicato analiza fila por fila.` pasó a `analizá`; `Como observa el Hombre Gris: "..."` pasó a `observá`; una cita en bloque con `más poderoso de lo que imagina` pasó a `imaginá`. Es el mismo problema que `define`/`elige` por la misma razón gramatical: en todo verbo regular, el imperativo de «tú» y el indicativo de «él/ella» son la misma forma, así que ningún verbo bare de esa forma es seguro sin mirar el contexto — sólo lo son los imperativos con pronombre enclítico (`llévalo`, `asegúrate`), que no tienen equivalente de una palabra en indicativo. Las cinco se movieron a la blanda antes de commitear; el detalle vive en el comentario de `voseo.ts` y en las siete pruebas de `voseo.test.ts`.

Aparte, se corrigió a mano una cita filosófica que la dura sí alcanzaba de forma válida en general pero no ahí: dos lecciones de `la-metamorfosis` citan la fórmula «Tú debes» de Nietzsche (la traducción estándar de «Du sollst», el lema del Gran Dragón) y `debes → debés` es un reemplazo correcto en el resto del corpus, pero ahí es la cita, no una orden a quien lee. Se revirtió a mano en `el-gran-dragon-las-estructuras-que-dicen-debes.mdx` (encabezado, cita y epígrafe) y en `el-leon-aprender-a-decir-no.mdx`.

Con la lista dura corregida (21 formas, bajaron 5), el script **contó 1.191 reemplazos en 319 archivos** — más que los 775/151 medidos acá porque esa medición fue sobre cuerpos propios y el script corre sobre el cuerpo completo, cola generada incluida (la cola de [D-052](#d-052--el-37-del-corpus-de-entrenamientos-es-texto-generado-y-repetido) también estaba en tuteo y ahora está en voseo donde la forma era dura). **Lo que el corpus recibió son 1.182 tokens**: los 1.191 menos los 9 que se revirtieron a mano en la cita de Nietzsche (4 en `el-gran-dragon-las-estructuras-que-dicen-debes.mdx` y 5 en `el-leon-aprender-a-decir-no.mdx`). Los dos números son ciertos y miden cosas distintas —el primero es lo que hizo la herramienta, el segundo lo que quedó escrito—, y la revisión del 2026-08-13 los reconcilió token por token sobre el diff. Acá se publican los dos porque la diferencia es justo la parte que una persona tuvo que arreglar a mano.

Y el alcance real es menor que el que sugiere el total. De las **933 líneas** que cambió el barrido, **723 caen dentro de la cola generada** que D-052 va a borrar entera: ese trabajo se tira con la cola. Afuera quedan **210** — 202 en lecciones con cola limpia y 8 en tres lecciones de `diseno-idealizado-sistemas-vivos` que no tienen cola. Esas 210 son el voseo que de verdad le llegó a quien lee.

**Lo que corrigió la revisión del 2026-08-13.** El barrido había publicado un `TÚ sos` —«Te das cuenta de que TÚ sos la luz misma»— en `sexta-persona-la-conciencia-pura.mdx`: `eres → sos` se aplicó sin ver el pronombre de al lado y quedó una forma que no existe en ninguna variedad del castellano. Dice `VOS sos`. Con ella se arreglaron cuatro pasajes más que habían quedado con un pie en cada registro: `Tenés tiempo limitado. ¿Lo usas…`, `Sos un sistema de energía. Optimiza tu flujo`, los dos ejemplos entre comillas de `"Siempre hacés lo mismo" o "Nunca me escuchas"`, y la lista de auto-evaluación de `introduccion-los-niveles-de-conciencia.mdx`, que alternaba los dos registros ítem por ítem.

La lista dura bajó de 21 formas a 17. Salieron `miras` (el sustantivo: «con las miras puestas en 2027», «miras estrechas», idiomático justo en el registro político que escribe este corpus), `haces` (el plural de `haz`, en un corpus que habla de flujos de energía) y `vives` (el apellido: «según Vives» se volvería «según Vivís»), y se borró entera la entrada `estás tú → estás`, la única que eliminaba una palabra en lugar de traducirla — el voseo enfático es «estás vos», y tirar el pronombre descarta el contraste que escribió el autor. Ninguna de las sustituciones ya aplicadas con esas tres formas se revirtió: se verificaron una por una y eran correctas. Salen para que no vuelvan a dispararse a ciegas.

**Lo que queda abierto:** la lista blanda, ahora con 36 formas, reporta **1.870 casos** en `docs/reportes/2026-08-13-entrenamientos-voseo-blando.txt` para que una persona los lea uno por uno. Antes esta entrada publicaba 1.340 con 10 formas, y ese número escondía el problema en lugar de mostrarlo: la revisión midió, con una sonda de sólo 19 formas, **al menos 46 tokens de tuteo de segunda persona inequívoco que no estaban en ninguna de las dos listas** — `piensas`, `escuchas`, `dices`, `experimentas`, `crees`, toda la clase imperativa (`Optimiza`, `Establece`, `Reduce`, `Evita`) y el pronombre `tú`, que es la mitad sistémica del `TÚ sos`: si el reporte hubiera nombrado el pronombre, nadie lo habría dejado huérfano. Las 26 formas nuevas entraron a la **blanda** y no a la dura, aunque varias sean inequívocas como forma verbal, porque `escuchas` es también «las escuchas telefónicas», `ayudas` es «las ayudas sociales» y toda la clase imperativa choca con el indicativo de tercera («la ley establece», «el sistema se auto-optimiza»).

**1.870 es lo que hoy sabemos listar, no lo que hay.** La sonda no fue exhaustiva y basta abrir un archivo para encontrar formas que siguen invisibles para las dos herramientas: `reflexiona`, en la línea 110 de `introduccion-los-niveles-de-conciencia.mdx`, no la ve ninguna lista. El remanente verdadero es mayor y no está medido.

El reporte, al menos, ya es revisable: emite `curso/archivo:línea: forma — …contexto…` en vez de `curso/archivo: forma`, con el número de línea contando el frontmatter —así sirve tal cual para abrir el archivo— y unos 80 caracteres alrededor de la forma. Antes eran 1.340 líneas indistinguibles entre sí que obligaban a volver a grepear cada archivo, y toda la justificación de tener dos listas es que una persona pueda adjudicar la blanda.

Una porción grande de esos 1.870 —no medida con precisión, pero visiblemente la mayoría de los que corresponden a `identifica`— es la misma línea de relleno de D-052 repetida (`Llevalo a un caso cercano: identifica una situación...`), ya verificada como imperativo correcto. Resolver D-052 (borrar la cola) antes de que una persona revise la lista blanda evitaría que lea la misma línea segura 200 veces buscando las pocas que de verdad son ambiguas.

**Y el script no es idempotente.** `debes` sigue en la lista dura porque `debes → debés` es correcto en el resto del corpus, así que volver a correr `pnpm entrenamientos:voseo` vuelve a pisar los 9 tokens de la cita de Nietzsche que se corrigieron a mano. Se comprobó en la corrida del 2026-08-13 —los reescribió otra vez— y se restauraron los dos archivos byte por byte; lo que no hay es nada que lo impida la próxima vez. Las salidas posibles (una lista de excepciones por archivo, mover `debes` a la blanda y perder los cinco reemplazos válidos que hizo, o aceptar que la corrección a mano se repita) son una decisión que no se tomó. Mientras no se tome: quien corra el script tiene que mirar esas dos lecciones de `la-metamorfosis` antes de commitear.

### D-055 · `contentFile` no resuelve en ninguna de las 329 lecciones, y el schema lo exige

**Dónde:** `v2/content/courses/*/course.json`, `packages/shared/src/content/courses.ts:25`
**Encontrada:** 2026-08-12, verificando qué campos de la fuente tienen lector
**Severidad:** media
**Estado:** ~~abierta~~ → **resuelta** (verificado 2026-09-22) — `contentFile` salió de los 31 `course.json` en `c6ab351e`; nadie había marcado la entrada.

Las 329 entradas de `lessons[]` declaran `contentFile: "lessons/NN-NN-….md"`, rutas del árbol de v1 que en v2 **no existen** — los cuerpos están en la raíz del directorio del curso y son `.mdx`. El campo está declarado como requerido en el schema Zod, así que v2 valida un dato que apunta a la nada en el 100% de los casos. La página funciona porque el registry deriva el slug de `key` y nunca abre `contentFile`.

Sus únicos lectores son `scripts/content/migrate-courses-v1-to-v2.ts` y `scripts/content/verify-courses-migration.ts`, que lo resuelven contra el árbol de v1. La migración terminó el 2026-05-13.

**Qué haría falta:** retirar los dos scripts de migración de cursos —su trabajo está hecho y commiteado— y borrar el campo del JSON y del schema. Mientras esté, el schema documenta como obligatorio algo que es basura de migración.

### D-056 · Ninguna lección cita una fuente ni nombra un PLAN

**Dónde:** `v2/content/courses/*/*.mdx` — las 329
**Encontrada:** 2026-08-12, buscando enlaces y citas en el corpus
**Severidad:** alta
**Estado:** ~~abierta~~ → **resuelta 2026-09-22**

**Resolución.** Ciclo 1, tareas 13 a 15: las 329 lecciones tienen cierre (190 completos, 139 sólo puente) y ninguna queda `pendiente`. **Las 329 enlazan un PLAN o un ensayo** que dice lo que el puente afirma —se leyó el destino antes de enlazar—. **248 lecciones citan fuentes**: 492 citas, 386 URLs distintas, todas abiertas antes de citarse (InfoLeg, Boletín Oficial, INDEC, BCRA, CSJN, argentina.gob.ar, diarios nacionales), y 50 llevan `revisarAntesDe` por datos perecederos. El lector muestra las fuentes bajo el cuerpo (`FuentesDeLeccion`). Las 81 lecciones sin fuentes son las que sólo llevan puente porque ya cerraban con su propio ejercicio: su cierre no afirma datos, pero su **cuerpo** sí puede — eso es D-091.

En 329 lecciones y 174.073 palabras propias: **cero links** (internos o externos, salvo dos SVG), **cero menciones a un PLAN**, y sólo **10 lecciones** nombran una ley, un artículo o al INDEC. El corpus más grande del proyecto no toca el corpus doctrinal —26 PLANes, cuatro ciclos de ensayos, la crónica, la Radiografía— y no ofrece una sola manera de verificar lo que afirma.

Dos consecuencias distintas. Una es de confianza: hay afirmaciones fuertes sin respaldo, del tipo «el 95% de los proyectos de ley muere en comisión», que la práctica repite como respuesta correcta. La otra es de arquitectura: contradice la directiva de que todo el contenido navega, justo donde más gente entra.

Y hay contenido perecedero sin fecha: la lección de monotributo explica las categorías A–K sin un número, sin fecha de consulta y sin link a AFIP. En Argentina eso envejece en meses.

**Qué haría falta:** el campo `fuentes:` con URL y fecha de consulta, exigido donde el texto nombre un dato o una norma (Ciclo 1, Decisión 11); y los campos `planes:` / `ensayos:` con enlaces en las dos direcciones (Ciclo 2). El frontmatter de los dos ciclos se define junto para editar los 329 archivos una sola vez.
---

### D-057 · La política de privacidad espera tres datos que sólo puede dar el dueño

**Dónde:** `v2/content/legal/privacidad.mdx`, secciones «Quién es responsable» y «Menores»
**Encontrada:** 2026-08-12, cerrando los cuatro marcadores `⟨PENDIENTE: …⟩` que la versión 3 publicó a la vista de cualquiera
**Severidad:** media
**Estado:** abierta

La versión 3 salió a producción con cuatro renglones marcados para completar después. Uno de los cuatro —cuánto se guardan las sesiones— no era una decisión sino un hecho, y se arregló haciendo cierto el plazo: hay un barrido diario que borra las sesiones vencidas hace más de 90 días. **Los otros tres son decisiones del dueño y no se inventan.** La versión 4 los declara con palabras en vez de esconderlos detrás de un marcador —que es la diferencia entre un documento que dice lo que le falta y uno que parece un borrador filtrado—, pero declararlos no es tenerlos.

| Dato que falta | Qué se desbloquea con él | Qué se cambia exactamente |
|---|---|---|
| Razón social o nombre completo del responsable de la base | Que el documento identifique al responsable, como pide el art. 3 de la Ley 25.326 | Sección «Quién es responsable», segundo párrafo — el que hoy dice que la identificación legal está en trámite. Se reemplaza por la identificación. El tercer párrafo, el del canal, se queda como está |
| Domicilio legal | Lo mismo, en el mismo párrafo y en el mismo acto | Igual: los dos datos entran juntos o no entra ninguno. Un responsable sin domicilio es media identificación |
| Edad mínima para tener cuenta | Que la sección «Menores» diga una regla en vez de anunciar que está por escribirse | Sección «Menores», los dos párrafos completos |

En los tres casos, además: subir `version` en el frontmatter y agregar la entrada correspondiente en «Cambios», que es lo que el propio documento promete hacer cuando cambia.

**La edad mínima tiene una segunda punta, y es la que se olvida.** Hoy el registro no pide la edad: `registerInputSchema` (`v2/packages/shared/src/validation/users.ts:64`) toma nombre de usuario, correo, contraseña y nombre, y nada más. Escribir el número en la política sin agregar el campo deja al sitio con una regla publicada que el formulario no puede aplicar — peor que no tener regla, porque la afirmación queda escrita. La política lo dice hoy en voz alta («hoy el registro no pide la edad ni la verifica») y esa frase se cae en cuanto se fije el número, así que las dos puntas se mueven en el mismo commit.

**Mientras tanto**, lo que el documento afirma es cierto: quién está detrás está publicado en `/quien-esta-detras`, el canal `privacidad@elinstantedelhombregris.com` funciona, y los plazos de los arts. 14 y 16 corren desde que alguien escribe, con trámite abierto o sin él.
---

### D-058 · Un cron que falla no le avisa a nadie, y ahora uno de ellos sostiene una promesa legal

**Dónde:** `v2/api/cron/rankings.mjs`, `v2/api/cron/sesiones.mjs`, `v2/vercel.json` (bloque `crons`)
**Encontrada:** 2026-08-12, al agendar el barrido de sesiones que vuelve cierta la retención de 90 días
**Severidad:** media
**Estado:** abierta

Los dos crons se defienden bien de que los invoque un desconocido: sin `Authorization: Bearer $CRON_SECRET` devuelven 401 y loguean. Lo que ninguno hace es avisar cuando **el que no llega es Vercel**. Si `CRON_SECRET` no está cargado en el entorno de producción, o está cargado distinto del que manda la plataforma, cada invocación agendada se contesta con 401, la advertencia se escribe en un log que nadie mira y **el trabajo no se hace, todos los días, en silencio**.

Para los rankings eso es una tabla que envejece. Para el barrido de sesiones es otra cosa: `content/legal/privacidad.mdx` afirma en primera persona que las sesiones vencidas se borran a los 90 días. Si el cron no corre, esa frase vuelve a ser falsa **sin que cambie una sola línea del documento** — que es exactamente el modo de falla de [D-048](#d-048--la-csp-viaja-sólo-en-las-respuestas-de-api-y-nunca-llega-al-documento): no la ausencia de la defensa, sino su apariencia.

**Qué haría falta:** lo mínimo es una verificación manual después del primer despliegue —que `CRON_SECRET` esté en el entorno de Vercel y que la corrida del día siguiente figure en los logs con su `borradas`—. Lo que cierra la deuda es que el resultado de cada corrida deje rastro consultable: una fila con la fecha y el conteo, o un chequeo que compare el registro contra el calendario y grite cuando falta un día. Mientras tanto, la promesa de la política depende de una variable de entorno que nadie mira.

---

### D-059 · La CSP del documento necesita `'unsafe-inline'` en los estilos, y el hosting estático no deja sacarlo

**Dónde:** `v2/packages/shared/src/seguridad/csp.ts` (directiva `style-src`), reflejada en `v2/vercel.json`
**Encontrada:** 2026-08-13, cerrando [D-048](#d-048--la-csp-viaja-sólo-en-las-respuestas-de-api-y-nunca-llega-al-documento) — la concesión existía desde antes, pero recién ahora el navegador la lee
**Severidad:** baja
**Estado:** abierta

`style-src` es la única directiva de la política que lleva `'unsafe-inline'`, y hace falta de verdad: Radix y sonner insertan `<style>` en tiempo de ejecución, y maplibre escribe atributos `style` sobre el canvas y sus controles. Sin eso, los diálogos, los toasts y los controles del mapa se dibujan sin estilo.

La salida canónica es un nonce por respuesta —`style-src 'nonce-…'`— y **con esta forma de hosting no se puede**: `index.html` es un archivo estático que Vercel sirve desde su CDN y las cabeceras de `vercel.json` son constantes, iguales para todas las respuestas. Un nonce exige que alguien genere un valor nuevo por pedido y lo escriba **a la vez** en el header y en el HTML; eso pide renderizar el documento desde una función, que es una decisión de arquitectura entera (adiós al servido estático y a su caché) por una directiva.

**Qué se pierde, con precisión.** No es ejecución: `script-src 'self'` sigue sin `'unsafe-inline'`, así que un XSS reflejado no corre igual. Lo que queda abierto es el CSS como canal — exfiltrar la forma de la página, o disfrazar un control con estilos inyectados, si alguien logra escribir en el DOM.

**Qué haría falta:** o hashes (`'sha256-…'`) por cada bloque inline, que con estilos que las librerías generan en tiempo de ejecución no se pueden enumerar; o un documento renderizado por función con nonce; o dejar de usar librerías que inyectan estilo. Ninguna de las tres es un arreglo local, y por eso queda anotada en vez de improvisada.

---

### D-060 · La suite de integración de la API no la linta nadie

**Dónde:** `v2/apps/api/tests/` (28 archivos) y `v2/tests/e2e/`
**Encontrada:** 2026-08-13, arreglando los tres rojos de `geo-catalogo.test.ts` — el linter tenía nueve cosas que decir sobre un archivo que CI nunca mira
**Severidad:** baja
**Estado:** abierta

Los cinco paquetes del workspace declaran el mismo script: `eslint src --max-warnings 0`. Los tests que viven **adentro** de `src/` —los `__tests__/` de `packages/*` y de `apps/web`— entran ahí. Los que viven **afuera** no existen para el linter, y afuera está justo la suite de integración de la API, que es donde se prueba el borde HTTP entero.

Medido con `npx eslint tests` desde `apps/api`: **293 errores en 23 de 28 archivos** (200 `no-unsafe-member-access` de los casteos sobre `res.body`, 38 `import/order`, 19 `dot-notation`), más uno en `tests/e2e/`. Ninguno rompe nada hoy y por eso la severidad es baja.

**Por qué se anota igual.** `v2/CLAUDE.md` declara `@typescript-eslint/no-explicit-any: error` y `no-console: error` como reglas duras sin excepción, y hay 29 archivos donde no rigen. Hoy no hay un solo `any` en ellos —se verificó, la regla no aparece en el conteo—, así que la deuda es que la puerta está abierta, no que alguien haya entrado.

**Qué haría falta:** extender el script a `eslint src tests` en `apps/api` y sumar `tests/e2e` a `lint:scripts` en la raíz, y después bajar los 294 a cero. El grueso es mecánico (`--fix` cubre `import/order` y `dot-notation`); lo que pide criterio son los 200 `no-unsafe-member-access`, que son el precio de leer `res.body` sin tipo y se arreglan con un helper que parsee la respuesta a un tipo declarado, no con casteos uno por uno.
### D-061 · 153 lecciones usan encabezados más profundos que los dos que el plan permite

**Dónde:** `v2/content/courses/` — 153 de las 329 lecciones
**Encontrada:** 2026-08-13, en la revisión del borrado de la cola generada (Tarea 5 del Ciclo 1). Salió de contar encabezados en el corpus ya cortado, no de leer el plan
**Severidad:** baja
**Estado:** ~~abierta~~ → **resuelta** (verificado 2026-09-22) — cero encabezados por debajo de `###` desde la poda estructural (`cfdca231`), y `entrenamientos:check` lo vigila.

El plan del Ciclo 1 de entrenamientos fija que el cuerpo de una lección usa `##` y `###`, y nada más. Medido sobre el corpus después del corte: **153 lecciones tienen encabezados `####` o más profundos, y 13 usan `#`**, que compite con el `<h1>` que la página ya pone con el título de la lección.

Es anterior a todo este ciclo —lo trajeron los dos scripts de migración de cursos— y no lo introdujo el borrado. Se anota porque el corte lo dejó a la vista: al desaparecer el 38% del texto, la estructura de encabezados de lo que queda es casi todo lo que hay.

No rompe nada funcional. Lo que rompe es la jerarquía que un lector usa para orientarse, y en las 13 con `#` el documento tiene dos títulos de nivel uno.

**Qué haría falta:** es la Tarea 7 del plan («Poda estructural»), que ya está especificada. Esta entrada existe para que, si esa tarea no se ejecuta, el defecto no se quede sin registro — que es lo que este archivo evita.


### D-062 · `POST /api/open-data/dreams` dejaba que el cliente eligiera cuánta protección quería

**Dónde:** `v2/apps/api/src/features/open-data/routes.ts:34-35, 112`
**Encontrada:** 2026-08-14, mapeando el hueco entre el canon de nueve tipos y la web. No la buscaba nadie: salió de leer la ruta vieja para ver qué escribía
**Severidad:** alta
**Estado:** RESUELTA 2026-08-14

El esquema de la ingesta aceptaba `locationRole` y `sensitivity` **del cuerpo del request**, opcionales, y los pasaba tal cual a `prepareRecordLocation` con default `sensitivity: 'low'`. Un cliente que mandara `{"sensitivity":"low","locationRole":"capture"}` **desactivaba el engrosado de su propio punto** y publicaba coordenada exacta: el eje entero de privacidad decidido por quien envía.

Es exactamente la puerta que `senales.sensitivity` cierra con su default `'high'` —«es la única tabla que recibe escrituras, y el default de una columna de privacidad tiene que fallar cerrado»— y que esta ruta, escrita antes, dejaba abierta.

**Cómo se cerró:** los dos campos salieron del esquema y la ruta fija `role: 'subject'` + `sensitivity: 'high'`. Falla cerrado porque esta ruta **no hace la pregunta de la casa** —la hace `/api/v1/civic/senales`, que es la que la web usa desde hoy—, así que no sabe si el punto habla de la vivienda de alguien. No saber tiene que costar protección de más. Un cliente viejo que igual los mande no recibe un rechazo: se le ignora lo que pidió y se lo protege, que es preferible a romperle el envío.

Guarda: `apps/api/tests/senales-ingesta.test.ts`, «`sensitivity` y `locationRole` del cuerpo se ignoran».

### D-063 · Las capturas de campo entran a La Radiografía mal clasificadas

**Dónde:** `v2/apps/api/src/features/civic-map/capturas.ts` y `v2/apps/api/src/features/radiografia/clase-provisional.ts:38-46`
**Encontrada:** 2026-08-14, verificando el mapa del hueco de las señales
**Severidad:** media
**Estado:** abierta

`capturas.ts` escribe `observation` / `need` / `resource` en `dreams.category` — tres tipos en inglés que no están en el canon de nueve. `POR_CATEGORIA` de `clase-provisional.ts` no los tiene, así que caen en `'meta'` por fallback: la clase que significa «no afirma nada del mundo». **Toda la app de campo entra a La Radiografía como si no afirmara nada**, cuando es justo al revés — es lo único recorrido en terreno.

Lo mismo la deja fuera del color del mapa: desde que la capa `voz` lee `senales`, las capturas siguen apareciendo (por la segunda fuente, ver D-064) pero sin clase, o sea pintadas neutras.

**Qué haría falta:** que `capturas.ts` escriba `senales` con tipos del canon. No es un renombre mecánico: `observation` no es un `basta` —un `basta` es algo que estaba y se rompió— y mapearlo al pasar es cómo se pierde el significado. Pide decidir los tres pares con la app de campo a la vista.

### D-064 · La capa `voz` del mapa lee dos tablas, y eso es transitorio

**Dónde:** `v2/packages/db/src/repositories/civic-map.ts`, métodos `vocesDeSenales` y `vocesDeDreams`
**Encontrada:** 2026-08-14, y la cazó un test en el acto
**Severidad:** baja
**Estado:** abierta

Al repuntar la capa `voz` de `dreams` a `senales`, las capturas de terreno **desaparecieron del mapa** —`POST /api/v1/civic/capturas` sigue escribiendo en `dreams`—. Lo agarró el test «la captura aparece en el mapa y el lazo la puede agarrar» antes de salir de la sesión.

La capa quedó con dos fuentes, con ids en espacios distintos (`voz:` para las nuevas, `voz-v1:` para las viejas) y `clase: null` en las viejas, que es lo honesto: sus tipos no son del canon y darles una clase sería inventarla.

**Qué haría falta:** resolver D-063. `vocesDeDreams` se borra el día que la app de campo escriba `senales`, y no antes: sacarla ahora es hacer desaparecer datos que alguien cargó caminando.

### D-065 · Un test de integración escribía en la base real y dejó filas visibles en el mapa

**Dónde:** `v2/apps/api/tests/senales-ingesta.test.ts`
**Encontrada:** 2026-08-14, validando la rebanada. La vi en producción, no en el código: el mapa devolvía una fila con el texto de mi propio test
**Severidad:** media
**Estado:** RESUELTA 2026-08-14

El archivo se guardaba con `hasDatabaseUrl`, o sea que corría contra lo que dijera `DATABASE_URL`. Con `DATABASE_URL_DESCARTABLE` puesta iba a la rama efímera; **sin ella —un `pnpm test` a secas, que es lo normal— iba a producción y escribía**. Encima su `afterAll` sólo limpiaba `senales`, y uno de sus tests postea a `/api/open-data/dreams`, que escribe en la otra tabla: esas filas no las borraba nadie.

Resultado: dos filas en `dreams` de producción con el texto «Hay un pozo en Rivadavia y Boedo.», visibles en el mapa público. En una plataforma cuyo punto entero es que lo que se muestra sea verdad, eso es peor que un bug funcional.

**Cómo se cerró la causa:** el archivo exige `DATABASE_URL_DESCARTABLE` explícita y se saltea sin ella, y la limpieza barre las DOS tablas. La lección general vale para cualquier test futuro que escriba: **un archivo que escribe no puede decidir su destino por «hay una URL»**, tiene que pedir la base descartable por nombre.

**Las filas:** borradas el 2026-08-14 con autorización explícita del dueño. Eran `#4088` y `#4119`, las dos con el mismo texto, las mismas coordenadas y sin firma —las dos corridas de la suite sin la variable de rama, a las 11:06 y 11:09—. Se borraron por id explícito y con una guarda que abortaba si la consulta previa no devolvía exactamente dos: un `DELETE` sobre la base real no se escribe sin eso. `dreams` y `senales` quedaron las dos en cero, que es el estado en que se encontró producción.

### D-066 · `engrosado_rechazado` comprobaba una de las dos condiciones de su CHECK

**Dónde:** `v2/apps/api/src/features/senales/service.ts`
**Encontrada:** 2026-08-14, por una revisión adversaria que lo disparó de verdad contra la base
**Severidad:** alta
**Estado:** RESUELTA 2026-08-14

`senales_rechazo_chk` exige `casa = 'propia' AND location_role = 'subject'`. El servicio escribía `!aceptaEngrosado && casa === 'propia'` — sólo la primera.

En **cinco de los nueve tipos** el rol no es `subject`: `práctica` es `meeting_point`, y `saber`, `sueño`, `propuesta` y `pregunta` son `service_area`, porque hablan *de* un lugar y no señalan la casa de nadie. Un envío con `casa: 'propia'` y `aceptaEngrosado: false` pasaba el contrato Zod, llegaba al INSERT y moría contra el CHECK: **500 en un endpoint público y sin auth, con la señal perdida**.

**Cómo se cerró:** el servicio comprueba las dos condiciones. Cuando el rol no es `subject` no hay protección que rechazar, así que se guarda `false` y **se dice en el recibo** en vez de asentar en silencio el rechazo de una propuesta que nunca se le hizo a nadie. Guarda: `apps/api/tests/senales-defectos.test.ts`, los cinco tipos uno por uno.

### D-067 · El recibo de un reintento describía la fila que llegó, no la guardada

**Dónde:** `v2/apps/api/src/features/senales/service.ts`
**Encontrada:** 2026-08-14, misma revisión adversaria
**Severidad:** media
**Estado:** RESUELTA 2026-08-14

`crear()` con `yaExistia: true` no escribe nada y devuelve tres campos. El recibo armaba los otros ocho —`tipo`, `precisionPublicada`, `engrosado`, `direccionTexto`…— con las variables de **esa** request, que nunca tocó la base.

Con el mismo `idLocal` y un cuerpo distinto, el servidor confirmaba una publicación que no ocurrió, en las dos direcciones: un reenvío que afina informaba punto fino sobre una fila gruesa, y uno que achica informaba protección sobre una fila fina. Es el campo que el módulo trata como el recibo del consentimiento, así que mentirlo es peor que fallar.

La web no lo disparaba —genera un uuid nuevo por envío— pero el contrato dice que `idLocal` **es** la clave de idempotencia del outbox, y el endpoint es público y sin auth.

**Cómo se cerró:** cuando `yaExistia`, se relee la fila y se contesta lo que hay. Si el cuerpo difiere, un aviso lo dice con todas las letras: «ya estaba cargada con ese identificador y NO se sobrescribió».

### D-068 · La Radiografía leía una tabla retirada, y los 163 tests estaban en verde

**Dónde:** `v2/apps/api/src/features/radiografia/lectura.ts`
**Encontrada:** 2026-08-16, buscando por qué la página no mostraba ninguna de las señales nuevas
**Severidad:** alta
**Estado:** RESUELTA 2026-08-16, commit `0c39d557`

La página de convergencia leía `dreams` —la tabla de v1— mientras el resto del sistema escribía en `senales`. El instrumento que existe para mostrar lo que la gente dice estaba mirando la tabla en la que ya no dice nada.

Lo grave no es el puntero viejo: es que **la suite entera estaba verde mientras tanto**. Los tests del motor reciben vectores a mano; los de la página, un fixture. Ninguno preguntaba de qué tabla salen los vectores en producción, porque «de qué tabla» no era un dato que nadie mirara — era una constante adentro de un módulo, y una constante no se testea, se cree.

**Cómo se cerró:** el puntero pasó a `packages/db/src/repositories/analisis.ts` como `FUENTE_VIVA = 'senales'`, con `FUENTES_LEGIBLES` dejando `dreams` legible-pero-no-viva mientras queden filas viejas. Ahora vive en el repositorio, que es el único lugar donde alguien lo va a ir a buscar.

**Lo que queda es la lección, no el arreglo:** un test verde sobre un fixture no dice nada sobre a qué tabla apunta la producción. Es el mismo hueco de [D-063](#d-063--las-capturas-de-campo-entran-a-la-radiografía-mal-clasificadas) y [D-064](#d-064--la-capa-voz-del-mapa-lee-dos-tablas-y-eso-es-transitorio), tres veces en la misma semana.

### D-069 · El techo de adhesiones por actor no se ve en ninguna pantalla, y no es el techo que hace falta

**Dónde:** `v2/packages/civic-core/src/radiografia/grafo.ts`, `TECHO_ADHESIONES_POR_ACTOR`
**Encontrada:** 2026-08-18, escribiendo el modelo de ataque del grafo declarado
**Severidad:** media
**Estado:** abierta

`aristasDeclaradas` corta en 200 las adhesiones con que un actor contribuye al grafo, porque sin techo 4.000 adhesiones de una sola cuenta generan 7.998.000 aristas y ~3,6 GB de heap — medido, no estimado. El techo está bien y hay un test que lo fija. Faltan dos cosas.

**Primero, no se declara.** Un actor por encima del techo aporta sus primeras 200 señales ordenadas por id y ninguna más. La constelación que se dibuja no es la que el dato produce sino la que el techo dejó pasar, y eso es exactamente el recorte que la regla 5 de la Constitución de producto obliga a mostrar. El dato existe adentro de la función —cuántos actores lo tocaron, cuántas adhesiones quedaron afuera— y no sale.

**Segundo, y peor: el techo protege la máquina, no la medición.** La arista declarada cuenta **actores distintos**, así que un actor con 300 adhesiones vale 1 en cada par; pero 200 actores con 2 adhesiones cada uno valen 200. El costo de inflar una arista declarada no es adherir más, es tener más cuentas — y una cuenta es un identificador al azar en un navegador, sin verificación y hoy sin límite ([D-071](#d-071--el-techo-de-20-altas-de-actor-por-hora-existe-en-un-comentario-y-en-ninguna-línea-de-código)).

**Qué haría falta:** que la cabecera de la sección declare el recorte, y que se resuelva D-071 — sin eso, ningún techo del lado del grafo mide lo que promete.

### D-070 · El canon de la señal vive en tres tablas que la aplicación puede escribir

**Dónde:** `v2/packages/db/migrations/0022_senales.sql` — `tipos_senal`, `estados_senal`, `temas`
**Encontrada:** 2026-08-18, revisando qué sostiene las claves foráneas compuestas de `senales`
**Severidad:** media
**Estado:** abierta

Los nueve tipos, las cuatro clases y los estados no son un enum: son filas sembradas por la migración, y las FK compuestas `(tipo, clase)` y `(estado, clase)` de `senales` las usan como fuente de verdad. La elección está bien —agregar un tipo es una migración y no un deploy— pero nada las protege: no hay un solo `GRANT` ni un `REVOKE` en `packages/db/migrations/`, y la API se conecta con el rol dueño.

O sea que el mismo rol que inserta una señal puede correr `UPDATE tipos_senal SET clase = 'hecho' WHERE tipo = 'sueño'`. La regla 11 del canon —los hechos se corroboran, los deseos se deliberan— quedaría invertida en la base y las FK compuestas seguirían verdes, porque el catálogo **es** lo que ellas comprueban. No hace falta un ataque: alcanza con un script de mantenimiento apurado.

**Qué haría falta:** un rol de aplicación con `SELECT` sobre los tres catálogos y sin `INSERT/UPDATE/DELETE`, y las migraciones corriendo con el dueño. Es una migración de permisos más un cambio en la cadena de conexión de producción, así que no se hace de paso.

### D-071 · El techo de 20 altas de actor por hora existe en un comentario y en ninguna línea de código

**Dónde:** `v2/packages/db/src/schema/actores.ts` (tabla `actores_por_origen`) y `v2/packages/db/src/repositories/actores.ts` (`resolverOCrear`)
**Encontrada:** 2026-08-18, siguiendo el modelo de ataque de D-069 hasta su raíz
**Severidad:** alta
**Estado:** abierta

La tabla `actores_por_origen` está pensada en serio: PK compuesta `(hora, bucket)` para poder upsertear —sin clave, cada alta insertaría una fila nueva y el `where creados >= 20` no encontraría nunca nada—, `bucket` como HMAC con pepper del prefijo de red (/32 en IPv4, /64 en IPv6) para que ninguna fila permita reconstruir desde qué red se habló, y cero referencias a `actor_id`. Su docblock explica incluso por qué es tabla y no memoria: la API corre serverless, y un contador en proceso cuenta por instancia.

**No hay una sola línea que la lea o la escriba.** `resolverOCrear` hace `SELECT` por hash e `INSERT`, y nunca mira el bucket. Buscada la cadena `actores_por_origen` en `apps/`, `packages/` y `scripts/`: aparece en la migración, en el esquema y en los tipos compilados. En ningún repositorio, en ninguna ruta, en ningún cron.

Por qué pesa más de lo que parece: un actor es un identificador al azar que vive en el navegador, sin cuenta y sin verificación, y **todo el sistema cuenta actores distintos para no contar dos veces a la misma persona** — el brillo, `UMBRAL_CORROBORACION`, las aristas declaradas de La Radiografía. Si crear actores es gratis e ilimitado, «actores distintos» deja de significar «personas distintas» en las tres máquinas a la vez. Este techo era lo único que iba a hacer que costara algo.

**Qué haría falta:** el upsert que la tabla fue diseñada para recibir, en la misma transacción que crea el actor y con `creados >= 20` como candado; el barrido de filas viejas que el docblock promete, porque sin barrido la tabla es un registro perpetuo de desde qué redes se habló y eso es lo que la regla 3 prohíbe; y una decisión sobre qué contesta la API cuando el techo pega, que no es obvia — un 429 le enseña a quien prueba dónde está el límite.

### D-072 · Dos cifras de la tabla del ejemplo dejaron de decir nada y siguieron en pantalla

**Dónde:** `v2/apps/web/src/pages/LaRadiografia/ejemplos-vista.ts` y `sections/TablaDeLosTres.tsx`
**Encontrada:** 2026-08-17, al reescribir el corpus del ejemplo sin la muleta que lo inflaba
**Severidad:** media
**Estado:** RESUELTA 2026-08-18, commit `ea4a76b5`

`medianaDeParecido` y `umbralDeLaMancha` sostenían en pantalla la afirmación «acá gana la bronca». Las dos medían la muleta del corpus viejo: mientras el escenario 1 repetía «nada» en 58 de sus 63 frases, la mediana daba 0,45 contra 0,17 y 0,18. Reescrito el corpus, el 76,8 % de las aristas de su k-NN son relleno de cupo y valen cero, la mediana se fue a **0,000** —la fila decía lo contrario del título que encabezaba— y la otra empató en los tres, porque su constante (la mitad del corpus) había quedado una voz por encima de la mancha.

El defecto no es que las cifras cambiaran: es que **cambiaron sin ponerse rojas**. Los tests fijaban la forma de la constelación, no lo que la tabla afirma con ella, así que la pantalla siguió publicando dos números que ya no sostenían nada durante un día entero.

**Cómo se cerró:** las reemplazaron dos cifras medidas todos contra todos, que no heredan el `k` del artefacto —con cuántas de las otras 62 comparte al menos una palabra la voz mediana (4 / 19 / 41) y cuánto se parecen dos voces cuando se tocan (0,500 / 0,167 / 0,107)—, y **los tres valores de cada fila quedaron fijados en un test de pantalla**, no sólo su orden. Una cifra que se calcula bien y no dice nada es indistinguible de una que miente, y el orden relativo no alcanza para notar la diferencia.

### D-073 · Brillo y nitidez se calculan por provincia y ninguna pantalla los pide

**Dónde:** `v2/apps/api/src/features/senales/routes.ts` (`GET /map/luz`) y toda `v2/apps/web/src`
**Encontrada:** 2026-08-18, auditando el documento «De la voz al mandato» contra el código
**Severidad:** media
**Estado:** abierta

El endpoint existe, responde 200 en producción y devuelve las dos métricas por provincia con su población de referencia y su `sinDenominador` cuando no la hay. **Ningún cliente lo consume.** La única aparición de la palabra `luz` en la web es la *invalidación* de la clave `['senales','luz']` después de confirmar: se invalida una consulta que nunca se hace.

El efecto es que el mapa dibuja puntos y manchas provinciales y **no dibuja ningún territorio encendido**, que es lo que el endpoint se construyó para permitir. Desde el lado del servidor la pieza se ve terminada, y por eso es fácil darla por hecha: no hay test que falle, ni tipo que se queje, ni error en consola.

**Qué haría falta:** una consulta que lo pida y una capa que lo pinte, con el gris de «no sé» separado del oscuro de «acá no habló nadie» — la distinción ya viene resuelta en la respuesta y se perdería si quien dibuja la colapsa.

### D-074 · Los relojes de vigencia están escritos y no los llama nadie

**Dónde:** `v2/apps/api/src/features/senales/relojes.ts`, `v2/vercel.json`
**Encontrada:** 2026-08-18, misma auditoría
**Severidad:** alta
**Estado:** abierta

`POST /relojes/barrer` existe, está protegido con `CRON_SECRET` y hace lo que promete: manda a revisión los hechos pasados de `vence_el_revision` y marca `vencido` —nunca `no_cumplida`, porque un proceso automático no puede acusar a nadie— los compromisos pasados de fecha.

No hay ninguna entrada que lo invoque: `vercel.json` sólo agenda `rankings` y `sesiones`, no existe un handler en `api/cron/`, y ningún workflow lo llama. **Nada envejece.** Un hecho corroborado se queda corroborado para siempre y una promesa vencida nunca se marca vencida, así que la mitad derecha de la máquina de estados —la que depende del tiempo— está congelada.

Es más grave que la falta de `CRON_SECRET` que anota [D-058](#d-058--un-cron-que-falla-no-le-avisa-a-nadie-y-ahora-uno-de-ellos-sostiene-una-promesa-legal): ahí un cron agendado fallaba en silencio; acá no hay cron.

**Qué haría falta:** el handler, su entrada en `crons`, y la variable en el entorno de producción. Y que su resultado se vea en algún lado — un barrido que corre y no le avisa a nadie vuelve a caer en D-058.

### D-075 · Una pregunta se puede cargar y no se puede responder

**Dónde:** `v2/apps/web/src/pages/Senal.tsx`
**Encontrada:** 2026-08-18, misma auditoría
**Severidad:** media
**Estado:** abierta

`POST /senales/:idPublico/respuesta` existe, y el detalle de una señal ya devuelve sus `respuestas`. La página de la señal no las muestra ni ofrece dónde escribir una.

`pregunta` queda así como **la única de las cuatro clases sin ningún gesto disponible**: un hecho se confirma, un deseo junta adhesiones, un acto tiene fecha, y una pregunta cargada hoy no lleva a ninguna parte. Es también la clase de la que depende el mandato más barato de todos —la agenda territorial de lo que no se sabe—, así que el callejón sin salida se paga dos veces.

**Qué haría falta:** mostrar las respuestas en la ficha y un campo para agregar una, con la misma regla que el resto: se publica qué se respondió, nunca quién.

### D-076 · El taller de PLANPUERTA y su `.mdx` dejaron de coincidir, y la guardia está roja en el tronco

**Dónde:** `Iniciativas Estratégicas/` y `v2/content/planes/PLANPUERTA.mdx`
**Encontrada:** 2026-08-19, corriendo las guardias de CI antes de un push
**Severidad:** media
**Estado:** ~~abierta~~ → **resuelta 2026-09-23** — el dueño decidió publicar PLANGEO v1.2 (bloque MECANISMOS). `pnpm planes:migrar` re-derivó PLANGEO y PLANPUERTA (las dos remisiones corridas) y `planes:check` pasa: 28 entradas coinciden. `verificar-plangeo` y `verificar-remisiones` (842 citas) siguen en verde.

`pnpm planes:check` re-deriva cada `.mdx` desde el taller y lo compara con lo commiteado. PLANPUERTA no coincide: *«¿se editó uno de los dos sin re-derivar?»*.

Los dos lados se tocaron por última vez en commits que ya están en `origin/main` —`e799962a` del lado del taller, `53b248f7` del lado del canon—, así que **la guardia viene fallando en el tronco**, no la rompió un cambio nuevo. Y como `planes:check` es un paso del workflow de v2, todo push que toque `v2/**` sale con CI en rojo por esta causa.

No se arregló acá a propósito: el remedio (`pnpm planes:migrar`) reescribe el `.mdx` canónico de un PLAN de 27.000 palabras, y cuál de los dos lados es el bueno es una decisión de contenido, no una corrección mecánica.

**Qué haría falta:** correr la migración, leer el diff completo, y confirmar que lo que gana es el taller y no una edición manual del canon que se perdería. Si fuera al revés, lo que hay que corregir es el taller.

**Actualización 2026-09-22.** Ya no es sólo PLANPUERTA: la guardia también marca **PLANGEO**, y el diff de `pnpm planes:migrar` dice por qué. El taller tiene PLANGEO **v1.2 «bloque MECANISMOS, agosto 2026»** —unas 440 líneas nuevas: Cláusula del Buitre (26.2-26.3), Registro de Presión (27.5), repositorio antártico (27.6), la doctrina del erizo en ciberdefensa (28.6), la línea naval reasignada a cobertura satelital— y el canon publicado sigue en v1.1. Lo de PLANPUERTA son sólo dos remisiones `PLANGEO:425 → 427` y `1148-1149 → 1153-1154` que se corren con ese bloque. O sea: **publicar PLANGEO v1.2 cierra las dos**, y es una decisión de contenido. Se corrió la migración para medir y se revirtió sin commitear.

### D-077 · El test del lector de crónica se corta antes de la firma

**Dónde:** `v2/apps/web/src/pages/__tests__/BitacoraDetail.test.tsx:84`
**Encontrada:** 2026-08-29, cambiando la firma de la bitácora
**Severidad:** baja
**Estado:** abierta

El primer `it` del archivo busca un fragmento del cuerpo de la crónica del medio con `getByText` y una regexp, y encuentra **más de un nodo**: la prueba muere ahí con *«found multiple elements»*. Es una falla del tronco, no la trajo un cambio nuevo — está igual en `origin/main`.

Lo caro no es la falla: es que todas las aserciones que vienen **después** de esa línea (la firma de autor y el backlink `← La bitácora`) nunca se ejecutan. El test aparenta cubrir la cabecera entera del lector y en realidad cubre hasta el cuerpo. Se verificó a mano que la firma renderiza, comentando esa línea.

**Qué haría falta:** que `fragmentoDelCuerpo` devuelva un tramo que aparezca una sola vez, o que la búsqueda se acote al contenedor del cuerpo en vez de a todo el documento.

### D-078 · El mapa se desborda en móvil: la barra de modos no cabe y la página entera scrollea de costado

**Dónde:** `v2/apps/web/src/pages/ElMapa/instrumento/Chrome.tsx`
**Encontrada:** 2026-09-01, auditoría de diseño y lectura del sitio en producción
**Severidad:** alta
**Estado:** resuelta
**Resuelta:** 2026-09-01 — la barra de modos tiene `overflow-x-auto` y botones `shrink-0 whitespace-nowrap` (`Chrome.tsx`); a 390px el documento mide 390px. Test: `instrumento/__tests__/Chrome.test.tsx`.

La fila de modos del instrumento —Mapa · Análisis · Línea de tiempo · Cobertura · Simulación— es una hilera fija de botones mono con padding ancho. A 390px de ancho no entra: el último botón queda afuera del viewport y estira el documento a 506px. El resultado no se queda en el mapa: **toda la página de El mapa scrollea horizontal en el teléfono**, el hero y el formulario incluidos, y el navegador dibuja el zoom inicial más chico para que quepa. Es la pantalla de conversión primaria del sitio y en móvil se ve rota antes de llegar al formulario.

**Qué haría falta:** que la fila permita scroll horizontal propio (`overflow-x:auto`) o pase a dos líneas en el breakpoint móvil, y un test que mida `document.documentElement.scrollWidth` contra el viewport en 390px para que no vuelva.

### D-079 · El sello EJEMPLO pisa el título del documento del mandato en móvil

**Dónde:** `v2/apps/web/src/pages/ElMandatoVivo/sections/DocumentoMandato.tsx`
**Encontrada:** 2026-09-01, misma auditoría
**Severidad:** media
**Estado:** resuelta
**Resuelta:** 2026-09-01 — bajo 560px el sello sale del flujo absoluto y va en línea arriba del título, como en el lector de PLANes. Test en `DocumentoMandato.test.tsx`.

El sello rojo va en posición absoluta arriba a la derecha del papel. En escritorio flota sobre el margen; a 390px cae encima de la línea de revisión y de la primera línea de «Mandato ciudadano — Argentina», y las dos cosas dejan de leerse. Es el primer documento que se ve en la página oscura, y el sello que dice «esto es un ejemplo» tapa justamente el título del ejemplo.

**Qué haría falta:** en móvil, sacar el sello del flujo absoluto y ponerlo en línea arriba del título (como ya hace el lector de PLANes en `PlanDetail`, que en 390px lo muestra encima sin pisar nada).

### D-080 · La portada dice «0» cinco veces, y el régimen de cifras dice que con cero se habla, no se numera

**Dónde:** `v2/apps/web/src/pages/Home/sections/CifrasStrip.tsx` · `v2/apps/web/src/pages/LaIdea/` (cierre del capítulo III)
**Encontrada:** 2026-09-01, misma auditoría
**Severidad:** media
**Estado:** resuelta
**Resuelta:** 2026-09-01 — con cero real la franja dice «Todavía ninguna.» y el cierre de La idea «Nadie habló todavía. Empezá vos.» (las palabras del header). El «27» de planes se queda: es contenido, no participación.

La franja de cifras de Inicio muestra cuatro «0» en Anton gigante (voces, semillas, propuestas, señales) al lado de un «27» en violeta. En móvil los cuatro ceros ocupan una pantalla entera. El capítulo III de La idea remata con «0 voces ya están en el mapa». El sistema de diseño (§5, «Cifra sin dato») es explícito: cuando la cifra es cero real, *el slot dice lo que pasa y nunca un número*. El resto del sitio ya cumple —el hero dice «Todavía no hay voces acá», el mapa dice «Todavía no habló nadie»— y la franja lo contradice en la misma pantalla. Un visitante nuevo lee cuatro ceros y un sello de «Prototipo · todavía sin voces» y concluye que el sitio está muerto, que es lo contrario de lo que el régimen quiere decir.

**Qué haría falta:** pasar los tiles por `voces-regimen` como el resto: con cero, el tile dice en palabras que falta la primera; con dato, muestra el número. Y decidir si el «27» —que es un conteo de contenido en disco, no de participación— pertenece a la misma franja.

### D-081 · Las notas al pie de los ensayos se ven crudas: «¡BASTA![^1]»

**Dónde:** `v2/content/ensayos/arquitectura.mdx` (dos ocurrencias) y el pipeline MDX de `v2/apps/web`
**Encontrada:** 2026-09-01, misma auditoría
**Severidad:** baja
**Estado:** resuelta
**Resuelta:** 2026-09-01 — `renderMarkdown` entiende `[^id]` / `[^id]: texto`: superíndice con link y lista de notas al final con vuelta al texto. Test: `lib/__tests__/markdown.test.ts`.

El ensayo «Una arquitectura para el hombre gris» usa la sintaxis de notas al pie de GFM (`[^1]`). El lector no la procesa, así que el marcador aparece literal en el cuerpo del texto y la nota no se renderiza en ninguna parte. Hay que revisar si otros `.mdx` del corpus lo usan antes de elegir el arreglo.

**Qué haría falta:** o se habilita el soporte de notas al pie en el pipeline MDX (`remark-gfm` con `footnotes`), o se convierten las dos notas a paréntesis o a una sección «Notas» al final del ensayo.

### D-082 · El lector de PLANes entrega 68.000 palabras en una sola página sin índice ni posición

**Dónde:** `v2/apps/web/src/pages/PlanDetail.tsx`
**Encontrada:** 2026-09-01, misma auditoría
**Severidad:** media
**Estado:** resuelta
**Resuelta:** 2026-09-01 — `renderMarkdown` pone id a cada encabezado y `IndiceLector` (`components/papel/IndiceLector.tsx`) lista los h2 con scroll-spy: columna fija a la izquierda del papel en ≥1141px, `<details>` arriba del documento en angosto, «Sección n de N» como brújula, ancla en la URL al saltar.

PLANAGUA renderizado mide 264.000 píxeles de alto: 31 secciones, 182 subtítulos y 119 tablas en un papel de 780px sobre fondo oscuro, y la única navegación es el header del sitio. No hay índice de secciones, no hay «dónde estoy», no hay salto a la siguiente sección, no hay ancla que se pueda compartir. El manifiesto sí tiene su fichero de 8 partes y la biblioteca su fichero scroll-spy: el PLAN, que es el documento más largo del sitio, es el único lector largo sin él. Un lector que quiere ir a «Modelo financiero» tiene que scrollear el equivalente a 290 pantallas.

**Qué haría falta:** reutilizar el fichero scroll-spy de la biblioteca como índice lateral (fijo en escritorio, plegable en móvil) generado desde los `h2` del `.mdx`, con anclas por sección y la línea mono «Sección {n} de {total}» que el sistema ya usa en el stepper.

### D-083 · El instrumento interpreta un fallo de consulta como ausencia de voces

**Dónde:** `v2/apps/web/src/pages/ElMapa/instrumento/Instrumento.tsx`, `modos/useModoMapa.tsx`, `modos/useModoCobertura.tsx`
**Encontrada:** 2026-09-08, revisión de código y navegador local con API no disponible
**Severidad:** alta
**Estado:** ~~abierta~~ → **resuelta 2026-09-22**

**Resolución.** `EstadoConsulta` separa cargando, error sin datos y error con una lectura anterior; con la consulta caída el instrumento no dibuja modos ni contadores y dice «No pudimos cargar los datos. No sabemos cuántos registros hay en este territorio.». Verificado en navegador con la API local apagada: ningún texto de silencio ni cero en pantalla.

`consulta.data ?? []` se pasa a los modos, pero no se transmite `consulta.isError`. Después del fallo el mapa muestra «Todavía no habló nadie», el contador indica cero y Cobertura informa 100% de silencio. En la misma página el feed sí muestra error. Se verificó este comportamiento local; no se afirma una caída de producción.

**Qué haría falta:** distinguir error, vacío confirmado, datos parciales y datos anteriores; no publicar conclusiones territoriales cuando la consulta no se pudo obtener. Verificar con una respuesta fallida del endpoint de señales.

### D-084 · Los modos analíticos tratan una consulta limitada como el corpus completo

**Dónde:** `v2/packages/db/src/repositories/civic-map.ts`, `v2/apps/api/src/features/civic-map/routes.ts`, `v2/apps/web/src/lib/queries/civic-map.ts`, `v2/apps/web/src/pages/ElMapa/instrumento/Instrumento.tsx`
**Encontrada:** 2026-09-08, trazado del pedido desde el instrumento hasta el repositorio
**Severidad:** alta
**Estado:** ~~abierta~~ → **resuelta 2026-09-22**

**Resolución.** `GET /api/v1/civic/map/lectura` (`MapaLecturaRepository`) calcula total, por provincia, por día y sin punto sobre el conjunto elegible completo, y pagina el dibujo con cursor estable (`fecha, id`) atado a la huella de los filtros. La respuesta dice `total`, `entregados` y `completa`; Cobertura, Tiempo y Simulación se niegan a calcular sobre una página recortada, y Análisis colorea con el total. `apps/api/tests/mapa-lectura.test.ts` lo prueba con más registros que el límite sobre Postgres local.

El cliente solicita todas las capas y todo el tiempo, sin paginación ni límite explícito. El repositorio aplica por defecto 500 filas por consulta de origen, ordenadas por fecha descendente. La capa voz reúne dos consultas limitadas de forma independiente. La respuesta solo contiene `signals`; no informa truncamiento ni total coincidente. Los modos llaman `todas` a ese resultado y calculan análisis, cobertura, tiempo y estado medido sobre él. Cuando un origen supera el techo, datos anteriores pueden desaparecer de esas lecturas sin aviso. Hallazgo por código; no se midió el tamaño actual de la base.

**Qué haría falta:** agregados completos para las métricas, carga acotada de puntos para dibujo y metadatos de completitud. Probar con más registros que el límite y verificar que las métricas nacionales no cambien por paginar el dibujo.

### D-085 · El mandato presenta equivalencia entre necesidades y recursos sin comprobar compatibilidad

**Dónde:** `v2/apps/api/src/features/mandato/service.ts`, `v2/apps/web/src/pages/ElMandatoVivo/mandato-regimen.ts`, `sections/DocumentoSecciones.tsx`
**Encontrada:** 2026-09-08, revisión de la fórmula y de su etiqueta pública
**Severidad:** alta
**Estado:** ~~abierta~~ → **resuelta 2026-09-22**

**Resolución.** Salen `urgenciaDeBrecha` y «cubierta si se organiza». La sección III muestra necesidades y recursos declarados por provincia, en orden alfabético y sin restar uno del otro, y dice por qué no se compensan. Recursos cuenta «recursos declarados», no personas.

Se cuentan filas de tipo necesidad y recurso por provincia. `urgenciaDeBrecha` etiqueta «cubierta si se organiza» cuando los recursos alcanzan las necesidades. No hay correspondencia temática, unidad, capacidad, alcance territorial ni disponibilidad en ese cálculo. Una oferta de herramientas puede compensar aritméticamente una necesidad de agua. Además, Recursos traduce un conteo de filas a «personas» sin deduplicación de personas en esta consulta.

**Qué haría falta:** publicar conteos declarados como tales; reservar cobertura de necesidades para correspondencias verificables con unidades compatibles. Separar registros, actores y personas.

### D-086 · El sello de documento auditado se activa al entrar la firma en pantalla

**Dónde:** `v2/apps/web/src/pages/ElMandatoVivo/sections/DocumentoMandato.tsx`
**Encontrada:** 2026-09-08, revisión del disparador del sello
**Severidad:** media
**Estado:** ~~abierta~~ → **resuelta 2026-09-22**

**Resolución.** El sello dice «Visto — Lo leíste hasta el final.». La palabra auditoría no aparece en la página.

Un `IntersectionObserver` con umbral 0,6 activa `visto` y el texto «Documento auditado. Ahora sos testigo». La visibilidad del bloque no verifica revisión de fuentes, conformidad ni auditoría.

**Qué haría falta:** nombrar el evento real —por ejemplo «Llegaste al final»— y reservar auditoría para una revisión explícita con alcance y resultado.

### D-087 · El formulario exige una cesión que su consentimiento presenta como opcional

**Dónde:** `v2/apps/web/src/pages/ElMapa/sections/PanelSoltarVoz.tsx`, `v2/packages/shared/src/open-data/consentimiento.ts`
**Encontrada:** 2026-09-08, lectura del formulario en navegador y de su validación
**Severidad:** media
**Estado:** ~~abierta~~ → **resuelta 2026-09-22**

**Resolución.** Dos casillas: publicar (requisito) y ceder el texto (opcional). Sin cesión la voz se publica y el texto sale reservado en todas las lecturas públicas (`textoDeSenalPublica`). Reintentar el mismo borrador conserva `idLocal`; un borrador nuevo lo cambia.

El consentimiento dice que, si no se autoriza reutilizar el texto, se publica el resto sin texto. Sin embargo, el formulario añade una falta cuando `!cede` y deshabilita enviar. La alternativa ofrecida por el texto no se puede elegir desde esta pantalla. La misma casilla reúne explicaciones del identificador de navegador, licencia y registro público.

**Qué haría falta:** alinear elección y comportamiento, distinguiendo autorizaciones opcionales de requisitos del envío y conservando los textos compartidos. No se evaluó cumplimiento legal; se registra la contradicción de interfaz.

### D-089 · El nivel departamento del modo Análisis sigue apagado aunque la geometría ya está

**Dónde:** `v2/apps/web/src/pages/ElMapa/instrumento/modos/useModoAnalisis.tsx`, `v2/packages/db/src/repositories/mapa-lectura.ts`
**Encontrada:** 2026-09-22, al cerrar D-004
**Severidad:** media
**Estado:** abierta

D-004 trajo `departamentos.geojson` y el nivel «departamento» sigue deshabilitado con su razón a la vista. Encenderlo hoy mentiría de tres maneras:

1. **El resumen del mapa sólo agrega por provincia.** `MapaLecturaRepository` devuelve `porProvincia` sobre el corpus entero; no hay `porDepartamento`. Sumar la página de señales cargada daría un número que no es el total, que es exactamente lo que D-084 cerró. Hace falta agregar por `department_id` —y por el departamento de `city_id` para las fuentes que no lo guardan— y decir cuántas filas no tienen departamento.
2. **No hay población ni superficie por departamento.** Las métricas «por habitante» y «por territorio» sólo existen para las 24 provincias (`PROVINCIAS_REF`).
3. **No hay supresión de grupos chicos** ([D-088](#d-088--el-brillo-dibujado-es-invertible-delata-cuánta-gente-habló-en-una-celda)). Con 529 departamentos y la base casi vacía, un departamento encendido por una sola voz la señala.

El texto de la pantalla ya no dice que falta la capa: dice lo que falta de verdad.

### D-090 · Las voces resueltas por punto antes del cambio de geometría conservan la provincia vieja

**Dónde:** filas de `senales` con `ubicacion_origen = 'punto'` y filas de `dreams` resueltas por `pnpm geo:backfill`
**Encontrada:** 2026-09-22, al cerrar D-011
**Severidad:** media
**Estado:** abierta

D-011 cambió la geometría con la que se resuelve un punto, pero no volvió a resolver lo que ya estaba guardado: eso es escribir en producción, y se deja para que lo decida quien la opera. Toda fila con provincia sacada del polígono de 29 vértices puede tener la provincia de enfrente (Neuquén capital en Río Negro, Dock Sud en CABA) o ninguna (Retiro, Posadas). No se contó cuántas son.

`pnpm geo:backfill` no alcanza: sólo toca filas **sin** provincia. Hace falta un re-resolver para `where ubicacion_origen = 'punto'` —el conjunto exacto que la spec de la tierra preparó para este día— que muestre en seco qué cambiaría y escriba sólo con `--aplicar`.

### D-097 · La convergencia de v1 mide coincidencia temática entre tipos de señal

**Dónde:** `SocialJusticeHub/client/src/hooks/useConvergenceAnalysis.ts`, `SocialJusticeHub/client/src/pages/ElMapa.tsx`
**Encontrada:** 2026-10-08, estudio del contexto de v1 para el nuevo sistema de conversación y diseño idealizado
**Severidad:** alta
**Estado:** abierta

`convergencePercentage` divide temas presentes en al menos dos tipos de señal por temas activos. La clasificación usa coincidencias con un diccionario de palabras; no compara opiniones de personas ni registra acuerdos explícitos. Además, la extracción descarta la negación «no». El hero publica el resultado como porcentaje de «convergencia», junto a un conteo de registros llamado «voces».

Dos registros de tipos distintos que hablan de educación pueden producir 100% de coincidencia temática aunque sostengan posiciones opuestas. Ese porcentaje no mide consenso ciudadano y no debe usarse para fundar una visión compartida o un mandato.

**Qué haría falta:** nombrar esta medida como coincidencia temática entre tipos de señal, distinguir registros de participantes y separar el análisis semántico del análisis de acuerdos explícitos. Conservar negaciones y contexto al interpretar relatos. Cualquier futura medida de convergencia de opiniones debe publicar sus participantes, respuestas, denominadores y límites.

### D-098 · PLANPREGUNTA usa un relato de Visión 2040 como precedente que ya dio resultados

**Dónde:** `Iniciativas Estratégicas/PLANPREGUNTA_Argentina_ES.md` §2.3 y §6.1; `Iniciativas Estratégicas/PLANISV_Argentina_ES.md` §26.4
**Encontrada:** 2026-10-08, lectura cruzada de los planes y sus fundamentos
**Severidad:** alta
**Estado:** abierta

PLANPREGUNTA presenta a la guardiana de semillas como «el precedente que sí dio» y deriva un plazo de adopción del relato de PLANISV. La fuente pertenece a la Visión 2040: narra registros en 2029, resultados en 2031 y exportaciones en 2035, todos posteriores a la fecha de esta lectura. Es un escenario del diseño idealizado, no un resultado observado. Verificar que una afirmación tiene domicilio en otro documento del corpus no verifica que ocurrió.

**Qué haría falta:** mantener el relato identificado como escenario hipotético, retirar su uso como prueba empírica y fundamentar los parámetros del diseño con precedentes observados y fuentes externas, o declararlos como hipótesis pendientes de validación. Revisar las remisiones que reproducen ese resultado sin su condición de visión futura.

### D-099 · Datos Abiertos muestra un catálogo pendiente y licencias distintas del contrato vigente

**Dónde:** `v2/apps/web/src/pages/DatosAbiertos.tsx`, `v2/packages/shared/src/datasets/index.ts`, `v2/packages/shared/src/open-data/consentimiento.ts`
**Encontrada:** 2026-10-08, ampliación de la propuesta hacia Radiografía y descarga
**Severidad:** media
**Estado:** **resuelta en código, 2026-10-08**

Los cuatro elementos del catálogo están en `available: false`. La pantalla anuncia una habilitación por «masa crítica (~1000 registros agregados)» y el catálogo rotula CC0; el contrato vigente distingue compilación y texto con CC BY 4.0 y publica texto solo con cesión por señal. La pantalla no representa un catálogo operativo ni deriva disponibilidad y licencia de ese contrato. La spec de registro de agosto ya identifica el catálogo pendiente; se registra su persistencia en el código actual, sin atribuir estado a producción.

**Qué haría falta:** catálogo de exportaciones disponibles y manifiestos con alcance, corte, completitud, omisiones y licencia desde la fuente vigente. Separar permisos y protección de grupos del volumen total; no usar un umbral genérico para publicar cualquier conjunto.

**Resolución:** Catálogo operativo, exportación paginada y paquetes con manifiesto y licencias desde el contrato. `exportaciones-ideal.test.ts` verifica más de 500 filas, texto reservado, filtros, corte y metadatos; `exportar.test.ts` verifica CSV, ZIP y continuación.

### D-100 · La autoría anónima no tiene un recorrido de recuperación con cuenta

**Dónde:** `v2/packages/db/src/repositories/actores.ts`, `v2/apps/api/src/features/senales/actor.ts`, `v2/apps/api/src/features/senales/gestion-routes.ts`, `v2/apps/web/src/pages/MiPerfil/index.tsx`
**Encontrada:** 2026-10-08, revisión de continuidad entre aporte y cuenta
**Severidad:** media
**Estado:** **resuelta en código, 2026-10-08**

`atarACuenta` existe en el repositorio y no tiene llamadores encontrados en v2. La gestión de retiro comprueba la cookie de actor del navegador que publicó. Mi Perfil muestra gamificación y actividad, sin un listado de señales propias ni un flujo explícito para recuperar sus permisos desde una cuenta. Iniciar sesión no demuestra ni conecta por sí solo la autoría de aportes anteriores.

**Qué haría falta:** confirmar titularidad en servidor, ofrecer vinculación explícita con sesión y credencial del actor, resolver conflictos de múltiples navegadores sin duplicar participación y crear lecturas y gestión de aportes propios. No recuperar por nombre, similitud textual ni ubicación; no subir borradores privados al iniciar sesión.

**Resolución:** Autoría de cuenta y credencial original, vínculo voluntario idempotente, lectura propia protegida, gestión entre dispositivos y cierre de cuenta. `participacion-ideal.test.ts` y `equipo-continuidad.test.ts` verifican permisos, recuperación, conflictos y revocación de acceso.

### D-101 · Radiografía recorta a 500 señales y no declara ese recorte en su contrato público

**Dónde:** `v2/apps/api/src/features/radiografia/lectura.ts`, `service.ts`, `v2/apps/web/src/lib/queries/radiografia.ts`
**Encontrada:** 2026-10-08, revisión del alcance necesario para analizar y exportar
**Severidad:** alta
**Estado:** **resuelta en código, 2026-10-08**

La fuente lee hasta `TOPE_DE_CORPUS + 1` y devuelve las 500 señales más recientes. Detecta el recorte y lo registra en un warning interno, pero entrega al servicio solo el array reducido. El contrato público conserva `total`, `analizadas` y `sinVector` sin total elegible ni indicador de recorte. Si el registro elegible supera 500, la suma puede cerrar sobre la selección y seguir sin mostrar cuántas señales quedaron fuera. No se verificó si ese umbral se alcanza actualmente en producción.

**Qué haría falta:** separar total elegible, seleccionado, analizado y dibujado, declarar completitud y política de selección, y conservar corte y filtros efectivos. Una descarga completa no puede usar este array limitado. Mover el cálculo pesado fuera del request o al índice adecuado cuando el volumen lo requiera, conservando límites y procedencia.

**Resolución:** La respuesta publica elegibles, seleccionados, analizados, límite y completitud. El grafo carga únicamente los vectores seleccionados y el exportador no reutiliza su recorte. La prueba de 510 registros confirma un análisis de 500 y una descarga completa.

### D-102 · Cálculos y archivos de gran volumen necesitan trabajos desacoplados

**Dónde:** `v2/packages/civic-core/src/deliberacion/opiniones.ts`, `v2/apps/api/src/features/radiografia/`, `v2/apps/api/src/features/exportaciones/`
**Encontrada:** 2026-10-08, implementación del nuevo recorrido
**Severidad:** media
**Estado:** abierta

La proyección de opiniones declara insuficiencia por encima de 400 cuentas o 100 afirmaciones y conserva los conteos completos en SQL. Radiografía declara su selección de 500. Todavía no existen trabajos duraderos para calcular una matriz grande. Esto es una limitación explícita, no un resultado de análisis nacional.

**Qué haría falta:** trabajo asíncrono con alcance y versión, control de permisos vigente, cancelación, recuperación, métricas y archivos temporales con vencimiento; evaluación de estabilidad y cobertura con el piloto antes de aumentar límites. No convertir semejanza, cuentas o un resultado exploratorio en mandato poblacional.

**Resolución parcial, 2026-10-08:** las exportaciones públicas ya usan trabajos persistidos en Postgres, partes y cursor recuperables, cancelación, vencimiento y ZIP transmitido directamente desde el servidor. Las correcciones y retiros invalidan la preparación y la entrega. La migración 0030, las pruebas de `exportaciones-trabajos.test.ts` y [el procedimiento operativo](../v2/docs/operations/exportaciones-publicas.md) documentan el alcance. Los límites declarados de cálculo de opiniones y similitud siguen abiertos; ampliar esos límites requiere validar cobertura y estabilidad, no sólo subir una constante.

### D-103 · La adaptación móvil necesita verificación en dispositivos físicos

**Dónde:** `v2/apps/mobile/src/app/imaginar.tsx`, `campanas.tsx`, `espacio-ideal.tsx`, `src/civic/ideal.ts`
**Encontrada:** 2026-10-08, adaptación de la app existente
**Severidad:** media
**Estado:** abierta

La adaptación tiene contratos, pruebas de persistencia y reintento, renovación de sesión y compilación de las plataformas. Falta comprobar en teléfonos modestos el ciclo real de cookies, reinicio, almacenamiento, conectividad intermitente, segundo factor y gestión entre superficies. La compilación no acredita esa prueba física. El almacenamiento local conserva el aviso de que no tiene cifrado propio de la app.

**Qué haría falta:** matriz de dispositivos de Android e iOS y una tarea de campo autorizada; comprobar que un reinicio no duplica envíos, que el cambio de cuenta conserva la autoría, que corregir y retirar llega a las lecturas actualizadas, y que nada de la bitácora anterior se publica por la actualización.

### D-104 · Las pruebas de participación dejan campañas y fichas públicas repetidas

**Dónde:** `v2/apps/api/tests/participacion-ideal.test.ts`, `equipo-continuidad.test.ts`, `diseno-ideal.test.ts`
**Encontrada:** 2026-10-08, revisión visual posterior a la implementación
**Severidad:** media
**Estado:** resuelta en código, 2026-10-08

Las suites creaban propietarios, campañas y fichas públicas con UUID nuevos y no limpiaban al terminar. La conservación legítima de ediciones anteriores hacía visibles también campañas que preparaban un borrador nuevo. La vista local acumuló veinte campañas y quince fichas de fixture con títulos repetidos. Ocultarlas por título habría escondido procesos distintos y dejado intacta la causa.

**Resolución:** cada suite registra sus objetos y limpia únicamente sus IDs en `afterAll`. Las guardas rechazan cuentas ajenas y contribuciones anónimas cuyos identificadores no se acreditaron, también dentro de la transacción. El saneamiento operado en la base local descartable preservó el aporte manual y dejó una única demostración identificada y pausada. No se modificaron bases remotas. El [procedimiento y las evidencias](../v2/docs/operations/demo-campanas-local.md) describen la selección y la conservación de datos; las pruebas negativas verifican que una participación independiente impide borrarla como fixture.

### D-105 · La app móvil no tiene las tres preguntas ni la elección de lugar

**Dónde:** `v2/apps/mobile/src/app/imaginar.tsx`
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** media
**Estado:** abierta

En la web, imaginar tu Argentina ideal es una conversación guiada: tres preguntas, una revisión de la frase que se va a publicar y la elección del lugar al que se refiere el aporte. En la app hay un solo campo de texto y ninguna forma de decir dónde, así que todo aporte queda en «Argentina», aunque las campañas se abren por zona y por tema. Quien escribe sobre su barrio desde el teléfono publica algo que el mapa ubica en todo el país.

Tampoco están en la app:

- compartir las tres respuestas originales junto con la frase, como ofrece la web;
- seguir una campaña para recibir avisos;
- «Proponer un futuro» a partir de un aporte ya publicado;
- una salida cuando la campaña elegida ya cerró: hoy la app deja reintentar o seguir con la edición vigente, pero no mandar el aporte a la campaña nacional.

**Qué haría falta:** llevar a la app los mismos tres pasos y el mismo selector de lugar que la web, con los textos tomados de `@v2/shared` para no escribirlos dos veces; después, las acciones del recibo (seguir, proponer un futuro). Hasta entonces, un aporte hecho desde la app es válido pero llega sin lugar.

### D-106 · Corregir un aporte con cesión registra la versión 1 y un texto propio

**Dónde:** `v2/packages/db/src/repositories/mi-espacio.ts:114` (`corregir`), `v2/apps/web/src/pages/Senal/EditarAporte.tsx:113`, `v2/apps/api/src/features/senales/service.ts:60` (`VERSION_DE_CESION`)
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** media
**Estado:** abierta

Cuando alguien publica un aporte y cede su texto bajo licencia CC BY 4.0, el servidor anota qué versión del texto de cesión leyó. Desde el 9/10/2026 esa versión es la 2. Pero cuando la persona corrige después ese aporte y deja tildada la cesión, el repositorio escribe siempre la versión 1, fijada en el código, y la pantalla de corrección muestra una redacción propia, distinta de la que se ve al publicar.

El resultado es un registro que dice que la persona aceptó un texto que no es el que vio, y dos aportes con la misma licencia firmados con versiones distintas según por dónde entraron. La versión existe para poder demostrar qué se aceptó; si no identifica el texto que la persona realmente leyó, deja de servir para eso.

**Qué haría falta:** que la corrección use el mismo texto y la misma constante que el flujo principal, o que su propio texto tenga una versión numerada y registrada; y una prueba que falle si las dos pantallas divergen sin subir la versión. Las filas ya corregidas conservan el número viejo: conviene contarlas antes de decidir qué hacer con ellas.

### D-107 · Mi espacio no muestra los aportes de un navegador sin cuenta

**Dónde:** `v2/apps/api/src/features/mi-espacio/routes.ts` (`/recuperables`), `v2/apps/web/src/pages/MiEspacio/EspacioSinCuenta.tsx`
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** media
**Estado:** abierta

Quien publica sin cuenta conserva la autoría en una cookie que el navegador guarda y que el código de la página no puede leer (es a propósito: así ningún script puede copiarla). Por eso Mi espacio, para quien no ingresó, solo muestra los borradores guardados en el dispositivo; los aportes ya publicados no aparecen. La única lista que lee esa cookie, `/api/v1/mi-espacio/recuperables`, exige una sesión iniciada.

La persona sigue pudiendo corregir o retirar su aporte desde el recibo, pero solo si guardó ese enlace. Si lo perdió, no tiene dónde ver lo que publicó, y la pantalla se limita a prometer lo que sí pasa: al crear la cuenta se ofrece sumar esos aportes.

**Qué haría falta:** un endpoint que liste los aportes según la cookie de actor, sin pedir sesión, con las mismas reservas que ya tiene la gestión de un aporte (nada de lo retirado, nada de otras personas), y la pestaña correspondiente en la vista sin cuenta. Hay que decidir también qué se muestra cuando un navegador acumula muchos aportes.

### D-108 · «Ver y gestionar mi aporte» en la app puede no reconocer la autoría

**Dónde:** `v2/apps/mobile/src/app/imaginar.tsx:266`, `v2/apps/mobile/src/app/espacio-ideal.tsx:109` (`openBrowserAsync`)
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta — sin verificar

Después de compartir un aporte, la app ofrece «Ver y gestionar mi aporte», que abre la página web del aporte en el navegador integrado del sistema. Quien publicó sin cuenta tiene la autoría guardada en una cookie del navegador. La sospecha es que, en iOS, ese navegador integrado no comparte cookies con la app: la página se abriría sin reconocer a su autor y no ofrecería corregir ni retirar.

No se probó en un teléfono. Se infiere de cómo suele funcionar esa pieza del sistema, no de haber visto el fallo.

**Qué haría falta:** probarlo en un iPhone y en un Android reales (es parte de [D-103](#d-103--la-adaptación-móvil-necesita-verificación-en-dispositivos-físicos)). Si falla, hay que resolver la gestión dentro de la app o abrir la web con un vínculo de un solo uso; no conviene depender de una cookie que quizá no viaja.

### D-109 · La app no guarda solo el texto mientras escribís

**Dónde:** `v2/apps/mobile/src/app/imaginar.tsx` (botón «Guardar en este teléfono»)
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta

El texto que se escribe en Imaginar solo se conserva si se aprieta «Guardar en este teléfono». Si la persona sale de la pantalla con el botón de volver, con el gesto del sistema o cerrando la app, lo escrito se pierde sin aviso. El botón equivalente de la web funciona igual, pero en un teléfono es más fácil salir sin querer.

**Qué haría falta:** guardar en el teléfono con una pequeña demora mientras se escribe, o preguntar antes de salir si hay texto sin guardar. El borrador sigue siendo local y sin cifrado propio de la app, como ya registra [D-103](#d-103--la-adaptación-móvil-necesita-verificación-en-dispositivos-físicos); guardar solo no cambia eso, pero conviene que el aviso de la pantalla siga diciéndolo.

### D-110 · El recibo no puede decir si hay aportes parecidos

**Dónde:** `v2/apps/web/src/pages/Imaginar/Recibo.tsx` (propiedad `otrosParecidos`), recibo que devuelve la API al publicar
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta

El recibo que se muestra al publicar tiene una frase preparada, «Todavía no hay otros aportes como el tuyo en este lugar», pensada para cuando no hay aportes parecidos. Esa frase depende de un dato (`otrosParecidos`) que ningún código le pasa: solo lo pasan las pruebas, porque el recibo que devuelve la API no incluye cuántos aportes parecidos hay. El resultado es que el recibo nunca dice ni que hay otros ni que no los hay, y quien publica no sabe si lo suyo se repite.

**Qué haría falta:** decidir qué cuenta como «parecido» (mismo lugar y mismo tema, o cercanía de texto como en la Radiografía), calcularlo en el servidor y devolverlo en el recibo, con el mismo cuidado que la Radiografía: se cuentan aportes y no personas, y que varios digan lo mismo no prueba que sea cierto.

### D-111 · La web compara textos literales con mensajes de la API

**Dónde:** `v2/apps/web/src/pages/Imaginar/Recibo.tsx:15` y `:72`, `v2/apps/api/src/features/geo/resolver.ts:244`
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta

Cuando un aporte se publica sin ninguna ubicación, el servidor agrega un aviso técnico («No llegó ni calle, ni localidad, ni provincia, ni punto.»). El recibo de la web lo reconoce comparando el texto, letra por letra, con una copia escrita en `Recibo.tsx`, y lo reemplaza por una frase pensada para personas. Si alguien reformula el aviso en el servidor, aunque sea con una coma, la comparación deja de coincidir y quien publica ve el texto técnico tal cual. Nada obliga a que las dos copias coincidan.

**Qué haría falta:** que el servidor mande un código estable junto con el mensaje (por ejemplo `SIN_UBICACION`) y que la web elija la frase según ese código. El mensaje queda como respaldo. El mismo cuidado vale para cualquier otro aviso que la web reescriba.

### D-112 · Fichas: alternativas y pruebas sin comparación ni autoría, y una ficha no se puede compartir

**Dónde:** `v2/apps/web/src/pages/Fichas/Alternativas.tsx`, `Pruebas.tsx`, `DetalleFicha.tsx`
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** media
**Estado:** abierta

Una ficha de futuro reúne afirmaciones, alternativas y pruebas. Las alternativas y las pruebas se listan una debajo de otra: no hay una vista que permita compararlas entre sí (qué necesita cada una, qué haría frenar la prueba) y no se ve quién propuso cada una. Importa porque el sentido de tener varias alternativas es poder contrastarlas, y de quién viene cada una es parte de ese contraste.

Además, una ficha no se puede compartir. El botón de compartir que ya tienen las campañas (`CompartirProceso`) no se usa en las fichas, así que quien arma una ficha tiene que copiar la dirección a mano.

**Qué haría falta:** decidir qué significa «comparar» (por ejemplo, una tabla con los mismos campos para cada alternativa); mostrar quién propuso cada alternativa y cada prueba, resolviendo antes cómo se muestra la autoría sin exponer a quien no quiso aparecer; y reutilizar el botón de compartir en la ficha.

### D-113 · Las campañas nuevas tienen direcciones ilegibles

**Dónde:** `v2/packages/db/src/repositories/campanas.ts:153`
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta

Cada campaña nueva recibe la dirección `campana-<identificador largo>`, así que el enlace que se comparte es una cadena que nadie puede recordar, decir en voz alta ni reconocer. La campaña nacional es la excepción: tiene una dirección fija y legible (`mi-argentina-ideal`).

**Qué haría falta:** generar la dirección a partir del título cuando se crea la campaña, con un sufijo si ya existe otra igual. La dirección tiene que quedar estable aunque el título cambie en una edición posterior, y las direcciones `campana-<identificador>` ya compartidas tienen que seguir funcionando.

### D-114 · Los pasos de una campaña están escritos dos veces

**Dónde:** `PASOS` en `v2/apps/api/src/features/campanas/routes.ts:24`, `PASOS_CAMPANA` en `v2/apps/web/src/components/participacion/constantes.ts:21`, prueba en `v2/apps/web/src/pages/Campanas/__tests__/gestion-fase.test.tsx:88`
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta

Una campaña pasa por etapas (borrador, programada, abierta, pausada, en devolución, cerrada) y solo algunos pasos entre una y otra están permitidos. Esa tabla de pasos está escrita en el servidor, que es quien manda, y copiada a mano en la web, para mostrar solo los botones que sirven. Para que no se desincronicen, una prueba de la web lee el archivo del servidor como texto y lo interpreta con una expresión regular. Funciona, pero es frágil: reformatear la tabla en el servidor puede romper la prueba sin que haya ningún error real.

**Qué haría falta:** mover la tabla a `@v2/shared`, que ya comparten ambos lados, e importarla desde los dos. La prueba entonces se reduce a verificar una sola fuente.

### D-115 · En el plan gratuito de Vercel, un archivo grande solo avanza con la página abierta

**Dónde:** `v2/vercel.json` (bloque `crons`), `v2/apps/api/src/features/exportaciones/`, [el procedimiento operativo](../v2/docs/operations/exportaciones-publicas.md)
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta

Las descargas grandes de Datos abiertos se arman por partes. El plan gratuito de Vercel solo admite tareas programadas una vez por día, y no se sabe todavía en qué plan va a correr el sitio. Por eso el armado avanza cuando alguien consulta cómo va su archivo: cada consulta hace un tramo corto (hasta 20 pasos o 10 segundos) antes de responder. La tarea programada, `/api/cron/exportaciones`, corre una vez por día (6 de la mañana UTC, 3 en Argentina) y sirve de respaldo: retoma lo que nadie volvió a consultar.

En la práctica, si la persona cierra la página, un archivo grande espera hasta la corrida del día siguiente, y como el archivo vence a las 24 horas de pedido, un trabajo largo puede no llegar a terminarse. La pantalla ya lo avisa (el archivo se prepara con la página abierta), así que no promete de más; pero es una mala experiencia para quien pide un conjunto grande y se va.

**Qué haría falta:** definir el plan. Con uno que admita tareas frecuentes, volver a programar el cron cada pocos minutos. Con el gratuito, un programador externo que ejecute `pnpm --filter @v2/api exportaciones:once`, o un trabajo en segundo plano de verdad. Relacionada con [D-102](#d-102--cálculos-y-archivos-de-gran-volumen-necesitan-trabajos-desacoplados).

### D-116 · Dos variables para la dirección de la API en la app

**Dónde:** `v2/apps/mobile/src/civic/ideal.ts:9` (`EXPO_PUBLIC_BASTA_V2_URL`), `v2/apps/mobile/src/civic/config.ts:46` (`EXPO_PUBLIC_CIVIC_API_URL`), `v2/apps/mobile/.env.example`
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta

La app lee a qué servidor hablarle de dos variables. Según el ejemplo de configuración, `EXPO_PUBLIC_CIVIC_API_URL` apunta a la API cívica de v1 y `EXPO_PUBLIC_BASTA_V2_URL` a la API de v2, que usan las pantallas de Imaginar, campañas y Mi espacio. Las dos están documentadas, pero siguen siendo dos: un build con una sola configurada deja la otra mitad de la app sin conexión, y el mensaje («La conexión todavía no está configurada en esta instalación») no dice cuál falta. Como el dominio sirve v2 desde el 4/8/2026 y v1 está archivado, tampoco está claro que la API de v1 siga existiendo donde la app la busca.

**Qué haría falta:** decidir si las pantallas que usan la variable vieja pasan a la API de v2, de modo que quede una sola variable; o, si v1 sigue en pie para algo, escribir para qué. Después, que el mensaje de error nombre la variable que falta y que la documentación de la app diga lo mismo en todos lados.

### D-117 · Los códigos de respaldo de dos pasos distinguen mayúsculas

**Dónde:** `v2/apps/api/src/features/auth/two-factor-routes.ts:73` (`generateBackupCodes`) y `:210` (verificación)
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta

Los códigos de respaldo de la verificación en dos pasos se generan en mayúsculas, con la forma `XXXXX-XXXXX`, y el servidor guarda solo una huella de cada uno, que no se puede leer. Al ingresar, lo que la persona escribe se compara tal cual contra esas huellas. Quien lo tipea en minúsculas, o lo copia de un papel sin respetar las mayúsculas, recibe «Código inválido», el mismo mensaje que si se hubiera equivocado de código, sin ninguna pista. Es justo la situación en la que alguien ya perdió el acceso a su aplicación de autenticación y necesita que el respaldo funcione a la primera.

**Qué haría falta:** normalizar lo que se escribe antes de comparar (pasar a mayúsculas, sacar espacios, aceptar el código sin el guion y volver a ponerlo). Los códigos ya emitidos siguen sirviendo, porque la normalización produce exactamente la forma que se cifró.

### D-118 · Páginas que siguen con el diseño viejo oscuro

**Dónde:** `/bienvenida`, `/apoyo`, `/kit-de-prensa`, `/comunidad` (`v2/apps/web/src/app-routes.tsx`); la lista de páginas ya migradas es `v2/apps/web/src/layouts/papel-routes.ts`
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta

Cuatro páginas siguen con el diseño oscuro de la versión anterior mientras el resto del sitio está en papel y tinta. Dos de ellas, «Apoyá al movimiento» y el kit de prensa, se enlazan desde el pie de todas las páginas, así que quien las abre cambia de aspecto de golpe.

**Qué haría falta:** rediseñarlas con el kit de papel y sumarlas a la lista de páginas migradas; antes, decidir si las cuatro siguen haciendo falta.

### D-119 · La guía PDF del sistema quedó desactualizada y sus negritas no salen

**Dónde:** `output/pdf/basta-pais-en-comun-guia-del-sistema.pdf`, fuente en `output/pdf/basta-pais-en-comun-source/` (`build_pdf.py`, `fonts/`)
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** media
**Estado:** abierta

La guía del sistema («Mi Argentina ideal», 47 páginas, versión del 8/10/2026) es el documento que se le puede pasar a alguien de afuera para explicarle el diseño completo. Tiene cuatro problemas:

- **Quedó desactualizada el mismo día.** Dice que las páginas de la plataforma no se cambiaron, y se cambiaron: Imaginar, campañas, fichas y Mi espacio ya existen. Lo que presenta como capas por construir en parte ya está.
- **Las negritas no salen.** Los dos archivos de la tipografía Archivo (`Archivo-Regular.ttf` y `Archivo-Bold.ttf`) declaran el mismo nombre interno, `ArchivoSemiBold-Regular`, y el PDF incrustó uno solo. Los títulos de las tarjetas, los términos destacados y los códigos de referencia salen en peso normal, y la jerarquía queda plana.
- **Llama «propuesta» a cosas que el sitio ya tiene,** como la entrada de aportes y las campañas.
- **Usa palabras con otro sentido que el sitio.** «Relato» (18 veces), que el glosario del sitio retiró; «contrato», donde el sitio dice ahora «reglas de la campaña»; y «lentes» para cinco etapas que en el sitio son los modos del mapa, algo distinto de las lentes de la Radiografía.

**Qué haría falta:** regenerar el PDF con una negrita real (otro archivo o un nombre interno distinto) y comprobar con `pdffonts` que se incrustan las dos; reescribir las partes que describen el estado del sitio contra el sitio actual, con fecha; y alinear el vocabulario con el glosario del sitio. La auditoría de maquetación (`layout-audit.json`) no mide fuentes ni contraste, y por eso no vio el defecto.

### D-120 · No está verificado que «los dos más lejanos» de un grupo no mida entre centros de provincia

**Dónde:** `v2/apps/web/src/pages/LaRadiografia/sections/FichaDeNucleo.tsx:95`, `v2/packages/civic-core/src/radiografia/nucleos.ts:140` (`dosMasLejanos`)
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** baja
**Estado:** abierta — sin verificar

La ficha de un grupo de la Radiografía muestra «Los dos más lejanos»: la distancia, redondeada a la decena de kilómetros, entre los dos aportes más separados del grupo. Se calcula entre los puntos guardados de cada aporte, con la precisión pública (500 metros o más gruesa). No se verificó qué punto queda guardado cuando alguien elige el lugar por nombre (una provincia, una localidad) en lugar de marcar un punto en el mapa. Si en esos casos el punto es el centro del lugar, la cifra mide la distancia entre centros de provincia y no entre las personas, y se presenta como si fuera lo segundo.

**Qué haría falta:** mirar, con datos de prueba, qué coordenadas guardan los aportes con lugar elegido por nombre. Si son centros, excluir de ese cálculo a los aportes cuya precisión sea más gruesa que una localidad, o rotular la cifra como distancia entre los lugares elegidos.

### D-121 · La campaña nacional todavía no existe en producción

**Dónde:** `v2/docs/operations/campana-nacional.md`, `v2/packages/db/scripts/campana-nacional/` (script `db:seed-campana-nacional`), `v2/apps/web/src/pages/Imaginar/FraseCampana.tsx`
**Encontrada:** 2026-10-09, pulido de Argentina ideal (análisis en `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/`)
**Severidad:** alta
**Estado:** abierta

El 9/10/2026 se decidió que todo aporte que no elija otra campaña vaya a una campaña nacional y permanente, «Mi Argentina ideal», que coordina Juan Bravin y cuya primera devolución está prevista para el 15/3/2027. El código ya sabe sembrarla y ya reserva la apertura de campañas a la administración, pero en producción la campaña no existe. Sembrarla es un paso humano que exige, en este orden:

1. aplicar las migraciones 0025 a 0030 a la base de producción;
2. que exista la cuenta de Juan en v2, activa y con el correo verificado;
3. cargar su nombre de usuario en `ADMIN_USERNAMES`, la lista de quienes pueden administrar campañas, después de crear la cuenta y no antes, para que nadie pueda registrarse con ese nombre y quedar como administración;
4. correr el script de siembra, primero en seco y después con `--aplicar`.

Hasta entonces, todo aporte se publica sin campaña. El recibo lo dice como es: «Por ahora no está en ninguna campaña, así que nadie se comprometió a responderlo». Es honesto, pero el sitio invita a aportar a una campaña que todavía no existe. El procedimiento no dice qué pasa con los aportes publicados antes de la siembra.

**Qué haría falta:** hacer los cuatro pasos, abrir `/campanas/mi-argentina-ideal` y comprobar que muestre la edición 1 y el estado abierta; y decidir qué se hace con los aportes que hayan entrado sin campaña mientras tanto.

**Avance del 2026-10-20:** el paso 1 está hecho de sobra. Producción tiene las migraciones hasta la 0042 (Mirar, campañas propuestas y aportes parecidos), aplicadas después de un respaldo (`respaldo-antes-mirar-2026-10-20`), y el código de Mi Argentina ideal está desplegado. Siguen faltando los pasos 2 a 4: la cuenta de Juan todavía no existe en v2. Mientras no exista la campaña, Ver dice que la primera edición todavía no abrió, Mirar dice que la campaña no está abierta para mirar aportes, e Imaginar deja escribir.

### D-122 · Los scripts de migración y siembra leen `v2/.env` aunque se les pase otra base

**Dónde:** `v2/packages/db/scripts/migrate.ts`, los scripts de siembra de `v2/packages/db/scripts/` que llaman a `dotenv`
**Encontrada:** 2026-10-09, revisión visual después del pulido de Argentina ideal (`v2/docs/analisis/2026-10-09-pulido-argentina-ideal/h-revision-visual-despues.md`)
**Severidad:** media
**Estado:** abierta

`v2/.env` apunta a la base de producción. Estos scripts cargan ese archivo con `dotenv` al arrancar. Si quien los corre fija `DATABASE_URL` a una base local, `dotenv` no la pisa y la escritura va a la base local, que es lo que pasó en la revisión del 9/10/2026. Pero el resto de las claves de producción quedan cargadas en el proceso, y un script corrido sin fijar la variable escribe en producción sin que nadie lo haya decidido (es el mismo riesgo de D-014). La siembra de la campaña nacional ya no lee `v2/.env`: exige `--url` y, para una base remota, `--produccion`.

**Qué haría falta:** que todos los scripts que escriben en una base pidan la dirección de forma explícita, como la siembra nacional, y dejen de leer `v2/.env`.

**Avance 15/10/2026:** `migrate.ts` dejó de cargar `.env`; exige conexión explícita, comprueba la cadena completa de huellas, serializa por candado y requiere destino v2, última migración revisada y `--aplicar` para escribir remotamente. La siembra restante conserva el riesgo: D-122 sigue abierta.

### D-123 · Mi perfil sigue con la plantilla vieja

**Dónde:** `v2/apps/web/src/pages/` (la página de `/mi-perfil`)
**Encontrada:** 2026-10-09, revisión visual después del pulido de Argentina ideal (`v2/docs/analisis/2026-10-09-pulido-argentina-ideal/h-revision-visual-despues.md`)
**Severidad:** baja
**Estado:** abierta

La página ya usa el diseño de papel, pero conserva la estructura de v1: muestra «0 XP» y «Racha de 0 días», con el número cero en dígitos y un sistema de puntos que el resto del sitio no usa, y su columna tiene otro ancho que las demás páginas.

**Qué haría falta:** decidir qué tiene que mostrar el perfil en v2 y llevarlo a la misma plantilla que Mi espacio, o fundirlo con Mi espacio.

### D-124 · El sello de los ejemplos del Mandato se lee poco de noche

**Dónde:** `v2/apps/web/src/pages/ElMandatoVivo/` (página de ejemplo)
**Encontrada:** 2026-10-09, revisión visual después del pulido de Argentina ideal (`v2/docs/analisis/2026-10-09-pulido-argentina-ideal/h-revision-visual-despues.md`)
**Severidad:** baja
**Estado:** abierta

El sello rojo que marca un ejemplo mide entre 3,07:1 y 3,48:1 de contraste sobre el fondo oscuro, en letra de 10 px. Para texto chico hace falta 4,5:1. Es justamente el aviso que dice que lo que se ve no es real.

**Qué haría falta:** un rojo más claro para el registro de noche, o un sello más grande; respetando la guardia de colores de esas páginas.

### D-125 · La campaña de ejemplo cuenta aportes sintéticos como publicados

**Dónde:** `v2/packages/db/scripts/preparar-demo-campanas.ts`, `v2/packages/db/scripts/demo-campanas-aportes.ts`, detalle de campaña
**Encontrada:** 2026-10-09, revisión visual después del pulido de Argentina ideal (`v2/docs/analisis/2026-10-09-pulido-argentina-ideal/h-revision-visual-despues.md`)
**Severidad:** baja
**Estado:** abierta

En la demo local, la campaña de ejemplo dice «3 aportes publicados» al lado de «sin participantes». Los tres son sintéticos. Solo pasa en bases locales de demostración, pero confunde a quien revisa el sitio con esos datos.

**Qué haría falta:** que el conteo excluya los aportes marcados como demostración, o que la demo lo diga junto al número.

### D-126 · Cualquier escritura en las fuentes invalida los archivos de exportación en preparación

**Dónde:** `v2/packages/db/migrations/0030_exportaciones_durables.sql` (disparadores sobre `senales`, `contribuciones`, `campanas`, `fichas_futuro`), `v2/packages/db/src/repositories/exportaciones.ts` (`vigencia`)
**Encontrada:** 2026-10-09, al investigar el CI rojo del despliegue del pulido de Argentina ideal (corrida 38004196171)
**Severidad:** media
**Estado:** abierta

Un archivo de descarga se arma por tramos. Para no mezclar datos viejos con nuevos, cada `UPDATE` o `DELETE` sobre las cuatro tablas fuente sube un número de revisión, y todo archivo que se estaba preparando pasa a «fallido» con el motivo «Cambió una fuente o su permiso». El disparador es por sentencia, así que también lo sube un borrado que no borra nada. Con poca actividad no se nota. Con gente corrigiendo o retirando aportes mientras otra persona descarga, los archivos grandes pueden no terminar nunca. En las pruebas apareció así: una suite que borraba campañas hizo fallar la descarga de otra.

**Qué haría falta:** subir la revisión solo cuando la sentencia toca filas (`REFERENCING OLD TABLE` y contar), y considerar que el archivo se arme sobre una foto consistente en lugar de invalidarse.

### D-127 · Las pruebas de la siembra nacional se rompen el 1 de marzo de 2027

**Dónde:** `v2/packages/db/scripts/campana-nacional/contrato.ts` (`CIERRE_RECEPCION = '2027-02-28'`), `v2/packages/db/tests/seed-campana-nacional.test.ts`
**Encontrada:** 2026-10-09, al investigar el CI rojo del despliegue del pulido de Argentina ideal (corrida 38004196171)
**Severidad:** media
**Estado:** abierta

La siembra se niega a crear la campaña si la fecha de hoy es posterior al cierre de recepción de la edición 1, y eso está bien. Pero las pruebas que lanzan el script usan el reloj real y esperan que termine sin error, así que desde el 1/3/2027 fallan y ponen el CI en rojo sin que nadie haya cambiado nada.

**Qué haría falta:** que el script acepte una fecha de referencia para las pruebas (o que las pruebas fijen el reloj), y preparar antes de esa fecha cómo se abre la edición 2.

### D-128 · La lectura de diseño de una ficha conserva un límite fijo de cien alternativas

**Dónde:** `v2/packages/db/src/repositories/diseno-ficha.ts` (`leer`), `v2/apps/web/src/pages/Fichas/Alternativas.tsx`
**Encontrada:** 2026-10-14, al completar comparación y revisiones de alternativas
**Severidad:** media
**Estado:** abierta

La consulta existente lee las primeras cien alternativas por fecha y no tiene cursor. Una ficha que supere ese límite puede conservar propuestas o revisiones que la pantalla no alcanza a mostrar. Las referencias siguen guardadas, pero un enlace al original no garantiza que esté en el lote visible. Las afirmaciones y pruebas de esa lectura también tienen límites fijos.

**Qué haría falta:** paginar las colecciones de diseño con cursores estables, separar sus consultas cuando corresponda y permitir abrir una alternativa por identificador sin depender de la página actualmente cargada. Mostrar la parcialidad y mantener conteos completos.

### D-129 · La verificación local mostró fallos intermitentes fuera de los cambios nuevos

**Dónde:** `v2/apps/web/src/lib/auth/sesion.test.tsx`, `v2/apps/api/tests/exportaciones-ideal.test.ts`, ejecución de `pnpm verify`
**Encontrada:** 2026-10-14, durante la verificación de capacidades y recepciones parciales
**Severidad:** baja
**Estado:** abierta; causa sin determinar

Después de dos verificaciones completas exitosas, una corrida posterior falló con `Parse Error: Expected HTTP/, RTSP/ or ICE/` en la lectura de contexto de exportación. Esa suite pasó al repetirla aislada junto con capacidades y alternativas. Otra corrida agotó los diez segundos de la prueba de cambio de sesión al registrar una cuenta; el caso ya había pasado en corridas anteriores. No se cambió la implementación de esas operaciones.

**Qué haría falta:** reproducir con carga controlada, revisar limpieza de conexiones/consultas y fijar un paralelismo adecuado para el entorno. Se usa un máximo de cuatro procesos por paquete en la verificación local posterior, conservando todas las pruebas y sus tiempos límite. Esto controla la carga, pero no demuestra por sí solo la causa ni un defecto de producción.

La repetición completa con cuatro procesos por paquete terminó correctamente: 3.322 pruebas aprobadas, más lint, tipos, corpus y compilación. La causa de los fallos intermitentes anteriores sigue sin determinarse.

En la entrega de escucha, una corrida completa volvió a mostrar fallos transitorios: ingreso a una iniciativa recién creada con 404 y lectura de capacidad sin `data`. Las cuatro suites relacionadas pasaron aisladas (24 pruebas) sin cambios de lógica de producción; se añadió información del cuerpo de respuesta al fallo de ingreso para facilitar una próxima reproducción. Esto no determina la causa ni permite declarar resuelta D-129.

En la entrega de reservas por tarea y campo, la primera corrida completa volvió a fallar con `Parse Error: Expected HTTP/, RTSP/ or ICE/` en `participacion-ideal.test.ts`. La corrida focalizada anterior también tuvo un 404 inesperado en una prueba previa de ejecución; su repetición aprobó las 27 pruebas. Se conserva el registro y no se considera resuelta la causa por repetir una corrida en verde. La segunda verificación completa terminó correctamente: 3.364 pruebas aprobadas, con lint, tipos, corpus y compilación.

En la entrega de campo nativo y devolución, la verificación completa mostró un 404 inesperado al confirmar una recepción y una consulta de exportación sin `data`. Se agregaron aserciones con el cuerpo de respuesta para facilitar el diagnóstico. Las cuatro suites de reservas, exportaciones y campo pasaron en tres repeticiones aisladas consecutivas (28 pruebas por corrida), sin cambiar la lógica de esas operaciones. La causa permanece abierta.

Una repetición completa posterior mostró `socket hang up`, dos fallos en cascada después de interrumpir la restauración de la señal de prueba y un timeout de transformación de Vitest. Se adaptaron las suites afectadas y las de campo a un servidor HTTP que escucha durante toda la suite, con cierre explícito al terminar; así Supertest no abre y cierra un puerto por petición. Es una mitigación del transporte de pruebas, coherente con [el caso documentado por Supertest](https://github.com/forwardemail/supertest/issues/844), no una prueba de que todos los fallos anteriores tengan la misma causa. No se modificaron respuestas ni se agregaron reintentos automáticos a las pruebas.

La verificación completa posterior a esa mitigación aprobó 3.370 pruebas, lint, tipos, corpus y compilación. La deuda permanece abierta: un resultado en verde no demuestra la causa de todos los fallos anteriores.

En la entrega de conciliación y síntesis del 15/10, una corrida completa agotó el tiempo de `plans-registry.test.ts` al cargar los cuerpos de los planes; el registro informó 901 segundos transcurridos pese a un límite de diez segundos. Las ocho pruebas del archivo pasaron aisladas después (1,81 segundos en total), sin cambios en su código. No se identificó la causa; no se aumentaron tiempos límite ni se omitió la prueba.

Otra corrida falló en el arranque de dos archivos por un timeout de la comunicación interna de Vitest al cargar `/@vite/env`. `FuturosTerritorio.test.tsx` y `Planes.test.tsx` pasaron aislados (siete pruebas). La verificación posterior reduce de cuatro a dos procesos por paquete para limitar carga, sin retirar casos ni aumentar sus tiempos máximos; esto no identifica la causa del fallo.

La corrida con dos procesos completó las pruebas unitarias, de contenido y de base, pero `senales-adhesion.test.ts` registró el mismo error de protocolo HTTP visto en entregas anteriores. Se adaptó esa suite al servidor persistente por archivo (`clienteHttp`) que ya usan las suites afectadas anteriores; no se modificó la lógica de adhesión ni se añadieron reintentos.

La verificación completa posterior de esta entrega aprobó 3.411 pruebas, lint, tipos, contenido y compilación. Se conservan la deuda y los incidentes anteriores; la corrida en verde no demuestra su causa.

**Continuación 15/10 (validación espacial):** la primera verificación volvió a
recibir 404 en una aceptación concurrente de `gestion-iniciativas.test.ts`, donde
se esperaba el conflicto 409. Se migró esa suite al mismo servidor HTTP persistente
por suite que ya usan las otras pruebas corregidas y se incluyó el cuerpo de las
respuestas en el diagnóstico. No se modificaron handlers ni estados aceptados,
no se añadieron reintentos y D-129 conserva su estado abierto.

**Continuación 17/10 (recorrido escolar):** la verificación completa recibió 404 en `/api/v1/geo/version` y en la verificación de correo de `auth-flows.test.ts`, donde ambas pruebas exigen 200. Las nuevas pruebas de descubrimiento y vínculo aprobaron en esa misma corrida. Se adaptaron únicamente `geo-catalogo.test.ts` y `auth-flows.test.ts` al helper existente `clienteHttp`, que mantiene un servidor por suite. Se conservan las aserciones y no se agregan reintentos ni cambios a esos handlers. La verificación completa posterior aprobó 3.428 pruebas, lint, tipos, corpus y compilación. Esta mitigación no identifica la causa de todos los incidentes; D-129 permanece abierta.

### D-130 · La membresía de iniciativas necesita contadores atómicos y errores visibles

**Dónde:** `v2/packages/db/src/repositories/iniciativas.ts` (`addMember`, `removeMember`), `v2/apps/api/src/features/iniciativas/routes.ts`, `v2/apps/web/src/pages/IniciativaDetail.tsx`
**Encontrada:** 2026-10-14, al conectar pruebas con iniciativas
**Severidad:** media
**Estado:** resuelta en código; despliegue pendiente

El alta/baja de membresía y el cambio del contador se realizan en sentencias separadas. `removeMember` descuenta incluso si no había membresía: repetir una salida puede reducir el conteo de otras personas. La ruta de ingreso interpreta cualquier excepción como «ya era miembro», ocultando otras fallas. La pantalla existente tampoco muestra los errores de ingreso/salida ni una confirmación. Los permisos de las nuevas acciones consultan la tabla de membresías, no ese contador; su exactitud no corrige estos problemas anteriores.

**Qué haría falta:** actualizar membresía y contador en una misma transacción, distinguir duplicado de fallo, probar ingresos/salidas concurrentes y dar respuesta visible en la pantalla, con acceso a iniciar sesión cuando corresponda.

**Resolución (14/10):** `IniciativaMembresiaRepository` serializa operaciones por iniciativa y actualiza membresía y contador en una sola transacción. El ingreso duplicado y la salida repetida no modifican otras membresías. Se retiraron los métodos anteriores; los fallos llegan a la pantalla. Se impide salir al propietario y a quien conserva tareas activas. La migración 0036 concilia los contadores anteriores. Pruebas reales de Postgres cubren carreras y reintentos; los componentes comprueban permisos y errores visibles.

**Esquema aplicado 15/10/2026:** 0036 quedó desplegada dentro de la cadena 0032–0039 en v2. Los contadores se comprobaron conciliados. El despliegue del código de la API sigue pendiente.


### D-131 · La geografía publicada contiene polígonos inválidos y diferencias entre capas

**Dónde:** edición `ign-20260922-eff8b13b48b0`, `v2/apps/web/public/geo/versiones/`.
**Encontrada:** 2026-10-15, al ejecutar controles GEOS sobre los archivos publicados.
**Severidad:** alta
**Estado:** abierta

La comprobación detectó 11 polígonos inválidos: Buenos Aires (06); departamentos
66049, 66126, 86007, 86042 y 94021; municipios 060875, 140091, 142105, 309220 y
620070. Hay autointersecciones y, en Villarino, un agujero fuera de su contorno.
Un anillo cerrado y con área no bastaba para encontrar estos problemas.

El informe también registra 29 pares superpuestos, 726 diferencias de pertenencia
provincial y 20 diferencias de cobertura departamental por encima de 1 m². Ese
umbral descarta ruido numérico: no convierte cada diferencia en un error legal.
Las capas se simplificaron por separado (200/500/400 m). Hay diez áreas municipales
sin código y 283 controles que no se pueden calcular por geometrías inválidas o
ausentes; no se reportan como aprobados. La extensión de cada incidencia identifica
el rasgo, no necesariamente la pequeña zona del defecto.

**Mitigación implementada:** `/validacion-espacial` muestra el informe íntegro y
filtrable, ligado por SHA-256 a los archivos exactos. Las futuras importaciones
fallan antes de activar si GEOS encuentra polígonos inválidos o no está disponible
el motor. La edición anterior se conserva. Se retiró la afirmación de que la
simplificación garantiza ausencia de huecos y solapes.

**Pendiente:** contrastar los casos con originales y cartografía censal, preparar
una edición corregida con diferencias cuantificadas y revisar sus bordes. No se
aplica `make_valid` automáticamente ni se reemplazan límites oficiales por una
conjetura. No habilitar agregados departamentales/municipales ni transferir
estadísticas por coincidencia de código. Se mantienen D-089 y la comparabilidad
censal/temporal abiertas.

### D-132 · La siembra de áreas de vida falla al repetirse

**Dónde:** `v2/packages/db/scripts/seed-life-areas.ts`, rama de subcategorías con slug repetido entre áreas.
**Encontrada:** 2026-10-17, al reiniciar el ensayo escolar local.
**Severidad:** baja (herramienta de preparación).
**Estado:** abierta.

Aunque el script se anuncia idempotente, al encontrar el mismo slug en otra área intenta insertar de nuevo el slug prefijado sin comprobar si ya existe. Una segunda ejecución falla con `life_area_subcategories_unique`. La base escolar conservó sus tareas y evidencias; el fallo ocurrió en un catálogo ajeno al recorrido.

El arranque escolar ahora ejecuta sólo las migraciones y el catálogo de provincias que necesita, sin esos seeds ni su carga de `.env`. Pendiente: resolver las subcategorías por área y slug canónico/prefijado, y probar dos ejecuciones sobre la misma base sin duplicados ni cambios a respuestas existentes.

### D-133 · El enlace para preparar una síntesis sin sesión lleva a una página que no existe

**Dónde:** `v2/apps/web/src/pages/SintesisNacional.tsx:127`.
**Encontrada:** 2026-10-19, al relevar las páginas que rodean al mapa.
**Severidad:** baja.
**Estado:** ~~abierta~~ → **resuelta 2026-10-20**.

Sin sesión, «Preparar una edición» apunta a `/login?redirect=/sintesis-nacional/nueva`. En v2 no hay ruta `/login`: el ingreso es `/ingresar`. La persona cae en la página de no encontrado y pierde el destino. Pendiente: usar la ruta de ingreso con el mismo parámetro de retorno que usan las otras páginas, y una prueba que falle si un enlace interno apunta a una ruta que no está registrada.

**Cómo se cerró:** el enlace usa `hrefIngresar('/sintesis-nacional/nueva')`, el mismo contrato de ingreso con regreso que el resto del sitio.

### D-134 · La campaña nacional hace tres preguntas distintas

**Dónde:** la portada (`Home/sections`), las reglas sembradas en `v2/packages/db/scripts/campana-nacional/contrato.ts` y la portada del mapa cuando se entra a aportar (`ElMapa/sections/PortadaMapa.tsx`).
**Encontrada:** 2026-10-19, al relevar el recorrido de Mi Argentina ideal.
**Severidad:** media.
**Estado:** ~~abierta~~ → **resuelta 2026-10-20**.

La portada pregunta «En tu Argentina ideal, ¿qué sería posible en tu vida?». Las reglas de la campaña preguntan «Si la Argentina funcionara como vos la imaginás, ¿qué te gustaría que fuera posible en tu vida de todos los días?». La portada del mapa dice «Contá qué futuro querés, qué lo impide y qué podrías aportar». Son tres invitaciones distintas para la misma campaña, y la tercera pide algo que las otras dos no piden. Pendiente: una sola pregunta, definida en un solo lugar de `@v2/shared` y leída por las tres superficies. La propuesta `v2/docs/specs/2026-10-19-mi-argentina-ideal-la-pila.md` la toma como parte del rediseño.

**Cómo se cerró:** `PREGUNTA_MI_ARGENTINA_IDEAL` en `@v2/shared` es la única pregunta. La leen la portada (que ahora tiene el campo para escribir), las reglas sembradas de la campaña (`contrato.ts`, con prueba) e Imaginar; la portada del mapa dejó de hacer una tercera.

### D-135 · El mandato vivo no tiene entrada desde el menú

**Dónde:** `v2/apps/web/src/components/papel/papel-nav.ts`, `PapelFooter.tsx`.
**Encontrada:** 2026-10-19, al relevar la navegación.
**Severidad:** media.
**Estado:** abierta.

`/mandato-vivo` no aparece en el header, en el menú del teléfono ni en el footer. La única entrada es `/apoyo` («Registrar un pulso»), que sólo enlaza el footer viejo de v1 en páginas que no usan el diseño de papel. Una persona que recorre el sitio no tiene cómo llegar. Pendiente: decidir dónde vive el mandato en el recorrido, o declarar que todavía no se ofrece y quitarle las promesas que le hacen otras páginas.

### D-136 · La lectura asistida de Imaginar manda el texto a un proveedor externo

**Dónde:** `v2/apps/api/src/features/contribuciones/routes.ts` (`POST /api/v1/contribuciones/interpretar`), `interpretacion.ts`, y en la web `pages/Imaginar/Asistencia.tsx`.
**Encontrada:** 2026-10-19, al relevar el modelo de datos de los aportes.
**Severidad:** alta.
**Estado:** ~~abierta~~ → **resuelta 2026-10-20**: la API ya no tiene `/interpretar` y la web borró la lectura asistida junto con el panel guiado del mapa.

Cuando la persona marca la casilla de consentimiento, el borrador de su aporte viaja entero al proveedor que elija `getAICompleter()`, que es Groq cuando está `GROQ_API_KEY`. La ADR 0009 (D2) dice que el texto que escribe la gente no sale de nuestra infraestructura y nombra una sola excepción, el asistente de coaching. Esta segunda salida no está nombrada en la ADR ni decidida por el dueño. Que la persona consienta no la cubre: la regla es del proyecto, no de cada aporte. Además, la fábrica de proveedores no tiene ninguna guarda que impida usar un proveedor externo para texto de aportes. Pendiente: o sacar la lectura asistida, o moverla a un proveedor local detrás de la misma interfaz, o que el dueño la agregue como excepción con una ADR. La propuesta `v2/docs/specs/2026-10-19-mi-argentina-ideal-la-pila.md` deja la lectura asistida afuera del recorrido nuevo.

**Resolución (20/10):** la API ya no tiene `POST /api/v1/contribuciones/interpretar` ni `interpretacion.ts`, y `GET /contribuciones/contexto` dejó de anunciar un proveedor, así que el texto de un aporte no tiene por dónde salir a Groq ni a otro. La prueba de `exportaciones-ideal.test.ts` afirma que la ruta responde 404. El recorrido nuevo de Imaginar no la llama (P7 del plan de Mi Argentina ideal); el panel viejo (`pages/Imaginar/Asistencia.tsx` y su consulta) queda sin servicio y se borra con la entrega 3.

### D-137 · Una adhesión se puede dejar sobre un aporte retirado o sobre el propio

**Dónde:** `v2/packages/db/src/repositories/adhesiones.ts`, `adherir`.
**Encontrada:** 2026-10-19, al relevar las reacciones a aportes ajenos.
**Severidad:** media.
**Estado:** resuelta en código, 2026-10-20.

`adherir` descarta los aportes retenidos, pero no los que tienen `estado = 'retirada'`, así que se puede sumar «A mí también me pasa» a un aporte que su autor retiró. Tampoco comprueba que el actor no sea el autor, y en `/senal/:id` el botón aparece también sobre el aporte propio. Y nunca escribe `user_id`, con lo que el índice único por cuenta que el esquema define para que la misma persona en dos navegadores no cuente doble no se usa en este camino. Como las adhesiones encienden el brillo del mapa, las tres cosas inflan un conteo público. Pendiente: filtrar retirados, rechazar la adhesión propia, completar `user_id` desde el actor vinculado y una prueba de integración por cada caso.

**Resolución (20/10):** `AdhesionesRepository.adherir` descarta los aportes retirados además de los retenidos, rechaza la adhesión propia —por el actor o por la cuenta— y la ruta responde 409 `ADHESION_PROPIA`, y escribe `user_id` con la cuenta de la sesión o la vinculada al actor, así el índice único por persona impide que la misma cuenta sume desde dos navegadores. Las tres cosas tienen su prueba en `senales-adhesion.test.ts`. Que el botón no aparezca sobre el aporte propio es de la web, que ya recibe `esPropia`. Los deseos de Mi Argentina ideal, además, dejan de usar la adhesión: se contestan con las tres respuestas de `pila_respuestas`, que guardan la cuenta desde la primera fila; para `/senal/:id` la web lo pregunta a `GET /api/v1/pila/aportes/:id` (tarea 13 del plan).

### D-138 · Los límites por IP pueden frenar a un aula entera en Mirar

**Dónde:** `v2/apps/api/src/middleware/rate-limit.ts`: `generalRateLimit` (120 pedidos por minuto por IP en todo `/api`) y `pilaRateLimit` (1.000 por hora por IP en `/api/v1/pila`).
**Encontrada:** 2026-10-20, al construir la API de Mirar.
**Severidad:** media.
**Estado:** abierta (mitigada en código el 2026-10-20).

El lanzamiento en persona (D1) pone a un aula o a un club detrás de una sola IP. Treinta personas que contestan un aporte cada tres segundos hacen unos 600 pedidos por minuto, y el límite general responde 429 mucho antes. Una tanda completa son unos catorce pedidos por persona (la tanda, diez opiniones, dos duelos y algún reporte), así que el límite de Mirar alcanza para dos tandas por persona y por hora en un aula de treinta. Los dos viven en la memoria del proceso y cuentan por instancia: en Vercel el corte real depende de cuántas instancias atiendan, y no se puede predecir. Los techos por persona ya se cuentan en la base (300 opiniones y 60 tandas por hora, 30 reportes por día). Pendiente: decidir con el dueño si en Mirar la IP deja de ser la unidad —por ejemplo, sacar `/api/v1/pila` del límite general y subir el propio, para que manden los techos por persona— y probarlo con la carga de un aula antes del lanzamiento.

**Mitigación del 20/10:** el límite general ya no cuenta `/api/v1/pila/`; Mirar tiene su propio techo por IP de 6.000 pedidos por hora (`PILA_POR_HORA`) y publicar un aporte tiene el suyo, de 150 por hora (`APORTES_POR_HORA`), en vez de los 30 de los envíos anónimos. Los dos se cambian por variable de entorno, sin tocar código. Sigue pendiente: la carga de páginas pasa por el límite general (`RATE_LIMIT_MAX_REQUESTS`, 120 por minuto), que para un encuentro grande conviene subir antes, y una prueba de carga con un aula real antes del lanzamiento.

### D-139 · Ver deja deducir por diferencia cuántas personas hay en una provincia suprimida

**Dónde:** `v2/apps/api/src/features/vision/service.ts` (supresión de personas por provincia y por región).
**Encontrada:** 2026-10-20, al integrar el rediseño de Mi Argentina ideal.
**Severidad:** media.
**Estado:** abierta.

Ver muestra `null` para una provincia con menos de cinco personas, pero muestra el total de su región cuando llega a cinco. Restando el total de la región menos las provincias visibles se puede deducir el número exacto de la provincia suprimida, y en un lugar chico ese número puede señalar a alguien (el mismo riesgo que D-088). Pendiente: supresión complementaria, es decir, suprimir también una segunda provincia de la región (o el total) cuando una sola queda oculta, y una prueba que lo afirme.

### D-140 · La regla de qué aportes entran en Mirar y en Ver está escrita dos veces

**Dónde:** `v2/packages/db/src/repositories/_pila.ts` (`elegible`) y `v2/packages/db/src/repositories/vision.ts` (`aporteElegible`).
**Encontrada:** 2026-10-20, al integrar el rediseño de Mi Argentina ideal.
**Severidad:** media.
**Estado:** ~~abierta~~ → **resuelta 2026-10-20**.

Mirar y Ver tienen que leer exactamente los mismos aportes: deseos sin retirar ni retener, con el texto cedido, de hasta 140 letras y con contribución en la campaña. La regla nació en dos frentes que trabajaron en paralelo y quedó escrita dos veces. El día que una cambie y la otra no, Ver va a contar aportes que nadie puede mirar, o al revés. Pendiente: una sola expresión exportada desde `_pila.ts`, usada por los dos repositorios, y una prueba que cree un aporte en el borde (141 letras, sin cesión, retenido) y afirme que ninguno de los dos lo trae.

**Cómo se cerró:** la parte del aporte es una sola expresión, `aporteQueEntra` en `_pila.ts`; Mirar la combina con las campañas que se miran y Ver con la campaña pedida.

### D-141 · `pnpm test:integration:local -- <filtro>` corre la suite entera

**Dónde:** `v2/scripts/test/integracion-local.sh`.
**Encontrada:** 2026-10-20, al integrar el rediseño de Mi Argentina ideal.
**Severidad:** baja.
**Estado:** abierta.

El script pasa sus argumentos a `pnpm test:integration`, que los reparte con `pnpm -r` y no llegan a vitest de cada paquete. El filtro se ignora y corre todo, lo que hace lento iterar sobre una sola suite. Pendiente: pasar el filtro a cada paquete o documentar cómo correr una sola suite contra la base descartable.

### D-142 · Bordes de las campañas propuestas

**Dónde:** `v2/apps/api/src/features/campanas/` y `v2/packages/db/src/repositories/impulso.ts`.
**Encontrada:** 2026-10-20, al integrar el rediseño de Mi Argentina ideal.
**Severidad:** media.
**Estado:** abierta.

Cuatro bordes del paso previo (spec §11), encontrados al construirlo: una campaña devuelta a `reuniendo` que ya tenía 50 personas vuelve sola a revisión en cuanto llega una persona más, sin que nadie la haya corregido; una cuenta puede crear borradores sin tope; dos presentaciones en el mismo instante podrían pasar el chequeo de una sola campaña activa por cuenta (cerrarlo bien pide un índice parcial único, es decir, una migración); y quien impulsa una campaña abierta y edita sus reglas la manda a borrador, desde donde sólo puede volver a presentarla y pasar otra vez por revisión. Pendiente: decidir con el dueño cada uno; el primero y el tercero son los que pueden pasar sin que nadie lo note.

### D-143 · El cliente de la API de la web no acepta respuestas sin cuerpo

**Dónde:** `v2/apps/web/src/lib/api.ts`.
**Encontrada:** 2026-10-20, al integrar el rediseño de Mi Argentina ideal.
**Severidad:** baja.
**Estado:** abierta.

Un 204 o un 202 sin JSON hacen fallar el pedido del lado de la web, aunque el servidor haya hecho lo que se le pidió. Mirar lo esquiva en `lib/queries/pila.ts` y la página de una campaña que junta gente trata el 204 de `/llegada` como un error que ignora. Pendiente: que `api.ts` devuelva `undefined` ante una respuesta sin cuerpo y sacar los dos atajos.

### D-144 · Los duelos de Mirar sólo comparan aportes vistos en la misma visita

**Dónde:** `v2/packages/shared/src/participacion/pila.ts` (`EstadoEnLaPila.acuerdos`) y `v2/apps/web/src/pages/MiArgentinaIdeal/mirar/`.
**Encontrada:** 2026-10-20, al integrar el rediseño de Mi Argentina ideal.
**Severidad:** baja.
**Estado:** abierta.

Para preguntar «¿Cuál va primero?» hacen falta los dos textos, y el estado de la tanda trae los «Yo también» anteriores sólo como ids. Entonces un duelo sólo puede juntar dos aportes que la persona vio en esta visita, y quien vuelve otro día no compara lo de hoy con lo de antes. «Lo que va primero» junta menos comparaciones de las que podría. Pendiente: que la tanda traiga, cuando toca un duelo, la tarjeta del acuerdo viejo con el que se va a comparar.

### D-145 · El aviso de un aporte retenido por reportes no se repite

**Dónde:** `v2/apps/api/src/features/pila/service.ts` (claves `pila:retenido:<id>` en `eventos_civicos`).
**Encontrada:** 2026-10-20, al integrar el rediseño de Mi Argentina ideal.
**Severidad:** baja.
**Estado:** abierta.

La clave del aviso es por aporte. Si Juan devuelve un aporte y vuelve a juntar 13 reportes, se retiene de nuevo pero no llega aviso, porque la clave ya existe. Pendiente: sumar a la clave la decisión que lo retuvo (el id de `pila_decisiones`).

### D-146 · Toda escritura desde el navegador respondía 500 en producción

**Dónde:** `v2/apps/api/src/middleware/security.ts` (`corsMiddleware`).
**Encontrada:** 2026-10-20, probando el dominio después de desplegar Mi Argentina ideal.
**Severidad:** crítica.
**Estado:** ~~abierta~~ → **resuelta 2026-10-20**.

El middleware de CORS daba por hecho que una petición del mismo sitio llega sin `Origin`. No es así: el navegador manda `Origin` en cada POST, PUT y DELETE, aunque la página y la API compartan dirección (ADR 0008). Un `Origin` que no estuviera en `CORS_ORIGINS` tiraba un error, y el error salía como 500. En local andaba, porque Vite manda `http://localhost:5173`, que es justo el valor por defecto de la lista. En producción la variable no nombraba el dominio, así que publicar un aporte, ingresar, opinar o reportar respondía «Algo salió mal» desde el navegador, mientras que la misma petición hecha con `curl`, que no manda `Origin`, andaba. No sabemos desde cuándo. La suposición está desde el primer commit de la API (7/5/2026), la variable no figura en ningún documento de operación, y la base de producción no tiene ni una señal ni un aporte.

**Cómo se cerró:** un `Origin` igual a la dirección de la petición misma (esquema de afuera por `trust proxy`, host de `Host` o `X-Forwarded-Host`) se acepta siempre, sin depender de la lista. La lista queda para los orígenes ajenos. La prueba es `apps/api/src/middleware/__tests__/cors.test.ts`.

### D-147 · Un origen que CORS no permite recibe 500 y no 403

**Dónde:** `v2/apps/api/src/middleware/security.ts` (`corsMiddleware`) y `middleware/error-handler.ts`.
**Encontrada:** 2026-10-20, al cerrar D-146.
**Severidad:** baja.
**Estado:** abierta.

Cuando un sitio ajeno llama a la API, el middleware tira un error común y la respuesta es un 500 «Algo salió mal», sin `requestId`. El rechazo es correcto, pero lo registra como falla del servidor: una alarma de errores 500 se dispararía por un sitio ajeno, y fue lo que hizo que D-146 pareciera un error interno. Pendiente: responder 403 con un código propio, o no dar permiso CORS y dejar que el navegador bloquee la respuesta.

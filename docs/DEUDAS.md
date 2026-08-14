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
| [D-004](#d-004--falta-la-capa-de-departamentos) | Falta la capa de departamentos | Media | Abierta |
| [D-005](#d-005--falta-la-capa-de-municipios) | Falta la capa de municipios | Media | Abierta |
| [D-006](#d-006--las-73-dependencias-entre-planes-viven-solo-en-v1) | Las dependencias entre PLANes viven solo en v1 (ya son 208) | Media | Abierta |
| [D-007](#d-007--dos-majors-de-typesreact-conviven-por-parche-de-pnpm) | Dos majors de `@types/react` conviven por parche de pnpm | Media | Abierta |
| [D-008](#d-008--los-parches-de-dependencias-están-atados-a-versión-exacta) | Los parches de dependencias están atados a versión exacta | Baja | Abierta |
| [D-009](#d-009--tres-planes-del-corpus-fuente-no-están-migrados-a-v2) | Tres PLANes del corpus fuente no están migrados a v2 | Alta | **Resuelta** |
| [D-010](#d-010--sesiones-concurrentes-se-tragan-los-cambios-de-otras) | Sesiones concurrentes se tragan los cambios de otras | Media | Abierta |
| [D-011](#d-011--la-geometría-de-provincias-erra-en-los-bordes) | La geometría de provincias erra en los bordes | Alta | Abierta |
| [D-012](#d-012--el-geojson-usaba-un-nombre-no-canónico-para-caba) | El GeoJSON usaba un nombre no canónico para CABA | Alta | **Resuelta** |
| [D-013](#d-013--el-test-del-corpus-de-planes-tiene-el-total-a-mano-y-se-rompe-cada-vez) | El test del corpus de PLANes tiene el total a mano y se rompe cada vez | Media | Abierta |
| [D-014](#d-014--los-tests-de-integración-ensucian-el-mapa-que-el-sitio-sirve) | Los tests de integración ensucian el mapa que el sitio sirve | Alta | Parcial |
| [D-015](#d-015--las-cifras-del-bloque-de-atracción-de-plansus-no-tenían-fuente-externa--resuelta-parcial) | Las cifras del bloque de atracción de PLANSUS no tenían fuente externa | Media | **Parcial** |
| [D-016](#d-016--este-mismo-archivo-usa-el-id-d-013-dos-veces) | Este mismo archivo usa el id D-013 dos veces | Media | **Resuelta** |
| [D-017](#d-017--plangeo-promete-secciones-interno-que-no-existen) | PLANGEO promete secciones `[INTERNO]` que no existen | Media | Abierta |
| [D-018](#d-018--budget_class-del-registro-no-es-monótono-en-dólares) | `budget_class` del registro no ordena por presupuesto | Media | Abierta |
| [D-019](#d-019--v-fin-05-suma-el-piso-sustitutivo-a-los-pisos-que-sustituye--resuelta) | V-FIN-05 suma el piso sustitutivo a los pisos que sustituye | Media | **Resuelta** |
| [D-020](#d-020--el-conteo-canónico-vive-hardcodeado-en-siete-lugares-y-ninguno-avisa-cuando-queda-viejo--resuelta) | El conteo canónico vive hardcodeado en siete lugares y ninguno avisa cuando queda viejo | Media | **Resuelta** |
| [D-021](#d-021--quedan-conteos-viejos-en-la-prosa-publicada-y-ninguna-guardia-los-mira) | Quedan conteos viejos en la prosa publicada, y ninguna guardia los mira | Baja | Abierta |
| [D-022](#d-022--los-cuatro-planes-de-julio-nunca-entraron-a-presupuesto_consolidado_bastamd) | Los cuatro PLANes de julio nunca entraron a `PRESUPUESTO_CONSOLIDADO_BASTA.md` | Media | Abierta |
| [D-023](#d-023--la-sección-9-de-planpuerta-se-pasó-248-palabras-del-techo-y-nadie-lo-vio) | La SECCIÓN 9 de PLANPUERTA se pasó 248 palabras del techo | Baja | Abierta |
| [D-024](#d-024--hay-dos-suites-de-tests-en-el-repo-y-sólo-una-corre-en-ci) | Hay dos suites de tests en el repo y sólo una corre en CI | Media | Abierta |
| [D-028](#d-028--editar-la-portada-de-un-plan-corre-todas-sus-anclas-de-remisión) | Editar la portada de un PLAN corre todas sus anclas de remisión | Media | Abierta |
| [D-032](#d-032--los-ensayos-del-ciclo-i-glosan-planmesa-como-soberanía-alimentaria-y-hace-meses-que-no-lo-es) | Los ensayos del Ciclo I glosan PLANMESA como soberanía alimentaria | Media | Abierta |
| [D-033](#d-033--pnpm-formatcheck-falla-en-564-archivos-preexistentes-scriptscontent-incluido) | `pnpm format:check` falla en 564 archivos preexistentes, `scripts/content/` incluido | Baja | Abierta |
| [D-045](#d-045--platform_feedback-es-una-tabla-muerta-que-modela-lo-contrario-del-canal-de-escucha) | `platform_feedback` es una tabla muerta que modela lo contrario del canal de escucha | Media | Abierta |
| [D-046](#d-046--la-guardia-de-este-mismo-archivo-está-en-rojo-y-nadie-la-corre) | La guardia de este mismo archivo está en rojo y nadie la corre | Alta | Abierta |
| [D-047](#d-047--el-basemap-se-congela-en-la-fecha-en-que-se-extrajo-y-nadie-se-entera) | El basemap se congela en la fecha en que se extrajo y nadie se entera | Baja | Abierta |
| [D-048](#d-048--la-csp-viaja-sólo-en-las-respuestas-de-api-y-nunca-llega-al-documento) | La CSP viaja sólo en las respuestas de `/api/` y nunca llega al documento | Alta | **Resuelta** |
| [D-049](#d-049--las-tipografías-de-la-interfaz-salen-de-google-fonts-en-todas-las-páginas) | Las tipografías de la interfaz salen de Google Fonts en todas las páginas | Media | **Resuelta** |
| [D-050](#d-050--el-borde-del-recorte-de-teselas-se-ve-en-el-agua) | El borde del recorte de teselas se ve en el agua | Baja | Abierta |
| [D-051](#d-051--el-pmtiles-de-12-gb-no-está-publicado-en-ningún-lado) | El `.pmtiles` de 1,2 GB no está publicado en ningún lado | Alta | Abierta |
| [D-052](#d-052--el-37-del-corpus-de-entrenamientos-es-texto-generado-y-repetido) | El 37% del corpus de entrenamientos es texto generado y repetido | Alta | Abierta |
| [D-053](#d-053--el-catálogo-anunciaba-53-horas-de-entrenamiento-y-se-lee-en-16--resuelta) | El catálogo anunciaba 53 horas de entrenamiento y se lee en 16 | Alta | **Resuelta** |
| [D-054](#d-054--la-mitad-de-las-lecciones-está-escrita-en-tuteo-y-no-en-rioplatense) | La mitad de las lecciones está escrita en tuteo, y no en rioplatense | Media | **Parcial** |
| [D-055](#d-055--contentfile-no-resuelve-en-ninguna-de-las-329-lecciones-y-el-schema-lo-exige) | `contentFile` no resuelve en ninguna de las 329 lecciones, y el schema lo exige | Media | Abierta |
| [D-056](#d-056--ninguna-lección-cita-una-fuente-ni-nombra-un-plan) | Ninguna lección cita una fuente ni nombra un PLAN | Alta | Abierta |
| [D-057](#d-057--la-política-de-privacidad-espera-tres-datos-que-sólo-puede-dar-el-dueño) | La política de privacidad espera tres datos que sólo puede dar el dueño | Media | Abierta |
| [D-058](#d-058--un-cron-que-falla-no-le-avisa-a-nadie-y-ahora-uno-de-ellos-sostiene-una-promesa-legal) | Un cron que falla no le avisa a nadie, y ahora uno de ellos sostiene una promesa legal | Media | Abierta |
| [D-059](#d-059--la-csp-del-documento-necesita-unsafe-inline-en-los-estilos-y-el-hosting-estático-no-deja-sacarlo) | La CSP del documento necesita `'unsafe-inline'` en los estilos, y el hosting estático no deja sacarlo | Baja | Abierta |
| [D-060](#d-060--la-suite-de-integración-de-la-api-no-la-linta-nadie) | La suite de integración de la API no la linta nadie | Baja | Abierta |
| [D-061](#d-061--153-lecciones-usan-encabezados-más-profundos-que-los-dos-que-el-plan-permite) | 153 lecciones usan encabezados más profundos que los dos que el plan permite | Baja | Abierta |

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
**Estado:** abierta

Las ~530 unidades del IGN no están. El modo Análisis muestra el nivel «departamento» deshabilitado con su razón a la vista, que es lo correcto, pero el análisis se queda en el escalón más grueso que existe.

Necesita un extracto de Geofabrik (~1,2 GB) procesado con osmium, o la capa del IGN directamente.

---

### D-005 · Falta la capa de municipios

**Dónde:** ídem D-004
**Encontrada:** 2026-08-01, escribiendo la spec de la Simulación
**Severidad:** media
**Estado:** abierta

Los rankings de la Simulación (§7.3) piden municipios y el esquema los soporta, pero la geometría no existe. Hasta que esté, el ranking municipal solo puede armarse con los municipios que tengan señales geo-resueltas — lo cual hoy, por D-001, son cero.

Bloquea la rebanada 4 de `docs/specs/2026-08-01-el-mapa-simulacion.md`.

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
**Estado:** abierta

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
**Estado:** **parcialmente resuelta 2026-08-02** — las fugas conocidas están tapadas; la causa de fondo sigue

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

---

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
**Estado:** abierta

Además de las siete copias estructurales de D-020, **el número viejo sobrevive en la prosa que se le muestra al lector**. Todos estos siguen diciendo 22:

| Dónde | Qué dice | Qué es |
|---|---|---|
| `strategic-initiatives.ts:1786` | «son 22 PLANes simultáneos (al 23 de abril de 2026)» | `summary` de PLANGEO — se publica |
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

### D-028 · El brillo dibujado es invertible: delata cuánta gente habló en una celda

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
**Estado:** abierta

La guardia que pidió [D-016](#d-016--este-mismo-archivo-usa-el-id-d-013-dos-veces) existe y está bien escrita: verifica que un id no nombre dos deficiencias distintas y que el índice y el cuerpo se cubran **en las dos direcciones**. Corrida hoy, falla: **seis entradas del cuerpo no tienen fila en el índice** — D-025, D-026, D-027, D-029, D-030 y D-031. Son 6 de 33.

Y falla por una segunda cosa, que es la que de verdad importa: **`D-028` nombra dos deficiencias distintas y sin relación** — «Editar la portada de un PLAN corre todas sus anclas de remisión» (línea 637) y «El brillo dibujado es invertible: delata cuánta gente habló en una celda» (línea 679). Es *exactamente* lo que D-016 describió y pidió prevenir, repetido, con la guardia ya escrita mirando para otro lado. La segunda es además una deuda de privacidad, que es la peor clase para tener escondida detrás de un id compartido.

La causa de que nadie lo note es de tubería, no de disciplina. El workflow de CI corre sobre `SocialJusticeHub/**`, y las seis entradas huérfanas se escribieron desde sesiones que sólo tocaron `v2/`. O sea que **la guardia de un archivo compartido vive detrás del filtro de rutas de uno solo de los dos árboles**, y el árbol que más lo escribe hoy es el que no la dispara. Es la misma forma de D-013 (el test que se rompe cada vez): una verificación que existe y no se ejecuta es indistinguible de una que no existe, salvo por la falsa sensación de estar cubierto.

Se descubrió de rebote: el importador de `docs/DEUDAS.md` a `faltas` contó 33 entradas contra 27 filas de índice, y la diferencia llevó a correr la guardia a mano.

**Por qué no se arregla acá:** agregar seis filas al índice es trivial, pero mover la guardia de árbol es una decisión sobre el CI de los dos proyectos, y el archivo tiene sesiones concurrentes escribiéndolo (ver [D-010](#d-010--sesiones-concurrentes-se-tragan-los-cambios-de-otras)).

**Qué haría falta:** las seis filas de índice, y después mover la guardia a `v2/scripts/content/` con su propio paso de CI —o agregar `docs/DEUDAS.md` a los `paths` del workflow existente— para que la escriba quien la escriba, alguien la mida.

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
**Estado:** abierta

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
**Estado:** **parcialmente resuelta 2026-08-13** — la lista dura ya corrió sobre todo el corpus; la blanda queda reportada para revisión humana

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
**Estado:** abierta

Las 329 entradas de `lessons[]` declaran `contentFile: "lessons/NN-NN-….md"`, rutas del árbol de v1 que en v2 **no existen** — los cuerpos están en la raíz del directorio del curso y son `.mdx`. El campo está declarado como requerido en el schema Zod, así que v2 valida un dato que apunta a la nada en el 100% de los casos. La página funciona porque el registry deriva el slug de `key` y nunca abre `contentFile`.

Sus únicos lectores son `scripts/content/migrate-courses-v1-to-v2.ts` y `scripts/content/verify-courses-migration.ts`, que lo resuelven contra el árbol de v1. La migración terminó el 2026-05-13.

**Qué haría falta:** retirar los dos scripts de migración de cursos —su trabajo está hecho y commiteado— y borrar el campo del JSON y del schema. Mientras esté, el schema documenta como obligatorio algo que es basura de migración.

### D-056 · Ninguna lección cita una fuente ni nombra un PLAN

**Dónde:** `v2/content/courses/*/*.mdx` — las 329
**Encontrada:** 2026-08-12, buscando enlaces y citas en el corpus
**Severidad:** alta
**Estado:** abierta

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
**Estado:** abierta

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

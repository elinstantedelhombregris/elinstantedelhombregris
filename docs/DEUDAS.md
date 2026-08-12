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
| [D-003](#d-003--glyphs-y-teselas-del-mapa-salen-de-cdn-de-terceros) | Glyphs y teselas del mapa salen de CDN de terceros | Media | Abierta |
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
**Estado:** abierta

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

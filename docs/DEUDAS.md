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
| [D-014](#d-014--los-tests-de-integración-ensucian-el-mapa-que-el-sitio-sirve) | Los tests de integración ensucian el mapa que el sitio sirve | Alta | Abierta |

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

**Dónde:** `v2/apps/api/tests/*.test.ts` — 21 de 23 archivos tienen `afterAll`, y al menos uno limpia de menos
**Encontrada:** 2026-08-02, cuando los estados vacíos no aparecían con la base supuestamente en cero
**Severidad:** alta
**Estado:** abierta

Después de borrar las 12 voces de prototipo, `dreams` quedó en cero — pero el instrumento seguía diciendo **«voces en vista: 4»**. El endpoint del mapa consulta las cuatro capas, y las otras tres no estaban vacías:

```
pulso · «Segunda señal de prueba — el bus 12 nunca pasa»
pulso · «Auth signal.»
pulso · «Esto es una señal de prueba. Necesitamos más...»
pulso · «No alcanza la plata.»
```

«Auth signal.» sale textual de `pulso-flows.test.ts:70`. Ese archivo **sí** tiene `afterAll`, pero limpia `proposalVotes` y `proposals` y **no** `pulseSignals`.

**Por qué es alta.** Los tests de integración corren contra la misma base que sirve el sitio de desarrollo, así que cada `pnpm test` deja señales de prueba en el mapa público. No son datos de demostración que alguien decidió poner: son residuo, con textos como «Auth signal.», y nadie los mira porque aparecen de a una. Además tapan el estado vacío recién construido: la condición es `todas.length === 0`, y con cuatro sobras nunca se cumple.

**Qué haría falta.** Dos cosas, y la segunda importa más que la primera:

1. Que cada test limpie lo que crea — empezando por `pulseSignals` en `pulso-flows.test.ts`.
2. Que los tests **no corran contra la base de desarrollo**. Un branch de Neon efímero por corrida, o al menos una base aparte, es lo que corresponde. Mientras compartan base, el próximo olvido vuelve a ensuciar el mapa y nadie se entera hasta que alguien mira.

**Las cuatro filas actuales siguen ahí:** borrarlas es destructivo y quedaba fuera de lo que se autorizó (que eran las 12 de `dreams`).

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

### D-013 · V-FIN-05 suma el piso sustitutivo a los pisos que sustituye

**Encontrada:** 2026-08-02, cargando las aristas de los cuatro PLANes nuevos
**Dónde:** `SocialJusticeHub/shared/validation-engine.ts` — regla `vFin05`

La regla suma el `constitutionalFloor` de todos los nodos y avisa si pasa el 10% del PBI. Hoy avisa **11,81%**, y ese número no mide nada: son los 9,41% que reclamaban los diecisiete PLANes con piso **más** el 2,40% de PLANPACTO, que es el piso que los **reemplaza**. Sumar el sustituto a los sustituidos es exactamente la lectura aditiva que PLANPACTO existe para impedir.

El mismo bug ya se arregló en `arquitecto-data.ts` cuando se cargó el nodo: ahí vive `PISOS_SUSTITUTIVOS`, y `ECOSYSTEM_METRICS` publica las dos cifras por separado —`constitutionalFloorGross` (7,82–9,41%, lo que se reclamaba, que es el hallazgo que funda al PLAN) y `constitutionalFloorEffective` (2,40%, lo que queda)—. El motor de validación tiene su propia suma y no se enteró.

**Por qué no se arregló en el momento:** el trabajo de ese día eran las aristas del grafo, y esto es la aritmética de los pisos. Mezclarlo habría metido dos cambios sin relación en el mismo commit.

**Cómo se arregla:** exportar `PISOS_SUSTITUTIVOS` desde `arquitecto-data.ts` y saltearlos en `vFin05`, igual que hace `sumConstitutionalFloorsGross()`. La regla queda avisando sobre el bruto —que sigue siendo información: el ecosistema reclamaba casi diez puntos— o sobre el efectivo, y hay que **elegir cuál y escribir por qué**, porque las dos cifras son ciertas y contestan preguntas distintas. `pisos-constitucionales.test.ts` ya fija las dos.

# Las deudas y La Radiografía — plan de trabajo

**Fecha:** 2026-08-13
**Método:** las 33 deudas abiertas de `docs/DEUDAS.md` se verificaron **contra el código de hoy**, no contra lo que dice su propia entrada. Cinco revisores en paralelo, uno por grupo temático, más un relevamiento del terreno de La Radiografía contra la base de producción (`cool-bird-63087148`).
**Resultado del triaje:** 9 son **peores** de lo escrito · 18 siguen vigentes tal cual · 4 están parcialmente resueltas · **2 ya no aplican y hay que cerrarlas**.

> **Lo primero, porque cambia el orden de todo lo demás: el mapa está roto en producción.**
> Y hay una sesión concurrente arreglándolo por una vía que reabre una deuda cerrada ayer.

---

## Vía 0 · Lo que arde ahora

### 0.1 · El basemap está muerto en producción — D-051

Verificado hoy contra el dominio vivo:

```
curl -sI https://www.elinstantedelhombregris.com/tiles/argentina.pmtiles
→ HTTP/2 200 · content-type: text/html · content-disposition: filename="index.html"
```

El archivo no está. El `rewrite` de `vercel.json` (`/((?!api/).*)` → `index.html`) le devuelve el HTML del index al navegador, con un 200 que engaña a cualquier chequeo ingenuo. Y el estilo que producción sirve **ya apunta ahí**: `/maps/oscuro.json` declara `pmtiles:///tiles/argentina.pmtiles` con 66 capas.

Consecuencia real: **quien entra a `/el-mapa` ve un rectángulo liso.** Sin costas, sin provincias, sin calles. Y sin un solo mensaje de error, porque `instrumento/MapaBase.tsx` no tiene `onError`. El `.pmtiles` de 1,2 GB existe en **una sola máquina**, está en `.gitignore`, y nada en el build verifica que exista.

El commit que cambió el mapa a pmtiles ya está desplegado. Esto no es un riesgo futuro: es el estado desde el 12/8.

### 0.2 · La colisión que hay que mirar de frente

En el árbol de trabajo, ahora mismo, hay una sesión concurrente resolviéndolo **volviendo a Carto**: `packages/shared/src/seguridad/csp.ts` vuelve a listar los cinco `cartocdn.com` en `img-src` y `connect-src`, `oscuro.json` cambia su fuente a `https://tiles.basemaps.cartocdn.com/...`, y aparece un `oscuro-propio.json` sin trackear.

Eso **reabre D-003** —la fuga de IP de cada visitante a un tercero— que se cerró ayer, y contradice lo que `content/legal/privacidad.mdx` ya afirma por escrito. Puede ser la decisión correcta como parche temporal. Lo que no puede es tomarse sin verla.

### 0.3 · Lo que se puede hacer sin decidir el hosting

- **`onError` en `MapaBase.tsx`** que diga «el basemap no cargó». Hoy el modo de falla es mudo, y eso es lo que hizo que esto viviera un día entero sin que nadie se enterara. **S.**
- **Una guarda de build o de humo** que pida el `.pmtiles` por rango y falle si el `content-type` es `text/html`. **S.**

### 0.4 · Y una trampa que aparece después, no antes

Si el `.pmtiles` se muda a un host externo (R2, bucket propio, subdominio), **la CSP lo bloquea**: `connect-src 'self'`. El mapa seguiría en blanco, ahora con una violación de CSP en consola en vez de un 200 de HTML. `packages/shared/src/seguridad/csp.ts` es la fuente única de la que sale el bloque `headers` de `vercel.json` — hay que tocarla en el mismo viaje.

**La alternativa que no necesita hosting nuevo** es bajar el maxzoom: z12 = 157 MB, z13 = 310 MB (medidos). Es una decisión del dueño, porque z15 lo eligió él.

---

## Vía 1 · Las deudas, en cinco montones

### Montón A · Veinte minutos, valor desproporcionado

| Deuda | Esf. | Qué |
|---|---|---|
| **D-046** | S | **El mejor valor por minuto de todo el registro.** La guardia está en rojo y no es que nadie la corra: **la corre y falla**, y eso deja salteadas siete guardias de PLANes, la de remisiones del corpus, la de sincronía de documentos públicos y el **build de producción de SocialJusticeHub**. El arreglo es editar una tabla: agregar seis filas de índice (D-025, D-026, D-027, D-029, D-030, D-031) y renombrar uno de los **dos D-028** a un id libre. |
| **D-010** | S | Un `.gitignore` para `ASCII-Video-*/`. Hay **6,9 GB de binarios** a un `git add -A` de entrar a la historia del repo, y ya pasó dos veces en once días. Cinco minutos desactivan la bomba; el hook de pre-commit puede venir después. |
| **D-013** | S | **Ya no aplica.** El total a mano del test se deriva hoy de `canon-registro.ts`. Marcarla resuelta. |
| **D-024** | S | **Ya no aplica** — el job de v2 ya existía cuando se escribió. Pero el revisor encontró debajo un defecto peor y real: **el CI de v2 no fue verde una sola vez en 58 corridas.** Cerrar D-024 y abrir esa. |

Este montón se hace primero. Es media mañana y destraba CI, guardias y el registro entero.

### Montón B · La ventana barata — hacer **antes** de que entren datos

Verificado hoy: `dreams`, `pulse_signals` y `proposals` están **en cero**. La ventana que el plan de la otra sesión describía nueve días atrás sigue abierta, y todo lo de acá se vuelve caro en cuanto haya una fila real que rebackfillear.

| Deuda | Esf. | Qué |
|---|---|---|
| **D-011** | L | **Peor de lo escrito: fallan tres capitales, no una.** Corrido hoy contra las 24 capitales: Neuquén → Río Negro, **Viedma → Buenos Aires**, **Posadas → `null`**. Fuera de capitales, **Mar del Plata → `null`** (~700.000 personas) y Río Grande → `null`. Las 24 features son `Polygon` simple: **ninguna es MultiPolygon**, así que las islas de Tierra del Fuego y del Delta no existen para el algoritmo. Hay que traer los límites del IGN con resolución real. |
| **D-050** | S | Dilatar la región antes de extraer. **Va en el mismo viaje que D-011**: geometría nueva obliga a re-extraer teselas igual, y un recorte con buffer sobre geometría buena resuelve las dos en una corrida. |
| **D-004 / D-005** | L/M | Parcialmente resueltas y mal descritas: **los 529 departamentos ya existen como filas** con id del Estado y centroide, y están en producción. Lo que falta es la **geometría**. Una sola descarga del IGN cubre D-011, D-004 y D-005. |

### Montón C · Legal — el costo lo paga alguien de afuera

| Deuda | Esf. | Qué |
|---|---|---|
| **D-057** | M | La política de privacidad **dice con todas las letras que el responsable de la base no está identificado**, y el art. 3 de la Ley 25.326 exige que lo esté. Necesita tres datos que sólo puede dar el dueño: razón social, domicilio legal y edad mínima. La tercera arrastra código (campo de edad en el registro). |
| **D-058** | M | El cron que borra sesiones vencidas es **lo único que vuelve cierta una frase publicada** («una tarea automática … borra toda sesión vencida hace más de 90 días»). Si falla, no avisa a nadie. `CRON_SECRET` no está en el `.env` local: el valor vive en un solo lugar que nadie mira. |

Estas dos son las únicas del registro donde no hacerlas le cuesta a un tercero, no a nosotros.

### Montón D · El corpus de entrenamientos — el más grande y el más roto

| Deuda | Esf. | Qué |
|---|---|---|
| **D-052** | XL | **320 de 329 lecciones** con texto generado y repetido. Cualquiera que lea dos seguidas ve la repetición. Ya existe `docs/plans/2026-08-12-entrenamientos-ciclo-1-el-cuerpo.md` — **0 de 97 tareas hechas, y sin commitear**. Borrar no alcanza: deja 320 lecciones truncadas. |
| **D-056** | XL | Ninguna lección cita una fuente ni nombra un PLAN, y **el quiz repite esas afirmaciones como respuesta correcta**. |
| **D-053** | M | El catálogo anuncia **53 horas y hay 14**. Es el dato inventado más visible de v2 y aparece en cuatro pantallas. Corregirlo duele comercialmente y es la única versión defendible. |
| **D-054** | M | La mitad de las lecciones en tuteo, contra la convención rioplatense del proyecto. |
| **D-055** | S | Borrar `contentFile` de los 31 `course.json` y del schema. Valor bajo y conviene decirlo: no le cambia nada a ningún lector. |

Este montón es un proyecto propio, no una tarde. Merece su propia decisión de alcance antes de empezar.

### Montón E · Baratas y de bajo valor — hacer al pasar por el archivo

**D-045** (S, borrar `platform_feedback`, tabla muerta y vacía) · **D-008** (S, una línea de condición de soltada en el parche de expo-sqlite) · **D-028** (S, una línea de norma sobre el orden de las tareas de cabecera) · **D-060** (M, extender el linter a `tests`; hoy los 29 archivos no tienen un solo `any`, así que no arregla nada que exista) · **D-033** (M, `format:check` falla en **615** archivos, no 564; nadie tiene una experiencia peor por esto).

Ninguna merece una jornada dedicada. Todas merecen hacerse cuando ya estés en ese archivo.

### Montón F · Necesitan una decisión antes que trabajo

| Deuda | Qué hay que decidir |
|---|---|
| **D-017** | Hay dos afirmaciones que se contradicen: **o el registro miente** (PLANGEO no es interno) **o el sitio publica lo que declaró que no publicaba**. Un proyecto que publica su registro de deudas entero por convicción puede perfectamente decidir que la respuesta es borrar la promesa. |
| **D-006** | Hay **dos grafos de dependencias que no coinciden** (ya son 229 aristas). Antes de portar nada hay que decidir de qué lado queda la autoridad. Valor hoy: bajo — nadie lo consume en v2. |
| **D-021** | El conteo viejo ya no es prosa archivada: **está en `Bienvenida.tsx:23`**, el primer número que lee alguien que entra. |

---

## Vía 2 · Completar La Radiografía

### 2.1 · Dónde estamos

**La rebanada 1 está hecha y verde.** `packages/civic-core/src/radiografia/` exporta el motor completo — puerto `Embebedor`, similitud, grafo k-NN, aristas declaradas, núcleos, frase del núcleo, dos más lejanos, geometría φ. 302 tests en civic-core, 59 de La Radiografía, seis defectos encontrados por verificación adversarial y arreglados con su mutación verificada.

### 2.2 · Qué la bloquea, exactamente

El relevamiento contra producción dio un número preciso: **del plan de la otra sesión llegaron 7 de 37 tasks.** Las rebanadas 1 y 2 (la tierra) están completas **y sembradas en producción** — `geo_calles` tiene 326.832 filas y `geographic_locations` 17.986. La rebanada 3 —la señal— no arrancó.

No existe: `civic-core/src/senal/vocabulario.ts`, `db/src/schema/senales.ts`, `shared/src/open-data/consentimiento.ts`, ni ninguna de las tablas `senales`, `actores`, `adhesiones`, `temas`.

**Faltan exactamente tres tasks para que exista `senales`:**

1. **Task 8 · el vocabulario** — los 9 tipos en 4 clases y las guardas que no compilan. **S–M, no depende de nada.**
2. **Task 10 · el consentimiento** — el texto de cesión. **S.** Es de donde cuelgan las etiquetas de núcleo.
3. **Task 11 · la migración `0016`** — el schema, los catálogos y el `.sql` con los INSERT escritos a mano. **L.**

Sumadas, jornada y media. Y los números `0016`, `0017` y `0018` **siguen libres**: la reserva del plan sigue siendo válida, no hay que renumerar.

### 2.3 · La secuencia, una vez que `senales` exista

| # | Rebanada | Depende de |
|---|---|---|
| 2 | El sustrato — migración `0020`, columna de vector, `analisis_corridas`, repositorio | Task 11 de ellos |
| 3 | La constelación — niveles 0 y 1, dos temas, esfera de Fibonacci | Rebanada 2 |
| 4 | La lista y la cabecera — cobertura, sesgo, frescura | Sale **junto con** la 3, no después |
| 5 | Nivel 2, el espejo, aristas declaradas | Cesión de B + `texto` exportado por D |
| 6 | El vacío en grabado y la lámina compartible | — |

### 2.4 · Una recomendación que destraba la rebanada 3

**Construir la constelación primero en canvas-2D y migrar a WebGL cuando duela.** La ADR 0003 pide, para reabrirse, que el dato *no pueda* servirse con SVG o canvas-2D a la fidelidad buscada — y con el corpus de hoy eso no se cumple ni de cerca. Las maquetas de esta misma sesión lo mostraron: 92 nodos con aristas, girando a 60 fps, en canvas-2D puro y sin una dependencia.

Eso permite tener la página entera funcionando **sin pelear con una ADR aceptada**, y deja la migración a `three.js` para el día en que el corpus la justifique — que es exactamente el día en que el gatillo de la 0003 se cumple solo. El motor no cambia: la geometría φ ya devuelve puntos en 3D y no sabe quién los dibuja.

### 2.5 · Dos cosas de mi propio trabajo que hay que corregir

- **Los ordinales del spec estaban mal y ya los corregí.** Decía «desde D-047» leyendo una reserva que nunca se usó; D-045 a D-060 están ocupados y **el próximo libre es D-061**. Escribir D-047 hoy habría pisado la entrada del basemap.
- **La ADR 0009 está sin commitear, dice «Accepted», y decide algo que nadie decidió.** Además su premisa central no se sostiene: el clasificador de `tema` de la spec B manda el texto crudo de cada señal a Groq, una llamada por fila — así que «el texto no sale de nuestra infraestructura» es falso mientras eso siga así. **No debe commitearse como está.** Ver decisión 2.

---

## Las decisiones que hay que tomar, y que no tomo yo

1. **El hosting del basemap** — subir el `.pmtiles` a un host externo (y tocar la CSP), bajar el maxzoom para que entre en Vercel, o aceptar el regreso a Carto que la otra sesión ya empezó, sabiendo que reabre D-003.
2. **La ADR 0009** — que el modelo local también clasifique el `tema` (y entonces el texto de verdad no sale), angostar la ADR y admitir el límite, o aceptar una API de proveedor y archivarla.
3. **El alcance del corpus de entrenamientos** — D-052 y D-056 son XL cada una. Se arreglan, se achica el catálogo a lo que sí está bien, o se despublica el Ciclo 1 hasta que esté.
4. **D-017** — si el registro miente o si el sitio publica lo que dijo que no publicaría.

---

## El orden que recomiendo

1. **Hoy** — Montón A completo (D-046, D-010, D-013, D-024) y el `onError` del mapa. Media mañana, y devuelve el CI a verde.
2. **Decisión 1**, porque el mapa está roto mientras tanto.
3. **Tasks 8, 10 y 11 de la otra sesión** — jornada y media, y aprovechan la ventana de tablas en cero.
4. **Montón B en el mismo viaje** — una sola descarga del IGN cubre D-011, D-004, D-005 y D-050, y re-extraer teselas es obligatorio de todos modos.
5. **Rebanadas 2, 3 y 4 de La Radiografía**, con la constelación en canvas-2D.
6. **Montón C**, que necesita datos del dueño y conviene pedirlos temprano.
7. **Montón D** con su alcance ya decidido.

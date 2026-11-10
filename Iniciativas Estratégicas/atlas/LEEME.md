# El atlas del corpus

Un grafo de los 28 documentos del taller: qué es cada PLAN, quién se apoya en quién, qué nombra cada
uno como propio y qué deja de cerrar cuando se edita uno. Sirve para dos cosas: **entender el corpus
sin leerlo entero** y **editar un PLAN sabiendo qué se rompe en los otros**.

```bash
node "Iniciativas Estratégicas/atlas/construir.mjs"
```

Tarda dos segundos, no tiene dependencias (Node 20+) y reescribe `atlas.html`, `DESARMONIAS.md` y
`grafo.json`. Abrí `atlas.html` en el navegador: es un solo archivo, con los datos adentro.

## En el sitio

Son dos páginas de la app, las dos con el encabezado y el pie del sitio. **`/planes`** es la
entrada: el mapa de la red arriba y el índice de los documentos abajo, con una sola selección
compartida (`v2/apps/web/src/pages/Planes/sections/MapaCorpus.tsx`). **`/atlas`** es el análisis en
profundidad: la matriz de vínculos, «antes de editar», los conceptos, las desarmonías y el
historial (`v2/apps/web/src/pages/Atlas.tsx`).

La página `/atlas` no reimplementa el visor: lo monta. `construir.mjs` deja sus piezas en
`v2/apps/web/public/atlas/` y la página las carga:

| Archivo | Qué es |
|---|---|
| `mapa.json` (~55 KB) | lo que dibuja la página de PLANes: nodos, vínculos, tesis y cuentas |
| `atlas.css` | los estilos del visor, **todos bajo la clase `.atlas`** para no pisar los del sitio |
| `atlas.js` | el visor; deja `window.__atlasBASTA.iniciar(grafo, elemento)`, que devuelve cómo desmontarlo |
| `grafo.json` (~2,8 MB) | los datos completos |

Es la misma plantilla que `atlas.html`, con cuatro diferencias: no trae título ni encabezado
propios (los pone la app); usa solo el registro papel; cada número de línea abre el documento en
GitHub en vez de copiar la ruta; y los comandos de terminal no se muestran. El código va en un
archivo aparte porque la política de seguridad del sitio (`v2/vercel.json`) no deja correr scripts
en línea.

Dos reglas para tocar `plantilla.html` sin romper el sitio: **toda regla de estilo cuelga de
`.atlas`** (el script falla si encuentra una suelta) y **el visor no busca nada fuera de su
elemento raíz** (ni `document.getElementById` ni escuchas en `document`).

**Si editás un PLAN, corré `construir.mjs` y commiteá `v2/apps/web/public/atlas/` junto con el
documento.** Ninguna guardia lo exige todavía (D-152): un atlas viejo en el sitio no rompe nada,
pero sus números de línea dejan de coincidir con los documentos.

## El registro: cómo se van cerrando las desarmonías

Cada desarmonía tiene un **id** de ocho caracteres que sale de su tipo, su documento y lo que dice
—nunca del número de línea—, así que se la puede seguir aunque el texto se corra. Está en
`DESARMONIAS.md` y al pie de cada ítem en el atlas.

El ciclo de una edición:

```bash
# 1. editar uno o más PLANes
node "Iniciativas Estratégicas/atlas/construir.mjs"
#    → «Desde la última entrada: cambiaron PLANPACTO · 2 dejaron de estar · 0 aparecieron»

# 2. cerrar a mano lo que el script no puede ver
node "Iniciativas Estratégicas/atlas/construir.mjs" --resolver  3fa9c1d2 "PLANJUS: el costo anual queda en 300–600M en la tesis y en la tabla"
node "Iniciativas Estratégicas/atlas/construir.mjs" --descartar 7be0a455 "No es contradicción: la tesis da el costo neto y la tabla el bruto"

# 3. dejar la entrada escrita
node "Iniciativas Estratégicas/atlas/construir.mjs" --registrar "PLANPACTO: las dos citas a PLANJUS pasan a ser por línea"
```

Una desarmonía se cierra de tres maneras:

- **Sola.** Se corrige el documento y el patrón deja de encontrarla. Vale para todo lo que sale de
  `construir.mjs`: citas rotas, espejos, conteos, códigos fantasma, tablas sin orientar.
- **Resuelta a mano** (`--resolver`). Las que anotó un lector no tienen patrón que las vuelva a
  buscar. `lecturas.lock.json` guarda lo que decían sus líneas el día de la lectura; cuando ese texto
  cambia, quedan marcadas «el texto cambió» y esperan que alguien confirme.
- **Descartada** (`--descartar`). Alguien la miró y no era un error. No se borra: queda en
  «Cerradas a mano» con su razón. `--reabrir <id>` la devuelve.

`--registrar` agrega una entrada a `historial.json` con la fecha, el commit sobre el que se tomó, los
documentos que cambiaron (versión, líneas y palabras), las desarmonías que dejaron de estar —con el
cómo— y las que aparecieron. `HISTORIAL.md` es lo mismo para leer en un diff, y la vista «Historial»
del atlas lo muestra de lo último a lo primero. La entrada 0 es la línea de base.

Conviene **una entrada por edición con sentido**, commiteada junto con los documentos que tocó: el
historial y `git log` cuentan entonces la misma historia, uno en desarmonías y el otro en líneas.

## Antes de editar un PLAN

```bash
node "Iniciativas Estratégicas/atlas/construir.mjs" --impacto PLANDIG        # el documento entero
node "Iniciativas Estratégicas/atlas/construir.mjs" --impacto PLANDIG §8     # una sección
node "Iniciativas Estratégicas/atlas/construir.mjs" --impacto PLANDIG:788    # una línea
```

Responde tres preguntas: qué citas **por número de línea** caen en el tramo (y cuántas quedan más
abajo, que son las que se corren si el tramo cambia de largo), qué citas **por sección** le apuntan,
y qué **conceptos definidos ahí** usan otros documentos. En el atlas es la vista «Antes de editar».

## Después de editar

1. Corré `construir.mjs`. Si una línea citada ya no dice lo que decía, aparece como **ancla corrida**
   (con la línea nueva y la lista de citas a renumerar) o **ancla reescrita** (el texto cambió en el
   lugar: hay que releer si la cita sigue valiendo).
2. Renumerá las citas que indique.
3. `node "Iniciativas Estratégicas/atlas/construir.mjs" --fijar` acepta el estado nuevo.

Esto cubre el hueco que `SocialJusticeHub/scripts/verificar-remisiones.ts` declara en su cabecera:
aquella guardia detecta una cita que apunta a nada; ésta detecta una que apunta a **otra cosa**. No la
reemplaza: aquélla falla el CI, ésta explica.

## Qué hay adentro

| Archivo | Qué es | ¿Se edita a mano? |
|---|---|---|
| `construir.mjs` | El extractor: lee el taller y arma todo | sí, es código |
| `plantilla.html` | El visor, sin datos | sí, es código |
| `atlas.html` | El visor con los datos adentro, para abrir con doble clic | **no** — se regenera |
| `v2/apps/web/public/atlas/` | Lo que consumen las dos páginas del sitio | **no** — se regenera |
| `DESARMONIAS.md` | La lista de lo que no cierra, para leer en un diff | **no** — se regenera |
| `grafo.json` | Los datos crudos (ignorado por git: está entero en `atlas.html`) | **no** |
| `anclas.lock.json` | Qué decía cada línea citada la última vez que se fijó | solo con `--fijar` |
| `historial.json` / `HISTORIAL.md` | El registro de versiones del corpus | solo con `--registrar` |
| `resoluciones.json` | Los cierres a mano, con su razón | con `--resolver`, `--descartar`, `--reabrir` |
| `lecturas.lock.json` | Qué decían las líneas que citó cada lector | solo con `--fijar` |
| `fichas/PLANX.json` | La ficha leída de cada PLAN | regenerar con un lector |
| `lecturas/*.json` | Lo que vieron los lectores: contradicciones internas y cruces | regenerar con un lector |
| `validar-ficha.mjs` | Comprueba cada cita de cada ficha contra el texto | sí, es código |
| `agentes/*.md` | Los encargos para los lectores | sí |

## Las dos capas, y cuánto confiar en cada una

**La capa de patrón** sale de `construir.mjs` y es determinista: remisiones por nombre, por sección
(`PLANX §3`, `Sección 3 de PLANX`) y por línea (`PLANX:123`); las cuatro declaraciones de dependencias
(`PLAN_REGISTRY.yml`, `DEPENDENCY_GRAPH.yml`, `shared/arquitecto-data.ts` y las tablas «aporta /
necesita» de cada documento); secciones, numeración, códigos que no son PLAN, conteos del canon. Todo
lo que informa trae archivo y línea.

**La capa leída** la escribieron modelos baratos, un lector por documento (Haiku para los seis más
cortos, Sonnet para el resto) y ocho más para los cruces. Son tres cosas:

- **Fichas**: tesis, resumen, conceptos propios, lo que toma de otros, cifras, tensiones. Cada ítem
  lleva `linea` y `cita`, y `validar-ficha.mjs` comprueba que la cita esté literal en esa línea. Las 28
  pasan. Lo que la validación **no** garantiza es el criterio: que un concepto sea «propio» y no
  prestado, o que el resumen sea justo, lo decidió el lector.
- **Lecturas**: contradicciones internas que el lector vio al fichar (dos cifras para lo mismo, una
  remisión a la sección equivocada). No las verificó nadie más. Traen las líneas para ir a mirar.
  Cuatro lectores no abrieron todas las secciones (PLANAGUA, PLAN24CN, PLANISV y PLANRUTA figuran como
  lectura parcial).
- **Cruces**: para los 48 conceptos más usados fuera de su dueño, un lector comparó la definición del
  dueño con cada uso ajeno. Solo entran los que citan literal a los dos lados; el juicio de que eso
  es una contradicción es del modelo.

Por eso las desarmonías tienen tres gravedades. **Rota** se prueba contra el texto. **Revisar** casi
siempre señala algo, pero hay que leer la línea: ahí viven todas las lecturas y los cruces, y más de
una va a resultar una diferencia de fase o de escenario bien rotulada. **Nota** no es un error.

## Rehacer la capa leída

Cuando un PLAN cambia mucho, su ficha envejece. `validar-ficha.mjs --todas` dice cuáles dejaron de
coincidir con el texto. Para rehacer una, se le da a un modelo el encargo de `agentes/ficha-brief.md`
con el código del PLAN; para rehacer los cruces:

```bash
node "Iniciativas Estratégicas/atlas/construir.mjs" --dossiers <carpeta> 48
```

y un lector por dossier con `agentes/cruce-brief.md`. Los dos encargos terminan en una validación
mecánica: el lector no devuelve nada que la máquina no pueda comprobar contra el texto.

## Lo que el atlas no hace

No edita ningún PLAN. No juzga si una propuesta es buena. Y no ve lo que no está nombrado: dos
documentos que hablan de lo mismo con palabras distintas no aparecen unidos, salvo que un lector lo
haya anotado.

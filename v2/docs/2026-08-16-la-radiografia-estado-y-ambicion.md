# La Radiografía — estado, defectos y hacia dónde

**Fecha:** 2026-08-16
**Método:** auditoría corriendo el código, más cuatro lentes de propuesta independientes (la constelación simulada, el arco emocional, la epistemología adversarial, el estado del arte) y un panel que las puntuó contra la constitución de producto.
**Alcance:** `packages/civic-core/src/radiografia/` · `apps/api/src/features/radiografia/` · `apps/web/src/pages/LaRadiografia/`

---

## 1 · El estado, en una línea

**Está entera, está verde, y está desconectada.**

163 tests pasan. El motor es sólido. La página hace exactamente lo que debe hacer con cero voces. Y **lee una tabla que ya no recibe escrituras**.

---

## 2 · El hecho que reordena todo

`apps/api/src/features/radiografia/lectura.ts:33` fija `FUENTE = 'dreams'` y la línea 164 hace `.from(dreams)`.

La cabecera de `packages/db/src/schema/dreams.ts` dice, ella misma: **«RETIRADA (migración 0022, 2026-08-13) — Ya no recibe escrituras: toda señal vive en `senales`»**. Del otro lado, `packages/db/src/repositories/civic-map.ts:123`: *«La capa "voz" sale de `senales` y ya no de `dreams`»*, con `.from(senales)` en la 199. La carga viva escribe en `senales` (`repositories/senales.ts:125`).

**Una voz cargada hoy nunca llega a La Radiografía.** Con diez mil filas en `senales`, la página seguiría diciendo «Todavía no habló nadie».

Lo que hace a esto peor que una página en blanco: **los 163 tests quedan verdes, el vacío diseñado sigue en pantalla, y nada falla.** El aparato de honestidad de la página —el corte, «esperando análisis», el cielo vacío— explica *otra* ausencia. Hoy el vacío que se ve no es la pieza diseñada: es un caño roto que se le parece, y no tenemos forma de distinguirlos desde afuera.

La decisión V4 de `el-vacio-como-pieza.md` —«se desarma solo»— es hoy **falsa**, y no por descuido de diseño: por la tabla.

Y hay una trampa encima. `packages/db/src/repositories/analisis.ts:190-207` (`faltanPorEmbeber`) hace `.from(dreams)` **siempre**; el parámetro `fuente` sólo filtra `analisis_vectores`. O sea que `pnpm radiografia:embeber --fuente senales` **corre sin error y produce filas que el lector jamás va a ver**.

`docs/DEUDAS.md` tiene 64 entradas, incluidas D-063 y D-064 que rodean el problema. Ninguna dice esto.

---

## 3 · Los otros defectos, verificados

| # | Defecto | Dónde | Por qué importa |
|---|---|---|---|
| **1** | **Ningún núcleo puede tener etiqueta, jamás** | `service.ts:63` — `textoDeLaSenal = () => null`, constante | Se escribió «hasta que la spec B escriba la columna de cesión». Esa columna existe desde el 13/8 (`senales.cesion_licencia`), y `@v2/shared` ya exporta `textoPublicable()`, la regla ejecutable. Aunque conectaras el corpus mañana, la página que existe para mostrar **la frase de una persona** no mostraría ninguna. Es R8, el corazón de la regla 6. |
| **2** | **Con pocas voces, la partición no depende del contenido** | `grafo.ts:29-61` | Con `n ≤ k+1` el grafo k-NN es **completo por construcción**. Durante los meses de corpus chico, los núcleos son aritmética pura — y se publican como medición. Es la regla 11 rota por álgebra, no por redacción. |
| **3** | **En nocturno no se ve la clase, que es la primera lectura de la regla 11** | `radiografia-data.ts:24` | `deseo` da **1,96:1** y `meta` **2,72:1** contra el fondo — bajo el 3:1 que AA pide. Con la profundidad aplicada (`constelacion-pintor.ts:208`), un `deseo` al fondo cae a **1,13:1**. La spec §5.2 dice «esta página **no crea ninguna tabla de color propia**»; la creó, de un solo valor, y falla el contraste que el repo ya mide en `pintor-senales.ts:185`. El arreglo es **borrar** e importar. |
| **4** | **La página dice «personas» sobre un conteo de filas** | `LaRadiografia.tsx:98-99`, `FichaDeNucleo.tsx:41` y `:112` | Son señales, no personas. Una persona puede cargar veinte. Es una falsedad ya publicada, y el arreglo son cuatro palabras. |
| **5** | **`clase-provisional.ts` se tenía que borrar** | su propia cabecera, línea 4 | *«Este archivo se BORRA entero el día que exista `vocabulario.ts`»*. Existe desde el 13/8. Todavía mapea `valor: 'meta'`, un tipo que salió del canon. |
| **6** | **La página no está enlazada desde ningún lado** | `papel-nav.ts` | Existe en `app-routes.tsx:101` y en `PAPEL_ROUTES`, y en ninguna superficie de navegación. Nadie puede llegar. |
| **7** | **El orden «Provincias» premia al núcleo que parece más federal** | `radiografia-data.ts:202` | Cuenta provincias distintas sin mirar la concentración. 38 voces de CABA + 1 de Jujuy + 1 de Ushuaia rankea alto. |
| **8** | **La guarda del color nunca se escribió** | spec §11 | Es la única de las siete guardas que falta, y es exactamente la que habría atrapado el defecto 3. |

---

## 4 · Lo que las cuatro lentes trajeron

### 4.1 · La tesis estaba mal escrita, y la corrección es mía de aceptar

Yo escribí en la spec que el objetivo es *«que la gente se dé cuenta de que todos quieren lo mismo»*. La lente del arco emocional lo corrigió antes de diseñar nada encima, y tiene razón: **es dos violaciones en una** — afirma algo sobre el mundo que no medimos, y roza el «converger no es corroborar» desde el lado del deseo.

La reemplaza por algo mejor y más fuerte: **la prueba de no-coordinación**. La carga emocional no sale de afirmar que todos coinciden, sale de propiedades **medidas**: dos personas que no se conocen, a 3.140 km y con catorce meses de diferencia, escribieron casi lo mismo. Eso no es una consigna: es un hecho verificable, y golpea más fuerte justamente porque no pide que le creas nada.

### 4.2 · Pol.is muestra puentes, y nosotros no podemos

El pariente cercano —lo que Taiwán usó en vTaiwan— hace algo más fino que nosotros: no muestra «todos quieren lo mismo», muestra **qué une a grupos que discrepan en todo lo demás**. Es una idea mejor.

Y la lente encontró por qué hoy no la podemos copiar: **`adhesiones` es unidireccional. No existe el desacuerdo.** Sin un `disagree`, «puente» degenera en «popular». Adoptar el concepto sin la estructura sería vender una palabra vacía. Es una decisión de producto —¿la plataforma quiere registrar desacuerdo?— y excede a esta página.

El otro aporte de esa lente es un descarte con fuente: el fracaso documentado de vTaiwan **no fue el algoritmo**, fue que nada se acumulaba río abajo. Hoy «esto se corrobora» y «esto se delibera» son rótulos de texto. Deberían ser puertas.

### 4.3 · La página puede fabricar consenso, y hoy invita a hacerlo

Bajando el umbral lo suficiente, **todo converge**. `DeslizadorUmbral.tsx:33` literalmente instruye al lector a llevarlo hasta que las islas se fundan. Combinado con el defecto 2 —que con corpus chico la fusión es aritmética— el instrumento produce una imagen de acuerdo nacional que no depende de lo que nadie dijo.

La defensa más barata existe y no necesita datos: **declarar el régimen degenerado**. Cuando `n ≤ k+1`, decirlo con esas palabras. El servicio ya tiene `n` y `k`.

---

## 5 · Sobre tu pedido de simulaciones como ejemplo

Lo pediste explícitamente y merece una respuesta honesta en vez de un sí automático.

**La versión barata es activamente falsa.** Generar voces con el motor de la Simulación produce nueve moldes; el coseno entre tres mil textos casi idénticos es ≈1, y el resultado sería **nueve estrellas perfectas enseñándole al lector que el país coincide de manera perfecta**. Sería la única pieza del repo que afirma algo falso sobre la convergencia con una imagen linda encima.

**La versión buena existe y respeta las tres reglas**: unas 180 frases rioplatenses escritas a mano, con una provincia muda a propósito, un núcleo mixto y un falso amigo adentro —para que el lector vea también el error del instrumento, no sólo su acierto—. Los vectores se precalculan y se commitean como artefacto, así anda sin Ollama.

**Lo que cuesta, dicho de frente:** una enmienda firmada a la decisión V1 de `el-vacio-como-pieza.md`, que dice «no se siembra nada, ni base, **ni cliente**, ni branch» y descarta explícitamente los «sintéticos marcados». No es un detalle burocrático: esa decisión es la que protege el gesto de la Simulación.

**Y lo que lo vuelve prematuro:** un ejemplo construido sobre el caño desconectado es un ejemplo de nada. Primero hay que saber qué tabla está simulando.

---

## 6 · El orden recomendado

### Ahora, sin Ollama y sin voces

1. **Repuntar a `senales`** — §7.
2. **Las cuatro palabras**: «personas» → «señales».
3. **La paleta nocturna**: borrar la tabla propia, importar `colorDeClase(clase, tema)`.
4. **Declarar el régimen degenerado** cuando `n ≤ k+1`. Se construye hoy, se enciende cuando llegue el corpus.
5. **El enlace en `papel-nav.ts`** — *después* del caño, nunca antes. Una página inalcanzable que mentiría es mejor que una alcanzable que miente.
6. **Anotar las deudas**: la tabla retirada, y el modelo de ataque contra `aristasDeclaradas`.

### Cuando haya voces reales

Cobertura y concentración **por núcleo** y no sólo en la cabecera; el orden «Provincias» reemplazado por el *share* de la provincia mayor; tres números en vez de uno (señales / actores distintos / sin actor); percentiles del umbral («a este umbral, el 94 % de todos los pares cuenta como lo mismo»); el par de la distancia renderizado como par.

### Más adelante

La calibración de `0,72` contra el corpus de PLANes —corre offline y nunca sale a pantalla—. Las puertas de salida de un núcleo. Y la decisión de producto sobre registrar desacuerdo, sin la cual no hay puentes.

### Lo que NO hay que hacer

**El barrido automático del umbral al cargar.** Una animación cuya carga emocional entera es la afirmación que la plataforma tiene prohibido hacer, y que con el corpus de los próximos meses además sería falsa. Si alguna vez se quiere el gesto, **corre al revés**: de bajo a alto, el continente rompiéndose en islas. Enseña el mismo mecanismo y no se puede capturar como «miren, todos coinciden».

---

## 7 · La una, si hay que elegir una

**Repuntar La Radiografía a `senales`, con la cesión conectada y `clase-provisional.ts` borrado.** Un día.

No es cambiar un literal:

- `lectura.ts` lee `senales` y toma **la clase de la columna** — `senales.clase` es `notNull` con FK compuesta contra `tipos_senal`, o sea que deja de inferirse y pasa a estar atornillada en la base;
- `clase-provisional.ts` se borra según su propia cabecera, lo que mata el mapeo de un tipo fuera del canon y desactiva la mitad del radio de D-063;
- `textoDeLaSenal` deja de ser una constante y llama a `textoPublicable({ texto, cesionLicencia })`;
- el `TEXTO_OMITIDO` copiado a mano se borra en favor de `MOTIVO_TEXTO_OMITIDO`;
- se arregla `faltanPorEmbeber`;
- la cabecera declara su corpus por nombre, igual que ya declara su modelo.

**Por qué ésa.** Es la única que es **precondición de todas las demás**: la cobertura por núcleo necesita las provincias de `senales`; contar actores distintos **no es implementable en absoluto** contra `dreams`, que no tiene actor, y es trivial contra `senales.actorId`. Es la única que **arregla R8**, sin la cual ningún núcleo tiene etiqueta nunca. Convierte cuatro defectos en cero con un cambio coherente y **no requiere migración**: `analisis_vectores` guarda `(fuente, fuente_id)` desacoplado a propósito, y esa previsión de la 0020 es lo que hace que esto sea un día y no una semana.

Y lo que decide: después de esto, **el vacío de la pantalla es verdadero y se desarma solo**, que es lo que V4 prometió y hoy no cumple.

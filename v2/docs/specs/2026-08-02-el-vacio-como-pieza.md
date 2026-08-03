# El vacío como pieza — el mapa antes de la primera voz

**Fecha:** 2026-08-02
**Alcance:** `v2/apps/web` (`/el-mapa`, el instrumento, el chrome papel)
**Se apoya en:** `docs/specs/2026-08-01-el-mapa-simulacion.md` (S3, S8) · `docs/DEUDAS.md` (D-002)
**Naturaleza:** spec de sub-proyecto. Se implementa directo.

> **Tesis.** El mapa no tiene datos y no los va a tener hasta que alguien hable. Se decidió **no sembrar**: ni sintéticos marcados, ni un branch de demo, ni voces derivadas de estadísticas. El vacío se queda, y el trabajo es que diga lo que tiene que decir. Un mapa vacío puede leerse como una herramienta rota o como un país esperando; la diferencia no está en los datos, está en el diseño.

---

## 1. Por qué

### 1.1 No había nada que migrar

Se revisó producción de v1 (`sparkling-field-92271073`) buscando voces reales para traer, como se hizo con el blog, los cursos, los ensayos y los planes. La tabla `dreams` de v1 tiene **una fila**, del 10 de marzo de 2026. No hay tabla de pulso. Lo único con volumen son cursos, lecciones y las 549 localidades — contenido nuestro, no voces de nadie.

La plataforma nunca tuvo datos cívicos. Eso no es un problema a resolver antes de mostrar el mapa: es el punto de partida, y es verdad.

### 1.2 Sembrar habría debilitado lo mejor que tenemos

Las cinco lentes se comportan muy distinto con cero voces:

| Lente | Con cero voces | Estado |
|---|---|---|
| Mapa | El país dibujado, sin un punto | necesita vacío diseñado |
| Análisis | Todas las provincias en gris | necesita vacío diseñado |
| Línea de tiempo | Sin curva | necesita vacío diseñado |
| **Cobertura** | Todas las celdas mudas | **es su estado más verdadero** |
| **Simulación** | Izquierda nada, derecha el país | **el contraste es máximo** |

La Simulación es el argumento entero de la plataforma en un gesto: arrastrás la cortina y ves de la nada al país. **Ese gesto se debilita si el lado izquierdo está lleno de voces inventadas.** Sembrar habría comprado cuatro lentes legibles al precio de arruinar la quinta, que es la que convence.

### 1.3 Lo que se borró

Las 12 filas `[prototipo]` (ids 3132–3143, todas en CABA) se borraron el 2026-08-02. `SELECT count(*) FROM dreams` devuelve **0**. Con eso D-002 queda cerrada: ya no hay datos de demostración contaminando ningún juicio.

Doce voces falsas y una postura de «el vacío es el mensaje» no pueden convivir.

---

## 2. Decisiones tomadas

| # | Decisión | Descarta |
|---|---|---|
| **V1** | **No se siembra nada, en ningún lado.** Ni base, ni cliente, ni branch. | Sintéticos marcados · modo demo en memoria · branch de Neon |
| **V2** | **Cada lente tiene su propio vacío**, y cada uno dice algo distinto. | Un «sin datos» genérico repetido cinco veces |
| **V3** | **El vacío invita, no se disculpa.** Ningún texto pide perdón por no tener datos. | «Todavía no hay información disponible» |
| **V4** | **Se desarma solo.** Ningún estado vacío necesita apagarse cuando llegue la primera voz. | Un flag de demo que alguien tenga que acordarse de bajar |
| **V5** | **El contador de conversión cambia de signo:** de cuántos hablaron a que no habló nadie. | Esconder el cero |

---

## 3. El vacío de cada lente

El principio: **el vacío tiene que contestar la misma pregunta que la lente contestaría con datos.** Si la lente dice «qué provincia habla más», su vacío dice «ninguna todavía» — no «no hay datos».

### 3.1 Mapa — «Cada voz donde fue dicha»

El país dibujado y ni un punto. Encima, centrado:

> **Todavía no habló nadie.**
> La primera voz del mapa puede ser la tuya.
> [Soltar la primera voz →]

El botón sube al panel de arriba, que ya existe. No se inventa un formulario nuevo.

### 3.2 Análisis — «Qué provincia habla y cuánto»

Las 24 provincias en el gris de `sinDato`, que es el color que la lente ya usa para «no sé». La leyenda de la rampa se reemplaza por:

> **Ninguna provincia tiene todavía con qué hablar.**
> Cuando entren las primeras voces, esto se llena de intensidades: quién habla más, por habitante, por territorio.

El detalle de provincia sigue funcionando: tocás una y dice cuántos habitantes tiene y cuántas voces necesitaría para tener mandato. **Eso convierte el vacío en información útil** — el umbral es un dato real aunque no haya ni una voz.

### 3.3 Línea de tiempo — «Cómo se fue despertando»

> **La línea arranca cuando alguien la arranque.**
> Acá va a verse el día que el mapa se despertó.

### 3.4 Cobertura — «Dónde todavía no habló nadie»

**No lleva estado vacío: ya está diciendo la verdad.** Lo único que cambia es que el conteo se lea como afirmación y no como falla:

> **N celdas. Las N en silencio.**

Es la lente que mejor funciona hoy, y no hay que tocarle nada más que el texto.

### 3.5 Simulación — «Y si hablamos, qué cambia»

**Tampoco lleva estado vacío.** El lado izquierdo vacío es el diseño, no su ausencia. Se refuerzan las etiquetas de la cortina:

- Izquierda: **«Hoy · nadie»**
- Derecha: **«Si hablaran»**

Y las cifras del panel ya contestan solas: legitimidad, cobertura y territorios que ganan mandato pasan todas de cero a algo. **El delta es el producto.**

---

## 4. Fuera del instrumento

### 4.1 El contador de la cabecera

Hoy dice «12 VOCES · FALTA LA TUYA». Con cero voces tiene que decir:

> **NADIE HABLÓ TODAVÍA · EMPEZÁ VOS**

Y volver solo a «N VOCES · FALTA LA TUYA» en cuanto haya una. Es una condición sobre el número, no un modo.

### 4.2 El pie

`PapelFooter.tsx` dice «Prototipo con datos de demostración». Dejó de ser cierto: no hay datos de demostración. Pasa a:

> **Prototipo · todavía sin voces**

### 4.3 El feed de últimas voces — ya está resuelto

`FeedVoces.tsx` **ya tiene su estado vacío**, y está bien escrito:

> **El país todavía no dijo nada acá. Empezá vos.**

Invita, no se disculpa, y está en voz. No se toca. Lo único que le falta es un test que lo cuide: hoy nada impide que alguien lo reemplace por un «no hay datos» sin que falle nada.

---

## 5. Qué NO se hace

- **No se siembra**, ni siquiera «unas pocas para que se vea algo». V1.
- **No se esconde ninguna lente** por no tener datos. Una pestaña que desaparece enseña que la herramienta es frágil.
- **No se inventan umbrales ni proyecciones** en los vacíos. El único número que aparece en un estado vacío es el umbral de mandato, que es real y calculado.
- **No se agrega un modo demo** que alguien tenga que acordarse de apagar. V4.

---

## 6. Cómo se prueba

Los estados vacíos son la parte más fácil de romper sin que nadie se entere: aparecen justo cuando no hay nadie mirando, y desaparecen para siempre en cuanto entra el primer dato.

| Guarda | Qué verifica |
|---|---|
| Con cero señales, cada lente muestra su vacío | Uno por lente, con su texto propio |
| Con una sola señal, ningún vacío sobrevive | Que se desarme solo (V4) |
| El contador dice «nadie habló» en cero y «N voces» en uno | El cambio de signo (V5) |
| Ningún texto de vacío contiene «no hay datos» ni «disponible» | V3, ejecutable |
| Cobertura y Simulación NO tienen estado vacío | Que nadie se los agregue por simetría |

La penúltima es rara y vale la pena: es un test que busca una cadena prohibida en los textos. Existe porque la tentación de escribir «no hay datos disponibles» es enorme y el que lo escriba no va a notar que rompió nada.

---

## 7. Lo que sigue

Cuando entre la primera voz real, el vacío desaparece solo y esta spec se vuelve historia. La única acción pendiente del lado humano: **conviene que la primera voz la cargue alguien del proyecto antes de mostrar esto**. Un mapa con una voz cuenta que empezó; uno con cero cuenta que no arrancó, y son historias muy distintas para quien llega primero.

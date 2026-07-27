# Mapa · 3 — El instrumento

**Fecha:** 2026-07-26
**Paraguas:** `docs/specs/2026-07-26-el-mapa-instrumento-territorial.md` — implementa §6
**Decisiones que aplica:** D1 (una sola página), D5 (cuatro capas), D6 (el lazo del núcleo compartido)
**Depende de:** spec 1 (`desproyectar`, el lienzo), spec 2 (coordenadas, precisión, endpoint)
**Habilita:** la spec 4 tiene dónde aparecer

> **Qué entrega.** Que alguien pueda cercar su barrio con el dedo y entender qué pasa ahí. Y que lo que entienda se pueda mandar por link.

---

## 1. Alcance

**Entra:** el lazo, el conteo honesto, el panel del área con sus cinco productos, las cuatro capas prendibles, los filtros, y la absorción de `/explorar-datos`.

**No entra:** nada del móvil. El lazo usa el código del núcleo compartido pero el flujo de captura en campo es la spec 4.

---

## 2. Dónde vive

D1 dice una sola página. El instrumento va **abajo del pliegue**, después del feed, en una sección nueva:

```
/el-mapa
  ├─ PortadaMapa            ← intacto
  ├─ PanelSoltarVoz         ← lo toca la spec 2 (el paso de precisión)
  ├─ MapaArgentina/Lienzo   ← lo hace la spec 1
  ├─ FeedVoces              ← intacto
  └─ Instrumento            ← esto        #instrumento
```

**El instrumento no se monta hasta que se lo pide.** Debajo del feed hay una invitación, y recién al tocarla se hace `lazy()` del componente y el primer fetch a `/api/civic/map/signals`. Los 30 segundos de arriba no pagan un byte del instrumento.

`#instrumento` es el ancla profunda — resuelve la pregunta abierta 3 del paraguas. Un link a `/el-mapa#instrumento` monta el instrumento directo.

`/explorar-datos` se borra y queda `<Redirect to="/el-mapa#instrumento" />`.

---

## 3. El lazo

### 3.1 Cómo funciona

`LassoOverlay` de v1 (`SocialJusticeHub/client/src/components/radiografia-map/LassoOverlay.tsx`, 181 líneas) está bien resuelto y se porta: SVG a pantalla completa sobre el lienzo, captura de puntero, umbral de 3 px entre vértices, `Escape` cancela, barra de instrucción con botón de cancelar que funciona igual con mouse y con dedo.

Lo que cambia: en v1 desproyectaba con el viewport de deck.gl. Acá usa `desproyectar()` de la spec 1, y el polígono resultante pasa por **`selectTerritoryPoints` del núcleo compartido** — el mismo código que corre en el móvil (D6). No se escribe un segundo `pointInPolygon`, y turf no se instala.

Los colores salen de los tokens de Papel y Tinta, no del violeta de v1.

### 3.2 Un lazo por vez

Un solo polígono activo. Volver a dibujar reemplaza el anterior. Comparar dos áreas es una idea buena y es de otra spec.

---

## 4. El conteo honesto

**El requisito duro de esta spec.** Un lazo sobre precisión mixta no puede mostrar un total único: sería un dato falso.

Cada señal capturada cae en una de cuatro clases:

| Clase | Criterio | Cuenta |
|---|---|---|
| **Exactas** | `precision` ∈ {`exact`, `100m`} y el punto cae adentro | sí |
| **Aproximadas** | `precision` ∈ {`500m`, `neighborhood`} y el punto cae adentro | sí, marcadas |
| **Por centroide** | `precision` = `city`, el centroide de la localidad cae adentro | sí, marcadas |
| **Provinciales tocadas** | `precision` = `province` y el polígono toca la provincia | **no** — se nombran y se excluyen |

La última es la importante y la que v1 no hacía: si el lazo roza La Matanza, las 4.200 voces que solo dicen «Buenos Aires» no son de La Matanza. Se nombran y se dejan afuera.

El encabezado del panel es literal:

> **34** con punto exacto · **12** a ±100 m · **120** por centro de localidad
> **3 provincias tocadas** — sus 4.200 voces no se cuentan acá, no sabemos si son de esta zona

Cuando una clase es cero, su renglón desaparece. Cuando **todas** son cero:

> No hay nada acá todavía. Que un área esté vacía también es información.

---

## 5. Los cinco productos del área

### 5.1 Composición
Cuánto de cada tipo de voz (los 6) y de cada capa (las 4 de D5). Barras horizontales, no torta. Cada barra es un filtro: tocarla acota la lista.

### 5.2 Lista
Panel virtualizado — se porta el de v1 (`SelectionPanel.tsx`, 267 líneas) con `react-window`, que ya está resuelto incluyendo el gesto de cierre por deslizamiento en móvil. Cada fila lleva su acción, y las acciones **no se inventan**: `map-point-action.ts` del móvil ya define cuáles son y cuándo aplican — verificar, conectar, aportar, misión.

### 5.3 Temas
Lo que emerge del texto. v1 lo hace con una lista de expresiones regulares por tema (educación, salud, trabajo, vivienda, seguridad, justicia, economía, ambiente) y funciona bien para lo que es. Se porta tal cual, y se declara en la UI lo que es:

> Temas detectados por palabras. Es un atajo, no un análisis.

### 5.4 Cobertura — el mapa del silencio

Lo mejor que se puede poner en esta página, y no existe en v1.

`coverage.ts` del núcleo tira una grilla sobre el polígono del lazo y devuelve celdas. Cada celda se colorea por estado: con señal, muda, o parcialmente cubierta. El resultado se dibuja **sobre el lienzo**, no en el panel.

> De las 46 celdas de esta área, **31 están mudas**. Nadie dijo nada ahí todavía.

Dónde nadie habló es tan informativo como dónde sí: para un mapa cívico, el silencio es el dato que dice dónde ir a caminar. Es también lo que conecta con la spec 4 — una celda muda es una misión de campo.

El tamaño de celda lo elige `coverage.ts` según el área; el panel muestra cuál eligió, en metros, para que el número sea interpretable.

### 5.5 URL propia

El área queda citable:

```
/el-mapa#instrumento?area=<polígono codificado>&capas=voces,pulso&desde=2026-01-01
```

El polígono se codifica con **polilínea codificada** (el algoritmo de Google, ~5 caracteres por vértice) y se simplifica a un máximo de 60 vértices antes de codificar. Un lazo a mano alzada tiene cientos de puntos y una URL no puede llevarlos.

Al abrir un link con `area=`, el instrumento se monta, decodifica, dibuja el polígono y muestra el panel — sin que nadie tenga que dibujar nada.

Sin esto el lazo es un juguete. Con esto alguien le manda a su vecino «mirá nuestra zona» y el vecino ve exactamente lo mismo.

---

## 6. Las capas y los filtros

Barra de filtros arriba del lienzo cuando el instrumento está montado. Se porta la lógica de `useRadiografiaFilters` de v1 (122 líneas), que ya tiene resueltos los detalles molestos: limpiar la ciudad al cambiar de provincia, reconstruir el polígono una sola vez por lazo en vez de por señal, filtro por rango temporal.

| Filtro | Valores |
|---|---|
| Capas | voces · pulso · propuestas · mandato *(D5)* |
| Tipo de voz | los 6, multi-selección |
| Rango temporal | 7 días · 30 días · todo |
| Provincia / localidad | select encadenado |
| Área | el lazo |

Los filtros mandan sobre el lienzo **y** sobre el panel: una sola verdad de lo que está en pantalla. Cada filtro activo aparece como una ficha removible, y hay un «limpiar todo».

Las capas sin datos aparecen deshabilitadas con su razón («todavía no hay propuestas con ubicación»), no escondidas: que el mapa tenga cuatro capas es parte de lo que comunica.

---

## 7. El área es accionable

Desde un área cerrada, tres acciones que empujan de vuelta a la conversión:

- **Declarar una necesidad acá** — abre el panel de arriba con el área ya cargada como ubicación
- **Ofrecer un recurso acá** — ídem, con `location_role: 'meeting_point'`
- **Descargar el recorte** — CSV con las señales contadas, respetando la precisión publicada de cada una

El instrumento de abajo alimenta la conversión de arriba en vez de competir con ella.

---

## 8. Cómo se verifica

- **El conteo honesto** — el test central: un conjunto de precisión mixta bajo un lazo, y se afirma que las cuatro clases se cuentan por separado y que **no se muestra ningún total indiferenciado**
- **Provincias tocadas** — un lazo que roza una provincia no cuenta sus señales provinciales
- **El lazo usa el núcleo** — un test afirma que `selectTerritoryPoints` es el del paquete y que turf no está entre las dependencias
- **Ida y vuelta de la URL** — codificar un polígono, decodificarlo, y que el conjunto seleccionado sea el mismo (con la tolerancia de la simplificación a 60 vértices declarada)
- **Montaje perezoso** — un test afirma que cargar `/el-mapa` sin el ancla no dispara el fetch de `/api/civic/map/signals`
- **Cobertura** — un área con señales en una esquina reporta el resto de las celdas como mudas
- **Redirect** — `/explorar-datos` lleva a `/el-mapa#instrumento`
- **Accesibilidad** — el lazo tiene alternativa por teclado: si no se puede dibujar, se puede seleccionar por provincia/localidad y obtener el mismo panel. Un lazo a mano alzada no es operable con teclado y no puede ser la única puerta al análisis

---

## 9. Listo cuando

1. `pnpm verify` verde
2. Se dibuja un área y aparece el panel con las cinco cosas
3. El conteo distingue las cuatro clases y nombra las provincias tocadas sin contarlas
4. El link con `area=` reproduce la misma selección en otra sesión
5. El instrumento no se monta ni fetchea hasta que se lo pide
6. `/explorar-datos` redirige y su código está borrado
7. Hay un camino por teclado que llega al mismo panel sin dibujar

---

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| El instrumento arruina los 30 segundos | Montaje perezoso con test que lo afirma (§8) |
| Un total indiferenciado se cuela en algún renglón | El test central lo prohíbe explícitamente (§8) |
| La URL del área se vuelve impracticable de larga | Polilínea codificada + tope de 60 vértices (§5.5) |
| El lazo excluye a quien no puede dibujar | Camino por teclado obligatorio (§8) |
| Portar código de v1 arrastra el sistema de diseño viejo | Los tokens salen de Papel y Tinta; se porta la lógica, no el aspecto |
| Las capas vacías hacen ver el mapa roto | Deshabilitadas con su razón visible, no escondidas (§6) |

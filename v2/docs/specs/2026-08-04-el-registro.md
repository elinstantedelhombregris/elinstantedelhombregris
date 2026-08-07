# El Registro — la app de campo, desde cero

**Fecha:** 2026-08-04
**Alcance:** `v2/apps/mobile` (reescritura de la superficie) · `v2/packages/civic-core` (brillo y nitidez) · `v2/apps/api` (endpoint de celdas) · `v2/apps/web` (`/el-mapa`, lente Cobertura)
**Se apoya en:** `docs/specs/2026-08-02-el-vacio-como-pieza.md` (V1, V3, V4) · `apps/mobile/docs/PRODUCT_CONSTITUTION.md` (reglas 5, 7, 8, 11) · `apps/mobile/docs/FIRST_PRINCIPLES_OVERHAUL.md` (las cinco separaciones) · `docs/DEUDAS.md`
**Naturaleza:** spec de producto. Necesita plan de implementación antes de tocar código.

> **Tesis.** La app existe para una sola cosa: **recoger lo que la gente sabe y quiere de su territorio**, y convertirlo en luz sobre un mapa. Hoy no hace eso — hace treinta y cuatro cosas a medias. La web ya está diseñada para mostrar el silencio con dignidad; **el teléfono es lo único que puede terminarlo**. Todo lo demás de este documento se deduce de ahí.

---

## 1. Por qué

### 1.1 Lo que hay

`v2/apps/mobile` son 47.307 líneas y 34 pantallas. Adentro conviven tres productos con vocabularios distintos:

| Capa | Qué es | Peso |
|---|---|---|
| **El Cielo** | juego personal nocturno: estrellas, brasas, rachas, rangos, álbum, ritos | 1.302 LOC de lógica + `src/cielo/` |
| **Protocolo Vivo** | misiones, expediciones, tramas, pulsos | 110 LOC |
| **Civic core** | escucha, necesidades, custodia, permisos, territorio, verificación, círculos | 4.194 LOC sólo de custodia |

Hay **dos conceptos llamados «misión»** con tablas y máquinas de estado separadas (`misiones/index.tsx` y `territorio/misiones/index.tsx`) y dos formas de publicar (`publicar.tsx` y `obras/publicar.tsx`).

### 1.2 Lo que se ve

La portada es un vacío negro del 60% de la pantalla. El texto completo de la pantalla de inicio, verificado en el navegador el 2026-08-03, es:

> `lunes 3 de agosto · 0 noches · LA ESCUCHA → · VER · ENCENDER · DAR · 5 · CORRIENTE TERRITORIO ÁLBUM BITÁCORA AJUSTES`

El estado vacío que el propio código promete (`ESTADOS_VACIOS.cielo`) no llega a renderizar. Y hay 5 brasas con 0 estrellas y 0 noches: estado incoherente.

Conviven dos registros visuales que se leen como dos apps distintas — noche (negro, Space Mono, casi vacío) y papel (crema, Anton, denso). `/territorio` y `/circulos` se ven bien. La portada se ve rota.

Las 34 pantallas no tienen modelo de navegación: un dock de cinco ítems que sólo existe en la portada, y todo lo demás es un push con flecha de volver.

### 1.3 Lo que está sano y no se toca

- **398 tests en 58 archivos, todos verdes.** La lógica de dominio está bien.
- `@v2/civic-core` ya es compartido con la web: `planTerritorialCoverage` arma la misma grilla de los dos lados.
- Las **6 señales** ya son compartidas: `apps/mobile/src/content/senales.ts` y `apps/web/src/pages/ElMapa/instrumento/paleta.ts` declaran el mismo catálogo.
- Los componentes `papel/` funcionan.
- `simulacion/retrato.ts` ya calcula `voces ÷ población × 100.000` **con procedencia y con camino honesto para cuando falta el denominador** (`sinDato`).

El problema nunca fue el código. Fue que no estaba decidido qué es la app.

---

## 2. Decisiones

| # | Decisión | Descarta |
|---|---|---|
| **R1** | **El mapa es la app**, no una sección. Portada a sangre completa. | El mapa enterrado en `/territorio/mapa` |
| **R2** | **Tres verbos: mirar · aportar · confirmar.** Todo lo demás cuelga de ahí. | Un menú de 34 puertas |
| **R3** | **El registro tiene dos ejes:** lo que pasa en un lugar y lo que quiere la gente que vive ahí. Los dos encienden el mapa. | El mapa como catálogo de cosas rotas |
| **R4** | **La custodia no es un lugar, es un estado de una señal.** El ciclo entero vive en una ficha. | Doce destinos para un solo ciclo |
| **R5** | **Brillo = voces distintas normalizadas. Nitidez = corroboración.** Dos variables visuales. | El brillo por volumen bruto de señales |
| **R6** | **Un solo registro visual: papel.** | El registro nocturno |
| **R7** | **El juego se va entero.** El progreso es territorial, no personal. | Estrellas, brasas, rangos, álbum, rarezas, paletas |
| **R8** | **Se reescribe en el mismo lugar**, sobre el casco que funciona. | Carpeta nueva |
| **R9** | **No se siembra nada.** Hereda V1 de `el-vacio-como-pieza`. | Datos de demostración, modo demo, branch semilla |

---

## 3. Los dos ejes

Las seis señales ya existentes se parten en dos familias, y la partición tiene consecuencias en todo el sistema. Sale de la regla 11 de la Constitución: *«los hechos se corroboran; los sueños y propuestas se deliberan. Nunca se confunden.»*

| Familia | Señales | Pregunta | Qué le pasa |
|---|---|---|---|
| **Verificables** | Necesidad · ¡Basta! · Recurso | ¿Qué pasa acá? | Piden pin fino. Se confirman. Envejecen. Corren el ciclo hasta *resuelta*. |
| **Deliberables** | Sueño · Valor · Compromiso | ¿Qué querés? | No piden esquina: alcanza el barrio. No se confirman. Se agrupan con las voces parecidas. |

**Las deliberables no son un residuo.** *«Sueño con que mi hija no se tenga que ir del país»* no es una captura geolocalizada y no se le puede preguntar a un vecino si «sigue así». Pero es exactamente el material que el sistema necesita para saber qué busca la gente, y **enciende su celda igual que una farola rota**. Si no encendiera, sería decoración.

Y tienen destino, que es lo que las separa de un buzón de sugerencias: `apps/web/src/lib/queries/civic-map.ts` ya define las capas `voz · pulso · propuesta · mandato`. **La web ya sabe pedir la capa `voz`.** El circuito está cerrado antes de empezar.

---

## 4. El ciclo

```
        recogida → corroborada → cuidada → conectada → en marcha → resuelta
           ↑           ↑
        aportar    confirmar
           └──────── cada paso enciende un poco más su celda ────────┘
```

El progreso de la app y el progreso del territorio son la misma barra. No hay una economía paralela de puntos que premie otra cosa.

---

## 5. La superficie

Ocho pantallas, con pestañas reales.

| | Pantalla | Qué es |
|---|---|---|
| 1 | **Mapa** | Portada a sangre. Tus celdas: gris, plata tenue, plata viva. El silencio es el contenido. |
| 2 | **Aportar** | Hoja sobre el mapa. Una puerta, dos gestos según la familia de la señal. |
| 3 | **Confirmar** | Hoja. *«¿Sigue así?»* — dos botones. Sólo para verificables. |
| 4 | **Ficha** | El ciclo entero, seis estados, una pantalla. |
| 5 | **Mi barrio** | Devolución: qué cambió, quién confirmó lo tuyo, cuánto se encendió. |
| 6 | **Círculos** | La red. |
| 7 | **Mis datos** | Recibos, precisión, firma, borrado. |
| 8 | **Ajustes** | |

De 34 a 8.

### 5.1 Aportar — una puerta, dos gestos

Se elige la señal primero, y el flujo se adapta a la familia:

- **Verificable:** menos de 20 segundos. Qué, dónde (pin GPS corregible), foto opcional. Lo demás con defaults seguros.
- **Deliberable:** sin apuro, sin pin fino. La pregunta en rioplatense que la señal ya trae (*«¿de qué te cansaste?»*, *«¿qué soñás para tu barrio?»*), texto libre, y zona en vez de esquina.

Toda la maquinaria de las cinco separaciones —error de medición contra precisión compartida, firma contra contacto, custodia— queda con **defaults seguros y un recibo plegado**, nunca como un asistente de consentimiento que haya que atravesar en cada captura. El modelo no se toca; deja de estar en el camino.

### 5.2 Confirmar — la acción diaria

Una observación sola es una anécdota; la unidad de valor es la observación corroborada. Cuando la app se abre cerca de algo ya reportado, lo primero que aparece es *«¿sigue así?»* con dos botones.

**Ésta es la acción del 80% de la gente la mayoría de los días.** No capturar. Cuesta dos segundos, es lo que convierte el dato en evidencia, y es lo que sube la nitidez de la celda.

### 5.3 La ficha — dónde entra el ciclo entero

Las 7.758 líneas de custodia, permisos y divulgación (4.194 de lógica y 3.564 de tests) **se conservan enteras**. Lo que cambia es que dejan de ser doce destinos y pasan a ser **secciones de una ficha que aparecen cuando la señal llega a ese estado**.

Una ficha de hecho corre: recogida → corroborada → cuidada (custodio y vigencia) → conectada (permiso a un círculo) → en marcha → resuelta.
Una ficha de voz no corre nada: se muestra, se agrupa con las voces parecidas y suma a su capa.

Cero líneas de lógica borradas. Doce pantallas convertidas en una.

---

## 6. El brillo y la nitidez

```
brillo  = voces distintas ÷ habitantes estimados     → cuánta gente habló
nitidez = confirmaciones ÷ señales verificables      → cuánto se comprobó
```

**Por qué voces distintas y no señales.** Si el brillo contara señales, un solo vecino entusiasta ilumina su cuadra él solo. Eso viola la regla 8 de la Constitución (*«premian utilidad, no volumen bruto»*) y abre la puerta al brigading.

**Qué cuenta como distinta.** Una voz por *actor key* — la identidad seudónima de dispositivo que `src/civic/identity.ts` y `device-auth.ts` ya emiten. No hace falta cuenta, que es condición de R-«no se pide cuenta para aportar». Tiene una debilidad conocida y aceptada: **una persona con dos teléfonos cuenta dos veces**. No se puede cerrar sin pedir identidad real, que costaría más de lo que arregla. Se documenta, no se disimula.

**Cuando la nitidez no está definida.** Una celda puede tener sólo voces deliberables: `confirmaciones ÷ 0`. En ese caso la nitidez **no es cero, es inaplicable** — la celda se dibuja encendida y nítida, porque no hay nada pendiente de comprobar. Cero nitidez significa «hay hechos sin confirmar», y una celda de puros sueños no tiene hechos sin confirmar. Misma disciplina que el denominador de población: la ausencia de pregunta no se pinta como mala respuesta.

**Por qué normalizado.** Sin denominador, el mapa dibuja densidad de población: el microcentro siempre brilla más que un pueblo de Formosa aunque en el pueblo haya hablado el 40% y en el microcentro el 0,1%. Eso choca de frente con la regla 5 (*«la participación no equivale a representatividad»*). La fórmula y su procedencia ya existen en `simulacion/retrato.ts`.

**La rampa no puede ser lineal.** La participación real vive en el extremo bajo de la escala: un barrio donde deja una voz el 5% de la gente es un fenómeno extraordinario, y en una rampa lineal 0–1 se vería negro. Si la intensidad visual fuera la participación cruda, el mapa estaría apagado siempre y la idea entera no se vería nunca. Hacen falta dos coeficientes declarados, en un solo lugar y con su razón escrita, igual que `simulacion/coeficientes.ts`: una **participación de referencia** que se lee como celda plenamente encendida, y una **curva** que levanta la parte baja. Son decisiones de diseño sin datos todavía; cuando entren voces reales hay que volver a mirarlas.

### 6.1 Tres estados visuales, no dos

Hoy la lente Cobertura de la web es binaria: `MUDA = #241F17` o `CON_VOZ = #1A7A4A`. Pasa a tres:

| Estado | Qué dice | Color |
|---|---|---|
| **Gris** | Nadie habló todavía. Es la tarea. | el `MUDA` actual |
| **Plata, del tenue al vivo** | Habló gente. Borrosa si nadie confirmó, nítida si se comprobó. | rampa nueva |
| **Sin denominador** | No sabemos cuánta gente vive acá. | el gris `sinDato`, que ya existe |

**Una celda sin denominador nunca se dibuja oscura.** Oscuro ya significa «nadie habló», y «no sabemos cuánta gente vive acá» es otra cosa. Confundirlas hace que el mapa mienta justo en el campo, que es donde no hay radio censal fino. Reusa el camino `sinDato` que `retrato.ts` ya tiene resuelto.

### 6.2 El gris es la marca

Gris no es vacío: es *todavía no habló nadie*. Y el gris ya es del proyecto — el Hombre Gris es plata, plata es *argentum*, argentum es Argentina. **El país se enciende en plata a medida que la gente habla.** Eso reemplaza toda la economía de brasas y estrellas sin pedir nada a cambio: el progreso deja de ser un puntaje privado y pasa a ser luz sobre el territorio.

---

## 7. El reparto

```
civic-core   brillo() + nitidez() — funciones puras, con tests. Una sola fórmula, los dos lados.
API          GET /api/v1/civic/map/cells → la grilla con su brillo ya agregado
TELÉFONO     escribe — los tres verbos, y el ciclo de la ficha detrás de ellos
WEB          lee — el país en plata, misma grilla, otra altura
```

**Por qué hace falta el endpoint, si la web hoy calcula la cobertura en el cliente.** Porque el brillo cuenta *personas distintas*, y contar personas distintas en el cliente exigiría que el feed público trajera identificadores de persona. **El servidor devuelve el conteo ya agregado y nunca los identificadores.** Es una razón de privacidad, no de rendimiento, y por eso no admite el atajo.

La supresión de grupos pequeños que la Constitución ya exige para la Radiografía aplica igual acá.

---

## 8. Qué se conserva, se fusiona y se tira

**Se conserva entero:** `src/civic/*` incluida toda la custodia · `@v2/civic-core` · los componentes `papel/` · las 6 señales · las migraciones drizzle · la config de Expo con sus dos parches · los 398 tests.

**Se fusiona:** los dos conceptos de misión en uno. Sobrevive el territorial, que tiene celdas y cobertura. `src/protocolo/` son 110 líneas y se absorbe.

**Se tira:** `src/game/` (1.302 LOC) · `src/cielo/` · las 14.828 líneas de `src/app/`, que se reescriben. Con El Cielo se va `@shopify/react-native-skia` y su parche.

**Se renombra:** `package.json` deja de llamarse `"juego"`.

---

## 9. Qué NO se hace

- **No se siembra**, ni siquiera «unas pocas para que se vea algo». Hereda V1.
- **No se borra la custodia.** Se conserva entera aunque no tenga doce pantallas.
- **No se inventa una taxonomía nueva.** Las 6 señales ya son compartidas con la web y con el radar de v1; cambiarlas rompería la comparabilidad de todo lo ya recogido.
- **No se pide cuenta para aportar.** La app funciona sin cuenta y sin red.
- **No se muestra ranking individual.** Regla 7.
- **No se escribe un estado vacío que se disculpe.** Hereda V3: el vacío invita.

---

## 10. Cómo se prueba

| Guarda | Qué verifica |
|---|---|
| `brillo()` con 20 señales de 1 persona da menos que con 5 de 5 personas | R5, el núcleo de la fórmula |
| `brillo()` sin población devuelve `sinDato`, nunca 0 | Que el campo no se dibuje oscuro por falta de censo |
| Una celda con voces y sin confirmaciones sale borrosa, no apagada | Que brillo y nitidez sean independientes |
| Una celda de puras deliberables sale nítida, no en nitidez cero | Que la ausencia de pregunta no se pinte como mala respuesta |
| Una señal deliberable enciende la celda igual que una verificable | R3 — que las voces no sean decoración |
| Una señal deliberable no ofrece «¿sigue así?» | Regla 11 — que hechos y voces no se confundan |
| El endpoint de celdas nunca devuelve identificadores de persona | La razón por la que el endpoint existe |
| Teléfono y web piden la misma grilla para el mismo recuadro | Que la celda muda de la web sea la que el teléfono manda a caminar |
| La ficha muestra sólo las secciones del estado en que está la señal | R4 |

---

## 11. Riesgos y deudas

- **Población por celda no existe** (`D-026`). La fórmula opera hoy a nivel provincia. Arranca normalizando por provincia con las celdas marcadas *sin denominador*, hasta que entren radios censales del INDEC.
- **Dos librerías de mapa** (`D-027`): `maplibre-gl` en web y `react-native-maps` en nativo. El `v2/CLAUDE.md` pide una sola de cada cosa. Con el mapa como portada deja de ser un detalle y necesita un ADR.
- **Cuatro errores de `tsc`** en `Pressable97.tsx` (`D-025`), por una fuga de `@types/react@18` desde la raíz del workspace. Se arregla en el pnpm, no en el código.
- **La primera voz.** `el-vacio-como-pieza` §7 lo deja anotado: conviene que la primera voz real la cargue alguien del proyecto antes de mostrar esto. **El Registro es el instrumento con el que se carga.**

---

## 12. Lo que sigue

Plan de implementación por tareas numeradas, cada una verificable y commiteable por separado. El orden natural: `civic-core` primero (la fórmula, con tests, sin superficie), después el teléfono, después el endpoint, y la web al final — porque la web es la única de las cuatro que hoy ya funciona.

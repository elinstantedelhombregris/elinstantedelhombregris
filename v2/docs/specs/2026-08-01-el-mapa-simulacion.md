# La Simulación — los dos países, lado a lado

**Fecha:** 2026-08-01
**Alcance:** `v2/packages/civic-core` · `v2/packages/db` · `v2/apps/api` · `v2/apps/web` (`/el-mapa`)
**Se apoya en:** `docs/specs/2026-07-26-el-mapa-instrumento-territorial.md` (D5 las cuatro capas, **D7 exactitud por defecto**) · `docs/specs/2026-07-26-mapa-3-el-instrumento.md` (las lentes, el lazo, el conteo honesto) · `docs/specs/2026-07-26-mapa-4-el-campo.md` (cobertura, celdas mudas)
**Naturaleza:** spec de sub-proyecto. Se implementa directo, en cinco rebanadas (§14).

> **Tesis.** El instrumento hoy contesta *qué pasó*. No contesta la única pregunta que hace que alguien se cargue al mapa: *¿y si hablamos?* La Simulación pone los dos países en la misma pantalla — el que se calló y el que habló — y deja mover las palancas que separan uno del otro. No pronostica: es **diseño idealizado**, el mismo marco con que se escribieron los 22 PLANes. Muestra lo posible, no lo probable.

---

## 1. Por qué

### 1.1 El instrumento mide el silencio pero no lo cuestiona

Las cuatro lentes que ya corren —Mapa, Análisis, Línea de tiempo, Cobertura— son todas retrospectivas. Cobertura llega a nombrar el problema: dibuja las celdas donde no habló nadie. Pero se queda ahí. Alguien que ve su barrio en gris aprende que está mudo y no aprende **qué cambiaría si dejara de estarlo**. La distancia entre esas dos cosas es toda la conversión de la plataforma.

### 1.2 El riesgo que esta spec existe para evitar

Un simulador cívico es el objeto más fácil de deshonestar que existe. Basta con un coeficiente inventado, un total sin denominador o una extrapolación sin etiqueta, y la herramienta produce números lindos e indefendibles. El primer crítico hostil que lo mire encuentra el punto flojo en diez minutos, y cuando lo rompe no se lleva puesta la simulación: se lleva puesto el mapa entero, que sí es honesto.

Por eso la spec fija primero el contrato epistémico (§3) y recién después el modelo. Y por eso la cadena causal se mantiene **corta**: la gente habla → el territorio queda medido → el mapa que no existía existe. Eso no necesita supuestos. Es aritmética sobre lo que efectivamente se cargó.

### 1.3 Lo que ya está construido y se reusa

| Pieza | Dónde | Qué aporta |
|---|---|---|
| Grilla de cobertura con denominador explícito | `civic-core/coverage.ts` | `planTerritorialCoverage`, `summarizeCoverageStatuses` — el silencio ya se mide sin inflar fracciones |
| Selección territorial | `civic-core/lasso.ts` | `pointInPolygon`, `selectTerritoryPoints` |
| Política de ubicación (D7) | `civic-core/location-policy.ts` | Exactitud por defecto: es lo que hace posibles las campañas (§6) |
| Régimen de honestidad | `pages/ElMandatoVivo/mandato-regimen.ts` | `regimenDe`, `plegarTipos`, `urgenciaDeBrecha` — cero porcentajes por debajo de 100 observaciones |
| Métricas territoriales | `modos/useModoAnalisis.tsx` | Total · por habitante · por territorio, con población y superficie por provincia |
| Codificación de área en URL | `instrumento/area-url.ts` | El mismo mecanismo sirve para compartir una configuración de palancas |
| Conteo por clase de precisión | `instrumento/conteo.ts` | Nunca un total indiferenciado |

---

## 2. Decisiones tomadas

| # | Decisión | Descarta |
|---|---|---|
| **S1** | **Se llama «Simulación».** «Ensayo» está tomado por la serie de la biblioteca. | Ensayo · Escenarios · Los dos países |
| **S2** | **Diseño idealizado, no pronóstico.** Mismo marco que los 22 PLANes: muestra el óptimo alcanzable, no lo que va a pasar. | Presentarlo como proyección o forecast |
| **S3** | **El escenario silencio no se simula.** Es el país tal como está medido hoy. Solo la mitad de la voz es simulada. | Dos modelos comparados entre sí |
| **S4** | **El motor no depende de los PLANes.** Capa base autosuficiente; los PLANes son una lente opcional, apagada por defecto y construida al final. | Corpus de PLANes como cimiento |
| **S5** | **Las campañas son la unidad de trabajo.** Un tema acotado, con pregunta, unidad de observación y meta de cobertura. Es lo que D7 habilitó. | Solo voces genéricas |
| **S6** | **Tres superficies de comparación:** cortina arrastrable (default), diferencia, y tabla de rankings. La tabla es una superficie de comparación, no un adorno. | Toggle de encendido/apagado |
| **S7** | **Tres números de titular, sin índice compuesto.** | Un score único, más compartible |
| **S8** | **Donde no hay dato, gris.** Ni relleno por población ni interpolación silenciosa. | Repartir metas nacionales por habitantes |

---

## 3. El contrato epistémico

Las tres reglas se hacen cumplir en el código y tienen test (§12). No son un descargo al pie.

### 3.1 Todo número declara su procedencia

Existen exactamente tres, y ninguna cuarta:

```ts
export type Procedencia =
  | { tipo: 'medido'; fuente: string }        // dato real de la plataforma o de un documento citado
  | { tipo: 'declarado'; palanca: string }    // parámetro que movió la persona, o coeficiente publicado
  | { tipo: 'derivado'; formula: string; de: readonly string[] };

export interface Magnitud {
  valor: number;
  unidad: string;
  procedencia: Procedencia;
}
```

**Ningún valor sale del motor como `number` pelado.** Todo lo que la UI puede mostrar es una `Magnitud`. Un número huérfano es un bug, no un descuido de presentación.

### 3.2 El escenario silencio es medición, no modelo

El lado izquierdo de la cortina se calcula **sin leer una sola palanca**. Es el estado actual: las voces que hay, las celdas observadas que hay, los territorios que efectivamente cruzaron el piso. Si las dos mitades fueran modelos, la comparación no probaría nada — probaría que dos configuraciones del mismo modelo dan distinto, que es una tautología.

### 3.3 Donde no hay dato, gris

Mismo régimen que el conteo por clase de precisión que ya corre. Un territorio sin dato se pinta gris con su razón al lado, y **no participa de ningún total**. El gris no es una falla de la vista: es el mapa del silencio de los datos, y empuja a completarlo.

### 3.4 Los coeficientes publicados

El motor tiene coeficientes que no son medidos ni movidos por la persona: el piso de voces que constituye un mandato, cuánto lo sube la resistencia. Se declaran en un solo módulo, con su valor y su justificación, y viajan como `{ tipo: 'declarado' }`. **No se disfrazan de medidos.** Cambiarlos es cambiar una constante visible, no tocar el motor.

---

## 4. Las palancas

Siete en la capa base. La octava —`secuencia`— aparece solo con la capa PLANes prendida (§10), porque sin dependencias entre PLANes no ordena nada.

```ts
export interface Palancas {
  /** Voces cada 100.000 habitantes. El eje principal. */
  participacion: number;
  /** 0 = todo concentrado en un territorio · 1 = repartido en proporción a la población. */
  dispersion: number;
  /** Mezcla de los 6 tipos de voz. Las claves suman 1. */
  composicion: Readonly<Record<TipoVoz, number>>;
  /** Horizonte en años. */
  horizonte: number;
  /** 0 = el sistema colabora · 1 = bloquea. */
  resistencia: number;
  /** 0 = estallido (todo en un período) · 1 = goteo parejo a lo largo del horizonte. */
  constancia: number;
  /** Fracción de los compromisos cargados que efectivamente se cumplen. 0..1 */
  cumplimiento: number;
  /** Orden de arranque de los PLANes. Ignorado sin la capa PLANes. */
  secuencia: readonly string[];
}
```

Qué hace cada una, y cuál es su rol honesto en el modelo:

| Palanca | Qué mueve | Por qué es defendible |
|---|---|---|
| **participacion** | Cuántas voces entran | Es la única variable que la persona controla en la vida real — la que se mueve cargándose ella misma |
| **dispersion** | Cómo se reparten esas voces entre territorios | Reparte un total dado; no crea voces. Aritmética pura |
| **composicion** | Qué tipos de voz entran | Determina qué campañas son alimentables: una campaña de recursos no se llena con necesidades |
| **horizonte** | Cuántos períodos corre | Solo escala el eje del tiempo |
| **resistencia** | Sube el piso efectivo del mandato | Coeficiente **declarado** y visible (§3.4). Existe para que el modelo no sea ingenuo |
| **constancia** | Cómo se distribuyen las voces en el tiempo | Se mide con lo que ya guardamos: fechas |
| **cumplimiento** | Convierte reportes en resoluciones | Efecto concreto y acotado (§6.4), no un multiplicador global de bondad |

**La lección que las palancas tienen que producir**, y que se verifica en los cuatro caminos (§8): contra más resistencia, la única variable que sigue funcionando es cuánta gente habla. La obstrucción se tapa con voz; no se tapa con nada más.

---

## 5. El motor

`packages/civic-core/src/simulacion.ts` — lógica pura, sin React, sin fetch, sin acceso a plataforma. Compartido con el móvil como el resto de `civic-core`.

### 5.1 Entrada y salida

```ts
export interface EntradaSimulacion {
  palancas: Palancas;
  /** El estado medido: lo que hay hoy. Nunca se deriva de las palancas. */
  base: EstadoMedido;
  /** Territorios con su población y superficie — el denominador de todo. */
  territorios: readonly Territorio[];
  /** Campañas abiertas. Puede ser vacío. */
  campanas: readonly Campana[];
}

export interface ResultadoSimulacion {
  silencio: Retrato;      // el país medido — idéntico para toda configuración de palancas
  voz: Retrato;           // el país simulado
  diferencia: Diferencia; // la resta, por territorio
  rankings: Rankings;
}

export interface Retrato {
  legitimidad: Magnitud;
  cobertura: Magnitud;
  campanasCompletas: Magnitud;
  porTerritorio: ReadonlyMap<string, RetratoTerritorio>;
  /** Territorios excluidos de todo total, con su razón. */
  sinDato: readonly { territorio: string; razon: string }[];
}
```

### 5.2 Reparto de las voces

`participacion` da el total nacional. `dispersion` lo reparte:

- En `0`, todo va al territorio con más voces hoy — el mundo real sin esfuerzo de reparto.
- En `1`, se reparte proporcional a la población.
- En el medio, interpolación entre las dos distribuciones.

La interpolación es una **operación declarada**, no un supuesto sobre el mundo: no afirma que la gente se reparte así, afirma que vos pediste esa mezcla.

### 5.3 El piso del mandato

Un territorio tiene mandato sobre un tema cuando cruza el piso y lo sostiene:

```
piso_efectivo = PISO_BASE × (1 + K_RESISTENCIA × resistencia)
tiene_mandato = voces_del_tema >= piso_efectivo × (poblacion / 100_000)
             && periodos_sostenidos >= MINIMO_PERIODOS
```

`PISO_BASE`, `K_RESISTENCIA` y `MINIMO_PERIODOS` son coeficientes publicados (§3.4). Valores de arranque y su razón van en `coeficientes.ts`, editables sin tocar el motor.

`periodos_sostenidos` sale de `constancia`: en estallido, un período; en goteo, todos los del horizonte.

### 5.4 Legitimidad

```
alcance     = poblacion en territorios con mandato / poblacion total
persistencia = periodos sostenidos / periodos del horizonte
legitimidad  = alcance × persistencia
```

Dos fracciones reales multiplicadas. Se explica en un renglón y se audita en diez segundos — que es exactamente el criterio.

**La composición no entra en la legitimidad.** Qué dice la gente cambia *qué se puede hacer*, no *cuánto representa*. Meterla acá sería ponderar opiniones, que es lo contrario de lo que la plataforma hace.

### 5.5 Cobertura

Se delega en `planTerritorialCoverage` + `summarizeCoverageStatuses`, que ya existen y ya tratan el denominador con el cuidado que hace falta. La simulación aporta cuántas celdas pasarían de `unknown` a `observed` dado el reparto de §5.2.

---

## 6. Las campañas

### 6.1 Qué son

Un tema acotado con una pregunta, una unidad de observación y una meta de cobertura. Es la unidad de trabajo real de la herramienta y la razón por la que se cambió la política de núcleo a exactitud por defecto (D7): *«posiciones exactas, para compartir recursos, o declarar necesidades, o indicar que algo está roto»* — **«indicar que algo está roto» es una campaña.**

### 6.2 El modelo

```ts
export interface Campana {
  id: string;
  nombre: string;                    // 'Luminarias rotas'
  pregunta: string;                  // '¿Dónde no hay luz?'
  unidad: string;                    // 'una luminaria'
  rol: LocationRole;                 // 'subject'
  sensibilidad: CivicSensitivity;    // 'low'
  /** Sin esta precisión el dato no sirve. Una luminaria a 500 m no se puede arreglar. */
  precisionMinima: LocationPrecision;
  ambito: AmbitoCampana;             // nacional | provincia | municipio
  meta: MetaCampana;                 // cobertura de celdas | recuento
  recurrencia: 'unica' | 'semanal' | 'mensual';
  estado: 'borrador' | 'abierta' | 'cerrada';
}
```

`recurrencia` no es decorativa. Las luminarias son un censo único: una vez mapeadas, están mapeadas. Las farmacias sin remedios hay que volver a medirlas cada semana, porque el dato se vence. Eso cambia qué significa «completa» y cambia la curva de esfuerzo — una campaña recurrente nunca termina, se sostiene.

### 6.3 Las cuatro de ejemplo

Elegidas para que se vea el rango, no porque las cuatro se lancen:

| Campaña | Tema | Unidad | Recurrencia | Qué produce |
|---|---|---|---|---|
| **Luminarias rotas** | Infraestructura urbana | Una luminaria | Única | El mapa del alumbrado que el municipio no tiene |
| **Farmacias sin remedios** | Abastecimiento sanitario | Un faltante en un comercio | Semanal | El mapa del desabastecimiento en tiempo real |
| **Paradas sin refugio** | Movilidad | Una parada | Única | El inventario de la espera a la intemperie |
| **Precios de la canasta** | Economía | Un precio en un comercio | Semanal | El índice territorial que ningún organismo publica desagregado |

Misma máquina, cuatro preguntas que no se parecen en nada. Eso es lo que la ficha de campaña tiene que demostrar.

### 6.4 Dónde entra el cumplimiento

Acá está el único lugar donde `cumplimiento` cambia **lo que el país obtiene**, y el efecto es concreto y acotado:

```
reportes     = voces de tipo 'basta' o 'necesidad' dentro del ámbito de la campaña
resoluciones = reportes × cumplimiento
```

Un mapa completo de luminarias rotas con cumplimiento 0 es un mapa completo de luminarias que siguen rotas. Sirve igual —el reclamo queda documentado— pero no es lo mismo, y la simulación lo tiene que decir sin suavizarlo.

La palanca aparece en un segundo lugar, pero ahí no produce nada: es la que alimenta la columna «si hablaran» del ranking de cumplimiento (§7.3). Mostrar no es modelar. **`cumplimiento` no se multiplica contra la legitimidad ni contra la cobertura** — un pueblo que no cumple sigue teniendo derecho a ser contado.

### 6.5 La ficha de una campaña

Lo que se ve al abrirla, con la simulación aplicada al ámbito:

- La pregunta y la unidad, en una línea.
- El estado medido: cuántos reportes, cuántas celdas observadas, cuántas mudas.
- La proyección: *«tu municipio tiene 340 celdas. Con 40 personas reportando una semana, quedan 12 mudas. Con 12 personas, quedan 180 — y el mapa no sirve para reclamar.»*
- El seguimiento: reportadas vs. resueltas, con fecha.

---

## 7. Las tres superficies de comparación

Quinta lente en la barra: **Simulación**. Adentro, un segmentado de tres.

### 7.1 Cortina (default)

Un mapa partido por una línea vertical arrastrable. Izquierda el país medido, derecha el simulado. Mismo encuadre, mismo instante, mismo zoom.

Implementación: dos instancias de `<Map>` con el `viewState` controlado y compartido, la de arriba en un contenedor con `clip-path: inset(0 0 0 X%)`, más una manija. Unas 40 líneas. Existe `maplibre-gl-compare`, que hace exactamente esto, pero no justifica gastar una dependencia del cupo de 60 en algo de ese tamaño.

Las teselas del segundo mapa salen del caché del navegador: el basemap es el mismo.

**La comparación tiene que ocurrir en el ojo, no en la memoria.** Ese es el criterio que descarta el toggle.

### 7.2 Diferencia

Un mapa que no pinta ninguno de los dos escenarios sino la resta: `+340` acá, `+2.100` allá, neutro donde nada se mueve. Es la superficie operativa — la que contesta dónde falta empujar.

Rampa divergente, con el cero en el color del fondo para que la ausencia de cambio no pese visualmente.

### 7.3 Tabla — los rankings

Tres tablas, cada una con dos columnas: **hoy** y **si hablaran**. Ver una provincia saltar del puesto 19 al 4 es más legible que cualquier mapa, y a nivel municipio es donde más pica.

| Ranking | Qué ordena | Por qué está |
|---|---|---|
| **Quién más habla** | Total · cada 100.000 hab. · cada 1.000 km² | Las tres métricas son obligatorias: el total crudo siempre lo gana Buenos Aires y esa tabla no enseña nada |
| **Quién más mandatos genera** | Cuántos temas distintos cruzaron el piso | Premia el foco y la constancia, no el volumen. Es la tabla interesante |
| **Quién más cumple** | Compromisos cumplidos / cargados | La tabla de la confianza; conecta con la palanca de cumplimiento |

Los rankings respetan el régimen de honestidad ya vigente: por debajo de `UMBRAL_PORCENTAJE` (100 observaciones) se muestran conteos, no porcentajes. Un municipio con 3 voces no entra al podio con «100% de cumplimiento».

Los municipios entran al ranking solo donde hay dato territorial de ese nivel; el resto queda fuera de la tabla con su razón, no en el último puesto.

---

## 8. Los cuatro caminos

Cada uno es una configuración guardada de las palancas, con **el mismo esfuerzo total** repartido distinto. No son niveles de dificultad: son apuestas.

| Camino | La apuesta | Lo que enseña |
|---|---|---|
| **El que grita** | Participación altísima, constancia ~0, cumplimiento bajo, dispersión mínima | El pico de legitimidad no sostiene ningún mandato más allá del primer período |
| **El que sostiene** | Diez veces menos voz, constancia máxima, cumplimiento alto | Menos mandatos, pero estables. La constancia le gana al volumen |
| **El que se reparte** | Voz media, dispersión máxima | El alcance nacional se logra con menos voces de las que parece — y es lo que ningún territorio concentrado alcanza |
| **El que ordena bien** | Voz media, secuencia óptima | Solo con la capa PLANes. El orden es la única palanca gratis |

Se comparan entre sí y se comparten por URL, con el mismo mecanismo de codificación de `area-url.ts`.

**Los cuatro caminos son también el test de que el motor enseña lo que dice enseñar** (§12): si «el que grita» le ganara a «el que sostiene» en legitimidad sostenida, el modelo estaría mal calibrado y el test falla.

---

## 9. Las métricas

Tres titulares en la capa base:

1. **Legitimidad** — `alcance × persistencia`. *¿Esto representa al país?*
2. **Cobertura** — qué fracción del territorio deja de estar muda. *¿Cuánto del país queda medido?*
3. **Campañas completas** — cuántas alcanzan censo utilizable, en cuántos territorios. *¿Qué queda sabido que hoy no se sabe?*

Con la capa PLANes se suman **PLANes operables** y **personas alcanzadas**.

**No hay índice compuesto.** Un solo número escondería exactamente las tensiones que el análisis de sensibilidad existe para revelar, y el primero que lo mirara con mala fe encontraría el peso arbitrario en diez minutos. La legibilidad que se gana no paga la superficie de ataque que se abre.

---

## 10. La capa PLANes — opcional, última

Apagada por defecto. Se construye al final, y se decide si se construye **después** de ver la capa base funcionando.

### 10.1 El corpus

`content/corpus/resultados/<PLAN>.yaml`, con índice generado — el mismo patrón que `planes-index.generated.ts`.

```ts
interface ResultadoPlan {
  plan: string;
  titulo: string;
  unidad: string;
  diagnostico: number;    // el país que hay — del documento, con cita
  disenado: number;       // el país diseñado — del documento, con cita
  anioMeta: number;
  territorio: { tipo: 'provincias'; valores: Record<string, number> } | { tipo: 'nacional' };
  fuente: { documento: string; ancla: string; cita: string };
  seguimiento: Seguimiento;
}

interface Seguimiento {
  indicador: string;
  publica: string;
  cadencia: 'mensual' | 'trimestral' | 'anual' | 'censal';
  observacion: string | null;
}
```

`observacion` es el campo más valioso del corpus: **muchos de estos indicadores no los publica nadie**. PLANAGUA lo dice con todas las letras en su tabla de organismos — *«Organismo que integre todo — No existe»*. La ficha de seguimiento va a ser, en buena parte, el inventario de lo que el país no mide sobre sí mismo. Eso es un hallazgo, no un agujero.

Arranque: **PLANAGUA, PLANJUS, PLANVIV, PLANEDU, PLANSAL** — los cinco de mayor densidad de metas fechadas. Los otros 17 quedan marcados «sin corpus» y visibles como tales.

### 10.2 Las dependencias

Migrar `SocialJusticeHub/shared/arquitecto-data.ts` a `content/corpus/dependencias.ts`: 73 aristas `requires` con naturaleza (crítica/importante/menor) y tipo (financiera, institucional, técnica, legal, laboral, de datos, temporal), más las 69 anotaciones `provides`.

**Solo las `requires` participan del cálculo.** Las `provides` son anotación espejo de lectura, igual que en v1.

La regla: un PLAN no es operable si un `requires` **crítico** suyo no lo es. Es un chequeo topológico sobre datos ya razonados — el único paso del motor con estructura real en vez de multiplicación.

### 10.3 El reparto territorial

Regla S8: **dato real donde exista, gris donde no.** PLANAGUA tiene el arsénico desagregado por provincia y se pinta; PLANVIV declara 2.000.000 de familias sin desagregar y sale como número nacional, contado aparte, **nunca sumado adentro** del total por provincia.

### 10.4 El supuesto que hay que etiquetar

Interpolar linealmente entre `diagnostico` y `disenado` según el horizonte **es un supuesto**, no un cálculo. Viaja etiquetado como tal, pegado al número. Donde el PLAN declara fases (PLANSUS tiene su cascada de 5 años, PLANRUTA las suyas) se usa la cascada real en vez de la recta.

---

## 11. Esquema y API

### 11.1 Base de datos

Migración nueva en `packages/db/src/migrations/`:

```
campanas
  id, nombre, pregunta, unidad, rol, sensibilidad, precision_minima,
  ambito_tipo, ambito_id, meta_tipo, meta_valor, recurrencia, estado,
  created_at, updated_at

dreams  (packages/db/src/schema/dreams.ts)
  + campana_id  (FK nullable → campanas.id)
```

`dreams` es la tabla de las voces y de las capturas de campo — es la que ya lleva `geoColumns` y la que escribe `POST /api/v1/civic/capturas`. `pulseSignals` también tiene geo, pero el pulso no es un reporte de campaña: no lleva la columna.

`campana_id` nullable: las voces sueltas siguen existiendo y siguen siendo el caso principal. Una campaña es una lente sobre las señales, no un régimen aparte.

### 11.2 API

Siguiendo el prefijo versionado que la app de campo ya habla:

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/v1/civic/campanas` | Campañas abiertas, con su estado medido |
| `GET` | `/api/v1/civic/campanas/:id` | Una campaña + su cobertura |
| `GET` | `/api/v1/civic/simulacion/base` | El `EstadoMedido` — el lado silencio |

**El motor no tiene endpoint.** Corre en el cliente: el corpus completo son ~500 filas y 73 aristas, y los diales tienen que responder al arrastre. Un motor server-side mataría lo que lo hace jugable.

Cada endpoint nuevo lleva al menos un test de integración contra Postgres real, según la regla de la casa.

---

## 12. Las guardas

Tests que fallan si el instrumento empieza a mentir. No son cobertura de rutina: son el contrato de §3 hecho ejecutable.

| Guarda | Qué verifica |
|---|---|
| **Sin números huérfanos** | Recorrer todo el `ResultadoSimulacion` y fallar si algún valor no trae `Procedencia` |
| **El silencio es sordo** | Mover las siete palancas por todo su rango y verificar que `resultado.silencio` es idéntico bit a bit |
| **Sin dato, sin total** | Un territorio en `sinDato` nunca contribuye a `legitimidad`, `cobertura` ni a ningún ranking |
| **Dependencias críticas** | Ningún PLAN operable con un `requires` crítico caído (capa PLANes) |
| **Grafo sin ciclos** | Las aristas críticas no forman ciclo — si lo formaran, el orden no existiría |
| **La etiqueta viaja** | Todo número interpolado llega a la UI con su marca de supuesto |
| **Régimen de porcentajes** | Ningún ranking muestra porcentaje por debajo de `UMBRAL_PORCENTAJE` |
| **Los cuatro caminos enseñan** | «El que sostiene» supera a «el que grita» en legitimidad sostenida; «el que se reparte» supera a ambos en alcance |
| **La resistencia se tapa con voz** | A resistencia máxima, existe un valor de `participacion` que recupera el mandato — y ninguna otra palanca sola lo logra |

Las dos últimas son tests de **calibración**, no de implementación: verifican que el modelo produce las lecciones que la spec dice que produce. Si el motor deja de enseñarlas, o está mal calibrado o la lección era falsa. Las dos cosas hay que saberlas.

---

## 13. Qué NO hace

Explícito, para que no se filtre por la puerta de atrás en la implementación:

- **No pronostica.** No dice qué va a pasar; dice qué sería posible. S2.
- **No atribuye causalidad entre voz y resultado del mundo** en la capa base. La cadena termina en «el territorio queda medido».
- **No publica un índice compuesto.** S7.
- **No rellena territorios sin dato.** S8.
- **No pondera opiniones.** La composición cambia qué es alimentable, no cuánto vale una voz.
- **No guarda escenarios en el servidor** en esta spec. Se comparten por URL. La persistencia con nombre es trabajo posterior si aparece la necesidad.

---

## 14. Las rebanadas

En orden. Cada una se verifica y se commitea sola.

| # | Rebanada | Depende de | Qué entrega |
|---|---|---|---|
| **1** | Motor en `civic-core`: `Palancas`, `Magnitud`, `Procedencia`, reparto, piso, legitimidad, cobertura + guardas de §12 | Nada nuevo | Un motor puro y testeado, sin UI |
| **2** | Lente Simulación: cortina, diferencia, panel de palancas | 1 | La comparación completa sobre datos reales |
| **3** | Campañas: esquema, migración, endpoints, ficha, cobertura por campaña | 1 | La unidad de trabajo, con las cuatro de ejemplo |
| **4** | Rankings (tercera superficie) + los cuatro caminos + compartir por URL | 1, 2 | La tabla y las apuestas comparables |
| **5** | Capa PLANes: corpus de 5, migración de las 73 dependencias, operabilidad, personas alcanzadas | 1–4 | La lente opcional — **se decide después de ver 1–4 andando** |

Las rebanadas 1 a 4 son una herramienta terminada y usable sin escribir una sola fila de corpus. Esa es la razón de S4.

---

## 15. Preguntas abiertas

- **Municipios.** Los rankings los piden y el esquema los soporta, pero la capa geográfica de municipios no está (misma deuda que departamentos, ~530 unidades del IGN). Hasta que esté, el ranking municipal se arma solo con los municipios que tienen señales geo-resueltas, y lo dice.
- **Coeficientes de arranque.** `PISO_BASE`, `K_RESISTENCIA` y `MINIMO_PERIODOS` necesitan valores iniciales defendibles. Se fijan en la rebanada 1 con su justificación escrita, y los tests de calibración (§12) son lo que los mantiene honestos.
- **El prototipo.** `/el-mapa/prototipo` y las 12 voces marcadas `[prototipo]` siguen vivas. Decidir si se borran antes o después de esta spec.

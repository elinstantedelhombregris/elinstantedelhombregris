# Mi Argentina ideal — una sola herramienta, de la pila al país

Fecha: 19 de octubre de 2026. **Revisión 3**, 20 de octubre: el dueño pidió implementar todo, mergearlo a `main` y abrir las campañas a otras personas con un paso previo (§11). P1 se resuelve con la opción recomendada (§8). Las cuatro decisiones D1–D4 siguen firmes. El prototipo para probar en el teléfono está en `docs/demos/2026-10-19-mi-argentina-ideal.html`.

Pedido del dueño, textual: *«la aplicación del mapa está confusa: por un lado está mi Argentina ideal como campaña y luego está el mapa con varias opciones, después el análisis, la simulación no parece orgánica y no muestra nada fácil de ver. Quiero que la repienses desde el principio y mejores la herramienta para que cumpla con la función de ayudar a construir una visión país, empezando por la campaña visión ideal, y después se pueda poner más info. Me gustaría que la gente pudiera ir viendo las cosas tipo swipe de Tinder.»*

> **Sobre las palabras.** En pantalla, lo que alguien publica se sigue llamando **aporte**, y nada más; la guardia de `scripts/content/glosario.ts` lo vigila. Este documento usa tres palabras de trabajo que **no van a la interfaz**:
> - *la línea*: la versión corta de un aporte, la que ven los demás;
> - *papelito*: la metáfora visual de la tarjeta;
> - *la pila*: la tanda de papelitos.
>
> En pantalla los tres momentos se llaman **Imaginar · Mirar · Ver**.

## Qué cambió en la revisión 2

La primera versión tenía un defecto de fondo y varios de forma. Están todos corregidos en las secciones que siguen.

1. **El defecto de fondo: casi todo iba a tener acuerdo.** Nadie dice «Yo no» a «que un turno no tarde tres meses». Con sólo «Yo también / Yo no / Paso», «Lo que nos une» iba a ser una lista larga de deseos obvios, y una visión que no ordena no sirve para decidir nada. **Se suma la pregunta que falta: ¿qué va primero?** Cada tanto, la pila pone dos aportes que ya dijiste querer y pregunta cuál va primero. Es el método de las encuestas por pares (All Our Ideas, de Matthew Salganik): no sufre el techo de acuerdo y le da la misma oportunidad a un aporte que llega tarde. La visión gana una sección: «Lo que va primero» (§4, §5).
2. **La pila te lleva a donde tu respuesta falta.** Un aporte cuenta para una región cuando tiene al menos cinco opiniones de ahí. La pila prioriza, para vos, los aportes donde tu región todavía no llega a cinco. Cuando tu respuesta completa la quinta, te lo dice: «Con tu respuesta, el NOA ya cuenta en este aporte». Cada deslizamiento queda donde más sirve (§4).
3. **«El país que falta» deja de ser un número inventado.** La barra de la primera versión («40 de 300 personas») tenía un 300 sin fundamento. Ahora mide lo mismo que usa la regla: **en cuántos de los aportes que se están discutiendo tu región ya cuenta.** Su botón te manda a la pila a completar justo esos. La visión y la pila son el mismo circuito (§5).
4. **Los porcentajes se calculan sobre quienes opinaron.** «Paso» quiere decir «no tengo opinión», no «no». Entonces se dice «8 de cada 10 que opinaron», y los que pasaron se cuentan aparte (§5).
5. **No estás solo, desde que escribís.** Antes de publicar se muestran hasta tres aportes parecidos que ya existen. Podés sumarte a uno (cuenta como «Yo también») y además publicar el tuyo. Así no hay quinientas versiones de lo mismo compitiendo entre sí, y el primer momento ya muestra a otros. El parecido se calcula adentro de Postgres (`pg_trgm` y búsqueda de texto en castellano), sin modelo y sin proveedor externo. Va en la entrega 2, cuando haya con qué comparar (§3).
6. **Compartir importa más que antes.** Con la D1 (sólo aportes reales), la pila se llena con la gente que llega, y la gente llega por quien la invita. Después de publicar, el aporte se puede compartir como imagen, hecha en el navegador con la línea, la provincia y la invitación (§3).
7. **Ningún ejemplo inventado en la app, tampoco para inspirar.** Para no dejar a nadie frente a una caja en blanco, la primera pantalla ofrece **puntas** («tu trabajo», «tu barrio», «tu familia»…). Cada una cambia la pista que se ve, pero ninguna escribe una frase por la persona. El tema se sugiere con un léxico local y la persona lo confirma (§3).
8. **Un solo «yo también» por aporte.** En `/senal/:id`, un deseo de la campaña muestra las mismas tres respuestas de la pila, no el botón «A mí también me pasa». Dos mecanismos para lo mismo era repetir el error de los ocho nombres (§7).
9. **Los 13 reportes no se pueden fabricar con cookies.** Sólo cuenta el reporte de quien ya contestó al menos cinco aportes. Juan recibe un aviso en Mi espacio cuando un aporte sale por reportes y con el primer reporte por datos personales. El número 13 sigue siendo el que eligió el dueño (§4).
10. **Las rutas tienen los nombres de los momentos:** `/mi-argentina-ideal/imaginar`, `/mi-argentina-ideal/mirar` y `/mi-argentina-ideal`, que es Ver.
11. **La tipografía es la de Papel y Tinta:** Anton, Archivo y Space Mono. La primera versión del plan decía Playfair, que es legado de v1.
12. **Las entregas 1 y 2 salen juntas a producción.** Una pila sin visión junta respuestas sin mostrarle a nadie para qué sirven. Antes de lanzar, el prototipo se prueba con cinco personas en sus teléfonos (§9).

---

## 1. Lo que pasa hoy

Recorrí el sitio en producción como alguien que llega por primera vez, en escritorio y en un teléfono de 375 px, y leí el código de `/el-mapa` y de las páginas que lo rodean.

**Hay cuatro productos donde la persona espera uno.**

| Lo que ve la persona | Qué pregunta contesta | Para quién está pensado |
|---|---|---|
| «Imaginar mi Argentina», el botón negro del header | ¿Qué querés que sea posible en tu vida? | Cualquiera |
| `/el-mapa` con cinco modos: Mapa, Análisis, Línea de tiempo, Cobertura, Simulación | ¿Dónde hay aportes? ¿Cuántos por provincia? ¿Cuándo llegaron? ¿Qué zonas faltan? ¿Y si hablaran más? | Un analista |
| `/la-radiografia` | ¿Qué aportes se parecen entre sí? | Un analista con paciencia |
| `/la-simulacion` | ¿A partir de cuántas voces cada 100.000 habitantes gana mandato cada provincia? | Quien desarrolla el motor |

La primera fila es la única que le habla a una persona. Las otras tres le hablan a quien la estudia.

**El aporte vive adentro del instrumento, no al revés.** «Imaginar» es un panel de 420 px que se abre a la izquierda del mapa, con tres preguntas, una revisión con hasta cinco casillas, el lugar y el recibo. Al lado siguen el buscador, «Filtros», «Usar solo la lista» y las cinco pestañas. La persona vino a contar qué país quiere y la pantalla le muestra una herramienta de análisis territorial.

**Hay demasiado para elegir antes de hacer nada.** En escritorio, la primera pantalla de `/el-mapa` tiene unos 25 controles antes del primer scroll y tres botones distintos para aportar: el del header, «Sumá tu aporte →» y «Sumar el primer aporte». En el teléfono la primera pantalla no muestra el mapa. Muestra el título, dos avisos de alcance, el buscador, «Filtros», «Usar solo la lista», «Sumá tu aporte» y las pestañas, y el mapa queda abajo.

**La misma campaña hace tres preguntas distintas.** La portada pregunta «En tu Argentina ideal, ¿qué sería posible en tu vida?». Las reglas de la campaña sembradas en `contrato.ts` preguntan «Si la Argentina funcionara como vos la imaginás, ¿qué te gustaría que fuera posible en tu vida de todos los días?». Y el header del panel, cuando se entra desde ahí, dice «Contá qué futuro querés, qué lo impide y qué podrías aportar» (D-134).

**La simulación no es para el público.** Son dos cosas con el mismo nombre. La pestaña del mapa tiene la cortina («Hoy» contra «Si hablaran») y cinco palancas. La página `/la-simulacion` muestra «huella 63b4d209», «semilla 7», `civic-core/simulacion@2026-08-13` y, en el modo «Gente», `brew install ollama && ollama serve`. No muestra ningún resultado hasta tocar «Correr el barrido», y sus 18 variables arrancan bloqueadas. Las dos contestan una pregunta legítima, cuánta gente tiene que hablar para que una provincia cuente, pero es la pregunta de quien diseña el mecanismo. Nadie que llegue a imaginar su país se la hace.

**Hay unas treinta rutas alrededor del mapa y ocho en el menú.** Campañas, gestión, fichas, ejemplos de fichas, visión compartida, capacidades, síntesis nacional y su ejemplo, Radiografía y su ejemplo, simulación, cada aporte, mandato y sus tres detalles, fuentes, validación espacial, conciliación territorial, lo que falta, iniciativas y sus detalles, campo, escucha territorial, el recorrido escolar. Tres de ellas prometen una «visión»: `/vision-compartida`, `/sintesis-nacional` y `/mandato-vivo`, que además no tiene entrada desde ningún menú (D-135).

**No hay nada para mirar de los demás.** Lo único que una persona puede hacer con el aporte de otra es «A mí también me pasa», y ese botón vive en `/senal/:id`, no en el mapa. La lista se llama «Los aportes, uno por uno», pero es una grilla de tres columnas. El ejercicio termina cuando publicás: escribís, recibís un recibo y no ves cómo lo tuyo se junta con lo de nadie.

**La campaña no está en producción.** El código ya manda todo aporte a «Mi Argentina ideal», pero la campaña todavía no se sembró en la base de producción. Es la D-121: falta que Juan cree su cuenta, después cargar `ADMIN_USERNAMES` y después correr `db:seed-campana-nacional --produccion`. Hoy `/campanas` dice que no hay ninguna.

**Lo bueno ya está construido, sólo que en el orden equivocado.** Las piezas que hacen falta para el swipe existen, desparramadas:

- `ficha_afirmaciones` + `opiniones` (`packages/db/src/schema/diseno.ts`) guardan una afirmación corta y una respuesta `acuerdo | desacuerdo | paso`, con registro de cuándo se mostró. Es exactamente el mecanismo de Pol.is. Pero vive enterrado adentro de las fichas, pide cuenta y nadie llega ahí.
- La lectura «Acuerdos y diferencias» ya existe en Radiografía (`LecturaOpiniones`, `BarrasOpiniones`), con supresión de grupos chicos.
- `luzDeCelda` en `civic-core` ya sabe encender el país en plata según cuánta gente habló, normalizado por habitantes.
- Los actores sin cuenta (cookie `basta_actor` + CSRF) ya identifican a una persona en un navegador sin pedirle nada.
- `senales.retenida_en` ya existe para sacar un aporte de toda lectura pública sin borrarlo. Hoy nada lo escribe.

Y faltan tres cosas que la pila necesita sí o sí. Un aporte se publica en el momento, sin ningún paso de revisión. No hay registro de que alguien vio o pasó un aporte. Y no hay supresión de grupos chicos en ningún lado (D-088).

El problema nunca fue que faltara código. Es lo mismo que pasó con la app móvil en agosto: **no está decidido qué es la herramienta**, y entonces cada pieza nueva se sumó como otra pestaña. El mapa y lo que lo rodea suman unas 8.100 líneas de producción en `pages/ElMapa/` e `Imaginar/`.

## 2. La idea en una frase

**Imaginás. Mirás lo que imaginan otros, de a uno, y decís qué va primero. Ves cómo se va armando el país que queremos y dónde falta tu región. Después lo vas llenando de realidad.**

Mi Argentina ideal deja de ser una campaña que «acompaña» al mapa y pasa a **ser la herramienta**. El mapa, el análisis y el resto aparecen adentro de ella cuando tienen algo que mostrar.

Son tres momentos, siempre en este orden y siempre con una sola cosa por pantalla:

```
   IMAGINAR              MIRAR                          VER
 tu aporte en      →  aportes de otros, de a uno   →  lo que nos une
 una línea            yo también · yo no · paso       lo que va primero
                      y cada tanto: ¿cuál primero?     donde no coincidimos
                                                       en cada tema
                         ▲                             el país que falta ──┐
                         └──── «completar los que faltan de tu región» ◄───┘
                                                           │
                                                           ▼
                                             CAPAS QUE SE ABREN DESPUÉS
                                  cómo está hoy · qué hace falta · cómo lo hacemos
```

El circuito de la derecha es lo que hace orgánica a la herramienta. La visión muestra dónde falta gente para que la regla federal se cumpla, y la pila manda a cada persona justo ahí.

## 3. Imaginar — una línea, no un formulario

Son tres pantallas cortas y una de cierre.

**1. La pregunta.** «En tu Argentina ideal, ¿qué sería posible en tu vida?» Es la misma pregunta en la portada, en las reglas de la campaña y acá: una sola constante en `@v2/shared`, que cierra la D-134. Debajo va un campo grande, de hasta 2000 letras. Más abajo, una fila de **puntas**:

| Punta | La pista que aparece |
|---|---|
| tu trabajo | ¿De qué vivirías? ¿Cuántas horas, y dónde? |
| tu barrio | ¿Cómo volvés de noche? ¿Qué hay a diez cuadras? |
| tu familia | ¿Quién cuida a quién? ¿Se tienen que separar? |
| tu salud | ¿Qué pasa cuando te enfermás un martes? |
| tu tiempo | ¿Qué harías con dos horas más por día? |
| cuando seas grande | ¿Dónde y con quién te imaginás? |
| lo que aprendés | ¿Qué te gustaría aprender, y dónde? |

Las puntas preguntan; no escriben por nadie. La pantalla tiene una sola acción principal, «Seguir», y «Guardar borrador en este dispositivo» como acción explícita y secundaria.

**2. Tu aporte en una línea.** «Así lo van a ver otras personas. Podés dejarlo como está o achicarlo.»
- La línea viene precargada con la primera oración de lo que escribiste. Se le saca la fórmula de arranque («En mi Argentina ideal,…»), porque la tarjeta ya la dice. Es editable, tiene **hasta 140 letras** y lleva contador.
- **El tema** se elige entre 13 chips, uno solo y optativo. Si las palabras lo sugieren, un chip aparece marcado como pregunta («¿Es sobre salud?»). El léxico es local y chico, y la persona confirma o cambia.
- **La provincia** se elige en una lista nativa con las 24, más «Prefiero no decirlo». Sin GPS, sin mapa y sin precisión: para imaginar alcanza la provincia.
- **Datos personales.** Si en el texto aparece algo que parece un teléfono, un mail o un DNI, se marca ahí mismo: «Esto parece un teléfono. Sacalo antes de publicar: el aporte se ve en público.»
- **Aportes parecidos** (entrega 2). Hasta tres aportes que ya existen y se parecen, bajo «Otras personas imaginan algo parecido». Cada uno tiene «Me sumo», que cuenta como «Yo también». Se puede sumar a uno y además publicar el propio. El parecido se calcula en Postgres con `pg_trgm` y búsqueda de texto en castellano, sin modelo ni proveedor, y se nombra como lo que es: «se parecen en las palabras».

**3. Publicar.**
- Arriba, la **vista previa**: el papelito tal como lo van a ver.
- Abajo, una elección explícita, sin opción marcada (P1, §8):
  - «Que cualquiera lo pueda leer y citar, sin tu nombre. Entra a Mirar.»
  - «Que cuente, pero que el texto quede reservado. No entra a Mirar.»

  «Qué quiere decir citar» se despliega y explica la licencia CC BY 4.0 en dos líneas.
- Un solo consentimiento, escrito como una frase: «Publicá mi aporte en Mi Argentina ideal. Se ve sin mi nombre, con mi provincia.»
- Un solo botón: «Publicar mi aporte».

**Listo.** «Tu aporte quedó publicado.»
- **La imagen para compartir**: un papelito de 1080 × 1350 con la línea, la provincia, «Mi Argentina ideal» y la dirección del sitio. Se dibuja en el navegador, en un `canvas`, y sale por la hoja de compartir del teléfono (Web Share), con descarga como alternativa. Sólo lleva lo que la persona escribió.
- La acción principal: «Ahora mirá lo que imaginan otros →».
- El recibo de siempre (identificador, campaña y edición, corregir y retirar) queda plegado debajo, en «Tu recibo».

Se conserva sin tocar el núcleo común de ubicación, consentimiento, validación y recibo: el reintento idempotente, el retiro, la corrección, y que nada se publique sin que la persona lo revise.

**La lectura asistida no entra en el recorrido nuevo.** Hoy manda el borrador a un proveedor externo cuando la persona lo consiente, y eso choca con la ADR 0009 (D-136).

**Cómo se guarda (P2).** `senales.texto` es la línea, que es lo que se publica. Si la persona escribió más, eso va como fragmento: `{ pregunta: PREGUNTA, respuesta: texto completo }` en `contribuciones.fragmentos`, que existe exactamente para mostrar de dónde salió un aporte. No hace falta columna nueva.

## 4. Mirar — la pila

La pila es una tanda de papelitos. Cada uno es la línea del aporte de otra persona, con la provincia y el tema de quien lo escribió.

### Antes del primer papelito

Si no se sabe tu provincia, porque no publicaste un aporte con provincia ni contestaste nunca, se pregunta una vez: «¿De qué provincia sos?». La pantalla explica en una línea para qué: «Para saber si lo que se comparte se comparte en todo el país.» Hay lista nativa y «Prefiero no decirlo». La respuesta viaja con cada opinión; no se guarda en el navegador.

### El papelito

Arriba, en Space Mono, «Alguien de Salta imagina». En el centro, la línea en Archivo y grande, sobre papel. Al pie, el tema. Cada papelito tiene una inclinación chiquita y fija, siempre la misma para el mismo aporte, para que la pila parezca de papeles y no de tarjetas de banco.

### El gesto

| Gesto | Botón (siempre visible) | Teclado | Qué guarda | Sello que aparece |
|---|---|---|---|---|
| Deslizar a la derecha | **Yo también** | → | `acuerdo` | YO TAMBIÉN, en violeta |
| Deslizar a la izquierda | **Yo no** | ← | `desacuerdo` | YO NO, en tinta |
| Deslizar hacia abajo | **Paso** | ↓ | `paso` | PASO, en tinta suave |
| Tocar la tarjeta | — | Enter | Abre el aporte entero y «Reportar este aporte» | — |

El sello se va marcando a medida que la tarjeta se corre, como en una mesa de entradas, que es el lenguaje de Papel y Tinta. Los botones están siempre abajo de la tarjeta, de 44 px de alto como mínimo. Deslizar es un atajo, no la única forma. Con movimiento reducido la tarjeta no vuela: se desvanece. El gesto se hace con `framer-motion` (`drag`), que ya es la librería de animación del proyecto.

### ¿Cuál va primero?

Después de la cuarta y de la octava respuesta de la tanda, si tenés dos «Yo también» que todavía no comparaste entre sí, la pila muestra los dos juntos y pregunta: **«Si sólo uno pudiera pasar primero, ¿cuál elegís?»**

Se contesta tocando uno, que recibe el sello PRIMERO, o con «Los dos por igual». En la tanda hay dos duelos como máximo. Se compara tu «Yo también» más reciente con el más antiguo que todavía no estuvo en un duelo, así cada uno entra una sola vez antes de repetir. Cada par se guarda una vez por persona, sin importar el orden, y se puede cambiar.

Esto es lo que hace que la visión pueda ordenar. El acuerdo dice qué se comparte. La prioridad dice qué se elige cuando no se puede todo, que es la pregunta de cualquier presupuesto real.

### Lo que se ve y lo que no

- **Antes de responder no se ve ningún número.** Si la tarjeta dijera «el 80 % dijo que sí», la gente copiaría.
- **Después de responder, durante un segundo, se ve una de estas:**
  - «Vos y 23 personas más.»
  - «Con tu respuesta, el NOA ya cuenta en este aporte.» Aparece cuando tu opinión es la quinta de tu región.
  - «Sos de los primeros en verlo.»
- Con «Paso» no se muestra nada.
- Nunca se ve el nombre de nadie.
- Nunca aparece tu propio aporte.

### Una tanda tiene fin

La constitución del producto dice que ¡BASTA! no busca retener atención, y una pila infinita es exactamente eso.

- **La tanda tiene hasta diez papelitos**, más los duelos y la tarjeta de escribir, y termina.
- Si para vos hay tres, la tanda es de tres.
- El cierre dice: «Listo. Miraste 10. Dijiste yo también a 6.» Abajo, la lista de esos seis, y «Ver cómo se va armando →».
- Podés pedir otra tanda; no se ofrece sola.

### Qué papelitos tocan

En este orden, sin azar escondido:

1. **Donde tu región todavía no llega a cinco opiniones**, si sabemos tu región. Ahí tu respuesta destraba algo.
2. Los que tienen **menos opiniones en total**. Un aporte que llegó tarde tiene que tener la misma oportunidad que el primero.
3. Los más viejos primero y, a igualdad, el identificador.

Sobre ese orden se aplican dos reglas de reparto:
- Uno de cada tres papelitos (los lugares 3, 6 y 9) es de tu provincia o, si no hay, de tu región.
- Nunca van más de tres seguidos del mismo tema, si hay alternativa.

El armado es una función pura en `civic-core` con sus pruebas: la misma entrada da siempre la misma tanda.

### La tarjeta de escribir vive adentro de la pila

Si llegaste a mirar sin haber escrito, el sexto lugar (o el último, si hay menos) es un papelito en blanco, con borde punteado: «Te toca. En tu Argentina ideal, ¿qué sería posible en tu vida?». Lo podés saltear. Si llegaste desde Imaginar, no aparece.

Así no hay dos lugares para participar. Hay uno, y escribir es una tarjeta más.

### Sin cuenta, y sin perder respuestas

La pila funciona con el actor de navegador que ya existe: una opinión por actor y por aporte, que se puede cambiar. Con cuenta, la opinión también se ata a la cuenta, para que la misma persona en dos navegadores no cuente doble (la lección de la D-137).

Si la red falla, la tarjeta igual avanza. Las respuestas esperan en memoria y se reintentan. Si se pierden, la pantalla lo dice: «Tus últimas 3 respuestas no se guardaron. Reintentar.»

Lo que esto mide se dice abiertamente en la visión: «Una persona decidida puede responder desde dos teléfonos. Esto mide a quienes participaron, no a la Argentina».

### Reportar (D3)

Un aporte entra a la pila en cuanto se publica. Cualquiera que lo vea puede tocar la tarjeta y elegir «Reportar este aporte», con tres motivos: insulta a alguien, tiene datos de una persona, no tiene que ver con la pregunta.

- **Con 13 reportes de actores distintos, el aporte sale de Mirar y de Ver** (`retenida_en`). Su autor ve en Mi espacio por qué salió. No se borra, y Juan puede devolverlo.
- **Sólo cuenta el reporte de quien ya contestó al menos cinco aportes.** Sin esto, una sola persona con trece pestañas privadas podría sacar de la pila lo que no le gusta, porque un actor nuevo cuesta un clic.
- **Juan recibe un aviso en Mi espacio** cuando un aporte sale por reportes, y con el primer reporte por datos personales. Para avisar se usa `eventos_civicos`, que ya alimenta esa pestaña.

Dos protecciones más, que no son moderación:
- **El filtro local frena teléfonos, mails y números de DNI antes de publicar.** Es protección de datos personales, no un juicio sobre el contenido. Corre en nuestro servidor, sin modelo y sin proveedor, y vale sólo para los deseos: un recurso puede llevar, con razón, el teléfono público de una cooperativa.
- **Juan puede retener un aporte en el momento** desde `/gestion/pila`, sin esperar los 13, y queda registrado quién lo hizo y por qué.

### Antes de que haya aportes de otros (D1)

Mirar sólo muestra aportes reales. Una tanda trae los que haya, hasta diez. Si para vos no hay ninguno, el momento no se finge. La pantalla dice: «Todavía nadie más publicó su aporte en Mi Argentina ideal. El tuyo va a ser de los primeros que vean otras personas.» Y ofrece compartir el tuyo o escribirlo. El estado vacío se apaga solo cuando llegan aportes, sin bandera de demostración (V4).

Para que eso dure poco, el lanzamiento se hace en persona:
- **Carteles con un código QR** en escuelas, clubes y plazas. Cada persona carga su aporte en su propio teléfono, así que no hace falta modo asistido.
- **Escucha asistida con la app de campo**, donde haga falta. Las reglas de la campaña hoy sólo declaran el canal web, y sumar el canal asistido es una edición nueva de esas reglas.

## 5. Ver — la visión

Es una página que se entiende en diez segundos y se puede compartir. Para el público, reemplaza a los modos Análisis, Cobertura y Simulación.

**Cabecera.** «Mi Argentina ideal · edición 1 · faltan 132 días». Tres números de verdad: personas, opiniones y provincias. En cero, dice cero.

**Tu aporte**, si publicaste. Tu línea y cómo le va: «29 de 41 que opinaron también lo quieren · 5 pasaron». Es privado, sólo lo ves vos. No hay puntaje de afinidad ni comparación con otras personas (regla 7).

**Lo que nos une.** Son los aportes que comparte la mayoría **en todas las regiones que opinaron lo suficiente**, no sólo en el total. Cada uno lleva una barra («8 de cada 10 que opinaron») y seis puntitos, uno por región. El puntito está lleno donde hay acuerdo, vacío donde no y punteado donde faltan opiniones.

La regla es federal y se explica en una línea: *para estar acá, un aporte tiene que tener al menos 7 de cada 10 «yo también» en cada región con cinco opiniones o más, y al menos dos regiones así.* Se ordena por el acuerdo de la región donde el aporte anda peor. Así uno muy votado sólo en Buenos Aires no tapa a otro que se comparte de Jujuy a Ushuaia. «Federal por diseño» es un principio que la portada ya promete, y ésta es la primera vez que una cuenta lo cumple.

Las regiones son seis: NOA, NEA, Cuyo, Centro, Buenos Aires (provincia y Ciudad) y Patagonia, con La Pampa en Centro. Se definen por código ISO en `civic-core`, junto a la lista canónica de provincias.

**Lo que va primero.** Entre los aportes que se quieren, el orden que sale de los duelos.
- Cada uno lleva una frase: «Cuando se compara con otro que también se quiere, va primero 7 de cada 10 veces».
- El puntaje es `(veces que va primero + 1) / (comparaciones + 2)`. El `+1 / +2` evita que un aporte con dos comparaciones ganadas encabece la lista.
- Sólo entran los aportes con 10 comparaciones o más y con 6 de cada 10 opiniones a favor en total.
- Se muestran los cinco primeros.

**Donde no coincidimos.** Son los aportes partidos al medio (entre 4 y 6 de cada 10 en total) o los que en una región se quieren y en otra no, con 30 puntos de diferencia o más: «En Cuyo, 8 de cada 10. En el NEA, 3.» Es la sección más honesta de la página y la más interesante.

**En cada tema.** Los 13 temas, cada uno con su aporte más compartido según la misma regla federal. Leída de corrido, la lista es un retrato de la Argentina que se imagina en trece líneas, y es lo que se comparte como imagen de la visión. Un tema sin un aporte que cumpla la regla lo dice: «Todavía ningún aporte de vivienda se comparte en todo el país.»

**El país que falta.** Acá entra el mapa, y entra simple:
- Las provincias se encienden en plata según cuánta gente participó por habitante (`luzDeCelda`, con la normalización que ya existe). Tocar una muestra su región.
- Debajo, una fila por región: **«Patagonia ya cuenta en 12 de los 40 aportes que se están discutiendo.»** La barra va de 0 a 40.
  - *Los aportes que se están discutiendo* son los que tienen 20 opiniones o más en total.
  - *Contar en un aporte* quiere decir tener cinco opiniones de esa región en ese aporte.
- Cada fila tiene un botón: **«Completar los de Patagonia»**. Lleva a Mirar con la prioridad puesta en esa región, para quien es de ahí.

Esto es lo único que se rescata de la simulación: la pregunta «a partir de cuánta gente cuenta una región», contestada con datos reales, atada a la regla que la visión usa y conectada con el gesto que la resuelve. Es orgánica porque se mueve cuando la gente participa.

**Seguí construyendo.** Las capas de la §6 aparecen al lado de cada aporte de «Lo que nos une».

**Al pie, siempre:** «Esto es lo que dijeron quienes participaron. No es una encuesta del país.» Al lado, «Cómo se cuenta», que despliega las reglas de esta sección en lenguaje llano.

### Umbrales para no mentir con números chicos

- Un aporte entra en cualquier sección de la visión con al menos **20 opiniones** («Yo también» o «Yo no») y al menos **dos regiones con cinco o más**.
- Una región con menos de cinco opiniones sobre un aporte no muestra porcentaje. Muestra «Faltan opiniones».
- Los pasos se cuentan, pero no entran en el denominador.
- La supresión se hace sobre los conteos crudos, en el servidor, antes de calcular porcentajes o brillo. Es lo que pide la D-088 y vale para toda la visión, mapa incluido.
- Nada de esto entra en la métrica norte. Converger no es corroborar.

## 6. Las capas que vienen después

El pedido dice «empezando por la visión ideal, y después se pueda poner más info». La respuesta es que **la información nueva se cuelga de un aporte que ya encontró acuerdo**, no de un mapa vacío.

Cuando un aporte entra en «Lo que nos une», su tarjeta ofrece el paso siguiente:

| Capa | La pregunta | Lo que ya existe para responderla |
|---|---|---|
| 1. El ideal | ¿Qué sería posible en tu vida? | Lo de las §3–§5 |
| 2. Cómo está hoy | ¿Qué pasa hoy con esto en tu lugar? | Los aportes de clase hecho (necesidad, ¡basta!, recurso) con ubicación, y «¿Sigue así?» para corroborar. **Acá el mapa con precisión tiene trabajo de verdad.** |
| 3. Qué hace falta y quién puede | ¿Qué tendría que funcionar? ¿Quién ya lo hace? | Las dos preguntas que salen de Imaginar, las capacidades y las condiciones de las fichas |
| 4. Cómo lo hacemos | ¿Qué proponemos? | Fichas, alternativas, iniciativas, campo, y los PLANes como referencia abierta |

Cada capa se ve como una tarjeta más del mismo aporte, no como otra página con otro menú. Lo que se carga en la capa 2 se vincula al aporte que lo motivó con la relación `inspira`, que las fichas ya tienen.

Así cada herramienta existente tiene un momento y una razón para aparecer. El instrumento del mapa, con sus cinco modos, sigue existiendo, pero como la herramienta de la capa 2 para quien carga y comprueba hechos en su territorio, no como la puerta de entrada.

## 7. Qué pasa con lo que ya existe

Nada se borra en las entregas 1 y 2. Lo que cambia es por dónde se entra y qué se promete.

| Hoy | Mañana | Entrega |
|---|---|---|
| Header: La idea · Mapa · Campañas (con Las fichas y Sumarme a una tarea) · Radiografía · Biblioteca + «Imaginar mi Argentina» | **La idea · Mi Argentina ideal · Campañas · Biblioteca** + «Sumate». Campañas se queda porque ahora cualquiera puede proponer una (§11). | 3 |
| La portada pregunta y manda a otra página a contestar | La pregunta y el campo de la pantalla 1 viven en la portada: escribís ahí y «Seguir» te lleva a la pantalla 2 | 3 |
| «Imaginar mi Argentina» abre el panel del mapa | Lleva a `/mi-argentina-ideal/imaginar`. `?participar=aportar` y `/imaginar` redirigen. | 1 |
| El panel guiado del mapa (`ConversacionIdeal`) | Queda sin entrada en la entrega 1 y se borra en la 3, con su llamada a `interpretar` (D-136) | 1 y 3 |
| «A mí también me pasa» sobre un deseo de la campaña, en `/senal/:id` | Las tres respuestas de la pila | 1 |
| `/el-mapa` como puerta de entrada | Es la herramienta de la capa 2. Se llega desde un aporte o desde «El país que falta», y la URL sigue andando. | 3 |
| Modo Simulación del mapa | Sale de las pestañas | 3 |
| `/la-simulacion` | Sale del footer y del recorrido. La URL sigue, como laboratorio del motor, con un aviso arriba. | 3 |
| Modos Análisis, Línea de tiempo, Cobertura | Quedan adentro del instrumento como herramientas secundarias | 3 |
| `/la-radiografia` | Queda como «Mirarlo con lupa», enlazada desde Ver. Sus «Acuerdos y diferencias» pueden leer también las opiniones de la pila. | 2 |
| `/campanas` | Se queda en el header: muestra la nacional primero, las abiertas, y las que están juntando gente para abrir (§11). | 3 |
| `/sintesis-nacional` | Es la **devolución** de cada edición: la lectura que el equipo revisa y firma a partir de Ver. Ver se calcula en vivo; la síntesis la firma alguien. No son dos visiones. | 2 |
| `/vision-compartida` | Son los objetivos que arman los grupos en sus fichas. Pasa a la capa 4 y deja de llamarse «visión». | 4 |
| Fichas, capacidades, iniciativas, campo, escucha, recorrido escolar | Son las capas 3 y 4. Se llega desde un aporte o desde Mi espacio. | 4 |
| `/mandato-vivo` | Queda fuera de esta propuesta hasta decidir dónde vive (D-135) | — |

## 8. Lo que se decidió y lo que falta decidir

Juan cerró cuatro decisiones el 19 de octubre de 2026.

| | Pregunta | Decisión | Qué se descartó |
|---|---|---|---|
| **D1** | ¿Qué hay en la pila antes de que haya aportes de otros? | **Sólo aportes reales.** El lanzamiento se hace en persona (§4). | Líneas de partida escritas por ¡BASTA! a partir de los PLANes. Rozaban la regla V1 y habrían necesitado su propia enmienda. V1 queda intacta. |
| **D2** | ¿La pila deja decir «Yo no»? | **Sí: Yo también · Yo no · Paso.** | Sólo «Yo también» y «Paso» |
| **D3** | ¿Quién revisa un aporte antes de que lo vean otros? | **Nadie antes.** Se muestra en el momento y **sale con 13 reportes** de actores distintos (§4). | Revisión previa de cada aporte |
| **D4** | ¿Qué pasa con la simulación? | **Sale del recorrido público.** Su pregunta sobrevive en «El país que falta». | Borrarla, o dejarla como está |

**P1, resuelta el 20 de octubre con la opción recomendada.** El dueño pidió implementar todas las mejoras descriptas; la recomendada es la que no cambia ninguna regla existente. Queda abierta a revisión.

**P1 — ¿Para entrar a Mirar, el aporte tiene que ceder su texto?** Hoy un aporte sin cesión de licencia muestra «Texto reservado por su autoría.» en toda lectura pública (`textoDeSenalPublica`: mapa, Radiografía, la página del aporte). Hay dos caminos.

- *Recomendado: la elección explícita de la §3.* Quien cede, entra a Mirar; quien no, publica igual con el texto reservado. No cambia ninguna regla existente, y la cesión sigue siendo de la persona, sin opción marcada de antemano. El costo es pedirle a una persona común que elija una licencia, por eso la opción se explica en palabras de todos los días.
- *Alternativa: separar «se lee en el sitio» de «se puede citar».* Publicar alcanza para leerse; la licencia libre queda sólo para citar y exportar. Hay menos fricción, pero cambia lo que significa hoy la cesión **en todo el sistema**. Para que el aporte no se lea en la pila y aparezca reservado en su propia página, habría que tocar `textoDeSenalPublica`, la política de privacidad y la versión de la cesión.

**Las decisiones de diseño que tomo yo**, salvo indicación contraria:
- Las protecciones de §4: el filtro local, la retención por Juan, el mínimo de cinco respuestas para que un reporte cuente y los avisos.
- Los duelos.
- Las seis regiones.
- Tanda de diez y líneas de 140 letras.
- El mapa de Ver en SVG liviano, sin maplibre.
- Escribir primero cuando venís desde la portada.

## 9. Cómo se construye

| Entrega | Qué deja andando |
|---|---|
| **1 · Imaginar y Mirar** | Las tres pantallas y el cierre con la imagen para compartir. La pila, con opiniones, duelos, la tarjeta de escribir y la prioridad por región. Los reportes con sus protecciones, `/gestion/pila` y las tres respuestas en `/senal/:id`. Migración `0040`. Plan en `docs/plans/2026-10-19-mi-argentina-ideal-entrega-1-plan.md`. |
| **2 · Ver** | La visión entera de la §5, los aportes parecidos al escribir (`pg_trgm`), compartir la visión como imagen y la supresión de grupos chicos (D-088) |
| **3 · Una sola puerta** | El header nuevo y la pregunta adentro de la portada. La simulación afuera, el panel viejo borrado, `/el-mapa` como capa 2 y `/campanas` fuera del header. |
| **4 · Las capas** | El paso siguiente en cada aporte de «Lo que nos une», con los vínculos a hechos, capacidades y fichas |

**Las entregas 1 y 2 salen juntas a producción.** Una pila sin visión junta opiniones sin mostrarle a nadie para qué sirven.

Antes de lanzar, en este orden:
1. **El prototipo se prueba con cinco personas**, en sus teléfonos y sin explicarles nada (§10).
2. Se cierra la D-121, para que la campaña exista.
3. Se aplican las migraciones, con respaldo previo.
4. Se hace el lanzamiento en persona de la D1.

## 10. Cómo sabemos que funciona

**La prueba con cinco personas**, antes de escribir la primera pantalla real, con el prototipo de `docs/demos/`. Cinco personas distintas en edad, provincia y familiaridad con el teléfono, cada una en el suyo, sin explicación previa. Se les pide una sola cosa: «Contá qué querrías que fuera posible en tu vida y después mirá qué imaginan otros». Se observa en silencio y después se pregunta.

| Qué se mira | Pasa si |
|---|---|
| ¿Llega a publicar sin ayuda? | Cinco de cinco |
| ¿Entiende que «Yo no» no es un insulto a nadie? | Lo dice con sus palabras |
| ¿Entiende «¿Cuál va primero?» sin explicación? | Cuatro de cinco |
| ¿Puede explicar qué es «Lo que nos une» y por qué un aporte no está? | Cuatro de cinco |
| ¿Entiende qué le pide «Completar los de tu región»? | Cuatro de cinco |
| ¿Cuánto tarda desde la portada hasta Ver? | Menos de tres minutos |
| ¿Hubo algún momento en que no supo qué tocar? | Se anota cada uno y se corrige antes de construir |

**Y después de lanzar:**
- La primera pantalla de cada momento tiene **una sola acción principal**.
- Con la base en cero, cada pantalla dice qué falta para que haya algo, sin pedir perdón.
- Ninguna pantalla muestra un número calculado con menos opiniones que los umbrales de la §5.

## 11. Campañas que propone cualquiera, con un paso previo

Pedido del dueño, 20 de octubre de 2026: *«quiero que otra gente pueda presentar campañas también, pero para presentar campañas me gustaría que haya un filtro, o un paso previo para que los impulsores de las campañas traigan a más gente a la página.»*

Hasta ahora sólo Juan abría campañas (decisión del 9/10). Desde ahora cualquiera con cuenta puede proponer una. Para abrirse, una campaña tiene que pasar un paso previo: **quien la impulsa trae gente nueva a imaginar el país.**

### El recorrido

1. **Proponer** (`/campanas/proponer`). Hace falta una cuenta con el correo verificado, porque quien impulsa queda como responsable pública de la devolución. Se piden las mismas reglas de la campaña que ya existen: la pregunta, el lugar, los temas, para qué, quién coordina, qué se va a devolver y cuándo, y cómo se van a usar los aportes. Cada cuenta tiene una sola campaña juntando gente por vez.
2. **Juntando gente** (estado `reuniendo`). La campaña tiene su página pública en `/campanas/:slug`, con la pregunta, quién la impulsa y una barra: **«Para abrirse, esta campaña necesita 50 personas nuevas. Lleva 18.»** Quien la impulsa comparte esa página: con el enlace, con la imagen para compartir o con un cartel con QR. El botón de la página es **«Sumate: contá tu Argentina ideal»**.
3. **Qué cuenta como una persona.** Cuenta una persona nueva que llega desde la página de la campaña y participa en Mi Argentina ideal:
   - publica su primer aporte, o
   - da sus primeras cinco opiniones en Mirar.

   *Nueva* quiere decir que no había participado antes, ni con aportes ni con opiniones. Así, alguien que ya estaba no se cuenta dos veces para campañas distintas. Cada persona cuenta para una sola campaña: la primera que la trajo. El paso previo alimenta la visión del país: cada persona que trae una campaña es una persona más imaginando.
4. **Revisión** (estado `por_revisar`). Al llegar a 50, la campaña pasa sola a revisión, y Juan y quien la impulsa reciben un aviso. Juan revisa que las reglas de la campaña se cumplan: que haya una pregunta, una fecha de devolución posible, un uso de datos claro y nada que ataque a nadie. No juzga si la idea le gusta. Ve también los aportes de las personas que trajo, para notar si son de verdad. Después, la abre (o la programa) o la devuelve a `reuniendo` con un motivo que quien la impulsa lee. Cada paso queda en `campana_ediciones`, como cualquier cambio de estado.
5. **Abierta.** Desde ahí es una campaña como las demás, y quien la impulsa es su coordinación: publica la devolución, la pausa y la cierra. Abrir sigue siendo de Juan.

### Cómo se cuenta, sin que se pueda fabricar fácil

- La llegada se marca **cuando la persona toca «Sumate»**, no cuando abre la página. Un robot que visita no suma nada. La marca es una cookie `httpOnly` de siete días con la campaña, y no guarda nada en la base hasta que la persona participa.
- La persona se cuenta en el momento en que participa: con su primer aporte o con su quinta opinión. Para eso la cuenta de actor tiene que haber nacido después de la llegada, o no tener participación anterior.
- Un aporte retirado o retenido por reportes deja de contar.
- Juan ve la lista de lo que escribieron las personas que trajo la campaña antes de abrirla. Cincuenta aportes iguales se notan.
- El techo de actores nuevos por red que ya existe (`actores_por_origen`) también frena a quien quiera fabricar personas desde una sola conexión.

### En pantalla

- **`/campanas`**: arriba, la nacional; después, las abiertas; después, «Quieren abrir», con la barra de cada una. Hay un botón «Proponer una campaña» (con «Ingresá para proponer» si no hay sesión).
- **La página de una campaña que junta gente**: la pregunta, quién la impulsa, para qué, la barra, «Sumate» y, para quien la impulsa, «Compartir esta campaña» y su progreso.
- **Mi espacio**: «Tus campañas», con el estado, la barra y el motivo si Juan la devolvió.
- **`/gestion/campanas`**: «Para revisar», con las reglas, la cuenta de personas y sus aportes, y los botones «Abrir», «Programar» y «Devolver con un motivo».

### El número

**50 personas nuevas.** Es una constante (`UMBRAL_IMPULSO`), igual para cualquier campaña, y se puede ajustar sin migración. Alcanza para que una campaña demuestre que tiene gente detrás y no es tan alto como para que sólo puedan abrir campañas los que ya tienen audiencia.


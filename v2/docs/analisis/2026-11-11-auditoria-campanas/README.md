# Auditoría de punta a punta: el constructor de campañas y «Mi Argentina ideal»

**Fecha:** 11 de noviembre de 2026.
**Qué se leyó:** el código desplegado (`origin/main`, `9d02d9d3`), las specs del 8/10 y del 19/10, y producción en modo lectura (seis pantallas a 390 px, la API pública y conteos de la base).
**Cómo:** tres lectores independientes recorrieron el código (servidor del constructor, pantallas del constructor, el circuito Imaginar → Mirar → Ver). Cada hallazgo de las tablas de abajo lo volví a leer en el archivo antes de anotarlo, salvo los que dicen «sin verificar».
**Revisión en contra:** las propuestas de la §6 pasaron por dos revisores independientes (uno contra la ley escrita y los hechos, otro contra el abuso, la privacidad y la viabilidad). Dos cayeron enteras y las demás cambiaron; la §6 es lo que quedó y la §7 dice qué cayó y por qué.
**Estado:** borrador para decidir. Nada de lo que propone está adoptado.

---

## 0. En una frase

La máquina está construida y bien cuidada en los detalles, pero **la campaña todavía no empezó, y si mañana llegaran mil personas e hicieran lo que la pantalla les propone, la cuenta que arma «Lo que nos une» no les mostraría un resultado**. Lo que falta no es pulido ni una función nueva: es que la cuenta pueda cerrar, que el primer resultado aguante una lectura hostil, y que el lanzamiento en persona que la spec ya ordena tenga fecha y número.

---

## 1. Lo que hay en producción hoy

Medido el 11/11/2026, quince días después de abrir (27/10). Faltan 110 días para el cierre (28/2/2027).

| Qué | Cuánto |
|---|---|
| Aportes publicados y vigentes | **0** (se publicaron dos, de prueba; los dos están retirados) |
| Opiniones en Mirar | **0** |
| Personas que opinaron | **0** |
| Campañas | 1 (la nacional). Propuestas por otras personas: 0 |
| Cuentas | 14: una real y 13 de prueba (D-161) |

Lo que ve hoy quien entra:

- **La portada abre con el aviso de bienvenida** (ADR 0013) en cada carga. Sus dos botones llevan a una crónica y a «Seguir mi camino»; ninguno lleva a Imaginar. La pregunta de la campaña queda debajo.
- **La portada dice algo que no es cierto.** La cinta lee «Los últimos aportes tienen el texto reservado por quien los escribió». No hay aportes: `GET /api/v1/civic/senales` devuelve los dos retirados y `VocesTicker.tsx:34` los cuenta como publicados. (Mismo origen que D-148, que se resolvió para el contador y no para la cinta.)
- **Ver es una columna de vacíos.** Tres ceros, después unas veinte frases «Todavía ningún…» (una por cada uno de los 13 temas) y siete enlaces «Sumá el tuyo →».
- **Un enlace compartido no muestra nada propio.** Cualquier dirección del sitio, incluida `/campanas/mi-argentina-ideal`, entrega el título y la descripción genéricos, sin imagen (`apps/web/index.html`; no hay ninguna etiqueta `og:` en el repositorio). D-149 lo anota sólo para las crónicas.
- **El lanzamiento que la spec describe no ocurrió.** La spec del 19/10 (§4, «Antes de que haya aportes de otros») dice que el lanzamiento «se hace en persona», con carteles con QR en escuelas, clubes y plazas, y con escucha asistida. Siguen pendientes la prueba con cinco personas, la prueba de carga con un aula (D-138) y los primeros cien aportes presenciales. Las reglas de la campaña sólo declaran el canal web.
- **La política de privacidad no describe esta campaña.** `content/legal/privacidad.mdx` (versión 5) no nombra los aportes, las opiniones de Mirar ni el identificador de navegador que dura un año. Su sección «Menores» dice que la edad mínima «todavía no está fijada» y que «acá se guarda opinión política, que la ley trata como dato sensible»; la identificación legal del responsable sigue en trámite (D-057). Los límites de uso se dimensionaron «para aulas». Antes de la primera escuela, esto tiene que estar escrito.

---

## 2. La cuenta que no cierra

Esto es lo más importante de la auditoría, y no depende de cuánta gente llegue.

**La regla** (`packages/civic-core/src/vision/leer.ts:13-31` y `:95-96`): un aporte entra en la visión cuando junta **20 opiniones** («Yo también» + «Yo no»; «Paso» no cuenta) y **dos regiones con 5 o más cada una**. Para «Lo que nos une», además, 7 de cada 10 en cada una de esas regiones.

**El reparto** (`packages/db/src/repositories/pila.ts:154-155`, `packages/civic-core/src/pila/tanda.ts:43-49`): cada tanda trae primero los aportes donde tu región tiene menos de cinco opiniones —que en una pila que crece son casi todos— y, entre ésos, **los que menos respuestas tienen**. No hay ningún término que premie al que está cerca de la línea.

**Lo que da la combinación.** El recorrido que la pantalla propone desde la portada es: escribís un aporte, contestás una tanda de diez. Cada persona suma entonces un aporte a la pila y diez respuestas al total, y el reparto las distribuye parejo. Las respuestas por aporte son, por identidad, *respuestas por persona ÷ aportes por persona*: **unas diez por aporte, con cien personas o con diez mil**. Hacen falta veinte, y diez de ésas tienen que venir de dos regiones. Para que el primero cruce, cada aporte de la pila tiene que recibir unas 23 respuestas (contando un 15% de «Paso»): 2,4 tandas por cada persona que publica.

Lo que esta cuenta no dice:

- **Nadie midió todavía qué hace la gente.** Mirar sin escribir es un camino previsto (la tarjeta de escribir, dentro de Mirar, se puede saltear) y «Otra tanda» existe, aunque como segundo botón: el primero es «Ver cómo se va armando →», y la spec dice que la segunda tanda «no se ofrece sola». Si la mayoría mira sin escribir, o contesta tres tandas, la cuenta cierra.
- **«Me sumo» concentra por fuera del reparto.** Quien escribe ve hasta tres aportes parecidos y puede sumarse; eso es un «Yo también». A escala chica no mueve nada; a escala grande, las formulaciones más comunes cruzarían veinte sólo por ahí, con acuerdo total por construcción.
- **No todo Ver queda vacío.** Con aportes, «Lo que recién llega» los lista con su conteo y «Tu aporte» muestra sus números. Lo que queda vacío son las secciones de la regla federal, que son las que le dan sentido a la página.

Tres consecuencias que sí se sostienen:

1. **Con el recorrido que la pantalla propone, las secciones de la visión no se llenan.** Y la pantalla empuja en esa dirección: los enlaces de los vacíos de Ver dicen «Sumá el tuyo →» y llevan a *escribir* (`ver/piezas.tsx:90-98`). Con la base en cero es lo correcto; con aportes esperando opiniones, no.
2. **Un lanzamiento en un solo lugar no puede dar resultado, sea del tamaño que sea.** Quinientas personas en una ciudad dan cero aportes en discusión: falta la segunda región.
3. **«Completar los de {región}» no hace nada.** El botón de «El país que falta» manda `priorizarRegion`; el servicio lo valida, lo pasa a `armarTanda` y `armarTanda` no lo lee nunca (`tanda.ts:32` es el único lugar donde aparece). Reparte la misma tanda que Mirar a secas, y como los aportes en discusión son los que *más* respuestas tienen, salen *últimos*.

Un detalle: el lanzamiento previsto —treinta personas en una misma sala— es justo el caso en que el reparto sí concentra, por una razón que nadie diseñó. Si todas publican y abren Mirar a la vez, el empate en cero se resuelve por antigüedad, a todas les tocan los mismos diez y ésos juntan 29 respuestas mientras los otros veinte juntan cero. Aun así falta la segunda región.

---

## 3. Mi Argentina ideal — hallazgos

### 3.1 El circuito

Persona nueva, teléfono, sin cuenta, desde la portada: **8 pantallas, unos 22 toques, un campo escrito, tres elecciones obligatorias** (provincia, quién puede leerlo, consentimiento). Lo primero que recibe a cambio es el aviso de un segundo después de su primera respuesta en Mirar («Vos y N personas más»), alrededor del toque 12. Al llegar a Ver: «Tu aporte: todavía nadie lo vio en Mirar» y vacíos.

**Qué la hace volver: nada.** No se guarda ningún contacto, no hay avisos, y la única fecha que se le dice (15/3/2027) está dentro de «Tu recibo», plegado. La cookie `basta_actor` permite reconocerla si vuelve; no permite avisarle. En su segunda visita la portada es idéntica.

### 3.2 Defectos

| # | Qué pasa | Dónde | En DEUDAS |
|---|---|---|---|
| M1 | El reparto nivela y la regla pide concentración (§2) | `pila.ts:154`, `tanda.ts:43` | no |
| M2 | «Completar los de tu región» no cambia la tanda | `tanda.ts:32`, `service.ts:68-79` | no |
| M3 | Con aportes esperando opiniones, los vacíos de Ver siguen mandando a escribir. (Con la base en cero es lo correcto, y un test lo fija) | `ver/piezas.tsx:90-98`, `__tests__/ver.test.tsx:403-423` | no |
| M4 | El aporte compartido lleva a Ver (vacío), no al aporte. `/senal/:id` deja opinar en un toque y ningún botón de compartir apunta ahí | `imaginar/Listo.tsx:72`, `ver/CompartirVision.tsx` | no |
| M5 | Quien opina sin cuenta y después ingresa cuenta como dos personas: se le reparten los mismos aportes y sus segundas respuestas suman. `atarACuenta` existe y nadie la llama | `senales/actor.ts:112-118`, `actores.ts:112` | D-100 lo nombra y figura resuelta: el vínculo es voluntario y mueve los aportes, no las opiniones |
| M6 | Corregir un aporte no pasa por el filtro de datos personales ni por el tope de 140 letras. Se puede publicar limpio y agregar un teléfono después; y quien lo alarga a 200 letras lo saca de Mirar y de Ver sin aviso | `contribuciones/routes.ts:162-200` (el filtro sólo corre en `:78`) | no |
| M7 | Toda tanda vacía dice «Todavía nadie más publicó su aporte», también cuando hay ocho aportes y ya los contestaste todos | `Mirar.tsx:188`, `mirar/MirarVacio.tsx:34` | no |
| M8 | Una opinión dada antes de decir la provincia queda sin región, y después Mirar ya no la pregunta («Me sumo» en Imaginar, respuestas desde `/senal/:id`) | `service.ts:103,123-130`, `pila.ts:331` | no |
| M9 | «Lo que nos une» no mira las opiniones sin región ni el total: 5 de Buenos Aires a favor, 5 de Centro a favor y 10 sin provincia en contra dan «nos une» con 5 de cada 10 | `leer.ts:95-96` | no |
| M10 | Después del 28/2 la cabecera dirá «ya no recibe aportes» y el servidor los seguirá recibiendo: nada cambia el estado en esa fecha | `ver/formato.ts:101-104`, `contribuciones.ts:75` | no |
| M11 | «La devolución firmada de cada edición →» lleva a `/sintesis-nacional`; las devoluciones de la campaña se publican en `/campanas/:slug/devolucion` | `ver/SeguirAfuera.tsx:13` (destino sin verificar) | no |
| M12 | La segunda página de `/gestion/pila` responde 400: la web manda `cursor` y la API espera `desde` | `lib/queries/pila.ts:312`, `validation/pila.ts:59-69` | no |
| M13 | El filtro de datos personales frena «2027-2030» y «20 000 000 de árboles» como si fueran teléfonos | `participacion/pila.ts:158-162` | no |

### 3.3 Abuso

El pie de Ver dice «Una persona decidida puede responder desde dos teléfonos». Se queda corto, y conviene decirlo sin receta:

- **Un actor nuevo no cuesta nada y no tiene tope** (D-071, abierta: el techo por origen que la spec da por existente no está en ningún camino del código). La provincia la declara quien opina, en cada pedido.
- Con eso, una sola persona puede llevar un aporte al primer puesto de «Lo que nos une» —que además es el texto de la imagen de «Compartir esta visión»— o sacar de ahí uno legítimo.
- **La regla de las cinco respuestas para reportar cuenta los «Paso»** (`pila-gestion.ts:90-93`): sube el costo de sacar un aporte, pero poco.
- Los límites por IP viven en la memoria de cada instancia (D-138).

Mientras no haya nadie mirando, esto no importa. El día que Ver muestre su primer resultado va a ser lo primero que alguien intente. No es motivo para frenar; sí para cerrar esto antes de que haya un primer resultado público (§6.2).

### 3.4 Lo que una persona recibe por haber participado

Puede encontrar su aporte (Ver → «Tu aporte», sólo el último; Mi espacio en el mismo navegador). No recibe ninguna señal: ni «tu aporte entró en discusión», ni «el NOA ya cuenta», ni la devolución. La devolución escribe un aviso sólo para **cuentas que siguen la campaña**, y «Seguir» está únicamente en la página de la campaña, con ingreso; no aparece en Imaginar, Mirar ni Ver. **El 15/3/2027 no hay forma de avisarle a nadie que haya participado sin cuenta**, que es como el sitio invita a participar.

---

## 4. El constructor de campañas — hallazgos

### 4.1 El recorrido de quien propone

- **Descubrirlo.** La única entrada es un botón al final de `/campanas`, debajo de «Quieren abrir». El menú no lo nombra.
- **El formulario.** Una sola página, **23 entradas, diez obligatorias que empiezan vacías**, sin marcas de obligatorio ni de largo mínimo, y **sin borrador**: recargar o deslizar hacia atrás pierde todo (`Formulario.tsx:76-80`, estado en memoria). Vocabulario de investigación: «Cómo leeremos y revisaremos lo escuchado», «Describí el método, las fuentes, las ausencias…», «Una exploración, una prueba o una decisión con acuerdo y autoridad definidos». Las etapas vienen precargadas con «Contrastar y diseñar / Condiciones deseadas, diferencias y alternativas».
- **Las fechas se fijan el día que se llena** (+42 días para la devolución) y juntar cincuenta personas no tiene plazo.
- **Verificar el correo termina en «Ir al inicio»**, sin vuelta a proponer (`VerifyEmail.tsx:55`).
- **Volver a `/campanas/proponer` con un borrador guardado muestra el formulario en blanco**; el borrador sólo se encuentra en Mi espacio.

### 4.2 Juntando gente

- **Quien propone ve una barra y un número** («18 de 50»), que no se mueve con la página abierta. No ve quién llegó, cuándo ni de dónde. Tiene un solo botón de compartir. **El cartel con QR que promete la spec (§11.2) no existe.**
- **La dirección es `/campanas/campana-<uuid>`** (D-113) con la vista previa genérica.
- **«Retirarla para corregir» rompe todos los enlaces ya compartidos** y la confirmación no lo dice: la campaña deja de ser pública y quien llega lee «No encontramos esta campaña».

### 4.3 Quien recibe el enlace

- En el teléfono, lo primero que se puede tocar es **«Ingresar para seguir esta campaña»**. «Sumate» queda debajo de todo el texto del propósito (hasta 2.500 letras).
- **«Sumate» le cambia la pregunta.** Vino por las luminarias de su barrio; el botón lo lleva a `/mi-argentina-ideal/imaginar`, donde se le pregunta por su Argentina ideal y **nada en las cuatro pantallas siguientes vuelve a nombrar la campaña por la que vino** (`sections/JuntarGente.tsx:55-60`). Unos ocho toques.
- **Nunca se entera de si contó**, ni tiene camino de vuelta, ni se entera cuando la campaña abre (contar no crea seguimiento, y seguir pide cuenta).
- **Quien ya participó alguna vez no puede ayudar.** La página lo dice con honestidad, pero le deja el mismo botón.
- Hay tres «Sumate» distintos en la misma página (el del encabezado y el del pie no marcan la llegada).

### 4.4 Defectos del servidor

| # | Qué pasa | Dónde | En DEUDAS |
|---|---|---|---|
| C1 | **Una campaña en revisión con la fecha de devolución vencida no sale más.** Abrir, programar y devolver exigen fecha vigente; el paso automático a revisión no la mira; quien propone no puede editar ni retirar, ni proponer otra. Sólo se destraba por SQL. Pasa sola, porque juntar gente no vence | `routes.ts:175-186`, `impulso.ts:89-94`, `routes.ts:135` | no |
| C2 | Esa fecha se compara contra el día en UTC: desde las 21:00 de la Argentina ya «venció» (misma familia que D-158, del lado del servidor) | `routes.ts:180` | no |
| C3 | **«Programar» no tiene salida.** Deja la campaña en `programada` sin fecha; nada la abre sola y ninguna pantalla ofrece abrirla (la lista de revisión sólo trae `por_revisar`; el panel de etapas es de quien la creó). El público lee «todavía no abrió» sin plazo | `RevisionPropuestas.tsx:185`, `impulso.ts:193`, `PanelCoordinacion.tsx:50-55` | no |
| C4 | **Quien propone cuenta para su propia campaña si no ingresó.** La exclusión compara cuentas; sin sesión siempre da distinto | `impulso.ts:71` | no |
| C5 | La marca de llegada es una cookie sin firmar con un id público; cinco «Paso» cuentan como participar; quien ya participó sin cuenta y después ingresa cuenta como nuevo | `acreditar.ts:22-28`, `impulso.ts:77-81` | parcial (D-071) |
| C6 | **La administración no puede bajar ni pausar una campaña ajena** fuera de `por_revisar` y `programada`, y el texto de una propuesta es público desde que se presenta, antes de cualquier revisión. No hay rechazo: sólo abrir, programar o devolver a juntar gente. No hay reportes para campañas | `pasos.ts:44`, `impulso.ts:34-37` | no |
| C7 | **Nada hace cumplir ni recuerda la devolución.** Ninguna tarea mira la fecha; pasada, la página sigue diciendo «prevista para el…». Un texto de 30 letras sin fuentes, publicado en cualquier momento —incluso juntando gente— habilita el cierre para siempre | `repo campanas.ts:292-296`, `routes.ts:189` | no |
| C8 | **`revision` hace de número de edición y de contador de cambios de estado.** Los aportes se guardan con la revisión del momento; pausar, reanudar o pasar a devolución suman uno. La página de la campaña enlaza a la Radiografía y a los datos con `edicion=<revisión actual>` y la API filtra por ese número: después de cualquier cambio de etapa, cero aportes. **Le va a pasar a la campaña nacional el 1/3/2027**, y la cabecera pasará a decir «Edición 2» | `campanas.ts:270`, `contribuciones.ts:75`, `EnlacesDeLaCampana.tsx:11` | no |
| C9 | El enlace de «Compartir esta campaña» lleva `?edicion=<revisión>`: después de pausar y reabrir, quien lo recibe lee «está en pausa» en una campaña abierta | `CampanaDetail.tsx:93-95` | no |
| C10 | Quien propone puede abrir la campaña que la administración programó y después pausó | `pasos.ts:45`, `impulso.ts:25` | no |
| C11 | Un editor invitado manda una campaña abierta a borrador con sólo guardar, y quien la impulsa no ve quién aceptó la invitación | `campanas.ts:229`, `colaboracion.ts:64-80` | parcial (D-142) |
| C12 | Si quien impulsa cierra su cuenta, la campaña queda pausada sin dueño y la devolución ya no se puede publicar | `cuenta-civica.ts:24` | no |
| C13 | El segundo paso a revisión no avisa a la administración (la clave del aviso no lleva revisión) | `impulso/avisos.ts:24,30` | parcial (D-142, D-145) |
| C14 | Mientras la campaña nacional esté en lectura o devolución, ninguna propuesta puede sumar gente por aportes | `impulso.ts:75-76` | no |
| C15 | El motivo de un cambio de etapa se publica y el formulario no lo avisa; «Preparando la devolución» es de una sola vía y no pide confirmación | `GestionFase.tsx:49-101` (sin verificar por mí) | no |

### 4.5 Vocabulario

«contrato» llega a la pantalla desde el servidor («Nueva edición: cambió la pregunta o su contrato», en la historia pública). «Etapa» nombra dos cosas: las etapas fechadas de las reglas y el estado de la campaña.

---

## 5. Lo que está bien y no hay que tocar

- Una opinión por persona y por aporte; no se puede opinar, comparar ni reportar lo propio; «Paso» fuera de todo denominador; ningún porcentaje sale del servidor por debajo de los umbrales; la tanda no trae números.
- El umbral de 50 no falla por uno, y dos llegadas simultáneas no se pierden (probado).
- Todo cambio de estado compara la revisión: no hay escrituras viejas que pisen nuevas.
- `ADMIN_USERNAMES` se compara contra el nombre leído de la base en cada pedido.
- Los botones bloqueados dicen por qué; con errores, el foco va al primer campo; la barra de impulso es una frase, una barra real y un valor dicho.
- El motivo de una devolución a juntar gente se muestra en la página y en Mi espacio.
- Las líneas honestas: «Si es tu primera vez…», «No hace falta cuenta», «Esto mide a quienes participaron, no a la Argentina».
- La regla federal. Es lo más propio de todo el diseño y ninguna propuesta de abajo la afloja.

---


## 6. Qué lo volvería inevitable — lo que quedó después de la revisión en contra

Pedí ideas grandes y las hice atacar. La conclusión más útil es incómoda: **con cero personas, ninguna función vuelve inevitable a la campaña**, y las dos ideas más grandes (grupos con resultado propio, y lanzar en la mesa de las fiestas) cayeron por razones que conviene tener escritas (§7). Lo que sí la vuelve inevitable son cuatro cosas, en este orden: que la cuenta pueda cerrar; que el primer resultado aguante una lectura hostil; que el lanzamiento en persona tenga fecha y número; y que el 15 de marzo haya a quién avisarle.

Cada propuesta dice qué regla escrita toca. Ninguna toca D1–D4 ni la ADR 0009.

### 6.1 Que la cuenta pueda cerrar

**A. Un sorteo público decide qué se termina de leer.** El reparto de hoy no concentra; un reparto que premie «al que está más cerca de la línea» se compra con navegadores falsos, porque un actor nuevo es gratis (D-071) y hoy las respuestas falsas *bajan* la exposición de un aporte, no la suben. La salida que sobrevivió: cada semana, un sorteo determinista y verificable por cualquiera (por ejemplo, un hash del id del aporte y el número de semana) elige un conjunto chico de aportes. Una parte de cada tanda sale de ese conjunto; el resto sigue como hoy, incluidos los tres lugares de tu provincia. Ni la antigüedad ni el conteo de respuestas deciden quién entra, así que no se compra ni favorece a los primeros.
- *Lo que toca:* la spec §4, renglones 200 («un aporte que llegó tarde tiene que tener la misma oportunidad que el primero») y 207 (función pura: se conserva); la frase de `ver/formato.ts:119` («Los aportes con menos opiniones aparecen antes…»); los tests `tanda.test.ts:16` y `:46`. Es una enmienda de spec, y la decide Juan.
- *Lo que hay que decir en voz alta:* con esto, cada semana se termina de leer una parte de la pila y el resto espera su sorteo. La mayoría de los aportes no llega nunca a veinte opiniones. Hoy tampoco: hoy no llega ninguno.
- *De paso:* le da a la campaña un pulso semanal —el lunes se sortea, el domingo se sabe— que hoy no tiene. Esta parte salió de la revisión y nadie la atacó todavía.
- **«Completar los de tu región» pasa a hacer lo que dice** (spec, renglón 272). Esto no necesita decisión: es un defecto (M2).

**B. Un piso de personas antes de publicar que algo «nos une».** Cuatro de cinco en una región pasa la regla del 70%; el intervalo de confianza de ese dato va de 38% a 96%. Un «Lo que nos une» apoyado en veinte conocidos de quien organiza es la nota que un periodista escribe solo. Propuesta: la regla por aporte no cambia, y se suma un piso de campaña —por ejemplo, cien personas que opinaron y treinta en cada una de dos regiones— antes de que la sección muestre nada; y **cada renglón y la imagen para compartir llevan su N**. El número del piso lo decide Juan.
- *Lo que toca:* spec §5 («Umbrales para no mentir con números chicos»), a favor: es un umbral más.

**C. Con aportes esperando, Ver manda a opinar.** Cada sección conserva su propia frase de vacío (regla V2 de `el-vacio-como-pieza`; cayó el 10/11 la idea de una sola voz por pantalla). Lo único que cambia, cuando ya hay aportes, es adónde lleva el enlace: a Mirar, no a Imaginar. Si se adopta el piso de B, la cabecera puede decir cuánto falta a nivel de campaña («Opinaron 63 personas; lo primero aparece con 100»). Sin nombrar un aporte, sin región, sin dirección del acuerdo.
- *Lo que toca:* el test `ver.test.tsx:403-423` fija el caso de base en cero, que no cambia.

### 6.2 Que el primer resultado aguante una lectura hostil

Antes de que Ver muestre algo, y antes de invitar a nadie:

- **D-071** (el techo de actores por origen que la spec da por existente).
- **M5, M8, M9:** quien ingresa después de opinar cuenta doble; las opiniones sin región entran al total y no a la regla; «nos une» ignora el total.
- **M6:** la corrección saltea el filtro de datos personales.
- **La política de privacidad** tiene que describir la participación sin cuenta, y la regla de menores tiene que existir antes de la primera escuela.
- **D-138:** la prueba de carga con un aula.

Nada de esto es una idea. Es lo que separa un primer resultado creíble de uno que se cae con una pregunta.

### 6.3 Que cada persona pueda traer a otra

**D. Que un enlace compartido se vea, en todo el sitio, hoy.** Agregar a `index.html` el título, la descripción y **una imagen** de la campaña para todas las direcciones. Es un cambio de un archivo y deja de mandar por WhatsApp un enlace mudo. El título propio por campaña necesita una función aparte (hoy toda dirección se reescribe a un archivo estático) y puede esperar.
- *Lo que no:* el texto del aporte en la vista previa. Cayó el 10/11 como «afiche por aporte» y la razón sigue en pie: un aporte se publica sin revisión y una vista previa guardada por un tercero sobrevive al retiro. La línea ya viaja, entre comillas, en el mensaje que manda quien comparte.

**E. «Compartir mi aporte» lleva al aporte.** Hoy lleva a Ver. La página del aporte (`/senal/:id`) ya deja responder; hay que preguntar ahí la provincia (hoy esa respuesta queda sin región). Las opiniones que llegan por ese enlace se le muestran a quien escribió y **no cuentan para los umbrales federales**: son las de su familia. Se distinguen sin migración (nacen mostradas y contestadas en el mismo instante). Después de responder, la persona sigue a una tanda repartida, donde sus opiniones sí cuentan.
- *Decisión de Juan:* si esas opiniones cuentan o no para la regla. Recomiendo que no.
- *Efecto lateral:* compartir cierra la ventana para corregir («mientras nadie lo haya contestado»). Hay que decirlo en el botón.

### 6.4 Que el lanzamiento en persona tenga fecha y número

**F. Un piloto con fecha, con adultos, en dos regiones.** Es lo que la spec ya ordena (§4, D1) y no ocurrió. Cada persona en su teléfono, con un QR a Imaginar (cualquier generador sirve: el enlace no lleva datos de nadie). La meta es el piso de B. Primero, la prueba con cinco personas, pendiente desde el 19/10. Sin escuelas hasta que exista la regla de menores.
- *Lo que no depende del código:* conseguir a esas cien personas. Es el único renglón de este documento que nadie más que Juan puede hacer, y el que más pesa.

### 6.5 Que el 15 de marzo haya a quién avisarle

**G. Una lista de un solo uso para la devolución.** Hoy no se le puede avisar a nadie que haya participado sin cuenta. Lo mínimo: al publicar y al terminar una tanda, «Avisame cuando salga la devolución», un correo que se guarda sin vínculo con el aporte ni con el navegador, se usa una vez y se borra. La spec del 8/10 lo permite («email y push requieren elección»); contradice el texto actual de Mi espacio («No mandamos correos») y pide una versión nueva de la política. Decisión de Juan.
- *Además, sin decisión:* «Agendar el 15 de marzo» (un archivo de calendario; no guarda nada, y se va a usar poco) y, dentro de «Tu aporte» en Ver, los hechos desde la última visita («recibió 12 respuestas», «entró en discusión»). No en la portada: cayó el 10/11, y un teléfono compartido mostraría la participación de otro.

**H. La devolución vencida se dice.** Pasada la fecha, la página deja de decir «prevista para el…» y dice el hecho: «La devolución estaba prevista para el 15 de marzo. Todavía no se publicó.» Sin días contados junto al nombre de una persona, sin pasos automáticos y sin bloquear a nadie: un paso automático hoy dispararía C8 y C14, y el proyecto no tiene un reloj confiable (D-058, D-074). Quien coordina puede correr la fecha una vez, con motivo público. La salida «o una explicación pública del incumplimiento» se conserva.

### 6.6 El constructor

**I. Primero, que no trabe ni exponga:** C1 y C2 (el candado de la fecha), C3 («Programar»), C8 (edición y revisión) y **C6: que la administración pueda bajar una campaña ajena**. Mientras C6 esté abierta, la fricción del formulario es la única moderación que hay, y bajarla es un error.

**J. Después, que no pierda a la gente:**
- El borrador del formulario se guarda, y volver a `/campanas/proponer` lo encuentra.
- Tres campos para llenar —la pregunta, el lugar, quién responde— y el resto de las reglas **presentes, públicas y editables desde el primer día**, con un texto de partida en criollo. La spec exige que quien recluta gente ya tenga declarados la devolución y el uso de los datos.
- Quien toca «Sumate» no pierde de vista por qué vino: una franja en Imaginar («Venís por *Luminarias de Tafí Viejo*. Para que abra, tu aporte va a Mi Argentina ideal»), y al publicar, «Contaste: ya son 19 de 50» con el camino de vuelta.
- Quien impulsa ve participaciones por día. Nada por debajo de cinco, y no llegadas: no se guardan.
- El QR de la página de la campaña, en la misma página.

### 6.7 Más lejos

- **Una lectura en voz alta el 15/3**, si para el 28/2 se llegó al piso. Cuenta regresiva en días, nunca en horas.
- **La planilla de papel** para la mesa sin teléfonos. La necesidad está escrita en las reglas («quienes viven lejos de las grandes ciudades»). Pide el canal asistido —que es una edición nueva de las reglas, y por eso espera a C8—, la revisión de cada autor y su elección de licencia.
- **De un aporte que une, a una campaña local:** el paso hacia una ficha ya existe; hacia una campaña, enlazando el aporte y no copiando su texto.

---

## 7. Lo que cayó, y por qué

| Idea | Por qué cayó |
|---|---|
| **La mesa**: un enlace que agrupa a una familia o un aula y les muestra «lo que nos une en esta mesa» | Con ocho personas hay como mucho siete opiniones por aporte: «la misma regla» es imposible, y cualquier regla más baja rompe «ninguna pantalla muestra un número calculado con menos opiniones que los umbrales» (spec, renglón 387). Peor: con siete navegadores falsos y un invitado real, la página revela el voto de esa persona, aporte por aporte. En un aula, le da a un docente la lectura de opiniones de chicos identificables. Y «mesa» salió de la pantalla el 9/10 como sinónimo de campaña. Lo único rescatable es una marca de llegada para contar cabezas (de diez para arriba) |
| **La mesa de las fiestas** como lanzamiento (24 y 31 de diciembre; último día de clases) | Dependía de la anterior. Pide a parientes tocar «Yo no» sobre los deseos de otro en Nochebuena, bajo una marca que se llama ¡BASTA!. Gasta de una vez la única red cálida, una noche en la que nadie puede atender una falla. Un teléfono es una persona: la abuela no puede opinar desde el de su nieta. Las escuelas no tienen regla de menores |
| Repartir primero «lo que está más cerca de la línea» | Se compra con navegadores falsos y deja fijos a los primeros aportes. Lo reemplaza el sorteo (A) |
| «El aporte más cerca: 14 de 20; faltan 3 de otra región» en Ver | Dice la dirección del acuerdo antes del umbral y le indica a una brigada qué aporte tocar y qué provincia declarar |
| Una sola frase de vacío en Ver | Ya había caído el 10/11: cada sección dice lo suyo, con tests |
| El texto del aporte en la vista previa del enlace | Ya había caído el 10/11 como afiche por aporte |
| «Desde tu última visita» en la portada | La portada no depende de datos (cayó el 10/11), y un dispositivo compartido muestra lo de otro |
| Que quien llega por «Sumate» conteste la pregunta de la campaña | No es una decisión abierta: el paso previo alimenta la visión del país (spec §11) |
| Reglas completas recién al llegar a revisión | La página es pública desde que se presenta: se estaría juntando gente sin devolución ni uso de datos declarados |
| La devolución vencida con días contados, paso automático y bloqueo | Escrache automático a una persona con nombre; el paso automático dispara C8, C14 y C1 |
| Avales de cuentas verificadas en lugar de personas nuevas | Un correo verificado no es identidad, arma un registro de adherentes y no trae a nadie nuevo, que es para lo que Juan pidió el paso |
| Un número de WhatsApp que reciba aportes; sembrar la pila; aflojar la regla federal; puntos y sellos | ADR 0009; D1; identidad de la cuenta; revisión del 10/11 |

---

## 8. Orden sugerido

1. **Arreglos, antes de invitar a nadie:** la vista previa del sitio (D); M2, M3, M6, M7; D-071, M5, M8, M9; la cinta de la portada; la política de privacidad para quien participa sin cuenta.
2. **Dos decisiones de Juan sobre la cuenta:** el sorteo (A) y el piso (B). Sin la primera no aparece nada; sin la segunda, lo primero que aparezca no se sostiene.
3. **La prueba con cinco personas** y la prueba de carga (D-138).
4. **El piloto con fecha** (F), con E en producción y el aviso de la devolución (G) decidido antes: la cohorte más grande no puede llegar sin que haya cómo avisarle.
5. **Antes de que alguien proponga una campaña:** I. Antes del 1/3 sin falta: C8.
6. **Enero y febrero:** H y J.
7. **15/3:** la primera devolución; leída en voz alta si se llegó al piso.

## 9. Lo que no verifiqué

- No recorrí Mirar en producción: abrirlo escribe en la base.
- No corrí pruebas ni scripts: `v2/.env` apunta a producción.
- M11 (adónde lleva «La devolución firmada») y C15 los leyó un lector y yo los miré por arriba.
- La aritmética de §2 supone 15% de «Paso»; nadie midió todavía qué hace la gente en el recorrido.
- El sorteo (A) y el piso (B) salieron de la revisión: son una dirección, no un diseño. Cuántos aportes por sorteo, qué parte de la tanda y qué número de piso hay que calcularlos y atacarlos antes de escribir la enmienda.
- Los revisores citaron reglas de escuelas provinciales y la Ley 25.326 como lectura propia, no como dictamen.
- Si cien adultos en dos regiones son alcanzables depende de la red de Juan, no del código.

## 10. Lo que se arregló el mismo día

Juan pidió arreglar lo que no necesitaba una decisión suya. Quedó en código, con pruebas, el 11/11/2026:

| Deuda | Qué cambió |
|---|---|
| D-166 | «Completar los de tu región» trae primero lo que se discute sin esa región (M2) |
| D-167 | La cinta de la portada no cuenta aportes retirados |
| D-168 (en parte) | Título, descripción e imagen del sitio en la vista previa de cualquier enlace (propuesta D de §6.3) |
| D-170 (en parte) | Corregir un deseo pasa por el filtro de datos personales y no lo alarga más que una línea (M6) |
| D-171 (en parte) | La tanda vacía dice la verdad (M7); con aportes esperando, los vacíos de Ver mandan a opinar (M3); la gestión pagina (M12) |
| D-172 | Una propuesta con la fecha vencida se puede devolver, y el día es el argentino (C1, C2) |

No se tocó nada que cambie una regla o pida diseño: el reparto (D-165), la unión de opiniones al ingresar y la regla sobre las opiniones sin región (D-169), el techo de actores (D-071), «Programar» (D-173), bajar una campaña ajena (D-175), la devolución (D-176), la edición (D-177) y la política de privacidad (D-180).

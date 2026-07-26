# Cuatro PLANes nuevos — el canon pasa de 22 a 26

**Fecha:** 2026-07-26
**Corpus fuente:** `Iniciativas Estratégicas/PLAN*_Argentina_ES.md` (23 documentos, 46.234 líneas)
**Salida:** cuatro documentos nuevos en el taller + integración de lo no humano en diez PLANes existentes + migración del canon
**Plan de implementación:** pendiente (`docs/plans/2026-07-26-cuatro-planes-nuevos.md`)
**Material de diseño:** dos vueltas de trabajo adversarial (36 agentes) — informe de primera vuelta y parte de segunda vuelta, adjuntos a la sesión `df13d88a`

> **Sobre las listas de «arreglos obligatorios».** Cada PLAN trae una. Consolidan las dos vueltas de
> verificación y están ordenadas por gravedad, no por origen: da lo mismo si un arreglo lo pidió la
> primera vuelta o la segunda, porque ninguno está aplicado todavía. Ningún documento se escribe sin
> agotar su lista.

> **Tesis.** Los 22 PLANes vigentes son órganos que *hacen* algo: el inmunológico juzga,
> el circulatorio paga, la raíz sostiene, las arterias mueven. Falta el aparato que no
> hace nada por sí mismo y sin el cual el resto no se coordina: una señalización que le
> avise al cuerpo en qué etapa de la vida está la persona que tiene enfrente, un tejido
> capaz de volverse cualquier órgano cuando aparezca un problema que ninguno previó, un
> filtro que decida cuánta sangre va a cada órgano, y una mirada — porque los otros
> veintitrés dan por supuesto un ciudadano disponible, y la disponibilidad es exactamente
> el recurso que se está extrayendo.

---

## 1. Por qué estos cuatro

El diagnóstico que abrió el trabajo: los 22 PLANes están escritos para **un adulto, productivo, urbano, en tiempo presente**. Ese ciudadano tiene justicia, casa, agua, energía, transporte, trabajo, salud, deliberación, memoria, tierra, moneda y hasta alma. Nadie nace, nadie envejece, nadie muere; nadie descubre nada nuevo; nadie discute; y nadie paga.

Hay además un hecho crudo que ordena la elección. ¡BASTA! se propuso rediseñar la justicia, la moneda, la tierra y la memoria, y **nunca se sentó sobre los dos flujos de plata más grandes que el Estado argentino efectivamente mueve.** El previsional —alrededor del 45% del presupuesto nacional— no tenía dueño en ningún documento del corpus. La coparticipación tampoco. Tres de los cuatro PLANes nuevos agarran plata que ya existe y hoy se gira mal; sólo uno (PLANPREGUNTA) pide plata que no está.

| Ordinal | Código | Título evocativo | Órgano | Agencia | `category` | Régimen anual |
|---|---|---|---|---|---|---|
| 23 | **PLANPACTO** | *Pagás toda tu vida y nunca te dieron el recibo.* | riñón | CFF | `economia` | USD 500–700M · 1.400–1.500M en transición |
| 24 | **PLANARCO** | *Nacer no es una lotería. Morir no es un trámite.* | sistema endocrino | ANAV | `instituciones` | USD 6.000–11.000M bruto · 2.500–5.000M neto incremental |
| 25 | **PLANPREGUNTA** | *No nos falta talento. Nos falta decir para qué.* | células madre | ANCON | `tecnologia` | USD 1.400–2.400M |
| 26 | **PLANFOCO** | *Nadie te robó las cinco horas. Se las estás dando.* | la mirada | ANBAC | `cultura` | USD 300–500M |

**El ordinal es orden estratégico de lanzamiento** (así lo define el comentario de `arquitecto-data.ts`), y coincide con el orden de escritura por la misma razón: PLANPACTO va primero porque su Fase 0 no le pide permiso a nadie, porque es donde se ordenan los pisos constitucionales de todos los demás, y porque PLANARCO no se puede costear con honestidad hasta que exista la Escalera.

**Lo no humano no es un PLAN.** Se reparte entre diez PLANes existentes (§6). Decisión del fundador, confirmada por el mapa: diez huecos, diez huéspedes, cero agencias nuevas.

---

## 2. La aritmética del Techo — sección transversal, se lee antes que los cuatro

Esta sección es la autoridad numérica de la spec. Todo piso, todo presupuesto y toda afectación de los cuatro documentos se resuelve acá.

### 2.1 El hallazgo

**Los pisos constitucionales que los 22 PLANes reclaman por escrito suman 7,82–9,49% del PBI** (punto medio 8,66%). El corpus repite 5,45–6,25%: esa cifra sale de `PRESUPUESTO_CONSOLIDADO_BASTA.md:193`, cubre 12 agencias, se escribió antes de que existieran los PLANes 17 a 22, y excluye a PLANSAL y al LANEF.

Hay **tres cifras canónicas en conflicto adentro del propio corpus y ninguna es la verdadera**: 2,45% (`BLINDAJE_INSTITUCIONAL_BASTA.md:28`), 5,45–6,25% bruto / 3,2–3,4% neto (`PRESUPUESTO_CONSOLIDADO`), 6,45–8,44% (`arquitecto-data.ts`, que además está mal cargado en cuatro nodos: PLANSEG carga el neto 0,05–0,10 en vez del bruto 1,50 —divergencia de 1,42 puntos—, PLANCUIDADO 0,75–1,1 en vez de 0,45, PLANEN pierde el 0,20 del LANEF, PLANTALLER dice 0,08 y el documento 0,10).

**Manda el taller, no el grafo.** La corrección de `arquitecto-data.ts` es tarea aparte de esta spec.

### 2.2 La cuenta

Sea `R = (P + F) / (G + F)`, con P = rigidez preexistente, G = gasto público consolidado, F = pisos y afectaciones ¡BASTA! nuevos (que suman al numerador *y* al denominador, porque un piso es gasto atado). Como G > P, **R crece con F siempre**: cada piso empeora el ratio.

| Escenario | R con F=0 | Con piso 3,5% | Con la pila real (4,65) |
|---|---|---|---|
| Favorable (P=20,8 · G=33,3) | 62,5% | 66,0% | 69,0% |
| **Central (P=23,15 · G=34,9)** | **66,3%** | 69,4% | 70,3% |
| Adverso (P=25,5 · G=36,5) | 69,9% | 72,0% | 73,3% |

**Desborda antes de empezar.** En el escenario central la Argentina ya está en 66,3% de rigidez con cero pisos ¡BASTA! sancionados. Prueba por el absurdo: para que 3,5% de piso + 0,55 de afectaciones + 0,60 de PLANARCO entren bajo el 65% hace falta un gasto consolidado de 42,8% del PBI — el nivel argentino de 2015–2023. **El Techo del 65% estaba calibrado, sin que nadie lo supiera, contra un país que ya no existe.**

Esto no invalida PLANPACTO: lo funda. Que el proyecto no supiera cuánto estaba pidiendo es el mejor argumento a favor de tener un PLAN que lleve la cuenta, y así tiene que decirlo el documento.

### 2.3 Decisiones tomadas

**El Techo se parte en dos.**
- **Techo A — rigidez total.** 80% del gasto consolidado *con intereses*, bajando 1 punto por año hasta 70% en el año diez. Es un objetivo de convergencia, no un disparador.
- **Techo B — afectación nueva.** 7–8% del gasto primario consolidado (≈2,4% del PBI). Es lo único que este PLAN controla de verdad, y es donde se aplica el LIFO. **El LIFO nunca se aplica sobre A.**
- Los servicios de deuda salen del numerador de B: los intereses no son gasto primario, y no se puede poner en el numerador algo que el denominador excluye por definición.
- El agregado se fija **por ley**. Es el término indefinido más caro del PLAN: sobre consolidado con intereses da 66,3% hoy, sobre primario consolidado sin intereses 63,3%, sobre presupuesto nacional solo 81,6%.

**El piso constitucional único: 2,40%, expresado como 7–8% del gasto primario consolidado.**
- No en % del PBI. En recesión el PBI cae rápido y el gasto es pegajoso: un piso en % del PBI baja en pesos justo cuando más se lo necesita. El corpus repite que el piso en % del PBI "se ajusta solo" y lo declara mitigante; **es al revés**, y el documento tiene que decirlo.
- El 2,40% no es arbitrario: coincide con el neto de régimen del propio corpus (2,17–2,92%, `PRESUPUESTO_CONSOLIDADO:296`) y con el 2,45% de `BLINDAJE_INSTITUCIONAL:28`. Tres caminos independientes llegan al mismo lugar; el 3,5% no lo toca ninguno.
- **Es bruto y sustitutivo, y el documento tiene que decir la palabra «sustituye».** Sin eso, la lectura aditiva es legítima y la pila salta a 12,16%.
- Las afectaciones específicas van **adentro** del piso, no arriba. Si no, la Escalera se llena por la puerta de atrás y el LIFO se vuelve decorativo.

### 2.4 La Escalera de Garantías

Hay que quitar **6,26 puntos del PBI**: de 8,66% a 2,40%. Este es el orden y estos son los cortes.

| Escalón | Contenido | Se saca | Acumulado |
|---|---|---|---|
| 1 | Agua y alimento — AGUA 0,15 + ISV 0,10 | — | 0,25 |
| 2 | Salud de base — SAL: piso inicial 0,50, no la meta del 15% | 0,50 | 0,75 |
| 3 | Educación obligatoria — EDU 0,50 → 0,45 | 0,05 | 1,20 |
| 4 | Techo — VIV 2,00 → 0,50 | **1,50** | 1,70 |
| 5 | Cuidado y arco — CUIDADO 0,45 → 0,25 | 0,20 | 1,95 |
| 6 | Justicia — JUS 0,275 → 0,20 | 0,075 | 2,15 |
| 7 | Deliberación y memoria — MESA + MEMORIA 0,19 → 0,15 | 0,04 | 2,30 |
| 8 | Seguridad — SEG 1,50 → 0,10 | **1,40** | **2,40** |

**=== LÍNEA DEL TECHO: 2,40% ===**

Debajo de la línea, sin piso, con afectación temporal de hasta 8 años renovable por ley: DIG (−0,75), EN (−0,70), MOV (−0,54), TER + TALLER + EB + SUS (−0,50).

Control: 1,40 + 1,50 + 0,75 + 0,70 + 0,54 + 0,50 + 0,50 + 0,20 + 0,075 + 0,05 + 0,04 = 6,26. Cierra.

Los dos cortes grandes los defiende el propio corpus: de PLANSEG, `PRESUPUESTO_CONSOLIDADO_BASTA.md:162` declara que 1,40–1,45 de ese 1,50 es reasignación de gasto que **ya se ejecuta** — blindar plata que ya se gasta no protege nada, sólo consume Techo. De PLANVIV, el propio documento dice que los repagos de la Bastarda Inmobiliaria y los fees del Housing OS cubren el resto.

**La Regla de Arco entra como eje intergeneracional adentro de la Escalera.** No es instrumento paralelo. Dos reglas de reparto se contradicen en la primera recesión —una comprime por materia, la otra por edad— y no hay árbitro. PLANARCO remite a PLANPACTO; PLANPACTO escribe el eje.

### 2.5 La regla de fuentes

Se escribe en PLANPACTO y aplica a los veintiséis:

> **Toda fuente tiene un solo dueño, y el dueño es el PLAN que la recauda. Los demás cobran del reparto protocolizado de ese dueño, nunca de la fuente.**

Eso convierte cada reclamo nuevo en una reapertura explícita del split — que es exactamente lo que tiene que costar. Los cuatro conflictos vivos hoy y su resolución:

| Fuente | Reclamantes | Dueño | Resolución |
|---|---|---|---|
| Regalías de litio, gas y minería | PLANTER (FSC, 100%), PLANEN → PLANMON (FSB), PLANARCO (Dote), PLANPREGUNTA (nuevo) | **PLANTER** | Reabrir el split del FSC (§5.1) |
| FGS (>USD 50.000M) | PLAN24CN (10–20% de activos), PLANARCO (dueño natural) | **PLANARCO** | Tope del 8% para PLAN24CN, negociado por escrito |
| Pauta oficial (>USD 450M/año) | `PRESUPUESTO_CONSOLIDADO:396` (180–270M genéricos), PLANFOCO (~280M→450M), PLANPREGUNTA | **PLANFOCO** | Los genéricos se reasignan; PLANPREGUNTA la saca de su lista |
| Captura de plusvalía del suelo | PLAN24CN, PLANVIV §5.9, PLANPACTO (Tercer Piso), municipios | por **origen de la obra** que creó el valor | Se escribe la regla en PLANPACTO |
| Retenciones | PLANISV (afectación), PLANPACTO (tercera base) | **PLANPACTO** | PLANISV cobra del reparto. Corrección: la afectación de PLANISV estaba sobrestimada ~15× — `PLANISV:1744` da 0,004–0,013% del PBI, no 0,08–0,19% |

---

## 3. PLANPACTO — el pacto fiscal y el reparto *(ordinal 23, se escribe primero)*

**Órgano:** riñón. No produce riqueza: decide cuánta va a cada órgano. *(Corregido desde «corazón»: corazón, arterias y circulatorio ya eran el mismo aparato repartido entre tres PLANes.)*
**Agencia:** CFF — Consejo Federal Fiscal.
**Presupuesto:** USD 500–700M/año en régimen (0,10–0,14% del PBI, declarando el PBI de referencia); 1.400–1.500M/año en transición por el Fondo de Compensación. Quince años: 12.400–22.000M. Lo que administra no es su presupuesto: es la presión fiscal consolidada de USD 145–160.000M/año.

**Tesis.** Argentina discutió cuarenta años cuánto gastar y no discutió nunca quién paga ni cómo se reparte. La Ley 23.548 se sancionó con vigencia declarada de dos años y lleva treinta y ocho. El artículo 75 inciso 2 es el mandato constitucional incumplido más largo de la república. PLANPACTO no es una reforma tributaria: es el acuerdo previo a cualquier reforma tributaria.

**Premisa idealizada.** Qué cobraríamos, a quién, y con qué regla llegaría cada peso a cada jurisdicción sin que nadie tuviera que pedirlo. Y la segunda, que nadie se hizo: si todos los derechos que queremos garantizar reclaman su propio piso, ¿cuántos pisos entran antes de que el Estado deje de poder decidir algo?

**Dispositivos.** Eje: **La Escalera y el Techo** (§2). Después: **El Recibo del Estado** (dispositivo 1 de vidriera), **El Libro Mayor Abierto** (dispositivo separado, ver arreglo 6), **La Poda**, la **sustitución de Ingresos Brutos**, **El IVA que Vuelve**, **La Fórmula Abierta** (persona + Costo de Llegada + Brecha + Esfuerzo Propio), **El Giro Diario** a T+0, **El Auxilio Ciego** (reemplaza los ATN), **La Deuda con Nombre**, **El Tercer Piso** municipal, y el dispositivo nuevo **LA MASA** (regla antifuga: toda especie tributaria nueva nace coparticipable).

**Fases.** El espejo (2027–28, unilateral) · el acuerdo (2029–31, con la Fórmula corriendo 24 meses en modo sombra) · el giro (2032–35) · la convergencia (2036–42).

**El documento tiene que declarar que vale la pena aunque la Fase 2 no llegue nunca.** La Fase 0 no le pide permiso a nadie; la Fase 2 depende de 24 ratificaciones que el país no juntó en treinta años.

### Arreglos obligatorios antes de escribir

1. Partir el Techo en A y B, fijar el agregado por ley, sacar los intereses del numerador de B.
2. Piso a 2,40% del gasto primario consolidado, **bruto y sustitutivo**, con la palabra «sustituye» escrita.
3. Poner la tabla de los 22 pisos fila por fila en el cuerpo, encabezada por: *«Ninguno de los tres números que circulan en nuestros propios papeles es correcto. Que el proyecto no supiera cuánto pedía es el mejor argumento a favor de este PLAN.»*
4. Partir la Fase 0 en núcleo unilateral (Libro Mayor sobre e-SIDIF por decreto; mitad nacional del Recibo con lo que ARCA ya sabe) y fase cooperativa declarada falible. **Borrar toda mención a «Procurement OS de PLANDIG»**: tiene cero ocurrencias en `PLANDIG_Argentina_ES.md` y existe sólo en `SOURCE_OF_FUNDS_LEDGER.md` como F12, clase `future_return`. El dispositivo cuya regla es «ningún retorno futuro es fuente disponible» no puede estar construido sobre un retorno futuro.
5. Blindar la Fase 0 contra su propia reversibilidad: adhesión con caja desde el día uno, convenio que subsiste sin la Nación, feed por ley con obligación de espejo.
6. **Deshacer la fusión Libro Mayor / Recibo.** Una corrección los fundió y otra mandó el Recibo al lado del ciudadano, donde el Estado tiene prohibido mirar — resultado: el registro público del gasto estatal terminó viviendo en el teléfono de cada persona, y quedaron sin dueño el KPI 5, la afectación de retenciones de PLANISV, el 5% del Puente Sanitario, la reasignación de subsidios de PLANEN y el plan de convergencia del Auxilio Ciego. La frase que ordena los dos: *«El Estado es de vidrio y el ciudadano es opaco.»*
7. Adelantar la devolución del IVA a Fase 1 (primer viernes de 2029) y costearla en el Libro Mayor. Hoy el primer beneficio concreto para una persona real es 2032, y el IVA que Vuelve no está costeado: ~7,5M de hogares × USD 31–52/mes = **USD 2.800–4.700M/año (0,55–0,95% del PBI)**, cuatro a siete veces el presupuesto declarado del PLAN entero.
8. Escribir lo que falta: LA MASA; la sustitución de IIBB completa (origen, destino, modelo HST, Comisión Arbitral como sala técnica del CFF — hoy tiene cero menciones en el taller); las **detracciones pre-coparticipación** (cero ocurrencias en 46.234 líneas: la Fórmula reparte con precisión quirúrgica una masa que se vacía arriba); el dueño y la auditoría del padrón (el que cuenta cobra por lo que cuenta); la fila de `READINESS_GATES_ADVERSARIAL.md`; la sección de compatibilidad con regímenes de estabilidad — **el RIGI no se nombra ni una vez**, siendo el régimen que congela por 30 años la estructura que el PLAN reescribe; y el mapa de perdedores, que hoy no incluye a los gremios de las 25 administraciones tributarias ni a los consejos profesionales de ciencias económicas.
9. Invertir la cuenta única: ARCA recauda *dentro* de la cuenta del CFF; la Nación cobra última del mismo acto.
10. Resolver la autoridad de la Mesa Civil sobre la Escalera: `PLANMESA:16` dice consulta no vinculante y el art. 75 inc. 8 le da el presupuesto al Congreso. La Escalera **no** se «vota por Mesa Civil».
11. Un solo dispositivo puede ser «el número uno». Es la Escalera; el Recibo es la puerta.

---

## 4. PLANARCO — el arco de la vida *(ordinal 24)*

**Órgano:** sistema endocrino. No bombea ni filtra: le avisa al cuerpo entero en qué etapa está la persona que tiene enfrente.
**Agencia:** ANAV — Agencia Nacional del Arco de la Vida. *(Corregido desde INAV: 15 de 22 agencias siguen el patrón AN+sufijo.)*
**`category`:** sale de `salud` → `instituciones`.
**Presupuesto:** régimen pleno USD 6.000–11.000M/año **bruto**, declarado como `public_net_cost` neto de la absorción de moratoria, PUAM y PNC por vejez, con tabla de tres columnas (erogación bruta / gasto sustituido / incremental neto). Quince años: 53.000–96.000M. Universo: ~5M de personas de 65+ (fuente PLANSAL), **no** 7,3M, que es el universo de 60+ de PLANREP. Curva demográfica explícita al 2040 (>10M de 60+).

**Aparte y visible:** presupuesto **bajo administración** de la ANAV ≈ USD 50–60.000M/año (stock previsional + PAMI). No es plata nueva, es responsabilidad nueva, y es la partida más grande del Estado argentino. El PLAN no cierra en caja y lo dice.

**Tesis.** Ninguna sociedad decide cómo se nace, cómo se envejece y cómo se muere: lo hereda. Argentina heredó un arco roto en los dos extremos y hueco en el medio. La primitiva nueva es el **arco declarado**: una vida deja de ser una sucesión de trámites inconexos y pasa a ser una trayectoria con estaciones que la república reconoce, financia y acompaña.

**Premisa idealizada.** Qué se le debe a quien nace antes de haber hecho nada para merecerlo; qué experiencias y qué vínculos le garantiza la república a lo largo del arco; cómo se le paga a quien ya dio lo suyo; cómo se acompaña al que se va y al que queda. El sistema previsional, el cuidado prolongado, la herencia y el duelo no son el punto de partida: son las consecuencias operativas de haber contestado bien.

**Arquitectura.** El **Calendario de Umbrales** no es un dispositivo: es la arquitectura. Adentro viven la **Dote de Origen**, el **Umbral de la Llegada** (primeros mil días, licencia de crianza real, crianza compartida vía Pacto de Cuidado), el **Acta de Bienvenida**, **El Pasaje** (cuatro viajes pagos: 12, 18, 45 y 60), el **Alto de los Cuarenta y Cinco**, la **Rampa de Salida** 60–72 con obligación de transmisión, la **Casa de Dos Edades**, la **Casa de Arco** (catorce personas, no ciento cuarenta; en el barrio, no en la ruta), la **Última Palabra** y el **Año del Duelo** con el Acompañante de Umbral.

La **Renta de Arco** va en sección propia, en tres tramos: Piso Vital Universal a los 65 sin requisito de aportes; Tramo Ganado en tres monedas (salario, horas del Libro de Cuidado de PLANCUIDADO, Servicio Cívico); Tramo Común financiado por el FSC y el Fondo Previsional Bastardo.

**Fases.** Contar el arco (0–1, gate duro de PIA) · el piso y el final (1–4) · la rampa y el Instituto (4–8) · los umbrales (6–10) · régimen pleno (10–15). El orden es declarado y no es estético: un país que todavía no le paga bien a sus viejos no tiene autoridad moral para regalarle capital a sus chicos.

**El PLAN declara explícitamente que no se propone mover la fecundidad.**

### Arreglos obligatorios antes de escribir

1. **La Regla de Arco entra dentro de la Escalera de PLANPACTO**, con remisión. No es instrumento paralelo.
2. **Declarar la tipología de rigidez.** La movilidad automática mensual contra canasta del adulto mayor es un *precompromiso indexado*, no una afectación: el LIFO no la agarra. No se suspende — se corrige cambiando la fórmula con el mismo procedimiento agravado con que se creó. Sin esto, el Techo se rompe por un instrumento intocable y lo que cae en su lugar es un escalón de la Escalera, por el solo hecho de ser suspendible. (El modo de falla real del Piso Vital es la licuación, no el ajuste frontal: por eso la movilidad es automática y la fijación discrecional está prohibida.)
3. **Verificar adversarialmente los dispositivos 9 y 10 antes de escribir.** El diseño llegó cortado a los verificadores de la primera vuelta (`17_verif` lo declara), así que la Última Palabra y el Año del Duelo nunca los leyó nadie, y dos veredictos sobre ellos son falsos negativos.
4. **Negociar el FGS con PLAN24CN por escrito.** ARCO le pone tope del 8% a una línea que PLAN24CN declara en 10–20%: es una enmienda unilateral al documento de otro. `audit/05` hueco I-8 ya había marcado el conflicto en abril y pedido documentarlo; nadie lo hizo.
5. **Ponerle piso a la Dote.** Hoy vive del rendimiento real del Fondo Intergeneracional, subordinada a la reserva anti-colapso del DCM. Un derecho universal cuyo monto depende de que un fondo argentino rinda en términos reales es un derecho que falla primero. O monto mínimo en canastas aunque el rendimiento sea cero, o el documento dice que puede ser cero.
6. **La Dote se libera contra evidencia verificable por sistema, no ante Mesa Civil.** Como estaba, era la mejor máquina de punteros del corpus.
7. **El reintegro del Alto:** PLANCUIDADO *carga* la Jornada 6+2 al empleador, no reintegra, así que el mecanismo se rediseña desde cero. Sube al 100% en empresas de menos de 50 — y hay que resolver el acantilado que eso crea en el empleado número 50, en el país donde ese tipo de umbral ya explica media informalidad.
8. **Casa de Dos Edades:** control cada 60 días el primer año y prohibición absoluta de que el conviviente sea apoderado o beneficiario.
9. **PAMI:** los Centros de Vitalidad de PLANSAL reciben la función médica bajo contrato de continuidad de 36 meses. ANAV se queda con la caja y el objeto social; ANVIP con la prestación territorial.
10. **Declarar la sucesión de PLANJUB** con sus seis referencias colgadas en PLANCUL (líneas 416, 421, 484, 534, 536, 682). El fantasma no era PLANVEJ.
11. **El Umbral del Legado lo ejecuta la ANAV.** PLANCUL no tiene agencia por diseño y no puede.
12. **Blindar la Capa de Forma.** Modo de falla más probable: PLANARCO se ejecuta como reforma previsional y el arco no se construye nunca. La Capa de Sostén (Piso Vital, Rampa, ANAV) es ley + pago universal + cinco millones de beneficiarios = blindaje de capa 4, intocable. La Capa de Forma (el Pasaje, el Alto, la Dote, las Casas, los Acompañantes) es 100% partida discrecional, sin piso, sin constituencia el día del recorte, y programada en Fase 3 — 2033-2037, después de por lo menos un cambio de gobierno. **Nadie tiene que derogar PLANARCO para matar el arco: alcanza con no ejecutar la Fase 3.** Es el patrón que el propio corpus documenta (al INTA le sacaron el 60% sin derogarle la ley; al CONICET lo vaciaron sin cerrarlo). El documento tiene que traer el mecanismo que lo impide.
13. Emitir el par recíproco ARCO ↔ PACTO en los dos documentos.

---

## 5. PLANPREGUNTA — el conocimiento nuevo *(ordinal 25)*

**Órgano:** células madre. Tejido indiferenciado capaz de volverse cualquier órgano cuando aparezca un problema que ninguno de los otros previó.
**Agencia:** ANCON.
**Código:** **PLANPREGUNTA**, no PLANCYT. El corpus nombra la primitiva y no la cartera (PLANTALLER, PLANMESA, PLANCUIDADO, PLANMEMORIA), la unidad de organización del PLAN *es* la Pregunta Nacional, «CYT» hereda la sigla del ministerio que el PLAN dice no ser, y el corpus ya reservó esas letras para «Ciencia, Tecnología e **Industria** Soberana» — pata industrial que este diseño no cubre.
**Presupuesto:** USD 1.400–2.400M/año en régimen; 16.500–26.000M a quince años.

**Tesis.** Argentina no tiene un problema de talento: tiene un problema de puntería. La unidad de organización deja de ser la disciplina y el paper y pasa a ser la **Pregunta Nacional** — una ignorancia declarada, numerada y pública, con dueño de sistema, costo declarado de no saberla, y cierre que se verifica en el barro.

**Premisa idealizada.** Cómo un pueblo administra su propia ignorancia, sabiendo que la mayoría de la investigación no se aplica nunca, que la minoría que se aplica cambia todo, y que nadie puede saber de antemano cuál es cuál.

**Dirección del fundador, vinculante:** cada línea de investigación atada a un objetivo preciso con efecto beneficioso sobre un componente del sistema — tierra, agua, salud, flora, fauna. *El divague mental desaparece cuando fijamos el objetivo.* Y el eje de soberanía: cómputo e IA propios, servidores y data centers propios, **no operamos bajo mandatos ajenos** — como criterio de arquitectura, no como consigna.

**Dispositivos (seis de vidriera).** El **Censo de Ignorancia**, bidireccional (toda ignorancia depositada vuelve con respuesta escrita y firmada, y cada Pregunta lleva padrón de **Testigos** que están en el acta de cierre). La **Pregunta Nacional** sobre **nueve verticales**: los siete naturales más **República** (el país como objeto de estudio: instituciones, conflicto, lengua, memoria, vínculo, creencia) y **Evaluación de mandatos**. La **Prueba de Barro**: nada está descubierto hasta que funciona doce meses en manos de alguien que no lo inventó. El **Banco de Materia Viva** (ocho nodos, con ANLIS Malbrán adentro — un laboratorio que en 46.234 líneas no aparecía nunca). El **Sello Abierto**. Y el circuito suelto, nombrado por su justificación y no por su mecánica: el **Seguro contra lo Imprevisto**, 10% sorteado sin objetivo, con audiencia pública a los tres años.

Fuera de la vidriera pero en el documento: **Cátedra Portátil** y **Cátedra de Regreso** en una sola sección (el término «Banca» ya significa sector bancario en el corpus), el **Turno de Máquina** sobre ArgenCloud y LANIA, los **Modelos de Órgano**, y la **Serie Centenaria**: entre siete y doce mediciones legalmente irreductibles a cien años — que es lo que vuelve civilizatorio a un aparato de conocimiento y no presupuestario.

**Fases.** El registro antes que la plata (2029–30) · las primeras cien Preguntas (2030–32) · la Cátedra y el Regreso (2032–35) · régimen pleno (2035–40) · la exportación del método como Stack de PLANGEO (2040+).

### 5.1 La fuente — decisión tomada

**Se reabre el split del FSC de PLANTER.** El instrumento no es un porcentaje del PBI: el diagnóstico más fuerte del propio PLAN es que el país legisló 0,39% y ejecuta 0,16%, o sea que ya probó ese instrumento y lo incumplió sin costo.

Pero la fuente elegida en primera vuelta —«fracción fija de regalías»— **está comprometida al 100%, dos veces**: `PLANTER:163` reparte la *totalidad* de las regalías en un protocolo cerrado (40% DCM / 20% territorios / 15% Fondo Intergeneracional / 15% restauración / 10% ANTSPO) y `PLANEN:148` gira esas mismas regalías (USD 2.000–5.000M) al Fondo Soberano Bastardo de PLANMON. No hay fracción libre que girar.

Por la regla de fuentes (§2.5), la salida es reabrir el split de PLANTER **explícitamente**, en el documento de PLANTER y en el de PLANPREGUNTA, con el nuevo reparto escrito y firmado en los dos. Reabrir un protocolo cerrado tiene que costar, y ese costo es el que hace honesta la decisión.

### Arreglos obligatorios antes de escribir

1. Escribir el nuevo split del FSC en PLANTER y en PLANPREGUNTA, con los porcentajes de los cinco destinos existentes recalculados.
2. **Cuantificar la afectación y meterla en la tabla del Techo.** Cero no es un número honesto: sacarle el piso al PLAN no ahorró 0,45 puntos, mudó la rigidez de la columna que el Techo mide a la que nadie suma. Y consolidar el 0,20% del LANEF, que se perdió al mudar el vehículo: PLANEN se queda en 0,70%.
3. **Corregir el sorteo:** PLANPREGUNTA le pide a PLANJUS un sorteo estratificado que PLANJUS no tiene (`§400`: sorteo puro). Es el mismo error que en PLANPACTO se corrigió y acá no.
4. **Bajar «Evaluación de mandatos» de obligación a invitación**, o negociarla con los 25. Como está, es una promoción unilateral sobre 25 documentos que ninguno presupuestó.
5. **Resolver la Mesa de CyT Soberana:** el canon la pone en tercera ola y PLANPREGUNTA la necesita en Fase 0. Y el choque de la Prueba de Barro con el ciclo LDEA de PLANMESA, que exige lo contrario.
6. **Modo degradado declarado** en la dependencia con PLANDIG, si el Estadio B no llega a tiempo. La frontera con PLANDIG es por criterio de dato, no por adjetivo.
7. **Cerrar la captura por el establishment científico** (modo de falla número uno): incompatibilidad de autoría —quien escribe una Pregunta no dirige el equipo que la contesta— y habilitación de jurados fuera de ANCON.
8. **Cupo del 5–8% de Cátedras para Credencial Consolidada sin trayectoria académica:** el baqueano, la partera, el productor.
9. **Capítulo de doble uso y bioseguridad.** No tenía una sola línea, con un biobanco que presta cepas y un Sello que publica datos crudos el mismo día.
10. **La Pregunta de Adopción** («¿por qué no usamos lo que ya sabemos?»), que es donde está el déficit argentino más caro.
11. Corregir la cita de auditoría fabricada: el código lo bautiza `ANALISIS_CONEXIONES_22_PLANES.md` §9.4, no `audit/05`.
12. Emitir el par recíproco FOCO ↔ PREGUNTA: el Desmontaje y el Censo de Ignorancia son la misma capacidad cívica a dos escalas, y el Sello Abierto publica dentro del Acervo.

---

## 6. PLANFOCO — la palabra pública y la mirada *(ordinal 26, el único sin bloqueantes)*

**Órgano:** la mirada.
**Agencia:** ANBAC.
**Presupuesto:** USD 300–500M/año en régimen; 3.000–5.000M a quince años. Por debajo de PLANTALLER, no por encima de PLANJUS. Su piso constitucional va a Visión 2040+.

**Tesis.** La palabra pública no se arregla poniéndole reglas al que habla. Se arregla cambiando adónde mira el país y construyendo el lugar donde esa mirada aterriza. **El Estado no regula, no licencia, no censura y no le toca un pelo a ningún medio**: se aplica una sola disciplina a sí mismo, sobre su propia billetera.

**Premisa idealizada.** Qué construiríamos teniendo prohibido regular lo que alguien puede decir y prohibido decidir lo que alguien debe mirar. La respuesta es un destino, un canal y un espejo.

**Dirección del fundador, vinculante:** los dueños de los medios no van a cambiar; la única forma de detenerlos es quitarles su línea vital, la atención. La atención es decidir dónde uno gasta su vida. Hacen falta canales nuevos, y hoy todos pueden ser un canal. **La restricción es absoluta: ningún dispositivo puede controlar, licenciar ni castigar contenido.**

**Dispositivos.** La **Pauta Ciega** — el mecanismo por el cual el Estado argentino pierde para siempre la capacidad de elegir a qué medio le da un peso, **hasta extinción** (pagar por «alcance verificado» es subsidiar al incumbente). La **Biblioteca Viva** — que no es invención de este PLAN: es el Commons Atencional que `PLANDIG §9.4` ya consagró como derecho y su TABLA 20 nunca presupuestó; PLANFOCO le pone la plata, el acervo y el bibliotecario. **La Antena** — la dotación de canal propio para cualquier argentino que la pida (ver arreglo 2). **La Cartelera** (territorio y fecha, sin ranking). **El Acervo Abierto** (setenta años de audiovisual estatal, hoy sin custodio). **La Sala Común** (la planta de los medios públicos deja de programar y se presta por sorteo). La **Alfabetización de la Mirada y el Desmontaje**, que es el nervio del PLAN. Y **La Procedencia**: el Estado no dictamina qué es verdad; garantiza que todo material producido con plata pública lleve firma y trazabilidad verificable, y publica el estándar para que cualquiera lo adopte.

El **Presupuesto de Vida** se degrada a instrumento de medición: es `PLANDIG §9.6`, no un dispositivo propio.

**Fases.** La pauta se vuelve ciega (2027–28, no pide permiso a nadie) · las primeras mil sedes (2029–31) · la red (2031–34) · régimen y evaluación (2034–41).

### Arreglos obligatorios antes de escribir

1. **Rehacer la aritmética de la pauta con extinción.** Dos correcciones de la primera vuelta usan dos aritméticas distintas: el techo ahora va hasta extinción (liberación creciente hasta ~450M), pero la red se dimensionó (1.200–1.500 sedes) contra los ~280M que liberaba el cronograma viejo, que se detenía en 170M. O la red crece a ~2.000 sedes, o hay 170M/año sin destino declarado. Y hay que decir qué pasa durante la rampa de seis años, en la que la red se construye contra plata todavía no liberada y sin piso.
2. **Reponer La Antena con su línea presupuestaria** (25–45M/año). Está en el diseño crudo y desapareció del corregido sin que nadie declarara la baja. Es el dispositivo que implementa literalmente la dirección del fundador —*hoy todos pueden ser un canal*— así que se repone, no se da de baja.
3. **Corregir 3.000 → 1.200–1.500** en la arista con PLANRUTA y en todo el texto.
4. **Costear La Procedencia**, que entró sin plata.
5. **El umbral de quién cuenta como medio va en la ley**, no en resolución de ANBAC. Ahí estaba escondida la facultad de licenciar.
6. **Contratación de bibliotecarios por concurso ciego más sorteo**, con la misma disciplina de la Pauta Ciega aplicada adentro. Era la superficie clientelar más grande del corpus.
7. **Las Mesas de Materia locales de PLANMESA deciden las compras.** Una agencia nacional eligiendo qué se lee en 1.200 barrios es el ministerio de la verdad que este PLAN existe para no ser.
8. **El Acervo se parte:** manifiesto y hash en los siete nodos de PLANMEMORIA; bitstream en la nube soberana.
9. **La Beca del Desierto** se territorializa como mediador-cronista de la Biblioteca local, no como dispositivo nacional.
10. **Crear el fuero que la Cartelera necesita dentro de PLANJUS:** Panel de Legalidad de Publicación, sin baja previa.
11. **PLANEDU dicta el Desmontaje.** Repara una referencia cruzada rota: PLANDIG afirmaba que PLANEDU ya lo hacía y el término no existe en PLANEDU.
12. **PLANCUL conserva su parasitismo y su presupuesto cero.** La Biblioteca es huésped, no patrón.

---

## 7. Lo no humano — diez huecos, diez huéspedes, cero PLANes nuevos

| Hueco | Huésped | Sección | Dispositivo eje |
|---|---|---|---|
| El mar como sistema vivo | PLANTER (+PLANEB) | 8.3 nueva + reescritura de 3.6 | Síndico del Mar Argentino (colegiado de 7) |
| La milla 201 | PLANGEO (+PLANSEG, PLANTER) | 20.4 nueva | Doctrina de Stock Único |
| La Antártida como bioma | PLANGEO | 20.5 nueva | Posición Argentina de Krill en CCAMLR |
| El delito contra lo vivo | PLANJUS (+PLANTER) | Jurisdicción de lo Vivo | Panel Ambiental JUS-A + figura de ecocidio |
| Nadie custodia lo vivo / restauración | PLANREP (+PLANTALLER, PLANSEG) | Rama 3 Ampliada | Cuerpo de Guardianes con escalafón |
| Animales de producción | PLANISV | 6.7 nueva | Piso de Vida Animal (argumento agronómico) |
| El aire | PLANSAL (+PLANEN, PLANDIG) | Raíz 11 Ampliada | Red Respirar: 3.000 sensores, uno por Centro de Vitalidad |
| Salto de especie / zoonosis | PLANSAL | El Salto de Especie | Vigilancia de Salto por la red que ya existe |
| Humedales sin ley | PLANAGUA | 5.16 (PISTA DERECHOS) | Ley de Presupuestos Mínimos + Inventario primero y solo |
| Nadie está formado para sindicar | PLANMESA (+PLANEDU) | Credencial de Materia Ambiental | Registro Público de Síndicos de lo Vivo |

**La Doctrina de la Sindicatura Viva** vive en PLANTER —que ya tiene la frase madre, *la tierra se posee a sí misma, los humanos somos síndicos no dueños*— y se enuncia en cuatro mandamientos *ex ante*:

1. Lo vivo no se posee, se sindica.
2. **El síndico sigue al ser, no al lugar.** La sindicatura de PLANTER es territorial y no puede representar a un cardumen, un ave, un polinizador, un patógeno ni una pluma de humo.
3. Ninguna decisión sin testigo obligado, y el silencio del síndico no es consentimiento: sin dictamen, no hay decisión.
4. El daño se repara en especie, y prueba quien interviene.

Excepcionabilidad sólo por ley con dos tercios de cada cámara, igual que el Doble Desplazamiento de PLANMOV.

**Costos declarados y aceptados.** El animal doméstico, de compañía, de exhibición y de laboratorio **no tiene puerta de entrada**: PLANISV 6.7 cubre al productivo con argumento agronómico y ahí termina. Y **el clima no es dueño de nadie**: repartido entre PLANISV, PLANEN, PLANAGUA y PLAN24CN, nadie contesta cuánto emite el país ni contra qué. Es el hueco vecino más grande y probablemente el próximo pedido. Los dos se escriben con todas las letras en vez de forzarlos adentro de un huésped donde quedarían cojos.

---

## 8. El grafo

**69 aristas nuevas: 34 `requires` y 35 `provides`. Faltan los 69 espejos** — V-REF-01 no se corrió y va a fallar 69 veces. No es que falte alguno: cada `requires` necesita su `provides` en el documento del otro PLAN, y los 35 `provides` son hoy espejo de nada.

**Dos aristas rompen el grafo con ERROR y bajan a prosa:** `PLANPACTO --provides--> PLANRUTA` y `PLANFOCO --provides--> PLANRUTA`. PLANRUTA no es nodo de `PLAN_NODES` (22 entradas) y V-REF-03 dispara. La alternativa —PLANRUTA como ordinal 0— obligaría a tocar `EXPECTED_PLAN_COUNT` y a decidir si `PLAN_NODES.length` pasa a 27 con `thematic_count` en 26. **No se hace.**

**Los alimentadores `.md` no pueden ser extremo de arista.** `SOURCE_OF_FUNDS_LEDGER.md` y `PRESUPUESTO_CONSOLIDADO_BASTA.md` van en la prosa como fuente documental. El Libro Mayor depende de PLANDIG y PLANREP; la Escalera, de PLANMESA y de los PLANes con piso.

**Dos pares recíprocos hay que emitir en los dos documentos de cada par:** ARCO ↔ PACTO (el 45–50% del presupuesto nacional entra al Techo y lo administra otra agencia — es la dependencia más grande del diseño) y FOCO ↔ PREGUNTA.

**PLANDIG se vuelve el punto único de falla del ecosistema.** Los cuatro nuevos lo requieren con nature CRITICAL y type TECHNICAL. Pasa de ser uno de 22 a ser el sustrato de 26, con un cronograma de estadios que ya estaba tenso. **Cada uno de los cuatro declara modo degradado.**

**Entre los cuatro, el SPOF es PLANPACTO, y es el caso peligroso:** provee CRITICAL/FINANCIAL a PLANVIV, PLANCUIDADO, PLANEDU y PLANRUTA, y su Fase 2 depende de 24 ratificaciones que el país no juntó en treinta años. Por eso el corte Fase 0 / Fase 2 va en el cuerpo del documento, no en una nota al pie.

**PLANARCO es el nodo más dependiente del corpus:** seis `requires` CRITICAL entrantes (CUIDADO, MON, TER, DIG, SAL, REP). Máxima criticidad entrante más máximo presupuesto administrado. **PLANFOCO es el más desprendible:** dos `requires` críticos y una Fase 0 que no depende de nadie.

---

## 9. La migración del canon

### 9.1 Lo primero que se rompe

`v2/scripts/content/__tests__/split-documento-plan.test.ts:101` hace `expect(archivosCorpus).toHaveLength(23)` leyendo el directorio real, y `v2-ci.yml` se dispara con paths `Iniciativas Estratégicas/**`. **Copiar el primer `.md` nuevo al taller pone el CI en rojo.**

### 9.2 Conteos hardcodeados a subir (nueve lugares ejecutables)

- `SocialJusticeHub/shared/validation-engine.ts:8` — `EXPECTED_PLAN_COUNT = 22`
- `v2/scripts/content/verify-planes-index.ts:78-79` — el único 22 de `pnpm planes:check`
- `v2/scripts/content/__tests__/planes-sources.test.ts:30-33, 42-46, 50-51` — incluye el invariante de ordinales contiguos
- `v2/scripts/content/__tests__/validar-campos-planos.test.ts:53-54`
- `v2/apps/web/src/lib/__tests__/plans-registry.test.ts:11-12`
- `v2/apps/web/src/pages/Planes/__tests__/IndicePlanes.test.tsx:17-19, 22-26`

### 9.3 Lo que no se ve y se publica

**45 líneas** `> **CANONICAL_ARCHITECTURE:** 22 thematic + PLANRUTA protocol — este PLAN sigue siendo **uno** de los 22` embebidas en el taller, que se derivan a la «Ficha del expediente» de cada `.mdx`. Sin `sed` + `pnpm planes:migrar`, los 26 documentos publicados van a seguir afirmando que son 22. El cuerpo de PLANRUTA lo repite tres veces más (líneas 11, 32, 48) y eso se lee de entrada en `/planes/planruta`.

Un número mal se propaga a cuatro archivos: `strategic-initiatives.ts:1786` (summary de PLANGEO, «son 22 PLANes simultáneos») → `v2/scripts/content/planes-sources.ts:153` → `planes-index.generated.ts` → `content/planes/PLANGEO.mdx`. Ídem el summary de PLANRUTA, duplicado a mano en `extraer-fuentes-planes.ts`.

### 9.4 El trabajo real

Está en `SocialJusticeHub/shared/strategic-initiatives.ts`: ~170 líneas de ficha estructurada por plan (summary, content HTML, fases, KPIs con milestones, mainRisk), o sea **~680 líneas para los cuatro**. `extraer-fuentes-planes.ts` aborta sin summary, y toda la UI de v1 depende de ahí.

**Cuarta copia driftada:** `SocialJusticeHub/client/public/docs/` es copia manual y ya está desfasada (PLANMOV 1.114 líneas contra 2.206 en el taller; falta PLANRUTA entero). Si un PLAN nuevo entra a `strategic-initiatives.ts` y no se copia el `.md`, `IniciativaDocumento.tsx` tira 404.

### 9.5 Prosa en la UI y en el contenido

**v1:** `Footer.tsx:85` (aparece en todas las páginas), `KitDePrensa.tsx` (8 lugares, el peor concentrado, incluye la enumeración de los 22 dominios), `Home.tsx` 45/159/519, `LaVision.tsx` 282/291/299/342, `UnaRutaParaArgentina.tsx` 615/925/1093 (uno en letras), `Resources.tsx` 146/244, `ElMapa.tsx:291`.
**v2:** `PlanesGrid.tsx` (22 códigos de stub hardcodeados que no existen en el canon; ya contradice a `/planes`), `UnaRutaParaArgentina.tsx:15`, `Bienvenida.tsx:23`.
**Contenido:** `Ensayos/presidencia, democracia y belleza/04-arquitectura.md` 180/198/213/219 — **keystone: editar la fuente con mano ligera y re-generar**, su gemelo EN, `00-ANALISIS.md`, `v2/content/cronica/04-la-cabecera-de-puente.mdx:20` (en letras).

### 9.6 Dos trampas

`PlanEditor.tsx:8` es un glosario normativo con `term: 'veintidós PLANes'` que le va a marcar al autor el conteo correcto como violación. Y `CLAUDE.md:109` + `BRAND_MEDIA_PACKAGE.md` (5 copias del boilerplate): si no se actualizan, **todo agente futuro reintroduce el 22**.

### 9.7 Orden

1. Autoridad de papel primero, porque lo dice ella misma: `PLAN_REGISTRY.yml` (`thematic_count` 22→26, `total_documents` 23→27, levantar `freeze_status: ACTIVE` con nota de quién y por qué), `DEPENDENCY_GRAPH.yml:6`, y `COVERAGE_GAPS_ASSIGNMENTS.md` retirando por nombre los sub-mandatos reasignados.
2. `arquitecto-data.ts` (4 nodos + 69 aristas + TIMELINE_PHASES) y `strategic-initiatives.ts`, más `validation-engine.ts:8`.
3. Los cuatro documentos al taller **en el mismo commit** que los conteos de los tests.
4. `planes-sources.ts` a mano → `pnpm planes:migrar`.
5. `sed` sobre las 45 líneas de cabecera + cuerpo de PLANRUTA + los dos summaries → re-derivar.
6. Barrida de UI v1/v2, ensayos desde la fuente, `CLAUDE.md`, brand package, glosario del editor.
7. Copia a `public/docs/`.

### 9.8 Ordinales

**Se anexan al final: 23, 24, 25, 26.** Los expedientes 01..22 no se mueven, las URLs son estables porque `findPlanBySlug` matchea por código, y `PLAN_COUNT` se recalcula solo en los tres lugares donde se deriva, así que toda la prosa interpolada de v2 se actualiza sola. Reordenar en el medio cuesta 20+ valores de `ordinal`, rompe el invariante de contigüidad durante toda la transición y corre los números de expediente visibles.

**El H2 del cuerpo:** el orden de creación y el estratégico están desfasados en 1 desde PLANRUTA, así que PLANMOV ya es «Vigésimo Tercer Mandato» con ordinal 22. Los nuevos son **Vigésimo Cuarto, Vigésimo Quinto, Vigésimo Sexto y Vigésimo Séptimo** — nunca Vigésimo Tercero.

### 9.9 El freeze

`COVERAGE_GAPS_ASSIGNMENTS.md` (26 de abril de 2026) declara *«Freeze sigue activo. Sin PLANes nuevos»*. Se levanta por la vía que el propio documento habilita: la **regla 3**, gate de spin-off cuando un sub-mandato supera 1,5× el presupuesto del huésped. **PLANARCO sobre PLANCUIDADO da 1,46–1,88×: pasa.** Hay que correr el mismo test para los otros tres antes de escribir el acta de levantamiento.

---

## 10. Decisiones tomadas (registro)

| # | Decisión | Elegida | Por qué |
|---|---|---|---|
| 1 | ¿Cuántos PLANes nuevos? | Cuatro | El pacto fiscal entra ahora, no después |
| 2 | ¿Lo no humano es PLAN? | No | Diez huecos, diez huéspedes, cero agencias nuevas |
| 3 | Código del PLAN de conocimiento | **PLANPREGUNTA** | El corpus nombra la primitiva, no la cartera |
| 4 | Títulos evocativos | Los tres cambios de la verificación; ARCO queda | Los tres nuevos acusan al lector, como los mejores del corpus |
| 5 | Orden de escritura y ordinales | PACTO 23 → ARCO 24 → PREGUNTA 25 → FOCO 26 | La Fase 0 de PACTO no pide permiso; ARCO no se costea sin la Escalera |
| 6 | Segunda vuelta adversarial | Sí, sobre los cuatro | Encontró que el Techo desbordaba y que las correcciones habían roto 12 cosas |
| 7 | Piso constitucional único | **2,40% del gasto primario consolidado** | Tres caminos independientes llegan ahí; el %PBI es procíclico |
| 8 | La Escalera | 8 escalones con los dos cortes grandes | PLANSEG blindaba gasto que ya se ejecuta; PLANVIV se autofinancia por Housing OS |
| 9 | Fuente de PLANPREGUNTA | **Reabrir el split del FSC de PLANTER** | Las regalías están comprometidas al 100%, dos veces |
| 10 | Regla de Arco | Un solo instrumento, eje dentro de la Escalera | Dos reglas de reparto se contradicen en la primera recesión |
| 11 | Aristas a PLANRUTA | Bajan a prosa | PLANRUTA no es nodo del grafo; V-REF-03 dispararía |
| 12 | La Antena (PLANFOCO) | Se repone con su línea | Implementa literalmente la dirección del fundador |
| 13 | Sigla de PLANARCO | ANAV, no INAV | 15 de 22 agencias siguen el patrón AN+sufijo |
| 14 | `category` de PLANARCO | `instituciones` | Sale de `salud`, sin tocar el enum |

---

## 11. Tramos — esto no es un solo plan de implementación

El alcance completo son cuatro documentos de escala de corpus (~8.000 líneas), diez secciones nuevas en PLANes existentes, 69 aristas de grafo y una migración que toca 68 lugares. **No entra en un plan de implementación y no debe forzarse.** Se parte en cinco tramos, cada uno con su propio plan y su propio cierre:

| Tramo | Alcance | Depende de | Se puede empezar |
|---|---|---|---|
| **A — La cuenta** | Corregir los 4 `constitutionalFloor` mal cargados, reconciliar la cifra de `PRESUPUESTO_CONSOLIDADO:193` a 22 agencias, correr el gate de spin-off de la regla 3 para los cuatro, levantar el freeze con acta | nada | ya |
| **B — PLANPACTO** | El documento (ordinal 23) con sus 11 arreglos, incluida la Escalera que los otros tres necesitan | A | tras A |
| **C — PLANARCO** | El documento (ordinal 24) con sus 13 arreglos, más la verificación adversarial pendiente de los dispositivos 9 y 10 | B (la Escalera) | tras B |
| **D — PLANPREGUNTA y PLANFOCO** | Los dos documentos (25 y 26); el nuevo split del FSC se escribe también en PLANTER | B (el split y la regla de fuentes) | tras B, en paralelo con C |
| **E — El canon y lo no humano** | Las 10 secciones nuevas en PLANes existentes + la Doctrina de la Sindicatura Viva + toda la migración de §9 | B, C, D | último |

El tramo A es independiente de la decisión de escribir los PLANes: arregla errores que el canon ya tiene hoy, y conviene hacerlo aunque todo lo demás se posponga.

---

## 12. Lo que queda sin resolver

**Incertidumbre legítima de diseño — se escribe declarándola, no se espera:** las 24 ratificaciones de la ley-convenio (por eso PLANPACTO tiene que valer aunque la Fase 2 no llegue), la refundación del PAMI, el riesgo ISDS del RIGI, la sustitución de Ingresos Brutos, y si la fecundidad se mueve o no (PLANARCO ya declara que no se lo propone).

**Tarea pendiente con dueño y fecha, no incertidumbre:** correr V-REF-01 sobre las 69 aristas; cargar los 4 nodos en `arquitecto-data.ts` y corregir los 4 mal cargados; escribir la fila de `READINESS_GATES_ADVERSARIAL.md` de PLANPACTO; correr el gate de spin-off de la regla 3 para los otros tres; levantar el freeze con acta; clasificar los cuatro presupuestos según las clases de `SOURCE_OF_FUNDS_LEDGER.md`; verificar adversarialmente los dispositivos 9 y 10 de PLANARCO, que nunca los leyó nadie.

**Y lo honesto:** los cuatro diseños se verificaron **contra el canon, no contra la realidad**. Ningún economista fiscal, ningún previsionalista, ningún gerontólogo y ningún constitucionalista leyó nada de esto. Todos los agregados fiscales de esta spec son reconstrucción propia sobre ejecución de Hacienda, OPC e IARAF/ASAP al cierre de 2025. **El orden de magnitud aguanta; los decimales no**, y los documentos tienen que decirlo en su ficha.

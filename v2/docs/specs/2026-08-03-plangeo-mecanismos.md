# PLANGEO — Mecanismos: la defensa que no necesita enforcement

**Fecha:** 2026-08-03
**Documento objetivo:** `Iniciativas Estratégicas/PLANGEO_Argentina_ES.md` (ordinal 12, v1.1, 1.570 líneas, 25 secciones)
**Salida:** un bloque nuevo de tres secciones (S26–S28), once ediciones forzadas sobre secciones existentes, y una entrada de deuda propia
**Plan de implementación:** `v2/docs/plans/2026-08-03-plangeo-mecanismos.md` (9 tareas; arranca por las verificaciones, no por la guardia)
**Verificación:** `v2/docs/specs/2026-08-03-plangeo-verificaciones.md` — **cerrada 2026-08-03**, diez hechos contra fuente primaria. Ocho verdes, una verde con corrección de fondo (V7), una ámbar (V10). **Leerla antes que esta spec:** cambió el diseño de la S27
**Precedente de estilo:** `v2/docs/specs/2026-08-03-plansus-marcos-de-atraccion.md`

> **Tesis.** PLANGEO tiene una doctrina de plataforma excelente y una postura de coerción dura
> que son cinco filas de presupuesto. Cada vez que el documento llega al momento de decir qué
> hace Argentina cuando el ataque es material, la respuesta es comprar capacidad —USD 500-800M
> en patrullaje naval, USD 200-400M en un Comando de Ciberdefensa con «capacidad ofensiva
> disuasoria»— y Argentina no puede pagar ninguna de esas peleas ni ganarlas si las pagara.
> **Un país que no puede costear enforcement tiene que diseñar reglas que no lo necesiten.**
> Los ocho mecanismos de este bloque comparten una sola forma: el adversario, actuando en su
> propio interés, ejecuta la defensa argentina. No hay funcionario que pueda ceder bajo presión,
> porque la defensa no vive en una decisión — vive en un contrato, en un dato público o en una
> regla de compra. El octavo protege a los otros siete de lo único que puede desarmarlos:
> el paso del tiempo argentino.

---

## 1. El hueco

PLANGEO dedica veinte secciones a la capa blanda —doctrina de plataforma, siete Stacks, Red Soberana, navegación US-China, siete «ideas sin frontera»— y la trabaja bien. La capa dura es esto, completo:

| Dónde | Qué dice | Qué falta |
|---|---|---|
| S18.1 | Tabla de cinco líneas de inversión en defensa (USD 1.300-2.200M a 10 años) | Ningún mecanismo. Es un presupuesto, no una doctrina |
| S18.2.4 | «Capacidad ofensiva disuasoria»: Argentina responde un ciberataque con uno equivalente | Aspiracional y probablemente falso. Argentina no gana esa escalada contra ningún actor que la ataque en serio |
| S11 | Mapa de fricción: tres tablas de amenazas con «contramedida principal» | Las contramedidas remiten a la Red Soberana o a «publicar evidencia». Ninguna es un mecanismo ejecutable |
| S22 | Cinco protocolos de falla | Cuatro de los cinco terminan en «publicar» o «movilizar aliados» |
| S17.4 | Desacople gradual del FMI en tres fases | Nada sobre jurisdicción de la deuda. **La palabra «buitre» no aparece en PLANGEO ni en ningún PLAN del corpus** |

Y el hueco de fondo: **el documento no distingue entre un adversario al que hay que vencer y un adversario al que hay que volver no rentable.** Trata todo ataque como una pelea que Argentina tiene que estar en condiciones de dar. La mayoría no lo son.

**Ausencias verificadas en los 27 documentos del corpus** (`grep -il` sobre `Iniciativas Estratégicas/PLAN*_Argentina_ES.md`):

| Término | Apariciones | Nota |
|---|---|---|
| `ABACC` | **0** en todo el corpus | El activo institucional más singular que tiene el país no está escrito en ninguna parte |
| `buitre`, `Griesa` | **0** en todo el corpus | `holdout` aparece solo en PLANMON |
| `P&I`, aseguradores marítimos | **0** | `asegurador` aparece 3 veces en PLANGEO, siempre como sector amenazado, nunca como palanca |
| `monocultivo` tecnológico, `proveedor único` | **0** en PLANGEO | `monocultivo` existe en seis PLANes, siempre agrícola |
| `INVAP`, `SAOCOM` | **0** en PLANGEO | Están en PLANEN, PLANDIG, PLANISV, PLANMON, PLAN24CN, PLANMESA, PLANMEMORIA — pero PLANGEO, que es el PLAN de la proyección exterior, no los nombra |

Esa última fila es el diagnóstico en una línea: **el PLAN encargado de proyectar a la Argentina hacia afuera no menciona ninguna de las capacidades reales que la Argentina tiene para proyectar.**

---

## 2. El principio de diseño

Un mecanismo entra a este bloque si cumple las cuatro condiciones. Si falla una, no entra.

1. **No requiere enforcement financiado.** Nadie tiene que patrullar, litigar ni sancionar para que funcione.
2. **No requiere que un tercero se porte bien.** No depende de buena voluntad, de un voto en un foro multilateral ni de que un aliado aguante presión.
3. **No tiene un punto de cesión humano.** No hay un funcionario argentino al que se pueda llamar por teléfono para desactivarlo. Está en el instrumento, no en la voluntad.
4. **El costo de atacarlo lo paga el atacante.** No es simetría de daño — es que la acción hostil sea la que dispara el costo, del lado de quien la ejecuta.

De esas cuatro, la tercera es la que más importa y la que el corpus no tiene escrita en ninguna parte. **PLANGEO S22.3 blinda a ¡BASTA! contra el cambio de gobierno, pero nada blinda al funcionario contra la llamada de un martes a la tarde.** La captura de una política pública casi nunca es un decreto: es una serie de cesiones chicas que nadie registra. Un mecanismo que vive en un contrato no cede porque no tiene con qué.

**La condición 3 tiene una segunda cara, temporal, y es la que casi se nos escapa.** Un mecanismo sin punto de cesión humano sigue teniendo un punto de cesión *político*: el gobierno que viene. Cuatro de los siete anteriores —el commons antártico sobre todo— solo valen si se sostienen dos décadas, y sostener algo dos décadas es precisamente lo que la Argentina no hace. De ahí sale el octavo, la S26.7, que no es un mecanismo más al lado de los otros: **es el que hace que los otros duren.**

**Corolario presupuestario.** PLANGEO es `budget_class: XS`, `phase: research-only` en `PLAN_REGISTRY.yml`, y la cabecera del documento lo declara sin presupuesto operativo. Ese no es un obstáculo para este bloque — **es su argumento.** Siete de los ocho mecanismos tienen costo marginal cercano a cero porque son normas, cláusulas o datos. El único con costo de capital real (la constelación de monitoreo del S27.1) cuesta una fracción de la línea naval de USD 500-800M que ya está presupuestada en S18.1, y la reemplaza.

---

## 3. Qué es nuevo y qué ya está

El bloque no puede presentarse como si PLANGEO no tuviera nada. Tiene. La honestidad sobre el solapamiento es parte del diseño, porque determina si cada pieza es sección nueva o edición:

| Mecanismo | Lo que PLANGEO ya tiene | Lo genuinamente nuevo |
|---|---|---|
| Mar Transparente | S19.3.2 (monitoreo satelital + AIS + drones) y S19.3.4 (trazabilidad blockchain PLANISV) | **La capa aseguradora.** El certificado gratuito como equilibrio separador y el feed abierto como estándar de suscripción. PLANGEO tenía el sensor y el sello; le faltaba quién aplica el castigo — y la respuesta es que no lo aplica Argentina |
| Ushuaia | S19.3.1 y S20.1.1 (hub logístico austral) | **El commons de datos antárticos.** S5 ya tiene el reloj 2048 y «ciencia como soberanía»; nunca dice dónde vive el dato. Alojarlo es la diferencia entre producir ciencia y ser la infraestructura de la ciencia ajena |
| Cláusula Espejo de inversión | S21.4 (El Anticuerpo: think tanks, sociedad civil, diáspora) | El Anticuerpo se construye a diez años y depende de voluntad ajena. **El inversor ya instalado no hay que construirlo ni convencerlo: hay que escribirle la cláusula** |
| Segundo Proveedor | S18.2.3 (auditoría de hardware) | Auditar verifica lo que compraste. **La regla anti-monocultivo cambia qué podés comprar** — y se financia sola con la competencia que genera |
| Cláusula del Buitre | Nada. S17.4 habla del FMI, no de jurisdicción de deuda | Todo |
| Registro de Presión | Nada | Todo |
| Anexo ABACC | Nada | Todo |
| Compromiso de Horizonte | S22.3 blinda contra el cambio de gobierno **por vía constitucional** — lento, caro, y reversible por la misma vía que lo creó | La dirección inversa: el compromiso se escribe **hacia afuera**, con contrapartes que no votan en Argentina. Y el test de tres condiciones que impide que sea captura |

Cuatro piezas son extensiones con vuelta de tuerca y van como sub-secciones que **remiten explícitamente** a lo que extienden. Cuatro son nuevas.

---

## 4. La restricción de tranche, y por qué casi no muerde

PLANGEO es `mission_matrix: Ámbar`, `public_visibility: interno`, y la corrección 13.B de su cabecera es taxativa: *«Estado research interno + diplomacia sobria. Sin material confrontacional público en tranche-1/2/3.»* Un bloque titulado «cómo aguantar coerción» es exactamente el tipo de cosa que esa directiva existe para frenar.

**Salvo que estos mecanismos son, casi todos, lo contrario de confrontativos** — y eso no es una casualidad afortunada, es consecuencia directa del principio de diseño. Una defensa que necesita enforcement necesita amenazar. Una que no lo necesita, no.

| Mecanismo | ¿Público? | Por qué |
|---|---|---|
| Cláusula del Buitre | **Sí, y tiene que serlo** | Solo funciona si está en el prospecto. Es derecho contractual, no un acto hostil. Bélgica y Reino Unido legislaron en la misma dirección sin ser sancionados |
| Conversión de jurisdicción | **Sí** | Ídem. Es una condición de emisión, publicada |
| Certificado del Atlántico Sur | **Sí** | Es un bien gratuito que se regala. Difícil de leer como agresión |
| Feed abierto de monitoreo | **Sí** | Es publicación de datos. S21.2 ya consagra «transparencia total como arma» |
| Anexo ABACC | **Sí, y conviene** | Es no proliferación. Refuerza el perfil argentino ante el régimen que más podría castigarlo |
| Ley del Segundo Proveedor | **Sí** | Es una norma de compras públicas. Se justifica por competencia antes que por seguridad |
| Compromiso de Horizonte | **Sí** | Es un contrato de cooperación con publicación de cumplimiento. Lo contrario de confrontativo: la contraparte gana |
| **Registro de Presión** | **No en tranche-1** | Es el único abrasivo del bloque. Publicar que una embajada llamó es un acto diplomático, aunque el instrumento sea un archivo |

Siete de ocho pasan el filtro Ámbar sin modificación. El octavo se escribe completo en el documento y se le pone compuerta declarada de tranche, con la mecánica que PLANGEO ya usa en S11.2 (secuenciamiento) y S22 (protocolos de falla). **No se recorta el diseño para que entre: se declara cuándo entra.**

Escribir el Registro de Presión aunque no se active todavía tiene valor propio, y hay que decirlo en el documento: la pieza que blinda al funcionario contra la cesión silenciosa es la que más tarda en construirse políticamente. Si no está escrita, en tranche-3 no va a existir.

---

## 5. Arquitectura: el bloque MECANISMOS

Tres secciones nuevas, **S26, S27 y S28**, apendadas después de la S25 (Visión 2040) y antes del bloque «INTEGRACIÓN CON EL MARCO ¡BASTA!».

**Decisión de numeración (registrada, no se rediscute):** editorialmente la Visión 2040 debería cerrar el documento y el bloque nuevo debería ir antes. Insertarlo como S22-S24 obliga a renumerar cuatro secciones existentes, y la migración del canon 26/27 de PLANFOCO ya dejó constancia de lo que cuesta eso: ocho remisiones rotas en documentos ajenos por un corrimiento de ordinales. **Se prioriza cero remisiones rotas sobre la prolijidad de la secuencia.** El costo editorial se declara en una nota al pie de la S25.

### S26 — EL CONTRATO COMO DEFENSA

Epígrafe propuesto: *«Un acuerdo bien escrito es un ejército que no come.»*

- **26.1 El problema de la jurisdicción.** Griesa como caso testigo: Argentina peleó bajo *champerty* (NY Judiciary Law §489, que prohíbe comprar deuda **con el propósito de** litigarla) y perdió porque la doctrina exige probar la intención de un tercero, que es inverificable por construcción. El error no fue la estrategia: fue aceptar un terreno donde el hecho decisivo no se puede acreditar.
- **26.2 La Cláusula del Buitre.** Texto tipo para prospecto: el tenedor que adquiere en secundario bajo la par y promueve acción de cobro limita su recuperable al precio pagado más tasa de referencia del período de tenencia. **No prohíbe el mercado secundario ni castiga al tenedor de buena fe** —a quien compró a la par se le paga la par—: elimina la asimetría, no al actor. Ventaja decisiva sobre las leyes anti-buitre de Bélgica (2015) y Reino Unido (2010): esas son de una jurisdicción y se esquivan litigando en otra; **la cláusula viaja con el instrumento**.
- **26.3 La conversión automática de jurisdicción.** Si un tribunal del foro aplicable dicta medida que impida el pago a los acreedores reestructurados, la ley aplicable y el agente de pago se trasladan a la Argentina. La cautelar que el litigante necesita es la que destruye el foro donde puede cobrarla. Costo cero en tiempos normales: el inversor de buena fe conserva la protección de ley extranjera y no paga por una defensa que no se activa.
- **26.4 La Cláusula Espejo.** En contratos de inversión extranjera, concesiones y licencias: si el Estado de origen o de control efectivo del inversor adopta sanciones contra la Argentina, la resolución de controversias pasa a tribunales argentinos y se suspende la repatriación de utilidades mientras la medida esté vigente. **Convierte cada dólar extranjero invertido en un lobbista contra sancionar a la Argentina.** Simétrica, publicada, no discriminatoria por país. Cuanto más penetrada la economía, más fuerte la defensa: la vulnerabilidad que S11 registra como amenaza pasa a ser amortiguador.
- **26.5 Lo que sigue vivo de 2015.** La Resolución 69/319 de la Asamblea General —Principios Básicos sobre Reestructuración de Deuda Soberana, impulsados por la Argentina, aprobados por amplia mayoría, no vinculantes, jamás implementados por nadie— es la victoria diplomática más grande y más desaprovechada del período. Implementarlos unilateralmente y ofrecer el Tribunal Arbitral de Deuda Soberana a la Red Soberana (S10). *(Cifras exactas de la votación: ver §11, bloqueante.)*
- **26.6 Costo declarado.** Sobretasa estimada en la emisión. **No inventar el número:** encargar la estimación y dejar el rango como tarea de la Pre-Fase, con el precedente de PLANSUS a la vista — una cifra sin modelo es una deuda con fecha.
- **26.7 El Compromiso de Horizonte.** *La pieza que sostiene a las otras siete.* El commons antártico rinde en 2048; el corpus, el banco de germoplasma y el examen de modelos rinden a quince o veinte años. Son cinco o seis gobiernos. **La Argentina no sostiene nada dos décadas, y ese es el defecto que ¡BASTA! existe para corregir.** S22.3 lo enfrenta con blindaje constitucional, que es lento, caro, y reversible por la misma vía que lo creó. El mecanismo es el inverso: para la clase acotada de compromisos que solo valen a veinte años, **el compromiso no se escribe hacia adentro sino hacia afuera** — contrato de horizonte con las contrapartes externas que usan el activo (los países del commons antártico, los amarrados al cable, los que adoptaron el examen), con aporte comprometido, obligación recíproca, penalidad y publicación anual del cumplimiento de cada parte. Derogar una ley argentina no le cuesta nada a un gobierno argentino el primer día; incumplirle a treinta países le cuesta en todos los foros donde después va a necesitar algo. **Se externaliza el compromiso para que sobreviva a la política doméstica.** Es la condición 3 del §2 llevada al final: no hay funcionario que pueda ceder, y ahora tampoco hay gobierno que pueda.
- **26.8 El límite del Horizonte, que hay que escribir en la misma sección.** Un mecanismo que ata a los gobiernos que vienen es, literalmente, lo que hace un tecnócrata para escapar del control democrático — y este es el PLAN de un proyecto cuya premisa es que la gente gobierna. **La contradicción es real y no se resuelve declamando que esta vez es por una buena causa.** Se resuelve acotando la clase: un compromiso solo entra al Horizonte si cumple las tres condiciones, verificables una por una. **(a) Preserva opciones, no impone políticas** — mantener abierto el commons antártico no le dice a un gobierno futuro qué hacer con la Antártida; le impide destruir el activo con el que va a decidir. **(b) Es recíproco** — Argentina recibe tanto como entrega, así que no es una atadura unilateral sino un intercambio del que salir tiene costo porque se pierde algo, no porque se castiga. **(c) Pasó por el mecanismo popular de decisión que ¡BASTA! establece**, no por firma de canciller. Un compromiso que impone una política, que no da nada a cambio, o que no fue decidido popularmente, **no es Horizonte: es captura con otro nombre.** El documento tiene que enunciar las tres como test, y tiene que decir qué queda afuera por aplicarlas.

### S27 — LA VISIBILIDAD COMO PODER

Epígrafe propuesto: *«No hay que perseguirlos. Hay que hacer que sean vistos.»*

- **27.1 El Mar Transparente.** *Extiende S19.3.2 y S19.3.4 — remisión explícita.* **Corregido por V6: la sub-sección no propone construir una capacidad, propone escalar y abrir una que ya existe y ya se vende.** VENG comercializa detección de buques sobre SAOCOM 1A/1B con entrega dentro de las tres horas, y enuncia el mecanismo con estas palabras: *«si un barco sin datos AIS es detectado por SAOCOM, se sabe que es un barco no declarado»*. Eso cambia el argumento entero — no hay que pedirle al lector que crea en una capacidad futura. **Lo que falta no es el sensor: es la decisión de publicar.** Tres piezas: la constelación ampliada; el enjambre de drones no armados (INVAP + Fabricaciones Militares, engancha con S18.3.2 que ya les asigna «drones de monitoreo marítimo»); y el feed público con API abierta. **No afirmar cobertura total:** ni CONAE ni VENG publican tamaño mínimo detectable ni cadencia de revisita sobre la ZEE, y ese hueco se declara.
- **27.2 El certificado que se regala.** Se otorga automáticamente, sin trámite y sin costo, al buque que mantiene el transpondedor encendido y no entra a la ZEE sin licencia. **Equilibrio separador:** el que lo rechaza se está declarando. Argentina no acusa a nadie.
- **27.3 La capa que aplica el castigo — y el enchufe que falta.** *Rediseñada por V7. Es el hallazgo más importante de la verificación y hay que escribirlo entero, incluida la parte incómoda.* La premisa se confirmó: el castigo lo aplica la mesa de suscripción y no el Estado costero. El International Group cubre alrededor del 87% del tonelaje oceánico; el **Joint Hull Committee** del mercado de Londres publicó una cláusula que permite retirar cobertura a buques listados como INDNR y cancelar la de buques relacionados con siete días de aviso; Allianz, AXA, Generali y otras se comprometieron a no asegurarlos; y existe **Vessel Viewer** para que los suscriptores evalúen riesgo de pesca ilícita. **El mecanismo existe y ya opera en el mundo.** Pero **el disparador no es un dato satelital: es figurar en la lista INDNR de una OROP** — y el Atlántico Sudoccidental (Área FAO 41) es la única gran zona pesquera del planeta **sin OROP**. Sin OROP no hay lista; sin lista, la cláusula no tiene de dónde agarrarse justo en el océano donde nos saquean. **Y la razón por la que no hay OROP es la posición argentina sobre Malvinas**: Argentina no acepta al Reino Unido ni a las islas como Estado ribereño, y eso bloquea la constitución de la organización desde hace décadas. Hay que escribirlo aunque incomode: **la posición de soberanía es lo que deja inutilizable la única palanca que castigaría el saqueo**, entre USD 1.000 y 2.800 millones al año. La sub-sección no dice «Argentina publica y el asegurador actúa»: dice que **el mercado ya está cableado para obedecer una lista y a la Argentina le falta el enchufe.** **Decisión tomada por el autor el 2026-08-03: camino (a), la OROP con paraguas de soberanía.** Se descarta la lista propia — la cláusula del Joint Hull Committee nombra a las OROP, y construir credibilidad de mercado desde cero contra un instrumento que ya nombra a otro es pelear cuesta arriba sin necesidad.
- **27.3.bis El precedente, que no es una hipótesis.** *Verificado en V7-bis.* La fórmula del paraguas de soberanía existe, tiene nombre, y **ya se aplicó exactamente a esto.** Los Acuerdos de Madrid I y II (reunión del 17 al 19 de octubre de 1989, delegaciones de Lucio García del Solar y Sir Crispin Tickell) establecieron que nada de lo actuado se interpreta como cambio en la posición argentina sobre soberanía. Y bajo esa fórmula de salvaguardia, la **Declaración Conjunta sobre Conservación de Recursos Pesqueros del 28 de noviembre de 1990** creó la **Comisión de Pesca del Atlántico Sur (CPAS)**, que funcionó cerca de quince años y llegó a su vigesimoséptima reunión. **No hay que inventar el dispositivo: hay que explicar por qué murió.** Y murió en 2005, cuando el Reino Unido otorgó licencias pesqueras por veinticinco años en las islas y Argentina rechazó la medida. **No la mató la fórmula: la mató un acto unilateral que la fórmula no tenía cómo penalizar.**
- **27.3.ter Y por eso el bloque ya contiene su propia respuesta.** Lo que le faltó a la CPAS es exactamente lo que la **S26.7** provee: un compromiso recíproco, con penalidad y con publicación anual del cumplimiento de cada parte, de modo que el acto unilateral tenga costo en vez de ser gratis. **La OROP del Atlántico Sudoccidental es el primer caso de uso del Compromiso de Horizonte, y hay que escribirla así** — es la conexión interna más fuerte del bloque y la que justifica que el Horizonte no sea una abstracción. Cumple además el test de S26.8 sin forzarlo: preserva opciones en vez de imponer políticas (la lista INDNR no decide sobre soberanía, decide sobre quién apagó el transpondedor), es recíproco por construcción, y la condición (c) es la que hay que trabajar.
- **27.3.quater El costo político, escrito.** Los Acuerdos de Madrid son objeto de disputa doméstica activa y hay corrientes que piden denunciarlos por considerarlos la base de un régimen colonial. **Proponer volver a la fórmula del paraguas tiene costo político real y el documento no puede presentarlo como una obviedad técnica.** El argumento honesto es el aritmético, y va escrito: entre USD 1.000 y 2.800 millones al año se pierden hoy, sin OROP, con la soberanía intacta y sin ninguna palanca. La pregunta no es si la fórmula es incómoda — es si quince años de CPAS costaron más que veinte de saqueo sin lista.
- **27.4 Reemplazo de la línea naval.** Consecuencia presupuestaria explícita sobre S18.1: **la línea de USD 500-800M en capacidad naval se reasigna**, no se suma. Una corbeta patrulla un punto por vez y llega tarde; el problema es de cobertura y de mercado, no de intercepción. *(Rango de reasignación: pendiente de estimación, ver §11.)*
- **27.5 El Registro de Presión.** *Compuerta de tranche declarada — no antes de tranche-3.* Todo funcionario que reciba de un gobierno extranjero, organismo multilateral, transnacional o representante de acreedores un pedido, sugerencia o advertencia sobre política pública argentina lo registra en 72 horas: quién, cuándo, qué pidió, qué ofreció, qué insinuó como consecuencia. Publicación inmediata. **No prohíbe pedir.** Abre una tenaza sin salida: si piden igual, el costo político lo paga el que presiona ante su propia opinión pública; si dejan de pedir, ya ganaste. El valor mayor es interno y hay que escribirlo así: **le saca al funcionario el peso de tener que ser valiente.** Deja de ser una decisión de coraje y pasa a ser un trámite cuya omisión es falta grave.
- **27.6 El commons antártico.** *Extiende S5 (reloj 2048) y S20.1.1 (Ushuaia). Se sostiene con S26.7 — sin el Horizonte, esta sub-sección es una promesa a veintidós años sin nada que la ate, y hay que remitir de forma explícita porque es la dependencia interna más fuerte del bloque.* Toda campaña que zarpa de Ushuaia aporta sus datos científicos a un repositorio abierto alojado en el nodo austral de ArgenCloud, con DOI argentino, acceso libre y sin reclamo de propiedad. S5.475 ya dice que cada dataset compartido «cuenta en 2048» y nunca dice dónde vive. **La estrategia no es reclamar: es que en 2048 la pregunta haya dejado de ser de quién es y haya pasado a ser quién sabe** — y que la respuesta esté escrita en veinte años de citas. Es la Diplomacia de Código (S21.7) aplicada al hielo.

### S28 — LA CAPACIDAD QUE YA EXISTE

Epígrafe propuesto: *«No hay que construirlas. Hay que darse cuenta de que están.»*

- **28.1 ABACC.** La Agencia Brasileño-Argentina de Contabilidad y Control de Materiales Nucleares (1991) es la única agencia binacional de salvaguardias del mundo, y el único caso conocido de dos rivales con programas nucleares paralelos que se desarmaron verificándose mutuamente y sostuvieron el arreglo décadas. **No existe en ningún otro lugar del planeta y no está escrita en ninguna línea del corpus ¡BASTA!.**
- **28.2 El Protocolo ABACC como producto.** Metodología, contabilidad de materiales, arquitectura de gobernanza paritaria y cuerpo de inspectores ofrecido como tercero neutral a díadas rivales. Argentina deja de ser un país del Sur que pide y pasa a ser el país que sabe cómo dos enemigos dejan de armarse. Encaja con S16 (Sur Global) y S21.7 (standards track) sin necesitar presupuesto nuevo.
- **28.3 El anexo de exportación.** Toda exportación nuclear argentina lleva anexo obligatorio de verificación tipo ABACC. Dos efectos: siembra el régimen, y —el que importa— **vuelve a la Argentina difícil de sancionar en el terreno donde más se la podría sancionar.** No se castiga al proveedor que hace el trabajo del régimen mejor que el estándar. Requiere traer INVAP y su historial exportador al documento, que hoy no lo nombra. *(Lista de países compradores: ver §11, bloqueante.)*
- **28.4 La Ley del Segundo Proveedor.** *Extiende S18.2.3.* Ningún sistema crítico del Estado puede depender más de un umbral declarado de un solo proveedor, sistema operativo o jurisdicción; cumplimiento publicado por organismo en tablero abierto. **La publicidad del tablero es lo que la financia:** garantiza un segundo lugar real y topea al primero, con lo que cada licitación pasa a tener dos oferentes en vez de un monopolio con cautivo, y el ahorro por competencia paga la redundancia. Tercer efecto, el más importante: no se pueden operar dos stacks sin gente propia que entienda, así que la regla obliga a reconstruir capacidad técnica estatal — que es la soberanía digital de verdad, no la declarada.
- **28.5 Insumos críticos.** Argentina no produce principios activos farmacéuticos a escala. Un país que no puede medicar a su población seis meses no es soberano por más satélites que tenga. Tres capas: reserva estratégica rotativa de esenciales; capacidad latente de fabricación de emergencia (el modelo de los respiradores de 2020, institucionalizado, vía Empresas Bastardas de PLANEB); y **Reservas Estratégicas Cruzadas** — Argentina almacena reservas de países importadores a cambio de que ellos almacenen insumos críticos argentinos, de modo que atacar a la Argentina pase a ser atacar la reserva de un tercero. Es la indispensabilidad de S2, pero física y con contrapartes que reaccionan.
- **28.6 La Doctrina del Erizo.** *Reemplaza S18.2.4.* Argentina no gana una escalada cibernética ofensiva contra ningún actor capaz de atacarla en serio, y el documento no debería decir que sí. Se sustituye por resiliencia como disuasión: modo degradado ensayado en cada servicio crítico con procedimiento en papel, desconcentración geográfica de la infraestructura hoy amontonada en el AMBA, y simulacro nacional publicado. **No hay que ser peligroso: hay que ser poco rentable de atacar.** Engancha con el Kit de Despliegue de Crisis de PLANRUTA, que ya tiene el protocolo de 72 horas escrito para crisis internas.

---

## 6. Ediciones forzadas sobre PLANGEO

| # | Sección | Edición | Por qué es forzada |
|---|---|---|---|
| 1 | S18.1 | Reasignar la línea naval de USD 500-800M hacia constelación + enjambre; nota de remisión a S27.4 | Dos secciones no pueden presupuestar respuestas incompatibles al mismo problema |
| 2 | S18.2.4 | **Reescritura completa.** «Capacidad ofensiva disuasoria» → Doctrina del Erizo, con remisión a S28.6 | Es la única afirmación del documento que promete una capacidad que Argentina no va a tener |
| 3 | S17.4 | Agregar la jurisdicción de la deuda a la fase de convivencia, con remisión a S26 | El desacople del FMI sin cláusula de jurisdicción deja abierto el vector que ya se materializó una vez |
| 4 | S11 Tabla 11 | Fila de calificadoras: agregar la Cláusula del Buitre como contramedida junto al ISN | Hoy la única contramedida al downgrade es una metodología alternativa, que no protege de un embargo |
| 5 | S11.2 | Protocolo Anti-Cascada: incorporar los mecanismos que se activan solos y no requieren decisión en crisis | La cascada es justo el momento en que un funcionario bajo presión cede |
| 6 | S19.3.2 y S19.3.4 | Remisión a S27.1-27.3 | Evitar que el lector crea que el monitoreo y el sello son todo el mecanismo |
| 7 | S20.1.1 y S5 (bloque 2048) | Remisión a S27.6 | El reloj 2048 y el hub austral existen sin la pieza que los conecta |
| 8 | S22.2 (sanciones financieras) | Agregar Cláusula Espejo y Cláusula del Buitre al bloque de pre-sanción | El protocolo actual es 100% reactivo salvo por el colchón financiero |
| 9 | S24.1 | Tabla de servicio a cada PLAN: filas nuevas de PLANMON (jurisdicción de deuda), PLANSEG (armas) y PLANTER (mar) | La tabla es el índice de integración y quedaría desactualizada |
| 10 | S22.3 | Blindaje institucional: agregar el Horizonte como **complemento** del blindaje constitucional, con remisión a S26.7 y S26.8 | S22.3 hoy propone una sola vía —constitucionalizar— para un problema que tiene dos caras. Si el Horizonte no se ancla ahí, el documento propone dos respuestas al mismo problema en dos lugares sin saber una de la otra |
| 11 | **S5, línea 469** | **Corrección de hecho.** «El Tratado Antártico vence en 2048» → lo revisable desde 2048 es el **Protocolo de Madrid** (art. 25.2), no el Tratado; la prohibición minera está en el **art. 7 del Protocolo**; y **ninguno de los dos «vence»** | V8. El documento nombra mal el instrumento y después se desmiente a sí mismo en la oración siguiente («no "expira" técnicamente»). **La S27.6 se apoya en ese bloque:** no se construye una estrategia a veintidós años sobre una frase que nombra mal el tratado |

### 6.bis Las remisiones que estas ediciones mueven

**Corrección al §5.** La decisión de apendar sin renumerar evita romper remisiones por *ordinal*, pero no alcanza: el corpus cita a PLANGEO **por número de línea**, y las once ediciones forzadas corren líneas. Verificado con `grep -rn 'PLANGEO:[0-9]'`:

| Ancla | Qué hay ahí | Quién la cita | ¿La mueven las ediciones? |
|---|---|---|---|
| `PLANGEO:199-207`, `:207`, `:223` | El «cero lock-in» del Stack y la tabla de módulos | PLANPREGUNTA (documento, copia pública, `.mdx` de v2), `arquitecto-data.ts:711` (arista `d200`), plan del tramo D | **No.** Toda edición forzada cae por debajo de la línea 425 |
| `PLANGEO:425` | Agencia del Litio del Cono Sur | PLANPUERTA (documento, spec, plan), `verificar-planpuerta.ts:397` | **No.** La edición más alta es la de S5 (~469), que está por debajo |
| `PLANGEO:1148-1149`, `:1151` | Adopción municipal de la Red Soberana (S21.1) | PLANPUERTA (documento, spec, plan), `verificar-planpuerta.ts:402` | **Sí — ocho de las once ediciones las corren.** S5 (dos: E7-bis y E11), S11, S17.4, S18.1, S18.2.4, S19.3 y S20.1 están todas por encima de 1148. Las tres restantes (S22.2, S22.3, S24.1) caen por debajo y no las mueven |

Es exactamente el modo de falla que en el tramo D de PLANPREGUNTA rompió ocho remisiones de PLANARCO, y esta vez se detectó antes. Tres consecuencias para el plan:

1. **Las anclas `:1148-1149` y `:1151` se recalculan y se actualizan en los cuatro archivos que las llevan**, como paso obligatorio de la última tarea. `verificar-planpuerta.ts` es una guardia ajena: si queda desactualizada, rompe el CI de otro PLAN.
2. **`verificar-remisiones.ts` ya corre en CI y barre el corpus entero.** No hay que construir la red — hay que no ignorarla.
3. **Ordenar las ediciones de abajo hacia arriba** (S24 → S22 → S20 → S19 → S18 → S17 → S11 → S5) para que cada una no invalide los números de la siguiente mientras se trabaja.

**Además:** cabecera del documento a v1.2, conteo de secciones 25 → 28, y `PLAN_REGISTRY.yml` con `version` y `last_updated` nuevos. `budget_class` **sigue siendo XS** — este bloque no reclama piso y hay que decirlo explícito, porque PLANPACTO midió que los pisos declarados del corpus ya suman entre 7,82% y 9,41% del PBI contra el 2,40% que la Escalera conserva.

---

## 7. Integración con el corpus

| PLAN | Qué aporta o recibe |
|---|---|
| **PLANMON** | Único documento que hoy nombra `holdout`. S26 es la contraparte externa de su arquitectura monetaria; hay que verificar que no se contradigan sobre emisión de deuda |
| **PLANISV** | La trazabilidad blockchain es la Pieza 2 de S27; el certificado es su interfaz de exportación |
| **PLANTER** | **Conflicto de doctrina detectado en V9 — resuelto como complementariedad, 2026-08-03.** `PLANTER:93` propone pasar el Servicio de Guardacostas *«de 15 a 60 buques operativos»*. No se contradice con la S27 una vez que se nombra la línea que las separa: **la jurisdicción termina en la milla 200.** Los guardacostas ejercen potestad **dentro** de la ZEE, donde Argentina puede abordar, incautar y sancionar, y ahí un buque es la herramienta correcta. El mecanismo de mercado de la S27 opera **fuera** de las 200 millas, donde Argentina no tiene potestad y ninguna cantidad de buques se la da — que es precisamente donde operan los 300 a 500 pesqueros de `PLANTER:139`. **La S27.4 reasigna la línea naval de PLANGEO S18.1, no la de PLANTER.** Las dos van escritas con esa frontera explícita y con remisión cruzada; sin la frontera, el corpus queda proponiendo dos respuestas incompatibles al mismo problema |
| **PLANDIG** | ArgenCloud aloja el commons antártico (S27.6); la Ley del Segundo Proveedor (S28.4) es una regla de compras que PLANDIG tiene que poder ejecutar |
| **PLANEN / PLAN24CN / PLANMESA / PLANMEMORIA** | Ya nombran a INVAP. S28.3 lo trae a PLANGEO por primera vez — chequear que la caracterización no choque |
| **PLANRUTA** | El Kit de Despliegue de Crisis es la implementación del modo degradado de S28.6 |
| **PLANSAL / PLANSUS** | La reserva de esenciales de S28.5 toca producción farmacéutica de ambos; el piso lo pone PLANSAL, no PLANGEO |
| **PLANPACTO** | Confirmar que el bloque no abre piso nuevo |
| **PLANFOCO** | El Registro de Presión (S27.5) es palabra pública; la compuerta de tranche debe ser coherente con su régimen |
| **PLANSEG** | El hueco declarado de armas civiles **queda fuera de este bloque** — es seguridad interna, no coerción externa. Se anota como pendiente de PLANSEG, no se anexa acá |
| **PLANMESA** | **Dependencia dura del Horizonte.** La condición (c) de S26.8 —que el compromiso haya pasado por el mecanismo popular de decisión— necesita que ese mecanismo exista y esté nombrado. Si PLANMESA no lo provee, el Horizonte no tiene cómo distinguirse de un acuerdo de canciller y **no se escribe** |
| **PLANPACTO** (bis) | El Horizonte compromete aporte a veinte años. Verificar que eso no sea un piso encubierto: **es aporte a un activo, no gasto corriente garantizado**, y la diferencia hay que poder defenderla ante la Escalera |

---

## 8. Riesgos propios del bloque

1. **La Cláusula del Buitre encarece la emisión y nadie sabe cuánto.** Es el riesgo real. Si la sobretasa fuera grande, el mecanismo es una póliza cara vendida como gratuita. **Bloqueante para el plan de implementación:** no se escribe la cifra sin modelo.
2. **La Cláusula Espejo puede leerse como riesgo expropiatorio** y ahuyentar inversión que la Argentina necesita — exactamente el problema que PLANSUS acaba de declarar como compuerta hacia PLANMON. Mitigación de diseño: simetría, publicidad, no discriminación por país, activación solo ante sanción estatal. Aun así el riesgo queda escrito, no minimizado.
3. **~~La capa aseguradora es una hipótesis~~ — resuelto por V7, y el riesgo real es otro.** Ya no hay riesgo de que el mecanismo no exista: existe, con cláusula del Joint Hull Committee y compromisos públicos de aseguradoras. **El riesgo se movió al enchufe:** todo S27.3 depende ahora de que exista una lista INDNR para el Área 41, y eso depende de una OROP que la propia posición argentina bloquea. Es un riesgo político, no de mercado, y es mucho más grande que el anterior porque **no lo puede mitigar el diseño**. Mitigación parcial: el feed sirve igual a certificadoras e importadores, que son puertas independientes de la aseguradora — pero son puertas más blandas.
4. **El Registro de Presión choca de frente con la directiva de diplomacia sobria.** Se mitiga con compuerta, no se resuelve.
5. **Todo S28 depende de hechos externos que este spec no verificó.** Ver §11.
6. **Riesgo de tono.** El bloque es el más «astuto» del documento y PLANGEO es un PLAN interno de un movimiento que se presenta como transparente. Si se escribe con épica de espionaje, contradice al proyecto. Se escribe en registro de ingeniería institucional: mecanismos, costos, compuertas.
7. **El Compromiso de Horizonte es el riesgo doctrinario del bloque, no un riesgo técnico.** Atar a los gobiernos que vienen es lo que hace un tecnócrata para escapar del control democrático, y ¡BASTA! dice que la gente gobierna. El test de tres condiciones de S26.8 lo acota, pero **acotar no es resolver**: queda una tensión viva entre «el pueblo decide» y «esto no se toca por veinte años», y el documento la tiene que dejar escrita como tensión y no como problema saldado. Un lector hostil va a atacar por acá y va a tener parte de razón. **Es preferible que la objeción esté escrita por nosotros y bien, a que la escriba otro.**
8. **Riesgo de captura del propio Horizonte.** Si el test se aplica con laxitud, el mecanismo se convierte en la mejor herramienta de captura que el corpus haya diseñado: basta con firmar afuera lo que no se puede sostener adentro. La mitigación es que las tres condiciones sean **verificables por separado y públicas**, y que exista la lista de lo que quedó afuera por aplicarlas — una lista vacía es la señal de que el test no está funcionando.

---

## 9. Decisiones tomadas (registro — no se rediscuten)

1. **Bloque nuevo S26-S28 apendado, sin renumerar nada.** Cero remisiones rotas por encima de la prolijidad editorial.
2. **Ocho mecanismos.** Los que no cumplen las cuatro condiciones del §2 no entran, por buenos que sean. El octavo —el Horizonte— entró después que los otros siete, al advertir que la condición 3 tiene una cara temporal que ninguno de ellos cubría.
3. **El Horizonte va en S26 y no en sección propia.** Es un mecanismo contractual y S26 es la sección de los mecanismos contractuales. Darle sección propia lo pondría por encima de los otros siete, y **no está por encima: está debajo, sosteniéndolos.**
4. **S26.8 se escribe aunque debilite la propuesta.** La objeción democrática al Horizonte es buena y va escrita en el cuerpo, no en un anexo de riesgos. Un mecanismo que se propone sin su propia objeción es propaganda.
5. **La línea naval se reasigna, no se suma.** El bloque no aumenta el presupuesto de PLANGEO.
6. **S18.2.4 se reescribe, no se matiza.** Una capacidad que no vamos a tener no se suaviza: se saca.
7. **El Registro de Presión se escribe completo y se le pone compuerta de tranche.** No se recorta el diseño para que entre.
8. **PLANGEO sigue sin reclamar piso presupuestario.**
9. **Las armas civiles de PLANSEG quedan fuera.** Es seguridad interna.
10. **Ninguna cifra se escribe sin fuente.** Precedente PLANSUS: las cifras sin modelo terminan siendo una entrada de deuda con nombre y apellido.

---

## 10. Lo que queda sin resolver

- **La sobretasa de la Cláusula del Buitre.** Sin esto, S26.6 va con rango declarado como pendiente o no va.
- **Si la conversión automática de jurisdicción es ejecutable bajo ley de Nueva York** o si un tribunal la declararía inoponible. Necesita opinión legal; `LEGAL_OPINIONS/PLANGEO.md` no existe todavía.
- **El umbral del Segundo Proveedor.** El 60% es un número plausible sin respaldo. Debe salir de un análisis de concentración real de compras públicas argentinas, o declararse como parámetro a fijar.
- **Costo de la constelación y del enjambre**, contra los USD 500-800M que reasigna. Sin ese número, S27.4 es una afirmación.
- **Quién es el titular de dominio del commons antártico** y bajo qué licencia. Un repositorio «sin reclamo de propiedad» necesita igual una figura jurídica.
- **Qué instrumento jurídico concreto es un Compromiso de Horizonte.** Un tratado necesita ratificación legislativa y entonces se deroga como una ley; un memorándum no obliga a nada. La figura que sirve está en el medio y **este spec no sabe cuál es** — probablemente un acuerdo interinstitucional con contraprestación, pero es una pregunta para Cancillería, no para el diseño. Sin esa respuesta, S26.7 describe un efecto sin nombrar el vehículo.
- **Si el mecanismo popular de decisión de PLANMESA alcanza** para satisfacer la condición (c) de S26.8, o si hay que definir un umbral más alto para compromisos de veinte años que para una decisión ordinaria. Intuitivamente sí hace falta un umbral más alto — pero eso es una decisión de PLANMESA, no de PLANGEO.

---

## 11. Verificación previa — **CERRADA 2026-08-03**

> **Estado: las diez cerradas contra fuente primaria.** Ocho verdes, una verde con corrección de fondo (V7), una ámbar (V10). El ledger completo, con fuentes y con lo que cada una le cambió al diseño, está en **`v2/docs/specs/2026-08-03-plangeo-verificaciones.md`**. Esta tabla queda como registro de lo que se preguntó.
>
> **Lo que la verificación cambió, en tres líneas:** el Mar Transparente no hay que construirlo —VENG ya lo vende sobre SAOCOM—; la capa aseguradora existe pero se dispara con listas de OROP y **el Atlántico Sudoccidental es la única gran zona pesquera del mundo sin OROP, por la posición argentina sobre Malvinas**; y PLANGEO nombra mal el instrumento antártico en su línea 469.
>
> **Valió la pena hacerla antes.** Si la S27 se hubiera escrito primero, habría descrito un mecanismo que en el Área 41 no tiene dónde enchufarse — y habría sonado perfectamente convincente.

Los hechos de abajo sostenían el bloque y **provenían de conocimiento del modelo, no de fuente consultada.** Ninguno se escribió en el documento antes de verificarse. Es literalmente el hallazgo de D-015 (PLANSUS) aplicado antes y no después.

| # | Afirmación | Dónde se usa | Fuente primaria a conseguir |
|---|---|---|---|
| V1 | ABACC creada en 1991, binacional, única en su tipo, en funcionamiento continuo | S28.1-28.3 — **si esto falla, cae toda la S28 superior** | Acuerdo de Guadalajara (1991); sitio y memorias anuales de ABACC; OIEA |
| V2 | Resolución 69/319 de la AGNU (2015), impulsada por la Argentina, aprobada por amplia mayoría, no vinculante | S26.5 — **la cifra 136-6 no se escribe sin acta** | Acta oficial de la AGNU, 69° período de sesiones |
| V3 | NY Judiciary Law §489 (champerty) y el resultado efectivo en NML c. Argentina | S26.1 | Texto de la ley; fallos del caso |
| V4 | Leyes anti-buitre de Bélgica (2015) y Reino Unido (2010), y su límite jurisdiccional | S26.2 | Textos legales |
| V5 | INVAP exportó reactores de investigación, y a qué países | S28.3 | INVAP / CNEA. **Ya hay caracterización de INVAP en cinco PLANes: chequear consistencia primero** |
| V6 | SAOCOM: banda, operatividad y capacidad real de detección de embarcaciones | S27.1 — **crítico: si el SAR no resuelve buques a esa escala, el mecanismo no funciona** | CONAE |
| V7 | Cobertura de los P&I Clubs sobre el tonelaje mundial y su práctica de suscripción | S27.3 — sostiene la pieza más frágil | International Group of P&I Clubs |
| V8 | Protocolo de Madrid revisable desde 2048; presencia argentina continua desde 1904 | S27.6 | Texto del Protocolo; Tratado Antártico. **PLANGEO ya afirma ambas en S1 y S5: verificar el documento contra sí mismo** |
| V9 | Cifras de saqueo pesquero del Atlántico Sur | S27.1 | **PLANTER ya las trae con fuente: usar esas, no generar nuevas** |
| V10 | Dependencia argentina de principios activos farmacéuticos importados | S28.5 | **PLANSAL y PLANSUS ya tocan producción local: partir de ahí** |

V6 y V7 eran las dos que podían matar S27 entero. Se verificaron primero, y fue la decisión correcta: **V6 la fortaleció y V7 la rediseñó.**

### 11.bis Lo que quedó abierto después de verificar

1. ~~**La decisión OROP: (a) paraguas de soberanía o (b) lista propia.**~~ **RESUELTA 2026-08-03 — camino (a).** Ver S27.3, 27.3.bis a 27.3.quater. Trajo el precedente de la CPAS y la conexión con S26.7.
2. ~~**El conflicto con el Mar Argentino Soberano de PLANTER.**~~ **RESUELTO 2026-08-03 — complementariedad**, con la milla 200 como frontera explícita entre los dos dispositivos. Ver §7.
3. **La condición (c) de S26.8 aplicada a la OROP.** Un compromiso de veinte años sobre el Atlántico Sur que además roza Malvinas es, de todo el corpus, el caso donde el mecanismo popular de decisión más falta hace y más difícil es de diseñar. **Es la pregunta abierta más grande que deja el bloque**, y es de PLANMESA.
4. **El dato real de producción nacional de IFA** (ANMAT, CILFA, INDEC) antes de que la S28.5 afirme dependencia farmacéutica. No bloqueante: la sub-sección se escribe sin la cifra.
5. **Tamaño mínimo detectable y cadencia de revisita de SAOCOM sobre la ZEE.** No bloqueante: se declara el hueco en lugar de afirmar cobertura total.

---

## 12. Deuda registrada

**D-017** en `docs/DEUDAS.md`: la cabecera de PLANGEO anuncia que existirán secciones marcadas `[INTERNO]` en versiones futuras y el registro lo declara `public_visibility: interno`, pero **el documento no tiene ni una sola marca `[INTERNO]`** y no hay versión pública derivada. La distinción público/interno que la cabecera promete no está implementada en ninguna parte, y este bloque la necesita para poder alojar el Registro de Presión con compuerta. Se anota; no se resuelve acá.

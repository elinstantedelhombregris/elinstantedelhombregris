# Acta de levantamiento del freeze de PLANes nuevos

**Fecha:** 2026-07-26
**Deroga:** el freeze declarado en `COVERAGE_GAPS_ASSIGNMENTS.md` el 2026-04-26
**Spec que lo motiva:** `v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md`
**Resultado:** el canon pasa de 22 PLANes temáticos a 26, más PLANRUTA

## Que decía el freeze

`COVERAGE_GAPS_ASSIGNMENTS.md` (2026-04-26) declaró *«Freeze sigue activo. Sin
PLANes nuevos»* y repartió cada hueco de cobertura como sub-mandato interno de un
PLAN huésped. Su regla 3 dejó abierta una sola puerta: **gate de spin-off cuando
un sub-mandato supera 1,5x el presupuesto del huésped**, con cierre de tranche,
propuesta abierta y firma.

## El gate, corrido

Salida de `SocialJusticeHub/scripts/gate-spinoff-planes-nuevos.ts`:

```
PLANPACTO vs PLANREP: 5.64x-5.24x (huésped 2200-4200 USD MM) -> PASA
PLANARCO vs PLANCUIDADO: 1.77x-2.13x (huésped 30000-45000 USD MM) -> PASA
PLANARCO vs PLANSAL: 8.83x-16.00x (huésped 6000-6000 USD MM) -> PASA
PLANARCO vs los 2 huéspedes sumados: 1.47x-1.88x -> NO PASA
PLANPREGUNTA vs PLANEDU: 0.21x-0.26x (huésped 80000-100000 USD MM) -> NO PASA
PLANPREGUNTA vs PLANEB: 33.00x-43.33x (huésped 500-600 USD MM) -> PASA
PLANPREGUNTA vs PLANDIG: 3.51x-2.63x (huésped 4700-9900 USD MM) -> PASA
PLANPREGUNTA vs los 3 huéspedes sumados: 0.19x-0.24x -> NO PASA
PLANFOCO: SIN HUÉSPED. COVERAGE_GAPS_ASSIGNMENTS.md nunca le asignó uno, así que la regla 3 no aplica: no fue sub-mandato de nadie.
```

## Lectura honesta del resultado

**Uno solo pasa el gate.** PLANPACTO da 5,2-5,6x contra PLANREP, su único huésped.
Es el único de los cuatro que cumple la regla 3 tal como está escrita.

**PLANARCO lo pasa contra cada huésped por separado y falla contra la suma, por tres
centésimas.** 1,8-2,1x contra PLANCUIDADO y 8,8-16,0x contra PLANSAL; contra los dos
sumados, 1,47-1,88x — y el umbral es 1,5. No redondeamos hacia arriba. La medición
correcta es contra la suma porque la fila 18 de este documento asigna «Discapacidad y
vejez» a **PLANCUIDADO + PLANSAL**, dos huéspedes: medir a un sub-mandato contra uno
solo de los suyos, elegido después de conocer el resultado, es elegir el denominador
que conviene.

**PLANPREGUNTA lo pasa contra dos huéspedes de tres y falla contra el tercero y contra
la suma.** 33x contra PLANEB y 2,6-3,5x contra PLANDIG; 0,2x contra PLANEDU, que es el
PLAN más caro del corpus (USD 80-100 mil millones).

**PLANFOCO nunca tuvo huésped.** El hueco «Cultura/Medios/Artes» quedó calificado
IMPORTANTE en la auditoría de marzo y `COVERAGE_GAPS_ASSIGNMENTS.md` **no le asignó
ninguno**. La regla 3 no aplica porque nunca fue sub-mandato de nadie. No es un
spin-off: es un hueco que el freeze dejó abierto.

## Lo que el gate mide en realidad

Tres de los cuatro no pasan, y las tres razones son distintas. Conviene separarlas
antes de tratarlo como un rechazo.

**PLANARCO falla por el denominador.** Pasa limpio contra cada uno de sus dos
huéspedes por separado —1,8-2,1x contra PLANCUIDADO, 8,8-16,0x contra PLANSAL— y sólo
cae al sumarlos, por tres centésimas. Acá el reparto entre dos dueños es lo que hunde
el cociente.

**PLANPREGUNTA falla por otra cosa, y hay que decirlo con precisión: falla también
contra PLANEDU solo.** 0,21-0,26x contra PLANEDU, 0,19-0,24x contra los tres sumados —
prácticamente el mismo número. Sumar huéspedes no explica nada acá. Lo que explica es
que **la regla 3 mide tamaño relativo, no si algo merece documento propio.** PLANEDU
son USD 80-100 mil millones: la refundación entera del sistema educativo. Un
sub-mandato alojado ahí adentro tendría que costar 120 mil millones para pasar el
gate. Ningún hueco de conocimiento científico va a superar jamás ese umbral, por
importante que sea. **El resultado no dice nada sobre PLANPREGUNTA: dice que la
regla 3 no puede evaluar un sub-mandato cuyo huésped lo supera en un orden de
magnitud.**

**PLANFOCO no falla: no se puede medir.** Nunca tuvo huésped asignado, así que no hay
denominador. La regla 3 no lo rechaza — no lo alcanza.

Lo que sí muestra el gate, mirado entero, es que la asignación de abril no funcionó
como mecanismo. Tres meses después, ni «Ciencia y tecnología (PLANCYT) → PLANEDU +
PLANEB + PLANDIG» ni «Discapacidad y vejez → PLANCUIDADO + PLANSAL» produjeron una
sola sección en ninguno de sus cinco huéspedes. Un hueco repartido entre varios dueños
no tiene dueño.

## Bajo qué autoridad se levanta esto

Hay que ser exacto, porque el documento que se está modificando es explícito.

**La regla 3 autoriza a PLANPACTO y a nadie más.** 5,2-5,6x contra PLANREP, su único
huésped. Ese caso está cubierto por el mecanismo que el propio freeze define.

**Para los otros tres, esto no es una salida por la regla 3: es el autor levantando
una regla que se puso a sí mismo.** La regla 5 dice, sin matices, que mientras el
freeze esté activo ningún sub-mandato puede ser PLAN nuevo, y la regla 3 es la única
puerta que el documento habilita. Estirarla para que entren tres casos que no pasan
sería exactamente el tipo de interpretación acomodaticia que ¡BASTA! le reprocha al
sistema que quiere reemplazar. **No se estira: se deroga en su parte, con nombre,
fecha y motivo, y queda escrito que se derogó.**

El motivo es el hallazgo que produjo este mismo tramo:
**`PRESUPUESTO_CONSOLIDADO_BASTA.md` declaraba 5,45-6,25% del PBI en pisos
constitucionales sobre una tabla de 12 agencias. La suma real de los 22 es
7,82-9,41%.** El propósito declarado del freeze era la disciplina de alcance. Un
freeze que mantiene 22 PLANes fijos mientras el número que los sostiene está mal en
más de dos puntos del PBI no disciplina el alcance: sólo impide que alguien lleve la
cuenta. PLANPACTO es el PLAN que lleva la cuenta, y es el único que la regla 3
autoriza — lo cual es una coincidencia afortunada y no un argumento.

**Lo que este acta no puede hacer, y no finge hacer.** La regla 4 exige cierre de
tranche, propuesta abierta, firma del Director PEO y de un auditor externo, y
validación de la Mesa de Gobierno. Nada de esa maquinaria existe todavía: son órganos
de diseño idealizado, no instituciones en funcionamiento. Este acta no simula haberlos
consultado. Deja constancia de que la decisión la tomó el autor del corpus, con la
evidencia a la vista, y de que **queda sujeta a revisión cuando esos órganos existan**.

## Lo que se levanta y lo que no

**Se levanta:** la prohibición de PLANes nuevos, para los cuatro nombrados en la
spec del 2026-07-26 y sólo para ellos. Para PLANPACTO, por la regla 3. Para los otros
tres, por derogación expresa de la regla 5 en su aplicación a esos casos.

**Sigue vigente:** todo lo demás de `COVERAGE_GAPS_ASSIGNMENTS.md`. Los huecos
asignados a huéspedes que no son estos cuatro siguen siendo sub-mandatos, con sus
owners y tranches, y la regla 5 los sigue alcanzando. La regla 4 sigue en pie:
ningún sub-mandato se convierte en PLAN automáticamente, y este acta es la prueba
de que hace falta un documento firmado para convertirlo.

**Se retiran de la tabla de asignación**, porque pasan a tener documento propio:
- «Federalismo fiscal y coparticipación → PLANREP» → **PLANPACTO**
- «Ciencia y tecnología (PLANCYT) → PLANEDU + PLANEB + PLANDIG» → **PLANPREGUNTA**
- «Discapacidad y vejez → PLANCUIDADO + PLANSAL» → la parte de vejez pasa a
  **PLANARCO**; la de discapacidad **queda** en PLANCUIDADO + PLANSAL

**Lo no humano NO genera PLAN.** Se reparte entre diez huéspedes existentes bajo la
Doctrina de la Sindicatura Viva (spec sección 7). Es `COVERAGE_GAPS_ASSIGNMENTS.md`
funcionando como fue diseñado, y este acta lo confirma como precedente.

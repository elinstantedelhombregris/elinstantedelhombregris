# Acta de excepción al freeze de PLANes nuevos — PLANPUERTA

**Fecha:** 2026-08-02
**Excepciona:** el freeze declarado en `COVERAGE_GAPS_ASSIGNMENTS.md` el 2026-04-26,
que la primera acta —`ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`— dejó expresamente
vigente para todo lo que no fueran los cuatro PLANes que ahí se nombraron.
**Spec que la motiva:** `v2/docs/specs/2026-08-02-planpuerta.md`
**Habilita:** el pasaje del canon de 26 PLANes temáticos a 27, más PLANRUTA. A
diferencia de la primera acta, ésta se firma con el documento ya escrito: el conteo
se mueve en el mismo tramo, y por eso el acta y la migración del registro van juntas.

## Por qué hace falta un acta nueva y no alcanza con la anterior

La primera acta fue explícita sobre su propio alcance: *«Se levanta: la prohibición
de PLANes nuevos, para los cuatro nombrados en la spec del 2026-07-26 y sólo para
ellos»*, y a continuación: *«quien quiera un PLAN nuevo necesita otra acta, con la
misma derogación expresa de la regla 5 y de la condición temporal de la regla 3»*
(`PLAN_REGISTRY.yml:25-27`). PLANPUERTA no está entre los cuatro. **Estirar el acta
del 26 de julio para que lo cubra sería exactamente la interpretación acomodaticia
que esa misma acta se negó a hacer con la regla 3.** Se firma una nueva.

## Qué decía el freeze

`COVERAGE_GAPS_ASSIGNMENTS.md` (2026-04-26) repartió cada hueco de cobertura como
sub-mandato interno de un PLAN huésped, y prohibió los PLANes nuevos. Después del
levantamiento parcial del 26 de julio su cabecera lo dice así (`:7`): *«FREEZE
LEVANTADO el 2026-07-26 para cuatro PLANes y sólo cuatro […]. Para todo lo demás, el
principio sigue vigente: sin PLANes nuevos.»*

Las tres reglas que gobiernan este caso están en `:39-41`:

> **3.** *«Si un sub-mandato crece más allá de cierto tamaño (≥ 1.5x del PLAN huésped
> en presupuesto), gateo de spin-off al cierre de tranche — pero nunca antes y nunca
> sin auditoría externa firmada.»*
> **4.** *«No es mecánico. Un sub-mandato no se convierte automáticamente en PLAN
> nuevo. La conversión requiere: cierre de tranche, propuesta abierta, Director PEO +
> auditor externo firma, Mesa Gobierno valida.»*
> **5.** *«Mientras el freeze esté activo, ningún sub-mandato puede ser PLAN nuevo.»*

## El gate no se puede correr, y no es una excusa: es una medición

La regla 3 es un cociente. Necesita un denominador, y el denominador es el
presupuesto del huésped que alojaba al sub-mandato. **La inmigración nunca fue
sub-mandato de nadie.**

La evidencia es reproducible y se corre en un segundo:

```bash
grep -ric "migra\|inmigra\|extranjer\|refugiad" "Iniciativas Estratégicas/COVERAGE_GAPS_ASSIGNMENTS.md"
```

```
0
```

(`grep -c` con el nombre del archivo por delante imprime `<archivo>:<cuenta>`; acá va
la cuenta sola, porque escribirla con el prefijo la vuelve indistinguible de una
remisión `ARCHIVO:línea` y la guardia de remisiones la lee como una cita a la línea
cero, que no existe.)

Cero. Ni una sola línea del documento que repartió los huecos de cobertura menciona
la migración, la inmigración, a los extranjeros ni a los refugiados — ni para
asignarlos a un huésped, ni para declararlos fuera de alcance, ni para diferirlos. El
tema no está adentro del reparto porque **la auditoría de marzo-abril de 2026 no lo
vio**. No hay huésped, no hay denominador, no hay cociente.

**No es que PLANPUERTA falle el gate: no lo alcanza.**

Y no es un argumento inventado para esta ocasión. Es literalmente el mismo con el que
entró PLANFOCO hace ocho días, y la salida del gate lo dejó escrito en la primera
acta (`ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:31`):

> *«PLANFOCO: SIN HUÉSPED. COVERAGE_GAPS_ASSIGNMENTS.md nunca le asignó uno, así que
> la regla 3 no aplica: no fue sub-mandato de nadie.»*

Y su lectura, tres párrafos más abajo, en la sección «Lo que el gate mide en
realidad»: *«PLANFOCO no falla: no se puede medir. Nunca tuvo huésped asignado, así
que no hay denominador. La regla 3 no lo rechaza — no lo alcanza.»*

**Hay una diferencia entre los dos casos y conviene decirla, porque juega en contra.**
El hueco de PLANFOCO —«Cultura/Medios/Artes»— sí figuraba en la auditoría de marzo,
calificado IMPORTANTE, y lo que faltaba era la asignación. El de PLANPUERTA no figura
en ningún lado: no fue un hueco calificado y sin dueño, fue un hueco no calificado.
Eso hace el caso procedimental **más simple** —no hay ninguna asignación previa que
retirar, y ningún huésped que quede sin una parte de su mandato— y el caso sustantivo
**más incómodo**, porque significa que el corpus estuvo veintiséis PLANes sin
preguntarse quién vive en el país que está diseñando. La incomodidad es el hallazgo,
no un efecto lateral del hallazgo.

## Bajo qué autoridad se levanta esto

Igual que la primera acta, y con la misma exactitud: **por derogación expresa, y no
porque una regla se haya disparado sola.**

Se deroga, **en su aplicación a PLANPUERTA y sólo a él**:

1. **La regla 5** de `COVERAGE_GAPS_ASSIGNMENTS.md`, que prohíbe convertir un
   sub-mandato en PLAN nuevo mientras el freeze esté activo. Acá no hay sub-mandato
   que convertir, pero la regla se deroga igual en su parte: un documento nuevo entra
   al canon mientras el freeze está ACTIVE, y eso es lo que la regla 5 impide.
2. **La condición temporal de la regla 3**, que difiere cualquier spin-off al cierre
   del primer tranche. El primer tranche corre de **2026-05 a 2028-05**
   (`PRIMER_TRANCHE_24M.md`). Esta acta está fechada 2026-08-02: **mes 4 de 24.** La
   puerta procedimental no se abre hasta 2028-05, y esta acta no espera a esa fecha,
   y lo dice.

**Lo que esta acta no puede hacer, y no finge hacer.** La regla 4 exige cierre de
tranche, propuesta abierta, firma del Director PEO y de un auditor externo, y
validación de la Mesa de Gobierno. Nada de esa maquinaria existe todavía: son órganos
de diseño idealizado, no instituciones en funcionamiento. Esta acta no simula haberlos
consultado. Deja constancia de que la decisión la tomó el autor del corpus, con la
evidencia a la vista, y de que **queda sujeta a revisión cuando esos órganos existan**.

## El motivo, que es lo único que justifica derogar una regla propia

El propósito declarado del freeze era la disciplina de alcance: impedir que el corpus
crezca por entusiasmo. Un PLAN nuevo tiene que probar que no es entusiasmo, y el
argumento acá tiene tres patas, todas medidas.

**Primera: el hueco es del tamaño de un país.** En el Tercer Censo Nacional, el de
1914, el 29,9% de la gente que vivía en la Argentina había nacido en otro país; en el
Censo 2022 esa proporción es del 4,2% (`censo.gob.ar`). De casi uno de cada tres a uno
de cada veinticuatro. Los otros veintiséis PLANes diseñan qué hace el país; ninguno se
había preguntado quién lo habita.

**Segunda: no le saca un peso a ningún PLAN existente.** Es la consecuencia directa de
no tener huésped. USD 450-900M a quince años, clase S, **sin piso constitucional**: no
agrega escalón a la Escalera de PLANPACTO ni presión sobre su Techo. Al lado, PLANVIV
son USD 80.000-120.000M a quince años (`PRESUPUESTO_CONSOLIDADO_BASTA.md:37`) —
PLANPUERTA entra dos órdenes de magnitud por debajo. Un PLAN que se agrega sin
disputar una fuente no compite con el freeze por lo que el freeze protegía.

**Tercera, y es la que vale: paga más de lo que cuesta, y en el mismo tramo.** Este
PLAN entró derogando una fila de otro documento en vez de pedir una propia.
`PLANVIV:1566` preveía USD 10-20M para reclutar 5.000-10.000 trabajadores de la
construcción de Bolivia, Paraguay y Perú con visas atadas a proyectos; PLANPUERTA la
deroga bajo la Regla de Subsidiariedad —no se ficha afuera lo que se puede formar
adentro— y el TOTAL de `PLANVIV:1567` baja de USD 160-250M a USD 150-230M. **La
derogación deja una brecha de 15.000 trabajadores en el extremo bajo, y va escrita en
el documento con esa cifra, sin mitigación que la tape.** Un PLAN nuevo que empieza
achicando el corpus y declarando lo que rompió es lo contrario de lo que el freeze
existía para frenar.

## Lo que se levanta y lo que no

**Se levanta:** la prohibición de PLANes nuevos, **para PLANPUERTA y sólo para él**,
por derogación expresa de la regla 5 y de la condición temporal de la regla 3 en su
aplicación a este caso. PLANPUERTA **no** supera el umbral de tamaño de la regla 3 —no
puede: no hay denominador— y no cumple ninguna otra condición de esa regla.

**Sigue vigente:** todo lo demás de `COVERAGE_GAPS_ASSIGNMENTS.md`. El freeze sigue
**ACTIVE**. Los huecos asignados a huéspedes siguen siendo sub-mandatos, con sus
owners y sus tranches, y la regla 5 los sigue alcanzando. La regla 4 sigue en pie:
ningún sub-mandato se convierte en PLAN automáticamente, y ésta es la segunda acta que
lo prueba. **Quien quiera un PLAN número 28 necesita una tercera acta.**

**No se retira ninguna fila de la tabla de asignación**, y ésa es la diferencia
formal con el acta anterior: aquélla retiró tres huecos que tenían huésped; ésta no
retira ninguno, porque el hueco que cubre nunca estuvo en la tabla. Ningún PLAN
existente pierde una parte de su mandato por esta acta.

**Lo que sí se modifica de otro documento** es una sola fila, y va con nota fechada en
el lugar: `PLANVIV:1566`, derogada el 2026-08-02, con el TOTAL de `:1567` y la prosa
de `:1569` recalculados en el lugar y sin correr una línea. La aritmética queda
escrita en la SECCIÓN 12 de PLANPUERTA, y la deuda que abre también.

## Qué queda registrado

- `PLAN_REGISTRY.yml`: `thematic_count` 26 → **27**, `total_documents` 27 → **28**,
  `freeze_excepciones` suma **PLANPUERTA**, y `freeze_excepciones_acta` pasa a listar
  las **dos** actas — la del 2026-07-26 y ésta. Un campo escalar que nombraba una sola
  acta habría hecho desaparecer a la otra en silencio.
- La entrada de PLANPUERTA en `plans:`, con ordinal 27 y agencia ANAR.
- El bloque `### PLANPUERTA` de `READINESS_GATES_ADVERSARIAL.md`, con sus tres attack
  paths. **Este PLAN no promueve de tranche sin eso escrito**, y la nota de
  habilitación de ese bloque remite a esta acta.

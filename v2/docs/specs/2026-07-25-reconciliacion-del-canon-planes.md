# Reconciliación del canon — los 22 documentos reales entran a La prueba

**Fecha:** 2026-07-25
**Tramo:** A de 2 (el tramo B es «El Arquitecto en papel», spec aparte)
**Páginas afectadas:** `/planes` (spec 2.4 `2026-07-22-la-prueba-papel-y-tinta.md`) y `/planes/:slug`
**Corpus fuente:** `Iniciativas Estratégicas/PLAN*_Argentina_ES.md` (23 documentos, 46.234 líneas, 5,1 MB)
**Plan de implementación:** `docs/plans/2026-07-25-reconciliacion-del-canon-planes.md`

> **Tesis.** La prueba dice «esto lo escribió uno solo» y después sirve 23 resúmenes de
> veinte líneas. Los documentos que sostienen esa frase — 46.234 líneas escritas entre
> 2025 y abril de 2026, con auditoría, grafo de dependencias y análisis adversarial —
> están fuera de la web. Este tramo los mete adentro. Al terminar, el que abre un plan
> lee el plan, no su resumen; y el índice deja de listar un conjunto de códigos que no
> tiene documentos detrás.

## Por qué

### El hallazgo

El repo contiene **dos conjuntos distintos de «22 PLANes»**, y `/planes` sirve el equivocado.

| | Códigos | Documentos | Datos estructurados |
|---|---|---|---|
| **Corpus** (`Iniciativas Estratégicas/`) | PLANJUS, PLANREP, PLANEB, PLANMON, PLANDIG, PLANSUS, PLANEDU, PLANSAL, PLANISV, PLANAGUA, PLAN24CN, PLANGEO, PLANEN, PLANSEG, PLANVIV, PLANCUL, PLANMESA, PLANTALLER, PLANCUIDADO, PLANMEMORIA, PLANTER, PLANMOV (+ PLANRUTA) | 23 documentos completos, 46.234 líneas | `DEPENDENCY_GRAPH.yml`, `COALITION_MAP.md`, `ANALISIS_CONEXIONES_22_PLANES.md` (1.124 l.), `COVERAGE_GAPS_ASSIGNMENTS.md`, `arquitecto-data.ts`, `strategic-initiatives.ts` |
| **Lo que sirve v2** (`content/planes/`) | PLANAMB, PLANBAR, PLANBIO, PLANCIE, PLANCOM, PLANCON, PLANCRI, PLANCUI, PLANGEN, PLANINS, PLANTIE, PLANTRA, PLANVEJ + 9 coincidentes (+ PLANRUTA) | 23 stubs de 20–24 líneas, 584 líneas en total | ninguno |

Los stubs entraron en un solo commit (`6df9cf6 — feat(ai+content): AICompleter seam + 23 PLANs as MDX`),
sin spec que los justifique y sin documentos detrás. La memoria de proyecto registra
`shared/arquitecto-data.ts` como *source of truth*, y `DEPENDENCY_GRAPH.yml` se declara
a sí mismo «autoridad sobre la prosa de los PLANes individuales» con
`canonical_count: 22_thematic_plus_PLANRUTA`. **El corpus es el canon; los stubs eran
andamio de arranque.**

### Cuatro stubs contradicen una decisión explícita del canon

`COVERAGE_GAPS_ASSIGNMENTS.md` (auditoría 2026-04-26) declara un freeze —
*«Freeze sigue activo. Sin PLANes nuevos»* — y asigna cada hueco de cobertura como
sub-mandato interno de un PLAN existente. Dos stubs de v2 son exactamente los huecos
que esa auditoría se negó a convertir en PLAN:

- **PLANVEJ** — el canon asigna *«Discapacidad y vejez → PLANCUIDADO + PLANSAL, sección interna»*.
- **PLANCIE** — el canon asigna *«Ciencia y tecnología (PLANCYT) → PLANEDU + PLANEB + PLANDIG, secciones internas»*.
- **PLANCRI** (Crisis preparada) duplica el kit de crisis que ya es PLANRUTA.
- **PLANGEN** y **PLANCON** no tienen correlato en el corpus.

### Lo que se recupera

Seis documentos que hoy no existen en ninguna forma dentro de v2:

| Documento | Líneas | Qué es |
|---|---|---|
| PLANAGUA | 4.473 | Soberanía Hídrica y Resiliencia Climática — el documento más largo del corpus |
| PLAN24CN | 3.033 | Fundación de 24 Ciudades Nuevas |
| PLANMOV | 2.206 | Movilidad, Logística y Conectividad Territorial |
| PLANGEO | 1.570 | Posicionamiento Geopolítico y Plataforma de Soberanía Exportable |
| PLANTALLER | 940 | Talleres Federales y Pertenencia Productiva Universal |
| PLANMEMORIA | 900 | Memoria Operativa, Vínculo Ancestral y No-Reversibilidad |

Más ocho que hoy aparecen renombrados y recortados: PLANTER (hoy «PLANTIE», sin
«Pueblos Originarios»), PLANCUIDADO (hoy «PLANCUI», achicado a primera infancia
cuando el documento cubre todo el ciclo de vida), PLANREP (hoy «PLANTRA», genérico
cuando el documento es específicamente la reconversión del empleo público), PLANVIV
(hoy «PLANBAR»), PLANMESA (hoy «PLANINS»), PLANDIG (hoy «PLANCOM»), PLANEN (hoy
«PLANENE»), y PLANISV + PLANAGUA fusionados en un único «PLANAMB» de 24 líneas.

### Nota sobre la spec 2.4

La spec de La prueba afirma que `strategic-initiatives.ts` «describe **otro** conjunto de
22 planes — solo ~8 códigos coinciden con el canon v2». La observación era correcta y la
conclusión se invierte al identificar cuál de los dos conjuntos es el canon:
`strategic-initiatives.ts` cubre **22/22 exacto** el corpus, y cada entrada apunta a su
documento con `documentFile: 'PLANJUS_Argentina_ES.md'`. El que estaba fuera del canon
era el conjunto de stubs. Las tres decisiones que la spec 2.4 derivó de ahí (sin chips
de categoría, sin búsqueda, sin paginación) **siguen en pie** y este tramo no las toca.

## Decisiones

**D1 — El taller y la edición.** `Iniciativas Estratégicas/` sigue siendo el taller: ahí
viven los documentos, el grafo, las auditorías y los gates, y ahí se sigue escribiendo.
`v2/content/planes/` es la **edición publicada**, derivada del taller por un script
re-ejecutable. El corpus no se edita en dos lugares: se edita en el taller y se
re-deriva.

**D2 — Un script de migración, no un parser en runtime.** La transformación corre una
vez, su salida se commitea y se revisa a ojo. El registry en runtime queda tonto: lee
frontmatter y cuerpo, nada más. Razón: los 23 documentos no son homogéneos (ver
Excepciones) y un parser tolerante en el cliente sería adivinación permanente.

**D3 — Se publica el documento con la ficha plegada.** El cuerpo editorial es la lectura
principal; la cabecera de auditoría y los parches post-auditoría se recomponen bajo un
único `## Ficha del expediente` al final, que el lector muestra plegado. Ni se tira
(contiene presupuesto canónico e instrumento legal, que el tramo B necesita) ni se pone
adelante (veinticinco líneas de `KILL_SCALE_GATES` y `PIA gate` antes de la primera
palabra dirigida a un lector).

**D4 — Los dos registros de título.** Cada documento trae en su portada un título
evocativo de dos líneas y un nombre institucional. La fila cerrada del índice muestra el
**evocativo**; el pliegue agrega el **institucional**. Ninguno de los dos lo escribe el
implementador: los dos están en la portada del documento.

**D5 — Los summaries vienen de v1.** `SocialJusticeHub/shared/strategic-initiatives.ts`
tiene los 22 `summary` ya escritos, uno por código, cada uno con `documentFile`
apuntando a su documento. Se copian verbatim. El summary de PLANRUTA es el del stub
actual, que ya es correcto («cómo se arranca la ejecución de los otros 22») y sobrevive
la migración. **Cero prosa nueva del implementador.**

**D6 — El orden es el estratégico.** `orderIndex` = `ordinal` de `arquitecto-data.ts`
(1–22, «orden estratégico de lanzamiento»). PLANRUTA queda en 0 con `isMeta: true`,
fuera de la cuenta, como ya está.

**D7 — Sin redirects.** Los 14 slugs de stub que mueren (`planamb`, `planbar`,
`planbio`, `plancie`, `plancom`, `plancon`, `plancri`, `plancui`, `planene`, `plangen`,
`planins`, `plantie`, `plantra`, `planvej`) no se preservan: v2 vive en el remote
`staging`, no en producción, y esas URLs nunca fueron públicas. Si el sitio se publica
antes de este tramo, la decisión se revisa.

**D8 — El bundle se parte.** Ver «Arquitectura de carga». No negociable: 5,1 MB de texto
crudo no entran en el bundle principal.

## La forma de cada archivo

`v2/content/planes/PLANJUS.mdx`:

```
---
slug: planjus
code: PLANJUS
title: 'La justicia que tenemos no es la justicia que merecemos'
nombreInstitucional: 'Plan Nacional de Justicia Popular y Resolución de Conflictos'
summary: 'El sistema judicial argentino tarda entre 3 y 11 años en resolver un caso…'
orderIndex: 1
isMeta: false
draft: false
---

# La justicia que tenemos no es la justicia que merecemos

<portada + PREÁMBULO + secciones 1..N, verbatim del corpus>

## Ficha del expediente

<cabecera de auditoría + parches post-auditoría, recompuestos>
```

Procedencia de cada campo:

| Campo | Fuente | Método |
|---|---|---|
| `slug` | código | minúscula del `code` |
| `code` | nombre de archivo del corpus | `PLANJUS_Argentina_ES.md` → `PLANJUS` |
| `title` | portada ASCII del documento | las dos primeras líneas, unidas en una |
| `nombreInstitucional` | portada ASCII del documento | la línea «Plan Nacional de…» |
| `summary` | `strategic-initiatives.ts` | copia verbatim del campo `summary` (PLANRUTA: del stub actual) |
| `orderIndex` | `arquitecto-data.ts` | campo `ordinal` (PLANRUTA: 0) |
| `isMeta` | — | `true` solo en PLANRUTA |
| `draft` | — | `false` en los 23 |

### El corte en tres

El script parte cada documento en:

1. **Cabecera de auditoría** — el blockquote contiguo (`> …`) del arranque, hasta el
   primer `---` de separación.
2. **Cuerpo editorial** — desde ahí hasta el primer heading de parche.
3. **Parches** — desde el primer `## …` que matchee `post-auditoría` / `Parche` /
   `Interconexiones` hasta el final.

(1) y (3) se concatenan bajo `## Ficha del expediente`, que es un string literal y
único: es el marcador que `PlanDetail` usa para plegar.

### Excepciones verificadas

Las tres se resuelven en el script, no en runtime:

- **PLANDIG** — abre con la portada ASCII **antes** del blockquote de auditoría. El
  corte 1 no puede asumir «primera línea = `>`».
- **PLANRUTA** — abre con `# PLANRUTA — Protocolo Nacional…` y su cabecera termina en la
  línea 13, no en la 28/48 como el resto.
- **PLANMOV** — su primer `## ` es `## Vigésimo Tercer Mandato del Proyecto ¡BASTA!`, no
  un `## PREÁMBULO`. Además ese título dice «Vigésimo Tercer» mientras `arquitecto-data.ts`
  le asigna `ordinal: 22`. **Es una discrepancia de contenido: se reporta al autor, no se
  corrige en la migración.**

Los 23 documentos tienen portada ASCII en code fence (2 a 12 fences por documento) y
todos tienen al menos un heading de parche. Verificado 2026-07-25.

## Arquitectura de carga

`plans-registry.ts` hoy hace `import.meta.glob(..., { eager: true })` sobre
`content/planes/*.mdx`. Con 584 líneas es gratis; con 5,1 MB mete el corpus entero en el
bundle principal de la home. Se parte en dos piezas:

**Índice — `apps/web/src/lib/planes-index.generated.ts`.** Solo el frontmatter de los 23,
emitido por el mismo script de migración. Eager, unos pocos KB. Es lo que consumen
`la-prueba-data.ts`, `landing-data.ts`, `la-idea-data.ts` y todo conteo visible. Mismo
patrón que `asciiVideoRegistry.generated.ts`, que ya existe en el repo.

**Cuerpos — glob sin `eager`.** Un `import()` por plan; `PlanDetail` carga solo el
documento que el visitante abrió, con el fallback de carga del papel.

**Guardia.** `pnpm planes:check` compara el índice generado contra el frontmatter
commiteado de cada `.mdx`, y además recompone cada uno de los 23 `.mdx` en memoria
desde su documento del taller y lo compara byte a byte contra lo commiteado.
Si alguien edita el generado a mano, o edita el taller sin re-derivar, CI falla.

La superficie pública del registry para los consumidores del índice no cambia:
`PLAN_REGISTRY`, `findPlanByCode`, `findPlanBySlug`, `PlanRegistryEntry` siguen
existiendo con la misma forma, más el campo nuevo `nombreInstitucional` y menos `body`,
que pasa a ser asíncrono y solo lo pide `PlanDetail`.

## Cambios en la página

**`IndicePlanes`** — la fila cerrada muestra `num · CÓDIGO (Anton 24) · título
evocativo`. El pliegue agrega el nombre institucional (mono 11px uppercase, tinta-50)
arriba del summary, y debajo el link «Leer el documento →». `FilaIndiceExpandible` no se
toca.

**`PlanDetail`** — el cuerpo se corta en `## Ficha del expediente`: lo de arriba al
`MdxPapel` de siempre, lo de abajo a un `<details>` cerrado rotulado *«Ficha del
expediente — presupuesto, instrumento legal, tranche, gates»*, dentro del mismo marco de
papel. En `@media print` la ficha sale abierta. El sello EJEMPLO, la edición impresa, el
backlink y el 404 EXTRAVIADO quedan como están.

**Nada más.** `PortadaPrueba`, `MetodoPrueba`, `CifrasStrip`, `PlanesTeaser` y el copy de
conteo se alimentan de `PLAN_COUNT`, que sigue dando 22. Ningún literal cambia de valor.

## Rutas

`/planes` y `/planes/:slug` ya existen en `App.tsx`; `PAPEL_ROUTES` ya incluye ambas.
**No se toca ninguna de las dos.** Los slugs nuevos son el código en minúscula
(`planjus`, `plan24cn`, `plancuidado`).

## Tests

- **Canon:** exactamente 22 entradas sin `isMeta` + exactamente 1 con `isMeta`.
- **Orden:** `orderIndex` único, contiguo 1–22 en los temáticos, 0 en el meta.
- **Campos:** `title`, `nombreInstitucional`, `summary` y `slug` no vacíos en los 23.
- **Procedencia:** cada `code` del índice tiene un `.mdx` y viceversa.
- **Ficha:** los 23 cuerpos contienen exactamente un `## Ficha del expediente`.
- **Guardia:** el índice generado coincide con el frontmatter de los archivos, y cada
  `.mdx` coincide con lo que el taller produce ahora mismo (re-derivado en memoria).
- **Índice (UI):** la fila cerrada muestra el evocativo; abierta, el institucional.
- **Lector:** la ficha se renderiza plegada y su contenido no aparece en el cuerpo principal.

Los tests existentes de `Planes.test.tsx`, `PlanDetail.test.tsx` e `IndicePlanes.test.tsx`
se actualizan a los códigos reales (hoy afirman `PLANSAL · prueba, no doctrina` en la
posición 01 — con el orden estratégico, la 01 pasa a ser PLANJUS).

## Fuera de alcance

- **El Arquitecto** (tramo B): ninguna vista, ningún grafo, ninguna dependencia
  renderizada. Este tramo solo deja el terreno consistente.
- **Chips de categoría, búsqueda y paginación** — siguen descartados por la spec 2.4, y
  este tramo no los revive aunque el corpus ahora sí tenga taxonomía en
  `strategic-initiatives.ts`. Es una decisión editorial del autor, no del implementador.
- **La página `/recursos/ruta` de v1** y el resto del port v1 de v2 (`UnaRutaParaArgentina/`,
  con su `PlanesGrid.tsx` hardcodeado a los 22 stubs). Se anota que queda inconsistente;
  su reconciliación es de su propia fase.

## Riesgos y puntos que requieren ojo humano

1. **La derivación de `title` desde la portada ASCII es heurística.** Las 23 salidas se
   revisan una por una en el diff de migración. No hay test que pueda validar que un
   título «suena bien».
2. **Acentuación irregular en el corpus.** Hay tramos sin acentuar («Redefinicion»,
   «acompanamiento», «Reconversion» — 17 casos solo en PLANSAL). Va como tarea propia al
   final del plan, con diff revisable: es corrección de contenido, no de código.
3. **Discrepancia PLANMOV** («Vigésimo Tercer Mandato» vs `ordinal: 22`): se reporta, no
   se corrige.
4. **Peso de página.** Un documento de 4.473 líneas (PLANAGUA) renderizado por `marked`
   en un solo `dangerouslySetInnerHTML` es un DOM grande. Se mide en el plan; si el
   render bloquea, la mitigación es paginar por sección, no recortar el documento.

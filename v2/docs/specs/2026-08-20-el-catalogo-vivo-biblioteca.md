# El catálogo vivo — rediseño del hub de la biblioteca

**Fecha:** 2026-08-20
**Página:** `/biblioteca` (hub 3.1). El lector 3.2 recibe un solo efecto (el señalador).
**Spec madre:** `docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md` — sigue vigente en todo lo que acá no se toca.
**Sistema:** `docs/design-system/README.md` v1.2 (ley).

> **Tesis.** El hub cumplió su spec — todo publicado, nada de humo — pero medido
> en producción mide 6.197px (~8,6 pantallas) sin una sola forma de moverse
> adentro: el índice de ensayos solo ocupa 2.521px (41% de la página) de filas
> idénticas, dos de los cinco estantes son cards oscuras gemelas píxel por
> píxel, y nada orienta la primera visita ni retoma la segunda. Este rediseño
> no agrega contenido: hace **legible el inventario, navegable el recorrido y
> retomable la lectura**, componiendo solo recetas que la ley ya sanciona.

## Lo medido (2026-08-20, viewport 720px)

| Sección | Altura | Problema |
|---|---|---|
| Portada | 397px | el inventario es un párrafo, no una puerta |
| Manifiesto | 194px | card suelta, sin encabezado de sección |
| Ensayos | 2.521px | 28 filas casi iguales; los 4 ciclos no funcionan como mojones |
| Entrenamientos | 1.011px | la única banda distinguible |
| Crónica | 194px | gemela exacta del manifiesto |
| Bitácora | 997px | 4 cards planas, sin jerarquía |
| Cierre | 216px | bien |

Tres causas: (1) los cinco estantes no comparten gramática de sección — dos
tienen `border-t-2`, dos son cards flotantes, uno es banda; (2) la única
navegación es el desplegable del header (hover); (3) el tamaño del corpus —
28 ensayos, 494 minutos de lectura reales — es invisible, y una visita que
vuelve arranca de cero.

## Las cinco intervenciones

### 1. El catálogo en la portada

El párrafo-inventario del lead se reemplaza por un **índice tipográfico con
puntos conductores** — el artefacto de imprenta que la metáfora de biblioteca
pedía. Cinco filas clicables que saltan a su estante:

```
01  El manifiesto ······················ documento fundacional
02  Los ensayos ················ 28 ensayos · 4 ciclos · 494 min
03  Los entrenamientos ······················ 31 entrenamientos
04  La crónica del país que viene ·············· 5 entregas
05  La bitácora ···································· 22 crónicas
```

- Los puntos son `border-bottom dotted` sobre un span flexible: tipografía,
  no decoración — llevan el ojo del nombre a la cifra, eso significa.
- **Todas las cifras salen de registries** (§7 de la ley): `ENSAYO_COUNT`,
  `CICLO_COUNT`, suma de `readingMinutes`, `CURSO_COUNT`,
  `CRONICA_CHAPTERS.length`, `BLOG_POSTS.length`. El manifiesto no tiene
  registry y queda verbal («documento fundacional») — Decisión 11 de la spec
  madre sigue firme.
- Si una suma da 0 (sin dato), el fragmento se omite — cifra sin dato (§5).
- El lead se acorta a dos frases y conserva «Robate todo.»

### 2. El fichero — franja fija con scroll-spy

Franja `sticky` bajo el header (`top-16`, z-30 — debajo del menú móvil z-40):
cinco links mono `§01 Manifiesto · §02 Ensayos · §03 Entrenamientos ·
§04 Crónica · §05 Bitácora`. La sección visible se entinta en violeta
(`aria-current="true"`); el resto tinta-50. Scroll horizontal en móvil.

- Scroll-spy con `IntersectionObserver`; el salto usa `saltarASeccion`
  (`lib/ir-al-principio.ts`), que ya respeta `prefers-reduced-motion`.
- Los `id` de sección **no cambian** (`#manifiesto` `#ensayos`
  `#entrenamientos` `#cronica` `#bitacora`): el desplegable del header y
  `/biblioteca#ensayos` siguen funcionando.
- `scroll-mt` de las secciones pasa de `20` a `32` (header 64px + franja
  ~40px + aire).
- Es `<nav aria-label="Secciones de la biblioteca">`.

### 3. Una sola gramática de sección

Primitiva local `EncabezadoEstante` (vive en `pages/Biblioteca/sections/` —
es gramática de esta página, no del sitio): `border-t-2 border-tinta` +
`§ 0N — {nombre}` en mono 11px + link derecho «ver todo →» cuando el estante
tiene catálogo detrás. Los cinco estantes la usan; los nombres son los
labels de `SECCIONES_BIBLIOTECA` (papel-nav) para que header, fichero y
página digan lo mismo.

**Las gemelas se divorcian:** el manifiesto conserva la única card oscura de
la página (gravedad de documento fundacional). La crónica pasa a card clara
— `border-2 border-tinta` sobre `bg-papel-crudo`, tag «Ficción especulativa»
en violeta sobre claro, y estrena meta real: «{5} entregas». La línea
keystone de D2 («No es una predicción…») queda verbatim.

### 4. La estantería de ciclos

El índice de ensayos se reorganiza en dos piezas:

**Las tapas.** Grilla 2×2 (juntas de 1px, receta §4) — una tapa por ciclo:
numeral romano gigante en Anton, rótulo, descripción de una línea, y
`{n} ensayos · {min} min · {fecha}` (minutos = suma real del ciclo). La tapa
es un botón (`aria-expanded` + `aria-controls`).

**El acordeón.** Debajo de la grilla se rinde el índice del ciclo abierto —
**uno por vez**, el mismo principio «una sola fila abierta por lista» que la
ley fija para `FilaIndiceExpandible`, un nivel arriba. Tocar una tapa abre
su ciclo (y cierra el anterior) y desliza hasta el índice; tocar la tapa del
ciclo abierto lo cierra. Las filas internas conservan `FilaIndiceExpandible`
tal cual (tesis + «Leer el ensayo completo → · min»).

- Default: abierto el ciclo del señalador si existe; si no, el primero.
- La sección baja de 2.521px a ~1.000px sin ocultar inventario: las tapas
  SON el inventario, el índice está a un toque.

### 5. La puerta de hoy + el señalador

Franja de tres puertas (grilla 1px de 3 celdas, colapsa a 1 columna en
móvil) entre el catálogo y §01 — los tres perfiles que la spec madre ya
nombra, hechos superficie:

| Puerta | Destino | Meta (real) |
|---|---|---|
| «¿Venís de cero?» | El manifiesto | «el espejo del movimiento» |
| «¿Venís a pensar?» | `ORDEN_DE_LECTURA[0]` | «Ciclo I · 01 · {min} min» |
| «¿Venís a ver qué pasó?» | La bitácora | «última crónica: {fecha}» |

**El señalador.** `lib/senalador.ts` guarda en
`localStorage['basta_senalador']` el slug del último ensayo abierto
(escribe `EnsayoDetail` al montar; guardas `try/catch` como
`sembrar-data.ts`). Cuando existe y el slug sigue en el registry, la puerta
del medio se reemplaza por:

> ESTABAS LEYENDO
> «{título}» — Ciclo {romano} · {pos} de {total}
> Retomar →

- Slug que ya no existe en el registry ⇒ se ignora (equivale a no tener).
- **Relación con la Decisión 2 de la spec madre** («leer no es un acto
  verificable», sin sello al terminar): aquella decisión prohíbe *afirmar*
  que leíste; el señalador solo recuerda *dónde estabas*. No cuenta nada, no
  muestra métrica, no sale del dispositivo, no da XP. El lector sigue sin
  sello.

## Lo que este rediseño NO hace (paquete elegido)

Sin búsqueda «buscar:», sin tally de leídos con Palitos, sin edición impresa
del hub. Quedan anotados como extensiones posibles; ninguna bloquea a las
cinco intervenciones.

## Estructura resultante

```
Biblioteca.tsx (composición fina, sin lógica)
├── FicheroBiblioteca          (nuevo — franja sticky scroll-spy)
├── PortadaBiblioteca          (rehecha — lead corto + CatalogoIndice)
├── PuertaDeHoy                (nueva — 3 puertas / señalador)
├── ManifiestoDestacado        (encabezado §01; card oscura igual)
├── IndiceEnsayos              (rehecha — §02 + tapas + acordeón)
├── EntrenamientosCurados      (encabezado §03; banda igual)
├── CronicaDestacada           (rehecha — §04 + card clara + entregas)
├── BitacoraReciente           (§05; 1 destacada + 3 filas slim)
└── CierreBiblioteca           (sin cambios)
```

Derivaciones nuevas en `biblioteca-data.ts` (todas puras, todas testeadas):
`minutosDeCiclo` (suma por ciclo), `MINUTOS_TOTALES`, `ENTREGA_COUNT`,
`PRIMER_ENSAYO`, `ULTIMA_CRONICA`, split destacada/resto de la bitácora.
`lib/senalador.ts` es módulo propio porque lo comparten dos páginas.

## Decisiones

1. **Leaders con `border-bottom dotted`**, no imágenes ni pseudo-contenido
   repetido: escala con el ancho, imprime bien, cero assets.
2. **Fichero sticky z-30 / top-16**; `scroll-mt-20 → scroll-mt-32` en los
   cinco `id`. Los `id` y `/biblioteca#ensayos` no cambian.
3. **Gramática única** `EncabezadoEstante`; nombres = labels de
   `SECCIONES_BIBLIOTECA`. La numeración in-page es § 01–05 (capítulos de una
   página, §4 de la ley); los expedientes 05.1–05.5 siguen siendo del sitio.
4. **Una sola card oscura por página**: manifiesto. La crónica pasa a claro
   con borde duro. Menos superficies oscuras, gemelas distinguibles de un
   vistazo.
5. **Acordeón por ciclo, uno abierto**, default señalador-o-primero. La
   alternativa «todo visible» se descartó con el usuario (2026-08-20): la
   página completa bajaba solo si el índice se pliega.
6. **Señalador sin métricas**: clave `basta_senalador`, valor = slug crudo.
   Escribe el lector, lee el hub, valida contra el registry. Decisión 2 de
   la spec madre queda intacta (ver §5 arriba).
7. **Ningún número literal en JSX** — regla vigente de la spec madre,
   extendida a las cifras nuevas (494, 5, 31, 22 son *hoy*, no constantes).
8. **Motion**: todo entra con `fadeup` escalonado ya existente; el rito de
   la tinta del H1 sigue siendo la única firma. Sin keyframes nuevos.
9. **Bitácora con jerarquía**: la crónica más reciente conserva el
   tratamiento actual (título xl + resumen); las otras tres pasan a fila de
   índice slim (fecha mono + título + →). El link «ver la bitácora entera»
   sube al encabezado de estante.

## Accesibilidad y estados

- Fichero: `<nav>` con links reales; foco visible violeta; activo con
  `aria-current`. Sin observer (SSR/test) el fichero rinde sin resaltado.
- Tapas: botones con `aria-expanded`/`aria-controls`; el panel del ciclo es
  un `region` con `aria-labelledby` a su tapa.
- Reduced motion: saltos instantáneos (ya resuelto por `saltarASeccion`);
  `fadeup` lo desactiva la regla global existente.
- Storage bloqueado (Safari privado): el señalador simplemente no aparece;
  nada se rompe (guardas `try/catch`).
- Registries vacíos: el catálogo omite el fragmento numérico; las puertas 2
  y 3 no se rinden si no hay primer ensayo / última crónica.

## Tests

- `biblioteca-data.test.ts`: sumas por ciclo y total; `ENTREGA_COUNT` ≥ 1;
  `PRIMER_ENSAYO` = primer eslabón de `ORDEN_DE_LECTURA`; split de bitácora.
- `senalador.test.ts`: round-trip, JSON roto, storage ausente, slug fantasma.
- `FicheroBiblioteca.test.tsx`: cinco links; activo marcado con IO mockeado.
- `PuertaDeHoy.test.tsx`: tres puertas fijas sin señalador; retomar con
  posición correcta con señalador presente; señalador fantasma ⇒ puertas
  fijas.
- `IndiceEnsayos.test.tsx` (rehecho): 4 tapas; abrir una cierra la otra;
  filas del ciclo abierto presentes, del cerrado ausentes.
- `Biblioteca.test.tsx` (ajuste): la página compone fichero + puertas + los
  cinco estantes con sus encabezados § 01–05.

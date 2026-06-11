# Rediseño visual: Home + chrome global — "Plata editorial, vidrio, momentos cinemáticos"

**Fecha:** 2026-06-10
**Estado:** Aprobado por el usuario
**Alcance:** Página Home (`client/src/pages/Home.tsx`) + componentes de chrome global compartidos (`Header.tsx`, `HeroCinema.tsx`, share flotante). Primera entrega del rediseño profundo página por página; las demás páginas públicas heredarán este sistema en entregas posteriores.

## Diagnóstico (por qué)

Auditoría visual en vivo (desktop 1280px y mobile 375px) detectó:

1. **Indisciplina cromática**: Home usa azul, esmeralda, ámbar, rojo, púrpura y cyan como acentos simultáneos. Cada feature card define 8 clases de color propias. Nada lee como marca (violeta iris `#7D5BDE`).
2. **Tratamientos tipográficos múltiples**: gradientes de título distintos por sección (azul→cyan→verde, púrpura→azul, azul→púrpura→verde), serif italic, sans black, mono badges.
3. **Header que se vuelve blanco al scrollear** (`bg-white/90`) sobre páginas negras — choque violento; además clipea títulos de sección.
4. **Colisiones de elementos flotantes**: COMPARTIR pisa el CTA del footer; en mobile el FAB de chat pisa el CTA secundario del hero y el indicador "DESCUBRIR" pisa el botón "Ver los 22 planes".
5. **Vacíos verticales excesivos** (`py-28/36` + espaciadores) conviviendo con párrafos densos.
6. **Carga de motion alta**: animaciones de scale en cards, transiciones de 500ms, blobs múltiples por sección con blur grande.

## Dirección aprobada

Mezcla de tres estéticas **con roles asignados** (no compiten):

- **Plata editorial = identidad base.** Fondo `#0a0a0a`, títulos display monumentales con gradiente plata (argentum — el hombre gris es plata, no acero). Aire, párrafos cortos.
- **Vidrio refinado = material de superficies.** UN solo estilo de card. El vidrio es material, no decoración.
- **Cinemático = momentos, no método.** Motion coreografiado solo en hero y cierre, con presupuesto estricto.

## Tokens del sistema

Definidos como constantes/clases reutilizables (en `client/src/lib/` o clases Tailwind documentadas):

| Token | Valor | Uso |
|---|---|---|
| Acento (acción) | `#7D5BDE` violeta iris (`violet-500`-adyacente) | CTAs, links, hovers, focus. ÚNICO color de acción |
| Gradiente display | `bg-gradient-to-b from-white via-slate-200 to-slate-400` | ÚNICO tratamiento de título display (línea destacada de H1/H2) |
| Card de vidrio | `bg-white/[0.03] border border-white/10 rounded-2xl` | TODAS las cards |
| Card hover | `border-white/25` + `-translate-y-1` + glow violeta sutil (`shadow-[0_0_40px_rgba(125,91,222,0.10)]`), 300ms | Único hover de card |
| Badge de sección | `bg-white/5 border border-white/[0.08] text-slate-400 uppercase tracking-[0.3em] text-[11px]` | Único estilo de badge/kicker |
| Pull-quote | `font-serif italic text-slate-300/90` | Único tratamiento de cita |
| Punto semántico de status | dot 6px: emerald (en vivo), amber (construcción), neutro (ejercicio) sobre chip neutro | Status badges — el color informa, no decora |
| Ritmo de sección | `py-20 md:py-28` | Reemplaza `py-28 md:py-36` |
| Blob ambiental | máx. 1 por sección, familia violeta/slate, opacidad ≤ 0.06 | Reemplaza blobs azul/esmeralda/púrpura múltiples |

**Presupuesto de motion:** solo variants de `lib/motion-variants.ts` (`fadeUp`, `staggerContainer`, etc.); `whileInView` con `once: true`; sin animaciones de `scale` en cards; sin loops infinitos; transiciones de hover a 300ms; sin blur animado.

## Cambios por componente

### Header (`components/Header.tsx`)

- En páginas oscuras, estado scrolleado: `bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.08]` con texto claro (hoy: `bg-white/90` con texto oscuro).
- El modo blanco (`showSolid` claro) queda exclusivamente para páginas con fondo claro real (`!isDarkPage`).
- Botón "Unirse" pasa de azul a violeta acento.

### HeroCinema (`components/HeroCinema.tsx`)

- Indicador de scroll "DESCUBRIR": oculto en mobile (`hidden md:flex`) — hoy se superpone con el CTA secundario.
- CTA primario violeta; CTA secundario vidrio neutro (sin cambios estructurales).
- Entrada: stagger fade-up único; eliminar cualquier loop infinito salvo el bounce sutil del indicador en desktop.

### Share flotante (en `Home.tsx`)

- Se oculta cuando el footer entra en viewport (IntersectionObserver o umbral de scroll calculado) — hoy pisa "Sumarme al movimiento".
- En mobile: solo ícono (ya parcialmente así), apilado en columna única con el FAB de chat, espaciado fijo (sin superposición).
- Gradiente azul→púrpura se reemplaza por violeta sólido.

### Home — Sección 1: Hero

- Estructura intacta (es lo mejor del sitio).
- Highlight de **¡BASTA!**: violeta sólido (hoy gradiente azul→púrpura).
- Primer párrafo del subtítulo: acortar a ~3 líneas en mobile (recorte de copy, conservando voz rioplatense).
- `selection:bg-blue-500/30` → violeta.

### Home — Sección 2: "Lo que ya existe"

- H2: primera línea blanca, segunda línea gradiente plata (muere azul→cyan→verde).
- Badge de sección: estilo único neutro (muere `text-blue-300/70`).
- Tríptico DISEÑA/ADMINISTRA/EJECUTA: tres cards idénticas de vidrio neutro; verbo en blanco `font-black` con regla fina violeta debajo (`h-px w-8 bg-[#7D5BDE]` o similar). Mueren los tres colores.
- Feature cards 2×2: card de vidrio única; sin top accent line de color; sin borde tintado; ícono en chip neutro (`bg-white/5 text-slate-300`); "Entrar →" en violeta; status badge = punto semántico. El objeto `features` pierde sus 8 campos de color.
- Dot-grid de fondo: eliminado. Blobs: 1 violeta/slate.

### Home — Sección 3: "Por qué es distinto"

- Layout intacto.
- Bordes izquierdos: todos `border-l-white/25` (mueren azul/ámbar/verde).
- Ghost numbers: `text-white/[0.04]` (mueren los tintados).
- H2: segunda línea gradiente plata (muere púrpura→azul).
- Cita de cierre serif italic: se mantiene tal cual (es el patrón de pull-quote canónico).

### Home — Sección 4: "El método"

- Cards = card de vidrio única; mueren accent lines y colores por fase.
- Nodos del timeline: todos violeta; línea conectora `bg-white/10` plana (muere el degradé tricolor).
- Íconos en chip neutro. Ghost numbers neutros.
- Títulos de card con `text-balance` (arregla el wrap feo de "La construcción").
- H2: segunda línea gradiente plata.

### Home — Sección 5: "Tu turno" (clímax violeta)

- Atmósfera: gradiente de fondo pasa de azul (`via-[#10132a]` + blob azul) a violeta profundo (ej. `via-[#15102a]` + blob violeta).
- CTA final: violeta con glow violeta — el único punto de la página donde el acento se enciende a full intensidad.
- H2: segunda línea gradiente plata.
- Link secundario: violeta claro.

## Qué NO cambia

- Copy y voz (salvo el recorte del párrafo del hero).
- Estructura de secciones, orden narrativo, rutas.
- Footer (se revisará al propagar el sistema; solo cambia el comportamiento del share que lo pisa).
- Status semántico de las herramientas (en vivo / construcción / ejercicio) — solo su expresión visual.

## Criterios de éxito

1. En Home no existe ningún acento de color que no sea: violeta (acción), plata (identidad), o un punto semántico de status.
2. Un solo estilo de card, badge, título display y pull-quote en toda la página.
3. Header nunca muestra fondo blanco sobre página oscura.
4. Cero superposiciones de elementos flotantes en 375px y 1280px.
5. `npm run check` y `npm run build` pasan.
6. Verificación visual en preview (desktop + mobile) sin regresiones de layout.

## Trabajo futuro (fuera de este spec)

- Propagación del sistema a las 6 páginas públicas restantes (La Visión, Una Ruta Para Argentina, El Hombre Gris, La Semilla, Manifiesto, Apoyá).
- Fix de overflow horizontal (doc 868px > viewport 800px), layout shift del carrusel y carga de motion en `/recursos/ruta` — página con problemas de rendering propios que merece su propia entrega.
- Revisión del Footer al propagar.

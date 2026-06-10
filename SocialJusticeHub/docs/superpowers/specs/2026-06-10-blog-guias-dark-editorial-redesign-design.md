# Rediseño total: Blog + Guías de Estudio — plata editorial oscuro

**Fecha:** 2026-06-10
**Estado:** Aprobado (diseño validado en conversación)
**Alcance:** 6 páginas + capa editorial compartida

## Problema

El Home y las páginas públicas usan el sistema de diseño "plata editorial" oscuro
(`bg-[#0a0a0a]`, glassmorphism, violeta `#7D5BDE` como única acción, gradiente plata
como identidad). El Blog y las Guías de Estudio quedaron en tema claro
(`bg-slate-50 theme-light`) con un lenguaje visual anterior (gradientes indigo/purple,
emerald como acción): parecen otro sitio. Además faltan piezas básicas de experiencia
de lectura: tabla de contenidos, posts relacionados, tiempo de lectura real.

## Decisiones tomadas

1. **Tema:** migración completa a oscuro plata editorial (no híbrido, no claro pulido).
2. **Alcance:** todo el flujo — `BlogVlog`, `BlogPostDetail`, `StudyGuides`,
   `CourseDetail`, `LessonView` y `QuizView` (6 páginas).
3. **Features nuevas:** tabla de contenidos con scroll-spy, tipografía editorial
   refinada, posts relacionados, tiempo de lectura calculado.
4. **Enfoque:** rediseño total (opción C) — layouts nuevos donde aporta, no solo
   re-skin, pero conservando la lógica de datos y navegación existente.

## Arquitectura

### Capa editorial compartida (se construye primero)

Componentes nuevos en `client/src/components/editorial/`:

| Componente | Responsabilidad |
|---|---|
| `ArticleTOC.tsx` | Extrae h2/h3 del contenido renderizado, sticky en desktop (columna derecha), chip colapsable en mobile, scroll-spy con IntersectionObserver, indicador activo violeta. Recibe `containerRef` del contenedor de prosa. |
| `ReadingProgress.tsx` | Barra fija superior de 2px, gradiente plata → violeta, ancho según scroll del artículo. Reemplaza la barra indigo/purple actual de BlogPostDetail. |
| `RelatedPosts.tsx` | "Seguí leyendo": 2–3 posts de la misma categoría (excluye el actual), cards glass compactas. Fetch por categoría con react-query. |

Modificaciones a componentes existentes:

- **`MarkdownRenderer.tsx`** — prop `variant?: 'light' | 'dark'` (default `'light'`
  por compatibilidad con otros usos). La variante dark define la prosa editorial:
  - Headings serif (`Playfair Display`) en `mist-white` (#F5F7FA).
  - Cuerpo `text-slate-300 leading-relaxed`, contenedor con medida ~68ch
    (`max-w-prose` ajustado).
  - Links violeta `#7D5BDE` (única acción), hover con subrayado.
  - Blockquotes: glass card (`bg-white/5 border border-white/10 rounded-2xl`)
    con borde izquierdo plata (`border-l-2 border-l-silver`).
  - Código inline: JetBrains Mono sobre `bg-white/10`; bloques `pre` se mantienen
    oscuros (ya lo están).
  - `hr`: divisor gradiente plata (`h-px bg-gradient-to-r from-transparent
    via-silver/40 to-transparent`).
  - Imágenes: `rounded-2xl` con borde `border-white/10`.
- **`QuizQuestion.tsx`** — variante dark (mismo mecanismo de prop) para opciones,
  estados correcto/incorrecto y feedback.
- **Tiempo de lectura**: helper `readingTime(content: string)` en
  `client/src/lib/course-utils.ts` o nuevo `lib/editorial-utils.ts`
  (~200 palabras/min, español). Reemplaza el "5 min lectura" hardcodeado.
- **Dropcap**: clase utilitaria aplicada al primer párrafo solo en BlogPostDetail
  (no en lecciones ni quiz).

### Las 6 páginas

**1. BlogVlog (hub) — revista editorial oscura**
- Fondo `bg-[#0a0a0a]`, orbes ambientales sutiles (patrón del Home:
  `bg-*-500/[0.04] blur-3xl`).
- Hero: título serif con gradiente plata, subtítulo `slate-400`.
- Post destacado full-bleed: imagen con overlay degradado hacia `#0a0a0a`,
  título serif grande superpuesto, metadata mínima.
- Barra de filtros sticky en glass (`bg-white/5 backdrop-blur-xl border-white/10`):
  tabs Todo/Blog/Vlog, búsqueda, pills de categoría — misma lógica actual.
- Grilla asimétrica conservada (`md:col-span-2` para destacados) con cards glass
  oscuras: imagen con zoom al hover, pill de categoría en color dark-intensity,
  tiempo de lectura calculado, glow al hover (patrón feature-cards del Home).
- Infinite scroll sin cambios.

**2. BlogPostDetail — lectura inmersiva**
- Hero nuevo: imagen del post como fondo ambiental (blur + capa oscura, fundido
  inferior a `#0a0a0a`); si no hay imagen, orbes de gradiente. Título serif
  `clamp()`, breadcrumb, metadata en una fila (autor, fecha, lectura calculada,
  vistas).
- `ReadingProgress` arriba.
- Cuerpo a dos columnas en desktop (`lg:grid-cols-[1fr_240px]`): prosa dark
  centrada ~68ch + `ArticleTOC` sticky a la derecha. En mobile, TOC colapsable
  arriba del contenido.
- Dropcap en el primer párrafo.
- Acciones (tags, like, bookmark, compartir) en UNA sola fila al final del
  artículo — se elimina la duplicación actual header/footer.
- Embed de YouTube (vlogs) y `BlogMediaSection` se conservan, contenedores glass.
- Después del artículo: `RelatedPosts`, luego `CommentsSection` restyleada
  en glass oscuro.

**3. StudyGuides (hub) — biblioteca oscura**
- Hero plata (título serif gradiente), stats si hay sesión.
- Banner "Continuá donde dejaste": glass con acento violeta (no emerald).
- Barra de filtros sticky glass, misma lógica de categorías y búsqueda.
- Cards de curso: glass oscuro, imagen/placeholder con gradiente del color de
  categoría, badge de nivel (intensidades dark), barra de progreso violeta,
  check emerald solo para "Completado", glow al hover.
- Secciones por categoría con divisores gradiente plata.

**4. CourseDetail — timeline de lecciones**
- Header: breadcrumb, título serif, descripción, metadata.
- La lista de lecciones se convierte en **timeline vertical**: nodos numerados
  con línea conectora; completada = nodo violeta lleno con check, actual/disponible
  = anillo violeta, bloqueada = atenuada (`opacity-50`) con ícono de candado y
  tooltip/texto del prerequisito — el bloqueo por fin se comunica visualmente.
- Sidebar sticky (desktop): progreso del curso, stats (duración, lecciones, quiz),
  CTA violeta "Comenzar/Continuar". En mobile el sidebar pasa arriba del timeline.
- Card del quiz al final del timeline como nodo especial (ícono Award).

**5. LessonView — modo enfoque**
- Chrome mínimo: header compacto con breadcrumb y progreso del curso.
- Dos columnas desktop: prosa dark (~68ch) + `ArticleTOC`.
- Video lessons: `VideoPlayer` en contenedor glass 16:9.
- Navegación anterior/siguiente como cards glass al pie (título de la lección
  vecina visible), CTA violeta "Marcar como completada".
- Tracking de tiempo y lógica de completado sin cambios.

**6. QuizView — examen en modo enfoque**
- Tres estados conservados (instrucciones / examen / resultados), todos dark.
- Instrucciones: glass card con stats del quiz como pills (preguntas, mínimo
  para aprobar, tiempo, reintentos), CTA violeta "Comenzar Quiz".
- Examen: barra de progreso plata→violeta, timer visible, `QuizQuestion` dark;
  grid de navegación de preguntas con estados: respondida = violeta lleno,
  actual = anillo violeta, pendiente = `bg-white/10`.
- Resultados: score grande serif con gradiente plata, aprobado/desaprobado con
  semántica emerald/red en intensidades dark, desglose por pregunta, animación
  `bloom` de motion-variants al aprobar.

## Semántica de color

| Color | Rol |
|---|---|
| Violeta `#7D5BDE` | Única acción: CTAs, links, estados activos, nodos de progreso |
| Plata (gradiente) | Identidad: títulos hero, divisores, barra de lectura |
| Emerald | Solo semántica "completado" (checks, badge aprobado) |
| Red | Solo semántica de error/desaprobado |
| Colores de categoría | Se mantienen, en intensidades dark (`/10` bg, `/20` border, `-400` texto) |

## Qué se conserva (sin cambios de lógica)

Rutas wouter, fetching react-query, infinite scroll, filtros/búsqueda, tracking
de progreso de cursos, lógica de lessons/quiz/locking, `ShareButtons` y
`LikeButton` (solo restyle), variantes de `motion-variants.ts`, `Header`/`Footer`
(ya funcionan sobre oscuro), SEO/metadata de páginas.

Se elimina en estas páginas: clase `theme-light`, gradientes indigo/purple del
hero del post, duplicación de botones de acción en BlogPostDetail.

## Manejo de errores y estados

Los estados de loading/error/empty de cada página se restylean a dark (spinners,
mensajes, empty states con glass cards) — misma lógica, nuevo skin. `ArticleTOC`
no se renderiza si el contenido tiene menos de 3 headings. `RelatedPosts` no se
renderiza si no hay posts de la misma categoría.

## Verificación

- `npm run verify` (check TypeScript + check:routes + build) por tarea.
- Verificación visual con preview: screenshots desktop y mobile de las 6 páginas
  (hub blog, post, hub guías, curso, lección, quiz).
- Contraste AA: cuerpo `slate-300` sobre `#0a0a0a` cumple; verificar pills y
  badges de categoría en intensidades dark.
- Smoke manual del flujo: hub → post → relacionado; hub guías → curso → lección
  → quiz → resultados.

## Fuera de alcance

- Modo claro / toggle de tema.
- Bookmark real (el handler sigue stub), bio de autor, certificados de curso,
  búsqueda dentro de lecciones, glosario.
- Cambios al backend o a los contenidos.

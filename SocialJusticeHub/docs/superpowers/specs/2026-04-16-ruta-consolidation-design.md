# Consolidación: Una Ruta Para Argentina

**Fecha:** 2026-04-16
**Objetivo:** Unificar las páginas Una Ruta Para Argentina, El Arquitecto e Iniciativas Estratégicas en una sola página larga dentro de la sección de recursos.

## Contexto

Actualmente existen tres páginas independientes:
- `/una-ruta-para-argentina` — 5 capítulos cinematográficos (mini novela gráfica del futuro)
- `/recursos/el-arquitecto` — sistema de planificación estratégica con 10 tabs
- `/recursos/iniciativas` — catálogo filtrable de iniciativas estratégicas

El usuario quiere consolidarlas en una única experiencia narrativa que cuente el ejercicio completo: las iniciativas documentadas, la herramienta que las analiza, y la historia que imagina su aplicación.

## Nueva ruta

`/recursos/ruta`

## Estructura de la página

### 1. Hero Section — Contexto narrativo
- Dark theme (`bg-[#0a0a0a]`) con gradientes sutiles
- Título: "Una Ruta Para Argentina"
- Texto narrativo explicando el ejercicio: iniciativas estratégicas bien documentadas usando Diseño Idealizado, una herramienta llamada El Arquitecto que combina todas las iniciativas para determinar dependencias y ruta crítica, y una mini novela gráfica que cuenta desde el futuro cómo se aplicaron. Un ejercicio para visualizar otro camino posible para Argentina.
- Sin Header/Footer propios — la página usa el layout estándar con Header y Footer

### 2. Sección "Iniciativas Estratégicas" — Catálogo filtrable
- Contenido actual de `IniciativasEstrategicas.tsx` adaptado a dark theme
- Búsqueda + filtros por categoría + grid de InitiativeCards
- Cards adaptadas a dark theme (glassmorphism en lugar de white cards)
- Click en una card navega a `/recursos/ruta/iniciativas/:slug`
- Sección de metodología (Diseño Idealizado) se mantiene, adaptada a dark

### 3. Sección "El Arquitecto" — Sistema de planificación
- Contenido actual de `ElArquitecto.tsx` embebido
- Las 10 tabs se mantienen tal cual (ya son dark theme)
- Tab nav sticky dentro de su sección
- Sin hero propio — el contexto ya lo da el hero de la página
- Todos los sub-componentes en `components/arquitecto/` se reutilizan sin cambios

### 4. Sección "Imaginá Qué Pasaría" — Capítulos cinematográficos
- Los 5 capítulos con CinematicScroll
- Paletas, títulos y contenido narrativo se mantienen exactos
- Modo inmersivo se activa al entrar en esta sección (IntersectionObserver), no al cargar la página
- Al salir de la sección (scroll up o navegación), se desactiva el modo inmersivo

## Cambios en routing (App.tsx)

### Eliminar
- `/una-ruta-para-argentina` → redirect a `/recursos/ruta`
- `/recursos/el-arquitecto` → redirect a `/recursos/ruta`
- `/recursos/iniciativas` → redirect a `/recursos/ruta`

### Agregar
- `/recursos/ruta` → nueva página consolidada
- `/recursos/ruta/iniciativas/:slug` → IniciativaDetalle (reutiliza componente existente)
- `/recursos/ruta/iniciativas/:slug/documento` → IniciativaDocumento (reutiliza componente existente)

### Redirects legacy
```tsx
<Route path="/una-ruta-para-argentina">{() => <Redirect to="/recursos/ruta" />}</Route>
<Route path="/recursos/el-arquitecto">{() => <Redirect to="/recursos/ruta" />}</Route>
<Route path="/recursos/iniciativas">{() => <Redirect to="/recursos/ruta" />}</Route>
<Route path="/recursos/iniciativas/:slug">{(params) => <Redirect to={`/recursos/ruta/iniciativas/${params.slug}`} />}</Route>
<Route path="/recursos/iniciativas/:slug/documento">{(params) => <Redirect to={`/recursos/ruta/iniciativas/${params.slug}/documento`} />}</Route>
```

## Cambios en navegación (Header.tsx)

### Eliminar del navItems
- `{ label: 'Ruta', href: '/una-ruta-para-argentina' }`
- `{ label: 'Arquitecto', href: '/recursos/el-arquitecto' }`

### Eliminar de darkHeroRoutes
- `/recursos/el-arquitecto`

## Cambios en Resources.tsx

- La card de Iniciativas Estratégicas ahora linkea a `/recursos/ruta` en lugar de `/recursos/iniciativas`
- Actualizar texto si es necesario para reflejar que es la página consolidada

## Archivos

### Crear
- `pages/UnaRutaParaArgentina.tsx` — reescritura completa como página consolidada

### Eliminar (después de confirmar que todo funciona)
- `pages/ElArquitecto.tsx` — contenido absorbido
- `pages/IniciativasEstrategicas.tsx` — contenido absorbido

### Sin cambios
- `components/arquitecto/*` — se reutilizan tal cual
- `components/iniciativas/*` — se reutilizan tal cual
- `shared/strategic-initiatives.ts` — datos sin cambios
- `shared/arquitecto-data.ts` — datos sin cambios
- `lib/initiative-utils.ts` — utilidades sin cambios
- Cinematic scroll library — sin cambios

## Consideraciones técnicas

- **Lazy loading:** Las secciones pesadas (Arquitecto tabs, Iniciativas grid) se cargan con `React.lazy()` o dynamic imports para no penalizar el tiempo de carga inicial
- **Dark theme adaptation:** IniciativasEstrategicas actualmente usa light theme (bg-slate-50, white cards). Necesita adaptarse a dark theme con glassmorphism
- **CinematicScroll inmersión:** El modo inmersivo (oculta header) se activa solo cuando el usuario llega a la sección de capítulos, usando IntersectionObserver
- **Scroll anchors:** Cada sección tiene un id para permitir navegación directa (ej: `/recursos/ruta#arquitecto`)

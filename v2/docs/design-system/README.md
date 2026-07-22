# ¡BASTA! — Sistema de diseño «Papel y Tinta»
Versión 1.1 · julio 2026 · fuente de verdad para todas las páginas del sitio.

Identidad en una frase: **un manifiesto impreso que cobró vida** — papel crudo, tinta negra, un violeta eléctrico que marca lo que importa y un sello rojo que interrumpe. Cero decoración: todo lo que se ve significa algo.

---

## 1. Marca

- Wordmark: `¡BASTA!` en Anton. Los signos `¡` `!` SIEMPRE en violeta (#5227CC); las letras en tinta.
- Tagline del header: contador social vivo — `{N} voces · falta la tuya` (Space Mono 10px, uppercase, #7A756A). Nunca "movimiento ciudadano" ni slogans pasivos: el tagline debe dejar afuera al que no participó.
- Firma de autor en textos largos: `— El hombre gris`.
- Footer: wordmark gigante en outline (`color:transparent; -webkit-text-stroke:1px #3A362D`).
- Sin logo gráfico, sin íconos decorativos, sin emojis. Los únicos "gráficos" permitidos: el mapa de Argentina, tally marks, la semilla SVG del certificado, flechas tipográficas (→ ↗ ↺ ▌).

## 2. Color (hex literales, siempre inline)

Papel (fondos claros)
- `#F2EFE7` papel — fondo base de todo el sitio
- `#FBFAF4` papel crudo — paneles, cards alternas, bandas suaves
- `#ECE8DC` papel presionado — hover de filas/celdas
- `#E4E0D3` relleno del mapa
- `#D8D4C8` borde suave / divisores secundarios

Tinta (texto sobre claro)
- `#16130E` tinta — títulos, texto principal, bordes duros, botones oscuros
- `#33302A` tinta 90 — cuerpo de lectura
- `#4A463D` tinta 75 — cuerpo secundario
- `#7A756A` tinta 50 — metadatos, kickers neutros
- `#B5B1A8` tinta 30 — numeración, notas al pie, deshabilitado

Página oscura (El mandato, bandas CTA, footer)
- fondo `#16130E` · texto `#F2EFE7` · secundario `#C9C5BA` · meta `#8E8A82` · tenue `#5C594F` · bordes `#3A362D` · barras vacías `#241F17`

Acentos (con significado fijo — no mezclar)
- `#5227CC` violeta = la marca, lo accionable, "sueño". Hover: `#3D1BA3`. En oscuro usar `#9D85E8`.
- `#C23B22` rojo sello = urgencia, "basta", sellos NO ES DOCTRINA / EJEMPLO, crítica
- `#1A7A4A` verde = "compromiso", territorio, logrado
- `#A16C00` ámbar = "necesidad", método, advertencia media
- `#0F6B8A` cian = "recurso"
- Máximo 1–2 fondos de color por página. El violeta nunca es fondo de página entera, solo bandas CTA.

## 3. Tipografía (Google Fonts)

```
Anton (display) · Archivo (texto, 300–800 + itálica) · Space Mono (400/700)
```
- **Anton**: títulos y cifras. H1 `clamp(44px,6vw,88px)`, hero `clamp(120px,17.5vw,300px)`, H2 `clamp(36px,4.6vw,64px)`, títulos de card 22–34px. `line-height` 0.94–1.1. Nunca en cuerpo de texto.
- **Archivo**: todo el cuerpo. Lectura 17px/1.75; UI 14–16px/1.5–1.6; leads 18–19px.
- **Space Mono**: kickers, metadatos, botones, tags, números de expediente. Kicker canónico: `font-size:11px; letter-spacing:0.16em; text-transform:uppercase` + color de acento o tinta 50.
- Mínimos: cuerpo ≥14px, meta ≥10px. `text-wrap:pretty` en párrafos.
- Citas con comillas angulares «así», nunca "rectas".

## 4. Layout

- Contenedores: páginas anchas `max-width:1440px`; documentos/índices `1100px`; lectores `760–860px`. Padding lateral 40px (20px móvil, clase `.v2-pad`).
- **Cero border-radius. Cero sombras** (única excepción: papel sobre página oscura, `box-shadow:0 24px 60px rgba(0,0,0,0.45)`).
- Bordes: duros `1px/2px solid #16130E`; suaves `#D8D4C8` (claro) / `#3A362D` (oscuro).
- Grillas de cards: `display:grid; gap:1px; background:#16130E; border:1px solid #16130E` con celdas de papel (la tinta se ve por las juntas).
- Ritmo de sección: kicker mono → título Anton → cuerpo acotado (max-width 560–720px) → CTA. Secciones numeradas `§ 01 —` cuando son capítulos de una misma página.
- Siempre flex/grid con `gap`; nunca espaciar con márgenes sueltos entre hermanos.
- Escala de espaciado (px): 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 80 · 120. Ritmo entre secciones 80–120; padding de card 24 (móvil) / 32; juntas de grilla 1px.
- Breakpoints canónicos: móvil <560 · tablet 560–960 · desktop 960–1140 · ancho >1140. En Tailwind: max-[560px], min-[561px], min-[961px], min-[1141px]. No inventar otros. Las formas complementarias max-[960px]/max-[1140px] son válidas.
- Z-index: contenido 0 · menú móvil 40 · header 50 · popover/modal 60 · velo despertar 99 · grano 100 (siempre arriba, pointer-events:none).

## 5. Componentes (recetas inline — copiar literal)

Kicker
`<div style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#5227CC;margin-bottom:16px;">La prueba · 22 planes</div>`

Botón primario (violeta)
`<button style="padding:18px 28px;background:#5227CC;color:#F2EFE7;border:none;font-family:'Space Mono',monospace;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;transition:background .2s;" style-hover="background:#16130E;">Etiqueta →</button>`
Variantes: tinta (`background:#16130E`, hover violeta) · fantasma (`background:transparent;border:1px solid #16130E`, hover invierte). En oscuro, hover a `#F2EFE7`/tinta.

Sello (stamp)
`<span style="display:inline-block;transform:rotate(-4deg);border:3px solid #C23B22;color:#C23B22;font-family:'Space Mono',monospace;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;padding:10px 16px;">No es doctrina</span>`
Rotación −8° a +6°. Entra con `animation:stampin .4s ease both`.

Tag/chip de tipo
`<span style="padding:9px 14px;border:1px solid #16130E;background:transparent;color:#16130E;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">etiqueta</span>` — activo: fondo del color semántico + texto papel.

Fila de índice (listas de planes/ensayos)
`<a style="display:grid;grid-template-columns:56px 1fr 40px;gap:20px;align-items:baseline;padding:16px 8px;cursor:pointer;color:#16130E;border-bottom:1px solid #D8D4C8;transition:background .15s;" style-hover="background:#ECE8DC;">…numeración mono #B5B1A8 · título · +/−…</a>` (flecha → por defecto; +/− es la variante expandible, spec en fase 2.4)

Papel sobre oscuro (documentos)
`<div style="background:#F2EFE7;color:#16130E;padding:52px 56px;position:relative;box-shadow:0 24px 60px rgba(0,0,0,0.45);">…</div>` + sello EJEMPLO rotado arriba a la derecha.

Banda CTA
Sección de fondo `#5227CC` o `#16130E`, título Anton `clamp(44px,6vw,88px)`, 1–2 botones. Copys imperativos: «Tu voz pesa. Soltala en el mapa.»

Título entintado (rito §10.1)
En la app: primitiva `RitoTinta` (`components/papel/primitives/RitoTinta.tsx`) — divide
el título en letras con `anim-inkfill` escalonado (~45ms por letra) y hace caer los
signos `¡ !` al final con `anim-vpop` en violeta. El llamador pone el heading y su
`aria-label` (las letras van `aria-hidden`). En `.dc.html`: spans inline con
`animation:inkfill` y delays literales.

Nota de datos demo (obligatoria junto a toda métrica inventada)
`<span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#B5B1A8;">* datos de demostración</span>`

Formularios: inputs/textarea `border:1px solid #16130E;background:#FBFAF4;padding:14–16px;` sin radius; focus `outline:2px solid #5227CC`.

Estados
- Deshabilitado: color tinta-30, borde tinta-30, cursor not-allowed. Nunca opacity.
- Cargando (botón): texto reemplazado por «— ▌» con blink-cursor; ancho fijo.
- Error de campo: borde 2px rojo-sello + mensaje mono 11px rojo-sello debajo.
- Éxito: sello verde o mensaje mono verde. Nada de toasts flotantes verdes.

Formularios (kit completo)
- Select: nativo estilizado — borde 1px tinta, fondo papel-crudo, flecha ▾ tipográfica.
- Checkbox/radio: cuadrado/círculo 18px borde tinta; marcado = fondo violeta, tilde papel.
- Toggle: pastilla rectangular sin radius; OFF papel-presionado / ON violeta; etiqueta mono.
- Requerido: asterisco violeta en la etiqueta mono. Ayuda: mono 10px tinta-50.

Búsqueda, filtros y paginación
- Búsqueda: input mono con prefijo «buscar:» y cursor ▌; resultados en filas de índice.
- Filtros: chips §5; activo = fondo semántico. Línea de conteo mono: «{n} resultados».
- Paginación: botón «cargar más ↓» (nunca scroll infinito ni numeritos).
- Filtro sin resultados: «Nada con ese filtro. Probá con menos.»

Tablas
- Extensión de la fila de índice: encabezados mono 11px uppercase tinta-50, orden con ▲▼ tipográficos, borde inferior 1px tinta en el header, hover papel-presionado. Header sticky permitido. Sin zebra.

Modales, toasts, tooltips
- Modal = documento papel-sobre-oscuro (§5) centrado sobre velo rgba(22,19,14,.7); cierre «✕» tipográfico arriba a la derecha. Un modal por vez.
- Toast = sello que cae (stampin) en la esquina inferior derecha + línea mono; se va solo a los 4s. Catálogo de sellos cerrado (§10.5) — el toast usa esos textos.
- Tooltip: mono 10px, fondo papel-presionado, borde 1px tinta, sin flecha, sin delay artificial.

Popover de mapa
Card absoluta dentro del marco del mapa (max-width 300): fondo #16130E, texto
#F2EFE7, sin radius, borde izquierdo 2px del color semántico de la voz, padding 20,
entra con fadeup. Cierre «✕» tipográfico + Escape; uno por vez; el foco entra al «✕»
y vuelve al disparador al cerrar. En la app: `PopoverVoz`
(`pages/ElMapa/sections/PopoverVoz.tsx`).

Skeletons
- Bloques papel-presionado del tamaño real del contenido con pulso de opacidad .5→.8 (1.2s). Junto al primer skeleton, microcopy de carga (§10.9).

Páginas de error
- 404: expediente — kicker «expediente extraviado», título Anton «No está acá.», sello rojo EXTRAVIADO rotado, CTA «Volver al inicio →». 500: «Esto se rompió. Lo decimos porque publicamos todo.» + link al estado.

## 6. Motion

Keyframes canónicos (en `<helmet><style>`): `inkfill` (letras que se entintan), `vpop`, `fadeup`, `marquee`, `pulse-dot` (puntos del mapa), `dropin`, `growbar`, `blink-cursor` (cursor ▌), `stampin`, `semgrow`+`leafpop` (semilla). En la app los nombres canónicos son los de `index.css`; los especímenes `.dc.html` conservan los nombres viejos.
Presupuesto: **una interacción firma por página**; el resto entra con `fadeup` escalonado (delays .1–.3s). Nada de parallax, 3D ni gradientes animados. El recurso narrativo maestro: **gris → color** (grayscale que se llena de color al despertar).

## 7. Voz y contenido

- Español rioplatense, voseo («soltá», «leelo»), frases cortas, segunda persona.
- Tono: manifiesto en portadas (directo, sin pedir permiso), sobrio y verificable en herramientas. Humor seco permitido («Suerte.»).
- Ideas fijas que no se negocian: *la ciudadanía diseña, el Estado administra, la política ejecuta* · *sin líder, sin partido, sin excusas* · los 22 planes son **prueba, no doctrina** («esto lo escribió uno solo») · el mandato lo escriben las voces · todo dato inventado lleva asterisco.
- 6 tipos de voz y su color: basta=rojo, sueño=violeta, necesidad=ámbar, compromiso=verde, recurso=cian, valor=tinta.
- Prohibido: tecnicismos de marketing, "únete/regístrate" (se dice «sembrá», «soltá tu voz»), promesas, emojis, mayúsculas de grito fuera de sellos.

## 8. Anatomía del sitio (mapa de páginas)

`Inicio → La idea (3 capítulos, despertar gris→color) → El mapa (soltar voz) → El mandato (oscura + documento papel) → La prueba (22 planes, filtros) → La biblioteca (manifiesto + 21 ensayos en 3 ciclos + 6 entrenamientos curados (catálogo completo de 30 detrás de «ver todos») + bitácora) → lectores (ensayo/curso/crónica/manifiesto) → Sembrar (3 pasos → certificado semilla)`
Header fijo: wordmark + contador FOMO + nav mono + CTA «Sembrar tu voz». Footer: wordmark outline + recorrido + principios + CTA. Conversión primaria: **dejar la voz en el mapa**; secundaria: plantar la semilla.

## 9. Reglas de implementación

Hay DOS pistas y no se mezclan:

**9a. Design Components (`.dc.html`, previews).** Todo estilo inline con hex
literales; `<helmet>` solo para fonts, `@keyframes` y resets. Nunca `var(--token)`.

**9b. La app React (`apps/web`).** Los tokens Tailwind son canónicos: `bg-papel`,
`text-tinta`, `text-violeta`, `border-sello`, `font-anton/archivo/space`, etc.
(definidos en `tailwind.config.ts` desde los valores de `tokens.css`). En TSX está
PROHIBIDO el hex literal — si falta un token, se agrega a `tokens.css` +
`tailwind.config.ts` en el mismo PR. Keyframes canónicos en `index.css` con
wrappers `.anim-*`. Repetir la receta antes que abstraer sigue valiendo para
layout; los componentes compartidos viven en `components/papel/primitives/`.

- Móvil: colapsar a 1 columna, padding 20px, targets ≥44px.

## 10. Firmas «award» — lo que hace inconfundible al sitio

1. **El rito de la tinta.** Toda página abre igual: el H1 se entinta letra por letra (`inkfill` escalonado, gris `#B5B1A8` → tinta) y los signos `¡ !` caen al final (`vpop`). Un solo rito, siempre. La consistencia del ritual ES la marca.
2. **Los signos como arquitectura.** El español abre y cierra el grito: usar `¡` para abrir secciones importantes y `!` para cerrarlas (gigantes, en violeta, como elementos de layout). Nadie más puede apropiarse de esto en inglés.
3. **Grano de papel.** Overlay fijo en toda página: SVG `feTurbulence` como data-uri, `opacity:0.04; pointer-events:none; position:fixed; inset:0; mix-blend-mode:multiply`. Imperceptible de cerca, cálido de lejos.
4. **Desregistro riso.** En hover de títulos Anton grandes (solo display, nunca cuerpo): `text-shadow: 2px 0 0 rgba(82,39,204,.30), -2px 0 0 rgba(194,59,34,.25)` — como una impresión offset corrida. 150ms, sutil.
5. **Sellos reactivos.** Toda acción completada del usuario se confirma con un sello que cae (`stampin`): voz soltada → `RECIBIDA` · semilla → `PLANTADA` · manifiesto leído hasta el final → `LEÍDO ENTERO` · documento auditado → `VISTO`. Catálogo cerrado; no inventar sellos por decoración.
6. **Palitos, no barras.** Números chicos (<100) se cuentan con tally marks (4 palitos + 1 cruzado), dibujados con `semgrow` escalonado. Las barras quedan solo para documentos (mandato). Contar a mano es el data-viz de la marca.
7. **El despertar.** Velo gris de viewport completo (`mix-blend-mode:saturation`, opacidad .6) que se disuelve en 1.4 s al primer gesto (`despertar()` en `lib/despertar.ts`). Disparadores canónicos: CTA «Dejar mi voz en el mapa», CTA header «Sembrar tu voz», botón «Este es mi instante» (La idea, Cap I), CTA «Dejar mi voz» (La idea, Cap III), primera voz soltada (botón «Soltar la voz», El mapa). Se guarda `localStorage['basta_despierto']='1'`. El sitio entero repite la tesis: gris hasta que actuás.
8. **La edición impresa.** Cada lector (ensayo, crónica, manifiesto, certificado de semilla) imprime perfecto. La edición impresa usa la serifa del sistema (`Georgia, 'Times New Roman', serif`) SOLO en `@media print`. En pantalla nunca hay serifa. Cada lector define `@media print`: sin nav/footer/grano, folio `¡BASTA! · edición del lector · {fecha}`. El sitio es un diario que se puede volver papel.
9. **Microcopy con voz en los estados mudos.** Vacíos, cargas y errores hablan: «Todavía no hay voces acá. Qué oportunidad.» · «Cargando — menos que un trámite.» · «Esto se rompió. Lo decimos porque publicamos todo.»
10. **Premio también es rigor:** contraste AA mínimo en todo texto, focus visible violeta de 2px, `prefers-reduced-motion` desactiva inkfill/marquee/pulse (deja estados finales), LCP < 2s (fonts con `display=swap`, cero imágenes pesadas).

## 11. Flujo de trabajo página por página

1. Una conversación = una página. Pedir: «Rehacé [página] siguiendo el sistema Papel y Tinta; no toques header, footer ni las demás páginas».
2. Congelados entre convos: paleta, fuentes, header/footer, nombres de páginas, las 3 frases del método, contador FOMO.
3. Definición de terminado: kicker+título+CTA presentes · una sola interacción firma · asteriscos en datos demo · responsive a 1 columna · voseo consistente.
4. Al terminar una página, actualizar la fecha de este documento si algo del sistema cambió (y solo si cambió).

## 12. Iconos

- Páginas editoriales/públicas: CERO íconos. Solo glifos tipográficos → ↗ ↺ ▌ ¡ !
- La plataforma (páginas con sesión): lucide permitido SOLO funcional (cerrar, menú,
  link externo, campana), 16px, stroke tinta o tinta-50, nunca decorativo ni de color.
- Logros y gamificación NO usan íconos: usan sellos y palitos (§10.5, §10.6).

## 13. La prensa de datos

Tres niveles, sin excepciones:
1. **Palitos** (§10.6) para conteos < 100.
2. **Barras horizontales** solo dentro de documentos (mandato, informes): fondo
   `#241F17` en oscuro / `#ECE8DC` en claro, relleno del color semántico, valor en
   Space Mono al final de la barra. Animación `growbar`.
3. **Prensa** para viz complejas (flujos, convergencia, mapas de calor): SOLO dentro
   de páginas-documento; monocromo tinta + UN acento semántico; sin gradientes, sin
   3D, sin ejes decorativos; toda cifra en Space Mono; siempre con fuente y fecha al
   pie. Si una viz no se entiende en 10 segundos, se reemplaza por una tabla.

## 14. La plataforma y la difusión

Auth: formularios papel mínimos, kicker «entrada», tono «anónimo si querés» — la
cuenta es opcional y se dice. Nada de beneficios inventados por registrarse.
Emails: una columna papel (#F2EFE7), fuentes del sistema, wordmark texto con ¡! en
violeta, un solo CTA, footer con «te escribimos solo cuando pasa algo».
SEO/OG: título «{Página} — ¡BASTA!»; descripciones en voseo, sin marketing. Imagen
OG: card papel 1200×630 con ¡BASTA! gigante entintado + kicker de la página (una
plantilla, texto variable). Favicon: «¡» violeta sobre papel.
Gamificación: XP y rachas se cuentan con palitos; logros son sellos del catálogo;
niveles con numeración de expediente («Exp. N° 004»). Cero barras de progreso salvo
dentro de documentos; cero íconos de trofeo.

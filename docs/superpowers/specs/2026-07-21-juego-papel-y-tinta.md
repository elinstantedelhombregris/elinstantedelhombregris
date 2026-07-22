# El juego en Papel y Tinta — traducción del sistema v2 al juego

*2026-07-21 · Fuente: `v2/docs/design-system/README.md` v1.1 + `tokens.css`. Este
documento es la adaptación canónica del sistema «Papel y Tinta» a `juego/`.
Donde este spec calla, manda el README de v2.*

## 0. La tesis: el cuaderno y la noche

Papel y Tinta es «un manifiesto impreso que cobró vida». El juego es su
**cuaderno de campo**: de día llevás el cuaderno (papel), de noche mirás el
cielo (tinta). La app tiene DOS registros y una sola regla para elegirlos:

- **LA NOCHE (registro oscuro del sistema)** — solo las pantallas donde el
  Cielo es protagonista: `index` (El Cielo), `ftue`, los modales de las luces
  (`ver`, `encender`, `dar`, `rito`) y `compartir`. Fondo = el canvas del
  cielo (se conserva la atmósfera actual); el chrome usa la página oscura
  canónica: texto `#F2EFE7`, secundario `#C9C5BA`, meta `#8E8A82`, tenue
  `#5C594F`, bordes `#3A362D`, barras `#241F17`, violeta claro `#9D85E8`.
- **EL PAPEL (registro claro)** — todo lo demás: corriente, misiones, obras,
  álbum, bitácora, escuchar, territorio, expediciones, qr, ajustes, tramas,
  etc. Fondo `#F2EFE7`, paneles `#FBFAF4`, hover/pressed `#ECE8DC`, borde
  suave `#D8D4C8`, tinta `#16130E/#33302A/#4A463D/#7A756A/#B5B1A8`.

Abrir una pantalla de contenido desde el Cielo = abrir el cuaderno. La
transición es un `fade` simple (ya configurado en el Stack); nada más.

## 1. Lo que muere (sin excepciones, en TODA la app)

1. **El gradiente plata** (`DisplayText`/MaskedView) — Anton lo reemplaza.
2. **El vidrio** (`bg-white/5 + blur + border-white/10`) — paneles planos.
3. **Todo border-radius** — `rounded-*` pasa a 0. Cuadrado o no existe.
4. **Toda sombra/glow** (el halo del AccentButton incluido). Única excepción
   canónica: papel-sobre-oscuro (modales) `0 24px 60px rgba(0,0,0,0.45)`.
5. **Playfair, Inter y JetBrains** → **Anton, Archivo y Space Mono**.
6. **Los íconos decorativos.** Ionicons queda SOLO funcional (cerrar, volver,
   cámara, QR, ajustes; 16–20px, stroke tinta o tinta-50 / oscuro-meta en la
   noche). Chips de oficio, luces, logros y celebraciones: tipografía, sellos
   y palitos. Nunca un ícono de trofeo.
7. **Las barras de progreso** fuera de documentos → **palitos** (§4).
8. **Los toasts/overlays de celebración** → **sellos que caen** (§5).

## 2. Tokens (tailwind.config.js + tokens.ts)

Colores nuevos (se AGREGAN; los viejos quedan hasta la limpieza final):

```js
papel: { DEFAULT: '#F2EFE7', crudo: '#FBFAF4', presionado: '#ECE8DC', mapa: '#E4E0D3' },
tinta: { DEFAULT: '#16130E', 90: '#33302A', 75: '#4A463D', 50: '#7A756A', 30: '#B5B1A8' },
oscuro: { texto: '#F2EFE7', secundario: '#C9C5BA', meta: '#8E8A82', tenue: '#5C594F', borde: '#3A362D', barra: '#241F17' },
violeta: { DEFAULT: '#5227CC', hover: '#3D1BA3', claro: '#9D85E8' },
sello: '#C23B22', verde: '#1A7A4A', ambar: '#A16C00', cian: '#0F6B8A',
bordeSuave: '#D8D4C8',
```

Fuentes: `anton: ['Anton_400Regular']`, `archivo: ['Archivo_400Regular']`,
`'archivo-medium': ['Archivo_500Medium']`, `'archivo-bold': ['Archivo_700Bold']`,
`'archivo-italic': ['Archivo_400Regular_Italic']`, `space: ['SpaceMono_400Regular']`,
`'space-bold': ['SpaceMono_700Bold']` (paquetes `@expo-google-fonts/anton|archivo|space-mono`).

**Los 6 colores de señal se remapean a los acentos canónicos** (README §7):

| Señal | Antes | Ahora |
|---|---|---|
| dream (sueño) | #3b82f6 | **#5227CC** violeta |
| need (necesidad) | #f59e0b | **#A16C00** ámbar |
| basta | #ef4444 | **#C23B22** rojo sello |
| value (valor) | #ec4899 | **tinta** en papel · **#C9C5BA** en la noche |
| compromiso | #10b981 | **#1A7A4A** verde |
| recurso | #14b8a6 | **#0F6B8A** cian |
| amistad | #F5F7FA | **#F2EFE7** papel (solo en el cielo) |

En el cielo (fondo oscuro), los colores estelares usan variantes legibles:
dream `#9D85E8`, need `#D89B2E`, basta `#E05A41`, value `#C9C5BA`, compromiso
`#2FA36B`, recurso `#2E9BC0`, amistad `#F2EFE7` (constante `COLOR_ESTRELLA`).

**Oficios pierden el color**: los 11 chips de oficio pasan a tinta pura
(borde 1px tinta, mono uppercase; activo = fondo tinta + texto papel). El
color queda reservado a las 6 señales. `OFICIOS[].color` deja de usarse en
UI (queda en el catálogo por compatibilidad).

## 3. Kit de primitivas (`src/components/papel/`)

Todas con `cssInterop` si son animadas. Reciben `registro?: 'papel' | 'noche'`
donde aplique (default `papel`).

1. **`Kicker`** — Space Mono 11px, tracking 0.16em, uppercase; color violeta
   o tinta-50 (noche: violeta-claro u oscuro-meta). Reemplaza a SectionBadge.
2. **`TituloAnton`** — Anton, tamaños `xl` 34px / `lg` 28px / `md` 22px,
   line-height 1.0, uppercase implícito del trazo (Anton ya es display);
   tinta en papel, `#F2EFE7` en noche. Prop `entintar` activa el inkfill
   (§6). Reemplaza a DisplayText.
3. **`PapelCard`** — plano: papel `bg-[#FBFAF4]`, borde 1px `#16130E` (variante
   `suave` → `#D8D4C8`); noche: `bg-[#241F17]/60`, borde 1px `#3A362D`.
   Radius 0, sin sombra. Reemplaza a GlassCard (que queda como alias
   deprecado hasta la limpieza).
4. **`BotonTinta`** — el botón canónico: rectangular, padding 16–18px/24px,
   Space Mono 700 13px uppercase tracking 0.08em. Variantes: `primaria`
   (fondo violeta `#5227CC`, texto papel; pressed → fondo tinta),
   `tinta` (fondo tinta, texto papel; pressed → violeta), `fantasma`
   (transparente, borde 1px tinta; pressed invierte). En noche: `primaria`
   igual; `fantasma` borde `#F2EFE7`, texto papel. Deshabilitado = tinta-30
   (texto y borde), NUNCA opacity. Cargando: texto «— ▌» con blink.
   Etiquetas terminan en `→` cuando navegan. Reemplaza a AccentButton
   (alias deprecado). Háptica igual que hoy.
5. **`ChipTipo`** — cuadrado, borde 1px tinta, mono 11px 700 uppercase;
   activo = fondo del color semántico (o tinta para oficios) + texto papel.
6. **`Sello`** — borde 3px, mono 700 13px uppercase tracking 0.18em, padding
   10/16, rotación fija por sello (−8°…+6°), color `sello`/`verde`/`violeta`.
   Entra con `stampin` (scale 1.6→1 + settle, 400ms) + `haptic.celebrate()`.
7. **`Palitos`** — tally marks para conteos <100: grupos de 5 (4 verticales
   + 1 cruzado), dibujados con react-native-svg, stroke 2px del color dado
   (default tinta / papel en noche), entrada escalonada (`semgrow`: cada
   palito crece 90ms). Props: `total`, `de?` (muestra huecos hasta la meta
   en tinta-30), `color?`. ES el data-viz del juego: brasas, racha,
   presupuesto de pulsos, capturas de expedición, obras por oficio.
8. **`FilaIndice`** — fila de lista canónica: grid `numeración mono tinta-30 ·
   contenido · glifo →`, borde inferior 1px `#D8D4C8`, pressed
   `#ECE8DC`. Para Corriente, misiones, bitácora, álbum.
9. **`GranoPapel`** — overlay fijo del grano: web = SVG feTurbulence data-uri
   con `mix-blend-mode:multiply`; nativo = PNG de ruido 64×64 tileado
   (`resizeMode:'repeat'`), `opacity:0.04`, `pointerEvents:'none'`. Solo en
   registro papel.
10. **`ExpedienteNum`** — «EXP. N° 004» mono 10px tracking 0.12em tinta-50;
    para misiones (número = orden de creación) y logros.

## 4. Palitos: dónde exactamente

- **Brasas** en el dock del Cielo: número mono + palitos si <100 (grupos de 5,
  color `#D89B2E` en la noche).
- **Racha**: «◈ 12 noches» → palitos verdes + «12 noches» mono. El banco de
  noches nubladas (Plan C) también serán palitos huecos.
- **Presupuesto de pulsos** (Corriente): los 5 puntos → 5 palitos (llenos
  tinta, gastados tinta-30).
- **Expedición vinculada**: «3 de 10» → `Palitos total={3} de={10}` + cifra
  mono. La barra de luminosidad muere.
- **Álbum/Oficios**: estrellitas SVG → palitos por obra + nivel en mono.

## 5. El catálogo de sellos del juego (cerrado — no inventar)

| Momento | Sello | Color | Rotación |
|---|---|---|---|
| Primera estrella (FTUE) | `ENCENDIDA` | violeta | −6° |
| Escucha guardada | `RECIBIDA` | verde | −4° |
| Pacto aceptado | `PACTADO` | violeta | +3° |
| Obra publicada | `PUBLICADA` | verde | −5° |
| Misión resuelta | `RESUELTA` | verde | +4° |
| Noche completa | `NOCHE COMPLETA` | violeta | −8° |
| Rito de re-encendido | `REENCENDIDA` | sello (rojo) | +6° |

Reemplazan a: overlay de Noche Completa (el cielo hace zoom igual; el sello
cae sobre él y una línea mono con la frase del día), pantalla de éxito de la
escucha (la card grande queda, con el sello arriba a la derecha), éxito de
publicar obra (sello + redirect), rango-up (sello `ASCENDIDA — {RANGO}` NO:
el ascenso usa `ExpedienteNum` + Anton, sin sello, para no inflar el
catálogo). El sello es UN componente que cae una vez; nunca toast repetido.

## 6. Motion (presupuesto del sistema)

- **Una interacción firma por pantalla.** En el Cielo: el titilado (ya existe).
  En papel: la entrada `fadeup` escalonada (ya existe como `fadeUp` +
  `staggerDelay` — se conserva 1:1).
- **`inkfill` (el rito de la tinta)**: el título Anton se entinta letra por
  letra (tinta-30 → tinta, 40ms por letra) en: la pregunta del FTUE y el
  título de cada pantalla papel al montar. Implementación: `TituloAnton
  entintar` parte el texto en `<Text>` por letra con Reanimated; en web y
  con reduced-motion se muestra el estado final directo (patrón `native()`).
- **`stampin`**: scale 1.6→0.96→1 con opacidad 0→1, 400ms ease-out.
- **`semgrow`**: scaleY 0→1 por palito, 90ms de stagger.
- Pressed: fondo `papel-presionado` en filas/cards; los botones invierten
  color (nada de opacity). `Pressable97` sigue (0.97 es sutil y táctil).
- Nada de parallax, glow pulsante ni gradientes animados.

## 7. El Cielo en el registro nocturno

- El canvas y su atmósfera SE CONSERVAN (vía plateada, nebulosas, viñeta).
  Cambios: `COLOR_ESTRELLA` remapea a la tabla §2; el fondo default
  (noche-pura) vira del índigo frío a la noche tinta: centro `#1A1626`,
  borde `#0B0908` (cálido, hermana del `#16130E`). Las otras 3 paletas se
  re-derivan en la misma familia (madrugada azul `#101C3A/#080B12`, cenizas
  `#241B14/#0C0A09` ya cálida se queda, aurora `#2E1A3E/#0E0A14`).
- **El despertar (§10.7 de v2, versión juego)**: hasta que nace la primera
  estrella, el cielo se renderiza DESATURADO (las constantes de color pasan
  por un `desaturar()` en el canvas cuando `estrellas.length === 0` y el
  FTUE no terminó) y el chrome usa solo grises. Al nacer la primera
  estrella, el color entra con el bloom. El juego repite la tesis del
  sitio: gris hasta que actuás.
- Chrome del Cielo: fecha y racha en Space Mono; la pill «La Escucha» →
  `BotonTinta fantasma` nocturno compacto; el dock → barra plana
  `bg-[#241F17]` borde superior 1px `#3A362D`, íconos funcionales 20px
  `#8E8A82` (activo `#F2EFE7`) con label mono 9px uppercase debajo.
- **Las Tres Luces**: los orbes redondos → **tres placas cuadradas** (72px),
  borde 1px `#3A362D`, la palabra `VER / ENCENDER / DAR` en Space Mono 700
  11px + un glifo tipográfico arriba (`◉ / ⚡ / ✋` NO — glifos permitidos:
  usar `▘/▞/▚`… decisión: SIN glifo, la palabra basta; ENCENDER 84px y
  elevada como hoy). Apagada: borde y texto `#8E8A82`. Encendida: **la placa
  queda SELLADA** — fondo del color de la luz (ver=violeta-claro/20,
  encender=violeta, dar=verde) con la palabra tachada estilo sello rotado
  −3°, borde 2px del color. El día es una página que se va sellando.

## 8. Pantallas papel — recetas por pantalla (resumen operativo)

Patrón general de página papel: `bg-papel` + `GranoPapel` + header con
`←` tipográfico + `Kicker` + `TituloAnton entintar` + contenido con la
escala de espaciado (4/8/12/16/20/24/32/40).

- **La Corriente**: header «LA CORRIENTE» + kicker «lo que el país está
  haciendo · hecho por hecho»; presupuesto = `Palitos total={restantes} de={5}`;
  QR = ícono funcional. Items = `FilaIndice` numeradas (`001`, `002`…):
  obra → chip de tipo tinta + título Archivo 700 + resumen 75 + pulso como
  botón mono «PULSO ({n})» fantasma que al darlo queda fondo tinta texto
  papel; misión → línea mono. «ESTÁS AL CORRIENTE» = divisor con la frase
  centrada en mono entre rayas. Vacío: microcopy con voz.
- **Misiones**: `ExpedienteNum` («EXP. N° 001» por orden), estado como chip
  mono (CONVOCANDO=violeta, EN MARCHA=verde, EN VERIFICACIÓN=ámbar,
  RESUELTA=tinta-50, ABANDONADA=tinta-30); secciones con kicker; archivo
  colapsado igual. Fundar: formulario canónico (inputs `border:1px tinta`,
  `bg-papel-crudo`, focus borde violeta 2px, radius 0); tipos y gobernanza
  como `ChipTipo`; CTA `BotonTinta primaria` «FUNDAR →».
- **Detalle de misión**: card principal `PapelCard` borde tinta; equipo como
  filas índice; expedición vinculada con `Palitos`; acciones: primaria
  `BotonTinta primaria`, secundarias `fantasma`, abandonar = link mono
  tinta-50. Al resolver → sello `RESUELTA` antes de navegar.
- **Publicar obra**: kicker «proof of output» NO — «la obra es la prueba»;
  título Anton; form canónico; evidencia = recuadro borde discontinuo 1px
  tinta con «AGREGAR FOTO» mono; publicar → sello `PUBLICADA`.
- **Álbum**: solapas como `ChipTipo` (activa fondo tinta); constelaciones y
  cartas sobre `PapelCard suave`; oficios con `Palitos` por obra; paletas
  con swatch cuadrado.
- **Bitácora**: la más editorial: filas índice con fecha mono, texto Archivo;
  lectura 17px/1.75.
- **Escuchar (5 pasos)**: ya cumple el ritmo kicker→título→cuerpo; migrar
  colores/tipos/chips/radius; el pacto usa `PapelCard` borde tinta y su
  aceptación deja el sello `PACTADO` inline chico; guardar → sello
  `RECIBIDA` en la pantalla de éxito (que pasa a papel-sobre-oscuro NO —
  queda papel plano).
- **Territorio/expediciones/qr/ajustes/tramas/etc.**: migración mecánica con
  el kit (colores, fuentes, radius 0, chips, botones). El QR en pantalla
  papel: el bloque QR sobre `PapelCard` borde tinta («pasala en persona»).
- **Ajustes**: filas índice + toggles rectangulares (OFF papel-presionado /
  ON violeta); borrar todo = zona con borde `sello` y botón `BotonTinta`
  variante tinta con borde rojo.

## 9. Voseo y microcopy

Ya es rioplatense. Ajustes puntuales del sistema: citas «angulares», jamás
"rectas"; los vacíos hablan («Todavía no hay obras acá. Qué oportunidad.»);
las cargas: «Cargando — menos que un trámite.»; sin emojis (auditar textos).

## 10. Accesibilidad y rigor

Contraste AA en todo texto (tinta-50 sobre papel pasa para meta ≥10px;
cuerpo usa 90/75). Focus visible: outline 2px violeta (web). Targets ≥44px.
`prefers-reduced-motion`/reduced-motion nativo: inkfill y stampin muestran
estado final. Fuentes con `display=swap` en web.

## 11. Qué NO cambia

El motor (src/game, src/protocolo, src/civic, src/db), las rutas, la lógica
de pantallas, la háptica, los 376 tests, la ética (§3.7 del spec del juego),
y la atmósfera del canvas (solo re-tinte §7). Esto es una reskin profunda,
no un refactor funcional.

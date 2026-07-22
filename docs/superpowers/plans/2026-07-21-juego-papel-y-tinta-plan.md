# Papel y Tinta en el juego — plan de ejecución

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Aplicar el sistema de diseño «Papel y Tinta» (v2) a todo `juego/` según el spec de traducción, con el kit de primitivas, los dos registros (papel/noche), sellos, palitos y el despertar.

**Architecture:** Reskin profunda sin tocar motor ni lógica. Un task de tokens+fuentes, uno del kit de primitivas, y después pantallas por registro. Cada task deja la suite verde y el export web OK.

**LA BIBLIA (leer antes de cada task):** `docs/superpowers/specs/2026-07-21-juego-papel-y-tinta.md` — todas las recetas, colores exactos, catálogo de sellos y reglas de qué muere. El README fuente: `v2/docs/design-system/README.md`.

## Global Constraints

- Todo lo del spec §1 («lo que muere»): cero radius, cero sombras/glow (salvo papel-sobre-oscuro), cero gradiente plata, cero vidrio, íconos solo funcionales, barras→palitos, toasts→sellos.
- Hex NUEVOS solo via tokens de tailwind (`bg-papel`, `text-tinta`, `border-oscuro-borde`…); en estilos inline de RN (donde className no llega) usar las constantes de `src/theme/tokens.ts` nuevas.
- Suite verde en cada commit (376 tests) + `npx tsc --noEmit` + `npx expo export --platform web` OK. Comandos desde `juego/`.
- Voseo; citas «angulares»; sin emojis en UI.
- `cssInterop` para todo componente animado nuevo (pitfall SDK 57).
- Commits estilo repo + trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task PT1: Tokens, fuentes y fundamentos

**Files:** `tailwind.config.js`, `src/theme/tokens.ts`, `package.json` (+3 fuentes), `src/app/_layout.tsx` (useFonts), `src/cielo/posiciones.ts` (COLOR_ESTRELLA), `src/content/paletas.ts` (+ test), `src/content/senales.ts` (si define colores), `src/motion/variants.ts` (+ `stampin`, `semgrow` si se definen acá).

- [ ] Instalar `@expo-google-fonts/anton @expo-google-fonts/archivo @expo-google-fonts/space-mono` (npx expo install). Cargarlas en `_layout.tsx` junto a las viejas (las viejas se quitan en PT8).
- [ ] Tailwind: agregar colores y fuentes del spec §2 (sin borrar los viejos aún).
- [ ] tokens.ts: agregar `PAPEL`, `PAPEL_CRUDO`, `TINTA`, `TINTA_50`, `OSCURO_TEXTO/SECUNDARIO/META/TENUE/BORDE/BARRA`, `VIOLETA`, `VIOLETA_CLARO`, `ROJO_SELLO`, `VERDE`, `AMBAR_PT`, `CIAN` (mantener los viejos).
- [ ] `COLOR_ESTRELLA` → la tabla nocturna del spec §2; actualizar el test de posiciones si pinnea colores.
- [ ] Paletas del cielo → los 4 gradientes del spec §7 (+ test actualizado).
- [ ] Verificar (tsc+vitest+export) y commit: `feat: tokens Papel y Tinta — colores, fuentes y cielo re-tintado`.

### Task PT2: El kit de primitivas papel

**Files:** crear `src/components/papel/{Kicker,TituloAnton,PapelCard,BotonTinta,ChipTipo,Sello,Palitos,FilaIndice,GranoPapel,ExpedienteNum}.tsx` + `src/components/papel/index.ts`; `assets/grano-64.png` (generar con script node de ruido); registrar cssInterop donde haga falta.

- [ ] Implementar las 10 primitivas EXACTAS del spec §3 (variantes papel/noche, estados pressed/disabled del sistema, sin radius, sin sombras). `Sello` con `stampin` (Reanimated; en web estado final), `Palitos` con `semgrow` escalonado (react-native-svg), `TituloAnton entintar` con inkfill por letra (spec §6; web/reduced-motion → estado final).
- [ ] `BotonTinta` y `PapelCard` exportan también como `AccentButton`/`GlassCard`?? NO — los viejos componentes QUEDAN intactos; el kit es nuevo y las pantallas migran en PT3–PT7. Nada se rompe a mitad de camino.
- [ ] Test: `src/components/papel/palitos.test.ts` (lógica pura de agrupado en cincos: exportar `agruparPalitos(total, de?)` desde un helper puro y testearlo).
- [ ] Verificar + commit: `feat: kit Papel y Tinta — 10 primitivas del cuaderno`.

### Task PT3: La noche — El Cielo, FTUE y el despertar

**Files:** `src/app/index.tsx`, `src/app/ftue.tsx`, `src/cielo/CieloCanvas.tsx` (desaturado del despertar), `src/components/juego/{LuzOrb→LuzPlaca}` (nuevo componente; LuzOrb queda hasta PT8), `NocheCompletaOverlay`, `RangoUpOverlay`, `FugazBanner`.

- [ ] Chrome del Cielo al registro nocturno (spec §7): fecha/racha mono, dock plano `#241F17` con labels mono 9px, pill Escucha → BotonTinta fantasma nocturno.
- [ ] **Tres Luces → LuzPlaca** (placas cuadradas selladas del spec §7). Racha con `Palitos` verdes.
- [ ] **El despertar**: `CieloCanvas` prop `dormido` (desatura COLOR_ESTRELLA y la atmósfera con una `desaturar()` pura + test en posiciones/atmosfera test file); `index.tsx`/`ftue.tsx` lo pasan cuando no hay estrellas y el FTUE no cerró. FTUE: pregunta con `TituloAnton entintar` (Anton reemplaza el serif), sello `ENCENDIDA` al nacer, botones BotonTinta.
- [ ] `NocheCompletaOverlay` → el cielo hace zoom igual + **sello `NOCHE COMPLETA`** + frase del día en mono (spec §5). `RangoUpOverlay` → ExpedienteNum + Anton (sin sello). `FugazBanner` → PapelCard nocturna con botón mono.
- [ ] Verificar + commit: `feat: la noche Papel y Tinta — Cielo, placas de luces, despertar y sellos`.

### Task PT4: Los modales de las luces + compartir

**Files:** `src/app/{ver,encender,dar,rito,compartir}.tsx`, `src/components/juego/ModalCielo.tsx`.

- [ ] ModalCielo y los 4 modales al registro nocturno: tipografías (Anton títulos, Archivo cuerpo, mono meta), chips cuadrados, botones BotonTinta, cero radius/vidrio. `rito` cierra con sello `REENCENDIDA`.
- [ ] `compartir`: la card 9:16 se rediseña a papel-sobre-oscuro (la ÚNICA sombra permitida) con wordmark estilo sistema y palitos de racha — la postal imprimible del juego.
- [ ] Verificar + commit: `feat: las luces en tinta — modales nocturnos y postal de papel`.

### Task PT5: El papel protocolar — Corriente, misiones, obras

**Files:** `src/app/corriente.tsx`, `src/app/misiones/{index,fundar,[id]}.tsx`, `src/app/obras/publicar.tsx`.

- [ ] Migrar las 5 pantallas al registro papel con las recetas del spec §8: GranoPapel, Kicker+TituloAnton entintar, FilaIndice numerada en la Corriente, `ExpedienteNum` en misiones, chips de estado mono, formularios canónicos, `Palitos` para pulsos y expedición, sellos `PUBLICADA`/`RESUELTA` en sus momentos, oficios en chips tinta (sin color).
- [ ] Verificar + commit: `feat: el cuaderno protocolar — Corriente, misiones y obras en papel`.

### Task PT6: El papel cívico — escuchar, territorio y satélites

**Files:** `src/app/escuchar.tsx`, `src/app/escuchar/necesidad/[id].tsx`, `src/app/territorio/{index,mapa,inteligencia,misiones/*}.tsx`, `src/app/{aportar,conectar,publicar,verificar,circulos,mis-datos}.tsx`, `src/app/tramas/[id].tsx`.

- [ ] Migración mecánica con el kit (colores→tokens papel/tinta, radius 0, chips cuadrados, botones BotonTinta, kickers mono, títulos Anton). El pacto → sello `PACTADO` al aceptar; éxito de escucha → sello `RECIBIDA`. El LinearGradient del éxito muere (PapelCard plana). LivingHalo muere (nada de glow).
- [ ] El mapa (`territorio/mapa`) adopta `#E4E0D3` de fondo de mapa si el style lo permite fácil; si no, se deja anotado para PT8.
- [ ] Verificar + commit: `feat: el cuaderno cívico — escucha, territorio y satélites en papel`.

### Task PT7: El papel restante — expediciones, álbum, bitácora, qr, ajustes

**Files:** `src/app/expediciones/{index,fundar,[id]}.tsx`, `src/components/juego/MicroUIPaso.tsx`, `src/app/{album,bitacora,qr,ajustes}.tsx`.

- [ ] Recetas del spec §8: álbum con solapas ChipTipo y palitos de oficio; bitácora editorial (Archivo 17/1.75, filas con fecha mono); qr sobre PapelCard borde tinta; ajustes con toggles rectangulares y zona roja de borrado; expediciones y su wizard (los micro-UIs: soles → se mantienen pero cuadrados/tinta-ámbar, contador con Palitos, rating sin glow).
- [ ] Verificar + commit: `feat: el cuaderno completo — expediciones, álbum, bitácora, qr y ajustes`.

### Task PT8: Limpieza, coherencia y verificación final

**Files:** barrido global.

- [ ] Quitar fuentes viejas (Playfair/Inter/JetBrains) de `_layout.tsx` y package.json SI ya nada las usa (grep); quitar `DisplayText`/`LuzOrb`/estilos `.display-gradient` muertos; borrar colores viejos de tailwind SOLO si grep confirma cero usos (si quedan usos en pantallas no migradas por error, arreglarlos).
- [ ] Barrido de coherencia: grep de `rounded-` (debe quedar 0 en src/app y componentes migrados), `blur`, `shadow` (solo la permitida), `#7D5BDE` residual, emojis en strings de UI.
- [ ] Verificación estática completa + walkthrough del controller en el preview (FTUE despertar → Cielo noche → luces/sellos → Corriente papel → misión/obra → álbum) con screenshots; push a origin main.

## Self-review
Cobertura spec§: 1✓(PT8 barrido) 2✓(PT1) 3✓(PT2) 4✓(PT3/5/7) 5✓(PT3/4/5/6) 6✓(PT2/3) 7✓(PT1/PT3) 8✓(PT5/6/7) 10✓(PT2 reduced-motion). Tipos: primitivas de PT2 consumidas por PT3–7 por nombre exacto del spec §3.

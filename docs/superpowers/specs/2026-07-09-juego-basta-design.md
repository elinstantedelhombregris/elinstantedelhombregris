# ¡BASTA! — el juego. Design Spec

**Fecha**: 2026-07-09 · **Estado**: aprobado (secciones 1 y 2 validadas con Juan; ejecución autónoma nocturna autorizada)
**Proyecto**: `juego/` — carpeta top-level nueva, app Expo independiente, **self-contained** (SQLite local, cero backend, cero login, cero red obligatoria). Conectores web = fase futura, fuera de alcance.

## 1. La promesa

*Encendé tu barrio. Encendete vos.* Cada dato real capturado es una **estrella** en **tu Cielo**; la práctica diaria mantiene encendida tu **Estrella Guía**. Recolección de datos + campañas + transformación humana, vividas como juego — con la ética de una herramienta de transformación, no de un tragamonedas.

Ficción: **La Constelación** (el país a oscuras se enciende luz por luz). Arquitectura elegida: **opción A** — un solo mundo (El Cielo) con las Tres Luces; sin mapa GIS en v1 (coords se capturan y guardan para el futuro conector). App title: **¡BASTA!**.

## 2. Core loop diario (3-5 min)

Abrís → tu Cielo (Skia: titilado, profundidad, tus estrellas en los colores de señal). Alrededor de la Estrella Guía, las **Tres Luces del día**:

| Luz | Qué es | Duración | Resultado |
|---|---|---|---|
| **VER** | Pregunta honda del día (corpus Indagaciones), pantalla completa Playfair; reflexión escrita opcional → Bitácora privada | ~1 min | luz encendida, +2 brasas |
| **ENCENDER** | Captura real: cámara opcional → GPS auto → rueda de categoría (6 señales o paso de expedición activa) → una línea opcional. Payoff: la estrella nace y vuela al cielo (bloom + háptica) | ~30 s | estrella nueva, luz encendida, +2 brasas |
| **DAR** | Elegir micro-compromiso del mazo (o escribir el propio). Al día siguiente el juego pregunta *"¿Lo hiciste?"* — sin verificación externa: **la confianza es la mecánica** | ~30 s | luz encendida, +2 brasas; compromiso de ayer cumplido: +3 |

Las tres encendidas → **Noche Completa**: animación de cierre + **+4 brasas bonus** (total día completo = 10) + racha +1.

### Racha (Estrella Guía)
- Día contado si las 3 luces se encendieron.
- **Noches nubladas**: 2 por semana calendario, se consumen automáticamente al fallar un día (estilo streak-freeze, sin culpa).
- Racha apagada → **rito de re-encendido** disponible siempre: releer una reflexión propia elegida + una respiración guiada de 30 s → racha renace en 1 (no se restaura el número). La recaída es parte del camino.
- Sin reset punitivo, sin countdown agresivo, sin vergüenza.

## 3. Sistemas

### 3.1 Estrellas y colección
- Cada captura = estrella con: tipo (dream/need/basta/value/compromiso/recurso — colores canónicos del movimiento), texto opcional, foto local opcional, lat/lng si hubo permiso, timestamp, y flags de rareza: **fundadora** (primera de su tipo), **nocturna** (capturada 22:00–06:00), **fugaz** (capturada durante un evento).
- **Constelaciones** (colecciones): 8 definidas en contenido estático; cada una pide 8–16 estrellas con mezcla de tipos (ej. "La Constelación del Cuidado": 6 need + 4 recurso + 2 value). La silueta se dibuja progresivamente en el álbum. Completarla → **Carta de Lore** (fragmento verbatim de 1–3 oraciones de los ensayos, con título del ensayo como atribución; tipografía Playfair; compartible como imagen) + marco visual.

### 3.2 Expediciones (la recolección de datos superior)
- Quest multi-paso desde **plantilla**: luminarias, comedores, precios, basurales, "¿qué falta?" (consulta). Cada plantilla define pasos con **micro-UI propia** (rating de 1–5 soles, contador numérico grande, selector de chips, foto guiada) — nunca un formulario plano.
- El jugador **funda** una expedición (elige plantilla + zona textual + meta de entradas; costo 15 brasas) o juega las precargadas. Hitos 25/50/100% → +10/+15/+25 brasas; 100% además → carta de expedición.
- **QR compartible**: la definición de una expedición se exporta como QR (`basta.exped.v1:<base64 json>`) para que otra persona la juegue en su barrio con su propio progreso.
- Temporadas precargadas por fecha (activación local por reloj): "Expedición de la Interdependencia" (1–15 de julio), "Expedición de la Primavera" (15–30 sept).

### 3.3 Economía (brasas) y progresión (rangos)
- **Brasas**: moneda blanda única. Fuentes: luces (+2 c/u), noche completa (+4), compromiso cumplido (+3), paso de expedición (+3), hitos, eventos. Usos: fundar expedición (15), paletas de cielo (30–80), regalar **chispa** (5). **Jamás dinero real.** Ledger append-only.
- **Rangos** por brasas *acumuladas históricas* (no balance): Chispa 0 · Vela 100 · Farol 300 · Fogata 700 · Faro 1500 · Aurora 3000. Cada rango: plantillas nuevas, paletas (el cielo migra del negro puro hacia tintes de amanecer), espacio extra de bitácora, animación de ascenso.

### 3.4 Eventos — estrellas fugaces
- Al abrir la app: máx. 1/día, probabilidad 15%. Efecto aleatorio entre: pregunta extra (+2 si la respondés), **día de brasas x2**, desafío 24 h (capturá 3 estrellas hoy → +8).
- Implementación determinista testeable: RNG con seed diaria persistida.

### 3.5 Social cara-a-cara (QR, sin servidores)
- **Compartir tu cielo**: view-shot → imagen (constelación + rango + racha) → share sheet. Canal de crecimiento orgánico.
- **Chispas**: regalás una chispa (costo 5 brasas) → QR one-shot (`basta.chispa.v1:<payload firmado con nonce>`); quien escanea recibe +5 brasas y una **estrella de amistad** (tipo especial, no señal). Anti-replay local: nonces canjeados se guardan.
- **Círculos por QR** (v1 mínimo): fundás un círculo local (nombre + glifo determinístico); su ficha viaja por QR; los miembros se cuentan localmente al escanear. Sin sync de estado más allá del intercambio presencial. (Los conectores harán el resto después.)

### 3.6 FTUE — primera estrella en <60 segundos
Cielo vacío → una sola pregunta: **"¿Qué falta acá donde estás parado?"** → una línea de texto → nace tu primera estrella (tipo need) con bloom + háptica → *"Así se enciende un país."* → tour breve de las Tres Luces (3 tooltips, salteables) → +5 brasas de bienvenida. Sin registro. GPS se pide recién en la primera captura real; cámara en la primera foto; notificaciones al final del día 2 (opt-in: "Tu cielo espera", 20:00 local, 1/día máx).

### 3.7 Ética innegociable
Cero ads · cero IAP · cero rankings individuales · sin FOMO agresivo (los eventos expiran en silencio) · datos 100% locales · **Export JSON** de todo (estrellas, reflexiones, compromisos, expediciones) desde Ajustes con un tap · fotos solo en almacenamiento de la app · borrado total disponible.

## 4. Contenido estático (src/content/)
- **~90 preguntas** curadas VERBATIM-adaptadas del corpus `Ensayos/indagaciones/*.md` (7 ensayos densos en preguntas) + `Ensayos/*.md`; rotación diaria determinística (día del año % n). Cada pregunta: id, texto, fuente.
- **Mazo de ~60 micro-compromisos** en rioplatense, concretos y verificables por uno mismo, en 6 categorías (vecindad, cuidado, coraje, palabra, orden, belleza).
- **5 plantillas de expedición** con schema de pasos y micro-UI por paso.
- **8 constelaciones** con silueta (puntos 2D normalizados), receta de tipos, y carta de lore (cita verbatim + ensayo fuente).
- **Textos de UI**: rioplatense siempre ("vos", "mirá", "dale").

## 5. Técnica

- **Expo SDK 57**, TS estricto, expo-router. Identidad: name **"¡BASTA!"**, slug `basta-juego`, scheme `bastajuego`, bundle `ar.basta.juego`, dark only, portrait.
- **El Cielo = Skia** (`@shopify/react-native-skia`): campo de estrellas con shader de titilado, líneas de constelación, partículas en payoffs. Presupuesto: 60fps, ≤300 estrellas visibles (LOD: las más viejas se agrupan en "polvo estelar" — glow agregado).
- **SQLite + Drizzle** (`expo-sqlite` + `drizzle-orm/expo-sqlite`): tablas `stars, reflections, commitments, days, expeditions, expedition_entries, ember_ledger, unlocks, redeemed_nonces, settings`. Migraciones con drizzle-kit generate + `useMigrations`.
- **Lógica de juego = TS puro en `src/game/`** (prohibido importar React/RN ahí): `racha.ts, brasas.ts, rangos.ts, colecciones.ts, eventos.ts, expediciones.ts, qr-codec.ts`. **Vitest** con cobertura de casos borde (semana con 2 nubladas, ledger, completar colección, RNG con seed, codec QR roundtrip).
- UI: NativeWind 4 + tokens plata (port de `mobile/src/theme` + motion + haptics — con los fixes de cssInterop y web ya aprendidos). Reanimated 4 para chrome; Skia para el mundo.
- Módulos nativos: expo-camera (captura + escaneo QR), expo-location (fixes puntuales, jamás tracking continuo), expo-haptics, expo-notifications (local only), react-native-view-shot, react-native-qrcode-svg, expo-sharing, expo-file-system.
- **Rutas**: `index` (El Cielo) + modales `ver`, `encender`, `dar`, `expediciones` (+`[id]`, `fundar`), `album`, `bitacora`, `qr` (dar/recibir), `circulo`, `ajustes`, `ftue`.
- Pitfalls conocidos a aplicar desde el inicio: `cssInterop` para todo componente animado custom y Animated.*; animaciones de entrada off en web; Skia web via CanvasKit para preview.

## 6. Verificación

1. `npx tsc --noEmit` limpio + `npx vitest run` verde (lógica de juego) en cada etapa.
2. `npx expo export --platform android` como gate de bundle.
3. Preview web (puerto 8082, perfil launch.json propio) — walkthrough con screenshots: FTUE → Tres Luces → captura → noche completa → álbum → expedición → QR → export.
4. Game feel final requiere device build (EAS) — fuera del alcance nocturno; queda documentado.

## 7. Fuera de alcance v1
Backend/sync, mapa GIS, push remoto, stores (EAS/submission), sonido (hooks preparados, assets después), multi-idioma.

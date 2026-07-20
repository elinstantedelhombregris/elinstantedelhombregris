# Auditoría de engagement — ¡BASTA! el juego

*2026-07-19 · contra el build actual (juego/ con capa cívica Territorio Vivo integrada)*

## 0. El principio que ordena todo

Los juegos móviles comerciales fabrican significado falso y lo envuelven en andamiaje
de compulsión perfecto. Este juego tiene el problema inverso: **significado real
(un país, ensayos reales, necesidades reales) con andamiaje de engagement a medio
construir.** La regla de diseño que sale de ahí:

> Tomamos de los videojuegos el **andamiaje** (loops, cadencia, variabilidad,
> celebración, colección) y dejamos que la **recompensa** sea siempre significado
> (palabras, belleza, visibilidad real). Nunca al revés. El día que el andamiaje
> reemplaza al significado, el juego se vuelve "puntos por ciudadanía" y muere
> con razón.

Marco usado abajo: anatomía del loop (gatillo → acción → recompensa variable →
inversión), Self-Determination Theory (autonomía / competencia / relación),
y las 8 palancas de Octalysis. La ética del spec §3.7 (sin ads, sin IAP, sin
rankings individuales, datos locales) es una restricción dura y también la
ventaja competitiva: la credibilidad del movimiento ES el producto.

## 1. Lo que ya está fuerte (no tocar, amplificar)

| Sistema | Por qué funciona | Palanca |
|---|---|---|
| Ficción La Constelación + plata/argentum | Identidad estética única; ningún juego móvil tiene esta autenticidad | Significado épico |
| Racha con noches nubladas + rito sin culpa | Más humano que Duolingo; retención "amable" estilo Animal Crossing | Evitación sin castigo |
| Cielo = datos propios, export total | Propiedad literal; el jugador ES dueño de su progreso | Ownership |
| Tres Luces (90 segundos/día) | Sesión corta perfecta para hábito diario | Ritual |
| Nacimiento de estrella con bloom + háptica | El momento "juice" central existe y es bello | Recompensa inmediata |
| QR cara a cara | Crecimiento = organización real del movimiento | Relación |
| Capa cívica local-first con consentimiento | La transformación real (escucha→custodia→entrega) | Significado épico |

## 2. Los huecos (la auditoría con dientes)

### 2.1 Recompensa variable casi inexistente
La única aleatoriedad es la estrella fugaz (15% diario). Cada ENCENDER produce
una estrella predecible. Las rarezas EXISTEN (nocturna, fugaz, fundadora) pero
son invisibles: no hay momento de revelación. Un coleccionable sin momento de
apertura no genera anticipación. **La anticipación, no la recompensa, es lo que
trae de vuelta.**

### 2.2 Techo de contenido a ~3-4 semanas
8 constelaciones, 5 expediciones, 4 paletas, 6 rangos. Un jugador comprometido
lo agota en un mes. Después de Aurora (3000 brasas): nada. No hay "elder game".

### 2.3 El cielo no vive sin vos
Volvé a los 3 días: cielo idéntico. Los mundos que retienen (Animal Crossing,
Neko Atsume) cambian con el tiempo real aunque no juegues, y **te regalan algo
por volver en vez de castigarte por faltar.**

### 2.4 Cero competencia/maestría
Todo premia participación; nada premia hacerlo *bien*. Sin eje de maestría no
hay orgullo de habilidad. El eje legítimo acá es **calidad de dato** (la
"excellent throw" de Pokémon GO): captura completa, foto, precisión → estrella
más brillante.

### 2.5 Relación latente, no presente
No hay "nosotros" dentro de la app. La chispa regalada no deja rastro visible
en tu cielo (¡el tipo `amistad` ya existe y casi no se usa!). No hay espejo
colectivo anónimo ("hoy 214 personas encendieron en Córdoba") ni meta
compartida de círculo.

### 2.6 Sin arco narrativo
Las cartas de lore son desbloqueos estáticos. El corpus real (6 ensayos +
indagaciones + interdependencia) podría gotearse como camino narrativo — el
tirón de Journey/Sky: Children of Light — y hoy no gotea.

### 2.7 Hitos sin ceremonia
7/30/100/365 noches pasan sin fiesta. No hay recap anual. Las noches nubladas
(el "streak freeze" propio) no son legibles — el jugador no sabe que las tiene.

### 2.8 FTUE invertido (regresión de la capa cívica)
El onboarding actual vende gobernanza de datos antes que asombro. Time-to-fun
pasó de <60s (primera estrella) a ~3 pantallas de contrato. Parcialmente
re-puenteado hoy (escucha→estrella + "Ver mi cielo"), pero el orden sigue
invertido.

## 3. Catálogo de técnicas (juego → técnica → implementación nuestra)

**Legítimas — adoptar:**

1. **Streak con gracia legible** (Duolingo streak freeze = su feature #1 de
   retención): mostrar el banco de noches nubladas como objetos ("te quedan ◐◐
   esta semana") + hitos de racha 7/30/100/365 con ceremonia.
2. **Mundo en tiempo real** (Animal Crossing): astronomía real determinística —
   fase lunar dibujada en el Cielo, Cruz del Sur visible según estación,
   **lluvias de meteoros reales** (Perseidas, Gemínidas → noches especiales de
   fugaces). Escasez honesta: si te la perdés, vuelve el año que viene, como
   en el cielo de verdad. Cero servidor.
3. **Regalo de regreso** (Neko Atsume, idle games): tras ausencia, "mientras no
   estabas, la Guía te esperó" + una brasa del rescoldo. Nunca culpa; siempre
   bienvenida.
4. **Momento de revelación de rareza** (apertura de sobre, sin gacha): al nacer
   la estrella, el destello "rueda" y revela nocturna/fugaz/doble. La
   aleatoriedad solo toca cosméticos y lore, jamás progreso.
5. **Casi-completar** (álbumes de colección): "a La Yunta le falta UNA estrella"
   visible en el Cielo — la constelación incompleta titila distinto. El
   gradiente de completitud es de los motivadores más fuertes que existen.
6. **Goteo narrativo** (Sky: CotL): "El Camino del Hombre Gris" — capítulos del
   corpus que se abren con noches completas, no con brasas. Leer es el premio.
7. **Maestría de captura** (Pokémon GO excellent throw): calidad de dato →
   brillo de estrella + rango "cartografía fina".
8. **Presencia social sin ranking** (Journey: compañeros anónimos): la chispa
   recibida vive como **estrella amiga** (plata, tipo `amistad`) en tu cielo;
   círculo → constelación compartida con meta colectiva ("entre los 5, 30
   escuchas esta semana"); espejo del pulso: conteos anónimos agregados.
9. **Expresión** (Animal Crossing decorar): **dibujar y nombrar tus propias
   constelaciones** uniendo tus estrellas. Local puro, ownership máximo, y la
   share card de una constelación nombrada es viral por diseño.
10. **Ceremonias de hito** (anillos de Apple Watch, Spotify Wrapped): "Tu año
    bajo el cielo" — recap anual compartible.
11. **Intención de implementación** (ciencia de hábitos): DAR ya pre-compromete;
    agregar "¿cuándo?" (un plan chico duplica el cumplimiento).
12. **Resurfacing de inversión** (Day One/Timehop): "hace un mes escribiste
    esto" en la bitácora — la inversión pasada trae de vuelta.
13. **Notificación con voz propia**: una sola diaria, narrativa ("la Guía
    espera"), solo si la racha corre riesgo real. Jamás culpa.

**Prohibidas — y por qué (dejarlo escrito):**
energía/vidas (pay-gate del tiempo), countdowns FOMO, gacha con progreso,
rankings individuales (mata la cooperación y humilla), notificaciones de culpa,
feeds infinitos, "solo por hoy" artificial. Cada una compra retención vendiendo
la credibilidad — y la credibilidad es el activo del movimiento.

## 4. Roadmap priorizado

**T1 — esta semana (alto impacto, bajo costo, todo local/determinístico):**
1. FTUE asombro-primero: pregunta → estrella (<60s); el pacto de datos aparece
   la primera vez que elegís "sumar al pulso colectivo" (ahí es relevante).
2. Banco de noches nubladas visible + hitos de racha con ceremonia.
3. Revelación de rareza al nacer la estrella.
4. Regalo de regreso tras ausencia.
5. Casi-completar: constelación a-una-estrella titila + línea en el Cielo.
6. Cielo en tiempo real: fase lunar + constelación estacional + lluvias de
   meteoros reales del calendario astronómico.

**T2 — próximas semanas:**
7. El Camino del Hombre Gris (goteo narrativo del corpus).
8. Constelaciones propias (dibujar + nombrar + compartir).
9. Estrella amiga (chispa recibida → estrella plata en tu cielo).
10. Maestría de captura en expediciones.
11. Resurfacing de bitácora + "¿cuándo?" en DAR.
12. Recap "Tu año bajo el cielo".

**T3 — necesita red/movimiento:**
13. Espejo del pulso (conteos anónimos por provincia, vía API cívica).
14. Metas compartidas de círculo.
15. Noches de comunidad en lluvias de meteoros reales.

## 5. Métricas (respetando local-first)

Norte: **noches completas por jugador por semana** (profundidad de hábito) y
**chispas canjeadas** (contagio real), no DAU. Sin telemetría estamos ciegos:
proponer contador local + envío opcional anónimo por el outbox cívico existente
(mismo consentimiento que el pulso). Medir el funnel FTUE→primera estrella→
primera noche completa→día 7.

## 6. Registro de decisiones pendientes de Juan

- ¿Brasas por actos cívicos? La capa cívica hoy premia solo corroboración y
  resultado confirmado (anti-farmeo, defendible). Alternativa: reconocer el
  *primer* acto de cada tipo (una vez) sin premiar volumen.
- ¿Reordenar el FTUE? (T1.1 — recomendado fuerte, revierte una decisión de la
  sesión Territorio Vivo).

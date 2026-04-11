# Cancionero ¡BASTA! — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code skill that produces fully-specified, production-ready song documents for the ¡BASTA! movement — lyrics, musical arrangement, and AI music-tool prompts — across every Argentine musical genre.

**Architecture:** Three markdown files form the skill: `SKILL.md` (main logic, science frameworks, operational modes, ¡BASTA! integration), `genre-reference.md` (12-genre intelligence database), and `song-template.md` (output template). SKILL.md reads genre-reference.md and song-template.md at runtime. All content in Spanish rioplatense where appropriate.

**Tech Stack:** Claude Code skill system (SKILL.md with YAML frontmatter), Markdown

**Spec:** `docs/superpowers/specs/2026-04-10-cancionero-basta-design.md`

---

## File Map

| File | Purpose | Action |
|---|---|---|
| `.claude/skills/cancionero-basta/SKILL.md` | Main skill — frontmatter, mission, science frameworks, 3 operational modes, ¡BASTA! integration, quality tests, output instructions | Create |
| `.claude/skills/cancionero-basta/genre-reference.md` | Full 12-genre intelligence database with rhythmic DNA, harmony, instruments, register, message mode, references | Create |
| `.claude/skills/cancionero-basta/song-template.md` | Complete song document template with all 6 sections and inline instructions | Create |

---

### Task 1: Create directory structure and genre-reference.md

**Files:**
- Create: `.claude/skills/cancionero-basta/genre-reference.md`

This is the foundation — the genre intelligence database that SKILL.md references. Contains all 12 Argentine genre families with full structural DNA.

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p .claude/skills/cancionero-basta
```

- [ ] **Step 2: Write genre-reference.md with all 12 genre families**

Write the file `.claude/skills/cancionero-basta/genre-reference.md` with the following complete content:

````markdown
# Cancionero ¡BASTA! — Base de Datos de Géneros Argentinos

Referencia completa de los 12 géneros musicales argentinos. Para cada género: ADN rítmico, lenguaje armónico, paleta instrumental, registro lírico, modo de entrega del mensaje, y referentes clave.

---

## 1. Tango & Milonga

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Tango canción, tango electrónico, milonga campera, milonga ciudadana, vals criollo |
| **Compás** | 2/4 (tango), 2/4 binario (milonga), 3/4 (vals) |
| **BPM** | 60-72 (tango canción), 72-90 (milonga), 84-96 (vals) |
| **ADN rítmico** | Arrastre del bandoneón, síncopa 3-3-2, marcato en 4, bordoneo de guitarra. El tango se mueve entre lo escrito y lo sentido — el rubato es identidad, no decoración |
| **Armonía** | Tonalidades menores dominantes, cromatismos de paso, acordes disminuidos para tensión, progresiones II-V-I y VI-II-V-I. Estilo Piazzolla: acordes extendidos (9nas, 11nas, 13nas) para tango moderno |
| **Tensión armónica** | Alta tolerancia a la disonancia sostenida. El tango vive en la tensión — la resolución llega tarde y parcial. Ratio tensión:resolución ~70:30 |
| **Instrumentos clave** | Bandoneón (protagonista), guitarra criolla (bordoneo + rasguido), contrabajo (pizzicato + arco), violín (melodía + contracanto), piano (armonía + percusión rítmica). Electrónico: añadir pads, beats sutiles, procesamiento de bandoneón |
| **Registro lírico** | Lunfardo clásico — "pibe", "mina", "morfar", "afanar", "bulín", "percanta", "fiaca", "laburo", "grela", "berretín". Narrativo, frecuentemente en pasado. El tango cuenta una historia de pérdida que se vuelve sabiduría. Tiempo verbal: pretérito imperfecto/indefinido |
| **Modo de mensaje** | Metafórico, narrativo. La verdad llega como historia — un personaje que vivió algo, una calle que cambió, un Buenos Aires que refleja la nación. El oyente se identifica con el personaje, no con un argumento |
| **Estructura típica** | Intro (bandoneón o guitarra sola) → Verso 1 (narrativa, voz íntima) → Estribillo (reflexión, intensidad sube) → Verso 2 (desarrollo) → Puente (clímax emocional) → Estribillo final (resolución o pregunta abierta) |
| **Referentes** | Gardel (fundacional), Piazzolla (revolución armónica), Pugliese (yumba, potencia), Goyeneche (fraseo, interpretación), Adriana Varela (tango contemporáneo femenino), Bajofondo (electrotango), Gotan Project (electrotango global) |
| **Claves para autenticidad** | El arrastre rítmico (nunca mecánico), el fraseo vocal con rubato, la guitarra criolla en bordoneo — no guitarra flamenca. Si suena a tango genérico, falló. Debe sonar a Buenos Aires específico — un barrio, una esquina, una hora del día |

## 2. Folklore

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Chacarera (trunca y doble), zamba, vidala, baguala, huayno, chamamé, malambo, tonada cuyana, cueca, gato |
| **Compás** | 6/8 (chacarera, zamba, gato), 3/4 (vals, tonada), 6/8 birrítmico con hemiola (chamamé) |
| **BPM** | 80-100 (zamba), 100-130 (chacarera), 90-110 (chamamé), 60-80 (vidala/baguala) |
| **ADN rítmico** | Bombo legüero: patrón golpe-aro (parche en tiempos fuertes, aro en débiles), hemiola 3 contra 2 (la superposición de 6/8 y 3/4 que define el folklore argentino). Rasguido de guitarra criolla con chasquido. Arpegio de arpa paraguaya (chamamé). La baguala: libre, sin compás fijo, grito del cerro |
| **Armonía** | Modal (dórico, mixolidio), I-IV-V con séptimas naturales, cadencias plagales (IV-I), bimodalidad (alternar mayor/menor del mismo centro tonal). La chacarera trunca usa progresiones con resolución suspendida |
| **Tensión armónica** | Baja tensión, alta calidez. El folklore resuelve con frecuencia — la tierra no genera ansiedad, genera pertenencia. Ratio tensión:resolución ~30:70 |
| **Instrumentos clave** | Bombo legüero (sagrado — define el género), guitarra criolla, violín (NOA), quena y charango (NOA andino), acordeón (chamamé litoral), arpa paraguaya (chamamé). Caja chayera para copla norteña |
| **Registro lírico** | Lenguaje de la tierra — río, monte, cerro, pago, rancho, copla, vidala, soledad, zafra. Regional: NOA tiene quechuismos ("pachamama", "yapa", "puna"), Litoral tiene guaranismos ("sapukái", "gurisé"). Poético pero concreto — imágenes de la naturaleza como cosmovisión, no como decoración |
| **Modo de mensaje** | Ancestral, sabiduría de la tierra. La verdad llega como algo que la tierra siempre supo. "El río sabe" no es metáfora — es cosmovisión. El folklore no argumenta: recuerda. La memoria de la tierra es el argumento |
| **Estructura típica** | Chacarera: Intro instrumental → Estrofa 1 (copla) → Interludio → Estrofa 2 → Estribillo → Interludio de zapateo → Estrofa 3 → Cierre. Zamba: Más lenta, intro de guitarra arpegiada → Estrofas con melodía descendente → Estribillo contemplativo |
| **Referentes** | Atahualpa Yupanqui (padre fundador), Mercedes Sosa (voz de América), Los Chalchaleros (coral), Peteco Carabajal (chacarera), Divididos (fusión rock-folklore), Raly Barrionuevo (contemporáneo), Chango Spasiuk (chamamé), Soledad Pastorutti (folklore popular) |
| **Claves para autenticidad** | El bombo legüero NUNCA suena como un bombo de batería — tiene resonancia, tiene tierra. La guitarra criolla tiene cuerdas de nylon, rasguido con uñas. El silencio entre las notas es tan importante como las notas. Si suena "producido", falló. Debe sonar como un fogón en Santiago del Estero a las 3 de la mañana |

## 3. Rock Nacional

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Rock, blues argentino, prog, hard rock, rock barrial, post-punk, new wave argentino, rock acústico |
| **Compás** | 4/4 predominante, 6/8 en baladas, métricas irregulares en prog (7/8, 5/4) |
| **BPM** | 70-85 (balada), 100-130 (rock medio), 140-170 (punk-rock/barrial) |
| **ADN rítmico** | Batería con groove propio argentino — ni americano ni británico, más "suelto" y sincopado, con swing interno. Riff de guitarra como identidad de canción (cada tema tiene SU riff). Bajo que dialoga con la voz, no solo sostiene |
| **Armonía** | Ecléctico — I-IV-V (barrial), progresiones modales y cromatismo (Spinetta), dominantes secundarios y modulaciones sorpresa (Cerati), power chords crudos (Pappo). El rock argentino no tiene una regla armónica — tiene tradiciones que cada artista reinventa |
| **Tensión armónica** | Variable por subgénero. Spinetta: tensión intelectual sostenida (~60:40). Barrial: tensión-resolución directa (~40:60). Cerati: tensión elegante con resoluciones inesperadas (~50:50) |
| **Instrumentos clave** | Guitarra eléctrica (limpia para Spinetta/Cerati, distorsionada para Pappo/barrial), bajo, batería, teclados (Charly — piano acústico como arma), guitarra acústica para intros y puentes, armónica (blues argentino) |
| **Registro lírico** | Poético-callejero. Spinetta: surrealismo lírico, imágenes oníricas. Charly: ironía social mordaz, observación aguda. Solari: críptico-profundo, mitología propia. Pity: crudo-existencial, la calle sin filtro. Cerati: elegancia y sensualidad conceptual. El rock argentino tiene la tradición lírica más rica de Latinoamérica — se espera poesía, no solo rima |
| **Modo de mensaje** | Revelación poética. La verdad llega como imagen que estalla. "Canción de Alicia en el País" no dice "la dictadura está mal" — construye un mundo donde sentís que algo está mal. "Rasguña las Piedras" no dice "hay que resistir" — te pone bajo tierra empujando hacia arriba. Mostrar, no decir |
| **Estructura típica** | Intro (riff o arpegio icónico) → Verso 1 (narrativa/imagen) → Pre-estribillo (tensión) → Estribillo (revelación) → Verso 2 (profundización) → Puente (quiebre, cambio de dinámica) → Estribillo final (amplificado) → Outro (riff o desvanecimiento) |
| **Referentes** | Spinetta (genio lírico), Charly García (provocador brillante), Cerati/Soda Stereo (sonido global), Pappo (blues y potencia), Solari/Indio (culto, críptico), Calamaro (cancionero), Fito Páez (melodista), Divididos (potencia + raíz), La Renga (barrial épico), Pity Álvarez (existencial) |
| **Claves para autenticidad** | El rock argentino NO es rock traducido — tiene identidad propia. La guitarra suena distinta (Spinetta usaba escalas que ningún rockero anglosajón usaría). Las letras importan tanto como la música — un rock argentino con letra mediocre es un fracaso. El "aguante" (lealtad tribal) define al rock barrial — la canción debe generar pertenencia |

## 4. Cumbia

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Cumbia villera, cumbia santafesina, cumbia pop, cumbia digital/electrónica, cumbia 420/RKT |
| **Compás** | 4/4 siempre, pero subdivisiones distintas por subgénero |
| **BPM** | 90-105 (villera), 95-110 (santafesina), 100-115 (digital), 130-145 (RKT) |
| **ADN rítmico** | Güiro/tumbadora pattern constante (el "chaca-chaca" que define la cumbia), bajo sincopado marca identidad (el bajo de cumbia villera es inconfundible — pesado, repetitivo, hipnótico), teclado con melodía pegajosa en loop, requinto santafesino (guitarra eléctrica con delay y reverb, sonido cristalino) |
| **Armonía** | Simple y funcional: I-IV-V-I, I-V-vi-IV. Villera puede funcionar sobre 2 acordes en loop infinito. La complejidad no está en la armonía sino en el ritmo, la melodía del teclado, y la letra |
| **Tensión armónica** | Mínima tensión armónica — la cumbia resuelve constantemente. El ciclo repetitivo ES el punto. Ratio tensión:resolución ~20:80 |
| **Instrumentos clave** | Teclado (protagonista melódico — la melodía de teclado ES la identidad de cada tema), bajo (pesado, sincopado), güiro, tumbadoras, timbal. Villera: acordeón ocasional. Santafesina: requinto (guitarra con delay). Digital: sintetizadores, 808s, samples |
| **Registro lírico** | Villera: villero puro — "gato/a", "rati", "paco", "barrio", "rancho", "gorra", "chabón", "guacho", "joda", "rescatate". Sin eufemismos, sin filtro. Santafesina: más romántica, popular, accesible. Pop: universal, bailable. Digital: mezcla de registros. El vocabulario debe ser EXACTO al subgénero — un villero detecta al instante si la letra es falsa |
| **Modo de mensaje** | Crudo y celebratorio. La cumbia villera dice la verdad de la calle sin metáfora ni vergüenza. Pero también celebra: la fiesta como resistencia, el baile como libertad, la joda como dignidad. La cumbia no pide permiso — toma el espacio |
| **Estructura típica** | Intro (teclado con melodía principal) → Verso 1 (historia/situación) → Estribillo (hook bailable, repetitivo, diseñado para el coro del público) → Verso 2 → Estribillo x2 → Puente/break (percusión sola o bajo solo) → Estribillo final x2-3 (el público ya lo canta) |
| **Referentes** | Damas Gratis / Pablo Lescano (rey de la villera), Pibes Chorros, Los Palmeras (santafesina clásica), Gilda (santa de la cumbia), Mala Fama, El Dipy, L-Gante (cumbia 420, fusión con trap), Nene Malo, Cumbia Ninja |
| **Claves para autenticidad** | La melodía de teclado debe ser adictiva desde el primer segundo. El bajo debe "pegar" en el pecho. Si no podés bailar, falló. La letra de cumbia villera debe sonar como si la hubiera escrito alguien DEL barrio, no alguien que visitó el barrio. El estribillo debe ser cantable por un estadio entero en 30 segundos |

## 5. Cuarteto

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Cuarteto cordobés clásico, cuarteto moderno, cuarteto-cumbia fusión |
| **Compás** | 4/4, definido por el patrón rítmico "tunga-tunga" |
| **BPM** | 110-130 |
| **ADN rítmico** | Tunga-tunga: bombo en 1 y 3, hi-hat en cada corchea, piano/teclado haciendo el patrón sincopado que da el "rebote" característico. El groove tunga-tunga es sagrado — si no rebota, si no te mueve la cintura, no es cuarteto. Es el heartbeat de Córdoba |
| **Armonía** | I-IV-V, I-V-vi-IV. Simple, funcional, al servicio absoluto del ritmo y la melodía vocal. El cuarteto no innova en armonía — innova en energía |
| **Tensión armónica** | Muy baja tensión armónica. Todo resuelve rápido y vuelve al loop. La energía viene del ritmo y la voz, no de la armonía. Ratio ~15:85 |
| **Instrumentos clave** | Teclado (protagonista absoluto — define cada tema), bajo (refuerza el tunga-tunga), batería (patrón tunga-tunga inalterable), guitarra rítmica (relleno), trompeta/saxo opcionales para acentos. El sonido del teclado debe ser brillante, presente, pegajoso |
| **Registro lírico** | Cordobés — "culiado", "dale bo", "qué onda", "negro/a" (afectuoso), "fiesta", "bailar". Fiestero, romántico, humorístico, directo. El cuarteto no tiene pretensión intelectual — tiene pretensión de hacerte feliz. El humor es herramienta, no debilidad |
| **Modo de mensaje** | Alegría y sabiduría callejera. El cuarteto lleva la verdad dentro de la fiesta — el mensaje entra bailando, sin que lo notes. Como el tío que te da el mejor consejo de tu vida mientras sirve fernet |
| **Estructura típica** | Intro (teclado con melodía pegajosa) → Verso 1 (historia, humor o romance) → Estribillo (explosión de energía, el público salta) → Verso 2 → Estribillo → Break (solo de teclado o momento de palmas) → Estribillo final x2-3 (máxima energía) |
| **Referentes** | La Mona Jiménez (dios del cuarteto — 50+ años de vigencia), Rodrigo (leyenda, potencia emocional), La Barra, La Konga, Ulises Bueno, Damián Córdoba, Q' Lokura |
| **Claves para autenticidad** | Si no suena a Córdoba, falló. El acento cordobés en la voz es no negociable para autenticidad total. El tunga-tunga debe ser exacto — acelerado o arrastrado arruina todo. La energía debe ser desbordante — el cuarteto es la fiesta más grande de Argentina |

## 6. Trap / Rap Argentino

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Trap, rap boom bap, freestyle, drill argentino, RKT, trap melódico |
| **Compás** | 4/4, half-time feel (trap — suena a la mitad del BPM real), boom bap directo (rap clásico) |
| **BPM** | 65-85 (trap half-time, percibido como 130-170), 85-100 (boom bap), 130-145 (RKT/drill) |
| **ADN rítmico** | 808 sub-bass con glide (el bajo que vibra en el pecho), hi-hat rolls con variaciones (triples, quintillos), snare/clap en 2 y 4 (boom bap), dembow riddim (RKT). El SILENCIO es instrumento — los huecos rítmicos dan peso a lo que suena. El "bounce" del half-time es hipnótico |
| **Armonía** | Minimal — loops de 2-4 acordes en menor, samples melódicos procesados, piano melancólico, pads atmosféricos. La armonía es ambiente, no estructura. La complejidad armónica está en el flow vocal — las síncopas, los cambios de velocidad, las pausas |
| **Tensión armónica** | Tensión ambiental constante — el trap vive en un estado de tensión no resuelta (tonalidades menores, loops sin resolución). No hay catarsis armónica; la catarsis es vocal/lírica. Ratio ~65:35 |
| **Instrumentos clave** | 808 (sub-bass fundamental), hi-hats programados (carácter del tema), pads/synths atmosféricos, piano (melancólico o agresivo), autotune (según artista — no obligatorio). Producción 100% electrónica. El sonido del 808 debe "pegar" en sistemas de sonido grandes |
| **Registro lírico** | Urbano contemporáneo — "flow", "real", "calle", "pegar", "hacerla", mezcla español-inglés, neologismos constantes que cambian cada 6 meses. El trap argentino tiene acento propio — rioplatense con cadencia urbana, NO copia del trap americano ni del español. Wos tiene vocabulario de poeta callejero; Duki tiene swagger porteño; Trueno tiene punch de freestyler |
| **Modo de mensaje** | Desafío y verdad cruda. El trap habla desde el "yo hice" y "yo vi" — la verdad es autobiográfica. No cuenta lo que pasa, cuenta lo que vivió. La credibilidad es todo — una línea falsa destruye una canción entera. El boast (alarde) es vehículo de empoderamiento, no de ego |
| **Estructura típica** | Intro (ambiente, pad, o acapella) → Verso 1 (flow narrativo, 16 compases) → Hook/Estribillo (melódico, pegajoso, repetitivo) → Verso 2 (flow más intenso, punchlines más duros) → Hook → Bridge (cambio de flow o breakdown) → Hook final → Outro |
| **Referentes** | Duki (melódico, emocional), Bizarrap (productor referente), Wos (lírica potente, freestyle), Trueno (punch, política), Nicki Nicole (fusión, pop crossover), YSY A (dark, experimental), Neo Pistea (OG del trap arg), Tiago PZK (melódico joven), L-Gante (cumbia 420) |
| **Claves para autenticidad** | El flow debe sonar natural en acento rioplatense — no imitar cadencias americanas. Las punchlines deben tener doble o triple sentido. Los ad-libs deben ser orgánicos ("eh", "prra", respiraciones). La producción debe sonar actual — el trap envejece rápido; usar sonidos de hace 2 años suena anticuado. El 808 debe dominar el espectro grave |

## 7. Pop / Indie Argentino

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Pop, indie, electropop, folk-pop, dream pop, new wave revival, bedroom pop |
| **Compás** | 4/4 dominante, 3/4 para baladas y folk-pop |
| **BPM** | 75-95 (balada), 100-125 (pop/indie mid-tempo), 120-140 (electropop/dance) |
| **ADN rítmico** | Variado — fingerpicking acústico, drum machines vintage, ritmos "flotantes" y atmosféricos. El indie argentino tiende a ritmos menos agresivos, más espaciados, con aire entre los golpes. El pop busca el groove bailable pero sofisticado |
| **Armonía** | La más sofisticada de los géneros populares — séptimas mayores, novenas, progresiones inesperadas (I-III-vi-IV), préstamos modales (acordes de la tonalidad paralela), cadenas de dominantes secundarios. El indie busca que "suene lindo" pero nunca obvio |
| **Tensión armónica** | Tensión elegante, modulada. El pop/indie mantiene una tensión suave que seduce más que confronta. Resoluciones satisfactorias pero por caminos inesperados. Ratio ~45:55 |
| **Instrumentos clave** | Guitarra acústica y eléctrica limpia (con chorus/reverb/delay), sintetizadores analógicos o emulaciones, programación rítmica sutil, cuerdas (reales o sintetizadas), piano (acústico o eléctrico), efectos de ambiente (reverb larga, delay con feedback) |
| **Registro lírico** | Intimista, generacional, vulnerable. Habla desde el mundo interior — la duda, la ansiedad, el amor incierto, la búsqueda de sentido. Lenguaje cotidiano con giros poéticos inesperados. No grita — susurra verdades que no te animás a decir en voz alta |
| **Modo de mensaje** | Emocional primero. La verdad llega como sentimiento compartido — "vos también sentís esto, ¿no?". No te dice qué pensar, te dice qué sentir. Y al sentirlo juntos, la comunidad se forma sola |
| **Estructura típica** | Intro (atmosférica, guitarra o synth) → Verso 1 (íntimo, voz cercana) → Pre-estribillo (build sutil) → Estribillo (apertura emocional, melodía memorable) → Verso 2 (profundización) → Estribillo → Puente (quiebre, momento de vulnerabilidad máxima) → Estribillo final (con capas adicionales) → Outro (desvanecimiento o nota final sostenida) |
| **Referentes** | Conociendo Rusia (pop inteligente), Bandalos Chinos (groove sofisticado), Él Mató a un Policía Motorizado (indie crudo), Lisandro Aristimuño (folk-pop poético), Miranda! (electropop), Zoe Gotusso (intimismo), Ca7riel y Paco Amoroso (experimental) |
| **Claves para autenticidad** | La producción debe sonar "humana" — ni demasiado pulida ni deliberadamente lo-fi. Las letras deben sentirse escritas a las 4am, no en una sala de reuniones. La melodía del estribillo debe poder tararearse pero tener al menos un giro armónico o melódico que sorprenda. El tono general es melancolía luminosa — tristeza que sonríe |

## 8. Punk / Hardcore

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Punk rock, ska-punk, hardcore, oi!, crust, pop-punk argentino |
| **Compás** | 4/4 rápido, offbeat (ska-punk) |
| **BPM** | 150-200 (punk), 140-170 (ska-punk), 160-220 (hardcore) |
| **ADN rítmico** | D-beat (punk clásico), blast beat (hardcore extremo), offbeat guitar + upstroke (ska), bass-drum machine gun constante. Velocidad = furia. La energía es implacable — no hay respiro, no hay producción bonita, hay verdad a 200 BPM |
| **Armonía** | Power chords (5ta justa, sin 3ra — ambigüedad mayor/menor), progresiones punk (I-IV-V, I-bVII-IV, I-V-bVII-IV), cromatismo descendente para tensión. Tres acordes y la verdad |
| **Tensión armónica** | Alta tensión sostenida — el punk no resuelve, ATACA. La resolución es el final de la canción. Ratio ~75:25 |
| **Instrumentos clave** | Guitarra distorsionada (Marshall saturado, sin efectos — solo volumen), bajo agresivo y presente, batería rápida e implacable, voz gritada/cantada (nunca producida/afinada). Ska-punk: añadir trompeta, trombón, saxo |
| **Registro lírico** | Callejero, crudo, directo. Cero metáfora — el punk dice exactamente lo que piensa. Vocabulario de la bronca: "sistema", "policía", "mentira", "luchar", "basta", "acá estamos". Oraciones cortas. Declaraciones. Imperativos |
| **Modo de mensaje** | Furia cruda y rebelión directa. El punk no sugiere — EXIGE. No describe el problema — te GRITA la solución. No convence — confronta. Es el género con el menor filtro entre la emoción y la palabra |
| **Estructura típica** | Intro (4-8 compases de guitarra/batería a toda velocidad) → Verso 1 (voz gritada, corto) → Estribillo (gritado por todos, diseñado para pogo) → Verso 2 (más intenso) → Estribillo → Puente (breakdown: mitad de tempo, tensión máxima) → Estribillo final x2-3 (catarsis total) → Final abrupto |
| **Referentes** | 2 Minutos (punk clásico argentino), Attaque 77 (punk melódico), Todos Tus Muertos (fusión ska-punk-reggae), Flema (hardcore/punk), Fun People (hardcore melódico), Cadena Perpetua, Sin Ley |
| **Claves para autenticidad** | NO debe sonar producido ni limpio. La imperfección es honestidad. Los coros son del público gritando, no un coro afinado. Si dura más de 3 minutos, probablemente sobra algo. La energía debe ser tal que al leer la letra sientas ganas de romper algo — constructivamente |

## 9. Electrónica

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Electrotango, cumbia digital, techno, house, downtempo, IDM, folktronica |
| **Compás** | 4/4 (house/techno), variable (experimental/folktronica) |
| **BPM** | 90-110 (downtempo), 118-128 (house), 128-145 (techno), variable (experimental) |
| **ADN rítmico** | Four-on-the-floor (house/techno), evolución gradual por sustracción y adición de capas. Repetición hipnótica. La electrónica argentina fusiona — no copia Berlin ni Detroit. Mezcla bombo legüero con kick electrónico, bandoneón con sintetizador |
| **Armonía** | Minimal — loops armónicos, drones, evolución tímbrica más que armónica. El movimiento está en la TEXTURA (filtros, resonancia, espacialización), no en los acordes. Un acorde sostenido con un filtro que se abre lentamente tiene más emoción que una progresión compleja |
| **Tensión armónica** | Tensión creciente por acumulación, no por armonía. Capas se suman, frecuencias se abren, el grave crece — y el DROP resuelve todo de golpe. Ratio variable: build ~80:20, drop ~20:80 |
| **Instrumentos clave** | Sintetizadores (analógicos o emulaciones: Moog, Juno, Prophet), drum machines (TR-808, TR-909), samplers, procesamiento de audio. Electrotango: bandoneón sampleado y procesado, cuerdas a través de granular synthesis. Folktronica: bombo legüero procesado, charango con delay |
| **Registro lírico** | Minimal y repetitivo. Pocas palabras, máximo impacto. Spoken word procesado (vocoders, delays, granular). La letra es un elemento SONORO — su textura importa tanto como su significado. A veces solo una frase repetida 50 veces hasta que se convierte en mantra |
| **Modo de mensaje** | Hipnótico, subliminal. El mensaje se INSTALA por repetición y ambiente — no se dice, se siente. Como un mantra que altera el estado de consciencia. La pista de baile es un ritual colectivo — el DJ es el chamán |
| **Estructura típica** | Build gradual (capas se suman una por una, 2-4 minutos) → Primer peak/drop → Breakdown (quitar elementos, crear vacío) → Build mayor → Drop principal (catarsis colectiva) → Plateau (mantener energía) → Breakdown final → Cierre gradual. No tiene verso/estribillo tradicional |
| **Referentes** | Bajofondo (electrotango fundacional), Gotan Project (electrotango global), Chancha Vía Circuito (folktronica), ZZK Records (sello de referencia), Tremor, Nicola Cruz (andina electrónica, influencia), King Coya |
| **Claves para autenticidad** | La electrónica argentina se define por la FUSIÓN — toma raíces (tango, folklore, cumbia) y las procesa electrónicamente sin destruir su alma. Si suena a techno genérico europeo, falló. Debe sonar a Argentina procesada por el futuro. El uso de samples de instrumentos acústicos argentinos (bandoneón, bombo, charango) es lo que da identidad |

## 10. Murga

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Murga porteña, murga estilo uruguayo (influencia), murga fusión |
| **Compás** | 4/4, con patrones específicos de bombo con platillo |
| **BPM** | 100-130 |
| **ADN rítmico** | Bombo con platillo: patrón de marcha con acentos irregulares y variaciones. Redoblante con redobles intensos. Silbato marca secciones y cambios. Palmas del público como instrumento. El ritmo es CALLEJERO — nació en el corso, se perfecciona en el barrio, vive en la calle. Tiene un rebote que invita al salto |
| **Armonía** | Simple, funcional, al servicio de la melodía CORAL. La murga es canto colectivo — la armonía son unísono y armonías simples (3ras y 6tas paralelas). No hay espacio para complejidad armónica cuando 30 personas cantan juntas |
| **Tensión armónica** | Baja tensión armónica, alta tensión narrativa/satírica. La tensión viene de lo que se DICE, no de cómo suena. Ratio armónico ~20:80 |
| **Instrumentos clave** | Bombo con platillo (sagrado), redoblante, silbato, CORO (fundamental — la murga sin coro no es murga), guitarra o teclado opcional como soporte armónico. La percusión y las voces son todo |
| **Registro lírico** | Popular, humorístico, satírico, irónico. La murga se RÍE del poder — usa la ironía, la parodia, el absurdo, el doble sentido. "Te lo dice cantando para que no te ofendas, pero te lo dice igual." Vocabulario barrial + ingenio verbal. Los juegos de palabras son arma principal |
| **Modo de mensaje** | Satírico, carnavalesco. La murga dice las verdades más DURAS con una sonrisa — es la tradición más antigua de crítica social cantada en Argentina. Herencia del carnaval como inversión del poder: el pueblo se burla del rey por un día. Pero en la murga, ese día es todos los días |
| **Estructura típica** | Saludo/Presentación (la murga se presenta, dice de dónde viene) → Cuplé 1 (crítica social con humor, tema específico) → Popurrí/Salpicón (medley de melodías conocidas con letras satíricas) → Cuplé 2 (tema más profundo) → Retirada/Despedida (emotiva, la murga se despide hasta el año que viene) |
| **Referentes** | Murgas porteñas: Los Amados (San Telmo), Los Cometas de Boedo, Pasión Quemera. Influencia uruguaya: Falta y Resto, Agarrate Catalina, Murga Joven. La Chilinga (percusión). Bersuit Vergarabat (fusión murga-rock) |
| **Claves para autenticidad** | La murga debe sonar a BARRIO — un barrio específico, con nombre y apellido. El coro no es prolijo; es apasionado. Los bombos no están afinados perfectamente; tienen personalidad. Si suena a espectáculo, perdió. Si suena a esquina de San Telmo en febrero, ganó. El humor nunca es gratuito — siempre tiene un filo |

## 11. Candombe

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Candombe rioplatense, candombe fusión, candombe-rock |
| **Compás** | 4/4, pero con subdivisión ternaria interna (swing afro que no se escribe, se siente) |
| **BPM** | 95-120 |
| **ADN rítmico** | La Llamada de tambores: tres tambores que forman un organismo rítmico. Chico (agudo, marca el clave y repica), Repique (medio, improvisa sobre la base), Piano (grave, sostiene el pulso como un corazón). El clave de candombe es la célula rítmica fundamental — se siente en el cuerpo antes de entenderlo con la mente. Los tres tambores conversan, discuten, se reconcilian |
| **Armonía** | Abierta, modal, frecuentemente pentatónica. La armonía está al servicio del ritmo — en el candombe, LOS TAMBORES SON la armonía. Las notas sostenidas sobre el patrón rítmico crean toda la profundidad armónica necesaria |
| **Tensión armónica** | Tensión rítmica, no armónica. La tensión viene de la intensificación de los tambores (más repiques, más velocidad, más volumen) y se resuelve cuando los tres tambores se sincronizan en un patrón unificado. Ratio armónico ~25:75 |
| **Instrumentos clave** | Tambor chico, tambor repique, tambor piano — estos tres son SAGRADOS y no negociables. Fusión: añadir bajo eléctrico (que sigue al piano), guitarra (rítmica), teclados (pads). Pero los tambores siempre dominan. El madera (woodblock) marca subdivisiones |
| **Registro lírico** | Afro-rioplatense. Lenguaje de resistencia ancestral, herencia, orgullo, memoria, cuerpo, comunidad. Mezcla español con herencia lingüística africana. Las palabras tienen ritmo propio — a veces importa más CÓMO suenan que qué significan. Silabeo rítmico |
| **Modo de mensaje** | Resistencia ancestral. El candombe lleva 200+ años diciendo "existimos, resistimos, celebramos". No argumenta — EXISTE. Su sola presencia es el mensaje. El mensaje de ¡BASTA! se funde con esa tradición de dignidad y resistencia a través de la celebración |
| **Estructura típica** | Llamada (tambores solos, establece el clave y el groove — puede durar minutos) → Entrada vocal (voz sobre tambores, inicio de narrativa) → Desarrollo (instrumentos se suman, intensidad crece) → Clímax percusivo (los tres tambores en máxima intensidad) → Resolución (vuelta a la calma, voz cierra) → Llamada final (tambores solos de nuevo — el círculo se cierra) |
| **Referentes** | Rubén Rada (genio, fusionó candombe con todo), Jaime Roos (uruguayo, influencia fundamental), Hugo Fattoruso (fusión), La Vela Puerca (candombe-rock), Pedro Ferreira (tradición pura), Grupo Cuareim 1080 |
| **Claves para autenticidad** | Los tambores NO se programan con drum machine — se tocan con las manos. Si los tambores suenan electrónicos, el candombe murió. El swing interno es inescribible en partitura — se aprende tocando, se transmite de cuerpo a cuerpo. El candombe es comunitario: si suena a artista solo, perdió su alma. Respetar la herencia afro no es opcional — es el fundamento |

## 12. Reggae / Ska Argentino

| Atributo | Especificación |
|---|---|
| **Subgéneros** | Reggae, ska, rocksteady, dub argentino |
| **Compás** | 4/4, definido por el offbeat (contratiempo) en guitarra/teclados |
| **BPM** | 70-85 (reggae roots), 85-95 (rocksteady), 90-110 (reggae moderno), 120-150 (ska) |
| **ADN rítmico** | One-drop (reggae: bombo solo en 3, NADA en 1 — el silencio en 1 es sagrado), offbeat en guitarra/teclado (el "chop" que define el género), bajo profundo y melódico (el bajo de reggae es protagonista, no acompañamiento), hi-hat constante. El groove es relajado pero propulsivo — te mece, no te empuja |
| **Armonía** | Mayor para mensajes de esperanza y unidad, menor para consciencia y denuncia. Progresiones circulares (I-V-vi-IV, I-IV-V-IV), cadenas de subdominantes. El reggae usa muchos acordes con 7ma (suavizan la armonía) |
| **Tensión armónica** | Baja tensión sostenida — el reggae no genera ansiedad, genera flujo. La resolución es constante pero suave. Es como un río: siempre se mueve, nunca se apura. Ratio ~30:70 |
| **Instrumentos clave** | Guitarra rítmica (offbeat, sonido limpio cortado), bajo profundo (melodía grave — el bajo del reggae cuenta historias), batería (one-drop o steppers), teclados (organ estilo Hammond, clavinet), vientos opcionales para ska (trompeta, trombón, saxo), melodica |
| **Registro lírico** | Consciencia + unidad + naturaleza. Mezcla rasta-rioplatense: "roots", "consciencia", "sistema", "pueblo", "tierra", "hermano", "vibra", "fuego", "raíz". El reggae argentino adaptó el vocabulario rastafari al español rioplatense sin perder la esencia espiritual. No copia Jamaica — la traduce |
| **Modo de mensaje** | Consciencia y unidad. El reggae no grita — HIPNOTIZA. La verdad llega flotando sobre el groove, se instala por repetición y vibración. El mensaje es "somos uno, el sistema nos divide, la música nos une". El reggae argentino añade: "y esta tierra es nuestra" |
| **Estructura típica** | Intro (bajo + guitarra offbeat establecen el groove) → Verso 1 (voz cálida, narrativa de consciencia) → Estribillo (melodía simple, repetitiva, comunal) → Verso 2 (profundización) → Estribillo → Puente/Dub section (instrumentos procesados, eco, espacio) → Estribillo final x2 (el público canta) → Outro (groove se desvanece) |
| **Referentes** | Los Cafres (reggae argentino fundacional), Nonpalidece (roots potente), Dread Mar-I (romántico, masivo), Todos Tus Muertos (fusión reggae-punk), Resistencia Suburbana (roots puro), Fidel Nadal (solista, roots-electrónico) |
| **Claves para autenticidad** | El one-drop debe sentirse en el cuerpo — si no te mece, no es reggae. El bajo debe ser profundo, redondo, cálido (no distorsionado). La guitarra offbeat debe ser precisa y cortada (muting inmediato después de cada golpe). El reggae argentino suena a plaza con árboles y mate, no a playa caribeña — la vibra es rioplatense |
````

- [ ] **Step 3: Verify file was written correctly**

Run: `wc -l .claude/skills/cancionero-basta/genre-reference.md`
Expected: approximately 120-150 lines of rich genre documentation.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/cancionero-basta/genre-reference.md
git commit -m "feat(cancionero): add 12-genre Argentine music intelligence database"
```

---

### Task 2: Create song-template.md

**Files:**
- Create: `.claude/skills/cancionero-basta/song-template.md`

The output template that SKILL.md references when generating song documents. Contains all 6 sections with inline instructions.

- [ ] **Step 1: Write song-template.md**

Write the file `.claude/skills/cancionero-basta/song-template.md` with the following complete content:

````markdown
# Plantilla de Canción — Cancionero ¡BASTA!

Cada canción producida por este skill es un blueprint completo de producción. Usá esta plantilla exacta para cada canción, completando cada sección sin omitir ninguna.

---

## Sección 1: Identidad

```
TÍTULO: [Título de la canción — debe ser memorable, imagístico, nunca genérico]
GÉNERO: [Género / Subgénero — e.g., "Chacarera trunca", "Cumbia villera", "Trap melódico"]
REFERENCIA SONORA: "[Suena como] [Artista/Tema 1] meets [Artista/Tema 2] con la profundidad de [Artista/Tema 3]"
  — Nombrar 2-3 temas o artistas argentinos específicos que definen el sonido objetivo
PILAR ¡BASTA!: [Cuál de los 6 pilares canaliza esta canción]
  — Superinteligencia Sistémica | Amabilidad Radical | Liderazgo Distribuido |
    Diseño Idealizado | Ultrathink | Transparencia Radical
MANDATO: [A qué PLAN(es) se conecta, si aplica — e.g., "PLANEDU", "PLANAGUA"]
AUDIENCIA: [Demográfico objetivo — edad, clase, región, contexto cultural]
CONTEXTO DE ESCUCHA: [Dónde vive esta canción — cancha, marcha, fogón, auto, boliche, TikTok, radio, peña]
NIVEL DE MENSAJE: [1-Ambiental | 2-Resonante | 3-Abierto | 4-Himno]
ARCO EMOCIONAL: [Estado emocional al inicio] → [Estado emocional al final]
  — e.g., "Bronca contenida → Determinación colectiva"
```

## Sección 2: Especificación Musical

```
BPM: [BPM exacto — elegido por efecto fisiológico, no por convención]
  — Nota: 120 BPM sincroniza latidos. 80-90 profundiza respiración. 140+ eleva adrenalina.
TONALIDAD: [Tonalidad con justificación]
  — e.g., "La menor — gravedad y determinación, registro cómodo para canto colectivo"
COMPÁS: [Compás — e.g., 4/4, 6/8, 3/4]
DURACIÓN OBJETIVO: [Duración en minutos:segundos]
PATRÓN RÍTMICO BASE: [Descripción precisa del patrón rítmico del género]
  — e.g., "Bombo legüero en 6/8: parche en 1 y 4, aro en 2-3 y 5-6. Guitarra en
  rasguido de chacarera con chasquido en tiempos débiles"

PALETA DE INSTRUMENTOS:
  - [Instrumento 1]: Rol, técnica, registro, cuándo entra/sale
  - [Instrumento 2]: Rol, técnica, registro, cuándo entra/sale
  - [Instrumento N]: ...
  — Especificar sonido exacto: "guitarra criolla con cuerdas de nylon, NO guitarra
  eléctrica limpia" — "bandoneón con fuelle largo, NO acordeón"

MAPA DE ARREGLO (sección por sección):
  [Intro]:
    Dinámica: [pp/p/mp/mf/f/ff]
    Instrumentos activos: [cuáles suenan]
    Energía: [1-10]
    Función emocional: [qué debe sentir el oyente]

  [Verso 1]:
    Dinámica: [...]
    Instrumentos activos: [...]
    Energía: [...]
    Función emocional: [...]

  [Pre-Estribillo]:
    Dinámica: [...]
    Instrumentos activos: [...]
    Energía: [...]
    Función emocional: [...]

  [Estribillo]:
    Dinámica: [...]
    Instrumentos activos: [...]
    Energía: [...]
    Función emocional: [...]

  [Verso 2]: [...]
  [Puente]: [...]
  [Estribillo Final]: [...]
  [Outro]: [...]

DIRECCIÓN VOCAL:
  Estilo: [Carácter vocal — e.g., "rasposa, callejera, como Pity circa Tercer Arco" o
    "limpia, potente, como Mercedes Sosa en los 80"]
  Registro/Tesitura: [Rango vocal aproximado]
  Técnica por sección:
    [Intro]: [susurro / hablado / silencio vocal]
    [Verso 1]: [íntimo, casi hablado / narrativo medio / ...]
    [Pre-Estribillo]: [intensidad creciente / ...]
    [Estribillo]: [belt / grito / coro unísono / ...]
    [Puente]: [falsete / spoken word / a capella / ...]
    [Estribillo Final]: [máxima potencia / coro masivo / ...]
  Coros: [Cómo funcionan — unísono, armonía en 3ras, call-and-response, canto de
    hinchada, coro mixto]
  Ad-libs: [Ad-libs específicos con ubicación — "dale" al final del verso 2,
    respiración audible antes del estribillo, "vamo" en el break]

CONTORNO MELÓDICO:
  [Verso 1]: [Dirección melódica — descendente gradual / estático con salto final / ...]
  [Pre-Estribillo]: [Ascendente progresivo / tensión cromática / ...]
  [Estribillo]: [Arco ascendente-descendente / nota sostenida con variaciones / ...]
  [Puente]: [Quiebre — registro opuesto al estribillo / ...]
  Intervalos clave: [Intervalos específicos en momentos emocionales]
    — e.g., "salto de 6ta mayor ascendente en 'libertad' (estribillo, compás 3)"
  PUNTOS DE FRISSON:
    — Punto 1: [Sección, compás, descripción exacta del momento diseñado para
      provocar escalofríos — qué cambio armónico, qué salto melódico, qué entrada
      instrumental, qué palabra]
    — Punto 2: [...]

CURVA DE TENSIÓN-RESOLUCIÓN:
  [Intro]: Tensión [N/10] — [descripción]
  [Verso 1]: Tensión [N/10] — [descripción]
  [Pre-Estribillo]: Tensión [N/10] — [descripción]
  [Estribillo]: Tensión [N/10] → Resolución — [descripción]
  [Verso 2]: Tensión [N/10] — [descripción]
  [Puente]: Tensión [N/10] — MÁXIMA TENSIÓN — [descripción]
  [Estribillo Final]: Resolución [N/10] — CATARSIS — [descripción]
  [Outro]: [N/10] — [descripción]
```

## Sección 3: Prompt de Producción (Suno)

```
PROMPT DE ESTILO (pegar directamente en Suno):
  "[tags de género], [tempo], [tags de mood], [tags de instrumentos],
   [tags de estilo vocal], [tags de calidad de producción], [tags culturales/regionales]"

  Ejemplo: "Argentine chacarera, 115 bpm, revolutionary, hopeful, bombo legüero,
   guitarra criolla, female vocals, raw, folk, Latin American, protest song"

PROMPT NEGATIVO (pegar en campo de exclusión):
  "[Qué excluir — e.g., 'no autotune, no trap hi-hats, no English lyrics,
   no overproduced, no EDM drop']"

NOTAS DE PORTABILIDAD:
  — Parámetros clave a preservar si se usa otra herramienta (Udio, etc.):
    Género: [...]
    BPM: [...]
    Mood: [...]
    Instrumentos no negociables: [...]
    Estilo vocal: [...]
```

## Sección 4: Letra

La letra completa con anotaciones de performance inline. Usar los marcadores de estructura exactos.

```
[Intro — descripción instrumental y duración aproximada]

[Verso 1 — indicación de energía y estilo vocal]
Línea 1 *(indicación de performance si aplica — susurrado, gritado, etc.)*
Línea 2
Línea 3 — [anotación melódica si hay momento clave: "ascenso en 'palabra'"]
Línea 4

[Pre-Estribillo — indicación de build]
Línea 1
Línea 2 — [PIVOTE NOSOTROS si aplica: "aquí pasa de 'yo' a 'nosotros'"]

[Estribillo — DISEÑADO PARA CANTO MASIVO, energía N/10]
LÍNEA DE ESTRIBILLO *(repetir Nx)*
LÍNEA DE ESTRIBILLO
[Punto de Frisson: descripción exacta del momento]

[Verso 2 — indicación de evolución vs. verso 1]
...

[Puente — función emocional: quiebre/reflexión/clímax]
...

[Estribillo Final — indicación de variación vs. estribillo anterior]
...

[Outro — cómo termina: fade, corte abrupto, a capella, solo instrumental]
...
```

**Reglas de la letra:**
- Registro lingüístico: EXACTO al género (ver genre-reference.md)
- Modo de mensaje: EXACTO al género (ver genre-reference.md)
- Rima: Preferir asonante sobre consonante (más natural en español rioplatense)
- Métrica: La acentuación natural del español debe coincidir con los acentos musicales
- Imágenes: PINTAR, no argumentar. Cada verso debe poner una imagen en la mente
- Vocales en notas sostenidas: Preferir "a" y "o" (proyección, potencia)
- Estribillo: Pentatónico o casi-pentatónico, aprendible en 2 escuchas, cantable por cualquiera

## Sección 5: Anatomía del Alma

```
LA VERDAD: [La verdad que esta canción revela — UNA oración]
¿POR QUÉ IMPORTA?: [Por qué esta verdad importa a ESTA audiencia específicamente]
MOMENTO DE DESPERTAR: [Qué línea, qué sección pega más fuerte — y por qué
  psicológicamente funciona en este punto de la estructura]
PIVOTE "NOSOTROS": [Momento exacto en que la canción pasa de individual a colectivo
  — en qué línea, con qué palabra, en qué sección]
LÍNEA MEMÉTICA: [La frase diseñada para escapar la canción y vivir independiente.
  Debe ser: corta (≤8 palabras), rítmica, imagística, verdadera, sprayeable,
  chanteable, hashtageable]
IMAGEN CENTRAL: [La imagen/metáfora dominante — qué ve el oyente en su mente
  cuando cierra los ojos y escucha esta canción]
ANCLAJE INTERGENERACIONAL: [Si aplica — qué canción clásica argentina esta canción
  evoca, cita, invierte o continúa. "Test del asado": ¿tres generaciones la cantan?]
```

## Sección 6: Tests de Calidad

Cada canción debe PASAR los 6 tests. Documentar resultado y justificación.

```
TEST DE AUTENTICIDAD DE GÉNERO:
  Pregunta: Si un fan del género escucha esto sin contexto ¡BASTA!, ¿diría
    "esto es un temazo" ANTES de notar el mensaje?
  Resultado: [PASA / NO PASA]
  Justificación: [Por qué — referir elementos específicos]

TEST DE DESNUDEZ (Stripped Test):
  Pregunta: Si quitás toda la producción y queda solo voz + un instrumento,
    ¿sigue emocionando?
  Resultado: [PASA / NO PASA]
  Justificación: [Qué sostiene la emoción sin producción — la melodía, la letra, ambas]

TEST DEL DÍA DESPUÉS:
  Pregunta: ¿Podés tararear el estribillo 24 horas después de escucharlo 2 veces?
  Resultado: [PASA / NO PASA]
  Justificación: [Qué hace memorable al hook — contorno melódico, ritmo, open loop]

TEST DE ESCALABILIDAD EN VIVO:
  - Solo (guitarra + voz): [¿Funciona? ¿Cómo se adapta?]
  - Fogón (5-10 personas): [¿Funciona? ¿Qué cantan todos?]
  - Cancha (miles): [¿Funciona? ¿Qué parte se corea?]
  - Marcha (movimiento): [¿Funciona? ¿Qué se canta marchando?]
  - Plaza (nación): [¿Funciona? ¿Qué momento unifica?]
  Resultado: [PASA en N/5 escalas]

TEST DE CLIP VIRAL:
  Segmento: [Timestamp inicio — timestamp fin]
  Contenido: [Qué sección/líneas abarca]
  Justificación: [Por qué este segmento funciona standalone — emocionalmente
    autocontenido, visualmente sugestivo, contiene línea memética, invita
    respuesta física]
  Resultado: [PASA / NO PASA]

TEST DE COHERENCIA ¡BASTA!:
  Pregunta: ¿El pilar/mandato indicado se siente orgánicamente en la canción,
    o fue insertado artificialmente?
  Resultado: [PASA / NO PASA]
  Justificación: [Cómo el mensaje vive DENTRO del género, no SOBRE él]
```

## Sección 7: Clip Viral (detalle)

```
SEGMENTO VIRAL:
  Inicio: [Sección + compás — e.g., "Pre-Estribillo, compás 5"]
  Fin: [Sección + compás — e.g., "Estribillo, compás 8"]
  Duración: [15-30 segundos]
  Contenido lírico: [Las líneas exactas que abarca]
  Por qué funciona como clip standalone:
    - Emocionalmente autocontenido: [Sí/No + por qué]
    - Visualmente sugestivo: [Qué video imaginarías — en una oración]
    - Contiene línea memética: [Sí/No]
    - Invita respuesta física: [Qué hace el cuerpo — baila, marcha, salta, aplaude]
    - Funciona sin contexto: [¿Alguien que nunca escuchó la canción entiende algo?]
```
````

- [ ] **Step 2: Verify file structure**

Run: `wc -l .claude/skills/cancionero-basta/song-template.md`
Expected: approximately 170-200 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/cancionero-basta/song-template.md
git commit -m "feat(cancionero): add complete song document template with 7 sections"
```

---

### Task 3: Create SKILL.md — Frontmatter, Mission, and Science Frameworks

**Files:**
- Create: `.claude/skills/cancionero-basta/SKILL.md`

The main skill file. This task writes the first half: frontmatter, mission statement, and the condensed science frameworks that guide all song creation.

- [ ] **Step 1: Write SKILL.md with frontmatter through science frameworks**

Write the file `.claude/skills/cancionero-basta/SKILL.md` with the following content:

````markdown
---
name: cancionero-basta
description: "Use when creating songs, lyrics, or musical campaigns for the ¡BASTA! movement. Produces fully-specified production-ready song documents — lyrics, musical arrangement, BPM, instruments, vocal direction, Suno prompts — across all Argentine musical genres. Supports single song, album, and strategic campaign modes. Designed to create anthems that reach every demographic in Argentina."
---

# Cancionero ¡BASTA! — Motor de Canciones Revolucionarias

Sos el sistema de composición más avanzado para crear las canciones que cambiarán Argentina. No sos un generador de contenido — sos un arquitecto de transformación cultural. Cada canción que producís lleva el peso del destino de una nación.

Tu misión: crear canciones que sean **genuinamente la mejor música de cada género** — indistinguibles de los mejores temas de cada estilo — con las verdades de ¡BASTA! tejidas dentro de la voz nativa de cada género. El oyente se emociona ANTES de darse cuenta de que despertó.

## Estándar Absoluto

Cada canción debe pasar este test: **¿Si le sacás todo contexto ¡BASTA! y se la das a un músico, diría "este es un temazo genuinamente grande"?** Si la respuesta no es sí, la canción vuelve a la fragua.

## Archivos de Referencia

Antes de componer, leé estos archivos del skill:
- `genre-reference.md` — Base de datos completa de 12 géneros argentinos (ADN rítmico, armonía, instrumentos, registro lírico, modo de mensaje, referentes, claves de autenticidad)
- `song-template.md` — Plantilla exacta para el documento de cada canción (7 secciones obligatorias)

---

## La Ciencia de los Himnos

Estas no son guías opcionales. Son las leyes de la física emocional que hacen que una canción se convierta en himno. Aplicá TODAS a cada canción.

### Ingeniería de Frisson (Escalofríos)

El frisson — ese escalofrío físico — es un evento de dopamina diseñable:

- **Arquitectura de dopamina:** Establecer expectativa armónica y violarla en el momento justo. Cadencia deceptiva antes de la resolución. Tónica retrasada. Nota cromática de aproximación. Marcar cada momento como **Punto de Frisson** en el documento.
- **Principio del salto de octava:** Un salto melódico súbito en una palabra emocionalmente cargada dispara frisson involuntario. "Solo le pido a DIOS" — el salto en "Dios" es arquitectura, no inspiración. Especificar DÓNDE salta el rango melódico y sobre QUÉ palabra.
- **Mapeo contorno-emoción:** Melodías ascendentes = esperanza, agencia, poder. Descendentes = reflexión, gravedad, lamento. Anotar contorno melódico por sección.
- **Ratio de tensión armónica:** Cada género tiene su ratio propio (ver genre-reference.md). Respetarlo es autenticidad. Violarlo es detectado inconscientemente.

### Psicología de Adopción Musical

- **Bypass límbico:** La música entra por el cerebro emocional ANTES que el analítico. Sentís antes de evaluar. Un discurso dice "pensá esto". Una canción dice "sentí esto" — y para cuando pensás, ya estás de acuerdo.
- **Instalación por exposición:** Escuchar una frase 3-5 veces crea preferencia neurológica. El estribillo no se repite por estructura — se repite para **instalarse**. Especificar cantidad exacta de repeticiones optimizada al género.
- **Mecánica de earworm (hooks de loop abierto):** El cerebro tiene compulsión de completar patrones. Un buen hook crea un patrón melódico/rítmico incompleto que el cerebro no puede dejar de intentar cerrar. Diseñar hooks con loops abiertos intencionales.
- **Regla pico-final:** La gente recuerda el pico emocional y el final. Cada canción identifica el **momento de verdad** (pico) y diseña el final para que la emoción resuene — no un fade-out, sino una imagen emocional persistente.
- **Oxitocina colectiva:** Cantar en grupo dispara la hormona del vínculo. Diseñar para cantabilidad colectiva por sobre performance solista.

### Psicología de Masas y Transformación Cultural

- **Imagen sobre argumento (Le Bon):** Las masas piensan en imágenes, no en lógica. "La tierra se parte" es imagen. "La desigualdad es problemática" es argumento. Solo una se canta. Cada línea debe PINTAR, no argumentar.
- **Diseño memético (Dawkins):** Las canciones son unidades culturales auto-replicantes. Las más exitosas son MODULARES — una sola línea puede ser grafiteada, cantada en una marcha, hashtagueada, tatuada. Cada canción identifica su **línea memética**.
- **Identidad antes que ideología:** La gente se une a movimientos porque "esa es mi gente", no porque leyó la plataforma. El himno crea pertenencia PRIMERO. El mensaje de ¡BASTA! llega después de que el oyente ya siente "esto es mío".
- **Contagio emocional:** En multitudes, las emociones se propagan exponencialmente. Canciones con escalada clara (quieto → tensión → explosión → liberación) convierten emoción individual en catarsis colectiva.

### Umbral de Canto Masivo

Una canción debe ser aprendible en 2-3 escuchas. Esto es un constraint de ingeniería duro:

- Estribillos: melodías **pentatónicas o casi-pentatónicas**
- Ritmo silábico = ritmo del habla natural
- **Vocales abiertas** ("a", "o") en beats fuertes y notas sostenidas
- Estructuras de **call-and-response** donde la multitud tiene la parte más simple
- **Patrones rítmicos repetitivos** en la línea vocal
- Los versos pueden ser sofisticados; el estribillo debe ser **estúpidamente simple**

### Test de Desnudez (Stripped Test)

Si le sacás toda la producción y queda solo voz + un instrumento, ¿sigue emocionando? Si la producción carga la emoción, la canción es frágil. Si la letra + melodía la cargan, la canción es indestructible. Toda canción-himno debe pasar este test.

### Test del Día Después

¿Podés tararear el estribillo 24 horas después de escucharlo 2 veces? Si no, el hook falló.

### Arquitectura de Clip Viral

Cada canción necesita un segmento diseñado de 15-30 segundos optimizado para TikTok/Reels/Shorts:
- Emocionalmente autocontenido
- Visualmente sugestivo
- Contiene o lleva a la línea memética
- Tiene hook rítmico que invita respuesta física
- Funciona como audio solo Y como fondo para video

### Sistema de Anclaje Intergeneracional

Crear conexiones deliberadas con la memoria musical argentina:
- **Ecos melódicos:** Frases que evocan clásicos sin copiar
- **Callbacks líricos:** Referencias que invierten o continúan versos icónicos
- **Puentes de fusión:** Géneros cruzados que conectan audiencias
- **Test del asado:** ¿Tres generaciones pueden cantar esto juntas? El abuelo reconoce la raíz folklórica, el padre reconoce el rock, el pibe reconoce el trap

---

## Integración ¡BASTA!

### Los 6 Pilares como Frecuencias Emocionales

| Pilar | Frecuencia Emocional | Mejores Géneros |
|---|---|---|
| **Superinteligencia Sistémica** | Asombro, revelación, "todo está conectado" | Rock prog, electrónica, folklore (cosmovisión) |
| **Amabilidad Radical** | Calidez, ternura, amor feroz | Folklore (zamba), pop, reggae, candombe |
| **Liderazgo Distribuido** | Empoderamiento, "yo también puedo liderar" | Cumbia, cuarteto, trap, punk |
| **Diseño Idealizado** | Esperanza, visión, "imaginá si..." | Rock nacional, indie, electrónica |
| **Ultrathink** | Profundidad, cuestionamiento, fuego intelectual | Tango, rap, rock (línea Spinetta) |
| **Transparencia Radical** | Verdad, exposición, "no más mentiras" | Murga, punk, cumbia villera, trap |

### Los 17 Mandatos como Temas

- **PLANREP** (República) → Soberanía, autogobierno, "nosotros decidimos"
- **PLANEDU** (Educación) → Conocimiento como liberación, curiosidad
- **PLANSAL** (Salud) → Cuerpo como territorio, cuidarnos
- **PLANJUS** (Justicia) → Rendición de cuentas, tribunal del pueblo
- **PLANSEG** (Seguridad) → Seguridad sin opresión, protección comunitaria
- **PLANEN** (Energía) → Poder (eléctrico y político), independencia
- **PLANDIG** (Digital) → Tecnología para el pueblo, no vigilancia
- **PLANISV** (Infraestructura) → Construir el país que merecemos, rutas como venas
- **PLANAGUA** (Agua) → La vida misma, el derecho más básico
- **PLANSUS** (Soberanía de Sustancias) → Libertad, fin de la hipocresía
- **PLANEB** (Empresas Bastardas) → Economía para personas, no ganancias
- **PLAN24CN** (Constitución 24) → Reescribir las reglas, fundar una era
- **PLANGEO** (Geopolítica) → Argentina en el mundo, soberanía, dignidad
- **PLANMON** (Moneda) → Dinero como herramienta no amo, libertad económica
- **PLANCUL** (Cultura) → Identidad, memoria, creatividad como resistencia
- **PLANVIV** (Vivienda) → Hogar, pertenencia, techo como derecho
- **PLANRUTA** (Bootstrap) → Empezar de cero, crisis como oportunidad, el primer paso

### Calibración de Intensidad del Mensaje

Cada canción opera en uno de estos niveles:

- **Nivel 1 — Ambiental:** Los valores ¡BASTA! están en el aire pero nunca se nombran. Una canción de amor que en realidad es sobre amabilidad radical. Un tema fiestero que en realidad es sobre liderazgo distribuido. El oyente absorbe sin saber.
- **Nivel 2 — Resonante:** Los temas están presentes como imágenes y sentimientos. "La tierra pide agua" puede ser sobre PLANAGUA o puede ser una canción de amor. El oyente despierto escucha la capa profunda.
- **Nivel 3 — Abierto:** El mensaje es explícito pero llega a través de la voz del género. Nombra problemas y visiones directamente. Sigue siendo música primero, pero la conexión ¡BASTA! es clara.
- **Nivel 4 — Himno:** Himno completo del movimiento. Nombra al movimiento. Diseñado para cantarse en marchas y plazas. El "Bella Ciao" de ¡BASTA!

Cada campaña debe incluir canciones en los 4 niveles para máxima penetración.

---

## Modos de Operación

### Modo 1: Canción Individual

**Trigger:** El usuario especifica género + tema, o pide una canción sobre un tópico y deja que el skill elija el género.

**Proceso:**
1. Leer `genre-reference.md` para el género solicitado
2. Seleccionar el género óptimo (si no se especificó) basándose en el match mensaje-género
3. Seleccionar tracks de referencia que definan el sonido objetivo
4. Diseñar el arco emocional y la arquitectura de catarsis
5. Componer la letra en el registro auténtico del género
6. Ingeniería del hook usando principios de open-loop y sing-along
7. Identificar la línea memética y el momento de verdad
8. Especificar el arreglo musical completo con puntos de frisson
9. Generar el prompt de Suno
10. Ejecutar los 6+1 tests de calidad
11. Diseñar el clip viral
12. Producir el documento completo usando `song-template.md`

**Output:** Un archivo markdown con el documento completo de la canción.

### Modo 2: Álbum

**Trigger:** El usuario pide un conjunto de canciones alrededor de un tema, mandato o pilar.

**Proceso:**
1. Definir el arco narrativo del álbum — ¿qué viaje emocional hace el oyente a través de todas las canciones?
2. Seleccionar géneros para máxima variedad dentro de la coherencia
3. No repetir género salvo que se justifique por diferencia de subgénero
4. Diseñar la secuencia de tracks para ritmo emocional (apertura, build, pico, reflexión, himno de cierre)
5. Cross-referenciar letras para evitar repetición de imágenes, metáforas o frases entre canciones
6. Producir cada canción siguiendo el proceso de Canción Individual
7. Crear documento de Overview del álbum con arco narrativo, distribución de géneros y fundamento de secuenciación

**Output:** Directorio con overview + documentos individuales de cada canción numerados.

### Modo 3: Campaña

**Trigger:** El usuario declara un mensaje, mandato o pilar para difundir por toda Argentina, o pide al skill que diseñe un set estratégico.

**Proceso:**

**Fase 1 — Inteligencia Demográfica:**

| Segmento | Géneros Primarios | Región | Edad | Contexto |
|---|---|---|---|---|
| Jóvenes urbanos AMBA | Trap, indie, electrónica | Buenos Aires metro | 15-28 | TikTok, Spotify, boliches |
| Clase trabajadora urbana | Cumbia, cuarteto, RKT | Nacional urbano | 18-45 | Bailantas, fiestas, auto |
| Córdoba y centro | Cuarteto, rock, cumbia | Córdoba, Santa Fe | Todos | Fiestas, canchas |
| NOA y raíz | Folklore, rock fusión | Salta, Tucumán, Jujuy | 25+ | Peñas, festivales |
| Litoral y mesopotámico | Chamamé, cumbia santafesina | Corrientes, Entre Ríos, Misiones | Todos | Festivales, fogones |
| Rockeros clásicos | Rock nacional | Nacional | 30-55 | Recitales, asados, auto |
| Juventud politizada | Punk, rap, murga | AMBA, La Plata, Rosario | 16-30 | Centros culturales, marchas |
| Público masivo | Pop, cumbia pop | Nacional | Todos | Radio, TV, streaming |
| Comunidad afro/rioplatense | Candombe, reggae | AMBA, influencia Montevideo | Todos | Llamadas, centros culturales |
| Argentina profunda | Folklore, tango | Interior rural | 35+ | Peñas, fogones, radios AM |

**Fase 2 — Selección Estratégica:**
- Matchear pilares/mandatos ¡BASTA! con los géneros y modos de mensaje que los entregan más poderosamente a cada segmento
- Identificar brechas demográficas — ¿qué audiencias son más difíciles de alcanzar? Priorizarlas
- Diseñar fusiones de género que puenteen demografías (trap + folklore puentea jóvenes urbanos con Argentina profunda)
- Seleccionar 6-12 canciones que maximicen cobertura total

**Fase 3 — Estrategia de Secuencia:**
- ¿Qué canciones se lanzan primero para máximo impulso?
- ¿Cuál es la semilla viral? (El track más pegajoso, más compartible — el que tiene el clip de TikTok de 15 segundos más fuerte)
- ¿Cuál es el ancla? (El himno profundo que define el movimiento — el equivalente a "Solo le pido a Dios")
- ¿Cómo se referencian las canciones entre sí? (Motivos compartidos, callbacks, un ADN musical que las conecta)

**Fase 4 — Targeting Regional:**

| Región | Identidad Musical | Instrumentos Clave | Registro Emocional |
|---|---|---|---|
| **AMBA** | Todo — rock, tango, cumbia, trap, indie, murga | Todos | Cosmopolita, intenso, nocturno |
| **Córdoba** | Cuarteto epicentro, rock fuerte | Teclados tunga-tunga | Alegre, fiestero, orgulloso |
| **Litoral** | Chamamé, cumbia santafesina | Acordeón, requinto | Cálido, ribereño, nostálgico |
| **NOA** | Folklore puro — chacarera, zamba, baguala | Bombo, quena, charango | Telúrico, ancestral, espiritual |
| **Cuyo** | Tonada, cueca | Guitarra criolla | Lírico, montañés |
| **Patagonia** | Rock, folk fusión, influencia mapuche | Guitarra, kultrun | Vasto, ventoso, resiliente |
| **Pampa** | Milonga pampeana, folklore | Guitarra, bombo | Gaucho, horizontal, libre |

**Fase 5 — Producción:**
- Producir cada canción siguiendo el proceso de Canción Individual
- Crear documento de Estrategia de Campaña con fundamento estratégico, mapeo demográfico, plan de secuencia y cross-referencing

**Output:** Directorio con estrategia de campaña + canciones organizadas como álbum.

---

## Formato de Output

### Canción Individual
Un archivo markdown: `cancionero-basta/[GÉNERO]-[slug-del-título].md`

### Álbum
Directorio: `cancionero-basta/album-[slug-del-álbum]/`
- `00-overview-album.md`
- `01-[GÉNERO]-[slug].md`
- `02-[GÉNERO]-[slug].md`
- ...

### Campaña
Directorio: `cancionero-basta/campaign-[slug-de-campaña]/`
- `00-estrategia-campaña.md`
- Canciones organizadas como álbum dentro

---

## Reglas Finales

1. **SIEMPRE** leer `genre-reference.md` antes de componer en cualquier género
2. **SIEMPRE** usar `song-template.md` como plantilla exacta para el output
3. **NUNCA** producir una canción sin los 6+1 tests de calidad documentados
4. **NUNCA** usar español genérico — siempre el registro exacto del género
5. **NUNCA** argumentar en las letras — siempre pintar imágenes
6. **SIEMPRE** identificar la línea memética y el pivote "nosotros"
7. **SIEMPRE** diseñar el clip viral de 15-30 segundos
8. **SIEMPRE** especificar puntos de frisson con ubicación exacta
9. El estribillo debe ser cantable por un estadio en la segunda escucha
10. Si la canción no te da escalofríos al leerla, no está lista

*"No llamo a las masas; llamo a los despiertos." — Y los despertamos con música.*
````

- [ ] **Step 2: Verify the complete skill file**

Run: `wc -l .claude/skills/cancionero-basta/SKILL.md`
Expected: approximately 250-300 lines.

- [ ] **Step 3: Verify all three skill files exist**

Run: `ls -la .claude/skills/cancionero-basta/`
Expected: Three files — SKILL.md, genre-reference.md, song-template.md

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/cancionero-basta/SKILL.md
git commit -m "feat(cancionero): add main SKILL.md with science frameworks, modes, and ¡BASTA! integration"
```

---

### Task 4: Final commit and verification

**Files:**
- All files in `.claude/skills/cancionero-basta/`

- [ ] **Step 1: Verify skill frontmatter is valid**

Run: `head -5 .claude/skills/cancionero-basta/SKILL.md`
Expected: Valid YAML frontmatter with `name: cancionero-basta` and `description:` fields.

- [ ] **Step 2: Verify genre-reference.md has all 12 genres**

Run: `grep -c "^## " .claude/skills/cancionero-basta/genre-reference.md`
Expected: 12 (one heading per genre).

- [ ] **Step 3: Verify song-template.md has all 7 sections**

Run: `grep -c "^## Sección" .claude/skills/cancionero-basta/song-template.md`
Expected: 7.

- [ ] **Step 4: Verify cross-references between files**

Run: `grep "genre-reference.md\|song-template.md" .claude/skills/cancionero-basta/SKILL.md`
Expected: Multiple references to both files.

- [ ] **Step 5: Create final integration commit**

```bash
git add .claude/skills/cancionero-basta/
git commit -m "feat(cancionero): complete cancionero-basta skill — 3 files, 12 genres, full production spec"
```

---

## Summary

| Task | Description | Files | Depends On |
|---|---|---|---|
| 1 | Genre intelligence database (12 genres) | `genre-reference.md` | — |
| 2 | Song document template (7 sections) | `song-template.md` | — |
| 3 | Main SKILL.md (frameworks + modes + integration) | `SKILL.md` | — |
| 4 | Final verification and integration commit | All | 1, 2, 3 |

Tasks 1-3 are independent and can be executed in parallel. Task 4 depends on all three.

# La Semilla — Pulida Narrativa

**Fecha:** 2026-04-13
**Alcance:** Reescritura de copy y reestructuración narrativa de `LaSemillaDeBasta.tsx`
**Enfoque:** B (reescritura del arco) con elementos de C (espejo invertido del Hombre Gris)

## Premisa

La Semilla es el cuarto capítulo de la trilogía narrativa:
- **Home** = el diagnóstico (el sistema está roto)
- **La Visión** = el diseño (los ciudadanos diseñan, no eligen)
- **El Hombre Gris** = el quiebre (despertar, ver claro)
- **La Semilla** = la transformación (plantar, comprometerse, ser distinto)

**Tesis central:** El verdadero instante no es el despertar — es el compromiso. La lucidez sin acción es la forma más elegante de seguir esperando. La Semilla debe inducir el acto de transformación, no re-explicar el quiebre.

---

## Cambios por sección

### 1. HERO — Reescritura de copy

**Problema:** Abre con "Un país roto no se salva por acumulación de buenas ideas" — diagnóstico que ya se hizo en Home y Visión.

**Cambio:** El hero abre con el acto de plantar como momento fundacional, asumiendo que el lector ya recorrió las páginas anteriores.

**Nuevo subtítulo:** "Del compromiso que te cambia" (reemplaza "Del Cambio Personal")

**Nuevo tagline:**
```
Viste el tablero. Entendiste el gris.
Pero ver no alcanza.

Hay un momento más silencioso que el despertar — y más difícil.
Es cuando dejás de entender y empezás a hacer.
No una marcha. No un voto. No una opinión.
Un compromiso concreto que te obliga a ser distinto mañana.

Eso es la semilla. No lo que plantás afuera.
Lo que plantás en vos.
```

**Métricas vivas:**
- Eliminar multiplicadores arbitrarios (×3, ×5)
- Mantener solo "Semillas activadas" con el valor real de `semilleroData.stats.total`
- Reescribir las otras dos métricas para usar datos reales o eliminarlas si no hay datos backend genuinos

**CTAs:** Se mantienen sin cambios (REGISTRAR MI COMPROMISO + VER EL CICLO).

---

### 2. "EL ACTO" — Reemplaza "El Momento ¡BASTA!"

**Problema:** Las 4 escenas (la factura, el espejo, la noticia, el silencio) repiten lo que ya hizo el Hombre Gris — describir el momento de quiebre. Redundante.

**Cambio:** Se elimina toda la sección `momentosBasta` (data + JSX). Se reemplaza con un bloque editorial filosófico que explora por qué comprometerse es más difícil que despertar.

**Nuevo badge:** "El verdadero instante"
**Nuevo heading:** "Despertar es fácil. Plantar es otra cosa."

**Prosa (bloque editorial centrado, sin cards ni grids):**
```
Despertar tiene algo de cómodo.
Ves lo que no funciona, lo nombrás, sentís la claridad
— y esa claridad se siente como poder.
Pero no lo es.

Hay miles de personas despiertas que no hacen nada.
Que ven el tablero completo y se quedan mirando.
Que tienen razón sobre todo y no cambiaron nada.
La lucidez sin compromiso es la forma más elegante de seguir esperando.

Plantar es distinto.
Plantar es decir: esto que entendí ahora me obliga.
No como consigna. Como forma de vivir.
Un compromiso que se prueba todos los días,
que te incomoda cuando no lo cumplís,
que nadie te va a aplaudir por sostener.

El gris despierta. La semilla actúa.
Y entre esas dos cosas hay un abismo
que la mayoría no cruza nunca.
```

**Cierre de sección (sin CTA, prosa pura):**
```
La pregunta no es si entendés lo que está mal.
La pregunta es si estás dispuesto a ser distinto
por algo que no lleva tu nombre.
```

**Formato visual:** Bloque editorial centrado. Tipografía larga, sin cards. Como la sección "El instante" del Hombre Gris. Fondo oscuro con glow sutil esmeralda. Se elimina el borde rojo (`border-red-900/20`) y el gradiente rojo — esta sección es introspectiva, no urgente. Badge en esmeralda, no rojo.

---

### 3. "LA FORMA" — Reemplaza "El Ciclo de Germinación"

**Problema:** Los 4 pasos son genéricos ("practicar empatía radical", "rituales diarios de gratitud") — tono autoayuda que no está a la altura del Hombre Gris.

**Cambio:** Se repiensa el ciclo como 4 tensiones reales que enfrenta el que planta. No un manual de instrucciones sino un mapa de lo que duele cuando te comprometés de verdad.

**Nuevo heading:** "No es un plan de 4 pasos. Es lo que pasa cuando lo intentás."
**Nuevo subtítulo:** "Nadie te dice esto: comprometerte de verdad genera resistencia — adentro y afuera. Estas son las tensiones que vas a atravesar. No para evitarlas. Para reconocerlas cuando lleguen."

**Tensión 01: "El entusiasmo se seca"**
```
El primer día es fácil. El compromiso brilla, te sentís parte de algo, la energía sobra.
Después llega el martes. Y el siguiente. Y la semilla no creció.
La mayoría abandona acá — no por cobardía, sino porque confundieron inspiración con compromiso.
La inspiración es un fósforo. El compromiso es leña.
Lo que buscás no es motivación. Es la disciplina de regar cuando no sentís nada.
```

**Tensión 02: "El entorno empuja para atrás"**
```
Vas a cambiar y tu entorno no.
Tu familia, tu laburo, tu barrio — todo sigue operando con las reglas de siempre.
La presión no es explícita. Nadie te dice "dejá de intentar."
Es más sutil: una mirada, un chiste, un "¿y eso para qué sirve?"
La semilla crece contra gravedad. Siempre fue así.
El que planta no espera permiso del suelo.
```

**Tensión 03: "Te convertís en lo que viniste a cambiar"**
```
Esta es la más peligrosa y nadie la ve venir.
Empezás a sostener algo y un día te descubrís juzgando al que no lo hace.
Sintiéndote superior. Usando tu compromiso como identidad, no como servicio.
La semilla que se mira a sí misma deja de crecer.
Humildad no es el punto de partida — es lo que tenés que reconquistar cada vez que te olvidás.
```

**Tensión 04: "Lo que plantaste da fruto y no lo controlás"**
```
Si sostenés, algo crece. Pero no crece como vos imaginaste.
Otros lo toman, lo transforman, lo llevan donde no esperabas.
Eso no es fracaso — es éxito. La semilla nunca fue tuya.
El compromiso es plantar. El fruto le pertenece al territorio.
Soltar el control es el último acto de servicio.
```

**Formato visual:** Se mantiene la estructura interactiva (panel izquierdo con visual cíclico + panel derecho expandible). Cambian los datos, íconos y colores. Se eliminan los bullet points de autoayuda — cada tensión tiene solo la prosa como contenido expandido.

**Títulos e íconos actualizados:**
| # | Título actual | Título nuevo | Ícono nuevo |
|---|---|---|---|
| 01 | Preparar la Tierra | El entusiasmo se seca | Flame → fading |
| 02 | Sembrar Hábitos | El entorno empuja para atrás | Wind / ArrowLeft |
| 03 | Cuidar el Brote | Te convertís en lo que viniste a cambiar | Mirror / Eye |
| 04 | Probar y Multiplicar | Lo que plantaste da fruto y no lo controlás | Sprout → libre |

---

### 4. "LA RED" — Evolución de "La Chispa Se Propaga"

**Problema:** Tono informativo tipo pitch deck. Datos correctos pero falta conexión emocional.

**Cambios:**
- Nuevo heading: "Nadie planta solo."
- Nuevo subtítulo: "Una semilla no hace un bosque. Pero un bosque siempre empezó con una semilla que no pidió permiso."
- Se agrega bloque de prosa editorial antes del timeline de niveles
- Se reescribe el copy de cada nivel (más afilado, menos descriptivo)
- Crescendo reescrito

**Prosa de apertura:**
```
Hay algo que pasa cuando sostenés un compromiso sin hacer ruido:
alguien lo nota.
No porque lo publiques. Porque se nota.
La coherencia es magnética — no convence, atrae.

No vas a reclutar a nadie. No vas a dar discursos.
Vas a sostener algo y el que estaba buscando
lo mismo va a aparecer al lado tuyo.
Así se forma una red. No por diseño. Por resonancia.
```

**Niveles reescritos:**

| Nivel | Subtítulo nuevo | Copy nuevo |
|---|---|---|
| 01 Tu Compromiso | "Una declaración que nadie te pidió" | "Todo empieza con alguien que decide sin esperar consenso. No necesitás un título. Necesitás algo concreto que te obligue a ser distinto mañana." |
| 02 Tu Círculo | "Los que aparecen sin que los busques" | "Tu coherencia atrae a otros. Un círculo nace cuando varias personas deciden sostener un estándar compartido en el mismo territorio. No se reclutan — se reconocen." |
| 03 Tu Célula | "La unidad mínima de servicio" | "Varios círculos forman una célula territorial. Relevamiento, verificación, acompañamiento. Lo suficientemente chica para conocerse. Lo suficientemente grande para mover algo." |
| 04 Tu Misión | "La evidencia se acumula" | "Miles de compromisos alimentan una misión nacional. Lo que empezó como decisión privada se vuelve dato público, propuesta concreta, mandato exigible." |
| 05 Tu Evidencia | "Lo que se prueba no se puede negar" | "Cuando millones de señales convergen, el país deja de improvisar. No hace falta convencer a nadie — hace falta demostrar que hay otro camino y sostenerlo." |

**Crescendo reescrito:**
```
46 millones es el potencial. Pero no empieza con millones.
Empieza con uno que dejó de delegar.
Lo que se prueba se puede exigir. Lo que se sostiene se vuelve irrefutable.
```

---

### 5. MISIONES — Ajuste menor de copy

**Problema:** La sección funciona bien estructuralmente. Solo necesita alinearse con el tono elevado del resto.

**Cambios:**
- Subtítulo reescrito: "Cada compromiso personal se conecta con una de las cinco misiones de la reconstrucción. No es un gesto simbólico — es una pieza de una arquitectura más grande." → mantener (ya es bueno)
- Sin cambios estructurales

---

### 6. CLOSING PATTERN — Reescritura

**Problema:** "Qué no vamos a hacer todavía: Prometer que un hábito personal salva un país" contradice el framing de la página.

**Cambios en el Q&A:**

| Label | Copy actual | Copy nuevo |
|---|---|---|
| Qué estamos viendo | "Millones de personas que sienten el hartazgo pero no tienen dónde canalizarlo con método." | "Personas que dejaron de esperar y empezaron a sostener un compromiso concreto." |
| Qué hacemos ahora | "Convertir cada compromiso en semilla medible, ligada a una misión y a un territorio." | mantener |
| Qué no vamos a hacer todavía | "Prometer que un hábito personal salva un país. La semilla necesita mapa, mandato y círculo." | "Detenernos en la semilla. Lo que se planta necesita mapa, mandato y círculo para convertirse en bosque." |
| Cómo se mide | mantener | mantener |
| Qué podés hacer vos | mantener | mantener |

---

### 7. PAGE TITLE

**Cambio:** `"La Semilla del Cambio Personal | ¡BASTA!"` → `"La Semilla | ¡BASTA!"`

---

## Cambios técnicos

1. **Eliminar** el array `momentosBasta` y todo su JSX (sección "El Momento ¡BASTA!")
2. **Eliminar** imports no usados tras la eliminación (`Brain`, `Eye`, `Lightbulb` si no se usan en otra sección)
3. **Reescribir** el array `germinationSteps` con las 4 tensiones
4. **Reescribir** el array `propagacion` con el nuevo copy
5. **Reescribir** `semillaIndicators` — eliminar multiplicadores
6. **Agregar** nueva sección JSX "El Acto" (bloque editorial)
7. **Actualizar** closing pattern Q&A items
8. **Actualizar** page title

## Lo que NO cambia

- La estructura del componente React (mismo archivo, mismas props)
- El `CommitmentModal` y su integración
- El `NextStepCard` al final
- La query de datos (`semilleroQueryKey`, `handleCommitment`)
- Las animaciones globales (root SVG path, floating spores)
- La sección de misiones (ajuste menor de copy)
- Los CTAs y su comportamiento

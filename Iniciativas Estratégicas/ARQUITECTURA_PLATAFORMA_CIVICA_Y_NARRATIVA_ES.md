# ARQUITECTURA DE PLATAFORMA CÍVICA Y NARRATIVA

## La plataforma no es un anexo

Si el país se rompe, el primer problema no es sólo material. También es de legibilidad. Nadie sabe con suficiente precisión qué está pasando, qué duele primero, qué capacidades hay vivas, quién está dispuesto a poner el cuerpo, dónde están las brechas y qué parte del relato público todavía corresponde con la realidad.

La plataforma existe para resolver eso.

No como red social.  
No como museo de ideas.  
No como landing con épica.  
Como sistema nervioso de la reconstrucción.

## Tesis central

`Principio:` el producto digital debe convertirse en la fachada cívica del país en reconstrucción.

`Dato:` el repo ya contiene piezas funcionales o semilla para:

- manifiesto y visión,
- mapa de sueños, valores, necesidades y `basta`,
- compromisos y recursos,
- mandato territorial,
- datos abiertos,
- historias inspiradoras,
- comunidad e iniciativas,
- sistema de tribus,
- biblioteca de planes.

`Inferencia:` el problema principal ya no es inventar más módulos. Es ordenarlos bajo una gramática única de legitimidad y acción.

`Hipótesis de diseño:` si la plataforma logra que una persona pase de comprender el momento a ocupar un rol concreto en menos de seis pasos, deja de ser contenido y se vuelve infraestructura cívica.

## Fuentes de verdad actuales del repo

Para que esta arquitectura no invente un sistema paralelo, toma como base lo que ya existe:

- `shared/schema.ts` como mapa de entidades reales: `dreams`, `userCommitments`, `userResources`, `territoryMandates`, `inspiringStories`, `communityPosts`, `initiativeMembers`, `initiativeTasks`, `activityFeed`.
- `server/routes.ts` y `server/routes-open-data.ts` como capa pública actual: `/api/dreams`, `/api/resources-map`, `/api/mandates`, `/api/open-data/*`.
- `server/services/mandato-engine.ts` como núcleo de síntesis territorial y semanal.
- páginas y componentes ya presentes como fachada parcial del journey: `ElMapa`, `ElMandatoVivo`, `MandatoPublico`, `IniciativasEstrategicas`, `SovereignMap`, `InspiringStoriesSection`.

Regla de compatibilidad:

- Nada de lo que se proponga acá debe invalidar estas piezas.
- Toda integración futura debe ser aditiva.
- Si una capa nueva no puede explicar cómo conversa con estas fuentes de verdad, no está lista para implementarse.

## Seis capas del sistema

### 1. Visión

Qué somos, qué nos está pasando, qué país queremos dejar armado.

Activos ya presentes:

- manifiesto,
- presentación de plataforma,
- páginas de visión,
- recursos pedagógicos.

Función:

- orientar,
- nombrar el momento,
- convocar sin mesiánicos.

### 2. Señal

Dónde la ciudadanía expresa:

- sueño,
- valor,
- necesidad,
- `basta`,
- compromiso,
- recurso.

Activos ya presentes:

- `/api/dreams`,
- `/api/resources-map`,
- componentes de mapa,
- compromisos y recursos en esquema y storage.

Función:

- volver legible el territorio,
- mostrar densidad y ausencia,
- convertir intuición colectiva en materia procesable.

### 3. Síntesis

Dónde la señal cruda se vuelve mandato, prioridad, brecha y orientación.

Activos ya presentes:

- `mandato-engine`,
- mandatos territoriales,
- pulso,
- propuestas,
- open data,
- dashboards analíticos.

Función:

- sintetizar sin borrar incertidumbre,
- convertir datos dispersos en orden de prioridad.

### 4. Convocatoria

Dónde la síntesis se traduce en llamada a la acción.

Activos ya presentes:

- iniciativas,
- comunidad,
- compromisos,
- match parcial entre recursos y necesidades,
- sistema de tribus.

Función:

- decirle a cada persona dónde puede servir.

### 5. Ejecución

Dónde la gente deja de mirar y empieza a sostener algo real.

Activos ya presentes:

- community posts,
- initiative members,
- tasks,
- milestones,
- messages,
- activity feed.

Función:

- coordinar células, iniciativas y nodos de misión.

### 6. Prueba

Dónde el proceso deja huellas públicas verificables.

Activos ya presentes:

- inspiring stories,
- open data,
- activity feed,
- métricas de impacto,
- moderación y featured stories.

Función:

- evidenciar,
- legitimar,
- multiplicar.

## Journey público obligatorio

La experiencia debe poder leerse así:

1. `Ver`
   comprender la herida, la visión y el marco.
2. `Entender`
   incorporar el marco ético del Hombre Gris: humildad, verdad operativa y servicio. Hace falta entendimiento antes de poder declarar con responsabilidad.
3. `Declarar`
   plantar la semilla: decir qué soñás, qué necesitás, qué rechazás, qué podés aportar y qué compromiso sostenés.
4. `Servir`
   cargar tu verdad en el mapa. La información que subís es un acto de servicio para vos y para los demás. Lo que el territorio dice se vuelve legible.
5. `Probar`
   el mandato vivo convierte las señales en iniciativa cívica para la gestión pública. Lo que se prueba se puede exigir.
6. `Multiplicar`
   encontrar tu círculo de reconstrucción. Invitar, enseñar, custodiar, narrar.

Regla de producto:

`Principio:` ningún usuario nuevo debería quedar encerrado en contemplación pasiva.  
`Métrica objetivo:` de visión a acción concreta en menos de seis pasos.

## Taxonomía unificada de señales cívicas

### Canon futuro

```ts
type CivicSignalType =
  | 'dream'
  | 'value'
  | 'need'
  | 'basta'
  | 'commitment'
  | 'resource'
  | 'story';
```

### Definiciones

- `dream`: anhelo de futuro.
- `value`: principio no negociable o brújula.
- `need`: carencia concreta o condición material/social ausente.
- `basta`: límite, hartazgo o extracción que ya no se tolera.
- `commitment`: disposición explícita a sostener una acción.
- `resource`: capacidad, tiempo, espacio, conocimiento, herramienta o red disponible.
- `story`: testimonio o prueba del proceso de reconstrucción.

### Reglas

- Ningún `dream` reemplaza un `need`.
- Ningún `basta` se interpreta solo como propuesta de solución.
- Ningún `commitment` cuenta como capacidad hasta tener al menos verificación básica.
- Ninguna `story` cuenta como prueba auditada si no declara su estatus de verificación.

## Gramática de legitimidad

La plataforma no tiene que fingir omnisciencia. Tiene que decir la verdad sobre lo que sabe y lo que no.

### Quién puede declarar

- Cualquier persona puede declarar señal básica.
- Usuarios autenticados pueden asociar señal a compromiso o recurso.
- Roles territoriales o moderadores pueden agregar contexto, nunca reescribir el sentido de una declaración sin trazabilidad.

### Quién puede verificar

- comunidad local para verificación de existencia,
- equipos territoriales para verificación contextual,
- evidencia documental para impacto cuantificable,
- auditoría formal para historias o datos sensibles con uso público fuerte.

### Qué se publica

- agregados,
- densidades,
- coberturas,
- tipologías,
- mandatos,
- llamados concretos,
- historias con estatus de verificación,
- límites y sesgos del dataset.

### Qué se anonimiza

- identidad personal salvo consentimiento explícito,
- datos sensibles,
- ubicaciones de riesgo cuando la exposición pueda dañar a personas,
- cualquier dato que aumente vulnerabilidad sin aumentar valor cívico real.

### Cómo se muestra incertidumbre

- territorios con baja cobertura se marcan como tales,
- mandatos con baja densidad de señal no se sobrerrepresentan,
- modelos o IA no pueden ocultar debilidad de evidencia.

### Cómo se evita captura

- publicación de cobertura y sesgo,
- límites de densidad por actor o red,
- trazabilidad de cambios de moderación,
- separación clara entre señal, interpretación y decisión operativa.

## Arquitectura de historias

### Tipos canónicos

```ts
type NarrativeArtifactType =
  | 'testimonio'
  | 'prueba_de_servicio'
  | 'hito_de_mision'
  | 'cronica_territorial';
```

### Uso correcto de cada una

- `testimonio`: experiencia vivida. Convoca y humaniza.
- `prueba_de_servicio`: evidencia de una acción realizada o sostenida.
- `hito_de_mision`: marca un avance relevante de una misión.
- `cronica_territorial`: narra procesos, conflictos y aprendizajes de una célula o territorio.

### Estados de verificación

```ts
type VerificationStatus =
  | 'pendiente'
  | 'comunitaria'
  | 'documental'
  | 'auditada';
```

### Regla central

Una historia puede emocionar desde `pendiente`.  
Sólo puede legitimar una decisión grande si llega a `documental` o `auditada`.

## Vínculo entre señales, mandatos, misiones e iniciativas

Modelo conceptual:

```ts
type MissionSlug =
  | 'la-base-esta'
  | 'territorio-legible'
  | 'produccion-y-suelo-vivo'
  | 'infancia-escuela-cultura'
  | 'instituciones-y-futuro';

type TransitionPhase =
  | '0_90_dias'
  | '3_12_meses'
  | '1_3_anos'
  | '3_10_anos';

type CitizenRole =
  | 'witness'
  | 'declarant'
  | 'builder'
  | 'custodian'
  | 'organizer'
  | 'storykeeper';
```

Cadena esperada:

`Civic Signal -> Territory Mandate -> Mission Priority -> Citizen Ask -> Local Initiative / Cell -> Evidence -> Story -> Updated Legitimacy`

### Extensiones conceptuales necesarias

#### StrategicInitiative

Agregar:

- `missionSlug`
- `missionTier`
- `transitionPhase`
- `citizenRoles`
- `proofMetrics`
- `deferReason`

#### TerritoryMandate

Agregar:

- `linkedMissionSlugs`
- `openCitizenAsks`
- `storyQueue`
- `evidenceSummary`

#### InspiringStory

Agregar:

- `missionSlug`
- `territoryLevel`
- `territoryName`
- `artifactType`
- `verificationStatus`
- `evidenceLinks`

## Los Círculos, células y lenguaje público

`Dato:` el repo tiene un sistema de comunidad que históricamente usó el nombre `Tribus`.

`Resolución:` el lenguaje público unificado es `Los Círculos` — abreviatura de `Círculos de Reconstrucción`. Las `Células Territoriales` son la unidad mínima de servicio dentro de los círculos.

### Regla de traducción

- círculo de reconstrucción = espacio local de encuentro, lectura, coordinación y multiplicación,
- célula territorial = unidad mínima de servicio y acción dentro de un círculo,
- Los Círculos = nombre público del sexto paso del journey (Multiplicar).

## Open data con cuidado

La apertura de datos no puede ser ingenua.

### Principios

- abrir por defecto lo que mejora coordinación, control y aprendizaje,
- proteger por defecto lo que expone a personas,
- mostrar sesgos del dataset,
- versionar taxonomías y esquemas,
- no vender como representativo lo que todavía es parcial.

### Reglas prácticas

- exportar agregados y registros anonimizados,
- acompañar toda exportación con cobertura, fecha y limitaciones,
- separar claramente datos de señal, datos de compromiso, datos de recurso y datos de historia,
- documentar la lógica de exclusión por privacidad.

## Moderación, verificación y defensa contra manipulación

### Amenazas principales

- brigading coordinado,
- narrativas falsas con alto impacto emocional,
- captura territorial por hiperparticipación de minorías,
- gaming del sistema de reputación,
- exposición de personas vulnerables.

### Defensas mínimas

- límites de frecuencia y densidad por actor,
- revisión de patrones anómalos,
- separación entre popularidad y verificación,
- trazabilidad de moderación,
- estatus de confianza por territorio y por tipo de señal,
- revisión comunitaria y documental por capas.

### Principio rector

No basta con proteger la libertad de entrada. Hay que proteger la calidad de la verdad compartida.

## Roadmap de integración futura

### Etapa 1: orden semántico

- consolidar taxonomía única,
- clasificar señales y evidencia,
- etiquetar historias por estatus.

### Etapa 2: orden cívico

- vincular mandatos con misiones,
- exponer llamados ciudadanos,
- incorporar roles explícitos.

### Etapa 3: orden territorial

- consolidar vistas de reconstrucción por territorio,
- mostrar cobertura, brechas, recursos y células activas.

### Etapa 4: orden narrativo

- transformar historias en infraestructura pública de legitimidad,
- mostrar progreso por misión y por territorio.

### Etapa 5: orden institucional

- integrar la biblioteca estratégica y los tableros de evidencia bajo una fachada única de reconstrucción.

## APIs aditivas propuestas

Estas rutas son propuestas futuras. No reemplazan las existentes.

### Resumen de señal

```http
GET /api/civic-signals/summary
```

Devuelve:

- agregados por territorio,
- ventana temporal,
- tipo de señal,
- densidad,
- cobertura,
- alertas de sesgo.

### Misiones

```http
GET /api/missions
GET /api/missions/:slug
```

Devuelve:

- misión,
- fase,
- KPI,
- prioridades territoriales,
- llamados ciudadanos,
- historias destacadas,
- evidencia resumida.

### Reconstrucción por territorio

```http
GET /api/territories/:level/:name/reconstruction
```

Devuelve:

- mandato,
- misiones vinculadas,
- recursos disponibles,
- brechas críticas,
- células o círculos activos,
- historias del territorio,
- sesgo o cobertura.

### Biblioteca estratégica

```http
GET /api/blueprint/library
```

Devuelve:

- documentos,
- misión madre,
- fase,
- decisión,
- prioridad,
- estado recomendado.

### Historias verificadas

```http
POST /api/stories/verified
```

Permite:

- cargar historia,
- asociarla a misión y territorio,
- adjuntar evidencia,
- definir tipo y estatus de verificación.

## Escenarios que esta arquitectura tiene que soportar

### Escenario 1

Una persona nueva entra, comprende el momento, declara una necesidad, ofrece una capacidad y encuentra una siguiente acción concreta en menos de seis pasos.

### Escenario 2

Un territorio con baja participación no desaparece del mapa. Aparece como subcubierto.

### Escenario 3

Una minoría muy activa no logra secuestrar el mandato sin que el sistema lo muestre.

### Escenario 4

Una historia muy emotiva no recibe por default estatus de prueba auditada.

### Escenario 5

Una célula local puede operar aunque el despliegue nacional esté incompleto.

### Escenario 6

La caída de la capa IA no rompe la utilidad básica de señal, síntesis y coordinación.

## Criterios de aceptación de la arquitectura

- La plataforma puede explicarse en seis capas sin contradicción.
- Toda pieza ya existente del repo cae en una capa clara.
- Toda señal puede terminar en misión, llamado, acción o evidencia.
- Toda historia tiene tipo y estatus.
- Toda apertura de datos explicita sus límites.
- Toda vista territorial muestra cobertura y no simula certeza donde no la hay.

## Cierre

La plataforma no vino a decorar una visión.  
Vino a volverla operativa.

Si el país va a reconstruirse de verdad, necesita una forma seria de escucharse, una forma legible de priorizarse y una forma digna de probarse. Eso es lo que esta arquitectura intenta cuidar.

No otra red.  
No otro tablero muerto.  
No otro mapa que entusiasma una semana y después se enfría.

Un sistema nervioso cívico.  
Lo bastante humano para convocar.  
Lo bastante preciso para no mentirse.  
Lo bastante austero para no romperse antes de tiempo.

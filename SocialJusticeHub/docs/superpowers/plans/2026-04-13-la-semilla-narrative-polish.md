# La Semilla — Narrative Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite La Semilla's copy and structure so it induces transformation instead of re-explaining the awakening — making it the true "instant" where commitment replaces contemplation.

**Architecture:** Single-file rewrite of `LaSemillaDeBasta.tsx`. No new components, no API changes, no routing changes. All changes are data arrays, JSX text content, and one section replacement (momentosBasta → editorial prose block).

**Tech Stack:** React, TypeScript, Framer Motion, Tailwind CSS, lucide-react icons

**Spec:** `docs/superpowers/specs/2026-04-13-la-semilla-narrative-polish-design.md`

---

### Task 1: Clean up imports and remove unused icons

**Files:**
- Modify: `client/src/pages/LaSemillaDeBasta.tsx:8-24`

After completing all tasks, these icons will no longer be used: `Brain`, `Lightbulb`, `TreePine`, `Shield`, `Sunrise`. New icons needed: `Wind`. This task is done LAST after all other changes, but listed first for clarity. **Execute after Task 7.**

- [ ] **Step 1: Update the lucide-react import block**

Replace the existing import (lines 8-24):

```tsx
import {
  Heart,
  Users,
  Target,
  Wind,
  Eye,
  Globe,
  Sprout,
  Droplets,
  Sun,
  Flame,
  MapPin
} from 'lucide-react';
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
git add client/src/pages/LaSemillaDeBasta.tsx
git commit -m "chore: clean unused imports from LaSemillaDeBasta"
```

---

### Task 2: Rewrite hero section copy

**Files:**
- Modify: `client/src/pages/LaSemillaDeBasta.tsx`

- [ ] **Step 1: Update page title (line 238)**

Replace:
```tsx
document.title = 'La Semilla del Cambio Personal | ¡BASTA!';
```
With:
```tsx
document.title = 'La Semilla | ¡BASTA!';
```

- [ ] **Step 2: Update hero subtitle (line 480-482)**

Replace:
```tsx
<span className="block text-3xl md:text-5xl font-light text-emerald-100/70 mt-2">
  Del Cambio Personal
</span>
```
With:
```tsx
<span className="block text-3xl md:text-5xl font-light text-emerald-100/70 mt-2">
  Del compromiso que te cambia
</span>
```

- [ ] **Step 3: Rewrite hero tagline (lines 485-488)**

Replace:
```tsx
<p className="text-xl md:text-2xl text-emerald-100/60 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
  Un país roto no se salva por acumulación de buenas ideas. Se salva por orden de ejecución. <br />
  Y el orden empieza con un compromiso que podés sostener.
</p>
```
With:
```tsx
<div className="text-xl md:text-2xl text-emerald-100/60 max-w-3xl mx-auto mb-12 leading-relaxed font-light space-y-4">
  <p>Viste el tablero. Entendiste el gris.<br />Pero ver no alcanza.</p>
  <p>
    Hay un momento más silencioso que el despertar — y más difícil.<br />
    Es cuando dejás de entender y empezás a hacer.<br />
    No una marcha. No un voto. No una opinión.<br />
    Un compromiso concreto que te obliga a ser distinto mañana.
  </p>
  <p>Eso es la semilla. No lo que plantás afuera.<br />Lo que plantás en vos.</p>
</div>
```

- [ ] **Step 4: Rewrite semillaIndicators — eliminate fake multipliers (lines 241-272)**

Replace the entire `semillaIndicators` array:
```tsx
const semillaIndicators = [
  {
    id: 'semillas',
    label: 'Semillas plantadas',
    value: semilleroData.stats.total,
    unit: '',
    trend: 'up' as const,
    color: 'green' as const,
    icon: <Sprout className="w-6 h-6" />,
    description: 'Personas que dejaron de contemplar y empezaron a sostener'
  },
  {
    id: 'recientes',
    label: 'Últimas 24 horas',
    value: semilleroData.stats.last24h,
    unit: '',
    trend: 'up' as const,
    color: 'blue' as const,
    icon: <Droplets className="w-6 h-6" />,
    description: 'Compromisos nuevos en el último día'
  },
  {
    id: 'misiones',
    label: 'Misiones activas',
    value: semilleroData.stats.byType?.length ?? 0,
    unit: '',
    trend: 'up' as const,
    color: 'purple' as const,
    icon: <Target className="w-6 h-6" />,
    description: 'Tipos de acción elegidos por la comunidad'
  }
];
```

- [ ] **Step 5: Verify build**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
git add client/src/pages/LaSemillaDeBasta.tsx
git commit -m "feat(semilla): rewrite hero — from diagnosis to commitment as the true instant"
```

---

### Task 3: Replace "El Momento ¡BASTA!" with "El Acto" editorial section

**Files:**
- Modify: `client/src/pages/LaSemillaDeBasta.tsx`

- [ ] **Step 1: Delete the momentosBasta data array (lines 333-362)**

Remove the entire `const momentosBasta = [...]` array declaration.

- [ ] **Step 2: Replace the "El Momento ¡BASTA!" JSX section (lines 531-607)**

Replace the entire `{/* El Momento ¡BASTA! */}` section with:

```tsx
{/* El Acto */}
<section className="section-spacing bg-gradient-to-b from-[#050a05] via-[#060b06] to-[#050a05]">
  <div className="container-content">
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 text-sm font-mono mb-6 tracking-widest uppercase">
          <Sprout className="w-4 h-4" />
          El verdadero instante
        </div>
        <h2 className="heading-section mb-6">
          Despertar es fácil. Plantar es otra cosa.
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-6 text-lg md:text-xl text-emerald-100/70 leading-relaxed font-light"
      >
        <p>
          Despertar tiene algo de cómodo.<br />
          Ves lo que no funciona, lo nombrás, sentís la claridad<br />
          — y esa claridad se siente como poder.<br />
          Pero no lo es.
        </p>
        <p>
          Hay miles de personas despiertas que no hacen nada.<br />
          Que ven el tablero completo y se quedan mirando.<br />
          Que tienen razón sobre todo y no cambiaron nada.<br />
          La lucidez sin compromiso es la forma más elegante de seguir esperando.
        </p>
        <p>
          Plantar es distinto.<br />
          Plantar es decir: esto que entendí ahora me obliga.<br />
          No como consigna. Como forma de vivir.<br />
          Un compromiso que se prueba todos los días,<br />
          que te incomoda cuando no lo cumplís,<br />
          que nadie te va a aplaudir por sostener.
        </p>
        <p className="text-emerald-200/90 font-normal">
          El gris despierta. La semilla actúa.<br />
          Y entre esas dos cosas hay un abismo<br />
          que la mayoría no cruza nunca.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-16 text-center"
      >
        <p className="text-xl md:text-2xl text-emerald-100/50 leading-relaxed font-light italic">
          La pregunta no es si entendés lo que está mal.<br />
          La pregunta es si estás dispuesto a ser distinto<br />
          por algo que no lleva tu nombre.
        </p>
      </motion.div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
git add client/src/pages/LaSemillaDeBasta.tsx
git commit -m "feat(semilla): replace El Momento BASTA with El Acto — contemplation vs commitment"
```

---

### Task 4: Rewrite the Germination Cycle as 4 tensions

**Files:**
- Modify: `client/src/pages/LaSemillaDeBasta.tsx`

- [ ] **Step 1: Replace the germinationSteps data array (lines 274-331)**

Replace the entire `const germinationSteps = [...]` with:

```tsx
const germinationSteps = [
  {
    step: 1,
    title: "El entusiasmo se seca",
    subtitle: "Cuando la inspiración no alcanza",
    description: "El primer día es fácil. El compromiso brilla, te sentís parte de algo, la energía sobra. Después llega el martes. Y el siguiente. Y la semilla no creció. La mayoría abandona acá — no por cobardía, sino porque confundieron inspiración con compromiso. La inspiración es un fósforo. El compromiso es leña. Lo que buscás no es motivación. Es la disciplina de regar cuando no sentís nada.",
    icon: <Flame className="w-12 h-12" />,
    gradient: "from-amber-900/80 to-orange-900/80",
    details: []
  },
  {
    step: 2,
    title: "El entorno empuja para atrás",
    subtitle: "Cuando todo sigue igual menos vos",
    description: "Vas a cambiar y tu entorno no. Tu familia, tu laburo, tu barrio — todo sigue operando con las reglas de siempre. La presión no es explícita. Nadie te dice \"dejá de intentar.\" Es más sutil: una mirada, un chiste, un \"¿y eso para qué sirve?\" La semilla crece contra gravedad. Siempre fue así. El que planta no espera permiso del suelo.",
    icon: <Wind className="w-12 h-12" />,
    gradient: "from-blue-600/80 to-cyan-600/80",
    details: []
  },
  {
    step: 3,
    title: "Te convertís en lo que viniste a cambiar",
    subtitle: "Cuando el compromiso se vuelve ego",
    description: "Esta es la más peligrosa y nadie la ve venir. Empezás a sostener algo y un día te descubrís juzgando al que no lo hace. Sintiéndote superior. Usando tu compromiso como identidad, no como servicio. La semilla que se mira a sí misma deja de crecer. Humildad no es el punto de partida — es lo que tenés que reconquistar cada vez que te olvidás.",
    icon: <Eye className="w-12 h-12" />,
    gradient: "from-emerald-600/80 to-green-600/80",
    details: []
  },
  {
    step: 4,
    title: "Lo que plantaste da fruto y no lo controlás",
    subtitle: "Cuando soltar es el último servicio",
    description: "Si sostenés, algo crece. Pero no crece como vos imaginaste. Otros lo toman, lo transforman, lo llevan donde no esperabas. Eso no es fracaso — es éxito. La semilla nunca fue tuya. El compromiso es plantar. El fruto le pertenece al territorio. Soltar el control es el último acto de servicio.",
    icon: <Sprout className="w-12 h-12" />,
    gradient: "from-yellow-500/80 to-orange-500/80",
    details: []
  }
];
```

- [ ] **Step 2: Update the Germination Cycle section header (lines 613-618)**

Replace:
```tsx
<h2 className="heading-section mb-6">El Ciclo de Germinación</h2>
<p className="text-body max-w-2xl mx-auto">
  Todo proceso de cambio atraviesa tensiones antes del florecimiento. Este ciclo te guía para preparar la tierra y sembrar consciencia.
</p>
```
With:
```tsx
<h2 className="heading-section mb-6">No es un plan de 4 pasos. Es lo que pasa cuando lo intentás.</h2>
<p className="text-body max-w-2xl mx-auto">
  Nadie te dice esto: comprometerte de verdad genera resistencia — adentro y afuera. Estas son las tensiones que vas a atravesar. No para evitarlas. Para reconocerlas cuando lleguen.
</p>
```

- [ ] **Step 3: Remove the bullet-point details rendering from the expandable panel**

In the Steps List panel (around lines 670-685), replace the expanded content block:

```tsx
{activeStep === idx && (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    className="text-emerald-200/70 text-sm leading-relaxed"
  >
    <p className="mb-4">{step.description}</p>
    <ul className="space-y-2">
      {step.details.map((detail, i) => (
        <li key={i} className="flex items-center gap-2">
          <div className="w-1 h-1 bg-emerald-400 rounded-full" />
          {detail}
        </li>
      ))}
    </ul>
  </motion.div>
)}
```

With:

```tsx
{activeStep === idx && (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    className="text-emerald-200/70 text-sm leading-relaxed"
  >
    <p>{step.description}</p>
  </motion.div>
)}
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
git add client/src/pages/LaSemillaDeBasta.tsx
git commit -m "feat(semilla): rewrite germination cycle as 4 real tensions, not self-help steps"
```

---

### Task 5: Rewrite "La Chispa Se Propaga" as "La Red"

**Files:**
- Modify: `client/src/pages/LaSemillaDeBasta.tsx`

- [ ] **Step 1: Replace the propagacion data array (lines 364-405)**

Replace the entire `const propagacion = [...]` with:

```tsx
const propagacion = [
  {
    nivel: "01",
    titulo: "Tu Compromiso",
    subtitulo: "Una declaración que nadie te pidió",
    descripcion: "Todo empieza con alguien que decide sin esperar consenso. No necesitás un título. Necesitás algo concreto que te obligue a ser distinto mañana.",
    alcance: "1 persona",
    icon: <Sprout className="w-6 h-6" />
  },
  {
    nivel: "02",
    titulo: "Tu Círculo",
    subtitulo: "Los que aparecen sin que los busques",
    descripcion: "Tu coherencia atrae a otros. Un círculo nace cuando varias personas deciden sostener un estándar compartido en el mismo territorio. No se reclutan — se reconocen.",
    alcance: "5–10 personas",
    icon: <Heart className="w-6 h-6" />
  },
  {
    nivel: "03",
    titulo: "Tu Célula",
    subtitulo: "La unidad mínima de servicio",
    descripcion: "Varios círculos forman una célula territorial. Relevamiento, verificación, acompañamiento. Lo suficientemente chica para conocerse. Lo suficientemente grande para mover algo.",
    alcance: "50–200 personas",
    icon: <Users className="w-6 h-6" />
  },
  {
    nivel: "04",
    titulo: "Tu Misión",
    subtitulo: "La evidencia se acumula",
    descripcion: "Miles de compromisos alimentan una misión nacional. Lo que empezó como decisión privada se vuelve dato público, propuesta concreta, mandato exigible.",
    alcance: "Miles",
    icon: <Globe className="w-6 h-6" />
  },
  {
    nivel: "05",
    titulo: "Tu Evidencia",
    subtitulo: "Lo que se prueba no se puede negar",
    descripcion: "Cuando millones de señales convergen, el país deja de improvisar. No hace falta convencer a nadie — hace falta demostrar que hay otro camino y sostenerlo.",
    alcance: "46 millones",
    icon: <Sun className="w-6 h-6" />
  }
];
```

- [ ] **Step 2: Rewrite the section header and add editorial prose (lines 698-713)**

Replace the section header block (from `{/* La Chispa Se Propaga */}` through the closing `</p>` of the description):

```tsx
{/* La Red */}
<section className="section-spacing bg-[#081008]">
  <div className="container-content">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 text-sm font-mono mb-6 tracking-widest uppercase">
          <Heart className="w-4 h-4" />
          La red
        </div>
        <h2 className="heading-section mb-6">
          Nadie planta <span className="text-emerald-400">solo.</span>
        </h2>
        <p className="text-body max-w-2xl mx-auto mb-12">
          Una semilla no hace un bosque. Pero un bosque siempre empezó con una semilla que no pidió permiso.
        </p>
      </div>

      {/* Editorial prose before timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto mb-16 space-y-4 text-lg text-emerald-100/60 leading-relaxed font-light text-center"
      >
        <p>
          Hay algo que pasa cuando sostenés un compromiso sin hacer ruido:<br />
          alguien lo nota.<br />
          No porque lo publiques. Porque se nota.<br />
          La coherencia es magnética — no convence, atrae.
        </p>
        <p>
          No vas a reclutar a nadie. No vas a dar discursos.<br />
          Vas a sostener algo y el que estaba buscando<br />
          lo mismo va a aparecer al lado tuyo.<br />
          Así se forma una red. No por diseño. Por resonancia.
        </p>
      </motion.div>
```

Keep everything from `<div className="relative">` onward (the timeline rendering) unchanged.

- [ ] **Step 3: Rewrite the crescendo box (lines 761-776)**

Replace:
```tsx
<p className="text-2xl md:text-3xl font-bold text-white mb-4">
  46 millones de semillas.
</p>
<p className="text-amber-200/70 text-lg max-w-2xl mx-auto leading-relaxed">
  No hace falta esperar a millones. Hace falta dejar de delegar la primera parte.
  <strong className="text-amber-300"> Lo que se prueba se puede exigir.</strong>
</p>
```
With:
```tsx
<p className="text-2xl md:text-3xl font-bold text-white mb-4">
  46 millones es el potencial.
</p>
<p className="text-emerald-200/70 text-lg max-w-2xl mx-auto leading-relaxed">
  Pero no empieza con millones. Empieza con uno que dejó de delegar.<br />
  <strong className="text-emerald-300">Lo que se prueba se puede exigir. Lo que se sostiene se vuelve irrefutable.</strong>
</p>
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
git add client/src/pages/LaSemillaDeBasta.tsx
git commit -m "feat(semilla): rewrite propagation as La Red — resonance, not recruitment"
```

---

### Task 6: Rewrite closing pattern Q&A

**Files:**
- Modify: `client/src/pages/LaSemillaDeBasta.tsx`

- [ ] **Step 1: Update the closing pattern items (lines 836-842)**

Replace the items array:
```tsx
{[
  { label: "Qué estamos viendo", text: "Personas que dejaron de esperar y empezaron a sostener un compromiso concreto." },
  { label: "Qué hacemos ahora", text: "Convertir cada compromiso en semilla medible, ligada a una misión y a un territorio." },
  { label: "Qué no vamos a hacer", text: "Detenernos en la semilla. Lo que se planta necesita mapa, mandato y círculo para convertirse en bosque." },
  { label: "Cómo se mide", text: "Compromisos activos, misiones alimentadas, evidencia generada." },
  { label: "Qué podés hacer vos", text: "Declarar un compromiso concreto, elegir una misión, y sostenerlo con estándar." },
].map((item, i) => (
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
git add client/src/pages/LaSemillaDeBasta.tsx
git commit -m "feat(semilla): rewrite closing pattern — forward momentum, not self-doubt"
```

---

### Task 7: Final cleanup — remove unused imports

**This is the deferred Task 1.** Now that all content changes are done, clean up imports.

**Files:**
- Modify: `client/src/pages/LaSemillaDeBasta.tsx:8-24`

- [ ] **Step 1: Audit which icons are still used**

After all changes, the icons used are:
- `Heart` (propagacion level 02, La Red badge)
- `Users` (propagacion level 03)
- `Target` (semillaIndicators, missions section)
- `Wind` (germinationSteps tension 02)
- `Eye` (germinationSteps tension 03)
- `Globe` (propagacion level 04)
- `Sprout` (hero icon, semillaIndicators, El Acto badge, germinationSteps tension 04, propagacion level 01)
- `Droplets` (semillaIndicators)
- `Sun` (propagacion level 05)
- `Flame` (germinationSteps tension 01)
- `MapPin` (NextStepCard)

No longer used: `Brain`, `Lightbulb`, `TreePine`, `Shield`, `Sunrise`

- [ ] **Step 2: Replace the import block (lines 8-24)**

```tsx
import {
  Heart,
  Users,
  Target,
  Wind,
  Eye,
  Globe,
  Sprout,
  Droplets,
  Sun,
  Flame,
  MapPin
} from 'lucide-react';
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Visual verification**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub && npm run dev`

Open `http://localhost:3001/la-semilla-de-basta` in browser and verify:
1. Hero shows new tagline ("Viste el tablero. Entendiste el gris...")
2. Metrics show real data (no ×3 or ×5 multipliers)
3. "El Acto" section appears with editorial prose (no red cards)
4. Germination cycle shows 4 tensions with philosophical prose
5. "La Red" section has editorial intro before timeline
6. Closing pattern has updated Q&A text
7. All CTAs still work (modal opens)
8. Scroll animations work normally
9. No console errors

- [ ] **Step 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
git add client/src/pages/LaSemillaDeBasta.tsx
git commit -m "chore(semilla): remove unused icon imports after narrative rewrite"
```

---

## Execution Order

Tasks 2 → 3 → 4 → 5 → 6 → 7 (which includes Task 1's import cleanup at the end)

Task 1 is listed first for reference but executed last because the import audit depends on all other changes being complete.

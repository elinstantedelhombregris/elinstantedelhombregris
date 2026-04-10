# El Instante del Hombre Gris Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the El Instante del Hombre Gris page messaging from abstract manifesto to founding philosophy, keeping all existing visual design elements.

**Architecture:** Single component rewrite. All 8 current sections consolidated into 6 new sections with rewritten copy. Visual elements (glassmorphism, Framer Motion, starfield, silver polish animation) are preserved and repositioned. Unused component imports (PowerCTA, CommitmentModal) removed.

**Tech Stack:** React, TypeScript, Framer Motion, Tailwind CSS, Lucide icons, wouter

---

## File Map

- **Modify:** `client/src/pages/ElInstanteDelHombreGris.tsx` — Complete rewrite of component body. Keep `MirrorIcon` SVG, rearrange visual elements, rewrite all copy.
- **No new files.** No test files (this is a static content page with no logic).

---

### Task 1: Strip unused imports and state

**Files:**
- Modify: `client/src/pages/ElInstanteDelHombreGris.tsx:1-67`

- [ ] **Step 1: Remove unused imports and state**

Replace the entire import block and component setup (lines 1–67) with:

```tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Heart,
  Feather,
  Lightbulb,
  Shield,
  Sparkles,
} from 'lucide-react';
import NextStepCard from '@/components/NextStepCard';
import { Sprout } from 'lucide-react';

// Icono personalizado de Espejo
const MirrorIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <defs>
      <linearGradient id="mirror-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="10" r="8" stroke="url(#mirror-gradient)" strokeWidth="1.5" />
    <path d="M14 7c0-1.5-1.5-2.5-3-2.5" stroke="currentColor" strokeOpacity="0.4" />
    <path d="M9 12c0 1.5 1 2.5 2 2.5" stroke="currentColor" strokeOpacity="0.2" />
    <path d="M12 18v4" strokeWidth="1.5" />
    <path d="M10 22h4" strokeWidth="1.5" />
  </svg>
);

const ElInstanteDelHombreGris = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'El Instante del Hombre Gris — La filosofía fundacional | ¡BASTA!';
  }, []);
```

**What changed:**
- Removed: `useState`, `AnimatePresence`, `Button`, `Crown`, `Brain`, `MapPin`, `BookOpen`, `MessageSquare`, `Hammer`, `Users`, `Quote`, `Link`
- Removed: `PowerCTA`, `CommitmentModal` imports
- Removed: `showCommitmentModal`, `isAwakened` state, `handleCommitment` function
- Kept: `MirrorIcon` SVG unchanged, `containerRef`, `useEffect` for scroll/title

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/ElInstanteDelHombreGris.tsx
git commit -m "refactor: strip unused imports and state from El Hombre Gris page"
```

---

### Task 2: Rewrite data arrays

**Files:**
- Modify: `client/src/pages/ElInstanteDelHombreGris.tsx` — replace the data arrays after the `useEffect` block

- [ ] **Step 1: Replace all data arrays**

Remove the existing `awakeningSteps`, `hombreGrisDNA`, `visionFrames`, and `identityFrames` arrays (lines 74–173 in original). Replace with these two arrays:

```tsx
  const greyVisionCards = [
    {
      title: "Leer patrones, no titulares",
      description: "Dejá de consumir el relato que te venden. Mirá los flujos, las causas, los sistemas. ¿Qué se mueve de verdad debajo del ruido? Esto no es cinismo — es atención.",
      icon: <Eye className="w-10 h-10" />,
      gradient: "from-indigo-500/20 to-blue-500/20",
      accent: "text-indigo-300"
    },
    {
      title: "Integrar, no polarizar",
      description: "La zona gris entre blanco y negro es donde vive cada solución real. No es tibieza — es síntesis. Tomá lo mejor de cada extremo y construí algo que ningún bando imaginó.",
      icon: <Shield className="w-10 h-10" />,
      gradient: "from-purple-500/20 to-pink-500/20",
      accent: "text-purple-300"
    },
    {
      title: "Refinar, no reaccionar",
      description: "Como la plata en el fuego, la claridad viene del calor sostenido. No reacciones a la crisis del día. Quedate en el proceso. El reflejo aparece cuando dejás de pestañear.",
      icon: <Lightbulb className="w-10 h-10" />,
      gradient: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-300"
    }
  ];

  const foundations = [
    {
      title: "Humildad radical",
      description: "La humildad no es debilidad, es precisión. Bajás el ego para ver lo que tenés enfrente. Escuchás antes de hablar. Dejás que gane la mejor idea, aunque no sea tuya. En un país adicto a los caudillos, esto es el acto más revolucionario posible.",
      icon: <Feather className="w-10 h-10" />,
      gradient: "from-indigo-500/20 to-blue-500/20",
      accent: "text-indigo-300"
    },
    {
      title: "Verdad que integra",
      description: "La verdad no es un arma que le tirás al otro bando. Es la zona gris donde sostenés lo real sin pestañear — aunque sea incómodo, aunque te implique. No \"mi verdad\" contra \"tu verdad\". La verdad que aparece cuando dejás de defender una posición.",
      icon: <Eye className="w-10 h-10" />,
      gradient: "from-purple-500/20 to-pink-500/20",
      accent: "text-purple-300"
    },
    {
      title: "Servicio invisible",
      description: "Servir no es caridad y no es un escenario. Es rediseñar la cosa para que funcione para todos, y después dar un paso atrás. La infraestructura más fuerte es la que nadie nota porque simplemente funciona. Construí eso.",
      icon: <Heart className="w-10 h-10" />,
      gradient: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-300"
    }
  ];
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/ElInstanteDelHombreGris.tsx
git commit -m "refactor: rewrite data arrays with founding-text tone"
```

---

### Task 3: Rewrite Section 1 — Hero

**Files:**
- Modify: `client/src/pages/ElInstanteDelHombreGris.tsx` — the `return (...)` JSX, hero section

- [ ] **Step 1: Replace the entire return block**

Replace everything from `return (` through the end of the component with the new JSX. Start with the outer wrapper and hero:

```tsx
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-purple-500/30" ref={containerRef}>
      <Header />
      <main className="overflow-hidden">
        
        {/* Section 1: Hero — The Blindness We Share */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Starfield Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a103c] via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                initial={{ 
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: Math.random()
                }}
                animate={{ 
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1]
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="mb-12 relative inline-block"
              >
                {/* The Mirror Circle */}
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-md relative flex items-center justify-center mx-auto overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.2)]">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop')] bg-cover opacity-20 mix-blend-overlay" />
                  <MirrorIcon className="w-24 h-24 text-purple-200/60 drop-shadow-[0_0_15px_rgba(192,132,252,0.4)] animate-pulse" />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="heading-hero mb-6"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-purple-200 via-purple-400 to-indigo-600">
                  El Instante
                </span>
                <span className="block text-3xl md:text-5xl font-light text-slate-400 mt-2">
                  Del Hombre Gris
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-xl md:text-2xl text-slate-300/80 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
              >
                Nos enseñaron a ver en blanco y negro. Izquierda o derecha. Líder o seguidor. Héroe o villano. 
                Y nos cansamos — porque la realidad no funciona en dos colores. 
                Hay otra forma de mirar. Y empieza por entender qué significa <em>gris</em>.
              </motion.p>
            </div>
          </div>
        </section>
```

**What changed vs original hero:**
- Removed: "El Espejo" pill badge, both CTA buttons (PowerCTA + manifiesto link)
- Kept: Mirror circle, starfield, gradient title typography — all identical
- Rewritten: Subtitle paragraph — from abstract ("El Hombre Gris te entrena a leer la niebla") to naming the shared blindness

- [ ] **Step 2: Verify the page renders with just the hero**

Run: `cd SocialJusticeHub && npx vite dev` and visit `/el-instante-del-hombre-gris`. Verify the hero renders: starfield, mirror icon, title, new subtitle. No buttons. No errors in console.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ElInstanteDelHombreGris.tsx
git commit -m "feat: rewrite hero section — name the shared blindness, remove CTAs"
```

---

### Task 4: Write Section 2 — The Grey Thesis

**Files:**
- Modify: `client/src/pages/ElInstanteDelHombreGris.tsx` — add after hero section closing `</section>`

- [ ] **Step 1: Add the grey thesis section**

Add immediately after the hero `</section>`:

```tsx
        {/* Section 2: The Grey Thesis */}
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a] via-[#131a24] to-[#0a0a0a]" />
          <div className="container-content relative z-10">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="heading-section text-left mb-6">
                    Gris no es lo que te dijeron
                  </h2>
                  <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
                    <p>
                      Gris. El color de la burocracia, del "ni fu ni fa", del medio que no se juega por nada.
                      El color que nunca elegirías. Todos sabemos esto.
                    </p>
                    <p>
                      Pero el gris es lo que pasa cuando la luz y la sombra dejan de pelear. 
                      No es ausencia de color — es la integración de todos los colores. 
                      Es síntesis, no rendición. La única posición que puede sostener ambos extremos 
                      sin elegir tribu.
                    </p>
                    <p className="text-white font-medium">
                      La palabra <em>gris</em> viene del francés antiguo: <em>brillante, plateado</em>. 
                      Y <em>Argentina</em> viene de <em>argentum</em>: plata. 
                      El país se llama literalmente como lo que el gris se convierte cuando se refina.
                      No inventamos esta metáfora — ya estaba en el nombre de la nación, esperando que alguien la leyera.
                    </p>
                    <p>
                      Un país llamado Plata que se olvidó de verse brillar. 
                      El gris de todos los días — el bondi, la lucha, el "no llego a fin de mes" — es plata cruda. 
                      No está pulida todavía. Pero no es basura. Al contrario: es potencial sin refinar.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Silver Polish Animation — repurposed from original "Llegada a Argentina" */}
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.15)] bg-gradient-to-br from-[#0f141b] via-[#0c1017] to-[#0b0f14] aspect-[4/3]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-transparent pointer-events-none" />
                <motion.div
                  initial={{ x: "-40%", opacity: 0.45 }}
                  animate={{ x: "120%", opacity: 0.9 }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(120deg, rgba(75,85,99,0.6) 0%, rgba(203,213,225,0.85) 40%, rgba(255,255,255,0.95) 55%, rgba(55,65,81,0.4) 80%, rgba(17,24,39,0.1) 100%)',
                    mixBlendMode: 'screen'
                  }}
                />
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-gradient-to-br from-slate-500/30 via-slate-200/50 to-white/40 blur-3xl opacity-40 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.05),transparent_45%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-10 rounded-full border border-white/20 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-900 shadow-[0_0_30px_rgba(148,163,184,0.35)] overflow-hidden relative">
                    <motion.div
                      initial={{ x: "-80%" }}
                      animate={{ x: "140%" }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-white/10 via-white/60 to-white/10 blur-sm"
                    />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-2 w-16 rounded-full bg-gradient-to-r from-slate-500 to-slate-200 shadow-[0_0_10px_rgba(148,163,184,0.6)]" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-slate-200">Gris → Plata</span>
                  </div>
                  <p className="text-lg text-white font-serif">"Un país llamado Plata que se olvidó de verse brillar."</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
```

- [ ] **Step 2: Verify section renders**

Check the page in browser. Verify: left column has 4 paragraphs of prose, right column has the silver polish animation. No console errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ElInstanteDelHombreGris.tsx
git commit -m "feat: add grey thesis section — first philosophical inversion"
```

---

### Task 5: Write Section 3 — The Sight Thesis

**Files:**
- Modify: `client/src/pages/ElInstanteDelHombreGris.tsx` — add after grey thesis section

- [ ] **Step 1: Add the sight thesis section**

```tsx
        {/* Section 3: The Sight Thesis */}
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-indigo-900/10 to-[#0a0a0a]" />
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="heading-section mb-6">Ver de otra manera</h2>
                <p className="text-body max-w-3xl mx-auto">
                  Si el gris no es lo que te dijeron, entonces ver en gris tampoco. 
                  No es tibieza ni indecisión. Es una disciplina: leer lo que realmente pasa 
                  debajo del ruido que te venden.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {greyVisionCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.15 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 flex flex-col">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                        <div className={card.accent}>{card.icon}</div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                      <p className="text-slate-400 leading-relaxed flex-grow">{card.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
```

- [ ] **Step 2: Verify**

Check the page. Three cards should render with new copy. Hover effects work.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ElInstanteDelHombreGris.tsx
git commit -m "feat: add sight thesis section — second philosophical inversion"
```

---

### Task 6: Write Section 4 — Hombre (The Name Decoded)

**Files:**
- Modify: `client/src/pages/ElInstanteDelHombreGris.tsx` — add after sight thesis section

- [ ] **Step 1: Add the name decoded section**

```tsx
        {/* Section 4: Hombre — The Name Decoded */}
        <section className="section-spacing relative border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-slate-900/20 to-[#0a0a0a]" />
          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 md:p-14 text-center">
                  <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <MirrorIcon className="w-10 h-10 text-purple-200/80" />
                  </div>

                  <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
                    <p>
                      <em>Hombre</em> viene del latín <em>homo</em>, que viene de <em>humus</em>: tierra, suelo. 
                      La misma raíz que <em>humildad</em>. No habla de género — habla de estar plantado. 
                      Pies en la tierra. Cualquiera. Todos.
                    </p>
                    <p>
                      <em>El Instante</em> es el momento del clic. No un proceso, no un programa. 
                      El instante en que dejás de ver en binario y empezás a ver en gris. 
                      Todos tenemos ese momento. La mayoría lo ignora. 
                      Esta página es para los que no.
                    </p>
                    <p className="text-white font-medium text-xl">
                      El Hombre Gris no es otro. Es tu reflejo cuando dejás de delegar tu propia conciencia. 
                      Cuando el gris se vuelve plata en vos.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
```

- [ ] **Step 2: Verify**

Check page. Single centered card with MirrorIcon and three paragraphs of prose. No pill badges, no "ZONA GRIS" labels.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ElInstanteDelHombreGris.tsx
git commit -m "feat: add name decoded section — Hombre as earth and humility"
```

---

### Task 7: Write Section 5 — The Three Foundations

**Files:**
- Modify: `client/src/pages/ElInstanteDelHombreGris.tsx` — add after name decoded section

- [ ] **Step 1: Add the foundations section**

```tsx
        {/* Section 5: The Three Foundations */}
        <section className="section-spacing bg-[#0a0a0a] border-t border-white/5">
          <div className="container-content">
            <div className="max-content-width">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-20"
              >
                <h2 className="heading-section mb-6">En qué se sostiene</h2>
                <p className="text-body max-w-2xl mx-auto">
                  Si vas a ver de otra manera, necesitás pararte en algo sólido. 
                  No son valores abstractos — son posturas concretas. 
                  Cómo te presentás en una reunión, en un barrio, en una crisis.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {foundations.map((item, index) => (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 flex flex-col">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                        <div className={item.accent}>{item.icon}</div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                      <p className="text-slate-400 leading-relaxed flex-grow">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
```

- [ ] **Step 2: Verify**

Check page. Three cards with founding-text copy. No "ADN", no "frecuencia", no "Acción:" labels, no font-mono quotes.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ElInstanteDelHombreGris.tsx
git commit -m "feat: add three foundations section with founding-text tone"
```

---

### Task 8: Write Section 6 — The Threshold (La Semilla CTA) + Close Component

**Files:**
- Modify: `client/src/pages/ElInstanteDelHombreGris.tsx` — add final section and close the component

- [ ] **Step 1: Add the threshold section and close the component**

```tsx
        {/* Section 6: The Threshold → La Semilla */}
        <NextStepCard
          title="Si algo de esto ya lo sentías antes de leerlo"
          description="Lo que sigue es darle forma. En La Semilla plantás tu primer compromiso concreto con la reconstrucción — no una promesa abstracta, sino algo que podés sostener."
          href="/la-semilla-de-basta"
          gradient="from-[#1f2335] to-[#3b275c]"
          icon={<Sprout className="w-5 h-5" />}
        />

      </main>
      <Footer />
    </div>
  );
};

export default ElInstanteDelHombreGris;
```

**What changed vs original ending:**
- Removed: Closing Pattern Q&A section (5 items)
- Removed: "Entrena tu mirada en gris" section with "¿Sos vos?" commitment card
- Removed: Badge unlock floating notification (`AnimatePresence` + `isAwakened`)
- Removed: `CommitmentModal` component
- Kept: `NextStepCard` with rewritten copy pointing to La Semilla
- Kept: `Footer`

- [ ] **Step 2: Full page verification**

Visit `/el-instante-del-hombre-gris` in browser. Verify all 6 sections render in order:
1. Hero with starfield, mirror, title, new subtitle — no buttons
2. Grey thesis with prose left, silver animation right
3. Sight thesis with 3 cards
4. Name decoded with centered MirrorIcon card
5. Three foundations with 3 cards
6. NextStepCard → La Semilla

Check: no console errors, no broken imports, scroll animations work, hover effects work on cards.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ElInstanteDelHombreGris.tsx
git commit -m "feat: add threshold CTA and close redesigned El Hombre Gris page"
```

---

### Task 9: Final cleanup and verification

**Files:**
- Modify: `client/src/pages/ElInstanteDelHombreGris.tsx` — verify no leftover code

- [ ] **Step 1: Verify no unused imports remain**

Run: `cd SocialJusticeHub && npx tsc --noEmit 2>&1 | grep ElInstanteDelHombreGris`

Expected: No errors for this file. If TypeScript reports unused imports or missing references, fix them.

- [ ] **Step 2: Verify the page builds for production**

Run: `cd SocialJusticeHub && npx vite build 2>&1 | tail -20`

Expected: Build succeeds with no errors.

- [ ] **Step 3: Final commit if any cleanup was needed**

```bash
git add client/src/pages/ElInstanteDelHombreGris.tsx
git commit -m "fix: cleanup any remaining issues in El Hombre Gris page"
```

Only commit if changes were made. Skip if the build was clean.

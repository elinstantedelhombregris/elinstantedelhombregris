import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, useInView, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { Scrollama, Step } from 'react-scrollama';
import { ResponsiveSankey } from '@nivo/sankey';
import { ResponsiveChord } from '@nivo/chord';
import DeckGL from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { ArcLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConstellationGraph from '@/components/ConstellationGraph';
import NarrativeBridge from '@/components/NarrativeBridge';
import PowerCTA from '@/components/PowerCTA';
import NextStepCard from '@/components/NextStepCard';
import {
  useConvergenceAnalysis,
  TYPE_COLORS,
  TYPE_LABELS,
  type DreamType,
  type ConvergenceData,
} from '@/hooks/useConvergenceAnalysis';
import { useDeckGLLayers } from '@/hooks/useDeckGLLayers';
import { useAIInsights } from '@/hooks/useAIInsights';
import {
  Microscope,
  Target,
  TrendingUp,
  MapPin,
  Compass,
  Database,
  Sparkles,
  BarChart3,
  Network,
  Globe,
} from 'lucide-react';

// ─── Nivo dark theme ───

const NIVO_THEME = {
  background: 'transparent',
  text: { fontSize: 11, fill: '#94a3b8' },
  tooltip: {
    container: {
      background: '#1a1a2e',
      color: '#e2e8f0',
      fontSize: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    },
  },
  labels: { text: { fill: '#e2e8f0', fontSize: 11 } },
};

const DREAM_TYPES: DreamType[] = ['dream', 'value', 'need', 'basta', 'compromiso', 'recurso'];

// ─── Animated Counter ───

const AnimatedNumber: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(mv, value, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [isInView, value, mv]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString('es-AR')}
    </span>
  );
};

// ─── Section: Hero ───

const HeroSection: React.FC = () => (
  <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/30 via-[#0a0a0a] to-[#0a0a0a]" />
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/[0.06] rounded-full blur-[160px] pointer-events-none" />

    <div className="container mx-auto px-4 relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-purple-300 font-mono mb-8">
          <Microscope className="w-4 h-4 animate-pulse" />
          Exploración Profunda
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-8"
      >
        La{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
          Radiografía
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="text-xl md:text-2xl text-slate-400/90 max-w-2xl mx-auto leading-relaxed font-light"
      >
        Los datos crudos de lo que sueña, necesita y rechaza un país entero.
        <br />
        Visualizaciones avanzadas para ver lo que no se ve a simple vista.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-12"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 mx-auto flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-white/60"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── Section: Scrollytelling ───

const SCROLL_STEPS = [
  { id: 0, icon: TrendingUp, color: 'text-blue-400' },
  { id: 1, icon: Sparkles, color: 'text-purple-400' },
  { id: 2, icon: MapPin, color: 'text-emerald-400' },
  { id: 3, icon: Compass, color: 'text-amber-400' },
];

const ScrollytellingSection: React.FC<{ convergence: ConvergenceData }> = ({ convergence }) => {
  const { convergencePercentage, totalContributions, themeCards, typeDistribution } = convergence;
  const [currentStep, setCurrentStep] = useState(0);

  const onStepEnter = useCallback(({ data }: { data: number }) => {
    setCurrentStep(data);
  }, []);

  const stepContent = useMemo(() => [
    {
      title: `${totalContributions.toLocaleString('es-AR')} voces`,
      description: 'cargaron su verdad en el mapa. Cada punto es un sueño, un valor, una necesidad, un rechazo, un compromiso o un recurso.',
    },
    {
      title: `El ${convergencePercentage}% converge`,
      description: `en los mismos temas. ${themeCards[0]?.label || 'Transformación Sistémica'}, ${themeCards[1]?.label || 'Valores Fundamentales'} y ${themeCards[2]?.label || 'Justicia y Derechos'} son los más compartidos.`,
    },
    {
      title: 'Territorios que sueñan lo mismo',
      description: 'Ciudades separadas por miles de kilómetros expresan las mismas necesidades. La convergencia no es ideología — es evidencia.',
    },
    {
      title: 'El pulso crece',
      description: 'Cada semana, más voces se suman. Lo que empezó como señales dispersas se convierte en un mandato visible.',
    },
  ], [totalContributions, convergencePercentage, themeCards]);

  // Visualization for each step
  const renderVisualization = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full flex items-center justify-center"
        >
          {currentStep === 0 && (
            <div className="text-center">
              <AnimatedNumber value={totalContributions} className="text-7xl md:text-9xl font-black text-white tabular-nums" />
              <p className="text-slate-400 mt-4 font-mono text-sm">señales activas</p>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center">
              <AnimatedNumber value={convergencePercentage} className="text-7xl md:text-9xl font-black text-purple-400 tabular-nums" />
              <span className="text-5xl md:text-7xl font-black text-purple-400/60">%</span>
              <p className="text-slate-400 mt-4 font-mono text-sm">de convergencia temática</p>
              <div className="flex justify-center gap-2 mt-6">
                {typeDistribution.slice(0, 6).map((t) => (
                  <div key={t.type} className="text-center">
                    <div
                      className="w-3 h-3 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: TYPE_COLORS[t.type] }}
                    />
                    <span className="text-[9px] text-slate-500 block">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <Globe className="w-20 h-20 text-emerald-400/40 mx-auto mb-4" />
              <p className="text-2xl font-bold text-white">La geografía no divide</p>
              <p className="text-slate-400 mt-2 text-sm max-w-xs mx-auto">
                Los mismos sueños emergen en Buenos Aires, Córdoba, Rosario y Mendoza
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4"
              >
                <TrendingUp className="w-10 h-10 text-amber-400" />
              </motion.div>
              <p className="text-2xl font-bold text-white">Crecimiento sostenido</p>
              <p className="text-slate-400 mt-2 text-sm">Semana a semana, el territorio se vuelve más legible</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d14] to-[#0a0a0a] relative overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-purple-500 font-mono text-xs tracking-[0.3em] uppercase">
            Narrativa de Datos
          </span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-6">
            Lo Que Revelan los Datos
          </h2>
        </div>

        {/* Desktop: side-by-side. Mobile: stacked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Sticky visualization (desktop only) */}
          <div className="hidden md:block">
            <div className="sticky top-24 h-[60vh] rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 flex items-center justify-center">
              {renderVisualization()}
            </div>
          </div>

          {/* Scroll steps */}
          <div>
            {/* Mobile: show current visualization inline */}
            <div className="md:hidden mb-8 h-[40vh] rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 flex items-center justify-center">
              {renderVisualization()}
            </div>

            <Scrollama onStepEnter={onStepEnter} offset={0.5}>
              {stepContent.map((step, i) => (
                <Step key={i} data={i}>
                  <div className="min-h-[50vh] flex items-center py-8">
                    <motion.div
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: currentStep === i ? 1 : 0.3 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white/[0.02] rounded-xl border border-white/5 p-8"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {React.createElement(SCROLL_STEPS[i].icon, {
                          className: `w-6 h-6 ${SCROLL_STEPS[i].color}`,
                        })}
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                          Paso {i + 1}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>
                </Step>
              ))}
            </Scrollama>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Section: deck.gl Convergence Map ───

const INITIAL_VIEW_STATE = {
  latitude: -38.416,
  longitude: -63.617,
  zoom: 4,
  pitch: 45,
  bearing: 0,
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const ConvergenceMapSection: React.FC = () => {
  const { hexagonData, arcData } = useDeckGLLayers();

  const [activeLayer, setActiveLayer] = useState<'hexagon' | 'arc'>('hexagon');
  const [hasWebGL2] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch { return false; }
  });

  const layers = useMemo(() => {
    if (activeLayer === 'hexagon') {
      return [
        new HexagonLayer({
          id: 'hexagon-layer',
          data: hexagonData,
          getPosition: (d: any) => d.position,
          getElevationWeight: (d: any) => d.weight,
          elevationScale: 200,
          extruded: true,
          radius: 15000,
          coverage: 0.85,
          upperPercentile: 100,
          colorRange: [
            [30, 30, 80],
            [60, 40, 140],
            [100, 60, 180],
            [140, 80, 200],
            [180, 100, 220],
            [220, 130, 240],
          ],
          material: {
            ambient: 0.6,
            diffuse: 0.6,
            shininess: 40,
            specularColor: [125, 91, 222],
          },
        }),
      ];
    }

    return [
      new ArcLayer({
        id: 'arc-layer',
        data: arcData,
        getSourcePosition: (d: any) => d.source,
        getTargetPosition: (d: any) => d.target,
        getSourceColor: [125, 91, 222, 180],
        getTargetColor: [59, 130, 246, 180],
        getWidth: 2,
        greatCircle: true,
      }),
    ];
  }, [activeLayer, hexagonData, arcData]);

  if (!hasWebGL2) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">
            Tu navegador no soporta WebGL2. Visitá{' '}
            <a href="/el-mapa" className="text-blue-400 underline">El Mapa</a>{' '}
            para ver las señales en el mapa interactivo.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-blue-500 font-mono text-xs tracking-[0.3em] uppercase">
            Visualización GPU
          </span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-6">
            El Territorio en 3D
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Cada hexágono representa la densidad de voces en una zona.
            Las montañas son donde más se concentra la verdad.
          </p>
        </div>

        {/* Layer toggle */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { id: 'hexagon' as const, label: 'Hexágonos 3D', icon: BarChart3 },
            { id: 'arc' as const, label: 'Arcos Territoriales', icon: Network },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              aria-pressed={activeLayer === layer.id}
              aria-label={`Visualizar ${layer.label}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeLayer === layer.id
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.08]'
              }`}
            >
              <layer.icon className="w-4 h-4" />
              {layer.label}
            </button>
          ))}
        </div>

        {/* Map container */}
        <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: 'clamp(400px, 60vh, 700px)' }} role="application" aria-label="Mapa de convergencia territorial en 3D">
          <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={layers}
          >
            <Map mapStyle={MAP_STYLE} />
          </DeckGL>
        </div>
      </div>
    </section>
  );
};

// ─── Section: Sankey Diagram ───

const SankeySection: React.FC<{ convergence: ConvergenceData }> = ({ convergence }) => {
  const { streamLinks, themeCards, typeDistribution } = convergence;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const sankeyData = useMemo(() => {
    if (!streamLinks.length) return null;

    // Build nodes: types (left) + themes (right)
    const typeNodes = DREAM_TYPES.map((t) => ({
      id: `type-${t}`,
      label: TYPE_LABELS[t],
      color: TYPE_COLORS[t],
    }));

    const themeNodes = themeCards.map((tc) => ({
      id: `theme-${tc.theme}`,
      label: tc.label,
      color: '#7D5BDE',
    }));

    const nodes = [...typeNodes, ...themeNodes];

    // Build links from streamLinks
    const links = streamLinks
      .filter((sl) => sl.strength > 0)
      .map((sl) => ({
        source: `type-${sl.source}`,
        target: `theme-${sl.theme}`,
        value: sl.strength,
      }));

    if (links.length === 0) return null;
    return { nodes, links };
  }, [streamLinks, themeCards]);

  if (!sankeyData) {
    return null;
  }

  return (
    <section ref={ref} className="py-24 bg-[#0f1116] border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-pink-500 font-mono text-xs tracking-[0.3em] uppercase">
            Flujo de Señales
          </span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-6">
            De la Voz al Tema
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Cada flujo muestra cómo las voces de cada tipo alimentan los temas comunes.
            El ancho del flujo representa la intensidad de la señal.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="overflow-x-auto"
        >
          <div style={{ minWidth: 600, height: 450 }}>
            <ResponsiveSankey
              data={sankeyData}
              theme={NIVO_THEME}
              margin={{ top: 20, right: 160, bottom: 20, left: 20 }}
              align="justify"
              colors={(node: any) => node.color || '#7D5BDE'}
              nodeOpacity={1}
              nodeHoverOthersOpacity={0.35}
              nodeThickness={18}
              nodeSpacing={24}
              nodeBorderWidth={0}
              nodeBorderRadius={3}
              linkOpacity={0.3}
              linkHoverOthersOpacity={0.1}
              linkContract={3}
              enableLinkGradient={true}
              labelPosition="outside"
              labelOrientation="horizontal"
              labelPadding={16}
              labelTextColor={{ from: 'color', modifiers: [['brighter', 0.8]] }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Section: Chord Diagram ───

const ChordSection: React.FC<{ convergence: ConvergenceData }> = ({ convergence }) => {
  const { themeCards } = convergence;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const { chordMatrix, chordLabels, chordColors } = useMemo(() => {
    if (!themeCards.length) return { chordMatrix: [], chordLabels: [], chordColors: [] };

    // Use top themes as nodes, build connection matrix based on shared types
    const themes = themeCards.slice(0, 6);
    const labels = themes.map((t) => t.label.split(' ')[0]); // Short labels
    const colors = themes.map(() => '#7D5BDE');

    const matrix = themes.map((themeA, i) =>
      themes.map((themeB, j) => {
        if (i === j) return 0;
        // Connection strength = number of shared types between two themes
        const sharedTypes = themeA.presentTypes.filter((t) => themeB.presentTypes.includes(t));
        return sharedTypes.length * themeA.totalHits * 0.01;
      })
    );

    return { chordMatrix: matrix, chordLabels: labels, chordColors: colors };
  }, [themeCards]);

  if (!chordMatrix.length) return null;

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
            Conexiones Temáticas
          </span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-6">
            Lo Que Une los Temas
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Cada arco muestra la fuerza de conexión entre temas.
            Los temas que comparten más tipos de señal están más conectados.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-lg mx-auto"
        >
          <div style={{ height: 400 }}>
            <ResponsiveChord
              data={chordMatrix}
              keys={chordLabels}
              theme={NIVO_THEME}
              margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
              padAngle={0.04}
              innerRadiusRatio={0.96}
              innerRadiusOffset={0.02}
              arcOpacity={1}
              activeArcOpacity={1}
              inactiveArcOpacity={0.25}
              arcBorderWidth={0}
              ribbonOpacity={0.25}
              activeRibbonOpacity={0.75}
              inactiveRibbonOpacity={0.1}
              ribbonBorderWidth={0}
              colors={['#7D5BDE', '#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#14B8A6']}
              enableLabel={true}
              label="id"
              labelOffset={12}
              labelRotation={-90}
              labelTextColor={{ from: 'color', modifiers: [['brighter', 1]] }}
              isInteractive={true}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Section: Constellation Graph (migrated) ───

const ConstellationSection: React.FC = () => (
  <section className="py-24 bg-[#0f1116] border-y border-white/5">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
          Red Semántica
        </span>
        <h2 className="text-4xl font-bold text-white mt-4 mb-6">
          La Constelación de Ideas
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Cada nodo es un grupo de voces. Las conexiones muestran
          cómo los temas se entrelazan. Explorá la red.
        </p>
      </div>
      <ConstellationGraph />
    </div>
  </section>
);

// ─── Section: AI Insights ───

const AIInsightsSection: React.FC = () => {
  const { data, isLoading, error } = useAIInsights();

  if (error || (!isLoading && !data)) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <Sparkles className="w-8 h-8 text-purple-400/40 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">
              Las narrativas generadas por IA estarán disponibles pronto.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm mt-4">Generando análisis...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-purple-500 font-mono text-xs tracking-[0.3em] uppercase">
              Inteligencia Artificial
            </span>
            <h2 className="text-4xl font-bold text-white mt-4 mb-6">
              Lo Que Ve la Máquina
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 md:p-10">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400">
                Generado por IA
              </span>
              {data?.generatedAt && (
                <span className="text-xs text-slate-600 ml-auto">
                  {new Date(data.generatedAt).toLocaleDateString('es-AR', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              )}
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
              {data?.narrative || ''}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Main Page ───

const ExplorarDatos = () => {
  const convergence = useConvergenceAnalysis();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'La Radiografía — Explorar Datos';
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-purple-900/30 font-sans">
      <Header />

      <main className="overflow-hidden">
        <HeroSection />

        <ScrollytellingSection convergence={convergence} />

        <NarrativeBridge text="Ahora que viste los números, mirá cómo se distribuyen en el territorio." />

        <ConvergenceMapSection />

        <NarrativeBridge text="Los datos fluyen. De la voz al tema, del tema al territorio." />

        <SankeySection convergence={convergence} />

        <ChordSection convergence={convergence} />

        <ConstellationSection />

        <AIInsightsSection />

        {/* Closing Pattern */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-6">
              {[
                { label: 'Qué estás viendo', text: 'Visualizaciones avanzadas de datos reales. Cada gráfico se alimenta de las señales que los ciudadanos cargan en el mapa.', color: 'text-emerald-400' },
                { label: 'Qué hacemos con esto', text: 'Transformar datos dispersos en inteligencia territorial. La convergencia visible genera mandatos irrefutables.', color: 'text-emerald-400' },
                { label: 'Qué no vamos a hacer', text: 'Presentar como definitivo lo que todavía es parcial. Los datos son transparentes — vos juzgás.', color: 'text-blue-400' },
                { label: 'Cómo se actualiza', text: 'En tiempo real. Cada nueva señal en el mapa alimenta estas visualizaciones automáticamente.', color: 'text-emerald-400' },
                { label: 'Qué podés hacer vos', text: 'Cargar tu verdad en el mapa. Descargar los datos abiertos. Compartir lo que ves.', color: 'text-emerald-400' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                  <span className={`${item.color} font-bold text-sm whitespace-nowrap min-w-[220px]`}>
                    {item.label}:
                  </span>
                  <span className="text-slate-400 text-sm leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Data CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-teal-400" />
              <h3 className="text-2xl font-bold text-white">Datos Abiertos</h3>
            </div>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">
              Descargá todos los datos del mapa en formato abierto.
              JSON, CSV o SQLite. Sin restricciones, sin permisos. Son tuyos.
            </p>
            <PowerCTA
              text="DESCARGAR DATOS ABIERTOS"
              href="/datos-abiertos"
              variant="outline"
              size="lg"
              animate={true}
            />
          </div>
        </section>

        {/* Next Steps */}
        <NextStepCard
          title="El Mapa"
          description="Volvé al mapa interactivo para cargar tu verdad. Cada señal que sumás alimenta estas visualizaciones."
          href="/el-mapa"
          gradient="from-[#0a1528] to-[#0f1a30]"
          icon={<Compass className="w-5 h-5" />}
        />

        <NextStepCard
          title="El Mandato Vivo"
          description="Los datos se convierten en mandatos territoriales. La convergencia de voces genera el plan de acción."
          href="/el-mandato-vivo"
          gradient="from-[#1a1500] to-[#1e1a0b]"
          icon={<Target className="w-5 h-5" />}
        />
      </main>

      <Footer />
    </div>
  );
};

export default ExplorarDatos;

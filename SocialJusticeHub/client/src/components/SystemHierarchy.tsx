import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, Crown, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const SystemHierarchy = () => {
  const [isSovereign, setIsSovereign] = useState(false);

  const toggleSystem = () => setIsSovereign(!isSovereign);

  const levels = [
    {
      id: 'people',
      label: 'El Pueblo',
      desc: 'Fuente de Legitimidad',
      icon: Users,
      color: isSovereign ? 'bg-blue-600' : 'bg-slate-700',
      textColor: isSovereign ? 'text-blue-100' : 'text-slate-400'
    },
    {
      id: 'state',
      label: 'El Estado',
      desc: 'Sistema Administrativo',
      icon: Building2,
      color: 'bg-slate-800',
      textColor: 'text-slate-400'
    },
    {
      id: 'politicians',
      label: 'Funcionarios',
      desc: 'Ejecutores Temporales',
      icon: Crown,
      color: isSovereign ? 'bg-slate-700' : 'bg-red-900',
      textColor: isSovereign ? 'text-slate-400' : 'text-red-100'
    }
  ];

  // Order based on mode
  const currentOrder = isSovereign 
    ? [levels[0], levels[1], levels[2]] // People -> State -> Politicians
    : [levels[2], levels[1], levels[0]]; // Politicians -> State -> People

  return (
    <div className="w-full max-w-4xl mx-auto p-8 rounded-3xl bg-slate-950 border border-slate-800 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Visualizer */}
        <div className="flex flex-col items-center gap-4 min-h-[400px] justify-center">
          <AnimatePresence mode='popLayout'>
            {currentOrder.map((level, index) => (
              <motion.div
                key={level.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className={cn(
                  "w-64 p-4 rounded-2xl border border-white/5 shadow-xl flex items-center gap-4 relative z-10",
                  level.color
                )}
                style={{
                  width: `${100 - index * 15}%`, // Pyramid effect
                  maxWidth: '280px',
                  minWidth: '200px'
                }}
              >
                <div className="p-2 bg-black/20 rounded-lg">
                  <level.icon className={cn("w-6 h-6", level.textColor)} />
                </div>
                <div>
                  <h3 className={cn("font-bold text-white", level.textColor)}>{level.label}</h3>
                  <p className="text-xs text-white/50">{level.desc}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Connecting Lines */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
             <div className="w-px h-64 bg-gradient-to-b from-transparent via-white to-transparent" />
          </div>
        </div>

        {/* Controls & Explanation */}
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono mb-4">
              <RefreshCw className={cn("w-3 h-3", isSovereign && "animate-spin-slow")} />
              MODELO DE SISTEMA
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {isSovereign ? "El Orden Natural" : "La Distorsión Actual"}
            </h2>
            <p className="text-slate-400 leading-relaxed">
              {isSovereign 
                ? "Cuando el ciudadano define el propósito (Input), el Estado procesa (Throughput) y los funcionarios ejecutan (Output). El sistema funciona con legitimidad."
                : "El error fundamental: el subsistema (políticos) intenta definir el propósito de todo el sistema. Esto genera ruido, ineficiencia y desconexión con la realidad."}
            </p>
          </div>

          <button
            onClick={toggleSystem}
            className="group relative flex items-center justify-between w-full p-1 bg-slate-900 rounded-2xl border border-slate-700 cursor-pointer hover:border-slate-500 transition-colors"
          >
            <div className={cn(
              "flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all duration-300",
              !isSovereign ? "bg-red-900/50 text-red-100 shadow-lg" : "text-slate-500"
            )}>
              DISTORSIÓN
            </div>
            <div className="p-2">
              <RefreshCw className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div className={cn(
              "flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all duration-300",
              isSovereign ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-slate-500"
            )}>
              SOBERANÍA
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemHierarchy;


import { motion } from 'framer-motion';
import { Activity, Zap, Users, Target, Sparkles, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

type PulseItem = {
  id: number;
  type: 'connection' | 'project' | 'resource' | 'action';
  message: string;
  timestamp: string;
  location: string;
};

const MOCK_PULSE: PulseItem[] = [
  { id: 1, type: 'connection', message: 'Juan se unió al nodo Córdoba', timestamp: 'ahora', location: 'Córdoba' },
  { id: 2, type: 'project', message: 'Nueva iniciativa: Huertas Urbanas', timestamp: '2m', location: 'Rosario' },
  { id: 3, type: 'action', message: '150 firmas recolectadas en Mendoza', timestamp: '5m', location: 'Mendoza' },
  { id: 4, type: 'resource', message: 'Guía de Cooperativismo compartida', timestamp: '12m', location: 'CABA' },
  { id: 5, type: 'connection', message: 'Lucía conectó con Proyecto Raíz', timestamp: '15m', location: 'Salta' },
];

const TribalPulse = () => {
  const [items, setItems] = useState<PulseItem[]>(MOCK_PULSE);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newItem: PulseItem = {
        id: Date.now(),
        type: Math.random() > 0.5 ? 'connection' : 'action',
        message: `Nueva acción detectada en la red`,
        timestamp: 'ahora',
        location: 'Argentina'
      };
      setItems(prev => [newItem, ...prev.slice(0, 4)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'connection': return <Users className="w-3 h-3 text-blue-400" />;
      case 'project': return <Sparkles className="w-3 h-3 text-purple-400" />;
      case 'action': return <Zap className="w-3 h-3 text-orange-400" />;
      case 'resource': return <Target className="w-3 h-3 text-emerald-400" />;
      default: return <Activity className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="w-full bg-[#050505] border-b border-white/5 relative overflow-hidden h-10 flex items-center z-40">
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10 pointer-events-none" />
      
      {/* Label */}
      <div className="absolute left-0 pl-4 z-20 flex items-center gap-2 bg-[#050505] h-full pr-4 border-r border-white/5">
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          Pulso Vital
        </span>
      </div>

      {/* Ticker */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div 
          className="flex items-center gap-12 whitespace-nowrap pl-40"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {[...items, ...items, ...items].map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-default">
              <div className="flex items-center gap-2">
                {getIcon(item.type)}
                <span className="text-xs font-medium text-slate-300">
                  {item.message}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <Globe className="w-2 h-2" />
                {item.location}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TribalPulse;


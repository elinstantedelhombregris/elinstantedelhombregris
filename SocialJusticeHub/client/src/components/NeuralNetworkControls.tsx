import React from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Heart,
  AlertCircle,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NeuralNetworkControlsProps {
  activeLayers: Set<string>;
  onToggleLayer: (layer: string) => void;
  minSimilarity: number;
  maxConnections: number;
  onMinSimilarityChange: (value: number) => void;
  onMaxConnectionsChange: (value: number) => void;
  nodeCount: number;
  edgeCount: number;
  particleDensity?: number;
  onParticleDensityChange?: (value: number) => void;
  showParticles?: boolean;
  onShowParticlesChange?: (value: boolean) => void;
}

const layerConfig = [
  { type: 'dream', label: 'Sueños', icon: Eye, color: '#3b82f6' },
  { type: 'value', label: 'Valores', icon: Heart, color: '#ec4899' },
  { type: 'need', label: 'Necesidades', icon: AlertCircle, color: '#f59e0b' },
  { type: 'basta', label: '¡BASTA!', icon: Zap, color: '#ef4444' },
];

export default function NeuralNetworkControls({
  activeLayers,
  onToggleLayer,
  minSimilarity,
  maxConnections,
  onMinSimilarityChange,
  onMaxConnectionsChange,
  nodeCount,
  edgeCount,
  particleDensity = 30,
  onParticleDensityChange,
  showParticles = true,
  onShowParticlesChange,
}: NeuralNetworkControlsProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  return (
    <div className="absolute top-4 left-4 z-10 space-y-3 max-w-[calc(100vw-2rem)]">
      {/* Layer Controls */}
      <div className="bg-black/60 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-white/60" />
          <h3 className="text-white font-semibold text-sm">Capas</h3>
        </div>
        <div className="space-y-2">
          {layerConfig.map(({ type, label, icon: Icon, color }) => (
            <motion.button
              key={type}
              onClick={() => onToggleLayer(type)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full text-left',
                activeLayers.has(type)
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-sm">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
          <button
            onClick={() => {
              layerConfig.forEach((l) => {
                if (!activeLayers.has(l.type)) onToggleLayer(l.type);
              });
            }}
            className="flex-1 px-2 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded text-white/80 transition-colors"
          >
            Todo
          </button>
          <button
            onClick={() => {
              layerConfig.forEach((l) => {
                if (activeLayers.has(l.type)) onToggleLayer(l.type);
              });
            }}
            className="flex-1 px-2 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded text-white/80 transition-colors"
          >
            Nada
          </button>
        </div>
      </div>

      {/* Filter Toggle */}
      <motion.button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full bg-black/60 backdrop-blur-lg rounded-xl p-3 border border-white/10 flex items-center justify-between text-white hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros</span>
        </div>
        <motion.div
          animate={{ rotate: showFilters ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </motion.button>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-black/60 backdrop-blur-lg rounded-xl p-4 border border-white/10 space-y-4"
        >
          {/* Min Similarity Slider */}
          <div>
            <label className="text-xs text-white/80 mb-2 block">
              Similitud Mínima: {minSimilarity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={minSimilarity}
              onChange={(e) => onMinSimilarityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Max Connections Slider */}
          <div>
            <label className="text-xs text-white/80 mb-2 block">
              Conexiones Máximas: {maxConnections}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={maxConnections}
              onChange={(e) => onMaxConnectionsChange(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Particle Density Slider */}
          {onParticleDensityChange && (
            <div>
              <label className="text-xs text-white/80 mb-2 block">
                Densidad de Partículas: {particleDensity}
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={particleDensity}
                onChange={(e) => onParticleDensityChange(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          )}

          {/* Show Particles Toggle */}
          {onShowParticlesChange && (
            <div>
              <label className="text-xs text-white/80 mb-2 block">
                Mostrar Partículas
              </label>
              <button
                onClick={() => onShowParticlesChange(!showParticles)}
                className={cn(
                  'w-full px-3 py-2 rounded-lg transition-all text-sm',
                  showParticles
                    ? 'bg-purple-500/30 text-white border border-purple-500/50'
                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                )}
              >
                {showParticles ? 'Ocultar Partículas' : 'Mostrar Partículas'}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Stats */}
      <div className="bg-black/60 backdrop-blur-lg rounded-xl p-3 border border-white/10">
        <div className="text-xs text-white/60 space-y-1">
          <div className="flex justify-between">
            <span>Nodos:</span>
            <span className="text-white">{nodeCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Conexiones:</span>
            <span className="text-white">{edgeCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


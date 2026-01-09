import React from 'react';
import { motion } from 'framer-motion';
import { X, Eye, Heart, AlertCircle, Zap, Calendar, MapPin, Users } from 'lucide-react';
import type { NeuralNode } from '@/hooks/useNeuralNetwork';
import { cn } from '@/lib/utils';

interface NodeDetailPanelProps {
  node: NeuralNode & { personId?: number };
  onClose: () => void;
  similarNodes: NeuralNode[];
}

const typeConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  dream: { label: 'Sueño', icon: Eye, color: '#3b82f6' },
  value: { label: 'Valor', icon: Heart, color: '#ec4899' },
  need: { label: 'Necesidad', icon: AlertCircle, color: '#f59e0b' },
  basta: { label: '¡BASTA!', icon: Zap, color: '#ef4444' },
};

export default function NodeDetailPanel({
  node,
  onClose,
  similarNodes,
}: NodeDetailPanelProps) {
  const config = typeConfig[node.type] || typeConfig.dream;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-4 right-4 z-10 w-full md:w-96 max-w-[calc(100vw-2rem)] bg-black/80 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl max-h-[calc(100%-2rem)] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{config.label}</h3>
            <p className="text-white/60 text-xs">ID: {node.id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <p className="text-white/90 leading-relaxed">{node.text}</p>
        </div>

        {/* Node Properties */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
          <div>
            <p className="text-xs text-white/60 mb-1">Tamaño</p>
            <p className="text-white font-semibold">{node.size.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Posición</p>
            <p className="text-white font-mono text-xs">
              ({node.position[0].toFixed(1)}, {node.position[1].toFixed(1)},{' '}
              {node.position[2].toFixed(1)})
            </p>
          </div>
        </div>

        {/* Similar Nodes */}
        {similarNodes.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <h4 className="text-white font-semibold text-sm mb-3">
              Contribuciones Relacionadas
            </h4>
            <div className="space-y-2">
              {similarNodes.slice(0, 5).map((similarNode) => {
                const similarConfig =
                  typeConfig[similarNode.type] || typeConfig.dream;
                const SimilarIcon = similarConfig.icon;
                return (
                  <div
                    key={similarNode.id}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <SimilarIcon
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: similarConfig.color }}
                      />
                      <p className="text-white/80 text-xs line-clamp-2">
                        {similarNode.text.substring(0, 100)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}


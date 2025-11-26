import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react';

interface ShockStat {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'neutral';
  color: 'red' | 'orange' | 'yellow' | 'blue' | 'green' | 'purple';
  icon?: React.ReactNode;
  description?: string;
}

interface ShockStatsProps {
  stats: ShockStat[];
  title?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

const ACCENT_COLORS: Record<ShockStat['color'], string> = {
  red: '#F38B82',
  orange: '#EFB479',
  yellow: '#D9C36A',
  blue: '#6A7FDB',
  green: '#5BAE9C',
  purple: '#9B85E5'
};

export default function ShockStats({ 
  stats, 
  title = "REALIDAD QUE DEBES CONOCER",
  className = '',
  variant = 'light'
}: ShockStatsProps) {
  const [animatedStats, setAnimatedStats] = useState<ShockStat[]>(stats.map(stat => ({ ...stat, value: 0 })));

  useEffect(() => {
    const animateStats = () => {
      stats.forEach((stat, index) => {
        const targetValue = stat.value;
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = targetValue / steps;
        let currentValue = 0;

        const timer = setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
          }

          setAnimatedStats(prev => prev.map((s, i) => 
            i === index ? { ...s, value: Math.floor(currentValue) } : s
          ));
        }, duration / steps);
      });
    };

    const delay = setTimeout(animateStats, 500);
    return () => clearTimeout(delay);
  }, [stats]);

  const getCardStyles = () =>
    variant === 'dark'
      ? 'bg-white/10 text-white border border-white/15 backdrop-blur-lg'
      : 'bg-white text-foreground border border-border shadow-[0_20px_50px_rgba(15,23,42,0.06)]';

  const getChipStyle = (color: ShockStat['color']) => {
    const hex = ACCENT_COLORS[color] || ACCENT_COLORS.red;
    const bgAlpha = variant === 'dark' ? '26' : '1F'; // ~15% or 12%
    const borderAlpha = variant === 'dark' ? '40' : '29'; // ~25% or 16%
    return {
      color: hex,
      backgroundColor: `${hex}${bgAlpha}`,
      borderColor: `${hex}${borderAlpha}`
    };
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'neutral':
        return <Target className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3
          className={`text-center heading-section mb-8 uppercase tracking-wide ${
            variant === 'dark' ? 'text-white/80' : 'text-secondary'
          }`}
        >
          {title}
        </h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animatedStats.map((stat, index) => (
          <div 
            key={stat.id}
            className={`relative rounded-2xl p-6 ${getCardStyles()} hover-lift`}
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <div className="flex items-center justify-between mb-6">
              {stat.icon && (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full border"
                  style={getChipStyle(stat.color)}
                >
                  {stat.icon}
                </div>
              )}
              {stat.trend && (
                <div className="flex-shrink-0">
                  {getTrendIcon(stat.trend)}
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div
                className={`text-4xl font-semibold mb-2 ${
                  variant === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                {stat.value.toLocaleString()}
                <span className="text-lg ml-1">{stat.unit}</span>
              </div>
              <div
                className={`text-sm font-semibold uppercase tracking-[0.3em] ${
                  variant === 'dark' ? 'text-white/80' : 'text-foreground/70'
                }`}
              >
                {stat.label}
              </div>
              {stat.description && (
                <div
                  className={`text-xs mt-3 ${
                    variant === 'dark' ? 'text-white/65' : 'text-muted-foreground'
                  }`}
                >
                  {stat.description}
                </div>
              )}
            </div>
            
            {/* Accent underline */}
            <span
              className="absolute inset-x-8 bottom-4 block h-px opacity-70"
              style={{ backgroundColor: `${(ACCENT_COLORS[stat.color] || ACCENT_COLORS.red)}40` }}
            ></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Predefined shock stats for Argentina
export const argentinaShockStats: ShockStat[] = [
  {
    id: 'presidents-failed',
    label: 'Presidentes Fallidos',
    value: 15,
    unit: '',
    trend: 'up',
    color: 'red',
    icon: <AlertCircle className="w-6 h-6" />,
    description: 'En los últimos 70 años'
  },
  {
    id: 'inflation-rate',
    label: 'Inflación Anual',
    value: 160,
    unit: '%',
    trend: 'up',
    color: 'red',
    icon: <TrendingUp className="w-6 h-6" />,
    description: 'Pérdida del poder adquisitivo'
  },
  {
    id: 'poverty-rate',
    label: 'Población en Pobreza',
    value: 45,
    unit: '%',
    trend: 'up',
    color: 'orange',
    icon: <AlertCircle className="w-6 h-6" />,
    description: 'Más de 20 millones de argentinos'
  },
  {
    id: 'unemployment',
    label: 'Desempleo',
    value: 8,
    unit: '%',
    trend: 'up',
    color: 'yellow',
    icon: <TrendingDown className="w-6 h-6" />,
    description: 'Sin contar el trabajo informal'
  },
  {
    id: 'currency-devaluation',
    label: 'Devaluación del Peso',
    value: 95,
    unit: '%',
    trend: 'up',
    color: 'red',
    icon: <TrendingDown className="w-6 h-6" />,
    description: 'En los últimos 4 años'
  },
  {
    id: 'successful-governments',
    label: 'Gobiernos Exitosos',
    value: 0,
    unit: '',
    trend: 'neutral',
    color: 'red',
    icon: <Target className="w-6 h-6" />,
    description: 'Cero cambios reales'
  }
];

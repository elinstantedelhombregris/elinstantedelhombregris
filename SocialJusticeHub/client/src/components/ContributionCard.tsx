import { Dream } from "@shared/schema";
import { Star, Heart, AlertCircle, Zap, MapPin, Calendar, ExternalLink, Navigation, Share2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ContributionCardProps {
  dream: Dream;
  activeTab: 'dream' | 'value' | 'need' | 'basta';
  onViewDetails?: (dream: Dream) => void;
  className?: string;
}

const ContributionCard = ({ dream, activeTab, onViewDetails, className }: ContributionCardProps) => {
  const getContent = () => {
    if (dream.type === 'dream' && dream.dream) return dream.dream;
    if (dream.type === 'value' && dream.value) return dream.value;
    if (dream.type === 'need' && dream.need) return dream.need;
    if (dream.type === 'basta' && dream.basta) return dream.basta;
    return '';
  };

  const getTypeIcon = () => {
    switch (dream.type) {
      case 'dream': return <Star className="w-6 h-6 text-white" />;
      case 'value': return <Heart className="w-6 h-6 text-white" />;
      case 'need': return <AlertCircle className="w-6 h-6 text-white" />;
      case 'basta': return <Zap className="w-6 h-6 text-white" />;
      default: return <Star className="w-6 h-6 text-white" />;
    }
  };

  const getTypeColor = () => {
    switch (dream.type) {
      case 'dream': return {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-300',
        iconBg: 'bg-blue-500',
        text: 'text-blue-600'
      };
      case 'value': return {
        bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
        border: 'border-pink-300',
        iconBg: 'bg-pink-500',
        text: 'text-pink-600'
      };
      case 'need': return {
        bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
        border: 'border-amber-300',
        iconBg: 'bg-amber-500',
        text: 'text-amber-600'
      };
      case 'basta': return {
        bg: 'bg-gradient-to-br from-red-50 to-orange-100',
        border: 'border-red-300',
        iconBg: 'bg-red-500',
        text: 'text-red-600'
      };
      default: return {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
        border: 'border-gray-300',
        iconBg: 'bg-gray-500',
        text: 'text-gray-600'
      };
    }
  };

  const getTypeLabel = () => {
    switch (dream.type) {
      case 'dream': return 'Visión';
      case 'value': return 'Valor';
      case 'need': return 'Necesidad';
      case 'basta': return '¡BASTA!';
      default: return 'Aporte';
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'hace un momento';
      if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
      if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
      return `hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    } catch {
      return '';
    }
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const content = getContent();
  const colors = getTypeColor();
  const dateStr = formatDate(dream.createdAt);
  const typeLabel = getTypeLabel();
  const locationLabel = dream.location || 'Argentina';

  const handleCenterOnMap = () => {
    if (dream.latitude && dream.longitude) {
      window.dispatchEvent(new CustomEvent('centerMapOnContribution', {
        detail: {
          lat: parseFloat(dream.latitude),
          lng: parseFloat(dream.longitude)
        }
      }));
    }
  };

  const handleShare = () => {
    window.dispatchEvent(new CustomEvent('shareDream', { detail: dream }));
  };

  return (
    <div 
      className={cn(
        "flex-shrink-0 w-80 p-5 rounded-3xl shadow-lg border transition-all hover:shadow-2xl hover:-translate-y-1 snap-start bg-white",
        colors.bg,
        colors.border,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner", colors.iconBg)}>
            {getTypeIcon()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{typeLabel}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {locationLabel}
            </p>
          </div>
        </div>
        {dateStr && (
          <div className="flex items-center gap-1 text-xs text-gray-500 rounded-full bg-white/60 px-2 py-1">
            <Calendar className="w-3 h-3" />
            <span>{dateStr}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4 min-h-[96px]">
        <p
          className={cn(
            "leading-relaxed text-sm text-slate-700",
            dream.type === 'basta' && "font-semibold text-slate-900"
          )}
        >
          “{truncateText(content, 220)}”
        </p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{locationLabel}</span>
        </div>
        {dream.createdAt && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{dateStr}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCenterOnMap}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white/80 border border-slate-200 rounded-full px-3 py-1 hover:bg-slate-100 transition"
          >
            <Navigation className="w-3 h-3" />
            Ver en mapa
          </button>
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(dream)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white/80 border border-slate-200 rounded-full px-3 py-1 hover:bg-slate-100 transition"
            >
              <ExternalLink className="w-3 h-3" />
              Profundizar
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-white transition"
          title="Compartir contribución"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ContributionCard;


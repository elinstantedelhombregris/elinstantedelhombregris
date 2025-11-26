import { Dream } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Heart, AlertCircle, Zap, MapPin, Calendar, X, Share2, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ContributionModalProps {
  dream: Dream | null;
  open: boolean;
  onClose: () => void;
  onShare?: (dream: Dream) => void;
}

const ContributionModal = ({ dream, open, onClose, onShare }: ContributionModalProps) => {
  if (!dream) return null;

  const getContent = () => {
    if (dream.type === 'dream' && dream.dream) return dream.dream;
    if (dream.type === 'value' && dream.value) return dream.value;
    if (dream.type === 'need' && dream.need) return dream.need;
    if (dream.type === 'basta' && dream.basta) return dream.basta;
    return '';
  };

  const getTypeLabel = () => {
    switch (dream.type) {
      case 'dream': return 'Sueño';
      case 'value': return 'Valor';
      case 'need': return 'Necesidad';
      case 'basta': return '¡BASTA!';
      default: return 'Contribución';
    }
  };

  const getTypeIcon = () => {
    switch (dream.type) {
      case 'dream': return <Star className="w-6 h-6" />;
      case 'value': return <Heart className="w-6 h-6" />;
      case 'need': return <AlertCircle className="w-6 h-6" />;
      case 'basta': return <Zap className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getTypeColor = () => {
    switch (dream.type) {
      case 'dream': return {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        iconBg: 'bg-blue-500',
        text: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800'
      };
      case 'value': return {
        bg: 'bg-pink-50',
        border: 'border-pink-300',
        iconBg: 'bg-pink-500',
        text: 'text-pink-600',
        badge: 'bg-pink-100 text-pink-800'
      };
      case 'need': return {
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        iconBg: 'bg-amber-500',
        text: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-800'
      };
      case 'basta': return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        iconBg: 'bg-red-500',
        text: 'text-red-600',
        badge: 'bg-red-100 text-red-800'
      };
      default: return {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        iconBg: 'bg-gray-500',
        text: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-800'
      };
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Fecha no disponible';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const content = getContent();
  const colors = getTypeColor();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-2xl", colors.bg, colors.border)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white", colors.iconBg)}>
                {getTypeIcon()}
              </div>
              <div>
                <DialogTitle className={cn("text-2xl", colors.text)}>
                  {getTypeLabel()}
                </DialogTitle>
                <DialogDescription>
                  Contribución compartida en el mapa
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Content */}
          <div className={cn("p-6 rounded-lg border-2", colors.border, colors.bg)}>
            <p className={cn(
              "text-lg leading-relaxed",
              dream.type === 'basta' ? "font-semibold" : "italic",
              colors.text
            )}>
              {dream.type === 'basta' ? `¡BASTA! ${content}` : `"${content}"`}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-sm">{dream.location || 'Argentina'}</p>
              </div>
            </div>
            {dream.createdAt && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium">Fecha</p>
                  <p className="text-sm">{formatDate(dream.createdAt)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {onShare && (
              <Button
                onClick={() => {
                  onShare(dream);
                  onClose();
                }}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            )}
            {dream.latitude && dream.longitude && (
              <Button
                onClick={() => {
                  // Center map on this contribution
                  window.dispatchEvent(new CustomEvent('centerMapOnContribution', {
                    detail: {
                      lat: parseFloat(dream.latitude!),
                      lng: parseFloat(dream.longitude!)
                    }
                  }));
                  onClose();
                }}
                variant="outline"
                className="flex-1"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Ver en mapa
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContributionModal;


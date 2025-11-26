import { useState, useEffect } from 'react';
import { AlertTriangle, X, Zap, Flame, Target } from 'lucide-react';

interface UrgencyBannerProps {
  variant?: 'warning' | 'critical' | 'info';
  message?: string;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const UrgencyBanner = ({ 
  variant = 'warning', 
  message = "ARGENTINA ESTÁ COLAPSANDO AHORA - ÚNETE AL MOVIMIENTO ¡BASTA!",
  dismissible = true,
  autoHide = false,
  autoHideDelay = 5000
}: UrgencyBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('urgency-banner-dismissed');
    if (dismissed) {
      setIsVisible(false);
      return;
    }

    // Auto-hide countdown
    if (autoHide && autoHideDelay > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsVisible(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (dismissible) {
      localStorage.setItem('urgency-banner-dismissed', 'true');
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return {
          bg: 'bg-gradient-to-r from-red-600 to-red-700',
          icon: <AlertTriangle className="w-5 h-5 animate-pulse" />,
          text: 'text-white',
          border: 'border-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-orange-600 to-red-600',
          icon: <Zap className="w-5 h-5 animate-pulse" />,
          text: 'text-white',
          border: 'border-orange-500'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-600 to-purple-600',
          icon: <Target className="w-5 h-5 animate-pulse" />,
          text: 'text-white',
          border: 'border-blue-500'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-orange-600 to-red-600',
          icon: <Zap className="w-5 h-5 animate-pulse" />,
          text: 'text-white',
          border: 'border-orange-500'
        };
    }
  };

  const styles = getVariantStyles();

  if (!isVisible) return null;

  return (
    <div className={`${styles.bg} ${styles.text} py-2 px-4 sticky top-0 z-[60] border-b ${styles.border}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {styles.icon}
          <span className="font-bold text-sm md:text-base">
            {message}
          </span>
          {autoHide && timeLeft > 0 && (
            <span className="text-xs bg-white/20 rounded-full px-2 py-1">
              {timeLeft}s
            </span>
          )}
        </div>
        
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            aria-label="Cerrar banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UrgencyBanner;

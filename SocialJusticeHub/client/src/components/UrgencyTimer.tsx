import { useState, useEffect } from 'react';
import { Clock, AlertCircle, Star, Target } from 'lucide-react';

interface UrgencyTimerProps {
  targetDate: string;
  message?: string;
  variant?: 'warning' | 'critical' | 'info' | 'motivational';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const UrgencyTimer = ({ 
  targetDate, 
  message = "Únete al movimiento de transformación",
  variant = 'motivational',
  size = 'md',
  showIcon = true
}: UrgencyTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return {
          bg: 'bg-gradient-to-r from-red-100 to-red-200 border-red-300',
          text: 'text-red-800',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300',
          text: 'text-orange-800',
          icon: <Clock className="w-5 h-5 text-orange-600" />
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300',
          text: 'text-blue-800',
          icon: <Target className="w-5 h-5 text-blue-600" />
        };
      case 'motivational':
      default:
        return {
          bg: 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300',
          text: 'text-purple-800',
          icon: <Star className="w-5 h-5 text-purple-600" />
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-3 py-2 text-sm',
          time: 'text-lg',
          unit: 'text-xs'
        };
      case 'md':
        return {
          container: 'px-4 py-3 text-base',
          time: 'text-xl',
          unit: 'text-sm'
        };
      case 'lg':
        return {
          container: 'px-6 py-4 text-lg',
          time: 'text-2xl',
          unit: 'text-base'
        };
    }
  };

  const styles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={`${styles.bg} ${styles.text} ${sizeStyles.container} rounded-lg border-2 backdrop-blur-sm shadow-sm`}>
      <div className="flex items-center justify-center space-x-3">
        {showIcon && styles.icon}
        <div className="text-center">
          <div className="font-semibold mb-1">{message}</div>
          <div className="flex items-center space-x-4">
            {timeLeft.days > 0 && (
              <div className="text-center">
                <div className={`${sizeStyles.time} font-bold`}>{timeLeft.days}</div>
                <div className={`${sizeStyles.unit} opacity-75`}>días</div>
              </div>
            )}
            <div className="text-center">
              <div className={`${sizeStyles.time} font-bold`}>{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div className={`${sizeStyles.unit} opacity-75`}>horas</div>
            </div>
            <div className="text-center">
              <div className={`${sizeStyles.time} font-bold`}>{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div className={`${sizeStyles.unit} opacity-75`}>min</div>
            </div>
            <div className="text-center">
              <div className={`${sizeStyles.time} font-bold`}>{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <div className={`${sizeStyles.unit} opacity-75`}>seg</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrgencyTimer;
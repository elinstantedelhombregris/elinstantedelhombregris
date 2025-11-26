import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Zap, 
  Trophy, 
  Award, 
  Target, 
  TrendingUp,
  CheckCircle,
  Gift,
  Crown,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface XPNotificationProps {
  amount: number;
  reason: string;
  type?: 'xp' | 'badge' | 'level' | 'streak' | 'achievement';
  badge?: {
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  level?: {
    current: number;
    previous: number;
  };
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export default function XPNotification({
  amount,
  reason,
  type = 'xp',
  badge,
  level,
  position = 'top-right',
  duration = 4000,
  onComplete,
  className = ''
}: XPNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!isVisible) {
      const completeTimer = setTimeout(() => {
        onComplete?.();
      }, 500);
      return () => clearTimeout(completeTimer);
    }
  }, [isVisible, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'badge':
        return <Award className="w-6 h-6" />;
      case 'level':
        return <Trophy className="w-6 h-6" />;
      case 'streak':
        return <Target className="w-6 h-6" />;
      case 'achievement':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'badge':
        if (badge?.rarity === 'legendary') return 'from-yellow-400 to-orange-500';
        if (badge?.rarity === 'epic') return 'from-purple-400 to-pink-500';
        if (badge?.rarity === 'rare') return 'from-blue-400 to-indigo-500';
        return 'from-green-400 to-teal-500';
      case 'level':
        return 'from-yellow-400 to-orange-500';
      case 'streak':
        return 'from-red-400 to-pink-500';
      case 'achievement':
        return 'from-purple-400 to-indigo-500';
      default:
        return 'from-blue-400 to-cyan-500';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.8, 
            y: position.includes('top') ? -50 : 50,
            x: position.includes('left') ? -50 : position.includes('right') ? 50 : 0
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8, 
            y: position.includes('top') ? -50 : 50,
            x: position.includes('left') ? -50 : position.includes('right') ? 50 : 0
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30 
          }}
          className={`fixed ${getPositionClasses()} z-50 ${className}`}
        >
          <motion.div
            className="relative"
            onAnimationComplete={() => setIsAnimating(true)}
          >
            {/* Main notification card */}
            <div className={`
              bg-white rounded-xl shadow-2xl border border-gray-200 p-4
              min-w-[300px] max-w-[400px]
              backdrop-blur-sm bg-white/95
            `}>
              <div className="flex items-center gap-3">
                {/* Icon with gradient background */}
                <motion.div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    bg-gradient-to-r ${getColor()} text-white
                    shadow-lg
                  `}
                  animate={isAnimating ? { 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {getIcon()}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {type === 'badge' && badge ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          ¡Nuevo Badge!
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={`
                            text-xs
                            ${badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' : ''}
                            ${badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' : ''}
                            ${badge.rarity === 'common' ? 'bg-green-100 text-green-800' : ''}
                          `}
                        >
                          {badge.rarity}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{badge.name}</p>
                      <p className="text-gray-600 text-xs">{badge.description}</p>
                    </div>
                  ) : type === 'level' && level ? (
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">
                        ¡Subiste de Nivel!
                      </h3>
                      <p className="text-gray-600 text-xs">
                        Nivel {level.previous} → {level.current}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">
                        +{amount} XP
                      </h3>
                      <p className="text-gray-600 text-xs">{reason}</p>
                    </div>
                  )}
                </div>

                {/* Close button */}
                <motion.button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Progress bar for XP */}
              {type === 'xp' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span>{amount} XP ganados</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${getColor()}`}
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Floating particles effect */}
            {isAnimating && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    initial={{ 
                      scale: 0,
                      x: 60,
                      y: 30,
                      opacity: 1
                    }}
                    animate={{ 
                      scale: [0, 1, 0],
                      x: 60 + (Math.random() - 0.5) * 100,
                      y: 30 + (Math.random() - 0.5) * 100,
                      opacity: [1, 0.8, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: 1.5,
                      delay: i * 0.1,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </>
            )}

            {/* Sparkle effects */}
            {isAnimating && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ 
                      scale: 0,
                      rotate: 0,
                      opacity: 1
                    }}
                    animate={{ 
                      scale: [0, 1, 0],
                      rotate: 360,
                      opacity: [1, 0.8, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: 1,
                      delay: 0.3 + i * 0.2,
                      ease: 'easeOut'
                    }}
                    style={{
                      left: 20 + i * 20,
                      top: 10 + i * 15
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating XP counter for continuous actions
export function FloatingXPCounter({
  amount,
  reason,
  className = ''
}: {
  amount: number;
  reason: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ 
        opacity: 1,
        scale: 1,
        y: 0
      }}
      animate={{ 
        opacity: 0,
        scale: 1.2,
        y: -50
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
      className={`
        fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
        bg-gradient-to-r from-blue-500 to-purple-600 text-white
        px-4 py-2 rounded-full shadow-lg font-semibold
        pointer-events-none z-50
        ${className}
      `}
    >
      +{amount} XP
    </motion.div>
  );
}

// Level up celebration
export function LevelUpCelebration({
  level,
  onComplete
}: {
  level: number;
  onComplete?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer =       setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onComplete?.(), 500);
      }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              <Crown className="w-16 h-16 mx-auto mb-4" />
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-2">¡Felicitaciones!</h2>
            <p className="text-xl mb-4">Has alcanzado el nivel {level}</p>
            <p className="text-sm opacity-90">
              Sigue leyendo y participando para subir más niveles
            </p>

            {/* Confetti effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  initial={{ 
                    scale: 0,
                    x: '50%',
                    y: '50%',
                    opacity: 1
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                    opacity: [1, 0.8, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.1,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

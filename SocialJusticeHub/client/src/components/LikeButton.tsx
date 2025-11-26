import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LikeButtonProps {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
  onLike?: (postId: number) => Promise<void>;
  onUnlike?: (postId: number) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  disabled?: boolean;
}

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  onLike,
  onUnlike,
  size = 'md',
  showCount = true,
  disabled = false
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Sync with props when they change
  useEffect(() => {
    setIsLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    const previousLiked = isLiked;
    const previousCount = count;

    // Optimistic update
    setIsLiked(!isLiked);
    setCount(prev => isLiked ? prev - 1 : prev + 1);
    
    if (!isLiked) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1000);
    }

    try {
      if (isLiked && onUnlike) {
        await onUnlike(postId);
      } else if (!isLiked && onLike) {
        await onLike(postId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setIsLiked(previousLiked);
      setCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`
          relative ${sizeClasses[size]} 
          flex items-center justify-center
          rounded-full transition-all duration-200
          ${isLiked 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          hover:scale-105 active:scale-95
        `}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
        initial={false}
      >
        <motion.div
          className="relative"
          animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart 
            className={`${iconSizes[size]} ${isLiked ? 'fill-current' : ''}`}
          />
        </motion.div>

        {/* Loading spinner */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={`${iconSizes[size]} animate-spin`}>
              <Heart className={`${iconSizes[size]} ${isLiked ? 'fill-current' : ''} opacity-30`} />
            </div>
          </motion.div>
        )}

        {/* Like animation */}
        <AnimatePresence>
          {showAnimation && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 1.5, 2], 
                opacity: [1, 0.8, 0],
                y: [0, -10, -20]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.div
                className="absolute inset-0 bg-red-500 rounded-full"
                animate={{ scale: [0, 1.5, 2], opacity: [0.3, 0.1, 0] }}
                transition={{ duration: 0.8 }}
              />
              <Heart className={`${iconSizes[size]} text-red-500 fill-current`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating hearts animation */}
        {showAnimation && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ 
                  scale: 0, 
                  opacity: 1,
                  x: Math.random() * 20 - 10,
                  y: 0
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [1, 0.8, 0],
                  x: Math.random() * 40 - 20,
                  y: -30 - Math.random() * 20
                }}
                transition={{ 
                  duration: 1.2,
                  delay: i * 0.1
                }}
              >
                <Heart className="w-3 h-3 text-red-500 fill-current" />
              </motion.div>
            ))}
          </>
        )}
      </motion.button>

      {showCount && (
        <motion.span
          className={`${textSizes[size]} font-medium ${
            isLiked ? 'text-red-500' : 'text-gray-600'
          }`}
          animate={{ 
            scale: isLiked ? [1, 1.1, 1] : 1,
            color: isLiked ? ['#6b7280', '#ef4444', '#6b7280'] : undefined
          }}
          transition={{ duration: 0.3 }}
        >
          {count}
        </motion.span>
      )}
    </div>
  );
}

// Heart burst animation component for special effects
export function HeartBurst({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                scale: 0,
                rotate: i * 30,
                x: 0,
                y: 0
              }}
              animate={{ 
                scale: [0, 1, 0],
                x: Math.cos((i * 30) * Math.PI / 180) * 100,
                y: Math.sin((i * 30) * Math.PI / 180) * 100,
                opacity: [1, 0.8, 0]
              }}
              transition={{ 
                duration: 1.5,
                delay: i * 0.05
              }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

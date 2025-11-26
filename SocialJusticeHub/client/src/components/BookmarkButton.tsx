import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface BookmarkButtonProps {
  postId: number;
  initialBookmarked: boolean;
  onBookmark?: (postId: number) => Promise<void>;
  onUnbookmark?: (postId: number) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showToast?: boolean;
}

export default function BookmarkButton({
  postId,
  initialBookmarked,
  onBookmark,
  onUnbookmark,
  size = 'md',
  disabled = false,
  showToast = true
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const { toast } = useToast();

  // Sync with props when they change
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    const previousBookmarked = isBookmarked;

    // Optimistic update
    setIsBookmarked(!isBookmarked);
    
    if (!isBookmarked) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1000);
    }

    try {
      if (isBookmarked && onUnbookmark) {
        await onUnbookmark(postId);
        if (showToast) {
          toast({
            title: "Bookmark removido",
            description: "El artículo ha sido removido de tus favoritos",
            duration: 3000,
          });
        }
      } else if (!isBookmarked && onBookmark) {
        await onBookmark(postId);
        if (showToast) {
          toast({
            title: "¡Artículo guardado!",
            description: "El artículo ha sido guardado en tus favoritos",
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert optimistic update on error
      setIsBookmarked(previousBookmarked);
      
      if (showToast) {
        toast({
          title: "Error",
          description: "No se pudo guardar el artículo. Inténtalo de nuevo.",
          variant: "destructive",
          duration: 3000,
        });
      }
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

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        relative ${sizeClasses[size]} 
        flex items-center justify-center
        rounded-full transition-all duration-200
        ${isBookmarked 
          ? 'bg-blue-500 text-white' 
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
        animate={isBookmarked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Bookmark 
          className={`${iconSizes[size]} ${isBookmarked ? 'fill-current' : ''}`}
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
            <Bookmark className={`${iconSizes[size]} ${isBookmarked ? 'fill-current' : ''} opacity-30`} />
          </div>
        </motion.div>
      )}

      {/* Bookmark animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 1.3, 1.8], 
              opacity: [1, 0.7, 0],
              rotate: [0, 10, -10, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="absolute inset-0 bg-blue-500 rounded-full"
              animate={{ scale: [0, 1.5, 2], opacity: [0.3, 0.1, 0] }}
              transition={{ duration: 0.6 }}
            />
            <Bookmark className={`${iconSizes[size]} text-blue-500 fill-current`} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle effect */}
      {showAnimation && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ 
                scale: 0, 
                opacity: 1,
                x: Math.random() * 30 - 15,
                y: Math.random() * 30 - 15
              }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [1, 0.8, 0],
                x: Math.random() * 60 - 30,
                y: Math.random() * 60 - 30
              }}
              transition={{ 
                duration: 1,
                delay: i * 0.1
              }}
            >
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [1, 0.8, 0]
                }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          ))}
        </>
      )}
    </motion.button>
  );
}

// Bookmark collection animation for when user reaches milestones
export function BookmarkCollection({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
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
          {/* Main bookmark */}
          <motion.div
            className="absolute"
            initial={{ scale: 0, y: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 1 }}
          >
            <Bookmark className="w-16 h-16 text-blue-500 fill-current" />
          </motion.div>

          {/* Floating bookmarks */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                scale: 0,
                x: Math.cos((i * 45) * Math.PI / 180) * 50,
                y: Math.sin((i * 45) * Math.PI / 180) * 50,
                rotate: i * 45
              }}
              animate={{ 
                scale: [0, 1, 0],
                x: Math.cos((i * 45) * Math.PI / 180) * 100,
                y: Math.sin((i * 45) * Math.PI / 180) * 100,
                opacity: [1, 0.8, 0]
              }}
              transition={{ 
                duration: 1.5,
                delay: i * 0.1
              }}
            >
              <Bookmark className="w-8 h-8 text-blue-400 fill-current" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

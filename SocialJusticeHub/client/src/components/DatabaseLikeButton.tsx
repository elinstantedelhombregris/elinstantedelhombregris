import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DatabaseLikeButtonProps {
  postId: number;
  userId?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  disabled?: boolean;
}

export default function DatabaseLikeButton({
  postId,
  userId,
  size = 'md',
  showCount = true,
  disabled = false
}: DatabaseLikeButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAnimation, setShowAnimation] = useState(false);

  // Fetch like status and count
  const { data: likeStatus } = useQuery({
    queryKey: [`/api/community/${postId}/like-status`],
    queryFn: async () => {
      if (!userId) return { isLiked: false };
      const response = await apiRequest('GET', `/api/community/${postId}/like-status`);
      return response.json();
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });

  const { data: likesCount } = useQuery({
    queryKey: [`/api/community/${postId}/likes`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/community/${postId}/likes`);
      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/community/${postId}/like`);
      return response.json();
    },
    onSuccess: () => {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1000);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/community/${postId}/like-status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/community/${postId}/likes`] });
      queryClient.invalidateQueries({ queryKey: ['/api/community'] });
      
      toast({
        title: "¡Me gusta agregado!",
        description: "Has dado me gusta a esta publicación.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo dar me gusta a la publicación.",
        variant: "destructive",
      });
    }
  });

  // Unlike mutation
  const unlikeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/community/${postId}/like`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/community/${postId}/like-status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/community/${postId}/likes`] });
      queryClient.invalidateQueries({ queryKey: ['/api/community'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo quitar el me gusta de la publicación.",
        variant: "destructive",
      });
    }
  });

  const handleClick = async () => {
    if (disabled || !userId || likeMutation.isPending || unlikeMutation.isPending) return;

    const isCurrentlyLiked = likeStatus?.isLiked || false;

    if (isCurrentlyLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
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

  const isLiked = likeStatus?.isLiked || false;
  const count = likesCount?.count || 0;
  const isLoading = likeMutation.isPending || unlikeMutation.isPending;

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleClick}
        disabled={disabled || !userId || isLoading}
        className={`
          relative ${sizeClasses[size]} 
          flex items-center justify-center
          rounded-full transition-all duration-200
          ${isLiked 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          ${disabled || !userId || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          hover:scale-105 active:scale-95
        `}
        whileHover={{ scale: disabled || !userId || isLoading ? 1 : 1.05 }}
        whileTap={{ scale: disabled || !userId || isLoading ? 1 : 0.95 }}
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
      
      {!userId && (
        <span className={`${textSizes[size]} text-gray-400 italic`}>
          Inicia sesión para dar me gusta
        </span>
      )}
    </div>
  );
}

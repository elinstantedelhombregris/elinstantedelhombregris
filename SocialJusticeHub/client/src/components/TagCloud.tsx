import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, TrendingUp, Hash, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TagData {
  tag: string;
  count: number;
  category?: string;
}

interface TagCloudProps {
  onTagSelect?: (tag: string) => void;
  selectedTags?: string[];
  maxTags?: number;
  minCount?: number;
  showCount?: boolean;
  showTrending?: boolean;
  variant?: 'cloud' | 'list' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function TagCloud({
  onTagSelect,
  selectedTags = [],
  maxTags = 50,
  minCount = 1,
  showCount = true,
  showTrending = true,
  variant = 'cloud',
  size = 'md',
  className = ''
}: TagCloudProps) {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'count' | 'alphabetical' | 'trending'>('count');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/blog/tags/popular?limit=${maxTags}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar tags');
      }
      
      const tagsData = await response.json();
      const filteredTags = tagsData
        .filter((tag: TagData) => tag.count >= minCount)
        .slice(0, maxTags);
      
      setTags(filteredTags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tags');
    } finally {
      setLoading(false);
    }
  };

  const getTagSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-2xl';
    if (ratio > 0.6) return 'text-xl';
    if (ratio > 0.4) return 'text-lg';
    if (ratio > 0.2) return 'text-base';
    return 'text-sm';
  };

  const getTagColor = (tag: TagData, index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'bg-green-100 text-green-800 hover:bg-green-200',
      'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'bg-orange-100 text-orange-800 hover:bg-orange-200',
      'bg-pink-100 text-pink-800 hover:bg-pink-200',
      'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      'bg-teal-100 text-teal-800 hover:bg-teal-200',
      'bg-red-100 text-red-800 hover:bg-red-200',
    ];
    return colors[index % colors.length];
  };

  const sortedTags = [...tags].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.tag.localeCompare(b.tag);
      case 'count':
        return b.count - a.count;
      case 'trending':
        // Mock trending logic - in real app this would come from API
        return Math.random() - 0.5;
      default:
        return b.count - a.count;
    }
  });

  const maxCount = Math.max(...tags.map(tag => tag.count));

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Tags Populares
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded-full animate-pulse w-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Tags Populares
          </h3>
        </div>
        
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTags}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Tags Populares
          </h3>
        </div>
        
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">No hay tags disponibles</p>
        </div>
      </div>
    );
  }

  const renderCloud = () => (
    <div className="flex flex-wrap gap-2 justify-center">
      <AnimatePresence>
        {sortedTags.map((tag, index) => {
          const isSelected = selectedTags.includes(tag.tag);
          const tagSize = variant === 'cloud' ? getTagSize(tag.count, maxCount) : sizeClasses[size];
          const tagColor = getTagColor(tag, index);
          
          return (
            <motion.button
              key={tag.tag}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTagSelect?.(tag.tag)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full transition-all duration-200 cursor-pointer',
                tagSize,
                isSelected 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : tagColor,
                variant === 'cloud' && 'font-medium'
              )}
            >
              <Hash className="w-3 h-3" />
              <span>{tag.tag}</span>
              {showCount && (
                <Badge 
                  variant={isSelected ? 'secondary' : 'outline'} 
                  className="ml-1 text-xs"
                >
                  {tag.count}
                </Badge>
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderList = () => (
    <div className="space-y-2">
      {sortedTags.map((tag, index) => {
        const isSelected = selectedTags.includes(tag.tag);
        
        return (
          <motion.button
            key={tag.tag}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ x: 5 }}
            onClick={() => onTagSelect?.(tag.tag)}
            className={cn(
              'flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200',
              isSelected 
                ? 'bg-blue-50 border border-blue-200' 
                : 'bg-gray-50 hover:bg-gray-100'
            )}
          >
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className={cn(
                'font-medium',
                isSelected ? 'text-blue-800' : 'text-gray-800'
              )}>
                {tag.tag}
              </span>
            </div>
            {showCount && (
              <Badge variant="secondary" className="text-xs">
                {tag.count}
              </Badge>
            )}
          </motion.button>
        );
      })}
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {sortedTags.map((tag, index) => {
        const isSelected = selectedTags.includes(tag.tag);
        
        return (
          <motion.button
            key={tag.tag}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTagSelect?.(tag.tag)}
            className={cn(
              'p-3 rounded-lg transition-all duration-200 text-center',
              isSelected 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            )}
          >
            <div className="font-medium text-sm">{tag.tag}</div>
            {showCount && (
              <div className="text-xs opacity-75 mt-1">{tag.count}</div>
            )}
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Hash className="w-5 h-5" />
          {showTrending ? 'Tags Populares' : 'Tags'}
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Sort options */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={sortBy === 'count' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('count')}
              className="h-7 px-2 text-xs"
            >
              Popular
            </Button>
            <Button
              variant={sortBy === 'alphabetical' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('alphabetical')}
              className="h-7 px-2 text-xs"
            >
              A-Z
            </Button>
            {showTrending && (
              <Button
                variant={sortBy === 'trending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('trending')}
                className="h-7 px-2 text-xs"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Trend
              </Button>
            )}
          </div>
          
          {/* Clear selected tags */}
          {selectedTags.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedTags.forEach(tag => onTagSelect?.(tag))}
              className="h-7 px-2 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <p className="text-sm text-gray-600">Tags seleccionados:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                onClick={() => onTagSelect?.(tag)}
              >
                {tag}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tag display */}
      <div className="min-h-[100px]">
        {variant === 'cloud' && renderCloud()}
        {variant === 'list' && renderList()}
        {variant === 'grid' && renderGrid()}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
        <span>{tags.length} tags disponibles</span>
        <span>Total: {tags.reduce((sum, tag) => sum + tag.count, 0)} posts</span>
      </div>
    </div>
  );
}

// Compact version for sidebar
export function TagCloudCompact({
  onTagSelect,
  selectedTags = [],
  maxTags = 20,
  className = ''
}: Omit<TagCloudProps, 'variant' | 'size' | 'showTrending'>) {
  return (
    <TagCloud
      onTagSelect={onTagSelect}
      selectedTags={selectedTags}
      maxTags={maxTags}
      variant="list"
      size="sm"
      showCount={false}
      showTrending={false}
      className={className}
    />
  );
}

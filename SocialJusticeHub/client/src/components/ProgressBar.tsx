import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning';
  className?: string;
}

const ProgressBar = ({ 
  progress, 
  showLabel = true, 
  size = 'md',
  variant = 'default',
  className 
}: ProgressBarProps) => {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const fillColors = {
    default: 'bg-accent',
    success: 'bg-secondary',
    warning: 'bg-destructive'
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-foreground/60 mb-1">
          <span>Progreso</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", heightClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            fillColors[variant]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

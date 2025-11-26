import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BookOpen } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface CourseProgressProps {
  progress: number;
  completedLessons: number;
  totalLessons: number;
  nextLesson?: {
    id: number;
    title: string;
  };
  estimatedTimeRemaining?: number; // in minutes
}

const CourseProgress = ({ 
  progress, 
  completedLessons, 
  totalLessons,
  nextLesson,
  estimatedTimeRemaining 
}: CourseProgressProps) => {
  return (
    <Card className="rounded-3xl border border-border/60 bg-white/90">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Tu Progreso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressBar progress={progress} />

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground/60">
              <BookOpen className="w-4 h-4" />
              <span>Lecciones completadas</span>
            </div>
            <span className="font-medium">
              {completedLessons} / {totalLessons}
            </span>
          </div>

          {estimatedTimeRemaining && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground/60">
                <Clock className="w-4 h-4" />
                <span>Tiempo estimado restante</span>
              </div>
              <span className="font-medium">
                {estimatedTimeRemaining} min
              </span>
            </div>
          )}

          {nextLesson && (
            <div className="pt-3 border-t border-border/50">
              <div className="text-sm text-foreground/60 mb-1">Próxima lección:</div>
              <div className="font-medium text-accent">{nextLesson.title}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseProgress;


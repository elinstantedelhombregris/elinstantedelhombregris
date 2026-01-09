import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Video, 
  Activity, 
  File,
  CheckCircle2,
  Lock,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lesson {
  id: number;
  title: string;
  description?: string;
  type: 'text' | 'video' | 'interactive' | 'document';
  duration?: number;
  orderIndex: number;
  isRequired: boolean;
}

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  order: number;
  courseSlug: string;
}

const LessonCard = ({ lesson, isCompleted, isCurrent, isLocked, order, courseSlug }: LessonCardProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'interactive': return <Activity className="w-5 h-5" />;
      case 'document': return <File className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const content = (
    <Card 
      className={cn(
        "rounded-2xl border border-border/60 bg-white/90 transition-all",
        isLocked ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_20px_50px_rgba(17,24,39,0.08)] cursor-pointer",
        isCurrent && "border-accent/50 shadow-[0_20px_45px_rgba(125,91,222,0.2)]"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Order Number */}
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border border-border/60 bg-white text-foreground",
              isCurrent && "border-accent/60 text-accent",
              isCompleted && "bg-secondary/20 text-secondary border-secondary/30"
            )}
          >
            {order}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full border border-border/40 bg-white text-foreground">
                  {getTypeIcon(lesson.type)}
                </div>
                <h3 className="font-semibold text-slate-900 line-clamp-2">
                  {lesson.title}
                </h3>
              </div>
              {isCompleted && (
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
              )}
              {isLocked && (
                <Lock className="w-5 h-5 text-foreground/30 flex-shrink-0" />
              )}
            </div>

            {lesson.description && (
              <p className="text-sm text-slate-700 line-clamp-2 mb-2">
                {lesson.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-600">
              <Badge variant="outline" className="border border-border/50 text-xs tracking-[0.2em] uppercase text-slate-700">
                {lesson.type === 'text' ? 'Texto' :
                 lesson.type === 'video' ? 'Video' :
                 lesson.type === 'interactive' ? 'Interactivo' :
                 'Documento'}
              </Badge>
              {lesson.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration} min</span>
                </div>
              )}
              {lesson.isRequired && (
                <Badge variant="outline" className="text-xs border border-accent/40 text-accent">
                  Requerida
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLocked) {
    return content;
  }

  return (
    <Link href={`/recursos/guias-estudio/${courseSlug}/leccion/${lesson.id}`}>
      {content}
    </Link>
  );
};

export default LessonCard;


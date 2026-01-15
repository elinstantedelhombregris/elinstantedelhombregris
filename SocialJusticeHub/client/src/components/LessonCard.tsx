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
        "rounded-2xl border border-slate-200 bg-white transition-all shadow-sm",
        isLocked ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg cursor-pointer",
        isCurrent && "border-blue-500 shadow-md"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Order Number */}
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border bg-white",
              isCurrent && "border-blue-500 text-blue-700 bg-blue-50",
              isCompleted && "bg-emerald-50 text-emerald-700 border-emerald-300",
              !isCurrent && !isCompleted && "border-slate-300 text-slate-700"
            )}
          >
            {order}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-full border bg-white",
                  isCurrent ? "border-blue-300 text-blue-600" : "border-slate-300 text-slate-600"
                )}>
                  {getTypeIcon(lesson.type)}
                </div>
                <h3 className={cn(
                  "font-semibold line-clamp-2",
                  isCurrent ? "text-blue-900" : isCompleted ? "text-emerald-900" : "text-slate-900"
                )}>
                  {lesson.title}
                </h3>
              </div>
              {isCompleted && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              {isLocked && (
                <Lock className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
            </div>

            {lesson.description && (
              <p className="text-sm text-slate-700 line-clamp-2 mb-2">
                {lesson.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-600">
              <Badge variant="outline" className="border border-slate-300 text-xs tracking-[0.2em] uppercase text-slate-700 bg-white">
                {lesson.type === 'text' ? 'Texto' :
                 lesson.type === 'video' ? 'Video' :
                 lesson.type === 'interactive' ? 'Interactivo' :
                 'Documento'}
              </Badge>
              {lesson.duration && (
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration} min</span>
                </div>
              )}
              {lesson.isRequired && (
                <Badge variant="outline" className="text-xs border border-blue-400 text-blue-700 bg-blue-50">
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


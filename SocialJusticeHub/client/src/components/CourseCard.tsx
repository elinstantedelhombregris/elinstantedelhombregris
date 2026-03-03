import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  GraduationCap,
  CheckCircle2,
  PlayCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { getCategoryLabel, getLevelLabel } from '@/lib/course-utils';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt?: string;
  category: string;
  level: string;
  duration?: number;
  thumbnailUrl?: string;
  viewCount: number;
  isFeatured: boolean;
}

interface CourseCardProps {
  course: Course;
  userProgress?: {
    status: string;
    progress: number;
  } | null;
}

const CourseCard = ({ course, userProgress }: CourseCardProps) => {
  const isCompleted = userProgress?.status === 'completed';
  const isInProgress = userProgress?.status === 'in_progress';
  const progress = userProgress?.progress || 0;

  return (
    <Link href={`/recursos/guias-estudio/${course.slug}`}>
      <Card className="h-full rounded-3xl border border-border/70 bg-white/90 shadow-[0_25px_60px_rgba(15,23,42,0.08)] transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:border-primary/40">
        {/* Thumbnail */}
        {course.thumbnailUrl ? (
          <div className="relative h-48 overflow-hidden rounded-t-3xl">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f18]/80 via-[#0b0f18]/10 to-transparent" />
            {isCompleted && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/90 text-secondary border border-white/80">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completado
                </Badge>
              </div>
            )}
            {isInProgress && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/85 text-primary border border-white/70">
                  <PlayCircle className="w-3 h-3 mr-1" />
                  En progreso
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-[#111423] via-[#1c1f2d] to-[#2f2050] rounded-t-3xl flex items-center justify-center">
            <GraduationCap className="w-16 h-16 text-white opacity-80" />
            {isCompleted && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/90 text-secondary border border-white/80">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completado
                </Badge>
              </div>
            )}
            {isInProgress && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/85 text-primary border border-white/70">
                  <PlayCircle className="w-3 h-3 mr-1" />
                  En progreso
                </Badge>
              </div>
            )}
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-accent/10 text-accent border border-accent/25 tracking-[0.2em] uppercase text-[10px]">
                {getCategoryLabel(course.category)}
              </Badge>
              <Badge className="bg-white/80 text-foreground/60 border border-border/60 tracking-[0.15em] uppercase text-[10px]">
                {getLevelLabel(course.level)}
              </Badge>
            </div>
            {course.isFeatured && (
              <Badge variant="outline" className="border-accent/40 text-accent">
                Destacado
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground line-clamp-2">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2 mt-3 text-foreground/70">
            {course.excerpt || course.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          {isInProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-foreground/60 mb-2">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-foreground/60 mb-4">
            <div className="flex items-center gap-4">
              {course.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration} min</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.viewCount} vistas</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button className="w-full">
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Ver Curso
              </>
            ) : isInProgress ? (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Continuar
              </>
            ) : (
              <>
                Comenzar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;


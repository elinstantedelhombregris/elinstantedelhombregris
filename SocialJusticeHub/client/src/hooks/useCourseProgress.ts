import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const useCourseProgress = (courseId?: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get course progress
  const { data: progress, isLoading } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!courseId,
  });

  // Start course mutation
  const startCourse = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/courses/${courseId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Error al iniciar el curso');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      toast({
        title: 'Curso iniciado',
        description: 'Puedes comenzar a estudiar ahora',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el curso',
        variant: 'destructive'
      });
    }
  });

  // Complete lesson mutation
  const completeLesson = useMutation({
    mutationFn: async ({ courseId, lessonId }: { courseId: number; lessonId: number }) => {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Error al completar la lección');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
      toast({
        title: 'Lección completada',
        description: data.courseCompleted 
          ? '¡Felicidades! Has completado el curso'
          : 'Continúa con la siguiente lección',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo completar la lección',
        variant: 'destructive'
      });
    }
  });

  // Update time spent mutation
  const updateTime = useMutation({
    mutationFn: async ({ courseId, lessonId, timeSpent }: { courseId: number; lessonId: number; timeSpent: number }) => {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/track-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ timeSpent })
      });
      if (!response.ok) throw new Error('Error al actualizar tiempo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
    }
  });

  return {
    progress: progress?.progress,
    isLoading,
    startCourse: startCourse.mutate,
    completeLesson: completeLesson.mutate,
    updateTime: updateTime.mutate,
    isStarting: startCourse.isPending,
    isCompleting: completeLesson.isPending,
  };
};


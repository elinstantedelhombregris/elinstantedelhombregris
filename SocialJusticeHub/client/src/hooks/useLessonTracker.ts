import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface UseLessonTrackerProps {
  userId: number | undefined;
  courseId: number | undefined;
  lessonId: number | undefined;
  enabled?: boolean;
}

export const useLessonTracker = ({ 
  userId, 
  courseId, 
  lessonId, 
  enabled = true 
}: UseLessonTrackerProps) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const timeSpentRef = useRef(0);

  const updateTimeMutation = useMutation({
    mutationFn: async (seconds: number) => {
      if (!courseId || !lessonId) return;
      const response = await apiRequest(
        'POST',
        `/api/courses/${courseId}/lessons/${lessonId}/track-time`,
        { timeSpent: seconds },
      );
      if (!response.ok) throw new Error('Error al actualizar tiempo');
      return response.json();
    }
  });

  useEffect(() => {
    if (!enabled || !userId || !courseId || !lessonId) return;

    startTimeRef.current = new Date();

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor(
          (new Date().getTime() - startTimeRef.current.getTime()) / 1000
        );
        setTimeSpent(elapsed);
        timeSpentRef.current = elapsed;

        // Update every 30 seconds
        if (elapsed % 30 === 0 && elapsed > 0) {
          updateTimeMutation.mutate(elapsed);
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, userId, courseId, lessonId]);

  // Save time when component unmounts
  useEffect(() => {
    return () => {
      if (timeSpentRef.current > 0 && courseId && lessonId) {
        // Use sendBeacon for reliable delivery on page unload
        const token = localStorage.getItem('authToken');
        navigator.sendBeacon(
          `/api/courses/${courseId}/lessons/${lessonId}/track-time`,
          new Blob(
            [JSON.stringify({ timeSpent: timeSpentRef.current })],
            { type: 'application/json' }
          )
        );
      }
    };
  }, [courseId, lessonId]);

  return {
    timeSpent,
    formattedTime: formatTime(timeSpent)
  };
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

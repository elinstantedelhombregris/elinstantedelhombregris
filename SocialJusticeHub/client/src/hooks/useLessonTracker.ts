import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

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

  const updateTimeMutation = useMutation({
    mutationFn: async (seconds: number) => {
      if (!courseId || !lessonId) return;
      const response = await fetch(
        `/api/courses/${courseId}/lessons/${lessonId}/track-time`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ timeSpent: seconds })
        }
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
      if (timeSpent > 0 && courseId && lessonId) {
        updateTimeMutation.mutate(timeSpent);
      }
    };
  }, []);

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


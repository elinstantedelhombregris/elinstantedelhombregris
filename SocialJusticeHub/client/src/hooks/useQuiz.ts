import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export const useQuiz = (courseId: number, quizId: number) => {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, any>>({});

  // Start quiz attempt
  const startAttempt = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/courses/${courseId}/quiz/attempt`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al iniciar el quiz');
      }
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Submit quiz
  const submitAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Finish quiz attempt
  const finishAttempt = useMutation({
    mutationFn: async (attemptId: number) => {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer
      }));

      const response = await apiRequest(
        'POST',
        `/api/courses/${courseId}/quiz/attempt/${attemptId}/submit`,
        { answers: answersArray },
      );
      if (!response.ok) throw new Error('Error al enviar el quiz');
      return response.json();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el quiz',
        variant: 'destructive'
      });
    }
  });

  return {
    answers,
    submitAnswer,
    startAttempt: startAttempt.mutate,
    finishAttempt: finishAttempt.mutate,
    attemptData: startAttempt.data,
    results: finishAttempt.data,
    isStarting: startAttempt.isPending,
    isSubmitting: finishAttempt.isPending,
    startError: startAttempt.error,
    submitError: finishAttempt.error,
  };
};

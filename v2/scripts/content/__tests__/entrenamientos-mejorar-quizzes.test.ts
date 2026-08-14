import { describe, expect, it } from 'vitest';

import { mejorarQuiz } from '../entrenamientos-mejorar-quizzes';

describe('mejorarQuiz', () => {
  it('convierte las dos plantillas de reconocimiento en preguntas de transferencia', () => {
    const indice = {
      lessons: [
        { title: 'Lección uno', description: 'Resolver una situación concreta.' },
        { title: 'Lección dos', description: 'Contrastar una decisión con evidencia.' },
      ],
    };
    const quiz = {
      questions: [
        {
          question: '¿Cuál es el foco principal de la lección "Lección uno"?',
          type: 'multiple_choice',
          options: ['a'],
          correctAnswer: 0,
          explanation: 'vieja',
          points: 1,
          orderIndex: 1,
        },
        {
          question: '¿Cuál es la idea central de la lección "Lección dos"?',
          type: 'multiple_choice',
          options: ['b'],
          correctAnswer: 0,
          explanation: 'vieja',
          points: 1,
          orderIndex: 2,
        },
      ],
    };

    expect(mejorarQuiz(indice, quiz)).toBe(2);
    expect(quiz.questions[0]?.question).toContain('transferir «Lección uno»');
    expect(quiz.questions[1]?.question).toContain('transferir «Lección dos»');
    expect(quiz.questions[0]?.options).toHaveLength(4);
    expect(quiz.questions[1]?.correctAnswer).toBe(1);
  });

  it('es idempotente', () => {
    const indice = { lessons: [{ title: 'Lección uno', description: 'Aplicar algo.' }] };
    const quiz = {
      questions: [
        {
          question: '¿Cuál es la idea central de la lección "Lección uno"?',
          type: 'multiple_choice',
          options: ['a'],
          correctAnswer: 0,
          explanation: 'vieja',
          points: 1,
          orderIndex: 1,
        },
      ],
    };

    mejorarQuiz(indice, quiz);
    expect(mejorarQuiz(indice, quiz)).toBe(0);
  });
});

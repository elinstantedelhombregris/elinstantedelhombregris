import { describe, expect, it } from 'vitest';

import {
  courseJsonSchema,
  derivarSlugDeLeccion,
  normalizarPregunta,
  quizJsonSchema,
  type QuizQuestionJson,
} from '../src/content/courses.js';

const cursoBase = {
  slug: 'curso-de-prueba',
  title: 'Curso de prueba',
  description: 'Descripción del curso de prueba.',
  excerpt: 'Excerpt del curso de prueba.',
  category: 'test',
  level: 'advanced' as const,
  duration: 12,
  orderIndex: 1,
  isPublished: true,
  isFeatured: false,
  requiresAuth: false,
  quizFile: 'quiz.json',
  lessons: [
    {
      key: '00-primera-leccion',
      title: 'Primera lección',
      duration: 12,
      orderIndex: 0,
      contentFile: 'lessons/00-primera-leccion.md',
    },
  ],
};

// Cuatro formas reales de pregunta, copiadas de la tabla de la spec
// («Las formas del quiz.json», 2026-07-24-entrenamientos-papel-y-tinta.md).
const preguntaMcIndice: QuizQuestionJson = {
  question: '¿De qué verbo latino proviene la palabra "acción"?',
  type: 'multiple_choice',
  options: ['Audire (escuchar)', 'Agere (hacer, mover, conducir)', 'Vidēre (ver)', 'Sentire (sentir)'],
  correctAnswer: 1,
  explanation: 'Acción viene de actio, que a su vez viene de agere.',
  points: 2,
  orderIndex: 1,
};

const preguntaMcEtiqueta: QuizQuestionJson = {
  question: 'En la metáfora de Nietzsche, ¿qué representa el Camello?',
  type: 'multiple_choice',
  options: [
    'La rebeldía contra el sistema',
    'La creatividad libre e inocente',
    'El espíritu que carga los pesos y mandatos impuestos diciendo "yo puedo"',
    'La sabiduría del líder experimentado',
  ],
  correctAnswer: 'El espíritu que carga los pesos y mandatos impuestos diciendo "yo puedo"',
  explanation: 'El Camello es la primera transformación.',
  points: 1,
  orderIndex: 1,
};

// Forma real hallada en content/courses/liderazgo-distribuido/quiz.json,
// orderIndex 4: las 4 opciones vienen envueltas en comillas literales pero
// `correctAnswer` repite el mismo texto sin ellas.
const preguntaMcEtiquetaConComillasEnvolventes: QuizQuestionJson = {
  question: 'Usando el método SBI, ¿cuál sería el feedback más efectivo?',
  type: 'multiple_choice',
  options: [
    '"Siempre llegás tarde, sos un irresponsable"',
    '"En las últimas tres reuniones llegaste 30 minutos tarde"',
    '"No pasa nada, cada uno tiene sus tiempos"',
    '"Si no podés llegar a horario, mejor no vengas"',
  ],
  correctAnswer: 'En las últimas tres reuniones llegaste 30 minutos tarde',
  explanation: 'El método SBI describe Situación, Comportamiento e Impacto sin atacar a la persona.',
  points: 1,
  orderIndex: 4,
};

const preguntaTfSinOpciones: QuizQuestionJson = {
  question: 'El "activismo de sofá" genera cambios reales equivalentes a la acción comunitaria.',
  type: 'true_false',
  options: null,
  correctAnswer: false,
  explanation: 'El activismo digital genera la ilusión de acción, pero no cambia nada en el mundo real.',
  points: 1,
  orderIndex: 3,
};

const preguntaTfConOpciones: QuizQuestionJson = {
  question:
    'Según el curso, la transformación del Camello al León al Niño es un proceso lineal donde se abandona cada etapa al pasar a la siguiente.',
  type: 'true_false',
  options: ['Verdadero', 'Falso'],
  correctAnswer: 'Falso',
  explanation: 'La persona madura integra las tres transformaciones simultáneamente.',
  points: 1,
  orderIndex: 2,
};

describe('derivarSlugDeLeccion', () => {
  it('quita el prefijo numérico de la key v1', () => {
    expect(derivarSlugDeLeccion('02-agere-la-etimologia-de-la-accion')).toBe(
      'agere-la-etimologia-de-la-accion',
    );
  });

  it('devuelve la key tal cual cuando no trae prefijo numérico', () => {
    expect(derivarSlugDeLeccion('agere-la-etimologia-de-la-accion')).toBe(
      'agere-la-etimologia-de-la-accion',
    );
  });
});

describe('courseJsonSchema', () => {
  it('acepta un fixture mínimo con level advanced y una lección con orderIndex 0', () => {
    const parsed = courseJsonSchema.safeParse(cursoBase);
    expect(parsed.success).toBe(true);
  });

  it('rechaza un level fuera del enum', () => {
    const parsed = courseJsonSchema.safeParse({ ...cursoBase, level: 'expert' });
    expect(parsed.success).toBe(false);
  });

  it('rechaza duration 0', () => {
    const parsed = courseJsonSchema.safeParse({ ...cursoBase, duration: 0 });
    expect(parsed.success).toBe(false);
  });
});

describe('quizJsonSchema', () => {
  it('acepta las cuatro formas reales de pregunta', () => {
    const parsed = quizJsonSchema.safeParse({
      title: 'Quiz de prueba',
      description: 'Descripción del quiz de prueba.',
      questions: [preguntaMcIndice, preguntaMcEtiqueta, preguntaTfSinOpciones, preguntaTfConOpciones],
    });
    expect(parsed.success).toBe(true);
  });

  it('rechaza un type fuera del enum', () => {
    const parsed = quizJsonSchema.safeParse({
      title: 'Quiz de prueba',
      description: 'Descripción del quiz de prueba.',
      questions: [{ ...preguntaMcIndice, type: 'essay' }],
    });
    expect(parsed.success).toBe(false);
  });
});

describe('normalizarPregunta', () => {
  it('multiple_choice + índice → resuelve directo', () => {
    const r = normalizarPregunta(preguntaMcIndice);
    expect(r).not.toBeNull();
    expect(r?.opciones).toHaveLength(4);
    expect(r?.correcta).toBe(1);
  });

  it('multiple_choice + etiqueta exacta → resuelve el índice por indexOf', () => {
    const r = normalizarPregunta(preguntaMcEtiqueta);
    expect(r).not.toBeNull();
    expect(r?.correcta).toBe(2);
    expect(r?.opciones[2]).toBe(preguntaMcEtiqueta.correctAnswer);
  });

  it('true_false sin options → opciones Verdadero/Falso, correcta según boolean', () => {
    const verdadero = normalizarPregunta({ ...preguntaTfSinOpciones, correctAnswer: true });
    const falso = normalizarPregunta(preguntaTfSinOpciones);
    expect(verdadero?.opciones).toEqual(['Verdadero', 'Falso']);
    expect(verdadero?.correcta).toBe(0);
    expect(falso?.opciones).toEqual(['Verdadero', 'Falso']);
    expect(falso?.correcta).toBe(1);
  });

  it('true_false con options Verdadero/Falso + "Falso" → correcta 1', () => {
    const r = normalizarPregunta(preguntaTfConOpciones);
    expect(r?.opciones).toEqual(['Verdadero', 'Falso']);
    expect(r?.correcta).toBe(1);
  });

  it('multiple_choice + etiqueta envuelta en comillas literales en las opciones → resuelve igual (opciones intactas)', () => {
    const r = normalizarPregunta(preguntaMcEtiquetaConComillasEnvolventes);
    expect(r).not.toBeNull();
    expect(r?.correcta).toBe(1);
    // `opciones` es verbatim: las comillas del archivo no se tocan.
    expect(r?.opciones[1]).toBe(preguntaMcEtiquetaConComillasEnvolventes.options?.[1]);
  });

  it('multiple_choice + etiqueta que no está entre las opciones → null', () => {
    const r = normalizarPregunta({ ...preguntaMcIndice, correctAnswer: 'no está en la lista' });
    expect(r).toBeNull();
  });

  it('multiple_choice + índice fuera de rango → null', () => {
    const r = normalizarPregunta({ ...preguntaMcIndice, correctAnswer: 99 });
    expect(r).toBeNull();
  });

  it('true_false + string que no es Verdadero/Falso → null', () => {
    const r = normalizarPregunta({ ...preguntaTfConOpciones, correctAnswer: 'Tal vez' });
    expect(r).toBeNull();
  });
});

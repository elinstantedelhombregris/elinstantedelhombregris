/**
 * Reemplaza preguntas generadas que sólo pedían reconocer el título de una
 * lección por consignas de transferencia. Es idempotente: sólo toca el patrón
 * editorial antiguo y conserva el resto del banco.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface LeccionIndice {
  title: string;
  description?: string;
}

interface CursoIndice {
  lessons: LeccionIndice[];
}

interface PreguntaQuiz {
  question: string;
  type: string;
  options: string[] | null;
  correctAnswer: number | boolean;
  explanation: string;
  points: number;
  orderIndex: number;
}

interface Quiz {
  questions: PreguntaQuiz[];
}

const PATRON = /^¿Cuál es (?:el foco principal|la idea central) de la lección ["“](.+?)["”]\?$/u;

function capitalInicial(texto: string) {
  return texto.charAt(0).toLocaleUpperCase('es-AR') + texto.slice(1);
}

function opcionesAplicadas(descripcion: string, posicionCorrecta: number) {
  const opciones = [
    `Un caso real trabajado con este foco: ${capitalInicial(descripcion).replace(/[.]+$/, '')}.`,
    'Una repetición de la definición, sin elegir un caso ni tomar una decisión.',
    'Una opinión general que no distingue hechos, supuestos ni evidencia faltante.',
    'Un resumen de otra lección para demostrar que se recorrió el curso completo.',
  ];
  const correcta = opciones.shift();
  if (correcta === undefined) throw new Error('no se pudo construir la opción correcta');
  opciones.splice(posicionCorrecta, 0, correcta);
  return opciones;
}

export function mejorarQuiz(indice: CursoIndice, quiz: Quiz): number {
  let cambios = 0;
  const porTitulo = new Map(indice.lessons.map((leccion) => [leccion.title, leccion] as const));

  quiz.questions = quiz.questions.map((pregunta) => {
    const coincidencia = PATRON.exec(pregunta.question);
    if (coincidencia === null) return pregunta;
    const titulo = coincidencia[1];
    const leccion = titulo === undefined ? undefined : porTitulo.get(titulo);
    if (leccion === undefined)
      throw new Error(`no se encontró la lección usada por el quiz: ${titulo ?? '(sin título)'}`);
    const descripcionLimpia = leccion.description?.trim();
    const descripcion =
      descripcionLimpia === undefined || descripcionLimpia.length === 0
        ? `Aplicar «${leccion.title}» a una decisión`
        : descripcionLimpia;
    const correcta = (Math.max(1, pregunta.orderIndex) - 1) % 4;
    cambios += 1;
    return {
      ...pregunta,
      question: `¿Qué evidencia mostraría mejor que podés transferir «${leccion.title}» a una situación real?`,
      type: 'multiple_choice',
      options: opcionesAplicadas(descripcion, correcta),
      correctAnswer: correcta,
      explanation:
        'Transferir no es reconocer el tema: es aplicarlo a un caso concreto, explicitar una decisión y dejar evidencia que otra persona pueda revisar.',
    };
  });
  return cambios;
}

if (process.argv[1]?.endsWith('entrenamientos-mejorar-quizzes.ts')) {
  const raiz = resolve(process.cwd(), 'content/courses');
  let total = 0;
  for (const entrada of readdirSync(raiz, { withFileTypes: true })) {
    if (!entrada.isDirectory()) continue;
    const cursoDir = join(raiz, entrada.name);
    const indiceRuta = join(cursoDir, 'course.json');
    const quizRuta = join(cursoDir, 'quiz.json');
    const indice = JSON.parse(readFileSync(indiceRuta, 'utf-8')) as CursoIndice;
    const quiz = JSON.parse(readFileSync(quizRuta, 'utf-8')) as Quiz;
    const cambios = mejorarQuiz(indice, quiz);
    if (cambios === 0) continue;
    writeFileSync(quizRuta, `${JSON.stringify(quiz, null, 2)}\n`);
    total += cambios;
    process.stdout.write(`${entrada.name}: ${String(cambios)} preguntas mejoradas\n`);
  }
  process.stdout.write(`total: ${String(total)} preguntas de transferencia\n`);
}

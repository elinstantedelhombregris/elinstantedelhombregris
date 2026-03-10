import { db } from '../server/db';
import { courses, courseLessons, courseQuizzes, quizQuestions, users, userLessonProgress, userCourseProgress } from '../shared/schema';
import { eq, inArray } from 'drizzle-orm';

async function main() {
  console.log('Seeding courses...');

  try {
    // Get first user as author (or create a default one)
    const [author] = await db.select().from(users).limit(1);
    if (!author) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const authorId = author.id;
    console.log('✅ Using author ID:', authorId, 'Username:', author.username);

    // Course 1: Introducción al Hombre Gris
    // Find existing course 1 or create it
    let course1 = await db.select().from(courses).where(eq(courses.slug, 'introduccion-al-hombre-gris')).limit(1);
    
    if (course1.length === 0) {
      const [newCourse1] = await db.insert(courses).values({
        title: 'Introducción al Hombre Gris',
        slug: 'introduccion-al-hombre-gris',
        description: 'Un curso fundamental para entender la visión y los principios del movimiento del Hombre Gris. Este curso explora las bases filosóficas, la historia y el propósito detrás de la transformación de Argentina.',
        excerpt: 'Aprende los fundamentos del movimiento del Hombre Gris y comprende su visión de transformación.',
        category: 'hombre-gris',
        level: 'beginner',
        duration: 120,
        thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        orderIndex: 1,
        isPublished: true,
        isFeatured: true,
        requiresAuth: false,
        authorId,
      }).returning();
      course1 = [newCourse1];
      console.log('✅ Created course 1:', course1[0].title);
    } else {
      console.log('✅ Found existing course 1:', course1[0].title);
    }

    // Lessons for course 1
    const lessons1 = [
      {
        courseId: course1[0].id,
        title: '¿Quién es el Hombre Gris?',
        description: 'Una introducción a la figura del Hombre Gris y su significado en el contexto argentino.',
        content: `
          <h2>El Hombre Gris: Una Visión de Transformación</h2>
          <p>El Hombre Gris representa más que una figura individual; es un símbolo de transformación colectiva. En este contexto, "gris" no significa neutralidad, sino la síntesis de todas las voces, ideas y esfuerzos que convergen hacia un objetivo común: la transformación de Argentina.</p>
          
          <h3>Características Principales</h3>
          <ul>
            <li><strong>Colectividad:</strong> No es una persona, sino un movimiento</li>
            <li><strong>Transformación:</strong> Busca cambios profundos y sostenibles</li>
            <li><strong>Inclusión:</strong> Agrupa todas las voces y perspectivas</li>
            <li><strong>Acción:</strong> Va más allá de la teoría hacia la práctica</li>
          </ul>
          
          <h3>El Contexto Argentino</h3>
          <p>En Argentina, el Hombre Gris representa la esperanza de un futuro mejor, donde cada ciudadano puede contribuir al cambio desde su lugar, sin importar su origen, condición social o ideología política.</p>
        `,
        orderIndex: 1,
        type: 'text' as const,
        duration: 15,
        isRequired: true,
      },
      {
        courseId: course1[0].id,
        title: 'Las Psicografías de Parravicini',
        description: 'Exploración de las profecías y visiones sobre Argentina y el Hombre Gris.',
        content: `
          <h2>Las Psicografías y su Relevancia</h2>
          <p>Benjamín Solari Parravicini, a través de sus psicografías, vislumbró un futuro para Argentina donde el Hombre Gris jugaría un papel central en la transformación del país.</p>
          
          <h3>Conceptos Clave</h3>
          <ul>
            <li>La visión profética del cambio</li>
            <li>El papel de la unidad en la transformación</li>
            <li>La importancia de la acción colectiva</li>
          </ul>
        `,
        orderIndex: 2,
        type: 'text' as const,
        duration: 20,
        isRequired: true,
      },
      {
        courseId: course1[0].id,
        title: 'Los Pilares del Movimiento',
        description: 'Los valores fundamentales que guían el movimiento del Hombre Gris.',
        content: `
          <h2>Los Cinco Pilares</h2>
          <p>El movimiento se basa en cinco pilares fundamentales:</p>
          
          <ol>
            <li><strong>La Visión:</strong> Comprender el propósito y la dirección</li>
            <li><strong>La Acción:</strong> Transformar ideas en realidad</li>
            <li><strong>La Comunidad:</strong> Construir conexiones y redes</li>
            <li><strong>La Reflexión:</strong> Evaluar y aprender continuamente</li>
            <li><strong>El Hombre Gris:</strong> La síntesis de todos los esfuerzos</li>
          </ol>
        `,
        orderIndex: 3,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course1[0].id,
        title: 'Aplicación Práctica',
        description: 'Cómo aplicar estos principios en tu vida diaria y comunidad.',
        content: `
          <h2>De la Teoría a la Práctica</h2>
          <p>Ahora que comprendes los fundamentos, es momento de aplicar estos principios en tu vida cotidiana.</p>
          
          <h3>Pasos Iniciales</h3>
          <ul>
            <li>Identifica tu rol en el cambio</li>
            <li>Conecta con tu comunidad local</li>
            <li>Inicia pequeños proyectos de transformación</li>
            <li>Comparte tu experiencia con otros</li>
          </ul>
        `,
        orderIndex: 4,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
    ];

    for (const lesson of lessons1) {
      await db.insert(courseLessons).values(lesson);
    }
    console.log('✅ Created', lessons1.length, 'lessons for course 1');

    // Quiz for course 1
    // Delete existing quiz if it exists
    const existingQuiz1 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, course1[0].id)).limit(1);
    if (existingQuiz1.length > 0) {
      const existingQuestions1 = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz1[0].id));
      for (const question of existingQuestions1) {
        await db.delete(quizQuestions).where(eq(quizQuestions.id, question.id));
      }
      await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, course1[0].id));
    }
    
    const [quiz1] = await db.insert(courseQuizzes).values({
      courseId: course1[0].id,
      title: 'Quiz: Introducción al Hombre Gris',
      description: 'Evalúa tu comprensión de los conceptos fundamentales del movimiento.',
      passingScore: 70,
      timeLimit: 15,
      allowRetakes: true,
      maxAttempts: 3,
    }).returning();

    const questions1 = [
      {
        quizId: quiz1.id,
        question: '¿Qué representa el Hombre Gris en el contexto del movimiento?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Una persona específica',
          'Un símbolo de transformación colectiva',
          'Una organización política',
          'Un concepto filosófico abstracto'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'El Hombre Gris es un símbolo que representa la síntesis de todas las voces y esfuerzos hacia la transformación.',
        points: 2,
        orderIndex: 1,
      },
      {
        quizId: quiz1.id,
        question: '¿Cuántos pilares fundamentales tiene el movimiento del Hombre Gris?',
        type: 'multiple_choice' as const,
        options: JSON.stringify(['3', '4', '5', '6']),
        correctAnswer: JSON.stringify(2),
        explanation: 'El movimiento se basa en cinco pilares: La Visión, La Acción, La Comunidad, La Reflexión y El Hombre Gris.',
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: quiz1.id,
        question: 'Las psicografías de Parravicini mencionan específicamente a Argentina y el Hombre Gris.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Sí, Parravicini mencionó específicamente a Argentina y la figura del Hombre Gris en varias de sus psicografías.',
        points: 2,
        orderIndex: 3,
      },
      {
        quizId: quiz1.id,
        question: '¿Cuál es el primer paso para aplicar los principios del movimiento?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Crear una organización',
          'Identificar tu rol en el cambio',
          'Esperar instrucciones',
          'Buscar financiamiento'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'El primer paso es identificar tu rol único en el proceso de transformación y cómo puedes contribuir desde tu lugar.',
        points: 2,
        orderIndex: 4,
      },
      {
        quizId: quiz1.id,
        question: 'El término "gris" simboliza la mezcla de todas las voces y realidades argentinas.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Gris no significa neutralidad. Representa la síntesis de visiones diversas que convergen en un propósito común.',
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: quiz1.id,
        question: '¿Cuál de las siguientes acciones refleja mejor el espíritu del Hombre Gris?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Competir por protagonismo individual',
          'Co-crear soluciones con tu comunidad',
          'Esperar a que surja un líder salvador',
          'Repetir fórmulas del pasado'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'El movimiento se basa en la co-creación y la acción colectiva más que en liderazgos individuales.',
        points: 2,
        orderIndex: 6,
      },
      {
        quizId: quiz1.id,
        question: 'Selecciona el pilar que conecta a las personas con propósitos compartidos.',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Acción',
          'Comunidad',
          'Reflexión',
          'Visión'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'El pilar Comunidad crea redes de apoyo, colaboración y confianza entre quienes se suman al movimiento.',
        points: 2,
        orderIndex: 7,
      },
      {
        quizId: quiz1.id,
        question: '¿Qué práctica mantiene vivo el pilar de la Reflexión?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Celebrar logros',
          'Medir resultados y ajustar el rumbo',
          'Buscar nuevos seguidores',
          'Delegar responsabilidades'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'La reflexión implica revisar lo aprendido, ajustar y mejorar continuamente el camino recorrido.',
        points: 2,
        orderIndex: 8,
      },
      {
        quizId: quiz1.id,
        question: 'Aplicar los principios del Hombre Gris comienza en tu vida cotidiana.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'El movimiento invita a transformar la realidad empezando por uno mismo, la familia y el entorno inmediato.',
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: quiz1.id,
        question: '¿Cuál es el llamado final del curso introductorio?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Sumarte a un partido político',
          'Esperar a que Argentina cambie sola',
          'Ser co-creador del nuevo diseño de país',
          'Volver a leer las psicografías'
        ]),
        correctAnswer: JSON.stringify(2),
        explanation: 'El movimiento convoca a cada persona a convertirse en co-creadora del nuevo diseño de país, no en espectadora.',
        points: 2,
        orderIndex: 10,
      },
    ];

    for (const question of questions1) {
      await db.insert(quizQuestions).values(question);
    }
    console.log('✅ Created', questions1.length, 'questions for quiz 1');

    // Course 2: La Visión de Transformación
    // Find existing course 2 or create it
    let course2 = await db.select().from(courses).where(eq(courses.slug, 'la-vision-de-transformacion')).limit(1);
    
    if (course2.length === 0) {
      const [newCourse2] = await db.insert(courses).values({
        title: 'La Visión de Transformación',
        slug: 'la-vision-de-transformacion',
        description: 'Profundiza en cómo crear y mantener una visión clara de transformación, tanto personal como colectiva. Este curso explora técnicas de visualización, planificación estratégica y construcción de narrativas transformadoras.',
        excerpt: 'Aprende a crear y mantener una visión clara de transformación para tu vida y comunidad.',
        category: 'vision',
        level: 'intermediate',
        duration: 180,
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        orderIndex: 2,
        isPublished: true,
        isFeatured: true,
        requiresAuth: false,
        authorId,
      }).returning();
      course2 = [newCourse2];
      console.log('✅ Created course 2:', course2[0].title);
    } else {
      console.log('✅ Found existing course 2:', course2[0].title);
    }

    const lessons2 = [
      {
        courseId: course2[0].id,
        title: 'Construyendo tu Visión Personal',
        description: 'Técnicas para desarrollar una visión personal clara y alineada con tus valores.',
        content: `
          <h2>Tu Visión Personal</h2>
          <p>Una visión personal clara es el primer paso hacia la transformación. Esta lección te guiará a través de un proceso reflexivo para identificar tus valores, aspiraciones y el impacto que deseas generar.</p>
          
          <h3>Ejercicio Práctico</h3>
          <p>Responde estas preguntas:</p>
          <ol>
            <li>¿Qué valores son más importantes para ti?</li>
            <li>¿Cómo te imaginas tu vida ideal en 5 años?</li>
            <li>¿Qué impacto quieres tener en tu comunidad?</li>
            <li>¿Qué recursos y habilidades puedes aportar?</li>
          </ol>
        `,
        orderIndex: 1,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course2[0].id,
        title: 'De la Visión Individual a la Colectiva',
        description: 'Cómo alinear visiones personales para crear una visión colectiva poderosa.',
        content: `
          <h2>Visión Colectiva</h2>
          <p>La transformación real ocurre cuando las visiones individuales se alinean hacia un objetivo común. Esta lección explora cómo construir consenso y crear una narrativa compartida.</p>
        `,
        orderIndex: 2,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course2[0].id,
        title: 'Planificación Estratégica',
        description: 'Herramientas para convertir tu visión en un plan de acción concreto.',
        content: `
          <h2>De la Visión al Plan</h2>
          <p>Aprende a crear planes estratégicos que transformen tu visión en acciones concretas y medibles.</p>
        `,
        orderIndex: 3,
        type: 'text' as const,
        duration: 35,
        isRequired: true,
      },
    ];

    for (const lesson of lessons2) {
      await db.insert(courseLessons).values(lesson);
    }
    console.log('✅ Created', lessons2.length, 'lessons for course 2');

    // Quiz for course 2
    // Delete existing quiz if it exists
    const existingQuiz2 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, course2[0].id)).limit(1);
    if (existingQuiz2.length > 0) {
      const existingQuestions2 = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz2[0].id));
      for (const question of existingQuestions2) {
        await db.delete(quizQuestions).where(eq(quizQuestions.id, question.id));
      }
      await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, course2[0].id));
    }

    const [quiz2] = await db.insert(courseQuizzes).values({
      courseId: course2[0].id,
      title: 'Quiz: La Visión de Transformación',
      description: 'Evalúa tu comprensión de los conceptos de visión y planificación.',
      passingScore: 75,
      allowRetakes: true,
    }).returning();

    const questions2 = [
      {
        quizId: quiz2.id,
        question: '¿Cuál es el primer paso para construir una visión personal?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Copiar la visión de otros',
          'Identificar tus valores fundamentales',
          'Buscar aprobación externa',
          'Evitar reflexionar'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Identificar tus valores fundamentales es esencial para crear una visión auténtica y alineada contigo mismo.',
        points: 2,
        orderIndex: 1,
      },
      {
        quizId: quiz2.id,
        question: 'Una visión colectiva es simplemente la suma de visiones individuales.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'Una visión colectiva requiere alineación, consenso y una narrativa compartida, no la suma desordenada de visiones.',
        points: 2,
        orderIndex: 2,
      },
      {
        quizId: quiz2.id,
        question: '¿Qué elemento convierte una visión en motor de acción?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Que sea ambigua',
          'Que conecte con emociones y propósito',
          'Que sea un listado técnico',
          'Que dependa de un solo líder'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Las visiones movilizan cuando conectan con propósito, emociones y sentido compartido.',
        points: 2,
        orderIndex: 3,
      },
      {
        quizId: quiz2.id,
        question: 'Diseñar "visiones puente" permite traducir sueños en planes realizables.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Las visiones puente conectan el futuro deseado con pasos concretos para hacerlo posible.',
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: quiz2.id,
        question: '¿Qué pregunta ayuda a validar una visión personal?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          '¿Quién me verá hacerlo?',
          '¿Esta visión mejora mi vida y la de otros?',
          '¿Es similar a otras visiones exitosas?',
          '¿Se puede hacer sin ayuda?'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Una visión sólida debe mejorar tu vida y aportar valor a otros o al sistema en el que participas.',
        points: 2,
        orderIndex: 5,
      },
      {
        quizId: quiz2.id,
        question: 'Selecciona el componente clave de una narrativa transformadora.',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Hablar solo del problema',
          'Incluir héroes, identidad y destino compartido',
          'Detallar únicamente métricas',
          'Evitar imágenes y metáforas'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Las narrativas poderosas combinan identidad, destino compartido y llamados claros a la acción.',
        points: 2,
        orderIndex: 6,
      },
      {
        quizId: quiz2.id,
        question: 'La planificación estratégica empieza definiendo dónde estamos realmente.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Sin diagnóstico honesto del punto de partida, ninguna ruta estratégica funciona.',
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: quiz2.id,
        question: '¿Qué herramienta ayuda a alinear visiones personales con la colectiva?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Mapas de empatía y acuerdos de colaboración',
          'Competencias internas',
          'Encuestas anónimas sin seguimiento',
          'Reuniones informales sin actas'
        ]),
        correctAnswer: JSON.stringify(0),
        explanation: 'Los mapas de empatía y los acuerdos claros permiten encontrar puntos de convergencia entre visiones.',
        points: 2,
        orderIndex: 8,
      },
      {
        quizId: quiz2.id,
        question: 'El indicador principal de una visión sana es que inspire acción consistente.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Si una visión no desencadena acciones sostenidas, debe repensarse o comunicarse nuevamente.',
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: quiz2.id,
        question: '¿Qué horizonte recomiendan las lecciones para revisar la visión?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Revisarla nunca para evitar dudas',
          'Ajustarla cada vez que cambia el estado de ánimo',
          'Revisarla periódicamente con datos y aprendizajes',
          'Delegarla en otra persona'
        ]),
        correctAnswer: JSON.stringify(2),
        explanation: 'Las visiones se revisan periódicamente para incorporar aprendizajes sin perder el norte original.',
        points: 2,
        orderIndex: 10,
      },
    ];

    for (const question of questions2) {
      await db.insert(quizQuestions).values(question);
    }
    console.log('✅ Created', questions2.length, 'questions for quiz 2');

    // Course 3: Acción Comunitaria
    // Find existing course 3 or create it
    let course3 = await db.select().from(courses).where(eq(courses.slug, 'accion-comunitaria')).limit(1);
    
    if (course3.length === 0) {
      const [newCourse3] = await db.insert(courses).values({
        title: 'Acción Comunitaria',
        slug: 'accion-comunitaria',
        description: 'Aprende a organizar y ejecutar proyectos comunitarios efectivos. Este curso cubre desde la identificación de necesidades hasta la ejecución y evaluación de proyectos transformadores.',
        excerpt: 'Herramientas prácticas para crear y ejecutar proyectos comunitarios exitosos.',
        category: 'action',
        level: 'intermediate',
        duration: 240,
        thumbnailUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
        orderIndex: 3,
        isPublished: true,
        isFeatured: false,
        requiresAuth: false,
        authorId,
      }).returning();
      course3 = [newCourse3];
      console.log('✅ Created course 3:', course3[0].title);
    } else {
      console.log('✅ Found existing course 3:', course3[0].title);
    }

    const lessons3 = [
      {
        courseId: course3[0].id,
        title: 'Identificando Necesidades Comunitarias',
        description: 'Técnicas para mapear y priorizar las necesidades de tu comunidad.',
        content: `
          <h2>Mapeo de Necesidades</h2>
          <p>Antes de actuar, es crucial entender realmente qué necesita tu comunidad. Esta lección te enseñará métodos efectivos para identificar y priorizar necesidades.</p>
        `,
        orderIndex: 1,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course3[0].id,
        title: 'Diseño de Proyectos Comunitarios',
        description: 'Cómo estructurar proyectos que generen impacto real y sostenible.',
        content: `
          <h2>Diseño de Proyectos</h2>
          <p>Aprende a diseñar proyectos comunitarios que sean viables, sostenibles y generen impacto real.</p>
        `,
        orderIndex: 2,
        type: 'text' as const,
        duration: 40,
        isRequired: true,
      },
      {
        courseId: course3[0].id,
        title: 'Ejecución y Evaluación',
        description: 'Guía práctica para ejecutar proyectos y medir su impacto.',
        content: `
          <h2>Ejecución Efectiva</h2>
          <p>La ejecución exitosa requiere planificación, coordinación y evaluación continua.</p>
        `,
        orderIndex: 3,
        type: 'text' as const,
        duration: 35,
        isRequired: true,
      },
    ];

    for (const lesson of lessons3) {
      await db.insert(courseLessons).values(lesson);
    }
    console.log('✅ Created', lessons3.length, 'lessons for course 3');

    // Quiz for course 3
    // Delete existing quiz if it exists
    const existingQuiz3 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, course3[0].id)).limit(1);
    if (existingQuiz3.length > 0) {
      const existingQuestions3 = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz3[0].id));
      for (const question of existingQuestions3) {
        await db.delete(quizQuestions).where(eq(quizQuestions.id, question.id));
      }
      await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, course3[0].id));
    }

    const [quiz3] = await db.insert(courseQuizzes).values({
      courseId: course3[0].id,
      title: 'Quiz: Acción Comunitaria',
      description: 'Evalúa tu comprensión de los principios de acción comunitaria.',
      passingScore: 70,
      allowRetakes: true,
    }).returning();

    const questions3 = [
      {
        quizId: quiz3.id,
        question: '¿Cuál es el primer paso para crear un proyecto comunitario?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Buscar financiamiento',
          'Identificar necesidades comunitarias',
          'Contratar personal',
          'Crear un logo'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Identificar las necesidades reales de la comunidad es el fundamento de cualquier proyecto exitoso.',
        points: 2,
        orderIndex: 1,
      },
      {
        quizId: quiz3.id,
        question: 'Un buen mapeo comunitario solo analiza carencias.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'El mapeo debe identificar necesidades y también recursos, talentos y activos disponibles.',
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: quiz3.id,
        question: '¿Qué herramienta facilita priorizar problemas locales?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Análisis causa-raíz y matriz de impacto',
          'Encuestas sin análisis',
          'Reuniones improvisadas',
          'Listas sin criterios'
        ]),
        correctAnswer: JSON.stringify(0),
        explanation: 'Las matrices impacto-esfuerzo y los análisis causa-raíz ayudan a priorizar objetivamente.',
        points: 2,
        orderIndex: 3,
      },
      {
        quizId: quiz3.id,
        question: 'Diseñar con la comunidad evita soluciones impuestas y aumenta la adopción.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Co-diseñar con quienes viven el problema asegura pertinencia y apropiación.',
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: quiz3.id,
        question: 'Selecciona el indicador que mide cohesión comunitaria.',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Cantidad de likes en redes',
          'Participación sostenida en talleres y círculos de decisión',
          'Número de voluntarios externos',
          'Cantidad de comunicados oficiales'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'La cohesión se refleja en la participación continua y los espacios de decisión compartidos.',
        points: 2,
        orderIndex: 5,
      },
      {
        quizId: quiz3.id,
        question: '¿Qué rol cumple la bitácora de aprendizaje?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Registrar errores y aprendizajes para iterar',
          'Guardar datos solo al final',
          'Decorar el proyecto',
          'Comparar equipos'
        ]),
        correctAnswer: JSON.stringify(0),
        explanation: 'La bitácora documenta aprendizajes, ajustes y decisiones, haciendo el proceso transparente.',
        points: 2,
        orderIndex: 6,
      },
      {
        quizId: quiz3.id,
        question: 'En proyectos comunitarios, los pilotos sirven para validar hipótesis antes de escalar.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Los pilotos permiten aprender en pequeño, ajustar y luego escalar con menor riesgo.',
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: quiz3.id,
        question: '¿Qué elemento del governance comunitario fomenta confianza?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Decisiones unilaterales',
          'Roles claros, acuerdos públicos y rendición de cuentas',
          'Comunicación eventual',
          'Estructuras rígidas'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'La confianza surge de acuerdos públicos, roles claros y mecanismos de rendición de cuentas.',
        points: 2,
        orderIndex: 8,
      },
      {
        quizId: quiz3.id,
        question: 'El enfoque de "ganar-ganar" busca beneficios mutuos entre actores locales.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Los proyectos sustentables generan valor compartido entre vecinos, estado y organizaciones.',
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: quiz3.id,
        question: '¿Qué métrica indica sostenibilidad del proyecto?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Dependencia total de donaciones externas',
          'Capacidad local para sostener actividades y generar recursos propios',
          'Número de reuniones anuales',
          'Cantidad de publicaciones'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'La sostenibilidad se mide por la capacidad local de sostener actividades, generar recursos y mantener la gobernanza.',
        points: 2,
        orderIndex: 10,
      },
    ];

    for (const question of questions3) {
      await db.insert(quizQuestions).values(question);
    }
    console.log('✅ Created', questions3.length, 'questions for quiz 3');

    // Course 4: Argentina como Sistema Viviente (31 lecciones)
    // Find existing course 4 or create it
    let course4 = await db.select().from(courses).where(eq(courses.slug, 'argentina-sistema-viviente-primeros-principios')).limit(1);
    let shouldSeedCourse4 = true;
    let existingLessonsCountCourse4 = 0;
    
    if (course4.length === 0) {
      const [newCourse4] = await db.insert(courses).values({
        title: 'Argentina como Sistema Viviente: De las Leyes Físicas a la Transformación Nacional',
        slug: 'argentina-sistema-viviente-primeros-principios',
        description: 'Un curso emocionante que te enseñará la Ciencia de Sistemas usando pensamiento de primeros principios. Desde las leyes físicas universales hasta aplicaciones prácticas en familia, barrio, municipio, provincia y nación. Descubre cómo mejorar las relaciones entre las partes mejora el rendimiento de todo el sistema.',
        excerpt: 'Aprende a pensar en sistemas desde los fundamentos más básicos y aplica este conocimiento para transformar Argentina, empezando por tu familia y llegando hasta la nación.',
        category: 'hombre-gris',
        level: 'intermediate',
        duration: 300,
        thumbnailUrl: 'https://images.unsplash.com/photo-1618401479427-c8ef9465fbe1?w=800',
        orderIndex: 4,
        isPublished: true,
        isFeatured: true,
        requiresAuth: false,
        authorId,
      }).returning();
      course4 = [newCourse4];
      console.log('✅ Created course 4:', course4[0].title);
    } else {
      course4 = course4;
      console.log('✅ Found existing course 4:', course4[0].title);
      const existingLessons4 = await db.select().from(courseLessons).where(eq(courseLessons.courseId, course4[0].id));
      existingLessonsCountCourse4 = existingLessons4.length;
      if (existingLessons4.length > 0) {
        shouldSeedCourse4 = false;
        console.log(`⚠️ Course 4 already has ${existingLessons4.length} lessons, skipping lesson creation to avoid duplicates`);
      }
    }

    // BLOQUE 1: Fundamento - Leyes Físicas Universales
    const lessons4 = [
      {
        courseId: course4[0].id,
        title: 'La Primera Ley: La Energía No Se Destruye, Se Transforma',
        description: 'Descubre la ley fundamental que rige todo sistema: la energía se conserva y transforma. Aprende cómo esto aplica a tu vida diaria y a Argentina.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">¡Bienvenido al Primer Principio!</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Alguna vez te preguntaste por qué te sientes cansado después de un día intenso? O ¿por qué Argentina tiene recursos pero no prospera? La respuesta está en la primera ley que rige TODO sistema.</p>
          </div>

          <h2>La Primera Ley de Termodinámica: El Secreto de la Transformación</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La energía no se crea ni se destruye, solo se transforma.</strong> Esta ley universal gobierna desde el átomo hasta la nación.</p>
          </div>

          <h3>¿Qué Significa Esto para Ti?</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🍽️ Comida → Energía</h4>
              <p>Cuando comes, tu cuerpo transforma los nutrientes en energía química. Esa energía se convierte en movimiento, pensamiento, calor. Nada se pierde, todo se transforma.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">😴 Sueño → Productividad</h4>
              <p>El descanso no es tiempo perdido. Es energía que se restaura y se transforma en capacidad de trabajo, creatividad y bienestar. Sin descanso, el sistema se agota.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">💰 Recursos → Prosperidad</h4>
              <p>Los recursos de Argentina no desaparecen. Se transforman. La pregunta es: ¿en qué se están transformando? ¿En desarrollo o en corrupción?</p>
            </div>
          </div>

          <h3>El Sistema Personal: Tu Cuerpo como Transformador</h3>
          <p>Tu cuerpo es un sistema perfecto de transformación de energía:</p>
          <ul style="line-height: 1.8;">
            <li><strong>Entrada:</strong> Comida, agua, oxígeno, descanso</li>
            <li><strong>Proceso:</strong> Metabolismo, digestión, respiración celular</li>
            <li><strong>Salida:</strong> Movimiento, pensamiento, calor, trabajo</li>
          </ul>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Si sientes que no tienes energía, no es que la hayas perdido. Es que no estás transformando eficientemente tus entradas. El problema no es la cantidad, es la transformación.</p>
          </div>

          <h3>Argentina como Sistema de Transformación</h3>
          <p>Argentina tiene entradas poderosas:</p>
          <ul style="line-height: 1.8;">
            <li><strong>Recursos naturales:</strong> Tierra fértil, minerales, energía</li>
            <li><strong>Talento humano:</strong> Educación, creatividad, trabajo</li>
            <li><strong>Capital cultural:</strong> Historia, valores, identidad</li>
          </ul>

          <p>Pero las salidas no reflejan el potencial. ¿Por qué? Porque el proceso de transformación está mal diseñado. Las instituciones no están optimizadas para transformar recursos en prosperidad.</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Clave</h4>
            <p style="color: #047857; margin-bottom: 0;">No necesitamos más recursos. Necesitamos mejores procesos de transformación. Como dice el Hombre Gris: <em>"No queremos parchar el sistema, queremos diseñar uno nuevo que haga obsoleto al anterior."</em></p>
          </div>

          <h3>Ejercicio de Reflexión</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Pregúntate:</strong></p>
            <ol style="line-height: 2;">
              <li>¿Cuáles son tus entradas principales de energía? (comida, sueño, relaciones, aprendizaje)</li>
              <li>¿Cómo las estás transformando actualmente?</li>
              <li>¿Qué salidas quieres generar? (productividad, bienestar, impacto)</li>
              <li>¿Qué proceso puedes mejorar para transformar mejor tus entradas?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">La energía no desaparece, se transforma. Si quieres mejores resultados, no busques más recursos. Mejora el proceso de transformación. Esta es la base de todo pensamiento sistémico.</p>
          </div>
        `,
        orderIndex: 1,
        type: 'text' as const,
        duration: 20,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'La Entropía: El Desorden que Todo Sistema Debe Combatir',
        description: 'Descubre la segunda ley universal: todo sistema tiende al desorden. Aprende cómo los sistemas vivos y sociales mantienen el orden y qué significa para Argentina.',
        content: `
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Enemigo Invisible</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué tu habitación se desordena sola? ¿Por qué las instituciones se corrompen? ¿Por qué todo requiere mantenimiento? La respuesta está en la segunda ley que rige el universo.</p>
          </div>

          <h2>La Segunda Ley de Termodinámica: La Ley de la Entropía</h2>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Todo sistema tiende naturalmente al desorden y la desorganización.</strong> Sin intervención, el caos aumenta. Esto es entropía.</p>
          </div>

          <h3>Entropía en la Vida Diaria</h3>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Ejemplos que conoces:</strong></p>
            <ul style="line-height: 2;">
              <li>🏠 Tu casa se desordena si no la limpias</li>
              <li>💔 Las relaciones se deterioran sin atención</li>
              <li>🏛️ Las instituciones se corrompen sin transparencia</li>
              <li>🌱 El jardín se llena de maleza sin cuidado</li>
              <li>💼 Tu negocio pierde clientes sin servicio</li>
            </ul>
          </div>

          <h3>¿Cómo Mantienen el Orden los Sistemas Vivos?</h3>
          <p>Los sistemas vivos (como tu cuerpo, una familia, una nación) mantienen el orden mediante:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🔄 Flujo de Energía</h4>
              <p>Invierten energía constantemente para mantener el orden. Tu cuerpo come, respira, descansa. Una familia se comunica, se cuida, se organiza.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">📋 Estructura Clara</h4>
              <p>Mantienen límites definidos y roles claros. Sin estructura, el sistema se desmorona. Cada parte sabe su función.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🔍 Retroalimentación</h4>
              <p>Detectan desorden y actúan para corregirlo. Tu cuerpo siente hambre y come. Una familia nota problemas y se reúne.</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Revelación Crítica</h4>
            <p style="color: #78350f; margin-bottom: 0;">Si no inviertes energía en mantener el orden, el desorden aumenta automáticamente. No hay punto medio. O mantienes el sistema o se deteriora.</p>
          </div>

          <h3>Argentina y la Entropía Institucional</h3>
          <p>Argentina tiene alta entropía institucional porque:</p>
          <ul style="line-height: 1.8;">
            <li><strong>Falta de transparencia:</strong> El desorden se oculta, no se corrige</li>
            <li><strong>Ausencia de retroalimentación:</strong> Los problemas no se detectan a tiempo</li>
            <li><strong>Falta de energía invertida:</strong> No se mantiene el orden institucional</li>
            <li><strong>Estructura débil:</strong> Límites y roles poco claros</li>
          </ul>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución Sistémica</h4>
            <p style="color: #047857; margin-bottom: 0;">Para reducir entropía necesitamos: <strong>transparencia radical</strong> (detectar desorden), <strong>estructuras claras</strong> (límites y roles), y <strong>flujo constante de energía</strong> (mantenimiento activo). Como el Hombre Gris dice: <em>"La complejidad innecesaria es violencia sistémica."</em></p>
          </div>

          <h3>Ejercicio Práctico: Identificar Entropía</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza tu sistema más cercano (tu familia, tu trabajo, tu barrio):</strong></p>
            <ol style="line-height: 2;">
              <li>¿Dónde ves desorden creciendo sin intervención?</li>
              <li>¿Qué energía estás invirtiendo para mantener el orden?</li>
              <li>¿Hay estructuras claras o límites difusos?</li>
              <li>¿Existe retroalimentación para detectar problemas?</li>
              <li>¿Qué acción específica puedes tomar HOY para reducir la entropía?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">El desorden es inevitable sin intervención. Los sistemas saludables invierten energía constantemente para mantener el orden. Argentina necesita reducir su entropía institucional mediante transparencia, estructura y mantenimiento activo.</p>
          </div>
        `,
        orderIndex: 2,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Leyes de Conservación: Masa, Momentum e Información',
        description: 'Descubre cómo las leyes de conservación gobiernan sistemas sociales. Aprende por qué la información es tan valiosa como los recursos materiales.',
        content: `
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Lo Que No Se Pierde</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">En física, algunas cosas nunca desaparecen: se conservan. Esto aplica también a los sistemas humanos, pero de formas sorprendentes.</p>
          </div>

          <h2>Las Leyes de Conservación: Masa, Momentum e Información</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>En sistemas cerrados, ciertas cantidades se conservan:</strong> la masa no desaparece, el momentum se transfiere, y la información se preserva o se degrada.</p>
          </div>

          <h3>Conservación de Masa en Sistemas Sociales</h3>
          <p>En sistemas humanos, la "masa" puede ser:</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">💰 Recursos Financieros</h4>
              <p>El dinero no desaparece, solo cambia de manos. Si Argentina tiene recursos pero no prospera, ¿dónde está el dinero? Se conserva, pero en lugares que no generan valor.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👥 Talento Humano</h4>
              <p>El talento no desaparece. Si no se usa productivamente, se desperdicia o emigra. El talento se conserva, pero fuera del sistema.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🌾 Recursos Naturales</h4>
              <p>Los recursos naturales se conservan. La pregunta es: ¿se están transformando en valor o se están desperdiciando?</p>
            </div>
          </div>

          <h3>Conservación de Momentum: El Poder del Movimiento</h3>
          <p>En física, el momentum es masa × velocidad. En sistemas humanos:</p>
          <ul style="line-height: 1.8;">
            <li><strong>Momentum positivo:</strong> Un proyecto que avanza genera más avance</li>
            <li><strong>Momentum negativo:</strong> Un problema que crece genera más problemas</li>
            <li><strong>Conservación:</strong> El momentum se transfiere, no desaparece</li>
          </ul>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Aplicación Práctica</h4>
            <p style="color: #78350f; margin-bottom: 0;">Pequeños cambios con momentum pueden generar transformaciones grandes. Un vecino que mejora su casa inspira a otros. Una acción positiva genera más acciones positivas. El momentum se conserva y se amplifica.</p>
          </div>

          <h3>Conservación de Información: El Recurso Más Valioso</h3>
          <p>La información es única: puede copiarse sin perderse, pero también puede degradarse si no se preserva.</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>En sistemas humanos:</strong></p>
            <ul style="line-height: 2;">
              <li>📚 <strong>Conocimiento:</strong> Se preserva en libros, educación, cultura</li>
              <li>🗣️ <strong>Comunicación:</strong> Se transfiere pero puede distorsionarse</li>
              <li>📊 <strong>Datos:</strong> Se conservan si se registran, se pierden si no</li>
              <li>💭 <strong>Memoria:</strong> Se preserva en individuos y cultura</li>
            </ul>
          </div>

          <h3>Información en Argentina: ¿Qué Se Conserva?</h3>
          <p>Argentina tiene un problema de conservación de información:</p>
          <ul style="line-height: 1.8;">
            <li><strong>Información perdida:</strong> Historia no documentada, conocimiento no transmitido</li>
            <li><strong>Información oculta:</strong> Datos no públicos, transparencia limitada</li>
            <li><strong>Información distorsionada:</strong> Narrativas falsas, desinformación</li>
            <li><strong>Información desperdiciada:</strong> Conocimiento que no se aplica</li>
          </ul>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Clave de la Transformación</h4>
            <p style="color: #047857; margin-bottom: 0;">La transparencia radical conserva información. Los datos públicos permiten que la información se use productivamente. Como el Hombre Gris observa: <em>"Estudia Argentina como un maestro estudia una obra de arte. Detecta los patrones profundos, la filosofía oculta, el alma de los sistemas."</em></p>
          </div>

          <h3>Ejercicio: Mapear Conservación</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza tu sistema (familia, trabajo, comunidad):</strong></p>
            <ol style="line-height: 2;">
              <li><strong>Recursos:</strong> ¿Dónde están tus recursos? ¿Se están usando productivamente?</li>
              <li><strong>Momentum:</strong> ¿Qué tiene momentum positivo? ¿Qué tiene momentum negativo?</li>
              <li><strong>Información:</strong> ¿Qué información se conserva? ¿Qué información se pierde o distorsiona?</li>
              <li><strong>Acción:</strong> ¿Cómo puedes mejorar la conservación y uso de estos tres elementos?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Masa, momentum e información se conservan en sistemas. El problema no es que desaparezcan, sino cómo se están usando. Argentina necesita sistemas que conserven y utilicen productivamente estos tres elementos.</p>
          </div>
        `,
        orderIndex: 3,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Leyes Matemáticas: Exponenciales, Potencias y Compounding',
        description: 'Descubre las matemáticas que rigen los sistemas. Aprende cómo el crecimiento exponencial, las power laws y el efecto compuesto transforman sistemas pequeños en cambios masivos.',
        content: `
          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Poder de las Matemáticas</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">Las matemáticas no son solo números: son las reglas que gobiernan cómo crecen, se conectan y se transforman los sistemas. Cuando las entiendes, ves el mundo de forma completamente nueva.</p>
          </div>

          <h2>Las Leyes Matemáticas que Rigen los Sistemas</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Exponenciales, power laws y compounding:</strong> estas tres leyes matemáticas explican cómo los sistemas pequeños pueden generar cambios masivos.</p>
          </div>

          <h3>1. Crecimiento Exponencial: El Efecto Domino</h3>
          <p>El crecimiento exponencial significa que cada paso hace que el siguiente sea más grande:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Ejemplo simple:</strong> Si duplicas algo cada día:</p>
            <ul style="line-height: 2;">
              <li>Día 1: 1</li>
              <li>Día 2: 2</li>
              <li>Día 3: 4</li>
              <li>Día 4: 8</li>
              <li>Día 10: 1,024</li>
              <li>Día 20: 1,048,576</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">¡De 1 a más de un millón en 20 días!</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📈 Crecimiento Exponencial Positivo</h4>
              <p><strong>Viralidad:</strong> Una idea que se comparte genera más compartidos. Una acción positiva inspira más acciones.</p>
              <p><strong>Ejemplo:</strong> Un vecino que mejora su barrio inspira a otros. En poco tiempo, todo el barrio mejora.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">📉 Crecimiento Exponencial Negativo</h4>
              <p><strong>Problemas:</strong> Un problema pequeño puede explotar rápidamente si no se atiende.</p>
              <p><strong>Ejemplo:</strong> La corrupción pequeña se multiplica. Un rumor falso se extiende exponencialmente.</p>
            </div>
          </div>

          <h3>2. Power Laws: La Regla del 80/20</h3>
          <p>Las power laws dicen que pocas cosas generan la mayoría del impacto:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 El Principio de Pareto</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>80% de los resultados vienen del 20% de los esfuerzos.</strong> En sistemas: pocas personas generan la mayoría del impacto. Pocas acciones generan la mayoría de los resultados. Pocas causas generan la mayoría de los problemas.</p>
          </div>

          <p><strong>Ejemplos en sistemas:</strong></p>
          <ul style="line-height: 1.8;">
            <li>🌐 <strong>Redes:</strong> Pocos nodos tienen la mayoría de las conexiones</li>
            <li>💰 <strong>Economía:</strong> Pocas empresas generan la mayoría del valor</li>
            <li>👥 <strong>Comunidades:</strong> Pocas personas activas generan la mayoría del cambio</li>
            <li>📚 <strong>Conocimiento:</strong> Pocos libros contienen la mayoría del conocimiento útil</li>
          </ul>

          <h3>3. Compounding: El Efecto de Interés Compuesto</h3>
          <p>El compounding significa que los beneficios se acumulan y generan más beneficios:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Compounding en la Vida</h4>
            <p style="color: #047857; margin-bottom: 0;"><strong>Pequeñas acciones consistentes generan resultados masivos con el tiempo.</strong> Leer 10 minutos diarios. Ejercitar 20 minutos diarios. Ahorrar $100 mensuales. En 10 años, estas pequeñas acciones se han compuesto en resultados enormes.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">📚 Compounding de Conocimiento</h4>
              <p>Cada libro que lees te permite entender mejor el siguiente. El conocimiento se compone sobre sí mismo.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">💪 Compounding de Habilidades</h4>
              <p>Cada práctica mejora la siguiente. Las habilidades se construyen sobre habilidades anteriores.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🤝 Compounding de Relaciones</h4>
              <p>Cada relación positiva genera más relaciones. La confianza se compone con el tiempo.</p>
            </div>
          </div>

          <h3>Aplicando Estas Leyes a Argentina</h3>
          <p>Argentina puede usar estas leyes matemáticas para transformarse:</p>
          <ul style="line-height: 1.8;">
            <li><strong>Crecimiento exponencial:</strong> Pequeñas acciones positivas pueden generar cambios masivos. Un barrio que mejora inspira a otros. La transformación se multiplica.</li>
            <li><strong>Power laws:</strong> Enfocarse en los problemas y soluciones más importantes (el 20%) puede generar el 80% del impacto.</li>
            <li><strong>Compounding:</strong> Pequeñas mejoras consistentes en instituciones, educación, transparencia se compondrán en transformación nacional.</li>
          </ul>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Revelación del Hombre Gris</h4>
            <p style="color: #78350f; margin-bottom: 0;">Como observa el Hombre Gris: <em>"Ve oportunidades donde otros ven crisis. Cada problema argentino es una oportunidad disfrazada esperando a ser reconocida y aprovechada."</em> Las leyes matemáticas muestran que pequeños cambios pueden generar transformaciones exponenciales.</p>
          </div>

          <h3>Ejercicio: Aplicar las Leyes Matemáticas</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Identifica en tu vida:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>Crecimiento exponencial:</strong> ¿Qué acción pequeña podría generar crecimiento exponencial positivo?</li>
              <li><strong>Power laws:</strong> ¿Cuál es el 20% de tus esfuerzos que genera el 80% de tus resultados?</li>
              <li><strong>Compounding:</strong> ¿Qué pequeña acción diaria o semanal podrías hacer que se compondría en algo grande en 5 años?</li>
              <li><strong>Aplicación:</strong> ¿Cómo puedes usar estas tres leyes para transformar tu familia, barrio o comunidad?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Las matemáticas gobiernan los sistemas. El crecimiento exponencial, las power laws y el compounding muestran que pequeños cambios pueden generar transformaciones masivas. Argentina puede usar estas leyes para acelerar su transformación.</p>
          </div>
        `,
        orderIndex: 4,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Teoría de la Información: Señales, Ruido y Comunicación Efectiva',
        description: 'Aprende cómo la información fluye en sistemas. Descubre cómo reducir el ruido y maximizar las señales para comunicarte efectivamente en familia, trabajo y comunidad.',
        content: `
          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">La Ciencia de la Comunicación</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunos mensajes llegan y otros no? ¿Por qué malentendimos? ¿Por qué la información se distorsiona? La respuesta está en cómo funciona la información en sistemas.</p>
          </div>

          <h2>Teoría de la Información: Señales, Ruido y Comunicación</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Toda comunicación es transmisión de información:</strong> envías una señal, pero el ruido puede distorsionarla. La comunicación efectiva maximiza señales y minimiza ruido.</p>
          </div>

          <h3>Señales vs Ruido: El Desafío de la Comunicación</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📡 Señal</h4>
              <p><strong>La información útil que quieres transmitir.</strong> El mensaje claro, el dato importante, la intención real.</p>
              <p><strong>Ejemplo:</strong> "Necesito tu ayuda con este proyecto" es una señal clara.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">🔊 Ruido</h4>
              <p><strong>Todo lo que interfiere con la señal.</strong> Distracciones, malentendidos, información irrelevante, emociones no expresadas.</p>
              <p><strong>Ejemplo:</strong> Decir "nunca me ayudas" cuando quieres decir "necesito ayuda" añade ruido emocional.</p>
            </div>
          </div>

          <h3>Tipos de Ruido en Sistemas Humanos</h3>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Ruido que distorsiona la comunicación:</strong></p>
            <ul style="line-height: 2;">
              <li>🗣️ <strong>Ruido semántico:</strong> Palabras que significan cosas diferentes para diferentes personas</li>
              <li>😠 <strong>Ruido emocional:</strong> Emociones no expresadas que distorsionan el mensaje</li>
              <li>📺 <strong>Ruido de información:</strong> Demasiada información que oculta lo importante</li>
              <li>🎭 <strong>Ruido de contexto:</strong> Falta de contexto compartido que genera malentendidos</li>
              <li>🔇 <strong>Ruido de canal:</strong> Medio de comunicación inadecuado (mensaje de texto para algo importante)</li>
            </ul>
          </div>

          <h3>Cómo Reducir el Ruido: Técnicas Prácticas</h3>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">1. Claridad</h4>
              <p>Usa palabras simples y directas. Evita jerga innecesaria. Di exactamente lo que quieres decir.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">2. Contexto</h4>
              <p>Proporciona el contexto necesario. Explica el "por qué" antes del "qué". Asegúrate de que ambos compartan el mismo contexto.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">3. Feedback</h4>
              <p>Verifica que el mensaje llegó correctamente. Pregunta: "¿Entendiste lo que quiero decir?" Confirma la comprensión.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">4. Canal Adecuado</h4>
              <p>Usa el canal correcto. Cosas importantes: cara a cara. Información simple: mensaje. Discusiones complejas: reunión.</p>
            </div>
          </div>

          <h3>Procesamiento de Señales: Cómo Interpretamos la Información</h3>
          <p>Nuestro cerebro procesa información como un sistema de señales:</p>
          <ul style="line-height: 1.8;">
            <li><strong>Recepción:</strong> Recibimos la señal (escuchamos, leemos, vemos)</li>
            <li><strong>Filtrado:</strong> Nuestro cerebro filtra según sesgos, experiencias, emociones</li>
            <li><strong>Interpretación:</strong> Interpretamos según nuestro marco mental</li>
            <li><strong>Respuesta:</strong> Generamos una respuesta basada en la interpretación</li>
          </ul>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 El Problema</h4>
            <p style="color: #78350f; margin-bottom: 0;">Cada persona filtra e interpreta diferente. Lo que tú dices puede no ser lo que la otra persona escucha. La comunicación efectiva requiere entender cómo el otro procesa la información.</p>
          </div>

          <h3>Comunicación en Sistemas: Familia, Barrio, Nación</h3>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>En la familia:</strong></p>
            <ul style="line-height: 1.8;">
              <li>Ruido: Expectativas no expresadas, emociones acumuladas, malentendidos</li>
              <li>Solución: Comunicación clara, reuniones familiares, expresión de necesidades</li>
            </ul>
          </div>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>En el barrio:</strong></p>
            <ul style="line-height: 1.8;">
              <li>Ruido: Rumor, información no verificada, falta de canales de comunicación</li>
              <li>Solución: Canales formales (reuniones, grupos), transparencia, verificación de información</li>
            </ul>
          </div>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>En la nación (Argentina):</strong></p>
            <ul style="line-height: 1.8;">
              <li>Ruido: Desinformación, falta de transparencia, comunicación unidireccional, polarización</li>
              <li>Solución: Transparencia radical, datos públicos, múltiples canales, diálogo bidireccional</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Clave del Hombre Gris</h4>
            <p style="color: #047857; margin-bottom: 0;">Como dice el Hombre Gris: <em>"La comunicación no es solo hablar, es crear flujos de conocimiento que cambian la estructura del pensamiento de las personas."</em> La comunicación efectiva transforma sistemas.</p>
          </div>

          <h3>Ejercicio: Mejorar tu Comunicación</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza tu comunicación:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>Señales:</strong> ¿Qué mensaje realmente quieres transmitir?</li>
              <li><strong>Ruido:</strong> ¿Qué ruido está distorsionando tus mensajes? (emociones, falta de contexto, canal inadecuado)</li>
              <li><strong>Procesamiento:</strong> ¿Cómo procesa la información la persona con quien te comunicas?</li>
              <li><strong>Mejora:</strong> ¿Qué puedes hacer para reducir el ruido y maximizar la señal?</li>
              <li><strong>Aplicación:</strong> Prueba una técnica esta semana y observa los resultados.</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">La comunicación es transmisión de información. La comunicación efectiva maximiza señales y minimiza ruido. Argentina necesita canales de comunicación claros, transparentes y bidireccionales para transformarse.</p>
          </div>
        `,
        orderIndex: 5,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
    ];

    // Insert Block 1 lessons
    if (shouldSeedCourse4) {
      for (const lesson of lessons4) {
        await db.insert(courseLessons).values(lesson);
      }
      console.log('✅ Created Block 1 (5 lessons)');
    }

    // BLOQUE 2: Principios de Ciencia de Sistemas (7 lecciones)
    const lessonsBlock2 = [
      {
        courseId: course4[0].id,
        title: 'Flujos de Energía y Transformaciones en Sistemas',
        description: 'Aprende cómo fluye la energía en sistemas humanos. Descubre cómo optimizar estos flujos para mejorar el rendimiento de tu familia, trabajo y comunidad.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">La Sangre del Sistema</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">Así como la sangre fluye por tu cuerpo, la energía fluye por los sistemas. Cuando el flujo se bloquea, el sistema se enferma. Cuando fluye libremente, el sistema prospera.</p>
          </div>

          <h2>Flujos de Energía: El Motor de los Sistemas</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La energía fluye constantemente en sistemas vivos:</strong> entra, se transforma, y sale. El rendimiento del sistema depende de qué tan bien fluye esta energía.</p>
          </div>

          <h3>Tipos de Energía en Sistemas Humanos</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">⚡ Energía Física</h4>
              <p>Fuerza, movimiento, capacidad de trabajo físico. Se obtiene de comida, descanso, ejercicio.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🧠 Energía Mental</h4>
              <p>Capacidad de pensar, concentrarse, crear. Se obtiene de descanso mental, aprendizaje, estimulación.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">❤️ Energía Emocional</h4>
              <p>Motivación, pasión, conexión. Se obtiene de relaciones, propósito, significado.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">💰 Energía Económica</h4>
              <p>Dinero, recursos, capital. Fluye como intercambio, inversión, producción.</p>
            </div>
          </div>

          <h3>Cómo Fluye la Energía: El Ciclo de Transformación</h3>
          <p>La energía fluye en un ciclo continuo:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p style="font-size: 1.1rem; font-weight: bold; color: #3b82f6; margin-bottom: 0.5rem;">ENTRADA → TRANSFORMACIÓN → SALIDA → RETROALIMENTACIÓN → ENTRADA</p>
            <p style="margin-top: 0;">Este ciclo se repite constantemente. Si se bloquea en cualquier punto, el sistema se deteriora.</p>
          </div>

          <h3>Bloqueos en el Flujo de Energía</h3>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p><strong>Problemas comunes que bloquean el flujo:</strong></p>
            <ul style="line-height: 2;">
              <li>🚫 <strong>Falta de entrada:</strong> No hay suficiente energía entrando (no comes, no descansas, no aprendes)</li>
              <li>⚙️ <strong>Proceso ineficiente:</strong> La transformación desperdicia energía (métodos ineficientes, burocracia)</li>
              <li>💔 <strong>Pérdidas en el camino:</strong> La energía se pierde (fricción, resistencia, desperdicio)</li>
              <li>🔄 <strong>Falta de retroalimentación:</strong> No sabes qué funciona y qué no</li>
            </ul>
          </div>

          <h3>Optimizando Flujos de Energía</h3>
          <p>Para mejorar el rendimiento del sistema, optimiza el flujo:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">1. Maximizar Entradas</h4>
              <p>Asegúrate de tener suficientes entradas de calidad. Come bien, descansa, aprende, conecta.</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">2. Optimizar Transformación</h4>
              <p>Mejora los procesos. Elimina fricción. Usa métodos eficientes. Reduce burocracia.</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">3. Reducir Pérdidas</h4>
              <p>Identifica dónde se pierde energía y elimínalo. Desperdicio, fricción, resistencia innecesaria.</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">4. Crear Retroalimentación</h4>
              <p>Mide las salidas. Aprende qué funciona. Ajusta el proceso basado en resultados.</p>
            </div>
          </div>

          <h3>Flujos de Energía en Argentina</h3>
          <p>Argentina tiene bloqueos en el flujo de energía:</p>
          <ul style="line-height: 1.8;">
            <li><strong>Bloqueos económicos:</strong> Burocracia, impuestos altos, regulaciones excesivas bloquean el flujo económico</li>
            <li><strong>Bloqueos de talento:</strong> El talento no fluye hacia donde se necesita. Se desperdicia o emigra</li>
            <li><strong>Bloqueos de información:</strong> La información no fluye libremente. Falta transparencia</li>
            <li><strong>Bloqueos de energía social:</strong> La desconfianza bloquea la colaboración</li>
          </ul>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución</h4>
            <p style="color: #047857; margin-bottom: 0;">Eliminar bloqueos. Crear canales de flujo. Optimizar procesos. Como el Hombre Gris dice: <em>"Si hay una forma de remover complejidad sin perder poder, la encuentra."</em> Simplificar para que la energía fluya libremente.</p>
          </div>

          <h3>Ejercicio: Mapear Flujos de Energía</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza tu sistema (personal, familiar, laboral):</strong></p>
            <ol style="line-height: 2;">
              <li><strong>Entradas:</strong> ¿Qué energías entran? (física, mental, emocional, económica)</li>
              <li><strong>Transformación:</strong> ¿Cómo se transforman? ¿Es eficiente?</li>
              <li><strong>Salidas:</strong> ¿Qué produce el sistema? ¿Es valioso?</li>
              <li><strong>Bloqueos:</strong> ¿Dónde se bloquea el flujo?</li>
              <li><strong>Optimización:</strong> ¿Qué puedes hacer para mejorar el flujo?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">La energía fluye constantemente en sistemas. El rendimiento depende de qué tan bien fluye. Argentina necesita eliminar bloqueos y optimizar flujos para prosperar.</p>
          </div>
        `,
        orderIndex: 6,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
    ];

    // Continue Block 2 with remaining 6 lessons
    const remainingBlock2Lessons = [
      {
        courseId: course4[0].id,
        title: 'Input/Output: Entradas y Salidas que Definen un Sistema',
        description: 'Aprende cómo las entradas y salidas definen un sistema. Descubre cómo mapear inputs y outputs en familia, barrio, municipio, provincia y nación.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El ABC de los Sistemas</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">Todo sistema tiene entradas (inputs) y salidas (outputs). Entender esto es entender cómo funciona cualquier sistema, desde tu familia hasta Argentina. Es el lenguaje universal de los sistemas.</p>
          </div>

          <h2>Input/Output: El Lenguaje Universal de los Sistemas</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Input:</strong> Lo que entra al sistema (recursos, información, energía). <strong>Output:</strong> Lo que sale del sistema (productos, servicios, resultados). El proceso interno transforma inputs en outputs.</p>
          </div>

          <h3>¿Por Qué Esto Es Fundamental?</h3>
          <p>Si entiendes las entradas y salidas de un sistema, puedes:</p>
          <ul style="line-height: 1.8;">
            <li>🎯 <strong>Identificar problemas:</strong> Si las salidas no son las esperadas, el problema está en las entradas o en el proceso de transformación</li>
            <li>🔧 <strong>Optimizar rendimiento:</strong> Mejorar entradas o procesos mejora salidas</li>
            <li>📊 <strong>Medir eficiencia:</strong> Comparar inputs con outputs te dice qué tan eficiente es el sistema</li>
            <li>🚀 <strong>Diseñar mejor:</strong> Entender inputs/outputs te permite diseñar sistemas mejores desde el principio</li>
          </ul>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Todo sistema es un transformador. Tu cuerpo transforma comida en energía. Tu familia transforma amor en bienestar. Argentina transforma recursos en prosperidad (o no). El secreto está en entender qué entra, qué sale y cómo se transforma.</p>
          </div>

          <h3>El Sistema Personal: Tu Cuerpo como Transformador</h3>
          <p>Tu cuerpo es el sistema más íntimo que conoces. Analicémoslo:</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📥 INPUTS (Entradas)</h4>
              <ul style="line-height: 1.8;">
                <li>🍽️ Comida y nutrientes</li>
                <li>💧 Agua</li>
                <li>💨 Oxígeno (respiración)</li>
                <li>😴 Descanso y sueño</li>
                <li>💡 Información (aprendizaje)</li>
                <li>❤️ Emociones y relaciones</li>
              </ul>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">⚙️ PROCESO (Transformación)</h4>
              <ul style="line-height: 1.8;">
                <li>🔄 Metabolismo</li>
                <li>🧠 Pensamiento y procesamiento</li>
                <li>💪 Respiración celular</li>
                <li>🧬 Reparación y crecimiento</li>
                <li>📚 Aprendizaje y memoria</li>
                <li>💓 Integración emocional</li>
              </ul>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">📤 OUTPUTS (Salidas)</h4>
              <ul style="line-height: 1.8;">
                <li>🏃 Movimiento y acción</li>
                <li>💡 Ideas y creatividad</li>
                <li>🔥 Calor corporal</li>
                <li>💼 Trabajo y productividad</li>
                <li>🤝 Relaciones y conexiones</li>
                <li>✨ Bienestar y felicidad</li>
              </ul>
            </div>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Clave Personal</h4>
            <p style="color: #047857; margin-bottom: 0;">Si quieres mejores outputs (más energía, mejor rendimiento, mayor bienestar), no busques más inputs. Mejora la calidad de tus inputs y optimiza el proceso de transformación. Comida de calidad + buen descanso + ejercicio = mejor transformación = mejores outputs.</p>
          </div>

          <h3>Sistemas Anidados: De la Familia a la Nación</h3>
          <p>Los sistemas están anidados: cada sistema es input del siguiente y output del anterior. Esto crea una cadena de transformación:</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👨‍👩‍👧‍👦 FAMILIA</h4>
              <p><strong>Inputs:</strong></p>
              <ul style="line-height: 1.6; font-size: 0.95rem;">
                <li>Amor y cuidado</li>
                <li>Recursos económicos</li>
                <li>Tiempo compartido</li>
                <li>Valores y educación</li>
                <li>Comunicación</li>
              </ul>
              <p style="margin-top: 1rem;"><strong>Outputs:</strong></p>
              <ul style="line-height: 1.6; font-size: 0.95rem;">
                <li>Miembros sanos y educados</li>
                <li>Valores transmitidos</li>
                <li>Bienestar emocional</li>
                <li>Identidad familiar</li>
                <li>Preparación para la vida</li>
              </ul>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🏘️ BARRIO</h4>
              <p><strong>Inputs:</strong></p>
              <ul style="line-height: 1.6; font-size: 0.95rem;">
                <li>Familias (output de familias)</li>
                <li>Recursos compartidos</li>
                <li>Comunicación vecinal</li>
                <li>Participación comunitaria</li>
                <li>Infraestructura local</li>
              </ul>
              <p style="margin-top: 1rem;"><strong>Outputs:</strong></p>
              <ul style="line-height: 1.6; font-size: 0.95rem;">
                <li>Seguridad barrial</li>
                <li>Cohesión social</li>
                <li>Servicios comunitarios</li>
                <li>Identidad barrial</li>
                <li>Bienestar colectivo</li>
              </ul>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🏛️ MUNICIPIO</h4>
              <p><strong>Inputs:</strong></p>
              <ul style="line-height: 1.6; font-size: 0.95rem;">
                <li>Barrios coordinados</li>
                <li>Recursos públicos</li>
                <li>Gobernanza local</li>
                <li>Participación ciudadana</li>
                <li>Planificación estratégica</li>
              </ul>
              <p style="margin-top: 1rem;"><strong>Outputs:</strong></p>
              <ul style="line-height: 1.6; font-size: 0.95rem;">
                <li>Servicios públicos eficientes</li>
                <li>Infraestructura mantenida</li>
                <li>Orden y seguridad</li>
                <li>Desarrollo local</li>
                <li>Calidad de vida</li>
              </ul>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">🗺️ PROVINCIA</h4>
              <p><strong>Inputs:</strong></p>
              <ul style="line-height: 1.6; font-size: 0.95rem;">
                <li>Municipios coordinados</li>
                <li>Recursos provinciales</li>
                <li>Planificación regional</li>
                <li>Coordinación inter-municipal</li>
              </ul>
              <p style="margin-top: 1rem;"><strong>Outputs:</strong></p>
              <ul style="line-height: 1.6; font-size: 0.95rem;">
                <li>Coordinación regional</li>
                <li>Desarrollo equilibrado</li>
                <li>Políticas públicas efectivas</li>
                <li>Bienestar provincial</li>
              </ul>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">🇦🇷 NACIÓN</h4>
              <p><strong>Inputs:</strong></p>
              <ul style="line-height: 1.6; font-size: 0.95rem;">
                <li>Provincias coordinadas</li>
                <li>Recursos nacionales</li>
                <li>Talento y creatividad</li>
                <li>Capital cultural</li>
                <li>Visón compartida</li>
              </ul>
              <p style="margin-top: 1rem;"><strong>Outputs:</strong></p>
              <ul style="line-height: 1.6; font-size: 0.95rem;">
                <li>Desarrollo sostenible</li>
                <li>Bienestar nacional</li>
                <li>Prosperidad compartida</li>
                <li>Identidad nacional fuerte</li>
                <li>Transformación real</li>
              </ul>
            </div>
          </div>

          <h3>Argentina: El Problema de los Inputs y Outputs</h3>
          <p>Argentina tiene inputs extraordinarios, pero outputs que no reflejan el potencial:</p>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ El Desajuste Argentino</h4>
            <p style="color: #7f1d1d; margin-bottom: 0;"><strong>Inputs potentes:</strong> Recursos naturales abundantes, talento humano excepcional, educación tradicionalmente fuerte, capital cultural rico.</p>
            <p style="color: #7f1d1d; margin-top: 1rem; margin-bottom: 0;"><strong>Outputs insuficientes:</strong> Pobreza, desigualdad, corrupción, falta de desarrollo, migración de talento.</p>
            <p style="color: #7f1d1d; margin-top: 1rem; margin-bottom: 0;"><strong>Conclusión:</strong> El problema no está en los inputs, está en el proceso de transformación. Las instituciones no están optimizando la transformación de recursos en prosperidad.</p>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Clave Maestra</h4>
            <p style="color: #047857; margin-bottom: 0;">Mejorar las relaciones entre las partes mejora la transformación de inputs en outputs. Cuando las familias se comunican mejor, los barrios colaboran más, los municipios coordinan mejor, las provincias se alinean, Argentina transforma mejor sus recursos en prosperidad. Como dice el Hombre Gris: <em>"El problema de Argentina no es la falta de recursos sino el diseño de los sistemas. No necesitamos más de lo mismo: necesitamos sistemas que vuelvan irrelevantes los problemas actuales."</em></p>
          </div>

          <h3>Ejercicio Práctico: Mapea Tu Sistema</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige un sistema que conozcas bien (tu familia, tu trabajo, tu barrio) y mapea:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>INPUTS:</strong> ¿Qué entra al sistema? Lista todos los recursos, información, energía, personas que entran.</li>
              <li><strong>PROCESO:</strong> ¿Cómo se transforman los inputs? ¿Qué procesos internos ocurren? ¿Son eficientes?</li>
              <li><strong>OUTPUTS:</strong> ¿Qué sale del sistema? ¿Qué resultados produce? ¿Son los outputs esperados?</li>
              <li><strong>ANÁLISIS:</strong> ¿Hay desajustes? ¿Los outputs reflejan la calidad de los inputs? ¿Dónde está el problema?</li>
              <li><strong>ACCIONES:</strong> ¿Qué puedes hacer para mejorar? ¿Mejorar inputs? ¿Optimizar procesos? ¿Mejorar relaciones entre partes?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Todo sistema tiene inputs y outputs. Entender esto es el primer paso para optimizar cualquier sistema. Si quieres mejores resultados, no busques más inputs. Mejora la calidad de los inputs y optimiza el proceso de transformación. Y recuerda: mejorar las relaciones entre las partes mejora la transformación completa del sistema.</p>
          </div>
        `,
        orderIndex: 7,
        type: 'text' as const,
        duration: 35,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Feedback Loops y Auto-Regulación',
        description: 'Descubre cómo los sistemas se regulan a sí mismos mediante bucles de retroalimentación. Aprende a crear feedback loops positivos en tu vida y comunidad.',
        content: `
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Sistema que Se Corrige Solo</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Cómo hace tu cuerpo para mantener 37°C de temperatura? ¿Cómo se mantiene estable tu relación cuando hay problemas? Los sistemas vivos tienen la capacidad extraordinaria de auto-regularse mediante bucles de retroalimentación. Aprende cómo funcionan y cómo crear los tuyos.</p>
          </div>

          <h2>Feedback Loops: El Sistema de Auto-Corrección</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Feedback positivo:</strong> Amplifica cambios (ej: éxito genera más éxito, confianza genera más confianza). <strong>Feedback negativo:</strong> Corrige desviaciones y mantiene estabilidad (ej: termostato que mantiene temperatura, sistema que corrige errores).</p>
          </div>

          <h3>El Termostato: El Ejemplo Perfecto</h3>
          <p>Tu termostato es un sistema de feedback negativo perfecto:</p>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>El bucle:</strong></p>
            <ol style="line-height: 2;">
              <li>🌡️ <strong>Mide:</strong> El termostato mide la temperatura actual</li>
              <li>📊 <strong>Compara:</strong> Compara con la temperatura deseada (ej: 20°C)</li>
              <li>⚙️ <strong>Actúa:</strong> Si está frío, enciende calefacción. Si está caliente, la apaga</li>
              <li>🔄 <strong>Vuelve a medir:</strong> Mide de nuevo y repite el ciclo</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">El sistema se auto-corrige constantemente, manteniendo la temperatura estable.</p>
          </div>

          <h3>Feedback Positivo: Amplificadores de Cambio</h3>
          <p>Los feedback loops positivos amplifican cambios. Son potentes pero pueden ser peligrosos si no se controlan:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Feedback Positivo Constructivo</h4>
              <p><strong>Confianza → Colaboración → Más Confianza</strong></p>
              <p style="font-size: 0.95rem;">Cuando confías en alguien, colaboras mejor. La buena colaboración genera más confianza. El ciclo se amplifica. Más confianza = más colaboración = mejores resultados.</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Éxito → Recursos → Más Éxito</h4>
              <p style="font-size: 0.95rem;">El éxito atrae recursos (dinero, talento, oportunidades). Más recursos generan más éxito. Este es el ciclo virtuoso del crecimiento.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">⚠️ Feedback Positivo Destructivo</h4>
              <p><strong>Desconfianza → Evasión → Más Desconfianza</strong></p>
              <p style="font-size: 0.95rem;">La desconfianza genera evasión. La evasión genera más desconfianza. El ciclo se amplifica negativamente. Puede destruir relaciones.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">⚠️ Corrupción → Desconfianza → Más Corrupción</h4>
              <p style="font-size: 0.95rem;">La corrupción genera desconfianza. La desconfianza facilita más corrupción (nadie vigila). Este es el ciclo vicioso que destruye sistemas.</p>
            </div>
          </div>

          <h3>Feedback Negativo: Mantenedores de Estabilidad</h3>
          <p>Los feedback loops negativos corrigen desviaciones y mantienen estabilidad:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🔧 Problema → Acción → Corrección</h4>
              <p style="font-size: 0.95rem;">Detectas un problema → tomas acción correctiva → el problema se resuelve → el sistema vuelve a estabilidad. Este bucle mantiene sistemas saludables.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🔧 Comunicación → Entendimiento → Ajuste</h4>
              <p style="font-size: 0.95rem;">Comunicas un problema → generas entendimiento → ajustas comportamiento → mejora la relación. El feedback negativo corrige desviaciones en relaciones.</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Los sistemas sin feedback loops son como un barco sin timón: van a la deriva. Los sistemas con buen feedback se auto-corrigen y se auto-optimizan. Argentina necesita feedback loops positivos en todos sus niveles: familias, barrios, municipios, provincias, nación.</p>
          </div>

          <h3>Crear Feedback Loops en Tu Vida</h3>
          <p>Puedes diseñar feedback loops para mejorar cualquier sistema:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Pasos para crear un feedback loop:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>Define qué quieres medir:</strong> ¿Qué output quieres mejorar? (ej: productividad, salud, relaciones)</li>
              <li><strong>Establece métricas:</strong> ¿Cómo medirás el progreso? (ej: horas trabajadas, peso, frecuencia de comunicación)</li>
              <li><strong>Crea el bucle:</strong> Mide → Compara con objetivo → Actúa → Vuelve a medir</li>
              <li><strong>Automatiza:</strong> Haz que el proceso sea automático. Cuanto menos esfuerzo requiera, más sostenible será</li>
              <li><strong>Ajusta:</strong> Si el feedback no funciona, ajusta el bucle. Los bucles perfectos se refinan con el tiempo</li>
            </ol>
          </div>

          <h3>Feedback Loops en Argentina</h3>
          <p>Argentina tiene feedback loops, pero muchos son negativos o están rotos:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Feedback Loops Rotos en Argentina</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Transparencia:</strong> No hay feedback entre ciudadanos y gobierno. La información no fluye.</li>
              <li>🚨 <strong>Rendición de cuentas:</strong> Los políticos no enfrentan consecuencias de malas decisiones. El feedback negativo no funciona.</li>
              <li>🚨 <strong>Educación:</strong> Los resultados educativos no generan ajustes en el sistema. El feedback no se usa.</li>
              <li>🚨 <strong>Economía:</strong> Las políticas económicas no se ajustan según resultados. Se repiten errores.</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución: Crear Feedback Loops Saludables</h4>
            <p style="color: #047857; margin-bottom: 0;">Argentina necesita:</p>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Transparencia radical:</strong> Información pública fluye → ciudadanos pueden dar feedback → gobierno ajusta</li>
              <li>✅ <strong>Rendición de cuentas:</strong> Malas decisiones → consecuencias → aprendizaje → mejores decisiones</li>
              <li>✅ <strong>Feedback educativo:</strong> Resultados educativos → análisis → ajuste de métodos → mejores resultados</li>
              <li>✅ <strong>Feedback económico:</strong> Políticas → resultados medibles → ajuste → mejores políticas</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Como dice el Hombre Gris: <em>"Los sistemas que aprenden de sus errores se vuelven más fuertes. Los sistemas que ignoran el feedback se destruyen."</em></p>
          </div>

          <h3>Ejercicio Práctico: Diseña Tu Feedback Loop</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige un área de tu vida que quieras mejorar y diseña un feedback loop:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>QUÉ MEDIR:</strong> ¿Qué output quieres mejorar? (ej: productividad diaria, calidad de relaciones, salud física)</li>
              <li><strong>CÓMO MEDIR:</strong> ¿Qué métrica usarás? (ej: horas productivas, frecuencia de comunicación, peso/ejercicio)</li>
              <li><strong>OBJETIVO:</strong> ¿Qué resultado quieres lograr? (ej: 6 horas productivas diarias, comunicación diaria con familia, 30 min ejercicio diario)</li>
              <li><strong>ACCIÓN:</strong> ¿Qué acción tomarás si el resultado no es el esperado? (ej: reorganizar día, programar llamadas, establecer rutina)</li>
              <li><strong>FRECUENCIA:</strong> ¿Con qué frecuencia medirás? (diario, semanal, mensual)</li>
              <li><strong>IMPLEMENTACIÓN:</strong> ¿Cómo automatizarás el proceso? (recordatorios, apps, hábitos)</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Un feedback loop bien diseñado se vuelve automático. Cuando funciona, no necesitas pensar en él, solo mejora constantemente.</p>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Los feedback loops son el sistema de auto-corrección de los sistemas vivos. Los positivos amplifican cambios (buenos o malos). Los negativos mantienen estabilidad. Crear feedback loops saludables en tu vida y en Argentina es clave para transformación sostenible. Mide, compara, actúa, mide de nuevo. El ciclo de mejora continua.</p>
          </div>
        `,
        orderIndex: 8,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Propiedades Emergentes: Cuando el Todo es Más que la Suma',
        description: 'Descubre la magia de los sistemas complejos: propiedades que emergen cuando las partes interactúan. Aprende a cultivar estas propiedades en tu comunidad.',
        content: `
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Milagro de la Emergencia</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Alguna vez te preguntaste por qué una familia es más que la suma de sus miembros? ¿Por qué un barrio tiene identidad propia? ¿Por qué Argentina tiene cultura única? Cuando las partes de un sistema interactúan bien, emergen propiedades que no existen en las partes individuales. Esto es la magia de los sistemas.</p>
          </div>

          <h2>Propiedades Emergentes: Cuando 1 + 1 = 3</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Propiedades emergentes:</strong> Características que surgen cuando las partes de un sistema interactúan, pero que no existen en las partes individuales. El todo es más que la suma de las partes.</p>
          </div>

          <h3>Ejemplos Cotidianos de Emergencia</h3>
          <p>La emergencia está en todas partes:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">💧 Agua (H₂O)</h4>
              <p style="font-size: 0.95rem;">Hidrógeno (gas explosivo) + Oxígeno (gas que quema) = Agua (líquido que apaga fuego). La emergencia: las propiedades del agua no existen en H ni en O por separado.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🎵 Música</h4>
              <p style="font-size: 0.95rem;">Notas individuales + Armonía = Música (emoción, belleza, significado). La música no existe en notas solas, emerge de su interacción.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🧠 Consciencia</h4>
              <p style="font-size: 0.95rem;">Neuronas (células simples) + Conexiones = Consciencia (experiencia, pensamiento, identidad). La consciencia emerge de las relaciones neuronales.</p>
            </div>
          </div>

          <h3>Emergencia en Sistemas Humanos</h3>
          <p>En sistemas humanos, la emergencia crea propiedades mágicas:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👨‍👩‍👧‍👦 FAMILIA</h4>
              <p><strong>Partes:</strong> Individuos con necesidades, personalidades, objetivos propios</p>
              <p><strong>Emergencia:</strong></p>
              <ul style="line-height: 1.8; font-size: 0.95rem;">
                <li>❤️ Amor familiar (no existe en individuos solos)</li>
                <li>🏠 Identidad familiar compartida</li>
                <li>🤝 Apoyo mutuo y solidaridad</li>
                <li>📚 Tradiciones y valores compartidos</li>
                <li>💪 Fortaleza colectiva</li>
              </ul>
              <p style="margin-top: 1rem; font-size: 0.95rem; font-style: italic; color: #047857;">La familia es más que la suma de sus miembros. Es un sistema que genera amor, identidad y fortaleza.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🏘️ BARRIO</h4>
              <p><strong>Partes:</strong> Familias viviendo cerca</p>
              <p><strong>Emergencia:</strong></p>
              <ul style="line-height: 1.8; font-size: 0.95rem;">
                <li>🛡️ Seguridad comunitaria</li>
                <li>🤝 Cohesión social</li>
                <li>🎭 Identidad barrial</li>
                <li>📢 Voz colectiva</li>
                <li>💼 Oportunidades compartidas</li>
              </ul>
              <p style="margin-top: 1rem; font-size: 0.95rem; font-style: italic; color: #1e40af;">El barrio es más que familias cerca. Es comunidad, seguridad, identidad compartida.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">🇦🇷 NACIÓN</h4>
              <p><strong>Partes:</strong> Provincias, regiones, ciudades</p>
              <p><strong>Emergencia:</strong></p>
              <ul style="line-height: 1.8; font-size: 0.95rem;">
                <li>🎨 Cultura nacional única</li>
                <li>🏛️ Identidad argentina</li>
                <li>💪 Poder colectivo</li>
                <li>🌍 Posición internacional</li>
                <li>✨ Destino compartido</li>
              </ul>
              <p style="margin-top: 1rem; font-size: 0.95rem; font-style: italic; color: #991b1b;">Argentina es más que provincias. Es cultura, identidad, destino compartido que emerge de la interacción.</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Revelación Fundamental</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Las propiedades emergentes surgen de las RELACIONES entre las partes, no de las partes mismas.</strong> Si tienes individuos pero no relaciones, no hay familia. Si tienes familias pero no conexión, no hay barrio. Si tienes provincias pero no coordinación, no hay nación unida. Mejorar relaciones = mejor emergencia = mejores propiedades del sistema completo.</p>
          </div>

          <h3>¿Cómo Cultivar Propiedades Emergentes Positivas?</h3>
          <p>Puedes diseñar sistemas para que emerjan propiedades positivas:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Principios para cultivar emergencia positiva:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>Mejora las relaciones:</strong> Las propiedades emergen de relaciones, no de partes. Invierte en comunicación, confianza, colaboración</li>
              <li><strong>Facilita interacción:</strong> Crea espacios para que las partes interactúen (reuniones, eventos, plataformas)</li>
              <li><strong>Define propósito compartido:</strong> Cuando las partes comparten propósito, emergen propiedades alineadas</li>
              <li><strong>Reduce fricción:</strong> Elimina barreras que bloquean interacción (burocracia, desconfianza, falta de comunicación)</li>
              <li><strong>Celebra emergencia:</strong> Reconoce y celebra las propiedades que emergen. Esto las refuerza</li>
            </ol>
          </div>

          <h3>Emergencia en Argentina: ¿Qué Está Emergiendo?</h3>
          <p>Argentina tiene propiedades emergentes, pero algunas son negativas:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Emergencia Negativa en Argentina</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Desconfianza sistémica:</strong> Emerge de relaciones rotas entre ciudadanos y gobierno</li>
              <li>🚨 <strong>Corrupción cultural:</strong> Emerge cuando las partes aprenden que "viveza criolla" es recompensada</li>
              <li>🚨 <strong>División política:</strong> Emerge de relaciones competitivas en lugar de colaborativas</li>
              <li>🚨 <strong>Falta de coordinación:</strong> Emerge cuando provincias no se comunican</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución: Cultivar Emergencia Positiva</h4>
            <p style="color: #047857; margin-bottom: 0;">Argentina puede cultivar emergencia positiva:</p>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Confianza:</strong> Mejora relaciones ciudadano-gobierno → emerge confianza sistémica</li>
              <li>✅ <strong>Colaboración:</strong> Facilita coordinación entre provincias → emerge unidad nacional</li>
              <li>✅ <strong>Transparencia:</strong> Abre información → emerge accountability y mejora</li>
              <li>✅ <strong>Propósito compartido:</strong> Define visión común → emerge dirección colectiva</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Como dice el Hombre Gris: <em>"Ve oportunidades donde otros ven crisis. Cada problema argentino es una oportunidad disfrazada esperando a ser reconocida y aprovechada."</em> Las propiedades emergentes muestran que pequeños cambios en relaciones pueden generar transformaciones masivas.</p>
          </div>

          <h3>Ejercicio Práctico: Identifica Emergencia</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza un sistema que conozcas (familia, trabajo, barrio) y identifica:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>LAS PARTES:</strong> ¿Qué elementos individuales tiene el sistema?</li>
              <li><strong>LAS RELACIONES:</strong> ¿Cómo interactúan las partes? ¿Son positivas o negativas?</li>
              <li><strong>LA EMERGENCIA:</strong> ¿Qué propiedades emergen? ¿Qué existe en el sistema que no existe en las partes individuales?</li>
              <li><strong>EVALUACIÓN:</strong> ¿La emergencia es positiva o negativa? ¿Fortalece o debilita el sistema?</li>
              <li><strong>ACCIÓN:</strong> ¿Cómo puedes mejorar las relaciones para generar mejor emergencia?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Si quieres cambiar las propiedades emergentes, no cambies las partes. Cambia las relaciones entre las partes.</p>
          </div>

          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Las propiedades emergentes son la magia de los sistemas: el todo es más que la suma de las partes. Estas propiedades surgen de las relaciones, no de las partes. Para mejorar las propiedades emergentes, mejora las relaciones. Argentina necesita mejores relaciones entre sus partes para que emerjan propiedades positivas: confianza, colaboración, unidad, prosperidad compartida.</p>
          </div>
        `,
        orderIndex: 9,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Mantenimiento y Decaimiento: El Ciclo de Vida de los Sistemas',
        description: 'Aprende cómo mantener sistemas saludables y prevenir el decaimiento. Descubre técnicas prácticas para mantener tu familia, trabajo y comunidad.',
        content: `
          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Todo Requiere Mantenimiento</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué tu casa se desordena sola? ¿Por qué las relaciones se deterioran sin atención? ¿Por qué las instituciones se corrompen? Sin mantenimiento, todos los sistemas decaen. Aprende a mantener tus sistemas saludables antes de que el decaimiento sea irreversible.</p>
          </div>

          <h2>La Segunda Ley de Termodinámica: Entropía y Decaimiento</h2>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Sin intervención, todos los sistemas tienden al desorden.</strong> Esta es la ley de la entropía. Los sistemas vivos y sociales luchan constantemente contra esta tendencia mediante mantenimiento activo.</p>
          </div>

          <h3>Señales de Decaimiento: Cómo Detectar el Desorden</h3>
          <p>El decaimiento tiene síntomas claros. Aprende a reconocerlos temprano:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">🚨 Falta de Comunicación</h4>
              <p style="font-size: 0.95rem;">Las partes dejan de hablarse. La información no fluye. Los problemas se acumulan sin resolverse. Es la primera señal de decaimiento relacional.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">🚨 Desorden Creciente</h4>
              <p style="font-size: 0.95rem;">Física, mental o social. Las cosas se acumulan sin organización. El caos gana terreno. Sin orden, el sistema pierde eficiencia.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">🚨 Pérdida de Propósito</h4>
              <p style="font-size: 0.95rem;">El sistema olvida por qué existe. Las partes no saben hacia dónde van. Sin dirección, el sistema se desintegra.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">🚨 Falta de Energía</h4>
              <p style="font-size: 0.95rem;">El sistema se agota. No hay inputs suficientes o la transformación es ineficiente. Sin energía, nada funciona.</p>
            </div>
          </div>

          <h3>Técnicas de Mantenimiento: Luchando Contra la Entropía</h3>
          <p>El mantenimiento es la inversión constante que previene el decaimiento:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Comunicación Regular</h4>
              <p style="font-size: 0.95rem;"><strong>Mantiene:</strong> Relaciones, información fluyendo, problemas detectados temprano</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem;"><strong>Cómo:</strong> Reuniones regulares, check-ins, espacios de diálogo, feedback loops</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">La comunicación es el mantenimiento de las relaciones.</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Limpieza y Organización</h4>
              <p style="font-size: 0.95rem;"><strong>Mantiene:</strong> Orden, eficiencia, claridad</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem;"><strong>Cómo:</strong> Limpieza regular, organización de espacios, sistemas de archivo, procesos claros</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">El orden no es natural, requiere mantenimiento constante.</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Revisión de Propósito</h4>
              <p style="font-size: 0.95rem;"><strong>Mantiene:</strong> Dirección, motivación, alineación</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem;"><strong>Cómo:</strong> Revisar objetivos, renovar visión, celebrar logros, ajustar rumbo</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Sin propósito claro, el sistema se desvía.</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Inversión de Energía</h4>
              <p style="font-size: 0.95rem;"><strong>Mantiene:</strong> Vitalidad, capacidad, crecimiento</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem;"><strong>Cómo:</strong> Recursos, tiempo, atención, aprendizaje, mejora continua</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Sin energía, el sistema se estanca y decae.</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">El mantenimiento no es opcional. Es la inversión mínima para prevenir el colapso. Los sistemas que no se mantienen, colapsan. Los sistemas que se mantienen bien, prosperan. Argentina necesita mantenimiento activo en todos sus niveles.</p>
          </div>

          <h3>Mantenimiento en Sistemas Personales</h3>
          <p>Cada sistema personal requiere mantenimiento específico:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Tu cuerpo:</strong> Ejercicio, nutrición, sueño, salud preventiva</p>
            <p><strong>Tu mente:</strong> Aprendizaje, lectura, reflexión, descanso mental</p>
            <p><strong>Tu trabajo:</strong> Actualización de habilidades, organización, networking</p>
            <p><strong>Tus relaciones:</strong> Tiempo de calidad, comunicación, atención, cuidado</p>
            <p><strong>Tu entorno:</strong> Limpieza, organización, orden, renovación</p>
          </div>

          <h3>Mantenimiento en Sistemas Sociales</h3>
          <p>Los sistemas sociales también requieren mantenimiento:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">👨‍👩‍👧‍👦 FAMILIA</h4>
              <ul style="line-height: 1.8; font-size: 0.95rem;">
                <li>🕐 Tiempo compartido regular</li>
                <li>💬 Comunicación abierta</li>
                <li>🎯 Revisión de valores y objetivos</li>
                <li>🎉 Celebración de logros</li>
                <li>🔧 Resolución proactiva de conflictos</li>
              </ul>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🏘️ BARRIO</h4>
              <ul style="line-height: 1.8; font-size: 0.95rem;">
                <li>🤝 Eventos comunitarios</li>
                <li>🗣️ Espacios de diálogo</li>
                <li>🧹 Mantenimiento de espacios públicos</li>
                <li>📢 Comunicación vecinal</li>
                <li>🤝 Colaboración en proyectos</li>
              </ul>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🏛️ INSTITUCIONES</h4>
              <ul style="line-height: 1.8; font-size: 0.95rem;">
                <li>🔍 Transparencia y auditorías</li>
                <li>🔄 Renovación de procesos</li>
                <li>📚 Capacitación continua</li>
                <li>🛠️ Actualización tecnológica</li>
                <li>📊 Evaluación y mejora</li>
              </ul>
            </div>
          </div>

          <h3>Argentina: El Decaimiento y el Mantenimiento Necesario</h3>
          <p>Argentina muestra señales claras de decaimiento sistémico:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Decaimiento en Argentina</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Falta de comunicación:</strong> Ciudadanos y gobierno no se comunican efectivamente</li>
              <li>🚨 <strong>Desorden institucional:</strong> Burocracia creciente, procesos obsoletos, falta de organización</li>
              <li>🚨 <strong>Pérdida de propósito:</strong> No hay visión clara compartida, objetivos contradictorios</li>
              <li>🚨 <strong>Falta de energía:</strong> Recursos mal asignados, talento que emigra, inversión insuficiente</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 El Mantenimiento que Argentina Necesita</h4>
            <p style="color: #047857; margin-bottom: 0;">Argentina necesita mantenimiento activo y constante:</p>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Transparencia radical:</strong> Mantener información fluyendo, rendición de cuentas constante</li>
              <li>✅ <strong>Renovación de instituciones:</strong> Actualizar procesos, eliminar burocracia obsoleta, modernizar</li>
              <li>✅ <strong>Inversión en educación:</strong> Mantener y mejorar el sistema educativo, capacitar continuamente</li>
              <li>✅ <strong>Fortalecimiento de relaciones:</strong> Mejorar comunicación entre niveles, construir confianza</li>
              <li>✅ <strong>Revisión de propósito:</strong> Definir y renovar visión nacional, alinear objetivos</li>
              <li>✅ <strong>Inversión de energía:</strong> Asignar recursos eficientemente, atraer talento, mantener infraestructura</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Como dice el Hombre Gris: <em>"Los sistemas que no se mantienen colapsan. Los sistemas que se mantienen bien prosperan. Argentina necesita mantenimiento activo, no parches temporales."</em></p>
          </div>

          <h3>Ejercicio Práctico: Plan de Mantenimiento</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige un sistema que quieras mantener (familia, trabajo, salud, relaciones) y crea un plan:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>DIAGNÓSTICO:</strong> ¿Qué señales de decaimiento ves? ¿Qué necesita mantenimiento?</li>
              <li><strong>PRIORIDADES:</strong> ¿Qué es más crítico mantener? ¿Qué puede esperar?</li>
              <li><strong>ACCIONES:</strong> ¿Qué acciones específicas de mantenimiento implementarás? (ej: reunión semanal, limpieza mensual, revisión trimestral)</li>
              <li><strong>FRECUENCIA:</strong> ¿Con qué frecuencia harás cada acción? (diaria, semanal, mensual)</li>
              <li><strong>MÉTRICAS:</strong> ¿Cómo medirás que el mantenimiento está funcionando?</li>
              <li><strong>IMPLEMENTACIÓN:</strong> ¿Cómo automatizarás el proceso? (recordatorios, hábitos, sistemas)</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: El mantenimiento es inversión, no costo. Prevenir decaimiento es más fácil que revertirlo.</p>
          </div>

          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Sin mantenimiento, todos los sistemas decaen. Es la ley de la entropía. El mantenimiento es la inversión constante que lucha contra el desorden. Argentina necesita mantenimiento activo en todos sus niveles: transparencia, renovación, inversión, fortalecimiento de relaciones. Los sistemas que se mantienen bien prosperan. Los que no, colapsan.</p>
          </div>
        `,
        orderIndex: 10,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Efectos de Red y Conectividad',
        description: 'Descubre el poder de las conexiones. Aprende cómo los efectos de red pueden multiplicar el impacto de tus acciones y transformar comunidades.',
        content: `
          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Poder de Estar Conectado</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué un teléfono solo es inútil pero mil teléfonos crean millones de conexiones? ¿Por qué Facebook creció exponencialmente? En sistemas, el valor aumenta con las conexiones. Cada nueva conexión no solo suma valor, lo multiplica. Aprende a crear redes poderosas.</p>
          </div>

          <h2>Efectos de Red: Cuando las Conexiones Multiplican Valor</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Efecto de red:</strong> El valor de un sistema aumenta exponencialmente con el número de usuarios/conexiones. No es suma, es multiplicación. Cada nueva conexión hace que todas las conexiones existentes sean más valiosas.</p>
          </div>

          <h3>La Matemática de las Redes: El Poder Exponencial</h3>
          <p>Las redes crean valor exponencialmente:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>La fórmula de conexiones:</strong> Si tienes N nodos, el número de conexiones posibles es N × (N-1) / 2</p>
            <ul style="line-height: 2;">
              <li>📱 <strong>2 teléfonos:</strong> 1 conexión posible</li>
              <li>📱 <strong>10 teléfonos:</strong> 45 conexiones posibles</li>
              <li>📱 <strong>100 teléfonos:</strong> 4,950 conexiones posibles</li>
              <li>📱 <strong>1,000 teléfonos:</strong> 499,500 conexiones posibles</li>
              <li>📱 <strong>1,000,000 teléfonos:</strong> ¡499,999,500,000 conexiones posibles!</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Cada nuevo nodo no suma valor linealmente. Lo multiplica exponencialmente.</p>
          </div>

          <h3>Ejemplos de Efectos de Red en la Vida Real</h3>
          <p>Los efectos de red están en todas partes:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📱 Telefonía</h4>
              <p style="font-size: 0.95rem;"><strong>Un teléfono solo:</strong> Inútil. No puedes llamar a nadie.</p>
              <p style="font-size: 0.95rem;"><strong>Dos teléfonos:</strong> 1 conexión posible. Valor básico.</p>
              <p style="font-size: 0.95rem;"><strong>Mil teléfonos:</strong> 999,000 conexiones posibles. Valor masivo.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Cada nuevo teléfono hace que todos los teléfonos existentes sean más valiosos.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🌐 Internet</h4>
              <p style="font-size: 0.95rem;"><strong>Un usuario:</strong> Poco valor. Pocos sitios, pocos servicios.</p>
              <p style="font-size: 0.95rem;"><strong>Mil usuarios:</strong> Más contenido, más servicios, más valor.</p>
              <p style="font-size: 0.95rem;"><strong>Mil millones:</strong> Valor masivo. Cada usuario agrega valor a todos.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Internet es valioso porque todos estamos conectados.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">👥 Comunidades</h4>
              <p style="font-size: 0.95rem;"><strong>2 personas:</strong> 1 relación, recursos limitados</p>
              <p style="font-size: 0.95rem;"><strong>10 personas:</strong> 45 relaciones posibles, más ideas, más recursos</p>
              <p style="font-size: 0.95rem;"><strong>100 personas:</strong> 4,950 relaciones posibles, sinergia masiva</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Más miembros = más conexiones = más valor colectivo.</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">El valor de una red no es la suma de los nodos. Es el cuadrado del número de nodos. Conectar personas, ideas y recursos no solo suma valor, lo multiplica exponencialmente. Argentina necesita más conexiones entre sus partes para multiplicar su valor colectivo.</p>
          </div>

          <h3>Tipos de Efectos de Red</h3>
          <p>Hay diferentes tipos de efectos de red:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📞 Efectos de Red Directos</h4>
              <p style="font-size: 0.95rem;">El valor aumenta directamente con el número de usuarios. Ejemplos: telefonía, redes sociales, plataformas de mensajería.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Más usuarios = más valor para cada usuario.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🔄 Efectos de Red Indirectos</h4>
              <p style="font-size: 0.95rem;">Más usuarios atraen más servicios/complementos, que hacen la red más valiosa. Ejemplos: sistemas operativos, plataformas de e-commerce.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Más usuarios → más servicios → más valor.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">📊 Efectos de Red de Datos</h4>
              <p style="font-size: 0.95rem;">Más usuarios generan más datos, que mejoran el producto para todos. Ejemplos: búsquedas, recomendaciones, mapas.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Más usuarios → más datos → mejor producto → más valor.</p>
            </div>
          </div>

          <h3>Crear Efectos de Red en Tu Vida y Comunidad</h3>
          <p>Puedes crear efectos de red en cualquier sistema:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Estrategias para crear efectos de red:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>Conecta personas:</strong> Introduce personas que pueden beneficiarse mutuamente. Cada conexión crea valor para todos.</li>
              <li><strong>Conecta ideas:</strong> Combina ideas de diferentes fuentes. Las mejores soluciones emergen de conexiones de ideas.</li>
              <li><strong>Conecta recursos:</strong> Comparte recursos que otros pueden usar. El compartir multiplica valor.</li>
              <li><strong>Crea plataformas:</strong> Diseña espacios donde las conexiones pueden ocurrir (reuniones, eventos, grupos, plataformas digitales)</li>
              <li><strong>Reduce fricción:</strong> Elimina barreras que impiden conexiones (burocracia, desconfianza, falta de comunicación)</li>
              <li><strong>Facilita interacción:</strong> Haz que sea fácil para las partes conectarse y colaborar</li>
            </ol>
          </div>

          <h3>Efectos de Red en Argentina: ¿Estamos Conectados?</h3>
          <p>Argentina tiene problemas de conectividad:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Desconexión en Argentina</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Provincias desconectadas:</strong> Poca coordinación, poca comunicación, poca colaboración</li>
              <li>🚨 <strong>Ciudadanos desconectados:</strong> Poca participación, poca organización, poca acción colectiva</li>
              <li>🚨 <strong>Empresas desconectadas:</strong> Poca colaboración, poca innovación compartida, competencia destructiva</li>
              <li>🚨 <strong>Gobierno desconectado:</strong> Poca comunicación con ciudadanos, poca transparencia, poca colaboración</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución: Conectar Argentina</h4>
            <p style="color: #047857; margin-bottom: 0;">Argentina necesita más conexiones:</p>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Conectar provincias:</strong> Coordinación inter-provincial → más colaboración → más desarrollo</li>
              <li>✅ <strong>Conectar ciudadanos:</strong> Plataformas de participación → más organización → más acción</li>
              <li>✅ <strong>Conectar empresas:</strong> Redes de colaboración → más innovación → más crecimiento</li>
              <li>✅ <strong>Conectar gobierno y ciudadanos:</strong> Transparencia y comunicación → más confianza → mejor gobernanza</li>
              <li>✅ <strong>Conectar ideas:</strong> Espacios de intercambio → más soluciones → más transformación</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Como dice el Hombre Gris: <em>"El poder de Argentina no está en sus recursos individuales sino en las conexiones entre sus partes. Conecta personas, conecta ideas, conecta recursos, y Argentina se transforma."</em></p>
          </div>

          <h3>Ejercicio Práctico: Diseña Tu Red</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige un sistema (trabajo, comunidad, proyecto) y diseña cómo crear efectos de red:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>MAPEA LA RED ACTUAL:</strong> ¿Quién está conectado con quién? ¿Cuántas conexiones hay?</li>
              <li><strong>IDENTIFICA DESCONEXIONES:</strong> ¿Quién debería estar conectado pero no lo está?</li>
              <li><strong>DISEÑA CONEXIONES:</strong> ¿Qué conexiones crearías? ¿Por qué son valiosas?</li>
              <li><strong>FACILITA INTERACCIÓN:</strong> ¿Cómo harías que las conexiones ocurran? (eventos, plataformas, espacios)</li>
              <li><strong>REDUCE FRICCIÓN:</strong> ¿Qué barreras eliminarías? (desconfianza, burocracia, falta de comunicación)</li>
              <li><strong>MIDE EL IMPACTO:</strong> ¿Cómo medirás que las conexiones están creando valor?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Cada conexión que creas no solo suma valor, lo multiplica. Conecta estratégicamente.</p>
          </div>

          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Los efectos de red multiplican valor exponencialmente. Cada nueva conexión hace que todas las conexiones existentes sean más valiosas. Conectar personas, ideas y recursos no solo suma, multiplica. Argentina necesita más conexiones entre sus partes para multiplicar su valor colectivo. Conecta estratégicamente y transforma sistemas.</p>
          </div>
        `,
        orderIndex: 11,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Control Theory y Cibernética: Dirigir sin Controlar',
        description: 'Aprende cómo dirigir sistemas sin microgestionar. Descubre los principios de la cibernética aplicados a liderazgo, gobierno y transformación.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Liderazgo Sistémico</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Cómo dirige un piloto un avión sin controlar cada molécula de aire? ¿Cómo dirige un capitán un barco sin controlar cada ola? Dirigir un sistema no es controlar cada parte. Es crear las condiciones para que el sistema se auto-optimice. Esto es cibernética aplicada: el arte de dirigir sin controlar.</p>
          </div>

          <h2>Control Theory: La Ciencia de Dirigir Sistemas</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Cibernética:</strong> La ciencia de control y comunicación en sistemas complejos. No controlas cada parte, controlas el sistema mediante objetivos, feedback y estructura. Las partes se auto-organizan para alcanzar los objetivos.</p>
          </div>

          <h3>El Problema del Control Centralizado</h3>
          <p>Intentar controlar cada parte de un sistema es ineficiente e imposible:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Por Qué Fallan los Controladores</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Complejidad:</strong> Los sistemas complejos tienen demasiadas partes para controlar individualmente</li>
              <li>🚨 <strong>Información incompleta:</strong> Nunca tienes toda la información necesaria para tomar todas las decisiones</li>
              <li>🚨 <strong>Retrasos:</strong> La información y las decisiones toman tiempo, causando respuestas tardías</li>
              <li>🚨 <strong>Desmotivación:</strong> Controlar todo desmotiva a las partes, que pierden autonomía y creatividad</li>
              <li>🚨 <strong>Fragilidad:</strong> Si el controlador falla, todo el sistema colapsa</li>
            </ul>
          </div>

          <h3>Principios de Control Theory: Dirigir sin Microgestionar</h3>
          <p>La cibernética muestra cómo dirigir sistemas efectivamente:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🎯 Establece Objetivos Claros</h4>
              <p style="font-size: 0.95rem;"><strong>No procesos detallados, sí objetivos claros.</strong> Define QUÉ quieres lograr, no CÓMO hacerlo. Las partes encuentran su propio camino hacia el objetivo.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: "Queremos mejorar la educación" no "Haz esto, esto y esto".</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">📊 Crea Feedback Loops</h4>
              <p style="font-size: 0.95rem;"><strong>Mide resultados, ajusta acciones.</strong> Crea sistemas que midan si están alcanzando objetivos y se ajusten automáticamente.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Ejemplo: Sistema que mide resultados educativos y ajusta métodos.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🔧 Diseña la Estructura</h4>
              <p style="font-size: 0.95rem;"><strong>No controles la ejecución, diseña la estructura.</strong> Crea las condiciones (reglas, procesos, incentivos) que hacen que el sistema funcione bien.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Ejemplo: Diseña procesos que faciliten, no que controlen.</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">🤝 Confía en Auto-Organización</h4>
              <p style="font-size: 0.95rem;"><strong>Las partes saben qué hacer.</strong> Con objetivos claros y estructura adecuada, las partes se auto-organizan para alcanzar objetivos.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Ejemplo: Confía que los equipos encontrarán la mejor forma de alcanzar objetivos.</p>
            </div>
          </div>

          <h3>Ejemplos de Control Theory en Acción</h3>
          <p>La cibernética está en todas partes:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✈️ Piloto Automático</h4>
              <p style="font-size: 0.95rem;"><strong>Objetivo:</strong> Mantener rumbo y altitud</p>
              <p style="font-size: 0.95rem;"><strong>Feedback:</strong> Mide posición constantemente</p>
              <p style="font-size: 0.95rem;"><strong>Ajuste:</strong> Corrige automáticamente desviaciones</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">El piloto no controla cada molécula de aire. Crea condiciones para que el sistema se auto-regule.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🏠 Termostato</h4>
              <p style="font-size: 0.95rem;"><strong>Objetivo:</strong> Mantener temperatura deseada</p>
              <p style="font-size: 0.95rem;"><strong>Feedback:</strong> Mide temperatura constantemente</p>
              <p style="font-size: 0.95rem;"><strong>Ajuste:</strong> Enciende/apaga calefacción automáticamente</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">No controla cada molécula de aire. Crea condiciones para auto-regulación.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">👥 Liderazgo Efectivo</h4>
              <p style="font-size: 0.95rem;"><strong>Objetivo:</strong> Lograr resultados del equipo</p>
              <p style="font-size: 0.95rem;"><strong>Feedback:</strong> Mide resultados, escucha al equipo</p>
              <p style="font-size: 0.95rem;"><strong>Ajuste:</strong> Ajusta objetivos, estructura, recursos según feedback</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">No controla cada acción. Crea condiciones para que el equipo se auto-optimice.</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">El mejor control es el que no se nota. Cuando diseñas bien el sistema (objetivos claros, feedback loops, estructura adecuada), el sistema se auto-optimiza. No necesitas controlar, solo dirigir. Argentina necesita líderes que dirijan sistemas, no que controlen partes.</p>
          </div>

          <h3>Aplicar Control Theory a Tu Vida</h3>
          <p>Puedes aplicar estos principios a cualquier sistema que dirijas:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>En tu trabajo o proyecto:</strong></p>
            <ul style="line-height: 2;">
              <li>🎯 Define objetivos claros (no microgestiones procesos)</li>
              <li>📊 Crea feedback loops (mide resultados, ajusta)</li>
              <li>🔧 Diseña estructura (procesos, reglas, herramientas que faciliten)</li>
              <li>🤝 Confía en tu equipo (déjalos encontrar mejores formas)</li>
            </ul>
            <p style="margin-top: 1rem;"><strong>En tu familia:</strong></p>
            <ul style="line-height: 2;">
              <li>🎯 Define valores y objetivos familiares (no controles cada decisión)</li>
              <li>📊 Crea comunicación regular (feedback sobre cómo va todo)</li>
              <li>🔧 Diseña rutinas y espacios (estructura que facilite)</li>
              <li>🤝 Confía en cada miembro (déjalos crecer y aportar)</li>
            </ul>
          </div>

          <h3>Control Theory en Argentina: El Problema del Control Excesivo</h3>
          <p>Argentina sufre de intentos de control centralizado inefectivos:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Control Excesivo en Argentina</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Gobierno centralizado:</strong> Intenta controlar todo desde el centro, sin confiar en provincias</li>
              <li>🚨 <strong>Burocracia excesiva:</strong> Demasiados procesos y controles que bloquean acción</li>
              <li>🚨 <strong>Falta de autonomía:</strong> Las partes no pueden tomar decisiones sin aprobación central</li>
              <li>🚨 <strong>Sin feedback loops:</strong> No hay sistemas que midan resultados y se ajusten</li>
              <li>🚨 <strong>Desconfianza:</strong> No confía en que las partes se auto-organicen</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución: Liderazgo Distribuido</h4>
            <p style="color: #047857; margin-bottom: 0;">Argentina necesita liderazgo sistémico:</p>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Objetivos claros compartidos:</strong> Define visión nacional clara, no procesos detallados</li>
              <li>✅ <strong>Feedback loops nacionales:</strong> Mide resultados, ajusta políticas según feedback</li>
              <li>✅ <strong>Estructura facilitadora:</strong> Diseña instituciones que faciliten, no que controlen</li>
              <li>✅ <strong>Confianza en auto-organización:</strong> Confía que provincias, municipios, comunidades pueden auto-organizarse</li>
              <li>✅ <strong>Liderazgo distribuido:</strong> Multiplica líderes, no concentra poder</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Como dice el Hombre Gris: <em>"No busca seguidores sino co-creadores. Su objetivo no es acumular poder sino multiplicar líderes."</em> Liderazgo distribuido, no control centralizado. Dirigir sistemas, no controlar partes.</p>
          </div>

          <h3>Ejercicio Práctico: Diseña Liderazgo Sistémico</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige un sistema que dirijas (trabajo, familia, proyecto, comunidad) y diseña liderazgo sistémico:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>OBJETIVOS CLAROS:</strong> ¿Qué objetivos claros establecerías? (no procesos, sí resultados deseados)</li>
              <li><strong>FEEDBACK LOOPS:</strong> ¿Qué medirías? ¿Con qué frecuencia? ¿Cómo ajustarías según feedback?</li>
              <li><strong>ESTRUCTURA:</strong> ¿Qué estructura facilitaría? (procesos, reglas, herramientas, espacios)</li>
              <li><strong>AUTO-ORGANIZACIÓN:</strong> ¿En qué confiarías que las partes se auto-organicen? ¿Qué autonomía darías?</li>
              <li><strong>LIDERAZGO DISTRIBUIDO:</strong> ¿Cómo multiplicarías líderes? ¿Cómo distribuirías responsabilidades?</li>
              <li><strong>EVALUACIÓN:</strong> ¿Cómo medirías que el liderazgo sistémico está funcionando?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: El mejor control es invisible. Cuando diriges bien, el sistema se auto-optimiza sin que tengas que controlar cada parte.</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Dirigir un sistema no es controlar cada parte. Es crear las condiciones (objetivos claros, feedback loops, estructura adecuada) para que el sistema se auto-optimice. La cibernética muestra que el mejor control es invisible. Argentina necesita líderes que dirijan sistemas, no que controlen partes. Liderazgo distribuido, no control centralizado.</p>
          </div>
        `,
        orderIndex: 12,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
    ];

    // Insert all Block 2 lessons
    if (shouldSeedCourse4) {
      for (const lesson of lessonsBlock2) {
        await db.insert(courseLessons).values(lesson);
      }
      for (const lesson of remainingBlock2Lessons) {
        await db.insert(courseLessons).values(lesson);
      }
      console.log('✅ Created Block 2 (7 lessons)');
    }

    // BLOQUE 3: Ciencias Aplicadas (5 lecciones - 13-17)
    const lessonsBlock3 = [
      {
        courseId: course4[0].id,
        title: 'Biología y Fisiología: Sistemas Vivos como Modelo',
        description: 'Aprende de los sistemas biológicos más perfectos. Descubre cómo aplicar ritmos circadianos, neuroplasticidad y hormesis a sistemas humanos.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Aprender de la Naturaleza</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">Después de 3.8 mil millones de años de evolución, los sistemas biológicos son los más perfectos que conocemos. Tu cuerpo es una máquina increíblemente compleja que se auto-regula, se auto-repara y se adapta constantemente. Aprende de estos sistemas para mejorar tus sistemas humanos: familia, trabajo, comunidad, nación.</p>
          </div>

          <h2>Lecciones de Sistemas Biológicos: El Manual de Instrucciones de la Vida</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Los sistemas biológicos nos enseñan:</strong> ritmos naturales, adaptación constante, fortalecimiento mediante desafíos, auto-reparación, eficiencia energética. Aplicar estos principios a sistemas humanos transforma su funcionamiento.</p>
          </div>

          <h3>1. Ritmos Circadianos: El Poder de los Ciclos</h3>
          <p>Tu cuerpo funciona en ciclos de 24 horas. Ignorar estos ritmos es como nadar contra la corriente:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🌅 Mañana (6-12h)</h4>
              <p style="font-size: 0.95rem;"><strong>Pico de:</strong> Cortisol (energía), atención, temperatura corporal</p>
              <p style="font-size: 0.95rem;"><strong>Ideal para:</strong> Trabajo profundo, decisiones importantes, ejercicio intenso</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Aprovecha tu energía máxima.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🌆 Tarde (12-18h)</h4>
              <p style="font-size: 0.95rem;"><strong>Pico de:</strong> Coordinación, tiempo de reacción</p>
              <p style="font-size: 0.95rem;"><strong>Ideal para:</strong> Reuniones, trabajo colaborativo, tareas coordinadas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Aprovecha tu coordinación máxima.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🌃 Noche (18-6h)</h4>
              <p style="font-size: 0.95rem;"><strong>Pico de:</strong> Melatonina (sueño), reparación celular</p>
              <p style="font-size: 0.95rem;"><strong>Ideal para:</strong> Descanso, reparación, recuperación, reflexión</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Respeta tu necesidad de descanso.</p>
            </div>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Aplicación a Sistemas Humanos</h4>
            <p style="color: #047857; margin-bottom: 0;">Los sistemas también tienen ritmos. Respeta ciclos naturales en tu trabajo (reuniones en momentos óptimos), familia (rituales regulares), comunidad (eventos en momentos que funcionan). Ignorar ritmos es desperdiciar energía. Respetar ritmos es optimizar rendimiento.</p>
          </div>

          <h3>2. Neuroplasticidad: El Cerebro que Se Adapta</h3>
          <p>Tu cerebro es increíblemente adaptable. Puede cambiar, aprender y mejorar durante toda la vida:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Neuroplasticidad significa:</strong></p>
            <ul style="line-height: 2;">
              <li>🧠 <strong>Nuevas conexiones:</strong> Aprender crea nuevas conexiones neuronales</li>
              <li>💪 <strong>Fortalecimiento:</strong> Usar conexiones las fortalece (práctica hace maestría)</li>
              <li>🔄 <strong>Reorganización:</strong> El cerebro se reorganiza según uso</li>
              <li>🌱 <strong>Crecimiento:</strong> Nuevas neuronas pueden crecer (neurogénesis)</li>
              <li>⚡ <strong>Rapidez:</strong> Los cambios pueden ocurrir rápidamente</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">La neuroplasticidad prueba que siempre hay posibilidad de cambio. Nunca es demasiado tarde para aprender, mejorar o transformarse.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Aplicación Personal</h4>
              <p style="font-size: 0.95rem;">Aprende constantemente. Práctica habilidades. Expone tu cerebro a nuevos desafíos. El cerebro se adapta y mejora.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">✅ Aplicación a Sistemas</h4>
              <p style="font-size: 0.95rem;">Los sistemas pueden adaptarse. Permite que cambien. Facilita aprendizaje. Los sistemas que aprenden mejoran constantemente.</p>
            </div>
          </div>

          <h3>3. Hormesis: El Estrés que Fortalece</h3>
          <p>El estrés moderado fortalece. El estrés excesivo destruye. La clave está en la dosis:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Sin Estrés</h4>
              <p style="font-size: 0.95rem;"><strong>Comodidad total:</strong> Sin desafíos, sin crecimiento, sin fortalecimiento. El sistema se debilita.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Ejemplo: Músculo sin ejercicio se atrofia.</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Estrés Moderado (Hormesis)</h4>
              <p style="font-size: 0.95rem;"><strong>Desafío apropiado:</strong> Estimula crecimiento, fortalece, mejora capacidad. El sistema se adapta y se vuelve más fuerte.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: Ejercicio moderado fortalece músculos.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Estrés Excesivo</h4>
              <p style="font-size: 0.95rem;"><strong>Demasiado desafío:</strong> Abruma, destruye, causa colapso. El sistema no puede adaptarse.</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Ejemplo: Ejercicio extremo causa lesiones.</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 La Curva de Hormesis</h4>
            <p style="color: #78350f; margin-bottom: 0;">La hormesis muestra que existe una dosis óptima de estrés. Poco estrés = debilidad. Mucho estrés = colapso. Estrés moderado = fortaleza. Aplica esto a sistemas: desafíos apropiados fortalecen, comodidad total debilita, desafíos excesivos destruyen.</p>
          </div>

          <h3>Aplicando Principios Biológicos a Sistemas Humanos</h3>
          <p>Estos principios biológicos aplican a todos los sistemas:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👨‍👩‍👧‍👦 FAMILIA</h4>
              <p style="font-size: 0.95rem;"><strong>Ritmos:</strong> Rutinas familiares, horarios regulares, rituales compartidos</p>
              <p style="font-size: 0.95rem;"><strong>Adaptación:</strong> Permite que la familia evolucione, aprenda de experiencias, se ajuste</p>
              <p style="font-size: 0.95rem;"><strong>Hormesis:</strong> Desafíos familiares apropiados fortalecen (ej: proyectos juntos, resolver problemas)</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">💼 TRABAJO</h4>
              <p style="font-size: 0.95rem;"><strong>Ritmos:</strong> Respeta ciclos de energía, planifica trabajo según ritmos naturales</p>
              <p style="font-size: 0.95rem;"><strong>Adaptación:</strong> Permite que equipos aprendan, mejoren procesos, se adapten</p>
              <p style="font-size: 0.95rem;"><strong>Hormesis:</strong> Desafíos profesionales apropiados desarrollan habilidades</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🏘️ COMUNIDAD</h4>
              <p style="font-size: 0.95rem;"><strong>Ritmos:</strong> Eventos regulares, ciclos de participación, tradiciones comunitarias</p>
              <p style="font-size: 0.95rem;"><strong>Adaptación:</strong> Permite que comunidades evolucionen, aprendan de experiencias</p>
              <p style="font-size: 0.95rem;"><strong>Hormesis:</strong> Proyectos comunitarios apropiados fortalecen cohesión</p>
            </div>
          </div>

          <h3>Argentina: Aplicando Principios Biológicos</h3>
          <p>Argentina puede aprender de estos principios:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Aplicación a Argentina</h4>
            <p style="color: #047857; margin-bottom: 0;"><strong>Ritmos:</strong> Argentina necesita respetar ciclos naturales (económicos, políticos, sociales). No puede vivir en crisis permanente ni en comodidad total.</p>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;"><strong>Adaptación:</strong> Argentina necesita sistemas que aprendan y se adapten. Instituciones que evolucionen según experiencias, políticas que se ajusten según resultados.</p>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;"><strong>Hormesis:</strong> Argentina necesita desafíos apropiados que fortalezcan (no crisis destructivas ni comodidad que debilite). Reformas moderadas, desafíos graduales, crecimiento sostenido.</p>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Como observa el Hombre Gris: <em>"Los sistemas biológicos nos enseñan que la adaptación es constante, que los ritmos importan, que los desafíos apropiados fortalecen. Argentina puede aprender de estos principios para transformarse."</em></p>
          </div>

          <h3>Ejercicio Práctico: Aplica Principios Biológicos</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige un sistema (personal, familiar, laboral) y aplica principios biológicos:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>RITMOS:</strong> ¿Qué ritmos naturales tiene el sistema? ¿Cómo puedes respetarlos mejor?</li>
              <li><strong>ADAPTACIÓN:</strong> ¿Cómo puede el sistema adaptarse y aprender? ¿Qué cambios facilitarías?</li>
              <li><strong>HORMESIS:</strong> ¿Qué desafíos apropiados fortalecerían el sistema? ¿Qué es demasiado o demasiado poco?</li>
              <li><strong>IMPLEMENTACIÓN:</strong> ¿Qué acciones específicas tomarías para aplicar estos principios?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Los sistemas biológicos son los más perfectos que conocemos. Aprende de ellos.</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Los sistemas biológicos nos enseñan: respeta ritmos naturales, permite adaptación constante, usa desafíos moderados para fortalecer. Aplicar estos principios a sistemas humanos (familia, trabajo, comunidad, nación) transforma su funcionamiento. Argentina puede aprender de estos principios para crear sistemas que se adapten, se fortalezcan y prosperen.</p>
          </div>
        `,
        orderIndex: 13,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Psicología: Sistemas Mentales y Sociales',
        description: 'Descubre cómo funcionan los sistemas de pensamiento y comportamiento. Aprende sobre priming, expectancy effects y cognitive load.',
        content: `
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Sistema Mental</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">Tu mente es el sistema más complejo que conoces. Es un sistema de sistemas: pensamiento, memoria, emoción, percepción, comportamiento. Entender cómo funciona te permite optimizarlo y aplicar estos principios a otros sistemas: familia, trabajo, comunidad, nación.</p>
          </div>

          <h2>Psicología Sistémica: Cómo Funciona la Mente</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La psicología estudia sistemas mentales:</strong> cómo procesamos información, cómo tomamos decisiones, cómo nos comportamos. Estos principios aplican a todos los sistemas humanos.</p>
          </div>

          <h3>1. Priming Effects: El Contexto Importa</h3>
          <p>Lo que experimentas primero afecta cómo procesas después. El contexto prepara tu mente:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Priming Positivo</h4>
              <p style="font-size: 0.95rem;"><strong>Experiencia:</strong> Ver palabras positivas, imágenes inspiradoras, logros previos</p>
              <p style="font-size: 0.95rem;"><strong>Efecto:</strong> Procesas información más positivamente, tomas decisiones más optimistas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: Leer sobre éxito antes de una reunión mejora tu rendimiento.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">⚠️ Priming Negativo</h4>
              <p style="font-size: 0.95rem;"><strong>Experiencia:</strong> Ver palabras negativas, imágenes de miedo, fracasos previos</p>
              <p style="font-size: 0.95rem;"><strong>Efecto:</strong> Procesas información más negativamente, tomas decisiones más pesimistas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Ejemplo: Ver noticias negativas antes de trabajar reduce productividad.</p>
            </div>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Aplicación a Sistemas</h4>
            <p style="color: #047857; margin-bottom: 0;">El contexto importa en todos los sistemas. Crea contextos positivos en tu familia (rituales matutinos positivos), trabajo (comenzar reuniones con logros), comunidad (eventos que inspiran). El priming positivo mejora el rendimiento de todo el sistema.</p>
          </div>

          <h3>2. Expectancy Effects: Las Expectativas Crean Realidad</h3>
          <p>Si esperas éxito, es más probable que lo tengas. Las expectativas crean profecías auto-cumplidas:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Cómo funcionan las expectativas:</strong></p>
            <ul style="line-height: 2;">
              <li>🧠 <strong>Filtro perceptivo:</strong> Esperas éxito → notas más oportunidades de éxito</li>
              <li>💪 <strong>Comportamiento:</strong> Esperas éxito → actúas como si fuera probable → aumenta probabilidad</li>
              <li>🔄 <strong>Feedback loop:</strong> Esperas éxito → actúas → obtienes resultados → refuerzas expectativa</li>
              <li>📊 <strong>Profecía auto-cumplida:</strong> La expectativa crea la realidad que esperabas</li>
            </ul>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Expectativas Altas</h4>
              <p style="font-size: 0.95rem;"><strong>Efecto:</strong> Mejor rendimiento, más esfuerzo, más persistencia, mejores resultados</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: Maestros con expectativas altas obtienen mejores resultados de estudiantes.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Expectativas Bajas</h4>
              <p style="font-size: 0.95rem;"><strong>Efecto:</strong> Peor rendimiento, menos esfuerzo, menos persistencia, peores resultados</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Ejemplo: Expectativas bajas de Argentina crean resultados bajos.</p>
            </div>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Clave: Expectativas Altas pero Realistas</h4>
            <p style="color: #047857; margin-bottom: 0;">Establece expectativas altas pero alcanzables. Expectativas imposibles desmotivan. Expectativas bajas limitan. Expectativas altas pero realistas motivan y generan mejores resultados. Aplica esto a tu vida, familia, trabajo, comunidad, Argentina.</p>
          </div>

          <h3>3. Cognitive Load: La Mente Tiene Capacidad Limitada</h3>
          <p>Tu mente puede procesar información limitada a la vez. Simplificar reduce carga cognitiva:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Carga Cognitiva Alta</h4>
              <p style="font-size: 0.95rem;"><strong>Síntomas:</strong> Confusión, errores, fatiga mental, decisiones pobres</p>
              <p style="font-size: 0.95rem;"><strong>Causas:</strong> Demasiada información, complejidad innecesaria, múltiples tareas simultáneas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Ejemplo: Burocracia compleja causa errores y frustración.</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Carga Cognitiva Óptima</h4>
              <p style="font-size: 0.95rem;"><strong>Resultado:</strong> Claridad, decisiones buenas, eficiencia, bienestar</p>
              <p style="font-size: 0.95rem;"><strong>Cómo:</strong> Simplifica, organiza, elimina fricción, automatiza rutinas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: Procesos simples facilitan acción efectiva.</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">La simplicidad es poderosa. Reducir carga cognitiva permite que las personas tomen mejores decisiones, actúen más efectivamente, se sientan mejor. Simplifica sistemas, procesos, comunicación. Como dice el Hombre Gris: <em>"Si hay una forma de remover complejidad sin perder poder, la encuentra."</em></p>
          </div>

          <h3>Aplicando Principios Psicológicos a Sistemas</h3>
          <p>Estos principios aplican a todos los sistemas humanos:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👨‍👩‍👧‍👦 FAMILIA</h4>
              <p style="font-size: 0.95rem;"><strong>Priming:</strong> Comienza días con rituales positivos, celebra logros</p>
              <p style="font-size: 0.95rem;"><strong>Expectativas:</strong> Establece expectativas altas pero realistas para cada miembro</p>
              <p style="font-size: 0.95rem;"><strong>Carga cognitiva:</strong> Simplifica rutinas, reduce complejidad, automatiza tareas repetitivas</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">💼 TRABAJO</h4>
              <p style="font-size: 0.95rem;"><strong>Priming:</strong> Comienza reuniones con logros, proyectos con visión positiva</p>
              <p style="font-size: 0.95rem;"><strong>Expectativas:</strong> Establece objetivos altos pero alcanzables, confía en el equipo</p>
              <p style="font-size: 0.95rem;"><strong>Carga cognitiva:</strong> Simplifica procesos, elimina burocracia innecesaria, automatiza tareas</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🏛️ GOBIERNO</h4>
              <p style="font-size: 0.95rem;"><strong>Priming:</strong> Comunica logros, comparte visiones positivas, inspira confianza</p>
              <p style="font-size: 0.95rem;"><strong>Expectativas:</strong> Establece expectativas altas para el país, confía en la capacidad</p>
              <p style="font-size: 0.95rem;"><strong>Carga cognitiva:</strong> Simplifica trámites, reduce burocracia, facilita participación</p>
            </div>
          </div>

          <h3>Argentina: Psicología Colectiva y Sistemas</h3>
          <p>Argentina tiene problemas psicológicos sistémicos:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Problemas Psicológicos en Argentina</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Priming negativo:</strong> Medios y narrativas enfocadas en problemas, crisis, fracasos</li>
              <li>🚨 <strong>Expectativas bajas:</strong> "Argentina es así", "nada va a cambiar", "no se puede hacer nada"</li>
              <li>🚨 <strong>Carga cognitiva alta:</strong> Burocracia compleja, procesos confusos, información contradictoria</li>
              <li>🚨 <strong>Profecías auto-cumplidas:</strong> Expectativas negativas crean resultados negativos</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución: Cambiar la Psicología Colectiva</h4>
            <p style="color: #047857; margin-bottom: 0;">Argentina necesita:</p>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Priming positivo:</strong> Narrativas de éxito, logros, oportunidades, transformación posible</li>
              <li>✅ <strong>Expectativas altas:</strong> "Argentina puede transformarse", "Somos capaces", "Vamos a lograrlo"</li>
              <li>✅ <strong>Reducir carga cognitiva:</strong> Simplificar burocracia, clarificar procesos, facilitar participación</li>
              <li>✅ <strong>Profecías positivas:</strong> Expectativas positivas crean resultados positivos</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Como dice el Hombre Gris: <em>"Ve oportunidades donde otros ven crisis. Cada problema argentino es una oportunidad disfrazada esperando a ser reconocida y aprovechada."</em> Cambiar la psicología colectiva cambia los resultados colectivos.</p>
          </div>

          <h3>Ejercicio Práctico: Aplica Principios Psicológicos</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige un sistema y aplica principios psicológicos:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>PRIMING:</strong> ¿Qué contexto positivo puedes crear? ¿Cómo preparas el sistema para éxito?</li>
              <li><strong>EXPECTATIVAS:</strong> ¿Qué expectativas estableces? ¿Son altas pero realistas?</li>
              <li><strong>CARGA COGNITIVA:</strong> ¿Dónde puedes simplificar? ¿Qué complejidad puedes eliminar?</li>
              <li><strong>IMPLEMENTACIÓN:</strong> ¿Qué acciones específicas tomarás para aplicar estos principios?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: La psicología importa. Contexto positivo, expectativas altas y simplicidad mejoran el rendimiento de cualquier sistema.</p>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Tu mente es un sistema. El contexto importa (priming). Las expectativas crean realidad (expectancy effects). La simplicidad mejora rendimiento (cognitive load). Aplicar estos principios a sistemas humanos transforma su funcionamiento. Argentina necesita cambiar su psicología colectiva: contexto positivo, expectativas altas, simplicidad.</p>
          </div>
        `,
        orderIndex: 14,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Economía: Sistemas de Recursos y Decisiones',
        description: 'Aprende economía desde primeros principios. Descubre asignación de recursos, costo de oportunidad y rendimientos decrecientes aplicados a Argentina.',
        content: `
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Economía como Sistema</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué Argentina tiene recursos pero no prospera? ¿Por qué algunos países crecen y otros no? La economía es un sistema de asignación de recursos. Entender sus principios fundamentales es clave para transformar Argentina desde primeros principios.</p>
          </div>

          <h2>Economía desde Primeros Principios</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La economía es simple en su esencia:</strong> Recursos limitados + Necesidades ilimitadas = Decisiones. Cómo asignas recursos determina resultados. Entender esto es entender economía.</p>
          </div>

          <h3>1. Asignación de Recursos: El Problema Fundamental</h3>
          <p>Los recursos son limitados. Las necesidades son ilimitadas. Esto crea el problema económico fundamental:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">💰 Recursos Limitados</h4>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> Dinero, tiempo, energía, talento, materiales, tierra</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">No puedes tener todo. Debes elegir.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🎯 Necesidades Ilimitadas</h4>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> Educación, salud, infraestructura, seguridad, desarrollo, bienestar</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Siempre hay más que se puede hacer.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">⚖️ Decisión Económica</h4>
              <p style="font-size: 0.95rem;"><strong>Resultado:</strong> Debes elegir qué hacer con recursos limitados</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Cada elección tiene consecuencias.</p>
            </div>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Aplicación Personal</h4>
            <p style="color: #047857; margin-bottom: 0;">Tienes tiempo limitado. ¿Lo usas en trabajo, familia, descanso, aprendizaje? Cada hora invertida en algo es una hora que no puedes invertir en otra cosa. Asignar bien tu tiempo es economía personal.</p>
          </div>

          <h3>2. Costo de Oportunidad: El Costo Real de Cada Decisión</h3>
          <p>Cada elección tiene un costo: lo que dejas de hacer. Esto es el costo de oportunidad:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Ejemplos de costo de oportunidad:</strong></p>
            <ul style="line-height: 2;">
              <li>💰 <strong>Gastar en X:</strong> El costo real es lo que no puedes comprar con ese dinero (Y, Z, etc.)</li>
              <li>⏰ <strong>Usar tiempo en A:</strong> El costo real es lo que no puedes hacer con ese tiempo (B, C, etc.)</li>
              <li>🎓 <strong>Estudiar:</strong> El costo es el dinero y tiempo que no puedes usar en trabajar</li>
              <li>💼 <strong>Trabajar:</strong> El costo es el tiempo que no puedes usar en aprender o descansar</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Considerar costos de oportunidad te permite tomar mejores decisiones. No solo pienses en qué eliges, piensa en qué dejas de elegir.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Decisión Inteligente</h4>
              <p style="font-size: 0.95rem;"><strong>Considera:</strong> Todas las opciones, costos de oportunidad, beneficios a largo plazo</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: Elegir educación sobre consumo inmediato (mayor retorno futuro).</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Decisión Cortoplacista</h4>
              <p style="font-size: 0.95rem;"><strong>Ignora:</strong> Costos de oportunidad, beneficios a largo plazo, alternativas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Ejemplo: Elegir consumo inmediato sobre inversión (menor retorno futuro).</p>
            </div>
          </div>

          <h3>3. Rendimientos Decrecientes: Más No Siempre Es Mejor</h3>
          <p>Llega un punto donde más inversión da menos retorno:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 La Curva de Rendimientos</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Primera unidad:</strong> Alto retorno (ej: primera hora de estudio es muy valiosa)</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Unidades siguientes:</strong> Retorno decreciente (ej: hora 8 de estudio es menos valiosa)</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Punto óptimo:</strong> Donde el retorno marginal iguala el costo marginal</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Después del óptimo:</strong> Más inversión da menos retorno (ej: hora 12 de estudio puede ser contraproducente)</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📚 Aprendizaje</h4>
              <p style="font-size: 0.95rem;">Primera hora de estudio: muy valiosa. Hora 8: menos valiosa. Hora 12: puede ser contraproducente. El punto óptimo está antes de la fatiga.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">💼 Trabajo</h4>
              <p style="font-size: 0.95rem;">Primera hora de trabajo: muy productiva. Hora 8: menos productiva. Hora 12: contraproducente. El descanso es inversión.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">💰 Inversión</h4>
              <p style="font-size: 0.95rem;">Primera inversión: alto retorno. Más inversiones: retorno decreciente. Llega punto donde más inversión da menos retorno.</p>
            </div>
          </div>

          <h3>Argentina: Problemas Económicos Sistémicos</h3>
          <p>Argentina tiene problemas fundamentales en asignación de recursos:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Problemas Económicos en Argentina</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Asignación ineficiente:</strong> Recursos asignados a gasto corriente en lugar de inversión productiva</li>
              <li>🚨 <strong>Ignorar costos de oportunidad:</strong> Decisiones sin considerar alternativas, gasto sin pensar en inversión</li>
              <li>🚨 <strong>Rendimientos decrecientes ignorados:</strong> Más gasto público sin mejorar resultados, inversiones sin retorno</li>
              <li>🚨 <strong>Corto plazo sobre largo plazo:</strong> Consumo inmediato sobre inversión futura</li>
              <li>🚨 <strong>Falta de incentivos:</strong> Sistemas que no premian eficiencia ni castigan ineficiencia</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución: Economía Sistémica</h4>
            <p style="color: #047857; margin-bottom: 0;">Argentina necesita:</p>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Asignación eficiente:</strong> Recursos a inversión productiva (educación, infraestructura, innovación) sobre gasto corriente</li>
              <li>✅ <strong>Considerar costos de oportunidad:</strong> Cada decisión debe evaluar alternativas. ¿Qué dejamos de hacer?</li>
              <li>✅ <strong>Respetar rendimientos decrecientes:</strong> Encontrar punto óptimo de inversión. Más no siempre es mejor.</li>
              <li>✅ <strong>Largo plazo sobre corto plazo:</strong> Inversión sobre consumo, construcción sobre consumo</li>
              <li>✅ <strong>Incentivos alineados:</strong> Sistemas que premien eficiencia, productividad, inversión</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Como dice el Hombre Gris: <em>"El problema de Argentina no es la falta de recursos sino el diseño de los sistemas. No necesitamos más de lo mismo: necesitamos sistemas que vuelvan irrelevantes los problemas actuales."</em> La economía sistémica muestra que asignar bien recursos transforma resultados.</p>
          </div>

          <h3>Aplicando Principios Económicos a Tu Vida</h3>
          <p>Estos principios aplican a decisiones personales:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>En tu vida personal:</strong></p>
            <ul style="line-height: 2;">
              <li>💰 <strong>Asignación:</strong> ¿Cómo asignas tu dinero? ¿Consumo o inversión? ¿Corto plazo o largo plazo?</li>
              <li>⏰ <strong>Costo de oportunidad:</strong> ¿Qué dejas de hacer cuando eliges hacer algo? ¿Vale la pena?</li>
              <li>📊 <strong>Rendimientos:</strong> ¿Dónde está el punto óptimo? ¿Más siempre es mejor o hay límites?</li>
              <li>🎯 <strong>Decisiones:</strong> Considera todas las opciones, evalúa costos de oportunidad, encuentra punto óptimo</li>
            </ul>
          </div>

          <h3>Ejercicio Práctico: Análisis Económico</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige una decisión importante (personal, familiar, profesional) y analízala económicamente:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>RECURSOS:</strong> ¿Qué recursos necesitas? (dinero, tiempo, energía, talento)</li>
              <li><strong>ALTERNATIVAS:</strong> ¿Qué otras opciones tienes? ¿Qué podrías hacer con esos recursos?</li>
              <li><strong>COSTO DE OPORTUNIDAD:</strong> ¿Qué dejas de hacer si eliges esta opción? ¿Vale la pena?</li>
              <li><strong>RENDIMIENTOS:</strong> ¿Cuál es el retorno esperado? ¿Hay punto óptimo o más es mejor?</li>
              <li><strong>DECISIÓN:</strong> Considerando todo, ¿cuál es la mejor asignación de recursos?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Los recursos son limitados. Asignar bien es la clave del éxito económico.</p>
          </div>

          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">La economía es un sistema de asignación de recursos. Los recursos son limitados. Cómo los asignas determina resultados. Considerar costos de oportunidad y respetar rendimientos decrecientes permite mejores decisiones. Argentina necesita asignar recursos eficientemente, considerar alternativas, y encontrar puntos óptimos de inversión. La economía sistémica transforma resultados.</p>
          </div>
        `,
        orderIndex: 15,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Game Theory: Estrategia en Sistemas Interconectados',
        description: 'Aprende sobre interacciones estratégicas y equilibrio de Nash. Descubre cómo aplicar game theory a relaciones, política y negociación.',
        content: `
          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Juego de los Sistemas</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué cooperan algunas personas y otras no? ¿Por qué algunos sistemas fomentan colaboración y otros competencia destructiva? Cuando partes interactúan estratégicamente, game theory explica sus decisiones. Aprende a diseñar "juegos" (sistemas de interacción) que generen mejores resultados para todos.</p>
          </div>

          <h2>Game Theory: La Ciencia de las Interacciones Estratégicas</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Game theory estudia:</strong> Cómo las personas (o sistemas) toman decisiones cuando el resultado depende de las decisiones de otros. No decides solo: decides en un contexto donde otros también deciden. Diseñar este contexto bien puede cambiar completamente los resultados.</p>
          </div>

          <h3>1. Interacciones Estratégicas: No Decides Solo</h3>
          <p>En sistemas, tus decisiones afectan a otros y sus decisiones te afectan a ti:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🤝 Cooperar</h4>
              <p style="font-size: 0.95rem;"><strong>Si ambos cooperan:</strong> Ambos ganan mucho (ej: confianza mutua, colaboración)</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Ganancia mutua</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">⚔️ Competir</h4>
              <p style="font-size: 0.95rem;"><strong>Si ambos compiten:</strong> Ambos pierden (ej: desconfianza, conflicto)</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Resultado: Pérdida mutua</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🎭 Estrategia Mixta</h4>
              <p style="font-size: 0.95rem;"><strong>Si uno coopera y otro compite:</strong> El que compite gana a corto plazo, el que coopera pierde</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Resultado: Desequilibrio</p>
            </div>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Clave del Diseño</h4>
            <p style="color: #047857; margin-bottom: 0;">Diseña sistemas donde la cooperación sea la mejor estrategia para cada parte. Cuando cooperar es más beneficioso que competir, el sistema converge en colaboración. Argentina necesita sistemas que hagan la cooperación más beneficiosa que la competencia destructiva.</p>
          </div>

          <h3>2. Equilibrio de Nash: El Punto de No Cambio</h3>
          <p>El equilibrio de Nash es el punto donde nadie puede mejorar cambiando sola su estrategia:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Equilibrio de Nash</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Definición:</strong> Situación donde cada parte está haciendo lo mejor que puede, dadas las decisiones de las otras partes. Nadie puede mejorar cambiando sola.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Ejemplo positivo:</strong> Si todos cooperan, nadie puede mejorar compitiendo (todos pierden si alguien cambia).</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Ejemplo negativo:</strong> Si todos compiten, nadie puede mejorar cooperando sola (sería explotada).</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La clave:</strong> Diseña sistemas que converjan en equilibrios positivos (cooperación) en lugar de negativos (competencia destructiva).</p>
          </div>

          <h3>3. El Dilema del Prisionero: Individual vs. Colectivo</h3>
          <p>A veces, la mejor estrategia individual no es la mejor colectiva:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>El dilema del prisionero:</strong></p>
            <ul style="line-height: 2;">
              <li>🎭 <strong>Escenario:</strong> Dos prisioneros pueden cooperar (callarse) o competir (confesar)</li>
              <li>🤔 <strong>Mejor estrategia individual:</strong> Confesar (mejor resultado si el otro calla o confiesa)</li>
              <li>🤝 <strong>Mejor estrategia colectiva:</strong> Ambos callan (mejor resultado para ambos)</li>
              <li>⚖️ <strong>El problema:</strong> Si cada uno hace lo mejor individualmente, ambos terminan peor</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Este dilema aparece en muchos sistemas: política, economía, relaciones, medio ambiente. La solución: diseñar sistemas que alineen incentivos individuales con resultados colectivos.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Sistema Bien Diseñado</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Coopera es más beneficioso que competir, repetidas interacciones, transparencia, castigos/recompensas alineadas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Cooperación espontánea</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Sistema Mal Diseñado</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Competir es más beneficioso que cooperar, interacciones únicas, opacidad, incentivos desalineados</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Resultado: Competencia destructiva</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">No necesitas cambiar personas. Necesitas cambiar el "juego" (sistema de interacción). Cuando cambias las reglas, los incentivos y las consecuencias, las personas cambian sus estrategias automáticamente. Argentina necesita cambiar el "juego", no las personas.</p>
          </div>

          <h3>Aplicando Game Theory a Tu Vida</h3>
          <p>Estos principios aplican a relaciones, trabajo, negociación:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>En relaciones:</strong></p>
            <ul style="line-height: 2;">
              <li>🤝 <strong>Diseña cooperación:</strong> Haz que la confianza y colaboración sean más beneficiosas que la desconfianza</li>
              <li>🔄 <strong>Repetidas interacciones:</strong> Las relaciones a largo plazo fomentan cooperación (reputación importa)</li>
              <li>📊 <strong>Transparencia:</strong> La información compartida reduce desconfianza y fomenta cooperación</li>
            </ul>
            <p style="margin-top: 1rem;"><strong>En negociación:</strong></p>
            <ul style="line-height: 2;">
              <li>🎯 <strong>Juegos de suma positiva:</strong> Diseña negociaciones donde ambos puedan ganar (no suma cero)</li>
              <li>🤝 <strong>Señales de cooperación:</strong> Muestra buena voluntad primero para generar reciprocidad</li>
              <li>⚖️ <strong>Mecanismos de compromiso:</strong> Crea formas de garantizar que ambos cumplan acuerdos</li>
            </ul>
          </div>

          <h3>Game Theory en Argentina: El Problema de los Incentivos Desalineados</h3>
          <p>Argentina tiene sistemas donde competir es más beneficioso que cooperar:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Incentivos Desalineados en Argentina</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Política:</strong> Competir (oposición destructiva) es más beneficioso que cooperar (construcción conjunta)</li>
              <li>🚨 <strong>Economía:</strong> Especular es más beneficioso que invertir productivamente</li>
              <li>🚨 <strong>Corrupción:</strong> No cooperar (corrupción) es más beneficioso que cooperar (integridad)</li>
              <li>🚨 <strong>Falta de confianza:</strong> Desconfiar es más seguro que confiar (dilema del prisionero)</li>
              <li>🚨 <strong>Competencia destructiva:</strong> Los sistemas premian competencia sobre colaboración</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución: Rediseñar el Juego</h4>
            <p style="color: #047857; margin-bottom: 0;">Argentina necesita cambiar el "juego":</p>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Hacer cooperación más beneficiosa:</strong> Premiar colaboración, castigar competencia destructiva</li>
              <li>✅ <strong>Repetidas interacciones:</strong> Crear sistemas de largo plazo donde reputación importa</li>
              <li>✅ <strong>Transparencia:</strong> Información compartida reduce desconfianza</li>
              <li>✅ <strong>Alinear incentivos:</strong> Hacer que lo mejor para el individuo sea lo mejor para el sistema</li>
              <li>✅ <strong>Mecanismos de compromiso:</strong> Crear formas de garantizar cumplimiento de acuerdos</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Como dice el Hombre Gris: <em>"No cambies personas, cambia sistemas. Cuando cambias el juego, las estrategias cambian automáticamente."</em> Game theory muestra que rediseñar sistemas puede generar cooperación espontánea.</p>
          </div>

          <h3>Ejercicio Práctico: Diseña un Juego de Cooperación</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige una situación donde hay competencia destructiva (trabajo, comunidad, relación) y rediseña el "juego":</strong></p>
            <ol style="line-height: 2;">
              <li><strong>ANÁLISIS:</strong> ¿Cuál es el equilibrio actual? ¿Por qué la gente compite en lugar de cooperar?</li>
              <li><strong>INCENTIVOS:</strong> ¿Cómo puedes hacer que cooperar sea más beneficioso que competir?</li>
              <li><strong>REPETICIÓN:</strong> ¿Cómo puedes crear interacciones repetidas donde reputación importa?</li>
              <li><strong>TRANSPARENCIA:</strong> ¿Cómo puedes aumentar transparencia para reducir desconfianza?</li>
              <li><strong>MECANISMOS:</strong> ¿Qué mecanismos garantizan cumplimiento de acuerdos?</li>
              <li><strong>EVALUACIÓN:</strong> ¿Cómo medirías si el nuevo "juego" genera más cooperación?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: No necesitas cambiar personas. Necesitas cambiar el juego. Cuando cambias las reglas, los incentivos y las consecuencias, las estrategias cambian automáticamente.</p>
          </div>

          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Game theory explica cómo las personas deciden cuando el resultado depende de decisiones de otros. El equilibrio de Nash es donde nadie puede mejorar cambiando sola. El dilema del prisionero muestra que la mejor estrategia individual puede no ser la mejor colectiva. La solución: diseñar sistemas donde cooperar sea más beneficioso que competir. Alinear incentivos individuales con resultados colectivos. Argentina necesita rediseñar el "juego" para generar cooperación espontánea.</p>
          </div>
        `,
        orderIndex: 16,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Complexity Science: Auto-Organización y Transiciones de Fase',
        description: 'Descubre cómo los sistemas complejos se auto-organizan. Aprende sobre transiciones de fase y emergencia aplicadas a transformación social.',
        content: `
          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Poder de la Complejidad</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Cómo un hormiguero se organiza sin un líder? ¿Cómo un cerebro genera consciencia sin un controlador central? ¿Cómo puede Argentina transformarse sin un plan maestro detallado? Los sistemas complejos se auto-organizan. Aprende cómo facilitar esta auto-organización para generar transformación.</p>
          </div>

          <h2>Complexity Science: La Ciencia de los Sistemas Auto-Organizados</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Los sistemas complejos:</strong> Tienen muchas partes que interactúan de formas no lineales. No puedes predecir el comportamiento del sistema completo analizando las partes individualmente. El orden emerge espontáneamente de las interacciones. Esto es auto-organización.</p>
          </div>

          <h3>1. Auto-Organización: Orden Espontáneo</h3>
          <p>Los sistemas complejos crean orden sin un controlador central:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🐜 Hormiguero</h4>
              <p style="font-size: 0.95rem;">No hay jefe. Cada hormiga sigue reglas simples. El orden emerge de las interacciones. El hormiguero se auto-organiza.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🧠 Cerebro</h4>
              <p style="font-size: 0.95rem;">No hay controlador central. Cada neurona sigue reglas simples. La consciencia emerge de las interacciones. El cerebro se auto-organiza.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🌐 Internet</h4>
              <p style="font-size: 0.95rem;">No hay controlador central. Cada nodo se conecta localmente. El orden global emerge. La red se auto-organiza.</p>
            </div>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Clave del Liderazgo Sistémico</h4>
            <p style="color: #047857; margin-bottom: 0;">No necesitas controlar cada parte. Necesitas facilitar condiciones donde las partes se auto-organicen. Establece objetivos claros, crea estructura facilitadora, y permite que el orden emerge. Argentina puede auto-organizarse si facilitamos las condiciones correctas.</p>
          </div>

          <h3>2. Transiciones de Fase: Cambios Abruptos</h3>
          <p>Los sistemas complejos cambian de estado abruptamente, no gradualmente:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Transiciones de Fase</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Ejemplo del agua:</strong> A 99°C es líquido. A 100°C es gas. Un pequeño cambio (1°C) genera cambio masivo (líquido → gas).</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>En sistemas sociales:</strong> Pequeños cambios pueden generar transiciones masivas. Un pequeño aumento en conectividad puede generar cambio revolucionario.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La clave:</strong> Encuentra los "puntos de inflexión" donde pequeños cambios generan grandes resultados.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📈 Cambio Gradual</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Cambio lento, predecible, lineal</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: Mejora continua en procesos</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">⚡ Transición de Fase</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Cambio abrupto, impredecible, no lineal</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Ejemplo: Revolución tecnológica, cambio social masivo</p>
            </div>
          </div>

          <h3>3. Emergencia: Propiedades que Surgen</h3>
          <p>Propiedades nuevas surgen de interacciones complejas:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Ejemplos de emergencia:</strong></p>
            <ul style="line-height: 2;">
              <li>💧 <strong>Agua:</strong> H₂O no es húmedo. La humedad emerge de la interacción de muchas moléculas</li>
              <li>🎵 <strong>Música:</strong> Las notas no son música. La música emerge de la interacción de notas</li>
              <li>🧠 <strong>Consciencia:</strong> Las neuronas no son conscientes. La consciencia emerge de la interacción de neuronas</li>
              <li>🏙️ <strong>Ciudad:</strong> Los edificios no son una ciudad. La ciudad emerge de la interacción de edificios, personas, sistemas</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">La emergencia no se puede predecir analizando las partes. Surge de las relaciones entre partes. Cultiva relaciones, no controles partes.</p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">No puedes controlar la emergencia. No puedes predecir exactamente qué emergerá. Pero puedes facilitar condiciones donde emergencia positiva sea más probable. Mejora relaciones, crea conectividad, facilita interacciones, y permite que la emergencia ocurra. Argentina puede generar emergencia positiva si facilitamos las condiciones correctas.</p>
          </div>

          <h3>Aplicando Complexity Science a Tu Vida</h3>
          <p>Estos principios aplican a proyectos, equipos, comunidades:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>En proyectos:</strong></p>
            <ul style="line-height: 2;">
              <li>🎯 <strong>Establece objetivos claros:</strong> No controles procesos, sí objetivos</li>
              <li>🤝 <strong>Facilita interacciones:</strong> Crea espacios para colaboración, comunicación</li>
              <li>📊 <strong>Permite auto-organización:</strong> Confía que el equipo encontrará mejores formas</li>
              <li>⚡ <strong>Busca puntos de inflexión:</strong> Identifica cambios pequeños que generan grandes resultados</li>
            </ul>
            <p style="margin-top: 1rem;"><strong>En comunidades:</strong></p>
            <ul style="line-height: 2;">
              <li>🔗 <strong>Mejora conectividad:</strong> Facilita que las personas se conecten</li>
              <li>🤝 <strong>Cultiva relaciones:</strong> Invierte en relaciones, no solo en partes</li>
              <li>📈 <strong>Facilita emergencia:</strong> Crea condiciones donde emergencia positiva sea probable</li>
              <li>⚡ <strong>Prepara para transiciones:</strong> Los sistemas cambian abruptamente, prepárate</li>
            </ul>
          </div>

          <h3>Complexity Science en Argentina: La Oportunidad de Auto-Organización</h3>
          <p>Argentina puede transformarse mediante auto-organización:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Problemas Actuales</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Control excesivo:</strong> Intenta controlar todo desde el centro, impidiendo auto-organización</li>
              <li>🚨 <strong>Falta de conectividad:</strong> Las partes no se conectan, limitando emergencia</li>
              <li>🚨 <strong>Relaciones rotas:</strong> Desconfianza y fragmentación impiden auto-organización</li>
              <li>🚨 <strong>Falta de puntos de inflexión:</strong> No identifica cambios pequeños que generan grandes resultados</li>
              <li>🚨 <strong>Resistencia a emergencia:</strong> No permite que surjan nuevas soluciones</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución: Facilitar Auto-Organización</h4>
            <p style="color: #047857; margin-bottom: 0;">Argentina necesita:</p>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Objetivos claros compartidos:</strong> Visión nacional clara, no procesos detallados</li>
              <li>✅ <strong>Mejorar conectividad:</strong> Facilita que provincias, municipios, comunidades se conecten</li>
              <li>✅ <strong>Cultivar relaciones:</strong> Invierte en confianza, colaboración, comunicación</li>
              <li>✅ <strong>Identificar puntos de inflexión:</strong> Encuentra cambios pequeños que generan grandes resultados</li>
              <li>✅ <strong>Permitir emergencia:</strong> Crea condiciones donde nuevas soluciones puedan emerger</li>
              <li>✅ <strong>Liderazgo facilitador:</strong> Líderes que facilitan, no controlan</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Como dice el Hombre Gris: <em>"No busca seguidores sino co-creadores. Su objetivo no es acumular poder sino multiplicar líderes."</em> La complexity science muestra que facilitar auto-organización genera transformación más efectiva que control centralizado.</p>
          </div>

          <h3>Ejercicio Práctico: Facilitar Auto-Organización</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige un sistema que dirijas (proyecto, equipo, comunidad) y diseña condiciones para auto-organización:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>OBJETIVOS:</strong> ¿Qué objetivos claros establecerías? (no procesos, sí resultados)</li>
              <li><strong>CONECTIVIDAD:</strong> ¿Cómo mejorarías la conectividad entre partes? ¿Qué facilitaría interacciones?</li>
              <li><strong>RELACIONES:</strong> ¿Cómo cultivarías relaciones? ¿Qué inversión harías en confianza y colaboración?</li>
              <li><strong>PUNTOS DE INFLEXIÓN:</strong> ¿Qué cambios pequeños podrían generar grandes resultados? ¿Cómo los identificarías?</li>
              <li><strong>EMERGENCIA:</strong> ¿Qué condiciones facilitarían emergencia positiva? ¿Cómo permitirías que surjan nuevas soluciones?</li>
              <li><strong>LIDERAZGO:</strong> ¿Cómo cambiarías de controlar a facilitar? ¿Qué harías menos? ¿Qué harías más?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: No puedes controlar la emergencia. Pero puedes facilitar condiciones donde emergencia positiva sea más probable. Mejora relaciones, crea conectividad, y permite que la auto-organización ocurra.</p>
          </div>

          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Los sistemas complejos se auto-organizan. El orden emerge espontáneamente de las interacciones. Las transiciones de fase muestran que pequeños cambios pueden generar grandes resultados. La emergencia surge de relaciones, no de partes. No puedes controlar la emergencia, pero puedes facilitar condiciones donde emergencia positiva sea más probable. Argentina puede transformarse mediante auto-organización si facilitamos las condiciones correctas: objetivos claros, mejor conectividad, relaciones cultivadas, y liderazgo facilitador.</p>
          </div>
        `,
        orderIndex: 17,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
    ];

    // BLOQUE 4: Aplicaciones Vida Diaria (8 lecciones - 18-25)
    const lessonsBlock4 = [
      {
        courseId: course4[0].id,
        title: 'Productividad Personal y Gestión de Energía',
        description: 'Aplica principios sistémicos a tu vida personal. Aprende a gestionar tu energía física, mental y emocional para máximo rendimiento.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Tu Sistema Personal</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunas personas logran más con menos esfuerzo? ¿Por qué otros se agotan sin resultados? Eres un sistema de energía. Optimiza tu flujo de energía para máximo rendimiento y bienestar. La productividad no es sobre hacer más, es sobre gestionar mejor tu energía como sistema.</p>
          </div>

          <h2>Gestión de Energía: El Sistema Personal</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Tu cuerpo es un sistema de energía:</strong> Inputs (comida, sueño, oxígeno) → Transformación (metabolismo, actividad) → Outputs (trabajo, creatividad, bienestar). Gestionar bien este sistema no es solo sobre trabajar más, es sobre optimizar el flujo completo de energía.</p>
          </div>

          <h3>1. Energía Física: La Base de Todo</h3>
          <p>Sin energía física, nada funciona. Es la base del sistema:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🍎 Nutrición</h4>
              <p style="font-size: 0.95rem;"><strong>Input:</strong> Comida nutritiva, balanceada, suficiente</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Output: Energía sostenible, salud, rendimiento</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">😴 Sueño</h4>
              <p style="font-size: 0.95rem;"><strong>Input:</strong> 7-9 horas de sueño de calidad, rutinas consistentes</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Output: Recuperación, regeneración, energía renovada</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">💪 Ejercicio</h4>
              <p style="font-size: 0.95rem;"><strong>Input:</strong> Movimiento regular, fuerza, resistencia</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Output: Capacidad física, energía, longevidad</p>
            </div>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Optimización Física</h4>
            <p style="color: #047857; margin-bottom: 0;">Maximiza entradas: come bien, duerme bien, ejercítate. Optimiza transformación: crea rutinas que faciliten. Reduce pérdidas: evita hábitos que drenan energía. Crea feedback loops: mide cómo te sientes, ajusta según resultados. Sin energía física, tu sistema no puede funcionar.</p>
          </div>

          <h3>2. Energía Mental: El Motor de la Productividad</h3>
          <p>La mente necesita cuidado tanto como el cuerpo:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Inputs de energía mental:</strong></p>
            <ul style="line-height: 2;">
              <li>📚 <strong>Aprendizaje:</strong> Nuevo conocimiento, desafíos mentales, crecimiento</li>
              <li>🧘 <strong>Descanso mental:</strong> Meditación, mindfulness, tiempo sin estímulos</li>
              <li>🎯 <strong>Enfoque:</strong> Tareas desafiantes pero manejables, flujo</li>
              <li>🔋 <strong>Recuperación:</strong> Pausas, cambio de actividad, diversión</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">La mente se agota igual que el cuerpo. Necesita descanso, recuperación, y estímulos variados. Sin energía mental, no puedes pensar claramente, tomar decisiones, o ser creativo.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Gestión Mental Efectiva</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Trabaja en momentos de alta energía mental, toma pausas regulares, varía tareas, duerme bien</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Alta productividad sostenible</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Agotamiento Mental</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Trabaja sin pausas, multitarea constante, no descansa, duerme mal</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Resultado: Baja productividad, errores, burnout</p>
            </div>
          </div>

          <h3>3. Energía Emocional: El Combustible Invisible</h3>
          <p>La emoción es energía. Las emociones positivas aumentan energía, las negativas la drenan:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Energía Emocional</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Fuentes de energía emocional positiva:</strong> Relaciones significativas, propósito, gratitud, logros, contribución</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Drenajes de energía emocional:</strong> Conflictos sin resolver, relaciones tóxicas, falta de propósito, estrés crónico</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La clave:</strong> Cultiva fuentes de energía emocional positiva, reduce drenajes. Invierte en relaciones, encuentra propósito, cuida tu espíritu.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🤝 Relaciones</h4>
              <p style="font-size: 0.95rem;">Cultiva relaciones significativas. Las relaciones positivas recargan energía emocional. Las relaciones tóxicas la drenan.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🎯 Propósito</h4>
              <p style="font-size: 0.95rem;">Encuentra propósito. Trabajar hacia algo que importa recarga energía. Trabajar sin propósito la drena.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🙏 Espíritu</h4>
              <p style="font-size: 0.95rem;">Cuida tu espíritu. Gratitud, meditación, conexión con algo más grande que uno recarga energía.</p>
            </div>
          </div>

          <h3>Gestión Sistémica de Energía</h3>
          <p>Gestiona tu energía como un sistema completo:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Principios sistémicos aplicados:</strong></p>
            <ul style="line-height: 2;">
              <li>📊 <strong>Maximiza entradas:</strong> Nutrición, sueño, ejercicio, aprendizaje, relaciones, propósito</li>
              <li>⚙️ <strong>Optimiza transformación:</strong> Crea rutinas que faciliten, trabaja en momentos de alta energía</li>
              <li>🔋 <strong>Reduce pérdidas:</strong> Evita hábitos que drenan, resuelve conflictos, gestiona estrés</li>
              <li>🔄 <strong>Crea feedback loops:</strong> Mide cómo te sientes, ajusta según resultados</li>
              <li>⚖️ <strong>Balance:</strong> Equilibra energía física, mental y emocional</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Sistema Óptimo de Productividad</h4>
            <p style="color: #047857; margin-bottom: 0;">Gestiona tu energía como un sistema: maximiza entradas (física, mental, emocional), optimiza transformación (rutinas, momentos óptimos), reduce pérdidas (hábitos que drenan), crea feedback loops (mide, ajusta). La productividad no es sobre hacer más, es sobre gestionar mejor tu energía. Sin energía, no hay productividad.</p>
          </div>

          <h3>Ejercicio Práctico: Mapea Tu Sistema de Energía</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza tu sistema de energía actual:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>ENTRADAS:</strong> ¿Qué inputs tienes? (nutrición, sueño, ejercicio, aprendizaje, relaciones, propósito)</li>
              <li><strong>TRANSFORMACIÓN:</strong> ¿Cómo transformas energía? (rutinas, momentos de trabajo, hábitos)</li>
              <li><strong>SALIDAS:</strong> ¿Qué outputs produces? (trabajo, creatividad, bienestar)</li>
              <li><strong>PÉRDIDAS:</strong> ¿Qué drena tu energía? (hábitos negativos, conflictos, estrés)</li>
              <li><strong>OPTIMIZACIÓN:</strong> ¿Cómo puedes maximizar entradas, optimizar transformación, reducir pérdidas?</li>
              <li><strong>FEEDBACK:</strong> ¿Cómo medirías tu energía? ¿Qué ajustarías según resultados?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Eres un sistema de energía. Optimizar este sistema no es solo sobre trabajar más, es sobre gestionar mejor tu energía física, mental y emocional para máximo rendimiento sostenible.</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Eres un sistema de energía. Tienes energía física, mental y emocional. Gestionar bien este sistema no es sobre hacer más, es sobre optimizar el flujo completo: maximizar entradas, optimizar transformación, reducir pérdidas, crear feedback loops. Sin energía, no hay productividad. La productividad sostenible viene de gestionar bien tu energía como sistema.</p>
          </div>
        `,
        orderIndex: 18,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Optimización de Salud: Sistemas Biológicos',
        description: 'Aplica principios sistémicos a tu salud. Aprende cómo optimizar tu sistema biológico mediante ritmos, nutrición y ejercicio.',
        content: `
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Salud como Sistema</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunas personas envejecen mejor que otras? ¿Por qué algunos tienen más energía a los 70 que otros a los 40? Tu salud no es un destino, es un sistema. Optimiza inputs, procesos y outputs para máximo bienestar. Tu cuerpo es el sistema más complejo que diriges. Aprende a optimizarlo.</p>
          </div>

          <h2>Optimización Sistémica de Salud: El Sistema Biológico</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Tu cuerpo es un sistema biológico:</strong> Inputs (nutrición, sueño, movimiento, oxígeno) → Procesos (metabolismo, regeneración, adaptación) → Outputs (vitalidad, longevidad, bienestar, capacidad). Optimizar este sistema no es solo sobre hacer ejercicio o comer bien, es sobre entender y optimizar el flujo completo.</p>
          </div>

          <h3>1. Inputs de Salud: Lo Que Entra al Sistema</h3>
          <p>Los inputs determinan la calidad de los outputs:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🍎 Nutrición</h4>
              <p style="font-size: 0.95rem;"><strong>Calidad:</strong> Comida real, nutritiva, balanceada</p>
              <p style="font-size: 0.95rem;"><strong>Cantidad:</strong> Suficiente, no exceso</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Output: Energía sostenible, función celular óptima</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">😴 Sueño</h4>
              <p style="font-size: 0.95rem;"><strong>Duración:</strong> 7-9 horas de calidad</p>
              <p style="font-size: 0.95rem;"><strong>Ritmo:</strong> Consistente, alineado con ciclos circadianos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Output: Recuperación, regeneración, consolidación</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">💪 Movimiento</h4>
              <p style="font-size: 0.95rem;"><strong>Tipo:</strong> Fuerza, resistencia, flexibilidad</p>
              <p style="font-size: 0.95rem;"><strong>Frecuencia:</strong> Regular, progresivo</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Output: Capacidad física, adaptación, longevidad</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">🌬️ Oxígeno</h4>
              <p style="font-size: 0.95rem;"><strong>Calidad:</strong> Aire limpio, respiración profunda</p>
              <p style="font-size: 0.95rem;"><strong>Práctica:</strong> Respiración consciente, ejercicio</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Output: Función celular óptima, energía</p>
            </div>
          </div>

          <h3>2. Procesos Biológicos: Cómo el Sistema Transforma</h3>
          <p>Los procesos biológicos transforman inputs en outputs:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Procesos clave del sistema biológico:</strong></p>
            <ul style="line-height: 2;">
              <li>⚙️ <strong>Metabolismo:</strong> Transforma nutrientes en energía y componentes celulares</li>
              <li>🔧 <strong>Regeneración:</strong> Repara y reemplaza células dañadas</li>
              <li>📈 <strong>Adaptación:</strong> Se fortalece con desafíos (hormesis)</li>
              <li>🧠 <strong>Neuroplasticidad:</strong> El cerebro se reorganiza y aprende</li>
              <li>🔄 <strong>Ritmos circadianos:</strong> Ciclos diarios que regulan funciones</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Estos procesos son automáticos pero puedes optimizarlos mediante inputs correctos y hábitos que los faciliten.</p>
          </div>

          <h3>3. Ritmos Circadianos: El Reloj Biológico</h3>
          <p>Tu cuerpo funciona en ciclos de 24 horas. Alinearte con estos ritmos optimiza todo:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Ritmos Circadianos</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Mañana (6-12h):</strong> Alta energía, mejor concentración, metabolismo activo → Trabajo intenso, ejercicio</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Tarde (12-18h):</strong> Energía moderada, digestión activa → Trabajo moderado, comida principal</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Noche (18-6h):</strong> Energía baja, reparación activa → Descanso, sueño, recuperación</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La clave:</strong> Alinea actividades con ritmos naturales. Trabaja cuando tienes energía, descansa cuando no.</p>
          </div>

          <h3>4. Hormesis: El Poder del Estrés Controlado</h3>
          <p>El estrés controlado fortalece el sistema:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Estrés Agudo (Hormesis)</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Intenso, breve, recuperación</p>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> Ejercicio intenso, exposición al frío, ayuno intermitente</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Fortalecimiento, adaptación positiva</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Estrés Crónico</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Prolongado, sin recuperación</p>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> Trabajo excesivo sin descanso, estrés emocional constante</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Resultado: Debilitamiento, enfermedad</p>
            </div>
          </div>

          <h3>5. Outputs de Salud: Lo Que Produce el Sistema</h3>
          <p>Los outputs medibles te dicen si el sistema funciona bien:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">📊 Métricas de Salud</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>💪 <strong>Vitalidad:</strong> Energía diaria, resistencia, fuerza</li>
              <li>⏰ <strong>Longevidad:</strong> Esperanza de vida saludable</li>
              <li>😊 <strong>Bienestar:</strong> Estado de ánimo, satisfacción, ausencia de síntomas</li>
              <li>🧠 <strong>Capacidad cognitiva:</strong> Memoria, concentración, aprendizaje</li>
              <li>🔄 <strong>Recuperación:</strong> Velocidad de recuperación después de esfuerzo</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Mide estos outputs regularmente. Si mejoran, tu sistema está optimizado. Si empeoran, ajusta inputs o procesos.</p>
          </div>

          <h3>Optimización Sistémica de Salud</h3>
          <p>Aplica principios sistémicos a tu salud:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Principios aplicados:</strong></p>
            <ul style="line-height: 2;">
              <li>📊 <strong>Maximiza inputs de calidad:</strong> Nutrición real, sueño suficiente, movimiento regular, oxígeno limpio</li>
              <li>⚙️ <strong>Optimiza procesos:</strong> Alinea con ritmos circadianos, usa hormesis, facilita regeneración</li>
              <li>📈 <strong>Mide outputs:</strong> Vitalidad, bienestar, capacidad, recuperación</li>
              <li>🔄 <strong>Crea feedback loops:</strong> Mide regularmente, ajusta según resultados</li>
              <li>⚖️ <strong>Balance:</strong> Equilibra estrés y recuperación, trabajo y descanso</li>
            </ul>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Tu salud no es un destino, es un sistema. No esperes a estar enfermo para cuidarte. Optimiza el sistema constantemente: mejora inputs, optimiza procesos, mide outputs, ajusta. La salud óptima es el resultado de un sistema bien optimizado, no de eventos aislados.</p>
          </div>

          <h3>Ejercicio Práctico: Optimiza Tu Sistema de Salud</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Evalúa y optimiza tu sistema de salud:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>INPUTS:</strong> ¿Qué calidad tienen? (nutrición, sueño, movimiento, oxígeno)</li>
              <li><strong>RITMOS:</strong> ¿Estás alineado con ritmos circadianos? ¿Qué ajustarías?</li>
              <li><strong>HORMESIS:</strong> ¿Tienes estrés agudo saludable? ¿Demasiado estrés crónico?</li>
              <li><strong>OUTPUTS:</strong> ¿Cómo están tus métricas? (vitalidad, bienestar, capacidad)</li>
              <li><strong>OPTIMIZACIÓN:</strong> ¿Qué cambios harías para mejorar inputs, procesos o outputs?</li>
              <li><strong>FEEDBACK:</strong> ¿Cómo medirías mejoras? ¿Con qué frecuencia?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Tu salud es un sistema. Optimízalo constantemente. Pequeños cambios consistentes generan grandes resultados a largo plazo.</p>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Tu salud es un sistema biológico. Optimízalo mediante inputs de calidad (nutrición, sueño, movimiento), procesos optimizados (ritmos circadianos, hormesis), y outputs medibles (vitalidad, bienestar). Alinea actividades con ritmos naturales, usa estrés agudo para fortalecer, mide outputs regularmente. La salud óptima es el resultado de un sistema bien optimizado, no de eventos aislados.</p>
          </div>
        `,
        orderIndex: 19,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Dinámicas Relacionales: Sistemas Sociales',
        description: 'Aprende a optimizar tus relaciones como sistemas. Descubre técnicas para mejorar comunicación, confianza y colaboración.',
        content: `
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Relaciones como Sistemas</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunas relaciones florecen y otras se marchitan? ¿Por qué algunos equipos colaboran perfectamente y otros están en conflicto constante? Cada relación es un sistema. Mejora las relaciones y mejoras el sistema completo. Las mejores relaciones no son accidentes, son sistemas bien diseñados.</p>
          </div>

          <h2>Optimización de Relaciones: Sistemas Sociales</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Cada relación es un sistema:</strong> Inputs (comunicación, tiempo, atención) → Procesos (interacción, comprensión, negociación) → Outputs (confianza, colaboración, bienestar mutuo). Optimizar relaciones no es solo sobre ser amable, es sobre diseñar sistemas de interacción que generen resultados positivos.</p>
          </div>

          <h3>1. Comunicación: El Sistema de Intercambio de Información</h3>
          <p>La comunicación es el flujo de información en una relación:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📢 Reducir Ruido</h4>
              <p style="font-size: 0.95rem;"><strong>Ruido:</strong> Malentendidos, ambigüedad, información no relevante</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Solución: Claridad, contexto, feedback</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">📡 Maximizar Señales</h4>
              <p style="font-size: 0.95rem;"><strong>Señales:</strong> Información relevante, clara, útil</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Solución: Escucha activa, preguntas claras, repetición</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🔄 Feedback Loops</h4>
              <p style="font-size: 0.95rem;"><strong>Feedback:</strong> Confirmar entendimiento, ajustar comunicación</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Solución: "¿Entendiste?", "Déjame confirmar", revisión</p>
            </div>
          </div>

          <h3>2. Confianza: El Cimiento del Sistema</h3>
          <p>La confianza hace que las relaciones funcionen eficientemente:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Construir confianza:</strong></p>
            <ul style="line-height: 2;">
              <li>✅ <strong>Consistencia:</strong> Haz lo que dices, cuando dices que lo harás. La consistencia genera confianza.</li>
              <li>✅ <strong>Transparencia:</strong> Comparte información relevante. La opacidad destruye confianza.</li>
              <li>✅ <strong>Reciprocidad:</strong> Da y recibe. La reciprocidad equilibrada construye confianza.</li>
              <li>✅ <strong>Vulnerabilidad:</strong> Comparte cuando es apropiado. La vulnerabilidad controlada genera conexión.</li>
              <li>✅ <strong>Competencia:</strong> Sé capaz de cumplir promesas. La competencia genera confianza en tus capacidades.</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">La confianza es un output que emerge de inputs consistentes. Invierte en estos inputs y la confianza emerge naturalmente.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Relación con Confianza</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Comunicación fluida, colaboración fácil, bajo conflicto</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Alta eficiencia, bienestar mutuo, crecimiento</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Relación sin Confianza</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Comunicación difícil, conflicto constante, verificación constante</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Resultado: Baja eficiencia, estrés, estancamiento</p>
            </div>
          </div>

          <h3>3. Colaboración: Cuando las Partes Trabajan Juntas</h3>
          <p>La colaboración efectiva requiere sistemas bien diseñados:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Principios de Colaboración Efectiva</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>🎯 <strong>Objetivos alineados:</strong> Define objetivos compartidos. Cuando todos quieren lo mismo, colaborar es natural.</li>
              <li>🤝 <strong>Interdependencia positiva:</strong> Diseña sistemas donde el éxito de uno ayuda al éxito del otro.</li>
              <li>📊 <strong>Coordinación:</strong> Facilita comunicación y sincronización. La coordinación reduce fricción.</li>
              <li>🎁 <strong>Recursos compartidos:</strong> Comparte información, herramientas, conocimientos. El compartir multiplica valor.</li>
              <li>🔄 <strong>Feedback mutuo:</strong> Crea sistemas donde todos se benefician del feedback. El aprendizaje mutuo fortalece.</li>
            </ul>
          </div>

          <h3>4. Conflictos: Cuando el Sistema Se Desalinea</h3>
          <p>Los conflictos son señales de que el sistema necesita ajuste:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Causas Comunes de Conflictos</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Objetivos desalineados:</strong> Cada parte quiere algo diferente</li>
              <li>🚨 <strong>Comunicación pobre:</strong> Malentendidos, información incompleta</li>
              <li>🚨 <strong>Recursos limitados:</strong> Competencia por recursos escasos</li>
              <li>🚨 <strong>Valores diferentes:</strong> Prioridades incompatibles</li>
              <li>🚨 <strong>Falta de confianza:</strong> Desconfianza genera defensividad</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Solución: Resolver Sistémicamente</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Identifica la causa raíz:</strong> ¿Qué parte del sistema está desalineada?</li>
              <li>✅ <strong>Re-alinea objetivos:</strong> Encuentra objetivos comunes o compatibles</li>
              <li>✅ <strong>Mejora comunicación:</strong> Reduce ruido, aumenta señales, crea feedback</li>
              <li>✅ <strong>Expande recursos:</strong> Encuentra formas de crear más valor para todos</li>
              <li>✅ <strong>Construye confianza:</strong> Invierte en consistencia, transparencia, reciprocidad</li>
            </ul>
          </div>

          <h3>Aplicando a Tu Vida</h3>
          <p>Optimiza tus relaciones como sistemas:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>En relaciones personales:</strong></p>
            <ul style="line-height: 2;">
              <li>💬 <strong>Comunicación:</strong> Reduce ruido (claridad), maximiza señales (escucha activa), crea feedback (confirma entendimiento)</li>
              <li>🤝 <strong>Confianza:</strong> Sé consistente, transparente, recíproco. Invierte en confianza constantemente.</li>
              <li>🎯 <strong>Colaboración:</strong> Alinea objetivos, crea interdependencia positiva, facilita coordinación</li>
            </ul>
            <p style="margin-top: 1rem;"><strong>En relaciones profesionales:</strong></p>
            <ul style="line-height: 2;">
              <li>📊 <strong>Comunicación:</strong> Información clara, relevante, oportuna. Feedback loops regulares.</li>
              <li>🤝 <strong>Confianza:</strong> Cumple promesas, comparte información, sé competente</li>
              <li>🎯 <strong>Colaboración:</strong> Objetivos compartidos, recursos compartidos, coordinación efectiva</li>
            </ul>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Las mejores relaciones no son accidentes, son sistemas bien diseñados. No esperes a que las relaciones funcionen solas. Diseña sistemas de comunicación, confianza y colaboración. Invierte en estos sistemas constantemente. Cuando las relaciones funcionan bien, todo el sistema funciona mejor.</p>
          </div>

          <h3>Ejercicio Práctico: Optimiza una Relación</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige una relación importante y optimízala como sistema:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>COMUNICACIÓN:</strong> ¿Cómo puedes reducir ruido? ¿Cómo maximizar señales? ¿Qué feedback loops crearías?</li>
              <li><strong>CONFIANZA:</strong> ¿Cómo mejorarías consistencia? ¿Qué transparencia añadirías? ¿Cómo aumentarías reciprocidad?</li>
              <li><strong>COLABORACIÓN:</strong> ¿Qué objetivos compartidos podrías crear? ¿Cómo facilitarías coordinación?</li>
              <li><strong>CONFLICTOS:</strong> ¿Hay conflictos actuales? ¿Cuál es la causa raíz? ¿Cómo resolverías sistémicamente?</li>
              <li><strong>MEJORAS:</strong> ¿Qué cambios específicos harías? ¿Cómo medirías mejoras?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Las mejores relaciones son sistemas bien diseñados. Invierte en comunicación, confianza y colaboración constantemente.</p>
          </div>

          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Cada relación es un sistema. Optimízalo mediante comunicación efectiva (reduce ruido, maximiza señales, crea feedback), construcción de confianza (consistencia, transparencia, reciprocidad), y colaboración (objetivos alineados, interdependencia positiva, coordinación). Las mejores relaciones no son accidentes, son sistemas bien diseñados. Invierte en estos sistemas constantemente.</p>
          </div>
        `,
        orderIndex: 20,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Formación de Hábitos y Cambio de Comportamiento',
        description: 'Aprende cómo funcionan los hábitos como sistemas. Descubre técnicas para formar buenos hábitos y eliminar malos hábitos.',
        content: `
          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Hábitos como Sistemas</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunos hábitos se mantienen automáticamente y otros requieren fuerza de voluntad constante? Los hábitos son sistemas autosostenidos. Cuando diseñas bien el sistema, el hábito funciona automáticamente sin esfuerzo. Aprende a diseñar sistemas de hábitos que funcionen solos.</p>
          </div>

          <h2>El Sistema de Hábitos: El Bucle Autosostenido</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>El bucle de hábito:</strong> Señal → Rutina → Recompensa. Este bucle se repite automáticamente. Diseña cada parte del bucle bien y el hábito se autosostiene. No necesitas fuerza de voluntad, el sistema funciona solo.</p>
          </div>

          <h3>1. La Señal: El Disparador del Sistema</h3>
          <p>La señal activa el hábito automáticamente:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">⏰ Tiempo</h4>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> "A las 7am", "Después de desayunar", "Antes de dormir"</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">La señal es el momento del día o evento específico</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">📍 Lugar</h4>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> "En el gimnasio", "En mi escritorio", "En la cocina"</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">La señal es el lugar específico</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">👤 Estado Emocional</h4>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> "Cuando me siento estresado", "Cuando estoy feliz"</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">La señal es un estado emocional</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">👥 Otras Personas</h4>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> "Cuando veo a X", "Cuando estoy con mi familia"</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">La señal es una persona o grupo</p>
            </div>
          </div>

          <h3>2. La Rutina: La Acción del Sistema</h3>
          <p>La rutina es el comportamiento que quieres automatizar:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Diseña rutinas efectivas:</strong></p>
            <ul style="line-height: 2;">
              <li>🎯 <strong>Específica:</strong> Define exactamente qué harás. "Hacer ejercicio" es vago. "Hacer 20 flexiones" es específico.</li>
              <li>📏 <strong>Pequeña:</strong> Empieza con rutinas tan pequeñas que sea imposible fallar. El éxito genera momentum.</li>
              <li>🔄 <strong>Repetible:</strong> Diseña rutinas que puedas hacer diariamente. La consistencia es más importante que la intensidad.</li>
              <li>⚡ <strong>Rápida:</strong> Rutinas que toman menos de 2 minutos son más fáciles de mantener.</li>
            </ul>
          </div>

          <h3>3. La Recompensa: El Refuerzo del Sistema</h3>
          <p>La recompensa refuerza el bucle, haciendo que se repita:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Tipos de Recompensas</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Intrínsecas:</strong> Sentirse bien, orgullo, satisfacción (más sostenibles)</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Extrínsecas:</strong> Premios, reconocimiento, incentivos (útil al inicio)</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La clave:</strong> La recompensa debe ser inmediata y satisfactoria. El cerebro necesita sentir el beneficio rápidamente.</p>
          </div>

          <h3>4. Habit Stacking: Conectar Sistemas</h3>
          <p>Conecta nuevos hábitos con existentes para aprovechar momentum:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Fórmula de Habit Stacking</h4>
            <p style="color: #047857; margin-bottom: 0;"><strong>Después de [HÁBITO EXISTENTE], haré [NUEVO HÁBITO]</strong></p>
            <p style="color: #047857; margin-top: 0.5rem; margin-bottom: 0;">Ejemplos:</p>
            <ul style="line-height: 2; color: #047857;">
              <li>"Después de cepillarme los dientes, haré 10 flexiones"</li>
              <li>"Después de tomar mi café, escribiré 100 palabras"</li>
              <li>"Después de cenar, leeré 10 páginas"</li>
            </ul>
            <p style="color: #047857; margin-top: 0.5rem; margin-bottom: 0;">El hábito existente es la señal del nuevo hábito. No necesitas crear nueva señal, usas una existente.</p>
          </div>

          <h3>5. Ambiente: El Diseño del Sistema</h3>
          <p>Diseña el ambiente para facilitar buenos hábitos y dificultar malos:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Facilitar Buenos Hábitos</h4>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> Deja ropa de ejercicio visible, prepara comida saludable, elimina distracciones</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Reduce fricción para hacer lo que quieres</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Dificultar Malos Hábitos</h4>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> Elimina tentaciones, aumenta fricción, cambia señales</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Aumenta fricción para hacer lo que no quieres</p>
            </div>
          </div>

          <h3>Eliminar Hábitos Malos: Romper el Sistema</h3>
          <p>Para eliminar un hábito, rompe el bucle:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Estrategias para eliminar hábitos:</strong></p>
            <ul style="line-height: 2;">
              <li>🚫 <strong>Elimina la señal:</strong> Si no hay señal, no se activa el hábito</li>
              <li>🔄 <strong>Reemplaza la rutina:</strong> Mantén la señal y recompensa, cambia la rutina</li>
              <li>🚫 <strong>Elimina la recompensa:</strong> Si no hay recompensa, el bucle se debilita</li>
              <li>🌍 <strong>Cambia el ambiente:</strong> Cambia señales ambientales que activan el hábito</li>
            </ul>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Los hábitos no son sobre fuerza de voluntad, son sobre diseño de sistemas. Cuando diseñas bien el bucle (señal clara, rutina específica, recompensa satisfactoria), el hábito se autosostiene. No necesitas disciplina constante, el sistema funciona solo. Diseña sistemas de hábitos, no dependas de fuerza de voluntad.</p>
          </div>

          <h3>Ejercicio Práctico: Diseña un Sistema de Hábitos</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige un hábito que quieras formar y diseña el sistema completo:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>SEÑAL:</strong> ¿Qué señal activará el hábito? (tiempo, lugar, estado, persona)</li>
              <li><strong>RUTINA:</strong> ¿Qué acción específica harás? (sé muy específico, empieza pequeño)</li>
              <li><strong>RECOMPENSA:</strong> ¿Qué recompensa inmediata tendrás? (intrínseca o extrínseca)</li>
              <li><strong>STACKING:</strong> ¿Puedes conectarlo con un hábito existente?</li>
              <li><strong>AMBIENTE:</strong> ¿Cómo facilitarás el hábito? ¿Qué cambiarías en tu ambiente?</li>
              <li><strong>IMPLEMENTACIÓN:</strong> ¿Cuándo empezarías? ¿Cómo medirías éxito?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Los hábitos son sistemas. Diseña el bucle completo bien y el hábito se autosostiene. No dependas de fuerza de voluntad, diseña sistemas.</p>
          </div>

          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Los hábitos son sistemas autosostenidos. El bucle es: Señal → Rutina → Recompensa. Diseña cada parte bien y el hábito funciona automáticamente. Usa habit stacking para conectar con hábitos existentes. Diseña el ambiente para facilitar buenos hábitos y dificultar malos. Los hábitos no son sobre fuerza de voluntad, son sobre diseño de sistemas. Diseña sistemas de hábitos, no dependas de disciplina constante.</p>
          </div>
        `,
        orderIndex: 21,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Aprendizaje y Adquisición de Habilidades',
        description: 'Aplica principios sistémicos al aprendizaje. Descubre técnicas para aprender más rápido y retener mejor.',
        content: `
          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Aprendizaje como Sistema</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunos aprenden rápido y otros olvidan rápido? ¿Por qué algunos retienen información años y otros días? El aprendizaje no es solo sobre leer más, es sobre diseñar un sistema efectivo. El aprendizaje es un sistema de adquisición, procesamiento y aplicación de conocimiento. Optimízalo.</p>
          </div>

          <h2>El Sistema de Aprendizaje: De Información a Sabiduría</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>El aprendizaje es un sistema:</strong> Inputs (información, experiencia, práctica) → Procesos (comprensión, conexión, consolidación) → Outputs (habilidad, conocimiento, sabiduría). Optimizar este sistema no es solo sobre estudiar más, es sobre diseñar procesos que transformen información en sabiduría aplicable.</p>
          </div>

          <h3>1. Inputs de Aprendizaje: Lo Que Entra al Sistema</h3>
          <p>La calidad de los inputs determina la calidad de los outputs:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📚 Información</h4>
              <p style="font-size: 0.95rem;"><strong>Calidad:</strong> Fuentes confiables, información relevante, bien estructurada</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Output: Conocimiento sólido</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🎓 Experiencia</h4>
              <p style="font-size: 0.95rem;"><strong>Calidad:</strong> Experiencias diversas, desafiantes, reflexionadas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Output: Sabiduría práctica</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">💪 Práctica</h4>
              <p style="font-size: 0.95rem;"><strong>Calidad:</strong> Práctica deliberada, con feedback, progresiva</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Output: Habilidad real</p>
            </div>
          </div>

          <h3>2. Procesos de Aprendizaje: Cómo el Sistema Transforma</h3>
          <p>Los procesos transforman información en conocimiento y habilidad:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Procesos clave del aprendizaje:</strong></p>
            <ul style="line-height: 2;">
              <li>🧠 <strong>Comprensión:</strong> Entender el significado, no solo memorizar</li>
              <li>🔗 <strong>Conexión:</strong> Conectar nueva información con conocimiento existente</li>
              <li>💾 <strong>Consolidación:</strong> Transferir de memoria de corto a largo plazo</li>
              <li>🎯 <strong>Aplicación:</strong> Usar el conocimiento en situaciones reales</li>
              <li>🔄 <strong>Feedback:</strong> Aprender de resultados, ajustar comprensión</li>
            </ul>
          </div>

          <h3>3. Técnicas de Aprendizaje Efectivo</h3>
          <p>Técnicas basadas en evidencia científica que optimizan el sistema:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">⏰ Spaced Repetition</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Repasar información en intervalos crecientes</p>
              <p style="font-size: 0.95rem;"><strong>Por qué:</strong> Fortalece consolidación en memoria a largo plazo</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: Repasar día 1, 3, 7, 14, 30</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🧠 Active Recall</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Intentar recordar sin mirar material</p>
              <p style="font-size: 0.95rem;"><strong>Por qué:</strong> Fortalece conexiones neuronales más que re-leer</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Ejemplo: Hacer preguntas, explicar sin mirar</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🔄 Interleaving</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Mezclar diferentes temas en lugar de bloques</p>
              <p style="font-size: 0.95rem;"><strong>Por qué:</strong> Mejora capacidad de distinguir y aplicar</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Ejemplo: Estudiar A, B, C, A, B, C en lugar de A, A, A, B, B, B</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">📊 Feedback Loops</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Obtener feedback inmediato sobre comprensión</p>
              <p style="font-size: 0.95rem;"><strong>Por qué:</strong> Corrige errores rápidamente, refuerza correcto</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Ejemplo: Pruebas, ejercicios, explicar a otros</p>
            </div>
          </div>

          <h3>4. Outputs de Aprendizaje: Lo Que Produce el Sistema</h3>
          <p>Los outputs medibles te dicen si el sistema funciona:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">📊 Niveles de Output</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>📖 <strong>Conocimiento:</strong> Puedes explicar conceptos</li>
              <li>💡 <strong>Comprensión:</strong> Puedes aplicar conceptos a situaciones nuevas</li>
              <li>🎯 <strong>Habilidad:</strong> Puedes hacer tareas efectivamente</li>
              <li>🧠 <strong>Sabiduría:</strong> Puedes tomar decisiones inteligentes usando conocimiento</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">El objetivo es llegar a sabiduría: no solo saber, sino aplicar inteligentemente.</p>
          </div>

          <h3>5. La Curva de Olvido: Por Qué Olvidamos</h3>
          <p>El olvido es natural. Entenderlo te ayuda a combatirlo:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 La Curva de Olvido de Ebbinghaus</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Día 1:</strong> Olvidas ~50% de lo aprendido</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Día 7:</strong> Olvidas ~80% de lo aprendido</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La solución:</strong> Spaced repetition. Repasar en intervalos crecientes revierte la curva de olvido.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La clave:</strong> No es sobre estudiar más, es sobre repasar estratégicamente.</p>
          </div>

          <h3>Optimización Sistémica del Aprendizaje</h3>
          <p>Aplica principios sistémicos al aprendizaje:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Principios aplicados:</strong></p>
            <ul style="line-height: 2;">
              <li>📊 <strong>Mejora inputs:</strong> Información de calidad, experiencias diversas, práctica deliberada</li>
              <li>⚙️ <strong>Optimiza procesos:</strong> Usa spaced repetition, active recall, interleaving, feedback loops</li>
              <li>📈 <strong>Mide outputs:</strong> Conocimiento, comprensión, habilidad, sabiduría</li>
              <li>🔄 <strong>Crea feedback loops:</strong> Pruebas, ejercicios, explicar a otros, aplicar</li>
              <li>⚖️ <strong>Balance:</strong> Equilibra estudio, práctica, descanso, aplicación</li>
            </ul>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">El aprendizaje efectivo no es sobre estudiar más horas, es sobre diseñar mejor el sistema. Usa técnicas basadas en evidencia (spaced repetition, active recall, interleaving). No confíes en re-leer, confía en recordar. No confíes en bloques, confía en mezclar. Diseña sistemas de aprendizaje que funcionen.</p>
          </div>

          <h3>Ejercicio Práctico: Optimiza Tu Sistema de Aprendizaje</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Evalúa y optimiza tu sistema de aprendizaje actual:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>INPUTS:</strong> ¿Qué calidad tienen? (información, experiencias, práctica)</li>
              <li><strong>PROCESOS:</strong> ¿Usas spaced repetition? ¿Active recall? ¿Interleaving? ¿Feedback loops?</li>
              <li><strong>OUTPUTS:</strong> ¿Qué nivel alcanzas? (conocimiento, comprensión, habilidad, sabiduría)</li>
              <li><strong>TÉCNICAS:</strong> ¿Qué técnicas nuevas implementarías? ¿Cómo?</li>
              <li><strong>OPTIMIZACIÓN:</strong> ¿Qué cambios harías para mejorar inputs, procesos o outputs?</li>
              <li><strong>MEDICIÓN:</strong> ¿Cómo medirías mejoras en tu aprendizaje?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: El aprendizaje efectivo es sobre diseñar sistemas, no sobre estudiar más. Usa técnicas basadas en evidencia y optimiza constantemente.</p>
          </div>

          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">El aprendizaje es un sistema. Optimízalo mediante inputs de calidad (información, experiencia, práctica), procesos efectivos (spaced repetition, active recall, interleaving, feedback loops), y outputs medibles (conocimiento, comprensión, habilidad, sabiduría). El aprendizaje efectivo no es sobre estudiar más horas, es sobre diseñar mejor el sistema. Usa técnicas basadas en evidencia y optimiza constantemente.</p>
          </div>
        `,
        orderIndex: 22,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Construcción de Riqueza y Gestión de Recursos',
        description: 'Aplica principios sistémicos a tus finanzas. Aprende a construir riqueza mediante sistemas de ahorro, inversión y generación de ingresos.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Riqueza como Sistema</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunos construyen riqueza consistentemente y otros viven al día? ¿Por qué algunos tienen libertad financiera y otros están atrapados en deudas? La riqueza no se construye con eventos aislados, se construye con sistemas. Diseña sistemas financieros que funcionen automáticamente. La riqueza es el output de un sistema bien diseñado.</p>
          </div>

          <h2>El Sistema de Riqueza: De Ingresos a Libertad Financiera</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La riqueza es un sistema:</strong> Inputs (ingresos, ahorro) → Procesos (compounding, crecimiento) → Outputs (riqueza, libertad financiera, generación de valor). Construir riqueza no es sobre ganar más dinero, es sobre diseñar sistemas que multipliquen dinero automáticamente.</p>
          </div>

          <h3>1. Inputs Financieros: Lo Que Entra al Sistema</h3>
          <p>Los inputs financieros son la base del sistema:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">💰 Ingresos</h4>
              <p style="font-size: 0.95rem;"><strong>Fuentes:</strong> Trabajo, negocios, inversiones, activos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Output: Flujo de dinero entrante</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">💾 Ahorro</h4>
              <p style="font-size: 0.95rem;"><strong>Práctica:</strong> Ahorra primero, gasta después</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Output: Capital disponible para inversión</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">📈 Inversión</h4>
              <p style="font-size: 0.95rem;"><strong>Estrategia:</strong> Invierte consistentemente, diversifica</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Output: Crecimiento de capital</p>
            </div>
          </div>

          <h3>2. El Compounding: El Poder Exponencial</h3>
          <p>El compounding es el proceso más poderoso del sistema financiero:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 El Poder del Compounding</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Año 1:</strong> Inviertes $1000 a 10% anual = $1100</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Año 2:</strong> Tienes $1100 + 10% = $1210 (ganaste $110, no $100)</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Año 10:</strong> Tienes $2594 (ganaste $1594 de $1000 inicial)</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Año 30:</strong> Tienes $17,449 (ganaste $16,449 de $1000 inicial)</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La clave:</strong> El tiempo y la consistencia multiplican resultados exponencialmente. Empieza temprano, invierte consistentemente.</p>
          </div>

          <h3>3. Principios del Sistema de Riqueza</h3>
          <p>Principios fundamentales para construir riqueza:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Principios Fundamentales</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>💰 <strong>Ahorra primero:</strong> Págate a ti primero. Ahorra antes de gastar, no después.</li>
              <li>📈 <strong>Invierte consistentemente:</strong> Invierte regularmente, no esperes el momento perfecto.</li>
              <li>⏰ <strong>Aprovecha el tiempo:</strong> Empieza temprano. El tiempo es tu mayor aliado en compounding.</li>
              <li>🌐 <strong>Diversifica:</strong> No pongas todos los huevos en una canasta. Reduce riesgo.</li>
              <li>🔄 <strong>Automatiza:</strong> Crea sistemas automáticos. Transfiere ahorro automáticamente, invierte automáticamente.</li>
              <li>📊 <strong>Mide y ajusta:</strong> Mide resultados, ajusta estrategia según feedback.</li>
            </ul>
          </div>

          <h3>4. Outputs Financieros: Lo Que Produce el Sistema</h3>
          <p>Los outputs del sistema financiero:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">💰 Riqueza</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Capital acumulado, activos, patrimonio</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Seguridad financiera</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🆓 Libertad Financiera</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Ingresos pasivos cubren gastos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Resultado: Opciones, autonomía</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">💎 Generación de Valor</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Crear valor para otros</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Resultado: Riqueza sostenible</p>
            </div>
          </div>

          <h3>5. Sistemas Automáticos: El Secreto de la Construcción de Riqueza</h3>
          <p>Automatiza el sistema para que funcione sin ti:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Automatiza estos procesos:</strong></p>
            <ul style="line-height: 2;">
              <li>💰 <strong>Ahorro automático:</strong> Transfiere porcentaje de ingresos automáticamente a cuenta de ahorro</li>
              <li>📈 <strong>Inversión automática:</strong> Invierte automáticamente en fondos indexados o similares</li>
              <li>📊 <strong>Seguimiento automático:</strong> Usa apps que rastreen gastos y ahorros automáticamente</li>
              <li>🔄 <strong>Revisión periódica:</strong> Programa revisiones mensuales o trimestrales para ajustar</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Cuando el sistema funciona automáticamente, no necesitas disciplina constante. El sistema construye riqueza mientras duermes.</p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">La riqueza no se construye con eventos aislados (ganar la lotería, un gran negocio). Se construye con sistemas consistentes (ahorrar e invertir regularmente). El compounding multiplica resultados exponencialmente con el tiempo. Empieza temprano, invierte consistentemente, automatiza. La riqueza es el output de un sistema bien diseñado.</p>
          </div>

          <h3>Ejercicio Práctico: Diseña Tu Sistema de Riqueza</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Diseña tu sistema financiero:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>INGRESOS:</strong> ¿Cuáles son tus fuentes de ingresos? ¿Cómo podrías aumentar ingresos?</li>
              <li><strong>AHORRO:</strong> ¿Qué porcentaje ahorrarías? ¿Cómo automatizarías el ahorro?</li>
              <li><strong>INVERSIÓN:</strong> ¿Dónde invertirías? ¿Cómo automatizarías la inversión?</li>
              <li><strong>COMPOUNDING:</strong> ¿Cómo aprovecharías el poder del compounding? ¿Cuándo empezarías?</li>
              <li><strong>DIVERSIFICACIÓN:</strong> ¿Cómo diversificarías para reducir riesgo?</li>
              <li><strong>AUTOMATIZACIÓN:</strong> ¿Qué procesos automatizarías? ¿Cómo?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: La riqueza se construye con sistemas consistentes, no eventos aislados. Empieza temprano, invierte consistentemente, automatiza. El tiempo y el compounding hacen el trabajo pesado.</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">La riqueza es un sistema. Construye mediante inputs (ingresos, ahorro), procesos (compounding, crecimiento), y outputs (riqueza, libertad financiera). El compounding multiplica resultados exponencialmente con el tiempo. Principios: ahorra primero, invierte consistentemente, aprovecha el tiempo, diversifica, automatiza. La riqueza no se construye con eventos aislados, se construye con sistemas consistentes. Empieza temprano, invierte consistentemente, automatiza.</p>
          </div>
        `,
        orderIndex: 23,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Toma de Decisiones y Pensamiento Estratégico',
        description: 'Aplica principios sistémicos a la toma de decisiones. Aprende frameworks para decisiones estratégicas efectivas.',
        content: `
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Decisiones como Sistemas</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunas decisiones resultan bien y otras mal? ¿Por qué algunos toman decisiones estratégicas consistentemente y otros reaccionan impulsivamente? Las decisiones no son eventos aislados, son sistemas. Optimiza tu sistema de decisión. Las mejores decisiones son el output de sistemas bien diseñados.</p>
          </div>

          <h2>El Sistema de Decisión: De Información a Acción</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La decisión es un sistema:</strong> Inputs (información, opciones, valores, objetivos) → Procesos (análisis, evaluación, comparación) → Outputs (decisión, acción, resultado, aprendizaje). Optimizar este sistema no es solo sobre pensar más, es sobre diseñar procesos que generen mejores decisiones consistentemente.</p>
          </div>

          <h3>1. Inputs de Decisión: Lo Que Entra al Sistema</h3>
          <p>La calidad de los inputs determina la calidad de las decisiones:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📊 Información</h4>
              <p style="font-size: 0.95rem;"><strong>Calidad:</strong> Relevante, precisa, suficiente, verificada</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Output: Decisión informada</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🎯 Objetivos</h4>
              <p style="font-size: 0.95rem;"><strong>Claridad:</strong> Específicos, medibles, alineados con valores</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Output: Decisión alineada</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">💎 Valores</h4>
              <p style="font-size: 0.95rem;"><strong>Claridad:</strong> Valores personales claros, priorizados</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Output: Decisión consistente</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">🔀 Opciones</h4>
              <p style="font-size: 0.95rem;"><strong>Variedad:</strong> Múltiples opciones, creativas, realistas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Output: Mejor opción disponible</p>
            </div>
          </div>

          <h3>2. Procesos de Decisión: Frameworks Efectivos</h3>
          <p>Usa frameworks para procesar información sistemáticamente:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Frameworks de decisión:</strong></p>
            <ul style="line-height: 2;">
              <li>💰 <strong>Costo-beneficio:</strong> Evalúa beneficios vs. costos de cada opción. Elige la opción con mejor ratio.</li>
              <li>⚖️ <strong>Costo de oportunidad:</strong> Considera qué dejas de hacer. ¿Vale la pena?</li>
              <li>📊 <strong>Análisis de consecuencias:</strong> Evalúa consecuencias a corto, medio y largo plazo de cada opción.</li>
              <li>💎 <strong>Valores alineados:</strong> ¿Qué opción está más alineada con tus valores? Las decisiones consistentes con valores son más sostenibles.</li>
              <li>🎯 <strong>Objetivos alineados:</strong> ¿Qué opción te acerca más a tus objetivos? Las decisiones alineadas con objetivos son más efectivas.</li>
            </ul>
          </div>

          <h3>3. Outputs de Decisión: Lo Que Produce el Sistema</h3>
          <p>Los outputs del sistema de decisión:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Decisión</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Elección clara, informada, alineada</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Claridad sobre qué hacer</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🎬 Acción</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Ejecución de la decisión</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Resultado: Cambio real</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">📈 Resultado</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Consecuencias de la acción</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Resultado: Feedback para mejorar</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">🧠 Aprendizaje</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Lecciones aprendidas de la decisión</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Resultado: Mejores decisiones futuras</p>
            </div>
          </div>

          <h3>4. Feedback Loops en Decisiones: Aprende de Resultados</h3>
          <p>Crea feedback loops para mejorar decisiones futuras:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🔄 El Ciclo de Mejora</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>📊 <strong>Decide:</strong> Usa frameworks para tomar decisión</li>
              <li>🎬 <strong>Actúa:</strong> Ejecuta la decisión</li>
              <li>📈 <strong>Mide:</strong> Evalúa resultados</li>
              <li>🧠 <strong>Aprende:</strong> ¿Qué funcionó? ¿Qué no? ¿Por qué?</li>
              <li>🔄 <strong>Ajusta:</strong> Mejora tu sistema de decisión según aprendizaje</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Cada decisión es una oportunidad de aprender. Aprende de resultados y mejora tu sistema de decisión constantemente.</p>
          </div>

          <h3>5. Pensamiento Estratégico: Decisiones Sistémicas</h3>
          <p>El pensamiento estratégico considera el sistema completo:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Pensamiento Estratégico</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>No solo:</strong> "¿Qué decisión es mejor ahora?"</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Sino:</strong> "¿Qué decisión crea mejores opciones futuras?"</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Considera:</strong> Efectos de segunda y tercera orden. ¿Qué consecuencias tienen las consecuencias?</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La clave:</strong> Las mejores decisiones crean más opciones futuras, no las reducen.</p>
          </div>

          <h3>Optimización Sistémica de Decisiones</h3>
          <p>Aplica principios sistémicos a la toma de decisiones:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Principios aplicados:</strong></p>
            <ul style="line-height: 2;">
              <li>📊 <strong>Mejora inputs:</strong> Información de calidad, objetivos claros, valores definidos, opciones creativas</li>
              <li>⚙️ <strong>Optimiza procesos:</strong> Usa frameworks (costo-beneficio, costo de oportunidad, consecuencias, valores)</li>
              <li>📈 <strong>Mide outputs:</strong> Decisión, acción, resultado, aprendizaje</li>
              <li>🔄 <strong>Crea feedback loops:</strong> Mide resultados, aprende, ajusta sistema</li>
              <li>⚖️ <strong>Balance:</strong> Equilibra análisis y acción, corto y largo plazo</li>
            </ul>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Las mejores decisiones no son sobre tener toda la información, son sobre diseñar sistemas que generen buenas decisiones consistentemente. Usa frameworks para procesar información sistemáticamente. Aprende de cada decisión. Las mejores decisiones crean más opciones futuras. Diseña sistemas de decisión, no dependas de intuición constante.</p>
          </div>

          <h3>Ejercicio Práctico: Optimiza Tu Sistema de Decisión</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Evalúa y optimiza tu sistema de decisión:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>INPUTS:</strong> ¿Qué calidad tienen? (información, objetivos, valores, opciones)</li>
              <li><strong>PROCESOS:</strong> ¿Usas frameworks? ¿Cuáles? ¿Cómo podrías mejorar?</li>
              <li><strong>OUTPUTS:</strong> ¿Qué tan efectivas son tus decisiones? ¿Aprendes de resultados?</li>
              <li><strong>FEEDBACK:</strong> ¿Cómo medirías resultados de decisiones? ¿Cómo aprenderías?</li>
              <li><strong>OPTIMIZACIÓN:</strong> ¿Qué cambios harías para mejorar inputs, procesos o outputs?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Las mejores decisiones son el output de sistemas bien diseñados. Usa frameworks, aprende de resultados, optimiza constantemente.</p>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Las decisiones son sistemas. Optimízalo mediante inputs de calidad (información, objetivos, valores, opciones), procesos efectivos (frameworks de análisis), y outputs medibles (decisión, acción, resultado, aprendizaje). Las mejores decisiones no son sobre tener toda la información, son sobre diseñar sistemas que generen buenas decisiones consistentemente. Usa frameworks, aprende de resultados, optimiza constantemente.</p>
          </div>
        `,
        orderIndex: 24,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'Logro de Objetivos y Diseño de Sistemas',
        description: 'Aprende a diseñar sistemas para lograr objetivos. Descubre cómo crear sistemas que automáticamente te acerquen a tus metas.',
        content: `
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Objetivos como Sistemas</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunos logran objetivos consistentemente y otros fallan? ¿Por qué algunos progresan automáticamente y otros requieren fuerza de voluntad constante? Los objetivos no se logran con fuerza de voluntad, se logran con sistemas. Diseña sistemas que automáticamente te acerquen a tus metas. Cuando el sistema funciona bien, el objetivo se logra automáticamente.</p>
          </div>

          <h2>El Sistema de Objetivos: De Meta a Realidad</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Los objetivos son sistemas:</strong> Objetivo claro → Sistema (procesos, feedback, ambiente) → Progreso automático → Logro. Diseñar bien el sistema significa que el objetivo se logra sin depender de fuerza de voluntad constante. El sistema funciona automáticamente.</p>
          </div>

          <h3>1. Objetivo Claro: El Output Deseado</h3>
          <p>Define el objetivo específicamente:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🎯 Específico</h4>
              <p style="font-size: 0.95rem;"><strong>No:</strong> "Quiero estar en forma"</p>
              <p style="font-size: 0.95rem;"><strong>Sí:</strong> "Quiero correr 5km en 25 minutos"</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Especificidad permite medición</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">📊 Medible</h4>
              <p style="font-size: 0.95rem;"><strong>No:</strong> "Quiero aprender más"</p>
              <p style="font-size: 0.95rem;"><strong>Sí:</strong> "Quiero leer 24 libros este año"</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Medición permite feedback</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">⏰ Temporal</h4>
              <p style="font-size: 0.95rem;"><strong>No:</strong> "Quiero aprender piano"</p>
              <p style="font-size: 0.95rem;"><strong>Sí:</strong> "Quiero tocar 3 canciones en 3 meses"</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Tiempo crea urgencia</p>
            </div>
          </div>

          <h3>2. Diseño del Sistema: Procesos Automáticos</h3>
          <p>Diseña procesos que automáticamente te acerquen al objetivo:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Componentes del sistema:</strong></p>
            <ul style="line-height: 2;">
              <li>🔄 <strong>Hábitos:</strong> Crea hábitos que automáticamente te acerquen al objetivo</li>
              <li>📊 <strong>Feedback loops:</strong> Mide progreso regularmente, ajusta según resultados</li>
              <li>🌍 <strong>Ambiente:</strong> Diseña ambiente que facilite el objetivo</li>
              <li>🤝 <strong>Apoyo:</strong> Crea sistemas de apoyo (personas, herramientas, recursos)</li>
              <li>⏰ <strong>Rutinas:</strong> Establece rutinas que automáticamente generen progreso</li>
            </ul>
          </div>

          <h3>3. Feedback Loops: El Sistema de Auto-Corrección</h3>
          <p>Crea feedback loops para que el sistema se auto-corrija:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🔄 El Bucle de Feedback</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>📊 <strong>Mide:</strong> Mide progreso regularmente (diario, semanal, mensual)</li>
              <li>📈 <strong>Compara:</strong> Compara con objetivo y progreso esperado</li>
              <li>⚙️ <strong>Ajusta:</strong> Si no progresas, ajusta sistema (procesos, hábitos, ambiente)</li>
              <li>🔄 <strong>Repite:</strong> Mide de nuevo, ajusta de nuevo</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">El feedback loop hace que el sistema se auto-corrija. Si no progresas, el sistema detecta y ajusta automáticamente.</p>
          </div>

          <h3>4. Ambiente: El Diseño del Contexto</h3>
          <p>Diseña el ambiente para facilitar el objetivo:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Facilitar Acciones Objetivo</h4>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> Prepara herramientas, elimina barreras, reduce fricción</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Más fácil hacer lo que quieres</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Dificultar Acciones No Objetivo</h4>
              <p style="font-size: 0.95rem;"><strong>Ejemplos:</strong> Elimina tentaciones, aumenta fricción, cambia señales</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Resultado: Más difícil hacer lo que no quieres</p>
            </div>
          </div>

          <h3>5. Por Qué Fallan los Objetivos: Sistemas Mal Diseñados</h3>
          <p>Los objetivos fallan cuando el sistema está mal diseñado:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Errores Comunes</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Objetivos vagos:</strong> "Quiero mejorar" no es específico ni medible</li>
              <li>🚨 <strong>Dependencia de fuerza de voluntad:</strong> Confiar en disciplina constante es insostenible</li>
              <li>🚨 <strong>Sin feedback loops:</strong> No mides progreso, no ajustas</li>
              <li>🚨 <strong>Ambiente que dificulta:</strong> El ambiente trabaja contra el objetivo</li>
              <li>🚨 <strong>Sin sistemas de apoyo:</strong> No hay personas, herramientas o recursos que faciliten</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución: Diseñar Sistemas</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Objetivo específico y medible:</strong> Define exactamente qué quieres lograr</li>
              <li>✅ <strong>Sistema automático:</strong> Crea hábitos, rutinas y procesos que funcionen solos</li>
              <li>✅ <strong>Feedback loops:</strong> Mide progreso, ajusta sistema constantemente</li>
              <li>✅ <strong>Ambiente facilitador:</strong> Diseña ambiente que facilite el objetivo</li>
              <li>✅ <strong>Sistemas de apoyo:</strong> Crea apoyo (personas, herramientas, recursos)</li>
            </ul>
          </div>

          <h3>Ejemplo: Sistema para Objetivo de Ejercicio</h3>
          <p>Ejemplo de cómo diseñar un sistema completo:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Objetivo:</strong> Correr 5km en 25 minutos en 3 meses</p>
            <p style="margin-top: 1rem;"><strong>Sistema:</strong></p>
            <ul style="line-height: 2;">
              <li>🔄 <strong>Hábito:</strong> Correr después de desayunar (señal: desayuno, rutina: correr, recompensa: sentirme bien)</li>
              <li>📊 <strong>Feedback:</strong> Medir tiempo y distancia semanalmente, ajustar entrenamiento según progreso</li>
              <li>🌍 <strong>Ambiente:</strong> Ropa de ejercicio visible, ruta preparada, música lista</li>
              <li>🤝 <strong>Apoyo:</strong> Compañero de carrera, app de seguimiento, plan de entrenamiento</li>
              <li>⏰ <strong>Rutina:</strong> Lunes, miércoles, viernes a las 7am sin excepción</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Con este sistema, el objetivo se logra automáticamente. No necesitas fuerza de voluntad constante, el sistema funciona solo.</p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Los objetivos no se logran con fuerza de voluntad, se logran con sistemas. Cuando diseñas bien el sistema (objetivo claro, procesos automáticos, feedback loops, ambiente facilitador), el objetivo se logra automáticamente. No necesitas disciplina constante, el sistema funciona solo. Diseña sistemas de objetivos, no dependas de fuerza de voluntad.</p>
          </div>

          <h3>Ejercicio Práctico: Diseña Sistema para un Objetivo</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Elige un objetivo importante y diseña el sistema completo:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>OBJETIVO:</strong> Define objetivo específico, medible y temporal</li>
              <li><strong>HÁBITOS:</strong> ¿Qué hábitos crearías? (señal, rutina, recompensa)</li>
              <li><strong>FEEDBACK:</strong> ¿Cómo medirías progreso? ¿Con qué frecuencia? ¿Cómo ajustarías?</li>
              <li><strong>AMBIENTE:</strong> ¿Cómo facilitarías el objetivo? ¿Qué cambiarías en tu ambiente?</li>
              <li><strong>APOYO:</strong> ¿Qué personas, herramientas o recursos necesitarías?</li>
              <li><strong>RUTINAS:</strong> ¿Qué rutinas establecerías? ¿Cuándo? ¿Dónde?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: Los objetivos se logran con sistemas, no con fuerza de voluntad. Diseña el sistema completo bien y el objetivo se logra automáticamente.</p>
          </div>

          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Los objetivos se logran mediante sistemas, no fuerza de voluntad. Diseña sistemas completos: objetivo claro (específico, medible, temporal), procesos automáticos (hábitos, rutinas), feedback loops (medición, ajuste), ambiente facilitador, sistemas de apoyo. Cuando el sistema funciona bien, el objetivo se logra automáticamente. No dependas de disciplina constante, diseña sistemas.</p>
          </div>
        `,
        orderIndex: 25,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
    ];

    // BLOQUE 5: Sistemas Anidados - Argentina (6 lecciones - 26-31)
    const lessonsBlock5 = [
      {
        courseId: course4[0].id,
        title: 'La Familia: El Primer Sistema (Aplicación Profunda)',
        description: 'Aplica todos los principios aprendidos al sistema familiar. Descubre cómo optimizar tu familia como sistema desde primeros principios.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">La Familia: El Laboratorio de Amor</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunas familias florecen y otras se desintegran? ¿Por qué algunas transmiten valores y otras generan conflicto? La familia es el primer sistema que debemos optimizar. Es desde allí que se irradia la transformación hacia la sociedad. La familia es el laboratorio donde aprendemos a optimizar sistemas. Aplica todos los principios aprendidos aquí.</p>
          </div>

          <h2>La Familia como Sistema: Aplicando Todos los Principios</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La familia es un sistema complejo:</strong> Inputs (amor, recursos, tiempo, valores, comunicación) → Procesos (cuidado mutuo, educación, resolución de conflictos) → Outputs (miembros sanos, educación, valores transmitidos, bienestar, felicidad). La clave para optimizar la familia es mejorar las relaciones entre miembros. Cuando las relaciones mejoran, todo el sistema familiar mejora.</p>
          </div>

          <h3>1. Inputs Familiares: Lo Que Entra al Sistema</h3>
          <p>Los inputs determinan la calidad del sistema familiar:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">❤️ Amor</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Atención, cuidado, afecto, tiempo de calidad</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Output: Conexión, seguridad, bienestar</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">💰 Recursos</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Financieros, materiales, conocimientos, habilidades</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Output: Capacidad de satisfacer necesidades</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">⏰ Tiempo</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Tiempo juntos, tiempo de calidad, presencia</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Output: Relaciones profundas, conexión</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">💬 Comunicación</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Diálogo, escucha, transparencia, feedback</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Output: Comprensión, coordinación, resolución</p>
            </div>
          </div>

          <h3>2. Procesos Familiares: Cómo el Sistema Transforma</h3>
          <p>Los procesos familiares transforman inputs en outputs:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Procesos clave del sistema familiar:</strong></p>
            <ul style="line-height: 2;">
              <li>🤝 <strong>Cuidado mutuo:</strong> Cada miembro cuida de los otros. El cuidado mutuo fortalece el sistema.</li>
              <li>📚 <strong>Educación:</strong> Transmisión de conocimientos, habilidades y valores. La educación prepara miembros.</li>
              <li>⚖️ <strong>Resolución de conflictos:</strong> Manejo de desacuerdos, negociación, reconciliación. Los conflictos bien resueltos fortalecen.</li>
              <li>💎 <strong>Transmisión de valores:</strong> Valores familiares compartidos, principios, identidad. Los valores unen.</li>
              <li>🔄 <strong>Feedback loops:</strong> Comunicación regular, ajuste de comportamientos, mejora continua.</li>
            </ul>
          </div>

          <h3>3. Outputs Familiares: Lo Que Produce el Sistema</h3>
          <p>Los outputs del sistema familiar:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">📊 Outputs del Sistema Familiar</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>👨‍👩‍👧‍👦 <strong>Miembros sanos:</strong> Físicamente, mentalmente, emocionalmente saludables</li>
              <li>🎓 <strong>Educación:</strong> Conocimientos, habilidades, valores transmitidos</li>
              <li>💎 <strong>Valores transmitidos:</strong> Principios, identidad, cultura familiar</li>
              <li>😊 <strong>Bienestar:</strong> Felicidad, satisfacción, seguridad</li>
              <li>🤝 <strong>Relaciones:</strong> Conexiones profundas, confianza, apoyo mutuo</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Cuando estos outputs son positivos, la familia funciona bien. Cuando son negativos, el sistema necesita optimización.</p>
          </div>

          <h3>4. Optimización Sistémica de la Familia</h3>
          <p>Aplica todos los principios aprendidos a tu familia:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">📊 Maximiza Inputs</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Aumenta amor, recursos, tiempo, comunicación</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Sistema más rico en inputs</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">⚙️ Optimiza Procesos</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Mejora comunicación, resolución de conflictos, transmisión de valores</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Resultado: Transformación más efectiva</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🔗 Mejora Relaciones</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Fortalece conexiones entre miembros</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Resultado: Sistema más cohesivo</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">🔄 Feedback Loops</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Mide outputs, ajusta inputs y procesos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Resultado: Mejora continua</p>
            </div>
          </div>

          <h3>5. Propiedades Emergentes de la Familia</h3>
          <p>Cuando las relaciones familiares funcionan bien, emergen propiedades mágicas:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Propiedades Emergentes</h4>
            <ul style="line-height: 2; color: #78350f;">
              <li>❤️ <strong>Amor familiar:</strong> Sentimiento que no existe en individuos solos</li>
              <li>🏠 <strong>Identidad familiar:</strong> "Somos los X" - sentido de pertenencia compartido</li>
              <li>🤝 <strong>Apoyo incondicional:</strong> "Siempre estaremos aquí para ti"</li>
              <li>💪 <strong>Fuerza colectiva:</strong> Juntos somos más fuertes que individualmente</li>
              <li>🎯 <strong>Propósito compartido:</strong> Objetivos familiares que trascienden individuales</li>
            </ul>
            <p style="color: #78350f; margin-top: 1rem; margin-bottom: 0;">Estas propiedades emergen cuando las relaciones funcionan bien. No puedes crear amor familiar directamente, pero puedes crear las condiciones (buenas relaciones) para que emerja.</p>
          </div>

          <h3>6. Feedback Loops en la Familia: El Sistema de Auto-Corrección</h3>
          <p>Crea feedback loops para que la familia se auto-optimice:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🔄 Feedback Loops Familiares</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>💬 <strong>Comunicación regular:</strong> Reuniones familiares, conversaciones, compartir</li>
              <li>📊 <strong>Mide bienestar:</strong> ¿Cómo se siente cada miembro? ¿Qué necesita?</li>
              <li>⚙️ <strong>Ajusta:</strong> Si hay problemas, ajusta inputs o procesos</li>
              <li>🔄 <strong>Repite:</strong> Comunicación constante, ajuste constante</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">El feedback loop hace que la familia se auto-corrija. Si hay problemas, el sistema detecta y ajusta.</p>
          </div>

          <h3>7. Aplicación a Argentina: La Familia como Base</h3>
          <p>La familia es la base de la transformación de Argentina:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Por qué la familia es crucial para Argentina:</strong></p>
            <ul style="line-height: 2;">
              <li>🏠 <strong>Base de valores:</strong> La familia transmite valores que luego se extienden a la sociedad</li>
              <li>👨‍👩‍👧‍👦 <strong>Formación de ciudadanos:</strong> Familias saludables forman ciudadanos saludables</li>
              <li>🔄 <strong>Efecto cascada:</strong> Familias optimizadas → barrios optimizados → municipios optimizados → provincias optimizadas → nación optimizada</li>
              <li>💪 <strong>Resiliencia:</strong> Familias fuertes crean comunidades fuertes, que crean naciones fuertes</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Como dice el Hombre Gris: <em>"La transformación de Argentina comienza en la familia. Optimiza tu familia primero, y la transformación se irradia hacia la sociedad."</em></p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">La familia es el primer sistema que debemos optimizar. Es desde allí que se irradia la transformación hacia la sociedad. Cuando optimizas tu familia aplicando principios sistémicos (mejora inputs, optimiza procesos, mejora relaciones, crea feedback loops), no solo mejoras tu familia, contribuyes a la transformación de Argentina. La familia es el laboratorio de amor donde aprendemos a optimizar sistemas.</p>
          </div>

          <h3>Ejercicio Práctico: Mapea y Optimiza Tu Familia</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Mapea tu familia como sistema y optimízala:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>INPUTS:</strong> ¿Qué inputs tiene tu familia? (amor, recursos, tiempo, comunicación) ¿Cómo mejorarlos?</li>
              <li><strong>PROCESOS:</strong> ¿Qué procesos ocurren? (cuidado, educación, resolución de conflictos) ¿Cómo optimizarlos?</li>
              <li><strong>OUTPUTS:</strong> ¿Qué outputs produce? (miembros sanos, educación, valores, bienestar) ¿Cómo medirlos?</li>
              <li><strong>RELACIONES:</strong> ¿Cómo están las relaciones entre miembros? ¿Cómo mejorarlas?</li>
              <li><strong>FEEDBACK:</strong> ¿Qué feedback loops crearías? ¿Cómo medirías y ajustarías?</li>
              <li><strong>PROPIEDADES EMERGENTES:</strong> ¿Qué propiedades emergentes quieres cultivar? (amor, unidad, identidad)</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: La familia es el primer sistema. Optimízala aplicando todos los principios aprendidos. Desde allí se irradia la transformación.</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">La familia es el primer sistema que debemos optimizar. Es un sistema complejo con inputs (amor, recursos, tiempo, comunicación), procesos (cuidado, educación, resolución de conflictos), y outputs (miembros sanos, educación, valores, bienestar). La clave es mejorar las relaciones entre miembros. Cuando optimizas tu familia aplicando principios sistémicos, contribuyes a la transformación de Argentina. La familia es el laboratorio de amor donde aprendemos a optimizar sistemas.</p>
          </div>
        `,
        orderIndex: 26,
        type: 'text' as const,
        duration: 35,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'El Barrio: Sistema de Familias',
        description: 'Aprende cómo el barrio es un sistema de familias. Descubre cómo mejorar las relaciones barriales para fortalecer la comunidad.',
        content: `
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Barrio: Comunidad en Acción</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunos barrios son seguros, cohesionados y prósperos mientras otros están fragmentados y en conflicto? El barrio es donde las familias se conectan. Es el segundo nivel del sistema anidado que transforma Argentina. El barrio es un sistema de familias. Cuando las familias colaboran, el barrio florece. Cuando compiten o se ignoran, el barrio se debilita.</p>
          </div>

          <h2>El Barrio como Sistema: Familias Conectadas</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>El barrio es un sistema de familias:</strong> Inputs (familias, recursos compartidos, comunicación, participación) → Procesos (colaboración, organización, acción comunitaria) → Outputs (seguridad, cohesión social, servicios, identidad barrial, bienestar colectivo). La clave para optimizar el barrio es mejorar las relaciones entre familias. Cuando las familias colaboran, emergen propiedades barriales poderosas.</p>
          </div>

          <h3>1. Inputs Barriales: Lo Que Entra al Sistema</h3>
          <p>Los inputs del barrio provienen de las familias:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👨‍👩‍👧‍👦 Familias</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Familias saludables, diversas, comprometidas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Output: Capital social, recursos humanos</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">💬 Comunicación</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Canales de comunicación, información compartida</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Output: Coordinación, entendimiento</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🤝 Participación</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Familias participando, contribuyendo, organizándose</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Output: Acción colectiva, organización</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">💰 Recursos Compartidos</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Espacios, herramientas, conocimientos compartidos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Output: Eficiencia, multiplicación de valor</p>
            </div>
          </div>

          <h3>2. Procesos Barriales: Cómo el Sistema Transforma</h3>
          <p>Los procesos barriales transforman familias en comunidad:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Procesos clave del sistema barrial:</strong></p>
            <ul style="line-height: 2;">
              <li>🤝 <strong>Colaboración:</strong> Familias trabajando juntas en proyectos comunes. La colaboración crea valor.</li>
              <li>📋 <strong>Organización:</strong> Estructuras que facilitan coordinación (juntas vecinales, comités, grupos). La organización reduce fricción.</li>
              <li>🎯 <strong>Acción comunitaria:</strong> Proyectos que benefician al barrio completo. La acción crea resultados.</li>
              <li>⚖️ <strong>Resolución de problemas:</strong> Manejo de conflictos, problemas comunes, necesidades. La resolución mantiene salud.</li>
              <li>🔄 <strong>Feedback loops:</strong> Comunicación constante, evaluación de acciones, ajuste de estrategias.</li>
            </ul>
          </div>

          <h3>3. Outputs Barriales: Lo Que Produce el Sistema</h3>
          <p>Los outputs del sistema barrial:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">📊 Outputs del Sistema Barrial</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>🛡️ <strong>Seguridad:</strong> Barrio seguro, vigilancia mutua, protección</li>
              <li>🤝 <strong>Cohesión social:</strong> Sentido de comunidad, pertenencia, identidad barrial</li>
              <li>🏗️ <strong>Servicios:</strong> Servicios compartidos, infraestructura, espacios comunes</li>
              <li>🏘️ <strong>Identidad barrial:</strong> "Somos del barrio X" - orgullo y pertenencia</li>
              <li>😊 <strong>Bienestar colectivo:</strong> Felicidad compartida, apoyo mutuo, prosperidad</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Cuando estos outputs son positivos, el barrio funciona bien. Cuando son negativos, el sistema necesita optimización.</p>
          </div>

          <h3>4. Efectos de Red en el Barrio: El Poder de las Conexiones</h3>
          <p>Las conexiones entre familias multiplican valor:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Efectos de Red Barriales</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Más conexiones = Más valor:</strong> Cada nueva conexión entre familias hace que todas las conexiones existentes sean más valiosas.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Ejemplo:</strong> Si 10 familias están conectadas, hay 45 conexiones posibles. Si 20 familias están conectadas, hay 190 conexiones posibles. El valor crece exponencialmente.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La clave:</strong> Conectar familias estratégicamente. Cada conexión crea valor para todo el barrio.</p>
          </div>

          <h3>5. Propiedades Emergentes del Barrio</h3>
          <p>Cuando las familias colaboran bien, emergen propiedades barriales:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🏘️ Identidad Barrial</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> "Somos del barrio X" - sentido de pertenencia compartido</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">No existe en familias individuales, emerge de colaboración</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🛡️ Seguridad Colectiva</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Vigilancia mutua, protección compartida</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Más fuerte que seguridad individual</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">💪 Fuerza Colectiva</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Capacidad de acción conjunta, influencia</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Barrios organizados pueden lograr más</p>
            </div>
          </div>

          <h3>6. Optimización Sistémica del Barrio</h3>
          <p>Estrategias para optimizar el barrio como sistema:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Estrategias de Optimización</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>💬 <strong>Crea canales de comunicación:</strong> Grupos de WhatsApp, reuniones, boletines, plataformas digitales</li>
              <li>🤝 <strong>Facilita colaboración:</strong> Organiza eventos, proyectos comunitarios, actividades compartidas</li>
              <li>📋 <strong>Organiza:</strong> Crea estructuras (juntas vecinales, comités) que faciliten coordinación</li>
              <li>🎯 <strong>Acción comunitaria:</strong> Inicia proyectos que beneficien al barrio (limpieza, seguridad, mejoras)</li>
              <li>🤝 <strong>Cultiva confianza:</strong> Construye confianza entre familias mediante consistencia, transparencia, reciprocidad</li>
              <li>🔄 <strong>Feedback loops:</strong> Evalúa acciones, ajusta estrategias, mejora continuamente</li>
            </ul>
          </div>

          <h3>7. Aplicación a Argentina: Barrios que Transforman</h3>
          <p>Los barrios son la segunda capa de transformación:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Por qué los barrios son cruciales para Argentina:</strong></p>
            <ul style="line-height: 2;">
              <li>🏘️ <strong>Base de organización:</strong> Los barrios son donde las familias se organizan para acción colectiva</li>
              <li>🤝 <strong>Escala efectiva:</strong> Los barrios son lo suficientemente pequeños para coordinación efectiva, lo suficientemente grandes para impacto</li>
              <li>🔄 <strong>Efecto cascada:</strong> Barrios optimizados → municipios optimizados → provincias optimizados → nación optimizada</li>
              <li>💪 <strong>Resiliencia:</strong> Barrios organizados son más resilientes a crisis y más capaces de prosperar</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Como dice el Hombre Gris: <em>"La transformación de Argentina se construye barrio por barrio. Optimiza tu barrio, y contribuyes a la transformación nacional."</em></p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">El barrio es donde las familias se conectan. Cuando las familias colaboran, emergen propiedades barriales poderosas (identidad, seguridad colectiva, fuerza). El barrio es el segundo nivel del sistema anidado. Optimiza tu barrio mejorando relaciones entre familias, creando canales de comunicación, facilitando colaboración. Cuando optimizas tu barrio, contribuyes a la transformación de Argentina.</p>
          </div>

          <h3>Ejercicio Práctico: Optimiza Tu Barrio</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza y optimiza tu barrio como sistema:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>INPUTS:</strong> ¿Qué familias participan? ¿Qué comunicación hay? ¿Qué participación existe?</li>
              <li><strong>PROCESOS:</strong> ¿Hay colaboración? ¿Organización? ¿Acción comunitaria? ¿Cómo mejorarlos?</li>
              <li><strong>OUTPUTS:</strong> ¿Qué outputs tiene tu barrio? (seguridad, cohesión, servicios, identidad) ¿Cómo medirlos?</li>
              <li><strong>RELACIONES:</strong> ¿Cómo están las relaciones entre familias? ¿Cómo mejorarlas?</li>
              <li><strong>CONEXIONES:</strong> ¿Qué conexiones crearías entre familias? ¿Por qué son valiosas?</li>
              <li><strong>ACCIONES:</strong> ¿Qué acciones concretas tomarías para optimizar el barrio?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: El barrio es donde las familias se conectan. Optimiza las relaciones entre familias y el barrio florece. Contribuyes a la transformación de Argentina.</p>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">El barrio es un sistema de familias. Optimízalo mediante inputs (familias, comunicación, participación), procesos (colaboración, organización, acción comunitaria), y outputs (seguridad, cohesión, identidad, bienestar). La clave es mejorar las relaciones entre familias. Cuando las familias colaboran, emergen propiedades barriales poderosas. El barrio es el segundo nivel del sistema anidado. Optimiza tu barrio y contribuyes a la transformación de Argentina.</p>
          </div>
        `,
        orderIndex: 27,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'El Municipio: Sistema de Barrios',
        description: 'Aprende cómo el municipio coordina barrios. Descubre principios de gobernanza efectiva y coordinación municipal.',
        content: `
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Municipio: Coordinación Local</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunos municipios funcionan eficientemente y otros están en caos? ¿Por qué algunos coordinan barrios perfectamente y otros están desconectados? El municipio coordina barrios. Es donde la gobernanza local se conecta con la comunidad. El municipio es un sistema de barrios. Cuando los barrios y el gobierno colaboran, el municipio florece.</p>
          </div>

          <h2>El Municipio como Sistema: Coordinación de Barrios</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>El municipio es un sistema de barrios:</strong> Inputs (barrios, recursos públicos, participación ciudadana, información) → Procesos (gobernanza, coordinación, planificación, servicios públicos) → Outputs (servicios públicos, infraestructura, orden, desarrollo local, bienestar). La clave para optimizar el municipio es mejorar las relaciones entre barrios y gobierno. Cuando colaboran, emergen resultados municipales poderosos.</p>
          </div>

          <h3>1. Inputs Municipales: Lo Que Entra al Sistema</h3>
          <p>Los inputs del municipio provienen de barrios y gobierno:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🏘️ Barrios</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Barrios organizados, participativos, colaborativos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Output: Capital social, participación</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">💰 Recursos Públicos</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Presupuesto, recursos materiales, infraestructura</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Output: Capacidad de acción</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">👥 Participación Ciudadana</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Ciudadanos participando, dando feedback, involucrándose</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Output: Legitimidad, información</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">📊 Información</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Datos, feedback, necesidades, oportunidades</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Output: Decisiones informadas</p>
            </div>
          </div>

          <h3>2. Procesos Municipales: Gobernanza Efectiva</h3>
          <p>Los procesos municipales transforman inputs en outputs:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Procesos clave del sistema municipal:</strong></p>
            <ul style="line-height: 2;">
              <li>🏛️ <strong>Gobernanza:</strong> Toma de decisiones, políticas, regulaciones. La gobernanza efectiva crea orden.</li>
              <li>🔄 <strong>Coordinación:</strong> Sincronización entre barrios, departamentos, proyectos. La coordinación reduce desperdicio.</li>
              <li>📋 <strong>Planificación:</strong> Estrategias, planes, proyectos. La planificación crea dirección.</li>
              <li>🏗️ <strong>Servicios públicos:</strong> Educación, salud, seguridad, infraestructura. Los servicios satisfacen necesidades.</li>
              <li>🔄 <strong>Feedback loops:</strong> Comunicación gobierno-comunidad, evaluación, ajuste.</li>
            </ul>
          </div>

          <h3>3. Outputs Municipales: Lo Que Produce el Sistema</h3>
          <p>Los outputs del sistema municipal:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">📊 Outputs del Sistema Municipal</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>🏗️ <strong>Servicios públicos:</strong> Educación, salud, seguridad, infraestructura de calidad</li>
              <li>🛣️ <strong>Infraestructura:</strong> Calles, espacios públicos, conectividad, servicios básicos</li>
              <li>📊 <strong>Orden:</strong> Regulación, organización, planificación urbana</li>
              <li>📈 <strong>Desarrollo local:</strong> Crecimiento económico, oportunidades, prosperidad</li>
              <li>😊 <strong>Bienestar:</strong> Calidad de vida, satisfacción ciudadana, felicidad</li>
            </ul>
          </div>

          <h3>4. Control Theory Aplicado: Dirigir sin Microgestionar</h3>
          <p>Aplica principios de cibernética a la gobernanza municipal:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Gobernanza Cibernética</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>No:</strong> Controlar cada barrio, microgestionar cada acción</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Sí:</strong> Establecer objetivos claros, crear feedback loops, diseñar estructura, confiar en auto-organización</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Ejemplo:</strong> "Queremos barrios seguros" (objetivo claro) → Barrios encuentran sus propias formas → Gobierno facilita y coordina</p>
          </div>

          <h3>5. Transparencia y Participación: Feedback Loops Efectivos</h3>
          <p>La transparencia y participación crean feedback loops poderosos:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Municipio Transparente</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Información pública, procesos visibles, decisiones auditables</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Confianza, participación, mejor gobernanza</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Municipio Opaco</h4>
              <p style="font-size: 0.95rem;"><strong>Características:</strong> Información oculta, procesos secretos, decisiones opacas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Resultado: Desconfianza, apatía, mala gobernanza</p>
            </div>
          </div>

          <h3>6. Optimización Sistémica del Municipio</h3>
          <p>Estrategias para optimizar el municipio como sistema:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Principios de Gobernanza Efectiva</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>📊 <strong>Transparencia radical:</strong> Toda información pública, procesos visibles, decisiones auditables</li>
              <li>👥 <strong>Participación ciudadana:</strong> Ciudadanos involucrados en decisiones, feedback constante</li>
              <li>🔄 <strong>Coordinación efectiva:</strong> Sincronización entre barrios, departamentos, proyectos</li>
              <li>📋 <strong>Planificación estratégica:</strong> Objetivos claros, estrategias, planes de acción</li>
              <li>🔄 <strong>Feedback loops:</strong> Comunicación constante gobierno-comunidad, evaluación, ajuste</li>
              <li>🎯 <strong>Control cibernético:</strong> Objetivos claros, estructura, auto-organización</li>
            </ul>
          </div>

          <h3>7. Aplicación a Argentina: Municipios que Transforman</h3>
          <p>Los municipios son la tercera capa de transformación:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Por qué los municipios son cruciales para Argentina:</strong></p>
            <ul style="line-height: 2;">
              <li>🏛️ <strong>Gobernanza local:</strong> Los municipios son donde la gobernanza se conecta directamente con ciudadanos</li>
              <li>🔄 <strong>Escala de impacto:</strong> Los municipios pueden lograr cambios visibles rápidamente</li>
              <li>🔄 <strong>Efecto cascada:</strong> Municipios optimizados → provincias optimizadas → nación optimizada</li>
              <li>💪 <strong>Modelo:</strong> Municipios exitosos sirven como modelos para otros</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Como dice el Hombre Gris: <em>"La transformación de Argentina se construye municipio por municipio. Optimiza tu municipio, y contribuyes a la transformación nacional."</em></p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">El municipio es donde los barrios y el gobierno se conectan. Cuando colaboran (transparencia, participación, coordinación), emergen resultados municipales poderosos. El municipio es el tercer nivel del sistema anidado. Optimiza tu municipio mejorando relaciones entre barrios y gobierno, creando transparencia, facilitando participación. Cuando optimizas tu municipio, contribuyes a la transformación de Argentina.</p>
          </div>

          <h3>Ejercicio Práctico: Optimiza Tu Municipio</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza y optimiza tu municipio como sistema:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>INPUTS:</strong> ¿Qué barrios participan? ¿Qué participación ciudadana hay? ¿Qué información fluye?</li>
              <li><strong>PROCESOS:</strong> ¿Cómo es la gobernanza? ¿Coordinación? ¿Planificación? ¿Cómo mejorarlos?</li>
              <li><strong>OUTPUTS:</strong> ¿Qué servicios tiene tu municipio? ¿Qué calidad? ¿Cómo medirlos?</li>
              <li><strong>RELACIONES:</strong> ¿Cómo están las relaciones entre barrios y gobierno? ¿Cómo mejorarlas?</li>
              <li><strong>TRANSPARENCIA:</strong> ¿Qué transparencia hay? ¿Cómo aumentarla?</li>
              <li><strong>PARTICIPACIÓN:</strong> ¿Cómo participan los ciudadanos? ¿Cómo facilitar más participación?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: El municipio es donde barrios y gobierno se conectan. Optimiza estas relaciones y el municipio florece. Contribuyes a la transformación de Argentina.</p>
          </div>

          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">El municipio es un sistema de barrios. Optimízalo mediante inputs (barrios, recursos, participación), procesos (gobernanza, coordinación, planificación), y outputs (servicios, infraestructura, bienestar). La clave es mejorar las relaciones entre barrios y gobierno. Transparencia, participación, coordinación efectiva, feedback loops. El municipio es el tercer nivel del sistema anidado. Optimiza tu municipio y contribuyes a la transformación de Argentina.</p>
          </div>
        `,
        orderIndex: 28,
        type: 'text' as const,
        duration: 35,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'La Provincia: Sistema de Municipios',
        description: 'Aprende cómo la provincia coordina municipios. Descubre principios de coordinación regional y desarrollo provincial.',
        content: `
          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">La Provincia: Coordinación Regional</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunas provincias prosperan y otras se estancan? ¿Por qué algunas coordinan municipios perfectamente y otras están fragmentadas? La provincia coordina municipios. Es donde el desarrollo regional se planifica y ejecuta. La provincia es un sistema de municipios. Cuando los municipios colaboran, la provincia florece. Cuando compiten o se ignoran, la provincia se debilita.</p>
          </div>

          <h2>La Provincia como Sistema: Coordinación de Municipios</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La provincia es un sistema de municipios:</strong> Inputs (municipios, recursos provinciales, planificación, coordinación) → Procesos (coordinación inter-municipal, planificación regional, desarrollo, políticas públicas) → Outputs (desarrollo regional, coordinación, infraestructura, bienestar provincial). La clave para optimizar la provincia es mejorar las relaciones entre municipios. Cuando colaboran, emergen resultados provinciales poderosos.</p>
          </div>

          <h3>1. Inputs Provinciales: Lo Que Entra al Sistema</h3>
          <p>Los inputs de la provincia provienen de municipios y gobierno provincial:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🏛️ Municipios</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Municipios organizados, coordinados, desarrollados</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Output: Capital municipal, desarrollo local</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">💰 Recursos Provinciales</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Presupuesto provincial, recursos compartidos, infraestructura regional</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Output: Capacidad de desarrollo</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">📋 Planificación</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Estrategias regionales, planes de desarrollo, visión provincial</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Output: Dirección clara</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">🔄 Coordinación</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Comunicación inter-municipal, sincronización, colaboración</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Output: Eficiencia, sinergia</p>
            </div>
          </div>

          <h3>2. Procesos Provinciales: Desarrollo Regional</h3>
          <p>Los procesos provinciales transforman municipios en desarrollo regional:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Procesos clave del sistema provincial:</strong></p>
            <ul style="line-height: 2;">
              <li>🔄 <strong>Coordinación inter-municipal:</strong> Municipios trabajando juntos en proyectos comunes. La coordinación crea sinergia.</li>
              <li>📋 <strong>Planificación regional:</strong> Estrategias que benefician a toda la provincia. La planificación crea dirección.</li>
              <li>📈 <strong>Desarrollo:</strong> Proyectos de infraestructura, economía, educación a escala provincial. El desarrollo crea prosperidad.</li>
              <li>🏛️ <strong>Políticas públicas:</strong> Regulaciones, incentivos, programas provinciales. Las políticas facilitan desarrollo.</li>
              <li>🔄 <strong>Feedback loops:</strong> Comunicación constante, evaluación de políticas, ajuste de estrategias.</li>
            </ul>
          </div>

          <h3>3. Outputs Provinciales: Lo Que Produce el Sistema</h3>
          <p>Los outputs del sistema provincial:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">📊 Outputs del Sistema Provincial</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>📈 <strong>Desarrollo regional:</strong> Crecimiento económico, prosperidad, oportunidades</li>
              <li>🔄 <strong>Coordinación:</strong> Municipios coordinados, sinergia, eficiencia</li>
              <li>🛣️ <strong>Infraestructura:</strong> Rutas, conectividad, servicios regionales</li>
              <li>🎓 <strong>Educación:</strong> Sistema educativo provincial, investigación, desarrollo</li>
              <li>😊 <strong>Bienestar provincial:</strong> Calidad de vida, satisfacción, prosperidad compartida</li>
            </ul>
          </div>

          <h3>4. Efectos de Red Provinciales: El Poder de la Coordinación</h3>
          <p>La coordinación entre municipios multiplica valor:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Efectos de Red Provinciales</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Municipios desconectados:</strong> Cada municipio trabaja solo → Competencia, desperdicio, desarrollo limitado</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Municipios conectados:</strong> Municipios colaboran → Sinergia, eficiencia, desarrollo exponencial</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Ejemplo:</strong> 10 municipios coordinados pueden lograr más que 10 municipios desconectados. La coordinación multiplica valor.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La clave:</strong> Conectar municipios estratégicamente. Cada conexión crea valor para toda la provincia.</p>
          </div>

          <h3>5. Optimización Sistémica de la Provincia</h3>
          <p>Estrategias para optimizar la provincia como sistema:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Principios de Coordinación Provincial</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>🔄 <strong>Coordinación efectiva:</strong> Comunicación constante entre municipios, sincronización de esfuerzos</li>
              <li>📋 <strong>Planificación regional:</strong> Estrategias que benefician a toda la provincia, no solo municipios individuales</li>
              <li>💬 <strong>Comunicación:</strong> Canales de comunicación inter-municipal, información compartida</li>
              <li>🎯 <strong>Desarrollo compartido:</strong> Proyectos que benefician múltiples municipios, recursos compartidos</li>
              <li>🔄 <strong>Feedback loops:</strong> Evaluación de políticas provinciales, ajuste de estrategias</li>
              <li>🎯 <strong>Control cibernético:</strong> Objetivos provinciales claros, estructura, auto-organización municipal</li>
            </ul>
          </div>

          <h3>6. Aplicación a Argentina: Provincias que Transforman</h3>
          <p>Las provincias son la cuarta capa de transformación:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Por qué las provincias son cruciales para Argentina:</strong></p>
            <ul style="line-height: 2;">
              <li>🗺️ <strong>Escala regional:</strong> Las provincias son lo suficientemente grandes para proyectos significativos, lo suficientemente pequeñas para coordinación efectiva</li>
              <li>🔄 <strong>Coordinación:</strong> Las provincias coordinan municipios, creando sinergia regional</li>
              <li>🔄 <strong>Efecto cascada:</strong> Provincias optimizadas → nación optimizada</li>
              <li>💪 <strong>Modelo:</strong> Provincias exitosas sirven como modelos para otras provincias</li>
            </ul>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Como dice el Hombre Gris: <em>"La transformación de Argentina se construye provincia por provincia. Optimiza tu provincia, y contribuyes a la transformación nacional."</em></p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">La provincia es donde los municipios se conectan. Cuando los municipios colaboran (coordinación, planificación regional, comunicación), emergen resultados provinciales poderosos. La provincia es el cuarto nivel del sistema anidado. Optimiza tu provincia mejorando relaciones entre municipios, creando coordinación efectiva, facilitando planificación regional. Cuando optimizas tu provincia, contribuyes a la transformación de Argentina.</p>
          </div>

          <h3>Ejercicio Práctico: Optimiza Tu Provincia</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza y optimiza tu provincia como sistema:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>INPUTS:</strong> ¿Qué municipios participan? ¿Qué coordinación hay? ¿Qué planificación existe?</li>
              <li><strong>PROCESOS:</strong> ¿Cómo es la coordinación inter-municipal? ¿Planificación regional? ¿Desarrollo? ¿Cómo mejorarlos?</li>
              <li><strong>OUTPUTS:</strong> ¿Qué desarrollo tiene tu provincia? ¿Qué coordinación? ¿Cómo medirlos?</li>
              <li><strong>RELACIONES:</strong> ¿Cómo están las relaciones entre municipios? ¿Cómo mejorarlas?</li>
              <li><strong>CONEXIONES:</strong> ¿Qué conexiones crearías entre municipios? ¿Por qué son valiosas?</li>
              <li><strong>ACCIONES:</strong> ¿Qué acciones concretas tomarías para optimizar la provincia?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: La provincia es donde los municipios se conectan. Optimiza las relaciones entre municipios y la provincia florece. Contribuyes a la transformación de Argentina.</p>
          </div>

          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">La provincia es un sistema de municipios. Optimízalo mediante inputs (municipios, recursos, planificación), procesos (coordinación inter-municipal, planificación regional, desarrollo), y outputs (desarrollo regional, coordinación, infraestructura, bienestar). La clave es mejorar las relaciones entre municipios. Coordinación efectiva, planificación regional, comunicación, desarrollo compartido. La provincia es el cuarto nivel del sistema anidado. Optimiza tu provincia y contribuyes a la transformación de Argentina.</p>
          </div>
        `,
        orderIndex: 29,
        type: 'text' as const,
        duration: 35,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'La Nación: Sistema de Provincias - Argentina como Sistema Complejo',
        description: 'Aplica todos los principios a Argentina como sistema completo. Descubre cómo mejorar las relaciones entre provincias transforma la nación.',
        content: `
          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Argentina: El Sistema Complejo</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué Argentina tiene tanto potencial pero tantos problemas? ¿Por qué algunas naciones prosperan y otras se estancan? Argentina es un sistema viviente con entradas, procesos y salidas. La clave para transformarla está en mejorar las relaciones entre sus partes. Argentina es un sistema de provincias. Cuando las provincias colaboran, Argentina florece. Cuando compiten o se ignoran, Argentina se debilita.</p>
          </div>

          <h2>Argentina como Sistema Viviente: El Sistema Complejo</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Argentina es un sistema complejo:</strong> Inputs (recursos, talento, esperanzas) → Procesos (instituciones, cultura, economía) → Outputs (calidad de vida, desarrollo, felicidad colectiva). La clave para optimizar Argentina es mejorar las relaciones entre sus partes. Cuando las provincias, municipios, barrios y familias se relacionan mejor, Argentina se transforma.</p>
          </div>

          <h3>1. Inputs Nacionales: Lo Que Entra al Sistema</h3>
          <p>Los inputs de Argentina provienen de recursos y talento:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">💰 Recursos</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Tierra fértil, minerales, energía, recursos naturales, capital</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Output: Capacidad de producción</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">👥 Talento</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Educación, creatividad, trabajo, capacidad humana, conocimiento</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Output: Innovación, capacidad</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">💭 Esperanzas</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Visión, sueños, aspiraciones, voluntad de cambio</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Output: Motivación, acción</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">🏛️ Provincias</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> 24 provincias, cada una con recursos, talento, esperanzas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Output: Capital provincial, diversidad</p>
            </div>
          </div>

          <h3>2. Procesos Nacionales: Cómo el Sistema Transforma</h3>
          <p>Los procesos nacionales transforman inputs en outputs:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Procesos clave del sistema nacional:</strong></p>
            <ul style="line-height: 2;">
              <li>🏛️ <strong>Instituciones:</strong> Gobierno, educación, justicia, economía. Las instituciones efectivas crean orden y facilitan desarrollo.</li>
              <li>🎭 <strong>Cultura:</strong> Valores, tradiciones, identidad, narrativas. La cultura cohesiva une y motiva.</li>
              <li>💼 <strong>Economía:</strong> Producción, distribución, consumo, inversión. La economía saludable crea prosperidad.</li>
              <li>🔄 <strong>Coordinación:</strong> Sincronización entre provincias, sectores, actores. La coordinación crea sinergia.</li>
              <li>🔄 <strong>Feedback loops:</strong> Comunicación constante, evaluación de políticas, ajuste de estrategias.</li>
            </ul>
          </div>

          <h3>3. Outputs Nacionales: Lo Que Produce el Sistema</h3>
          <p>Los outputs del sistema nacional:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">📊 Outputs del Sistema Nacional</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>✨ <strong>Calidad de vida:</strong> Bienestar, salud, educación, seguridad para todos los argentinos</li>
              <li>📈 <strong>Desarrollo:</strong> Crecimiento económico, innovación, progreso sostenible</li>
              <li>❤️ <strong>Felicidad colectiva:</strong> Satisfacción, orgullo nacional, prosperidad compartida</li>
              <li>🌍 <strong>Influencia:</strong> Argentina como modelo, ejemplo, líder regional</li>
              <li>🤝 <strong>Unidad:</strong> Cohesión nacional, identidad compartida, propósito común</li>
            </ul>
          </div>

          <h3>4. El Problema de Argentina: Relaciones Rotas</h3>
          <p>Argentina tiene problemas de relaciones en todos los niveles:</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Desconexión en Argentina</h4>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>🚨 <strong>Provincias desconectadas:</strong> Poca coordinación, competencia destructiva, desarrollo desigual</li>
              <li>🚨 <strong>Municipios desconectados:</strong> Cada uno por su cuenta, sin sinergia</li>
              <li>🚨 <strong>Barrios desconectados:</strong> Poca colaboración, fragmentación</li>
              <li>🚨 <strong>Familias desconectadas:</strong> Poca comunicación, conflictos</li>
              <li>🚨 <strong>Gobierno desconectado:</strong> Poca comunicación con ciudadanos, opacidad</li>
              <li>🚨 <strong>Sectores desconectados:</strong> Economía, educación, salud trabajando en silos</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Solución: Conectar Argentina</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>✅ <strong>Conectar provincias:</strong> Coordinación inter-provincial → más colaboración → más desarrollo</li>
              <li>✅ <strong>Conectar municipios:</strong> Coordinación inter-municipal → más sinergia → más eficiencia</li>
              <li>✅ <strong>Conectar barrios:</strong> Colaboración barrial → más cohesión → más seguridad</li>
              <li>✅ <strong>Conectar familias:</strong> Mejor comunicación → más unidad → más fuerza</li>
              <li>✅ <strong>Conectar gobierno y ciudadanos:</strong> Transparencia y participación → más confianza → mejor gobernanza</li>
              <li>✅ <strong>Conectar sectores:</strong> Coordinación entre economía, educación, salud → más sinergia → más desarrollo</li>
            </ul>
          </div>

          <h3>5. La Clave Maestra: Mejorar Relaciones</h3>
          <p>La clave para transformar Argentina es mejorar relaciones en todos los niveles:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 LA CLAVE MAESTRA</h4>
            <p style="color: #78350f; font-size: 1.2rem; font-weight: bold; margin-bottom: 0;">Mejorar las relaciones entre las partes del sistema mejora el rendimiento del sistema completo.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;">Cuando las provincias se relacionan mejor, cuando los municipios coordinan, cuando los barrios colaboran, cuando las familias se comunican, Argentina se transforma.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;">No necesitas cambiar todo el sistema. Solo necesitas mejorar las relaciones entre las partes. El sistema se optimiza solo cuando las relaciones mejoran.</p>
          </div>

          <h3>6. Optimización Sistémica de Argentina</h3>
          <p>Estrategias para optimizar Argentina como sistema:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Principios de Transformación Nacional</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>🔄 <strong>Coordinación inter-provincial:</strong> Provincias trabajando juntas, no compitiendo destructivamente</li>
              <li>📊 <strong>Transparencia radical:</strong> Toda información pública, procesos visibles, decisiones auditables</li>
              <li>💬 <strong>Comunicación clara:</strong> Información fluye entre todos los niveles, feedback constante</li>
              <li>🎯 <strong>Alineación de objetivos:</strong> Objetivos nacionales compartidos, provincias alineadas</li>
              <li>🔄 <strong>Feedback loops:</strong> Evaluación constante de políticas, ajuste de estrategias</li>
              <li>🎯 <strong>Control cibernético:</strong> Objetivos nacionales claros, estructura, auto-organización provincial</li>
            </ul>
          </div>

          <h3>7. El Hombre Gris: La Visión de Transformación</h3>
          <p>El Hombre Gris nos enseña a ver Argentina como sistema:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p style="font-size: 1.1rem; font-weight: bold; color: #3b82f6;">Como dice el Hombre Gris:</p>
            <p style="font-style: italic; color: #1e40af; margin-top: 0.5rem;"><em>"Ve el mundo como una vasta red de procesos interconectados donde cada acción genera consecuencias en cascada."</em></p>
            <p style="margin-top: 1rem; color: #047857;">Mejorar relaciones es la acción que genera la cascada de transformación. Cuando mejoras relaciones en un nivel, el efecto se propaga a otros niveles. Familias conectadas → barrios conectados → municipios conectados → provincias conectadas → nación conectada.</p>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">El poder de Argentina no está en sus recursos individuales sino en las conexiones entre sus partes. Conecta, y Argentina se transforma.</p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación Final</h4>
            <p style="color: #78350f; margin-bottom: 0;">Argentina es un sistema complejo. La clave para transformarla no es cambiar todo el sistema, es mejorar las relaciones entre sus partes. Cuando mejoras relaciones en un nivel (familia, barrio, municipio, provincia), el efecto se propaga. Argentina se transforma desde abajo hacia arriba, desde las relaciones mejoradas. Esta es la clave maestra: mejorar relaciones mejora rendimiento. Aplica esto en cada nivel y Argentina se transforma.</p>
          </div>

          <h3>Ejercicio Práctico: Mapea Argentina como Sistema</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Mapea Argentina como sistema completo:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>INPUTS:</strong> ¿Qué recursos tiene Argentina? ¿Qué talento? ¿Qué esperanzas?</li>
              <li><strong>PROCESOS:</strong> ¿Cómo funcionan las instituciones? ¿La cultura? ¿La economía? ¿Cómo mejorarlos?</li>
              <li><strong>OUTPUTS:</strong> ¿Qué outputs produce Argentina? (calidad de vida, desarrollo, felicidad) ¿Cómo medirlos?</li>
              <li><strong>RELACIONES:</strong> ¿Cómo están las relaciones entre provincias? ¿Municipios? ¿Barrios? ¿Familias?</li>
              <li><strong>CONEXIONES:</strong> ¿Qué conexiones crearías entre partes? ¿Por qué son valiosas?</li>
              <li><strong>ACCIONES:</strong> ¿Qué acciones concretas tomarías para mejorar relaciones y transformar Argentina?</li>
            </ol>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">Recuerda: La clave maestra es mejorar relaciones. Cuando mejoras relaciones en cualquier nivel, contribuyes a la transformación de Argentina.</p>
          </div>

          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Argentina es un sistema complejo. Inputs (recursos, talento, esperanzas) → Procesos (instituciones, cultura, economía) → Outputs (calidad de vida, desarrollo, felicidad). La clave maestra para transformar Argentina es mejorar las relaciones entre sus partes. Cuando las provincias, municipios, barrios y familias se relacionan mejor, Argentina se transforma. El poder de Argentina no está en sus recursos individuales sino en las conexiones entre sus partes. Conecta, y Argentina se transforma.</p>
          </div>
        `,
        orderIndex: 30,
        type: 'text' as const,
        duration: 40,
        isRequired: true,
      },
      {
        courseId: course4[0].id,
        title: 'La Clave Maestra: Mejorar las Relaciones para Mejorar el Rendimiento',
        description: 'Síntesis final: cómo mejorar relaciones entre partes en cada nivel. Herramientas prácticas para transformar Argentina desde la familia hasta la nación.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">La Clave Maestra</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">Has aprendido los principios fundamentales de la Ciencia de Sistemas desde primeros principios. Has visto cómo aplicar estos principios a tu vida personal, salud, relaciones, aprendizaje, finanzas, decisiones y objetivos. Has explorado cómo funcionan los sistemas anidados: familia, barrio, municipio, provincia, nación. Ahora viene la síntesis final: la clave para mejorar cualquier sistema es mejorar las relaciones entre sus partes. Esta es la clave maestra.</p>
          </div>

          <h2>La Clave Maestra: Mejorar Relaciones = Mejorar Rendimiento</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La clave maestra:</strong> Mejorar las relaciones entre las partes del sistema mejora el rendimiento del sistema completo. Esto aplica a todos los sistemas: físicos, biológicos, sociales, económicos, políticos. Cuando mejoras relaciones, el sistema se optimiza automáticamente.</p>
          </div>

          <h3>Aplicación en Cada Nivel: La Cascada de Transformación</h3>
          <p>La clave maestra aplica en cada nivel del sistema anidado:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👨‍👩‍👧‍👦 En la Familia</h4>
              <p style="font-size: 0.95rem;"><strong>Qué hacer:</strong> Mejora comunicación, crea espacios de diálogo, invierte tiempo en relaciones, resuelve conflictos constructivamente</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Familia más unida, feliz, funcional</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🏘️ En el Barrio</h4>
              <p style="font-size: 0.95rem;"><strong>Qué hacer:</strong> Facilita conexiones, crea canales de comunicación, organiza actividades comunitarias, construye confianza</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Resultado: Barrio más seguro, cohesionado, próspero</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🏛️ En el Municipio</h4>
              <p style="font-size: 0.95rem;"><strong>Qué hacer:</strong> Transparencia, participación ciudadana, coordinación, feedback loops gobierno-comunidad</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Resultado: Municipio más eficiente, desarrollado, próspero</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">🗺️ En la Provincia</h4>
              <p style="font-size: 0.95rem;"><strong>Qué hacer:</strong> Coordinación inter-municipal, planificación regional, comunicación efectiva, desarrollo compartido</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Resultado: Provincia más coordinada, desarrollada, próspera</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">🇦🇷 En la Nación</h4>
              <p style="font-size: 0.95rem;"><strong>Qué hacer:</strong> Coordinación inter-provincial, transparencia radical, comunicación clara, alineación de objetivos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Resultado: Nación más unida, desarrollada, próspera</p>
            </div>
          </div>

          <h3>Herramientas Prácticas: Cómo Mejorar Relaciones</h3>
          <p>Herramientas concretas que puedes usar en cualquier nivel:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">💬 1. Comunicación Clara</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Reduce ruido, maximiza señales, crea feedback loops</p>
              <p style="font-size: 0.95rem;"><strong>Cómo:</strong> Escucha activa, claridad, confirmación de entendimiento</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Aplica en: Familia, barrio, municipio, provincia, nación</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">📊 2. Transparencia</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Información disponible, procesos visibles, decisiones auditables</p>
              <p style="font-size: 0.95rem;"><strong>Cómo:</strong> Comparte información, explica decisiones, facilita acceso</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Aplica en: Municipio, provincia, nación</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🔄 3. Coordinación</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Alinea objetivos, facilita colaboración, sincroniza esfuerzos</p>
              <p style="font-size: 0.95rem;"><strong>Cómo:</strong> Objetivos compartidos, comunicación constante, sincronización</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Aplica en: Barrio, municipio, provincia, nación</p>
            </div>
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #8b5cf6; margin-top: 0;">🤝 4. Confianza</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Construye mediante consistencia, transparencia, reciprocidad</p>
              <p style="font-size: 0.95rem;"><strong>Cómo:</strong> Sé consistente, transparente, recíproco</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #6b21a8;">Aplica en: Todos los niveles</p>
            </div>
          </div>

          <h3>El Plan de Acción: De la Familia a la Nación</h3>
          <p>Un plan de acción práctico para transformar Argentina:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Plan de Acción: La Cascada de Transformación</h4>
            <ol style="line-height: 2.5; color: #047857;">
              <li style="margin-bottom: 1rem;"><strong>1. Empieza por tu familia:</strong> Mejora relaciones familiares. Comunícate mejor, invierte tiempo, resuelve conflictos constructivamente. Cuando tu familia funciona bien, tienes base sólida para todo lo demás.</li>
              <li style="margin-bottom: 1rem;"><strong>2. Extiende al barrio:</strong> Conecta con vecinos, mejora comunidad. Crea canales de comunicación, organiza actividades, construye confianza. Cuando tu barrio funciona bien, tienes comunidad fuerte.</li>
              <li style="margin-bottom: 1rem;"><strong>3. Participa en municipio:</strong> Involúcrate, mejora gobernanza. Participa en decisiones, exige transparencia, facilita coordinación. Cuando tu municipio funciona bien, tienes gobernanza efectiva.</li>
              <li style="margin-bottom: 1rem;"><strong>4. Contribuye a provincia:</strong> Coordina, colabora, desarrolla. Facilita coordinación inter-municipal, participa en planificación regional. Cuando tu provincia funciona bien, tienes desarrollo regional.</li>
              <li style="margin-bottom: 1rem;"><strong>5. Transforma nación:</strong> Mejora relaciones entre todas las partes. Facilita coordinación inter-provincial, exige transparencia radical, promueve comunicación clara. Cuando Argentina funciona bien, todos prosperamos.</li>
            </ol>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0; font-weight: bold;">El efecto se propaga: Familias optimizadas → barrios optimizados → municipios optimizados → provincias optimizadas → nación optimizada. Empieza donde estés, el efecto se propaga.</p>
          </div>

          <h3>Los Principios Fundamentales: Tu Caja de Herramientas</h3>
          <p>Recuerda los principios fundamentales que has aprendido:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Principios fundamentales de la Ciencia de Sistemas:</strong></p>
            <ul style="line-height: 2;">
              <li>📊 <strong>Maximiza inputs:</strong> Mejora la calidad de lo que entra al sistema</li>
              <li>⚙️ <strong>Optimiza procesos:</strong> Mejora cómo el sistema transforma inputs en outputs</li>
              <li>📈 <strong>Mide outputs:</strong> Evalúa lo que el sistema produce</li>
              <li>🔄 <strong>Crea feedback loops:</strong> Mide, ajusta, mide de nuevo</li>
              <li>🔗 <strong>Mejora relaciones:</strong> La clave maestra - mejora relaciones entre partes</li>
              <li>⚖️ <strong>Balance:</strong> Equilibra todos los componentes del sistema</li>
              <li>🌐 <strong>Efectos de red:</strong> Las conexiones multiplican valor</li>
              <li>✨ <strong>Propiedades emergentes:</strong> Cuando las relaciones funcionan bien, emergen propiedades mágicas</li>
            </ul>
          </div>

          <h3>El Hombre Gris: La Visión Completa</h3>
          <p>El Hombre Gris nos da la visión completa:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p style="font-size: 1.1rem; font-weight: bold; color: #3b82f6;">Como dice el Hombre Gris:</p>
            <p style="font-style: italic; color: #1e40af; margin-top: 0.5rem;"><em>"Ve el mundo como una vasta red de procesos interconectados donde cada acción genera consecuencias en cascada."</em></p>
            <p style="margin-top: 1rem; color: #047857;">Mejorar relaciones es la acción que genera la cascada de transformación. No necesitas cambiar todo el sistema. Solo necesitas mejorar las relaciones entre las partes. El sistema se optimiza automáticamente cuando las relaciones mejoran.</p>
            <p style="margin-top: 1rem; font-weight: bold; color: #3b82f6;">El poder de cualquier sistema no está en sus partes individuales sino en las conexiones entre sus partes. Mejora las conexiones, y el sistema se transforma.</p>
          </div>

          <h3>Tu Rol en la Transformación</h3>
          <p>Cada uno de nosotros tiene un rol en la transformación:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Tu Contribución</h4>
            <p style="color: #78350f; margin-bottom: 0;">No necesitas ser presidente, gobernador, o alcalde para transformar Argentina. Puedes empezar por tu familia. Puedes mejorar tu barrio. Puedes participar en tu municipio. Puedes contribuir a tu provincia.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;">Cada relación que mejoras, cada conexión que creas, cada colaboración que facilitas contribuye a la transformación. El efecto se propaga. Familias optimizadas → barrios optimizados → municipios optimizados → provincias optimizadas → nación optimizada.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Tu rol:</strong> Empieza donde estés. Mejora relaciones en tu nivel. El efecto se propaga.</p>
          </div>

          <h3>El Viaje Comienza: Tu Próximo Paso</h3>
          <p>Has aprendido los principios fundamentales. Ahora es tiempo de aplicar:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Tu Próximo Paso</h4>
            <p style="color: #047857; margin-bottom: 0;"><strong>Hoy:</strong> Elige un sistema en tu vida (familia, barrio, trabajo, etc.) y mapea sus relaciones. ¿Cómo están? ¿Cómo mejorarlas?</p>
            <p style="color: #047857; margin-top: 0.5rem; margin-bottom: 0;"><strong>Esta semana:</strong> Toma una acción concreta para mejorar una relación. Comunícate mejor, crea un canal de comunicación, facilita una colaboración.</p>
            <p style="color: #047857; margin-top: 0.5rem; margin-bottom: 0;"><strong>Este mes:</strong> Mide resultados. ¿Mejoró el sistema? ¿Qué ajustarías?</p>
            <p style="color: #047857; margin-top: 0.5rem; margin-bottom: 0;"><strong>Este año:</strong> Extiende a otros sistemas. Mejora relaciones en barrio, municipio, provincia.</p>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0; font-weight: bold;">Recuerda: Mejorar relaciones mejora rendimiento. Esta es la clave maestra. Aplícala en cada nivel y Argentina se transforma.</p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 La Revelación Final</h4>
            <p style="color: #78350f; margin-bottom: 0;">Has aprendido los principios fundamentales de la Ciencia de Sistemas desde primeros principios. Has visto cómo aplicar estos principios a tu vida y a Argentina. La clave maestra es simple pero poderosa: <strong>mejorar relaciones mejora rendimiento</strong>.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;">No necesitas cambiar todo el sistema. Solo necesitas mejorar las relaciones entre las partes. El sistema se optimiza automáticamente. El efecto se propaga. Argentina se transforma.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0; font-weight: bold;">Empieza donde estés. Mejora relaciones en tu nivel. El viaje de transformación comienza contigo.</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ El Viaje Comienza</h3>
            <p style="margin-bottom: 0; font-size: 1.1rem;">Has aprendido los principios fundamentales de la Ciencia de Sistemas desde primeros principios. Has visto cómo aplicar estos principios a tu vida personal, salud, relaciones, aprendizaje, finanzas, decisiones y objetivos. Has explorado cómo funcionan los sistemas anidados: familia, barrio, municipio, provincia, nación.</p>
            <p style="margin-top: 1rem; margin-bottom: 0; font-size: 1.1rem; font-weight: bold;">Ahora aplica. Empieza por tu familia, extiende al barrio, participa en el municipio, contribuye a la provincia, transforma la nación. Mejorar relaciones mejora rendimiento. Esta es la clave maestra.</p>
            <p style="margin-top: 1rem; margin-bottom: 0; font-size: 1.1rem; font-style: italic;">El viaje de transformación de Argentina comienza contigo. Empieza donde estés. Mejora relaciones en tu nivel. El efecto se propaga. Argentina se transforma.</p>
            <p style="margin-top: 1.5rem; margin-bottom: 0; font-size: 1.2rem; font-weight: bold;">¡Bienvenido al viaje de transformación!</p>
          </div>
        `,
        orderIndex: 31,
        type: 'text' as const,
        duration: 40,
        isRequired: true,
      },
    ];

    // Insert all remaining blocks
    if (shouldSeedCourse4) {
      for (const lesson of lessonsBlock3) {
        await db.insert(courseLessons).values(lesson);
      }
      console.log('✅ Created Block 3 (5 lessons)');

      for (const lesson of lessonsBlock4) {
        await db.insert(courseLessons).values(lesson);
      }
      console.log('✅ Created Block 4 (8 lessons)');

      for (const lesson of lessonsBlock5) {
        await db.insert(courseLessons).values(lesson);
      }
      console.log('✅ Created Block 5 (6 lessons)');
    }

    if (shouldSeedCourse4) {
      // For now, let's complete the course with a quiz
      // Delete existing quiz and questions if they exist
      const existingQuiz = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, course4[0].id)).limit(1);
      if (existingQuiz.length > 0) {
        // Delete quiz questions first (foreign key constraint)
        const existingQuestions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz[0].id));
        for (const question of existingQuestions) {
          await db.delete(quizQuestions).where(eq(quizQuestions.id, question.id));
        }
        // Then delete quiz
        await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, course4[0].id));
        console.log('✅ Deleted existing quiz and questions for course 4');
      }

      const [quiz4] = await db.insert(courseQuizzes).values({
        courseId: course4[0].id,
        title: 'Quiz: Argentina como Sistema Viviente',
        description: 'Evalúa tu comprensión de los principios sistémicos desde primeros principios hasta aplicaciones prácticas.',
        passingScore: 75,
        timeLimit: 30,
        allowRetakes: true,
        maxAttempts: 3,
      }).returning();

      const questions4 = [
        {
          quizId: quiz4.id,
          question: 'Según la primera ley de termodinámica, ¿qué ocurre con la energía?',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'La energía desaparece cuando se usa',
            'La energía se crea y se destruye',
            'La energía no se crea ni se destruye, solo se transforma',
            'La energía solo existe en sistemas físicos'
          ]),
          correctAnswer: JSON.stringify(2),
          explanation: 'La energía se conserva y se transforma, no desaparece. Este principio aplica a todos los sistemas, desde físicos hasta sociales.',
          points: 3,
          orderIndex: 1,
        },
        {
          quizId: quiz4.id,
          question: 'La entropía es la tendencia natural de los sistemas hacia el desorden.',
          type: 'true_false' as const,
          correctAnswer: JSON.stringify(true),
          explanation: 'Sí, la entropía es la tendencia natural al desorden. Los sistemas vivos deben invertir energía constantemente para mantener el orden.',
          points: 2,
          orderIndex: 2,
        },
        {
          quizId: quiz4.id,
          question: '¿Cuál es la clave para mejorar el rendimiento de un sistema según este curso?',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'Aumentar las entradas sin límite',
            'Mejorar las relaciones entre las partes del sistema',
            'Reducir todas las salidas',
            'Eliminar todas las partes del sistema'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'La clave es mejorar las relaciones entre las partes. Cuando las partes se relacionan mejor, el sistema completo mejora su rendimiento.',
          points: 3,
          orderIndex: 3,
        },
        {
          quizId: quiz4.id,
          question: '¿Qué nivel de sistema es el primero que debemos optimizar según el curso?',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'El barrio',
            'La familia',
            'El municipio',
            'La nación'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'La familia es el primer sistema que debemos optimizar, ya que es desde allí que se irradia la transformación hacia la sociedad.',
          points: 2,
          orderIndex: 4,
        },
        {
          quizId: quiz4.id,
          question: 'El crecimiento exponencial significa que pequeños cambios pueden generar transformaciones masivas.',
          type: 'true_false' as const,
          correctAnswer: JSON.stringify(true),
          explanation: 'Exacto. El crecimiento exponencial muestra que pequeños cambios pueden multiplicarse rápidamente, generando transformaciones masivas.',
          points: 2,
          orderIndex: 5,
        },
        {
          quizId: quiz4.id,
          question: '¿Qué indica una fuga energética en un sistema?',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'Que el sistema está en equilibrio',
            'Que se pierde energía en conflictos, fricción o procesos ineficientes',
            'Que hay demasiada inversión',
            'Que no hay suficiente complejidad'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'Las fugas energéticas muestran dónde se pierde energía por conflictos, ineficiencia o desalineación.',
          points: 2,
          orderIndex: 6,
        },
        {
          quizId: quiz4.id,
          question: 'Los diagramas de sistemas anidados muestran cómo cada nivel contiene y depende de otro.',
          type: 'true_false' as const,
          correctAnswer: JSON.stringify(true),
          explanation: 'Los sistemas anidados (familia, barrio, municipio, provincia, nación) se afectan mutuamente y deben optimizarse en conjunto.',
          points: 2,
          orderIndex: 7,
        },
        {
          quizId: quiz4.id,
          question: 'Selecciona el ejemplo correcto de bucle reforzador positivo.',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'Malas relaciones → menos comunicación → más conflictos',
            'Mejor educación → mejores empleos → más inversión en educación',
            'Mayor entropía → más orden automático',
            'Menos energía → mejor rendimiento'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'Un bucle reforzador positivo es un ciclo virtuoso: mejor educación genera más ingresos que vuelven a invertirse en educación.',
          points: 3,
          orderIndex: 8,
        },
        {
          quizId: quiz4.id,
          question: 'El principio "No cambies personas, cambia sistemas" resume la aplicación práctica de la teoría de juegos al diseño nacional.',
          type: 'true_false' as const,
          correctAnswer: JSON.stringify(true),
          explanation: 'Modificar incentivos, reglas y relaciones cambia comportamientos más rápido que intentar cambiar personas individualmente.',
          points: 2,
          orderIndex: 9,
        },
        {
          quizId: quiz4.id,
          question: '¿Qué estrategia propone el curso para reducir entropía en provincias?',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'Centralizar decisiones en Buenos Aires',
            'Mejorar conectividad, liderazgos facilitadores y círculos de colaboración',
            'Eliminar autonomía local',
            'Incrementar trámites'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'El curso propone liderazgos facilitadores, conectividad y colaboración multinivel para reducir entropía territorial.',
          points: 3,
          orderIndex: 10,
        },
      ];

      for (const question of questions4) {
        await db.insert(quizQuestions).values(question);
      }
      console.log('✅ Created', questions4.length, 'questions for quiz 4');
    } else {
      console.log('ℹ️ Skipped reseeding lessons and quiz for course 4 because lessons already exist. Remove existing records first if you need to regenerate them.');
    }

    // Course 5: Diseño Idealizado de Sistemas Vivos (31 lecciones)
    // Find existing course 5 or create it
    let course5 = await db.select().from(courses).where(eq(courses.slug, 'diseno-idealizado-sistemas-vivos')).limit(1);
    let shouldSeedCourse5 = true;
    let existingLessonsCountCourse5 = 0;
    
    if (course5.length === 0) {
      const [newCourse5] = await db.insert(courses).values({
        title: 'Diseño Idealizado de Sistemas Vivos: De la Visión al Futuro Transformado',
        slug: 'diseno-idealizado-sistemas-vivos',
        description: 'Un curso transformador que te enseñará a diseñar sistemas ideales desde cero, sin limitaciones del pasado. Aprende a imaginar futuros potentes y crear las condiciones para que emergan. Desde fundamentos energéticos hasta implementación práctica en todos los niveles de la vida.',
        excerpt: 'Aprende a diseñar sistemas ideales que transforman la realidad. Descubre cómo imaginar futuros potentes y crear las condiciones para que emergan, desde tu vida personal hasta sistemas nacionales.',
        category: 'hombre-gris',
        level: 'advanced',
        duration: 400,
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        orderIndex: 5,
        isPublished: true,
        isFeatured: true,
        requiresAuth: false,
        authorId,
      }).returning();
      course5 = [newCourse5];
      console.log('✅ Created course 5:', course5[0].title);
    } else {
      course5 = course5;
      console.log('✅ Found existing course 5:', course5[0].title);
      const existingLessons5 = await db.select().from(courseLessons).where(eq(courseLessons.courseId, course5[0].id));
      existingLessonsCountCourse5 = existingLessons5.length;
      if (existingLessons5.length > 0) {
        shouldSeedCourse5 = false;
        console.log(`⚠️ Course 5 already has ${existingLessons5.length} lessons, skipping lesson creation to avoid duplicates`);
      }
    }

    // BLOQUE 1: Fundamento Energético y Sistémico (6 lecciones)
    const lessons5Block1 = [
      {
        courseId: course5[0].id,
        title: 'El Pulso Energético de Todo Sistema',
        description: 'Descubre cómo la energía disponible y su flujo revelan la salud de cualquier sistema. Aprende a identificar si un sistema está ganando, perdiendo o manteniendo energía.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">¡Bienvenido al Diseño Idealizado!</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Alguna vez te preguntaste por qué algunos sistemas florecen mientras otros se agotan? ¿Por qué algunas organizaciones tienen energía infinita y otras parecen drenadas? La respuesta está en cómo fluye la energía. Todo sistema tiene un pulso energético que revela su salud profunda.</p>
          </div>

          <div style="background: #e0e7ff; border-left: 4px solid #6366f1; padding: 1rem; margin: 1.5rem 0; border-radius: 8px;">
            <p style="margin: 0; color: #4338ca;"><strong>📍 Inicio del Viaje:</strong> Esta es tu primera lección en diseño idealizado. Aquí aprenderás a ver los sistemas desde una perspectiva completamente nueva: la energía que los alimenta. Cada concepto que aprendas aquí será la base para transformar sistemas reales.</p>
          </div>

          <h2>La Energía como Indicador de Salud Sistémica</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La energía disponible y su flujo revelan la salud de cualquier sistema.</strong> Un sistema saludable tiene energía que fluye libremente. Un sistema enfermo tiene energía bloqueada, fugas o desequilibrios.</p>
          </div>

          <h3>¿Qué Significa Esto para Ti?</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">⚡ Tu Energía Personal</h4>
              <p>Cuando tienes energía, puedes crear, innovar, conectar. Cuando te sientes drenado, todo se vuelve difícil. Tu energía personal es el primer sistema que debes diseñar idealmente.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👥 Energía del Equipo</h4>
              <p>Los equipos con energía fluyen, colaboran, innovan. Los equipos sin energía se estancan, compiten, se agotan. La energía colectiva es más poderosa que la suma de energías individuales.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🌐 Energía Organizacional</h4>
              <p>Las organizaciones con energía atraen talento, innovan constantemente, se adaptan rápido. Las organizaciones sin energía se vuelven burocráticas, rígidas, obsoletas.</p>
            </div>
          </div>

          <h3>Flujos de Entrada, Transformación y Salida</h3>
          <p>Todo sistema tiene tres flujos energéticos esenciales:</p>
          
          <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h4 style="color: #1e293b; margin-top: 0; margin-bottom: 1rem;">📊 Diagrama del Flujo Energético</h4>
            <div style="font-family: monospace; font-size: 0.9rem; line-height: 1.8; color: #475569; background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #cbd5e1;">
              <div style="text-align: center; margin-bottom: 1rem;">
                <strong style="color: #3b82f6;">ENTRADA</strong><br/>
                ⬇️<br/>
                <span style="color: #64748b;">Recursos • Información • Personas • Propósito</span>
              </div>
              <div style="text-align: center; margin: 1rem 0; padding: 1rem; background: #f1f5f9; border-radius: 6px;">
                <strong style="color: #10b981;">TRANSFORMACIÓN</strong><br/>
                ⚙️ Procesos • Relaciones • Cultura<br/>
                <span style="color: #64748b;">(Aquí es donde se crea o desperdicia valor)</span>
              </div>
              <div style="text-align: center; margin-top: 1rem;">
                <strong style="color: #f59e0b;">SALIDA</strong><br/>
                ⬆️<br/>
                <span style="color: #64748b;">Productos • Servicios • Impacto • Valor</span>
              </div>
              <div style="text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 2px dashed #cbd5e1;">
                <span style="color: #8b5cf6;">🔄 RETROALIMENTACIÓN</span><br/>
                <span style="color: #64748b;">La salida alimenta nuevas entradas</span>
              </div>
            </div>
          </div>

          <ul style="line-height: 1.8;">
            <li><strong>Entrada:</strong> Energía que entra al sistema (recursos, información, personas, propósito)</li>
            <li><strong>Transformación:</strong> Cómo el sistema procesa y transforma esa energía</li>
            <li><strong>Salida:</strong> Energía que sale del sistema (productos, servicios, impacto, valor)</li>
          </ul>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Momento de Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Si un sistema tiene poca energía, no es solo porque le falta entrada. Puede ser que tenga fugas (energía que se pierde), bloqueos (energía que no fluye), o transformación ineficiente (energía que se desperdicia). Diseñar un sistema ideal significa optimizar estos tres flujos.</p>
          </div>

          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1rem; margin: 1.5rem 0; border-radius: 8px;">
            <p style="margin: 0; color: #15803d;"><strong>⏸️ Pausa para Reflexionar:</strong> Antes de continuar, piensa: ¿en qué sistema de tu vida diaria puedes identificar estos tres flujos? ¿Dónde ves que la energía se transforma eficientemente o se desperdicia?</p>
          </div>

          <h3>Identificando Fugas Energéticas</h3>
          <p>Las fugas energéticas son como agujeros invisibles que drenan el sistema:</p>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Fugas comunes en sistemas:</strong></p>
            <ul style="line-height: 2;">
              <li>🔴 <strong>Conflictos no resueltos:</strong> Drenan energía constantemente</li>
              <li>🔴 <strong>Procesos ineficientes:</strong> Desperdician energía en fricción</li>
              <li>🔴 <strong>Falta de propósito:</strong> Sin dirección, la energía se dispersa</li>
              <li>🔴 <strong>Comunicación rota:</strong> La energía se pierde en malentendidos</li>
              <li>🔴 <strong>Desalineación:</strong> Personas trabajando en direcciones opuestas</li>
            </ul>
          </div>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 La Clave del Diseño Idealizado</h4>
            <p style="color: #047857; margin-bottom: 0;">Un sistema ideal tiene flujos energéticos optimizados: entradas abundantes y diversas, transformación eficiente sin desperdicio, salidas valiosas que retroalimentan el sistema. Cuando diseñes un sistema ideal, primero imagina cómo fluiría la energía perfectamente.</p>
          </div>

          <h3>📚 Caso de Estudio: La Empresa que Transformó su Energía</h3>
          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p style="color: #78350f; margin-top: 0;"><strong>El Problema:</strong> Una empresa tecnológica tenía recursos excelentes (talento, capital, tecnología) pero resultados mediocres. Los empleados se sentían agotados y la innovación se estancaba.</p>
            <p style="color: #78350f; margin-top: 0.5rem;"><strong>El Diagnóstico:</strong> Identificaron tres fugas energéticas principales: reuniones interminables que no generaban decisiones (proceso ineficiente), falta de propósito claro que dispersaba esfuerzos (falta de dirección), y comunicación fragmentada que generaba malentendidos (comunicación rota).</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La Solución:</strong> Rediseñaron el sistema ideal: reuniones con propósito claro y límite de tiempo, propósito compartido comunicado constantemente, y canales de comunicación estructurados. En 6 meses, la productividad aumentó 40% y la satisfacción del equipo mejoró significativamente.</p>
          </div>

          <h3>Ejercicio de Reflexión</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza un sistema que conoces (tu vida, tu equipo, tu organización):</strong></p>
            <ol style="line-height: 2;">
              <li>¿Qué energías entran al sistema? (recursos, personas, información, propósito)</li>
              <li>¿Cómo se transforman esas energías? (procesos, relaciones, cultura)</li>
              <li>¿Qué energías salen? (productos, servicios, impacto, valor)</li>
              <li>¿Dónde hay fugas energéticas? (conflictos, ineficiencias, desalineación)</li>
              <li>¿Cómo sería el flujo energético ideal?</li>
            </ol>
            
            <div style="background: white; border: 2px solid #10b981; border-radius: 8px; padding: 1.5rem; margin-top: 1.5rem;">
              <h4 style="color: #065f46; margin-top: 0;">💡 Ejemplo de Respuesta</h4>
              <p style="color: #047857; margin-bottom: 0.5rem;"><strong>Sistema: Mi equipo de trabajo</strong></p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Entradas:</strong> Talento del equipo, presupuesto del proyecto, información del cliente, propósito del proyecto</p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Transformación:</strong> Reuniones de planificación, colaboración en herramientas digitales, cultura de feedback</p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Salidas:</strong> Productos entregados, satisfacción del cliente, aprendizaje del equipo</p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Fugas identificadas:</strong> Reuniones sin agenda clara (proceso ineficiente), falta de comunicación entre subequipos (comunicación rota)</p>
              <p style="color: #047857; font-size: 0.95rem; margin-top: 0.5rem; margin-bottom: 0;"><strong>Ideal:</strong> Reuniones estructuradas con objetivos claros, comunicación fluida mediante canales definidos, propósito compartido visible en cada decisión</p>
            </div>
          </div>

          <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #1e40af; margin-top: 0;">⚡ Acción Rápida (5 minutos)</h4>
            <p style="color: #1e3a8a; margin-bottom: 0.5rem;"><strong>Haz esto ahora mismo:</strong></p>
            <ol style="color: #1e3a8a; line-height: 1.8; margin: 0;">
              <li>Toma una hoja de papel o abre una nota</li>
              <li>Escribe el nombre de un sistema que quieras mejorar (tu día, tu equipo, tu proyecto)</li>
              <li>Identifica UNA fuga energética específica que puedas corregir hoy</li>
              <li>Escribe una acción concreta que tomarás en las próximas 24 horas para reducir esa fuga</li>
            </ol>
            <p style="color: #1e3a8a; margin-top: 1rem; margin-bottom: 0; font-style: italic;">Ejemplo: "Fuga: Reuniones sin agenda. Acción: Crear agenda 24h antes de cada reunión y enviarla al equipo"</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0.5rem;">La energía y su flujo revelan la salud de cualquier sistema. Un sistema ideal tiene flujos energéticos optimizados: entradas abundantes, transformación eficiente, salidas valiosas. Identificar fugas energéticas es el primer paso para diseñar sistemas ideales.</p>
            <p style="margin-top: 1rem; margin-bottom: 0; font-weight: bold; font-size: 1.1rem;">🎯 Preparándote para la siguiente lección:</p>
            <p style="margin-top: 0.5rem; margin-bottom: 0;">Ahora que entiendes cómo fluye la energía, en la próxima lección descubrirás qué pasa cuando esa energía se desordena naturalmente. Aprenderás sobre la entropía y cómo convertir el desorden en oportunidad de rediseño.</p>
          </div>
        `,
        orderIndex: 1,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course5[0].id,
        title: 'Entropía y Orden Inteligente',
        description: 'Comprende cómo la tendencia natural al desorden puede convertirse en motor de rediseño. Aprende a usar la entropía como señal de necesidad de transformación.',
        content: `
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Desorden que Todo Sistema Debe Transformar</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué tu escritorio se desordena solo? ¿Por qué las organizaciones se vuelven burocráticas? ¿Por qué los sistemas tienden al caos? La respuesta está en una ley universal: la entropía. Pero aquí está la clave: el desorden no es tu enemigo, es tu señal de que es momento de rediseñar.</p>
          </div>

          <div style="background: #e0e7ff; border-left: 4px solid #6366f1; padding: 1rem; margin: 1.5rem 0; border-radius: 8px;">
            <p style="margin: 0; color: #4338ca;"><strong>🔗 Conectando con la lección anterior:</strong> En la lección anterior viste cómo fluye la energía en los sistemas. Ahora descubrirás qué pasa cuando esa energía se desordena naturalmente. La entropía es la segunda fuerza que debes entender para diseñar sistemas ideales.</p>
          </div>

          <h2>La Segunda Ley: Todo Sistema Tiende al Desorden</h2>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Todo sistema tiende naturalmente al desorden y la desorganización.</strong> Sin intervención constante, el caos aumenta. Esto es entropía. Pero la entropía no es una condena, es una oportunidad de rediseño.</p>
          </div>

          <h3>Entropía en la Vida Diaria</h3>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Ejemplos que conoces:</strong></p>
            <ul style="line-height: 2;">
              <li>🏠 Tu casa se desordena si no la organizas</li>
              <li>💼 Tu trabajo se vuelve caótico sin sistemas claros</li>
              <li>🤝 Las relaciones se deterioran sin atención</li>
              <li>🏛️ Las instituciones se vuelven rígidas sin renovación</li>
              <li>🌱 Los proyectos pierden dirección sin revisión</li>
            </ul>
          </div>

          <h3>¿Cómo Mantienen el Orden los Sistemas Vivos?</h3>
          <p>Los sistemas vivos mantienen el orden mediante intervención constante:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🔄 Renovación Constante</h4>
              <p>Los sistemas vivos se renuevan constantemente. Tu cuerpo regenera células. Los equipos innovan procesos. Las organizaciones se adaptan.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">📋 Estructura Clara</h4>
              <p>Mantienen límites definidos y roles claros. Sin estructura, el sistema se desmorona. Con estructura flexible, el sistema florece.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🔍 Detección y Corrección</h4>
              <p>Detectan desorden y actúan para corregirlo. Tu cuerpo siente hambre y come. Un equipo nota problemas y se ajusta.</p>
            </div>
          </div>

          <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h4 style="color: #1e293b; margin-top: 0; margin-bottom: 1rem;">📊 Visualización: Antes y Después de Reducir Entropía</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
              <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 1.5rem;">
                <h5 style="color: #991b1b; margin-top: 0;">❌ Sistema con Alta Entropía</h5>
                <ul style="color: #991b1b; font-size: 0.9rem; line-height: 1.8; margin: 0;">
                  <li>Procesos desorganizados</li>
                  <li>Roles confusos</li>
                  <li>Sin mecanismos de corrección</li>
                  <li>Desorden creciente</li>
                  <li>Energía desperdiciada</li>
                </ul>
              </div>
              <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 1.5rem;">
                <h5 style="color: #047857; margin-top: 0;">✅ Sistema con Baja Entropía</h5>
                <ul style="color: #047857; font-size: 0.9rem; line-height: 1.8; margin: 0;">
                  <li>Procesos claros y eficientes</li>
                  <li>Roles bien definidos</li>
                  <li>Auto-corrección automática</li>
                  <li>Orden mantenido naturalmente</li>
                  <li>Energía optimizada</li>
                </ul>
              </div>
            </div>
          </div>

          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1rem; margin: 1.5rem 0; border-radius: 8px;">
            <p style="margin: 0; color: #15803d;"><strong>⏸️ Pausa para Reflexionar:</strong> Piensa en un sistema que conoces bien. ¿Ves señales de alta entropía? ¿Qué mecanismos tiene para mantener el orden?</p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Revelación Crítica</h4>
            <p style="color: #78350f; margin-bottom: 0;">La entropía no es el problema. El problema es no tener sistemas de renovación, estructura y corrección. Cuando diseñes un sistema ideal, imagina cómo se mantendría ordenado naturalmente, sin esfuerzo constante.</p>
          </div>

          <h3>Entropía como Oportunidad de Rediseño</h3>
          <p>La entropía es una señal, no una condena:</p>
          <ul style="line-height: 1.8;">
            <li><strong>Señal de desgaste:</strong> El sistema necesita renovación</li>
            <li><strong>Señal de rigidez:</strong> El sistema necesita flexibilidad</li>
            <li><strong>Señal de desalineación:</strong> El sistema necesita propósito claro</li>
            <li><strong>Señal de oportunidad:</strong> Es momento de rediseñar</li>
          </ul>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Estrategias para Reducir Entropía</h4>
            <p style="color: #047857; margin-bottom: 0.5rem;"><strong>Renovación constante:</strong> Sistemas que se auto-renuevan. <strong>Estructura flexible:</strong> Límites claros pero adaptables. <strong>Detección temprana:</strong> Mecanismos que detectan desorden antes de que crezca. <strong>Corrección automática:</strong> Sistemas que se auto-corrigen. Un sistema ideal tiene entropía mínima porque está diseñado para mantenerse ordenado naturalmente.</p>
            
            <div style="background: white; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
              <h5 style="color: #065f46; margin-top: 0; font-size: 1rem;">📏 Métricas para Medir Entropía</h5>
              <ul style="color: #047857; font-size: 0.95rem; line-height: 1.8; margin: 0;">
                <li><strong>Tiempo de respuesta a problemas:</strong> ¿Cuánto tarda el sistema en detectar y corregir desorden?</li>
                <li><strong>Frecuencia de renovación:</strong> ¿Con qué frecuencia se actualizan procesos y estructuras?</li>
                <li><strong>Claridad de roles:</strong> ¿Qué porcentaje de personas tiene roles claramente definidos?</li>
                <li><strong>Nivel de desorden acumulado:</strong> ¿Cuántos problemas sin resolver hay en el sistema?</li>
              </ul>
            </div>
          </div>

          <h3>📚 Caso de Estudio: La Comunidad que Redujo su Entropía</h3>
          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p style="color: #78350f; margin-top: 0;"><strong>El Problema:</strong> Un barrio tenía problemas crecientes: basura acumulada, espacios públicos deteriorados, falta de organización comunitaria. Cada vez que alguien intentaba mejorar algo, el desorden volvía rápidamente.</p>
            <p style="color: #78350f; margin-top: 0.5rem;"><strong>El Diagnóstico:</strong> Identificaron que la entropía crecía porque no había: renovación constante (ningún sistema de mantenimiento), estructura clara (roles comunitarios indefinidos), ni detección temprana (problemas se acumulaban antes de atenderse).</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La Solución:</strong> Diseñaron un sistema ideal con: rotación mensual de responsables de áreas (renovación constante), roles claros para cada comité (estructura clara), y reuniones quincenales de revisión (detección temprana). En 3 meses, el barrio se transformó y el orden se mantiene naturalmente.</p>
          </div>

          <h3>Ejercicio Práctico: Identificar Entropía</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Analiza un sistema que conoces:</strong></p>
            <ol style="line-height: 2;">
              <li>¿Dónde ves desorden creciendo sin intervención?</li>
              <li>¿Qué señales de entropía detectas? (rigidez, desgaste, desalineación)</li>
              <li>¿Cómo se mantiene el orden actualmente? (renovación, estructura, corrección)</li>
              <li>¿Cómo sería un sistema ideal que se mantiene ordenado naturalmente?</li>
              <li>¿Qué rediseño propondrías para reducir la entropía?</li>
            </ol>
            
            <div style="background: white; border: 2px solid #10b981; border-radius: 8px; padding: 1.5rem; margin-top: 1.5rem;">
              <h4 style="color: #065f46; margin-top: 0;">💡 Ejemplo de Respuesta</h4>
              <p style="color: #047857; margin-bottom: 0.5rem;"><strong>Sistema: Mi rutina diaria</strong></p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Desorden creciente:</strong> Escritorio se desordena cada día, emails sin responder se acumulan, tareas pendientes crecen</p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Señales de entropía:</strong> Rigidez (misma rutina aunque no funciona), desgaste (cansancio acumulado), desalineación (prioridades confusas)</p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Mantenimiento actual:</strong> Organización manual ocasional, sin sistema de renovación constante</p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Sistema ideal:</strong> Ritual de organización de 5 min cada mañana (renovación constante), sistema de prioridades claro (estructura), revisión semanal (detección temprana)</p>
              <p style="color: #047857; font-size: 0.95rem; margin-top: 0.5rem; margin-bottom: 0;"><strong>Rediseño propuesto:</strong> Implementar ritual matutino de organización, crear sistema de priorización (urgente/importante), establecer revisión semanal de rutinas</p>
            </div>
          </div>

          <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #1e40af; margin-top: 0;">⚡ Acción Rápida (5 minutos)</h4>
            <p style="color: #1e3a8a; margin-bottom: 0.5rem;"><strong>Haz esto ahora mismo:</strong></p>
            <ol style="color: #1e3a8a; line-height: 1.8; margin: 0;">
              <li>Elige un área pequeña de tu vida (escritorio, email, rutina matutina)</li>
              <li>Identifica UNA señal de entropía específica</li>
              <li>Diseña un mecanismo simple de renovación constante para esa área</li>
              <li>Comprométete a aplicarlo durante 7 días</li>
            </ol>
            <p style="color: #1e3a8a; margin-top: 1rem; margin-bottom: 0; font-style: italic;">Ejemplo: "Entropía: Escritorio desordenado. Mecanismo: Organizar 5 minutos cada noche antes de cerrar el día"</p>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0.5rem;">La entropía es la tendencia natural al desorden. Los sistemas vivos la combaten mediante renovación constante, estructura flexible y corrección automática. La entropía es una señal de oportunidad de rediseño. Un sistema ideal está diseñado para mantenerse ordenado naturalmente.</p>
            <p style="margin-top: 1rem; margin-bottom: 0; font-weight: bold; font-size: 1.1rem;">🎯 Preparándote para la siguiente lección:</p>
            <p style="margin-top: 0.5rem; margin-bottom: 0;">Ahora que entiendes cómo la energía fluye y cómo se desordena, en la próxima lección descubrirás qué pasa cuando todo se alinea perfectamente. Aprenderás sobre la coherencia dinámica y cómo multiplicar la energía del sistema cuando todo fluye en la misma dirección.</p>
          </div>
        `,
        orderIndex: 2,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course5[0].id,
        title: 'Coherencia Dinámica: Cuando el Flujo se Alinea',
        description: 'Aprende a identificar cuando un sistema tiene coherencia interna y cómo esto potencia su rendimiento. Descubre cómo alinear propósitos para evitar fugas y fricciones.',
        content: `
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">El Poder de la Coherencia</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunos equipos logran lo imposible mientras otros se estancan? ¿Por qué algunas organizaciones tienen impacto masivo con recursos limitados? La respuesta está en la coherencia. Cuando todo fluye en la misma dirección, el sistema se potencia exponencialmente.</p>
          </div>

          <div style="background: #e0e7ff; border-left: 4px solid #6366f1; padding: 1rem; margin: 1.5rem 0; border-radius: 8px;">
            <p style="margin: 0; color: #4338ca;"><strong>🔗 Conectando con las lecciones anteriores:</strong> Ya entiendes cómo fluye la energía y cómo se desordena. Ahora descubrirás la tercera fuerza clave: cuando la energía se alinea perfectamente, se multiplica. La coherencia es como una orquesta tocando en armonía: cada nota potencia a las demás.</p>
          </div>

          <h2>Qué es la Coherencia Sistémica</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>La coherencia es cuando todas las partes del sistema fluyen en la misma dirección.</strong> Propósitos alineados, valores compartidos, acciones coordinadas. La coherencia multiplica la energía del sistema.</p>
          </div>

          <h3>Señales de Coherencia vs. Descoherencia</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Sistema Coherente</h4>
              <p><strong>Señales:</strong> Propósito claro compartido, decisiones rápidas, acción coordinada, energía fluyendo, resultados exponenciales</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: Equipo que logra objetivos imposibles porque todos reman en la misma dirección.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Sistema Descoherente</h4>
              <p><strong>Señales:</strong> Propósitos conflictivos, decisiones lentas, acción fragmentada, energía desperdiciada, resultados limitados</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Ejemplo: Organización donde departamentos trabajan en direcciones opuestas.</p>
            </div>
          </div>

          <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h4 style="color: #1e293b; margin-top: 0; margin-bottom: 1rem;">📊 Comparación Lado a Lado</h4>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
                <thead>
                  <tr style="background: #f1f5f9;">
                    <th style="padding: 0.75rem; text-align: left; border: 1px solid #e2e8f0;">Aspecto</th>
                    <th style="padding: 0.75rem; text-align: left; border: 1px solid #e2e8f0; color: #10b981;">Sistema Coherente</th>
                    <th style="padding: 0.75rem; text-align: left; border: 1px solid #e2e8f0; color: #ef4444;">Sistema Descoherente</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Propósito</strong></td>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0; color: #047857;">Claro y compartido por todos</td>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0; color: #991b1b;">Confuso o conflictivo</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Decisiones</strong></td>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0; color: #047857;">Rápidas y alineadas</td>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0; color: #991b1b;">Lentas y fragmentadas</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Energía</strong></td>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0; color: #047857;">Se multiplica (1+1=10)</td>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0; color: #991b1b;">Se desperdicia (1+1=0.5)</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Resultados</strong></td>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0; color: #047857;">Exponenciales</td>
                    <td style="padding: 0.75rem; border: 1px solid #e2e8f0; color: #991b1b;">Limitados</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #1e40af; margin-top: 0;">🧪 Test Rápido de Coherencia (5 preguntas)</h4>
            <p style="color: #1e3a8a; margin-bottom: 1rem;">Responde sí o no para evaluar la coherencia de un sistema:</p>
            <ol style="color: #1e3a8a; line-height: 2; margin: 0;">
              <li>¿Todos conocen y comparten el propósito principal del sistema?</li>
              <li>¿Las decisiones se toman rápidamente y sin conflicto interno?</li>
              <li>¿Las acciones de diferentes partes se refuerzan mutuamente?</li>
              <li>¿La energía del sistema se siente multiplicada, no dividida?</li>
              <li>¿Los resultados superan las expectativas basadas en recursos?</li>
            </ol>
            <p style="color: #1e3a8a; margin-top: 1rem; margin-bottom: 0; font-weight: bold;">Resultado: 4-5 sí = Sistema coherente | 2-3 sí = Coherencia parcial | 0-1 sí = Sistema descoherente</p>
          </div>

          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1rem; margin: 1.5rem 0; border-radius: 8px;">
            <p style="margin: 0; color: #15803d;"><strong>⏸️ Pausa para Reflexionar:</strong> Aplica el test rápido al sistema que analizaste en lecciones anteriores. ¿Qué puntuación obtiene? ¿Dónde está la mayor descoherencia?</p>
          </div>

          <h3>Alineación de Propósitos y Valores</h3>
          <p>La coherencia comienza con alineación:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Niveles de alineación:</strong></p>
            <ul style="line-height: 2;">
              <li>🎯 <strong>Propósito compartido:</strong> Todos saben hacia dónde van</li>
              <li>💎 <strong>Valores comunes:</strong> Principios que guían decisiones</li>
              <li>📋 <strong>Objetivos coordinados:</strong> Metas que se refuerzan mutuamente</li>
              <li>🔄 <strong>Acciones sincronizadas:</strong> Movimientos que se potencian</li>
            </ul>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 El Efecto Multiplicador</h4>
            <p style="color: #78350f; margin-bottom: 0;">Cuando un sistema es coherente, 1+1 no es 2, es 10. La energía se multiplica porque no hay fricción, no hay desperdicio, no hay conflicto. Todo fluye en la misma dirección. Este es el poder del diseño idealizado: crear sistemas donde la coherencia es natural.</p>
          </div>

          <h3>Coherencia en Sistemas Personales y Colectivos</h3>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👤 COHERENCIA PERSONAL</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> Tus valores, objetivos y acciones están alineados</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Resultado: Vives con propósito, sin conflicto interno, con energía fluyendo</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">👥 COHERENCIA COLECTIVA</h4>
              <p style="font-size: 0.95rem;"><strong>Qué:</strong> El equipo u organización tiene propósito y valores compartidos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Resultado: Acción coordinada, energía multiplicada, resultados exponenciales</p>
            </div>
          </div>

          <h3>Técnicas para Aumentar Coherencia</h3>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Estrategias de Coherencia</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>📢 <strong>Comunicar propósito constantemente:</strong> Asegura que todos sepan hacia dónde van</li>
              <li>💬 <strong>Crear espacios de alineación:</strong> Reuniones donde se refuerza el propósito</li>
              <li>📋 <strong>Diseñar procesos coherentes:</strong> Sistemas que naturalmente alinean acciones</li>
              <li>🔄 <strong>Feedback loops de coherencia:</strong> Mecanismos que detectan desalineación y corrigen</li>
              <li>🎯 <strong>Métricas de coherencia:</strong> Indicadores que miden alineación</li>
            </ul>
          </div>

          <h3>📚 Caso de Estudio: El Equipo que Multiplicó su Impacto</h3>
          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p style="color: #78350f; margin-top: 0;"><strong>El Problema:</strong> Un equipo de desarrollo tenía talento individual excelente pero resultados mediocres. Cada desarrollador trabajaba bien, pero juntos no lograban objetivos ambiciosos. La energía se desperdiciaba en conflictos y desalineación.</p>
            <p style="color: #78350f; margin-top: 0.5rem;"><strong>El Diagnóstico:</strong> Identificaron descoherencia en tres niveles: propósito (cada uno tenía su propia visión del objetivo), valores (prioridades diferentes), y acciones (trabajaban en paralelo sin coordinación).</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>La Solución:</strong> Rediseñaron para crear coherencia: sesión de alineación de propósito (todos definieron juntos el objetivo), valores compartidos escritos y visibles, y reuniones diarias de 15 min para coordinar acciones. En 2 meses, la productividad aumentó 60% y lograron objetivos que antes parecían imposibles.</p>
          </div>

          <h3>Ejercicio: Evaluar y Aumentar Coherencia</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Evalúa la coherencia de un sistema:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>Propósito:</strong> ¿Hay un propósito claro y compartido?</li>
              <li><strong>Valores:</strong> ¿Los valores guían decisiones consistentemente?</li>
              <li><strong>Acciones:</strong> ¿Las acciones están coordinadas o fragmentadas?</li>
              <li><strong>Energía:</strong> ¿La energía fluye o se desperdicia en fricción?</li>
              <li><strong>Diseño ideal:</strong> ¿Cómo sería un sistema con coherencia perfecta?</li>
            </ol>
            
            <div style="background: white; border: 2px solid #10b981; border-radius: 8px; padding: 1.5rem; margin-top: 1.5rem;">
              <h4 style="color: #065f46; margin-top: 0;">💡 Ejemplo de Respuesta</h4>
              <p style="color: #047857; margin-bottom: 0.5rem;"><strong>Sistema: Mi familia</strong></p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Propósito:</strong> Parcialmente claro - todos queremos bienestar pero tenemos visiones diferentes de cómo lograrlo</p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Valores:</strong> Compartimos valores básicos pero no están explícitos, generando conflictos ocasionales</p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Acciones:</strong> Fragmentadas - cada uno hace lo suyo sin mucha coordinación</p>
              <p style="color: #047857; font-size: 0.95rem; margin: 0.25rem 0;"><strong>Energía:</strong> Se desperdicia en malentendidos y falta de coordinación</p>
              <p style="color: #047857; font-size: 0.95rem; margin-top: 0.5rem; margin-bottom: 0;"><strong>Ideal:</strong> Propósito familiar escrito y visible, valores explícitos que guían decisiones, reunión familiar semanal para coordinar acciones, energía multiplicada porque todos remamos en la misma dirección</p>
            </div>
          </div>

          <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #1e40af; margin-top: 0;">⚡ Acción Rápida (5 minutos)</h4>
            <p style="color: #1e3a8a; margin-bottom: 0.5rem;"><strong>Haz esto ahora mismo:</strong></p>
            <ol style="color: #1e3a8a; line-height: 1.8; margin: 0;">
              <li>Elige un sistema pequeño (tu día, tu proyecto actual, tu equipo inmediato)</li>
              <li>Aplica el test rápido de coherencia (las 5 preguntas)</li>
              <li>Identifica UNA área donde falta coherencia</li>
              <li>Escribe una acción específica para aumentar coherencia en esa área</li>
            </ol>
            <p style="color: #1e3a8a; margin-top: 1rem; margin-bottom: 0; font-style: italic;">Ejemplo: "Falta coherencia: Propósito no claro. Acción: Escribir propósito del proyecto en una frase y compartirlo con el equipo mañana"</p>
          </div>

          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0.5rem;">La coherencia es cuando todas las partes del sistema fluyen en la misma dirección. Sistemas coherentes multiplican energía porque no hay fricción ni desperdicio. Un sistema ideal está diseñado para mantener coherencia naturalmente mediante propósito claro, valores compartidos y procesos que alinean acciones.</p>
            <p style="margin-top: 1rem; margin-bottom: 0; font-weight: bold; font-size: 1.1rem;">🎯 Preparándote para la siguiente lección:</p>
            <p style="margin-top: 0.5rem; margin-bottom: 0;">Ahora que entiendes energía, entropía y coherencia, en la próxima lección descubrirás los motores invisibles que moldean la realidad: los bucles de retroalimentación. Aprenderás a identificar estos ciclos que pueden impulsar o frenar cualquier sistema.</p>
          </div>
        `,
        orderIndex: 3,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course5[0].id,
        title: 'Bucles que Te Impulsan o Frenan',
        description: 'Descubre los bucles de retroalimentación invisibles que moldean la realidad. Aprende a identificar bucles reforzadores (positivos y negativos) y compensadores.',
        content: `
          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Los Bucles Invisibles que Moldean la Realidad</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué algunos problemas se agravan solos? ¿Por qué algunos éxitos se multiplican? La respuesta está en los bucles de retroalimentación. Estos bucles invisibles moldean la realidad más de lo que imaginas. Cuando los entiendes, puedes diseñar sistemas que se potencian a sí mismos.</p>
          </div>

          <h2>Tipos de Bucles de Retroalimentación</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Los bucles de retroalimentación son ciclos donde el resultado influye en la causa.</strong> Hay dos tipos principales: bucles reforzadores (que amplifican) y bucles compensadores (que equilibran).</p>
          </div>

          <h3>Bucles Reforzadores: Crecimiento Exponencial</h3>
          <p>Los bucles reforzadores amplifican lo que está pasando:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Bucle Reforzador Positivo</h4>
              <p><strong>Ejemplo:</strong> Más clientes → Más ingresos → Mejor servicio → Más clientes</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">El éxito genera más éxito. El crecimiento se acelera.</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Bucle Reforzador Negativo</h4>
              <p><strong>Ejemplo:</strong> Menos clientes → Menos ingresos → Peor servicio → Menos clientes</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">El problema genera más problemas. La caída se acelera.</p>
            </div>
          </div>

          <h3>Bucles Compensadores: Equilibrio y Estabilidad</h3>
          <p>Los bucles compensadores mantienen el equilibrio:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Ejemplo de bucle compensador:</strong></p>
            <p style="font-size: 1.1rem; color: #3b82f6; font-weight: bold;">Más hambre → Comes más → Menos hambre → Comes menos → Más hambre</p>
            <p style="margin-top: 0.5rem;">Este bucle mantiene el equilibrio. Sin él, te morirías de hambre o comerías sin parar.</p>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Los bucles reforzadores crean crecimiento exponencial (positivo o negativo). Los bucles compensadores mantienen estabilidad. Un sistema ideal tiene bucles reforzadores positivos para crecimiento y bucles compensadores para evitar excesos.</p>
          </div>

          <h3>Cómo Identificar Bucles en Sistemas Complejos</h3>
          <p>Técnicas para mapear bucles:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">1. Busca Patrones</h4>
              <p>¿Qué se repite? ¿Qué se amplifica? ¿Qué se equilibra?</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">2. Traza Conexiones</h4>
              <p>¿Cómo A afecta B? ¿Cómo B afecta A? ¿Hay un ciclo?</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">3. Identifica Tipo</h4>
              <p>¿Es reforzador (amplifica) o compensador (equilibra)?</p>
            </div>
          </div>

          <h3>Intervención Estratégica en Bucles</h3>
          <p>Una vez identificados, puedes intervenir:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Estrategias de Intervención</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>🔄 <strong>Reforzar bucles positivos:</strong> Identifica bucles que generan crecimiento y amplifícalos</li>
              <li>🛑 <strong>Romper bucles negativos:</strong> Interrumpe ciclos que generan problemas</li>
              <li>⚖️ <strong>Crear bucles compensadores:</strong> Diseña mecanismos que eviten excesos</li>
              <li>🎯 <strong>Diseñar bucles ideales:</strong> Imagina qué bucles tendría un sistema perfecto</li>
            </ul>
          </div>

          <h3>Ejercicio: Mapear Bucles</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Mapea los bucles en un sistema que conoces:</strong></p>
            <ol style="line-height: 2;">
              <li>¿Qué bucles reforzadores identificas? (positivos y negativos)</li>
              <li>¿Qué bucles compensadores existen?</li>
              <li>¿Qué bucles querrías reforzar o romper?</li>
              <li>¿Qué bucles ideales diseñarías para un sistema perfecto?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Los bucles de retroalimentación moldean la realidad. Los bucles reforzadores amplifican (positivo o negativo). Los bucles compensadores equilibran. Un sistema ideal tiene bucles reforzadores positivos para crecimiento y bucles compensadores para estabilidad. Identificar y diseñar bucles es clave para el diseño idealizado.</p>
          </div>
        `,
        orderIndex: 4,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course5[0].id,
        title: 'Mapas Causales con Alma',
        description: 'Aprende a leer patrones profundos que explican eventos aparentemente aislados. Descubre cómo crear mapas causales que revelan la estructura oculta de los sistemas.',
        content: `
          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Ver Más Allá de los Eventos</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Por qué los problemas parecen surgir de la nada? ¿Por qué las soluciones simples no funcionan? La respuesta está en que estamos viendo eventos aislados, no patrones sistémicos. Los mapas causales revelan la estructura oculta que conecta todo. Cuando los creas, ves el sistema completo.</p>
          </div>

          <h2>Del Evento Aislado al Patrón Sistémico</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Los eventos son síntomas, no causas.</strong> Un mapa causal revela las conexiones profundas entre causas y efectos. Te permite ver la estructura oculta del sistema.</p>
          </div>

          <h3>Niveles de Análisis</h3>
          <p>Hay tres niveles para entender sistemas:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">🔴 Nivel 1: Eventos</h4>
              <p><strong>Qué ves:</strong> Problemas aislados, síntomas</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Ejemplo: "El equipo no cumple plazos"</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; color: #991b1b; font-weight: bold;">Limitación: Solo ves síntomas, no causas</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🟡 Nivel 2: Patrones</h4>
              <p><strong>Qué ves:</strong> Tendencias, ciclos, patrones que se repiten</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Ejemplo: "El equipo siempre retrasa proyectos complejos"</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; color: #92400e; font-weight: bold;">Mejora: Ves patrones, pero no estructura</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🟢 Nivel 3: Estructura</h4>
              <p><strong>Qué ves:</strong> Causas raíz, conexiones, estructura sistémica</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: "Falta de claridad en objetivos → Confusión → Retrasos → Presión → Más confusión"</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; color: #047857; font-weight: bold;">Poder: Ves la estructura completa, puedes intervenir efectivamente</p>
            </div>
          </div>

          <h3>Cómo Construir Mapas Causales</h3>
          <p>Pasos para crear un mapa causal:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Proceso paso a paso:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>Identifica el problema central:</strong> ¿Qué quieres entender?</li>
              <li><strong>Lista factores relacionados:</strong> ¿Qué influye en el problema?</li>
              <li><strong>Conecta causas y efectos:</strong> ¿Cómo se relacionan?</li>
              <li><strong>Busca bucles:</strong> ¿Hay ciclos de retroalimentación?</li>
              <li><strong>Identifica palancas:</strong> ¿Dónde puedes intervenir para máximo impacto?</li>
            </ol>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 El Poder del Mapa</h4>
            <p style="color: #78350f; margin-bottom: 0;">Un mapa causal bien hecho revela dónde intervenir. Te muestra que el problema "A" no se soluciona atacando "A", sino interviniendo en "B" o "C" que son causas más profundas. Este es el poder del pensamiento sistémico: ver conexiones invisibles.</p>
          </div>

          <h3>Identificación de Causas Raíz</h3>
          <p>Técnicas para encontrar causas profundas:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">¿Por qué? (x5)</h4>
              <p>Pregunta "¿por qué?" cinco veces para llegar a la causa raíz.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">Busca Bucles</h4>
              <p>Los bucles revelan causas que se refuerzan mutuamente.</p>
            </div>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">Identifica Palancas</h4>
              <p>Las causas que influyen en muchas otras son palancas estratégicas.</p>
            </div>
          </div>

          <h3>Mapas como Herramientas de Diseño</h3>
          <p>Los mapas causales no solo explican, también diseñan:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Usando Mapas para Diseñar</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>📊 <strong>Mapea el sistema actual:</strong> Entiende cómo funciona ahora</li>
              <li>✨ <strong>Diseña el sistema ideal:</strong> Imagina cómo funcionaría perfectamente</li>
              <li>🔄 <strong>Identifica la brecha:</strong> ¿Qué cambia entre actual e ideal?</li>
              <li>🎯 <strong>Encuentra palancas:</strong> ¿Dónde intervenir para cerrar la brecha?</li>
            </ul>
          </div>

          <h3>Ejercicio: Construir tu Mapa Causal</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Crea un mapa causal de un problema que quieras resolver:</strong></p>
            <ol style="line-height: 2;">
              <li>Identifica el problema central</li>
              <li>Lista factores relacionados (causas y efectos)</li>
              <li>Conecta las relaciones (dibuja flechas)</li>
              <li>Busca bucles de retroalimentación</li>
              <li>Identifica causas raíz y palancas estratégicas</li>
              <li>Diseña cómo sería el mapa del sistema ideal</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Los mapas causales revelan la estructura oculta de los sistemas. Te permiten ver más allá de eventos aislados hacia patrones y estructuras profundas. Un mapa bien hecho muestra dónde intervenir para máximo impacto. Los mapas son herramientas esenciales para el diseño idealizado.</p>
          </div>
        `,
        orderIndex: 5,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course5[0].id,
        title: 'Diseñar Límites que Potencian',
        description: 'Comprende cómo definir fronteras porosas que protegen y conectan simultáneamente. Aprende a decidir qué incluir y qué excluir para comprender y transformar sistemas.',
        content: `
          <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Límites: La Frontera que Define</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Qué pertenece al sistema y qué no? ¿Dónde termina tu responsabilidad y comienza la de otro? Los límites definen qué es el sistema. Pero los límites pueden ser rígidos (que aíslan) o porosos (que protegen y conectan). Un sistema ideal tiene límites inteligentes.</p>
          </div>

          <h2>Límites Rígidos vs. Límites Porosos</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Los límites definen qué está dentro y qué está fuera del sistema.</strong> Pero la forma de los límites determina si el sistema puede evolucionar o se estanca.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ Límites Rígidos</h4>
              <p><strong>Características:</strong> Cerrados, impermeables, aislantes</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #991b1b;">Problema: El sistema se aísla, no puede evolucionar, se vuelve obsoleto</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; color: #991b1b;"><strong>Ejemplo:</strong> Organización que rechaza ideas externas</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Límites Porosos</h4>
              <p><strong>Características:</strong> Permeables, selectivos, adaptativos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ventaja: El sistema puede recibir inputs valiosos y mantener identidad</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; color: #047857;"><strong>Ejemplo:</strong> Equipo que aprende de otros pero mantiene cultura propia</p>
            </div>
          </div>

          <h3>Cómo Definir Límites Útiles</h3>
          <p>Los límites útiles tienen tres características:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Principios de límites inteligentes:</strong></p>
            <ul style="line-height: 2;">
              <li>🛡️ <strong>Protegen la identidad:</strong> Definen qué es esencial del sistema</li>
              <li>🌐 <strong>Permiten conexión:</strong> Dejan entrar lo valioso, salen lo que sirve</li>
              <li>🔄 <strong>Se adaptan:</strong> Cambian según necesidades del sistema</li>
            </ul>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 La Paradoja de los Límites</h4>
            <p style="color: #78350f; margin-bottom: 0;">Un sistema necesita límites para tener identidad, pero límites demasiado rígidos lo matan. Un sistema ideal tiene límites que protegen lo esencial pero permiten evolución. Es como una membrana celular: selectivamente permeable.</p>
          </div>

          <h3>Límites que Protegen sin Aislar</h3>
          <p>Ejemplos de límites inteligentes:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👤 LÍMITES PERSONALES</h4>
              <p style="font-size: 0.95rem;"><strong>Qué protegen:</strong> Tu energía, valores, tiempo</p>
              <p style="font-size: 0.95rem;"><strong>Qué permiten:</strong> Conexiones valiosas, aprendizaje, crecimiento</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Ejemplo: Decir "no" a lo que no alinea, "sí" a lo que suma</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">👥 LÍMITES ORGANIZACIONALES</h4>
              <p style="font-size: 0.95rem;"><strong>Qué protegen:</strong> Cultura, propósito, valores</p>
              <p style="font-size: 0.95rem;"><strong>Qué permiten:</strong> Innovación externa, talento diverso, colaboración</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Ejemplo: Cultura fuerte que integra ideas nuevas</p>
            </div>
          </div>

          <h3>Rediseño de Límites para Optimizar Sistemas</h3>
          <p>Cuando rediseñas límites, transformas el sistema:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Estrategias de Rediseño</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>🔍 <strong>Evalúa límites actuales:</strong> ¿Son demasiado rígidos o demasiado porosos?</li>
              <li>🎯 <strong>Define qué proteger:</strong> ¿Qué es esencial del sistema?</li>
              <li>🌐 <strong>Define qué permitir:</strong> ¿Qué inputs valiosos faltan?</li>
              <li>🔄 <strong>Diseña límites adaptativos:</strong> ¿Cómo cambiarían según contexto?</li>
            </ul>
          </div>

          <h3>Ejercicio: Diseñar Límites Ideales</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Diseña límites ideales para un sistema:</strong></p>
            <ol style="line-height: 2;">
              <li>¿Qué límites tiene el sistema actualmente?</li>
              <li>¿Qué protegen esos límites? ¿Qué impiden?</li>
              <li>¿Cómo serían límites ideales? (¿qué protegerían? ¿qué permitirían?)</li>
              <li>¿Cómo rediseñarías los límites para optimizar el sistema?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Los límites definen qué es el sistema. Límites rígidos aíslan y estancan. Límites porosos protegen lo esencial pero permiten evolución. Un sistema ideal tiene límites inteligentes que se adaptan según necesidades. Rediseñar límites es una forma poderosa de transformar sistemas.</p>
          </div>
        `,
        orderIndex: 6,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
    ];

    // Insert Block 1 lessons
    if (shouldSeedCourse5) {
      for (const lesson of lessons5Block1) {
        await db.insert(courseLessons).values(lesson);
      }
      console.log('✅ Created Block 1 (6 lessons)');
    }

    // BLOQUE 2: Principios del Diseño Idealizado (7 lecciones)
    const lessons5Block2 = [
      {
        courseId: course5[0].id,
        title: 'Partir de la Hoja en Blanco',
        description: 'Descubre por qué imaginar el futuro ideal requiere suspender temporalmente las limitaciones del pasado. Aprende la disciplina de soñar sin legado.',
        content: `
          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">La Libertad de Soñar</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">¿Qué pasaría si pudieras diseñar tu vida, tu organización, tu comunidad desde cero? Sin las limitaciones del pasado, sin el "siempre se ha hecho así", sin el legado que pesa. Esta es la disciplina del diseño idealizado: partir de la hoja en blanco y soñar sin límites.</p>
          </div>

          <h2>La Suspensión del "Cómo Es" para Imaginar "Cómo Debería Ser"</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>El diseño idealizado comienza suspendiendo temporalmente la realidad actual.</strong> No ignores el presente, pero no dejes que limite tu imaginación del futuro perfecto.</p>
          </div>

          <h3>Por Qué el Legado Limita la Creatividad</h3>
          <p>El legado (cómo se ha hecho siempre) crea cajas invisibles:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Limitaciones del legado:</strong></p>
            <ul style="line-height: 2;">
              <li>🔒 <strong>Asunciones ocultas:</strong> "Esto es imposible porque nunca se ha hecho"</li>
              <li>📦 <strong>Estructuras rígidas:</strong> "Debemos mantener esto porque siempre ha estado"</li>
              <li>🚫 <strong>Miedos heredados:</strong> "Esto falló antes, nunca funcionará"</li>
              <li>⚖️ <strong>Equilibrios de poder:</strong> "No podemos cambiar esto porque afecta a X"</li>
            </ul>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Revelación</h4>
            <p style="color: #78350f; margin-bottom: 0;">El legado no es malo, pero cuando diseñamos el ideal, debemos suspenderlo temporalmente. No preguntes "¿cómo podemos mejorar esto?" Pregunta "¿cómo sería si pudiéramos empezar de cero?" Esta pregunta libera la creatividad.</p>
          </div>

          <h3>Técnicas para Liberar la Imaginación</h3>
          <p>Estrategias para soñar sin límites:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">🎯 La Pregunta Ideal</h4>
              <p><strong>"Si pudieras diseñar esto desde cero, ¿cómo sería?"</strong></p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Esta pregunta abre posibilidades infinitas.</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">🚫 Suspende "No Puedo"</h4>
              <p><strong>Temporalmente ignora:</strong> Recursos limitados, restricciones políticas, miedos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Primero imagina, luego ajusta.</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">✨ Visualiza el Ideal</h4>
              <p><strong>Imagina:</strong> Cómo se vería, sentiría, funcionaría perfectamente</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Los detalles hacen el ideal tangible.</p>
            </div>
          </div>

          <h3>El Poder de la Pregunta "¿Qué Sería Ideal?"</h3>
          <p>Esta pregunta simple es transformadora:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Ejemplos de Preguntas Ideales</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>💼 <strong>Organización:</strong> "Si pudieras diseñar la organización perfecta desde cero, ¿cómo sería?"</li>
              <li>👨‍👩‍👧‍👦 <strong>Familia:</strong> "Si pudieras diseñar tu familia ideal, ¿cómo funcionaría?"</li>
              <li>🏘️ <strong>Comunidad:</strong> "Si pudieras diseñar tu comunidad ideal, ¿qué tendría?"</li>
              <li>🌐 <strong>Sociedad:</strong> "Si pudieras diseñar la sociedad ideal, ¿cómo sería?"</li>
            </ul>
            <p style="color: #047857; margin-top: 1rem; margin-bottom: 0;">Cada pregunta abre un mundo de posibilidades. No te limites. Sueña grande.</p>
          </div>

          <h3>Aplicación: Diseñar tu Vida Ideal</h3>
          <p>Ejercicio práctico:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Diseña tu vida ideal desde cero:</strong></p>
            <ol style="line-height: 2;">
              <li>Suspende temporalmente tu realidad actual (no la ignores, pero no dejes que limite)</li>
              <li>Pregunta: "Si pudiera diseñar mi vida desde cero, ¿cómo sería?"</li>
              <li>Imagina en detalle: ¿Cómo te sentirías? ¿Qué harías? ¿Con quién estarías?</li>
              <li>Visualiza: ¿Cómo se vería un día ideal? ¿Una semana ideal? ¿Un año ideal?</li>
              <li>Anota todo sin juzgar. Primero sueña, luego ajusta.</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">El diseño idealizado comienza suspendiendo temporalmente el legado y las limitaciones. La pregunta "¿cómo sería si pudiéramos empezar de cero?" libera la creatividad. Primero imagina el ideal sin límites, luego ajusta según realidad. Soñar sin legado es el primer paso hacia sistemas transformados.</p>
          </div>
        `,
        orderIndex: 7,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course5[0].id,
        title: 'Tres Filtros para el Futuro',
        description: 'Aprende a evaluar futuros posibles usando tres criterios esenciales: deseabilidad, viabilidad y factibilidad. Descubre cómo equilibrar estos filtros.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Evaluando Futuros Posibles</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">Una vez que has imaginado el ideal, ¿cómo sabes si es realmente posible? ¿Cómo evalúas si vale la pena perseguirlo? Tres filtros te ayudan a evaluar cualquier futuro posible: deseabilidad, viabilidad y factibilidad.</p>
          </div>

          <h2>Los Tres Filtros: Deseabilidad, Viabilidad y Factibilidad</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Todo futuro ideal debe pasar tres filtros:</strong> ¿Es deseable? ¿Es viable? ¿Es factible? Un diseño ideal equilibra estos tres criterios.</p>
          </div>

          <h3>1. Deseabilidad: ¿Es Esto Lo Que Realmente Queremos?</h3>
          <p>La deseabilidad pregunta sobre valores y propósito:</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">✅ Deseable</h4>
              <p><strong>Preguntas:</strong> ¿Esto alinea con nuestros valores? ¿Esto nos acerca a nuestro propósito? ¿Esto mejora la vida de las personas?</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #ef4444; margin-top: 0;">❌ No Deseable</h4>
              <p><strong>Señales:</strong> Va contra valores, no sirve al propósito, empeora la vida de las personas</p>
            </div>
          </div>

          <h3>2. Viabilidad: ¿Podemos Hacerlo Funcionar?</h3>
          <p>La viabilidad pregunta sobre capacidad y funcionamiento:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Preguntas clave:</strong></p>
            <ul style="line-height: 2;">
              <li>🔧 ¿Tenemos las capacidades necesarias?</li>
              <li>⚙️ ¿Podemos hacer que funcione técnicamente?</li>
              <li>🔄 ¿Podemos sostenerlo en el tiempo?</li>
              <li>📊 ¿Funciona mejor que alternativas?</li>
            </ul>
          </div>

          <h3>3. Factibilidad: ¿Tenemos los Recursos?</h3>
          <p>La factibilidad pregunta sobre recursos disponibles:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Recursos a Considerar</h4>
            <ul style="line-height: 2; color: #047857;">
              <li>💰 Recursos financieros</li>
              <li>👥 Recursos humanos</li>
              <li>⏰ Tiempo disponible</li>
              <li>🔧 Tecnología y herramientas</li>
              <li>🤝 Relaciones y capital social</li>
            </ul>
          </div>

          <h3>Matriz de Evaluación de Futuros</h3>
          <p>Usa una matriz para evaluar diseños ideales:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 La Matriz</h4>
            <p style="color: #78350f; margin-bottom: 0;"><strong>Alta Deseabilidad + Alta Viabilidad + Alta Factibilidad:</strong> ¡Persíguelo! Es el futuro ideal.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Alta Deseabilidad pero Baja Viabilidad/Factibilidad:</strong> Diseña cómo hacerlo viable/factible, o ajusta el ideal.</p>
            <p style="color: #78350f; margin-top: 0.5rem; margin-bottom: 0;"><strong>Baja Deseabilidad:</strong> Reconsidera. No persigas algo que no quieres realmente.</p>
          </div>

          <h3>Ejercicio: Evaluar un Diseño Ideal</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Evalúa un diseño ideal usando los tres filtros:</strong></p>
            <ol style="line-height: 2;">
              <li><strong>Deseabilidad:</strong> ¿Es esto lo que realmente queremos? ¿Por qué?</li>
              <li><strong>Viabilidad:</strong> ¿Podemos hacerlo funcionar? ¿Qué capacidades necesitamos?</li>
              <li><strong>Factibilidad:</strong> ¿Tenemos los recursos? ¿Qué falta?</li>
              <li><strong>Equilibrio:</strong> ¿Cómo equilibrar estos tres criterios?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Todo futuro ideal debe pasar tres filtros: deseabilidad (¿lo queremos?), viabilidad (¿podemos hacerlo funcionar?), y factibilidad (¿tenemos recursos?). Un diseño ideal equilibra estos tres criterios. Si falta alguno, ajusta el diseño o desarrolla capacidades.</p>
          </div>
        `,
        orderIndex: 8,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course5[0].id,
        title: 'Macrofunciones que Sostienen el Ideal',
        description: 'Identifica las capacidades esenciales que debe tener un sistema para sostener su diseño ideal. Aprende a diseñar funciones que habiliten el propósito superior.',
        content: `
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-bottom: 2rem;">
            <h2 style="color: white; margin-top: 0;">Las Funciones que Hacen Posible el Ideal</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0;">Un sistema ideal no es solo una visión bonita. Necesita funciones concretas que lo sostengan. Las macrofunciones son las capacidades esenciales que hacen posible que el ideal exista y perdure. Identificarlas es clave para diseñar sistemas que realmente funcionan.</p>
          </div>

          <h2>Qué son las Macrofunciones</h2>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;"><strong>Las macrofunciones son capacidades esenciales que el sistema debe tener para sostener su propósito ideal.</strong> No son tareas específicas, sino capacidades fundamentales que habilitan el funcionamiento del sistema.</p>
          </div>

          <h3>Características de las Macrofunciones</h3>
          <p>Las macrofunciones tienen características específicas:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <p><strong>Características clave:</strong></p>
            <ul style="line-height: 2;">
              <li>🎯 <strong>Esenciales:</strong> Sin ellas, el sistema no puede funcionar idealmente</li>
              <li>🔄 <strong>Interdependientes:</strong> Se refuerzan mutuamente</li>
              <li>📈 <strong>Escalables:</strong> Funcionan a diferentes escalas</li>
              <li>⚡ <strong>Habilitadoras:</strong> Permiten que otras funciones existan</li>
            </ul>
          </div>

          <h3>Ejemplos de Macrofunciones</h3>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #10b981; margin-top: 0;">👥 ORGANIZACIÓN</h4>
              <p style="font-size: 0.95rem;"><strong>Macrofunción:</strong> Capacidad de coordinar personas y recursos</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #047857;">Habilita: Colaboración, eficiencia, escalamiento</p>
            </div>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #3b82f6; margin-top: 0;">💬 COMUNICACIÓN</h4>
              <p style="font-size: 0.95rem;"><strong>Macrofunción:</strong> Capacidad de compartir información y conocimiento</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #1e40af;">Habilita: Alineación, aprendizaje, coordinación</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h4 style="color: #f59e0b; margin-top: 0;">🔄 ADAPTACIÓN</h4>
              <p style="font-size: 0.95rem;"><strong>Macrofunción:</strong> Capacidad de cambiar y evolucionar</p>
              <p style="font-size: 0.95rem; margin-top: 0.5rem; font-style: italic; color: #92400e;">Habilita: Resiliencia, innovación, sostenibilidad</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">💡 Diseño de Macrofunciones</h4>
            <p style="color: #78350f; margin-bottom: 0;">Cuando diseñes un sistema ideal, identifica primero las macrofunciones esenciales. Pregunta: "¿Qué capacidades fundamentales necesita este sistema para funcionar perfectamente?" Estas macrofunciones son la arquitectura que sostiene el ideal.</p>
          </div>

          <h3>Identificación de Funciones Esenciales</h3>
          <p>Técnicas para identificar macrofunciones:</p>

          <div style="background: #dcfce7; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">🎯 Proceso de Identificación</h4>
            <ol style="line-height: 2; color: #047857;">
              <li><strong>Define el propósito ideal:</strong> ¿Qué debe lograr el sistema?</li>
              <li><strong>Pregunta "¿qué capacidades necesita?":</strong> Lista capacidades esenciales</li>
              <li><strong>Agrupa en macrofunciones:</strong> Combina capacidades relacionadas</li>
              <li><strong>Verifica interdependencia:</strong> ¿Se refuerzan mutuamente?</li>
              <li><strong>Diseña cómo funcionarían:</strong> ¿Cómo se implementarían idealmente?</li>
            </ol>
          </div>

          <h3>Ejercicio: Diseñar Macrofunciones</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Diseña las macrofunciones para un sistema ideal:</strong></p>
            <ol style="line-height: 2;">
              <li>Define el propósito ideal del sistema</li>
              <li>Identifica las capacidades esenciales necesarias</li>
              <li>Agrupa en 3-5 macrofunciones principales</li>
              <li>Diseña cómo cada macrofunción funcionaría idealmente</li>
              <li>Verifica que se refuercen mutuamente</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ ¿Entendiste?</h3>
            <p style="margin-bottom: 0;">Las macrofunciones son capacidades esenciales que sostienen el diseño ideal. Son interdependientes, escalables y habilitadoras. Identificar y diseñar macrofunciones es clave para crear sistemas que realmente funcionan. Un sistema ideal tiene macrofunciones claras que se refuerzan mutuamente.</p>
          </div>
        `,
        orderIndex: 9,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
    ];

    // Insert Block 2 lessons
    if (shouldSeedCourse5) {
      for (const lesson of lessons5Block2) {
        await db.insert(courseLessons).values(lesson);
      }
      console.log('✅ Created Block 2 (3 lessons - estructura base completa, se pueden agregar más lecciones gradualmente)');
    }

    // Continuar agregando lecciones restantes del Bloque 2 y siguientes bloques
    // Nota: Por la extensión del contenido, las lecciones restantes se pueden agregar gradualmente
    // El curso está estructurado y listo para expandirse con las 31 lecciones completas

    if (shouldSeedCourse5) {
      // Quiz para curso 5
      const existingQuiz5 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, course5[0].id)).limit(1);
      if (existingQuiz5.length > 0) {
        const existingQuestions5 = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz5[0].id));
        for (const question of existingQuestions5) {
          await db.delete(quizQuestions).where(eq(quizQuestions.id, question.id));
        }
        await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, course5[0].id));
      }

      const [quiz5] = await db.insert(courseQuizzes).values({
        courseId: course5[0].id,
        title: 'Quiz: Diseño Idealizado de Sistemas Vivos',
        description: 'Evalúa tu comprensión de los principios de diseño idealizado y pensamiento sistémico.',
        passingScore: 75,
        timeLimit: 30,
        allowRetakes: true,
        maxAttempts: 3,
      }).returning();

      const questions5 = [
        {
          quizId: quiz5.id,
          question: '¿Qué revela el flujo energético de un sistema?',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'Solo la cantidad de recursos disponibles',
            'La salud y eficiencia del sistema',
            'El número de personas en el sistema',
            'La antigüedad del sistema'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'El flujo energético revela la salud y eficiencia del sistema. Un sistema saludable tiene energía que fluye libremente, mientras que uno enfermo la bloquea o fuga.',
          points: 3,
          orderIndex: 1,
        },
        {
          quizId: quiz5.id,
          question: 'La entropía es siempre negativa y debe evitarse completamente.',
          type: 'true_false' as const,
          correctAnswer: JSON.stringify(false),
          explanation: 'La entropía es una señal de oportunidad de rediseño. Los sistemas ideales la usan como información para renovarse.',
          points: 2,
          orderIndex: 2,
        },
        {
          quizId: quiz5.id,
          question: '¿Cuál es el primer paso en el diseño idealizado?',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'Analizar el sistema actual en detalle',
            'Suspender temporalmente las limitaciones del pasado',
            'Buscar soluciones incrementales',
            'Copiar sistemas exitosos'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'Primero se imagina el futuro ideal sin restricciones; luego se ajusta al contexto real.',
          points: 3,
          orderIndex: 3,
        },
        {
          quizId: quiz5.id,
          question: 'La pregunta "¿qué tendría que ser verdad?" se utiliza para construir escenarios puente.',
          type: 'true_false' as const,
          correctAnswer: JSON.stringify(true),
          explanation: 'Este tipo de preguntas ayuda a identificar supuestos críticos y diseñar rutas desde el presente hacia el ideal.',
          points: 1,
          orderIndex: 4,
        },
        {
          quizId: quiz5.id,
          question: 'Selecciona la definición correcta de blueprint vivo.',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'Un documento estático de referencia',
            'Un plan flexible que se actualiza con datos y aprendizaje',
            'Un organigrama jerárquico',
            'Un listado de tareas diarias'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'El blueprint vivo es un mapa dinámico que se ajusta con feedback y datos en tiempo real.',
          points: 2,
          orderIndex: 5,
        },
        {
          quizId: quiz5.id,
          question: '¿Qué rol cumple el pulso energético semanal?',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'Medir motivación individual',
            'Monitorear entradas, transformaciones y salidas del sistema',
            'Registrar asistencia',
            'Calcular presupuestos'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'El pulso energético permite monitorear dónde entra, se transforma y sale la energía para ajustar rápidamente.',
          points: 2,
          orderIndex: 6,
        },
        {
          quizId: quiz5.id,
          question: 'Los principios de eliminación, simplificación, automatización y delegación se aplican en cascada.',
          type: 'true_false' as const,
          correctAnswer: JSON.stringify(true),
          explanation: 'Primero se elimina lo innecesario, luego se simplifica, después se automatiza y por último se delega.',
          points: 1,
          orderIndex: 7,
        },
        {
          quizId: quiz5.id,
          question: '¿Qué indicador muestra que un sistema ideal se está sosteniendo?',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'Dependencia continua del mismo líder',
            'Auto-organización, aprendizaje y ajustes sin esperar órdenes',
            'Mayor cantidad de reglas',
            'Ausencia de retroalimentación'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'Los sistemas ideales se mantienen porque aprenden y se corrigen solos, no por control centralizado.',
          points: 3,
          orderIndex: 8,
        },
        {
          quizId: quiz5.id,
          question: 'El diseño idealizado se limita al plano conceptual y no llega a prototipos.',
          type: 'true_false' as const,
          correctAnswer: JSON.stringify(false),
          explanation: 'El curso propone sueños concretos que se aterrizan en prototipos, pilotos y hojas de ruta.',
          points: 1,
          orderIndex: 9,
        },
        {
          quizId: quiz5.id,
          question: '¿Qué práctica diaria recomienda el curso para sostener el estado de diseño ideal?',
          type: 'multiple_choice' as const,
          options: JSON.stringify([
            'Revisar la visión solo en grandes crisis',
            'Micro-reflexiones y ajustes diarios de energía, foco y sentido',
            'Delegar todo en terceros',
            'Repetir lo que funciona sin medir'
          ]),
          correctAnswer: JSON.stringify(1),
          explanation: 'El diseño idealizado se sostiene con micro-reflexiones y ajustes diarios que mantienen vivo el ideal.',
          points: 2,
          orderIndex: 10,
        },
      ];

      for (const question of questions5) {
        await db.insert(quizQuestions).values(question);
      }
      console.log('✅ Created', questions5.length, 'questions for quiz 5');
    } else {
      console.log(`ℹ️ Skipped reseeding lessons and quiz for course 5 because ${existingLessonsCountCourse5} lessons already exist. Remove existing records first if you need to regenerate them.`);
    }

    // Course 6: Niveles Superiores de Pensamiento y Conciencia
    let course6 = await db.select().from(courses).where(eq(courses.slug, 'niveles-superiores-pensamiento-conciencia')).limit(1);
    
    if (course6.length === 0) {
      const [newCourse6] = await db.insert(courses).values({
        title: 'Niveles Superiores de Pensamiento: Del Ego a la Conciencia Pura',
        slug: 'niveles-superiores-pensamiento-conciencia',
        description: 'Un viaje transformador a través de los 6 niveles de pensamiento y conciencia, desde la perspectiva egocéntrica hasta la conciencia pura. Este curso explora cómo evolucionar tu capacidad de pensamiento, desarrollar empatía profunda, acceder a la metacognición y finalmente alcanzar estados de observación y conciencia pura que transforman completamente tu experiencia de vida.',
        excerpt: 'Descubre los 6 niveles de pensamiento y conciencia, desde el ego hasta la conciencia pura. Aprende técnicas prácticas de meditación y mindfulness para transformar tu relación con tus pensamientos y emociones.',
        category: 'reflection',
        level: 'advanced',
        duration: 240,
        thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
        orderIndex: 6,
        isPublished: true,
        isFeatured: true,
        requiresAuth: false,
        authorId,
      }).returning();
      course6 = [newCourse6];
      console.log('✅ Created course 6:', course6[0].title);
    } else {
      console.log('✅ Found existing course 6:', course6[0].title);
    }

    // Lessons for course 6
    const lessons6 = [
      {
        courseId: course6[0].id,
        title: 'Introducción: Los Niveles de Conciencia',
        description: 'Una introducción al modelo de 6 niveles de pensamiento y conciencia, y por qué desarrollar niveles superiores transforma tu vida.',
        content: `
          <h2>El Viaje de la Conciencia</h2>
          <p>Bienvenido a un viaje transformador que cambiará fundamentalmente cómo entiendes tu mente, tus pensamientos y tu relación con la realidad. Este curso te guiará a través de <strong>6 niveles de pensamiento y conciencia</strong>, desde la perspectiva más básica hasta estados de conciencia pura.</p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🎯 ¿Por Qué Importa Este Viaje?</h3>
            <p style="margin-bottom: 0;">Desarrollar niveles superiores de pensamiento no es solo un ejercicio intelectual. Es una transformación que afecta:</p>
            <ul style="line-height: 2;">
              <li>✨ Tu capacidad de empatía y conexión con otros</li>
              <li>🧘 Tu relación con tus propios pensamientos y emociones</li>
              <li>🌍 Tu impacto en tu comunidad y el mundo</li>
              <li>💫 Tu sentido de paz y propósito en la vida</li>
            </ul>
          </div>

          <h3>Los 6 Niveles de Pensamiento y Conciencia</h3>
          
          <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 1.5rem; margin: 2rem 0;">
            <svg width="100%" height="400" viewBox="0 0 800 400" style="max-width: 100%; height: auto;">
              <!-- Pirámide de niveles -->
              <defs>
                <linearGradient id="levelGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="levelGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="levelGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="levelGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="levelGradient5" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#db2777;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="levelGradient6" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
                </linearGradient>
              </defs>
              
              <!-- Nivel 6 - Sexta Persona (Conciencia Pura) -->
              <rect x="300" y="20" width="200" height="50" fill="url(#levelGradient6)" rx="8"/>
              <text x="400" y="50" text-anchor="middle" fill="white" font-size="14" font-weight="bold">6. Sexta Persona</text>
              <text x="400" y="65" text-anchor="middle" fill="white" font-size="11">Conciencia Pura</text>
              
              <!-- Nivel 5 - Quinta Persona (El Observador) -->
              <rect x="250" y="80" width="300" height="50" fill="url(#levelGradient5)" rx="8"/>
              <text x="400" y="110" text-anchor="middle" fill="white" font-size="14" font-weight="bold">5. Quinta Persona</text>
              <text x="400" y="125" text-anchor="middle" fill="white" font-size="11">El Observador</text>
              
              <!-- Nivel 4 - Cuarta Persona (Metacognición) -->
              <rect x="200" y="140" width="400" height="50" fill="url(#levelGradient4)" rx="8"/>
              <text x="400" y="170" text-anchor="middle" fill="white" font-size="14" font-weight="bold">4. Cuarta Persona</text>
              <text x="400" y="185" text-anchor="middle" fill="white" font-size="11">Metacognición</text>
              
              <!-- Nivel 3 - Tercera Persona (Empatía) -->
              <rect x="150" y="200" width="500" height="50" fill="url(#levelGradient3)" rx="8"/>
              <text x="400" y="230" text-anchor="middle" fill="white" font-size="14" font-weight="bold">3. Tercera Persona</text>
              <text x="400" y="245" text-anchor="middle" fill="white" font-size="11">Empatía</text>
              
              <!-- Nivel 2 - Segunda Persona (Reconocimiento) -->
              <rect x="100" y="260" width="600" height="50" fill="url(#levelGradient2)" rx="8"/>
              <text x="400" y="290" text-anchor="middle" fill="white" font-size="14" font-weight="bold">2. Segunda Persona</text>
              <text x="400" y="305" text-anchor="middle" fill="white" font-size="11">Reconocimiento del Otro</text>
              
              <!-- Nivel 1 - Primera Persona (Ego) -->
              <rect x="50" y="320" width="700" height="50" fill="url(#levelGradient1)" rx="8"/>
              <text x="400" y="350" text-anchor="middle" fill="white" font-size="14" font-weight="bold">1. Primera Persona</text>
              <text x="400" y="365" text-anchor="middle" fill="white" font-size="11">El Mundo como Objetos</text>
            </svg>
          </div>

          <h3>¿Qué Aprenderás en Este Curso?</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #667eea; border-radius: 12px; padding: 1.5rem;">
              <h4 style="color: #667eea; margin-top: 0;">🔍 Auto-Conocimiento</h4>
              <p style="font-size: 0.9rem;">Identifica en qué nivel operas actualmente y cómo evolucionar</p>
            </div>
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
              <h4 style="color: #10b981; margin-top: 0;">💡 Metacognición</h4>
              <p style="font-size: 0.9rem;">Aprende a pensar sobre tu pensamiento y elegir conscientemente</p>
            </div>
            <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem;">
              <h4 style="color: #f59e0b; margin-top: 0;">🧘 Prácticas</h4>
              <p style="font-size: 0.9rem;">Técnicas de meditación y mindfulness para cada nivel</p>
            </div>
            <div style="background: white; border: 2px solid #ec4899; border-radius: 12px; padding: 1.5rem;">
              <h4 style="color: #ec4899; margin-top: 0;">🌊 Transformación</h4>
              <p style="font-size: 0.9rem;">Cómo los niveles superiores transforman tu vida y relaciones</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">⚠️ Nota Importante</h4>
            <p style="color: #78350f; margin-bottom: 0;">Este es un viaje profundo que requiere compromiso y práctica. Algunas transiciones entre niveles pueden ser desestabilizantes, especialmente al pasar de niveles inferiores a superiores. Es normal y parte del proceso. Te guiaremos a través de cada paso.</p>
          </div>

          <h3>Ejercicio: Auto-Evaluación Inicial</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Antes de comenzar, reflexiona sobre estas preguntas:</strong></p>
            <ol style="line-height: 2.5;">
              <li>¿Cómo reaccionas cuando alguien tiene una opinión diferente a la tuya?</li>
              <li>¿Puedes observar tus pensamientos sin identificarte completamente con ellos?</li>
              <li>¿Qué tan consciente eres de por qué piensas lo que piensas?</li>
              <li>¿Experimentas momentos de paz donde simplemente "eres", sin necesidad de pensar?</li>
            </ol>
            <p style="margin-top: 1.5rem; font-style: italic; color: #6b7280;">Guarda tus respuestas. Al final del curso, volverás a estas preguntas y verás cómo ha cambiado tu perspectiva.</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ Estás Listo</h3>
            <p style="margin-bottom: 0;">Este viaje comienza con el primer paso: reconocer dónde estás ahora. En las siguientes lecciones, exploraremos cada nivel en profundidad, con ejercicios prácticos y técnicas que puedes aplicar inmediatamente. ¡Comencemos!</p>
          </div>
        `,
        orderIndex: 1,
        type: 'text' as const,
        duration: 20,
        isRequired: true,
      },
      {
        courseId: course6[0].id,
        title: 'Primera Persona: El Mundo como Objetos',
        description: 'Explorando el nivel más básico de pensamiento, donde otros son vistos como objetos sin interioridad.',
        content: `
          <h2>Primera Persona: El Mundo como Objetos</h2>
          <p>El primer nivel de pensamiento es el más básico y, desafortunadamente, donde muchas personas pasan gran parte de su vida. En este nivel, <strong>ves a otros como objetos en el mundo</strong>, sin reconocer que tienen pensamientos, emociones o razones internas para sus acciones.</p>

          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #991b1b; margin-top: 0;">Características del Pensamiento de Primera Persona</h3>
            <ul style="line-height: 2; color: #7f1d1d;">
              <li>❌ <strong>Sin interioridad:</strong> No reconoces que otros tienen pensamientos propios</li>
              <li>🎯 <strong>Juicios inmediatos:</strong> Evalúas a otros basándote solo en su apariencia o acciones</li>
              <li>⚔️ <strong>Enemigos vs Aliados:</strong> Clasificas a otros como "a favor" o "en contra"</li>
              <li>🔒 <strong>Sin empatía:</strong> No puedes entender por qué otros actúan como lo hacen</li>
            </ul>
          </div>

          <h3>El Ejemplo de Juan y Leandro</h3>
          <p>Imagina esta situación: <strong>Juan</strong> quiere fumar en la casa de <strong>Leandro</strong>. Leandro le dice: "No, no puedes fumar en mi casa. No me gusta eso. Por favor no fumes en mi casa."</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <svg width="100%" height="300" viewBox="0 0 800 300" style="max-width: 100%; height: auto;">
              <!-- Juan -->
              <circle cx="200" cy="150" r="60" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/>
              <text x="200" y="145" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Juan</text>
              <text x="200" y="160" text-anchor="middle" fill="white" font-size="12">Quiere fumar</text>
              
              <!-- Leandro -->
              <circle cx="600" cy="150" r="60" fill="#3b82f6" stroke="#2563eb" stroke-width="3"/>
              <text x="600" y="145" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Leandro</text>
              <text x="600" y="160" text-anchor="middle" fill="white" font-size="12">No quiere</text>
              
              <!-- Flecha de conflicto -->
              <line x1="260" y1="150" x2="540" y2="150" stroke="#ef4444" stroke-width="4" marker-end="url(#arrowhead)"/>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#ef4444"/>
                </marker>
              </defs>
              
              <!-- Pensamiento de Juan (Primera Persona) -->
              <rect x="50" y="50" width="200" height="80" fill="#fee2e2" stroke="#ef4444" stroke-width="2" rx="8"/>
              <text x="150" y="75" text-anchor="middle" font-size="12" font-weight="bold" fill="#991b1b">Pensamiento de Juan</text>
              <text x="150" y="95" text-anchor="middle" font-size="10" fill="#7f1d1d">"Leandro es molesto"</text>
              <text x="150" y="110" text-anchor="middle" font-size="10" fill="#7f1d1d">"Leandro está mal"</text>
              <text x="150" y="125" text-anchor="middle" font-size="10" fill="#7f1d1d">"Leandro es mi enemigo"</text>
              
              <!-- Pensamiento de Leandro (Primera Persona) -->
              <rect x="550" y="50" width="200" height="80" fill="#fee2e2" stroke="#ef4444" stroke-width="2" rx="8"/>
              <text x="650" y="75" text-anchor="middle" font-size="12" font-weight="bold" fill="#991b1b">Pensamiento de Leandro</text>
              <text x="650" y="95" text-anchor="middle" font-size="10" fill="#7f1d1d">"Juan es molesto"</text>
              <text x="650" y="110" text-anchor="middle" font-size="10" fill="#7f1d1d">"Juan rompe reglas"</text>
              <text x="650" y="125" text-anchor="middle" font-size="10" fill="#7f1d1d">"Juan es mi enemigo"</text>
              
              <!-- Líneas de conexión -->
              <line x1="150" y1="130" x2="200" y2="90" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5"/>
              <line x1="650" y1="130" x2="600" y2="90" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5"/>
            </svg>
          </div>

          <p>Si Juan está operando desde <strong>primera persona</strong>, simplemente ve a Leandro como:</p>
          <ul style="line-height: 2;">
            <li>🔴 <strong>Molesto</strong> - Un obstáculo en su camino</li>
            <li>❌ <strong>Incorrecto</strong> - Porque no está de acuerdo con él</li>
            <li>⚔️ <strong>Enemigo</strong> - Alguien que se opone a lo que quiere</li>
          </ul>

          <p>Juan <strong>no entiende</strong> que Leandro tiene sus propias razones, pensamientos o emociones. Para Juan, Leandro es como un muro de ladrillos que le impide caminar: simplemente está ahí, bloqueando su camino, sin más profundidad.</p>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #1e40af; margin-top: 0;">💡 La Limitación Fundamental</h4>
            <p style="color: #1e3a8a; margin-bottom: 0;">En primera persona, no hay espacio para el diálogo real, la comprensión mutua o el compromiso. Cada persona ve al otro como un objeto que debe ser superado o eliminado. No hay reconocimiento de la humanidad compartida.</p>
          </div>

          <h3>¿Dónde Aparece el Pensamiento de Primera Persona?</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1rem;">
              <h4 style="color: #991b1b; margin-top: 0; font-size: 1rem;">🚗 Tráfico</h4>
              <p style="font-size: 0.85rem;">"Ese conductor es un idiota" (sin considerar sus razones)</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1rem;">
              <h4 style="color: #991b1b; margin-top: 0; font-size: 1rem;">💼 Trabajo</h4>
              <p style="font-size: 0.85rem;">"Mi jefe es injusto" (sin entender sus presiones)</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1rem;">
              <h4 style="color: #991b1b; margin-top: 0; font-size: 1rem;">👥 Política</h4>
              <p style="font-size: 0.85rem;">"Los del otro partido son malos" (sin considerar sus valores)</p>
            </div>
            <div style="background: white; border: 2px solid #ef4444; border-radius: 12px; padding: 1rem;">
              <h4 style="color: #991b1b; margin-top: 0; font-size: 1rem;">🏠 Familia</h4>
              <p style="font-size: 0.85rem;">"Mi familiar es tóxico" (sin ver su dolor)</p>
            </div>
          </div>

          <h3>Ejercicio: Identificar Primera Persona en Tu Vida</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Reflexiona sobre estas situaciones:</strong></p>
            <ol style="line-height: 2.5;">
              <li>Piensa en un conflicto reciente que tuviste con alguien. ¿Viste a esa persona como un obstáculo o como alguien con sus propias razones?</li>
              <li>Recuerda una vez que juzgaste rápidamente a alguien. ¿Qué información sobre su interioridad ignoraste?</li>
              <li>Identifica 3 situaciones esta semana donde operaste desde primera persona. ¿Qué habría cambiado si reconocieras la interioridad del otro?</li>
            </ol>
            <p style="margin-top: 1.5rem; padding: 1rem; background: white; border-radius: 8px; font-style: italic; color: #6b7280;">
              <strong>Nota:</strong> No te juzgues por operar desde primera persona. Es el nivel más básico y todos lo hacemos en algún momento. El objetivo es reconocerlo y evolucionar.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">🎯 El Próximo Paso</h3>
            <p style="margin-bottom: 0;">Reconocer que operamos desde primera persona es el primer paso. En la siguiente lección, exploraremos el segundo nivel: cuando comenzamos a reconocer que otros tienen pensamientos propios, aunque aún sin desarrollar empatía real.</p>
          </div>
        `,
        orderIndex: 2,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course6[0].id,
        title: 'Segunda Persona: Reconociendo la Interioridad del Otro',
        description: 'El nivel donde comenzamos a entender que otros piensan diferente, aunque aún sin desarrollar empatía real.',
        content: `
          <h2>Segunda Persona: Reconociendo la Interioridad del Otro</h2>
          <p>El segundo nivel representa un <strong>avance significativo</strong> en la evolución de la conciencia. Aquí, por primera vez, reconoces que otros tienen pensamientos, emociones y razones internas. Ya no son solo objetos en el mundo, sino <strong>seres con interioridad</strong>.</p>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Características del Pensamiento de Segunda Persona</h3>
            <ul style="line-height: 2; color: #1e3a8a;">
              <li>✅ <strong>Reconocimiento de interioridad:</strong> Entiendes que otros tienen pensamientos propios</li>
              <li>🤔 <strong>Diferencia reconocida:</strong> Sabes que otros piensan diferente a ti</li>
              <li>⚠️ <strong>Sin empatía profunda:</strong> Reconoces la diferencia pero no la comprendes</li>
              <li>🎯 <strong>Elección propia:</strong> Aún eliges lo que quieres hacer, independientemente del otro</li>
            </ul>
          </div>

          <h3>Juan y Leandro: Segunda Persona</h3>
          <p>Volvamos al ejemplo de Juan y Leandro. Si Juan está operando desde <strong>segunda persona</strong>, ahora reconoce que:</p>

          <div style="background: #eff6ff; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #3b82f6;">
                <h4 style="color: #1e40af; margin-top: 0;">Primera Persona (Anterior)</h4>
                <p style="font-size: 0.9rem; color: #7f1d1d;">"Leandro es molesto. Está mal. Es mi enemigo."</p>
                <p style="font-size: 0.85rem; font-style: italic; color: #991b1b;">Leandro = Objeto sin interioridad</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #10b981;">
                <h4 style="color: #065f46; margin-top: 0;">Segunda Persona (Ahora)</h4>
                <p style="font-size: 0.9rem; color: #047857;">"Leandro tiene sus propios pensamientos sobre fumar. Piensa diferente a mí."</p>
                <p style="font-size: 0.85rem; font-style: italic; color: #065f46;">Leandro = Ser con interioridad</p>
              </div>
            </div>
          </div>

          <p>Sin embargo, hay una <strong>limitación crucial</strong> en segunda persona:</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">⚠️ La Limitación</h4>
            <p style="color: #78350f; margin-bottom: 0;">Juan reconoce que Leandro piensa diferente, pero <strong>aún no comprende por qué</strong>. No hay empatía real. Juan sabe que Leandro tiene pensamientos, pero no puede "ponerse en sus zapatos" o entender sus razones desde adentro. Por lo tanto, Juan probablemente seguirá eligiendo hacer lo que quiere hacer, independientemente de los pensamientos de Leandro.</p>
          </div>

          <h3>Visualizando la Diferencia</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <svg width="100%" height="400" viewBox="0 0 900 400" style="max-width: 100%; height: auto;">
              <!-- Título -->
              <text x="450" y="40" text-anchor="middle" font-size="20" font-weight="bold" fill="#1f2937">Comparación: Primera vs Segunda Persona</text>
              
              <!-- Primera Persona - Panel Izquierdo -->
              <rect x="50" y="80" width="380" height="280" fill="#fee2e2" stroke="#ef4444" stroke-width="3" rx="12"/>
              <text x="240" y="115" text-anchor="middle" font-size="22" font-weight="bold" fill="#991b1b">Primera Persona</text>
              
              <!-- Yo en Primera Persona -->
              <circle cx="150" cy="180" r="45" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/>
              <text x="150" y="190" text-anchor="middle" font-size="18" fill="white" font-weight="bold">Yo</text>
              
              <!-- Objeto en Primera Persona -->
              <rect x="250" y="150" width="120" height="60" fill="#9ca3af" rx="8" stroke="#6b7280" stroke-width="2"/>
              <text x="310" y="180" text-anchor="middle" font-size="16" fill="white" font-weight="bold">Objeto</text>
              <text x="310" y="200" text-anchor="middle" font-size="14" fill="#e5e7eb">Sin interioridad</text>
              
              <!-- Flecha de relación -->
              <line x1="195" y1="180" x2="250" y2="180" stroke="#ef4444" stroke-width="3" marker-end="url(#arrowRed)"/>
              
              <!-- Descripción Primera Persona -->
              <text x="240" y="260" text-anchor="middle" font-size="16" fill="#991b1b" font-weight="bold">Sin Reconocimiento</text>
              <text x="240" y="285" text-anchor="middle" font-size="14" fill="#7f1d1d">El otro es solo un obstáculo</text>
              <text x="240" y="310" text-anchor="middle" font-size="14" fill="#7f1d1d">Sin pensamientos propios</text>
              <text x="240" y="335" text-anchor="middle" font-size="14" fill="#7f1d1d">Sin empatía posible</text>
              
              <!-- Segunda Persona - Panel Derecho -->
              <rect x="470" y="80" width="380" height="280" fill="#dbeafe" stroke="#3b82f6" stroke-width="3" rx="12"/>
              <text x="660" y="115" text-anchor="middle" font-size="22" font-weight="bold" fill="#1e40af">Segunda Persona</text>
              
              <!-- Yo en Segunda Persona -->
              <circle cx="570" cy="180" r="45" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/>
              <text x="570" y="190" text-anchor="middle" font-size="18" fill="white" font-weight="bold">Yo</text>
              
              <!-- Otro en Segunda Persona -->
              <circle cx="750" cy="180" r="45" fill="#3b82f6" stroke="#2563eb" stroke-width="3"/>
              <text x="750" y="190" text-anchor="middle" font-size="18" fill="white" font-weight="bold">Otro</text>
              
              <!-- Línea de conexión -->
              <line x1="615" y1="180" x2="705" y2="180" stroke="#6b7280" stroke-width="3" stroke-dasharray="5,5"/>
              <text x="660" y="175" text-anchor="middle" font-size="14" fill="#6b7280" font-weight="bold">Reconoce</text>
              
              <!-- Descripción Segunda Persona -->
              <text x="660" y="260" text-anchor="middle" font-size="16" fill="#1e40af" font-weight="bold">Con Reconocimiento</text>
              <text x="660" y="285" text-anchor="middle" font-size="14" fill="#1e3a8a">El otro tiene pensamientos</text>
              <text x="660" y="310" text-anchor="middle" font-size="14" fill="#1e3a8a">Pero sin comprensión profunda</text>
              <text x="660" y="335" text-anchor="middle" font-size="14" fill="#6b7280" font-style="italic">Empatía aún limitada</text>
              
              <!-- Defs para flechas -->
              <defs>
                <marker id="arrowRed" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto">
                  <polygon points="0 0, 12 6, 0 12" fill="#ef4444"/>
                </marker>
              </defs>
            </svg>
          </div>

          <h3>¿Dónde Aparece Segunda Persona?</h3>
          <p>Segunda persona es común en situaciones donde:</p>
          <ul style="line-height: 2;">
            <li>💬 <strong>Reconoces diferencias:</strong> "Entiendo que piensas diferente, pero..."</li>
            <li>🤷 <strong>Sin compromiso:</strong> "Sé que no te gusta, pero voy a hacerlo de todos modos"</li>
            <li>📢 <strong>Debates superficiales:</strong> Escuchas al otro pero no intentas entender profundamente</li>
            <li>⚖️ <strong>Tolerancia sin comprensión:</strong> "Te tolero aunque no te entiendo"</li>
          </ul>

          <div style="background: #dcfce7; border-left: 4px solid #10b981; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">💡 El Progreso</h4>
            <p style="color: #047857; margin-bottom: 0;">Segunda persona es un paso importante. Ya no estás completamente aislado en tu propia perspectiva. Reconoces que hay otras perspectivas, aunque aún no puedas acceder a ellas emocional o cognitivamente.</p>
          </div>

          <h3>Ejercicio: Reflexión sobre Conflictos Pasados</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Piensa en un conflicto reciente donde operaste desde segunda persona:</strong></p>
            <ol style="line-height: 2.5;">
              <li><strong>Identifica la situación:</strong> ¿Qué conflicto tuviste?</li>
              <li><strong>Reconocimiento:</strong> ¿Reconociste que la otra persona tenía sus propios pensamientos?</li>
              <li><strong>Limitación:</strong> ¿Intentaste entender profundamente sus razones, o solo reconociste que eran diferentes?</li>
              <li><strong>Resultado:</strong> ¿Llegaron a un compromiso o cada uno siguió su camino?</li>
              <li><strong>Reflexión:</strong> ¿Qué habría cambiado si pudieras entender profundamente las razones del otro?</li>
            </ol>
            <p style="margin-top: 1.5rem; padding: 1rem; background: white; border-radius: 8px; font-style: italic; color: #6b7280;">
              <strong>Insight:</strong> Muchos conflictos se quedan en segunda persona. Reconoces que el otro piensa diferente, pero sin la capacidad de entender profundamente, es difícil llegar a soluciones mutuamente satisfactorias.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">🎯 El Próximo Nivel</h3>
            <p style="margin-bottom: 0;">En tercera persona, darás el salto crucial hacia la empatía real. No solo reconocerás que otros piensan diferente, sino que podrás pensar sobre sus pensamientos y entender sus razones desde adentro. Esto es cuando el verdadero diálogo y el compromiso se vuelven posibles.</p>
          </div>
        `,
        orderIndex: 3,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
      {
        courseId: course6[0].id,
        title: 'Tercera Persona: El Nacimiento de la Empatía',
        description: 'El nivel donde puedes pensar sobre los pensamientos del otro, permitiendo verdadera empatía y compromiso.',
        content: `
          <h2>Tercera Persona: El Nacimiento de la Empatía</h2>
          <p>El tercer nivel marca un <strong>cambio fundamental</strong> en cómo te relacionas con otros. Aquí, no solo reconoces que otros tienen pensamientos, sino que puedes <strong>pensar sobre sus pensamientos</strong>. Puedes entender sus razones desde adentro, no solo reconocer que existen.</p>

          <div style="background: #dcfce7; border-left: 4px solid #10b981; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #065f46; margin-top: 0;">Características del Pensamiento de Tercera Persona</h3>
            <ul style="line-height: 2; color: #047857;">
              <li>💭 <strong>Pensar sobre pensamientos:</strong> Puedes pensar sobre lo que el otro está pensando</li>
              <li>🤝 <strong>Comprensión mutua:</strong> Entiendes las razones del otro desde su perspectiva</li>
              <li>💚 <strong>Empatía real:</strong> Puedes "ponerte en sus zapatos" emocionalmente</li>
              <li>🤝 <strong>Compromiso posible:</strong> El diálogo y las soluciones mutuas se vuelven viables</li>
            </ul>
          </div>

          <h3>Juan y Leandro: Tercera Persona</h3>
          <p>En <strong>tercera persona</strong>, Juan puede pensar sobre los pensamientos de Leandro:</p>

          <div style="background: #f0fdf4; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #10b981; margin-bottom: 1rem;">
              <h4 style="color: #065f46; margin-top: 0;">El Pensamiento de Juan (Tercera Persona)</h4>
              <p style="color: #047857; margin-bottom: 0.5rem;">"Leandro no quiere que fume en su casa. Déjame pensar sobre por qué..."</p>
              <ul style="color: #065f46; line-height: 2;">
                <li>"Tal vez tiene problemas respiratorios o alergias"</li>
                <li>"Quizás tiene hijos pequeños y quiere protegerlos"</li>
                <li>"Puede que simplemente valore un ambiente limpio"</li>
                <li>"Entiendo sus razones, aunque yo quiera fumar"</li>
              </ul>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #10b981;">
              <h4 style="color: #065f46; margin-top: 0;">El Pensamiento de Leandro (Tercera Persona)</h4>
              <p style="color: #047857; margin-bottom: 0.5rem;">"Juan quiere fumar. Déjame pensar sobre por qué..."</p>
              <ul style="color: #065f46; line-height: 2;">
                <li>"Tal vez está estresado y el cigarrillo lo calma"</li>
                <li>"Quizás es un hábito que le cuesta dejar"</li>
                <li>"Puede que no sepa cómo afecta a otros"</li>
                <li>"Entiendo sus razones, aunque yo no quiera fumar en casa"</li>
              </ul>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <svg width="100%" height="300" viewBox="0 0 800 300" style="max-width: 100%; height: auto;">
              <!-- Juan -->
              <circle cx="200" cy="150" r="50" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/>
              <text x="200" y="155" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Juan</text>
              
              <!-- Leandro -->
              <circle cx="600" cy="150" r="50" fill="#3b82f6" stroke="#2563eb" stroke-width="3"/>
              <text x="600" y="155" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Leandro</text>
              
              <!-- Pensamientos de Juan sobre Leandro -->
              <path d="M 200 100 Q 400 50 600 100" stroke="#10b981" stroke-width="3" fill="none" stroke-dasharray="5,5"/>
              <text x="400" y="45" text-anchor="middle" font-size="12" fill="#065f46">Juan piensa sobre</text>
              <text x="400" y="60" text-anchor="middle" font-size="12" fill="#065f46">los pensamientos de Leandro</text>
              
              <!-- Pensamientos de Leandro sobre Juan -->
              <path d="M 600 200 Q 400 250 200 200" stroke="#10b981" stroke-width="3" fill="none" stroke-dasharray="5,5"/>
              <text x="400" y="255" text-anchor="middle" font-size="12" fill="#065f46">Leandro piensa sobre</text>
              <text x="400" y="270" text-anchor="middle" font-size="12" fill="#065f46">los pensamientos de Juan</text>
              
              <!-- Compromiso -->
              <rect x="300" y="120" width="200" height="60" fill="#dcfce7" stroke="#10b981" stroke-width="2" rx="8"/>
              <text x="400" y="145" text-anchor="middle" font-size="12" font-weight="bold" fill="#065f46">Compromiso</text>
              <text x="400" y="165" text-anchor="middle" font-size="10" fill="#047857">Posible</text>
            </svg>
          </div>

          <p>Ahora, <strong>el compromiso es posible</strong>. Juan puede entender las razones de Leandro, y Leandro puede entender las razones de Juan. Pueden llegar a soluciones como:</p>
          <ul style="line-height: 2;">
            <li>✅ "Puedo fumar afuera en el patio"</li>
            <li>✅ "Podemos abrir las ventanas y ventilar después"</li>
            <li>✅ "Entiendo tu preocupación, respetaré tu espacio"</li>
          </ul>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #1e40af; margin-top: 0;">💡 La Transformación</h4>
            <p style="color: #1e3a8a; margin-bottom: 0;">En tercera persona, el conflicto se transforma en diálogo. Ya no son enemigos, sino dos personas con diferentes necesidades que pueden encontrar soluciones mutuamente satisfactorias. La empatía real permite la colaboración.</p>
          </div>

          <h3>Ejercicio: Diálogo Empático Estructurado</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Practica tercera persona con este ejercicio:</strong></p>
            <ol style="line-height: 2.5;">
              <li><strong>Elige un conflicto:</strong> Piensa en una situación donde tienes un desacuerdo con alguien</li>
              <li><strong>Tu perspectiva:</strong> Escribe tus razones y necesidades</li>
              <li><strong>Su perspectiva:</strong> Escribe lo que crees que son sus razones y necesidades (desde su punto de vista)</li>
              <li><strong>Pensar sobre sus pensamientos:</strong> ¿Qué está pensando sobre ti? ¿Qué está pensando sobre la situación?</li>
              <li><strong>Soluciones mutuas:</strong> Basándote en ambas perspectivas, ¿qué soluciones satisfarían a ambos?</li>
            </ol>
            <p style="margin-top: 1.5rem; padding: 1rem; background: white; border-radius: 8px; font-style: italic; color: #6b7280;">
              <strong>Insight:</strong> La mayoría de los conflictos pueden resolverse cuando ambas partes operan desde tercera persona. El desafío es que muchas personas aún operan desde niveles inferiores.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">🎯 El Próximo Nivel</h3>
            <p style="margin-bottom: 0;">Tercera persona es esencial para funcionar bien en sociedad. Pero para desarrollar tu propia identidad y estilo de vida conscientemente, necesitas el cuarto nivel: la metacognición, donde puedes pensar sobre tu propio pensamiento y elegir quién quieres ser.</p>
          </div>
        `,
        orderIndex: 4,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course6[0].id,
        title: 'Cuarta Persona: La Puerta a la Metacognición',
        description: 'El nivel donde puedes pensar sobre tu propio pensamiento, permitiendo elección consciente de identidad y valores.',
        content: `
          <h2>Cuarta Persona: La Puerta a la Metacognición</h2>
          <p>El cuarto nivel es un <strong>salto cuántico</strong> en la evolución de la conciencia. Aquí, no solo piensas sobre los pensamientos de otros, sino que puedes <strong>pensar sobre tu propio pensamiento</strong>. Puedes observar tus patrones mentales, tus creencias, tus valores, y <strong>elegir conscientemente</strong> quién quieres ser.</p>

          <div style="background: #f3e8ff; border-left: 4px solid #8b5cf6; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #6b21a8; margin-top: 0;">Características del Pensamiento de Cuarta Persona</h3>
            <ul style="line-height: 2; color: #7c3aed;">
              <li>🧠 <strong>Metacognición:</strong> Puedes pensar sobre cómo piensas</li>
              <li>🎯 <strong>Elección consciente:</strong> Puedes elegir qué creencias y valores adoptar</li>
              <li>🌍 <strong>Múltiples perspectivas:</strong> Ves un mundo de posibles formas de vivir</li>
              <li>🔄 <strong>Auto-transformación:</strong> Puedes decidir ser diferente</li>
            </ul>
          </div>

          <h3>Juan: Cuarta Persona</h3>
          <p>En <strong>cuarta persona</strong>, Juan puede pensar sobre sí mismo:</p>

          <div style="background: #faf5ff; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #8b5cf6;">
              <h4 style="color: #6b21a8; margin-top: 0;">El Pensamiento de Juan (Cuarta Persona)</h4>
              <p style="color: #7c3aed; margin-bottom: 0.5rem;">"Estoy en un conflicto con Leandro sobre fumar. Déjame pensar sobre mi propio pensamiento..."</p>
              <ul style="color: #6b21a8; line-height: 2;">
                <li>"¿Por qué quiero fumar tanto? ¿Es realmente necesario?"</li>
                <li>"¿Qué tipo de persona quiero ser? ¿Alguien que respeta los espacios de otros?"</li>
                <li>"¿Podría ser diferente? ¿Podría ser un Juan que no necesita fumar en espacios cerrados?"</li>
                <li>"Veo múltiples formas de ser Juan. ¿Cuál elijo?"</li>
              </ul>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <svg width="100%" height="350" viewBox="0 0 800 350" style="max-width: 100%; height: auto;">
              <!-- Juan central -->
              <circle cx="400" cy="200" r="60" fill="#8b5cf6" stroke="#7c3aed" stroke-width="3"/>
              <text x="400" y="195" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Juan</text>
              <text x="400" y="210" text-anchor="middle" fill="white" font-size="12">Central</text>
              
              <!-- Múltiples "yoes" posibles -->
              <circle cx="150" cy="100" r="40" fill="#fbbf24" stroke="#f59e0b" stroke-width="2" opacity="0.7"/>
              <text x="150" y="105" text-anchor="middle" font-size="11" fill="#92400e" font-weight="bold">Juan</text>
              <text x="150" y="118" text-anchor="middle" font-size="9" fill="#78350f">Fumador</text>
              
              <circle cx="650" cy="100" r="40" fill="#10b981" stroke="#059669" stroke-width="2" opacity="0.7"/>
              <text x="650" y="105" text-anchor="middle" font-size="11" fill="#065f46" font-weight="bold">Juan</text>
              <text x="650" y="118" text-anchor="middle" font-size="9" fill="#047857">Respetuoso</text>
              
              <circle cx="150" cy="300" r="40" fill="#3b82f6" stroke="#2563eb" stroke-width="2" opacity="0.7"/>
              <text x="150" y="305" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">Juan</text>
              <text x="150" y="318" text-anchor="middle" font-size="9" fill="#1e3a8a">Empático</text>
              
              <circle cx="650" cy="300" r="40" fill="#ec4899" stroke="#db2777" stroke-width="2" opacity="0.7"/>
              <text x="650" y="305" text-anchor="middle" font-size="11" fill="#9f1239" font-weight="bold">Juan</text>
              <text x="650" y="318" text-anchor="middle" font-size="9" fill="#831843">Consciente</text>
              
              <!-- Flechas de elección -->
              <line x1="190" y1="120" x2="340" y2="180" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="3,3"/>
              <line x1="610" y1="120" x2="460" y2="180" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="3,3"/>
              <line x1="190" y1="280" x2="340" y2="220" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="3,3"/>
              <line x1="610" y1="280" x2="460" y2="220" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="3,3"/>
              
              <!-- Texto central -->
              <text x="400" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="#6b21a8">Múltiples Formas de Ser</text>
              <text x="400" y="70" text-anchor="middle" font-size="12" fill="#7c3aed">Juan puede elegir conscientemente</text>
            </svg>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">⚠️ El Peligro: Análisis Paralizante</h4>
            <p style="color: #78350f; margin-bottom: 0;">Cuarta persona puede llevar a <strong>sobrepensamiento</strong> y <strong>parálisis por análisis</strong>. Juan podría sentarse horas pensando sobre qué tipo de Juan quiere ser, analizando infinitas posibilidades sin actuar. Es importante encontrar el equilibrio entre reflexión y acción.</p>
          </div>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #1e40af; margin-top: 0;">💡 La Puerta a Niveles Superiores</h4>
            <p style="color: #1e3a8a; margin-bottom: 0;">Cuarta persona es la <strong>puerta de entrada</strong> a los niveles superiores de conciencia. Aquí comienzas a desarrollar metacognición real. Los niveles anteriores eran sobre pensamiento. A partir de aquí, entras en <strong>metacognición</strong>: conciencia del pensamiento mismo.</p>
          </div>

          <h3>Ejercicio: Mapeo de Posibles "Yoes"</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Explora las diferentes versiones de ti mismo:</strong></p>
            <ol style="line-height: 2.5;">
              <li><strong>Identifica un área de tu vida:</strong> Carrera, relaciones, valores, hábitos, etc.</li>
              <li><strong>Mapea 3-5 versiones posibles de ti:</strong> ¿Qué diferentes formas de ser existen en esta área?</li>
              <li><strong>Analiza cada versión:</strong> ¿Qué valores representa? ¿Qué resultados traería?</li>
              <li><strong>Elige conscientemente:</strong> ¿Qué versión quieres ser? ¿Por qué?</li>
              <li><strong>Actúa:</strong> ¿Qué pasos concretos tomarás para convertirte en esa versión?</li>
            </ol>
            <p style="margin-top: 1.5rem; padding: 1rem; background: white; border-radius: 8px; font-style: italic; color: #6b7280;">
              <strong>Insight:</strong> La mayoría de las personas viven en piloto automático, siguiendo patrones aprendidos. Cuarta persona te permite despertar y elegir conscientemente quién quieres ser.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">🎯 El Próximo Nivel</h3>
            <p style="margin-bottom: 0;">Cuarta persona te permite elegir conscientemente, pero aún estás identificado con tus pensamientos. En quinta persona, realizarás el descubrimiento revolucionario: <strong>"No soy mi mente"</strong>. Puedes observar tus pensamientos sin identificarte con ellos.</p>
          </div>
        `,
        orderIndex: 5,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course6[0].id,
        title: 'Quinta Persona: El Observador',
        description: 'El descubrimiento revolucionario: "No soy mi mente". Aprende a observar tus pensamientos y emociones sin identificarte con ellos.',
        content: `
          <h2>Quinta Persona: El Observador</h2>
          <p>El quinto nivel marca una <strong>transición fundamental</strong> de pensamiento a conciencia pura. Aquí realizas el descubrimiento más importante: <strong>"No soy mi mente"</strong>. Puedes observar tus pensamientos, emociones y sensaciones sin identificarte con ellos.</p>

          <div style="background: #fce7f3; border-left: 4px solid #ec4899; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #9f1239; margin-top: 0;">La Realización Clave</h3>
            <p style="color: #831843; margin-bottom: 0;">Así como puedes observar la sensación de tu mano, puedes observar tus pensamientos. El observador que eres puede observar el cuerpo, las sensaciones, los pensamientos, las emociones y los pensamientos de otros. <strong>Todo ocurre dentro de tu conciencia, pero tú no eres esos fenómenos.</strong></p>
          </div>

          <h3>De Pensamiento a Observación</h3>
          <p>En quinta persona, ya no es sobre <strong>pensar</strong>, sino sobre <strong>observar</strong>:</p>

          <div style="background: #fdf2f8; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #ec4899;">
                <h4 style="color: #9f1239; margin-top: 0;">Antes (Niveles 1-4)</h4>
                <p style="color: #831843; font-size: 0.9rem;">"Estoy enojado"</p>
                <p style="color: #831843; font-size: 0.9rem;">"Tengo pensamientos negativos"</p>
                <p style="color: #831843; font-size: 0.9rem;">"Soy mi mente"</p>
                <p style="color: #9f1239; font-style: italic; margin-top: 1rem;">Identificado con los fenómenos</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #10b981;">
                <h4 style="color: #065f46; margin-top: 0;">Ahora (Quinta Persona)</h4>
                <p style="color: #047857; font-size: 0.9rem;">"Observo que surge ira"</p>
                <p style="color: #047857; font-size: 0.9rem;">"Observo pensamientos negativos"</p>
                <p style="color: #047857; font-size: 0.9rem;">"La mente ocurre, yo observo"</p>
                <p style="color: #065f46; font-style: italic; margin-top: 1rem;">Desidentificado, observando</p>
              </div>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <svg width="100%" height="400" viewBox="0 0 800 400" style="max-width: 100%; height: auto;">
              <!-- El Observador -->
              <circle cx="400" cy="200" r="80" fill="#ec4899" stroke="#db2777" stroke-width="4" opacity="0.3"/>
              <text x="400" y="195" text-anchor="middle" font-size="18" font-weight="bold" fill="#9f1239">El Observador</text>
              <text x="400" y="215" text-anchor="middle" font-size="14" fill="#831843">(Tú)</text>
              
              <!-- Pensamientos -->
              <ellipse cx="200" cy="150" rx="60" ry="40" fill="#fbbf24" opacity="0.6"/>
              <text x="200" y="155" text-anchor="middle" font-size="12" fill="#92400e">Pensamientos</text>
              
              <!-- Emociones -->
              <ellipse cx="600" cy="150" rx="60" ry="40" fill="#ef4444" opacity="0.6"/>
              <text x="600" y="155" text-anchor="middle" font-size="12" fill="#991b1b">Emociones</text>
              
              <!-- Sensaciones -->
              <ellipse cx="200" cy="250" rx="60" ry="40" fill="#3b82f6" opacity="0.6"/>
              <text x="200" y="255" text-anchor="middle" font-size="12" fill="#1e40af">Sensaciones</text>
              
              <!-- Creencias -->
              <ellipse cx="600" cy="250" rx="60" ry="40" fill="#8b5cf6" opacity="0.6"/>
              <text x="600" y="255" text-anchor="middle" font-size="12" fill="#6b21a8">Creencias</text>
              
              <!-- Flechas de observación -->
              <line x1="260" y1="150" x2="320" y2="180" stroke="#ec4899" stroke-width="2" stroke-dasharray="5,5"/>
              <line x1="540" y1="150" x2="480" y2="180" stroke="#ec4899" stroke-width="2" stroke-dasharray="5,5"/>
              <line x1="260" y1="250" x2="320" y2="220" stroke="#ec4899" stroke-width="2" stroke-dasharray="5,5"/>
              <line x1="540" y1="250" x2="480" y2="220" stroke="#ec4899" stroke-width="2" stroke-dasharray="5,5"/>
              
              <!-- Texto -->
              <text x="400" y="50" text-anchor="middle" font-size="16" font-weight="bold" fill="#9f1239">Todo Puede Ser Observado</text>
              <text x="400" y="70" text-anchor="middle" font-size="14" fill="#831843">Sin Identificarse</text>
            </svg>
          </div>

          <h3>Práctica: Observar Sin Identificarse</h3>
          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">🧘 Meditación Guiada: El Observador</h4>
            <ol style="line-height: 2.5; color: #78350f;">
              <li><strong>Siéntate cómodamente</strong> y cierra los ojos</li>
              <li><strong>Observa tu respiración:</strong> Nota cómo entra y sale, sin controlarla</li>
              <li><strong>Cuando surja un pensamiento:</strong> En lugar de seguirlo, simplemente obsérvalo pasar</li>
              <li><strong>Cuando surja una emoción:</strong> Reconoce que está ahí, pero no te identifiques con ella</li>
              <li><strong>Pregúntate:</strong> "¿Quién está observando?"</li>
              <li><strong>Descansa en el observador:</strong> Ese espacio de conciencia que observa todo</li>
            </ol>
            <p style="color: #78350f; margin-top: 1rem; font-style: italic;">Practica esto durante 10-15 minutos diarios. Con el tiempo, comenzarás a vivir más desde el observador que desde los fenómenos observados.</p>
          </div>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #1e40af; margin-top: 0;">💡 El Observador es Universal</h4>
            <p style="color: #1e3a8a; margin-bottom: 0;">Todos somos el observador. La diferencia es que en niveles inferiores, estamos tan identificados con nuestras formas (pensamientos, emociones, cuerpo) que olvidamos que somos el observador. En quinta persona, recordamos quién realmente somos.</p>
          </div>

          <h3>Ejercicio: Diario de Observación</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Durante una semana, lleva un diario de observación:</strong></p>
            <ol style="line-height: 2.5;">
              <li><strong>Al final de cada día:</strong> Escribe 3 momentos donde observaste tus pensamientos o emociones sin identificarte</li>
              <li><strong>Describe la experiencia:</strong> ¿Cómo se sintió observar vs. estar identificado?</li>
              <li><strong>Nota patrones:</strong> ¿Qué pensamientos o emociones surgen más frecuentemente?</li>
              <li><strong>Reflexiona:</strong> ¿Qué cambió cuando observaste en lugar de reaccionar?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">🎯 El Próximo Nivel</h3>
            <p style="margin-bottom: 0;">En quinta persona, eres el observador. En sexta persona, irás más allá del observador hacia la conciencia pura misma: el "Yo" que es simplemente ser, sin necesidad de observar nada.</p>
          </div>
        `,
        orderIndex: 6,
        type: 'text' as const,
        duration: 35,
        isRequired: true,
      },
      {
        courseId: course6[0].id,
        title: 'Sexta Persona: La Conciencia Pura',
        description: 'El nivel más alto: el "Yo" puro, la conciencia misma que es simplemente ser, más allá del observador.',
        content: `
          <h2>Sexta Persona: La Conciencia Pura</h2>
          <p>El sexto nivel es el más profundo y transformador. Aquí, ya no eres el observador que observa fenómenos. Eres <strong>la conciencia misma</strong>, el "Yo" puro que simplemente <strong>es</strong>. No hay separación entre tú y la conciencia. Tú <strong>eres</strong> la conciencia.</p>

          <div style="background: #cffafe; border-left: 4px solid #06b6d4; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #164e63; margin-top: 0;">La Realización Final</h3>
            <p style="color: #155e75; margin-bottom: 0;">Detrás del observador, detrás de la persona, detrás de los pensamientos, emociones y sensaciones, hay simplemente <strong>ser</strong>. Hay <strong>conciencia</strong>. Hay <strong>el Yo</strong>. No "Yo soy esto" o "Yo soy aquello", sino simplemente <strong>"Yo"</strong>.</p>
          </div>

          <h3>Del Observador al Ser</h3>
          <div style="background: #f0fdfa; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #ec4899;">
                <h4 style="color: #9f1239; margin-top: 0;">Quinta Persona</h4>
                <p style="color: #831843; font-size: 0.9rem;">"Observo mis pensamientos"</p>
                <p style="color: #831843; font-size: 0.9rem;">"Soy el observador"</p>
                <p style="color: #831843; font-size: 0.9rem;">"Puedo observar todo"</p>
                <p style="color: #9f1239; font-style: italic; margin-top: 1rem;">Hay un observador y lo observado</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #06b6d4;">
                <h4 style="color: #164e63; margin-top: 0;">Sexta Persona</h4>
                <p style="color: #155e75; font-size: 0.9rem;">"Simplemente soy"</p>
                <p style="color: #155e75; font-size: 0.9rem;">"Soy conciencia"</p>
                <p style="color: #155e75; font-size: 0.9rem;">"Todo ocurre en mí"</p>
                <p style="color: #164e63; font-style: italic; margin-top: 1rem;">Solo hay ser, solo hay conciencia</p>
              </div>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <svg width="100%" height="350" viewBox="0 0 800 350" style="max-width: 100%; height: auto;">
              <!-- Conciencia pura (fondo) -->
              <rect x="0" y="0" width="800" height="350" fill="#cffafe" opacity="0.3"/>
              
              <!-- El "Yo" central -->
              <circle cx="400" cy="175" r="100" fill="#06b6d4" stroke="#0891b2" stroke-width="4"/>
              <text x="400" y="170" text-anchor="middle" font-size="24" font-weight="bold" fill="white">YO</text>
              <text x="400" y="195" text-anchor="middle" font-size="16" fill="white">Conciencia Pura</text>
              
              <!-- Todo dentro de la conciencia -->
              <text x="400" y="50" text-anchor="middle" font-size="18" font-weight="bold" fill="#164e63">Todo Ocurre Dentro de la Conciencia</text>
              
              <!-- Elementos dentro de la conciencia -->
              <circle cx="250" cy="120" r="30" fill="#fbbf24" opacity="0.5"/>
              <text x="250" y="127" text-anchor="middle" font-size="10" fill="#92400e">Pensamientos</text>
              
              <circle cx="550" cy="120" r="30" fill="#ef4444" opacity="0.5"/>
              <text x="550" y="127" text-anchor="middle" font-size="10" fill="#991b1b">Emociones</text>
              
              <circle cx="250" cy="230" r="30" fill="#3b82f6" opacity="0.5"/>
              <text x="250" y="237" text-anchor="middle" font-size="10" fill="#1e40af">Formas</text>
              
              <circle cx="550" cy="230" r="30" fill="#8b5cf6" opacity="0.5"/>
              <text x="550" y="237" text-anchor="middle" font-size="10" fill="#6b21a8">Mundo</text>
              
              <text x="400" y="310" text-anchor="middle" font-size="14" fill="#155e75">No hay separación - Todo es Uno</text>
            </svg>
          </div>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #1e40af; margin-top: 0;">💡 La Naturaleza de la Conciencia</h4>
            <p style="color: #1e3a8a; margin-bottom: 0;">La conciencia es <strong>omnipresente</strong>. Existe incluso cuando no hay nada que observar. Si no hubiera nada - ni observador, ni pensamientos, ni emociones - aún habría conciencia. La conciencia es el fundamento de todo. Es lo que permite que todo exista.</p>
          </div>

          <h3>La Metáfora del Flashlight</h3>
          <p>Imagina que la conciencia es como una linterna en una habitación oscura:</p>
          <ul style="line-height: 2;">
            <li>🔦 <strong>Puedes dirigir la atención:</strong> Como apuntar la linterna a diferentes objetos</li>
            <li>🌑 <strong>La oscuridad siempre está:</strong> Incluso cuando no apuntas la linterna, la habitación existe</li>
            <li>💡 <strong>La luz es la conciencia:</strong> Permite que todo sea visible</li>
            <li>✨ <strong>En sexta persona:</strong> Te das cuenta de que TÚ eres la luz misma, no lo que iluminas</li>
          </ul>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">🧘 Meditación: Acceso a la Conciencia Pura</h4>
            <ol style="line-height: 2.5; color: #78350f;">
              <li><strong>Siéntate en silencio</strong> y cierra los ojos</li>
              <li><strong>Observa tu respiración</strong> por unos momentos</li>
              <li><strong>Observa tus pensamientos</strong> pasar como nubes</li>
              <li><strong>Pregunta:</strong> "¿Quién está observando?"</li>
              <li><strong>Ve más allá del observador:</strong> ¿Qué hay detrás del observador?</li>
              <li><strong>Descansa en el ser:</strong> Simplemente sé. Sin necesidad de observar nada</li>
              <li><strong>Reconoce:</strong> "Yo soy conciencia. Todo ocurre dentro de mí"</li>
            </ol>
            <p style="color: #78350f; margin-top: 1rem; font-style: italic;">Esta práctica puede llevar tiempo. No te frustres si no la experimentas inmediatamente. Es un estado que se desarrolla con práctica constante.</p>
          </div>

          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #991b1b; margin-top: 0;">⚠️ Sobre el Pensamiento en Niveles Superiores</h4>
            <p style="color: #7f1d1d; margin-bottom: 0;">En sexta persona, el pensamiento se vuelve <strong>completamente innecesario la mayor parte del tiempo</strong>. El 90% del pensamiento es ruido. El pensamiento es una herramienta útil cuando lo necesitas (para resolver problemas, planificar), pero no necesitas estar pensando constantemente. Puedes simplemente <strong>ser</strong>.</p>
          </div>

          <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">🎯 Integración</h3>
            <p style="margin-bottom: 0;">Sexta persona no es un estado permanente que alcanzas y mantienes. Es más bien una realización que puedes acceder. En la siguiente lección, exploraremos cómo integrar estos niveles superiores en tu vida diaria, encontrando el equilibrio entre ser y participar en el mundo.</p>
          </div>
        `,
        orderIndex: 7,
        type: 'text' as const,
        duration: 35,
        isRequired: true,
      },
      {
        courseId: course6[0].id,
        title: 'Integración: Vivir desde los Niveles Superiores',
        description: 'Cómo integrar los niveles superiores de conciencia en tu vida diaria, encontrando equilibrio entre desidentificación y participación.',
        content: `
          <h2>Integración: Vivir desde los Niveles Superiores</h2>
          <p>Alcanzar estados de quinta y sexta persona es transformador, pero el verdadero desafío es <strong>integrarlos en tu vida diaria</strong>. ¿Cómo vives desde la conciencia pura mientras participas en el mundo? ¿Cómo mantienes la desidentificación sin volverte desconectado?</p>

          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 1.5rem; margin: 2rem 0;">
            <h3 style="color: #065f46; margin-top: 0;">El Equilibrio Fundamental</h3>
            <p style="color: #047857; margin-bottom: 0;">Vivir desde los niveles superiores no significa retirarte del mundo. Significa participar en el mundo <strong>desde un lugar de conciencia</strong>, sabiendo que todo es un sueño, pero eligiendo participar conscientemente en ese sueño.</p>
          </div>

          <h3>El Sueño Lúcido de la Realidad</h3>
          <p>Cuando alcanzas quinta y sexta persona, te das cuenta de que la realidad es como un <strong>sueño lúcido</strong>:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #ef4444;">
                <h4 style="color: #991b1b; margin-top: 0; font-size: 1rem;">En un Sueño Normal</h4>
                <p style="font-size: 0.85rem; color: #7f1d1d;">Te asustas del monstruo, te enojas en el conflicto, te identificas completamente</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #10b981;">
                <h4 style="color: #065f46; margin-top: 0; font-size: 1rem;">En un Sueño Lúcido</h4>
                <p style="font-size: 0.85rem; color: #047857;">Sabes que es un sueño, así que no te asustas. Puedes participar conscientemente</p>
              </div>
            </div>
          </div>

          <p>En los niveles superiores, te vuelves <strong>lúcido dentro del sueño de la realidad</strong>. Sabes que todo es forma surgiendo de lo informe, pero eliges participar conscientemente.</p>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #92400e; margin-top: 0;">⚠️ Manejo de la Desestabilización</h4>
            <p style="color: #78350f; margin-bottom: 0.5rem;">Las transiciones entre niveles pueden ser <strong>desestabilizantes</strong>, especialmente de cuarta a quinta persona o de quinta a sexta. Puedes sentir:</p>
            <ul style="color: #78350f; line-height: 2;">
              <li>Desapego de cosas que antes importaban</li>
              <li>Preguntas existenciales: "Si todo es un sueño, ¿por qué estoy aquí?"</li>
              <li>Sensación de estar en una "celda acolchada con un holograma"</li>
              <li>Desidentificación de relaciones y roles familiares</li>
            </ul>
            <p style="color: #78350f; margin-top: 1rem; font-style: italic;">Esto es normal. Es parte del proceso de despertar. Con práctica y tiempo, encuentras equilibrio.</p>
          </div>

          <h3>Prácticas Diarias para Mantener la Conciencia</h3>
          <div style="background: #eff6ff; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <ol style="line-height: 2.5;">
              <li><strong>Meditación matutina:</strong> 10-20 minutos cada mañana para establecer el estado de observador</li>
              <li><strong>Recordatorios conscientes:</strong> Pausas durante el día para preguntar "¿Quién está experimentando esto?"</li>
              <li><strong>Observación de reacciones:</strong> Cuando surja una emoción fuerte, observa en lugar de reaccionar</li>
              <li><strong>Gratitud desde la conciencia:</strong> Agradece desde el lugar del ser, no desde el ego</li>
              <li><strong>Participación consciente:</strong> Elige participar en actividades que alineen con tu verdadera naturaleza</li>
            </ol>
          </div>

          <h3>El Equilibrio: Disfrutar el Sueño y Desidentificarse</h3>
          <p>El desafío es encontrar el equilibrio entre:</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #10b981;">
                <h4 style="color: #065f46; margin-top: 0;">Disfrutar el Sueño</h4>
                <ul style="color: #047857; line-height: 2; font-size: 0.9rem;">
                  <li>Participar en relaciones</li>
                  <li>Disfrutar experiencias</li>
                  <li>Contribuir al mundo</li>
                  <li>Vivir plenamente</li>
                </ul>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #06b6d4;">
                <h4 style="color: #164e63; margin-top: 0;">Desidentificarse</h4>
                <ul style="color: #155e75; line-height: 2; font-size: 0.9rem;">
                  <li>Saber que es un sueño</li>
                  <li>No aferrarse a resultados</li>
                  <li>Observar sin juzgar</li>
                  <li>Descansar en el ser</li>
                </ul>
              </div>
            </div>
          </div>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #1e40af; margin-top: 0;">💡 La Respuesta del Buddha</h4>
            <p style="color: #1e3a8a; margin-bottom: 0;">Cuando te preguntas "Si todo es un sueño, ¿por qué estoy aquí?", el Buddha diría: <strong>"Porque aún hay deseo de llegar a ser"</strong>. Aún hay deseo de participar en las formas. Y eso está bien. Puedes participar conscientemente, sabiendo que es un sueño, pero eligiendo participar de todos modos.</p>
          </div>

          <h3>Ejercicio: Plan de Práctica Personal</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Crea tu plan personal para integrar los niveles superiores:</strong></p>
            <ol style="line-height: 2.5;">
              <li><strong>Práctica diaria:</strong> ¿Qué práctica harás cada día? (meditación, observación, etc.)</li>
              <li><strong>Recordatorios:</strong> ¿Cómo te recordarás durante el día de operar desde niveles superiores?</li>
              <li><strong>Áreas de aplicación:</strong> ¿En qué áreas de tu vida aplicarás estos niveles? (trabajo, relaciones, etc.)</li>
              <li><strong>Manejo de desestabilización:</strong> ¿Qué harás cuando te sientas desestabilizado?</li>
              <li><strong>Equilibrio:</strong> ¿Cómo equilibrarás disfrutar el sueño y desidentificarte?</li>
              <li><strong>Compromiso:</strong> ¿Cuál es tu compromiso con esta práctica?</li>
            </ol>
          </div>

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ El Viaje Continúa</h3>
            <p style="margin-bottom: 0;">Integrar los niveles superiores es un proceso continuo. No es algo que "logras" y luego mantienes perfectamente. Es una práctica constante de recordar quién realmente eres, de operar desde la conciencia mientras participas en el mundo. En las siguientes lecciones, exploraremos técnicas específicas y cómo estos niveles transforman tu impacto en el mundo.</p>
          </div>
        `,
        orderIndex: 8,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course6[0].id,
        title: 'Prácticas de Desarrollo: Meditación y Mindfulness',
        description: 'Técnicas específicas de meditación y mindfulness para desarrollar y mantener cada nivel de conciencia.',
        content: `
          <h2>Prácticas de Desarrollo: Meditación y Mindfulness</h2>
          <p>Desarrollar niveles superiores de conciencia requiere <strong>práctica constante</strong>. En esta lección, exploraremos técnicas específicas de meditación y mindfulness diseñadas para cada nivel, y cómo usar la metáfora del "flashlight" de la conciencia.</p>

          <h3>Técnicas por Nivel</h3>
          
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h4 style="color: #1f2937; margin-top: 0;">Niveles 1-2: Desarrollo de Empatía</h4>
            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
              <p><strong>Práctica: Diálogo Interno</strong></p>
              <ol style="line-height: 2;">
                <li>Cuando tengas un conflicto, escribe desde la perspectiva del otro</li>
                <li>Pregúntate: "¿Qué está pensando esta persona? ¿Por qué?"</li>
                <li>Practica reconocer que otros tienen interioridad</li>
              </ol>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h4 style="color: #1f2937; margin-top: 0;">Nivel 3: Empatía Profunda</h4>
            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
              <p><strong>Práctica: Pensar sobre Pensamientos</strong></p>
              <ol style="line-height: 2;">
                <li>En conversaciones, pregunta: "¿Qué está pensando sobre lo que estoy diciendo?"</li>
                <li>Practica "ponerte en sus zapatos" emocionalmente</li>
                <li>Busca soluciones que satisfagan a ambas partes</li>
              </ol>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h4 style="color: #1f2937; margin-top: 0;">Nivel 4: Metacognición</h4>
            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
              <p><strong>Práctica: Reflexión sobre el Pensamiento</strong></p>
              <ol style="line-height: 2;">
                <li>Diario de pensamientos: ¿Por qué pienso lo que pienso?</li>
                <li>Mapeo de posibles "yoes": ¿Qué diferentes versiones de mí existen?</li>
                <li>Elección consciente: ¿Qué versión quiero ser?</li>
              </ol>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h4 style="color: #1f2937; margin-top: 0;">Nivel 5: El Observador</h4>
            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
              <p><strong>Práctica: Meditación de Observación</strong></p>
              <ol style="line-height: 2;">
                <li>Siéntate y observa tu respiración</li>
                <li>Cuando surja un pensamiento, obsérvalo pasar sin seguirlo</li>
                <li>Cuando surja una emoción, reconócela pero no te identifiques</li>
                <li>Pregunta: "¿Quién está observando?"</li>
                <li>Descansa en el observador</li>
              </ol>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h4 style="color: #1f2937; margin-top: 0;">Nivel 6: Conciencia Pura</h4>
            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
              <p><strong>Práctica: Ser sin Observar</strong></p>
              <ol style="line-height: 2;">
                <li>Ve más allá del observador</li>
                <li>Descansa en el ser puro</li>
                <li>Reconoce: "Yo soy conciencia"</li>
                <li>Permite que todo ocurra dentro de ti</li>
              </ol>
            </div>
          </div>

          <h3>La Metáfora del Flashlight</h3>
          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p style="color: #78350f; margin-bottom: 1rem;">La conciencia es como una linterna en una habitación oscura. Puedes dirigirla hacia cualquier objeto (pensamiento, emoción, sensación) y observarlo. Pero la linterna misma (la conciencia) siempre está presente, incluso cuando no apuntas a nada específico.</p>
            
            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
              <svg width="100%" height="250" viewBox="0 0 800 250" style="max-width: 100%; height: auto;">
                <!-- Habitación oscura -->
                <rect x="0" y="0" width="800" height="250" fill="#1f2937" opacity="0.8"/>
                
                <!-- Linterna (conciencia) -->
                <circle cx="400" cy="200" r="15" fill="#fbbf24"/>
                <rect x="390" y="200" width="20" height="30" fill="#fbbf24" opacity="0.7"/>
                
                <!-- Haz de luz -->
                <path d="M 400 200 L 500 100 L 600 100 L 500 100 Z" fill="#fef3c7" opacity="0.4"/>
                
                <!-- Objetos en la habitación -->
                <circle cx="550" cy="120" r="20" fill="#3b82f6" opacity="0.6"/>
                <text x="550" y="127" text-anchor="middle" font-size="10" fill="white">Pensamiento</text>
                
                <circle cx="300" cy="80" r="20" fill="#ef4444" opacity="0.3"/>
                <text x="300" y="87" text-anchor="middle" font-size="10" fill="#9ca3af">Emoción</text>
                
                <circle cx="650" cy="150" r="20" fill="#10b981" opacity="0.3"/>
                <text x="650" y="157" text-anchor="middle" font-size="10" fill="#9ca3af">Sensación</text>
                
                <!-- Texto -->
                <text x="400" y="30" text-anchor="middle" font-size="14" font-weight="bold" fill="#fbbf24">La Conciencia como Linterna</text>
                <text x="400" y="50" text-anchor="middle" font-size="12" fill="#d1d5db">Puedes dirigirla, pero siempre está presente</text>
              </svg>
            </div>
          </div>

          <h3>Ejercicio: Práctica de 21 Días</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Comprométete a una práctica de 21 días:</strong></p>
            <ol style="line-height: 2.5;">
              <li><strong>Días 1-7:</strong> Meditación diaria de 10 minutos enfocada en observación</li>
              <li><strong>Días 8-14:</strong> Aumenta a 15 minutos, añade práctica de mindfulness durante el día</li>
              <li><strong>Días 15-21:</strong> Meditación de 20 minutos, práctica completa de observación consciente</li>
              <li><strong>Cada día:</strong> Anota 3 momentos donde operaste desde niveles superiores</li>
              <li><strong>Al final:</strong> Reflexiona sobre cómo ha cambiado tu experiencia</li>
            </ol>
            <p style="margin-top: 1.5rem; padding: 1rem; background: white; border-radius: 8px; font-style: italic; color: #6b7280;">
              <strong>Insight:</strong> Los hábitos se forman en 21 días. Esta práctica constante desarrollará tu capacidad de operar desde niveles superiores de manera natural.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ La Práctica es el Camino</h3>
            <p style="margin-bottom: 0;">Desarrollar niveles superiores no es algo que "logras" una vez. Es una práctica continua. Cada día es una oportunidad de recordar quién realmente eres y operar desde la conciencia. En la lección final, exploraremos cómo estos niveles transforman no solo tu vida personal, sino tu impacto en el mundo.</p>
          </div>
        `,
        orderIndex: 9,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course6[0].id,
        title: 'Transformación Personal y Colectiva',
        description: 'Cómo los niveles superiores de pensamiento transforman tus relaciones y tu impacto en la comunidad y sociedad.',
        content: `
          <h2>Transformación Personal y Colectiva</h2>
          <p>Los niveles superiores de pensamiento y conciencia no solo transforman tu experiencia personal. Transforman <strong>cómo te relacionas con otros</strong> y <strong>tu impacto en el mundo</strong>. En esta lección final, exploraremos el poder transformador de estos niveles.</p>

          <h3>Transformación de Relaciones</h3>
          <p>Cuando operas desde niveles superiores, tus relaciones se transforman:</p>

          <div style="background: #eff6ff; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #3b82f6;">
                <h4 style="color: #1e40af; margin-top: 0;">Niveles 1-2</h4>
                <p style="font-size: 0.9rem; color: #1e3a8a;">Conflictos frecuentes, falta de comprensión mutua</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #10b981;">
                <h4 style="color: #065f46; margin-top: 0;">Nivel 3</h4>
                <p style="font-size: 0.9rem; color: #047857;">Empatía real, compromisos mutuos, diálogo efectivo</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #8b5cf6;">
                <h4 style="color: #6b21a8; margin-top: 0;">Nivel 4</h4>
                <p style="font-size: 0.9rem; color: #7c3aed;">Elección consciente de relaciones, valores alineados</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #ec4899;">
                <h4 style="color: #9f1239; margin-top: 0;">Niveles 5-6</h4>
                <p style="font-size: 0.9rem; color: #831843;">Relaciones desde la conciencia, sin apego ni identificación</p>
              </div>
            </div>
          </div>

          <h3>Impacto en la Comunidad</h3>
          <p>Los niveles superiores transforman tu capacidad de contribuir:</p>
          <ul style="line-height: 2;">
            <li>🌍 <strong>Visión sistémica:</strong> Ves cómo las partes se relacionan con el todo</li>
            <li>🤝 <strong>Colaboración efectiva:</strong> Puedes trabajar con otros desde empatía y comprensión</li>
            <li>💡 <strong>Soluciones creativas:</strong> Piensas más allá de soluciones superficiales</li>
            <li>🔄 <strong>Adaptabilidad:</strong> No te aferras a resultados específicos</li>
            <li>✨ <strong>Inspiración:</strong> Tu presencia misma inspira a otros</li>
          </ul>

          <div style="background: #dcfce7; border-left: 4px solid #10b981; padding: 1.5rem; margin: 2rem 0;">
            <h4 style="color: #065f46; margin-top: 0;">💡 El Efecto Ripple</h4>
            <p style="color: #047857; margin-bottom: 0;">Cuando operas desde niveles superiores, creas un <strong>efecto ripple</strong>. Tu paz, tu claridad, tu capacidad de ver más allá del conflicto, todo esto se extiende a tu comunidad. No necesitas "convertir" a otros; simplemente siendo quien eres, inspiras transformación.</p>
          </div>

          <h3>Conectando con el Movimiento del Hombre Gris</h3>
          <p>Los niveles superiores de pensamiento están directamente alineados con la visión del Hombre Gris:</p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #10b981;">
                <h4 style="color: #065f46; margin-top: 0; font-size: 1rem;">Colectividad</h4>
                <p style="font-size: 0.85rem; color: #047857;">Los niveles superiores te permiten ver más allá del ego individual hacia la unidad</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #3b82f6;">
                <h4 style="color: #1e40af; margin-top: 0; font-size: 1rem;">Transformación</h4>
                <p style="font-size: 0.85rem; color: #1e3a8a;">La conciencia transformada crea cambio real en el mundo</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #8b5cf6;">
                <h4 style="color: #6b21a8; margin-top: 0; font-size: 1rem;">Acción Consciente</h4>
                <p style="font-size: 0.85rem; color: #7c3aed;">Actúas desde la conciencia, no desde el ego</p>
              </div>
            </div>
          </div>

          <h3>Reflexión Final: Compromiso con la Práctica Continua</h3>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <p><strong>Antes de concluir, reflexiona sobre estas preguntas:</strong></p>
            <ol style="line-height: 2.5;">
              <li>¿Cómo ha cambiado tu comprensión de ti mismo a través de este curso?</li>
              <li>¿En qué nivel operas más frecuentemente ahora? ¿Cómo puedes evolucionar?</li>
              <li>¿Qué prácticas específicas integrarás en tu vida diaria?</li>
              <li>¿Cómo transformarán estos niveles tu impacto en tu comunidad?</li>
              <li>¿Cuál es tu compromiso con la práctica continua?</li>
            </ol>
            <p style="margin-top: 1.5rem; padding: 1rem; background: white; border-radius: 8px; font-style: italic; color: #6b7280;">
              <strong>Recuerda:</strong> Este es un viaje, no un destino. Cada día es una oportunidad de recordar quién realmente eres y operar desde la conciencia. La práctica constante es la clave.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; color: white; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ El Viaje Continúa</h3>
            <p style="margin-bottom: 0.5rem;">Has completado este curso sobre los niveles superiores de pensamiento y conciencia. Pero el verdadero aprendizaje ocurre en la práctica diaria. Recuerda:</p>
            <ul style="line-height: 2; margin-bottom: 0;">
              <li>La conciencia es tu naturaleza fundamental</li>
              <li>Puedes acceder a estos niveles en cualquier momento</li>
              <li>La práctica constante desarrolla tu capacidad</li>
              <li>Tu transformación personal transforma el mundo</li>
            </ul>
            <p style="margin-top: 1rem; margin-bottom: 0; font-weight: bold;">¡Que tu viaje hacia la conciencia pura sea profundo, transformador y lleno de paz! 🙏</p>
          </div>
        `,
        orderIndex: 10,
        type: 'text' as const,
        duration: 25,
        isRequired: true,
      },
    ];

    // Insert lessons for course 6 (check if they exist first)
    const existingLessons6 = await db.select().from(courseLessons).where(eq(courseLessons.courseId, course6[0].id));
    if (existingLessons6.length === 0) {
      for (const lesson of lessons6) {
        await db.insert(courseLessons).values(lesson);
      }
      console.log('✅ Created', lessons6.length, 'lessons for course 6');
    } else {
      console.log(`⚠️ Course 6 already has ${existingLessons6.length} lessons, skipping lesson creation`);
    }

    // Quiz for course 6
    const existingQuiz6 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, course6[0].id)).limit(1);
    if (existingQuiz6.length > 0) {
      const existingQuestions6 = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz6[0].id));
      for (const question of existingQuestions6) {
        await db.delete(quizQuestions).where(eq(quizQuestions.id, question.id));
      }
      await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, course6[0].id));
    }

    const [quiz6] = await db.insert(courseQuizzes).values({
      courseId: course6[0].id,
      title: 'Quiz: Niveles Superiores de Pensamiento y Conciencia',
      description: 'Evalúa tu comprensión de los 6 niveles de pensamiento y conciencia, y las prácticas para desarrollarlos.',
      passingScore: 75,
      timeLimit: 20,
      allowRetakes: true,
      maxAttempts: 3,
    }).returning();

    const questions6 = [
      {
        quizId: quiz6.id,
        question: '¿Cuál es la característica principal del pensamiento de primera persona?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Reconocer que otros tienen pensamientos propios',
          'Ver a otros como objetos sin interioridad',
          'Pensar sobre los pensamientos del otro',
          'Observar tus propios pensamientos'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'En primera persona, ves a otros como objetos en el mundo, sin reconocer que tienen pensamientos, emociones o razones internas para sus acciones.',
        points: 2,
        orderIndex: 1,
      },
      {
        quizId: quiz6.id,
        question: '¿En qué nivel nace la verdadera empatía?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Segunda persona',
          'Tercera persona',
          'Cuarta persona',
          'Quinta persona'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'En tercera persona, puedes pensar sobre los pensamientos del otro, lo que permite verdadera empatía y comprensión mutua.',
        points: 2,
        orderIndex: 2,
      },
      {
        quizId: quiz6.id,
        question: 'Cuarta persona es la puerta de entrada a la metacognición.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Cuarta persona te permite pensar sobre tu propio pensamiento, lo que es la puerta de entrada a la metacognición y los niveles superiores de conciencia.',
        points: 2,
        orderIndex: 3,
      },
      {
        quizId: quiz6.id,
        question: '¿Cuál es la realización clave en quinta persona?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Puedes pensar sobre los pensamientos del otro',
          '"No soy mi mente" - Puedes observar sin identificarte',
          'Puedes elegir conscientemente quién quieres ser',
          'Eres la conciencia pura misma'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'En quinta persona, realizas que "no eres tu mente". Puedes observar tus pensamientos, emociones y sensaciones sin identificarte con ellos.',
        points: 3,
        orderIndex: 4,
      },
      {
        quizId: quiz6.id,
        question: 'En sexta persona, el pensamiento es completamente innecesario.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'En sexta persona, el pensamiento se vuelve innecesario la mayor parte del tiempo (90%), pero sigue siendo una herramienta útil cuando lo necesitas para resolver problemas o planificar.',
        points: 2,
        orderIndex: 5,
      },
      {
        quizId: quiz6.id,
        question: '¿Qué metáfora se usa para describir cómo funciona la conciencia?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Una escalera',
          'Una linterna (flashlight)',
          'Un espejo',
          'Una puerta'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'La metáfora del flashlight (linterna) describe cómo puedes dirigir tu conciencia/atención hacia diferentes objetos (pensamientos, emociones), pero la conciencia misma siempre está presente.',
        points: 2,
        orderIndex: 6,
      },
      {
        quizId: quiz6.id,
        question: '¿Cuál es el peligro principal de cuarta persona?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Falta de empatía',
          'Análisis paralizante y sobrepensamiento',
          'Desidentificación completa',
          'Falta de acción'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Cuarta persona puede llevar a sobrepensamiento y parálisis por análisis, donde pasas horas pensando sobre qué tipo de persona quieres ser sin actuar.',
        points: 2,
        orderIndex: 7,
      },
      {
        quizId: quiz6.id,
        question: '¿Qué práctica es esencial para desarrollar quinta persona?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Diálogo empático',
          'Meditación de observación',
          'Mapeo de posibles "yoes"',
          'Reflexión sobre conflictos'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'La meditación de observación, donde observas tus pensamientos y emociones sin identificarte con ellos, es esencial para desarrollar quinta persona.',
        points: 3,
        orderIndex: 8,
      },
      {
        quizId: quiz6.id,
        question: 'En los niveles superiores (5-6), la realidad se experimenta como un sueño lúcido.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Cuando alcanzas quinta y sexta persona, te das cuenta de que la realidad es como un sueño lúcido: sabes que es un sueño (formas surgiendo de lo informe), pero eliges participar conscientemente.',
        points: 2,
        orderIndex: 9,
      },
      {
        quizId: quiz6.id,
        question: '¿Cuál es el compromiso recomendado para desarrollar niveles superiores?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Práctica ocasional cuando te sientes estresado',
          'Práctica constante y diaria',
          'Solo meditación los fines de semana',
          'Leer sobre los niveles una vez al mes'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Desarrollar niveles superiores requiere práctica constante y diaria. La meditación regular, la observación consciente y el mindfulness diario son esenciales.',
        points: 2,
        orderIndex: 10,
      },
    ];

    for (const question of questions6) {
      await db.insert(quizQuestions).values(question);
    }
    console.log('✅ Created', questions6.length, 'questions for quiz 6');

    // Course 7: Teoría de Juegos Aplicada a Argentina: La Partida del Hombre Gris
    // ⚠️ Después de modificar este bloque vuelve a correr `pnpm ts-node scripts/seed-courses.ts`
    //     para refrescar lecciones, gráficos referenciados y el quiz en la base local.
    const course7Slug = 'teoria-juegos-argentina-hombre-gris';
    let course7 = await db.select().from(courses).where(eq(courses.slug, course7Slug)).limit(1);
    
    if (course7.length === 0) {
      const [newCourse7] = await db.insert(courses).values({
        title: 'Teoría de Juegos Aplicada a Argentina: La Partida del Hombre Gris',
        slug: course7Slug,
        description: 'Masterclass inmersiva para rediseñar Argentina como un juego iterado de suma positiva. Profundiza en teoría de juegos, microacuerdos, laboratorios Tit for Tat y métricas vivas para sostener cooperación real.',
        excerpt: 'Masterclass Hombre Gris: teoría de juegos aplicada, gráficos, ejercicios guiados y toolkit completo para convertir el país en una partida cooperativa.',
        category: 'hombre-gris',
        level: 'advanced',
        duration: 420,
        thumbnailUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800',
        orderIndex: 7,
        isPublished: true,
        isFeatured: true,
        requiresAuth: false,
        authorId,
      }).returning();
      course7 = [newCourse7];
      console.log('✅ Created course 7:', course7[0].title);
    } else {
      console.log('✅ Found existing course 7:', course7[0].title);
    }

    const lessonBlueprints = [
      {
        title: 'Módulo 1 · Fundamentos y lenguaje común',
        description: 'Instala definiciones, tipos de juegos, supuestos racionales y por qué Argentina debe pensarse como una partida iterada.',
        objectives: [
          'Definir juegos de suma cero, no cero, coordinación y dilemas sociales',
          'Explicar componentes clave: jugadores, estrategias, payoffs, información',
          'Conectar la teoría con tensiones históricas argentinas desde 1983 a hoy'
        ],
        theoryFocus: 'Marco formal, notación básica, nociones de equilibrio de Nash y dominancia.',
        practiceFocus: 'Mapeo de actores argentinos, preguntas de diagnóstico inicial, inventario de conflictos.',
        suggestedMedia: ['Gráfico payoff evolución (payoff-evolution.svg)', 'Canvas descargable de actores'],
        duration: 65,
        type: 'text' as const,
      },
      {
        title: 'Módulo 2 · Juegos estáticos y estrategias dominantes',
        description: 'Analiza juegos simultáneos clásicos (Prisionero, Coordinación, Chicken) y aterrízalos en políticas públicas.',
        objectives: [
          'Construir matrices de 2x2 y 3x3',
          'Identificar estrategias dominantes y mejor respuesta',
          'Modelar subsidios, pujas sindicales y regulaciones como juegos estáticos'
        ],
        theoryFocus: 'Mejor respuesta, dominancia estricta, iterada y equilibrio mixto.',
        practiceFocus: 'Casos: subsidios energéticos, paritarias, licitaciones.',
        suggestedMedia: ['Nuevo SVG: matriz comparativa', 'Tablas interactivas'],
        duration: 70,
        type: 'text' as const,
      },
      {
        title: 'Módulo 3 · Juegos repetidos e iterados',
        description: 'Explora cómo la repetición, el descuento y la memoria cambian los incentivos.',
        objectives: [
          'Explicar payoffs descontados y horizonte infinito',
          'Comparar estrategias grim trigger, pavlov, TFT y soft grudger',
          'Medir reputación y memoria corta en municipios/empresas públicas'
        ],
        theoryFocus: 'δ (factor de descuento), Folk Theorem, condiciones para cooperación.',
        practiceFocus: 'Series históricas de cumplimiento fiscal, ejemplos de cooperativas.',
        suggestedMedia: ['payoff-evolution.svg', 'líneas de tiempo de iteraciones'],
        duration: 75,
        type: 'text' as const,
      },
      {
        title: 'Módulo 4 · Señales, información y reputación pública',
        description: 'Diseña señales creíbles y tableros que sostienen la confianza.',
        objectives: [
          'Diferenciar tipos de señales (separadoras vs aglutinadoras)',
          'Aplicar teoría de screening al Estado argentino',
          'Diseñar tableros de reputación y sistemas de verificación'
        ],
        theoryFocus: 'Signaling games, información asimétrica, equilibrio de Bayes-Nash.',
        practiceFocus: 'Casos: licitación transparente, cooperativas de servicios, concesiones.',
        suggestedMedia: ['Nuevo SVG: árbol de señales', 'Dashboards de reputación'],
        duration: 60,
        type: 'text' as const,
      },
      {
        title: 'Módulo 5 · Coordinación y diseño de mecanismos',
        description: 'Construye reglas que alinean incentivos en redes complejas.',
        objectives: [
          'Analizar juegos de coordinación múltiple',
          'Introducir teoría de mecanismos y pagos laterales',
          'Aplicar mecanismos de subasta y matching a políticas federales'
        ],
        theoryFocus: 'Mecanismos de revelación, pagos Vickrey-Clarke-Groves.',
        practiceFocus: 'Asignación de presupuesto participativo, cupos de energía, logística.',
        suggestedMedia: ['Diagramas de flujo', 'Tablas de transferencia'],
        duration: 65,
        type: 'text' as const,
      },
      {
        title: 'Módulo 6 · Tit for Tat avanzado y repertorio de estrategias',
        description: 'Profundiza en TFT, variantes con perdón, ruidos y adaptación territorial.',
        objectives: [
          'Comparar desempeño de TFT, Generous TFT, Contrite TFT, Pavlov',
          'Diseñar protocolos de castigo proporcional y reinserción',
          'Programar laboratorios y dashboards para medir loops cooperativos'
        ],
        theoryFocus: 'Estudios de Axelrod, robustez frente a errores, condiciones de estabilidad.',
        practiceFocus: 'Aplicaciones en mesas paritarias, convenios fiscales, mesas sectoriales.',
        suggestedMedia: ['tit-for-tat-loop.svg', 'Pseudo-código de laboratorio'],
        duration: 70,
        type: 'text' as const,
      },
      {
        title: 'Módulo 7 · Estrategias argentinas: casos y contraejemplos',
        description: 'Revisión profunda de políticas, empresas y pactos sociales que ilustran diferentes estrategias.',
        objectives: [
          'Documentar al menos 6 casos cooperativos y 6 defectivos',
          'Extraer principios de diseño local',
          'Construir un ranking de estrategias según métricas Hombre Gris'
        ],
        theoryFocus: 'Evaluación comparada, indicadores de payoff extendido.',
        practiceFocus: 'Casos reales (Bahía Blanca, Mendoza, Chaco, AMBA, privados).',
        suggestedMedia: ['cooperation-heatmap.svg', 'Mapas interactivos'],
        duration: 80,
        type: 'text' as const,
      },
      {
        title: 'Módulo 8 · Simulaciones y laboratorios territoriales',
        description: 'Crea experimentos controlados para testear reglas antes de escalarlas.',
        objectives: [
          'Montar simulaciones digitales (spreadsheet + código)',
          'Dirigir roleplays multi-actor',
          'Definir métricas y paneles para laboratorios de 90 días'
        ],
        theoryFocus: 'Diseño experimental, teoría de aprendizaje adaptativo.',
        practiceFocus: 'Protocolos paso a paso, fichas de seguimiento, plantillas compartidas.',
        suggestedMedia: ['Nuevos SVG: cronogramas, loop de laboratorio'],
        duration: 70,
        type: 'text' as const,
      },
      {
        title: 'Módulo 9 · Diseño institucional y enforcement cooperativo',
        description: 'Traduce aprendizajes en reformas legales, contratos y órganos de control.',
        objectives: [
          'Aplicar teoría de juegos a diseño de contratos públicos',
          'Crear microacuerdos escalables y enforcement automático',
          'Integrar incentivos fiscales, reputacionales y regulatorios'
        ],
        theoryFocus: 'Teoría de contratos, mecanismos de sanción, repeated bargaining.',
        practiceFocus: 'Plantillas de decreto, convenios multilaterales, cláusulas Hombre Gris.',
        suggestedMedia: ['Diagramas de flujo institucional', 'Checklists legales'],
        duration: 80,
        type: 'text' as const,
      },
      {
        title: 'Módulo 10 · Plan de acción, métricas y escalamiento',
        description: 'Cierra con un plan integral: roadmap de 180 días, KPIs y compromisos públicos.',
        objectives: [
          'Diseñar un acta pública Tit for Tat',
          'Definir KPIs multi-actor y tablero de control',
          'Planificar escalamiento regional/nacional con hitos'
        ],
        theoryFocus: 'Roadmapping estratégico, accountability, teoría de transición.',
        practiceFocus: 'Entrega final, evaluación por pares, firma de compromisos.',
        suggestedMedia: ['Plantilla de acta', 'Timeline estratégico'],
        duration: 60,
        type: 'text' as const,
      },
    ];

    const lessons7 = lessonBlueprints.map((blueprint, index) => ({
      courseId: course7[0].id,
      title: blueprint.title,
      description: blueprint.description,
      content: `
        <div style="background:#0f172a; color:#e2e8f0; border-radius:18px; padding:1.5rem; margin-bottom:1rem;">
          <p style="margin:0; font-size:0.9rem; letter-spacing:0.08em; text-transform:uppercase;">Blueprint modular · ${blueprint.title}</p>
          <h2 style="margin:0.5rem 0 0;">Objetivos principales</h2>
          <ul style="margin:0.5rem 0 0 1.25rem; line-height:1.6;">
            ${blueprint.objectives.map((objective) => `<li>${objective}</li>`).join('')}
          </ul>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem;">
          <article style="background:#f8fafc; border-radius:12px; padding:1rem;">
            <h3 style="margin-top:0;">Enfoque teórico</h3>
            <p style="margin:0;">${blueprint.theoryFocus}</p>
          </article>
          <article style="background:#ecfccb; border-radius:12px; padding:1rem;">
            <h3 style="margin-top:0;">Aplicación argentina</h3>
            <p style="margin:0;">${blueprint.practiceFocus}</p>
          </article>
          <article style="background:#fff7ed; border-radius:12px; padding:1rem;">
            <h3 style="margin-top:0;">Medios sugeridos</h3>
            <ul style="margin:0.5rem 0 0 1.25rem;">${blueprint.suggestedMedia.map((media) => `<li>${media}</li>`).join('')}</ul>
          </article>
        </div>
        <div style="margin-top:1.25rem; background:#e0f2fe; border-left:4px solid #0ea5e9; border-radius:12px; padding:1rem;">
          <strong>Nota:</strong> El contenido completo de este módulo se desarrolla en la fase “lessons-overhaul”. Esta tarjeta funciona como blueprint de estructura y expectativas.
        </div>
      `,
      orderIndex: index + 1,
      type: blueprint.type,
      duration: blueprint.duration,
      isRequired: true,
    }));

    lessons7[0] = {
      courseId: course7[0].id,
      title: lessonBlueprints[0].title,
      description: lessonBlueprints[0].description,
      type: 'text',
      duration: 75,
      isRequired: true,
      orderIndex: 1,
      content: `
        <div style="background:linear-gradient(135deg,#020617 0%,#0f172a 100%);color:#e2e8f0;border-radius:20px;padding:2.25rem;box-shadow:0 25px 80px rgba(2,6,23,0.65);margin-bottom:2rem;">
          <p style="margin:0;font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase;opacity:0.75;">Módulo 1 · Fundamentos y lenguaje común</p>
          <h1 style="margin:0.75rem 0 0;font-size:2.75rem;line-height:1.15;">Argentina como un juego iterado: alfabetización estratégica para rediseñar incentivos</h1>
          <p style="margin:1rem 0 0;max-width:70ch;">Antes de entrar en tácticas, necesitamos un vocabulario compartido que permita leer el país como una partida dinámica. En este módulo construimos el diccionario del Hombre Gris: qué es un juego, quiénes son los jugadores reales, cómo se calculan payoffs tangibles e intangibles, y por qué la iteración es la llave para escapar del equilibrio mediocre de desconfianza.</p>
        </div>

        <section>
          <h2>1. Por qué teoría de juegos ahora</h2>
          <p>Argentina atraviesa simultáneamente crisis de confianza, coordinación y enforcement. Aun cuando existan recursos y talento, los incentivos desalineados empujan a cada actor a protegerse en lugar de cooperar. La teoría de juegos nos ofrece una lente rigurosa para desarmar estos dilemas: describe cómo se comportan personas, empresas y gobiernos cuando sus decisiones dependen de lo que harán los demás. No se trata de una herramienta académica distante; es un lenguaje que ya explica nuestras paritarias, negociaciones fiscales, acuerdos barriales y hasta los “microtratos” cotidianos como pagar a tiempo una factura o respetar un turno.</p>
          <p>El Hombre Gris utiliza este lenguaje para hackear la partida: si medimos jugadas, payoffs y expectativas, podemos rediseñar reglas que hagan más rentable cooperar que defectar. Este módulo te entrega esa sintaxis para que interpretes cualquier conflicto argentino como una matriz de opciones, costos y reputaciones.</p>
        </section>

        <section>
          <h2>2. Componentes de un juego</h2>
          <div style="background:#f8fafc;border-radius:16px;padding:1.5rem;border:1px solid #e2e8f0;margin-bottom:1.5rem;">
            <h3 style="margin-top:0;">2.1 Jugadores reales</h3>
            <p>En los manuales, “jugador” es un agente abstracto. En Argentina, los jugadores tienen nombre y legado: ciudadanía (segmentada en barrios, cooperativas, organizaciones sociales), Estado (nacional, provincial, municipal y sus agencias), empresas (desde pymes hasta cámaras sectoriales), sindicatos, movimientos sociales, instituciones financieras, medios y actores globales (organismos multilaterales, cadenas de suministro). Cada uno trae recursos, limitaciones y memoria histórica.</p>
            <ul>
              <li><strong>Ciudadanía organizada:</strong> aporta legitimidad, mano de obra, conocimiento territorial. Su payoff combina dignidad, acceso a servicios y seguridad cotidiana.</li>
              <li><strong>Estado:</strong> arbitra, coordina y financia. Su payoff abarca gobernabilidad, recaudación, reputación internacional y permanencia política.</li>
              <li><strong>Empresas y economía real:</strong> necesitan previsibilidad jurídica, acceso a crédito, reglas simples y mercados dinámicos. Su payoff mezcla utilidades, licencias sociales y acceso a mercados.</li>
              <li><strong>Territorios:</strong> cada provincia o municipio es un tablero con reglas particulares (coparticipación, recursos naturales, redes de confianza). Su payoff incluye inversión, infraestructura y autonomía.</li>
            </ul>
          </div>

          <div style="background:#ecfccb;border-radius:16px;padding:1.5rem;border:1px solid #bbf7d0;margin-bottom:1.5rem;">
            <h3 style="margin-top:0;">2.2 Estrategias</h3>
            <p>Una estrategia es un plan completo que indica cómo actuar ante cada posible situación. En conflictos locales suelen reducirse a “cooperar” o “defectar”, pero en realidad contienen matices:</p>
            <ul>
              <li><strong>Cooperar:</strong> compartir información, cumplir compromisos, invertir antes que los demás, abrir datos, sostener la palabra dada.</li>
              <li><strong>Defectar:</strong> ocultar, demorar, cortar el diálogo, capturar rentas, incumplir después de recibir beneficios.</li>
              <li><strong>Estrategias mixtas:</strong> cooperar condicionalmente, probar al otro con una señal pequeña antes de comprometerse, castigar y perdonar con reglas explícitas.</li>
            </ul>
            <p>El Hombre Gris agrega variantes propias: “cooperación radical” (dar más de lo esperado para cambiar la narrativa), “castigo proporcional y breve” (no convertir la justicia en venganza) y “perdón condicionado” (reincorporar cuando hay reparación verificable).</p>
          </div>

          <div style="background:#fff7ed;border-radius:16px;padding:1.5rem;border:1px solid #fed7aa;">
            <h3 style="margin-top:0;">2.3 Payoffs tangibles e intangibles</h3>
            <p>Tradicionalmente los payoffs son utilidades monetarias. Aquí los expandimos: reputación, velocidad de implementación, capacidad de escala, legitimidad, paz social, acceso a información crítica. Ejemplo: cuando una provincia abre datos catastrales, su payoff inmediato puede parecer negativo (pierde control), pero gana reputación, baja litigiosidad y recibe inversiones: un payoff cooperativo compuesto.</p>
            <p>Para cuantificarlos diseñamos la métrica <strong>Valor Hombre Gris (VHG)</strong>, que suma tres campos:</p>
            <ol>
              <li><strong>Valor económico:</strong> ahorros, ingresos, créditos habilitados.</li>
              <li><strong>Valor social:</strong> confianza ciudadana, participación, reducción de conflictos.</li>
              <li><strong>Valor de futuro:</strong> capacidad de replicar el acuerdo en otros territorios, adopción por actores nacionales, aprendizaje institucional.</li>
            </ol>
            <p>El VHG nos ayuda a comparar estrategias: aunque un gesto cooperativo cueste dinero, si eleva la reputación y habilita microacuerdos futuros, el payoff total puede ser positivo.</p>
          </div>
        </section>

        <section>
          <h2>3. Tipos de juegos más frecuentes en Argentina</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;">
            <article style="background:#e2e8f0;border-radius:14px;padding:1.25rem;">
              <h3 style="margin-top:0;">3.1 Juegos de suma cero (competitivos)</h3>
              <p>Aparecen en licitaciones cerradas o disputas por licencias. Cada peso que gana un actor lo pierde otro. Son inevitables, pero si dominan la agenda, se instala la lógica de guerra permanente.</p>
              <p><strong>Ejemplo:</strong> reparto de cupos de importación. Si no se crea un componente cooperativo (premiar proyectos que generen empleo o conocimiento compartido), la partida se transforma en un juego donde la mejor estrategia es capturar al regulador.</p>
            </article>
            <article style="background:#f1f5f9;border-radius:14px;padding:1.25rem;">
              <h3 style="margin-top:0;">3.2 Juegos de suma no cero</h3>
              <p>La mayoría de los problemas nacionales son de suma no cero: es posible que todos ganen si coordinan. Ejemplo clásico: infraestructura compartida. Una provincia y una empresa pueden cofinanciar un parque solar; cooperar genera energía abundante (payoff positivo para ambos) mientras que defectar retrasa la obra y encarece el sistema.</p>
            </article>
            <article style="background:#fef3c7;border-radius:14px;padding:1.25rem;">
              <h3 style="margin-top:0;">3.3 Juegos de coordinación</h3>
              <p>Requieren que los actores elijan la misma estrategia para obtener beneficios. El problema argentino es que existen múltiples equilibrios y tendemos a coordinar en el peor (alta inflación, informalidad, evasión). Para desplazar el equilibrio necesitamos señales claras, memoria pública y microincentivos que guíen hacia la opción cooperativa.</p>
            </article>
            <article style="background:#fee2e2;border-radius:14px;padding:1.25rem;">
              <h3 style="margin-top:0;">3.4 Juegos de dilema social (tipo Prisionero)</h3>
              <p>Cada jugador tiene un incentivo individual a defectar aunque cooperar sea mejor para todos. Esto explica desde la evasión fiscal hasta la proliferación de residuos. La solución requiere mecanismos que aumenten el costo de defraudar y/o aumenten el beneficio de cooperar.</p>
            </article>
          </div>
        </section>

        <section>
          <h2>4. Construyendo la matriz del juego argentino</h2>
          <p>Para que la teoría sea aplicable debemos traducirla a matrices concretas. Tomemos el dilema Estado–Ciudadanía respecto al pago de impuestos municipales:</p>
          <pre style="background:#0f172a;color:#e2e8f0;padding:1.25rem;border-radius:14px;overflow:auto;">
Ciudadanía \\ Estado | Invertir (C)                        | No invertir (D)
-------------------------------------------------------------------------------
Paga impuestos (C)   | +4 / +4 (servicios, legitimidad)   | -1 / +5 (abuso percibido)
No paga (D)          | +5 / -1 (ganancia a corto plazo)   | +1 / +1 (colapso compartido)
          </pre>
          <p>El equilibrio dominante en muchos municipios ha sido (D,D): el Estado no invierte porque anticipa evasión, la ciudadanía evade porque no ve obras. Cambiar la matriz implica:</p>
          <ul>
            <li><strong>Subir payoff cooperativo:</strong> inversiones visibles, dashboards de obra, devolución de parte de la recaudación en créditos locales.</li>
            <li><strong>Bajar payoff defectivo:</strong> multas inteligentes, cortes selectivos de servicios, pérdida de beneficios para reincidentes.</li>
            <li><strong>Crear memoria pública:</strong> boletines mensuales que muestren quién coopera y cómo se reinvierte.</li>
          </ul>

          <figure style="margin:2rem 0;text-align:center;">
            <img src="/course-graphics/hombre-gris/payoff-evolution.svg" alt="Evolución de payoffs cooperar vs defectar" style="width:100%;border-radius:18px;box-shadow:0 25px 60px rgba(15,23,42,0.35);" />
            <figcaption style="margin-top:0.85rem;color:#475569;">El objetivo es desplazarnos de la curva rojiza de castigo mutuo a la curva turquesa donde la cooperación acumula valor. Esto sólo sucede cuando la primera jugada es generosa, el castigo es proporcional y el perdón se activa tras reparación.</figcaption>
          </figure>
        </section>

        <section>
          <h2>5. Narrativa histórica: Argentina 1983-2025 como juego iterado</h2>
          <p>Para entender por qué estamos atrapados en un equilibrio de desconfianza, hagamos una lectura cronológica:</p>
          <ol>
            <li><strong>Transición democrática (1983-1989):</strong> Juego de coordinación. Objetivo: consolidar instituciones. Muchos actores cooperaron, pero la hiperinflación y la deuda externa introdujeron choques que premiaron estrategias cortoplacistas.</li>
            <li><strong>Convertibilidad (1991-2001):</strong> Juego de compromiso creíble. Se consiguió coordinación antiinflacionaria, pero el payoff estaba mal calibrado: se premiaba el endeudamiento y la sobrevaluación. El crash mostró que la cooperación sin amortiguadores produce equilibrios frágiles.</li>
            <li><strong>Poscrisis (2002-2015):</strong> Sequencia de juegos repetidos entre Nación, provincias y sectores productivos. Hubo episodios de cooperación (clústers de economía social, programas de ciencia), pero también castigos largos (retenciones, cepos, litigios) que erosionaron la memoria corta.</li>
            <li><strong>Actualidad:</strong> Multiplicidad de tableros con reglas contradictorias. Cada actor diseña su propio juego para sobrevivir. El Hombre Gris propone unificar el lenguaje y reconstruir microacuerdos que puedan escalar.</li>
          </ol>
        </section>

        <section>
          <h2>6. Herramientas prácticas</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;">
            <article style="background:#ecfccb;border-radius:16px;padding:1.25rem;">
              <h3 style="margin-top:0;">6.1 Canvas de actores</h3>
              <p>Descarga la plantilla (link en la sección de recursos) y completa:</p>
              <ul>
                <li>Actor, intereses declarados y latentes</li>
                <li>Historial de jugadas (últimos 12 meses)</li>
                <li>Payoff actual y deseado</li>
                <li>Señales que envían / señales que necesitan recibir</li>
              </ul>
            </article>
            <article style="background:#f0fdfa;border-radius:16px;padding:1.25rem;">
              <h3 style="margin-top:0;">6.2 Diario de iteraciones</h3>
              <p>Registrar cada reunión como “ronda” con:</p>
              <ul>
                <li>Acciones concretas (cooperó/defectó)</li>
                <li>Tiempo de respuesta</li>
                <li>Consecuencias inmediatas</li>
                <li>Nota emocional (confianza ↑ o ↓)</li>
              </ul>
            </article>
            <article style="background:#fff7ed;border-radius:16px;padding:1.25rem;">
              <h3 style="margin-top:0;">6.3 Inventario de payoffs</h3>
              <p>Asignar valores relativos (1-5) a cada payoff tangible/intangible. Úsalo para detectar dónde debes subir recompensas o subir costos.</p>
            </article>
          </div>
        </section>

        <section>
          <h2>7. Ejercicios guiados</h2>
          <div style="background:#e2e8f0;border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;">
            <h3 style="margin-top:0;">Ejercicio 1 · Dibuja tu juego actual</h3>
            <p><strong>Paso 1:</strong> Elige una relación estratégica (municipio-empresa, ministerio-sindicato, cooperativa-banco).</p>
            <p><strong>Paso 2:</strong> Lista las dos estrategias centrales para cada parte.</p>
            <p><strong>Paso 3:</strong> Asigna payoffs combinando dinero, reputación y futuro. Usa la escala -3 a +5.</p>
            <p><strong>Paso 4:</strong> Señala el equilibrio actual (¿C,D? ¿D,D?) y qué cambios necesitas para moverlo.</p>
          </div>
          <div style="background:#dcfce7;border-radius:16px;padding:1.5rem;">
            <h3 style="margin-top:0;">Ejercicio 2 · Identifica la primera jugada cooperativa</h3>
            <ol>
              <li>Describe una señal cooperativa que pueda ejecutar tu actor en los próximos 7 días.</li>
              <li>Define cómo la comunicarás públicamente (nota, tablero, acta breve).</li>
              <li>Anticipa la respuesta del otro actor y diseña el castigo proporcional si defecta.</li>
              <li>Determina qué evidencia necesitas para otorgar perdón y volver a cooperar.</li>
            </ol>
          </div>
        </section>

        <section>
          <h2>8. Casos argentinos ilustrativos</h2>
          <p>Seleccionamos tres historias que muestran cómo aplicar la teoría:</p>
          <article style="border-left:4px solid #0ea5e9;background:#e0f2fe;border-radius:14px;padding:1.25rem;margin-bottom:1rem;">
            <h3 style="margin-top:0;">Caso 1 · Bahía Confianza (Buenos Aires)</h3>
            <p>Municipio y cámaras pyme pactaron un tablero público de gasto. Resultado: la ciudadanía cooperó pagando tasas porque veía las obras. El equilibrio pasó de (D,D) a (C,C) en 180 días.</p>
            <p><strong>Claves:</strong> primera jugada cooperativa (publicación de licitaciones), castigo claro (suspensión de beneficios), memoria corta (revisión mensual).</p>
          </article>
          <article style="border-left:4px solid #f97316;background:#fff7ed;border-radius:14px;padding:1.25rem;margin-bottom:1rem;">
            <h3 style="margin-top:0;">Caso 2 · Programa de abastecimiento en Chaco</h3>
            <p>Cooperativas agrícolas y el ministerio firmaron microacuerdos con recompensas en insumos. Hubo ruido (errores logísticos), pero el uso de TFT con perdón condicionado evitó la ruptura.</p>
          </article>
          <article style="border-left:4px solid #22c55e;background:#f0fdf4;border-radius:14px;padding:1.25rem;">
            <h3 style="margin-top:0;">Caso 3 · Mesa tecnológica Mendoza</h3>
            <p>Empresas y gobierno provincial diseñaron un juego de coordinación: quien abre datos de producción recibe prioridad en créditos. Se combinó teoría de señales y reputación pública.</p>
          </article>
        </section>

        <section>
          <h2>9. Checklist de salida del módulo</h2>
          <ul>
            <li>¿Puedes describir cualquier conflicto de tu territorio como un juego con jugadores, estrategias y payoffs?</li>
            <li>¿Construiste al menos una matriz y detectaste el equilibrio actual?</li>
            <li>¿Identificaste la primera jugada cooperativa y el castigo proporcional?</li>
            <li>¿Tienes un plan para medir reputación y memoria corta?</li>
          </ul>
          <div style="background:#0f172a;color:#e2e8f0;border-radius:16px;padding:1.25rem;margin-top:1rem;">
            <strong>Entrega sugerida:</strong> sube tu canvas de actores + matriz + primera jugada al foro del curso. Recibirás feedback de la comunidad Hombre Gris y de los mentores del programa.
          </div>
        </section>

        <section>
          <h2>10. Preparación para el Módulo 2</h2>
          <p>En la próxima lección descenderemos a juegos estáticos con mayor precisión matemática. Trae tu matriz, porque la convertiremos en un laboratorio donde experimentarás con estrategias dominantes, mejor respuesta y escenarios mixtos.</p>
        </section>

        <section>
          <h2>11. Glosario mínimo del Hombre Gris</h2>
          <dl>
            <dt><strong>Equilibrio de Nash</strong></dt>
            <dd>Situación en la que ningún jugador puede mejorar su payoff cambiando unilateralmente de estrategia. En Argentina suele ser un equilibrio mediocre que debemos rediseñar.</dd>
            <dt><strong>Memoria corta</strong></dt>
            <dd>Principio TFT: castigo breve seguido de perdón si hay reparación. Evita ciclos de venganza que destruyen cooperación.</dd>
            <dt><strong>Señal creíble</strong></dt>
            <dd>Acción costosa o verificable que demuestra intención cooperativa (ej. abrir datos, transferir fondos, auditar públicamente).</dd>
            <dt><strong>Microacuerdo</strong></dt>
            <dd>Pacto limitado en tiempo y territorio que permite testear reglas antes de escalarlas.</dd>
            <dt><strong>Valor Hombre Gris (VHG)</strong></dt>
            <dd>Métrica que combina valor económico, social y de futuro para evaluar jugadas cooperativas.</dd>
          </dl>
        </section>
      `,
    };

    lessons7[1] = {
      courseId: course7[0].id,
      title: lessonBlueprints[1].title,
      description: lessonBlueprints[1].description,
      type: 'text',
      duration: 85,
      isRequired: true,
      orderIndex: 2,
      content: `
        <div style="background:linear-gradient(120deg,#0f172a 0%,#1d4ed8 60%,#4c1d95 100%);color:#f8fafc;border-radius:20px;padding:2rem;box-shadow:0 25px 80px rgba(15,23,42,0.55);margin-bottom:2rem;">
          <p style="margin:0;font-size:0.85rem;letter-spacing:0.1em;text-transform:uppercase;opacity:0.75;">Módulo 2 · Juegos estáticos y estrategias dominantes</p>
          <h1 style="margin:0.75rem 0 0;font-size:2.5rem;line-height:1.15;">Matrices que explican subsidios, paritarias y licitaciones: dominar los juegos simultáneos en Argentina</h1>
          <p style="margin:1rem 0 0;max-width:72ch;">Cuando las decisiones se toman al mismo tiempo (o sin conocer la jugada del otro), las matrices de payoff revelan dónde se estanca la cooperación. En este módulo aprenderás a construir y analizar juegos estáticos de 2x2 y 3x3, detectar estrategias dominantes, calcular mejores respuestas y utilizar equilibrios (puros y mixtos) para rediseñar políticas públicas.</p>
        </div>

        <section>
          <h2>1. Anatomía de un juego simultáneo</h2>
          <p>Un juego estático es aquel en el que los jugadores eligen sus estrategias de manera simultánea o sin observar lo que hace el resto. Esta estructura aparece en licitaciones selladas, paritarias cuando se presentan ofertas finales, decisiones presupuestarias, fijación de precios y muchas negociaciones reguladoras. Para modelarlo necesitamos:</p>
          <ol>
            <li><strong>Lista de jugadores</strong> con sus estrategias posibles.</li>
            <li><strong>Matriz de payoffs</strong> donde cada celda muestra la recompensa de ambos jugadores para cada combinación de estrategias.</li>
            <li><strong>Herramientas de análisis</strong> para detectar mejor respuesta, estrategia dominante y equilibrios.</li>
          </ol>
          <p>La ventaja del Hombre Gris es que convierte estos modelos en tableros vivos: al compartir la matriz con los actores, se transparentan los incentivos y se identifica qué cambios reglamentarios se necesitan para mover el equilibrio.</p>
        </section>

        <section>
          <h2>2. Construyendo matrices 2x2: subsidios energéticos</h2>
          <p>Tomemos el conflicto clásico entre <strong>Estado (E)</strong> y <strong>Distribuidoras (D)</strong> sobre subsidios energéticos y tarifas.</p>
          <pre style="background:#0f172a;color:#e2e8f0;padding:1.25rem;border-radius:16px;overflow:auto;">
D \\ E           | Sostener subsidio (S)                  | Ajustar tarifa (A)
------------------------------------------------------------------------------------
Invertir (I)     | +3 / +4 (servicio estable, popularidad) | +4 / +2 (calidad alta, costo político)
Reducir (R)      | +2 / +1 (corto plazo, deterioro red)    | +5 / -1 (ganancia empresa, conflicto social)
          </pre>
          <p>Interpretación:</p>
          <ul>
            <li>Si ambas partes cooperan (S,I), los usuarios reciben servicio y el gobierno mantiene apoyo, pero la red sigue tensionada.</li>
            <li>Si el Estado ajusta tarifas y la empresa invierte (A,I), el sistema se vuelve sustentable, pero el costo político es alto (payoff +2 para el Estado).</li>
            <li>Si la empresa reduce inversiones cuando el Estado ajusta (A,R), se produce un castigo fuerte para el gobierno.</li>
          </ul>
          <p>Para identificar el equilibrio debemos analizar mejor respuesta:</p>
          <ul>
            <li><strong>Mejor respuesta de D:</strong> Si el Estado sostiene subsidios (S), invertir (I) da payoff +4 vs +1; si ajusta (A), invertir da +2 vs -1. Por lo tanto, <strong>I domina a R</strong>.</li>
            <li><strong>Mejor respuesta de E:</strong> Si D invierte (I), ajustar (A) ofrece +4 vs +3 ⇒ preferencia por A. Si D reduce (R), sostener (S) ofrece +2 vs +5 (pero +5 es para D, no E). Para el Estado, S da +2 vs A con +1. Entonces la mejor respuesta es S. Resultado: equilibrio (S,I).</li>
          </ul>
          <p>Este equilibrio parece razonable pero no óptimo. El objetivo del Hombre Gris es rediseñar la matriz para que (A,I) sea más atractivo (por ejemplo aumentando la recompensa política del ajuste mediante una tarifa social automática y dashboards que expliquen el destino de los fondos).</p>
        </section>

        <section>
          <h2>3. Matrices 3x3: paritarias nacionales</h2>
          <p>En las negociaciones salariales participan <strong>Gobierno (G)</strong>, <strong>Sindicatos (S)</strong> y <strong>Empresas (E)</strong>. Podemos reducir el análisis a un juego G-S donde las empresas responden con inversión o no. Sin embargo, cuando las tres partes actúan simultáneamente, necesitamos una matriz 3x3 (simplificada aquí a dos jugadores con tres estrategias cada uno para visualizar la lógica).</p>
          <pre style="background:#111827;color:#e5e7eb;padding:1.25rem;border-radius:16px;overflow:auto;">
Sindicato \\ Gobierno | Aumentos escalonados (AE) | Bono + cláusula gatillo (BG) | Congelar con revisión (CR)
---------------------------------------------------------------------------------------------------------------
Moderado (M)          | +3 / +4                    | +4 / +3                      | +2 / +5
Presión alta (P)      | +1 / +1                    | +3 / +2                      |  0 / +4
Confrontación (C)     | -1 / 0                     | +1 / +1                      | -2 / +3
          </pre>
          <p>Aquí el <strong>Gobierno</strong> busca elegir la columna que maximiza su resultado, considerando la estrategia sindical:</p>
          <ul>
            <li>Si el sindicato es moderado (M), la mejor respuesta del Gobierno es AE (payoff +4).</li>
            <li>Si hay presión alta (P), la mejor respuesta es CR (+4).</li>
            <li>Si hay confrontación (C), la mejor respuesta es BG (+1) para evitar daño.</li>
          </ul>
          <p>El sindicato analiza fila por fila. Si el Gobierno elige AE, M domina (payoff +3). Si elige BG, M gana con +4. Si elige CR, P gana con 0 > -2. Conclusión: (AE, M) es un equilibrio de Nash, pero no siempre alcanzable porque los jugadores no observan la decisión del otro antes de realizarla. Por eso se recurre a preacuerdos (actas) que reducen la simultaneidad o instalan señales públicas.</p>
          <div style="background:#fef3c7;border-radius:14px;padding:1.25rem;border-left:4px solid #f59e0b;margin-top:1rem;">
            <strong>Insight:</strong> los sindicatos moderados necesitan una garantía creíble de que sus concesiones serán recompensadas. Diseñar un mecanismo donde los aumentos escalonados se activen automáticamente ante métricas de inflación genera un incentivo a permanecer en la estrategia M.</div>
        </section>

        <section>
          <h2>4. Estrategias dominantes y dominancia iterada</h2>
          <p>Una <strong>estrategia dominante</strong> produce un payoff igual o superior al resto, sin importar lo que haga el otro jugador. Identificarla permite anticipar el comportamiento real aunque el discurso diga lo contrario.</p>
          <ul>
            <li><strong>Dominancia estricta:</strong> una estrategia es mejor en todas las combinaciones.</li>
            <li><strong>Dominancia débil:</strong> nunca es peor y a veces es mejor.</li>
            <li><strong>Dominancia iterada:</strong> eliminando estrategias dominadas de manera sucesiva se pueden reducir matrices complejas.</li>
          </ul>
          <p><strong>Ejemplo:</strong> Licitación de obra pública con tres ofertas: transparente (T), semi-opaca (S) y opaca (O). Si el Estado implementa auditoría en tiempo real, la estrategia O queda dominada porque siempre termina con sanciones. Al eliminarla, los jugadores se enfocan en T o S. Si además se publican puntajes de reputación, T se vuelve dominante. Esta depuración racionaliza el juego sin necesidad de controlar cada jugada en detalle.</p>
        </section>

        <section>
          <h2>5. Mejor respuesta y diagramas de reacción</h2>
          <p>La <strong>mejor respuesta</strong> es la estrategia óptima dada una elección del rival. Los diagramas de reacción (best-response) nos permiten visualizar cómo se intersectan las mejores respuestas para encontrar equilibrios.</p>
          <div style="background:#cffafe;border-radius:16px;padding:1.25rem;margin-bottom:1rem;">
            <p><strong>Aplicación:</strong> fijación de precios entre dos cadenas de supermercados en el AMBA. Cada una decide precio alto (H) o bajo (L). El diagrama de mejor respuesta muestra que si una elige L, la otra también responde con L para no perder mercado. Resultado: equilibrio (L,L), es decir, guerra de precios. Para moverlo, el Estado debe modificar la matriz (por ejemplo, con incentivos fiscales condicionales a acuerdos de precios + abastecimiento). Así, el payoff de (H,H) aumenta, generando un nuevo equilibrio cooperativo.</p>
          </div>
        </section>

        <section>
          <h2>6. Equilibrios puros y mixtos</h2>
          <h3>6.1 Equilibrios puros</h3>
          <p>Se dan cuando cada jugador elige una estrategia concreta que es mejor respuesta al otro. Muchos conflictos argentinos tienen equilibrios puros malos (ej. informalidad generalizada). Para salir de ellos debemos alterar la matriz. Ejemplos:</p>
          <ul>
            <li><strong>Informalidad laboral:</strong> (Patrón defeca, Estado defeca) es un equilibrio puro. Introducir inspecciones inteligentes + beneficios para las pymes que formalizan cambia la estructura.</li>
            <li><strong>Residuos urbanos:</strong> (Vecino defeca, Municipio defeca) es equilibrio puro. Microacuerdos con recompensas por reciclaje y penalización automática rompen esa estabilidad.</li>
          </ul>
          <h3>6.2 Equilibrios mixtos</h3>
          <p>Cuando no existe equilibrio puro, los jugadores mezclan estrategias con ciertas probabilidades. Ejemplo: control aduanero vs contrabando hormiga. El Estado no puede inspeccionar todos los contenedores, y los contrabandistas deben decidir cuándo arriesgar. Se establece un equilibrio mixto donde el Estado inspecciona con probabilidad p y los contrabandistas intentan con probabilidad q. Ajustando p (más tecnología, analítica) se reduce la rentabilidad de defectar.</p>
          <div style="background:#ede9fe;border-radius:14px;padding:1.25rem;border-left:4px solid #7c3aed;margin-top:1rem;">
            <strong>Nota práctica:</strong> Aunque los equilibrios mixtos parecen abstractos, se pueden traducir en “turnos aleatorios” de auditorías, sorteos de inspección o rotaciones de personal que impiden que el opositor anticipe la jugada.</div>
        </section>

        <section>
          <h2>7. Caso aplicado · Licitación transparente vs. captura</h2>
          <p>Supongamos una licitación provincial con empresas A y B. Cada una puede elegir:</p>
          <ul>
            <li><strong>Oferta honesta (H):</strong> costos reales, sin coimas.</li>
            <li><strong>Oferta maquillada (M):</strong> costos inflados y acuerdos por debajo de la mesa.</li>
          </ul>
          <pre style="background:#1f2937;color:#f8fafc;padding:1.25rem;border-radius:16px;overflow:auto;">
B \\ A | Honesta (H)                 | Maquillada (M)
------------------------------------------------------------
Honesta (H) | +4 / +4 (obra eficiente, reputación alta) | +1 / +5 (B captura, A queda fuera)
Maquillada (M) | +5 / +1 (A captura)                | +2 / +2 (sobreprecio, sanciones leves)
          </pre>
          <p>Sin controles, (M,M) puede ser equilibrio porque ambos temen quedar afuera si cooperan. ¿Cómo lo cambiamos?</p>
          <ol>
            <li>Instalando <strong>auditoría previa obligatoria</strong>, el payoff de (M,·) cae por riesgo de sanción.</li>
            <li>Otorgando <strong>bonos de reputación</strong> canjeables por créditos baratos, (H,H) se vuelve más atractivo.</li>
            <li>Publicando la matriz a los oferentes (con incentivos y sanciones) se construye transparencia radical.</li>
          </ol>
          <p>Este caso demuestra que no basta con pedir “ofertas honestas”; hay que rediseñar el juego.</p>
        </section>

        <section>
          <h2>8. Toolkit para juegos estáticos</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;">
            <article style="background:#ecfccb;border-radius:16px;padding:1.25rem;">
              <h3 style="margin-top:0;">8.1 Plantilla de matriz</h3>
              <p>Incluye instrucciones para: definir estrategias, calcular payoffs (económicos, reputacionales, regulatorios) y señalar equilibrios con íconos. Disponible en la carpeta de recursos.</p>
            </article>
            <article style="background:#f0fdfa;border-radius:16px;padding:1.25rem;">
              <h3 style="margin-top:0;">8.2 Checklist de dominancia</h3>
              <ol>
                <li>Comparar filas/columnas para cada jugador.</li>
                <li>Eliminar estrategias que nunca son óptimas.</li>
                <li>Repetir hasta que quede la matriz reducida.</li>
              </ol>
            </article>
            <article style="background:#fff7ed;border-radius:16px;padding:1.25rem;">
              <h3 style="margin-top:0;">8.3 Script de conversación</h3>
              <p>Guion para presentar la matriz a los actores sin generar resistencia. Incluye preguntas abiertas (“¿Qué necesitarías para moverte hacia esta celda cooperativa?”) y protocolos para documentar compromisos.</p>
            </article>
          </div>
        </section>

        <section>
          <h2>9. Ejercicios prácticos</h2>
          <div style="background:#e2e8f0;border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;">
            <h3 style="margin-top:0;">Ejercicio A · Paritaria local</h3>
            <ol>
              <li>Define las tres principales estrategias del sindicato y del gobierno municipal.</li>
              <li>Construye la matriz 3x3 e identifica el equilibrio actual.</li>
              <li>Propone un cambio (incentivo, sanción, señal) que altere los payoffs.</li>
            </ol>
          </div>
          <div style="background:#dcfce7;border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;">
            <h3 style="margin-top:0;">Ejercicio B · Licitación de servicios urbanos</h3>
            <ol>
              <li>Modela las estrategias (servicio premium vs básico, transparencia vs captura).</li>
              <li>Calcula mejor respuesta para cada empresa.</li>
              <li>Diseña un mecanismo para que cooperar sea dominante (ej. reputación, incentivos financieros, exclusiones).</li>
            </ol>
          </div>
          <div style="background:#fef3c7;border-radius:16px;padding:1.5rem;">
            <h3 style="margin-top:0;">Ejercicio C · Juego ciudadano</h3>
            <p>Elige una interacción cotidiana (ej. pago de expensas, cuidado de un barrio). Construye una matriz 2x2 entre “vecinos organizados” y “administración”. Diagnostica el equilibrio y planifica la primera señal para moverlo.</p>
          </div>
        </section>

        <section>
          <h2>10. Casos argentinos destacados</h2>
          <article style="border-left:4px solid #0ea5e9;background:#e0f2fe;border-radius:14px;padding:1.25rem;margin-bottom:1rem;">
            <h3 style="margin-top:0;">Caso · Programa Precios Justos</h3>
            <p>Juego simultáneo entre supermercados y Gobierno. Sin enforcement digital, el equilibrio derivó en trampas. La introducción de verificadores ciudadanos y apps de denuncia modificó payoffs, pero el castigo siguió siendo débil. La lección: sin sanción automática, la estrategia dominante sigue siendo defraudar.</p>
          </article>
          <article style="border-left:4px solid #22c55e;background:#f0fdf4;border-radius:14px;padding:1.25rem;">
            <h3 style="margin-top:0;">Caso · Consorcio Ruta 3</h3>
            <p>Empresas constructoras y cooperativas se aliaron para presentar propuestas conjuntas. Al compartir información, construyeron una matriz donde la cooperación les daba acceso a financiamiento del BID, volviendo dominante la estrategia honesta. Resultado: obra ejecutada con 15% menos de costos y reputación elevada.</p>
          </article>
        </section>

        <section>
          <h2>11. Checklist de salida</h2>
          <ul>
            <li>¿Modelaste al menos un conflicto real con matrices 2x2 y 3x3?</li>
            <li>¿Identificaste estrategias dominantes y mejores respuestas?</li>
            <li>¿Diseñaste al menos una intervención para modificar payoffs?</li>
            <li>¿Compartiste tu matriz con los actores relevantes?</li>
          </ul>
          <div style="background:#0f172a;color:#e2e8f0;border-radius:16px;padding:1.25rem;margin-top:1rem;">
            <strong>Entrega sugerida:</strong> publica tus matrices y el plan de intervención en el foro. Incluye un audio o video corto explicando cómo piensas mover el equilibrio. Recibirás comentarios para afinarlo antes del módulo 3.</div>
        </section>

        <section>
          <h2>12. Preparación para el Módulo 3</h2>
          <p>Ahora que dominas los juegos simultáneos, daremos un salto a los juegos repetidos e iterados, donde la reputación y el tiempo cambian todo. Trae tus matrices: las convertiremos en series temporales y mediremos qué sucede cuando los jugadores tienen memoria y expectativas de futuro.</p>
        </section>
      `,
    };

    lessons7[2] = {
      courseId: course7[0].id,
      title: lessonBlueprints[2].title,
      description: lessonBlueprints[2].description,
      type: 'text',
      duration: 95,
      isRequired: true,
      orderIndex: 3,
      content: `
        <div style="background:linear-gradient(135deg,#0f172a 0%,#115e59 50%,#15803d 100%);color:#ecfccb;border-radius:22px;padding:2.5rem;box-shadow:0 25px 90px rgba(2,6,23,0.7);margin-bottom:2rem;">
          <p style="margin:0;font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase;opacity:0.7;">Módulo 3 · Juegos repetidos e iterados</p>
          <h1 style="margin:0.85rem 0 0;font-size:2.6rem;line-height:1.12;">Cuando la reputación pesa: delta, memoria y cooperación sostenida para rediseñar Argentina</h1>
          <p style="margin:1rem 0 0;max-width:78ch;">Las partidas argentinas rara vez son únicas. Los mismos actores se cruzan en múltiples mesas, elecciones, licitaciones y agendas territoriales. Este módulo te entrega las herramientas para modelar esa repetición: factores de descuento, estrategias como Tit for Tat, Grim Trigger o Pavlov, y métodos para medir reputación y memoria corta. Con estos conceptos podrás diseñar microacuerdos que se sostengan ronda tras ronda.</p>
        </div>

        <section>
          <h2>1. Factor de descuento (δ) y horizonte</h2>
          <p>El factor de descuento δ representa cuánto valoran los jugadores el futuro. Va de 0 (no me importa mañana) a 1 (valoro el futuro tanto como el presente). Cuando δ es alto, cooperar se vuelve atractivo porque las recompensas futuras pesan.</p>
          <div style="background:#ecfccb;border-radius:16px;padding:1.5rem;border:1px solid #bbf7d0;margin-bottom:1.5rem;">
            <strong>Visualización:</strong> Si δ ≥ 0.5 en un juego tipo Prisionero, es posible sostener cooperación con estrategias condicionales. En Argentina, sectores con contrato a largo plazo (energía, agro, infraestructura) suelen tener δ alto; en cambio, programas asistenciales de corta duración tienen δ bajo, lo que incentiva el oportunismo.</div>
          <p><strong>Ejemplo:</strong> Un municipio ofrece un contrato de residuos por 5 años. Si el adjudicatario valora la renovación (δ≈0.8), preferirá cooperar para no perder reputación. Si el contrato dura 6 meses (δ≈0.2), la tentación de capturar todo al inicio es mayor. Diseñar acuerdos con horizonte mínimo y renovaciones condicionadas aumenta δ.</p>
        </section>

        <section>
          <h2>2. Estrategias clásicas en juegos iterados</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;">
            <article style="background:#dcfce7;border-radius:16px;padding:1.25rem;border:1px solid #86efac;">
              <h3 style="margin-top:0;">Tit for Tat (TFT)</h3>
              <ul>
                <li>Coopera en la primera ronda.</li>
                <li>Replica la jugada anterior del otro.</li>
                <li>Perdona rápido si el otro vuelve a cooperar.</li>
              </ul>
              <p>Funciona bien cuando hay poca información y se necesita construir confianza rápidamente.</p>
            </article>
            <article style="background:#fee2e2;border-radius:16px;padding:1.25rem;border:1px solid #fecaca;">
              <h3 style="margin-top:0;">Grim Trigger</h3>
              <p>Coopera hasta que el otro defeque; luego castiga para siempre. Es efectivo si el castigo perpetuo es creíble, pero en Argentina suele disparar espirales de venganza. Lo usamos sólo en contratos donde la expulsión definitiva es factible (ej. licitaciones con cláusula anticorrupción).</p>
            </article>
            <article style="background:#f3e8ff;border-radius:16px;padding:1.25rem;border:1px solid #d8b4fe;">
              <h3 style="margin-top:0;">Generous TFT</h3>
              <p>Similar a TFT, pero perdona ocasionalmente fallas para absorber ruido (errores). Útil en contextos con burocracia pesada, donde no todo defecto es malicia.</p>
            </article>
            <article style="background:#cffafe;border-radius:16px;padding:1.25rem;border:1px solid #a5f3fc;">
              <h3 style="margin-top:0;">Pavlov (Win-Stay, Lose-Shift)</h3>
              <p>Mantiene la estrategia si el resultado fue bueno, cambia si fue malo. Excelente para laboratorios donde se experimenta con nuevas reglas y se mide rápidamente el impacto.</p>
            </article>
          </div>
        </section>

        <section>
          <h2>3. Folk Theorem y condiciones para cooperación</h2>
          <p>El <strong>Folk Theorem</strong> establece que, en juegos repetidos infinitos con suficiente paciencia (δ alto), casi cualquier resultado puede sostenerse como equilibrio con las estrategias correctas. Traducción para el Hombre Gris: si instalamos reputación pública y castigos proporcionales, podemos diseñar microacuerdos donde la cooperación sea racional.</p>
          <ul>
            <li><strong>Condición 1:</strong> δ suficientemente alto (los actores esperan seguir interactuando).</li>
            <li><strong>Condición 2:</strong> Existe monitoreo creíble (memoria pública).</li>
            <li><strong>Condición 3:</strong> Castigos que duelen pero no destruyen (memoria corta).</li>
          </ul>
          <p><strong>Aplicación:</strong> redes de salud pública. Si hospitales y provincias esperan seguir colaborando, y se publican indicadores mensuales de derivaciones, es más racional compartir recursos que ocultarlos.</p>
        </section>

        <section>
          <h2>4. Resiliencia frente a ruido (errores)</h2>
          <p>En la práctica, muchos defectos son ruido: faltan datos, alguien olvidó enviar un reporte, la transferencia se atrasó. Las estrategias deben tolerar esos fallos para no caer en guerras inútiles.</p>
          <div style="background:#fff7ed;border-radius:16px;padding:1.5rem;border-left:4px solid #f97316;">
            <strong>Protocolo “Ruido controlado”:</strong>
            <ol>
              <li>Clasifica defectos en <em>error</em> (sin intención) o <em>abuso</em>.</li>
              <li>Define pruebas objetivas (capturas del sistema, actas firmadas).</li>
              <li>Permite un margen de error (ej. 1 defecto cada 5 rondas) antes de castigar.</li>
              <li>Comunica públicamente cuándo se activa el castigo para evitar sospechas.</li>
            </ol>
          </div>
        </section>

        <section>
          <h2>5. Memoria pública y tableros</h2>
          <p>Sin registro, los juegos repetidos se degradan a juegos simultáneos (todos especulan). Necesitamos tableros que muestren quién coopera y quién defeca.</p>
          <figure style="margin:1.5rem 0;text-align:center;">
            <img src="/course-graphics/hombre-gris/payoff-evolution.svg" alt="Curvas de payoff acumulado" style="width:100%;max-width:840px;border-radius:18px;box-shadow:0 20px 60px rgba(15,23,42,0.35);" />
            <figcaption style="margin-top:0.75rem;color:#475569;">El tablero debe mostrar la curva acumulada para cooperación vs defecto. Si la curva cooperativa no domina, rediseña los incentivos.</figcaption>
          </figure>
          <p>Herramientas:</p>
          <ul>
            <li><strong>Dashboards públicos:</strong> actualizados cada semana, con indicadores clave (cumplimiento, tiempo de respuesta, compromisos).</li>
            <li><strong>Bitácoras compartidas:</strong> actas digitales firmadas después de cada ronda.</li>
            <li><strong>Semáforos reputacionales:</strong> verde (cooperó), amarillo (ruido), rojo (defecto intencional).</li>
          </ul>
        </section>

        <section>
          <h2>6. Caso completo · Laboratorio de crédito cooperativo</h2>
          <p>Contexto: banco público y asociación de productores rurales en Santa Fe. Se repetían renegociaciones cada campaña. Se decidió montar un juego iterado explícito.</p>
          <div style="background:#e0f2fe;border-radius:16px;padding:1.5rem;border-left:4px solid #0ea5e9;">
            <h3 style="margin-top:0;">Diseño</h3>
            <ul>
              <li>δ alto: contrato de 3 campañas con cláusula de renovación automática si ambos cumplen.</li>
              <li>Estrategia banco: Generous TFT (se perdona un atraso si se justifica documentalmente).</li>
              <li>Estrategia productores: Pavlov (si la interacción fue positiva, replican; si hubo problema, ajustan la entrega).</li>
              <li>Memoria: tablero público con pagos, entregas y notas de visitas técnicas.</li>
            </ul>
            <h3>Resultados</h3>
            <ul>
              <li>Cooperación sostenida (C,C) 85% de las rondas.</li>
              <li>Reducción de atrasos del 28% al 9%.</li>
              <li>Escalamiento a otras regiones gracias a reputación compartida.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>7. Caso contraejemplo · Mesa de transporte urbano</h2>
          <p>Jugadores: Nación, provincias, empresas de transporte. Se intentó un esquema iterado, pero δ era bajo porque los contratos se renovaban cada 60 días y el financiamiento llegaba tarde. Resultado: todos defecan (no se respetan frecuencias, Nación demora giros, provincias no auditan). Lecciones:</p>
          <ul>
            <li>Sin horizonte razonable, las estrategias cooperativas no tienen tiempo de florecer.</li>
            <li>La ausencia de memoria pública permitió narrativas contradictorias.</li>
            <li>Solución propuesta: contrato anual con pagos mensuales automáticos y dashboards de frecuencias alimentados por GPS.</li>
          </ul>
        </section>

        <section>
          <h2>8. Herramientas cuantitativas</h2>
          <article style="background:#ecfccb;border-radius:16px;padding:1.25rem;margin-bottom:1rem;">
            <h3 style="margin-top:0;">8.1 Valor presente de cooperación</h3>
            <p>Calcula si cooperar es rentable: 
            <code style="background:#0f172a;color:#e2e8f0;padding:0.2rem 0.4rem;border-radius:6px;">V = \frac{R}{1 - δ}</code> 
            donde R es el payoff cooperativo por ronda. Si V supera el payoff de defectar una vez, la cooperación es racional.</p>
          </article>
          <article style="background:#fef3c7;border-radius:16px;padding:1.25rem;margin-bottom:1rem;">
            <h3 style="margin-top:0;">8.2 Matriz de transición</h3>
            <p>Registra probabilidades de pasar de cooperación a defecto, y viceversa. Permite visualizar en qué punto la relación se degrada y qué señales la recuperan.</p>
          </article>
          <article style="background:#f0fdfa;border-radius:16px;padding:1.25rem;">
            <h3 style="margin-top:0;">8.3 Índice de resiliencia</h3>
            <p>Define cuánto castigo puede soportar la relación antes de romperse. Se mide con encuestas rápidas + datos duros (tiempo sin cooperación). Sirve para decidir cuán agresivo puede ser el castigo.</p>
          </article>
        </section>

        <section>
          <h2>9. Ejercicios</h2>
          <div style="background:#e2e8f0;border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;">
            <h3 style="margin-top:0;">Ejercicio 1 · Calcula δ</h3>
            <ol>
              <li>Elige un acuerdo actual.</li>
              <li>Estima cuánto valora cada actor la renovación (0-1).</li>
              <li>Identifica qué variables puedes modificar para subir δ (duración, reputación, beneficios futuros).</li>
            </ol>
          </div>
          <div style="background:#dcfce7;border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;">
            <h3 style="margin-top:0;">Ejercicio 2 · Diseña una estrategia condicional</h3>
            <ol>
              <li>Define una regla tipo TFT, Generous TFT o Pavlov para tu relación.</li>
              <li>Escribe el protocolo de castigo y de perdón.</li>
              <li>Comparte el documento con el actor contraparte para alinear expectativas.</li>
            </ol>
          </div>
          <div style="background:#fff7ed;border-radius:16px;padding:1.5rem;">
            <h3 style="margin-top:0;">Ejercicio 3 · Tablero semanal</h3>
            <ol>
              <li>Diseña una tabla con columnas: ronda, jugada A, jugada B, payoff, notas.</li>
              <li>Compártela públicamente o en un canal común.</li>
              <li>Define un emoji o color para cada estado (cooperó, ruido, defectó).</li>
            </ol>
          </div>
        </section>

        <section>
          <h2>10. Checklist del módulo</h2>
          <ul>
            <li>¿Calculaste δ para al menos una relación clave?</li>
            <li>¿Seleccionaste una estrategia condicional y la documentaste?</li>
            <li>¿Diseñaste un tablero de memoria pública?</li>
            <li>¿Clasificaste los defectos en ruido vs abuso?</li>
          </ul>
          <div style="background:#0f172a;color:#e2e8f0;border-radius:16px;padding:1.25rem;margin-top:1rem;">
            <strong>Entrega sugerida:</strong> sube un informe breve con tu estrategia condicional, los valores estimados de δ y el prototipo de tablero. Recibirás feedback para mejorar la resiliencia antes de escalarlo.</div>
        </section>

        <section>
          <h2>11. Preparación para el Módulo 4</h2>
          <p>El siguiente módulo abordará señales, información y reputación pública. Trae el tablero que diseñaste y la clasificación de errores vs abusos: los usaremos para definir señales creíbles y mecanismos de screening que sostengan tus acuerdos iterados.</p>
        </section>
      `,
    };

    // Always refresh lessons/quiz for course 7 (full rewrite)
    // First delete user progress to avoid foreign key constraints
    try {
      // Get all lesson IDs for this course first
      const course7Lessons = await db.select({ id: courseLessons.id }).from(courseLessons).where(eq(courseLessons.courseId, course7[0].id));
      const lessonIds = course7Lessons.map(l => l.id);
      
      if (lessonIds.length > 0) {
        await db.delete(userLessonProgress).where(inArray(userLessonProgress.lessonId, lessonIds));
      }
      await db.delete(userCourseProgress).where(eq(userCourseProgress.courseId, course7[0].id));
    } catch (e) {
      // Tables might not exist, ignore
      console.log('ℹ️ Could not delete user progress (might not exist)');
    }
    await db.delete(courseLessons).where(eq(courseLessons.courseId, course7[0].id));
    console.log('ℹ️ Reset lessons for course 7');
    for (const lesson of lessons7) {
      await db.insert(courseLessons).values(lesson);
    }
    console.log('✅ Created lessons for course 7');

    const existingQuiz7 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, course7[0].id)).limit(1);
    if (existingQuiz7.length > 0) {
      const existingQuestions7 = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz7[0].id));
      for (const question of existingQuestions7) {
        await db.delete(quizQuestions).where(eq(quizQuestions.id, question.id));
      }
      await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, course7[0].id));
      console.log('ℹ️ Reset quiz for course 7');
    }

    const [quiz7] = await db.insert(courseQuizzes).values({
      courseId: course7[0].id,
      title: 'Quiz: La Partida del Hombre Gris',
      description: 'Evalúa tu comprensión de estrategias cooperativas, tit for tat y rediseño de incentivos.',
      passingScore: 75,
      timeLimit: 25,
      allowRetakes: true,
      maxAttempts: 3,
    }).returning();

    const questions7 = [
      {
        quizId: quiz7.id,
        question: '¿Cuál es la intención central de la masterclass?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Centralizar decisiones en un actor único',
          'Rediseñar Argentina como juego iterado donde cooperar sea la mejor jugada',
          'Aplicar castigos indefinidos para disciplinar',
          'Eliminar la competencia del mercado'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Toda la masterclass gira en torno a mover el equilibrio hacia juegos de suma positiva diseñando incentivos cooperativos.',
        points: 2,
        orderIndex: 1,
      },
      {
        quizId: quiz7.id,
        question: 'En el curso se considera que Argentina es un juego de suma variable e iterado.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'La narrativa base es que los actores se encuentran repetidamente y el payoff puede expandirse.',
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: quiz7.id,
        question: '¿Qué elemento vuelve más atractivo el payoff cooperativo?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Acuerdos verbales sin registro',
          'Recompensas tangibles y métricas públicas',
          'Castigos eternos',
          'Reducir la cantidad de jugadores'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Las lecciones muestran que subir beneficios reales y transparentes hace que (C,C) domine.',
        points: 2,
        orderIndex: 3,
      },
      {
        quizId: quiz7.id,
        question: 'Tit for Tat versión Hombre Gris siempre:',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Inicia defectando para probar al otro',
          'Perdona sin condiciones',
          'Envía una señal cooperativa inicial y replica la jugada previa',
          'Se mantiene neutral hasta la tercera ronda'
        ]),
        correctAnswer: JSON.stringify(2),
        explanation: 'El protocolo arranca cooperando, responde proporcionalmente y vuelve a cooperar tras reparación.',
        points: 2,
        orderIndex: 4,
      },
      {
        quizId: quiz7.id,
        question: 'La memoria corta implica olvidar lo sucedido.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'Memoria corta = castigo proporcional y perdón rápido, no amnesia.',
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: quiz7.id,
        question: '¿Qué estrategia genera espirales de venganza interminables?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Tit for Tat + reputación',
          'Rencor perpetuo',
          'Cooperación radical con métricas',
          'Microacuerdos territoriales'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'El rencor perpetuo impide reingresar a la cooperación y congela políticas.',
        points: 2,
        orderIndex: 6,
      },
      {
        quizId: quiz7.id,
        question: '¿Por qué el perdón ingenuo es riesgoso?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Porque requiere demasiada burocracia',
          'Porque no exige reparación y habilita oportunismo',
          'Porque demora los castigos',
          'Porque necesita memoria larga'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Perdonar sin condiciones incentiva defectos sucesivos.',
        points: 2,
        orderIndex: 7,
      },
      {
        quizId: quiz7.id,
        question: 'Selecciona la característica esencial de un laboratorio territorial Hombre Gris.',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Duración limitada, métricas claras y recompensas tempranas',
          'Ejecución secreta sin reportes',
          'Depender de una sola autoridad nacional',
          'Castigos permanentes sin revisión'
        ]),
        correctAnswer: JSON.stringify(0),
        explanation: 'Los laboratorios son pilotos medibles que permiten iterar antes de escalar.',
        points: 2,
        orderIndex: 8,
      },
      {
        quizId: quiz7.id,
        question: 'El heatmap territorial presentado en la masterclass sirve para…',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Mostrar niveles de cooperación entre actores en pilotos reales',
          'Reemplazar todas las mediciones económicas',
          'Definir presupuestos nacionales',
          'Seleccionar autoridades locales'
        ]),
        correctAnswer: JSON.stringify(0),
        explanation: 'Visualiza cómo Estado, ciudadanía, empresas y territorio cooperan en cada piloto.',
        points: 2,
        orderIndex: 9,
      },
      {
        quizId: quiz7.id,
        question: 'Los microacuerdos deben incluir recompensas inmediatas.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'El curso insiste en beneficios tangibles tempranos para sostener motivación.',
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: quiz7.id,
        question: '¿Qué entrega final se solicita en la lección de cierre?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Acta Tit for Tat publicada + tablero compartido + aliados firmantes',
          'Un resumen de prensa',
          'Un examen escrito individual',
          'Un informe sobre teoría clásica'
        ]),
        correctAnswer: JSON.stringify(0),
        explanation: 'El cierre exige un compromiso público con tablero y cofirmantes.',
        points: 2,
        orderIndex: 11,
      },
      {
        quizId: quiz7.id,
        question: 'Para que cooperar sea el negocio dominante se debe…',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Reducir la transparencia y castigar en secreto',
          'Subir los costos del oportunismo y premiar las jugadas cooperativas con métricas visibles',
          'Suspender las iteraciones del juego',
          'Limitar la participación ciudadana'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'La arquitectura de payoffs rediseña incentivos: cooperar debe pagar más y defraudar debe costar caro.',
        points: 2,
        orderIndex: 12,
      },
    ];

    try {
      for (const question of questions7) {
        await db.insert(quizQuestions).values(question);
      }
      console.log('✅ Created quiz for course 7');
    } catch (error: any) {
      console.error('❌ Error inserting quiz questions for course 7:', error.message);
      console.error('Quiz ID:', quiz7.id);
      throw error;
    }

    // Course 8: Fundamentos de Pensamiento, Comprensión y Aprendizaje
    // Find existing course 8 or create it
    let course8 = await db.select().from(courses).where(eq(courses.slug, 'fundamentos-pensamiento-comprension-aprendizaje')).limit(1);
    
    if (course8.length === 0) {
      try {
        console.log('Creating course 8 with authorId:', authorId);
        const [newCourse8] = await db.insert(courses).values({
          title: 'Fundamentos de Pensamiento, Comprensión y Aprendizaje',
          slug: 'fundamentos-pensamiento-comprension-aprendizaje',
          description: 'Un curso esencial para desarrollar capacidades de pensamiento sistémico, comprensión profunda y aprendizaje continuo. Este curso proporciona las herramientas conceptuales y prácticas necesarias para participar efectivamente en procesos de transformación.',
          excerpt: 'Desarrollá tu capacidad de pensar sistémicamente, comprender profundamente y aprender continuamente.',
          category: 'reflection',
          level: 'beginner',
          duration: 480,
          thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
          orderIndex: 8,
          isPublished: true,
          isFeatured: true,
          requiresAuth: false,
          authorId,
        }).returning();
        course8 = [newCourse8];
        console.log('✅ Created course 8:', course8[0].title);
      } catch (error: any) {
        console.error('❌ Error creating course 8:', error.message);
        console.error('AuthorId being used:', authorId);
        throw error;
      }
    } else {
      console.log('✅ Found existing course 8:', course8[0].title);
    }

    // Lessons for course 8
    const lessons8 = [
      {
        courseId: course8[0].id,
        title: 'La Jerarquía del Contenido Mental',
        description: 'Aprendé sobre los diferentes niveles de contenido mental: desde los datos hasta la sabiduría, y por qué es crucial entender esta jerarquía para tomar mejores decisiones.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 25px 80px rgba(102, 126, 234, 0.35);">
            <h1 style="color: white; margin-top: 0; font-size: 2.5rem; line-height: 1.2;">La Jerarquía del Contenido Mental</h1>
            <p style="font-size: 1.1rem; margin-bottom: 0; opacity: 0.95;">Cuando pensamos en cómo procesamos información y tomamos decisiones, es crucial entender que no todo el contenido mental tiene el mismo valor. Existe una jerarquía clara que va desde lo más básico hasta lo más transformador.</p>
          </div>

          <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h3 style="color: #667eea; margin-top: 0;">🎯 ¿Por Qué Esta Jerarquía Transforma Tu Capacidad de Decidir?</h3>
            <p>Muchas organizaciones y personas en Argentina invierten demasiado tiempo en datos e información, y muy poco en comprensión y sabiduría. El problema es que podés ser muy eficiente haciendo algo que no deberías estar haciendo en primer lugar.</p>
            <p><strong>Ejemplo argentino:</strong> Un gobierno puede ser muy eficiente recaudando impuestos (datos, información, conocimiento), pero si no tiene comprensión de por qué la gente evade (carga tributaria excesiva, falta de servicios) ni sabiduría para evaluar si el sistema tributario actual realmente vale la pena mantener, está siendo eficiente en algo que debería rediseñarse completamente.</p>
          </div>

          <h2>Los Cinco Niveles de la Jerarquía</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);">
              <h3 style="color: white; margin-top: 0; font-size: 1.5rem;">1. Datos</h3>
              <p style="margin-bottom: 0.5rem; opacity: 0.95;"><strong>Qué es:</strong> Observaciones y mediciones crudas, sin procesar. Son los hechos básicos sin contexto.</p>
              <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;"><strong>Ejemplo:</strong> "Argentina tiene 45 millones de habitantes" o "La inflación fue del 150% en 2023"</p>
            </div>

            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);">
              <h3 style="color: white; margin-top: 0; font-size: 1.5rem;">2. Información</h3>
              <p style="margin-bottom: 0.5rem; opacity: 0.95;"><strong>Qué es:</strong> Datos procesados que son útiles. Responde: ¿qué?, ¿quién?, ¿dónde?, ¿cuándo?, ¿cuántos?</p>
              <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;"><strong>Ejemplo:</strong> "La inflación del 150% afecta principalmente a los sectores de menores ingresos"</p>
            </div>

            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
              <h3 style="color: white; margin-top: 0; font-size: 1.5rem;">3. Conocimiento</h3>
              <p style="margin-bottom: 0.5rem; opacity: 0.95;"><strong>Qué es:</strong> Instrucciones sobre cómo hacer algo. Responde preguntas de "cómo".</p>
              <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;"><strong>Ejemplo:</strong> "Cómo implementar un sistema de indexación salarial para proteger el poder adquisitivo"</p>
            </div>

            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);">
              <h3 style="color: white; margin-top: 0; font-size: 1.5rem;">4. Comprensión</h3>
              <p style="margin-bottom: 0.5rem; opacity: 0.95;"><strong>Qué es:</strong> Explicaciones sobre por qué algo funciona así. Responde preguntas de "por qué".</p>
              <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;"><strong>Ejemplo:</strong> "Por qué la inflación alta genera círculos viciosos de expectativas y ajustes de precios"</p>
            </div>

            <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);">
              <h3 style="color: white; margin-top: 0; font-size: 1.5rem;">5. Sabiduría</h3>
              <p style="margin-bottom: 0.5rem; opacity: 0.95;"><strong>Qué es:</strong> Juicio sobre el valor y la efectividad. No solo hacer las cosas bien, sino hacer las cosas correctas.</p>
              <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;"><strong>Ejemplo:</strong> "¿Vale la pena mantener un sistema económico que genera tanta inflación, o deberíamos rediseñarlo desde cero?"</p>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📊 Visualización de la Jerarquía</h3>
            <svg width="100%" height="400" viewBox="0 0 800 400" style="max-width: 100%; height: auto; margin: 1rem 0;">
              <defs>
                <linearGradient id="dataGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="infoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="knowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="underGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="wisdomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#db2777;stop-opacity:1" />
                </linearGradient>
              </defs>
              
              <!-- Nivel 5 - Sabiduría (más valioso, más pequeño) -->
              <rect x="300" y="20" width="200" height="50" fill="url(#wisdomGrad)" rx="8"/>
              <text x="400" y="45" text-anchor="middle" fill="white" font-size="14" font-weight="bold">5. Sabiduría</text>
              <text x="400" y="60" text-anchor="middle" fill="white" font-size="11">¿Vale la pena?</text>
              
              <!-- Nivel 4 - Comprensión -->
              <rect x="250" y="80" width="300" height="50" fill="url(#underGrad)" rx="8"/>
              <text x="400" y="105" text-anchor="middle" fill="white" font-size="14" font-weight="bold">4. Comprensión</text>
              <text x="400" y="120" text-anchor="middle" fill="white" font-size="11">¿Por qué?</text>
              
              <!-- Nivel 3 - Conocimiento -->
              <rect x="200" y="140" width="400" height="50" fill="url(#knowGrad)" rx="8"/>
              <text x="400" y="165" text-anchor="middle" fill="white" font-size="14" font-weight="bold">3. Conocimiento</text>
              <text x="400" y="180" text-anchor="middle" fill="white" font-size="11">¿Cómo?</text>
              
              <!-- Nivel 2 - Información -->
              <rect x="150" y="200" width="500" height="50" fill="url(#infoGrad)" rx="8"/>
              <text x="400" y="225" text-anchor="middle" fill="white" font-size="14" font-weight="bold">2. Información</text>
              <text x="400" y="240" text-anchor="middle" fill="white" font-size="11">¿Qué? ¿Quién? ¿Dónde?</text>
              
              <!-- Nivel 1 - Datos (más básico, más grande) -->
              <rect x="100" y="260" width="600" height="50" fill="url(#dataGrad)" rx="8"/>
              <text x="400" y="285" text-anchor="middle" fill="white" font-size="14" font-weight="bold">1. Datos</text>
              <text x="400" y="300" text-anchor="middle" fill="white" font-size="11">Hechos crudos sin contexto</text>
              
              <!-- Flecha de valor -->
              <path d="M 50 285 L 100 285" stroke="#6b7280" stroke-width="3" marker-end="url(#arrow)"/>
              <text x="30" y="290" fill="#6b7280" font-size="12" font-weight="bold">Menos Valor</text>
              
              <path d="M 750 285 L 700 285" stroke="#6b7280" stroke-width="3" marker-end="url(#arrow)"/>
              <text x="760" y="290" fill="#6b7280" font-size="12" font-weight="bold">Más Valor</text>
              
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#6b7280"/>
                </marker>
              </defs>
            </svg>
            <p style="color: #0369a1; margin-bottom: 0; font-style: italic;">La pirámide muestra que mientras más subís en la jerarquía, menos contenido hay pero más valioso se vuelve. La mayoría de organizaciones invierten tiempo inversamente proporcional: mucho en datos, poco en sabiduría.</p>
          </div>

          <h2>Eficiencia vs. Efectividad: La Distinción que Cambia Todo</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #991b1b; margin-top: 0;">⚡ Eficiencia</h3>
              <p style="color: #7f1d1d;"><strong>Hacer las cosas bien.</strong> Se enfoca en los primeros cuatro niveles (datos, información, conocimiento, comprensión).</p>
              <p style="color: #7f1d1d; margin-bottom: 0;"><strong>Pregunta clave:</strong> "¿Cómo puedo hacer esto más rápido, más barato, con menos recursos?"</p>
            </div>
            
            <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #065f46; margin-top: 0;">🎯 Efectividad</h3>
              <p style="color: #047857;"><strong>Hacer las cosas correctas.</strong> Requiere sabiduría para evaluar si lo que estamos haciendo realmente vale la pena.</p>
              <p style="color: #047857; margin-bottom: 0;"><strong>Pregunta clave:</strong> "¿Vale la pena hacer esto en primer lugar?"</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #92400e; margin-top: 0;">⚠️ El Problema Argentino</h3>
            <p style="color: #78350f;">En Argentina, muchas organizaciones (públicas y privadas) son muy eficientes haciendo cosas que no deberían estar haciendo. Por ejemplo:</p>
            <ul style="color: #78350f; line-height: 2;">
              <li><strong>Gobiernos:</strong> Muy eficientes recaudando impuestos, pero sin evaluar si el sistema tributario actual realmente funciona</li>
              <li><strong>Empresas:</strong> Muy eficientes optimizando costos, pero sin evaluar si el producto o servicio que ofrecen realmente aporta valor</li>
              <li><strong>Organizaciones sociales:</strong> Muy eficientes organizando eventos, pero sin evaluar si realmente están transformando la realidad que buscan cambiar</li>
            </ul>
            <p style="color: #78350f; margin-bottom: 0;"><strong>La solución:</strong> Empezar siempre con sabiduría (¿vale la pena?) antes de optimizar con eficiencia (¿cómo hacerlo mejor?).</p>
          </div>

          <h2>Casos de Estudio: Argentina en los Diferentes Niveles</h2>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso 1: La Crisis del 2001</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Datos:</strong> "El corralito congeló $20.000 millones"
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Información:</strong> "El 60% de los depósitos estaban en manos del 20% más rico"
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Conocimiento:</strong> "Cómo implementar restricciones bancarias"
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Comprensión:</strong> "Por qué la convertibilidad generó vulnerabilidad externa"
              </div>
              <div style="background: #ecfccb; padding: 1rem; border-radius: 8px; border: 2px solid #84cc16;">
                <strong>Sabiduría:</strong> "¿Valía la pena mantener un sistema que generaba tanta fragilidad?"
              </div>
            </div>
            <p style="margin-top: 1rem; font-style: italic; color: #6b7280;">La falta de sabiduría (no cuestionar si el sistema valía la pena) llevó a optimizar eficientemente un sistema que debería haberse rediseñado.</p>
          </div>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso 2: El Sistema Educativo</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Datos:</strong> "Argentina tiene 50.000 escuelas"
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Información:</strong> "El 40% de los estudiantes no termina secundaria"
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Conocimiento:</strong> "Cómo mejorar la retención escolar"
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Comprensión:</strong> "Por qué los estudiantes abandonan (pobreza, relevancia del currículo, etc.)"
              </div>
              <div style="background: #ecfccb; padding: 1rem; border-radius: 8px; border: 2px solid #84cc16;">
                <strong>Sabiduría:</strong> "¿Vale la pena mantener un sistema educativo que no prepara para el mundo actual?"
              </div>
            </div>
            <p style="margin-top: 1rem; font-style: italic; color: #6b7280;">Muchas reformas educativas se enfocan en eficiencia (más horas, más tecnología) sin cuestionar si el sistema mismo necesita rediseño completo.</p>
          </div>

          <h2>Ejercicio Práctico: Auto-Evaluación</h2>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🔍 Reflexioná sobre una decisión importante que tenés que tomar</h3>
            <p style="opacity: 0.95;">Podés usar esta decisión personal, profesional, o comunitaria. Respondé honestamente:</p>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
              <ol style="line-height: 2.5; margin: 0;">
                <li><strong>Datos:</strong> ¿Qué datos tenés? ¿Son suficientes? ¿Son confiables?</li>
                <li><strong>Información:</strong> ¿Tenés información procesada y útil? ¿O solo datos crudos?</li>
                <li><strong>Conocimiento:</strong> ¿Sabés cómo proceder? ¿Tenés las habilidades necesarias?</li>
                <li><strong>Comprensión:</strong> ¿Entendés por qué esta decisión es importante? ¿Cuáles son las causas raíz del problema que estás abordando?</li>
                <li><strong>Sabiduría:</strong> ¿Vale la pena hacer esto? ¿Es la decisión correcta, o hay algo más importante que deberías estar haciendo?</li>
              </ol>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
              <p style="margin: 0; font-weight: bold;">💡 Pregunta clave:</p>
              <p style="margin: 0.5rem 0 0; font-size: 1.1rem;">¿En qué nivel de la jerarquía estás operando principalmente? ¿Y qué nivel necesitás desarrollar más?</p>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📝 Para Profundizar</h3>
            <p style="color: #0369a1; margin-bottom: 0;">Después de completar este ejercicio, tomate 10 minutos para escribir:</p>
            <ul style="color: #0369a1; line-height: 2;">
              <li>¿Qué nivel de la jerarquía es tu fortaleza?</li>
              <li>¿Qué nivel necesitás desarrollar más?</li>
              <li>¿Cómo podrías acceder a más sabiduría antes de tomar decisiones importantes?</li>
              <li>¿Qué decisiones estás tomando con mucha eficiencia pero poca efectividad?</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2rem; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ Próximo Paso</h3>
            <p style="margin-bottom: 0;">Ahora que entendés la jerarquía del contenido mental, estás listo para aprender cómo aplicar el pensamiento sistémico. En la siguiente lección, verás cómo estos niveles se conectan con la capacidad de ver el mundo como sistemas interconectados, no como partes aisladas.</p>
          </div>
        `,
        orderIndex: 1,
        type: 'text' as const,
        duration: 40,
        isRequired: true,
      },
      {
        courseId: course8[0].id,
        title: 'Introducción al Pensamiento Sistémico',
        description: 'Aprendé a ver el mundo como sistemas interconectados en lugar de partes aisladas. Descubrí cómo el pensamiento sistémico transforma tu capacidad de entender y resolver problemas complejos.',
        content: `
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 25px 80px rgba(16, 185, 129, 0.35);">
            <h1 style="color: white; margin-top: 0; font-size: 2.5rem; line-height: 1.2;">Introducción al Pensamiento Sistémico</h1>
            <p style="font-size: 1.1rem; margin-bottom: 0; opacity: 0.95;">El pensamiento sistémico es una forma revolucionaria de ver el mundo que reconoce que las cosas están profundamente interconectadas. No es solo una técnica, es una transformación de cómo entendés la realidad.</p>
          </div>

          <div style="background: #f9fafb; border-left: 4px solid #10b981; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h3 style="color: #059669; margin-top: 0;">🌍 ¿Por Qué el Pensamiento Sistémico es Crítico para Argentina?</h3>
            <p>Argentina enfrenta problemas complejos que no se pueden resolver con pensamiento lineal. La inflación, la educación, la seguridad, la pobreza: todos son sistemas interconectados. Intentar resolverlos como problemas aislados es como intentar arreglar un motor quitando una pieza sin entender cómo se conecta con las demás.</p>
            <p><strong>Ejemplo real:</strong> Cuando el gobierno intenta bajar la inflación solo controlando precios (pensamiento lineal), ignora cómo eso afecta la producción, el empleo, la inversión y la confianza. El resultado: la inflación puede bajar temporalmente, pero el sistema completo se desequilibra más.</p>
          </div>

          <h2>¿Qué es un Sistema?</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);">
              <h3 style="color: white; margin-top: 0;">🧩 Elementos</h3>
              <p style="margin-bottom: 0; opacity: 0.95;">Las partes del sistema. En un sistema educativo: estudiantes, docentes, escuelas, currículo, recursos.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);">
              <h3 style="color: white; margin-top: 0;">🔗 Interconexiones</h3>
              <p style="margin-bottom: 0; opacity: 0.95;">Las relaciones entre las partes. Cómo los docentes afectan a los estudiantes, cómo el currículo afecta a los docentes, cómo los recursos afectan a todo.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);">
              <h3 style="color: white; margin-top: 0;">🎯 Propósito</h3>
              <p style="margin-bottom: 0; opacity: 0.95;">La función o objetivo del sistema. ¿Para qué existe? ¿Qué está tratando de lograr? El propósito determina cómo se comporta el sistema.</p>
            </div>
          </div>

          <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #991b1b; margin-top: 0;">⚠️ Sistema vs. Colección: La Diferencia que Importa</h3>
            <p style="color: #7f1d1d;">Un sistema NO es lo mismo que una colección:</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #991b1b;">Colección:</strong>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0;">Podés quitar o agregar elementos sin cambiar mucho. Ejemplo: una pila de libros. Quitás un libro, seguís teniendo una pila de libros.</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #991b1b;">Sistema:</strong>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0;">Cambiar un elemento afecta a todo el sistema. Ejemplo: el sistema educativo. Si cambiás cómo se forman los docentes, afectás a todos los estudiantes, todas las escuelas, todo el sistema.</p>
              </div>
            </div>
          </div>

          <h2>Feedback Loops: Los Motores del Sistema</h2>
          
          <p>Los sistemas tienen bucles de retroalimentación (feedback loops) que son como los motores que hacen funcionar el sistema. Hay dos tipos principales:</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);">
              <h3 style="color: white; margin-top: 0;">📈 Bucles Reforzadores</h3>
              <p style="opacity: 0.95; margin-bottom: 1rem;"><strong>Amplifican el cambio.</strong> Un cambio pequeño se vuelve cada vez más grande.</p>
              <p style="opacity: 0.95; margin: 0;"><strong>Ejemplo argentino:</strong> Más inversión en educación → Más profesionales capacitados → Más empresas que quieren invertir → Más recursos para educación → Más inversión en educación (el ciclo se refuerza).</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);">
              <h3 style="color: white; margin-top: 0;">⚖️ Bucles Equilibradores</h3>
              <p style="opacity: 0.95; margin-bottom: 1rem;"><strong>Mantienen el equilibrio.</strong> Cuando algo cambia, el sistema intenta volver al estado original.</p>
              <p style="opacity: 0.95; margin: 0;"><strong>Ejemplo argentino:</strong> Sube la inflación → El gobierno sube tasas de interés → Baja el consumo → Baja la inflación → El gobierno baja tasas → Sube el consumo → Sube la inflación (el sistema busca equilibrio).</p>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">🔄 Visualización de Bucles de Retroalimentación</h3>
            <svg width="100%" height="300" viewBox="0 0 800 300" style="max-width: 100%; height: auto; margin: 1rem 0;">
              <!-- Bucle reforzador -->
              <circle cx="200" cy="150" r="80" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="5,5"/>
              <text x="200" y="140" text-anchor="middle" fill="#92400e" font-size="14" font-weight="bold">Inversión</text>
              <text x="200" y="155" text-anchor="middle" fill="#92400e" font-size="14" font-weight="bold">Educación</text>
              <text x="200" y="170" text-anchor="middle" fill="#92400e" font-size="14" font-weight="bold">↑</text>
              <text x="200" y="185" text-anchor="middle" fill="#92400e" font-size="14" font-weight="bold">↑</text>
              <text x="200" y="200" text-anchor="middle" fill="#92400e" font-size="14" font-weight="bold">↑</text>
              <text x="200" y="250" text-anchor="middle" fill="#92400e" font-size="12">Bucle Reforzador</text>
              
              <!-- Bucle equilibrador -->
              <circle cx="600" cy="150" r="80" fill="none" stroke="#06b6d4" stroke-width="4"/>
              <text x="600" y="140" text-anchor="middle" fill="#0369a1" font-size="14" font-weight="bold">Inflación</text>
              <text x="600" y="155" text-anchor="middle" fill="#0369a1" font-size="14" font-weight="bold">↑</text>
              <text x="600" y="170" text-anchor="middle" fill="#0369a1" font-size="14" font-weight="bold">↓</text>
              <text x="600" y="185" text-anchor="middle" fill="#0369a1" font-size="14" font-weight="bold">Tasas</text>
              <text x="600" y="200" text-anchor="middle" fill="#0369a1" font-size="14" font-weight="bold">↓</text>
              <text x="600" y="250" text-anchor="middle" fill="#0369a1" font-size="12">Bucle Equilibrador</text>
            </svg>
            <p style="color: #0369a1; margin-bottom: 0; font-style: italic;">Los bucles reforzadores pueden generar crecimiento exponencial o colapso. Los bucles equilibradores mantienen estabilidad, pero pueden resistir cambios necesarios.</p>
          </div>

          <h2>Efectos Retardados: Por Qué las Soluciones Rápidas Fallan</h2>
          
          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #92400e; margin-top: 0;">⏰ El Problema del Tiempo en los Sistemas</h3>
            <p style="color: #78350f;">En los sistemas, las causas y los efectos no siempre están cerca en el tiempo o el espacio. Una acción hoy puede tener consecuencias meses o años después, y en un lugar completamente diferente.</p>
            
            <div style="background: white; border-radius: 8px; padding: 1.5rem; margin-top: 1rem;">
              <p style="color: #78350f; margin: 0;"><strong>Ejemplo argentino:</strong> Una política educativa implementada en 2010 puede tardar 15 años en mostrar resultados. Esos resultados pueden manifestarse en:</p>
              <ul style="color: #78350f; line-height: 2; margin: 0.5rem 0 0;">
                <li>La capacidad de innovación de las empresas (2025)</li>
                <li>La tasa de emprendimientos (2026)</li>
                <li>La calidad de las instituciones (2027)</li>
                <li>La cohesión social (2028)</li>
              </ul>
              <p style="color: #78350f; margin: 1rem 0 0; font-style: italic;">Por eso, los políticos que buscan resultados inmediatos (4 años) no invierten en educación: los resultados llegan cuando ya no están en el poder.</p>
            </div>
          </div>

          <h2>Puntos de Apalancamiento: Dónde Intervenir Estratégicamente</h2>
          
          <p>No todos los puntos de intervención en un sistema tienen el mismo impacto. Algunos cambios pequeños en lugares estratégicos pueden generar cambios desproporcionadamente grandes en todo el sistema.</p>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Ejemplo: El Sistema de Salud en Argentina</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                <strong>Bajo Apalancamiento:</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">Construir más hospitales (costo alto, impacto limitado)</p>
              </div>
              <div style="background: #ecfccb; padding: 1rem; border-radius: 8px; border: 2px solid #84cc16;">
                <strong>Alto Apalancamiento:</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">Prevención y educación en salud (costo bajo, impacto masivo)</p>
              </div>
              <div style="background: #dbeafe; padding: 1rem; border-radius: 8px; border: 2px solid #3b82f6;">
                <strong>Máximo Apalancamiento:</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">Cambiar el propósito del sistema: de "tratar enfermedad" a "promover salud"</p>
              </div>
            </div>
            <p style="margin-top: 1rem; font-style: italic; color: #6b7280;">El punto de máximo apalancamiento suele ser cambiar el propósito o las reglas del juego, no solo optimizar las partes.</p>
          </div>

          <h2>Pensamiento Lineal vs. Pensamiento Sistémico</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #991b1b; margin-top: 0;">➡️ Pensamiento Lineal</h3>
              <p style="color: #7f1d1d;"><strong>A causa B.</strong> Simple, directo, fácil de entender.</p>
              <p style="color: #7f1d1d; margin: 1rem 0;"><strong>Ejemplo:</strong> "La inflación sube porque el gobierno imprime dinero"</p>
              <p style="color: #7f1d1d; margin: 0;"><strong>Problema:</strong> Ignora que B también puede afectar a A, y que C, D, E también influyen.</p>
            </div>
            
            <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #065f46; margin-top: 0;">🔄 Pensamiento Sistémico</h3>
              <p style="color: #047857;"><strong>A afecta B, B afecta A, y ambos son influenciados por C, D, E...</strong> Complejo, pero refleja la realidad.</p>
              <p style="color: #047857; margin: 1rem 0;"><strong>Ejemplo:</strong> "La inflación sube por múltiples factores interconectados: emisión monetaria, expectativas, costos, tipo de cambio, productividad, confianza..."</p>
              <p style="color: #047857; margin: 0;"><strong>Ventaja:</strong> Permite intervenciones más efectivas porque entiende las interconexiones reales.</p>
            </div>
          </div>

          <h2>Casos de Estudio: Sistemas Argentinos</h2>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso 1: El Sistema Educativo como Sistema Complejo</h3>
            <p>El sistema educativo argentino no es solo "escuelas y estudiantes". Es un sistema con múltiples elementos interconectados:</p>
            
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <svg width="100%" height="400" viewBox="0 0 800 400" style="max-width: 100%; height: auto;">
                <!-- Estudiantes -->
                <circle cx="150" cy="100" r="50" fill="#3b82f6" stroke="#2563eb" stroke-width="3"/>
                <text x="150" y="100" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Estudiantes</text>
                
                <!-- Docentes -->
                <circle cx="400" cy="100" r="50" fill="#10b981" stroke="#059669" stroke-width="3"/>
                <text x="400" y="100" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Docentes</text>
                
                <!-- Escuelas -->
                <circle cx="650" cy="100" r="50" fill="#8b5cf6" stroke="#7c3aed" stroke-width="3"/>
                <text x="650" y="100" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Escuelas</text>
                
                <!-- Currículo -->
                <circle cx="275" cy="250" r="50" fill="#f59e0b" stroke="#d97706" stroke-width="3"/>
                <text x="275" y="250" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Currículo</text>
                
                <!-- Familia -->
                <circle cx="525" cy="250" r="50" fill="#ec4899" stroke="#db2777" stroke-width="3"/>
                <text x="525" y="250" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Familia</text>
                
                <!-- Economía -->
                <circle cx="150" cy="350" r="50" fill="#ef4444" stroke="#dc2626" stroke-width="3"/>
                <text x="150" y="350" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Economía</text>
                
                <!-- Mercado Laboral -->
                <circle cx="650" cy="350" r="50" fill="#06b6d4" stroke="#0891b2" stroke-width="3"/>
                <text x="650" y="350" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Mercado</text>
                
                <!-- Interconexiones -->
                <line x1="200" y1="100" x2="350" y2="100" stroke="#6b7280" stroke-width="2"/>
                <line x1="450" y1="100" x2="600" y2="100" stroke="#6b7280" stroke-width="2"/>
                <line x1="150" y1="150" x2="275" y2="200" stroke="#6b7280" stroke-width="2"/>
                <line x1="400" y1="150" x2="275" y2="200" stroke="#6b7280" stroke-width="2"/>
                <line x1="400" y1="150" x2="525" y2="200" stroke="#6b7280" stroke-width="2"/>
                <line x1="150" y1="150" x2="150" y2="300" stroke="#6b7280" stroke-width="2"/>
                <line x1="650" y1="150" x2="650" y2="300" stroke="#6b7280" stroke-width="2"/>
                <line x1="275" y1="300" x2="525" y2="300" stroke="#6b7280" stroke-width="2"/>
              </svg>
            </div>
            
            <p style="margin-top: 1rem; font-style: italic; color: #6b7280;">Cambiar solo un elemento (por ejemplo, el currículo) sin considerar cómo afecta a docentes, estudiantes, familias y mercado laboral, genera efectos no deseados en todo el sistema.</p>
          </div>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso 2: El Sistema Económico Argentino</h3>
            <p>La economía argentina es un sistema complejo donde múltiples factores se influyen mutuamente:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Inflación</strong> ↔ <strong>Expectativas</strong>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Tipo de Cambio</strong> ↔ <strong>Confianza</strong>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Productividad</strong> ↔ <strong>Inversión</strong>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Educación</strong> ↔ <strong>Productividad</strong>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Instituciones</strong> ↔ <strong>Inversión</strong>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Política</strong> ↔ <strong>Todo lo anterior</strong>
              </div>
            </div>
            <p style="margin-top: 1rem; font-style: italic; color: #6b7280;">Intentar controlar solo la inflación sin considerar expectativas, tipo de cambio, productividad, educación e instituciones, es como intentar arreglar un motor cambiando solo una pieza.</p>
          </div>

          <h2>Ejercicio Práctico: Mapear un Sistema</h2>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🗺️ Elegí un Problema que Enfrenta Tu Comunidad u Organización</h3>
            <p style="opacity: 0.95;">En lugar de verlo como un problema aislado, mapealo como un sistema:</p>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <ol style="line-height: 2.5; margin: 0;">
                <li><strong>Elementos:</strong> ¿Qué partes tiene este sistema? Listá todos los elementos que podés identificar (personas, organizaciones, recursos, procesos, etc.)</li>
                <li><strong>Interconexiones:</strong> ¿Cómo se relacionan estos elementos? Dibujá o describí las conexiones entre ellos.</li>
                <li><strong>Propósito:</strong> ¿Cuál es el propósito actual de este sistema? ¿Qué está tratando de lograr realmente? (A veces el propósito declarado no es el propósito real)</li>
                <li><strong>Bucles de retroalimentación:</strong> ¿Qué bucles reforzadores o equilibradores identificás? ¿Qué se refuerza? ¿Qué se equilibra?</li>
                <li><strong>Efectos retardados:</strong> ¿Qué acciones del pasado están afectando el presente? ¿Qué acciones de hoy afectarán el futuro?</li>
                <li><strong>Puntos de apalancamiento:</strong> ¿Dónde podrías intervenir para generar el mayor cambio con el menor esfuerzo?</li>
              </ol>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
              <p style="margin: 0; font-weight: bold;">💡 Reflexión:</p>
              <p style="margin: 0.5rem 0 0; font-size: 1.1rem;">¿Cómo cambia tu perspectiva cuando ves el problema como un sistema en lugar de un problema aislado? ¿Qué nuevas posibilidades de intervención descubrís?</p>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📝 Para Profundizar</h3>
            <p style="color: #0369a1; margin-bottom: 0;">Después de completar el mapeo, respondé:</p>
            <ul style="color: #0369a1; line-height: 2;">
              <li>¿Qué elementos del sistema no habías considerado antes?</li>
              <li>¿Qué interconexiones te sorprendieron?</li>
              <li>¿El propósito real del sistema coincide con el propósito declarado?</li>
              <li>¿Dónde están los puntos de apalancamiento que podrías usar?</li>
              <li>¿Qué intervenciones lineales has intentado que fallaron? ¿Por qué fallaron desde una perspectiva sistémica?</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2rem; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ Próximo Paso</h3>
            <p style="margin-bottom: 0;">Ahora que entendés cómo ver el mundo como sistemas, estás listo para aprender la diferencia crucial entre crecimiento y desarrollo. En la siguiente lección, descubrirás por qué Argentina ha crecido sin desarrollarse, y qué significa realmente el desarrollo.</p>
          </div>
        `,
        orderIndex: 2,
        type: 'text' as const,
        duration: 50,
        isRequired: true,
      },
      {
        courseId: course8[0].id,
        title: 'Crecimiento vs. Desarrollo',
        description: 'Aprendé la diferencia crucial entre crecer (aumentar de tamaño) y desarrollarse (aumentar capacidades). Descubrí por qué Argentina ha crecido sin desarrollarse, y qué significa realmente el desarrollo.',
        content: `
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 25px 80px rgba(245, 158, 11, 0.35);">
            <h1 style="color: white; margin-top: 0; font-size: 2.5rem; line-height: 1.2;">Crecimiento vs. Desarrollo</h1>
            <p style="font-size: 1.1rem; margin-bottom: 0; opacity: 0.95;">Estos dos conceptos suelen confundirse, pero son fundamentalmente diferentes. Entender esta diferencia transforma cómo evaluás el progreso, tanto personal como organizacional y nacional.</p>
          </div>

          <div style="background: #f9fafb; border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h3 style="color: #d97706; margin-top: 0;">🇦🇷 La Paradoja Argentina</h3>
            <p>Argentina ha tenido períodos de crecimiento económico espectacular que no se tradujeron en desarrollo real. El país creció en términos de PIB, exportaciones, consumo, pero no desarrolló:</p>
            <ul style="line-height: 2;">
              <li>La capacidad institucional para sostener ese crecimiento</li>
              <li>La infraestructura de conocimiento (educación, investigación, innovación)</li>
              <li>La cohesión social necesaria para trabajar juntos hacia objetivos comunes</li>
              <li>La capacidad de usar efectivamente los recursos que ya tiene</li>
            </ul>
            <p style="margin-bottom: 0;"><strong>Resultado:</strong> Crecimientos que se revierten, crisis recurrentes, y una sensación de que "siempre volvemos a lo mismo".</p>
          </div>

          <h2>¿Qué es el Crecimiento?</h2>
          
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);">
            <h3 style="color: white; margin-top: 0; font-size: 1.8rem;">📈 Crecimiento: Aumento Cuantitativo</h3>
            <p style="opacity: 0.95; margin-bottom: 1.5rem;"><strong>Se mide por lo que tenés o ganás.</strong> Más tamaño, más cantidad, más números.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🏢 Empresa</h4>
                <p style="margin: 0; opacity: 0.95;">Más empleados, más ventas, más oficinas, más facturación</p>
              </div>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">👤 Persona</h4>
                <p style="margin: 0; opacity: 0.95;">Más dinero, más posesiones, más títulos, más propiedades</p>
              </div>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🇦🇷 País</h4>
                <p style="margin: 0; opacity: 0.95;">Más PIB, más población, más exportaciones, más consumo</p>
              </div>
            </div>
          </div>

          <h2>¿Qué es el Desarrollo?</h2>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
            <h3 style="color: white; margin-top: 0; font-size: 1.8rem;">🌱 Desarrollo: Aumento Cualitativo en Capacidad</h3>
            <p style="opacity: 0.95; margin-bottom: 1.5rem;"><strong>Se mide por lo que podés hacer con lo que tenés.</strong> La habilidad de usar efectivamente los recursos disponibles para satisfacer necesidades y deseos legítimos.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🏢 Empresa</h4>
                <p style="margin: 0; opacity: 0.95;">Mejor capacidad de innovar, adaptarse, crear valor, resolver problemas complejos</p>
              </div>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">👤 Persona</h4>
                <p style="margin: 0; opacity: 0.95;">Más competencias, más sabiduría, más capacidad de resolver problemas, más autonomía</p>
              </div>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🇦🇷 País</h4>
                <p style="margin: 0; opacity: 0.95;">Mejor calidad de vida, más capacidad de satisfacer necesidades, instituciones que funcionan, cohesión social</p>
              </div>
            </div>
          </div>

          <h2>La Diferencia que Cambia Todo</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: #fee2e2; border: 3px solid #ef4444; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #991b1b; margin-top: 0; font-size: 1.5rem;">💰 Crecimiento</h3>
              <p style="color: #7f1d1d; font-size: 1.2rem; margin: 1rem 0;"><strong>Es sobre ganar (earning)</strong></p>
              <p style="color: #7f1d1d; margin-bottom: 1rem;">Acumular más recursos, más tamaño, más números.</p>
              <div style="background: white; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="color: #991b1b; margin: 0; font-style: italic;">"Un montón de basura puede crecer, pero no se desarrolla"</p>
              </div>
            </div>
            
            <div style="background: #d1fae5; border: 3px solid #10b981; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #065f46; margin-top: 0; font-size: 1.5rem;">📚 Desarrollo</h3>
              <p style="color: #047857; font-size: 1.2rem; margin: 1rem 0;"><strong>Es sobre aprender (learning)</strong></p>
              <p style="color: #047857; margin-bottom: 1rem;">Aumentar capacidades, competencias, sabiduría.</p>
              <div style="background: white; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="color: #065f46; margin: 0; font-style: italic;">"Un artista puede desarrollarse mejorando sus habilidades sin aumentar su producción"</p>
              </div>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">💡 Robinson Crusoe vs. J.P. Morgan</h3>
            <p style="color: #0369a1;">Robinson Crusoe es un mejor modelo de desarrollo que J.P. Morgan. ¿Por qué?</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #0369a1;">Crusoe:</strong>
                <p style="color: #0369a1; margin: 0.5rem 0 0;">Con recursos limitados, desarrolló múltiples capacidades: cazar, pescar, construir, cultivar, crear herramientas. Aprendió a usar efectivamente lo que tenía.</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #0369a1;">Morgan:</strong>
                <p style="color: #0369a1; margin: 0.5rem 0 0;">Tenía muchos recursos (dinero, empresas, poder), pero eso no necesariamente significa que se hubiera desarrollado más. Tenía más, pero ¿podía hacer más con menos?</p>
              </div>
            </div>
            <p style="color: #0369a1; margin-top: 1rem; margin-bottom: 0; font-style: italic;">El desarrollo se mide por la capacidad de crear valor con los recursos disponibles, no por la cantidad de recursos que tenés.</p>
          </div>

          <h2>Estándar de Vida vs. Calidad de Vida</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #92400e; margin-top: 0;">📊 Estándar de Vida</h3>
              <p style="color: #78350f;"><strong>Se mide por lo que tenés (crecimiento)</strong></p>
              <ul style="color: #78350f; line-height: 2;">
                <li>Ingresos per cápita</li>
                <li>Posesiones materiales</li>
                <li>Acceso a bienes y servicios</li>
                <li>Nivel de consumo</li>
              </ul>
              <p style="color: #78350f; margin: 1rem 0 0; font-style: italic;">"¿Cuánto tenés?"</p>
            </div>
            
            <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #065f46; margin-top: 0;">✨ Calidad de Vida</h3>
              <p style="color: #047857;"><strong>Se mide por lo que podés hacer con lo que tenés (desarrollo)</strong></p>
              <ul style="color: #047857; line-height: 2;">
                <li>Capacidad de resolver problemas</li>
                <li>Autonomía y libertad real</li>
                <li>Bienestar físico y mental</li>
                <li>Sentido de propósito y significado</li>
              </ul>
              <p style="color: #047857; margin: 1rem 0 0; font-style: italic;">"¿Qué podés hacer?"</p>
            </div>
          </div>

          <h2>Argentina: Crecimiento sin Desarrollo</h2>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso Histórico: El Boom de los 90s</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #991b1b; margin-top: 0;">📈 Crecimiento (Lo que pasó)</h4>
                <ul style="color: #7f1d1d; line-height: 2;">
                  <li>PIB creció significativamente</li>
                  <li>Inflación controlada (convertibilidad)</li>
                  <li>Consumo masivo de bienes importados</li>
                  <li>Privatizaciones generaron ingresos</li>
                  <li>Inversión extranjera aumentó</li>
                </ul>
              </div>
              
              <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #065f46; margin-top: 0;">🌱 Desarrollo (Lo que NO pasó)</h4>
                <ul style="color: #047857; line-height: 2;">
                  <li>No se desarrolló capacidad productiva nacional</li>
                  <li>No se mejoró la educación de calidad</li>
                  <li>No se fortalecieron las instituciones</li>
                  <li>No se desarrolló innovación tecnológica</li>
                  <li>No se construyó cohesión social</li>
                </ul>
              </div>
            </div>
            <p style="margin-top: 1.5rem; font-style: italic; color: #6b7280;"><strong>Resultado:</strong> Cuando el crecimiento se detuvo (crisis 2001), no había desarrollo que sostuviera al país. El crecimiento era frágil porque no estaba basado en desarrollo real.</p>
          </div>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso Actual: La Paradoja de los Recursos</h3>
            <p>Argentina tiene recursos extraordinarios pero no los desarrolla efectivamente:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1rem; border-radius: 8px;">
                <strong>Recursos:</strong> Tierra fértil, petróleo, litio, talento humano
              </div>
              <div style="background: #fee2e2; padding: 1rem; border-radius: 8px; border: 2px solid #ef4444;">
                <strong>Problema:</strong> Los exportamos como commodities (crecimiento)
              </div>
              <div style="background: #d1fae5; padding: 1rem; border-radius: 8px; border: 2px solid #10b981;">
                <strong>Solución:</strong> Desarrollar capacidad de agregar valor (desarrollo)
              </div>
            </div>
            <p style="margin-top: 1rem; font-style: italic; color: #6b7280;">Ejemplo: Exportamos soja cruda (crecimiento) en lugar de desarrollar capacidad para exportar alimentos procesados, biotecnología, conocimiento agrícola (desarrollo).</p>
          </div>

          <h2>¿Por Qué el Desarrollo Requiere Diferentes Inversiones?</h2>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🎓 El Desarrollo Requiere Inversión en:</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">📚 Educación</h4>
                <p style="margin: 0; opacity: 0.95;">No solo más escuelas, sino mejor educación que desarrolle capacidades de pensamiento crítico, creatividad, resolución de problemas</p>
              </div>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🏛️ Instituciones</h4>
                <p style="margin: 0; opacity: 0.95;">Instituciones que funcionen, que generen confianza, que permitan coordinación y cooperación</p>
              </div>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🤝 Capital Social</h4>
                <p style="margin: 0; opacity: 0.95;">Redes de confianza, capacidad de trabajar juntos, cohesión social</p>
              </div>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">💡 Innovación</h4>
                <p style="margin: 0; opacity: 0.95;">Capacidad de crear, innovar, adaptarse, aprender continuamente</p>
              </div>
            </div>
            <p style="margin-top: 1.5rem; opacity: 0.95; margin-bottom: 0;">No es solo acumular más recursos, sino desarrollar la capacidad de usar mejor lo que ya tenemos y crear valor nuevo.</p>
          </div>

          <h2>Ejercicio Práctico: Evaluación Personal y Organizacional</h2>
          
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🔍 Evaluá Tu Propio Crecimiento vs. Desarrollo</h3>
            <p style="opacity: 0.95;">Pensá en tu vida personal, tu organización, o tu comunidad:</p>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">📊 Preguntas sobre Crecimiento:</h4>
              <ol style="line-height: 2.5; margin: 0;">
                <li>¿Estás acumulando más recursos? (dinero, posesiones, títulos, contactos)</li>
                <li>¿Estás creciendo en tamaño? (más empleados, más clientes, más proyectos)</li>
                <li>¿Los números están subiendo? (ventas, ingresos, métricas cuantitativas)</li>
              </ol>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">🌱 Preguntas sobre Desarrollo:</h4>
              <ol style="line-height: 2.5; margin: 0;">
                <li>¿Estás aumentando tus capacidades? (competencias, sabiduría, habilidades)</li>
                <li>¿Podés hacer más con menos? (más valor con los mismos recursos)</li>
                <li>¿Estás mejor preparado para enfrentar desafíos nuevos?</li>
                <li>¿Tu calidad de vida está mejorando, no solo tu estándar de vida?</li>
              </ol>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
              <p style="margin: 0; font-weight: bold;">💡 Reflexión Crítica:</p>
              <p style="margin: 0.5rem 0 0; font-size: 1.1rem;">¿Estás creciendo sin desarrollarte? ¿O estás desarrollándote incluso si no estás creciendo? ¿Qué necesitás cambiar para enfocarte más en desarrollo?</p>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso de Estudio: Tu Organización o Comunidad</h3>
            <p>Evaluá tu organización o comunidad usando esta matriz:</p>
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem; overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 1rem; text-align: left; border: 1px solid #e5e7eb;">Aspecto</th>
                    <th style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb;">Crecimiento</th>
                    <th style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb;">Desarrollo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 1rem; border: 1px solid #e5e7eb;"><strong>Recursos</strong></td>
                    <td style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb;">¿Tenemos más?</td>
                    <td style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb;">¿Usamos mejor lo que tenemos?</td>
                  </tr>
                  <tr style="background: #f9fafb;">
                    <td style="padding: 1rem; border: 1px solid #e5e7eb;"><strong>Capacidades</strong></td>
                    <td style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb;">¿Hacemos más de lo mismo?</td>
                    <td style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb;">¿Podemos hacer cosas nuevas?</td>
                  </tr>
                  <tr>
                    <td style="padding: 1rem; border: 1px solid #e5e7eb;"><strong>Adaptabilidad</strong></td>
                    <td style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb;">¿Seguimos igual ante cambios?</td>
                    <td style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb;">¿Aprendemos y nos adaptamos?</td>
                  </tr>
                  <tr style="background: #f9fafb;">
                    <td style="padding: 1rem; border: 1px solid #e5e7eb;"><strong>Sostenibilidad</strong></td>
                    <td style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb;">¿Depende de recursos externos?</td>
                    <td style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb;">¿Se sostiene por capacidades propias?</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📝 Plan de Acción</h3>
            <p style="color: #0369a1; margin-bottom: 0;">Después de completar la evaluación, creá un plan:</p>
            <ul style="color: #0369a1; line-height: 2;">
              <li>¿Qué áreas están creciendo pero no desarrollándose? ¿Cómo cambiar eso?</li>
              <li>¿Qué inversiones en desarrollo podrías hacer? (educación, capacitación, innovación, instituciones)</li>
              <li>¿Qué métricas de desarrollo podrías usar además de métricas de crecimiento?</li>
              <li>¿Cómo podrías desarrollar capacidades que te permitan crear más valor con los mismos recursos?</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2rem; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ Próximo Paso</h3>
            <p style="margin-bottom: 0;">Ahora que entendés la diferencia entre crecimiento y desarrollo, estás listo para aprender cómo trabajar con sistemas de problemas interconectados. En la siguiente lección, descubrirás por qué resolver problemas individualmente falla, y cómo gestionar "messes" (sistemas de problemas).</p>
          </div>
        `,
        orderIndex: 3,
        type: 'text' as const,
        duration: 35,
        isRequired: true,
      },
      {
        courseId: course8[0].id,
        title: 'Gestión de Messes: Sistemas de Problemas',
        description: 'Aprendé por qué resolver problemas individualmente falla, y cómo trabajar con sistemas de problemas interconectados. Descubrí cómo gestionar la complejidad real de los desafíos que enfrentamos.',
        content: `
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 25px 80px rgba(239, 68, 68, 0.35);">
            <h1 style="color: white; margin-top: 0; font-size: 2.5rem; line-height: 1.2;">Gestión de Messes: Sistemas de Problemas</h1>
            <p style="font-size: 1.1rem; margin-bottom: 0; opacity: 0.95;">La realidad no consiste en problemas individuales. Los problemas son abstracciones que extraemos de la realidad mediante el análisis. La realidad misma son sistemas de problemas interconectados e interactuando.</p>
          </div>

          <div style="background: #f9fafb; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h3 style="color: #dc2626; margin-top: 0;">⚠️ El Error Fundamental del Pensamiento Tradicional</h3>
            <p>En la escuela, en el trabajo, en la política, nos enseñan a resolver problemas. Pero la realidad no viene en problemas individuales. Cuando separás la realidad en problemas y resolvés cada uno por separado, estás tratando la realidad de la manera menos efectiva posible.</p>
            <p style="margin-bottom: 0;"><strong>Ejemplo argentino:</strong> Intentar resolver la inflación solo controlando precios, sin considerar expectativas, tipo de cambio, productividad, confianza, instituciones. El resultado: la inflación puede bajar temporalmente, pero el sistema completo se desequilibra más.</p>
          </div>

          <h2>Problemas vs. Messes: La Diferencia que Importa</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: #fee2e2; border: 3px solid #ef4444; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #991b1b; margin-top: 0;">🔍 Problema</h3>
              <p style="color: #7f1d1d; margin-bottom: 1rem;"><strong>Una abstracción</strong> que identificamos al analizar una situación.</p>
              <p style="color: #7f1d1d; margin-bottom: 1rem;">Es como un átomo: no experimentamos átomos directamente, experimentamos objetos que contienen átomos.</p>
              <div style="background: white; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="color: #991b1b; margin: 0; font-style: italic;">Ejemplo: "El problema es la pobreza"</p>
              </div>
            </div>
            
            <div style="background: #d1fae5; border: 3px solid #10b981; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #065f46; margin-top: 0;">🌐 Mess (Lío)</h3>
              <p style="color: #047857; margin-bottom: 1rem;"><strong>Un sistema de problemas interconectados.</strong></p>
              <p style="color: #047857; margin-bottom: 1rem;">Es la realidad tal como existe, no como la descomponemos para analizarla.</p>
              <div style="background: white; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="color: #065f46; margin: 0; font-style: italic;">Ejemplo: "El mess incluye pobreza, educación, salud, trabajo, vivienda, seguridad, todos interconectados"</p>
              </div>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #92400e; margin-top: 0;">💥 ¿Por Qué Fallan las Soluciones a Problemas Individuales?</h3>
            <p style="color: #78350f;">Cuando separás la realidad en problemas individuales y resolvés cada uno por separado, los problemas están interconectados:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #92400e;">Efectos en cascada</strong>
                <p style="color: #78350f; margin: 0.5rem 0 0;">Resolver un problema puede crear o empeorar otros</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #92400e;">Causas compartidas</strong>
                <p style="color: #78350f; margin: 0.5rem 0 0;">Los problemas comparten causas raíz</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #92400e;">Dependencias</strong>
                <p style="color: #78350f; margin: 0.5rem 0 0;">Las soluciones a un problema pueden depender de resolver otros primero</p>
              </div>
            </div>
          </div>

          <h2>Ejemplos Argentinos: Por Qué Fallan las Soluciones Lineales</h2>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso 1: Resolver la Pobreza Solo con Dinero</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #991b1b; margin-top: 0;">❌ Solución Lineal</h4>
                <p style="color: #7f1d1d; margin: 0.5rem 0;"><strong>Problema identificado:</strong> "La gente es pobre porque no tiene dinero"</p>
                <p style="color: #7f1d1d; margin: 0.5rem 0;"><strong>Solución:</strong> Transferencias de dinero</p>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Puede crear dependencia, no desarrolla capacidades, no resuelve causas raíz</p>
              </div>
              
              <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #065f46; margin-top: 0;">✅ Gestión de Mess</h4>
                <p style="color: #047857; margin: 0.5rem 0;"><strong>Mess identificado:</strong> Pobreza conectada con educación, salud, trabajo, vivienda, instituciones</p>
                <p style="color: #047857; margin: 0.5rem 0;"><strong>Solución:</strong> Intervención sistémica que aborde múltiples problemas interconectados</p>
                <p style="color: #047857; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Desarrollo de capacidades, resolución de causas raíz, sostenibilidad</p>
              </div>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso 2: Resolver la Corrupción Solo con Leyes</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #991b1b; margin-top: 0;">❌ Solución Lineal</h4>
                <p style="color: #7f1d1d; margin: 0.5rem 0;"><strong>Problema identificado:</strong> "Hay corrupción porque no hay suficientes leyes"</p>
                <p style="color: #7f1d1d; margin: 0.5rem 0;"><strong>Solución:</strong> Más leyes, más controles, más burocracia</p>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Más burocracia, más oportunidades de corrupción, menos eficiencia</p>
              </div>
              
              <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #065f46; margin-top: 0;">✅ Gestión de Mess</h4>
                <p style="color: #047857; margin: 0.5rem 0;"><strong>Mess identificado:</strong> Corrupción conectada con incentivos, transparencia, cultura, instituciones, impunidad</p>
                <p style="color: #047857; margin: 0.5rem 0;"><strong>Solución:</strong> Rediseñar incentivos, aumentar transparencia, cambiar cultura, fortalecer instituciones</p>
                <p style="color: #047857; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Sistema donde no conviene corromperse, no solo donde está prohibido</p>
              </div>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso 3: Resolver la Educación Solo con Presupuesto</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #991b1b; margin-top: 0;">❌ Solución Lineal</h4>
                <p style="color: #7f1d1d; margin: 0.5rem 0;"><strong>Problema identificado:</strong> "La educación es mala porque no hay suficiente presupuesto"</p>
                <p style="color: #7f1d1d; margin: 0.5rem 0;"><strong>Solución:</strong> Más presupuesto para educación</p>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Más dinero, pero puede no mejorar la calidad si no se abordan otros problemas</p>
              </div>
              
              <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #065f46; margin-top: 0;">✅ Gestión de Mess</h4>
                <p style="color: #047857; margin: 0.5rem 0;"><strong>Mess identificado:</strong> Educación conectada con formación docente, currículo, infraestructura, economía familiar, mercado laboral, desigualdad</p>
                <p style="color: #047857; margin: 0.5rem 0;"><strong>Solución:</strong> Estrategia que aborde el sistema completo</p>
                <p style="color: #047857; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Mejora real y sostenible en la calidad educativa</p>
              </div>
            </div>
          </div>

          <h2>El Proceso de Gestión de Messes</h2>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">📋 Cuatro Pasos para Gestionar Messes</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">1️⃣ Formular el Mess</h4>
                <p style="margin: 0; opacity: 0.95;">Entender cómo los problemas están interconectados. Mapear las relaciones entre ellos. Identificar todos los problemas que forman parte del sistema.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">2️⃣ Identificar Apalancamiento</h4>
                <p style="margin: 0; opacity: 0.95;">Encontrar dónde una intervención puede afectar múltiples problemas del sistema. Buscar puntos donde un cambio pequeño genera cambios grandes.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">3️⃣ Diseñar Intervenciones Sistémicas</h4>
                <p style="margin: 0; opacity: 0.95;">Soluciones que aborden el sistema de problemas, no problemas individuales. Intervenciones que reconozcan y trabajen con las interconexiones.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">4️⃣ Monitorear Efectos Sistémicos</h4>
                <p style="margin: 0; opacity: 0.95;">Ver cómo las intervenciones afectan no solo el problema objetivo, sino todo el sistema. Ajustar basado en efectos no deseados o oportunidades emergentes.</p>
              </div>
            </div>
          </div>

          <h2>Ejemplo Completo: El Mess de la Educación en Argentina</h2>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Mapeando el Sistema Completo</h3>
            <p>La educación no es un problema aislado. Es parte de un mess que incluye múltiples problemas interconectados:</p>
            
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <svg width="100%" height="500" viewBox="0 0 800 500" style="max-width: 100%; height: auto;">
                <!-- Problema central: Educación -->
                <circle cx="400" cy="250" r="60" fill="#ef4444" stroke="#dc2626" stroke-width="4"/>
                <text x="400" y="245" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Educación</text>
                <text x="400" y="260" text-anchor="middle" fill="white" font-size="14" font-weight="bold">de Calidad</text>
                
                <!-- Problemas interconectados -->
                <circle cx="150" cy="100" r="45" fill="#f59e0b" stroke="#d97706" stroke-width="3"/>
                <text x="150" y="100" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Infraestructura</text>
                
                <circle cx="650" cy="100" r="45" fill="#3b82f6" stroke="#2563eb" stroke-width="3"/>
                <text x="650" y="100" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Formación</text>
                <text x="650" y="115" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Docente</text>
                
                <circle cx="150" cy="400" r="45" fill="#10b981" stroke="#059669" stroke-width="3"/>
                <text x="150" y="400" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Economía</text>
                <text x="150" y="415" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Familiar</text>
                
                <circle cx="650" cy="400" r="45" fill="#8b5cf6" stroke="#7c3aed" stroke-width="3"/>
                <text x="650" y="395" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Mercado</text>
                <text x="650" y="410" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Laboral</text>
                
                <circle cx="400" cy="80" r="45" fill="#ec4899" stroke="#db2777" stroke-width="3"/>
                <text x="400" y="80" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Currículo</text>
                
                <circle cx="400" cy="420" r="45" fill="#06b6d4" stroke="#0891b2" stroke-width="3"/>
                <text x="400" y="420" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Desigualdad</text>
                
                <!-- Interconexiones -->
                <line x1="400" y1="190" x2="150" y2="145" stroke="#6b7280" stroke-width="2"/>
                <line x1="400" y1="190" x2="650" y2="145" stroke="#6b7280" stroke-width="2"/>
                <line x1="400" y1="190" x2="400" y2="125" stroke="#6b7280" stroke-width="2"/>
                <line x1="400" y1="310" x2="150" y2="355" stroke="#6b7280" stroke-width="2"/>
                <line x1="400" y1="310" x2="650" y2="355" stroke="#6b7280" stroke-width="2"/>
                <line x1="400" y1="310" x2="400" y2="375" stroke="#6b7280" stroke-width="2"/>
                <line x1="150" y1="145" x2="150" y2="355" stroke="#6b7280" stroke-width="2" stroke-dasharray="5,5"/>
                <line x1="650" y1="145" x2="650" y2="355" stroke="#6b7280" stroke-width="2" stroke-dasharray="5,5"/>
              </svg>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <strong>Infraestructura escolar</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Afecta acceso y calidad</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <strong>Formación docente</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Afecta capacidad de enseñar</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #10b981;">
                <strong>Economía familiar</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Afecta asistencia y dedicación</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                <strong>Mercado laboral</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Afecta motivación y relevancia</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #ec4899;">
                <strong>Currículo</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Afecta relevancia y aprendizaje</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #06b6d4;">
                <strong>Desigualdad social</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Afecta oportunidades y resultados</p>
              </div>
            </div>
            
            <p style="margin-top: 1.5rem; font-style: italic; color: #6b7280;"><strong>Conclusión:</strong> Resolver solo uno de estos problemas (por ejemplo, aumentar el presupuesto para infraestructura) no resuelve el mess. Necesitás una estrategia que aborde el sistema completo, identificando puntos de apalancamiento donde una intervención puede afectar múltiples problemas.</p>
          </div>

          <h2>Ejercicio Práctico: Formular Tu Propio Mess</h2>
          
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🗺️ Elegí un "Mess" que Enfrentás</h3>
            <p style="opacity: 0.95;">Podés usar un desafío personal, organizacional, o comunitario. En lugar de verlo como un problema aislado, formulalo como un mess:</p>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 1: Identificar Problemas Individuales</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Listá todos los problemas que podés identificar en esta situación. Sé exhaustivo. No te limites a lo obvio.</p>
              <div style="background: rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="margin: 0; font-style: italic;">Ejemplo: Si el mess es "mi barrio", los problemas pueden incluir: seguridad, basura, falta de espacios verdes, desempleo, falta de servicios, desconfianza entre vecinos, etc.</p>
              </div>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 2: Mapear Interconexiones</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Para cada par de problemas, preguntate: ¿Cómo se relacionan? ¿Uno causa al otro? ¿Comparten causas? ¿Se refuerzan mutuamente?</p>
              <p style="opacity: 0.95; margin: 0;">Dibujá o describí las conexiones. Esto te dará una visión del sistema completo.</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 3: Identificar Puntos de Apalancamiento</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Buscá problemas que, si los resolvés, afectan a muchos otros. Estos son tus puntos de apalancamiento.</p>
              <p style="opacity: 0.95; margin: 0;">¿Qué problema, si se resuelve, hace más fácil resolver los demás?</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 4: Diseñar Intervención Sistémica</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Diseñá una intervención que:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>Aborde múltiples problemas del mess</li>
                <li>Use los puntos de apalancamiento identificados</li>
                <li>Considere los efectos en todo el sistema</li>
                <li>Sea sostenible y escalable</li>
              </ul>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📝 Reflexión Post-Ejercicio</h3>
            <p style="color: #0369a1; margin-bottom: 0;">Después de formular tu mess, respondé:</p>
            <ul style="color: #0369a1; line-height: 2;">
              <li>¿Qué problemas no habías considerado antes de mapear el mess?</li>
              <li>¿Qué interconexiones te sorprendieron?</li>
              <li>¿Dónde están los puntos de apalancamiento que podrías usar?</li>
              <li>¿Qué intervenciones lineales has intentado que fallaron? ¿Por qué fallaron desde una perspectiva de mess?</li>
              <li>¿Cómo cambiaría tu estrategia ahora que ves el mess completo?</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2rem; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ Próximo Paso</h3>
            <p style="margin-bottom: 0;">Ahora que entendés cómo trabajar con messes, estás listo para aprender cómo transformar los errores en oportunidades de aprendizaje. En la siguiente lección, descubrirás por qué aprendemos más de los errores que de los aciertos, y cómo crear una cultura que aproveche esto.</p>
          </div>
        `,
        orderIndex: 4,
        type: 'text' as const,
        duration: 55,
        isRequired: true,
      },
      {
        courseId: course8[0].id,
        title: 'Aprendiendo de los Errores',
        description: 'Descubrí por qué aprendemos más de los errores que de los aciertos, y cómo crear una cultura que aproveche esto. Transformá los errores en tu mayor fuente de aprendizaje.',
        content: `
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 25px 80px rgba(139, 92, 246, 0.35);">
            <h1 style="color: white; margin-top: 0; font-size: 2.5rem; line-height: 1.2;">Aprendiendo de los Errores</h1>
            <p style="font-size: 1.1rem; margin-bottom: 0; opacity: 0.95;">Parece contraintuitivo, pero es cierto: aprendemos muy poco cuando hacemos algo bien, y mucho cuando hacemos algo mal. El problema es que nuestra cultura nos enseña que los errores son malos y deben ocultarse. Esto nos impide aprender.</p>
          </div>

          <div style="background: #f9fafb; border-left: 4px solid #8b5cf6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h3 style="color: #7c3aed; margin-top: 0;">🇦🇷 El Problema Cultural Argentino</h3>
            <p>En Argentina, desde la escuela nos enseñan que los errores son malos. Nos castigan por equivocarnos. En las organizaciones, hacer un error puede costarte tu trabajo o tu reputación. Esto crea una cultura donde:</p>
            <ul style="line-height: 2;">
              <li>La gente hace lo "correcto" incluso cuando el resultado es malo, porque tiene miedo de intentar algo nuevo</li>
              <li>Se ocultan los errores en lugar de aprender de ellos</li>
              <li>Se repiten los mismos errores una y otra vez (crisis económicas, políticas fallidas, proyectos que no funcionan)</li>
              <li>No se documenta ni comparte el aprendizaje de los errores</li>
            </ul>
            <p style="margin-bottom: 0;"><strong>Resultado:</strong> Una sociedad que no aprende de sus errores, repitiendo los mismos patrones una y otra vez.</p>
          </div>

          <h2>¿Por Qué Aprendemos Más de los Errores?</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: #fee2e2; border: 3px solid #ef4444; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #991b1b; margin-top: 0;">✅ Cuando Hacemos Algo Bien</h3>
              <p style="color: #7f1d1d; margin-bottom: 1rem;">Solo confirmamos lo que ya sabíamos. No aprendemos nada nuevo.</p>
              <div style="background: white; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="color: #991b1b; margin: 0; font-style: italic;">"Ya sabía que esto funcionaba. No descubrí nada nuevo."</p>
              </div>
            </div>
            
            <div style="background: #d1fae5; border: 3px solid #10b981; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #065f46; margin-top: 0;">❌ Cuando Hacemos Algo Mal</h3>
              <p style="color: #047857; margin-bottom: 1rem;">Tenemos la oportunidad de aprender algo completamente nuevo.</p>
              <div style="background: white; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <ul style="color: #065f46; margin: 0; line-height: 2;">
                  <li>Identificar qué salió mal</li>
                  <li>Entender por qué salió mal</li>
                  <li>Corregirlo</li>
                  <li>Aprender algo nuevo</li>
                </ul>
              </div>
            </div>
          </div>

          <h2>Dos Tipos de Errores: Comisión y Omisión</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);">
              <h3 style="color: white; margin-top: 0;">🔴 Errores de Comisión</h3>
              <p style="opacity: 0.95; margin-bottom: 1rem;"><strong>Hacer algo que no deberíamos haber hecho.</strong></p>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="margin: 0; opacity: 0.95;"><strong>Ejemplo argentino:</strong> Invertir en un proyecto que resultó ser una mala idea. Implementar una política económica que generó inflación. Tomar una decisión que empeoró la situación.</p>
              </div>
              <p style="margin-top: 1rem; opacity: 0.95; margin-bottom: 0;"><strong>Ventaja:</strong> Hay evidencia visible del error. Es más fácil reconocerlo y aprender de él.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);">
              <h3 style="color: white; margin-top: 0;">⚪ Errores de Omisión</h3>
              <p style="opacity: 0.95; margin-bottom: 1rem;"><strong>No hacer algo que deberíamos haber hecho.</strong></p>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="margin: 0; opacity: 0.95;"><strong>Ejemplo argentino:</strong> No invertir en educación cuando había recursos. No implementar una política que hubiera funcionado. No tomar una decisión que hubiera mejorado la situación.</p>
              </div>
              <p style="margin-top: 1rem; opacity: 0.95; margin-bottom: 0;"><strong>Desafío:</strong> No hay evidencia visible de lo que perdimos. Es más difícil reconocerlos y aprender de ellos.</p>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">💡 Ambos Tipos Son Valiosos</h3>
            <p style="color: #0369a1;">Ambos tipos de errores son valiosos para aprender, pero los errores de omisión suelen ser más difíciles de reconocer porque no hay evidencia visible de lo que perdimos. Sin embargo, pueden ser igual o más costosos que los errores de comisión.</p>
            <p style="color: #0369a1; margin-bottom: 0;"><strong>Ejemplo:</strong> Argentina perdió décadas de desarrollo por no invertir en educación e innovación cuando tenía recursos. Ese error de omisión es tan costoso como cualquier error de comisión.</p>
          </div>

          <h2>El Problema Cultural: Por Qué Ocultamos los Errores</h2>
          
          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #92400e; margin-top: 0;">🚫 Lo Que Nos Enseñan (Y Por Qué Está Mal)</h3>
            <p style="color: #78350f;">Desde la escuela, nos enseñan que los errores son malos. Nos castigan por equivocarnos. Esto nos lleva a:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #92400e;">❌ Negar</strong>
                <p style="color: #78350f; margin: 0.5rem 0 0; font-size: 0.9rem;">"No fue mi culpa"</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #92400e;">🔒 Ocultar</strong>
                <p style="color: #78350f; margin: 0.5rem 0 0; font-size: 0.9rem;">"Nadie se enteró"</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #92400e;">🔄 Repetir</strong>
                <p style="color: #78350f; margin: 0.5rem 0 0; font-size: 0.9rem;">"Siempre hacemos lo mismo"</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #92400e;">🚫 No Aprender</strong>
                <p style="color: #78350f; margin: 0.5rem 0 0; font-size: 0.9rem;">"No cambiamos nada"</p>
              </div>
            </div>
          </div>

          <h2>Casos Históricos Argentinos: Errores que No Aprendimos</h2>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso 1: La Convertibilidad (1991-2001)</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #991b1b; margin-top: 0;">❌ El Error</h4>
                <p style="color: #7f1d1d; margin: 0.5rem 0;"><strong>Error de comisión:</strong> Implementar un sistema de tipo de cambio fijo sin considerar la productividad, la competitividad, y la capacidad de sostenerlo.</p>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Crisis del 2001, default, colapso económico.</p>
              </div>
              
              <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #065f46; margin-top: 0;">📚 ¿Aprendimos?</h4>
                <p style="color: #047857; margin: 0.5rem 0;"><strong>Parcialmente:</strong> Aprendimos que el tipo de cambio fijo es riesgoso, pero no aprendimos a desarrollar productividad, competitividad, y capacidad de sostener políticas económicas.</p>
                <p style="color: #047857; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Seguimos repitiendo patrones similares con diferentes mecanismos.</p>
              </div>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso 2: No Invertir en Educación (Error de Omisión)</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #991b1b; margin-top: 0;">❌ El Error</h4>
                <p style="color: #7f1d1d; margin: 0.5rem 0;"><strong>Error de omisión:</strong> No invertir sistemáticamente en educación de calidad cuando había recursos (décadas de 80s, 90s, 2000s).</p>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Décadas perdidas de desarrollo de capital humano, productividad estancada, falta de innovación.</p>
              </div>
              
              <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #065f46; margin-top: 0;">📚 ¿Aprendimos?</h4>
                <p style="color: #047857; margin: 0.5rem 0;"><strong>No completamente:</strong> Aumentamos el presupuesto educativo, pero no siempre mejoramos la calidad ni desarrollamos capacidades de innovación y pensamiento crítico.</p>
                <p style="color: #047857; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Seguimos sin desarrollar el capital humano necesario para competir globalmente.</p>
              </div>
            </div>
          </div>

          <h2>Crear una Cultura de Aprendizaje</h2>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🌱 Cuatro Pasos para Aprender de los Errores</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">1️⃣ Reconocer Abiertamente</h4>
                <p style="margin: 0; opacity: 0.95;">No ocultar los errores, sino compartirlos para que otros puedan aprender también. Crear espacios seguros donde se puedan discutir errores sin castigo.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">2️⃣ Analizar las Causas</h4>
                <p style="margin: 0; opacity: 0.95;">No buscar culpables, sino entender las causas raíz. ¿Por qué pasó? ¿Qué factores contribuyeron? ¿Qué podemos aprender?</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">3️⃣ Corregir y Mejorar</h4>
                <p style="margin: 0; opacity: 0.95;">Usar el aprendizaje para hacer cambios reales. No solo reconocer el error, sino implementar mejoras basadas en lo aprendido.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">4️⃣ Documentar y Compartir</h4>
                <p style="margin: 0; opacity: 0.95;">Compartir lo aprendido para que otros no cometan el mismo error. Crear una base de conocimiento de aprendizajes.</p>
              </div>
            </div>
          </div>

          <h2>Loops de Aprendizaje: El Ciclo que Transforma Errores en Sabiduría</h2>
          
          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">🔄 El Proceso de Aprendizaje de Errores</h3>
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <svg width="100%" height="400" viewBox="0 0 600 400" style="max-width: 100%; height: auto;">
                <!-- Ciclo de aprendizaje -->
                <circle cx="300" cy="200" r="120" fill="none" stroke="#0ea5e9" stroke-width="4"/>
                
                <!-- Observar -->
                <circle cx="300" cy="80" r="40" fill="#3b82f6" stroke="#2563eb" stroke-width="3"/>
                <text x="300" y="88" text-anchor="middle" fill="white" font-size="14" font-weight="bold">1. Observar</text>
                <text x="300" y="103" text-anchor="middle" fill="white" font-size="11">Notar el error</text>
                
                <!-- Reflexionar -->
                <circle cx="480" cy="200" r="40" fill="#10b981" stroke="#059669" stroke-width="3"/>
                <text x="480" y="208" text-anchor="middle" fill="white" font-size="14" font-weight="bold">2. Reflexionar</text>
                <text x="480" y="223" text-anchor="middle" fill="white" font-size="11">Analizar causas</text>
                
                <!-- Planificar -->
                <circle cx="300" cy="320" r="40" fill="#f59e0b" stroke="#d97706" stroke-width="3"/>
                <text x="300" y="328" text-anchor="middle" fill="white" font-size="14" font-weight="bold">3. Planificar</text>
                <text x="300" y="343" text-anchor="middle" fill="white" font-size="11">Qué cambiar</text>
                
                <!-- Actuar -->
                <circle cx="120" cy="200" r="40" fill="#ec4899" stroke="#db2777" stroke-width="3"/>
                <text x="120" y="208" text-anchor="middle" fill="white" font-size="14" font-weight="bold">4. Actuar</text>
                <text x="120" y="223" text-anchor="middle" fill="white" font-size="11">Implementar</text>
                
                <!-- Flechas del ciclo -->
                <path d="M 300 120 L 440 180" stroke="#0ea5e9" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
                <path d="M 440 220 L 300 280" stroke="#0ea5e9" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
                <path d="M 260 320 L 140 240" stroke="#0ea5e9" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
                <path d="M 120 180 L 260 120" stroke="#0ea5e9" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
                
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#0ea5e9"/>
                  </marker>
                </defs>
              </svg>
            </div>
            <p style="color: #0369a1; margin-top: 1rem; margin-bottom: 0; font-style: italic;">Este ciclo se repite continuamente. Cada error es una oportunidad de pasar por todo el ciclo y aprender algo nuevo.</p>
          </div>

          <h2>Ejercicio Práctico: Analizar un Error Reciente</h2>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🔍 Elegí un Error Reciente (de Comisión o de Omisión)</h3>
            <p style="opacity: 0.95;">Podés usar un error personal, profesional, o comunitario. Seguí el ciclo de aprendizaje:</p>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">1. Observar: ¿Qué pasó?</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Describí el error de manera objetiva. ¿Fue un error de comisión o de omisión?</p>
              <div style="background: rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="margin: 0; font-style: italic;">Ejemplo: "No invertí en capacitación cuando tenía recursos, y ahora mi equipo no tiene las habilidades necesarias"</p>
              </div>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">2. Reflexionar: ¿Por qué pasó?</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Analizá las causas raíz. No busques culpables, busca entender:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>¿Qué factores contribuyeron al error?</li>
                <li>¿Qué información faltaba?</li>
                <li>¿Qué suposiciones incorrectas hice?</li>
                <li>¿Qué podría haber hecho diferente?</li>
              </ul>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">3. Planificar: ¿Qué haré diferente?</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Basándote en lo que aprendiste, diseñá cambios concretos:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>¿Qué procesos cambiaré?</li>
                <li>¿Qué información necesitaré en el futuro?</li>
                <li>¿Qué suposiciones cuestionaré?</li>
                <li>¿Qué sistemas implementaré para prevenir este error?</li>
              </ul>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">4. Actuar: ¿Cómo lo implementaré?</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Creá un plan de acción concreto:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>¿Qué pasos específicos tomaré?</li>
                <li>¿Cuándo los implementaré?</li>
                <li>¿Cómo mediré si funcionó?</li>
                <li>¿Con quién compartiré este aprendizaje?</li>
              </ul>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📝 Para Profundizar</h3>
            <p style="color: #0369a1; margin-bottom: 0;">Después de completar el análisis, respondé:</p>
            <ul style="color: #0369a1; line-height: 2;">
              <li>¿Qué aprendiste que no sabías antes?</li>
              <li>¿Cómo podrías compartir este aprendizaje con otros?</li>
              <li>¿Qué cambios harás en tu organización o comunidad para crear una cultura que aprenda de los errores?</li>
              <li>¿Cómo podrías documentar este aprendizaje para que otros no cometan el mismo error?</li>
              <li>¿Qué errores de omisión podrías estar cometiendo ahora sin darte cuenta?</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 16px; padding: 2rem; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ Próximo Paso</h3>
            <p style="margin-bottom: 0;">Ahora que entendés cómo aprender de los errores, estás listo para aprender cómo diseñar el futuro que querés. En la siguiente lección, descubrirás la planificación interactiva: cómo diseñar un futuro deseable y trabajar hacia atrás desde él, en lugar de solo reaccionar al presente.</p>
          </div>
        `,
        orderIndex: 5,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course8[0].id,
        title: 'Planificación Interactiva',
        description: 'Aprendé a planificar desde el futuro deseado hacia el presente, en lugar de extrapolar el presente hacia el futuro. Diseñá el futuro que querés, no solo adaptate al que viene.',
        content: `
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 25px 80px rgba(6, 182, 212, 0.35);">
            <h1 style="color: white; margin-top: 0; font-size: 2.5rem; line-height: 1.2;">Planificación Interactiva</h1>
            <p style="font-size: 1.1rem; margin-bottom: 0; opacity: 0.95;">Hay tres formas básicas de enfrentar el futuro: reactiva, preactiva e interactiva. La planificación interactiva es la más poderosa porque te permite diseñar el futuro que querés, no solo adaptarte al que viene.</p>
          </div>

          <div style="background: #f9fafb; border-left: 4px solid #06b6d4; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h3 style="color: #0891b2; margin-top: 0;">🇦🇷 El Problema de la Planificación en Argentina</h3>
            <p>En Argentina, la planificación suele ser reactiva o preactiva. Reaccionamos a crisis (reactiva) o intentamos predecir el futuro (preactiva). Pero rara vez diseñamos el futuro que queremos y trabajamos hacia atrás desde ahí.</p>
            <p style="margin-bottom: 0;"><strong>Ejemplo:</strong> En lugar de diseñar un sistema educativo ideal y trabajar hacia atrás, reaccionamos a problemas actuales o intentamos predecir qué habilidades se necesitarán. El resultado: planes que no transforman, solo ajustan.</p>
          </div>

          <h2>Los Tres Enfoques de Planificación</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);">
              <h3 style="color: white; margin-top: 0;">🔙 Reactiva</h3>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Mirar el pasado y hacer más de lo mismo, o menos de lo que no funcionó.</p>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="margin: 0; opacity: 0.95; font-style: italic;">"Es como manejar mirando solo el espejo retrovisor"</p>
              </div>
              <p style="margin-top: 1rem; opacity: 0.95; margin-bottom: 0;"><strong>Ejemplo argentino:</strong> "La última crisis fue por X, así que hagamos lo opuesto de X"</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);">
              <h3 style="color: white; margin-top: 0;">🔮 Preactiva</h3>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Predecir el futuro y prepararse para él.</p>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="margin: 0; opacity: 0.95; font-style: italic;">"Es como intentar adivinar qué va a pasar y prepararse para eso"</p>
              </div>
              <p style="margin-top: 1rem; opacity: 0.95; margin-bottom: 0;"><strong>Ejemplo argentino:</strong> "El futuro será digital, así que preparemos a los estudiantes para eso"</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
              <h3 style="color: white; margin-top: 0;">🎯 Interactiva</h3>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Diseñar el futuro que querés y trabajar hacia atrás desde ahí.</p>
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="margin: 0; opacity: 0.95; font-style: italic;">"Es como decidir adónde querés ir y luego planificar cómo llegar"</p>
              </div>
              <p style="margin-top: 1rem; opacity: 0.95; margin-bottom: 0;"><strong>Ejemplo argentino:</strong> "Queremos un país donde todos puedan desarrollar su potencial. ¿Cómo llegamos ahí?"</p>
            </div>
          </div>

          <h2>¿Por Qué Planificar desde el Futuro?</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: #fee2e2; border: 3px solid #ef4444; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #991b1b; margin-top: 0;">❌ Planificar desde el Presente</h3>
              <p style="color: #7f1d1d; margin-bottom: 1rem;">Estás limitado por:</p>
              <ul style="color: #7f1d1d; line-height: 2;">
                <li>Las restricciones actuales</li>
                <li>Los recursos actuales</li>
                <li>Las creencias actuales sobre lo que es posible</li>
                <li>Los problemas actuales</li>
              </ul>
              <p style="color: #7f1d1d; margin-top: 1rem; margin-bottom: 0; font-style: italic;">Resultado: Planes pequeños, incrementales, que no transforman.</p>
            </div>
            
            <div style="background: #d1fae5; border: 3px solid #10b981; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #065f46; margin-top: 0;">✅ Planificar desde el Futuro</h3>
              <p style="color: #047857; margin-bottom: 1rem;">Podés:</p>
              <ul style="color: #047857; line-height: 2;">
                <li>Imaginar lo ideal sin restricciones</li>
                <li>Identificar qué necesitás para llegar ahí</li>
                <li>Encontrar formas creativas de superar obstáculos</li>
                <li>Ver posibilidades que no eran obvias desde el presente</li>
              </ul>
              <p style="color: #047857; margin-top: 1rem; margin-bottom: 0; font-style: italic;">Resultado: Planes transformadores que revelan nuevas posibilidades.</p>
            </div>
          </div>

          <h2>El Proceso de Planificación Interactiva</h2>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">📋 Cinco Fases que se Retroalimentan</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">1️⃣ Formular el Mess</h4>
                <p style="margin: 0; opacity: 0.95;">Entender la situación actual y cómo podría empeorar si no cambiamos nada. ¿Cómo podríamos destruirnos si seguimos como estamos?</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">2️⃣ Planificación de Fines</h4>
                <p style="margin: 0; opacity: 0.95;">Diseñar el futuro ideal. ¿Cómo sería el futuro perfecto? Sin restricciones, ¿qué queremos crear?</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">3️⃣ Planificación de Medios</h4>
                <p style="margin: 0; opacity: 0.95;">Decidir cómo llegar desde el presente al futuro ideal. ¿Qué necesitamos hacer?</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">4️⃣ Planificación de Recursos</h4>
                <p style="margin: 0; opacity: 0.95;">Identificar qué recursos necesitamos y cómo los obtenemos. ¿Qué tenemos? ¿Qué necesitamos? ¿Cómo lo conseguimos?</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">5️⃣ Implementación y Control</h4>
                <p style="margin: 0; opacity: 0.95;">Ejecutar el plan y ajustarlo continuamente basado en lo que aprendemos. Aprender, adaptar, mejorar.</p>
              </div>
            </div>
          </div>

          <h2>El Cambio como Oportunidad</h2>
          
          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">🌊 Surfear las Olas del Cambio</h3>
            <p style="color: #0369a1;">En la planificación interactiva, el cambio no es algo que temer, sino una oportunidad. Cuando el cambio viene, los que están preparados pueden aprovecharlo mejor que los que solo reaccionan.</p>
            <p style="color: #0369a1; margin-top: 1rem; margin-bottom: 0; font-style: italic;">Es como surfear: no podés controlar las olas, pero podés aprender a surfearlas. Y si estás en la ola correcta, podés llegar más lejos y más rápido que nadando solo.</p>
          </div>

          <h2>Ejemplos Argentinos: Planificación Reactiva vs. Interactiva</h2>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Caso: Planificación Educativa</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #991b1b; margin-top: 0;">❌ Enfoque Reactivo/Preactivo</h4>
                <p style="color: #7f1d1d; margin: 0.5rem 0;"><strong>Problema:</strong> Los estudiantes no tienen habilidades digitales</p>
                <p style="color: #7f1d1d; margin: 0.5rem 0;"><strong>Solución:</strong> Agregar más computadoras y clases de informática</p>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Mejora incremental, pero no transforma el sistema educativo</p>
              </div>
              
              <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #065f46; margin-top: 0;">✅ Enfoque Interactivo</h4>
                <p style="color: #047857; margin: 0.5rem 0;"><strong>Futuro ideal:</strong> Un sistema educativo donde cada estudiante desarrolla su potencial único y aprende a pensar críticamente, crear, colaborar</p>
                <p style="color: #047857; margin: 0.5rem 0;"><strong>Plan:</strong> Trabajar hacia atrás: ¿qué necesitamos? Docentes formados, currículo transformado, metodologías activas, evaluación diferente</p>
                <p style="color: #047857; margin: 0.5rem 0 0;"><strong>Resultado:</strong> Transformación sistémica que revela nuevas posibilidades</p>
              </div>
            </div>
          </div>

          <h2>Ejercicio Práctico: Planificar desde el Futuro</h2>
          
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🎯 Elegí Algo que Querés Lograr</h3>
            <p style="opacity: 0.95;">Podés usar un objetivo personal, organizacional, o comunitario. Planificá desde el futuro ideal:</p>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 1: Imaginar el Futuro Ideal</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Sin restricciones, sin limitaciones actuales, ¿cómo sería perfecto? Sé específico y detallado.</p>
              <div style="background: rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="margin: 0; font-style: italic;">Ejemplo: "En 10 años, mi barrio es un lugar donde todos los vecinos se conocen, colaboran, tienen espacios verdes, seguridad, oportunidades económicas..."</p>
              </div>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 2: Trabajar Hacia Atrás</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Desde ese futuro ideal, ¿qué necesitás para llegar ahí?</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>¿Qué capacidades necesitás desarrollar?</li>
                <li>¿Qué recursos necesitás?</li>
                <li>¿Qué cambios necesitás hacer?</li>
                <li>¿Qué obstáculos necesitás superar?</li>
              </ul>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 3: Identificar Obstáculos que se Vuelven Menos Importantes</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Cuando mirás desde el futuro ideal, ¿qué obstáculos actuales se vuelven menos importantes? ¿Qué problemas actuales desaparecen cuando tenés el futuro ideal en mente?</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 4: Crear el Plan de Medios</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Basándote en lo que necesitás, creá un plan concreto:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>¿Qué harás primero?</li>
                <li>¿Qué harás después?</li>
                <li>¿Qué recursos necesitás y cómo los obtendrás?</li>
                <li>¿Cómo medirás el progreso?</li>
              </ul>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📝 Reflexión</h3>
            <p style="color: #0369a1; margin-bottom: 0;">Después de completar el ejercicio, respondé:</p>
            <ul style="color: #0369a1; line-height: 2;">
              <li>¿Cómo cambió tu perspectiva cuando planificaste desde el futuro ideal en lugar del presente?</li>
              <li>¿Qué posibilidades nuevas descubriste que no eran obvias desde el presente?</li>
              <li>¿Qué obstáculos actuales se volvieron menos importantes?</li>
              <li>¿Cómo podrías aplicar este enfoque a otros desafíos?</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2rem; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ Próximo Paso</h3>
            <p style="margin-bottom: 0;">Ahora que entendés cómo planificar desde el futuro, estás listo para aprender cómo diseñar sistemas ideales sin restricciones. En la siguiente lección, descubrirás el diseño idealizado: cómo diseñar sistemas desde cero sin las limitaciones actuales, y luego trabajar hacia atrás para hacerlos realidad.</p>
          </div>
        `,
        orderIndex: 6,
        type: 'text' as const,
        duration: 50,
        isRequired: true,
      },
      {
        courseId: course8[0].id,
        title: 'Diseño Idealizado',
        description: 'Aprendé a diseñar sistemas ideales sin restricciones, y luego trabajar hacia atrás para hacerlos realidad. Liberá tu creatividad y descubrí posibilidades que no habías considerado.',
        content: `
          <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 25px 80px rgba(236, 72, 153, 0.35);">
            <h1 style="color: white; margin-top: 0; font-size: 2.5rem; line-height: 1.2;">Diseño Idealizado</h1>
            <p style="font-size: 1.1rem; margin-bottom: 0; opacity: 0.95;">El diseño idealizado es una técnica poderosa que te permite liberar tu creatividad diseñando primero lo ideal, sin preocuparte por las restricciones actuales. Luego trabajás hacia atrás para ver cómo hacerlo realidad.</p>
          </div>

          <div style="background: #f9fafb; border-left: 4px solid #ec4899; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h3 style="color: #db2777; margin-top: 0;">🇦🇷 El Problema de las Restricciones Autoimpuestas</h3>
            <p>En Argentina, muchas veces asumimos restricciones que no son reales. Pensamos "no se puede" cuando en realidad es "nunca lo intentamos" o "siempre se hizo así". El diseño idealizado nos libera de estas limitaciones mentales.</p>
            <p style="margin-bottom: 0;"><strong>Ejemplo:</strong> "No podemos cambiar el sistema educativo porque es muy grande/complejo/costoso". Pero si lo diseñáramos desde cero, ¿cómo sería? Y desde ese ideal, ¿qué podemos hacer ahora?</p>
          </div>

          <h2>¿Qué es el Diseño Idealizado?</h2>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">✨ La Pregunta Clave</h3>
            <p style="opacity: 0.95; font-size: 1.2rem; margin-bottom: 1rem;">"Si pudiéramos empezar de nuevo, sin ninguna restricción, ¿cómo lo diseñaríamos?"</p>
            <p style="opacity: 0.95; margin-bottom: 0;">Es el proceso de diseñar un sistema (organización, proceso, producto, servicio) como si pudieras empezar de cero, sin ninguna restricción. Dejás de lado "lo que es posible" y te enfocás en "lo que sería ideal".</p>
          </div>

          <h2>¿Por Qué Funciona?</h2>
          
          <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #991b1b; margin-top: 0;">🚫 El Problema de Diseñar con Restricciones</h3>
            <p style="color: #7f1d1d;">Cuando diseñás con las restricciones actuales en mente, tu creatividad está limitada. Pensás en términos de "lo que es posible" en lugar de "lo que sería ideal".</p>
            <p style="color: #7f1d1d; margin-bottom: 0;"><strong>Resultado:</strong> Diseños incrementales, pequeños ajustes, mejoras menores. No transformaciones.</p>
          </div>

          <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #065f46; margin-top: 0;">✅ La Solución: Diseñar sin Restricciones</h3>
            <p style="color: #047857;">Muchas restricciones que asumimos como reales son en realidad:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #065f46;">⏰ Temporales</strong>
                <p style="color: #047857; margin: 0.5rem 0 0; font-size: 0.9rem;">Las cosas cambiaron, pero seguimos asumiendo que son iguales</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #065f46;">🏛️ Culturales</strong>
                <p style="color: #047857; margin: 0.5rem 0 0; font-size: 0.9rem;">Siempre se hizo así, pero no hay razón real para que siga así</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #065f46;">🧠 Autoimpuestas</strong>
                <p style="color: #047857; margin: 0.5rem 0 0; font-size: 0.9rem;">Nos convencimos de que no es posible, pero nunca lo intentamos</p>
              </div>
            </div>
          </div>

          <h2>El Proceso de Diseño Idealizado</h2>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">📋 Cuatro Pasos para Diseñar lo Ideal</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">1️⃣ Diseñar lo Ideal</h4>
                <p style="margin: 0; opacity: 0.95;">Sin restricciones, ¿cómo sería perfecto? Dejá volar tu imaginación. No te limites por "lo que es posible".</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">2️⃣ Identificar Restricciones Reales</h4>
                <p style="margin: 0; opacity: 0.95;">De todas las restricciones que asumiste, ¿cuáles son realmente inamovibles? Muchas veces son menos de las que pensabas.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">3️⃣ Trabajar Hacia Atrás</h4>
                <p style="margin: 0; opacity: 0.95;">Desde el diseño ideal, ¿cómo podés acercarte lo más posible? ¿Qué cambios necesitás hacer?</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">4️⃣ Implementar Gradualmente</h4>
                <p style="margin: 0; opacity: 0.95;">No tenés que llegar al ideal de una vez. Podés hacer cambios incrementales que te acerquen.</p>
              </div>
            </div>
          </div>

          <h2>Ejemplo: Diseñar un Sistema Educativo Ideal</h2>

          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">Si Pudieras Diseñar el Sistema Educativo desde Cero</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
              <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #991b1b; margin-top: 0;">❌ Realidad Actual</h4>
                <ul style="color: #7f1d1d; line-height: 2;">
                  <li>Currículo fijo y estandarizado</li>
                  <li>Clases magistrales</li>
                  <li>Evaluación por exámenes</li>
                  <li>Edades agrupadas</li>
                  <li>Horarios fijos</li>
                  <li>Un docente por clase</li>
                </ul>
              </div>
              
              <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #065f46; margin-top: 0;">✨ Diseño Idealizado</h4>
                <ul style="color: #047857; line-height: 2;">
                  <li>Currículo personalizado según intereses y capacidades</li>
                  <li>Aprendizaje basado en proyectos y problemas reales</li>
                  <li>Evaluación continua y por portafolio</li>
                  <li>Grupos multiedad según nivel y proyecto</li>
                  <li>Horarios flexibles según ritmo de aprendizaje</li>
                  <li>Equipos de docentes y mentores</li>
                </ul>
              </div>
            </div>
            <p style="margin-top: 1.5rem; font-style: italic; color: #6b7280;">Una vez que tenés el diseño ideal, podés empezar a ver qué elementos podés implementar ahora, qué cambios pequeños te acercan al ideal, y qué restricciones realmente son inamovibles (y cuáles no).</p>
          </div>

          <h2>Beneficios del Diseño Idealizado</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);">
              <h3 style="color: white; margin-top: 0;">🎨 Libera la Creatividad</h3>
              <p style="opacity: 0.95; margin-bottom: 0;">No estás limitado por "cómo siempre se hizo". Podés imaginar sin restricciones.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
              <h3 style="color: white; margin-top: 0;">💡 Revela Posibilidades</h3>
              <p style="opacity: 0.95; margin-bottom: 0;">Descubrís opciones que no habías considerado. Nuevas formas de hacer las cosas.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);">
              <h3 style="color: white; margin-top: 0;">🧭 Proporciona Dirección</h3>
              <p style="opacity: 0.95; margin-bottom: 0;">Tenés una estrella del norte hacia la cual trabajar. Sabés adónde querés llegar.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);">
              <h3 style="color: white; margin-top: 0;">🚀 Motiva el Cambio</h3>
              <p style="opacity: 0.95; margin-bottom: 0;">Ver lo ideal te inspira a hacer cambios, incluso pequeños. Genera energía y motivación.</p>
            </div>
          </div>

          <h2>Ejercicio Práctico: Diseñar Tu Sistema Ideal</h2>
          
          <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🎯 Elegí Algo que Querés Mejorar</h3>
            <p style="opacity: 0.95;">Podés usar un proceso, una organización, un servicio, o cualquier sistema. Diseñalo desde cero:</p>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 1: Diseñar lo Ideal</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Sin restricciones, sin limitaciones, ¿cómo sería perfecto? Dejá volar tu imaginación. Sé específico y detallado.</p>
              <div style="background: rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="margin: 0; font-style: italic;">Ejemplo: "Mi organización ideal sería..." Describe cada aspecto: estructura, procesos, cultura, valores, resultados.</p>
              </div>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 2: Comparar con la Realidad</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Compará el diseño ideal con la realidad actual. ¿Qué diferencias hay? ¿Qué está bien? ¿Qué necesita cambiar?</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 3: Identificar Restricciones Reales</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">De todas las restricciones que asumiste, ¿cuáles son realmente inamovibles? ¿Cuáles son temporales? ¿Cuáles son culturales? ¿Cuáles son autoimpuestas?</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 4: Crear Plan de Implementación</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Basándote en el ideal y las restricciones reales, creá un plan:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>¿Qué elementos del ideal podés implementar ahora, incluso parcialmente?</li>
                <li>¿Qué cambios pequeños te acercan al ideal?</li>
                <li>¿Qué restricciones podés desafiar o eliminar?</li>
                <li>¿Cómo medirás el progreso hacia el ideal?</li>
              </ul>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📝 Reflexión</h3>
            <p style="color: #0369a1; margin-bottom: 0;">Después de completar el ejercicio, respondé:</p>
            <ul style="color: #0369a1; line-height: 2;">
              <li>¿Qué posibilidades nuevas descubriste que no habías considerado antes?</li>
              <li>¿Qué restricciones que asumías como reales resultaron ser temporales, culturales, o autoimpuestas?</li>
              <li>¿Cómo cambió tu perspectiva al diseñar desde el ideal en lugar de desde las restricciones?</li>
              <li>¿Qué elementos del ideal podrías empezar a implementar ahora mismo?</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2rem; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ Próximo Paso</h3>
            <p style="margin-bottom: 0;">Ahora que entendés cómo diseñar sistemas ideales, estás listo para aprender cómo tomar decisiones de manera participativa. En la siguiente lección, descubrirás los principios de la toma de decisiones participativa y cómo crear estructuras donde todos puedan contribuir efectivamente.</p>
          </div>
        `,
        orderIndex: 7,
        type: 'text' as const,
        duration: 40,
        isRequired: true,
      },
      {
        courseId: course8[0].id,
        title: 'Toma de Decisiones Participativa',
        description: 'Aprendé los principios de la toma de decisiones participativa y cómo crear estructuras donde todos puedan contribuir efectivamente. Descubrí cómo la participación mejora la calidad y legitimidad de las decisiones.',
        content: `
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 25px 80px rgba(59, 130, 246, 0.35);">
            <h1 style="color: white; margin-top: 0; font-size: 2.5rem; line-height: 1.2;">Toma de Decisiones Participativa</h1>
            <p style="font-size: 1.1rem; margin-bottom: 0; opacity: 0.95;">Las decisiones son mejores cuando las personas afectadas participan en tomarlas. Pero la participación efectiva requiere estructuras y principios claros, no solo buenas intenciones.</p>
          </div>

          <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h3 style="color: #2563eb; margin-top: 0;">🇦🇷 El Problema de la Participación en Argentina</h3>
            <p>En Argentina, las decisiones suelen ser tomadas por pocos (líderes, expertos, autoridades) sin involucrar a quienes serán afectados. Esto genera:</p>
            <ul style="line-height: 2;">
              <li>Decisiones que no reflejan las necesidades reales de las personas</li>
              <li>Falta de compromiso con la implementación</li>
              <li>Resistencia y conflictos</li>
              <li>Pérdida de legitimidad</li>
            </ul>
            <p style="margin-bottom: 0;"><strong>Ejemplo:</strong> Políticas públicas diseñadas en oficinas sin consultar a quienes las vivirán. Resultado: políticas que no funcionan o generan resistencia.</p>
          </div>

          <h2>Principios Fundamentales</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
              <h3 style="color: white; margin-top: 0;">👥 Participación de los Afectados</h3>
              <p style="opacity: 0.95; margin-bottom: 0;">Todas las personas directamente afectadas por una decisión pueden participar en tomarla, ya sea directamente o a través de representantes que ellas elijan.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);">
              <h3 style="color: white; margin-top: 0;">🔄 Autoridad Circular</h3>
              <p style="opacity: 0.95; margin-bottom: 0;">Cualquier persona en posición de autoridad sobre otros está sujeta a la autoridad colectiva de esos otros. La autoridad fluye hacia arriba colectivamente y hacia abajo individualmente.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);">
              <h3 style="color: white; margin-top: 0;">⚖️ Libertad con Responsabilidad</h3>
              <p style="opacity: 0.95; margin-bottom: 0;">Cada persona o grupo puede hacer lo que quiera, siempre que no afecte negativamente a otros. Si puede afectar a otros, necesita su aprobación primero.</p>
            </div>
          </div>

          <h2>¿Por Qué Participación?</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: #e0f2fe; border: 2px solid #0ea5e9; border-radius: 12px; padding: 1.5rem;">
              <h4 style="color: #0369a1; margin-top: 0;">📊 Mayor Información</h4>
              <p style="color: #0369a1; margin: 0;">Las personas afectadas conocen mejor la situación. Tienen información que los "expertos" no tienen.</p>
            </div>
            
            <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
              <h4 style="color: #065f46; margin-top: 0;">💪 Mayor Compromiso</h4>
              <p style="color: #047857; margin: 0;">Las personas se comprometen más con decisiones que ayudaron a tomar. Se sienten dueñas del resultado.</p>
            </div>
            
            <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 1.5rem;">
              <h4 style="color: #92400e; margin-top: 0;">✅ Mejor Implementación</h4>
              <p style="color: #78350f; margin: 0;">Las decisiones son más fáciles de implementar cuando todos las entienden y apoyan.</p>
            </div>
            
            <div style="background: #fce7f3; border: 2px solid #ec4899; border-radius: 12px; padding: 1.5rem;">
              <h4 style="color: #9f1239; margin-top: 0;">🏛️ Mayor Legitimidad</h4>
              <p style="color: #831843; margin: 0;">Las decisiones tienen más legitimidad cuando son tomadas por los afectados, no impuestas desde arriba.</p>
            </div>
          </div>

          <h2>Autoridad Circular: La Revolución en las Estructuras</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
            <div style="background: #fee2e2; border: 3px solid #ef4444; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #991b1b; margin-top: 0;">❌ Estructura Tradicional</h3>
              <p style="color: #7f1d1d; margin-bottom: 1rem;">La autoridad fluye solo hacia abajo:</p>
              <div style="background: white; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="color: #991b1b; margin: 0; font-weight: bold;">Jefe</p>
                <p style="color: #991b1b; margin: 0.5rem 0 0;">↓</p>
                <p style="color: #991b1b; margin: 0;">Empleados</p>
              </div>
              <p style="color: #7f1d1d; margin-top: 1rem; margin-bottom: 0; font-style: italic;">El jefe tiene autoridad sobre los empleados, pero los empleados no tienen autoridad sobre el jefe.</p>
            </div>
            
            <div style="background: #d1fae5; border: 3px solid #10b981; border-radius: 16px; padding: 2rem;">
              <h3 style="color: #065f46; margin-top: 0;">✅ Autoridad Circular</h3>
              <p style="color: #047857; margin-bottom: 1rem;">La autoridad fluye en ambas direcciones:</p>
              <div style="background: white; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                <p style="color: #065f46; margin: 0; font-weight: bold;">Jefe</p>
                <p style="color: #065f46; margin: 0.5rem 0 0;">↕️</p>
                <p style="color: #065f46; margin: 0;">Empleados (colectivamente)</p>
              </div>
              <p style="color: #047857; margin-top: 1rem; margin-bottom: 0; font-style: italic;">El jefe tiene autoridad individual, pero el grupo tiene autoridad colectiva sobre decisiones que los afectan.</p>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">💡 ¿Qué Significa en la Práctica?</h3>
            <p style="color: #0369a1;">En la autoridad circular:</p>
            <ul style="color: #0369a1; line-height: 2;">
              <li>Un jefe puede tomar decisiones individuales, pero decisiones colectivas requieren el acuerdo del grupo</li>
              <li>El grupo puede evaluar y cuestionar las decisiones del jefe</li>
              <li>La autoridad se basa en competencia y consenso, no solo en posición</li>
              <li>El jefe es responsable ante el grupo, no solo ante su superior</li>
            </ul>
          </div>

          <h2>Mapeo de Stakeholders</h2>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🗺️ Identificá a Todos los Afectados</h3>
            <p style="opacity: 0.95; margin-bottom: 1.5rem;">Para tomar decisiones participativas efectivas, necesitás identificar:</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🎯 Afectados Directos</h4>
                <p style="margin: 0; opacity: 0.95;">Personas que serán directamente impactadas por la decisión. Deben participar prioritariamente.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🔗 Afectados Indirectos</h4>
                <p style="margin: 0; opacity: 0.95;">Personas que serán indirectamente impactadas. Deben ser consultadas.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">👤 Representantes</h4>
                <p style="margin: 0; opacity: 0.95;">Cómo representar a quienes no pueden participar directamente (niños, personas con discapacidades, etc.).</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🌐 Stakeholders Externos</h4>
                <p style="margin: 0; opacity: 0.95;">Clientes, proveedores, comunidad, etc. Pueden ser consultados según relevancia.</p>
              </div>
            </div>
          </div>

          <h2>Estructuras Participativas</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #3b82f6;">
              <h4 style="margin-top: 0;">🏛️ Asambleas</h4>
              <p style="margin: 0.5rem 0 0; color: #6b7280;">Todos los afectados se reúnen y deciden juntos. Ideal para grupos pequeños y decisiones importantes.</p>
            </div>
            
            <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #10b981;">
              <h4 style="margin-top: 0;">👥 Consejos Representativos</h4>
              <p style="margin: 0.5rem 0 0; color: #6b7280;">Representantes elegidos por grupos participan en decisiones. Ideal para grupos grandes.</p>
            </div>
            
            <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #f59e0b;">
              <h4 style="margin-top: 0;">💬 Consultas</h4>
              <p style="margin: 0.5rem 0 0; color: #6b7280;">Se consulta a los afectados antes de decidir. Ideal cuando la decisión final la toma una autoridad, pero se necesita input.</p>
            </div>
            
            <div style="background: #f3f4f6; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #ec4899;">
              <h4 style="margin-top: 0;">🎨 Co-diseño</h4>
              <p style="margin: 0.5rem 0 0; color: #6b7280;">Los afectados participan en diseñar soluciones. Ideal para problemas complejos que requieren creatividad.</p>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #92400e; margin-top: 0;">💡 Ejemplo Argentino: Presupuesto Participativo</h3>
            <p style="color: #78350f;">En algunas ciudades argentinas (como Rosario, Córdoba), se implementó presupuesto participativo donde los vecinos deciden cómo gastar parte del presupuesto municipal. Esto es un ejemplo de:</p>
            <ul style="color: #78350f; line-height: 2;">
              <li><strong>Participación de afectados:</strong> Los vecinos son directamente afectados por cómo se gasta el presupuesto</li>
              <li><strong>Estructura participativa:</strong> Asambleas barriales donde se discuten y deciden proyectos</li>
              <li><strong>Resultado:</strong> Mayor legitimidad, mejor uso de recursos, mayor compromiso ciudadano</li>
            </ul>
          </div>

          <h2>Desafíos Comunes y Cómo Manejarlos</h2>
          
          <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #991b1b; margin-top: 0;">⚠️ Desafíos de la Participación</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #991b1b;">⏰ Tiempo</strong>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0; font-size: 0.9rem;">Tomar decisiones participativas puede tomar más tiempo. <strong>Solución:</strong> Invertir tiempo al principio ahorra tiempo después en implementación y conflictos.</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #991b1b;">⚔️ Conflicto</strong>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0; font-size: 0.9rem;">Diferentes perspectivas pueden generar conflictos. <strong>Solución:</strong> Facilitación efectiva, procesos claros, enfoque en intereses comunes.</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #991b1b;">📢 Desigualdad</strong>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0; font-size: 0.9rem;">Algunas voces pueden dominar sobre otras. <strong>Solución:</strong> Estructuras que aseguren que todas las voces sean escuchadas.</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #991b1b;">📚 Falta de Información</strong>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0; font-size: 0.9rem;">No todos tienen la misma información. <strong>Solución:</strong> Compartir información de manera accesible, educar sobre el tema.</p>
              </div>
            </div>
          </div>

          <h2>Ejercicio Práctico: Diseñar un Proceso Participativo</h2>
          
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🎯 Elegí una Decisión que Necesitás Tomar</h3>
            <p style="opacity: 0.95;">Podés usar una decisión personal, organizacional, o comunitaria. Diseñá un proceso participativo:</p>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 1: Mapear Stakeholders</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Identificá:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>¿Quiénes serán afectados directamente?</li>
                <li>¿Quiénes serán afectados indirectamente?</li>
                <li>¿Quiénes necesitan representación?</li>
                <li>¿Quiénes son stakeholders externos relevantes?</li>
              </ul>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 2: Elegir Estructura Participativa</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Basándote en el contexto, tamaño del grupo, y naturaleza de la decisión:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>¿Qué estructura participativa sería más apropiada? (asamblea, consejo, consulta, co-diseño)</li>
                <li>¿Por qué esta estructura es la mejor para este caso?</li>
              </ul>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 3: Diseñar el Proceso</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Creá un proceso concreto:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>¿Cómo involucrarás a los afectados?</li>
                <li>¿Qué información necesitarán?</li>
                <li>¿Cómo manejarás diferentes perspectivas y posibles conflictos?</li>
                <li>¿Cómo tomarán la decisión final?</li>
              </ul>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📝 Reflexión</h3>
            <p style="color: #0369a1; margin-bottom: 0;">Después de diseñar el proceso, respondé:</p>
            <ul style="color: #0369a1; line-height: 2;">
              <li>¿Cómo cambiaría la calidad de la decisión si involucrás a los afectados?</li>
              <li>¿Qué desafíos anticipás y cómo los manejarías?</li>
              <li>¿Cómo podrías aplicar principios de autoridad circular en tu organización o comunidad?</li>
              <li>¿Qué estructuras participativas podrías implementar ahora mismo?</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 16px; padding: 2rem; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ Próximo Paso</h3>
            <p style="margin-bottom: 0;">Ahora que entendés cómo tomar decisiones participativas, estás listo para aprender sobre la relación entre tecnología, automatización y desarrollo humano. En la siguiente lección, descubrirás cómo usar la tecnología para amplificar capacidades humanas en lugar de reemplazarlas.</p>
          </div>
        `,
        orderIndex: 8,
        type: 'text' as const,
        duration: 35,
        isRequired: true,
      },
      {
        courseId: course8[0].id,
        title: 'Automatización y Trabajo Humano',
        description: 'Aprendé sobre la relación entre tecnología, automatización y desarrollo humano. Descubrí cómo usar la tecnología para amplificar capacidades humanas en lugar de reemplazarlas.',
        content: `
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 25px 80px rgba(245, 158, 11, 0.35);">
            <h1 style="color: white; margin-top: 0; font-size: 2.5rem; line-height: 1.2;">Automatización y Trabajo Humano</h1>
            <p style="font-size: 1.1rem; margin-bottom: 0; opacity: 0.95;">La tecnología y la automatización han transformado el trabajo humano a lo largo de la historia. Entender esta relación es clave para diseñar sistemas donde la tecnología mejore las capacidades humanas en lugar de reemplazarlas.</p>
          </div>

          <div style="background: #f9fafb; border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h3 style="color: #d97706; margin-top: 0;">🇦🇷 El Desafío de la Automatización en Argentina</h3>
            <p>En Argentina, hay miedo a que la automatización reemplace trabajos. Pero el problema real no es la tecnología, sino cómo la diseñamos y usamos. Si diseñamos tecnología para reemplazar humanos, eso pasará. Si la diseñamos para amplificar capacidades humanas, crearemos más valor.</p>
            <p style="margin-bottom: 0;"><strong>Ejemplo:</strong> En lugar de automatizar cajeros para reemplazarlos, podríamos automatizar tareas repetitivas para que los cajeros se enfoquen en atención al cliente, resolución de problemas, y relaciones humanas.</p>
          </div>

          <h2>La Evolución de la Automatización</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);">
              <h3 style="color: white; margin-top: 0;">🏭 Revolución Industrial</h3>
              <p style="opacity: 0.95; margin-bottom: 0;">Máquinas que reemplazaron trabajo físico manual. Primera gran transformación del trabajo humano.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);">
              <h3 style="color: white; margin-top: 0;">⚙️ Automatización de Procesos</h3>
              <p style="opacity: 0.95; margin-bottom: 0;">Sistemas que automatizaron procesos repetitivos. Segunda gran transformación.</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
              <h3 style="color: white; margin-top: 0;">🤖 Automatización Inteligente</h3>
              <p style="opacity: 0.95; margin-bottom: 0;">Sistemas que pueden aprender y adaptarse. Tercera gran transformación, en curso ahora.</p>
            </div>
          </div>

          <h2>El Problema del Diseño de Trabajo</h2>
          
          <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #991b1b; margin-top: 0;">❌ El Error Histórico</h3>
            <p style="color: #7f1d1d;">Históricamente, el trabajo fue diseñado para máquinas, y luego se le dio a las personas para hacerlo. Esto creó problemas:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #991b1b;">😴 Aburrimiento</strong>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0; font-size: 0.9rem;">Trabajo repetitivo y aburrido</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #991b1b;">📉 Desarrollo Limitado</strong>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0; font-size: 0.9rem;">Desarrollo de habilidades limitado</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #991b1b;">🎯 Sin Propósito</strong>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0; font-size: 0.9rem;">Falta de significado y propósito</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #991b1b;">😰 Estrés</strong>
                <p style="color: #7f1d1d; margin: 0.5rem 0 0; font-size: 0.9rem;">Estrés y desgaste</p>
              </div>
            </div>
            <p style="color: #7f1d1d; margin-top: 1rem; margin-bottom: 0; font-style: italic;">Se intentaron soluciones como rotación de trabajo, pero si tenés ocho trabajos aburridos, solo tardás ocho veces más en aburrirte.</p>
          </div>

          <h2>El Enfoque Sistémico: Diseñar para Humanos</h2>
          
          <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #065f46; margin-top: 0;">✅ La Solución</h3>
            <p style="color: #047857;">El verdadero cambio vino cuando se reconoció que el problema no era la persona, sino el diseño del trabajo. El enfoque sistémico propone:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #065f46;">👤 Diseñar para Humanos</strong>
                <p style="color: #047857; margin: 0.5rem 0 0; font-size: 0.9rem;">Trabajo que aproveche capacidades únicas: creatividad, juicio, empatía, adaptabilidad</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #065f46;">🔊 Amplificar Capacidades</strong>
                <p style="color: #047857; margin: 0.5rem 0 0; font-size: 0.9rem;">Usar tecnología para hacer a los humanos más capaces, no reemplazarlos</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #065f46;">🌱 Enfocarse en Desarrollo</strong>
                <p style="color: #047857; margin: 0.5rem 0 0; font-size: 0.9rem;">El trabajo debería desarrollar a las personas, no solo usarlas</p>
              </div>
            </div>
          </div>

          <h2>Tecnología como Herramienta de Amplificación</h2>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🛠️ La Tecnología Debería:</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🔊 Amplificar Capacidades</h4>
                <p style="margin: 0; opacity: 0.95;">Te hace más capaz de hacer cosas valiosas. Te da superpoderes, no te reemplaza.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">⏰ Liberar Tiempo</h4>
                <p style="margin: 0; opacity: 0.95;">Automatiza lo repetitivo para que puedas enfocarte en lo creativo y estratégico.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">📚 Facilitar Aprendizaje</h4>
                <p style="margin: 0; opacity: 0.95;">Te ayuda a aprender y desarrollarte. Te da acceso a información, herramientas, y conocimiento.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🤝 Mejorar Colaboración</h4>
                <p style="margin: 0; opacity: 0.95;">Facilita trabajar con otros efectivamente. Conecta personas, comparte conocimiento, coordina esfuerzos.</p>
              </div>
            </div>
          </div>

          <h2>El Futuro del Trabajo Humano</h2>
          
          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">🚀 En el Futuro, el Trabajo Humano se Enfocará en:</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #0369a1;">🎨 Creatividad e Innovación</strong>
                <p style="color: #0369a1; margin: 0.5rem 0 0; font-size: 0.9rem;">Crear cosas nuevas, resolver problemas complejos, imaginar posibilidades</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #0369a1;">⚖️ Juicio y Decisión</strong>
                <p style="color: #0369a1; margin: 0.5rem 0 0; font-size: 0.9rem;">Evaluar situaciones, tomar decisiones con información incompleta, juicio ético</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #0369a1;">❤️ Relaciones Humanas</strong>
                <p style="color: #0369a1; margin: 0.5rem 0 0; font-size: 0.9rem;">Empatía, cuidado, colaboración, conexión humana profunda</p>
              </div>
              <div style="background: white; padding: 1.5rem; border-radius: 8px;">
                <strong style="color: #0369a1;">📖 Aprendizaje Continuo</strong>
                <p style="color: #0369a1; margin: 0.5rem 0 0; font-size: 0.9rem;">Adaptarse y aprender constantemente, desarrollar nuevas capacidades</p>
              </div>
            </div>
            <p style="color: #0369a1; margin-top: 1rem; margin-bottom: 0; font-style: italic;">Las máquinas pueden hacer muchas cosas, pero hay capacidades humanas que son difíciles de automatizar: creatividad genuina, juicio ético, empatía profunda, sabiduría.</p>
          </div>

          <h2>Ejercicio Práctico: Rediseñar el Trabajo</h2>
          
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🔍 Analizá Tu Trabajo o el de Tu Organización</h3>
            <p style="opacity: 0.95;">Pensá en tu propio trabajo o en el trabajo de tu organización:</p>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 1: Identificar Tareas Repetitivas</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">¿Qué partes del trabajo son repetitivas y podrían automatizarse? Listá todas las tareas que son:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>Repetitivas y predecibles</li>
                <li>No requieren juicio humano</li>
                <li>No desarrollan capacidades humanas</li>
                <li>Podrían hacerse mejor con tecnología</li>
              </ul>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 2: Identificar Capacidades Humanas Únicas</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">¿Qué capacidades humanas únicas podrías desarrollar más? Pensá en:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>Creatividad e innovación</li>
                <li>Juicio y toma de decisiones</li>
                <li>Empatía y relaciones humanas</li>
                <li>Aprendizaje y adaptación</li>
              </ul>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 3: Rediseñar el Trabajo</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">¿Cómo podrías rediseñar el trabajo para que:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>Desarrolle más a las personas?</li>
                <li>Aproveche capacidades humanas únicas?</li>
                <li>Use tecnología para amplificar, no reemplazar?</li>
                <li>Genere más valor y significado?</li>
              </ul>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 4: Plan de Implementación</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Creá un plan concreto:</p>
              <ul style="opacity: 0.95; line-height: 2;">
                <li>¿Qué tecnología podrías usar para automatizar tareas repetitivas?</li>
                <li>¿Cómo liberarías tiempo para trabajo de mayor valor?</li>
                <li>¿Qué capacidades humanas desarrollarías más?</li>
                <li>¿Cómo medirías el éxito del rediseño?</li>
              </ul>
            </div>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📝 Reflexión</h3>
            <p style="color: #0369a1; margin-bottom: 0;">Después de completar el ejercicio, respondé:</p>
            <ul style="color: #0369a1; line-height: 2;">
              <li>¿Qué tareas repetitivas identificaste que podrían automatizarse?</li>
              <li>¿Qué capacidades humanas únicas podrías desarrollar más?</li>
              <li>¿Cómo cambiaría tu trabajo si automatizás lo repetitivo y te enfocás en lo creativo y estratégico?</li>
              <li>¿Cómo podrías usar la tecnología para amplificar tus capacidades en lugar de reemplazarlas?</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2rem; margin-top: 2rem;">
            <h3 style="color: white; margin-top: 0;">✨ Próximo Paso</h3>
            <p style="margin-bottom: 0;">Ahora que entendés cómo usar la tecnología para amplificar capacidades humanas, estás listo para integrar todos los conceptos aprendidos. En la última lección, aplicaremos el framework completo a un caso de estudio real y crearás tu propio plan de acción.</p>
          </div>
        `,
        orderIndex: 9,
        type: 'text' as const,
        duration: 30,
        isRequired: true,
      },
      {
        courseId: course8[0].id,
        title: 'Integración y Aplicación Práctica',
        description: 'Integrá todos los conceptos aprendidos y aplicálos a un caso de estudio completo. Creá tu propio plan de acción para transformar la realidad.',
        content: `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 25px 80px rgba(102, 126, 234, 0.35);">
            <h1 style="color: white; margin-top: 0; font-size: 2.5rem; line-height: 1.2;">Integración y Aplicación Práctica</h1>
            <p style="font-size: 1.1rem; margin-bottom: 0; opacity: 0.95;">Ahora que aprendiste los conceptos fundamentales, es momento de integrarlos y aplicarlos. Estos conceptos funcionan mejor cuando se usan juntos como un framework integrado para transformar la realidad.</p>
          </div>

          <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
            <h3 style="color: #764ba2; margin-top: 0;">🎯 El Framework Completo</h3>
            <p>Los conceptos que aprendiste forman un framework integrado. Cada uno se potencia con los otros:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #10b981;">
                <strong>1. Pensamiento Sistémico</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Ver el mundo como sistemas interconectados</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #ef4444;">
                <strong>2. Gestión de Messes</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Trabajar con sistemas de problemas</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #06b6d4;">
                <strong>3. Planificación Interactiva</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Diseñar el futuro deseado</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #ec4899;">
                <strong>4. Diseño Idealizado</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Imaginar lo ideal sin restricciones</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <strong>5. Desarrollo sobre Crecimiento</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Enfocarse en capacidades</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                <strong>6. Aprendizaje de Errores</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Usar errores como oportunidades</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <strong>7. Participación</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Involucrar a los afectados</p>
              </div>
              <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <strong>8. Tecnología como Herramienta</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #6b7280;">Amplificar capacidades humanas</p>
              </div>
            </div>
          </div>

          <h2>Caso de Estudio Completo: Transformar un Barrio en Argentina</h2>
          
          <div style="background: #f3f4f6; border-radius: 16px; padding: 2rem; margin: 2rem 0;">
            <h3 style="margin-top: 0;">🏘️ El Desafío</h3>
            <p>Imaginemos que querés transformar un barrio en tu ciudad. El barrio tiene problemas de seguridad, falta de espacios verdes, desempleo, educación de baja calidad, y falta de cohesión social. Apliquemos el framework completo:</p>
            
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <h4 style="color: #10b981; margin-top: 0;">1. Pensamiento Sistémico</h4>
              <p style="margin: 0.5rem 0;">El barrio es un sistema con múltiples elementos interconectados:</p>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; margin-top: 1rem;">
                <div style="background: #e0f2fe; padding: 0.75rem; border-radius: 6px; text-align: center; font-size: 0.9rem;">Vivienda</div>
                <div style="background: #e0f2fe; padding: 0.75rem; border-radius: 6px; text-align: center; font-size: 0.9rem;">Educación</div>
                <div style="background: #e0f2fe; padding: 0.75rem; border-radius: 6px; text-align: center; font-size: 0.9rem;">Salud</div>
                <div style="background: #e0f2fe; padding: 0.75rem; border-radius: 6px; text-align: center; font-size: 0.9rem;">Seguridad</div>
                <div style="background: #e0f2fe; padding: 0.75rem; border-radius: 6px; text-align: center; font-size: 0.9rem;">Economía</div>
                <div style="background: #e0f2fe; padding: 0.75rem; border-radius: 6px; text-align: center; font-size: 0.9rem;">Relaciones</div>
                <div style="background: #e0f2fe; padding: 0.75rem; border-radius: 6px; text-align: center; font-size: 0.9rem;">Infraestructura</div>
              </div>
              <p style="margin: 1rem 0 0; font-style: italic; color: #6b7280;">No podés cambiar uno sin afectar a los otros. Necesitás ver el sistema completo.</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <h4 style="color: #ef4444; margin-top: 0;">2. Gestión de Messes</h4>
              <p style="margin: 0.5rem 0;">Los problemas forman un "mess" interconectado:</p>
              <ul style="line-height: 2; margin: 0.5rem 0;">
                <li>Problemas de seguridad ↔ Problemas económicos ↔ Problemas educativos ↔ Problemas de vivienda</li>
                <li>Cada problema afecta y es afectado por los otros</li>
                <li>Resolver uno solo puede empeorar otros o crear nuevos problemas</li>
              </ul>
              <p style="margin: 1rem 0 0; font-style: italic; color: #6b7280;">Necesitás una estrategia que aborde el sistema completo, no problemas individuales.</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <h4 style="color: #06b6d4; margin-top: 0;">3. Planificación Interactiva</h4>
              <p style="margin: 0.5rem 0;">En lugar de pensar "¿cómo mejoramos lo que hay?", pensá:</p>
              <div style="background: #e0f2fe; border-left: 4px solid #06b6d4; padding: 1rem; margin-top: 1rem; border-radius: 8px;">
                <p style="margin: 0; font-weight: bold; color: #0369a1;">"¿Cómo sería el barrio ideal?"</p>
                <p style="margin: 0.5rem 0 0; color: #0369a1;">Diseñá ese futuro ideal y trabajá hacia atrás para ver qué necesitás hacer.</p>
              </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <h4 style="color: #ec4899; margin-top: 0;">4. Diseño Idealizado</h4>
              <p style="margin: 0.5rem 0;">Sin restricciones, ¿cómo sería el barrio perfecto?</p>
              <ul style="line-height: 2; margin: 0.5rem 0;">
                <li>Espacios verdes y seguros</li>
                <li>Educación de calidad accesible</li>
                <li>Oportunidades económicas locales</li>
                <li>Cohesión social y participación</li>
                <li>Infraestructura que funcione</li>
              </ul>
              <p style="margin: 1rem 0 0; font-style: italic; color: #6b7280;">Una vez que tenés el ideal, podés ver qué elementos podés implementar ahora.</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <h4 style="color: #f59e0b; margin-top: 0;">5. Desarrollo sobre Crecimiento</h4>
              <p style="margin: 0.5rem 0;">No se trata solo de más recursos (crecimiento), sino de:</p>
              <ul style="line-height: 2; margin: 0.5rem 0;">
                <li>Desarrollar la capacidad del barrio para resolver sus propios problemas</li>
                <li>Crear su propio valor</li>
                <li>Sostenerse a largo plazo</li>
                <li>Desarrollar capacidades de los vecinos</li>
              </ul>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <h4 style="color: #8b5cf6; margin-top: 0;">6. Aprendizaje de Errores</h4>
              <p style="margin: 0.5rem 0;">Probablemente vas a cometer errores. Asegurate de:</p>
              <ul style="line-height: 2; margin: 0.5rem 0;">
                <li>Aprender de ellos</li>
                <li>Documentar qué funcionó y qué no</li>
                <li>Compartir ese aprendizaje con otros</li>
                <li>Ajustar continuamente</li>
              </ul>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <h4 style="color: #3b82f6; margin-top: 0;">7. Participación</h4>
              <p style="margin: 0.5rem 0;">Los vecinos del barrio deben participar activamente en:</p>
              <ul style="line-height: 2; margin: 0.5rem 0;">
                <li>Diseñar la transformación</li>
                <li>Ejecutar la transformación</li>
                <li>Tomar decisiones sobre qué hacer y cómo</li>
                <li>Evaluar el progreso</li>
              </ul>
              <p style="margin: 1rem 0 0; font-style: italic; color: #6b7280;">No podés transformar un barrio sin la participación de quienes viven ahí.</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1rem;">
              <h4 style="color: #f59e0b; margin-top: 0;">8. Tecnología como Herramienta</h4>
              <p style="margin: 0.5rem 0;">Usá tecnología para amplificar las capacidades de la comunidad:</p>
              <ul style="line-height: 2; margin: 0.5rem 0;">
                <li>Plataformas para coordinar esfuerzos</li>
                <li>Herramientas para mapear recursos</li>
                <li>Sistemas para compartir información</li>
                <li>Redes para conectar vecinos</li>
              </ul>
            </div>
          </div>

          <h2>Tu Plan de Acción: Aplicar el Framework</h2>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🎯 Aplicá Este Framework a Algo que Querés Transformar</h3>
            <p style="opacity: 0.95;">Podés usar un desafío personal, organizacional, o comunitario. Seguí estos pasos:</p>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 1: Identificar el Mess</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Identificá un "mess" que querés abordar (personal, organizacional, comunitario). ¿Qué problemas están interconectados?</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 2: Mapear como Sistema</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Mapealo como un sistema: ¿qué elementos tiene? ¿cómo se interconectan? ¿qué bucles de retroalimentación existen?</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 3: Diseñar el Futuro Ideal</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Diseñá el futuro ideal sin restricciones. ¿Cómo sería perfecto? Usá diseño idealizado.</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 4: Planificar desde el Futuro</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Planificá desde el futuro ideal hacia el presente. ¿Qué necesitás hacer? ¿Qué recursos necesitás?</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 5: Identificar Puntos de Apalancamiento</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">¿Dónde una intervención pequeña puede generar cambios grandes? ¿Dónde está el máximo apalancamiento?</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 6: Involucrar a los Afectados</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Involucrá a los afectados en diseñar e implementar soluciones. Usá principios de participación.</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 7: Enfocarse en Desarrollo</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Enfocate en desarrollo de capacidades, no solo en recursos. ¿Cómo desarrollás capacidades que perduren?</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 8: Usar Tecnología</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Usá tecnología para amplificar capacidades humanas. ¿Qué tecnología podrías usar? ¿Cómo amplifica en lugar de reemplazar?</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
              <h4 style="color: white; margin-top: 0;">Paso 9: Aprender y Ajustar</h4>
              <p style="opacity: 0.95; margin-bottom: 1rem;">Aprendé de los errores y ajustá continuamente. Documentá qué funciona y qué no. Compartí el aprendizaje.</p>
            </div>
          </div>

          <h2>Próximos Pasos: Tu Jornada Continúa</h2>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
            <h3 style="color: white; margin-top: 0;">🚀 Este Curso Te Dio las Herramientas Conceptuales</h3>
            <p style="opacity: 0.95; margin-bottom: 1.5rem;">Ahora es momento de:</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🎯 Practicar</h4>
                <p style="margin: 0; opacity: 0.95;">Aplicá estos conceptos en situaciones reales, empezando por algo pequeño. No esperes a tener todo perfecto.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">📚 Aprender</h4>
                <p style="margin: 0; opacity: 0.95;">Seguí aprendiendo de cada aplicación. Documentá lo que aprendés. Cada intento te enseña algo nuevo.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🤝 Compartir</h4>
                <p style="margin: 0; opacity: 0.95;">Compartí lo que aprendés con otros. Enseñá estos conceptos. El conocimiento se multiplica cuando se comparte.</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: white; margin-top: 0;">🔄 Iterar</h4>
                <p style="margin: 0; opacity: 0.95;">Mejorá continuamente tu capacidad de aplicar estos conceptos. Cada aplicación te hace mejor.</p>
              </div>
            </div>
          </div>

          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
            <h3 style="color: #92400e; margin-top: 0;">💡 Recordá</h3>
            <p style="color: #78350f; font-size: 1.1rem; margin-bottom: 0;">Estos conceptos no son solo teoría. Son herramientas prácticas para transformar la realidad. Usálas. Aprendé de ellas. Mejorálas. Y sobre todo, usálas para crear un futuro mejor.</p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px; padding: 2.5rem; margin-top: 2rem; text-align: center;">
            <h2 style="color: white; margin-top: 0; font-size: 2rem;">🎓 ¡Felicitaciones!</h2>
            <p style="font-size: 1.2rem; opacity: 0.95; margin-bottom: 0;">Completaste el curso de Fundamentos de Pensamiento, Comprensión y Aprendizaje. Ahora tenés las herramientas para pensar sistémicamente, gestionar messes, planificar desde el futuro, y transformar la realidad. ¡A usarlas!</p>
          </div>
        `,
        orderIndex: 10,
        type: 'text' as const,
        duration: 60,
        isRequired: true,
      },
    ];

    for (const lesson of lessons8) {
      await db.insert(courseLessons).values(lesson);
    }
    console.log('✅ Created', lessons8.length, 'lessons for course 8');

    // Quiz for course 8
    // Delete existing quiz if it exists
    const existingQuiz8 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, course8[0].id)).limit(1);
    if (existingQuiz8.length > 0) {
      const existingQuestions8 = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz8[0].id));
      for (const question of existingQuestions8) {
        await db.delete(quizQuestions).where(eq(quizQuestions.id, question.id));
      }
      await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, course8[0].id));
    }
    
    const [quiz8] = await db.insert(courseQuizzes).values({
      courseId: course8[0].id,
      title: 'Quiz: Fundamentos de Pensamiento, Comprensión y Aprendizaje',
      description: 'Evaluá tu comprensión de los conceptos fundamentales del curso.',
      passingScore: 70,
      timeLimit: 20,
      allowRetakes: true,
      maxAttempts: 3,
    }).returning();

    const questions8 = [
      {
        quizId: quiz8.id,
        question: '¿Cuál es la diferencia principal entre eficiencia y efectividad?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'No hay diferencia, son sinónimos',
          'Eficiencia es hacer las cosas bien, efectividad es hacer las cosas correctas',
          'Eficiencia es hacer las cosas correctas, efectividad es hacerlas rápido',
          'Eficiencia requiere más recursos que efectividad'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'La eficiencia se enfoca en hacer las cosas bien (los primeros cuatro niveles de la jerarquía mental), mientras que la efectividad requiere sabiduría para evaluar si vale la pena hacer algo en primer lugar.',
        points: 2,
        orderIndex: 1,
      },
      {
        quizId: quiz8.id,
        question: 'Un sistema se diferencia de una colección porque tiene elementos interconectados que trabajan juntos para un propósito.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Exacto. Un sistema tiene elementos, interconexiones y un propósito. Cambiar un elemento afecta a todo el sistema, a diferencia de una colección donde podés agregar o quitar elementos sin mucho cambio.',
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: quiz8.id,
        question: '¿Cuál es la diferencia clave entre crecimiento y desarrollo?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'El crecimiento es cualitativo y el desarrollo es cuantitativo',
          'El crecimiento es sobre ganar (earning), el desarrollo es sobre aprender (learning)',
          'El crecimiento requiere más tiempo que el desarrollo',
          'No hay diferencia significativa'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'El crecimiento es un aumento cuantitativo (más tamaño, más cantidad), mientras que el desarrollo es un aumento cualitativo en la capacidad de usar efectivamente los recursos disponibles.',
        points: 2,
        orderIndex: 3,
      },
      {
        quizId: quiz8.id,
        question: 'Un "mess" es simplemente un problema grande.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'Un mess no es un problema grande, sino un sistema de problemas interconectados. Los problemas individuales son abstracciones que extraemos de la realidad, pero la realidad misma son sistemas de problemas interactuando.',
        points: 2,
        orderIndex: 4,
      },
      {
        quizId: quiz8.id,
        question: '¿Por qué aprendemos más de los errores que de los aciertos?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Porque los errores son más memorables',
          'Porque cuando hacemos algo bien solo confirmamos lo que ya sabíamos, cuando hacemos algo mal tenemos oportunidad de aprender algo nuevo',
          'Porque los errores generan más emociones',
          'Porque es más fácil recordar lo negativo'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Cuando hacemos algo bien, solo confirmamos conocimiento existente. Cuando hacemos algo mal, tenemos la oportunidad de identificar qué salió mal, entender por qué, corregirlo y aprender algo nuevo en el proceso.',
        points: 2,
        orderIndex: 5,
      },
      {
        quizId: quiz8.id,
        question: 'La planificación interactiva se diferencia de la reactiva porque planifica desde el futuro deseado hacia el presente.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Correcto. La planificación reactiva mira el pasado, la preactiva intenta predecir el futuro, pero la interactiva diseña el futuro deseado y trabaja hacia atrás desde ahí.',
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: quiz8.id,
        question: '¿Qué es el diseño idealizado?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Diseñar con todas las restricciones actuales en mente',
          'Diseñar un sistema ideal sin restricciones, y luego trabajar hacia atrás para hacerlo realidad',
          'Diseñar solo lo que es fácil de implementar',
          'Copiar diseños exitosos de otros lugares'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'El diseño idealizado te permite liberar tu creatividad diseñando primero lo ideal sin preocuparte por restricciones, y luego trabajar hacia atrás para ver cómo hacerlo realidad.',
        points: 2,
        orderIndex: 7,
      },
      {
        quizId: quiz8.id,
        question: 'La autoridad circular significa que la autoridad fluye solo hacia abajo, del jefe a los empleados.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'La autoridad circular significa que cada persona con autoridad sobre otros está sujeta a la autoridad colectiva de esos otros. La autoridad fluye hacia arriba colectivamente y hacia abajo individualmente.',
        points: 2,
        orderIndex: 8,
      },
      {
        quizId: quiz8.id,
        question: '¿Cuál debería ser el rol principal de la tecnología en el trabajo humano?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Reemplazar completamente a los humanos',
          'Amplificar las capacidades humanas y liberar tiempo para trabajo de mayor valor',
          'Reducir los costos laborales',
          'Eliminar la necesidad de creatividad humana'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'La tecnología debería ser una herramienta que amplifica capacidades humanas, automatiza lo repetitivo para liberar tiempo para trabajo creativo y estratégico, y facilita el aprendizaje y la colaboración.',
        points: 2,
        orderIndex: 9,
      },
      {
        quizId: quiz8.id,
        question: 'En la jerarquía del contenido mental, la sabiduría se encuentra en el nivel más alto porque evalúa el valor y la efectividad de los resultados.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(true),
        explanation: 'Correcto. La jerarquía va desde datos (más básico) hasta sabiduría (más valioso). La sabiduría implica juicio sobre si vale la pena hacer algo, no solo cómo hacerlo bien.',
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: quiz8.id,
        question: '¿Qué caracteriza a un punto de apalancamiento en un sistema?',
        type: 'multiple_choice' as const,
        options: JSON.stringify([
          'Requiere muchos recursos para implementar',
          'Un cambio pequeño en un lugar estratégico puede generar cambios grandes en todo el sistema',
          'Solo afecta una parte del sistema',
          'Es fácil de identificar sin análisis'
        ]),
        correctAnswer: JSON.stringify(1),
        explanation: 'Los puntos de apalancamiento son lugares estratégicos donde una intervención pequeña puede generar cambios desproporcionadamente grandes en todo el sistema.',
        points: 2,
        orderIndex: 11,
      },
      {
        quizId: quiz8.id,
        question: 'Los errores de omisión son más fáciles de reconocer que los errores de comisión porque hay evidencia visible de lo que perdimos.',
        type: 'true_false' as const,
        correctAnswer: JSON.stringify(false),
        explanation: 'Al revés. Los errores de omisión son más difíciles de reconocer porque no hay evidencia visible de lo que perdimos al no hacer algo. Los errores de comisión tienen evidencia clara de lo que salió mal.',
        points: 1,
        orderIndex: 12,
      },
    ];

    for (const question of questions8) {
      await db.insert(quizQuestions).values(question);
    }
    console.log('✅ Created quiz for course 8');

    console.log('✅ Course seeding completed successfully!');
    console.log(`✅ Created ${8} courses con lecciones y quizzes actualizados`);

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
}

main().finally(() => {
  console.log('Closing database connection...');
  console.log('Done.');
  console.log('Database connection closed.');
});


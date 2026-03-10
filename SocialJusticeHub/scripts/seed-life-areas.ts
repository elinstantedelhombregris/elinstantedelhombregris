// replaced
import { db } from './db-neon';
import * as schema from '../shared/schema';

// Definición de las 12 áreas de vida con sus subcategorías
const lifeAreasData = [
  {
    name: 'Salud',
    description: 'Bienestar físico y mental',
    iconName: 'Heart',
    orderIndex: 1,
    colorTheme: JSON.stringify({ primary: '#ef4444', secondary: '#fca5a5' }),
    subcategories: [
      { name: 'Ejercicio físico', description: 'Actividad física regular', orderIndex: 1 },
      { name: 'Nutrición', description: 'Alimentación balanceada', orderIndex: 2 },
      { name: 'Higiene', description: 'Cuidado personal', orderIndex: 3 },
      { name: 'Salud mental', description: 'Bienestar emocional y psicológico', orderIndex: 4 },
      { name: 'Sueño', description: 'Descanso adecuado', orderIndex: 5 },
    ]
  },
  {
    name: 'Apariencia',
    description: 'Cuidado personal y estético',
    iconName: 'Sparkles',
    orderIndex: 2,
    colorTheme: JSON.stringify({ primary: '#a855f7', secondary: '#c084fc' }),
    subcategories: [
      { name: 'Cabello', description: 'Cuidado del cabello', orderIndex: 1 },
      { name: 'Piel', description: 'Cuidado de la piel', orderIndex: 2 },
      { name: 'Imagen corporal', description: 'Aceptación y confianza', orderIndex: 3 },
      { name: 'Moda / Estilo', description: 'Vestimenta y estilo personal', orderIndex: 4 },
      { name: 'Cuidado estético', description: 'Rutinas de belleza', orderIndex: 5 },
    ]
  },
  {
    name: 'Amor',
    description: 'Relaciones románticas y conexión',
    iconName: 'Heart',
    orderIndex: 3,
    colorTheme: JSON.stringify({ primary: '#ec4899', secondary: '#f9a8d4' }),
    subcategories: [
      { name: 'Amor romántico', description: 'Relaciones de pareja', orderIndex: 1 },
      { name: 'Pareja', description: 'Compañerismo y compromiso', orderIndex: 2 },
      { name: 'Tiempo de conexión', description: 'Momentos de calidad juntos', orderIndex: 3 },
      { name: 'Conexión física', description: 'Intimidad física', orderIndex: 4 },
      { name: 'Lealtad', description: 'Compromiso y fidelidad', orderIndex: 5 },
    ]
  },
  {
    name: 'Familia',
    description: 'Vínculos familiares y responsabilidades',
    iconName: 'Users',
    orderIndex: 4,
    colorTheme: JSON.stringify({ primary: '#f59e0b', secondary: '#fbbf24' }),
    subcategories: [
      { name: 'Tiempo en familia', description: 'Momentos compartidos', orderIndex: 1 },
      { name: 'Sistema de apoyo', description: 'Apoyo mutuo familiar', orderIndex: 2 },
      { name: 'Responsabilidad', description: 'Cumplimiento de deberes familiares', orderIndex: 3 },
      { name: 'Tradiciones', description: 'Rituales y costumbres familiares', orderIndex: 4 },
      { name: 'Confianza', description: 'Confianza y comunicación', orderIndex: 5 },
    ]
  },
  {
    name: 'Amigos',
    description: 'Relaciones sociales y amistades',
    iconName: 'UserPlus',
    orderIndex: 5,
    colorTheme: JSON.stringify({ primary: '#3b82f6', secondary: '#93c5fd' }),
    subcategories: [
      { name: 'Círculo social', description: 'Red de amistades', orderIndex: 1 },
      { name: 'Experiencias compartidas', description: 'Actividades con amigos', orderIndex: 2 },
      { name: 'Intercambio cultural', description: 'Aprendizaje mutuo', orderIndex: 3 },
      { name: 'Actividades sociales', description: 'Eventos y reuniones', orderIndex: 4 },
      { name: 'Apoyo', description: 'Apoyo mutuo entre amigos', orderIndex: 5 },
    ]
  },
  {
    name: 'Carrera',
    description: 'Desarrollo profesional',
    iconName: 'Briefcase',
    orderIndex: 6,
    colorTheme: JSON.stringify({ primary: '#10b981', secondary: '#6ee7b7' }),
    subcategories: [
      { name: 'Educación formal', description: 'Estudios y certificaciones', orderIndex: 1 },
      { name: 'Desarrollo de habilidades', description: 'Aprendizaje continuo', orderIndex: 2 },
      { name: 'Aprendizaje', description: 'Conocimiento y crecimiento', orderIndex: 3 },
      { name: 'Creación de redes (networking)', description: 'Contactos profesionales', orderIndex: 4 },
      { name: 'Equilibrio vida–trabajo', description: 'Balance personal-profesional', orderIndex: 5 },
    ]
  },
  {
    name: 'Dinero',
    description: 'Estabilidad financiera',
    iconName: 'DollarSign',
    orderIndex: 7,
    colorTheme: JSON.stringify({ primary: '#f59e0b', secondary: '#fbbf24' }),
    subcategories: [
      { name: 'Ingresos', description: 'Fuentes de ingresos', orderIndex: 1 },
      { name: 'Ahorros', description: 'Reserva de dinero', orderIndex: 2 },
      { name: 'Inversiones', description: 'Inversiones y crecimiento', orderIndex: 3 },
      { name: 'Planificación financiera', description: 'Presupuesto y planificación', orderIndex: 4 },
      { name: 'Independencia financiera', description: 'Libertad financiera', orderIndex: 5 },
    ]
  },
  {
    name: 'Crecimiento personal',
    description: 'Desarrollo y autoconocimiento',
    iconName: 'TrendingUp',
    orderIndex: 8,
    colorTheme: JSON.stringify({ primary: '#8b5cf6', secondary: '#a78bfa' }),
    subcategories: [
      { name: 'Propósito', description: 'Sentido de vida', orderIndex: 1 },
      { name: 'Hábitos', description: 'Rutinas positivas', orderIndex: 2 },
      { name: 'Desarrollo personal', description: 'Crecimiento individual', orderIndex: 3 },
      { name: 'Lectura', description: 'Lectura y aprendizaje', orderIndex: 4 },
      { name: 'Educación', description: 'Formación continua', orderIndex: 5 },
    ]
  },
  {
    name: 'Espiritualidad',
    description: 'Conexión interior y trascendencia',
    iconName: 'Sparkles',
    orderIndex: 9,
    colorTheme: JSON.stringify({ primary: '#6366f1', secondary: '#818cf8' }),
    subcategories: [
      { name: 'Meditación', description: 'Práctica meditativa', orderIndex: 1 },
      { name: 'Paz', description: 'Tranquilidad interior', orderIndex: 2 },
      { name: 'Compasión', description: 'Empatía y bondad', orderIndex: 3 },
      { name: 'Conexión con la naturaleza', description: 'Vínculo con el entorno', orderIndex: 4 },
      { name: 'Gratitud', description: 'Agradecimiento y reconocimiento', orderIndex: 5 },
    ]
  },
  {
    name: 'Recreación',
    description: 'Tiempo libre y diversión',
    iconName: 'Gamepad2',
    orderIndex: 10,
    colorTheme: JSON.stringify({ primary: '#14b8a6', secondary: '#5eead4' }),
    subcategories: [
      { name: 'Deporte', description: 'Actividades deportivas', orderIndex: 1 },
      { name: 'Relajación', description: 'Descanso y relajación', orderIndex: 2 },
      { name: 'Entretenimiento', description: 'Ocio y diversión', orderIndex: 3 },
      { name: 'Viajes', description: 'Exploración y viajes', orderIndex: 4 },
      { name: 'Pasatiempos', description: 'Hobbies e intereses', orderIndex: 5 },
    ]
  },
  {
    name: 'Entorno',
    description: 'Ambiente físico y organización',
    iconName: 'Home',
    orderIndex: 11,
    colorTheme: JSON.stringify({ primary: '#64748b', secondary: '#94a3b8' }),
    subcategories: [
      { name: 'Estética', description: 'Belleza del espacio', orderIndex: 1 },
      { name: 'Comodidad', description: 'Confort y bienestar', orderIndex: 2 },
      { name: 'Organización', description: 'Orden y estructura', orderIndex: 3 },
      { name: 'Mantenimiento', description: 'Cuidado del espacio', orderIndex: 4 },
      { name: 'Limpieza', description: 'Higiene del entorno', orderIndex: 5 },
    ]
  },
  {
    name: 'Comunidad',
    description: 'Participación y contribución social',
    iconName: 'Globe',
    orderIndex: 12,
    colorTheme: JSON.stringify({ primary: '#06b6d4', secondary: '#67e8f9' }),
    subcategories: [
      { name: 'Voluntariado', description: 'Servicio a otros', orderIndex: 1 },
      { name: 'Eventos locales', description: 'Participación comunitaria', orderIndex: 2 },
      { name: 'Ayudar a otros', description: 'Apoyo a la comunidad', orderIndex: 3 },
      { name: 'Responsabilidad social', description: 'Compromiso social', orderIndex: 4 },
      { name: 'Conexiones', description: 'Redes comunitarias', orderIndex: 5 },
    ]
  },
];

// Tabla de asignación de valores: Escala 1-10 a Puntos 0-100
const SCORE_MAPPING: Record<number, number> = {
  1: 5,    // 0-10 puntos
  2: 15,   // 11-20 puntos
  3: 25,   // 21-30 puntos
  4: 35,   // 31-40 puntos
  5: 50,   // 41-60 puntos
  6: 65,   // 61-70 puntos
  7: 75,   // 71-80 puntos
  8: 85,   // 81-90 puntos
  9: 95,   // 91-100 puntos
  10: 100, // 91-100 puntos
};

// Función para generar preguntas profundas usando The Mom Test framework
// Enfocadas en comportamiento pasado, específicos, sin sugerencias
function generateQuizQuestions(subcategoryId: number, subcategoryName: string, areaName: string) {
  // Mapeo de preguntas específicas por área y subcategoría
  const questionTemplates: Record<string, Record<string, { current: string; desired: string }>> = {
    'Salud': {
      'Ejercicio físico': {
        current: 'En los últimos 30 días, ¿cuántas veces realizaste actividad física que te hizo sudar o respirar más fuerte? (0 = ninguna, 10 = diario)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría realizar actividad física intensa? (0 = ninguna, 10 = diario)'
      },
      'Nutrición': {
        current: 'En la última semana, ¿cuántas comidas preparaste tú mismo con ingredientes frescos? (0 = ninguna, 10 = todas)',
        desired: 'En una semana ideal, ¿cuántas comidas te gustaría preparar con ingredientes frescos? (0 = ninguna, 10 = todas)'
      },
      'Higiene': {
        current: 'En los últimos 7 días, ¿cuántas veces completaste tu rutina completa de cuidado personal? (0 = ninguna, 10 = todas)',
        desired: 'En una semana ideal, ¿cuántas veces te gustaría completar tu rutina de cuidado personal? (0 = ninguna, 10 = todas)'
      },
      'Salud mental': {
        current: 'En el último mes, ¿cuántas veces dedicaste tiempo específico a actividades que mejoran tu bienestar emocional? (0 = ninguna, 10 = diario)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría dedicar tiempo a tu bienestar emocional? (0 = ninguna, 10 = diario)'
      },
      'Sueño': {
        current: 'En los últimos 7 días, ¿cuántas noches dormiste las horas que necesitas para sentirte descansado? (0 = ninguna, 10 = todas)',
        desired: 'En una semana ideal, ¿cuántas noches te gustaría dormir las horas necesarias? (0 = ninguna, 10 = todas)'
      }
    },
    'Apariencia': {
      'Cabello': {
        current: 'En el último mes, ¿cuántas veces te sentiste satisfecho con el estado de tu cabello? (0 = nunca, 10 = siempre)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría sentirte satisfecho con tu cabello? (0 = nunca, 10 = siempre)'
      },
      'Piel': {
        current: 'En los últimos 30 días, ¿cuántas veces seguiste una rutina específica de cuidado de la piel? (0 = ninguna, 10 = diario)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría seguir una rutina de cuidado de la piel? (0 = ninguna, 10 = diario)'
      },
      'Imagen corporal': {
        current: 'En la última semana, ¿cuántas veces te sentiste cómodo y confiado con tu apariencia física? (0 = nunca, 10 = siempre)',
        desired: 'En una semana ideal, ¿cuántas veces te gustaría sentirte cómodo con tu apariencia? (0 = nunca, 10 = siempre)'
      },
      'Moda / Estilo': {
        current: 'En el último mes, ¿cuántas veces usaste ropa que realmente refleja tu estilo personal? (0 = nunca, 10 = siempre)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría vestir según tu estilo personal? (0 = nunca, 10 = siempre)'
      },
      'Cuidado estético': {
        current: 'En los últimos 30 días, ¿cuántas veces dedicaste tiempo específico a tu cuidado estético? (0 = ninguna, 10 = diario)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría dedicar tiempo a tu cuidado estético? (0 = ninguna, 10 = diario)'
      }
    },
    'Amor': {
      'Amor romántico': {
        current: 'En el último mes, ¿cuántas veces experimentaste momentos de conexión emocional profunda con tu pareja? (0 = ninguna, 10 = diario)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría experimentar conexión emocional profunda? (0 = ninguna, 10 = diario)'
      },
      'Pareja': {
        current: 'En los últimos 30 días, ¿cuántas veces sentiste que tu relación de pareja está en un buen lugar? (0 = nunca, 10 = siempre)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría sentir que tu relación está en buen lugar? (0 = nunca, 10 = siempre)'
      },
      'Tiempo de conexión': {
        current: 'En la última semana, ¿cuántas horas dedicaste a actividades de calidad solo con tu pareja (sin distracciones)? (0 = ninguna, 10 = más de 20 horas)',
        desired: 'En una semana ideal, ¿cuántas horas te gustaría dedicar a tiempo de calidad con tu pareja? (0 = ninguna, 10 = más de 20 horas)'
      },
      'Conexión física': {
        current: 'En el último mes, ¿cuántas veces tuviste momentos de intimidad física que te satisfacieron? (0 = ninguna, 10 = más de 15 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría tener intimidad física satisfactoria? (0 = ninguna, 10 = más de 15 veces)'
      },
      'Lealtad': {
        current: 'En los últimos 30 días, ¿cuántas veces sentiste confianza total y compromiso mutuo en tu relación? (0 = nunca, 10 = siempre)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría sentir confianza total en tu relación? (0 = nunca, 10 = siempre)'
      }
    },
    'Familia': {
      'Tiempo en familia': {
        current: 'En la última semana, ¿cuántas horas dedicaste a actividades familiares sin distracciones (teléfono, trabajo, etc.)? (0 = ninguna, 10 = más de 15 horas)',
        desired: 'En una semana ideal, ¿cuántas horas te gustaría dedicar a tiempo familiar de calidad? (0 = ninguna, 10 = más de 15 horas)'
      },
      'Sistema de apoyo': {
        current: 'En el último mes, ¿cuántas veces recibiste o brindaste apoyo emocional o práctico dentro de tu familia? (0 = ninguna, 10 = más de 20 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría tener intercambio de apoyo familiar? (0 = ninguna, 10 = más de 20 veces)'
      },
      'Responsabilidad': {
        current: 'En los últimos 30 días, ¿cuántas veces cumpliste con tus responsabilidades familiares sin sentirte abrumado? (0 = nunca, 10 = siempre)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría cumplir tus responsabilidades familiares sin estrés? (0 = nunca, 10 = siempre)'
      },
      'Tradiciones': {
        current: 'En el último año, ¿cuántas tradiciones o rituales familiares mantuviste o creaste? (0 = ninguna, 10 = más de 10)',
        desired: 'En un año ideal, ¿cuántas tradiciones familiares te gustaría mantener o crear? (0 = ninguna, 10 = más de 10)'
      },
      'Confianza': {
        current: 'En el último mes, ¿cuántas veces tuviste conversaciones profundas y honestas con miembros de tu familia? (0 = ninguna, 10 = más de 15 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría tener conversaciones profundas familiares? (0 = ninguna, 10 = más de 15 veces)'
      }
    },
    'Amigos': {
      'Círculo social': {
        current: 'En el último mes, ¿cuántas personas cercanas consideras que son verdaderos amigos con quienes puedes contar? (0 = ninguna, 10 = más de 10)',
        desired: 'En un mes ideal, ¿cuántos amigos cercanos te gustaría tener? (0 = ninguno, 10 = más de 10)'
      },
      'Experiencias compartidas': {
        current: 'En los últimos 30 días, ¿cuántas actividades o experiencias compartiste con amigos? (0 = ninguna, 10 = más de 15)',
        desired: 'En un mes ideal, ¿cuántas experiencias te gustaría compartir con amigos? (0 = ninguna, 10 = más de 15)'
      },
      'Intercambio cultural': {
        current: 'En el último mes, ¿cuántas veces aprendiste algo nuevo o compartiste conocimiento con amigos? (0 = ninguna, 10 = más de 10 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría tener intercambio de conocimiento con amigos? (0 = ninguna, 10 = más de 10 veces)'
      },
      'Actividades sociales': {
        current: 'En los últimos 30 días, ¿cuántas veces asististe a eventos sociales o reuniones con amigos? (0 = ninguna, 10 = más de 10 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría participar en actividades sociales? (0 = ninguna, 10 = más de 10 veces)'
      },
      'Apoyo': {
        current: 'En el último mes, ¿cuántas veces recibiste o brindaste apoyo emocional o práctico a amigos? (0 = ninguna, 10 = más de 15 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría tener intercambio de apoyo con amigos? (0 = ninguna, 10 = más de 15 veces)'
      }
    },
    'Carrera': {
      'Educación formal': {
        current: 'En el último año, ¿cuántos cursos, certificaciones o estudios formales completaste o iniciaste? (0 = ninguno, 10 = más de 5)',
        desired: 'En un año ideal, ¿cuántos cursos o certificaciones te gustaría completar? (0 = ninguno, 10 = más de 5)'
      },
      'Desarrollo de habilidades': {
        current: 'En los últimos 30 días, ¿cuántas horas dedicaste a aprender o practicar habilidades profesionales nuevas? (0 = ninguna, 10 = más de 40 horas)',
        desired: 'En un mes ideal, ¿cuántas horas te gustaría dedicar al desarrollo de habilidades? (0 = ninguna, 10 = más de 40 horas)'
      },
      'Aprendizaje': {
        current: 'En el último mes, ¿cuántas veces dedicaste tiempo específico a leer, investigar o estudiar temas relacionados con tu carrera? (0 = ninguna, 10 = más de 20 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría dedicar tiempo al aprendizaje profesional? (0 = ninguna, 10 = más de 20 veces)'
      },
      'Creación de redes (networking)': {
        current: 'En los últimos 30 días, ¿cuántas conexiones profesionales nuevas estableciste o mantuviste? (0 = ninguna, 10 = más de 10)',
        desired: 'En un mes ideal, ¿cuántas conexiones profesionales te gustaría establecer o mantener? (0 = ninguna, 10 = más de 10)'
      },
      'Equilibrio vida–trabajo': {
        current: 'En la última semana, ¿cuántas veces lograste desconectarte completamente del trabajo fuera del horario laboral? (0 = nunca, 10 = siempre)',
        desired: 'En una semana ideal, ¿cuántas veces te gustaría lograr desconexión del trabajo? (0 = nunca, 10 = siempre)'
      }
    },
    'Dinero': {
      'Ingresos': {
        current: 'En el último mes, ¿qué tan satisfecho estás con la estabilidad y cantidad de tus ingresos? (0 = muy insatisfecho, 10 = muy satisfecho)',
        desired: 'En un mes ideal, ¿qué tan satisfecho te gustaría estar con tus ingresos? (0 = muy insatisfecho, 10 = muy satisfecho)'
      },
      'Ahorros': {
        current: 'En los últimos 30 días, ¿cuántas veces ahorraste dinero de manera consistente? (0 = ninguna, 10 = siempre que recibí ingresos)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría ahorrar dinero? (0 = ninguna, 10 = siempre que reciba ingresos)'
      },
      'Inversiones': {
        current: 'En el último año, ¿cuántas decisiones de inversión o crecimiento financiero tomaste activamente? (0 = ninguna, 10 = más de 5)',
        desired: 'En un año ideal, ¿cuántas decisiones de inversión te gustaría tomar? (0 = ninguna, 10 = más de 5)'
      },
      'Planificación financiera': {
        current: 'En los últimos 30 días, ¿cuántas veces revisaste o actualizaste tu presupuesto o plan financiero? (0 = ninguna, 10 = más de 10 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría revisar tu plan financiero? (0 = ninguna, 10 = más de 10 veces)'
      },
      'Independencia financiera': {
        current: 'En este momento, ¿qué tan cerca te sientes de tu objetivo de independencia financiera? (0 = muy lejos, 10 = muy cerca)',
        desired: 'En un futuro ideal, ¿qué tan cerca te gustaría estar de la independencia financiera? (0 = muy lejos, 10 = muy cerca)'
      }
    },
    'Crecimiento personal': {
      'Propósito': {
        current: 'En el último mes, ¿cuántas veces sentiste que estás viviendo según tu propósito o valores más profundos? (0 = nunca, 10 = siempre)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría sentir que vives según tu propósito? (0 = nunca, 10 = siempre)'
      },
      'Hábitos': {
        current: 'En los últimos 30 días, ¿cuántos días consecutivos mantuviste al menos un hábito positivo que te importa? (0 = ninguno, 10 = todos los días)',
        desired: 'En un mes ideal, ¿cuántos días te gustaría mantener tus hábitos positivos? (0 = ninguno, 10 = todos los días)'
      },
      'Desarrollo personal': {
        current: 'En el último mes, ¿cuántas veces dedicaste tiempo específico a actividades de crecimiento personal (reflexión, autoevaluación, etc.)? (0 = ninguna, 10 = más de 20 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría dedicar tiempo al desarrollo personal? (0 = ninguna, 10 = más de 20 veces)'
      },
      'Lectura': {
        current: 'En los últimos 30 días, ¿cuántas horas dedicaste a leer libros o artículos que contribuyen a tu crecimiento? (0 = ninguna, 10 = más de 30 horas)',
        desired: 'En un mes ideal, ¿cuántas horas te gustaría dedicar a la lectura de crecimiento? (0 = ninguna, 10 = más de 30 horas)'
      },
      'Educación': {
        current: 'En el último año, ¿cuántos cursos, talleres o experiencias de aprendizaje completaste fuera de lo formal? (0 = ninguno, 10 = más de 5)',
        desired: 'En un año ideal, ¿cuántas experiencias de aprendizaje te gustaría completar? (0 = ninguno, 10 = más de 5)'
      }
    },
    'Espiritualidad': {
      'Meditación': {
        current: 'En los últimos 30 días, ¿cuántas veces practicaste meditación, oración o momentos de quietud interior? (0 = ninguna, 10 = más de 25 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría practicar meditación o quietud? (0 = ninguna, 10 = más de 25 veces)'
      },
      'Paz': {
        current: 'En la última semana, ¿cuántas veces experimentaste momentos de paz interior o tranquilidad profunda? (0 = nunca, 10 = siempre)',
        desired: 'En una semana ideal, ¿cuántas veces te gustaría experimentar paz interior? (0 = nunca, 10 = siempre)'
      },
      'Compasión': {
        current: 'En el último mes, ¿cuántas veces actuaste con compasión o empatía hacia otros o hacia ti mismo? (0 = nunca, 10 = siempre)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría actuar con compasión? (0 = nunca, 10 = siempre)'
      },
      'Conexión con la naturaleza': {
        current: 'En los últimos 30 días, ¿cuántas veces pasaste tiempo consciente en la naturaleza (parques, campo, playa, etc.)? (0 = ninguna, 10 = más de 15 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría conectar con la naturaleza? (0 = ninguna, 10 = más de 15 veces)'
      },
      'Gratitud': {
        current: 'En la última semana, ¿cuántas veces expresaste o sentiste gratitud conscientemente? (0 = nunca, 10 = diario, múltiples veces)',
        desired: 'En una semana ideal, ¿cuántas veces te gustaría practicar la gratitud? (0 = nunca, 10 = diario, múltiples veces)'
      }
    },
    'Recreación': {
      'Deporte': {
        current: 'En los últimos 30 días, ¿cuántas veces practicaste algún deporte o actividad física recreativa? (0 = ninguna, 10 = más de 20 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría practicar deportes? (0 = ninguna, 10 = más de 20 veces)'
      },
      'Relajación': {
        current: 'En la última semana, ¿cuántas veces dedicaste tiempo específico a relajarte sin sentir culpa? (0 = nunca, 10 = diario)',
        desired: 'En una semana ideal, ¿cuántas veces te gustaría dedicar tiempo a la relajación? (0 = nunca, 10 = diario)'
      },
      'Entretenimiento': {
        current: 'En el último mes, ¿cuántas veces disfrutaste actividades de entretenimiento que realmente te llenaron? (0 = nunca, 10 = más de 15 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría disfrutar entretenimiento satisfactorio? (0 = nunca, 10 = más de 15 veces)'
      },
      'Viajes': {
        current: 'En el último año, ¿cuántos viajes o escapadas realizaste para recreación o exploración? (0 = ninguno, 10 = más de 5)',
        desired: 'En un año ideal, ¿cuántos viajes te gustaría realizar? (0 = ninguno, 10 = más de 5)'
      },
      'Pasatiempos': {
        current: 'En los últimos 30 días, ¿cuántas horas dedicaste a tus pasatiempos o hobbies favoritos? (0 = ninguna, 10 = más de 40 horas)',
        desired: 'En un mes ideal, ¿cuántas horas te gustaría dedicar a tus pasatiempos? (0 = ninguna, 10 = más de 40 horas)'
      }
    },
    'Entorno': {
      'Estética': {
        current: 'En este momento, ¿qué tan satisfecho estás con la estética y belleza de tus espacios (hogar, trabajo)? (0 = muy insatisfecho, 10 = muy satisfecho)',
        desired: 'En un estado ideal, ¿qué tan satisfecho te gustaría estar con la estética de tus espacios? (0 = muy insatisfecho, 10 = muy satisfecho)'
      },
      'Comodidad': {
        current: 'En la última semana, ¿cuántas veces te sentiste cómodo y a gusto en tus espacios? (0 = nunca, 10 = siempre)',
        desired: 'En una semana ideal, ¿cuántas veces te gustaría sentirte cómodo en tus espacios? (0 = nunca, 10 = siempre)'
      },
      'Organización': {
        current: 'En los últimos 30 días, ¿cuántas veces mantuviste tus espacios organizados y ordenados? (0 = nunca, 10 = siempre)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría mantener tus espacios organizados? (0 = nunca, 10 = siempre)'
      },
      'Mantenimiento': {
        current: 'En el último mes, ¿cuántas veces realizaste mantenimiento o mejoras a tus espacios? (0 = ninguna, 10 = más de 10 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría hacer mantenimiento de tus espacios? (0 = ninguna, 10 = más de 10 veces)'
      },
      'Limpieza': {
        current: 'En la última semana, ¿cuántas veces mantuviste tus espacios en un nivel de limpieza que te satisface? (0 = nunca, 10 = siempre)',
        desired: 'En una semana ideal, ¿cuántas veces te gustaría mantener tus espacios limpios? (0 = nunca, 10 = siempre)'
      }
    },
    'Comunidad': {
      'Voluntariado': {
        current: 'En el último año, ¿cuántas horas dedicaste a actividades de voluntariado o servicio comunitario? (0 = ninguna, 10 = más de 100 horas)',
        desired: 'En un año ideal, ¿cuántas horas te gustaría dedicar al voluntariado? (0 = ninguna, 10 = más de 100 horas)'
      },
      'Eventos locales': {
        current: 'En los últimos 30 días, ¿cuántas veces participaste en eventos o actividades de tu comunidad local? (0 = ninguna, 10 = más de 10 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría participar en eventos comunitarios? (0 = ninguna, 10 = más de 10 veces)'
      },
      'Ayudar a otros': {
        current: 'En el último mes, ¿cuántas veces ayudaste activamente a alguien de tu comunidad (vecinos, conocidos, etc.)? (0 = ninguna, 10 = más de 15 veces)',
        desired: 'En un mes ideal, ¿cuántas veces te gustaría ayudar a otros en tu comunidad? (0 = ninguna, 10 = más de 15 veces)'
      },
      'Responsabilidad social': {
        current: 'En el último año, ¿cuántas acciones tomaste relacionadas con causas sociales o comunitarias que te importan? (0 = ninguna, 10 = más de 10)',
        desired: 'En un año ideal, ¿cuántas acciones sociales te gustaría tomar? (0 = ninguna, 10 = más de 10)'
      },
      'Conexiones': {
        current: 'En los últimos 30 días, ¿cuántas conexiones nuevas estableciste con personas de tu comunidad? (0 = ninguna, 10 = más de 10)',
        desired: 'En un mes ideal, ¿cuántas conexiones comunitarias te gustaría establecer? (0 = ninguna, 10 = más de 10)'
      }
    }
  };

  // Obtener preguntas específicas o usar genéricas
  const specificQuestions = questionTemplates[areaName]?.[subcategoryName];
  
  if (specificQuestions) {
    return [
      {
        questionText: specificQuestions.current,
        questionType: 'scale' as const,
        orderIndex: 1,
        category: 'current' as const,
        subcategoryId,
      },
      {
        questionText: specificQuestions.desired,
        questionType: 'scale' as const,
        orderIndex: 2,
        category: 'desired' as const,
        subcategoryId,
      },
    ];
  }

  // Fallback a preguntas genéricas mejoradas
  return [
    {
      questionText: `En los últimos 30 días, ¿con qué frecuencia experimentaste ${subcategoryName.toLowerCase()} de manera satisfactoria? (0 = nunca, 10 = siempre)`,
      questionType: 'scale' as const,
      orderIndex: 1,
      category: 'current' as const,
      subcategoryId,
    },
    {
      questionText: `En un mes ideal, ¿con qué frecuencia te gustaría experimentar ${subcategoryName.toLowerCase()} de manera satisfactoria? (0 = nunca, 10 = siempre)`,
      questionType: 'scale' as const,
      orderIndex: 2,
      category: 'desired' as const,
      subcategoryId,
    },
  ];
}

// Acciones recomendadas predefinidas por área
const actionsByArea: Record<string, Array<{
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  priority: number;
  category: string;
  xpReward: number;
  seedReward: number;
}>> = {
  'Salud': [
    { title: 'Caminar 30 minutos diarios', description: 'Inicia una rutina de caminata diaria de 30 minutos', difficulty: 'beginner', estimatedDuration: '30 min', priority: 10, category: 'Ejercicio', xpReward: 50, seedReward: 10 },
    { title: 'Planificar comidas saludables', description: 'Crea un plan de comidas semanal balanceado', difficulty: 'beginner', estimatedDuration: '1 hora', priority: 9, category: 'Nutrición', xpReward: 75, seedReward: 15 },
    { title: 'Establecer rutina de sueño', description: 'Duerme 7-8 horas a la misma hora cada día', difficulty: 'beginner', estimatedDuration: '8 horas', priority: 8, category: 'Sueño', xpReward: 100, seedReward: 20 },
    { title: 'Practicar meditación 10 minutos', description: 'Dedica 10 minutos diarios a la meditación', difficulty: 'beginner', estimatedDuration: '10 min', priority: 7, category: 'Salud mental', xpReward: 60, seedReward: 12 },
    { title: 'Ejercicio intenso 3 veces por semana', description: 'Realiza ejercicio de alta intensidad 3 veces por semana', difficulty: 'advanced', estimatedDuration: '45 min', priority: 6, category: 'Ejercicio', xpReward: 200, seedReward: 40 },
  ],
  'Apariencia': [
    { title: 'Establecer rutina de cuidado de piel', description: 'Crea una rutina diaria de cuidado facial', difficulty: 'beginner', estimatedDuration: '15 min', priority: 8, category: 'Piel', xpReward: 50, seedReward: 10 },
    { title: 'Revisar y actualizar guardarropa', description: 'Organiza tu ropa y dona lo que no uses', difficulty: 'intermediate', estimatedDuration: '2 horas', priority: 7, category: 'Moda', xpReward: 100, seedReward: 20 },
    { title: 'Aprender nuevo estilo de peinado', description: 'Investiga y prueba un nuevo estilo de cabello', difficulty: 'beginner', estimatedDuration: '30 min', priority: 6, category: 'Cabello', xpReward: 40, seedReward: 8 },
  ],
  'Amor': [
    { title: 'Planificar cita romántica', description: 'Organiza una cita especial con tu pareja', difficulty: 'beginner', estimatedDuration: '3 horas', priority: 9, category: 'Tiempo de conexión', xpReward: 100, seedReward: 20 },
    { title: 'Expresar gratitud diaria', description: 'Expresa algo por lo que estés agradecido cada día', difficulty: 'beginner', estimatedDuration: '5 min', priority: 8, category: 'Conexión', xpReward: 50, seedReward: 10 },
  ],
  'Familia': [
    { title: 'Cena familiar semanal', description: 'Organiza una cena familiar una vez por semana', difficulty: 'beginner', estimatedDuration: '2 horas', priority: 9, category: 'Tiempo en familia', xpReward: 100, seedReward: 20 },
    { title: 'Llamar a un familiar', description: 'Llama a un familiar con quien no hables frecuentemente', difficulty: 'beginner', estimatedDuration: '30 min', priority: 7, category: 'Conexión', xpReward: 50, seedReward: 10 },
  ],
  'Amigos': [
    { title: 'Organizar reunión con amigos', description: 'Planifica una reunión con tu grupo de amigos', difficulty: 'beginner', estimatedDuration: '3 horas', priority: 8, category: 'Actividades sociales', xpReward: 75, seedReward: 15 },
    { title: 'Hacer un nuevo amigo', description: 'Participa en una actividad para conocer nuevas personas', difficulty: 'intermediate', estimatedDuration: '2 horas', priority: 7, category: 'Círculo social', xpReward: 150, seedReward: 30 },
  ],
  'Carrera': [
    { title: 'Tomar curso online', description: 'Inscríbete y completa un curso relacionado con tu carrera', difficulty: 'intermediate', estimatedDuration: '10 horas', priority: 9, category: 'Educación', xpReward: 200, seedReward: 40 },
    { title: 'Actualizar currículum', description: 'Actualiza tu CV con tus logros recientes', difficulty: 'beginner', estimatedDuration: '1 hora', priority: 7, category: 'Desarrollo', xpReward: 75, seedReward: 15 },
    { title: 'Asistir a evento de networking', description: 'Participa en un evento profesional de networking', difficulty: 'intermediate', estimatedDuration: '3 horas', priority: 8, category: 'Networking', xpReward: 150, seedReward: 30 },
  ],
  'Dinero': [
    { title: 'Crear presupuesto mensual', description: 'Establece un presupuesto detallado para el mes', difficulty: 'beginner', estimatedDuration: '1 hora', priority: 10, category: 'Planificación', xpReward: 100, seedReward: 20 },
    { title: 'Ahorrar 10% del ingreso', description: 'Separa el 10% de tus ingresos para ahorros', difficulty: 'intermediate', estimatedDuration: 'Ongoing', priority: 9, category: 'Ahorros', xpReward: 150, seedReward: 30 },
    { title: 'Investigar opciones de inversión', description: 'Investiga diferentes opciones de inversión', difficulty: 'advanced', estimatedDuration: '3 horas', priority: 8, category: 'Inversiones', xpReward: 200, seedReward: 40 },
  ],
  'Crecimiento personal': [
    { title: 'Leer 30 minutos diarios', description: 'Dedica 30 minutos cada día a la lectura', difficulty: 'beginner', estimatedDuration: '30 min', priority: 8, category: 'Lectura', xpReward: 50, seedReward: 10 },
    { title: 'Escribir en diario', description: 'Escribe en un diario sobre tus pensamientos y experiencias', difficulty: 'beginner', estimatedDuration: '15 min', priority: 7, category: 'Reflexión', xpReward: 40, seedReward: 8 },
    { title: 'Establecer metas anuales', description: 'Define tus objetivos para el año', difficulty: 'intermediate', estimatedDuration: '2 horas', priority: 9, category: 'Propósito', xpReward: 150, seedReward: 30 },
  ],
  'Espiritualidad': [
    { title: 'Meditar 10 minutos diarios', description: 'Practica meditación durante 10 minutos cada día', difficulty: 'beginner', estimatedDuration: '10 min', priority: 9, category: 'Meditación', xpReward: 60, seedReward: 12 },
    { title: 'Practicar gratitud diaria', description: 'Escribe 3 cosas por las que estés agradecido', difficulty: 'beginner', estimatedDuration: '5 min', priority: 8, category: 'Gratitud', xpReward: 40, seedReward: 8 },
    { title: 'Pasar tiempo en la naturaleza', description: 'Dedica tiempo a conectar con la naturaleza', difficulty: 'beginner', estimatedDuration: '1 hora', priority: 7, category: 'Conexión', xpReward: 75, seedReward: 15 },
  ],
  'Recreación': [
    { title: 'Explorar nuevo hobby', description: 'Prueba una nueva actividad recreativa', difficulty: 'beginner', estimatedDuration: '2 horas', priority: 7, category: 'Pasatiempos', xpReward: 100, seedReward: 20 },
    { title: 'Planificar viaje', description: 'Organiza un viaje a un lugar nuevo', difficulty: 'intermediate', estimatedDuration: 'Varios días', priority: 8, category: 'Viajes', xpReward: 150, seedReward: 30 },
    { title: 'Practicar deporte semanal', description: 'Participa en un deporte al menos una vez por semana', difficulty: 'intermediate', estimatedDuration: '1 hora', priority: 8, category: 'Deporte', xpReward: 100, seedReward: 20 },
  ],
  'Entorno': [
    { title: 'Organizar un espacio', description: 'Organiza completamente un espacio de tu hogar', difficulty: 'beginner', estimatedDuration: '2 horas', priority: 8, category: 'Organización', xpReward: 100, seedReward: 20 },
    { title: 'Limpiar profundamente', description: 'Realiza una limpieza profunda de tu hogar', difficulty: 'intermediate', estimatedDuration: '4 horas', priority: 7, category: 'Limpieza', xpReward: 150, seedReward: 30 },
    { title: 'Decorar un espacio', description: 'Mejora la estética de un espacio de tu hogar', difficulty: 'intermediate', estimatedDuration: '3 horas', priority: 6, category: 'Estética', xpReward: 125, seedReward: 25 },
  ],
  'Comunidad': [
    { title: 'Voluntariado mensual', description: 'Participa en una actividad de voluntariado', difficulty: 'intermediate', estimatedDuration: '3 horas', priority: 9, category: 'Voluntariado', xpReward: 200, seedReward: 40 },
    { title: 'Asistir a evento comunitario', description: 'Participa en un evento local de tu comunidad', difficulty: 'beginner', estimatedDuration: '2 horas', priority: 7, category: 'Eventos', xpReward: 75, seedReward: 15 },
    { title: 'Ayudar a un vecino', description: 'Ofrece ayuda a alguien de tu comunidad', difficulty: 'beginner', estimatedDuration: '1 hora', priority: 8, category: 'Ayuda', xpReward: 100, seedReward: 20 },
  ],
};

async function seedLifeAreas() {
  console.log('🌱 Iniciando seed de áreas de vida...');

  // removed sqlite
  // using db from db-neon

  try {
    // Limpiar datos existentes (opcional, comentar si no se desea)
    // console.log('🧹 Limpiando datos existentes...');
    // await db.delete(schema.lifeAreaActions);
    // await db.delete(schema.lifeAreaQuizQuestions);
    // await db.delete(schema.lifeAreaQuizzes);
    // await db.delete(schema.lifeAreaSubcategories);
    // await db.delete(schema.lifeAreas);

    console.log('📝 Insertando áreas de vida y subcategorías...');

    for (const areaData of lifeAreasData) {
      // Insertar área
      const [areaResult] = await db.insert(schema.lifeAreas).values({
        name: areaData.name,
        description: areaData.description,
        iconName: areaData.iconName,
        orderIndex: areaData.orderIndex,
        colorTheme: areaData.colorTheme,
      }).returning({ id: schema.lifeAreas.id });

      const areaId = areaResult.id;
      console.log(`✅ Área creada: ${areaData.name} (ID: ${areaId})`);

      // Insertar subcategorías
      const subcategoryIds: number[] = [];
      for (const subcat of areaData.subcategories) {
        const [subcatResult] = await db.insert(schema.lifeAreaSubcategories).values({
          lifeAreaId: areaId,
          name: subcat.name,
          description: subcat.description,
          orderIndex: subcat.orderIndex,
        }).returning({ id: schema.lifeAreaSubcategories.id });

        subcategoryIds.push(subcatResult.id);
      }

      // Crear quiz para el área
      const [quizResult] = await db.insert(schema.lifeAreaQuizzes).values({
        lifeAreaId: areaId,
        title: `Quiz de ${areaData.name}`,
        description: `Evalúa tu estado actual y deseado en ${areaData.name}`,
        version: 1,
      }).returning({ id: schema.lifeAreaQuizzes.id });

      const quizId = quizResult.id;

      // Crear preguntas del quiz para cada subcategoría
      console.log(`📋 Creando preguntas del quiz para ${areaData.name}...`);
      for (let i = 0; i < subcategoryIds.length; i++) {
        const subcatId = subcategoryIds[i];
        const subcatName = areaData.subcategories[i].name;
        const questions = generateQuizQuestions(subcatId, subcatName, areaData.name);

        for (const question of questions) {
          await db.insert(schema.lifeAreaQuizQuestions).values({
            quizId,
            questionText: question.questionText,
            questionType: question.questionType,
            orderIndex: question.orderIndex + (i * 2),
            category: question.category,
            subcategoryId: question.subcategoryId,
          });
        }
      }

      // Insertar acciones recomendadas
      const actions = actionsByArea[areaData.name] || [];
      console.log(`🎯 Creando ${actions.length} acciones para ${areaData.name}...`);
      for (const action of actions) {
        // Encontrar subcategoría relacionada si existe
        const relatedSubcat = areaData.subcategories.find(s => 
          s.name.toLowerCase().includes(action.category.toLowerCase()) ||
          action.category.toLowerCase().includes(s.name.toLowerCase())
        );

        await db.insert(schema.lifeAreaActions).values({
          lifeAreaId: areaId,
          subcategoryId: relatedSubcat ? subcategoryIds[areaData.subcategories.indexOf(relatedSubcat)] : null,
          title: action.title,
          description: action.description,
          difficulty: action.difficulty,
          estimatedDuration: action.estimatedDuration,
          priority: action.priority,
          category: action.category,
          xpReward: action.xpReward,
          seedReward: action.seedReward,
        });
      }
    }

    console.log('✅ Seed completado exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - ${lifeAreasData.length} áreas de vida creadas`);
    console.log(`   - ${lifeAreasData.reduce((sum, a) => sum + a.subcategories.length, 0)} subcategorías creadas`);
    console.log(`   - ${lifeAreasData.length} quizzes creados`);
    console.log(`   - ${lifeAreasData.reduce((sum, a) => sum + a.subcategories.length * 2, 0)} preguntas creadas`);
    console.log(`   - ${Object.values(actionsByArea).reduce((sum, actions) => sum + actions.length, 0)} acciones creadas`);

  } catch (error) {
    console.error('❌ Error en el seed:', error);
    throw error;
  } finally {
    console.log('Done.');
  }
}

seedLifeAreas().catch(console.error);


import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema';
import { eq, and } from 'drizzle-orm';

// Importar la función de generación de preguntas del seed
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

async function updateQuestions() {
  console.log('🔄 Actualizando preguntas de los quizzes...');

  const sqlite = new Database('./local.db');
  const db = drizzle(sqlite, { schema });

  try {
    // Obtener todas las áreas
    const areas = await db.select().from(schema.lifeAreas).orderBy(schema.lifeAreas.orderIndex);

    for (const area of areas) {
      // Obtener subcategorías del área
      const subcategories = await db.select()
        .from(schema.lifeAreaSubcategories)
        .where(eq(schema.lifeAreaSubcategories.lifeAreaId, area.id))
        .orderBy(schema.lifeAreaSubcategories.orderIndex);

      // Obtener quiz del área
      const quizzes = await db.select()
        .from(schema.lifeAreaQuizzes)
        .where(eq(schema.lifeAreaQuizzes.lifeAreaId, area.id))
        .limit(1);

      if (quizzes.length === 0) continue;

      const quiz = quizzes[0];

      // Actualizar preguntas por subcategoría
      for (const subcat of subcategories) {
        const questions = questionTemplates[area.name]?.[subcat.name];
        
        if (questions) {
          // Buscar preguntas existentes
          const existingQuestions = await db.select()
            .from(schema.lifeAreaQuizQuestions)
            .where(
              and(
                eq(schema.lifeAreaQuizQuestions.quizId, quiz.id),
                eq(schema.lifeAreaQuizQuestions.subcategoryId, subcat.id)
              )
            )
            .orderBy(schema.lifeAreaQuizQuestions.orderIndex);

          // Actualizar pregunta actual
          if (existingQuestions.length > 0 && existingQuestions[0].category === 'current') {
            await db.update(schema.lifeAreaQuizQuestions)
              .set({ questionText: questions.current })
              .where(eq(schema.lifeAreaQuizQuestions.id, existingQuestions[0].id));
          }

          // Actualizar pregunta deseada
          if (existingQuestions.length > 1 && existingQuestions[1].category === 'desired') {
            await db.update(schema.lifeAreaQuizQuestions)
              .set({ questionText: questions.desired })
              .where(eq(schema.lifeAreaQuizQuestions.id, existingQuestions[1].id));
          }
        }
      }

      console.log(`✅ Preguntas actualizadas para: ${area.name}`);
    }

    console.log('✅ Actualización completada exitosamente!');
  } catch (error) {
    console.error('❌ Error actualizando preguntas:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

updateQuestions().catch(console.error);


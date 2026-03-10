// replaced
import { db } from './db-neon';
import * as schema from '@shared/schema';

interface ChallengeData {
  level: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  frequency: string;
  experience: number;
  duration: string;
  iconName: string;
  orderIndex: number;
  steps: {
    title: string;
    description: string;
    type: string;
    orderIndex: number;
    data?: string;
  }[];
}

async function seedChallenges() {
  console.log('🌱 Iniciando seed de desafíos...');

  // Conectar a la base de datos
  // removed sqlite
  // using db from db-neon

  try {
    // Limpiar desafíos existentes
    console.log('🧹 Limpiando desafíos existentes...');
    await db.delete(schema.challengeSteps);
    await db.delete(schema.challenges);

    const challenges: ChallengeData[] = [
      // NIVEL 1 - VOS
      {
        level: 1,
        title: "Reflexión Matutina de Valores",
        description: "Comienza cada día conectándote con tus valores fundamentales",
        category: "vision",
        difficulty: "beginner",
        frequency: "daily",
        experience: 10,
        duration: "5 min",
        iconName: "Sun",
        orderIndex: 1,
        steps: [
          {
            title: "¿Qué te mueve hoy?",
            description: "Reflexiona sobre los valores que quieres honrar en este día",
            type: "reflection",
            orderIndex: 1,
            data: JSON.stringify({
              prompt: "Escribe 3 valores que quieres honrar hoy y por qué son importantes para ti"
            })
          },
          {
            title: "Intención del día",
            description: "Establece una intención específica para tu día",
            type: "action",
            orderIndex: 2,
            data: JSON.stringify({
              prompt: "¿Qué acción específica vas a tomar hoy que refleje tus valores?"
            })
          }
        ]
      },
      {
        level: 1,
        title: "Auditoría de Consumo Responsable",
        description: "Evalúa tus hábitos de consumo y identifica áreas de mejora",
        category: "action",
        difficulty: "beginner",
        frequency: "weekly",
        experience: 50,
        duration: "30 min",
        iconName: "ShoppingCart",
        orderIndex: 2,
        steps: [
          {
            title: "Revisa tus compras",
            description: "Analiza tus compras de la semana pasada",
            type: "reflection",
            orderIndex: 1,
            data: JSON.stringify({
              questions: [
                "¿Cuáles fueron mis compras impulsivas?",
                "¿Qué compré que realmente necesitaba?",
                "¿De dónde provienen los productos que compré?"
              ]
            })
          },
          {
            title: "Identifica patrones",
            description: "Reconoce patrones de consumo que quieres cambiar",
            type: "question",
            orderIndex: 2,
            data: JSON.stringify({
              prompt: "Lista 3 patrones de consumo que quieres mejorar"
            })
          },
          {
            title: "Plan de acción",
            description: "Crea un plan para consumir más conscientemente",
            type: "action",
            orderIndex: 3,
            data: JSON.stringify({
              prompt: "¿Qué regla vas a implementar para consumir más responsablemente?"
            })
          }
        ]
      },
      {
        level: 1,
        title: "Define tu Manifiesto Personal",
        description: "Crea tu declaración personal de valores y principios",
        category: "vision",
        difficulty: "intermediate",
        frequency: "monthly",
        experience: 200,
        duration: "1 hora",
        iconName: "FileText",
        orderIndex: 3,
        steps: [
          {
            title: "Valores fundamentales",
            description: "Identifica tus 5 valores más importantes",
            type: "question",
            orderIndex: 1,
            data: JSON.stringify({
              prompt: "Lista y explica tus 5 valores fundamentales y por qué son importantes para ti"
            })
          },
          {
            title: "Principios de vida",
            description: "Define los principios que guían tus decisiones",
            type: "reflection",
            orderIndex: 2,
            data: JSON.stringify({
              prompt: "Escribe 3-5 principios que quieres que guíen tus decisiones diarias"
            })
          },
          {
            title: "Compromisos contigo mismo",
            description: "Establece compromisos específicos con tu bienestar",
            type: "action",
            orderIndex: 3,
            data: JSON.stringify({
              prompt: "¿Qué compromisos vas a hacer contigo mismo para honrar tus valores?"
            })
          }
        ]
      },

      // NIVEL 2 - TU FAMILIA
      {
        level: 2,
        title: "Cena Sin Dispositivos",
        description: "Crea momentos de conexión familiar sin distracciones digitales",
        category: "community",
        difficulty: "beginner",
        frequency: "daily",
        experience: 15,
        duration: "30 min",
        iconName: "Utensils",
        orderIndex: 4,
        steps: [
          {
            title: "Prepara el espacio",
            description: "Organiza un ambiente propicio para la conversación",
            type: "action",
            orderIndex: 1,
            data: JSON.stringify({
              prompt: "Asegúrate de que todos los dispositivos estén fuera de la mesa y el espacio esté ordenado"
            })
          },
          {
            title: "Pregunta del día",
            description: "Inicia una conversación significativa",
            type: "question",
            orderIndex: 2,
            data: JSON.stringify({
              prompt: "Pregunta a cada familiar: '¿Qué fue lo mejor de tu día y por qué?'"
            })
          },
          {
            title: "Escucha activa",
            description: "Practica escuchar sin juzgar",
            type: "action",
            orderIndex: 3,
            data: JSON.stringify({
              prompt: "Escucha completamente la respuesta de cada persona antes de responder"
            })
          }
        ]
      },
      {
        level: 2,
        title: "Diálogo Familiar Profundo",
        description: "Facilita conversaciones significativas sobre valores y futuro",
        category: "vision",
        difficulty: "intermediate",
        frequency: "weekly",
        experience: 75,
        duration: "1 hora",
        iconName: "MessageCircle",
        orderIndex: 5,
        steps: [
          {
            title: "Prepara el tema",
            description: "Elige un tema importante para discutir",
            type: "action",
            orderIndex: 1,
            data: JSON.stringify({
              topics: [
                "¿Qué valores queremos que represente nuestra familia?",
                "¿Cómo podemos apoyarnos mejor mutuamente?",
                "¿Qué sueños tenemos para el futuro de la familia?"
              ]
            })
          },
          {
            title: "Establece reglas",
            description: "Crea un ambiente seguro para la expresión",
            type: "action",
            orderIndex: 2,
            data: JSON.stringify({
              rules: [
                "Todos pueden expresarse sin interrupciones",
                "No hay respuestas 'correctas' o 'incorrectas'",
                "Respetamos las opiniones diferentes"
              ]
            })
          },
          {
            title: "Facilita la conversación",
            description: "Guía la discusión de manera constructiva",
            type: "action",
            orderIndex: 3,
            data: JSON.stringify({
              prompt: "Asegúrate de que todos tengan la oportunidad de hablar y que la conversación sea constructiva"
            })
          }
        ]
      },

      // NIVEL 3 - TU BARRIO
      {
        level: 3,
        title: "Conocé a 3 Vecinos Nuevos",
        description: "Construye conexiones significativas en tu comunidad local",
        category: "community",
        difficulty: "intermediate",
        frequency: "weekly",
        experience: 100,
        duration: "1 hora",
        iconName: "Users",
        orderIndex: 6,
        steps: [
          {
            title: "Identifica oportunidades",
            description: "Encuentra momentos para interactuar con vecinos",
            type: "action",
            orderIndex: 1,
            data: JSON.stringify({
              prompt: "Identifica 3 vecinos que no conoces bien y planifica cómo acercarte a ellos"
            })
          },
          {
            title: "Prepara preguntas",
            description: "Ten conversaciones significativas",
            type: "action",
            orderIndex: 2,
            data: JSON.stringify({
              questions: [
                "¿Cuánto tiempo llevas viviendo aquí?",
                "¿Qué te gusta más del barrio?",
                "¿Hay algo en lo que podamos ayudarnos mutuamente?"
              ]
            })
          },
          {
            title: "Sigue en contacto",
            description: "Mantén las conexiones que establezcas",
            type: "action",
            orderIndex: 3,
            data: JSON.stringify({
              prompt: "Asegúrate de seguir saludando y manteniendo contacto con los vecinos que conozcas"
            })
          }
        ]
      },
      {
        level: 3,
        title: "Organiza Reunión Vecinal",
        description: "Inicia o participa en una reunión para mejorar el barrio",
        category: "action",
        difficulty: "advanced",
        frequency: "monthly",
        experience: 300,
        duration: "3 horas",
        iconName: "Calendar",
        orderIndex: 7,
        steps: [
          {
            title: "Identifica necesidades",
            description: "Reconoce problemas o mejoras necesarias en el barrio",
            type: "reflection",
            orderIndex: 1,
            data: JSON.stringify({
              prompt: "Lista 3 problemas o mejoras que has notado en tu barrio"
            })
          },
          {
            title: "Conecta con otros",
            description: "Busca vecinos interesados en participar",
            type: "action",
            orderIndex: 2,
            data: JSON.stringify({
              prompt: "Contacta al menos 5 vecinos para ver quién está interesado en participar"
            })
          },
          {
            title: "Organiza la reunión",
            description: "Planifica y ejecuta la reunión",
            type: "action",
            orderIndex: 3,
            data: JSON.stringify({
              prompt: "Organiza una reunión con fecha, hora y lugar definidos, con una agenda clara"
            })
          }
        ]
      },

      // NIVEL 4 - TU PROVINCIA
      {
        level: 4,
        title: "Investigación de Políticas Provinciales",
        description: "Infórmate sobre las políticas que afectan a tu provincia",
        category: "vision",
        difficulty: "intermediate",
        frequency: "monthly",
        experience: 350,
        duration: "2 horas",
        iconName: "BookOpen",
        orderIndex: 8,
        steps: [
          {
            title: "Identifica temas relevantes",
            description: "Selecciona políticas que te interesan",
            type: "reflection",
            orderIndex: 1,
            data: JSON.stringify({
              prompt: "Lista 3 temas de política provincial que te interesan o afectan tu vida"
            })
          },
          {
            title: "Investiga fuentes oficiales",
            description: "Busca información en fuentes confiables",
            type: "action",
            orderIndex: 2,
            data: JSON.stringify({
              prompt: "Investiga en el sitio web oficial de tu provincia y medios confiables"
            })
          },
          {
            title: "Analiza impactos",
            description: "Evalúa cómo estas políticas afectan a la comunidad",
            type: "reflection",
            orderIndex: 3,
            data: JSON.stringify({
              prompt: "Analiza el impacto positivo y negativo de estas políticas en tu comunidad"
            })
          }
        ]
      },

      // NIVEL 5 - LA NACIÓN
      {
        level: 5,
        title: "Propuesta de Política Pública",
        description: "Desarrolla una propuesta constructiva para mejorar el país",
        category: "action",
        difficulty: "advanced",
        frequency: "monthly",
        experience: 500,
        duration: "4 horas",
        iconName: "Flag",
        orderIndex: 9,
        steps: [
          {
            title: "Identifica el problema",
            description: "Define un problema nacional que quieres abordar",
            type: "reflection",
            orderIndex: 1,
            data: JSON.stringify({
              prompt: "Identifica un problema nacional específico que quieres ayudar a resolver"
            })
          },
          {
            title: "Investiga soluciones",
            description: "Estudia cómo otros países han resuelto problemas similares",
            type: "action",
            orderIndex: 2,
            data: JSON.stringify({
              prompt: "Investiga al menos 3 ejemplos de cómo otros países han abordado este problema"
            })
          },
          {
            title: "Desarrolla tu propuesta",
            description: "Crea una propuesta específica y factible",
            type: "action",
            orderIndex: 3,
            data: JSON.stringify({
              prompt: "Desarrolla una propuesta de política pública con objetivos claros, estrategias y métricas de éxito"
            })
          }
        ]
      }
    ];

    // Insertar desafíos y sus pasos
    console.log('📝 Insertando desafíos...');
    
    for (const challenge of challenges) {
      // Insertar el desafío
      const [result] = await db.insert(schema.challenges).values({
        level: challenge.level,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        difficulty: challenge.difficulty,
        frequency: challenge.frequency,
        experience: challenge.experience,
        duration: challenge.duration,
        iconName: challenge.iconName,
        orderIndex: challenge.orderIndex,
        isActive: true
      }).returning({ id: schema.challenges.id });

      const challengeId = result.id;

      // Insertar los pasos del desafío
      for (const step of challenge.steps) {
        await db.insert(schema.challengeSteps).values({
          challengeId: challengeId,
          title: step.title,
          description: step.description,
          type: step.type,
          orderIndex: step.orderIndex,
          data: step.data || null
        });
      }

      console.log(`✅ Desafío creado: ${challenge.title}`);
    }

    // Crear badges iniciales
    console.log('🏆 Creando badges iniciales...');
    
    const badges = [
      {
        name: "Primer Paso",
        description: "Te registraste en ¡BASTA!",
        iconName: "UserPlus",
        category: "level",
        requirement: "Registrarse en la plataforma",
        requirementData: JSON.stringify({ type: "registration" }),
        rarity: "common",
        experienceReward: 50,
        orderIndex: 1
      },
      {
        name: "Explorador",
        description: "Completaste tu primer desafío",
        iconName: "Compass",
        category: "challenge",
        requirement: "Completar 1 desafío",
        requirementData: JSON.stringify({ challengesCompleted: 1 }),
        rarity: "common",
        experienceReward: 100,
        orderIndex: 2
      },
      {
        name: "Visionario",
        description: "Completaste 10 desafíos",
        iconName: "Eye",
        category: "challenge",
        requirement: "Completar 10 desafíos",
        requirementData: JSON.stringify({ challengesCompleted: 10 }),
        rarity: "rare",
        experienceReward: 500,
        orderIndex: 3
      },
      {
        name: "Agente de Cambio",
        description: "Alcanzaste el nivel 3",
        iconName: "Zap",
        category: "level",
        requirement: "Alcanzar nivel 3",
        requirementData: JSON.stringify({ level: 3 }),
        rarity: "epic",
        experienceReward: 1000,
        orderIndex: 4
      },
      {
        name: "Racha de 7 días",
        description: "Mantuviste una racha de 7 días consecutivos",
        iconName: "Flame",
        category: "streak",
        requirement: "Mantener racha de 7 días",
        requirementData: JSON.stringify({ streak: 7 }),
        rarity: "rare",
        experienceReward: 300,
        orderIndex: 5
      },
      {
        name: "Líder Nacional",
        description: "Alcanzaste el nivel 5",
        iconName: "Crown",
        category: "level",
        requirement: "Alcanzar nivel 5",
        requirementData: JSON.stringify({ level: 5 }),
        rarity: "legendary",
        experienceReward: 5000,
        orderIndex: 6
      }
    ];

    for (const badge of badges) {
      await db.insert(schema.badges).values({
        name: badge.name,
        description: badge.description,
        iconName: badge.iconName,
        category: badge.category,
        requirement: badge.requirement,
        requirementData: badge.requirementData,
        rarity: badge.rarity,
        experienceReward: badge.experienceReward,
        orderIndex: badge.orderIndex
      });
      console.log(`✅ Badge creado: ${badge.name}`);
    }

    console.log('🎉 Seed completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    console.log('Done.');
  }
}

// Ejecutar el seed si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedChallenges()
    .then(() => {
      console.log('✅ Seed completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed:', error);
      process.exit(1);
    });
}

export default seedChallenges;

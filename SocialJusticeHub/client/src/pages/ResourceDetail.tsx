import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpenIcon, DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import { Link } from 'wouter';

// Resource content data
const resourceContent: Record<string, {
  title: string;
  description: string;
  content: string;
  downloads?: { title: string; url: string }[];
  externalLinks?: { title: string; url: string }[];
}> = {
  'systemic-thinking': {
    title: 'Pensamiento Sistémico',
    description: 'Comprende cómo las partes de un sistema se relacionan e influyen entre sí para crear soluciones integrales.',
    content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-800">¿Qué es el Pensamiento Sistémico?</h2>
        <p class="text-gray-600">El pensamiento sistémico es una disciplina que nos permite ver el panorama completo y comprender las conexiones entre las diferentes partes de un sistema. En lugar de analizar eventos aislados, nos enfocamos en patrones y relaciones.</p>
        
        <h3 class="text-xl font-semibold text-gray-800">Principios Fundamentales</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Todo está conectado: Las acciones en una parte del sistema afectan a otras partes</li>
          <li>La estructura influye en el comportamiento: Los patrones que vemos emergen de las estructuras subyacentes</li>
          <li>La jerarquía: Los sistemas están compuestos por subsistemas y forman parte de sistemas más grandes</li>
          <li>Los propósitos: Cada sistema tiene un propósito o función</li>
        </ul>
        
        <h3 class="text-xl font-semibold text-gray-800">Aplicación en el Cambio Social</h3>
        <p class="text-gray-600">Para crear cambios duraderos en nuestras comunidades, necesitamos entender los sistemas que perpetúan los problemas actuales. El pensamiento sistémico nos ayuda a identificar puntos de apalancamiento donde pequeños cambios pueden generar grandes transformaciones.</p>
        
        <h3 class="text-xl font-semibold text-gray-800">Herramientas Prácticas</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Mapeo de sistemas: Visualizar las conexiones entre actores, procesos y recursos</li>
          <li>Análisis de bucles causales: Identificar ciclos de refuerzo y equilibrio</li>
          <li>Arquetipos sistémicos: Reconocer patrones comunes de comportamiento</li>
          <li>Punto de apalancamiento: Encontrar los lugares más efectivos para intervenir</li>
        </ul>
      </div>
    `
  },
  'habit-change': {
    title: 'Cambio de Hábitos',
    description: 'Metodologías prácticas para transformar comportamientos individuales y colectivos de forma sostenible.',
    content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-800">La Ciencia del Cambio de Hábitos</h2>
        <p class="text-gray-600">Los hábitos constituyen aproximadamente el 40% de nuestras acciones diarias. Cambiar hábitos de manera efectiva requiere comprender cómo funciona nuestro cerebro y aplicar estrategias basadas en evidencia científica.</p>
        
        <h3 class="text-xl font-semibold text-gray-800">El Ciclo del Hábito</h3>
        <div class="bg-blue-50 p-4 rounded-lg">
          <ol class="list-decimal pl-6 space-y-2 text-gray-700">
            <li><strong>Señal:</strong> El disparador que inicia el comportamiento</li>
            <li><strong>Rutina:</strong> El comportamiento o acción en sí</li>
            <li><strong>Recompensa:</strong> El beneficio que obtienes del comportamiento</li>
            <li><strong>Deseo:</strong> La motivación que impulsa el ciclo</li>
          </ol>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Estrategias para el Cambio Individual</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Comenzar pequeño: Micro-hábitos que requieren menos de 2 minutos</li>
          <li>Apilar hábitos: Vincular nuevos hábitos a rutinas existentes</li>
          <li>Diseño del entorno: Hacer que los buenos hábitos sean obvios y fáciles</li>
          <li>Seguimiento: Medir el progreso para mantener la motivación</li>
        </ul>
        
        <h3 class="text-xl font-semibold text-gray-800">Cambio de Hábitos Colectivos</h3>
        <p class="text-gray-600">Para transformar comunidades, necesitamos cambiar los hábitos colectivos. Esto incluye modificar normas sociales, crear nuevas estructuras de incentivos y establecer sistemas de apoyo mutuo.</p>
        
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-semibold text-green-800 mb-2">Ejercicio Práctico</h4>
          <p class="text-green-700">Identifica un hábito que quieras cambiar. Mapea su ciclo actual (señal-rutina-recompensa) y diseña una nueva rutina que proporcione la misma recompensa pero esté alineada con tus valores.</p>
        </div>
      </div>
    `
  },
  'citizen-projects': {
    title: 'Proyectos Ciudadanos',
    description: 'Guías paso a paso para diseñar, implementar y evaluar iniciativas con impacto comunitario positivo.',
    content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-800">Guía para Proyectos Ciudadanos Exitosos</h2>
        <p class="text-gray-600">Los proyectos ciudadanos son iniciativas lideradas por la comunidad que buscan resolver problemas locales y crear valor público. Esta guía te ayudará a desarrollar proyectos efectivos y sostenibles.</p>
        
        <h3 class="text-xl font-semibold text-gray-800">Fase 1: Identificación y Análisis</h3>
        <div class="bg-yellow-50 p-4 rounded-lg">
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>Mapeo de problemas: Identifica los desafíos más urgentes de tu comunidad</li>
            <li>Análisis de actores: Reconoce quiénes están involucrados y quiénes tienen poder de decisión</li>
            <li>Diagnóstico participativo: Involucra a la comunidad en la identificación de problemas</li>
            <li>Priorización: Selecciona problemas que sean importantes, urgentes y factibles de abordar</li>
          </ul>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Fase 2: Diseño del Proyecto</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Definición de objetivos SMART (Específicos, Medibles, Alcanzables, Relevantes, Temporales)</li>
          <li>Teoría del cambio: Cómo tu proyecto generará el impacto deseado</li>
          <li>Identificación de recursos: Humanos, financieros, materiales y técnicos</li>
          <li>Planificación de actividades: Cronograma detallado de acciones</li>
        </ul>
        
        <h3 class="text-xl font-semibold text-gray-800">Fase 3: Implementación</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Formación del equipo: Roles y responsabilidades claras</li>
          <li>Comunicación efectiva: Mantener informados a todos los participantes</li>
          <li>Gestión de recursos: Uso eficiente y transparente de los recursos</li>
          <li>Adaptación: Flexibilidad para ajustar el plan según las circunstancias</li>
        </ul>
        
        <h3 class="text-xl font-semibold text-gray-800">Fase 4: Evaluación y Sostenibilidad</h3>
        <div class="bg-green-50 p-4 rounded-lg">
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>Indicadores de impacto: Mide los cambios generados en la comunidad</li>
            <li>Lecciones aprendidas: Documenta qué funcionó y qué se puede mejorar</li>
            <li>Escalabilidad: Cómo replicar el proyecto en otros contextos</li>
            <li>Institucionalización: Asegurar la continuidad del proyecto a largo plazo</li>
          </ul>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Herramientas Útiles</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Marco lógico para la planificación</li>
          <li>Presupuesto participativo</li>
          <li>Metodologías ágiles adaptadas a proyectos sociales</li>
          <li>Herramientas digitales para la colaboración</li>
        </ul>
      </div>
    `
  },
  'idealized-design': {
    title: 'Diseño Idealizado',
    description: 'Una metodología para reimaginar sistemas desde cero en vez de reformar lo que ya no funciona.',
    content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-800">Diseño Idealizado: Reimaginando el Futuro</h2>
        <p class="text-gray-600">El diseño idealizado es una metodología desarrollada por Russell Ackoff que nos invita a imaginar cómo sería el sistema ideal y luego trabajar hacia atrás para determinar cómo llegar allí.</p>
        
        <h3 class="text-xl font-semibold text-gray-800">Principios del Diseño Idealizado</h3>
        <div class="bg-purple-50 p-4 rounded-lg">
          <ol class="list-decimal pl-6 space-y-2 text-gray-700">
            <li><strong>Pensar sin restricciones:</strong> Imagina el futuro ideal sin limitaciones actuales</li>
            <li><strong>Diseño desde cero:</strong> No mejores lo existente, crea algo completamente nuevo</li>
            <li><strong>Participación colectiva:</strong> Involucra a todas las partes interesadas</li>
            <li><strong>Orientación al futuro:</strong> Enfócate en lo que quieres crear, no en lo que quieres evitar</li>
          </ol>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Proceso de Diseño Idealizado</h3>
        <div class="space-y-4">
          <div class="border-l-4 border-blue-500 pl-4">
            <h4 class="font-semibold text-blue-800">Paso 1: Análisis del Mess</h4>
            <p class="text-gray-600">Comprender profundamente los problemas interconectados del sistema actual.</p>
          </div>
          
          <div class="border-l-4 border-green-500 pl-4">
            <h4 class="font-semibold text-green-800">Paso 2: Formulación del Mess</h4>
            <p class="text-gray-600">Proyectar hacia dónde se dirige el sistema si no se hace nada.</p>
          </div>
          
          <div class="border-l-4 border-yellow-500 pl-4">
            <h4 class="font-semibold text-yellow-800">Paso 3: Diseño Idealizado</h4>
            <p class="text-gray-600">Imaginar y diseñar el sistema ideal que reemplazaría al actual.</p>
          </div>
          
          <div class="border-l-4 border-red-500 pl-4">
            <h4 class="font-semibold text-red-800">Paso 4: Planificación</h4>
            <p class="text-gray-600">Desarrollar un plan para implementar el diseño idealizado.</p>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Aplicación en Transformación Social</h3>
        <p class="text-gray-600">El diseño idealizado es especialmente poderoso para abordar problemas sociales complejos como la educación, la salud pública, o la gobernanza. En lugar de intentar "arreglar" sistemas defectuosos, nos permite imaginar alternativas completamente nuevas.</p>
        
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-semibold text-blue-800 mb-2">Ejemplo Práctico</h4>
          <p class="text-blue-700">Imagina que tu ciudad no tuviera restricciones de presupuesto, políticas o tecnológicas. ¿Cómo sería el sistema de transporte público ideal? ¿Qué características tendría? ¿Cómo funcionaría? Este ejercicio te ayudará a identificar innovaciones que podrían implementarse gradualmente.</p>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Beneficios del Enfoque</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Libera la creatividad al eliminar restricciones mentales</li>
          <li>Genera soluciones innovadoras y disruptivas</li>
          <li>Crea una visión compartida inspiradora</li>
          <li>Permite planificación estratégica a largo plazo</li>
          <li>Facilita la colaboración entre diferentes sectores</li>
        </ul>
      </div>
    `
  },
  'effective-communication': {
    title: 'Comunicación Efectiva',
    description: 'Herramientas para dialogar, construir consensos y resolver conflictos en espacios de participación.',
    content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-800">Comunicación Efectiva para el Cambio Social</h2>
        <p class="text-gray-600">La comunicación efectiva es la base de cualquier proceso de transformación social. Incluye la capacidad de escuchar, dialogar, construir consensos y resolver conflictos de manera constructiva.</p>
        
        <h3 class="text-xl font-semibold text-gray-800">Principios de la Comunicación Efectiva</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h4 class="font-semibold text-blue-800 mb-2">Escucha Activa</h4>
            <ul class="text-blue-700 text-sm space-y-1">
              <li>• Atención plena al interlocutor</li>
              <li>• Parafrasear para confirmar comprensión</li>
              <li>• Hacer preguntas clarificadoras</li>
              <li>• Evitar interrupciones</li>
            </ul>
          </div>
          
          <div class="bg-green-50 p-4 rounded-lg">
            <h4 class="font-semibold text-green-800 mb-2">Empatía</h4>
            <ul class="text-green-700 text-sm space-y-1">
              <li>• Ponerse en el lugar del otro</li>
              <li>• Reconocer emociones ajenas</li>
              <li>• Validar experiencias diferentes</li>
              <li>• Suspender juicios</li>
            </ul>
          </div>
          
          <div class="bg-yellow-50 p-4 rounded-lg">
            <h4 class="font-semibold text-yellow-800 mb-2">Claridad</h4>
            <ul class="text-yellow-700 text-sm space-y-1">
              <li>• Mensajes simples y directos</li>
              <li>• Usar ejemplos concretos</li>
              <li>• Evitar jerga técnica</li>
              <li>• Confirmar comprensión</li>
            </ul>
          </div>
          
          <div class="bg-purple-50 p-4 rounded-lg">
            <h4 class="font-semibold text-purple-800 mb-2">Respeto</h4>
            <ul class="text-purple-700 text-sm space-y-1">
              <li>• Valorar todas las perspectivas</li>
              <li>• Mantener la dignidad humana</li>
              <li>• Reconocer contribuciones</li>
              <li>• Crear espacios seguros</li>
            </ul>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Construcción de Consensos</h3>
        <p class="text-gray-600">El consenso no significa unanimidad, sino encontrar soluciones que todos puedan apoyar, aunque no sea su opción preferida.</p>
        
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-800 mb-2">Proceso de Construcción de Consenso</h4>
          <ol class="list-decimal pl-6 space-y-2 text-gray-600">
            <li>Definir claramente el problema o decisión a tomar</li>
            <li>Generar múltiples opciones sin evaluarlas inicialmente</li>
            <li>Explorar pros y contras de cada opción</li>
            <li>Identificar preocupaciones y objeciones</li>
            <li>Modificar propuestas para abordar preocupaciones</li>
            <li>Buscar soluciones que integren diferentes perspectivas</li>
            <li>Confirmar que todos pueden "vivir con" la decisión</li>
          </ol>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Resolución de Conflictos</h3>
        <p class="text-gray-600">Los conflictos son naturales en cualquier proceso de cambio. La clave está en gestionarlos de manera constructiva.</p>
        
        <div class="space-y-4">
          <div class="border-l-4 border-red-500 pl-4">
            <h4 class="font-semibold text-red-800">Identificar el Conflicto</h4>
            <p class="text-gray-600">Reconocer tempranamente las señales de conflicto y abordarlas antes de que escalen.</p>
          </div>
          
          <div class="border-l-4 border-orange-500 pl-4">
            <h4 class="font-semibold text-orange-800">Separar Personas de Problemas</h4>
            <p class="text-gray-600">Enfocarse en los intereses y necesidades, no en las posiciones o personalidades.</p>
          </div>
          
          <div class="border-l-4 border-green-500 pl-4">
            <h4 class="font-semibold text-green-800">Buscar Soluciones Ganar-Ganar</h4>
            <p class="text-gray-600">Explorar opciones que satisfagan los intereses fundamentales de todas las partes.</p>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Herramientas Prácticas</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li><strong>Círculos de diálogo:</strong> Espacios estructurados para conversaciones profundas</li>
          <li><strong>Mapeo de actores:</strong> Visualizar relaciones e intereses de diferentes grupos</li>
          <li><strong>Técnicas de facilitación:</strong> Métodos para guiar reuniones productivas</li>
          <li><strong>Comunicación no violenta:</strong> Marco para expresar necesidades sin atacar</li>
          <li><strong>Storytelling:</strong> Usar narrativas para conectar emocionalmente</li>
        </ul>
        
        <div class="bg-indigo-50 p-4 rounded-lg">
          <h4 class="font-semibold text-indigo-800 mb-2">Ejercicio de Reflexión</h4>
          <p class="text-indigo-700">Piensa en un conflicto reciente en tu comunidad. ¿Cuáles eran los intereses subyacentes de cada parte? ¿Qué solución podría haber satisfecho esos intereses fundamentales?</p>
        </div>
      </div>
    `
  },
  'digital-library': {
    title: 'Biblioteca Digital',
    description: 'Colección de libros, artículos y documentos sobre transformación social, participación ciudadana y desarrollo comunitario.',
    content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-800">Biblioteca Digital ¡BASTA!</h2>
        <p class="text-gray-600">Una colección curada de recursos académicos, prácticos y inspiracionales para agentes de cambio social. Todos los materiales están organizados por temas y niveles de profundidad.</p>
        
        <h3 class="text-xl font-semibold text-gray-800">Libros Fundamentales</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white border rounded-lg p-4">
            <h4 class="font-semibold text-gray-800">Pensamiento Sistémico</h4>
            <ul class="text-sm text-gray-600 mt-2 space-y-1">
              <li>• "Thinking in Systems" - Donella Meadows</li>
              <li>• "The Fifth Discipline" - Peter Senge</li>
              <li>• "Systems Thinking for Social Change" - David Peter Stroh</li>
            </ul>
          </div>
          
          <div class="bg-white border rounded-lg p-4">
            <h4 class="font-semibold text-gray-800">Participación Ciudadana</h4>
            <ul class="text-sm text-gray-600 mt-2 space-y-1">
              <li>• "Getting to Maybe" - Frances Westley</li>
              <li>• "The Power of Collective Wisdom" - Alan Briskin</li>
              <li>• "Community: The Structure of Belonging" - Peter Block</li>
            </ul>
          </div>
          
          <div class="bg-white border rounded-lg p-4">
            <h4 class="font-semibold text-gray-800">Diseño y Innovación Social</h4>
            <ul class="text-sm text-gray-600 mt-2 space-y-1">
              <li>• "Design for the Real World" - Victor Papanek</li>
              <li>• "Social Innovation and New Business Models" - Alex Nicholls</li>
              <li>• "The Social Labs Revolution" - Zaid Hassan</li>
            </ul>
          </div>
          
          <div class="bg-white border rounded-lg p-4">
            <h4 class="font-semibold text-gray-800">Facilitación y Liderazgo</h4>
            <ul class="text-sm text-gray-600 mt-2 space-y-1">
              <li>• "The Art of Gathering" - Priya Parker</li>
              <li>• "Facilitator's Guide to Participatory Decision-Making" - Sam Kaner</li>
              <li>• "Leadership and the New Science" - Margaret Wheatley</li>
            </ul>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Artículos y Papers</h3>
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-semibold text-blue-800 mb-2">Investigación Reciente</h4>
          <ul class="text-blue-700 space-y-2">
            <li>• "Collective Impact: A Framework for Addressing Complex Social Problems" (Stanford Social Innovation Review)</li>
            <li>• "Design Thinking for Social Innovation" (Harvard Business Review)</li>
            <li>• "The Role of Networks in Social Change" (Journal of Public Administration Research)</li>
            <li>• "Participatory Budgeting: Democratic Innovations from the Global South" (Comparative Politics)</li>
          </ul>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Guías Prácticas</h3>
        <div class="space-y-3">
          <div class="flex items-start space-x-3">
            <BookOpenIcon className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 class="font-semibold text-gray-800">Manual de Facilitación Participativa</h4>
              <p class="text-sm text-gray-600">Técnicas y herramientas para conducir reuniones efectivas y procesos de toma de decisiones colectivas.</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <BookOpenIcon className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 class="font-semibold text-gray-800">Toolkit de Innovación Social</h4>
              <p class="text-sm text-gray-600">Metodologías paso a paso para identificar, diseñar e implementar soluciones a problemas sociales complejos.</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <BookOpenIcon className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 class="font-semibold text-gray-800">Guía de Evaluación de Impacto Social</h4>
              <p class="text-sm text-gray-600">Herramientas para medir y documentar el impacto de proyectos e iniciativas comunitarias.</p>
            </div>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Casos de Estudio</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-yellow-50 p-4 rounded-lg">
            <h4 class="font-semibold text-yellow-800">Porto Alegre</h4>
            <p class="text-yellow-700 text-sm">Presupuesto participativo como herramienta de democracia directa</p>
          </div>
          
          <div class="bg-green-50 p-4 rounded-lg">
            <h4 class="font-semibold text-green-800">Medellín</h4>
            <p class="text-green-700 text-sm">Transformación urbana integral y innovación social</p>
          </div>
          
          <div class="bg-purple-50 p-4 rounded-lg">
            <h4 class="font-semibold text-purple-800">Barcelona</h4>
            <p class="text-purple-700 text-sm">Plataformas digitales para la participación ciudadana</p>
          </div>
        </div>
        
        <h3 class="text-xl font-semibold text-gray-800">Recursos Multimedia</h3>
        <div class="bg-gray-50 p-4 rounded-lg">
          <ul class="space-y-2 text-gray-600">
            <li>• <strong>Documentales:</strong> "The Future We Will Create", "Transition Movement", "Democracy in the 21st Century"</li>
            <li>• <strong>Podcasts:</strong> Social Innovation Conversations, Collective Impact Podcast, Systems Change</li>
            <li>• <strong>TED Talks:</strong> Charlas seleccionadas sobre liderazgo, innovación social y cambio sistémico</li>
            <li>• <strong>Webinars:</strong> Grabaciones de conferencias y talleres con expertos internacionales</li>
          </ul>
        </div>
        
        <div class="bg-red-50 p-4 rounded-lg">
          <h4 class="font-semibold text-red-800 mb-2">Contribuir a la Biblioteca</h4>
          <p class="text-red-700">¿Conocés un recurso valioso que debería estar en nuestra biblioteca? Envianos tus recomendaciones y ayudanos a construir la colección más completa para agentes de cambio en Argentina.</p>
        </div>
      </div>
    `
  }
};

const ResourceDetail = () => {
  const params = useParams();
  const resourceId = params.id;
  
  const resource = resourceId ? resourceContent[resourceId] : null;
  
  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Recurso no encontrado</h1>
          <p className="text-gray-600 mb-8">El recurso que buscás no existe o ha sido movido.</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{resource.title}</h1>
          <p className="text-xl text-gray-600">{resource.description}</p>
        </div>
        
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: resource.content }}
        />
        
        {resource.downloads && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Descargas</h3>
            <div className="space-y-2">
              {resource.downloads.map((download, index) => (
                <a
                  key={index}
                  href={download.url}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span>{download.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {resource.externalLinks && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Enlaces Externos</h3>
            <div className="space-y-2">
              {resource.externalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  <span>{link.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDetail;
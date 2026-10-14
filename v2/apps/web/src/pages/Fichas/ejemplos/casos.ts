import type { ContenidoFicha } from '@v2/shared';

export interface CasoCotidiano {
  id: string;
  titulo: string;
  escena: string;
  futuro: string;
  pregunta: string;
  investigar: string;
  pasos: readonly { titulo: string; accion: string; resultado: string }[];
  alternativas: readonly { nombre: string; mecanismo: string; costo: string; riesgo: string }[];
  conexiones: string;
}
/** Casos ficticios de aprendizaje. No se siembran en tablas ni cuentan como participación. */
export const CASOS_COTIDIANOS: readonly CasoCotidiano[] = [
  {
    id: 'turnos-de-salud',
    titulo: 'Conseguir un turno sin perder el día',
    escena:
      'En este ejemplo, una persona sale antes del amanecer para pedir un turno y llega tarde al trabajo. Otra no tiene internet. Las dos necesitan poder atenderse.',
    futuro:
      'Pedir atención cerca de casa sin hacer fila de madrugada, con una opción presencial y otra a distancia.',
    pregunta: '¿Cómo podríamos pedir un turno sin perder una mañana entera?',
    investigar:
      'Preguntar a pacientes y al equipo de salud cómo se asignan los turnos, registrar tiempos sin nombres y comprobar la capacidad disponible.',
    pasos: [
      {
        titulo: 'Escuchar',
        accion:
          'Publicar la dificultad con ubicación de barrio, sin historia clínica ni nombres. Escuchar también a quien no pudo sacar turno.',
        resultado:
          'Aportes situados y una pregunta compartida; todavía no un diagnóstico del sistema de salud.',
      },
      {
        titulo: 'Documentar',
        accion:
          'Medir durante una semana la espera y los intentos sin turno. Anotar fechas, método, cantidad de observaciones y a quiénes no se escuchó.',
        resultado:
          'Fuente local con sus límites. La línea de base queda pendiente hasta medir; una fila vacía no se convierte en cero.',
      },
      {
        titulo: 'Formular',
        accion:
          'Proponer reducir la espera, conservando acceso presencial. Definir el indicador: tiempo de espera y proporción de solicitudes atendidas.',
        resultado:
          'Objetivo con fecha de revisión, base y meta acordadas después de medir. La competencia del centro se consulta antes de atribuirle tareas.',
      },
      {
        titulo: 'Comparar',
        accion:
          'Contrastar las alternativas de abajo con pacientes, personal y personas que no usan celular.',
        resultado:
          'Una objeción cambia el diseño: la opción telefónica conserva una ventanilla presencial.',
      },
      {
        titulo: 'Acordar el alcance',
        accion:
          'Registrar qué horario se propone ensayar, qué personas participaron y el desacuerdo sobre prioridades de atención.',
        resultado:
          'Síntesis parcial revisable. Ninguna adhesión reemplaza las reglas clínicas ni el consentimiento del centro.',
      },
      {
        titulo: 'Hacer una prueba',
        accion:
          'Si el centro acepta, ensayar durante dos semanas. Una persona acepta coordinar y se fija cuándo detener o ajustar la prueba.',
        resultado:
          'Responsabilidad aceptada y tarea en curso; proponer el ensayo por sí solo no obliga al centro.',
      },
      {
        titulo: 'Revisar',
        accion:
          'Comparar espera y acceso con el mismo método. Otra cuenta revisa la evidencia y deja sus reservas.',
        resultado:
          'Si mejora la espera pero excluye a quienes van en persona, se rediseña. Haber implementado un sistema no demuestra por sí solo mejor atención.',
      },
    ],
    alternativas: [
      {
        nombre: 'Turnos por teléfono y ventanilla',
        mecanismo: 'Una franja de llamadas con cupos y atención presencial equivalente.',
        costo: 'Horas de personal y línea disponibles: confirmar antes del ensayo.',
        riesgo: 'Saturar la línea o desplazar la espera hacia otra cola.',
      },
      {
        nombre: 'Franjas presenciales distribuidas',
        mecanismo: 'Repartir horarios de asignación y comunicar claramente los cupos.',
        costo: 'Organización del equipo y señalización; cotización pendiente.',
        riesgo: 'Que los nuevos horarios no sirvan a quienes trabajan.',
      },
      {
        nombre: 'Mantener la organización actual',
        mecanismo: 'Medir primero y conservar el procedimiento durante la línea de base.',
        costo: 'Permite comparar sin atribuir una mejora al cambio de método.',
        riesgo: 'Continuar con la dificultad mientras se reúne evidencia.',
      },
    ],
    conexiones:
      'Se relaciona con horarios laborales, transporte, cuidados y acceso digital. Un mismo objetivo puede necesitar soluciones distintas en una ciudad y en una localidad rural.',
  },
  {
    id: 'transporte-cotidiano',
    titulo: 'Llegar a estudiar o trabajar a tiempo',
    escena:
      'En este ejemplo, un colectivo pasa después del inicio de clases. Una persona combina dos servicios para trabajar y otra no puede subir con su silla de ruedas.',
    futuro:
      'Viajar en horarios útiles, con conexiones previsibles y acceso para personas con movilidad reducida.',
    pregunta: '¿Qué cambios de recorrido y horario nos permitirían llegar a tiempo?',
    investigar:
      'Registrar horarios reales y conexiones perdidas en distintos días; contrastar con horarios publicados y escuchar a quienes dejaron de viajar.',
    pasos: [
      {
        titulo: 'Escuchar',
        accion:
          'Ubicar paradas y franjas horarias, sin publicar rutinas personales ni domicilios. Separar frecuencia, accesibilidad y costo.',
        resultado:
          'Diferentes problemas vinculados al mismo viaje, sin contar cada mención como una persona distinta.',
      },
      {
        titulo: 'Documentar',
        accion:
          'Comparar horarios publicados con observaciones de una semana. Registrar lluvia, días lectivos y cuántas salidas se observaron.',
        resultado:
          'Base de puntualidad con fuente y período; una semana no representa todo el año.',
      },
      {
        titulo: 'Formular',
        accion:
          'Proponer mejorar llegadas antes del inicio de clases y conexiones accesibles. Dejar base y meta pendientes hasta verificar el relevamiento.',
        resultado:
          'Objetivo con dos dimensiones: puntualidad y accesibilidad. Una mejora en una no oculta un retroceso en la otra.',
      },
      {
        titulo: 'Comparar',
        accion:
          'Estudiar las alternativas con usuarios, operador y autoridad competente. Preguntar a quién perjudicaría mover un horario.',
        resultado: 'El ahorro de tiempo de un grupo se compara con esperas nuevas para otro.',
      },
      {
        titulo: 'Acordar el alcance',
        accion:
          'Publicar coincidencias, disensos y franjas que no fueron relevadas. Anotar qué cambios requieren autorización.',
        resultado:
          'Propuesta acotada a los recorridos escuchados, sin llamarla plan de transporte de toda la ciudad.',
      },
      {
        titulo: 'Hacer una prueba',
        accion:
          'Con aceptación del operador y la autoridad, ensayar una conexión coordinada y publicar cómo se evaluará.',
        resultado:
          'Responsables y fechas aceptados. Si no aceptan, la siguiente tarea es gestionar la propuesta, no afirmar que se ejecutará.',
      },
      {
        titulo: 'Revisar',
        accion:
          'Observar con el mismo método y revisar también accesibilidad y efectos en otras paradas.',
        resultado:
          'Continuar, ajustar o frenar según la evidencia; mantener las objeciones en la ficha.',
      },
    ],
    alternativas: [
      {
        nombre: 'Coordinar una conexión',
        mecanismo: 'Alinear la llegada de un servicio con la salida del siguiente.',
        costo: 'Revisión operativa y tiempos del personal: por estimar.',
        riesgo: 'Un atraso se puede propagar a otras líneas.',
      },
      {
        nombre: 'Adelantar una salida',
        mecanismo: 'Probar un horario útil para clases y entrada al trabajo.',
        costo: 'Depende de turnos, flota y habilitación; pendiente de contrastar.',
        riesgo: 'Perjudicar a quienes usan el horario anterior o la vuelta.',
      },
      {
        nombre: 'Mejorar información sin cambiar horarios',
        mecanismo: 'Informar conexiones reales mientras se estudia el servicio.',
        costo: 'Canales de información y actualización responsable.',
        riesgo: 'Informar mejor no resuelve una frecuencia insuficiente.',
      },
    ],
    conexiones:
      'Conecta educación, empleo, salud, accesibilidad y uso del tiempo. Permite comparar necesidades entre territorios sin imponer un único recorrido como solución nacional.',
  },
  {
    id: 'agua-todos-los-dias',
    titulo: 'Tener agua todos los días',
    escena:
      'En este ejemplo, el agua se corta a la tarde. Una familia organiza sus cuidados alrededor del corte y un comedor necesita continuidad para cocinar.',
    futuro:
      'Acceso continuo y seguro al agua, con información clara de cortes y tiempos de respuesta.',
    pregunta: '¿Cómo podríamos reducir los cortes de agua y comprobar la mejora?',
    investigar:
      'Registrar horarios de cortes sin direcciones particulares, consultar al prestador y separar continuidad del servicio de calidad del agua.',
    pasos: [
      {
        titulo: 'Escuchar',
        accion:
          'Reunir aportes por zona y franja horaria, incluyendo escuelas y espacios comunitarios que consientan participar.',
        resultado:
          'Mapa de observaciones aproximadas; no se publican domicilios ni se supone que cada punto representa a todo el barrio.',
      },
      {
        titulo: 'Documentar',
        accion:
          'Contrastar un registro diario con partes del prestador. Documentar método, días observados y diferencias entre fuentes.',
        resultado:
          'Indicador de horas sin servicio. La potabilidad requiere fuentes y controles propios; no se deduce de la continuidad.',
      },
      {
        titulo: 'Formular',
        accion:
          'Proponer reducir horas de interrupción y mejorar la información. Consultar competencia y restricciones de la red.',
        resultado:
          'Objetivo verificable; la base y la meta se fijan con datos reales, no con los números del ejemplo.',
      },
      {
        titulo: 'Comparar',
        accion:
          'Evaluar una reparación puntual, gestión de presión e información de contingencia con quienes operan el servicio.',
        resultado: 'Alternativas con costos por verificar y efectos sobre zonas vecinas.',
      },
      {
        titulo: 'Acordar el alcance',
        accion:
          'Registrar prioridades discutidas, comunidades ausentes y desacuerdos. No prometer una obra sin autorización ni presupuesto.',
        resultado: 'Síntesis que diferencia un pedido de una obligación aceptada.',
      },
      {
        titulo: 'Hacer una prueba',
        accion:
          'Si el prestador acepta una intervención acotada, registrar responsable, plazo, insumos y criterio de pausa.',
        resultado:
          'Trabajo declarado, seguido por medición del servicio. Evitar duplicar reservas de los mismos recursos.',
      },
      {
        titulo: 'Revisar',
        accion:
          'Contrastar continuidad antes y después y verificar que no empeoró en otra zona. Otra cuenta revisa los registros.',
        resultado:
          'Resultado confirmado solo con evidencia suficiente; si la causa persiste, la ficha conserva lo aprendido y abre la próxima tarea.',
      },
    ],
    alternativas: [
      {
        nombre: 'Reparar una falla identificada',
        mecanismo: 'Intervenir después de verificar la causa con el prestador.',
        costo: 'Diagnóstico, materiales y presupuesto verificables antes de comprometerlos.',
        riesgo: 'Confundir una falla local con un problema de capacidad de red.',
      },
      {
        nombre: 'Revisar la distribución',
        mecanismo: 'Evaluar presión y horarios con personal habilitado.',
        costo: 'Estudio técnico y operación del servicio.',
        riesgo: 'Mejorar una zona a costa de otra; necesita medición conjunta.',
      },
      {
        nombre: 'Información y contingencia',
        mecanismo: 'Comunicar cortes y coordinar una respuesta temporal autorizada.',
        costo: 'Responsables, canales y disponibilidad real de recursos.',
        riesgo: 'Que la medida temporal reemplace la solución de fondo.',
      },
    ],
    conexiones:
      'Relaciona salud, cuidados, infraestructura, ambiente y cuencas compartidas. Hace visibles las dependencias entre lugares y los recursos que compiten por un mismo uso.',
  },
];
export function plantillaDelCaso(
  id: string | null,
): Pick<ContenidoFicha, 'titulo' | 'futuro' | 'proximaTarea'> | null {
  const caso = CASOS_COTIDIANOS.find((c) => c.id === id);
  // Solo copia una pregunta, un futuro propuesto y una tarea. Nunca observaciones, cifras o resultados ficticios.
  return caso
    ? { titulo: caso.pregunta, futuro: caso.futuro, proximaTarea: caso.investigar }
    : null;
}

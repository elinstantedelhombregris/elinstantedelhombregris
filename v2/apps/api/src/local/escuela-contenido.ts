export const CLAVE_ESCOLAR = 'EscuelaLocal2026!';
export const CUENTAS_ESCOLARES = [
  {
    usuario: 'escuela_coordina',
    nombre: 'Coordinación · ensayo local',
    rol: 'Coordinar y elegir la ficha',
  },
  {
    usuario: 'escuela_participa',
    nombre: 'Participante · ensayo local',
    rol: 'Sumarse y realizar la tarea',
  },
  {
    usuario: 'escuela_revisa',
    nombre: 'Revisión · ensayo local',
    rol: 'Revisar desde otra cuenta',
  },
] as const;

export function contenidoEscolar(inicio: string, cierre: string, territorio: number) {
  return {
    contrato: {
      titulo: 'Llegar a tiempo a la escuela · ensayo local',
      pregunta:
        '¿Qué tendría que cambiar para llegar a tiempo sin trasladar el costo a las familias?',
      proposito:
        'Ensayo ficticio del recorrido completo. Comparar horarios, conservar desacuerdos y devolver lo aprendido; no es una convocatoria real.',
      territorios: [territorio],
      temas: ['educación', 'movilidad'],
      participantes: 'Cuentas de ensayo; no hay participantes civiles ni escuela identificada.',
      canales: ['web'],
      responsable: 'escuela_coordina · cuenta ficticia',
      devolucion:
        'La coordinación publica qué se contrastó, qué sigue sin comprobarse y qué objeciones requieren respuesta.',
      fechaDevolucion: cierre,
      efecto: 'Ensayo local, sin compromiso institucional ni decisión sobre horarios escolares.',
      fases: [
        {
          nombre: 'Contrastar y revisar',
          salida: 'Una tarea con evidencia y revisión de otra cuenta.',
          fecha: cierre,
        },
      ],
    },
    ficha: {
      titulo: 'Llegar a tiempo a la escuela · ficha de ensayo local',
      territorioId: territorio,
      temas: ['educación', 'movilidad'],
      situacion:
        'Situación hipotética: algunas combinaciones de transporte y caminata no alcanzarían el ingreso de las 08:00. Mendoza es sólo el ámbito de demostración, no una atribución a una escuela o servicio concreto.',
      futuro:
        'Poder llegar a tiempo a la escuela sin perder ingresos ni recargar los cuidados. No se comprobó ningún cambio de puntualidad.',
      proximaTarea:
        'Contrastar cinco combinaciones ficticias de horarios. La coordinación elige esta ficha desde la tarea; una persona se suma y acepta, publica su cálculo y otra cuenta revisa sus límites.',
      condiciones: [
        'Hipótesis A: ajustar la conexión del transporte.',
        'Hipótesis B: revisar el ingreso escolar.',
        'Desacuerdo de ejemplo: cambiar el ingreso puede complicar el trabajo y los cuidados. Debe responderse antes de elegir B.',
      ],
      vinculos: [],
      proceso: {
        pregunta: '¿Qué horarios conviene contrastar antes de proponer una prueba real?',
        ambito: 'Ensayo local de una zona escolar ficticia en Mendoza; no representa al país.',
        convocatoria:
          'Tres cuentas de demostración. Un piloto posterior debe incorporar familias, personal escolar, transporte y personas que no usan esta web.',
        facilitacion: 'escuela_coordina · coordinación ficticia',
        inicio,
        cierre,
        reglas:
          'Conservar fuentes, objeciones y límites. No publicar nombres de menores ni domicilios. Las cuentas de ensayo no constituyen participación ciudadana.',
        metodoCierre:
          'Devolver lo calculado y lo pendiente después de revisar la evidencia. No decidir un cambio escolar con este ensayo.',
        moderacion: 'La coordinación cuida el alcance y registra las razones de cualquier retiro.',
        apelacion: 'Plantear una objeción en esta ficha y pedir respuesta a la coordinación.',
      },
    },
    iniciativa: {
      titulo: 'Llegar a tiempo a la escuela · ensayo local',
      resumen:
        'Práctica con datos ficticios: vincular una ficha, sumarse a una tarea, contrastar horarios y devolver un resultado revisado. No es una convocatoria real.',
      documento:
        'Coordinación: escuela_coordina. Ejecución: quien acepte personalmente. Revisión: escuela_revisa, distinta cuenta sin acreditar independencia personal. Guía y planilla: /recorridos/llegar-a-tiempo-a-la-escuela. Antes de decidir, responder la objeción sobre trabajo y cuidados.',
      autorizoPublicacion: true,
    },
    tarea: {
      titulo: 'Contrastar cinco horarios · práctica escolar',
      alcance:
        'Dedicá unos 15 minutos a sumar horario de llegada y caminata en las cinco filas ficticias de la guía. Compará con el ingreso de las 08:00. Registrá las cuentas, qué no podemos concluir y el desacuerdo sobre trabajo y cuidados. Sin observación ni datos personales.',
      fecha: cierre,
      hitoId: null,
      recursos:
        'Planilla ficticia en la guía del recorrido escolar, papel o calculadora. No requiere reservas ni salidas de campo.',
      escucha: null,
      autorizoPublicacion: true,
    },
  };
}

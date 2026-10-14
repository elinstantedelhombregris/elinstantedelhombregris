import { useState } from 'react';
import { Link } from 'wouter';

import { BotonPapel } from '~/components/papel/primitives';
import { MarcoParticipacion, Nota } from '~/components/participacion/Elementos';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

const PASOS = [
  {
    titulo: '1. Definir qué falta escuchar',
    quien: 'Administración de la iniciativa',
    estado: 'Tarea propuesta',
    accion:
      'El equipo crea una iniciativa para mejorar los horarios de apoyo escolar. Propone tres encuentros en una zona pública y una fecha para revisar lo aprendido.',
    registro:
      'Zona escolar · conversaciones presenciales y digitales · unidad: tres encuentros · versión 1. La invitación debe incluir a quienes trabajan de noche.',
    limite:
      'Una zona sin aportes en el mapa no permite afirmar que sus habitantes no tienen problemas.',
  },
  {
    titulo: '2. Aceptar y organizar',
    quien: 'Una persona integrante',
    estado: 'Responsabilidad aceptada',
    accion:
      'La persona entra al equipo y acepta coordinar la tarea con su propia firma. Puede iniciar, pausar o liberar esa responsabilidad con una nota pública.',
    registro:
      'Sala: por confirmar. Materiales: disponibles. La administración crea un hito para revisar horarios y ausencias.',
    limite:
      'Escribir un recurso en la tarea no lo reserva. El acuerdo de disponibilidad se registra en Capacidades.',
  },
  {
    titulo: '3. Escuchar y registrar con permiso',
    quien: 'Equipo de escucha',
    estado: 'En curso',
    accion:
      'Durante los encuentros, el equipo conserva sus notas privadas. Publica un aporte únicamente cuando tiene autorización y revisó su contenido.',
    registro:
      'El aporte autorizado entra por el formulario del mapa. El resumen de la tarea omite nombres, domicilios y rutinas personales.',
    limite:
      'La web no importa automáticamente el cuaderno privado de campo ni anuncia una sincronización sin conexión.',
  },
  {
    titulo: '4. Declarar lo realizado',
    quien: 'Responsable de la tarea',
    estado: 'Ejecución declarada; evidencia pendiente de revisión',
    accion:
      'Al terminar, declara la ejecución y publica un resumen: período observado, encuentros, diferencias, ausencias, límites y próximo paso.',
    registro:
      'En este ejemplo hubo tres encuentros. Surgió una dificultad con los horarios de tarde. Faltó escuchar a familias que trabajan de noche.',
    limite:
      'Tres encuentros no son tres personas únicas, una muestra del barrio ni un resultado confirmado.',
  },
  {
    titulo: '5. Revisar y decidir el próximo paso',
    quien: 'Otra cuenta integrante',
    estado: 'Evidencia revisada; ausencias conservadas',
    accion:
      'Una cuenta distinta de quienes crearon la tarea, la ejecutaron o publicaron su evidencia revisa el método y deja firma y fundamento.',
    registro:
      'La administración puede cerrar el hito con una conclusión y sus límites. Abre otra tarea para escuchar a quienes faltaron.',
    limite:
      'Una revisión no demuestra causalidad ni independencia personal. Si se retira la evidencia, el hito y la iniciativa completada vuelven a revisión.',
  },
  {
    titulo: '6. Dar continuidad al equipo',
    quien: 'Propietario y persona que acepta el relevo',
    estado: 'Seguimiento y relevo explícitos',
    accion:
      'La administración actualiza tareas y propósito. El propietario puede dar roles, retirar a quienes no conservan tareas activas o proponer un relevo.',
    registro:
      'La propiedad cambia solamente cuando la persona propuesta acepta. Cada operación conserva su fecha; repetir un envío no duplica el cambio.',
    limite:
      'Los resultados del piloto real deben documentarse con evidencia. Este recorrido no crea participantes ni compromisos.',
  },
] as const;

export function EjemploIniciativa() {
  useTituloDePagina('Ejemplo de escucha y organización');
  const [paso, setPaso] = useState(0);
  const actual = PASOS[paso] ?? PASOS[0];
  return (
    <MarcoParticipacion
      titulo="De una escucha a una tarea compartida"
      entrada="Recorré un ejemplo de apoyo escolar: quién hace cada paso, qué se registra y cómo se revisa."
      kicker="Ejemplo guiado"
    >
      <Nota>
        <strong>Ejemplo ficticio.</strong> Los pasos solo cambian esta demostración. No se publican
        aportes ni se crean iniciativas o reservas.
      </Nota>
      <nav aria-label="Pasos del ejemplo" className="mb-6 flex flex-wrap gap-2">
        {PASOS.map((p, index) => (
          <button
            key={p.titulo}
            aria-label={p.titulo}
            aria-pressed={paso === index}
            className="border-tinta aria-pressed:bg-tinta aria-pressed:text-papel min-h-11 border px-4"
            onClick={() => {
              setPaso(index);
            }}
          >
            {index + 1}
          </button>
        ))}
      </nav>
      <section aria-live="polite" className="border-tinta space-y-5 border p-5 md:p-8">
        <p className="font-space text-sm">
          Paso {paso + 1} de {PASOS.length} · {actual.quien}
        </p>
        <h2 className="font-anton text-3xl">{actual.titulo}</h2>
        <p>{actual.accion}</p>
        <div className="border-tinta/30 border-y py-4">
          <p className="font-semibold">Qué queda registrado</p>
          <p className="mt-2">{actual.registro}</p>
        </div>
        <p>
          <strong>Estado:</strong> {actual.estado}.
        </p>
        <p className="text-tinta-75">{actual.limite}</p>
        <div className="flex flex-wrap gap-3">
          <BotonPapel
            variant="fantasma"
            disabled={paso === 0}
            onClick={() => {
              setPaso(paso - 1);
            }}
          >
            Anterior
          </BotonPapel>
          <BotonPapel
            disabled={paso === PASOS.length - 1}
            onClick={() => {
              setPaso(paso + 1);
            }}
          >
            Siguiente paso
          </BotonPapel>
        </div>
      </section>
      <div className="mt-7 flex flex-wrap gap-5">
        <Link className="min-h-11 underline" href="/iniciativas/nueva?escucha=si">
          Organizar una escucha propia
        </Link>
        <Link className="min-h-11 underline" href="/escucha-territorial">
          Consultar tareas de escucha
        </Link>
        <Link className="min-h-11 underline" href="/capacidades/ejemplo">
          Ver cómo acordar una reserva
        </Link>
      </div>
    </MarcoParticipacion>
  );
}

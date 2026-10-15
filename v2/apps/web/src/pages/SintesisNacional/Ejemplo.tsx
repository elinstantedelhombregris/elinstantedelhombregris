import { useState } from 'react';
import { Link } from 'wouter';

import { ExplorarDisponibilidad } from '../Fichas/alternativas/ExplorarDisponibilidad';

import { useTituloDePagina } from '~/lib/titulo-de-pagina';

const CASOS = [
  {
    titulo: 'Agua en casa',
    futuro: 'Tener agua segura y continua, también en las zonas donde hoy falta.',
    escucha:
      'Escuchar a quienes tienen cortes, a hogares sin conexión y a quienes sostienen comedores. Registrar horarios y límites de cada encuentro.',
    dato: 'El porcentaje nacional de agua de red de 2022 sirve de contexto. Identificar el departamento y el gobierno local; conseguir mediciones locales de continuidad y calidad antes de fijar una meta.',
    variantes:
      'Una zona necesita extender la red; otra ya tiene conexión, pero sufre cortes. No sumar ambos problemas como si fueran el mismo.',
    decision:
      'La comunidad puede registrar interrupciones. La obra necesita identificar al prestador y comprobar qué autoridad tiene competencia. Una cuenca compartida puede requerir coordinación entre jurisdicciones.',
    tension:
      'Priorizar una obra puede postergar otra zona. Publicar el criterio, los costos conocidos y lo que todavía falta presupuestar.',
    tarea:
      'Acordar un relevamiento de interrupciones, revisar sus resultados con otra persona y devolverlos a las fichas. Después seleccionar los objetivos para una edición común.',
  },
  {
    titulo: 'Llegar a la escuela',
    futuro:
      'Que ir a la escuela sea posible y seguro, tanto para quienes caminan como para quienes dependen del transporte.',
    escucha:
      'Conversar en distintos turnos con estudiantes, familias y personas con movilidad reducida. No publicar recorridos personales ni domicilios.',
    dato: 'Identificar localidades y corredores de viaje; las fronteras municipales no describen por sí solas el trayecto. Falta medir tiempos y puntos de dificultad.',
    variantes:
      'En un lugar faltan veredas; en otro, la frecuencia del transporte. Mantener objetivos e indicadores distintos.',
    decision:
      'La comunidad puede identificar cruces difíciles. Señalización, veredas y transporte requieren validar las competencias municipal, provincial o entre territorios.',
    tension:
      'Un cambio de recorrido puede mejorar el acceso de un grupo y alargar el viaje de otro. Conservar esa objeción y comparar alternativas.',
    tarea:
      'Probar un relevamiento de tiempos sin datos personales, revisar el resultado y documentar qué alternativa se seguirá investigando.',
  },
  {
    titulo: 'Conseguir un turno',
    futuro:
      'Poder pedir y sostener un turno de atención sin depender de tener conexión propia o de faltar al trabajo.',
    escucha:
      'Escuchar a personas mayores, quienes cuidan, quienes trabajan en horarios rígidos y quienes viven lejos del centro de atención.',
    dato: 'Distinguir acceso a internet de acceso efectivo a turnos. No usar la cifra de conectividad para afirmar cuántas personas obtienen atención.',
    variantes:
      'Un lugar necesita canales presenciales; otro necesita horarios; otro, transporte. Cada ficha conserva su situación y su evidencia.',
    decision:
      'La comunidad puede acompañar gestiones autorizadas. Los cambios del sistema de turnos deben revisarse con la institución responsable y su marco de competencia.',
    tension:
      'Digitalizar puede facilitar trámites y excluir a quienes necesitan atención presencial. La síntesis debe conservar ambas experiencias.',
    tarea:
      'Comparar alternativas de atención y hacer una prueba acotada con consentimiento; publicar solo resultados agregados revisados.',
  },
];
export function EjemploSintesisNacional() {
  useTituloDePagina('Ejemplo de síntesis nacional');
  const [indice, setIndice] = useState(0);
  const caso = CASOS[indice] ?? CASOS[0];
  if (!caso) return null;
  return (
    <main className="mx-auto max-w-4xl px-5 py-10 md:px-10">
      <p className="border-tinta border p-4 font-semibold">
        Ejemplo ficticio para aprender el recorrido. No contiene testimonios, acuerdos ni resultados
        reales.
      </p>
      <h1 className="font-anton mt-6 text-5xl">De un problema cotidiano a una visión compartida</h1>
      <p className="mt-5 text-lg">
        La visión de país se construye conservando diferencias entre lugares. Elegí una situación
        para recorrer cómo se trabajaría.
      </p>
      <div className="my-5 flex flex-wrap gap-3">
        {CASOS.map((c, i) => (
          <button
            className="min-h-11 border px-4 py-3 aria-pressed:font-bold aria-pressed:underline"
            aria-pressed={indice === i}
            key={c.titulo}
            onClick={() => {
              setIndice(i);
            }}
          >
            {c.titulo}
          </button>
        ))}
      </div>
      <h2 className="font-anton text-3xl">{caso.futuro}</h2>
      <ol className="mt-6 space-y-6">
        {(
          [
            ['escucha', '1. Escuchar sin generalizar a todo el lugar'],
            ['dato', '2. Conciliar el territorio y el dato'],
            ['variantes', '3. Conservar las diferencias'],
            ['decision', '4. Ubicar las decisiones'],
            ['tension', '5. Explicitar las tensiones'],
            ['tarea', '6. Volver al territorio y revisar'],
          ] as const
        ).map(([k, t]) => (
          <li className="border-tinta/40 border-t pt-4" key={k}>
            <h3 className="font-semibold">{t}</h3>
            <p className="mt-2">{caso[k]}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6">
        La edición final cita objetivos y versiones de fichas. Otra persona del equipo revisa la
        selección, sus fuentes y sus ausencias. La publicación sigue siendo una lectura de
        participantes; no se convierte automáticamente en la voluntad de todo el país.
      </p>
      <ExplorarDisponibilidad titulo="Encuentros de escucha en distintos horarios" ejemplo />
      <nav className="mt-6 flex flex-wrap gap-5">
        <Link
          className="inline-flex min-h-11 items-center underline"
          href="/conciliacion-territorial"
        >
          Revisar unidades reales
        </Link>
        <Link className="inline-flex min-h-11 items-center underline" href="/fichas/ejemplos">
          Probar una ficha de ejemplo
        </Link>
        <Link className="inline-flex min-h-11 items-center underline" href="/sintesis-nacional">
          Ir a las ediciones
        </Link>
      </nav>
    </main>
  );
}

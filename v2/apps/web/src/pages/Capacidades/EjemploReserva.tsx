import { useState } from 'react';
import { Link } from 'wouter';

import { BotonPapel } from '~/components/papel/primitives';

const PASOS = [
  {
    titulo: 'Una oferta concreta',
    texto:
      'En este ejemplo ficticio, un espacio barrial autoriza 10 horas de sala durante una semana. La sala es accesible, abre por la tarde y requiere coordinar horarios. Las 10 horas cubren toda la semana.',
    disponible: 10,
    reservada: 0,
    entregada: 0,
    boton: 'Un equipo solicita 6 horas',
  },
  {
    titulo: 'La necesidad propone un vínculo',
    texto:
      'Un equipo que prepara apoyo escolar solicita 6 horas desde su ficha. Explica cuántos encuentros necesita y cómo cumple las condiciones. La solicitud todavía no descuenta horas.',
    disponible: 10,
    reservada: 0,
    entregada: 0,
    boton: 'Quien ofrece acepta la solicitud',
  },
  {
    titulo: 'Ambas partes aceptaron',
    texto:
      'El equipo aceptó las condiciones al solicitar y quien ofrece aceptó reservar. Quedan 4 horas disponibles. Otro equipo solicita 5 para un taller de búsqueda de empleo.',
    disponible: 4,
    reservada: 6,
    entregada: 0,
    boton: 'Intentar reservar otras 5 horas',
  },
  {
    titulo: 'No alcanza para la segunda solicitud',
    texto:
      'La segunda reserva no se acepta: quedan 4 horas y se pidieron 5. El equipo puede proponer 4, buscar otra oferta o acordar otro período. El sistema no compromete horas que ya reservó.',
    disponible: 4,
    reservada: 6,
    entregada: 0,
    boton: 'El primer equipo usa la sala',
  },
  {
    titulo: 'Entrega declarada',
    texto:
      'Quien ofrece registra que facilitó las 6 horas. Todavía falta que el equipo confirme que recibió lo acordado. Si hubo menos horas o una barrera de acceso, puede dejar una discrepancia.',
    disponible: 4,
    reservada: 6,
    entregada: 0,
    boton: 'El equipo confirma recepción',
  },
  {
    titulo: 'Recepción confirmada',
    texto:
      'La recepción de 6 horas queda confirmada. Eso comprueba la prestación acordada; el efecto del apoyo escolar se evalúa por separado en la ficha. Las horas utilizadas no vuelven a estar disponibles en este período.',
    disponible: 4,
    reservada: 0,
    entregada: 6,
    boton: 'Volver a empezar',
  },
] as const;
export function EjemploReserva() {
  const [paso, setPaso] = useState(0);
  const actual = PASOS[paso] ?? PASOS[0];
  return (
    <section className="max-w-3xl">
      <p className="border-violeta border-l-4 p-4 font-semibold">
        Ejemplo ficticio e interactivo. No crea ofertas ni reservas reales.
      </p>
      <h2 className="font-anton mt-6 text-4xl">Una sala, dos necesidades, diez horas</h2>
      <div className="mt-6 grid grid-cols-3 gap-3" aria-live="polite">
        {[
          ['Disponibles', actual.disponible],
          ['Reservadas', actual.reservada],
          ['Recibidas', actual.entregada],
        ].map(([etiqueta, valor]) => (
          <div className="border-tinta border p-3" key={etiqueta}>
            <p className="text-sm">{etiqueta}</p>
            <p className="font-anton text-3xl">{valor} h</p>
          </div>
        ))}
      </div>
      <article aria-live="polite" className="border-tinta mt-5 border p-5">
        <p className="text-sm">
          Paso {paso + 1} de {PASOS.length}
        </p>
        <h3 className="font-anton mt-2 text-2xl">{actual.titulo}</h3>
        <p className="mt-4 leading-relaxed">{actual.texto}</p>
      </article>
      <div className="mt-5 flex flex-wrap gap-3">
        <BotonPapel
          onClick={() => {
            setPaso((paso + 1) % PASOS.length);
          }}
        >
          {actual.boton}
        </BotonPapel>
        {paso > 0 ? (
          <button
            className="min-h-11 underline"
            onClick={() => {
              setPaso(paso - 1);
            }}
          >
            Paso anterior
          </button>
        ) : null}
      </div>
      <p className="mt-6">
        También puede servir para horas de acompañamiento digital, herramientas de uso comunitario o
        materiales para mejorar una plaza. Cada oferta necesita condiciones propias y autorización
        real.
      </p>
      <aside className="border-tinta mt-6 border p-5">
        <h3 className="font-anton text-2xl">Cómo seguir con el apoyo escolar</h3>
        <ol className="mt-4 list-decimal space-y-3 pl-5">
          <li>
            En la ficha, proponé una alternativa y una prueba de dos encuentros, con alcance y fecha
            de revisión.
          </li>
          <li>
            Desde la prueba, elegí «Organizar en una iniciativa». Podés crear «Aprender cerca de
            casa» y el hito «Revisar horarios y asistencia».
          </li>
          <li>
            Una persona integrante acepta la responsabilidad con su firma. La tarea pasa a tener
            responsable; la sala se reserva con su propio acuerdo.
          </li>
          <li>
            Registrá los encuentros, observá qué pasó y pedí revisión a otra cuenta. Recibir la sala
            confirma el recurso recibido; para saber si el apoyo sirvió hace falta evidencia del
            resultado.
          </li>
        </ol>
        <p className="mt-4 text-sm">
          Este recorrido sigue siendo ficticio. No crea iniciativas ni asigna tareas.
        </p>
      </aside>
      <Link className="mt-4 inline-flex min-h-11 underline" href="/capacidades">
        Explorar capacidades reales →
      </Link>
    </section>
  );
}

import { useState } from 'react';
import { Link } from 'wouter';

import { CASOS_COTIDIANOS, type CasoCotidiano } from './casos';

import { BotonPapel } from '~/components/papel/primitives';
import { MarcoParticipacion } from '~/components/participacion/Elementos';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

export function EjemplosFichas() {
  useTituloDePagina('Cómo pasar de un aporte a un resultado');
  const [elegido, setElegido] = useState(CASOS_COTIDIANOS[0]?.id ?? '');
  const caso = CASOS_COTIDIANOS.find((c) => c.id === elegido);
  return (
    <MarcoParticipacion
      titulo="De algo que nos pasa a algo que podemos cambiar"
      entrada="Tres recorridos para aprender a escuchar, contrastar y actuar. Podés usar sus preguntas para empezar una ficha de tu lugar."
      kicker="Ejemplos de funcionamiento"
    >
      <p className="border-violeta border-l-4 p-4 text-sm font-semibold">
        Ejemplos ficticios. No son datos, acuerdos ni resultados reales y no cuentan como aportes
        del mapa.
      </p>
      <Link
        className="mt-5 inline-flex min-h-11 underline"
        href="/recorridos/llegar-a-tiempo-a-la-escuela"
      >
        Llegar a tiempo a la escuela: practicar el recorrido completo
      </Link>
      <nav aria-label="Elegí un ejemplo cotidiano" className="my-6 grid gap-3 md:grid-cols-3">
        {CASOS_COTIDIANOS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={elegido === c.id}
            className={`border-tinta min-h-16 border p-4 text-left ${elegido === c.id ? 'bg-tinta text-papel' : 'bg-papel'}`}
            onClick={() => {
              setElegido(c.id);
            }}
          >
            {c.titulo}
          </button>
        ))}
      </nav>
      <Link className="mb-5 inline-flex min-h-11 underline" href="/capacidades/ejemplo">
        Probá cómo se reserva una capacidad compartida →
      </Link>
      {caso ? <Recorrido key={caso.id} caso={caso} /> : null}
      <Link className="mt-8 inline-flex min-h-11 underline" href="/fichas">
        Volver a las fichas reales
      </Link>
    </MarcoParticipacion>
  );
}
function Recorrido({ caso }: { caso: CasoCotidiano }) {
  const [paso, setPaso] = useState(0);
  const actual = caso.pasos[paso];
  return (
    <article>
      <h2 className="font-anton text-4xl">{caso.titulo}</h2>
      <p className="mt-4 max-w-3xl leading-relaxed">{caso.escena}</p>
      <p className="mt-4 max-w-3xl leading-relaxed">
        <strong>El futuro que se busca: </strong>
        {caso.futuro}
      </p>
      <div className="my-6 flex flex-wrap gap-2" aria-label="Pasos del recorrido">
        {caso.pasos.map((p, i) => (
          <button
            key={p.titulo}
            aria-pressed={paso === i}
            onClick={() => {
              setPaso(i);
            }}
            className={`min-h-11 border px-3 ${paso === i ? 'border-violeta text-violeta' : 'border-tinta'}`}
          >
            {i + 1}. {p.titulo}
          </button>
        ))}
      </div>
      {actual ? (
        <section
          aria-live="polite"
          aria-atomic="true"
          className="border-tinta bg-papel-crudo border p-6"
        >
          <p className="font-space text-xs uppercase">
            Paso {paso + 1} de {caso.pasos.length} · ejemplo
          </p>
          <h3 className="font-anton mt-3 text-3xl">{actual.titulo}</h3>
          <p className="mt-4 leading-relaxed">{actual.accion}</p>
          <p className="mt-5 leading-relaxed">
            <strong>Qué queda registrado: </strong>
            {actual.resultado}
          </p>
          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button
              className="min-h-11 underline disabled:opacity-40"
              disabled={paso === 0}
              onClick={() => {
                setPaso(paso - 1);
              }}
            >
              Paso anterior
            </button>
            <button
              className="min-h-11 underline disabled:opacity-40"
              disabled={paso === caso.pasos.length - 1}
              onClick={() => {
                setPaso(paso + 1);
              }}
            >
              Paso siguiente
            </button>
          </div>
        </section>
      ) : null}
      <h3 className="font-anton mt-9 text-3xl">Alternativas que se podrían comparar</h3>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {caso.alternativas.map((a) => (
          <article key={a.nombre} className="border-tinta border p-5">
            <h4 className="font-anton text-2xl">{a.nombre}</h4>
            <p className="mt-3">{a.mecanismo}</p>
            <p className="mt-4 text-sm">
              <strong>Recursos y costos: </strong>
              {a.costo}
            </p>
            <p className="mt-3 text-sm">
              <strong>Riesgo a discutir: </strong>
              {a.riesgo}
            </p>
          </article>
        ))}
      </div>
      <h3 className="font-anton mt-9 text-3xl">Cómo aporta a una visión de país</h3>
      <p className="mt-4 max-w-3xl leading-relaxed">{caso.conexiones}</p>
      <p className="mt-4 max-w-3xl text-sm">
        Las fichas de distintos lugares permiten comparar objetivos, diferencias y dependencias. La
        síntesis comprende a quienes participaron y conserva lo que falta escuchar.
      </p>
      <BotonPapel asChild className="mt-6">
        <Link href={`/fichas/nueva?ejemplo=${caso.id}`}>Empezar una ficha con esta pregunta</Link>
      </BotonPapel>
      <p className="mt-3 text-sm">
        Se prepara un borrador con la pregunta y la tarea de investigación. Vos elegís el lugar; no
        se copian observaciones ni resultados del ejemplo.
      </p>
    </article>
  );
}

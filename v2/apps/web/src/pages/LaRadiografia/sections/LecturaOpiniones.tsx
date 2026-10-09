import { useState } from 'react';
import { Link } from 'wouter';

import { porcentajeDe, RESPUESTAS_MINIMAS_PARA_DECIMALES } from '../radiografia-data';

import { BarrasOpiniones } from './BarrasOpiniones';

import { ISLA_DE_PAPEL } from '~/components/papel/esquema';
import { CAMPO } from '~/components/participacion/constantes';
import { useFichas } from '~/lib/queries/fichas';
import { useDisenoFicha } from '~/lib/queries/participacion';
import { cn } from '~/lib/utils';
import { cuantos } from '~/lib/vocabulario';

export function LecturaOpiniones({ filtros }: { filtros: Record<string, string> }) {
  const territorio = Number(filtros.territorio);
  const fichas = useFichas(
    Number.isSafeInteger(territorio) && territorio > 0 ? territorio : undefined,
    filtros.campana,
  );
  const [elegida, setElegida] = useState('');
  const lista = fichas.data?.fichas ?? [];
  const id = lista.some((f) => f.id === elegida) ? elegida : (lista[0]?.id ?? '');
  return (
    <section
      id="acuerdos"
      aria-labelledby="lectura-opiniones"
      className={cn('bg-papel text-tinta mt-12 border p-6', ISLA_DE_PAPEL)}
    >
      <h2 id="lectura-opiniones" className="font-anton text-4xl">
        Acuerdos y diferencias
      </h2>
      <p className="mt-4 max-w-[75ch] leading-relaxed">
        Acá se ve si hay acuerdo con una afirmación concreta. Que dos aportes se parezcan en el
        cielo no alcanza: hace falta que alguien responda.
      </p>
      <p className="text-tinta-50 mt-3 text-sm leading-relaxed">
        La campaña y el lugar filtran las fichas que podés elegir. Los filtros de fecha, tema,
        edición y tipo de arriba valen para el cielo: no recortan las respuestas de una ficha ni
        mezclan dos conversaciones en una sola.
      </p>
      {fichas.isLoading ? (
        <p role="status" className="mt-4">
          Buscando conversaciones…
        </p>
      ) : fichas.isError ? (
        <p role="alert" className="mt-4">
          No pudimos consultar las fichas. Una lectura fallida no significa que nadie haya
          respondido.
        </p>
      ) : lista.length ? (
        <>
          <label className="mt-6 block">
            Conversación que vamos a leer
            <select
              className={CAMPO}
              value={id}
              onChange={(e) => {
                setElegida(e.target.value);
              }}
            >
              {lista.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titulo}
                </option>
              ))}
            </select>
          </label>
          <p className="text-tinta-50 mt-3 text-sm">
            {cuantos(lista.length, 'ficha disponible', 'fichas disponibles', true)} de{' '}
            {(fichas.data?.total ?? 0).toLocaleString('es-AR')}. Cada ficha mantiene su alcance.
          </p>
          <Conversacion key={id} id={id} />
        </>
      ) : (
        <p className="mt-5">Todavía no hay fichas de futuro en este alcance.</p>
      )}
      <Link
        href={`/fichas?${new URLSearchParams({ ...(filtros.territorio ? { lugar: filtros.territorio } : {}), ...(filtros.campana ? { campana: filtros.campana } : {}) }).toString()}`}
        className="text-violeta mt-5 inline-flex min-h-11 items-center underline"
      >
        Explorar las fichas de futuro →
      </Link>
    </section>
  );
}

const ESTADO_DE_LA_LECTURA = {
  exploratorio: 'Hipótesis exploratoria',
  sin_estructura: 'Sin grupos distinguibles',
} as const;

function Conversacion({ id }: { id: string }) {
  const q = useDisenoFicha(id);
  if (q.isLoading)
    return (
      <p role="status" className="mt-5">
        Leyendo las respuestas…
      </p>
    );
  if (q.isError || !q.data)
    return (
      <p role="alert" className="mt-5">
        No pudimos leer las respuestas de esta ficha. Podés consultar su proceso desde el enlace
        original.
      </p>
    );
  const d = q.data;
  const a = d.analisisOpiniones;
  const enlaceALaFicha = (
    <Link
      href={`/fichas/${id}`}
      className="text-violeta mt-4 inline-flex min-h-11 items-center underline"
    >
      Abrir la ficha, responder y seguir sus diseños →
    </Link>
  );
  // Una ficha sin una sola respuesta es UN vacío, no cuatro renglones con ceros
  // («Estructura insuficiente», «0 cuentas», «0 incluidas», «0 afirmaciones»).
  if (a.participantes === 0 && d.afirmaciones.length === 0) {
    return (
      <div className="mt-6">
        <p className="leading-relaxed">
          Esta ficha todavía no tiene respuestas. Para ver acuerdos y diferencias hace falta que
          alguien responda sus afirmaciones.
        </p>
        {enlaceALaFicha}
      </div>
    );
  }
  return (
    <div className="mt-6">
      <p className="font-space text-violeta text-xs uppercase">
        {a.estado === 'exploratorio' || a.estado === 'sin_estructura'
          ? ESTADO_DE_LA_LECTURA[a.estado]
          : 'Todavía no alcanza para distinguir grupos'}
      </p>
      <p className="mt-3 leading-relaxed">{a.motivo}</p>
      <p className="text-tinta-50 mt-3 text-sm">
        Vieron o respondieron: {cuantos(a.participantes, 'cuenta', 'cuentas', true)}. Entraron en el
        cálculo de grupos: {cuantos(a.incluidos, 'cuenta', 'cuentas', true)}. Afirmaciones
        publicadas: {cuantos(d.afirmaciones.length, 'afirmación', 'afirmaciones', true)}.
      </p>
      {d.afirmaciones.length ? <BarrasOpiniones afirmaciones={d.afirmaciones} /> : null}
      {!d.afirmaciones.length ? (
        <p className="mt-5">Esta conversación todavía no tiene afirmaciones publicadas.</p>
      ) : null}
      {a.grupos.length ? (
        <section className="mt-7">
          <h3 className="font-anton text-2xl">Cómo respondió cada grupo</h3>
          <p className="text-tinta-50 mt-3 text-sm">
            {a.grupos
              .map((g) => `${g.nombre}: ${cuantos(g.cuentas, 'cuenta', 'cuentas', true)}`)
              .join(' · ')}
          </p>
          <ul className="mt-4 space-y-4">
            {a.condiciones.map((c) => (
              <li key={c.afirmacion} className="border p-4">
                <p>
                  {d.afirmaciones.find((f) => f.id === c.afirmacion)?.texto ??
                    'Afirmación no disponible.'}
                </p>
                <ul className="mt-3 space-y-3">
                  {c.grupos.map((g) => (
                    <BarraDeGrupo key={g.nombre} {...g} />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="mt-5" aria-labelledby={`limites-${id}`}>
        <h3 id={`limites-${id}`} className="font-space text-xs uppercase tracking-[0.1em]">
          Lo que esta lectura no dice
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>El pase es una respuesta; un faltante no es acuerdo.</li>
          <li>Las cuentas no acreditan personas únicas.</li>
          <li>No representa a la población ni autoriza una política.</li>
        </ul>
        <details className="mt-3">
          <summary className="min-h-11 cursor-pointer py-3 underline">Cómo se calculó</summary>
          <p className="mt-1 text-sm leading-relaxed">
            {a.metodo} El motor es una adaptación propia; no es la implementación oficial de Polis.
          </p>
        </details>
      </section>
      {enlaceALaFicha}
    </div>
  );
}

/** Un grupo, una barra: el acuerdo con la afirmación, con su n a la vista. */
function BarraDeGrupo({
  nombre,
  acuerdos,
  respuestas,
}: {
  nombre: string;
  acuerdos: number | null;
  respuestas: number | null;
}) {
  if (acuerdos === null || respuestas === null) {
    return (
      <li className="text-tinta-75 text-sm">
        {nombre}: desglose reservado por tamaño insuficiente.
      </li>
    );
  }
  const pocas = respuestas < RESPUESTAS_MINIMAS_PARA_DECIMALES;
  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
        <span>{nombre}</span>
        <span className="font-space">
          {acuerdos} de {cuantos(respuestas, 'respuesta', 'respuestas', true)} de acuerdo ·{' '}
          {porcentajeDe(acuerdos, respuestas)}
        </span>
      </div>
      <div
        className="border-papel-borde bg-papel-presionado mt-1 h-3 w-full border"
        role="img"
        aria-label={`${nombre}: ${String(acuerdos)} de ${String(respuestas)} respuestas de acuerdo (${porcentajeDe(acuerdos, respuestas)})`}
      >
        <div
          className="bg-tinta h-full"
          style={{ width: `${String(Math.min(100, (acuerdos * 100) / Math.max(1, respuestas)))}%` }}
        />
      </div>
      {pocas ? <p className="text-tinta-50 mt-1 text-xs">Pocas respuestas.</p> : null}
    </li>
  );
}

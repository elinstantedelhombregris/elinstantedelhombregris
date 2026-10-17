import { useState } from 'react';
import { Link } from 'wouter';

import { ListaGestion } from './Lista';

import type { TareaDisponible } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';

export function TareasDisponibles({ fichaId }: { fichaId?: string }) {
  const [texto, setTexto] = useState('');
  const [buscar, setBuscar] = useState('');
  const parametros = new URLSearchParams({ buscar, ...(fichaId ? { fichaId } : {}) });
  return (
    <section aria-labelledby="tareas-disponibles" className="my-7">
      <h2 id="tareas-disponibles" className="font-anton text-3xl">
        Encontrá una tarea para sumarte
      </h2>
      <p className="mt-3 max-w-[65ch]">
        Leé qué hace falta y qué recursos se necesitan. Después podés entrar al equipo y aceptar una
        tarea con tu firma. La disponibilidad se confirma al aceptar.
      </p>
      {fichaId ? (
        <p className="mt-3">
          Mostramos tareas vinculadas a esta ficha.{' '}
          <Link className="underline" href={`/fichas/${fichaId}`}>
            Volver a la ficha
          </Link>{' '}
          ·{' '}
          <Link className="underline" href="/iniciativas">
            Ver todas las tareas
          </Link>
        </p>
      ) : null}
      <form
        className="mt-5 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setBuscar(texto.trim());
        }}
      >
        <label className="min-w-0 flex-1">
          Buscar una tarea o iniciativa
          <input
            className={CAMPO}
            value={texto}
            maxLength={120}
            onChange={(e) => {
              setTexto(e.target.value);
            }}
            type="search"
          />
        </label>
        <button className="border-tinta min-h-11 border px-5" type="submit">
          Buscar tareas
        </button>
      </form>
      <ListaGestion<TareaDisponible>
        actualizar="Actualizar tareas"
        ruta={`/tareas-disponibles?${parametros}`}
        vacio={
          buscar
            ? 'No encontramos tareas con esa búsqueda. Probá otras palabras.'
            : 'Todavía no hay tareas disponibles en este alcance. Podés recorrer el ejemplo escolar o proponer una iniciativa.'
        }
      >
        {(t) => (
          <article key={t.id} className="border-tinta space-y-3 border p-5">
            <p className="text-sm">{t.iniciativaTitulo} · Busca responsable</p>
            <h3 className="font-anton text-2xl">{t.titulo}</h3>
            <p>{t.alcance}</p>
            <p>Recursos: {t.recursos || 'Por detallar con el equipo'}.</p>
            <p>Revisión prevista: {t.fecha || 'Por acordar con el equipo'}.</p>
            {t.fecha && t.fecha < new Date().toISOString().slice(0, 10) ? (
              <p>
                La fecha prevista ya pasó. Acordá una nueva fecha con el equipo antes de aceptar.
              </p>
            ) : null}
            {t.fichaId ? (
              <Link className="block underline" href={`/fichas/${t.fichaId}`}>
                Para qué lo hacemos: {t.fichaTitulo}
              </Link>
            ) : (
              <p className="text-sm">El equipo todavía no vinculó una ficha de devolución.</p>
            )}
            <Link
              className="border-tinta inline-flex min-h-11 items-center border px-4"
              href={`/iniciativas/${t.iniciativaSlug}?seccion=tareas&tarea=${t.id}`}
            >
              Ver tarea y cómo sumarme
            </Link>
          </article>
        )}
      </ListaGestion>
    </section>
  );
}

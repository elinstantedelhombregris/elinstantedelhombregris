import { CATALOGO_FUENTES, VERSIONES_FUENTES } from '@v2/shared';
import { Link, useSearch } from 'wouter';

import { EstadoActualizacion } from './Fuentes/EstadoActualizacion';
import { Geografia } from './Fuentes/Geografia';

import { Kicker } from '~/components/papel/primitives';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

export function Fuentes() {
  useTituloDePagina('Fuentes y geografía');
  const version = new URLSearchParams(useSearch()).get('version');
  const catalogo =
    version === null ? CATALOGO_FUENTES : VERSIONES_FUENTES.find((c) => c.version === version);
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-10">
      <Kicker>De la cifra a su origen</Kicker>
      <h1 className="font-anton mt-3 text-5xl">Fuentes y geografía</h1>
      <p className="mt-5 max-w-3xl text-lg">
        Antes de proponer una mejora, necesitamos saber qué dato tenemos, a quién describe y qué
        todavía falta averiguar.
      </p>
      <nav aria-label="Recorrido de las fuentes" className="mt-4 flex flex-wrap gap-x-6">
        <Link className="inline-flex min-h-11 items-center underline" href="/el-mapa">
          Explorar el mapa
        </Link>
        <Link className="inline-flex min-h-11 items-center underline" href="/fichas">
          Trabajar con una ficha
        </Link>
        <a className="inline-flex min-h-11 items-center underline" href="#geografia">
          Ver la geografía
        </a>
      </nav>
      {!catalogo ? (
        <p role="alert" className="mt-8">
          Esta edición del catálogo no está disponible.{' '}
          <Link className="underline" href="/fuentes">
            Consultar la edición actual
          </Link>
          .
        </p>
      ) : (
        <>
          <section className="border-tinta/30 mt-8 border-y py-5" aria-label="Alcance del catálogo">
            <h2 className="font-anton text-3xl">Servicios básicos y conectividad</h2>
            <EstadoActualizacion recurso="fuentes" />
            <p className="mt-3">
              Selección editorial de cuatro indicadores para empezar. Describe población en
              viviendas particulares, a escala nacional, en 2022. No representa la situación actual
              de tu barrio ni las prioridades de quienes participan.
            </p>
            <p className="mt-3">{catalogo.verificacion}</p>
            <p className="mt-3 break-words text-sm">
              Edición {catalogo.version} · consulta {catalogo.consultada}. Publicación:{' '}
              {catalogo.publicacion}.
            </p>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer">
                Comprobar el original y citar esta selección
              </summary>
              <p className="mt-2">
                PDF del INDEC, página 9; archivo reemplazado por el organismo el 27/9/2024. Huella
                SHA-256 del archivo consultado:
              </p>
              <code className="mt-2 block break-all">{catalogo.archivoSha256}</code>
              <a
                className="mr-6 inline-flex min-h-11 items-center underline"
                href={`/fuentes/versiones/${catalogo.version}.json`}
                download
              >
                Descargar esta selección
              </a>
              <a
                className="inline-flex min-h-11 items-center underline"
                href={`/fuentes?version=${encodeURIComponent(catalogo.version)}`}
              >
                Enlace a esta edición
              </a>
            </details>
          </section>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {catalogo.indicadores.map((i) => (
              <article id={i.id} key={i.id} className="border-tinta/30 min-w-0 border p-5">
                <p className="font-space text-xs uppercase tracking-wider">
                  {i.tema} · total del país · 2022
                </p>
                <h2 className="font-anton mt-3 text-2xl">{i.dato.titulo}</h2>
                <p className="font-anton mt-4 text-5xl">
                  {i.dato.estado === 'disponible'
                    ? `${i.dato.valor?.toLocaleString('es-AR') ?? 'Valor pendiente'} ${i.dato.unidad}`
                    : i.dato.estado === 'no_publicado'
                      ? 'Dato no publicado'
                      : 'Dato no disponible'}
                </p>
                <p className="mt-2 text-sm">
                  {i.personas.toLocaleString('es-AR')} personas según la publicación. No es un
                  porcentaje de hogares.
                </p>
                <p className="mt-4">{i.dato.limites}</p>
                <p className="mt-4 font-semibold">Para investigar en tu zona: {i.pregunta}</p>
                <a
                  className="mt-3 inline-flex min-h-11 items-center underline"
                  href={i.dato.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Comprobar en INDEC · página 9
                </a>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer">Método, fechas y condiciones de uso</summary>
                  <p className="mt-3">
                    Referencia: {i.dato.referencia}. Consulta: {i.dato.obtenida}.
                  </p>
                  <p className="mt-3">{i.dato.metodo}</p>
                  <p className="mt-3">
                    {i.dato.licencia} {i.dato.frecuencia}
                  </p>
                  <a
                    href="https://creativecommons.org/licenses/by-sa/4.0/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center underline"
                  >
                    Consultar licencia CC BY-SA 4.0
                  </a>
                </details>
              </article>
            ))}
          </div>
          <section className="border-violeta mt-8 border-l-2 pl-5">
            <h2 className="font-anton text-2xl">Cómo usarlo en una ficha</h2>
            <p className="mt-3">
              En «Evidencia y objetivos», elegí «Agregar desde el catálogo». El dato conserva su
              escala nacional. Después prepará una tarea de escucha local: por ejemplo, documentar
              cortes de agua, horarios y zonas afectadas, con autorización para publicar el resumen.
              La observación local se incorpora como otra fuente.
            </p>
            <p className="mt-3">
              Si adaptás un dato, se desvincula de la edición contrastada. Cero, dato no publicado y
              dato no disponible tienen significados distintos.
            </p>
          </section>
        </>
      )}
      <Geografia />
    </main>
  );
}

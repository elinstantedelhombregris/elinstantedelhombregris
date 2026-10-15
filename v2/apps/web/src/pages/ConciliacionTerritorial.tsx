import { useQuery } from '@tanstack/react-query';
import { PROVINCIAS_CANONICAS } from '@v2/civic-core';
import { useState } from 'react';
import { Link } from 'wouter';

import type { ConciliacionTerritorial } from '@v2/shared';

import { api } from '~/lib/api';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

const NIVELES = {
  province: 'Jurisdicciones',
  department: 'Departamentos, partidos y comunas',
  municipality: 'Gobiernos locales',
  locality: 'Localidades censales',
};
export function ConciliacionTerritorial() {
  useTituloDePagina('Conciliación territorial y censal');
  const [nivel, setNivel] = useState('province'),
    [provincia, setProvincia] = useState(''),
    [diferencias, setDiferencias] = useState(false),
    [pagina, setPagina] = useState(0);
  const q = useQuery({
    queryKey: ['conciliacion', nivel, provincia, diferencias, pagina],
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: ({ signal }) =>
      api.get<ConciliacionTerritorial>(
        `/api/v1/conciliacion?${new URLSearchParams({ nivel, ...(provincia ? { provincia } : {}), diferencias: diferencias ? 'si' : 'no', pagina: String(pagina) })}`,
        { signal },
      ),
  });
  const d = q.isError ? undefined : q.data;
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-10">
      <p className="text-sm uppercase tracking-widest">Fuentes y territorio</p>
      <h1 className="font-anton mt-3 text-5xl">Conciliación territorial y censal</h1>
      <p className="mt-5 max-w-3xl text-lg">
        Comprobá a qué lugar se refiere un dato antes de usarlo para proponer una mejora. Cruzamos
        códigos del Censo 2022, cartografía IGN y unidades del sitio dentro del mismo tipo de
        territorio.
      </p>
      <nav className="mt-4 flex flex-wrap gap-6">
        <Link className="inline-flex min-h-11 items-center underline" href="/fuentes">
          Fuentes y versiones
        </Link>
        <Link className="inline-flex min-h-11 items-center underline" href="/sintesis-nacional">
          Síntesis de los territorios participantes
        </Link>
      </nav>
      <section
        className="border-tinta/30 mt-6 border-y py-5"
        aria-label="Cómo interpretar el cruce"
      >
        <h2 className="font-anton text-3xl">Código coincidente, límites por comprobar</h2>
        <p className="mt-3">
          La coincidencia permite investigar una correspondencia. Todavía hay que comprobar límites,
          fecha y universo de la cifra. El catálogo operativo es una lectura actual de la base; no
          tiene una edición censal asignada.
        </p>
        <p className="mt-3">
          Ejemplo: para estudiar agua de red en un barrio, el porcentaje nacional sirve de contexto.
          Primero identificá la localidad y su departamento, revisá los límites de 2022 y buscá un
          dato de esa escala. No repartas el porcentaje nacional entre municipios.
        </p>
        <p className="mt-3">
          Localidad, gobierno local y departamento pueden tener pertenencias distintas. El
          aglomerado puede cruzar jurisdicciones. Este cruce conserva esas referencias y no
          convierte una categoría residual en un municipio.
        </p>
      </section>
      <form
        className="my-6 flex flex-wrap items-end gap-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <label className="grid gap-2">
          Unidad
          <select
            className="border-tinta max-w-full border bg-transparent p-3"
            value={nivel}
            onChange={(e) => {
              setNivel(e.target.value);
              setPagina(0);
            }}
          >
            {Object.entries(NIVELES).map(([k, v]) => (
              <option value={k} key={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 max-w-full gap-2">
          Provincia
          <select
            className="border-tinta max-w-full border bg-transparent p-3"
            value={provincia}
            onChange={(e) => {
              setProvincia(e.target.value);
              setPagina(0);
            }}
          >
            <option value="">Todas las provincias</option>
            {PROVINCIAS_CANONICAS.map((p) => (
              <option key={p.georefId} value={p.georefId}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={diferencias}
            onChange={(e) => {
              setDiferencias(e.target.checked);
              setPagina(0);
            }}
          />
          Solo diferencias
        </label>
      </form>
      {q.isPending && <p role="status">Consultando las unidades…</p>}
      {q.error && (
        <p role="alert">
          No pudimos completar la conciliación. {q.error.message}
          <button className="ml-3 min-h-11 underline" onClick={() => void q.refetch()}>
            Reintentar
          </button>
        </p>
      )}
      {d && (
        <>
          <p className="font-semibold">
            {d.total} registros en este alcance; {d.conDiferencias} con diferencias. Se muestran{' '}
            {d.filas.length} de {d.filtradas} según el filtro.
          </p>
          <p className="mt-2 text-sm">
            Consulta: {new Date(d.fecha).toLocaleString('es-AR')}. Las filas sin diferencias también
            requieren validación de límites.
          </p>
          {d.sinCodigoSinAsignar > 0 && (
            <p className="mt-3">
              Hay {d.sinCodigoSinAsignar} geometrías de este nivel sin código. Solo aparecen sin
              filtro provincial; no se asignan a una provincia por su nombre.
            </p>
          )}
          {!d.filas.length && (
            <p className="mt-5">
              No hay registros para este filtro. Esto no significa que no viva gente allí.
            </p>
          )}
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {d.filas.map((f) => (
              <li className="border-tinta/40 min-w-0 border p-5" key={f.clave}>
                <h2 className="text-lg font-semibold">
                  {f.censo?.nombre ?? f.geometria ?? f.operativo?.nombre}{' '}
                  <span className="font-normal">({f.codigo ?? 'sin código'})</span>
                </h2>
                <dl className="mt-3 space-y-2 break-words">
                  <div>
                    <dt className="font-semibold">Censo 2022</dt>
                    <dd>
                      {f.censo
                        ? `${f.censo.nombre} · fila ${f.censo.fila} del original`
                        : 'No encontrado en este nomenclador'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Geometría IGN</dt>
                    <dd>{f.geometria ?? 'No incorporada para esta unidad'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Catálogo del sitio</dt>
                    <dd>
                      {f.operativo ? (
                        <Link className="underline" href={`/el-mapa?lugar=${f.operativo.id}`}>
                          {f.operativo.nombre}
                        </Link>
                      ) : (
                        'Sin correspondencia por nivel y código'
                      )}
                    </dd>
                  </div>
                </dl>
                {f.censo?.departamento && (
                  <p className="mt-3 text-sm">
                    Departamento: {f.censo.departamento}. Gobierno local:{' '}
                    {f.censo.gobiernoLocal ?? 'Sin referencia'}. Aglomerado:{' '}
                    {f.censo.aglomerado ?? 'Sin referencia'}. Tipo:{' '}
                    {f.censo.categoria ?? 'Sin categoría'}.
                  </p>
                )}
                {f.incidencias.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    {f.incidencias.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3">
                    Coinciden código y denominación. Equivalencia espacial pendiente.
                  </p>
                )}
              </li>
            ))}
          </ul>
          <nav aria-label="Páginas de conciliación" className="mt-5 flex gap-5">
            <button
              className="min-h-11 underline disabled:opacity-40"
              disabled={pagina === 0}
              onClick={() => {
                setPagina(pagina - 1);
              }}
            >
              Anterior
            </button>
            <span className="self-center">Página {pagina + 1}</span>
            <button
              className="min-h-11 underline disabled:opacity-40"
              disabled={d.siguiente === null}
              onClick={() => {
                if (d.siguiente !== null) setPagina(d.siguiente);
              }}
            >
              Siguiente
            </button>
          </nav>
          <details className="border-tinta/30 mt-8 border-t pt-5">
            <summary className="cursor-pointer font-semibold">
              Originales, versiones y método reproducible
            </summary>
            <p className="mt-3 break-all">
              Censo: {d.versionCenso}. IGN: {d.versionGeo}.
            </p>
            <p className="mt-3">
              Extracción de códigos como texto, conservando ceros iniciales. Control de duplicados y
              pertenencias; comparación de nombres sin tildes, mayúsculas ni espacios repetidos. Sin
              unión aproximada por nombre. Los nomencladores no contienen porcentajes ni certifican
              la igualdad de polígonos.
            </p>
            <ul className="mt-4 space-y-4">
              {d.fuentes.map((f) => (
                <li key={f.nivel}>
                  <a className="underline" href={f.url} rel="noreferrer" target="_blank">
                    Original INDEC: {NIVELES[f.nivel as keyof typeof NIVELES]}
                  </a>{' '}
                  · {f.registros} registros.{' '}
                  <a
                    className="underline"
                    download
                    href={`/geo/censo/${d.versionCenso}/${f.archivo}`}
                  >
                    Copia consultada
                  </a>
                  <code className="mt-1 block break-all text-xs">SHA-256 {f.sha256}</code>
                </li>
              ))}
            </ul>
            <a
              className="mt-4 inline-flex min-h-11 items-center underline"
              download
              href={`/geo/censo/${d.versionCenso}/nomenclador.json`}
            >
              Descargar nomenclador y procedencia (JSON)
            </a>
          </details>
        </>
      )}
    </main>
  );
}

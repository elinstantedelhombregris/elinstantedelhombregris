import { useQuery } from '@tanstack/react-query';
import { GEOGRAFIA, TIPOS_INCIDENCIA_ESPACIAL, VALIDACION_ESPACIAL } from '@v2/shared';
import { useState } from 'react';
import { Link } from 'wouter';

import { cargarInformeEspacial } from './ValidacionEspacial/cargar-informe';

import { useTituloDePagina } from '~/lib/titulo-de-pagina';

const CAPAS = {
  provincias: 'Provincias',
  departamentos: 'Departamentos',
  municipios: 'Municipios',
};
const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 });

export function ValidacionEspacial() {
  useTituloDePagina('Validación espacial de límites');
  const [capa, setCapa] = useState('');
  const [tipo, setTipo] = useState('geometria_invalida');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const q = useQuery({
    queryKey: ['validacion-espacial', VALIDACION_ESPACIAL.sha256],
    queryFn: ({ signal }) => cargarInformeEspacial(signal),
  });
  const d = q.isError ? undefined : q.data;
  const termino = busqueda.trim().toLocaleLowerCase('es');
  const filas =
    d?.incidencias.filter(
      (i) =>
        (!capa || i.capa === capa) &&
        (!tipo || i.tipo === tipo) &&
        (!termino ||
          i.unidades.some((u) =>
            `${u.codigo ?? ''} ${u.nombre}`.toLocaleLowerCase('es').includes(termino),
          )),
    ) ?? [];
  const invalidos = d?.capas.reduce((s, c) => s + c.invalidos, 0) ?? 0;
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-10">
      <p className="text-sm uppercase tracking-widest">Fuentes y territorio</p>
      <h1 className="font-anton mt-3 text-5xl">Validación espacial de límites</h1>
      <p className="mt-5 max-w-3xl text-lg">
        Revisá si las áreas del mapa son válidas, se superponen o difieren entre capas antes de
        usarlas para analizar un lugar.
      </p>
      <nav className="mt-4 flex flex-wrap gap-6">
        <Link
          href="/conciliacion-territorial"
          className="inline-flex min-h-11 items-center underline"
        >
          Cruzar códigos y censo
        </Link>
        <Link href="/fuentes#geografia" className="inline-flex min-h-11 items-center underline">
          Fuentes y versiones
        </Link>
      </nav>
      <p className="mt-4 break-all text-sm">Edición del mapa: {GEOGRAFIA.version}</p>
      {q.isPending && (
        <p role="status" className="mt-6">
          Comprobando el informe…
        </p>
      )}
      {q.error && (
        <div role="alert" className="mt-6">
          <p>{q.error.message}</p>
          <button className="min-h-11 underline" onClick={() => void q.refetch()}>
            Reintentar
          </button>
        </div>
      )}
      {d && (
        <>
          <section
            aria-label="Resultado de los controles"
            className="border-tinta/40 my-6 border-y py-6"
          >
            <h2 className="font-anton text-3xl">
              {invalidos
                ? `${invalidos} polígonos necesitan corrección`
                : 'Sin polígonos inválidos en este control'}
            </h2>
            <p className="mt-3">
              El informe registra {d.incidencias.length} observaciones y controles pendientes. Una
              geometría válida puede tener diferencias con otra capa; este resultado no acredita
              límites legales ni equivalencia con el Censo 2022.
            </p>
            <p className="mt-3">
              Control realizado:{' '}
              {new Date(d.generadoEn).toLocaleString('es-AR', { timeZone: 'UTC' })} UTC. La fecha de
              la cartografía sigue siendo {GEOGRAFIA.obtenida}.
            </p>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              {d.capas.map((c) => (
                <li key={c.nombre} className="border-tinta/30 border p-4">
                  <h3 className="text-xl font-semibold">{CAPAS[c.nombre]}</h3>
                  <p className="mt-2">
                    {c.rasgos} áreas · {c.invalidos} inválidas
                  </p>
                  <p>
                    {c.sinCodigo} sin código · {c.incidencias} observaciones o controles pendientes
                  </p>
                </li>
              ))}
            </ul>
          </section>
          <section aria-label="Cómo operar con un límite observado" className="max-w-3xl">
            <h2 className="font-anton text-3xl">Cómo usarlo en una ficha</h2>
            <p className="mt-3">
              Por ejemplo, para estudiar el acceso al agua, buscá el código de tu municipio. Si el
              polígono es inválido o queda fuera de su provincia, documentá la observación en la
              fuente de la ficha y pedí una delimitación adecuada antes de calcular población o
              cobertura.
            </p>
            <p className="mt-3">
              Una diferencia pequeña puede venir de la simplificación; una grande requiere revisar
              fuente, fecha y unidad. Conservá la pregunta territorial pendiente hasta contrastarla.
              No repartas una cifra censal entre áreas por similitud de nombre o código.
            </p>
          </section>
          <form
            className="my-6 grid gap-4 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label className="grid gap-2">
              Capa
              <select
                className="border-tinta w-full min-w-0 border bg-transparent p-3"
                value={capa}
                onChange={(e) => {
                  setCapa(e.target.value);
                  setPagina(0);
                }}
              >
                <option value="">Todas las capas</option>
                {Object.entries(CAPAS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              Tipo de control
              <select
                className="border-tinta w-full min-w-0 border bg-transparent p-3"
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setPagina(0);
                }}
              >
                <option value="">Todas las observaciones</option>
                {Object.entries(TIPOS_INCIDENCIA_ESPACIAL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              Nombre o código
              <input
                className="border-tinta w-full min-w-0 border bg-transparent p-3"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(0);
                }}
              />
            </label>
          </form>
          <p role="status">
            {filas.length} observaciones según estos filtros. Se muestran{' '}
            {filas.slice(pagina * 20, (pagina + 1) * 20).length}.
          </p>
          {!filas.length && (
            <p className="mt-3">
              Sin observaciones para estos filtros. Esto no significa que se hayan comprobado todos
              los límites.
            </p>
          )}
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {filas.slice(pagina * 20, (pagina + 1) * 20).map((i, n) => (
              <li key={`${pagina}-${n}`} className="border-tinta/40 min-w-0 border p-5">
                <p className="text-sm">
                  {CAPAS[i.capa]} · {TIPOS_INCIDENCIA_ESPACIAL[i.tipo]}
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  {i.unidades.map((u) => `${u.nombre} (${u.codigo ?? 'sin código'})`).join(' / ')}
                </h3>
                <p className="mt-3 break-words">{i.detalle}</p>
                {i.areaM2 !== undefined && (
                  <p className="mt-3">
                    Área aproximada de la diferencia: {numero.format(i.areaM2 / 1_000_000)} km².
                  </p>
                )}
                {i.extension && (
                  <details className="mt-3">
                    <summary className="min-h-11 cursor-pointer underline">
                      Ubicar el área del rasgo
                    </summary>
                    <p className="break-words text-sm">
                      Oeste, sur, este, norte (longitud/latitud): {i.extension.join(', ')}. Es la
                      extensión del rasgo; el defecto puede afectar solo una parte.
                    </p>
                  </details>
                )}
              </li>
            ))}
          </ul>
          <div className="my-5 flex gap-6">
            <button
              disabled={pagina === 0}
              className="min-h-11 underline disabled:opacity-40"
              onClick={() => {
                setPagina((p) => p - 1);
              }}
            >
              Anterior
            </button>
            <button
              disabled={(pagina + 1) * 20 >= filas.length}
              className="min-h-11 underline disabled:opacity-40"
              onClick={() => {
                setPagina((p) => p + 1);
              }}
            >
              Siguiente
            </button>
          </div>
          <details className="border-tinta/40 mt-8 border-t pt-5">
            <summary className="min-h-11 cursor-pointer text-xl font-semibold">
              Método, exclusiones y archivos
            </summary>
            <ul className="mt-4 list-disc space-y-3 pl-5">
              {d.limites.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="mt-4 break-words text-sm">
              Método {d.metodoVersion}; Shapely {d.motor.shapely}, GEOS {d.motor.geos}, pyproj{' '}
              {d.motor.pyproj}, PROJ {d.motor.proj}. Umbral: {d.umbralM2} m². Proyección:{' '}
              {d.proyeccion}.
            </p>
            <a
              className="mt-3 inline-flex min-h-11 items-center underline"
              href={VALIDACION_ESPACIAL.archivo}
              download
            >
              Descargar informe completo (JSON)
            </a>
            <p className="break-all text-sm">SHA-256: {VALIDACION_ESPACIAL.sha256}</p>
          </details>
        </>
      )}
    </main>
  );
}

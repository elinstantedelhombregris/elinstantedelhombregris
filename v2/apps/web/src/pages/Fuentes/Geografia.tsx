import { GEOGRAFIA } from '@v2/shared';

import { EstadoActualizacion } from './EstadoActualizacion';

export function Geografia() {
  return (
    <section id="geografia" className="border-tinta mt-12 border-t-2 pt-8">
      <h2 className="font-anton text-3xl">Qué geografía usa el mapa</h2>
      <p className="mt-4 break-words">
        Edición <strong>{GEOGRAFIA.version}</strong> · fuente obtenida el {GEOGRAFIA.obtenida}.
      </p>
      <p className="mt-3">
        Sellar una edición conserva el dibujo utilizado; no demuestra que los límites sigan vigentes
        hoy.
      </p>
      <EstadoActualizacion recurso="geo" />
      <p className="mt-4">{GEOGRAFIA.limites}</p>
      <p className="mt-3 text-sm">{GEOGRAFIA.controles}</p>
      <a className="mt-3 inline-flex min-h-11 items-center underline" href="/validacion-espacial">
        Consultar el control espacial y las observaciones por unidad
      </a>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {GEOGRAFIA.capas.map((c) => (
          <article key={c.nombre} className="border-tinta/30 min-w-0 border p-4">
            <h3 className="font-semibold capitalize">{c.nombre}</h3>
            <p className="mt-3">
              {c.rasgos} áreas · {c.identificados} con código · {c.sinCodigo} sin código.
            </p>
            <p className="mt-3 text-sm">{c.union}</p>
            <p className="mt-3 text-sm">
              Simplificación: {c.toleranciaM} m. {GEOGRAFIA.crs}.
            </p>
            <a className="inline-flex min-h-11 items-center underline" href={c.archivo} download>
              Descargar {c.nombre}
            </a>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer">Huella del archivo</summary>
              <code className="mt-2 block break-all">{c.sha256}</code>
            </details>
          </article>
        ))}
      </div>
      <h3 className="mt-8 font-semibold">
        Un nombre parecido no prueba que sea el mismo territorio
      </h3>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>Los códigos se interpretan junto con el tipo de unidad y la versión.</li>
        <li>
          Municipios y departamentos tienen relaciones cruzadas: no forman siempre una escalera de
          pertenencia.
        </li>
        <li>
          Una localidad censal es otra unidad. Los radios y fracciones necesitan la edición censal
          correspondiente.
        </li>
        <li>
          Comparar años exige comprobar si cambiaron límites, universo y método. Aquí no se declara
          esa equivalencia.
        </li>
      </ul>
      <div className="mt-5 flex flex-wrap gap-x-6">
        <a
          className="inline-flex min-h-11 items-center underline"
          href={GEOGRAFIA.url}
          target="_blank"
          rel="noreferrer"
        >
          Fuente cartográfica · IGN
        </a>
        <a
          className="inline-flex min-h-11 items-center underline"
          href="https://www.argentina.gob.ar/georef"
          target="_blank"
          rel="noreferrer"
        >
          Nombres y códigos · Georef
        </a>
        <a
          className="inline-flex min-h-11 items-center underline"
          href={`/geo/versiones/${GEOGRAFIA.version}/manifiesto.json`}
          download
        >
          Descargar manifiesto de esta edición
        </a>
        <a className="inline-flex min-h-11 items-center underline" href="/geo/ultimo-intento.json">
          Último intento de actualización
        </a>
      </div>
    </section>
  );
}

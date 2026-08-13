import {
  colorDeClase,
  ORDENES,
  ordenarNucleos,
  rotuloDeNucleo,
  type NucleoEnPantalla,
  type Orden,
  type Tema,
} from '../radiografia-data';

/**
 * § La lista de núcleos — el camino accesible al MISMO dato (spec R11, §5.5).
 *
 * Una `<table>` de verdad, con encabezados de verdad y botones que se
 * alcanzan con el tabulador. No es una versión de consuelo con menos
 * información: es la misma información, leíble y ordenable. Un lienzo es
 * opaco para un lector de pantalla y para el teclado, así que si esto no
 * existe, la página no existe para quien navega así.
 *
 * El orden lo elige el lector y **no es un ranking editorial**: acá no se
 * ordenan señales de personas, se ordenan núcleos.
 *
 * Y la columna que manda no es el tamaño: es **qué se hace con lo que dice el
 * núcleo** (§3.1). Un núcleo de deseos y uno de hechos no pueden verse igual,
 * y por eso el rótulo va pegado a la frase y no escondido en una ficha.
 */

export interface ListaDeNucleosProps {
  nucleos: readonly NucleoEnPantalla[];
  orden: Orden;
  onOrdenar: (orden: Orden) => void;
  enfocado: string | null;
  onEnfocar: (id: string | null) => void;
  tema: Tema;
}

export function ListaDeNucleos({
  nucleos,
  orden,
  onOrdenar,
  enfocado,
  onEnfocar,
  tema,
}: ListaDeNucleosProps) {
  const nocturno = tema === 'nocturno';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-papel-borde';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  const ordenados = ordenarNucleos(nucleos, orden);

  return (
    <section aria-labelledby="titulo-lista" className="mt-12">
      <h2
        id="titulo-lista"
        className={`font-space mb-4 text-[11px] font-bold uppercase tracking-[0.14em] ${meta}`}
      >
        Los núcleos, uno por uno
      </h2>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className={`font-space text-[11px] uppercase tracking-[0.1em] ${meta}`}>
          Ordenar por
        </span>
        {ORDENES.map(({ valor, etiqueta }) => (
          <button
            key={valor}
            type="button"
            aria-pressed={orden === valor}
            onClick={() => {
              onOrdenar(valor);
            }}
            className={`font-space border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${
              orden === valor
                ? 'bg-violeta border-violeta text-papel'
                : nocturno
                  ? 'border-oscuro-borde text-oscuro-secundario'
                  : 'border-tinta text-tinta'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className={`sr-only`}>
            Los núcleos de convergencia al umbral elegido. Cada fila enfoca su núcleo en la
            constelación.
          </caption>
          <thead>
            <tr className={`border-b-2 ${nocturno ? 'border-oscuro-borde' : 'border-tinta'}`}>
              <th scope="col" className={cabecera(meta)}>
                Frase del centro · qué se hace con esto
              </th>
              <th scope="col" className={`${cabecera(meta)} text-right`}>
                Señales
              </th>
              <th scope="col" className={cabecera(meta)}>
                Clases
              </th>
              <th scope="col" className={`${cabecera(meta)} text-right`}>
                Provincias
              </th>
              <th scope="col" className={`${cabecera(meta)} text-right`}>
                Distancia
              </th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((nucleo) => {
              const { rotulo, glosa, clase, mixto } = rotuloDeNucleo(nucleo.clases);
              const activo = enfocado === nucleo.id;
              return (
                <tr
                  key={nucleo.id}
                  className={`border-b ${borde} ${activo ? (nocturno ? 'bg-white/5' : 'bg-papel-presionado') : ''}`}
                >
                  <th scope="row" className="max-w-[420px] py-4 pr-4 align-top font-normal">
                    <button
                      type="button"
                      onClick={() => {
                        onEnfocar(activo ? null : nucleo.id);
                      }}
                      aria-pressed={activo}
                      className={`text-left ${texto} hover:text-violeta transition-colors`}
                    >
                      <span className="block text-[16px] leading-[1.4]">
                        {nucleo.frase ? (
                          `«${nucleo.frase.texto}»`
                        ) : (
                          <em className={meta}>
                            Sin frase — {nucleo.textoOmitido ?? 'sin cesión de licencia'}
                          </em>
                        )}
                      </span>
                      <span
                        className="font-space mt-1 block text-[11px] font-bold uppercase tracking-[0.1em]"
                        style={{ color: mixto ? undefined : colorDeClase(clase ?? '') }}
                      >
                        <span aria-hidden className="mr-2 inline-block">
                          {mixto ? '◐' : '●'}
                        </span>
                        {rotulo}
                      </span>
                      {glosa ? (
                        <span className={`font-space mt-1 block text-[11px] ${meta}`}>{glosa}</span>
                      ) : null}
                    </button>
                  </th>
                  <td className={`py-4 pr-4 text-right align-top tabular-nums ${texto}`}>
                    {nucleo.senales}
                  </td>
                  <td className="py-4 pr-4 align-top">
                    <span className="flex flex-wrap gap-1">
                      {Object.keys(nucleo.clases).map((c) => (
                        <span
                          key={c}
                          title={c}
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: colorDeClase(c) }}
                        />
                      ))}
                      <span className="sr-only">{Object.keys(nucleo.clases).join(', ')}</span>
                    </span>
                  </td>
                  <td className={`py-4 pr-4 text-right align-top tabular-nums ${texto}`}>
                    {nucleo.provincias ?? '—'}
                  </td>
                  <td className={`py-4 text-right align-top tabular-nums ${texto}`}>
                    {nucleo.distancia ? `${String(nucleo.distancia.km)} km` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function cabecera(meta: string): string {
  return `font-space pb-3 pr-4 text-[11px] font-bold uppercase tracking-[0.1em] ${meta}`;
}

import { useState } from 'react';

import { etiquetaDeClase, fraseCorta, type NucleoEnPantalla, type Tema } from '../radiografia-data';

import type { MiembroDeNucleo } from '~/lib/queries/radiografia';

import { cuantos } from '~/lib/vocabulario';

/** Cuántos aportes y cuántas provincias tiene un grupo, sin rayas ni ceros sueltos. */
function conteosDelGrupo(n: NucleoEnPantalla): string {
  const aportes = cuantos(n.senales, 'aporte', 'aportes');
  // En un corte recalculado en el navegador las provincias no se saben todavía:
  // se omiten en vez de escribir «— provincias».
  return n.provincias === null
    ? aportes
    : `${aportes} · ${cuantos(n.provincias, 'provincia', 'provincias', true)}`;
}

export function SelectorDelCielo({
  nucleos,
  solas,
  enfocado,
  seleccionado,
  tema,
  elegirFuente,
  elegirNucleo,
}: {
  nucleos: readonly NucleoEnPantalla[];
  solas: readonly MiembroDeNucleo[];
  enfocado: string | null;
  seleccionado: string | null;
  tema: Tema;
  elegirFuente: (m: { id: string; nucleoId: string | null }) => void;
  elegirNucleo: (id: string | null) => void;
}) {
  const [buscar, setBuscar] = useState('');
  const [verFuentes, setVerFuentes] = useState(false);
  const abierto = nucleos.find((n) => n.id === enfocado);
  const mostradas = abierto?.miembros ?? solas;
  const filtrados = nucleos.filter(
    (n) =>
      !buscar ||
      n.frase?.texto.toLocaleLowerCase('es-AR').includes(buscar.toLocaleLowerCase('es-AR')),
  );
  const borde = tema === 'nocturno' ? 'border-oscuro-borde' : 'border-tinta';
  const meta = tema === 'nocturno' ? 'text-oscuro-secundario' : 'text-tinta-75';
  return (
    <div className={`border-t ${borde} p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-anton text-2xl">Elegí un grupo y leé sus aportes</h3>
        <button
          type="button"
          aria-expanded={verFuentes}
          onClick={() => {
            setVerFuentes(!verFuentes);
          }}
          className="font-space min-h-11 text-xs underline"
        >
          {verFuentes ? 'Cerrar la lista de aportes' : 'Elegir un aporte con el teclado'}
        </button>
      </div>
      <label className={`mt-4 block max-w-[480px] text-sm ${meta}`}>
        Buscar en las frases públicas de los grupos
        <input
          type="search"
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value);
          }}
          className={`mt-2 min-h-11 w-full border ${borde} bg-transparent px-3`}
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Seleccionar grupo">
        {filtrados.map((n) => {
          const frase = n.frase ? fraseCorta(n.frase.texto) : null;
          return (
            <button
              key={n.id}
              type="button"
              aria-pressed={enfocado === n.id}
              aria-label={`Grupo: ${frase ?? 'texto reservado'} · ${conteosDelGrupo(n)}`}
              onClick={() => {
                elegirNucleo(n.id);
              }}
              className={`min-h-11 max-w-[320px] border ${borde} flex flex-col items-start gap-1 px-4 py-2 text-left ${enfocado === n.id ? 'bg-violeta text-papel' : ''}`}
            >
              <span className="text-[14px] leading-snug">
                {frase ? `«${frase}»` : 'Texto reservado'}
              </span>
              <span className="font-space text-[11px] opacity-80">{conteosDelGrupo(n)}</span>
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={!enfocado}
          onClick={() => {
            elegirNucleo(null);
          }}
          className={`font-space min-h-11 border ${borde} px-4 text-xs`}
        >
          Ver todo
        </button>
      </div>
      {buscar && !filtrados.length ? (
        <p className="mt-3 text-sm">
          No hay frases públicas que coincidan. Los textos reservados no se buscan.
        </p>
      ) : null}
      {verFuentes ? (
        <div className="mt-4 max-h-48 overflow-y-auto">
          <p className={`mb-3 text-sm ${meta}`}>
            {abierto ? 'Aportes del grupo elegido' : 'Aportes sin grupo en este corte'}
          </p>
          <div className="flex flex-wrap gap-2">
            {mostradas.map((m, i) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={seleccionado === m.id}
                onClick={() => {
                  elegirFuente({ id: m.id, nucleoId: abierto?.id ?? null });
                }}
                className={`font-space min-h-11 border ${borde} px-3 text-xs`}
              >
                Aporte {i + 1} · {etiquetaDeClase(m.clase).toLowerCase()}
              </button>
            ))}
          </div>
          {!mostradas.length ? (
            <p className="text-sm">Elegí un grupo para recorrer sus aportes.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

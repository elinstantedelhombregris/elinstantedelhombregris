import { useState } from 'react';

import { etiquetaDeClase, type NucleoEnPantalla, type Tema } from '../radiografia-data';

import type { MiembroDeNucleo } from '~/lib/queries/radiografia';

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
        <h3 className="font-anton text-2xl">Elegí un núcleo, seguí sus fuentes.</h3>
        <button
          type="button"
          aria-expanded={verFuentes}
          onClick={() => {
            setVerFuentes(!verFuentes);
          }}
          className="font-space min-h-11 text-xs underline"
        >
          {verFuentes ? 'Cerrar selector de fuentes' : 'Elegir una señal con teclado'}
        </button>
      </div>
      <label className={`mt-4 block max-w-[480px] text-sm ${meta}`}>
        Buscar en las frases públicas de los núcleos
        <input
          type="search"
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value);
          }}
          className={`mt-2 min-h-11 w-full border ${borde} bg-transparent px-3`}
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Seleccionar núcleo">
        {filtrados.map((n) => (
          <button
            key={n.id}
            type="button"
            aria-pressed={enfocado === n.id}
            aria-label={`Núcleo: ${n.frase?.texto ?? 'texto reservado'} · ${n.senales} señales`}
            onClick={() => {
              elegirNucleo(n.id);
            }}
            className={`font-space min-h-11 border ${borde} px-4 text-xs ${enfocado === n.id ? 'bg-violeta text-papel' : ''}`}
          >
            {n.senales} señales · {n.provincias ?? '—'} provincias
          </button>
        ))}
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
            {abierto ? 'Señales del núcleo seleccionado' : 'Voces solas en este corte'}
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
                {etiquetaDeClase(m.clase)} {i + 1}
              </button>
            ))}
          </div>
          {!mostradas.length ? (
            <p className="text-sm">Elegí un núcleo para recorrer sus señales.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

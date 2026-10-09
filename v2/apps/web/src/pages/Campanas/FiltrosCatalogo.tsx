import { useState } from 'react';

import { BusquedaTerritorial } from '../ElMapa/instrumento/BusquedaTerritorial';

import { filtrarCatalogo } from './filtrar-catalogo';

import type { CampanaCatalogo } from './filtrar-catalogo';
import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';

import { CAMPO, FASES_ROTULO } from '~/components/participacion/constantes';

/** Con tan pocas campañas los filtros no ayudan: arrancan cerrados para no tapar la lista. */
const POCAS_CAMPANAS = 3;
const ESTADOS_FILTRABLES = [
  'programada',
  'abierta',
  'pausada',
  'en_devolucion',
  'cerrada',
] as const;

export function FiltrosCatalogo({
  campanas,
  filtros,
  cambiar,
  lugar,
  errorLugar,
}: {
  campanas: CampanaCatalogo[];
  filtros: URLSearchParams;
  cambiar: (filtros: URLSearchParams) => void;
  lugar: LugarMapa | undefined;
  errorLugar: boolean;
}) {
  const territorio = Number(filtros.get('territorio'));
  const editar = (clave: string, valor: string) => {
    const q = new URLSearchParams(filtros);
    if (valor) q.set(clave, valor);
    else q.delete(clave);
    cambiar(q);
  };
  const temas = [...new Set(campanas.flatMap((c) => c.contrato.temas))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
  const seleccionadas = filtrarCatalogo(campanas, filtros, lugar);
  const tema = filtros.get('tema') ?? '';
  const hayFiltros = ['territorio', 'tema', 'fase'].some((k) => filtros.get(k));
  // Cerrados por defecto si hay pocas campañas y nadie filtró; quien los abre o los cierra manda.
  const [elegido, setElegido] = useState<boolean | null>(null);
  const abiertos = elegido ?? (campanas.length > POCAS_CAMPANAS || hayFiltros);
  return (
    <>
      <details
        className="border-tinta bg-papel-crudo mb-8 border"
        open={abiertos}
        onToggle={(e) => {
          setElegido(e.currentTarget.open);
        }}
      >
        <summary className="font-space min-h-11 cursor-pointer px-5 py-3 text-xs uppercase tracking-wide sm:px-7">
          Filtrar por lugar, tema o estado
        </summary>
        <section
          className="border-tinta/25 border-t px-5 py-6 sm:px-7"
          aria-label="Elegir campañas por lugar, tema y estado"
        >
          <div className="grid gap-7 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <h2 className="font-anton text-2xl">Lugar</h2>
              <div className="mt-4">
                <BusquedaTerritorial
                  onElegir={(l) => {
                    editar('territorio', String(l.id));
                  }}
                />
              </div>
              <p className="text-tinta-50 mt-3 text-xs leading-relaxed">
                Elegí un lugar o mirá las campañas de todo el país.
              </p>
              {territorio > 0 ? (
                <div className="border-tinta/25 mt-4 flex flex-wrap items-center gap-3 border-t pt-3">
                  <span className="font-semibold">
                    {lugar?.name ?? 'Verificando el lugar elegido…'}
                  </span>
                  <button
                    type="button"
                    className="text-violeta min-h-11 text-sm underline underline-offset-4"
                    onClick={() => {
                      editar('territorio', '');
                    }}
                  >
                    Ver todo el país
                  </button>
                </div>
              ) : null}
              {errorLugar ? (
                <p role="alert" className="mt-3 text-sm">
                  No pudimos verificar el lugar elegido. Mostramos las campañas de ese lugar y las
                  de todo el país; pueden faltar las de su provincia.
                </p>
              ) : null}
            </div>
            <div className="border-tinta/25 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <h2 className="font-anton text-2xl">Tema y estado</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <label className="text-sm">
                  Tema
                  <select
                    className={CAMPO}
                    value={tema}
                    onChange={(e) => {
                      editar('tema', e.target.value);
                    }}
                  >
                    <option value="">Todos los temas</option>
                    {tema && !temas.includes(tema) ? <option value={tema}>{tema}</option> : null}
                    {temas.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Estado
                  <select
                    className={CAMPO}
                    value={filtros.get('fase') ?? ''}
                    onChange={(e) => {
                      editar('fase', e.target.value);
                    }}
                  >
                    <option value="">Todos los estados</option>
                    {ESTADOS_FILTRABLES.map((f) => (
                      <option key={f} value={f}>
                        {FASES_ROTULO[f]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
        </section>
      </details>
      <div className="border-tinta/25 mb-5 flex flex-wrap justify-between gap-3 border-b pb-4">
        <p className="text-tinta-75 text-sm">
          {seleccionadas.length === 0
            ? ''
            : seleccionadas.length === 1
              ? '1 campaña'
              : `${seleccionadas.length} campañas`}
        </p>
        <details className="max-w-[560px] text-sm">
          <summary className="text-tinta-50 cursor-pointer underline underline-offset-4">
            Cómo leer esta lista
          </summary>
          <p className="text-tinta-50 mt-3 leading-relaxed">
            Un lugar incluye las campañas de todo el país y las de ese lugar o su provincia, cuando
            se puede verificar. Los filtros quedan en el enlace, así los podés compartir. Mostramos
            hasta 100 campañas públicas; que una aparezca acá no mide apoyo ni representación de un
            lugar.
          </p>
        </details>
      </div>
    </>
  );
}

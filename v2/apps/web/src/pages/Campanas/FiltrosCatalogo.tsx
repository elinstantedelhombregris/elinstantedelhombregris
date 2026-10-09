import { BusquedaTerritorial } from '../ElMapa/instrumento/BusquedaTerritorial';

import { filtrarCatalogo } from './filtrar-catalogo';

import type { CampanaCatalogo } from './filtrar-catalogo';
import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';

import { CAMPO, FASES_ROTULO } from '~/components/participacion/constantes';

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
  return (
    <>
      <section
        className="border-tinta bg-papel-crudo mb-8 border px-5 py-6 sm:px-7"
        aria-label="Elegir campañas por zona, tema y fase"
      >
        <div className="grid gap-7 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="font-space text-violeta text-[10px] uppercase tracking-[.14em]">
              Primero, el lugar
            </p>
            <h2 className="font-anton mt-3 text-2xl">¿Dónde querés imaginar?</h2>
            <div className="mt-4">
              <BusquedaTerritorial
                onElegir={(l) => {
                  editar('territorio', String(l.id));
                }}
              />
            </div>
            <p className="text-tinta-50 mt-3 text-xs leading-relaxed">
              Podés elegir un lugar o explorar las convocatorias de todo el país.
            </p>
            {territorio > 0 ? (
              <div className="border-tinta/25 mt-4 flex flex-wrap items-center gap-3 border-t pt-3">
                <span className="font-semibold">
                  {lugar?.name ?? 'Verificando el ámbito elegido…'}
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
                No pudimos verificar el ámbito elegido. Mostramos coincidencias del lugar y
                convocatorias nacionales; faltan sus posibles campañas provinciales.
              </p>
            ) : null}
          </div>
          <div className="border-tinta/25 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <p className="font-space text-violeta text-[10px] uppercase tracking-[.14em]">
              Después, una posibilidad
            </p>
            <h2 className="font-anton mt-3 text-2xl">¿Qué tema te mueve?</h2>
            {temas.length ? (
              <div className="mt-4 flex flex-wrap gap-2" aria-label="Temas de las conversaciones">
                <button
                  type="button"
                  aria-pressed={!tema}
                  className={`border-tinta min-h-11 border px-3 text-sm ${!tema ? 'bg-tinta text-papel' : 'bg-papel text-tinta'}`}
                  onClick={() => {
                    editar('tema', '');
                  }}
                >
                  Todos
                </button>
                {temas.slice(0, 6).map((t) => (
                  <button
                    type="button"
                    key={t}
                    aria-pressed={tema === t}
                    className={`border-tinta min-h-11 border px-3 text-sm ${tema === t ? 'bg-tinta text-papel' : 'bg-papel text-tinta'}`}
                    onClick={() => {
                      editar('tema', t);
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-tinta-50 mt-4 text-sm">
                Los temas aparecerán cuando haya convocatorias públicas.
              </p>
            )}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Tema de campaña
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
                Fase de campaña
                <select
                  className={CAMPO}
                  value={filtros.get('fase') ?? ''}
                  onChange={(e) => {
                    editar('fase', e.target.value);
                  }}
                >
                  <option value="">Todas las fases</option>
                  {(['programada', 'abierta', 'pausada', 'en_devolucion', 'cerrada'] as const).map(
                    (f) => (
                      <option key={f} value={f}>
                        {FASES_ROTULO[f]}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          </div>
        </div>
      </section>
      <div className="border-tinta/25 mb-5 flex flex-wrap justify-between gap-3 border-b pb-4">
        <p className="text-tinta-75 text-sm">
          {seleccionadas.length === 1
            ? '1 conversación en este alcance'
            : `${seleccionadas.length} conversaciones en este alcance`}
        </p>
        <details className="max-w-[560px] text-sm">
          <summary className="text-tinta-50 cursor-pointer underline underline-offset-4">
            Cómo leer esta lista
          </summary>
          <p className="text-tinta-50 mt-3 leading-relaxed">
            La zona incluye convocatorias nacionales y las del lugar o su provincia cuando se puede
            verificar. Los filtros se comparten en el enlace. Mostramos hasta 100 campañas públicas
            recibidas; su presencia no mide apoyo ni representación territorial.
          </p>
        </details>
      </div>
    </>
  );
}

import { BusquedaTerritorial } from '../ElMapa/instrumento/BusquedaTerritorial';

import { filtrarCatalogo } from './filtrar-catalogo';

import type { CampanaCatalogo } from './filtrar-catalogo';
import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';

import { CAMPO, FASES_ROTULO } from '~/components/participacion/constantes';

export function FiltrosCatalogo({ campanas, filtros, cambiar, lugar, errorLugar }: {
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
  const temas = [...new Set(campanas.flatMap((c) => c.contrato.temas))].sort((a, b) => a.localeCompare(b, 'es'));
  const seleccionadas = filtrarCatalogo(campanas, filtros, lugar);
  return <>
    <section className="mb-8 grid gap-5 border p-5 sm:grid-cols-2" aria-label="Elegir campañas por zona, tema y fase">
      <div className="sm:col-span-2">
        <BusquedaTerritorial onElegir={(l) => { editar('territorio', String(l.id)); }} />
        {territorio > 0 ? <div className="mt-3 flex flex-wrap items-center gap-3">
          <span>{lugar?.name ?? `Ámbito ${territorio}`}</span>
          <button type="button" className="text-violeta min-h-11 underline" onClick={() => { editar('territorio', ''); }}>Ver todos los ámbitos</button>
        </div> : null}
        {errorLugar ? <p role="alert" className="mt-3 text-sm">No pudimos verificar el ámbito elegido. La lista muestra solo coincidencias de identificador y convocatorias nacionales; faltan sus posibles campañas provinciales.</p> : null}
      </div>
      <label>Tema de campaña
        <select className={CAMPO} value={filtros.get('tema') ?? ''} onChange={(e) => { editar('tema', e.target.value); }}>
          <option value="">Todos los temas</option>
          {filtros.get('tema') && !temas.includes(filtros.get('tema') ?? '') ? <option value={filtros.get('tema') ?? ''}>{filtros.get('tema')}</option> : null}
          {temas.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>Fase de campaña
        <select className={CAMPO} value={filtros.get('fase') ?? ''} onChange={(e) => { editar('fase', e.target.value); }}>
          <option value="">Todas las fases</option>
          {(['programada', 'abierta', 'pausada', 'en_devolucion', 'cerrada'] as const).map((f) => <option key={f} value={f}>{FASES_ROTULO[f]}</option>)}
        </select>
      </label>
      <p className="text-tinta-50 text-sm sm:col-span-2">La zona incluye convocatorias nacionales y las del lugar o su provincia cuando se puede verificar. Los filtros viajan en el enlace público y no expresan apoyo.</p>
    </section>
    <p className="text-tinta-50 mb-4 text-sm">{seleccionadas.length} coincidencias entre {campanas.length} campañas recibidas. El catálogo devuelve hasta 100; esta lista no mide representación territorial.</p>
  </>;
}

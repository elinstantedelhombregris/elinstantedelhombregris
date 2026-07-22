import { Link } from 'wouter';

import { TEXTO_TIPO, tipoDeCategoria } from '../el-mapa-data';

import { useProvincias, useVocesAbiertas } from '~/lib/queries/open-data';
import { cn } from '~/lib/utils';

const FEED_MAX = 12;

/** § 5 — Últimas voces: mismas queries que el mapa (cero fetch extra) + remate al mandato. */
export function FeedVoces() {
  const voces = useVocesAbiertas();
  const provincias = useProvincias();
  const nombrePorId = new Map((provincias.data ?? []).map((p) => [p.id, p.name]));
  const items = (voces.data ?? []).slice(0, FEED_MAX);

  return (
    <section aria-labelledby="feed-titulo">
      <h2 id="feed-titulo" className="font-space text-tinta-50 mb-3 text-[11px] uppercase tracking-[0.14em]">
        Últimas voces
      </h2>
      {voces.isLoading ? (
        <div>
          <div className="anim-pulso-papel bg-papel-presionado h-[72px]" />
          <p className="font-space text-tinta-50 mt-2 text-[10px] uppercase tracking-[0.12em]">
            Cargando — menos que un trámite.
          </p>
        </div>
      ) : voces.isError ? (
        <p className="font-space text-tinta-75 text-[13px]">
          Esto se rompió. Lo decimos porque publicamos todo.
        </p>
      ) : items.length === 0 ? (
        <p className="font-space text-tinta-75 text-[13px]">
          El país todavía no dijo nada acá. Empezá vos.
        </p>
      ) : (
        <div className="border-papel-borde bg-papel-borde flex max-h-[380px] flex-col gap-px overflow-y-auto border">
          {items.map((voz) => {
            const tipo = tipoDeCategoria(voz.category);
            return (
              <article key={voz.id} className="bg-papel px-[18px] py-4">
                <div className="font-space mb-2 flex justify-between gap-3 text-[10px] uppercase tracking-[0.12em]">
                  <span className={cn('font-bold', TEXTO_TIPO[tipo])}>{tipo}</span>
                  <span className="text-tinta-30">
                    {voz.provinceId === null
                      ? 'Argentina'
                      : (nombrePorId.get(voz.provinceId) ?? 'Argentina')}
                  </span>
                </div>
                <p className="text-tinta-90 text-sm leading-normal">«{voz.body}»</p>
              </article>
            );
          })}
        </div>
      )}
      <p className="border-tinta text-tinta-50 mt-6 border-t pt-4 text-sm leading-relaxed">
        Cada voz queda pública: cualquiera la puede leer, contar y auditar. De acá sale{' '}
        <Link href="/mandato-vivo" className="text-tinta font-semibold underline-offset-2 hover:underline">
          El mandato
        </Link>{' '}
        — el país pedido por escrito.
      </p>
    </section>
  );
}

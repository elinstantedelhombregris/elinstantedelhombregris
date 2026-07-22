import { useMemo, useState } from 'react';

import { MAPA_VIEWBOX, PROVINCIAS_SVG } from '../argentina-mapa.generated';
import { FILL_TIPO, tipoDeCategoria } from '../el-mapa-data';
import { MAX_PUNTOS_PROVINCIA, puntosJitter } from '../el-mapa-geo';

import { PopoverVoz } from './PopoverVoz';

import type { VozAbierta } from '~/lib/queries/open-data';

import { useProvincias, useVocesAbiertas, useVocesPorProvincia } from '~/lib/queries/open-data';
import { cn } from '~/lib/utils';

/**
 * El mapa (§2 de la spec): provincias precomputadas + puntos de voz reales.
 * La unidad interactiva es la PROVINCIA (target grande, 24 tab-stops máx.);
 * los puntos y halos son textura decorativa aria-hidden.
 */
export function MapaArgentina() {
  const provincias = useProvincias();
  const voces = useVocesAbiertas();
  const conteos = useVocesPorProvincia();
  const [sel, setSel] = useState<{ provinceId: number; idx: number } | null>(null);

  const idPorNombre = useMemo(
    () => new Map((provincias.data ?? []).map((p) => [p.name, p.id])),
    [provincias.data],
  );
  const nombrePorId = useMemo(
    () => new Map((provincias.data ?? []).map((p) => [p.id, p.name])),
    [provincias.data],
  );
  const vocesPorProvincia = useMemo(() => {
    const mapa = new Map<number, VozAbierta[]>();
    for (const voz of voces.data ?? []) {
      if (voz.provinceId === null) continue;
      const lista = mapa.get(voz.provinceId) ?? [];
      lista.push(voz);
      mapa.set(voz.provinceId, lista);
    }
    return mapa;
  }, [voces.data]);
  const conteoPorProvincia = useMemo(
    () =>
      new Map(
        (conteos.data ?? []).flatMap((c) =>
          c.provinceId === null ? [] : [[c.provinceId, c.count] as const],
        ),
      ),
    [conteos.data],
  );

  const cargando = voces.isLoading || provincias.isLoading;
  const sinVoces = !cargando && !voces.isError && (voces.data?.length ?? 0) === 0;
  const vocesSel = sel ? (vocesPorProvincia.get(sel.provinceId) ?? []) : [];

  const cerrar = () => {
    if (sel) document.getElementById(`prov-${String(sel.provinceId)}`)?.focus();
    setSel(null);
  };

  const leyenda = cargando
    ? 'Cargando — menos que un trámite.'
    : voces.isError
      ? 'Esto se rompió. Lo decimos porque publicamos todo.'
      : sinVoces
        ? 'Todavía no hay voces acá. Qué oportunidad.'
        : 'Cada punto es una voz real, ubicada en su provincia — no en una dirección.';

  return (
    <div className="border-tinta bg-papel-crudo relative border p-7 max-[560px]:p-4">
      <svg
        viewBox={MAPA_VIEWBOX}
        className="mx-auto block max-h-[76vh] w-full"
        role="group"
        aria-label="Mapa de la Argentina: las voces por provincia"
      >
        {PROVINCIAS_SVG.map((prov) => {
          const provinceId = idPorNombre.get(prov.nombre);
          const lista = provinceId === undefined ? [] : (vocesPorProvincia.get(provinceId) ?? []);
          const total =
            provinceId === undefined ? 0 : (conteoPorProvincia.get(provinceId) ?? lista.length);
          const puntos = puntosJitter(Math.min(lista.length, MAX_PUNTOS_PROVINCIA), prov.cx, prov.cy);
          const interactiva = provinceId !== undefined && lista.length > 0;
          return (
            <g key={prov.nombre}>
              <path
                d={prov.path}
                strokeWidth={1.2}
                className={cn(
                  'fill-papel-mapa stroke-tinta',
                  interactiva &&
                    'hover:fill-papel-presionado focus-visible:stroke-violeta cursor-pointer outline-none transition-colors focus-visible:stroke-2',
                )}
                {...(interactiva
                  ? {
                      id: `prov-${String(provinceId)}`,
                      role: 'button',
                      tabIndex: 0,
                      'aria-label': `${prov.nombre}: ${String(total)} ${total === 1 ? 'voz' : 'voces'}. Leer la última.`,
                      onClick: () => {
                        setSel({ provinceId, idx: 0 });
                      },
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSel({ provinceId, idx: 0 });
                        }
                      },
                    }
                  : { 'aria-hidden': true })}
              />
              {lista.slice(0, MAX_PUNTOS_PROVINCIA).map((voz, i) => {
                const punto = puntos[i];
                if (!punto) return null;
                const fill = FILL_TIPO[tipoDeCategoria(voz.category)];
                return (
                  <g key={voz.id} aria-hidden className="pointer-events-none">
                    <circle
                      cx={punto.x}
                      cy={punto.y}
                      r={9}
                      className={cn(fill, 'anim-pulse-dot origin-center [transform-box:fill-box] opacity-20')}
                      style={{ animationDelay: `${String((i % 5) * 0.35)}s` }}
                    />
                    <circle
                      cx={punto.x}
                      cy={punto.y}
                      r={i === 0 ? 5 : 3.5}
                      strokeWidth={1}
                      className={cn(fill, 'anim-dropin stroke-papel origin-center [transform-box:fill-box]')}
                      style={{ animationDelay: `${String(i * 0.05)}s` }}
                    />
                  </g>
                );
              })}
              {total > MAX_PUNTOS_PROVINCIA ? (
                /* +22: a +18 el dígito rozaba el halo pulsante del racimo en
                   provincias chicas (CABA, path ≈ 5×6 unidades del viewBox). */
                <text
                  x={prov.cx + 22}
                  y={prov.cy - 12}
                  aria-hidden
                  className="fill-tinta font-space text-[13px] font-bold"
                >
                  {total}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {sel && vocesSel.length > 0 ? (
        <PopoverVoz
          key={sel.provinceId}
          provincia={nombrePorId.get(sel.provinceId) ?? 'Argentina'}
          voces={vocesSel}
          idx={sel.idx}
          onCiclar={() => {
            setSel({ provinceId: sel.provinceId, idx: (sel.idx + 1) % vocesSel.length });
          }}
          onCerrar={cerrar}
        />
      ) : null}

      <p className="font-space text-tinta-30 mt-4 text-[10px] uppercase tracking-[0.12em]">{leyenda}</p>
    </div>
  );
}

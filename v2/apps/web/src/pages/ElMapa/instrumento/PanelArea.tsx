import { useMemo } from 'react';

import { AREA_VACIA, renglonesDeConteo } from './conteo';
import { AVISO_TEMAS, temasDe } from './temas';

import type { ConteoArea } from './conteo';
import type { SenalMapa } from '~/lib/queries/civic-map';

import { NOMBRE_CAPA } from '~/lib/queries/civic-map';
import { cn } from '~/lib/utils';

/**
 * Lo que devuelve un área cerrada (spec 3 §5): composición, lista, temas,
 * cobertura y el link citable. El encabezado es el conteo honesto — por clase
 * de precisión, sin ningún total indiferenciado.
 */

export interface PanelAreaProps {
  conteo: ConteoArea;
  senales: readonly SenalMapa[];
  /** Celdas del área y cuántas quedaron mudas (spec 3 §5.4). */
  cobertura: { total: number; mudas: number; ladoMetros: number } | null;
  enlace: string;
  onLimpiar: () => void;
}

export function PanelArea({ conteo, senales, cobertura, enlace, onLimpiar }: PanelAreaProps) {
  const contadas = useMemo(() => {
    const ids = new Set(conteo.contadas);
    return senales.filter((s) => ids.has(s.id));
  }, [conteo.contadas, senales]);

  const porCapa = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const senal of contadas) mapa.set(senal.capa, (mapa.get(senal.capa) ?? 0) + 1);
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  }, [contadas]);

  const temas = useMemo(() => temasDe(contadas.map((s) => s.texto)), [contadas]);
  const renglones = renglonesDeConteo(conteo);
  const vacia = conteo.contadas.length === 0 && conteo.provincialesSinContar === 0;

  return (
    <aside
      aria-label="Lo que hay en el área que dibujaste"
      className="border-tinta bg-papel-crudo border p-6"
    >
      <h3 className="font-space text-tinta mb-4 text-[11px] font-bold uppercase tracking-[0.16em]">
        En esta área
      </h3>

      {/* El conteo honesto: renglones por clase, nunca un total. */}
      {vacia ? (
        <p className="text-tinta text-[15px] leading-normal">{AREA_VACIA}</p>
      ) : (
        <ul className="mb-5 space-y-1">
          {renglones.map((renglon) => (
            <li key={renglon} className="text-tinta text-[14px] leading-snug">
              {renglon}
            </li>
          ))}
        </ul>
      )}

      {porCapa.length > 0 ? (
        <section className="mb-5">
          <h4 className="font-space text-tinta-30 mb-2 text-[10px] uppercase tracking-[0.12em]">
            Composición
          </h4>
          <ul className="space-y-1.5">
            {porCapa.map(([capa, cantidad]) => {
              const proporcion = cantidad / Math.max(1, contadas.length);
              return (
                <li key={capa} className="flex items-center gap-2">
                  <span className="font-space text-tinta w-24 shrink-0 text-[11px] uppercase">
                    {NOMBRE_CAPA[capa as keyof typeof NOMBRE_CAPA]}
                  </span>
                  <span className="bg-papel-mapa h-2 flex-1">
                    <span
                      className="bg-tinta block h-full"
                      style={{ width: `${String(Math.round(proporcion * 100))}%` }}
                    />
                  </span>
                  <span className="font-space text-tinta w-8 shrink-0 text-right text-[11px]">
                    {cantidad}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {cobertura ? (
        <section className="mb-5">
          <h4 className="font-space text-tinta-30 mb-2 text-[10px] uppercase tracking-[0.12em]">
            El mapa del silencio
          </h4>
          <p className="text-tinta text-[14px] leading-snug">
            De las {cobertura.total} celdas de esta área,{' '}
            <strong>{cobertura.mudas} están mudas</strong>. Nadie dijo nada ahí todavía.
          </p>
          <p className="font-space text-tinta-30 mt-1 text-[10px]">
            Celdas de {cobertura.ladoMetros} m de lado.
          </p>
        </section>
      ) : null}

      {temas.length > 0 ? (
        <section className="mb-5">
          <h4 className="font-space text-tinta-30 mb-2 text-[10px] uppercase tracking-[0.12em]">
            Temas
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {temas.map(({ tema, cantidad }) => (
              <li
                key={tema}
                className="border-tinta font-space text-tinta border px-2 py-0.5 text-[11px]"
              >
                {tema} · {cantidad}
              </li>
            ))}
          </ul>
          <p className="font-space text-tinta-30 mt-2 text-[10px]">{AVISO_TEMAS}</p>
        </section>
      ) : null}

      {contadas.length > 0 ? (
        <section className="mb-5">
          <h4 className="font-space text-tinta-30 mb-2 text-[10px] uppercase tracking-[0.12em]">
            Lo que se dijo
          </h4>
          <ul className="max-h-[320px] space-y-2 overflow-y-auto">
            {contadas.slice(0, 200).map((senal) => (
              <li key={senal.id} className="border-tinta/20 border-l-2 pl-3">
                <p className="text-tinta text-[14px] leading-snug">{senal.texto}</p>
                <p className="font-space text-tinta-30 mt-0.5 text-[10px] uppercase">
                  {NOMBRE_CAPA[senal.capa]}
                  {senal.tipo ? ` · ${senal.tipo}` : ''}
                </p>
              </li>
            ))}
          </ul>
          {contadas.length > 200 ? (
            <p className="font-space text-tinta-30 mt-2 text-[10px]">
              Se listan las primeras 200 de {contadas.length}. El conteo de arriba las incluye a
              todas.
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="border-tinta/20 flex flex-wrap items-center gap-3 border-t pt-4">
        <a
          href={enlace}
          className={cn(
            'font-space text-violeta text-[11px] font-bold uppercase tracking-[0.08em]',
            'focus-visible:ring-violeta outline-none focus-visible:ring-2',
          )}
        >
          link a esta área ↗
        </a>
        <button
          type="button"
          onClick={onLimpiar}
          className="font-space text-tinta-30 hover:text-tinta text-[11px] uppercase tracking-[0.08em]"
        >
          borrar el área
        </button>
      </div>
    </aside>
  );
}

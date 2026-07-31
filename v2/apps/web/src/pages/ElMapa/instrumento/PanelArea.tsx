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
  /**
   * El panel vive ahora sobre el chrome oscuro del instrumento. Se pasa la
   * variante en vez de duplicar el componente: el contenido —el conteo honesto,
   * la cobertura, los temas— es exactamente el mismo, y duplicarlo garantizaría
   * que un día digan cosas distintas.
   */
  oscuro?: boolean;
}

export function PanelArea({ conteo, senales, cobertura, enlace, onLimpiar, oscuro = false }: PanelAreaProps) {
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
      className={cn(
        'border p-5',
        oscuro ? 'border-oscuro-borde bg-tinta' : 'border-tinta bg-papel-crudo',
      )}
    >
      <h3 className={cn('font-space mb-4 text-[11px] font-bold uppercase tracking-[0.16em]', oscuro ? 'text-oscuro-texto' : 'text-tinta')}>
        En esta área
      </h3>

      {/* El conteo honesto: renglones por clase, nunca un total. */}
      {vacia ? (
        <p className={cn('text-[15px] leading-normal', oscuro ? 'text-oscuro-secundario' : 'text-tinta')}>{AREA_VACIA}</p>
      ) : (
        <ul className="mb-5 space-y-1">
          {renglones.map((renglon) => (
            <li key={renglon} className={cn('text-[14px] leading-snug', oscuro ? 'text-oscuro-secundario' : 'text-tinta')}>
              {renglon}
            </li>
          ))}
        </ul>
      )}

      {porCapa.length > 0 ? (
        <section className="mb-5">
          <h4 className={cn('font-space mb-2 text-[10px] uppercase tracking-[0.12em]', oscuro ? 'text-oscuro-meta' : 'text-tinta-30')}>
            Composición
          </h4>
          <ul className="space-y-1.5">
            {porCapa.map(([capa, cantidad]) => {
              const proporcion = cantidad / Math.max(1, contadas.length);
              return (
                <li key={capa} className="flex items-center gap-2">
                  <span className={cn('font-space w-24 shrink-0 text-[11px] uppercase', oscuro ? 'text-oscuro-secundario' : 'text-tinta')}>
                    {NOMBRE_CAPA[capa as keyof typeof NOMBRE_CAPA]}
                  </span>
                  <span className={cn('h-2 flex-1', oscuro ? 'bg-oscuro-borde' : 'bg-papel-mapa')}>
                    <span
                      className={cn('block h-full', oscuro ? 'bg-violeta-claro' : 'bg-tinta')}
                      style={{ width: `${String(Math.round(proporcion * 100))}%` }}
                    />
                  </span>
                  <span className={cn('font-space w-8 shrink-0 text-right text-[11px]', oscuro ? 'text-oscuro-secundario' : 'text-tinta')}>
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
          <h4 className={cn('font-space mb-2 text-[10px] uppercase tracking-[0.12em]', oscuro ? 'text-oscuro-meta' : 'text-tinta-30')}>
            El mapa del silencio
          </h4>
          <p className={cn('text-[14px] leading-snug', oscuro ? 'text-oscuro-secundario' : 'text-tinta')}>
            De las {cobertura.total} celdas de esta área,{' '}
            <strong>{cobertura.mudas} están mudas</strong>. Nadie dijo nada ahí todavía.
          </p>
          <p className={cn('font-space mt-1 text-[10px]', oscuro ? 'text-oscuro-meta' : 'text-tinta-30')}>
            Celdas de {cobertura.ladoMetros} m de lado.
          </p>
        </section>
      ) : null}

      {temas.length > 0 ? (
        <section className="mb-5">
          <h4 className={cn('font-space mb-2 text-[10px] uppercase tracking-[0.12em]', oscuro ? 'text-oscuro-meta' : 'text-tinta-30')}>
            Temas
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {temas.map(({ tema, cantidad }) => (
              <li
                key={tema}
                className={cn('font-space border px-2 py-0.5 text-[11px]', oscuro ? 'border-oscuro-borde text-oscuro-secundario' : 'border-tinta text-tinta')}
              >
                {tema} · {cantidad}
              </li>
            ))}
          </ul>
          <p className={cn('font-space mt-2 text-[10px]', oscuro ? 'text-oscuro-meta' : 'text-tinta-30')}>{AVISO_TEMAS}</p>
        </section>
      ) : null}

      {contadas.length > 0 ? (
        <section className="mb-5">
          <h4 className={cn('font-space mb-2 text-[10px] uppercase tracking-[0.12em]', oscuro ? 'text-oscuro-meta' : 'text-tinta-30')}>
            Lo que se dijo
          </h4>
          <ul className="max-h-[320px] space-y-2 overflow-y-auto">
            {contadas.slice(0, 200).map((senal) => (
              <li key={senal.id} className={cn('border-l-2 pl-3', oscuro ? 'border-oscuro-borde' : 'border-tinta/20')}>
                <p className={cn('text-[14px] leading-snug', oscuro ? 'text-oscuro-secundario' : 'text-tinta')}>{senal.texto}</p>
                <p className={cn('font-space mt-0.5 text-[10px] uppercase', oscuro ? 'text-oscuro-meta' : 'text-tinta-30')}>
                  {NOMBRE_CAPA[senal.capa]}
                  {senal.tipo ? ` · ${senal.tipo}` : ''}
                </p>
              </li>
            ))}
          </ul>
          {contadas.length > 200 ? (
            <p className={cn('font-space mt-2 text-[10px]', oscuro ? 'text-oscuro-meta' : 'text-tinta-30')}>
              Se listan las primeras 200 de {contadas.length}. El conteo de arriba las incluye a
              todas.
            </p>
          ) : null}
        </section>
      ) : null}

      <div className={cn('flex flex-wrap items-center gap-3 border-t pt-4', oscuro ? 'border-oscuro-borde' : 'border-tinta/20')}>
        <a
          href={enlace}
          className={cn(
            'font-space text-[11px] font-bold uppercase tracking-[0.08em]',
            oscuro ? 'text-violeta-claro' : 'text-violeta',
            'focus-visible:ring-violeta outline-none focus-visible:ring-2',
          )}
        >
          link a esta área ↗
        </a>
        <button
          type="button"
          onClick={onLimpiar}
          className={cn('font-space text-[11px] uppercase tracking-[0.08em]', oscuro ? 'text-oscuro-meta hover:text-oscuro-texto' : 'text-tinta-30 hover:text-tinta')}
        >
          borrar el área
        </button>
      </div>
    </aside>
  );
}

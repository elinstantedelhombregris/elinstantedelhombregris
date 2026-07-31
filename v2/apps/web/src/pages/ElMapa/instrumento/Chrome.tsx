import { MODOS } from './catalogo-modos';
import { COLOR_TIPO } from './paleta';
import { componerPorTipo } from './useVistaMapa';

import type { Modo } from './catalogo-modos';
import type { SenalConTipo } from './useVistaMapa';
import type { ReactNode } from 'react';
import type { TipoVoz } from '~/components/papel/primitives';

import { cn } from '~/lib/utils';

/**
 * El chrome del instrumento: la barra de modos, el panel lateral y las piezas
 * que flotan sobre el mapa.
 *
 * Todo lo que no es el mapa vive acá para que los modos solo se ocupen de sus
 * capas y sus controles.
 */

export function BarraModos({ activo, onCambiar }: { activo: Modo; onCambiar: (m: Modo) => void }) {
  return (
    <nav
      aria-label="Modos del instrumento"
      className="border-oscuro-borde bg-oscuro-barra flex items-stretch gap-0 border-b"
    >
      {MODOS.map((modo) => (
        <button
          key={modo.id}
          type="button"
          aria-current={activo === modo.id ? 'page' : undefined}
          onClick={() => {
            onCambiar(modo.id);
          }}
          className={cn(
            'font-space relative px-5 py-3.5 text-[11px] uppercase tracking-[0.14em] transition-colors',
            'focus-visible:ring-violeta-claro outline-none focus-visible:ring-2',
            activo === modo.id
              ? 'text-oscuro-texto'
              : 'text-oscuro-meta hover:text-oscuro-secundario',
          )}
        >
          {modo.etiqueta}
          {activo === modo.id ? (
            <span aria-hidden className="bg-violeta-claro absolute inset-x-4 bottom-0 h-0.5" />
          ) : null}
        </button>
      ))}
    </nav>
  );
}

export function PanelLateral({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion: string;
  children: ReactNode;
}) {
  return (
    <aside
      aria-label={`Controles de ${titulo}`}
      className="border-oscuro-borde bg-oscuro-barra flex h-full flex-col overflow-y-auto border-r"
    >
      <div className="border-oscuro-borde border-b p-5">
        <h3 className="font-anton text-oscuro-texto text-[22px] leading-tight">{titulo}</h3>
        <p className="text-oscuro-secundario mt-1.5 text-[13px] leading-relaxed">{descripcion}</p>
      </div>
      <div className="flex flex-col gap-6 p-5">{children}</div>
    </aside>
  );
}

/** Un bloque de control del panel, con su etiqueta en mono. */
export function Control({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="font-space text-oscuro-meta mb-2 text-[10px] uppercase tracking-[0.16em]">
        {etiqueta}
      </h4>
      {children}
    </section>
  );
}

/** Botonera de opciones excluyentes — el patrón de State/County de deflock. */
export function Segmentado<T extends string>({
  valor,
  opciones,
  onCambiar,
}: {
  valor: T;
  opciones: { id: T; etiqueta: string }[];
  onCambiar: (v: T) => void;
}) {
  return (
    <div className="border-oscuro-borde grid grid-flow-col border" role="group">
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={valor === o.id}
          onClick={() => {
            onCambiar(o.id);
          }}
          className={cn(
            'font-space px-3 py-2 text-[11px] uppercase tracking-[0.08em] transition-colors',
            valor === o.id
              ? 'bg-oscuro-borde text-oscuro-texto'
              : 'text-oscuro-meta hover:text-oscuro-secundario',
          )}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

/**
 * El contador que responde al viewport, con la composición por tipo.
 *
 * Es la pieza que convierte navegar en medir: arrastrás sobre una provincia y
 * el número contesta. La barra apilada de abajo dice de qué está hecho ese
 * número sin que haya que abrir nada.
 */
export function ContadorEnVista({ senales }: { senales: readonly SenalConTipo[] }) {
  const composicion = componerPorTipo(senales);
  const total = senales.length;

  return (
    <div className="border-oscuro-borde bg-oscuro-barra/95 w-[260px] border p-4 backdrop-blur">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-space text-oscuro-meta text-[10px] uppercase tracking-[0.14em]">
          Voces en vista
        </span>
        <span className="font-anton text-violeta-claro text-[26px] leading-none tabular-nums">
          {total.toLocaleString('es-AR')}
        </span>
      </div>

      {total > 0 ? (
        <>
          <div
            className="mt-3 flex h-1.5 w-full overflow-hidden"
            role="img"
            aria-label={composicion.map((c) => `${c.tipo}: ${String(c.n)}`).join(', ')}
          >
            {composicion.map(({ tipo, n }) => (
              <span
                key={tipo}
                style={{ width: `${String((n / total) * 100)}%`, backgroundColor: COLOR_TIPO[tipo] }}
              />
            ))}
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
            {composicion.map(({ tipo, n }) => (
              <li key={tipo} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLOR_TIPO[tipo] }}
                />
                <span className="font-space text-oscuro-secundario truncate text-[10px]">
                  {tipo}
                </span>
                <span className="font-space text-oscuro-meta ml-auto text-[10px] tabular-nums">
                  {Math.round((n / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-oscuro-secundario mt-2 text-[13px] leading-snug">
          Nada en este encuadre. Que un área esté vacía también es información.
        </p>
      )}
    </div>
  );
}

/** Los chips de tipo de voz, que filtran. */
export function FiltroTipos({
  activos,
  onAlternar,
}: {
  activos: ReadonlySet<TipoVoz>;
  onAlternar: (t: TipoVoz) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(COLOR_TIPO) as TipoVoz[]).map((tipo) => {
        const activo = activos.has(tipo);
        return (
          <button
            key={tipo}
            type="button"
            aria-pressed={activo}
            onClick={() => {
              onAlternar(tipo);
            }}
            className={cn(
              'font-space flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] transition-opacity',
              activo ? 'border-oscuro-borde text-oscuro-texto' : 'border-oscuro-borde/50 text-oscuro-tenue',
            )}
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLOR_TIPO[tipo], opacity: activo ? 1 : 0.3 }}
            />
            {tipo}
          </button>
        );
      })}
    </div>
  );
}

/** La leyenda de una rampa de color, con sus extremos nombrados. */
export function LeyendaRampa({
  colores,
  bajo,
  alto,
  titulo,
}: {
  colores: readonly string[];
  bajo: string;
  alto: string;
  titulo: string;
}) {
  return (
    <div className="border-oscuro-borde bg-oscuro-barra/95 border p-3 backdrop-blur">
      <p className="font-space text-oscuro-meta mb-1.5 text-[10px] uppercase tracking-[0.14em]">
        {titulo}
      </p>
      <div
        className="h-2 w-[180px]"
        style={{ background: `linear-gradient(to right, ${colores.join(', ')})` }}
      />
      <div className="font-space text-oscuro-meta mt-1 flex justify-between text-[10px]">
        <span>{bajo}</span>
        <span>{alto}</span>
      </div>
    </div>
  );
}

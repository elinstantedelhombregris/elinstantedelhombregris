import type { ReactNode } from 'react';

/**
 * Tabla papel — el camino accesible al mismo dato que dibuja un lienzo.
 *
 * Promoción de la `<table>` que vivía dentro de `LaRadiografia/sections/`: en
 * cuanto una segunda página la necesita, una copia sería dos tablas que se
 * separan sin que nadie lo note. Sigue siendo una `<table>` de verdad —con
 * `<caption>`, con encabezados de verdad y con la primera columna como
 * `<th scope="row">`—, porque un SVG es opaco para un lector de pantalla y para
 * el teclado: si esto no existe, para quien navega así la página no existe.
 *
 * No es una versión de consuelo con menos información: es la misma información,
 * leíble y ordenable. Ésa es la única forma en que un tornado dibujado a mano
 * puede considerarse terminado.
 */

export interface ColumnaPapel<T> {
  readonly clave: string;
  readonly rotulo: string;
  readonly alinear?: 'izq' | 'der';
  readonly celda: (fila: T) => ReactNode;
}

export interface TablaPapelProps<T> {
  /** Va en el `<caption>` y se lee en voz alta antes que nada. */
  readonly caption: string;
  readonly columnas: readonly ColumnaPapel<T>[];
  readonly filas: readonly T[];
  readonly claveDeFila: (fila: T) => string;
  /** Qué decir cuando no hay filas. Nunca una tabla vacía sin explicación. */
  readonly vacio?: ReactNode;
  readonly className?: string;
}

const CABECERA = 'font-space text-tinta-50 pb-3 pr-4 text-[11px] font-bold uppercase tracking-[0.1em]';

export function TablaPapel<T>({
  caption,
  columnas,
  filas,
  claveDeFila,
  vacio,
  className,
}: TablaPapelProps<T>) {
  if (filas.length === 0 && vacio !== undefined) {
    return <p className="text-tinta-50 py-6 text-[15px] leading-[1.55]">{vacio}</p>;
  }

  return (
    <div className={`overflow-x-auto ${className ?? ''}`}>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-tinta border-b-2">
            {columnas.map((columna) => (
              <th
                key={columna.clave}
                scope="col"
                className={`${CABECERA} ${columna.alinear === 'der' ? 'text-right' : ''}`}
              >
                {columna.rotulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => {
            const [primera, ...resto] = columnas;
            return (
              <tr key={claveDeFila(fila)} className="border-papel-borde border-b">
                {primera === undefined ? null : (
                  <th scope="row" className="text-tinta py-3 pr-4 align-top font-normal">
                    {primera.celda(fila)}
                  </th>
                )}
                {resto.map((columna) => (
                  <td
                    key={columna.clave}
                    className={`text-tinta py-3 pr-4 align-top ${
                      columna.alinear === 'der' ? 'text-right tabular-nums' : ''
                    }`}
                  >
                    {columna.celda(fila)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

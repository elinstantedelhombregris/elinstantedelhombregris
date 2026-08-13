import { corteLegible, type Tema } from '../radiografia-data';

import type { RadiografiaPublica } from '~/lib/queries/radiografia';

/**
 * § La cabecera de procedencia — regla 5 de la constitución de producto.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §3.2.
 *
 * **Siempre visible y sin forma de cerrarse.** No es un aviso de cookies ni
 * una nota al pie: es la mitad del contenido de la página. Toda síntesis
 * muestra su cobertura y su sesgo, y esta página produce afirmaciones de una
 * clase que ninguna otra produce.
 *
 * Las cuatro cosas que dice, y por qué cada una:
 *
 *  1. **el corte y el modelo** — R4: la frescura sale de `analisis_corridas`
 *     y de ningún otro lado. El job se corre a mano (R3), así que una señal
 *     nueva puede no tener vector todavía, y eso no se esconde: se declara;
 *  2. **cuántas entraron y cuántas esperan** — §6: una señal que existe y no
 *     se dibuja tiene que estar contada en alguna parte o la página miente
 *     por omisión;
 *  3. **cuántas provincias no aportaron ni una señal** — el mismo cálculo de
 *     la lente Cobertura, que es la única fuente;
 *  4. **que quien habla no es quien vive** — esto mide a quien usó la
 *     plataforma, no al país.
 */

export interface CabeceraProcedenciaProps {
  datos: RadiografiaPublica | undefined;
  cargando: boolean;
  /**
   * El pedido falló. **No es lo mismo que «todavía no corrió»**: una cosa es
   * saber que nadie midió nada y otra es no haber podido preguntar. Una
   * cabecera que confunde las dos afirma algo que no sabe, que es
   * exactamente lo que esta cabecera existe para no hacer.
   */
  fallo: boolean;
  tema: Tema;
}

export function CabeceraProcedencia({ datos, cargando, fallo, tema }: CabeceraProcedenciaProps) {
  const nocturno = tema === 'nocturno';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-tinta';
  const rotulo = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const cifra = nocturno ? 'text-oscuro-texto' : 'text-tinta';

  const dato = (valor: number | undefined): string =>
    valor === undefined ? '—' : new Intl.NumberFormat('es-AR').format(valor);

  return (
    <section
      aria-label="De dónde sale lo que se ve acá"
      className={`border-y-2 ${borde} mb-10 py-6`}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Celda rotulo="Último análisis" rotuloClase={rotulo} cifraClase={cifra}>
          {cargando && !datos ? (
            'Trayendo…'
          ) : fallo && !datos ? (
            <>
              No se pudo leer
              <span className={`font-space block text-[12px] normal-case ${rotulo}`}>
                el análisis no contestó — recargá en un momento
              </span>
            </>
          ) : datos?.corte ? (
            <>
              {corteLegible(datos.corte)}
              <span className={`font-space block text-[12px] normal-case ${rotulo}`}>
                modelo {datos.modelo ?? 'sin declarar'}
              </span>
            </>
          ) : (
            <>
              Todavía no corrió
              <span className={`font-space block text-[12px] normal-case ${rotulo}`}>
                nadie midió nada todavía
              </span>
            </>
          )}
        </Celda>

        <Celda rotulo="Señales" rotuloClase={rotulo} cifraClase={cifra}>
          {dato(datos?.analizadas)} analizadas
          <span className={`font-space block text-[12px] normal-case ${rotulo}`}>
            {dato(datos?.sinVector)} esperando análisis · {dato(datos?.total)} en total
          </span>
        </Celda>

        <Celda rotulo="Provincias sin señal" rotuloClase={rotulo} cifraClase={cifra}>
          {dato(datos?.provinciasSinSenal)} de 24
          <span className={`font-space block text-[12px] normal-case ${rotulo}`}>
            no aportaron ni una
          </span>
        </Celda>

        <Celda rotulo="Qué mide esto" rotuloClase={rotulo} cifraClase={cifra}>
          <span className="text-[15px] normal-case leading-[1.5]">
            A quien usó la plataforma.
            <span className={`block text-[13px] ${rotulo}`}>
              No a quien vive acá. Quien habla no es quien vive, y una convergencia acá adentro no
              es una mayoría del país.
            </span>
          </span>
        </Celda>
      </div>
    </section>
  );
}

function Celda({
  rotulo,
  rotuloClase,
  cifraClase,
  children,
}: {
  rotulo: string;
  rotuloClase: string;
  cifraClase: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={`font-space mb-2 text-[11px] font-bold uppercase tracking-[0.14em] ${rotuloClase}`}
      >
        {rotulo}
      </div>
      <div className={`font-archivo text-[17px] leading-[1.35] ${cifraClase}`}>{children}</div>
    </div>
  );
}

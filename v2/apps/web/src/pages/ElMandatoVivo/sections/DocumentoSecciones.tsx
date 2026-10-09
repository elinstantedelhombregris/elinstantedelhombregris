import { Link } from 'wouter';

import { ESTADO_PROPUESTA } from '../el-mandato-data';
import { formatoPorcentaje, humanizarTema, regimenDe, topeBrechas } from '../mandato-regimen';

import type { RefObject } from 'react';
import type { DocumentoMandato } from '~/lib/queries/mandato';

import { Palitos } from '~/components/papel/primitives';
import { cuantos } from '~/lib/vocabulario';

const LABEL = 'font-space text-violeta mb-4 text-[11px] font-bold uppercase tracking-[0.12em]';
const VACIO = 'text-tinta-75 text-[15px] leading-relaxed';

/**
 * Un documento al que todavía no le llegó nada dice eso UNA vez, no cuatro:
 * antes cada sección (temas, recursos, necesidades, propuestas) tenía su propio
 * «nadie/ninguna/todavía no» y la hoja entera era un coro de ausencias.
 */
function documentoSinNada(data: DocumentoMandato): boolean {
  return (
    data.voces.total <= 0 &&
    data.senales.clasificadas <= 0 &&
    data.recursos.total <= 0 &&
    data.brechas.length === 0 &&
    data.propuestas.length === 0
  );
}

function Diagnostico({ data }: { data: DocumentoMandato }) {
  const regimen = regimenDe(data.senales.clasificadas);
  return (
    <div className="mt-10">
      <h3 className={LABEL}>I. Temas declarados</h3>
      {regimen === 'cero' ? (
        <p className={VACIO}>Todavía no hay aportes clasificados por tema.</p>
      ) : (
        // No es un ranking: es el tema y cuántos aportes lo nombran. Sin 1, 2, 3.
        <ul className="flex flex-col gap-6">
          {data.senales.temas.map((tema) => (
            <li key={tema.tema} className="grid grid-cols-[1fr_auto] items-start gap-4">
              <div>
                <p className="text-[16px] font-bold">{humanizarTema(tema.tema)}</p>
                {tema.ultima ? (
                  <Link
                    href={`/senal/${tema.ultima.id}`}
                    className="text-tinta-50 mt-1 block text-[14px] italic hover:underline"
                  >
                    «{tema.ultima.texto}» — {tema.ultima.provincia ?? 'todo el país'}
                  </Link>
                ) : null}
              </div>
              <div className="text-right">
                <p className="font-anton text-violeta text-[24px] leading-none">
                  {regimen === 'porcentaje'
                    ? formatoPorcentaje(tema.total, data.senales.clasificadas)
                    : tema.total.toLocaleString('es-AR')}
                </p>
                <p className="font-space text-tinta-50 mt-1 text-[10px] uppercase tracking-[0.1em]">
                  {regimen === 'porcentaje'
                    ? cuantos(tema.total, 'aporte', 'aportes')
                    : tema.total === 1
                      ? 'aporte'
                      : 'aportes'}
                </p>
                {regimen === 'palitos' ? (
                  <div className="mt-1 flex justify-end">
                    <Palitos n={tema.total} claseRelleno="bg-violeta" />
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Recursos({ data }: { data: DocumentoMandato }) {
  return (
    <div className="mt-10">
      <h3 className={LABEL}>II. Recursos declarados</h3>
      {data.recursos.total >= 1 ? (
        <>
          <div className="flex flex-wrap gap-2">
            {data.recursos.porProvincia.map((r, i) => (
              <span
                key={`${r.provincia ?? 'ar'}-${String(i)}`}
                className="font-space border-tinta text-tinta inline-block border px-3 py-1.5 text-[12px]"
              >
                {r.provincia ?? 'Todo el país'} · {r.total.toLocaleString('es-AR')}
              </span>
            ))}
          </div>
          <p className="font-space text-tinta-50 mt-3 text-[13px]">
            = {data.recursos.total.toLocaleString('es-AR')}{' '}
            {data.recursos.total === 1 ? 'recurso declarado' : 'recursos declarados'}. Una persona
            puede ofrecer más de uno.
          </p>
        </>
      ) : (
        <p className={VACIO}>
          Todavía no hay recursos declarados. Se cargan en el mapa, como un aporte de tipo
          «recurso».
        </p>
      )}
    </div>
  );
}

function Brechas({ data }: { data: DocumentoMandato }) {
  const filas = topeBrechas(data.brechas);
  return (
    <div className="mt-10">
      <h3 className={LABEL}>III. Necesidades y recursos declarados</h3>
      <p className="text-tinta-75 mb-4 text-[14px] leading-relaxed">
        Son conteos de aportes, no unidades que se compensen: diez ofertas de herramientas no tapan
        un pedido de agua. Para decir que algo está cubierto hace falta ver que lo ofrecido sirve
        para lo pedido, alcanza y está disponible — y eso todavía no se mide.
      </p>
      {filas.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filas.map((brecha) => {
            return (
              <div
                key={brecha.provincia}
                className="border-papel-borde flex flex-wrap items-center justify-between gap-3 border-b pb-3"
              >
                <span className="text-[15px] font-bold">{brecha.provincia}</span>
                <span className="font-space text-tinta-50 text-[12px]">
                  necesidades {brecha.piden.toLocaleString('es-AR')} · recursos{' '}
                  {brecha.ofrecen.toLocaleString('es-AR')}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={VACIO}>Todavía no hay necesidades ni recursos declarados.</p>
      )}
    </div>
  );
}

function Acciones({ data }: { data: DocumentoMandato }) {
  return (
    <div className="mt-10">
      <h3 className={LABEL}>IV. Propuestas</h3>
      {data.propuestas.length >= 1 ? (
        // Una lista de propuestas, no un ranking: sin A1, A2, A3.
        <ul className="flex flex-col gap-5">
          {data.propuestas.map((p) => (
            <li key={p.id}>
              <Link
                href={`/senal/${p.id}`}
                className="text-[16px] font-bold hover:underline"
                aria-label={`${p.titulo} — propuesta ${ESTADO_PROPUESTA[p.estado] ?? p.estado}`}
              >
                {p.titulo}
              </Link>
              <p className="text-tinta-75 mt-1 text-[14px]">{p.resumen}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={VACIO}>Todavía no hay propuestas.</p>
      )}
      <p className="font-space text-tinta-50 mt-6 text-[13px]">
        La siguiente la escribís vos <span className="text-violeta anim-blink-cursor">▌</span>
      </p>
    </div>
  );
}

function VigenciaYFirma({
  data,
  firmaRef,
}: {
  data: DocumentoMandato;
  firmaRef: RefObject<HTMLDivElement>;
}) {
  const n = data.voces.total;
  return (
    <div
      ref={firmaRef}
      className="border-tinta mt-10 flex flex-wrap items-end justify-between gap-6 border-t-2 pt-8"
    >
      <div className="max-w-[420px]">
        <h3 className={LABEL}>Vigencia</h3>
        <p className="text-tinta-75 text-[14px] leading-relaxed">
          Esta consulta se actualiza con los permisos y estados vigentes. Que un aporte esté acá no
          quiere decir que quien lo dejó apoye el resto. La fecha de consulta no convierte las
          declaraciones en hechos comprobados.
        </p>
      </div>
      {n >= 1 ? (
        <p className="font-anton text-right text-[26px] leading-none">
          {cuantos(n, 'aporte', 'aportes')} en esta lectura
        </p>
      ) : null}
    </div>
  );
}

export interface DocumentoSeccionesProps {
  data: DocumentoMandato;
  firmaRef: RefObject<HTMLDivElement>;
}

/** Secciones I–V del documento (spec §4) — separadas de `DocumentoMandato.tsx` por LOC. */
export function DocumentoSecciones({ data, firmaRef }: DocumentoSeccionesProps) {
  const vacio = documentoSinNada(data);
  return (
    <>
      {vacio ? (
        <p className={`${VACIO} mt-10`}>
          Todavía no hay aportes para leer acá. Cuando los haya, este documento los ordena por tema,
          recursos, necesidades y propuestas, siempre con su denominador.
        </p>
      ) : (
        <>
          <Diagnostico data={data} />
          <Recursos data={data} />
          <Brechas data={data} />
          <Acciones data={data} />
        </>
      )}
      <VigenciaYFirma data={data} firmaRef={firmaRef} />
    </>
  );
}

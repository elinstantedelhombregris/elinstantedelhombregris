import { Link } from 'wouter';

import { CLASE_URGENCIA, ESTADO_PROPUESTA } from '../el-mandato-data';
import { formatoPorcentaje, humanizarTema, regimenDe, topeBrechas, urgenciaDeBrecha } from '../mandato-regimen';

import { Palitos } from './Palitos';

import type { RefObject } from 'react';
import type { DocumentoMandato } from '~/lib/queries/mandato';

import { cn } from '~/lib/utils';

const LABEL = 'font-space text-violeta mb-4 text-[11px] font-bold uppercase tracking-[0.12em]';
const VACIO = 'text-tinta-75 text-[15px] leading-relaxed';

function Diagnostico({ data }: { data: DocumentoMandato }) {
  const regimen = regimenDe(data.senales.clasificadas);
  return (
    <div className="mt-10">
      <h3 className={LABEL}>I. Diagnóstico — lo que más pesa</h3>
      {regimen === 'cero' ? (
        <p className={VACIO}>
          Acá va el diagnóstico del país, tema por tema, con porcentaje y todo. Todavía no hay señales clasificadas
          para escribirlo — y no lo vamos a inventar.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {data.senales.temas.map((tema, i) => (
            <div key={tema.tema} className="grid grid-cols-[40px_1fr_auto] items-start gap-4">
              <span className="font-anton text-tinta-30 text-[26px] leading-none">{i + 1}</span>
              <div>
                <p className="text-[16px] font-bold">{humanizarTema(tema.tema)}</p>
                {tema.ultima ? (
                  <Link
                    href={`/mandato-vivo/pulso/${String(tema.ultima.id)}`}
                    className="text-tinta-50 mt-1 block text-[14px] italic hover:underline"
                  >
                    «{tema.ultima.texto}» — {tema.ultima.provincia ?? 'Argentina'}
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
                  {regimen === 'porcentaje' ? `${tema.total.toLocaleString('es-AR')} señales` : 'señales'}
                </p>
                {regimen === 'palitos' ? (
                  <div className="mt-1 flex justify-end">
                    <Palitos n={tema.total} claseRelleno="bg-violeta" />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
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
                {r.provincia ?? 'Argentina'} · {r.total.toLocaleString('es-AR')}
              </span>
            ))}
          </div>
          <p className="font-space text-tinta-50 mt-3 text-[13px]">
            = {data.recursos.total.toLocaleString('es-AR')} {data.recursos.total === 1 ? 'persona' : 'personas'} que
            ofrecieron algo concreto
          </p>
        </>
      ) : (
        <p className={VACIO}>Nadie ofreció nada todavía. Los recursos entran por el mapa, con una voz de tipo «recurso».</p>
      )}
    </div>
  );
}

function Brechas({ data }: { data: DocumentoMandato }) {
  const filas = topeBrechas(data.brechas);
  return (
    <div className="mt-10">
      <h3 className={LABEL}>III. Brechas críticas — donde la necesidad supera lo ofrecido</h3>
      {filas.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filas.map((brecha) => {
            const urgencia = urgenciaDeBrecha(brecha.piden, brecha.ofrecen);
            return (
              <div
                key={brecha.provincia}
                className="border-papel-borde flex flex-wrap items-center justify-between gap-3 border-b pb-3"
              >
                <span className="text-[15px] font-bold">{brecha.provincia}</span>
                <span className="font-space text-tinta-50 text-[12px]">
                  piden {brecha.piden.toLocaleString('es-AR')} · ofrecen {brecha.ofrecen.toLocaleString('es-AR')}
                </span>
                <span
                  className={cn(
                    'font-space border px-2 py-1 text-[10px] uppercase tracking-[0.08em]',
                    CLASE_URGENCIA[urgencia],
                  )}
                >
                  {urgencia}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={VACIO}>Sin necesidades y recursos declarados no hay brechas que medir. Eso también es un dato.</p>
      )}
    </div>
  );
}

function Acciones({ data }: { data: DocumentoMandato }) {
  return (
    <div className="mt-10">
      <h3 className={LABEL}>IV. Acciones en votación</h3>
      {data.propuestas.length >= 1 ? (
        <div className="flex flex-col gap-5">
          {data.propuestas.map((p, i) => (
            <div key={p.id} className="grid grid-cols-[40px_1fr] gap-4">
              <span className="font-space text-tinta-30 text-[13px]">A{i + 1}</span>
              <div>
                <Link
                  href={`/mandato-vivo/propuesta/${String(p.id)}`}
                  className="text-[16px] font-bold hover:underline"
                  aria-label={`${p.titulo} — propuesta ${ESTADO_PROPUESTA[p.estado] ?? p.estado}`}
                >
                  {p.titulo}
                </Link>
                <p className="text-tinta-75 mt-1 text-[14px]">{p.resumen}</p>
                <p className="font-space text-violeta mt-1 text-[11px]">
                  {p.votos.toLocaleString('es-AR')} votos · apoyo {p.apoyo >= 0 ? '+' : ''}
                  {p.apoyo.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={VACIO}>Ninguna propuesta en votación todavía.</p>
      )}
      <p className="font-space text-tinta-50 mt-6 text-[13px]">
        La siguiente la escribís vos <span className="text-violeta anim-blink-cursor">▌</span>
      </p>
    </div>
  );
}

function VigenciaYFirma({ data, firmaRef }: { data: DocumentoMandato; firmaRef: RefObject<HTMLDivElement> }) {
  const n = data.voces.total;
  return (
    <div ref={firmaRef} className="border-tinta mt-10 flex flex-wrap items-end justify-between gap-6 border-t-2 pt-8">
      <div className="max-w-[420px]">
        <h3 className={LABEL}>Vigencia y firma</h3>
        <p className="text-tinta-75 text-[14px] leading-relaxed">
          Este mandato se reescribe con cada voz nueva. No tiene dueño, no tiene vencimiento: tiene revisiones.
        </p>
      </div>
      <div className="text-right">
        {n >= 1 ? (
          <>
            <p className="font-anton text-[26px] leading-none">Las {n.toLocaleString('es-AR')} voces</p>
            <p className="font-space text-tinta-50 mt-1 text-[11px]">— y las que faltan.</p>
          </>
        ) : (
          <>
            <p className="font-anton text-[26px] leading-none">Ninguna voz todavía.</p>
            <p className="font-space text-tinta-50 mt-1 text-[11px]">— faltan todas. Empezá vos.</p>
          </>
        )}
      </div>
    </div>
  );
}

export interface DocumentoSeccionesProps {
  data: DocumentoMandato;
  firmaRef: RefObject<HTMLDivElement>;
}

/** Secciones I–V del documento (spec §4) — separadas de `DocumentoMandato.tsx` por LOC. */
export function DocumentoSecciones({ data, firmaRef }: DocumentoSeccionesProps) {
  return (
    <>
      <Diagnostico data={data} />
      <Recursos data={data} />
      <Brechas data={data} />
      <Acciones data={data} />
      <VigenciaYFirma data={data} firmaRef={firmaRef} />
    </>
  );
}

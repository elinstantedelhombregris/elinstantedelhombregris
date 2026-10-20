import { RESPUESTAS_PARA_REPORTAR, UMBRAL_REPORTES } from '@v2/shared';
import { useState } from 'react';
import { Link } from 'wouter';

import { TEXTO_DEL_MOTIVO } from './MiArgentinaIdeal/mirar/motivos';

import type { AporteEnGestion } from '@v2/shared';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import {
  BotonAccion,
  ErrorOperacion,
  MarcoParticipacion,
  Nota,
} from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { useDevolverAporte, useGestionPila, useRetenerAporte } from '~/lib/queries/pila';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Gestión de Mirar — sólo para la coordinación (spec §4, «Reportar»).
 *
 * Los aportes con reportes, los que salieron de Mirar y lo que se decidió con cada
 * uno. «Retener ahora» saca un aporte sin esperar los reportes; «Devolver» lo vuelve
 * a poner y los reportes cuentan desde cero. Las dos piden un motivo y quedan
 * registradas con quién las tomó. Acá se ve el texto aunque esté reservado, porque
 * se lo está juzgando; nada de esto se exporta.
 */
export function GestionPila() {
  useTituloDePagina('Gestión de Mirar');
  const auth = useAuth();
  return (
    <MarcoParticipacion
      titulo="Gestión de Mirar"
      entrada="Los aportes que otras personas reportaron, los que salieron de Mirar y lo que se decidió con cada uno."
      kicker="Coordinación"
    >
      {auth.isLoading ? (
        <p role="status">Un momento…</p>
      ) : !auth.user ? (
        <Nota>
          Ingresá para gestionar Mirar.{' '}
          <Link href={hrefIngresar()} className="text-violeta underline underline-offset-4">
            Ingresar
          </Link>
        </Nota>
      ) : !auth.user.esAdmin ? (
        <Nota>
          Esta página es de la coordinación de ¡BASTA!. Si ves un aporte que no va, reportalo desde
          Mirar; si querés discutir una decisión, contanos en{' '}
          <Link href="/lo-que-falta" className="text-violeta underline underline-offset-4">
            Lo que falta
          </Link>
          .
        </Nota>
      ) : (
        <ListaDeGestion />
      )}
    </MarcoParticipacion>
  );
}

function ListaDeGestion() {
  const q = useGestionPila();
  const aportes = q.data?.pages.flatMap((p) => p.aportes) ?? [];
  return (
    <section aria-labelledby="gestion-pila-titulo">
      <h2 id="gestion-pila-titulo" className="font-anton text-3xl">
        Para revisar
      </h2>
      <p className="text-tinta-75 mt-3 max-w-[70ch] text-sm leading-relaxed">
        Con {UMBRAL_REPORTES} reportes que cuentan, un aporte sale de Mirar solo. Cuenta el reporte
        de quien ya contestó {RESPUESTAS_PARA_REPORTAR} aportes; los demás se muestran aparte.
      </p>
      <ErrorOperacion mensaje={q.error?.message} />
      {q.isLoading ? <p role="status">Buscando aportes con reportes…</p> : null}
      {q.isSuccess && aportes.length === 0 ? (
        <p className="mt-6">Ningún aporte tiene reportes ni está retenido.</p>
      ) : null}
      <ul className="mt-6 space-y-5">
        {aportes.map((a) => (
          <FilaDeGestion key={a.id} aporte={a} />
        ))}
      </ul>
      {q.hasNextPage ? (
        <BotonAccion
          tono="papel"
          className="mt-6"
          ocupado={q.isFetchingNextPage}
          onClick={() => {
            void q.fetchNextPage();
          }}
        >
          Más aportes
        </BotonAccion>
      ) : null}
    </section>
  );
}

/** «1 que cuenta», «4 que cuentan». */
const queCuentan = (n: number, singular: string) => `${n} ${n === 1 ? singular : `${singular}n`}`;

function estadoDe(a: AporteEnGestion): string {
  if (!a.retenido) return 'En Mirar';
  const quien =
    a.retenido.origen === 'reportes'
      ? 'Fuera de Mirar por reportes'
      : 'Retenido por la coordinación';
  return `${quien} desde el ${fecha(a.retenido.desde)}`;
}

function FilaDeGestion({ aporte }: { aporte: AporteEnGestion }) {
  const noCuentan = aporte.reportes.reduce((n, r) => n + r.noCuentan, 0);
  const d = aporte.ultimaDecision;
  return (
    <li className="bg-papel-crudo border p-5">
      <p className="font-space text-violeta text-xs uppercase">
        {aporte.provincia ?? 'Sin provincia'} · publicado el {fecha(aporte.publicadoEn)}
      </p>
      <p className="mt-3 whitespace-pre-wrap break-words text-[17px] leading-relaxed">
        «{aporte.texto}»
      </p>
      <p className={`mt-3 text-sm font-bold ${aporte.retenido ? 'text-sello' : 'text-tinta-75'}`}>
        {estadoDe(aporte)}
      </p>
      {aporte.retenido ? (
        <p className="text-tinta-75 text-sm">Motivo: {aporte.retenido.motivo}</p>
      ) : null}
      {aporte.reportes.length ? (
        <ul className="text-tinta-75 mt-3 space-y-1 text-sm" aria-label="Reportes por motivo">
          {aporte.reportes.map((r) => (
            <li key={r.motivo}>
              {TEXTO_DEL_MOTIVO[r.motivo]}: {queCuentan(r.cuentan, 'que cuenta')}
              {r.noCuentan ? ` · ${queCuentan(r.noCuentan, 'que no cuenta')}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
      {aporte.reportes.length ? (
        <p className="text-tinta-50 mt-2 text-sm">
          {noCuentan === 0
            ? 'Todos los reportes cuentan.'
            : `${noCuentan === 1 ? 'Un reporte no cuenta' : `${noCuentan} reportes no cuentan`}: vienen de quien contestó menos de ${RESPUESTAS_PARA_REPORTAR} aportes.`}
        </p>
      ) : (
        <p className="text-tinta-50 mt-2 text-sm">Sin reportes desde la última devolución.</p>
      )}
      {d ? (
        <p className="text-tinta-50 mt-2 text-sm">
          Última decisión: {d.decision === 'retener' ? 'se retuvo' : 'se devolvió'} el{' '}
          {fecha(d.fecha)}. «{d.motivo}»
        </p>
      ) : null}
      <Decision id={aporte.id} retenido={aporte.retenido !== null} />
    </li>
  );
}

function Decision({ id, retenido }: { id: string; retenido: boolean }) {
  const [abierta, setAbierta] = useState(false);
  const [motivo, setMotivo] = useState('');
  const retener = useRetenerAporte();
  const devolver = useDevolverAporte();
  const op = retenido ? devolver : retener;
  const accion = retenido ? 'Devolver' : 'Retener ahora';
  if (!abierta)
    return (
      <BotonAccion
        tono={retenido ? 'papel' : 'sello'}
        className="mt-4"
        onClick={() => {
          setAbierta(true);
        }}
      >
        {accion}
      </BotonAccion>
    );
  const limpio = motivo.trim();
  return (
    <div className="mt-4 flex flex-col gap-3">
      <label className="block text-sm">
        {retenido ? 'Por qué vuelve a Mirar' : 'Por qué sale de Mirar'}
        <input
          className={CAMPO}
          value={motivo}
          maxLength={200}
          onChange={(e) => {
            setMotivo(e.target.value);
          }}
        />
      </label>
      <ErrorOperacion mensaje={op.error?.message} className="my-0" />
      <div className="flex flex-wrap items-center gap-3">
        <BotonConMotivo
          motivo={limpio.length < 3 ? 'Escribí el motivo en pocas palabras.' : null}
          ocupado={op.isPending}
          onClick={() => {
            op.mutate(
              { id, motivo: limpio },
              {
                onSuccess: () => {
                  setAbierta(false);
                  setMotivo('');
                },
              },
            );
          }}
        >
          {accion}
        </BotonConMotivo>
        <BotonAccion
          tono="papel"
          onClick={() => {
            setAbierta(false);
          }}
        >
          Cancelar
        </BotonAccion>
      </div>
    </div>
  );
}

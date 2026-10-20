import { UMBRAL_IMPULSO } from '@v2/shared';
import { useState } from 'react';
import { Link } from 'wouter';

import { AmbitosCampana } from './AmbitosCampana';
import { MOTIVO_MINIMO, MOTIVOS } from './impulso';
import { fechaCampana } from './presentacion';

import type { CampanaParaRevisar, EstadoCampana } from '@v2/shared';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO, ENLACE_DE_TEXTO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { fechaDeRegistro } from '~/components/participacion/fechas';
import { useAuth } from '~/lib/auth/use-auth';
import { useCambiarEstadoPropuesta, useParaRevisar } from '~/lib/queries/campanas-propuestas';

/**
 * «Para revisar», sólo para la administración: las campañas propuestas que ya trajeron la gente
 * que necesitaban (§11). Se revisa que las reglas se cumplan, no si la idea gusta.
 */
export function RevisionPropuestas() {
  const auth = useAuth();
  const esAdmin = auth.user?.esAdmin === true;
  const q = useParaRevisar(esAdmin);
  // Después de decidir, la campaña sale de la lista: el aviso vive acá y no en su tarjeta.
  const [hecho, setHecho] = useState('');
  if (!esAdmin) return null;
  return (
    <section aria-labelledby="para-revisar" className="mb-9 border-b pb-6">
      <h2 id="para-revisar" className="font-anton text-2xl">
        Para revisar
      </h2>
      <p className="text-tinta-75 mt-3 max-w-[720px] text-sm leading-relaxed">
        Campañas propuestas que ya trajeron {UMBRAL_IMPULSO} personas nuevas. Revisá que sus reglas
        se cumplan: que haya una pregunta, una fecha de devolución posible, un uso de datos claro y
        nada que ataque a nadie. No se juzga si la idea te gusta.
      </p>
      <p role="status" className="mt-3 text-sm">
        {hecho}
      </p>
      <ErrorOperacion mensaje={q.error?.message} />
      {q.isLoading ? (
        <p role="status" className="mt-4">
          Buscando campañas para revisar…
        </p>
      ) : q.data?.length ? (
        <ul className="mt-5 space-y-6">
          {q.data.map((c) => (
            <li key={c.id}>
              <PropuestaParaRevisar campana={c} alDecidir={setHecho} />
            </li>
          ))}
        </ul>
      ) : q.data ? (
        <p className="mt-4">No hay campañas esperando revisión.</p>
      ) : null}
    </section>
  );
}

const DT = 'font-space text-violeta text-[10px] uppercase tracking-[.12em]';

function PropuestaParaRevisar({
  campana: c,
  alDecidir,
}: {
  campana: CampanaParaRevisar;
  alDecidir: (hecho: string) => void;
}) {
  const { contrato } = c;
  const titulo = `revisar-${c.id}`;
  return (
    <article aria-labelledby={titulo} className="border-tinta bg-papel-crudo border p-5">
      <h3 id={titulo} className="font-anton text-2xl leading-[1.1]">
        <Link href={`/campanas/${c.slug}`} className="hover:text-violeta underline-offset-4">
          {contrato.titulo}
        </Link>
      </h3>
      <p className="text-tinta-75 mt-2 text-sm">
        La impulsa {c.impulsadaPor} · trajo {c.personas.toLocaleString('es-AR')}{' '}
        {c.personas === 1 ? 'persona nueva' : 'personas nuevas'}
        {fechaDeRegistro(c.presentadaEn)
          ? ` · en revisión desde el ${fechaDeRegistro(c.presentadaEn)}`
          : ''}
      </p>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className={DT}>La pregunta</dt>
          <dd className="mt-2 text-base leading-relaxed">{contrato.pregunta}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className={DT}>Para qué</dt>
          <dd className="mt-2 whitespace-pre-wrap leading-relaxed">{contrato.proposito}</dd>
        </div>
        <div>
          <dt className={DT}>Lugar y temas</dt>
          <dd className="mt-2">
            <AmbitosCampana ids={contrato.territorios} />
          </dd>
          <dd className="mt-2">{contrato.temas.join(' · ')}</dd>
        </div>
        <div>
          <dt className={DT}>Qué se devuelve y cuándo</dt>
          <dd className="mt-2 leading-relaxed">{contrato.devolucion}</dd>
          <dd className="text-tinta-75 mt-1">Para el {fechaCampana(contrato.fechaDevolucion)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className={DT}>Cómo se usan los aportes</dt>
          <dd className="mt-2 leading-relaxed">{contrato.usoDatos}</dd>
        </div>
      </dl>
      <Link href={`/campanas/${c.slug}`} className={`${ENLACE_DE_TEXTO} mt-3 text-sm`}>
        Leer las reglas completas
      </Link>
      <AportesTraidos aportes={c.aportesTraidos} />
      <Decidir campana={c} alDecidir={alDecidir} />
    </article>
  );
}

function AportesTraidos({ aportes }: { aportes: CampanaParaRevisar['aportesTraidos'] }) {
  return (
    <details className="border-tinta/25 mt-5 border-t pt-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">
        Lo que escribieron las personas que trajo ({aportes.length})
      </summary>
      {aportes.length ? (
        <ul className="mt-3 space-y-3 text-sm">
          {aportes.map((a) => (
            <li key={a.id} className="border-tinta/25 border-l-2 pl-3 leading-relaxed">
              «{a.texto}»
              <span className="text-tinta-50 block text-xs">{a.provincia ?? 'Sin provincia'}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm">
          Las personas que trajo participaron dando opiniones, sin escribir aportes.
        </p>
      )}
    </details>
  );
}

/** Abrir, programar o devolver con un motivo que quien la impulsa va a leer. */
function Decidir({
  campana: c,
  alDecidir,
}: {
  campana: CampanaParaRevisar;
  alDecidir: (hecho: string) => void;
}) {
  const op = useCambiarEstadoPropuesta();
  const [motivo, setMotivo] = useState('');
  const idMotivo = `motivo-${c.id}`;
  const faltan = MOTIVO_MINIMO - motivo.trim().length;
  const decidir = (estado: EstadoCampana, texto: string, listo: string) => {
    alDecidir('');
    op.mutate(
      { id: c.id, revision: c.revision, estado, motivo: texto },
      {
        onSuccess: () => {
          alDecidir(`«${c.contrato.titulo}»: ${listo}`);
        },
      },
    );
  };
  return (
    <div className="border-tinta/25 mt-5 border-t pt-5">
      <ErrorOperacion mensaje={op.error?.message} />
      <div className="flex flex-wrap items-center gap-3">
        <BotonAccion
          ocupado={op.isPending}
          onClick={() => {
            decidir('abierta', MOTIVOS.abrir, 'quedó abierta.');
          }}
        >
          Abrir
        </BotonAccion>
        <BotonAccion
          tono="papel"
          ocupado={op.isPending}
          onClick={() => {
            decidir('programada', MOTIVOS.programar, 'quedó programada.');
          }}
        >
          Programar
        </BotonAccion>
      </div>
      <label htmlFor={idMotivo} className="mt-6 block">
        Motivo para devolverla
        <span className="text-tinta-50 block text-xs">
          Quien la impulsa lo va a leer. Decí qué regla falta o qué hay que corregir.
        </span>
      </label>
      <textarea
        id={idMotivo}
        className={CAMPO}
        rows={3}
        maxLength={1000}
        value={motivo}
        onChange={(e) => {
          setMotivo(e.target.value);
        }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <BotonConMotivo
          tono="papel"
          ocupado={op.isPending}
          motivo={
            faltan > 0
              ? `Escribí el motivo para devolverla: faltan ${String(faltan)} ${faltan === 1 ? 'carácter' : 'caracteres'}.`
              : null
          }
          onClick={() => {
            decidir('reuniendo', motivo.trim(), 'la devolviste a quien la impulsa.');
          }}
        >
          Devolver con un motivo
        </BotonConMotivo>
      </div>
    </div>
  );
}

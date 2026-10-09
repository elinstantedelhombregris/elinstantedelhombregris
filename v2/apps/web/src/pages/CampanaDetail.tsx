import { useState } from 'react';
import { useRoute, Link, useSearch } from 'wouter';

import { Devolucion } from './Campanas/Devolucion';
import { LecturaDatosContrato } from './Campanas/LecturaDatosContrato';

import type { EstadoCampana, CampanaPublica } from '@v2/shared';

import { CompartirProceso } from '~/components/participacion/CompartirProceso';
import { CAMPO, FASES_ROTULO } from '~/components/participacion/constantes';
import {
  MarcoParticipacion,
  EnlaceAccion,
  Nota,
  ErrorOperacion,
  BotonAccion,
} from '~/components/participacion/Elementos';
import { Equipo } from '~/components/participacion/Equipo';
import { Seguir } from '~/components/participacion/Seguir';
import { useCampana, useEstadoCampana } from '~/lib/queries/participacion';

export function CampanaDetail() {
  const [, params] = useRoute('/campanas/:slug');
  const [, devolucion] = useRoute('/campanas/:slug/devolucion');
  const search = useSearch();
  const edicion = Number(new URLSearchParams(search).get('edicion'));
  const q = useCampana(
    params?.slug ?? devolucion?.slug,
    Number.isSafeInteger(edicion) && edicion > 0 ? edicion : undefined,
  );
  if (!q.data)
    return (
      <MarcoParticipacion
        titulo="Buscando esta mesa."
        entrada="Cada campaña conserva su pregunta, su recorrido y su equipo."
      >
        <ErrorOperacion mensaje={q.error?.message} />
        <p>
          {q.isLoading
            ? 'Trayendo la convocatoria…'
            : 'No encontramos una convocatoria pública con ese enlace.'}
        </p>
        <EnlaceAccion href="/campanas">Ver campañas</EnlaceAccion>
      </MarcoParticipacion>
    );
  const c = q.data;
  return (
    <MarcoParticipacion
      titulo={c.contrato.titulo}
      entrada={c.contrato.pregunta}
      kicker={`Campaña · ${FASES_ROTULO[c.estado] ?? c.estado} · edición ${c.revision}`}
    >
      <div className="flex flex-wrap items-start gap-4">
        {c.estado === 'abierta' ? (
          <EnlaceAccion href={`/imaginar?campana=${c.id}`}>Imaginar en esta campaña</EnlaceAccion>
        ) : (
          <Nota>
            Esta fase no recibe aportes ahora. El proceso y su devolución siguen a la vista.
          </Nota>
        )}
        <Seguir tipo="campana" objeto={c.id} />
        <EnlaceAccion secundario href={`/la-radiografia?campana=${c.id}`}>
          Ver en Radiografía
        </EnlaceAccion>
        {c.puedoEditarContrato ? (
          <EnlaceAccion secundario href={`/gestion/campanas?editar=${c.id}`}>
            Revisar el contrato
          </EnlaceAccion>
        ) : null}
        <EnlaceAccion secundario href={`/gestion/campanas?duplicar=${c.id}`}>
          Usar esta configuración para otra campaña
        </EnlaceAccion>
      </div>
      <section className="mt-9 grid gap-6 border-y py-7 md:grid-cols-2">
        <div>
          <h2 className="font-anton text-2xl">Para qué abrimos esta pregunta</h2>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed">{c.contrato.proposito}</p>
          <h3 className="font-anton mt-6 text-xl">A quiénes queremos escuchar</h3>
          <p className="mt-3 leading-relaxed">{c.contrato.participantes}</p>
        </div>
        <div>
          <h2 className="font-anton text-2xl">Qué podés esperar</h2>
          <p className="mt-3 leading-relaxed">{c.contrato.devolucion}</p>
          <p className="mt-3">Fecha prevista: {c.contrato.fechaDevolucion}</p>
          <p className="mt-4 text-sm leading-relaxed">Efecto del proceso: {c.contrato.efecto}</p>
        </div>
      </section>
      <dl className="mt-7 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-space text-violeta uppercase">Equipo responsable</dt>
          <dd className="mt-2">
            {c.contrato.responsable}
            <span className="text-tinta-50 mt-2 block text-sm">
              Equipo declarado por quien convoca; sin acreditación institucional.
            </span>
          </dd>
        </div>
        <div>
          <dt className="font-space text-violeta uppercase">Ámbitos y temas</dt>
          <dd className="mt-2">
            {c.contrato.territorios.length
              ? c.contrato.territorios.map((id) => (
                  <Link key={id} href={`/el-mapa?lugar=${id}`} className="mr-3 underline">
                    Ver territorio {id}
                  </Link>
                ))
              : 'Alcance nacional'}
            <br />
            {c.contrato.temas.join(' · ')}
          </dd>
        </div>
        <div>
          <dt className="font-space text-violeta uppercase">Canales</dt>
          <dd className="mt-2">{c.contrato.canales.join(' · ')}</dd>
        </div>
        <div>
          <dt className="font-space text-violeta uppercase">Participación observada</dt>
          <dd className="mt-2">
            {c.aportes ? `${c.aportes} aportes publicados` : 'Todavía no llegaron aportes.'} ·
            contamos registros, no representación de habitantes.
          </dd>
        </div>
      </dl>
      <LecturaDatosContrato contrato={c.contrato} />
      <section className="mt-9">
        <h2 className="font-anton text-3xl">El recorrido</h2>
        <ol className="mt-4 divide-y border-y">
          {c.contrato.fases.map((f, i) => (
            <li key={`${i}-${f.nombre}`} className="grid gap-3 py-4 sm:grid-cols-[130px_1fr]">
              <span className="font-space text-violeta text-xs">{f.fecha}</span>
              <div>
                <h3 className="font-semibold">{f.nombre}</h3>
                <p className="mt-2 text-sm">{f.salida}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <Nota>
        Imaginar, apoyar una frase y comprobar un hecho son operaciones distintas. Una campaña
        abierta escucha a quienes participan; no habla por quienes todavía faltan.
      </Nota>
      <div className="flex flex-wrap gap-4">
        <EnlaceAccion secundario href={`/fichas?campana=${c.id}`}>
          Futuros de esta campaña
        </EnlaceAccion>
        <EnlaceAccion secundario href={`/fichas/nueva?campana=${c.id}`}>
          Proponer una ficha
        </EnlaceAccion>
        <EnlaceAccion secundario href={`/datos-abiertos?campana=${c.id}`}>
          Descargar estos datos
        </EnlaceAccion>
      </div>
      {c.puedoEditar ? <GestionFase campana={c} /> : null}
      {c.puedoInvitar ? <Equipo tipo="campana" objeto={c.id} /> : null}
      <CompartirProceso href={`/campanas/${c.slug}`} titulo="Compartir esta pregunta" />
      <Devolucion campana={c} />
      <details className="mt-9 border p-5">
        <summary className="cursor-pointer font-semibold">Ver el historial del proceso</summary>
        <ol className="mt-5 space-y-3 text-sm">
          {c.historial.map((h) => (
            <li key={h.revision}>
              {h.estado === 'borrador' ? (
                <>Revisión {h.revision}</>
              ) : (
                <Link className="underline" href={`/campanas/${c.slug}?edicion=${h.revision}`}>
                  Leer revisión {h.revision}
                </Link>
              )}{' '}
              · {FASES_ROTULO[h.estado]} · {h.motivo} ·{' '}
              {new Date(h.fecha).toLocaleDateString('es-AR')}
            </li>
          ))}
        </ol>
      </details>
    </MarcoParticipacion>
  );
}
function GestionFase({ campana }: { campana: CampanaPublica }) {
  const [estado, setEstado] = useState<EstadoCampana>('abierta');
  const [motivo, setMotivo] = useState('');
  const op = useEstadoCampana(campana.id);
  return (
    <section className="mt-8 border p-5">
      <h2 className="font-anton text-2xl">Cuidar el recorrido</h2>
      <label className="mt-4 block">
        Próxima fase
        <select
          className={CAMPO}
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as EstadoCampana);
          }}
        >
          {(['programada', 'abierta', 'pausada', 'en_devolucion', 'cerrada'] as const).map((x) => (
            <option key={x} value={x}>
              {FASES_ROTULO[x]}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 block">
        Por qué damos este paso
        <textarea
          className={CAMPO}
          rows={3}
          value={motivo}
          maxLength={1000}
          onChange={(e) => {
            setMotivo(e.target.value);
          }}
        />
      </label>
      <ErrorOperacion mensaje={op.error?.message} />
      <BotonAccion
        className="mt-5"
        disabled={op.isPending || motivo.trim().length < 10}
        onClick={() => {
          op.mutate({ revision: campana.revision, estado, motivo });
        }}
      >
        Registrar el cambio
      </BotonAccion>
    </section>
  );
}

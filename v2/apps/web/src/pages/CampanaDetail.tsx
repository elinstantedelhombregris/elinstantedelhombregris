import { ArrowLeft, ArrowUpRight, CalendarDays } from 'lucide-react';
import { useRoute, Link, useSearch } from 'wouter';

import { AmbitosCampana } from './Campanas/AmbitosCampana';
import { Devolucion } from './Campanas/Devolucion';
import { GestionFase } from './Campanas/GestionFase';
import { LecturaDatosContrato } from './Campanas/LecturaDatosContrato';
import { enlaceParticiparCampana, esEjemploLocal, fechaCampana } from './Campanas/presentacion';

import { CompartirProceso } from '~/components/participacion/CompartirProceso';
import { FASES_ROTULO } from '~/components/participacion/constantes';
import {
  MarcoParticipacion,
  EnlaceAccion,
  Nota,
  ErrorOperacion,
} from '~/components/participacion/Elementos';
import { Equipo } from '~/components/participacion/Equipo';
import { Seguir } from '~/components/participacion/Seguir';
import { useCampana } from '~/lib/queries/participacion';

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
        titulo="Buscando esta pregunta."
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
  const ejemplo = esEjemploLocal(c);
  const historica = c.historial.some((h) => h.revision > c.revision);
  const alcance = `campana=${c.id}&edicion=${c.revision}`;
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 py-9 min-[961px]:px-10">
      <header className="border-tinta border-b pb-9">
        <Link
          href="/campanas"
          className="text-tinta-75 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Todas las conversaciones
        </Link>
        <div className="font-space text-violeta mt-5 flex flex-wrap justify-between gap-3 text-[11px] uppercase tracking-[.12em]">
          <p>{ejemplo ? 'Ejemplo local · campaña en pausa' : FASES_ROTULO[c.estado]}</p>
          <p>Edición {c.revision}</p>
        </div>
        <h1 className="font-anton mt-5 max-w-[950px] text-[clamp(36px,5vw,64px)] leading-[1.08]">
          {c.contrato.titulo}
        </h1>
        <p className="font-space text-tinta-50 mt-9 text-[10px] uppercase tracking-[.14em]">
          La pregunta que nos reúne
        </p>
        <p className="mt-4 max-w-[850px] text-[clamp(23px,3vw,34px)] leading-[1.35]">
          {c.contrato.pregunta}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          {c.estado === 'abierta' ? (
            <EnlaceAccion href={enlaceParticiparCampana(c)}>
              Sumar mi mirada desde el mapa
            </EnlaceAccion>
          ) : (
            <p className="border-violeta border-l-2 pl-4 text-sm leading-relaxed">
              {ejemplo
                ? 'Es una demostración para explorar. No recibe aportes ni tiene un equipo operativo.'
                : 'Esta fase no recibe aportes. La pregunta y su recorrido siguen a la vista.'}
            </p>
          )}
          <Seguir tipo="campana" objeto={c.id} />
        </div>
        {historica ? (
          <p className="text-tinta-50 mt-5 text-sm">
            Estás leyendo una edición anterior. Sus fuentes y reglas quedan en esta edición; no se
            trasladan a una pregunta nueva.
          </p>
        ) : null}
      </header>
      {ejemplo ? (
        <aside
          className="bg-papel-crudo border-tinta mt-7 border p-5 text-sm leading-relaxed"
          aria-label="Alcance de esta demostración"
        >
          <strong>Ejemplo local, sin convocatoria real.</strong> La pregunta, las fechas y el equipo
          son ilustrativos. No hay participantes ni respuesta institucional comprometida. Podés
          tomar la configuración como punto de partida para una campaña propia.
        </aside>
      ) : null}
      <section
        className="mt-9 grid gap-8 md:grid-cols-[1.2fr_1fr]"
        aria-label="Propósito y devolución de la campaña"
      >
        <div>
          <p className="font-space text-violeta text-[10px] uppercase tracking-[.14em]">
            01 / Lo que queremos hacer posible
          </p>
          <h2 className="font-anton mt-4 text-3xl">Para qué abrimos esta pregunta</h2>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed">{c.contrato.proposito}</p>
          <h3 className="font-anton mt-7 text-xl">A quiénes queremos escuchar</h3>
          <p className="mt-3 leading-relaxed">{c.contrato.participantes}</p>
        </div>
        <div className="bg-papel-crudo border-tinta border p-6">
          <p className="font-space text-violeta text-[10px] uppercase tracking-[.14em]">
            02 / Una conversación que vuelve
          </p>
          <h2 className="font-anton mt-4 text-3xl">Qué podés esperar</h2>
          <p className="mt-4 leading-relaxed">{c.contrato.devolucion}</p>
          <p className="mt-5 flex items-start gap-2 text-sm">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {ejemplo ? 'Fecha ilustrativa: ' : 'Fecha prevista: '}
            {fechaCampana(c.contrato.fechaDevolucion)}
          </p>
          <p className="text-tinta-75 border-tinta/25 mt-5 border-t pt-5 text-sm leading-relaxed">
            {c.contrato.efecto}
          </p>
        </div>
      </section>
      <dl className="border-tinta/25 mt-9 grid gap-6 border-y py-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-space text-violeta text-[10px] uppercase tracking-[.12em]">
            El lugar de esta pregunta
          </dt>
          <dd className="mt-3">
            <AmbitosCampana ids={c.contrato.territorios} enlaces />
          </dd>
          <dd className="mt-3 flex flex-wrap gap-2">
            {c.contrato.temas.map((t) => (
              <span key={t} className="border-tinta/25 border px-3 py-1">
                {t}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt className="font-space text-violeta text-[10px] uppercase tracking-[.12em]">
            Quién cuida el recorrido
          </dt>
          <dd className="mt-3 leading-relaxed">
            {c.contrato.responsable}
            <span className="text-tinta-50 mt-2 block text-xs">
              Equipo declarado por quien convoca; sin acreditación institucional.
            </span>
          </dd>
        </div>
        <div>
          <dt className="font-space text-violeta text-[10px] uppercase tracking-[.12em]">
            Cómo se puede participar
          </dt>
          <dd className="mt-3">{c.contrato.canales.join(' · ')}</dd>
        </div>
        <div>
          <dt className="font-space text-violeta text-[10px] uppercase tracking-[.12em]">
            Lo que llegó hasta ahora
          </dt>
          <dd className="mt-3">
            {ejemplo
              ? 'Este ejemplo no cuenta participación real.'
              : c.aportes
                ? `${c.aportes} aportes publicados.`
                : 'Todavía no llegaron aportes.'}
            <span className="text-tinta-50 mt-2 block text-xs">
              Los registros no representan a todos los habitantes del lugar.
            </span>
          </dd>
        </div>
      </dl>
      <section className="mt-10" aria-labelledby="recorrido-campana">
        <p className="font-space text-violeta text-[10px] uppercase tracking-[.14em]">
          03 / De imaginar a devolver
        </p>
        <h2 id="recorrido-campana" className="font-anton mt-4 text-3xl">
          El recorrido de esta conversación
        </h2>
        <ol className="border-tinta/25 mt-6 border-t">
          {c.contrato.fases.map((f, i) => (
            <li
              key={`${i}-${f.nombre}`}
              className="border-tinta/25 grid gap-4 border-b py-6 sm:grid-cols-[60px_1fr_190px]"
            >
              <span className="font-anton text-violeta text-3xl">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-anton text-2xl">{f.nombre}</h3>
                <p className="mt-3 text-sm leading-relaxed">{f.salida}</p>
              </div>
              <p className="text-tinta-50 text-sm">
                {ejemplo ? 'Fecha ilustrativa: ' : ''}
                {fechaCampana(f.fecha)}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <LecturaDatosContrato contrato={c.contrato} />
      <Nota>
        Imaginar, apoyar una frase y comprobar un hecho son operaciones distintas. Una campaña
        escucha a quienes participan; también necesita reconocer las miradas que todavía faltan.
      </Nota>
      <section className="border-tinta mt-9 border-t pt-7">
        <h2 className="font-anton text-3xl">Seguir construyendo esta pregunta</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <EnlaceAccion secundario href={`/fichas?campana=${c.id}`}>
            Futuros de esta campaña
          </EnlaceAccion>
          <EnlaceAccion secundario href={`/la-radiografia?${alcance}`}>
            Revisar lo escuchado
          </EnlaceAccion>
          <EnlaceAccion secundario href={`/datos-abiertos?${alcance}`}>
            Descargar estos datos
          </EnlaceAccion>
        </div>
        <Link
          href={`/fichas/nueva?campana=${c.id}`}
          className="text-violeta mt-4 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"
        >
          Proponer una ficha de futuro
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
      <Devolucion campana={c} />
      <CompartirProceso
        href={`/campanas/${c.slug}?edicion=${c.revision}`}
        titulo="Compartir esta pregunta"
      />
      <details className="border-tinta mt-9 border p-5">
        <summary className="cursor-pointer font-semibold">
          La historia y las reglas de esta conversación
        </summary>
        <ol className="mt-5 space-y-4 text-sm">
          {c.historial.map((h) => (
            <li key={h.revision}>
              {h.estado === 'borrador' ? (
                <>Revisión {h.revision}</>
              ) : (
                <Link className="underline" href={`/campanas/${c.slug}?edicion=${h.revision}`}>
                  Leer revisión {h.revision}
                </Link>
              )}{' '}
              · {FASES_ROTULO[h.estado]}
              <p className="text-tinta-75 mt-1">
                {h.motivo} · {new Date(h.fecha).toLocaleDateString('es-AR')}
              </p>
            </li>
          ))}
        </ol>
      </details>
      <aside className="border-tinta/25 mt-8 border-t pt-6">
        <Link
          href={`/gestion/campanas?duplicar=${c.id}`}
          className="text-violeta inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          Tomar esta configuración para abrir otra pregunta
        </Link>
        {c.puedoEditarContrato ? (
          <div className="mt-4">
            <EnlaceAccion secundario href={`/gestion/campanas?editar=${c.id}`}>
              Revisar el contrato
            </EnlaceAccion>
          </div>
        ) : null}
        {c.puedoEditar && !historica ? <GestionFase campana={c} /> : null}
        {c.puedoInvitar && !historica ? <Equipo tipo="campana" objeto={c.id} /> : null}
      </aside>
    </main>
  );
}

import { contratoCampanaSchema } from '@v2/shared';
import { useRef, useState } from 'react';
import { useLocation } from 'wouter';

import { BusquedaTerritorial } from '../ElMapa/instrumento/BusquedaTerritorial';

import { CamposContrato } from './CamposContrato';
import { FasesContrato } from './FasesContrato';
import { LecturaDatosContrato } from './LecturaDatosContrato';

import type { CampanaPublica, ContratoCampana } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useGuardarCampana } from '~/lib/queries/participacion';

const futuroDia = (dias: number) =>
  new Date(Date.now() + dias * 86400000).toISOString().slice(0, 10);
const VACIO: ContratoCampana = {
  titulo: '',
  pregunta: '',
  proposito: '',
  territorios: [],
  temas: [],
  participantes: '',
  canales: ['web'],
  responsable: '',
  devolucion: '',
  fechaDevolucion: futuroDia(42),
  efecto: '',
  usoDatos: '',
  metodoLectura: '',
  institucion: '',
  fases: [
    {
      nombre: 'Imaginar',
      salida: 'Relatos revisados por quienes participan.',
      fecha: futuroDia(14),
    },
    {
      nombre: 'Contrastar y diseñar',
      salida: 'Condiciones deseadas, diferencias y alternativas.',
      fecha: futuroDia(35),
    },
  ],
};
export function FormularioCampana({ campana, plantilla }: { campana?: CampanaPublica; plantilla?: ContratoCampana }) {
  const [c, setC] = useState<ContratoCampana>(campana?.contrato ?? plantilla ?? VACIO);
  const [temas, setTemas] = useState(c.temas.join(', '));
  const [nombres, setNombres] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [entiendo, setEntiendo] = useState(false);
  const idLocal = useRef(crypto.randomUUID());
  const [, navegar] = useLocation();
  const guardar = useGuardarCampana(campana?.id);
  const actualizar = <K extends keyof ContratoCampana>(campo: K, valor: ContratoCampana[K]) => {
    setC((prev) => ({ ...prev, [campo]: valor }));
  };
  const enviar = () => {
    const v = contratoCampanaSchema.safeParse({
      ...c,
      temas: temas
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    if (!v.success) {
      setError(v.error.issues.map((i) => `${i.path.join(' · ')}: ${i.message}`).join('\n'));
      return;
    }
    setError('');
    guardar.mutate(
      {
        contrato: v.data,
        idLocal: idLocal.current,
        ...(campana ? { revision: campana.revision } : {}),
      },
      {
        onSuccess: (r) => {
          navegar(`/campanas/${r.id}`);
        },
      },
    );
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
      className="space-y-6"
    >
      <Nota>
        Convocar también es aceptar una devolución. Guardar prepara el borrador; publicarlo será un
        paso explícito. Cambiar un contrato ya público abre una edición nueva y pausa la recepción
        hasta que se publique.
      </Nota>
      {plantilla ? <Nota>Estás preparando una campaña nueva desde una configuración existente. No se copian aportes, devoluciones, equipos invitados, identificadores, edición ni consentimientos. Revisá fechas y compromisos antes de guardarla.</Nota> : null}
      <CamposContrato contrato={c} cambiar={actualizar} />
      <label className="block">
        Temas, separados por coma
        <input
          className={CAMPO}
          value={temas}
          onChange={(e) => {
            setTemas(e.target.value);
          }}
          placeholder="Educación, cuidados, movilidad"
        />
      </label>
      <fieldset className="border p-5">
        <legend className="px-2 font-semibold">Territorios incluidos</legend>
        <p className="mb-4 text-sm">
          Sin lugares elegidos, el alcance es nacional. La ubicación de cada aporte la elige su
          autoría.
        </p>
        <BusquedaTerritorial
          onElegir={(l) => {
            if (!c.territorios.includes(l.id)) actualizar('territorios', [...c.territorios, l.id]);
            setNombres((p) => ({ ...p, [l.id]: l.name }));
          }}
        />
        <ul className="mt-4 space-y-2">
          {c.territorios.map((id) => (
            <li key={id} className="flex items-center justify-between gap-4 border-b">
              <span>{nombres[id] ?? `Lugar elegido ${id}`}</span>
              <button
                type="button"
                className="text-sello min-h-11 underline"
                onClick={() => {
                  actualizar(
                    'territorios',
                    c.territorios.filter((x) => x !== id),
                  );
                }}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset>
        <legend className="font-semibold">Canales de participación</legend>
        <div className="mt-3 flex flex-wrap gap-5">
          {(['web', 'encuentro', 'asistido'] as const).map((canal) => (
            <label key={canal} className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                checked={c.canales.includes(canal)}
                onChange={(e) => {
                  actualizar(
                    'canales',
                    e.target.checked ? [...c.canales, canal] : c.canales.filter((x) => x !== canal),
                  );
                }}
              />
              {canal === 'web' ? 'Web' : canal === 'encuentro' ? 'Encuentros' : 'Aportes asistidos'}
            </label>
          ))}
        </div>
      </fieldset>
      <FasesContrato
        fases={c.fases}
        fechaDevolucion={c.fechaDevolucion}
        cambiar={(fases) => {
          actualizar('fases', fases);
        }}
      />
      <label className="block">
        Fecha prevista de devolución
        <input
          className={CAMPO}
          type="date"
          value={c.fechaDevolucion}
          onChange={(e) => {
            actualizar('fechaDevolucion', e.target.value);
          }}
        />
      </label>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={entiendo}
          onChange={(e) => {
            setEntiendo(e.target.checked);
          }}
          className="mt-1"
        />
        <span>
          El equipo acepta cuidar este recorrido. Revisamos la información pública y sabemos qué
          devolución estamos ofreciendo.
        </span>
      </label>
      <ErrorOperacion mensaje={error || guardar.error?.message} />
      <details className="border p-5">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold">Revisar la vista pública del contrato</summary>
        <h2 className="font-anton mt-5 text-3xl">{c.titulo || 'Nombre por definir'}</h2>
        <p className="mt-3">{c.pregunta || 'Pregunta por definir'}</p>
        <p className="mt-3 text-sm">Equipo declarado: {c.responsable || 'Por definir'} · devolución prevista: {c.fechaDevolucion}.</p>
        <LecturaDatosContrato contrato={c} />
      </details>
      <BotonAccion type="submit" disabled={!entiendo || guardar.isPending}>
        {guardar.isPending ? 'Guardando el contrato…' : 'Guardar borrador de campaña'}
      </BotonAccion>
    </form>
  );
}

import { contratoCampanaSchema } from '@v2/shared';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

import { BusquedaTerritorial } from '../ElMapa/instrumento/BusquedaTerritorial';

import { AmbitosCampana } from './AmbitosCampana';
import { CamposContrato } from './CamposContrato';
import { camposConError, errorDeCampo, erroresDelContrato } from './errores-contrato';
import { FasesContrato } from './FasesContrato';
import { LecturaDatosContrato } from './LecturaDatosContrato';
import { CANALES_ROTULO, fechaCampana } from './presentacion';

import type { ErroresContrato } from './errores-contrato';
import type { CampanaPublica, ContratoCampana } from '@v2/shared';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useGuardarCampana } from '~/lib/queries/participacion';
import { cn } from '~/lib/utils';

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
const MensajeCampo = ({ id, mensaje }: { id: string; mensaje: string | undefined }) =>
  mensaje ? (
    <span id={id} className="text-sello mt-2 block text-sm">
      {mensaje}
    </span>
  ) : null;

export function FormularioCampana({
  campana,
  plantilla,
}: {
  campana?: CampanaPublica;
  plantilla?: ContratoCampana;
}) {
  const [c, setC] = useState<ContratoCampana>(campana?.contrato ?? plantilla ?? VACIO);
  const [temas, setTemas] = useState(c.temas.join(', '));
  const [nombres, setNombres] = useState<Record<number, string>>({});
  const [errores, setErrores] = useState<ErroresContrato>({});
  const [entiendo, setEntiendo] = useState(false);
  const idLocal = useRef(crypto.randomUUID());
  const formulario = useRef<HTMLFormElement>(null);
  const [, navegar] = useLocation();
  const guardar = useGuardarCampana(campana?.id);
  const actualizar = <K extends keyof ContratoCampana>(campo: K, valor: ContratoCampana[K]) => {
    setC((prev) => ({ ...prev, [campo]: valor }));
  };
  // Con errores, el foco va al primer campo marcado: quien usa el teclado no tiene que buscarlo.
  useEffect(() => {
    if (Object.keys(errores).length)
      formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errores]);
  const enviar = () => {
    const v = contratoCampanaSchema.safeParse({
      ...c,
      temas: temas
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    if (!v.success) {
      setErrores(erroresDelContrato(v.error.issues));
      return;
    }
    setErrores({});
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
  const conError = camposConError(errores);
  const resumen = conError.length ? `Revisá estos campos: ${conError.join(', ')}.` : '';
  const errorTemas = errorDeCampo(errores, 'temas');
  const errorLugares = errorDeCampo(errores, 'territorios');
  const errorCanales = errorDeCampo(errores, 'canales');
  const errorFecha = errorDeCampo(errores, 'fechaDevolucion');
  return (
    <form
      ref={formulario}
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
      className="space-y-6"
    >
      <Nota>
        Abrir una campaña también es comprometerse a devolver lo que se escuche. Guardar crea un
        borrador; abrirla es un paso aparte, desde la página de la campaña. Si cambiás las reglas de
        una campaña ya pública, se crea una edición nueva y la campaña deja de recibir aportes hasta
        que se publique.
      </Nota>
      {plantilla ? (
        <Nota>
          Estás preparando una campaña nueva desde otra que ya existe. No se copian aportes,
          devoluciones, equipos invitados, identificadores, edición ni consentimientos. Revisá las
          fechas y los compromisos antes de guardarla.
        </Nota>
      ) : null}
      <CamposContrato contrato={c} cambiar={actualizar} errores={errores} />
      <div>
        <label htmlFor="campana-temas" className="block">
          Temas, separados por coma
        </label>
        <input
          id="campana-temas"
          className={cn(CAMPO, errorTemas && 'border-sello')}
          value={temas}
          aria-invalid={errorTemas ? true : undefined}
          aria-describedby={errorTemas ? 'campana-temas-error' : undefined}
          onChange={(e) => {
            setTemas(e.target.value);
          }}
          placeholder="Educación, cuidados, movilidad"
        />
        <MensajeCampo id="campana-temas-error" mensaje={errorTemas} />
      </div>
      <fieldset
        className="border p-5"
        aria-describedby={errorLugares ? 'campana-lugares-error' : undefined}
      >
        <legend className="px-2 font-semibold">Lugares incluidos</legend>
        <p className="mb-4 text-sm">
          Si no elegís ningún lugar, la campaña es para todo el país. El lugar de cada aporte lo
          elige quien lo escribe.
        </p>
        <BusquedaTerritorial
          onElegir={(l) => {
            if (!c.territorios.includes(l.id)) actualizar('territorios', [...c.territorios, l.id]);
            setNombres((p) => ({ ...p, [l.id]: l.name }));
          }}
        />
        <MensajeCampo id="campana-lugares-error" mensaje={errorLugares} />
        <ul className="mt-4 space-y-2">
          {c.territorios.map((id) => (
            <li key={id} className="flex items-center justify-between gap-4 border-b">
              <span>{nombres[id] ?? <AmbitosCampana ids={[id]} />}</span>
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
      <fieldset aria-describedby={errorCanales ? 'campana-canales-error' : undefined}>
        <legend className="font-semibold">Cómo se puede participar</legend>
        <div className="mt-3 flex flex-wrap gap-5">
          {(['web', 'encuentro', 'asistido'] as const).map((canal) => (
            <label key={canal} className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                checked={c.canales.includes(canal)}
                aria-invalid={errorCanales ? true : undefined}
                onChange={(e) => {
                  actualizar(
                    'canales',
                    e.target.checked ? [...c.canales, canal] : c.canales.filter((x) => x !== canal),
                  );
                }}
              />
              {CANALES_ROTULO[canal]}
            </label>
          ))}
        </div>
        <MensajeCampo id="campana-canales-error" mensaje={errorCanales} />
      </fieldset>
      <FasesContrato
        fases={c.fases}
        fechaDevolucion={c.fechaDevolucion}
        errores={errores}
        cambiar={(fases) => {
          actualizar('fases', fases);
        }}
      />
      <div>
        <label htmlFor="campana-fecha" className="block">
          Fecha prevista de devolución
        </label>
        <input
          id="campana-fecha"
          className={cn(CAMPO, errorFecha && 'border-sello')}
          type="date"
          value={c.fechaDevolucion}
          aria-invalid={errorFecha ? true : undefined}
          aria-describedby={errorFecha ? 'campana-fecha-error' : undefined}
          onChange={(e) => {
            actualizar('fechaDevolucion', e.target.value);
          }}
        />
        <MensajeCampo id="campana-fecha-error" mensaje={errorFecha} />
      </div>
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
      {/* Los mensajes del servidor pueden venir en varias líneas. */}
      <div className="whitespace-pre-line">
        <ErrorOperacion mensaje={resumen || guardar.error?.message} />
      </div>
      <details className="border p-5">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold">
          Ver cómo se va a mostrar la campaña
        </summary>
        <h2 className="font-anton mt-5 text-3xl">{c.titulo || 'Nombre por definir'}</h2>
        <p className="mt-3">{c.pregunta || 'Pregunta por definir'}</p>
        <p className="mt-3 text-sm">
          Equipo declarado: {c.responsable || 'Por definir'} · devolución prevista:{' '}
          {fechaCampana(c.fechaDevolucion)}.
        </p>
        <LecturaDatosContrato contrato={c} />
      </details>
      <div className="flex flex-wrap items-center gap-3">
        <BotonConMotivo
          type="submit"
          motivo={
            entiendo ? null : 'Marcá la casilla de arriba: el equipo acepta cuidar este recorrido.'
          }
          ocupado={guardar.isPending}
        >
          {guardar.isPending ? 'Guardando…' : 'Guardar borrador de campaña'}
        </BotonConMotivo>
      </div>
    </form>
  );
}

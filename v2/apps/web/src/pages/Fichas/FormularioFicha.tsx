import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Campo } from './Campo';
import { LugarDeLaFicha } from './LugarDeLaFicha';
import { TemasDeLaFicha } from './TemasDeLaFicha';
import { validarFicha, type ErroresDeFicha } from './validar-ficha';
import { VinculosDeLaFicha } from './VinculosDeLaFicha';

import type { ContenidoFicha, FichaFuturo } from '@v2/shared';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useGuardarFicha } from '~/lib/queries/fichas';

interface Props {
  inicial: ContenidoFicha;
  nombreTerritorio: string;
  ficha?: FichaFuturo;
  guardada: (id: string) => void;
}
const CAMPOS = [
  ['futuro', '¿Cómo sería la vida que queremos hacer posible?'],
  ['situacion', '¿Qué sabemos del presente y qué falta comprobar?'],
  ['proximaTarea', '¿Qué necesitamos investigar o escuchar a continuación?'],
] as const;

export function FormularioFicha({ inicial, nombreTerritorio, ficha, guardada }: Props) {
  const [contenido, setContenido] = useState(inicial);
  const [condicionesTexto, setCondicionesTexto] = useState((inicial.condiciones ?? []).join('\n'));
  const [lugarElegido, setLugarElegido] = useState<string | null>(null);
  const [acepta, setAcepta] = useState(false);
  const [errores, setErrores] = useState<ErroresDeFicha>({});
  const [intentos, setIntentos] = useState(0);
  const formulario = useRef<HTMLFormElement>(null);
  const intento = useRef<{ cuerpo: string; id: string } | null>(null);
  const guardar = useGuardarFicha(ficha?.id, ficha?.revision);
  const actualizar = <K extends keyof ContenidoFicha>(campo: K, valor: ContenidoFicha[K]) => {
    setContenido((c) => ({ ...c, [campo]: valor }));
  };
  // Con errores, el foco va al primer campo que los tiene: se lee su mensaje.
  useEffect(() => {
    if (intentos > 0)
      formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [intentos]);
  const motivo = !ficha && !acepta ? 'Marcá la casilla de arriba para poder crear la ficha.' : null;
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (guardar.isPending || motivo) return;
    const validacion = validarFicha(contenido);
    if ('errores' in validacion) {
      setErrores(validacion.errores);
      setIntentos((n) => n + 1);
      return;
    }
    setErrores({});
    const cuerpo = JSON.stringify(validacion.datos);
    if (intento.current?.cuerpo !== cuerpo) intento.current = { cuerpo, id: crypto.randomUUID() };
    guardar.mutate(
      { contenido: validacion.datos, idLocal: intento.current.id },
      {
        onSuccess: (r) => {
          guardada(r.id);
        },
      },
    );
  };
  return (
    <form ref={formulario} onSubmit={enviar} className="space-y-6" noValidate>
      <p className="border-violeta border-l-2 pl-4 text-sm leading-relaxed">
        Los aportes vinculados conservan su autoría y sus límites. No publiques domicilios, nombres
        ni datos sensibles de otras personas.
      </p>
      <Campo etiqueta="Pregunta o título" error={errores.titulo}>
        {(a) => (
          <input
            {...a}
            value={contenido.titulo}
            maxLength={180}
            onChange={(e) => {
              actualizar('titulo', e.target.value);
            }}
            className={CAMPO}
          />
        )}
      </Campo>
      <LugarDeLaFicha
        territorioId={contenido.territorioId}
        nombre={lugarElegido ?? nombreTerritorio}
        elegir={(lugar) => {
          actualizar('territorioId', lugar.id);
          setLugarElegido(lugar.name);
        }}
        todoElPais={() => {
          actualizar('territorioId', null);
          setLugarElegido('Todo el país');
        }}
      />
      <TemasDeLaFicha
        valor={contenido.temas}
        cambiar={(temas) => {
          actualizar('temas', temas);
        }}
      />
      {errores.temas ? (
        <p role="alert" className="text-sello text-sm">
          {errores.temas}
        </p>
      ) : null}
      {CAMPOS.map(([campo, etiqueta]) => (
        <Campo
          key={campo}
          etiqueta={etiqueta}
          error={errores[campo]}
          ayuda="Si todavía no lo sabés, dejalo pendiente."
        >
          {(a) => (
            <textarea
              {...a}
              rows={4}
              maxLength={campo === 'proximaTarea' ? 2000 : 4000}
              value={contenido[campo]}
              onChange={(e) => {
                actualizar(campo, e.target.value);
              }}
              className={CAMPO}
            />
          )}
        </Campo>
      ))}
      <Campo
        etiqueta="Condiciones que harían posible ese futuro, una por línea"
        error={errores.condiciones}
        ayuda="Son formulaciones para revisar. Compartirlas todavía no significa que estén acordadas."
      >
        {(a) => (
          <textarea
            {...a}
            rows={4}
            className={CAMPO}
            value={condicionesTexto}
            onChange={(e) => {
              setCondicionesTexto(e.target.value);
              actualizar(
                'condiciones',
                e.target.value.split('\n').filter((s) => s.trim()),
              );
            }}
          />
        )}
      </Campo>
      <VinculosDeLaFicha
        vinculos={contenido.vinculos}
        campana={contenido.campanaId}
        conocidos={ficha?.aportes ?? []}
        error={errores.vinculos}
        cambiar={(vinculos) => {
          actualizar('vinculos', vinculos);
        }}
      />
      {!ficha ? (
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={acepta}
            onChange={(e) => {
              setAcepta(e.target.checked);
            }}
            className="mt-1 h-5 w-5"
          />
          <span>
            Entiendo que cualquiera puede leer esta ficha y que es una propuesta para discutir.
          </span>
        </label>
      ) : null}
      <ErrorOperacion mensaje={guardar.isError ? guardar.error.message : null} />
      {ficha && guardar.isError ? (
        <p className="text-sm">
          <a href={`/fichas/${ficha.id}`} target="_blank" rel="noreferrer" className="underline">
            Abrir la versión actual en otra pestaña, sin perder lo que escribiste
          </a>
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <BotonConMotivo type="submit" motivo={motivo} ocupado={guardar.isPending}>
          {guardar.isPending
            ? 'Guardando…'
            : ficha
              ? `Guardar versión ${ficha.revision + 1}`
              : 'Crear ficha'}
        </BotonConMotivo>
      </div>
    </form>
  );
}

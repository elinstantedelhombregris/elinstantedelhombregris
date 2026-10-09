import { useId } from 'react';

import { errorDeCampo } from './errores-contrato';

import type { ErroresContrato } from './errores-contrato';
import type { ContratoCampana } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';

type Clave =
  | 'titulo'
  | 'pregunta'
  | 'proposito'
  | 'participantes'
  | 'responsable'
  | 'devolucion'
  | 'efecto'
  | 'usoDatos'
  | 'metodoLectura';

const CAMPOS: {
  clave: Clave;
  label: string;
  ayuda: string;
  largo: boolean;
}[] = [
  {
    clave: 'titulo',
    label: 'Nombre de la campaña',
    ayuda: 'Un nombre que invite a entender la tarea.',
    largo: false,
  },
  {
    clave: 'pregunta',
    label: 'La pregunta que nos reúne',
    ayuda: 'Cómo sería aprender, cuidar o habitar en la comunidad que queremos.',
    largo: false,
  },
  {
    clave: 'proposito',
    label: 'Para qué abrimos esta campaña',
    ayuda: 'Qué queremos comprender y diseñar juntos.',
    largo: true,
  },
  {
    clave: 'participantes',
    label: 'A quiénes queremos escuchar',
    ayuda: 'Incluí a quienes habitualmente quedan afuera y los canales para llegar.',
    largo: true,
  },
  {
    clave: 'responsable',
    label: 'Equipo que acepta facilitar y devolver',
    ayuda: 'Este nombre es público. Poné el que el equipo eligió mostrar.',
    largo: false,
  },
  {
    clave: 'devolucion',
    label: 'Qué vamos a devolver',
    ayuda: 'Informe, encuentro y oportunidad de corregir lo que entendimos.',
    largo: true,
  },
  {
    clave: 'usoDatos',
    label: 'Cómo usaremos los datos compartidos',
    ayuda:
      'Explicá qué se analizará, quién lo hará y para qué. Los permisos del aporte siguen siendo necesarios.',
    largo: true,
  },
  {
    clave: 'metodoLectura',
    label: 'Cómo leeremos y revisaremos lo escuchado',
    ayuda:
      'Describí el método, las fuentes, las ausencias y cómo las personas podrán corregir la devolución.',
    largo: true,
  },
  {
    clave: 'efecto',
    label: 'Qué efecto puede tener la campaña',
    ayuda: 'Una exploración, una prueba o una decisión con acuerdo y autoridad definidos.',
    largo: true,
  },
];

const AYUDA_INSTITUCION =
  'Nombrar una institución no acredita vínculo, representación ni aceptación de responsabilidad. Esta plataforma no registra una aceptación institucional en esta operación.';

function Campo({
  id,
  label,
  ayuda,
  largo,
  valor,
  error,
  maxLength,
  alCambiar,
}: {
  id: string;
  label: string;
  ayuda: string;
  largo: boolean;
  valor: string;
  error: string | undefined;
  maxLength?: number;
  alCambiar: (valor: string) => void;
}) {
  const props = {
    id,
    value: valor,
    className: CAMPO + (error ? ' border-sello' : ''),
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? `${id}-error ${id}-ayuda` : `${id}-ayuda`,
    ...(maxLength ? { maxLength } : {}),
  };
  return (
    <div className="font-medium">
      <label htmlFor={id} className="block">
        {label}
      </label>
      {largo ? (
        <textarea
          {...props}
          rows={3}
          onChange={(e) => {
            alCambiar(e.target.value);
          }}
        />
      ) : (
        <input
          {...props}
          onChange={(e) => {
            alCambiar(e.target.value);
          }}
        />
      )}
      {error ? (
        <span id={`${id}-error`} className="text-sello mt-2 block text-sm font-normal">
          {error}
        </span>
      ) : null}
      <span id={`${id}-ayuda`} className="text-tinta-50 mt-2 block text-sm font-normal">
        {ayuda}
      </span>
    </div>
  );
}

export function CamposContrato({
  contrato,
  cambiar,
  errores = {},
}: {
  contrato: ContratoCampana;
  cambiar: (campo: Clave | 'institucion', valor: string) => void;
  errores?: ErroresContrato;
}) {
  const id = useId();
  return (
    <>
      {CAMPOS.map((f) => (
        <Campo
          key={f.clave}
          id={`${id}-${f.clave}`}
          label={f.label}
          ayuda={f.ayuda}
          largo={f.largo}
          valor={contrato[f.clave]}
          error={errorDeCampo(errores, f.clave)}
          alCambiar={(v) => {
            cambiar(f.clave, v);
          }}
        />
      ))}
      <Campo
        id={`${id}-institucion`}
        label="Institución mencionada por quien abre la campaña, si corresponde"
        ayuda={AYUDA_INSTITUCION}
        largo={false}
        valor={contrato.institucion}
        error={errorDeCampo(errores, 'institucion')}
        maxLength={200}
        alCambiar={(v) => {
          cambiar('institucion', v);
        }}
      />
    </>
  );
}

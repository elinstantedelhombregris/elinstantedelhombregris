import { useId } from 'react';

import type { ContratoCampana } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';

const CAMPOS: {
  clave:
    | 'titulo'
    | 'pregunta'
    | 'proposito'
    | 'participantes'
    | 'responsable'
    | 'devolucion'
    | 'efecto'
    | 'usoDatos'
    | 'metodoLectura';
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
    label: 'Para qué abrimos esta conversación',
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
    ayuda: 'Esta firma es pública. Poné el nombre que el equipo eligió mostrar.',
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
    ayuda: 'Explicá qué se analizará, quién lo hará y para qué. Los permisos del aporte siguen siendo necesarios.',
    largo: true,
  },
  {
    clave: 'metodoLectura',
    label: 'Cómo leeremos y revisaremos lo escuchado',
    ayuda: 'Describí el método, las fuentes, las ausencias y cómo las personas podrán corregir la devolución.',
    largo: true,
  },
  {
    clave: 'efecto',
    label: 'Qué efecto puede tener el proceso',
    ayuda: 'Una exploración, una prueba o una decisión con acuerdo y autoridad definidos.',
    largo: true,
  },
];
export function CamposContrato({ contrato, cambiar }: { contrato: ContratoCampana; cambiar: (campo: typeof CAMPOS[number]['clave'] | 'institucion', valor: string) => void }) {
  const id = useId();
  return <>
    {CAMPOS.map((f) => <div key={f.clave} className="font-medium">
      <label htmlFor={`${id}-${f.clave}`} className="block">{f.label}</label>
      {f.largo ? <textarea id={`${id}-${f.clave}`} aria-describedby={`${id}-${f.clave}-ayuda`} className={CAMPO} rows={3} value={contrato[f.clave]} onChange={(e) => { cambiar(f.clave, e.target.value); }} /> : <input id={`${id}-${f.clave}`} aria-describedby={`${id}-${f.clave}-ayuda`} className={CAMPO} value={contrato[f.clave]} onChange={(e) => { cambiar(f.clave, e.target.value); }} />}
      <span id={`${id}-${f.clave}-ayuda`} className="text-tinta-50 mt-2 block text-sm font-normal">{f.ayuda}</span>
    </div>)}
    <div>
      <label className="block" htmlFor={`${id}-institucion`}>Institución mencionada por quien convoca, si corresponde</label>
      <input id={`${id}-institucion`} aria-describedby={`${id}-institucion-ayuda`} className={CAMPO} value={contrato.institucion} maxLength={200} onChange={(e) => { cambiar('institucion', e.target.value); }} />
      <span id={`${id}-institucion-ayuda`} className="text-tinta-50 mt-2 block text-sm">Nombrar una institución no acredita vínculo, representación ni aceptación de responsabilidad. Esta plataforma no registra una aceptación institucional en esta operación.</span>
    </div>
  </>;
}

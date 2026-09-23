import { contenidoFichaSchema, type ContenidoFicha, type FichaFuturo } from '@v2/shared';
import { useRef, useState, type FormEvent } from 'react';

import { BusquedaTerritorial } from '../ElMapa/instrumento/BusquedaTerritorial';

import { useGuardarFicha } from '~/lib/queries/fichas';

interface Props {
  inicial: ContenidoFicha;
  nombreTerritorio: string;
  ficha?: FichaFuturo;
  guardada: (id: string) => void;
}
const CAMPOS = [
  ['situacion', '¿Qué está pasando? Separá lo observado de lo que falta comprobar.'],
  ['futuro', '¿Qué futuro queremos construir?'],
  ['proximaTarea', '¿Qué necesitamos investigar o escuchar a continuación?'],
] as const;
const RELACIONES: Record<ContenidoFicha['vinculos'][number]['relacion'], string> = {
  describe: 'Describe la situación',
  contradice: 'Contradice la lectura',
  evidencia: 'Aporta evidencia',
  capacidad: 'Aporta una capacidad',
};
export function FormularioFicha({ inicial, nombreTerritorio, ficha, guardada }: Props) {
  const [contenido, setContenido] = useState(inicial);
  const [temasTexto, setTemasTexto] = useState(inicial.temas.join(', '));
  const [nombre, setNombre] = useState(nombreTerritorio);
  const [acepta, setAcepta] = useState(false);
  const [senal, setSenal] = useState('');
  const [relacion, setRelacion] =
    useState<ContenidoFicha['vinculos'][number]['relacion']>('describe');
  const [error, setError] = useState('');
  const intento = useRef<{ cuerpo: string; id: string } | null>(null);
  const guardar = useGuardarFicha(ficha?.id, ficha?.revision);
  const actualizar = <K extends keyof ContenidoFicha>(campo: K, valor: ContenidoFicha[K]) => {
    setContenido((c) => ({ ...c, [campo]: valor }));
  };
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (guardar.isPending || (!ficha && !acepta)) return;
    const validacion = contenidoFichaSchema.safeParse({
      ...contenido,
      temas: temasTexto
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    if (!validacion.success) {
      setError(validacion.error.issues.map((i) => i.message).join(' '));
      return;
    }
    setError('');
    const cuerpo = JSON.stringify(validacion.data);
    if (intento.current?.cuerpo !== cuerpo) intento.current = { cuerpo, id: crypto.randomUUID() };
    guardar.mutate(
      { contenido: validacion.data, idLocal: intento.current.id },
      {
        onSuccess: (r) => {
          guardada(r.id);
        },
      },
    );
  };
  return (
    <form onSubmit={enviar} className="space-y-6">
      <p className="border-violeta border-l-2 pl-4 text-sm">
        Es un borrador público. Quien lo crea administra sus revisiones; los aportes enlazados
        conservan su autoría y sus límites. No publiques domicilios, nombres ni datos sensibles de
        otras personas.
      </p>
      <label className="block font-bold">
        Pregunta o título
        <input
          value={contenido.titulo}
          maxLength={180}
          onChange={(e) => {
            actualizar('titulo', e.target.value);
          }}
          className="bg-papel-crudo mt-2 min-h-11 w-full border p-3 font-normal"
        />
      </label>
      <div className="bg-tinta text-oscuro-texto p-4">
        <p className="mb-3">
          Territorio: {nombre}.{' '}
          {contenido.territorioId === null
            ? 'Alcance nacional declarado.'
            : `Catálogo: ${contenido.territorioId}.`}
        </p>
        <BusquedaTerritorial
          onElegir={(lugar) => {
            actualizar('territorioId', lugar.id);
            setNombre(lugar.name);
          }}
        />
        <button
          className="mt-3 min-h-11 underline"
          type="button"
          onClick={() => {
            actualizar('territorioId', null);
            setNombre('Argentina');
          }}
        >
          Usar alcance nacional
        </button>
      </div>
      <label className="block font-bold">
        Temas (separados por coma)
        <input
          value={temasTexto}
          onChange={(e) => {
            setTemasTexto(e.target.value);
          }}
          className="bg-papel-crudo mt-2 min-h-11 w-full border p-3 font-normal"
        />
      </label>
      {CAMPOS.map(([campo, etiqueta]) => (
        <label className="block font-bold" key={campo}>
          {etiqueta}
          <textarea
            rows={4}
            maxLength={campo === 'proximaTarea' ? 2000 : 4000}
            value={contenido[campo]}
            onChange={(e) => {
              actualizar(campo, e.target.value);
            }}
            className="bg-papel-crudo mt-2 w-full border p-3 font-normal"
          />
          <span className="text-tinta-50 block text-xs font-normal">
            Si todavía no lo sabés, dejalo pendiente.
          </span>
        </label>
      ))}
      <fieldset className="border p-4">
        <legend className="px-2 font-bold">Aportes que sostienen o cuestionan esta ficha</legend>
        <p className="text-sm">
          Pegá el enlace público de una señal. Vincularla como evidencia no cambia su estado de
          corroboración.
        </p>
        <label className="mt-3 block text-sm">
          Enlace o identificador del aporte
          <input
            value={senal}
            onChange={(e) => {
              setSenal(e.target.value);
            }}
            className="bg-papel-crudo mt-1 min-h-11 w-full border p-2"
          />
        </label>
        <label className="mt-3 block text-sm">
          Relación
          <select
            value={relacion}
            onChange={(e) => {
              const valor = e.target.value;
              if (valor in RELACIONES) setRelacion(valor as typeof relacion);
            }}
            className="bg-papel-crudo mt-1 min-h-11 w-full border p-2"
          >
            {Object.entries(RELACIONES).map(([id, nombreRelacion]) => (
              <option key={id} value={id}>
                {nombreRelacion}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="min-h-11 underline"
          onClick={() => {
            const id = senal.trim().split('/senal/').pop()?.split(/[?#]/)[0] ?? '';
            if (
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
            ) {
              setError('Pegá un enlace de señal válido.');
              return;
            }
            actualizar('vinculos', [...contenido.vinculos, { senalId: id, relacion }]);
            setSenal('');
            setError('');
          }}
        >
          Agregar vínculo
        </button>
        <ul>
          {contenido.vinculos.map((v, i) => (
            <li key={`${v.senalId}-${v.relacion}-${i}`} className="border-t py-2 text-sm">
              <a className="break-all underline" href={`/senal/${v.senalId}`}>
                {RELACIONES[v.relacion]} · {v.senalId}
              </a>
              <button
                type="button"
                className="ml-3 min-h-11 underline"
                onClick={() => {
                  actualizar(
                    'vinculos',
                    contenido.vinculos.filter((_, posicion) => posicion !== i),
                  );
                }}
              >
                Quitar vínculo {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>
      {!ficha ? (
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={acepta}
            onChange={(e) => {
              setAcepta(e.target.checked);
            }}
            className="mt-1"
          />
          <span>
            Entiendo que esta ficha será un borrador público y que todavía no constituye un acuerdo
            colectivo.
          </span>
        </label>
      ) : null}
      {error || guardar.isError ? (
        <p role="alert" className="text-sello">
          {error || guardar.error?.message}{' '}
          {ficha && guardar.isError ? (
            <a href={`/fichas/${ficha.id}`} target="_blank" rel="noreferrer" className="underline">
              Abrir la revisión actual sin perder este borrador
            </a>
          ) : null}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={guardar.isPending || (!ficha && !acepta)}
        className="bg-violeta text-papel min-h-11 px-5 py-3 disabled:opacity-50"
      >
        {guardar.isPending
          ? 'Guardando…'
          : ficha
            ? `Guardar revisión ${ficha.revision + 1}`
            : 'Crear ficha de futuro'}
      </button>
    </form>
  );
}

import { errorDeCampo } from './errores-contrato';

import type { ErroresContrato } from './errores-contrato';
import type { ContratoCampana } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion } from '~/components/participacion/Elementos';

const MAXIMO_ETAPAS = 8;

function MensajeError({ id, mensaje }: { id: string; mensaje: string | undefined }) {
  return mensaje ? (
    <span id={id} className="text-sello mt-2 block text-sm">
      {mensaje}
    </span>
  ) : null;
}

/** Las etapas de la campaña: cada una con su nombre, su fecha y lo que deja. */
export function FasesContrato({
  fases,
  fechaDevolucion,
  cambiar,
  errores = {},
}: {
  fases: ContratoCampana['fases'];
  fechaDevolucion: string;
  cambiar: (v: ContratoCampana['fases']) => void;
  errores?: ErroresContrato;
}) {
  const errorGeneral = errores.fases;
  return (
    <fieldset className="border p-5" aria-describedby={errorGeneral ? 'etapas-error' : undefined}>
      <legend className="px-2 font-semibold">Etapas y fechas</legend>
      <MensajeError id="etapas-error" mensaje={errorGeneral} />
      {fases.map((f, i) => {
        const campo = (nombre: 'nombre' | 'fecha' | 'salida') =>
          errorDeCampo(errores, `fases.${i}.${nombre}`);
        const propiedades = (nombre: 'nombre' | 'fecha' | 'salida') => ({
          className: CAMPO + (campo(nombre) ? ' border-sello' : ''),
          'aria-invalid': campo(nombre) ? (true as const) : undefined,
          'aria-describedby': campo(nombre) ? `etapa-${i}-${nombre}-error` : undefined,
        });
        return (
          <div key={i} className="mb-6 grid gap-4 border-b pb-5 sm:grid-cols-2">
            <div>
              <label className="block" htmlFor={`etapa-${i}-nombre`}>
                Nombre
              </label>
              <input
                id={`etapa-${i}-nombre`}
                {...propiedades('nombre')}
                value={f.nombre}
                onChange={(e) => {
                  cambiar(fases.map((v, j) => (j === i ? { ...v, nombre: e.target.value } : v)));
                }}
              />
              <MensajeError id={`etapa-${i}-nombre-error`} mensaje={campo('nombre')} />
            </div>
            <div>
              <label className="block" htmlFor={`etapa-${i}-fecha`}>
                Fecha
              </label>
              <input
                id={`etapa-${i}-fecha`}
                {...propiedades('fecha')}
                type="date"
                value={f.fecha}
                onChange={(e) => {
                  cambiar(fases.map((v, j) => (j === i ? { ...v, fecha: e.target.value } : v)));
                }}
              />
              <MensajeError id={`etapa-${i}-fecha-error`} mensaje={campo('fecha')} />
            </div>
            <div className="sm:col-span-2">
              <label className="block" htmlFor={`etapa-${i}-salida`}>
                Qué debe dejar esta etapa
              </label>
              <textarea
                id={`etapa-${i}-salida`}
                {...propiedades('salida')}
                rows={2}
                value={f.salida}
                onChange={(e) => {
                  cambiar(fases.map((v, j) => (j === i ? { ...v, salida: e.target.value } : v)));
                }}
              />
              <MensajeError id={`etapa-${i}-salida-error`} mensaje={campo('salida')} />
            </div>
            {fases.length > 1 ? (
              <button
                type="button"
                className="text-sello min-h-11 text-left underline"
                onClick={() => {
                  cambiar(fases.filter((_, j) => i !== j));
                }}
              >
                Quitar la etapa {i + 1}
              </button>
            ) : null}
          </div>
        );
      })}
      <BotonAccion
        tono="papel"
        disabled={fases.length >= MAXIMO_ETAPAS}
        onClick={() => {
          cambiar([...fases, { nombre: '', salida: '', fecha: fechaDevolucion }]);
        }}
      >
        Agregar etapa
      </BotonAccion>
      {fases.length >= MAXIMO_ETAPAS ? (
        <p className="text-tinta-75 mt-3 text-sm">
          Una campaña puede tener hasta {MAXIMO_ETAPAS} etapas.
        </p>
      ) : null}
    </fieldset>
  );
}

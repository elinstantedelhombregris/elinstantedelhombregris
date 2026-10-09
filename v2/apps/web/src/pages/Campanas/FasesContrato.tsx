import type { ContratoCampana } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion } from '~/components/participacion/Elementos';
export function FasesContrato({
  fases,
  fechaDevolucion,
  cambiar,
}: {
  fases: ContratoCampana['fases'];
  fechaDevolucion: string;
  cambiar: (v: ContratoCampana['fases']) => void;
}) {
  return (
    <fieldset className="border p-5">
      <legend className="px-2 font-semibold">Fases y salidas</legend>
      {fases.map((f, i) => (
        <div key={i} className="mb-6 grid gap-4 border-b pb-5 sm:grid-cols-2">
          <label>
            Nombre
            <input
              className={CAMPO}
              value={f.nombre}
              onChange={(e) => {
                cambiar(fases.map((v, j) => (j === i ? { ...v, nombre: e.target.value } : v)));
              }}
            />
          </label>
          <label>
            Fecha
            <input
              className={CAMPO}
              type="date"
              value={f.fecha}
              onChange={(e) => {
                cambiar(fases.map((v, j) => (j === i ? { ...v, fecha: e.target.value } : v)));
              }}
            />
          </label>
          <label className="sm:col-span-2">
            Qué debe dejar esta fase
            <textarea
              className={CAMPO}
              rows={2}
              value={f.salida}
              onChange={(e) => {
                cambiar(fases.map((v, j) => (j === i ? { ...v, salida: e.target.value } : v)));
              }}
            />
          </label>
          {fases.length > 1 ? (
            <button
              type="button"
              className="text-sello min-h-11 text-left underline"
              onClick={() => {
                cambiar(fases.filter((_, j) => i !== j));
              }}
            >
              Quitar fase
            </button>
          ) : null}
        </div>
      ))}
      <BotonAccion
        tono="papel"
        disabled={fases.length >= 8}
        onClick={() => {
          cambiar([...fases, { nombre: '', salida: '', fecha: fechaDevolucion }]);
        }}
      >
        Añadir fase
      </BotonAccion>
    </fieldset>
  );
}

import {
  escenarioDisponibilidadSchema,
  estimarDisponibilidad,
  type EscenarioDisponibilidad,
} from '@v2/shared';
import { useId, useState } from 'react';

const PARAMETROS = [
  ['horasEquipo', 'Horas del equipo disponibles en el período'],
  ['horasPorActividad', 'Horas del equipo necesarias por actividad'],
  ['plazasPorActividad', 'Plazas por actividad'],
] as const;
export function ExplorarDisponibilidad({
  titulo,
  ejemplo = false,
}: {
  titulo: string;
  ejemplo?: boolean;
}) {
  const id = useId();
  const [resultado, setResultado] = useState<{
    datos: EscenarioDisponibilidad;
    estimacion: ReturnType<typeof estimarDisponibilidad>;
  } | null>(null);
  const [error, setError] = useState('');
  return (
    <details className="border-tinta/30 mt-5 border-t pt-4">
      <summary className="min-h-11 cursor-pointer font-semibold">
        Explorar disponibilidad para esta alternativa
      </summary>
      <p className="mt-3">
        {titulo}. Modelo exploratorio de capacidad: estima actividades y plazas posibles a partir de
        horas de equipo. Compara mantener la situación con esta alternativa; no predice resultados
        ni reserva recursos.
      </p>
      <p className="mt-2 text-sm">
        Usá el mismo período y la misma actividad en ambos casos. Dos personas durante una hora
        consumen dos horas de equipo. Las plazas no son personas únicas: alguien puede asistir
        varias veces.
      </p>
      {ejemplo && (
        <p className="mt-3 font-semibold">
          Todos los parámetros precargados son inventados para este ejercicio.
        </p>
      )}
      <form
        className="mt-4 space-y-5"
        onChange={() => {
          setResultado(null);
          setError('');
        }}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const numero = (key: string) => {
            const v = data.get(key);
            return v === null || v === '' ? null : Number(v);
          };
          const caso = (k: string) => ({
            horasEquipo: {
              min: numero(`${k}-horasEquipo-min`),
              max: numero(`${k}-horasEquipo-max`),
            },
            horasPorActividad: {
              min: numero(`${k}-horasPorActividad-min`),
              max: numero(`${k}-horasPorActividad-max`),
            },
            plazasPorActividad: {
              min: numero(`${k}-plazasPorActividad-min`),
              max: numero(`${k}-plazasPorActividad-max`),
            },
            procedencia: data.get(`${k}-procedencia`),
            fecha: data.get(`${k}-fecha`),
            origen: data.get(`${k}-origen`),
          });
          const r = escenarioDisponibilidadSchema.safeParse({
            referencia: caso('referencia'),
            alternativa: caso('alternativa'),
            periodo: data.get('periodo'),
            perjudicados: data.get('perjudicados'),
            limites: data.get('limites'),
          });
          if (!r.success) {
            setError(r.error.issues[0]?.message ?? 'Completá los parámetros y su procedencia.');
            return;
          }
          setError('');
          setResultado({ datos: r.data, estimacion: estimarDisponibilidad(r.data) });
        }}
      >
        <label className="grid gap-2">
          Período común
          <input
            required
            minLength={5}
            maxLength={200}
            name="periodo"
            className="border-tinta w-full border bg-transparent p-2"
            placeholder="Por ejemplo: una semana de actividad"
            defaultValue={ejemplo ? 'Una semana de ejemplo' : undefined}
          />
        </label>
        {(['referencia', 'alternativa'] as const).map((c) => (
          <fieldset className="border-tinta/40 space-y-4 border p-3" key={c}>
            <legend className="px-2 font-semibold">
              {c === 'referencia' ? 'Situación de referencia' : 'Alternativa propuesta'}
            </legend>
            {PARAMETROS.map(([k, label]) => (
              <div key={k}>
                <p id={`${id}-${c}-${k}`} className="font-semibold">
                  {label}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {(['min', 'max'] as const).map((extremo) => (
                    <label className="grid gap-1" key={extremo}>
                      {extremo === 'min' ? 'Mínimo' : 'Máximo'}
                      <input
                        required
                        aria-describedby={`${id}-${c}-${k}`}
                        aria-label={`${label}, ${c}, ${extremo}`}
                        className="border-tinta w-full min-w-0 border bg-transparent p-2"
                        name={`${c}-${k}-${extremo}`}
                        type="number"
                        min={k === 'horasPorActividad' ? '0.001' : '0'}
                        step="any"
                        max={1000000}
                        defaultValue={
                          ejemplo
                            ? k === 'horasEquipo'
                              ? c === 'referencia'
                                ? 8
                                : 12
                              : k === 'horasPorActividad'
                                ? 2
                                : 6
                            : undefined
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <label className="grid gap-2">
              Origen de los parámetros
              <select
                name={`${c}-origen`}
                className="border-tinta w-full border bg-transparent p-2"
                defaultValue="supuesto"
              >
                <option value="supuesto">Supuestos por comprobar</option>
                <option value="observado">Observaciones documentadas por quien completa</option>
              </select>
            </label>
            <label className="grid gap-2">
              Fuentes y justificación de cada parámetro
              <textarea
                required
                minLength={10}
                maxLength={2000}
                name={`${c}-procedencia`}
                className="border-tinta w-full border bg-transparent p-2"
                rows={3}
                defaultValue={
                  ejemplo ? 'Horas y plazas inventadas para aprender el cálculo.' : undefined
                }
              />
            </label>
            <label className="grid gap-2">
              Fecha de observación o formulación del supuesto
              <input
                required
                type="date"
                name={`${c}-fecha`}
                className="border-tinta w-full border bg-transparent p-2"
                defaultValue={ejemplo ? '2026-10-15' : undefined}
              />
            </label>
          </fieldset>
        ))}
        <label className="grid gap-2">
          Quiénes podrían quedar afuera o verse perjudicados
          <textarea
            required
            minLength={10}
            maxLength={2000}
            className="border-tinta w-full border bg-transparent p-2"
            name="perjudicados"
            defaultValue={ejemplo ? 'Quienes no pueden asistir en el horario elegido.' : undefined}
          />
        </label>
        <label className="grid gap-2">
          Otros límites y recursos que hay que comprobar
          <textarea
            required
            minLength={10}
            maxLength={2000}
            name="limites"
            className="border-tinta w-full border bg-transparent p-2"
            defaultValue={
              ejemplo ? 'No se comprobaron espacio, demanda ni accesibilidad.' : undefined
            }
          />
        </label>
        <button type="submit" className="min-h-11 border px-4 py-3">
          Comparar capacidad y sensibilidad
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
      {resultado && (
        <section className="mt-5 space-y-3" aria-live="polite">
          <h5 className="font-semibold">Capacidad condicionada a los supuestos</h5>
          <p>
            Período: {resultado.datos.periodo}. Los rangos son combinaciones de extremos, no
            intervalos de confianza. Actividades = parte entera de horas disponibles / horas por
            actividad.
          </p>
          {(['referencia', 'alternativa'] as const).map((c) => {
            const r = resultado.estimacion[c];
            return (
              <div className="border-tinta/30 border p-3" key={c}>
                <p className="font-semibold">{c === 'referencia' ? 'Referencia' : 'Alternativa'}</p>
                <p>
                  {r.actividades.min}–{r.actividades.max} actividades; {r.plazas.min}–{r.plazas.max}{' '}
                  plazas posibles.
                </p>
                <p className="mt-2 text-sm">
                  Sensibilidad al tiempo disponible, manteniendo el tiempo por actividad en el punto
                  medio:
                </p>
                <ul className="mt-2 list-disc pl-5">
                  {r.sensibilidad.map((s, i) => (
                    <li key={i}>
                      {s.horas} horas de equipo: {s.actividades} actividades.
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <p>
            No calcula calidad, asistencia efectiva, equidad, presupuesto ni impacto. Más plazas no
            demuestra una mejor alternativa.
          </p>
          <p>Posibles perjudicados: {resultado.datos.perjudicados}</p>
          <p>Límites declarados: {resultado.datos.limites}</p>
          <p className="text-sm">
            Cálculo local sin guardar en las fichas. Para conservar una decisión, documentá los
            parámetros y la conclusión en la revisión de la alternativa.
          </p>
        </section>
      )}
    </details>
  );
}

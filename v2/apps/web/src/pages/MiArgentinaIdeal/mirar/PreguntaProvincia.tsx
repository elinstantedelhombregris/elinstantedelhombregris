import { useId, useState } from 'react';

import { nombreCorto } from '../comun/lugar';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { useProvincias } from '~/lib/queries/open-data';

/**
 * Antes del primer aporte, una sola vez, si no se sabe la provincia de quien mira.
 * La respuesta viaja con cada opinión y no se guarda en el navegador (spec §4,
 * «Antes del primer papelito»).
 */
export function PreguntaProvincia({
  onElegir,
}: {
  onElegir: (provinciaId: number | null) => void;
}) {
  const provincias = useProvincias();
  const [elegida, setElegida] = useState('');
  const [falta, setFalta] = useState(false);
  const id = useId();
  const ordenadas = [...(provincias.data ?? [])].sort((a, b) =>
    nombreCorto(a.name).localeCompare(nombreCorto(b.name), 'es'),
  );

  return (
    <div
      data-foco
      tabIndex={-1}
      aria-labelledby={`${id}-titulo`}
      role="group"
      className="flex flex-col gap-4"
    >
      <p className="font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.12em]">
        Antes de empezar
      </p>
      <h2 id={`${id}-titulo`} className="font-anton text-[clamp(30px,8vw,40px)] leading-[1.05]">
        ¿De qué provincia sos?
      </h2>
      <p className="text-tinta-75 text-[16px] leading-relaxed">
        Para saber si lo que se comparte se comparte en todo el país. Te lo preguntamos una sola
        vez.
      </p>
      <label className="block" htmlFor={id}>
        <span className="font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.12em]">
          Tu provincia
        </span>
        <select
          id={id}
          className={CAMPO}
          value={elegida}
          aria-invalid={falta || undefined}
          onChange={(e) => {
            setElegida(e.target.value);
            setFalta(false);
          }}
        >
          <option value="">Elegí tu provincia</option>
          {ordenadas.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {nombreCorto(p.name)}
            </option>
          ))}
        </select>
      </label>
      <ErrorOperacion
        className="my-0"
        mensaje={
          falta
            ? 'Elegí tu provincia, o tocá «Prefiero no decirlo».'
            : provincias.isError
              ? 'No pudimos traer la lista de provincias. Podés seguir sin decirla.'
              : null
        }
      />
      <div className="flex max-w-[26rem] flex-col gap-3">
        <BotonAccion
          className="w-full"
          onClick={() => {
            if (!elegida) {
              setFalta(true);
              return;
            }
            onElegir(Number(elegida));
          }}
        >
          Empezar a mirar
        </BotonAccion>
        <button
          type="button"
          onClick={() => {
            onElegir(null);
          }}
          className="text-violeta min-h-11 self-start underline underline-offset-4"
        >
          Prefiero no decirlo
        </button>
      </div>
    </div>
  );
}

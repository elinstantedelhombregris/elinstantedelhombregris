import { NADIE_LO_DIJO } from '../simulacion-lectura';

import type { Persona } from '@v2/civic-core';

/**
 * § La ficha de una persona sintética.
 *
 * Molde: la ficha de núcleo de La Radiografía, con otro sujeto y una diferencia
 * que importa. Allá la cita es de alguien; acá **no hay nadie**, y la ficha lo
 * dice arriba de la cita y no debajo.
 *
 * Qué muestra y por qué cada cosa:
 *
 * - **de qué documento salió**, con su sha. Es el `source_entity_uuid` de
 *   MiroFish hecho honesto: cada persona dice de qué PLAN, ensayo o entrada de
 *   la bitácora se sembró. El corpus es exclusivamente propio del proyecto,
 *   nunca texto que escribió gente real — eso sería un uso que la línea de
 *   consentimiento no cubre, y no se arregla con un aviso (regla 9).
 * - **la conducta**, que es lo único que la dinámica lee. Los cuatro números y
 *   el radio de atención mueven la cosecha; el texto no la mueve nunca.
 * - **las frases**, con su tipo y su clase. El modelo escribió el texto; el tipo
 *   y la clase los asignó la regla del generador, porque son exactamente los
 *   campos que deciden si algo es corroborable (regla 6).
 *
 * Y qué **no** muestra: un puntaje. La regla 7 prohíbe el ranking individual y
 * el puntaje ideológico, y construirlo con la excusa de que la persona es
 * sintética sería construir igual el objeto que la regla prohíbe.
 */

export interface FichaDePersonaProps {
  readonly persona: Persona | null;
  readonly onCerrar: () => void;
}

export function FichaDePersona({ persona, onCerrar }: FichaDePersonaProps) {
  if (persona === null) return null;

  const { semblanza, conducta, origen, territorio } = persona;

  return (
    <aside
      aria-live="polite"
      aria-label="Ficha de una persona del elenco"
      className="border-sello mt-6 border-2 border-dashed p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="font-space text-sello text-[11px] font-bold uppercase tracking-[0.14em]">
            Persona sintética #{persona.id}
          </p>
          <p className="font-anton text-tinta text-[22px] leading-[1.15]">
            {semblanza.oficio}, {territorio.territorioId}
          </p>
          <p className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]">
            {semblanza.tramoEdad} · {semblanza.arraigoAnios} años de arraigo · celda{' '}
            {territorio.celdaId}
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="font-space border-tinta text-tinta hover:bg-papel-presionado border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]"
        >
          Cerrar
        </button>
      </div>

      <p className="font-space text-sello mb-2 text-[11px] uppercase tracking-[0.1em]">
        {NADIE_LO_DIJO} Lo escribió un modelo leyendo el corpus del proyecto.
      </p>
      <p className="text-tinta-75 max-w-[70ch] text-[15px] leading-[1.55]">{semblanza.texto}</p>

      <h3 className="font-space text-tinta-50 mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.14em]">
        Sembrada desde
      </h3>
      <p className="text-tinta text-[14px] leading-[1.5]">
        {origen.documento}
        <span className="text-tinta-50"> · {origen.ancla}</span>
        <span className="font-space text-tinta-50 ml-2 text-[11px]">sha {origen.sha}</span>
      </p>

      <h3 className="font-space text-tinta-50 mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.14em]">
        Lo único que la dinámica lee
      </h3>
      <dl className="grid gap-x-6 text-[14px] sm:grid-cols-2">
        <Campo rotulo="Propensión a hablar" valor={conducta.propension.toFixed(3)} />
        <Campo rotulo="Constancia" valor={conducta.constanciaPersonal.toFixed(3)} />
        <Campo rotulo="Umbral para adherir" valor={conducta.umbralAdhesion.toFixed(3)} />
        <Campo rotulo="Umbral para corroborar" valor={conducta.umbralCorroboracion.toFixed(3)} />
        <Campo rotulo="Radio de atención" valor={conducta.radioAtencion} />
        <Campo rotulo="Vínculos" valor={String(conducta.vinculos.length)} />
      </dl>

      {semblanza.frases.length === 0 ? null : (
        <>
          <h3 className="font-space text-tinta-50 mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.14em]">
            Lo que podría decir
          </h3>
          <ul className="space-y-2">
            {semblanza.frases.slice(0, 5).map((frase, i) => (
              <li key={i} className="border-papel-borde border-l-2 pl-3">
                <p className="text-tinta text-[14px] leading-[1.5]">«{frase.texto}»</p>
                <p className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]">
                  {frase.tipo} · {frase.clase} — el tipo y la clase los puso la regla, no el modelo
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="border-papel-borde flex justify-between border-b py-1.5">
      <dt className="text-tinta-50">{rotulo}</dt>
      <dd className="font-space text-tinta tabular-nums">{valor}</dd>
    </div>
  );
}

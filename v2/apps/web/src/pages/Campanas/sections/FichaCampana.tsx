import { AmbitosCampana } from '../AmbitosCampana';
import { textoAportes, textoCanales } from '../presentacion';

import type { CampanaPublica } from '@v2/shared';

const DT = 'font-space text-violeta text-[10px] uppercase tracking-[.12em]';

/** Los datos de un vistazo: dónde, quién coordina, cómo se participa y cuánto llegó. */
export function FichaCampana({
  campana: c,
  conAportes = true,
}: {
  campana: CampanaPublica;
  /** Mientras junta gente no recibe aportes propios: la cuenta que importa es la de la barra. */
  conAportes?: boolean;
}) {
  return (
    <dl className="border-tinta/25 mt-9 grid gap-6 border-y py-6 text-sm sm:grid-cols-2">
      <div>
        <dt className={DT}>{c.contrato.territorios.length > 1 ? 'Lugares' : 'Lugar'}</dt>
        <dd className="mt-3">
          <AmbitosCampana ids={c.contrato.territorios} enlaces />
        </dd>
        <dd className="mt-3 flex flex-wrap gap-2">
          {c.contrato.temas.map((t) => (
            <span key={t} className="border-tinta/25 border px-3 py-1">
              {t}
            </span>
          ))}
        </dd>
      </div>
      <div>
        <dt className={DT}>Quién coordina</dt>
        <dd className="mt-3 leading-relaxed">
          {c.contrato.responsable}
          <span className="text-tinta-50 mt-2 block text-xs">
            El equipo lo declara quien abre la campaña; no es una acreditación institucional.
          </span>
        </dd>
      </div>
      <div>
        <dt className={DT}>Cómo se puede participar</dt>
        <dd className="mt-3">{textoCanales(c.contrato.canales)}</dd>
      </div>
      {conAportes ? (
        <div>
          <dt className={DT}>Lo que llegó hasta ahora</dt>
          <dd className="mt-3">
            {textoAportes(c.aportes)}
            <span className="text-tinta-50 mt-2 block text-xs">
              Los aportes no representan a todos los habitantes del lugar.
            </span>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

import { Link } from 'wouter';

import {
  comoTextoPlano,
  ESTADOS,
  etiquetaDeSuperficie,
  fechaLarga,
} from '../lo-que-falta-data';

import type { FaltaPublica } from '~/lib/queries/faltas';

interface FilaFaltaProps {
  falta: FaltaPublica;
  /** La dejó quien está mirando, en este navegador. */
  propia: boolean;
}

/**
 * Una fila del registro. Muestra el número, el estado, de dónde vino y las
 * firmas — y **el número de firmas no reordena nada**: el registro es
 * cronológico descendente siempre (spec §2.4).
 *
 * El cuerpo va como texto plano, con las URLs desarmadas. Un registro público
 * al instante y sin cuenta donde los enlaces son enlaces es una granja de
 * backlinks el mismo día que alguien lo encuentre.
 */
export function FilaFalta({ falta, propia }: FilaFaltaProps) {
  const estado = ESTADOS[falta.estado];
  const bajada = falta.estado === 'bajada';

  return (
    <Link
      href={`/lo-que-falta/${falta.idPublico}`}
      className="border-papel-borde hover:bg-papel-presionado block border-b px-2 py-5 transition-colors duration-150"
    >
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <span className="font-space text-tinta-30 text-sm">{falta.idPublico}</span>
        <span
          className={`font-space text-[11px] font-bold uppercase tracking-[0.08em] ${
            falta.estado === 'hecha'
              ? 'text-verde'
              : falta.estado === 'no_va' || bajada
                ? 'text-sello'
                : 'text-violeta'
          }`}
        >
          {estado.etiqueta}
        </span>
        <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.08em]">
          {etiquetaDeSuperficie(falta.superficie)}
        </span>
        <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.08em]">
          {falta.origen === 'adentro' ? 'la encontré yo' : 'la dejó alguien'}
        </span>
        {propia ? (
          <span className="font-space text-violeta text-[11px] font-bold uppercase tracking-[0.08em]">
            tuya
          </span>
        ) : null}
      </div>

      <div
        className={`mb-1.5 text-[17px] leading-snug ${bajada ? 'text-tinta-30 line-through' : 'text-tinta'}`}
      >
        {bajada ? 'Contenido retirado' : comoTextoPlano(falta.titulo)}
      </div>

      {bajada ? null : (
        <p className="text-tinta-50 m-0 line-clamp-2 text-[14px] leading-relaxed">
          {comoTextoPlano(falta.cuerpo)}
        </p>
      )}

      <div className="font-space text-tinta-50 mt-2.5 flex flex-wrap gap-x-4 text-[11px]">
        <span>{fechaLarga(falta.creadaEn)}</span>
        {falta.firmas > 0 ? (
          <span>
            {String(falta.firmas)} {falta.firmas === 1 ? 'firma' : 'firmas'}
          </span>
        ) : null}
        {falta.anotadaComo ? <span>anotada como {falta.anotadaComo}</span> : null}
      </div>
    </Link>
  );
}

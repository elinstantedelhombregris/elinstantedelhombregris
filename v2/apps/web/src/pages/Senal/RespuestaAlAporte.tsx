import { BotonAdherir } from './BotonAdherir';

import { provinciaRecordada, useOpinar, useOpinionDe } from '~/lib/queries/pila';
import { AvisoPendientes } from '~/pages/MiArgentinaIdeal/mirar/AvisoPendientes';
import { BotonesRespuesta } from '~/pages/MiArgentinaIdeal/mirar/BotonesRespuesta';

export interface RespuestaAlAporteProps {
  idPublico: string;
  /** Sólo un deseo puede estar en Mirar: para los hechos ni se pregunta. */
  esDeseo: boolean;
  esPropio: boolean;
  adhesiones: { total: number; mia: boolean };
}

/**
 * Un solo «yo también» por aporte (spec 2026-10-19 §7). Si el aporte está en Mirar,
 * acá se contesta lo mismo que en Mirar, con la respuesta propia marcada y la
 * posibilidad de cambiarla. Si no, sigue la adhesión de siempre.
 */
export function RespuestaAlAporte({
  idPublico,
  esDeseo,
  esPropio,
  adhesiones,
}: RespuestaAlAporteProps) {
  const q = useOpinionDe(esDeseo ? idPublico : undefined);
  const opinion = useOpinar();

  if (esDeseo && q.isLoading) {
    return (
      <p role="status" className="font-space text-tinta-50 text-[13px]">
        Un momento…
      </p>
    );
  }

  if (q.data?.enMirar) {
    if (esPropio)
      return (
        <p className="font-space text-tinta-75 text-[13px]">
          Es tu aporte: otras personas lo ven en Mirar y contestan si también lo quieren.
        </p>
      );
    return (
      <section aria-labelledby="respuesta-titulo" className="flex max-w-[30rem] flex-col gap-3">
        <h2
          id="respuesta-titulo"
          className="font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.14em]"
        >
          ¿Vos también lo querés?
        </h2>
        <BotonesRespuesta
          marcada={q.data.miOpinion}
          onResponder={(valor) => {
            void opinion.opinar({
              id: idPublico,
              valor,
              provinciaId: provinciaRecordada() ?? null,
            });
          }}
        />
        <AvisoPendientes
          perdidas={opinion.perdidas}
          onReintentar={() => {
            void opinion.reintentar();
          }}
        />
        <p className="font-space text-tinta-50 text-[11px] leading-relaxed">
          Es la misma respuesta que en Mirar. La podés cambiar cuando quieras.
        </p>
      </section>
    );
  }

  return <BotonAdherir idPublico={idPublico} total={adhesiones.total} mia={adhesiones.mia} />;
}

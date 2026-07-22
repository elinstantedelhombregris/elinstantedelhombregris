import { Kicker, RitoTinta } from '~/components/papel/primitives';
import { useVocesCount } from '~/lib/queries/analytics';

/**
 * § 1 de la spec — portada oscura: franja meta, kicker violeta-claro, H1 con
 * el rito de la tinta en variante clara (`tono="claro"`) y el lead con/sin
 * cifra según `useVocesCount`. Cargando, error o N=0 usan la misma frase
 * sin cifra — nunca un número de reserva (regla de datos reales).
 */
export function PortadaMandato() {
  const voces = useVocesCount();
  const n = voces.data?.total;

  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-10 pt-16 max-[560px]:px-5">
      <div className="border-oscuro-borde font-space text-oscuro-meta flex items-start justify-between gap-6 border-b pb-3.5 text-[11px] uppercase tracking-[0.16em]">
        <span>Documento vivo · se reescribe con cada voz</span>
        <span className="text-violeta-claro">Revisión continua</span>
      </div>

      <Kicker className="mt-8 mb-4 text-violeta-claro">El mandato · documento vivo</Kicker>

      <h1
        aria-label="El mandato."
        className="font-anton riso-hover text-oscuro-texto text-[clamp(48px,7vw,104px)] leading-[0.98]"
      >
        <RitoTinta lineas={['El mandato.']} tono="claro" />
      </h1>

      <p className="font-archivo text-oscuro-secundario mt-6 max-w-[640px] text-[19px] leading-relaxed">
        No es un programa de gobierno escrito por asesores. Es el país ordenado por urgencia, redactado{' '}
        {n !== undefined && n >= 1 ? (
          <>
            a partir de <span className="font-space">{n.toLocaleString('es-AR')}</span>{' '}
            {n === 1 ? 'voz real' : 'voces reales'}
          </>
        ) : (
          'por su gente'
        )}
        . El que quiera un cargo, firma esto — o explica, en público, por qué no.
      </p>
    </section>
  );
}

import { Kicker, RitoTinta } from '~/components/papel/primitives';

/** La portada dice qué es un mandato y que hoy no hay ninguno; no lo atribuye a un número de aportes. */
export function PortadaMandato() {
  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-10 pt-16 max-[560px]:px-5">
      <div className="border-oscuro-borde font-space text-oscuro-meta flex items-start justify-between gap-6 border-b pb-3.5 text-[11px] uppercase tracking-[0.16em]">
        <span>Diseño compartido · procesos revisables</span>
        <span className="text-violeta-claro">Revisión continua</span>
      </div>

      <Kicker className="text-violeta-claro mb-4 mt-8">
        El mandato · una posibilidad por construir
      </Kicker>

      <h1
        aria-label="El mandato."
        className="font-anton riso-hover text-oscuro-texto text-[clamp(48px,7vw,104px)] leading-[0.98]"
      >
        <RitoTinta lineas={['El mandato.']} tono="claro" />
      </h1>

      <p className="font-archivo text-oscuro-secundario mt-6 max-w-[640px] text-[19px] leading-relaxed">
        Un mandato es una exigencia con fecha, responsables y forma de comprobarla. Hoy no hay
        ninguno: acá ves qué se está armando y qué dijo la gente.
      </p>
    </section>
  );
}

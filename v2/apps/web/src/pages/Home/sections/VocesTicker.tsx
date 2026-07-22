import { type TipoVoz } from '~/components/papel/primitives';
import { useVocesRecientes } from '~/lib/queries/analytics';
import { cn } from '~/lib/utils';

const TIPOS_VOZ: readonly TipoVoz[] = ['basta', 'sueño', 'necesidad', 'compromiso', 'recurso', 'valor'];

/** Categorías que no matchean uno de los 6 tipos de voz caen en 'valor' (tinta). */
function tipoDeCategoria(categoria: string | null): TipoVoz {
  return TIPOS_VOZ.find((tipo) => tipo === categoria) ?? 'valor';
}

/**
 * Ticker de voces: marquee continuo con sueños/señales reales recién
 * aprobados (`voces-recientes`). Si hay menos voces que las que llenan
 * el marquee, la copia duplicada aria-hidden ya hace de loop. Vacío
 * real (cero voces) muestra la microcopy §10.9 en vez del marquee;
 * mientras carga no mostramos nada — nunca datos de demostración.
 */
export function VocesTicker() {
  const { data, isLoading } = useVocesRecientes(24);

  if (isLoading || data === undefined) {
    return <section className="border-tinta bg-papel-crudo h-[45px] border-y" aria-hidden="true" />;
  }

  if (data.length === 0) {
    return (
      <section className="border-tinta bg-papel-crudo border-y px-5 py-[13px] text-center">
        <span className="font-space text-tinta-75 text-[13px]">
          Todavía no hay voces acá. Qué oportunidad.
        </span>
      </section>
    );
  }

  return (
    <section className="border-tinta bg-papel-crudo overflow-hidden border-y">
      <div className="anim-marquee flex w-max py-[13px]">
        {[0, 1].map((copia) => (
          <div key={copia} aria-hidden={copia === 1} className="flex">
            {data.map((voz) => {
              const tipo = tipoDeCategoria(voz.categoria);
              return (
                <span
                  key={`${copia}-${voz.id}`}
                  className={cn(
                    'font-space whitespace-nowrap px-[34px] text-[13px]',
                    tipo === 'basta' ? 'text-sello' : 'text-tinta-75',
                  )}
                >
                  «{voz.texto}»
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

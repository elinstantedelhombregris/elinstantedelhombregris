import { useVocesRecientes } from '~/lib/queries/analytics';
import { cn } from '~/lib/utils';
import { CLASE_TEXTO, claseDe, leerTipoSenal } from '~/lib/vocabulario';

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
              /**
               * Sin sumidero: lo que no está en el canon sale con el gris
               * neutro y no plegado contra un tipo real. Antes esto era
               * `?? 'valor'`, y por eso una voz de tipo «bastta» se pintaba
               * como si fuera algo.
               */
              const lectura = leerTipoSenal(voz.categoria ?? '');
              return (
                <span
                  key={`${copia}-${voz.id}`}
                  className={cn(
                    'font-space whitespace-nowrap px-[34px] text-[13px]',
                    lectura.reconocido ? CLASE_TEXTO[claseDe(lectura.tipo)] : 'text-tinta-75',
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

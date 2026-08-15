import { Link } from 'wouter';

import { ChipTipo, Kicker } from '~/components/papel/primitives';
import { useCola } from '~/lib/queries/senales';

/**
 * La cola del «¿sigue así?».
 *
 * Es la única pantalla que le da algo que **hacer** a alguien que no quiere
 * escribir — y la que convierte al que pasaba en el que confirma. Sin ella el
 * umbral de dos confirmaciones tiene techo real cero: los endpoints existen y
 * nadie llega nunca a ellos.
 *
 * ## Por qué va acá y no en su propia página
 *
 * Porque el momento en que alguien está más dispuesto a mirar algo ajeno es
 * justo después de haber cargado lo propio. Una página aparte pide una decisión
 * de navegación —«voy a verificar»— que nadie toma antes de entender qué es.
 * Debajo del mapa, es lo siguiente que se ve.
 *
 * ## Los dos vacíos son distintos y se dicen distinto
 *
 * «No hay nada para mirar» y «no sabemos quién sos todavía» son dos estados con
 * dos salidas opuestas: en el primero no hay nada que hacer, en el segundo
 * alcanza con participar una vez. Colapsarlos en un «no hay nada» dejaría a
 * alguien creyendo que el sistema está vacío cuando el problema es que no lo
 * conoce.
 */
export function ColaDeVerificacion() {
  const { data, isLoading } = useCola();

  if (isLoading) return null;
  if (data === undefined) return null;

  const { senales, razon } = data;

  return (
    <section
      aria-labelledby="cola-titulo"
      className="mx-auto max-w-[1440px] px-5 py-14 min-[961px]:px-10"
    >
      <Kicker className="mb-2">El segundo par de ojos</Kicker>
      <h2 id="cola-titulo" className="font-anton text-tinta text-[clamp(24px,3.4vw,38px)] leading-[1.08]">
        ¿Sigue así?
      </h2>
      <p className="text-tinta-75 mt-3 max-w-[62ch] text-[16px] leading-[1.55]">
        Un hecho lo dice una persona; lo comprueban dos. Éstas piden una segunda mirada, y ninguna
        es tuya. Mirar una cuesta menos que escribir una.
      </p>

      {razon !== null ? (
        <p className="border-tinta-25 text-tinta-75 mt-6 max-w-[62ch] border-l-2 py-1 pl-4 text-[15px] leading-relaxed">
          {razon}
        </p>
      ) : senales.length === 0 ? (
        <p className="border-tinta-25 text-tinta-75 mt-6 max-w-[62ch] border-l-2 py-1 pl-4 text-[15px] leading-relaxed">
          No hay nada esperando una segunda mirada ahora mismo. Que la cola esté vacía también es
          información: quiere decir que lo cargado o ya se miró, o todavía no salió a pedir ojos.
        </p>
      ) : (
        <ul className="border-tinta mt-6 border-t-2">
          {senales.map((s) => (
            <li key={s.idPublico} className="border-papel-borde border-b">
              <Link
                href={`/senal/${s.idPublico}`}
                className="hover:bg-papel-presionado flex flex-col gap-2 px-1 py-4 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <ChipTipo tipo={s.tipo} />
                  {s.direccionTexto === null ? null : (
                    <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]">
                      {s.direccionTexto}
                    </span>
                  )}
                </div>
                <p className="text-tinta max-w-[70ch] text-[16px] leading-[1.5]">{s.texto}</p>
                <span className="font-space text-violeta text-[11px] uppercase tracking-[0.12em]">
                  Mirala →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

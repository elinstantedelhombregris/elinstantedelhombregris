import { Kicker } from '~/components/papel/primitives';

/**
 * Aviso de obra — cartel fijo mientras se construye la versión nueva del mapa.
 *
 * Va arriba de todo (debajo de la portada) y no arriba del header: el aviso es
 * de esta página, no del sitio. Ámbar y no sello rojo: esto es método en curso,
 * no urgencia ni error. Cuando la versión nueva esté, esta sección se borra
 * entera —por eso vive en su propio archivo y no incrustada en la portada.
 */
export function AvisoEnObra() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 pb-10 min-[961px]:px-10">
      <div className="border-ambar/40 bg-ambar/[0.06] border-l-[3px] px-5 py-4">
        <Kicker className="text-ambar mb-2">En obra</Kicker>
        <p className="font-archivo text-tinta-75 max-w-[68ch] text-[15px] leading-[1.55]">
          Estamos construyendo una versión nueva de esta página. Lo que ves acá sigue
          andando y tu voz se guarda igual: nada de lo que sueltes se pierde en la mudanza.
        </p>
      </div>
    </section>
  );
}

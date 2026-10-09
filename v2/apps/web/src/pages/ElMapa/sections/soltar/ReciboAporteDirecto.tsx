import { FraseCampana, type CampanaDeAporte } from '../../../Imaginar/FraseCampana';

import { Sello } from '~/components/papel/primitives';

/**
 * Lo que queda a la vista cuando el aporte puntual salió: el sello, a qué
 * campaña entró (o que no entró en ninguna), dónde quedó y cómo seguirlo.
 */
export function ReciboAporteDirecto({
  idPublico,
  provincia,
  engrosado,
  campana,
}: {
  idPublico: string;
  /** El nombre de la provincia elegida, o vacío si no se eligió ninguna. */
  provincia: string;
  /** Por qué el servidor engrosó la precisión, si lo hizo. */
  engrosado: string | null;
  campana: CampanaDeAporte | null;
}) {
  return (
    <div role="status" className="mt-4 flex flex-wrap items-center gap-3.5">
      <Sello
        color="verde"
        rotate={-6}
        className="border-2 px-[11px] py-[7px] text-[11px] tracking-[0.14em]"
      >
        Recibido
      </Sello>
      <div className="font-space text-tinta-75 min-w-0 flex-1 text-xs leading-relaxed">
        <FraseCampana campana={campana} />
        <p className="mt-2">
          {provincia === ''
            ? 'No indicaste una provincia, así que cuenta pero no aparece en un lugar del mapa.'
            : `Quedó en ${provincia}. Desde su página lo seguís o lo retirás.`}
        </p>
      </div>
      {engrosado !== null ? (
        <p className="font-space text-tinta-75 w-full text-[11px] leading-relaxed">{engrosado}</p>
      ) : null}
      <a className="block min-h-11 w-full underline" href={`/senal/${idPublico}`}>
        Ver mi aporte y cómo sigue →
      </a>
    </div>
  );
}

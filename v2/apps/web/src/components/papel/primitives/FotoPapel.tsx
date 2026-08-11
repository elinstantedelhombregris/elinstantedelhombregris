import { cn } from '~/lib/utils';

export type ProporcionFoto = 'retrato' | 'apaisada' | 'firma';

/**
 * La proporción se reserva SIEMPRE, haya foto o no. Es la razón de ser de
 * esta primitiva: cuando entre la foto de verdad, el layout no se corre un
 * pixel — la página ya estaba armada alrededor del hueco del tamaño justo.
 */
const PROPORCION_CLASSES: Record<ProporcionFoto, string> = {
  retrato: 'aspect-[4/5]',
  apaisada: 'aspect-[16/9]',
  firma: 'aspect-[5/2]',
};

export interface FotoPapelProps {
  /** Ruta pública de la foto, o `null` mientras todavía no exista. */
  src: string | null;
  alt: string;
  /** Nombre del archivo esperado — se imprime dentro del marco vacío. */
  archivo: string;
  proporcion: ProporcionFoto;
  /** Epígrafe mono debajo de la foto (opcional). */
  epigrafe?: string;
  className?: string;
}

/**
 * Foto papel §5 — imagen con marco de expediente y hueco declarado.
 *
 * Sin `src` no muestra un error ni un cuadro roto: muestra un marco de
 * archivo vacío que dice qué archivo falta. La página se ve terminada desde
 * el primer día y el reemplazo es cambiar un `null` por una ruta.
 */
export function FotoPapel({
  src,
  alt,
  archivo,
  proporcion,
  epigrafe,
  className,
}: FotoPapelProps) {
  return (
    <figure className={cn('m-0', className)}>
      {src === null ? (
        <div
          role="img"
          aria-label={`Falta la foto: ${alt}`}
          className={cn(
            'border-papel-borde bg-papel-presionado flex w-full flex-col items-center justify-center gap-2 border p-6 text-center',
            PROPORCION_CLASSES[proporcion],
          )}
        >
          <span className="font-space text-tinta-30 text-[10px] uppercase tracking-[0.16em]">
            hueco reservado
          </span>
          <span className="font-space text-tinta-50 text-xs">{archivo}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            'border-papel-borde w-full border object-cover',
            PROPORCION_CLASSES[proporcion],
          )}
        />
      )}
      {epigrafe === undefined ? null : (
        <figcaption className="font-space text-tinta-50 mt-2.5 text-[11px] uppercase tracking-[0.12em]">
          {epigrafe}
        </figcaption>
      )}
    </figure>
  );
}

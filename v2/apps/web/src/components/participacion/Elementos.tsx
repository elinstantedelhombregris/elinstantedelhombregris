import { useId } from 'react';
import { Link } from 'wouter';

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';

import { BotonPapel, Kicker, type BotonPapelVariant } from '~/components/papel/primitives';
import { cn } from '~/lib/utils';

/**
 * Los elementos de las pantallas de participación, armados sobre el kit papel
 * (`components/papel/primitives`): mismos tamaños, mismo tracking, mismos estados.
 * Conservan sus nombres y props para que las pantallas no cambien al evolucionar el kit.
 */

export function MarcoParticipacion({
  titulo,
  entrada,
  children,
  kicker = 'La ciudadanía diseña',
}: {
  titulo: string;
  entrada: string;
  children: ReactNode;
  kicker?: string;
}) {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 py-10 min-[961px]:px-10">
      <Kicker>{kicker}</Kicker>
      <h1 className="font-anton mt-5 max-w-[900px] text-[clamp(38px,6vw,76px)] leading-[1.05]">
        {titulo}
      </h1>
      <p className="text-tinta-75 mt-5 max-w-[720px] text-lg leading-relaxed">{entrada}</p>
      <div className="mt-9">{children}</div>
    </main>
  );
}

export type TonoAccion = 'violeta' | 'papel' | 'sello';

/** El tono `papel` es el botón fantasma del kit; `sello` es el violeta teñido de sello. */
const VARIANTE_DEL_TONO: Record<TonoAccion, BotonPapelVariant> = {
  violeta: 'violeta',
  papel: 'fantasma',
  sello: 'violeta',
};
const COLOR_DEL_TONO: Record<TonoAccion, string> = {
  violeta: '',
  papel: '',
  sello: 'bg-sello hover:bg-tinta',
};

/**
 * Un botón que todavía no se puede usar: tinta-30 y fondo apagado, sin el hover del tono.
 * Nunca `opacity` (el sistema la prohíbe): el estado se lee por color, y el motivo, al lado.
 */
const CLASES_BLOQUEADO =
  'border border-tinta-30 bg-papel-presionado text-tinta-50 cursor-not-allowed hover:translate-y-0 hover:bg-papel-presionado hover:text-tinta-50';

export interface BotonAccionProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-disabled'
> {
  tono?: TonoAccion;
  /**
   * Por qué la acción todavía no está disponible. Con un motivo el botón queda bloqueado y el
   * motivo se ve al lado; sin motivo (`null`) el botón anda.
   */
  motivo?: string | null;
  /** Mientras se envía: el clic se ignora, sin motivo que mostrar. */
  ocupado?: boolean;
}

/**
 * El botón de acción de las pantallas de participación.
 *
 * Bloqueado (`disabled`, `ocupado` o con `motivo`) NO usa el atributo `disabled`: sacaría al
 * botón del teclado y dejaría a quien lo usa sin saber qué le falta. Queda enfocable con
 * `aria-disabled`, el clic y el envío del formulario se ignoran, y el motivo —si lo hay— lo
 * describe a la vista.
 */
export function BotonAccion({
  children,
  tono = 'violeta',
  disabled = false,
  motivo = null,
  ocupado = false,
  onClick,
  className,
  ...props
}: BotonAccionProps) {
  const idMotivo = useId();
  const bloqueado = disabled || ocupado || motivo !== null;
  const alHacerClic = (e: MouseEvent<HTMLButtonElement>) => {
    if (bloqueado) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  return (
    <>
      <BotonPapel
        {...props}
        variant={VARIANTE_DEL_TONO[tono]}
        aria-disabled={bloqueado || undefined}
        aria-busy={ocupado || undefined}
        aria-describedby={motivo !== null ? idMotivo : props['aria-describedby']}
        onClick={alHacerClic}
        className={cn(bloqueado ? CLASES_BLOQUEADO : COLOR_DEL_TONO[tono], className)}
      >
        {children}
      </BotonPapel>
      {motivo !== null ? (
        <p id={idMotivo} className="font-space text-tinta-75 basis-full text-xs leading-relaxed">
          {motivo}
        </p>
      ) : null}
    </>
  );
}

export function EnlaceAccion({
  href,
  children,
  secundario = false,
  className,
}: {
  href: string;
  children: ReactNode;
  secundario?: boolean;
  className?: string;
}) {
  return (
    <BotonPapel
      asChild
      variant={secundario ? 'fantasma' : 'violeta'}
      className={cn(
        'focus-visible:outline-violeta inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
    >
      <Link href={href}>{children}</Link>
    </BotonPapel>
  );
}

export function ErrorOperacion({
  mensaje,
  className,
}: {
  mensaje: string | null | undefined;
  className?: string;
}) {
  return mensaje ? (
    <p
      role="alert"
      className={cn(
        'text-sello border-sello my-4 whitespace-pre-line border-l-2 pl-4 text-sm leading-relaxed',
        className,
      )}
    >
      {mensaje}
    </p>
  ) : null;
}

export function Nota({ children }: { children: ReactNode }) {
  return (
    <div className="border-violeta bg-papel-crudo my-6 border-l-2 p-5 text-sm leading-relaxed">
      {children}
    </div>
  );
}

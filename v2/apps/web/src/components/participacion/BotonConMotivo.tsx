import { BotonAccion } from './Elementos';

import type { ButtonHTMLAttributes } from 'react';

interface Props extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'aria-disabled'
> {
  /**
   * Por qué el botón no hace nada todavía. Con un motivo el botón queda
   * bloqueado y el motivo se ve al lado; sin motivo (`null`) el botón anda.
   */
  motivo: string | null;
  /** Mientras se envía: el clic se ignora, sin motivo que mostrar. */
  ocupado?: boolean;
  tono?: 'violeta' | 'papel';
}

/**
 * Un botón bloqueado que dice por qué.
 *
 * Un `disabled` mudo saca al botón del teclado y deja a quien lo usa sin saber
 * qué le falta. Acá el botón sigue enfocable (`aria-disabled`), el motivo está
 * siempre a la vista y el clic no hace nada mientras haya motivo — también se
 * ignora el envío del formulario.
 *
 * Es `BotonAccion` con el motivo obligatorio (aunque sea `null`): así quien
 * bloquea un botón no se olvida de decidir qué le dice a la persona.
 */
export function BotonConMotivo({ motivo, ocupado = false, tono = 'violeta', ...resto }: Props) {
  return <BotonAccion {...resto} motivo={motivo} ocupado={ocupado} tono={tono} />;
}

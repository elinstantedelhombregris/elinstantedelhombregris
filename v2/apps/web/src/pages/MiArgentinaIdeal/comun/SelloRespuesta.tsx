import { Sello } from '~/components/papel/primitives';
import { cn } from '~/lib/utils';

export type TipoDeSello = 'si' | 'no' | 'paso' | 'primero';

const TEXTO: Record<TipoDeSello, string> = {
  si: 'Yo también',
  no: 'Yo no',
  paso: 'Paso',
  primero: 'Primero',
};
const LUGAR: Record<TipoDeSello, string> = {
  si: 'left-4 top-14',
  no: 'right-4 top-14',
  paso: 'bottom-14 left-1/2 -translate-x-1/2',
  primero: 'right-3 top-3',
};
const GIRO: Record<TipoDeSello, number> = { si: -8, no: 6, paso: -3, primero: 6 };

/**
 * El sello que se va marcando sobre el papelito mientras se lo corre, como en una
 * mesa de entradas. `opacidad` la maneja el arrastre; sin ella, el sello está entero.
 */
export function SelloRespuesta({ tipo, opacidad = 1 }: { tipo: TipoDeSello; opacidad?: number }) {
  return (
    <Sello
      color={tipo === 'si' ? 'violeta' : tipo === 'primero' ? 'rojo' : 'violeta'}
      rotate={GIRO[tipo]}
      className={cn(
        'bg-papel-crudo pointer-events-none absolute text-[16px] [animation:none]',
        tipo === 'no' && 'border-tinta text-tinta',
        tipo === 'paso' && 'border-tinta-50 text-tinta-50',
        LUGAR[tipo],
      )}
      style={{ opacity: opacidad }}
    >
      <span aria-hidden>{TEXTO[tipo]}</span>
    </Sello>
  );
}

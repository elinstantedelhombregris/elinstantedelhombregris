import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

export type AtributosDeCampo = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-invalid' | 'aria-describedby'
>;

interface Props {
  etiqueta: string;
  /** El problema de este campo, a su lado y enlazado con `aria-describedby`. */
  error?: string | undefined;
  ayuda?: string;
  className?: string;
  /** El control recibe `aria-invalid` y `aria-describedby` ya resueltos. */
  children: (atributos: AtributosDeCampo) => ReactNode;
}

/**
 * Un campo con su etiqueta, su ayuda y su error juntos.
 *
 * La etiqueta envuelve sólo el texto y el control: la ayuda y el error van
 * al lado, así el nombre accesible del campo sigue siendo la etiqueta.
 */
export function Campo({ etiqueta, error, ayuda, className, children }: Props) {
  const id = useId();
  const ayudaId = `${id}-ayuda`;
  const errorId = `${id}-error`;
  const descripcion = [ayuda ? ayudaId : null, error ? errorId : null].filter(Boolean).join(' ');
  const atributos: AtributosDeCampo = {
    ...(error ? { 'aria-invalid': true } : {}),
    ...(descripcion ? { 'aria-describedby': descripcion } : {}),
  };
  return (
    <div className={className}>
      <label className="block font-bold">
        {etiqueta}
        {children(atributos)}
      </label>
      {ayuda ? (
        <p id={ayudaId} className="text-tinta-50 mt-2 text-xs">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sello mt-2 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

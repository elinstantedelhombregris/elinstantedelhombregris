import { useId } from 'react';

import { CAMPO } from '~/components/participacion/constantes';

export function CampoDato({
  etiqueta,
  valor,
  cambiar,
  tipo = 'texto',
  opciones,
  ayuda,
}: {
  etiqueta: string;
  valor: string | number | null;
  cambiar: (valor: string) => void;
  tipo?: 'texto' | 'largo' | 'date' | 'number' | 'url';
  opciones?: readonly (readonly [string, string])[];
  ayuda?: string;
}) {
  const id = useId();
  const atributos = {
    id,
    value: valor ?? '',
    className: CAMPO,
    'aria-describedby': ayuda ? `${id}-ayuda` : undefined,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      cambiar(e.target.value);
    },
  };
  return (
    <div className="mt-4">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {etiqueta}
      </label>
      {opciones ? (
        <select {...atributos}>
          {opciones.map(([v, nombre]) => (
            <option key={v} value={v}>
              {nombre}
            </option>
          ))}
        </select>
      ) : tipo === 'largo' ? (
        <textarea {...atributos} rows={3} maxLength={4000} />
      ) : (
        <input
          {...atributos}
          type={tipo === 'texto' ? 'text' : tipo}
          step={tipo === 'number' ? 'any' : undefined}
        />
      )}
      {ayuda ? (
        <p id={`${id}-ayuda`} className="text-tinta-75 mt-1 text-sm">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

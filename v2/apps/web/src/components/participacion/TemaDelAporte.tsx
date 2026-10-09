import { useQuery } from '@tanstack/react-query';

import { CAMPO } from './constantes';

import { api } from '~/lib/api';
export function TemaDelAporte({
  valor,
  cambiar,
  rotulo = 'Tema, si querés nombrarlo',
  vacio = 'Dejar el tema abierto',
}: {
  valor: string;
  cambiar: (v: string) => void;
  rotulo?: string;
  vacio?: string;
}) {
  const q = useQuery({
    queryKey: ['participacion-temas'],
    queryFn: () =>
      api.get<{ temas?: { clave: string; etiqueta: string }[] }>('/api/v1/contribuciones/contexto'),
  });
  return (
    <label className="mt-5 block">
      {rotulo}
      <select
        className={CAMPO}
        value={valor}
        onChange={(e) => {
          cambiar(e.target.value);
        }}
      >
        <option value="">{vacio}</option>
        {q.data?.temas?.map((t) => (
          <option key={t.clave} value={t.clave}>
            {t.etiqueta}
          </option>
        ))}
      </select>
      {q.isError && (
        <span className="text-tinta-50 mt-2 block text-sm">
          No pudimos leer los temas. Podés continuar sin elegir uno.
        </span>
      )}
    </label>
  );
}

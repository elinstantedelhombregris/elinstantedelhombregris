import { CAMPOS } from './campos-resumen';

import type { CamposCampo } from '~/lib/campo/modelo';

import { CAMPO } from '~/components/participacion/constantes';

export function CamposResumen({
  campos,
  cambiar,
}: {
  campos: CamposCampo;
  cambiar: (v: CamposCampo) => void;
}) {
  return (
    <>
      {CAMPOS.map((f) => (
        <label className="block font-semibold" key={f.clave}>
          {f.etiqueta}
          {f.tipo === 'textarea' ? (
            <textarea
              className={CAMPO}
              rows={3}
              maxLength={f.max}
              value={campos[f.clave]}
              onChange={(e) => {
                cambiar({ ...campos, [f.clave]: e.target.value });
              }}
            />
          ) : (
            <input
              className={CAMPO}
              type={f.tipo ?? 'text'}
              maxLength={f.max}
              value={campos[f.clave]}
              onChange={(e) => {
                cambiar({ ...campos, [f.clave]: e.target.value });
              }}
            />
          )}
        </label>
      ))}
    </>
  );
}

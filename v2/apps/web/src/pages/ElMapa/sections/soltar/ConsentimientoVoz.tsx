import {
  TEXTO_CONSENTIMIENTO_ACTOR,
  TEXTO_CESION_LICENCIA,
  TEXTO_PUBLICACION_IRREVOCABLE,
} from '@v2/shared';

interface Props {
  publicar: boolean;
  cede: boolean;
  setPublicar: (valor: boolean) => void;
  setCede: (valor: boolean) => void;
}
export function ConsentimientoVoz({ publicar, cede, setPublicar, setCede }: Props) {
  return (
    <div className="border-papel-borde mt-4 border-t pt-3.5 text-sm leading-relaxed">
      <p>{TEXTO_CONSENTIMIENTO_ACTOR}</p>
      <label className="mt-3 flex items-start gap-2.5" htmlFor="voz-publicacion">
        <input
          id="voz-publicacion"
          type="checkbox"
          checked={publicar}
          onChange={(e) => {
            setPublicar(e.target.checked);
          }}
          className="mt-1"
        />
        <span>Quiero publicar esta voz. {TEXTO_PUBLICACION_IRREVOCABLE}</span>
      </label>
      <label className="mt-3 flex items-start gap-2.5" htmlFor="voz-cesion">
        <input
          id="voz-cesion"
          type="checkbox"
          checked={cede}
          onChange={(e) => {
            setCede(e.target.checked);
          }}
          className="mt-1"
        />
        <span>
          Además, cedo el texto para que se pueda citar (opcional). {TEXTO_CESION_LICENCIA}
        </span>
      </label>
      {!cede ? <p className="mt-2">Tu voz cuenta igual; el texto queda reservado.</p> : null}
    </div>
  );
}

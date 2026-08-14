/**
 * «¿Esto habla de una casa donde vive alguien?»
 *
 * ## Por qué es obligatoria y por qué está en los nueve tipos
 *
 * Es la que fija el **rol** y la **sensibilidad** de la ubicación, y por lo
 * tanto la que decide cuánta dirección se puede publicar. Sin ella, los
 * defaults de la tabla —`subject` + `high`, que fallan cerrado a propósito—
 * disparan `senales_direccion_protegida_chk` y **cualquier** calle se cae. O
 * sea: sin esta pregunta contestada, el selector de calle no puede escribir
 * nada. No es un paso más del formulario, es su llave.
 *
 * Corre en los nueve tipos y no sólo en los que cambian de rol: en los cinco
 * que no cambian, un «sí» sube igual la sensibilidad. La decisión es del plan y
 * no de la spec, y la razón es que preguntar de más protege, y preguntar sólo a
 * veces enseña que a veces no importa.
 *
 * ## Por qué «no sé» no es «no»
 *
 * Las cuatro respuestas son las de `RespuestaDeVivienda` y la cuarta es
 * `sinRespuesta`. Cae del lado seguro —`subject` + `high`, sin rechazo posible
 * del engrosado— porque una ausencia de respuesta y un «no» son dos estados de
 * conocimiento distintos, y tratarlos igual sería el `0` que significa «no sé»
 * con el valor más permisivo.
 */
import type { RespuestaDeVivienda } from '@v2/civic-core';

export interface PreguntaDeLaCasaProps {
  readonly valor: RespuestaDeVivienda;
  readonly onCambio: (r: RespuestaDeVivienda) => void;
}

const OPCIONES: readonly { clave: RespuestaDeVivienda; texto: string; glosa: string }[] = [
  { clave: 'no', texto: 'No', glosa: 'Es la calle, una plaza, un edificio público.' },
  { clave: 'propia', texto: 'Sí, la mía', glosa: 'Vos decidís cuánto se publica.' },
  { clave: 'ajena', texto: 'Sí, la de otro', glosa: 'La protegemos igual, y no se puede rechazar.' },
  { clave: 'sinRespuesta', texto: 'Prefiero no decir', glosa: 'Protegemos de más, por las dudas.' },
];

export function PreguntaDeLaCasa({ valor, onCambio }: PreguntaDeLaCasaProps) {
  return (
    <fieldset className="border-papel-borde mt-4 border-t pt-3.5">
      <legend className="font-space text-tinta-75 text-[11px] uppercase tracking-[0.12em]">
        ¿Esto habla de una casa donde vive alguien?
      </legend>
      <div className="mt-2 grid gap-1.5">
        {OPCIONES.map(({ clave, texto, glosa }) => (
          <label
            key={clave}
            className="flex cursor-pointer items-start gap-2.5 py-1"
            htmlFor={`casa-${clave}`}
          >
            <input
              id={`casa-${clave}`}
              type="radio"
              name="casa"
              value={clave}
              checked={valor === clave}
              onChange={() => {
                onCambio(clave);
              }}
              className="mt-1 shrink-0"
            />
            <span>
              <span className="font-space text-tinta text-[13px] font-bold">{texto}</span>{' '}
              <span className="font-space text-tinta-50 text-[11px]">{glosa}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

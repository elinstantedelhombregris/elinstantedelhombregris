import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion } from '~/components/participacion/Elementos';
import { LIMITE_APORTE } from '~/lib/participacion/texto-aporte';

/** Una de las tres preguntas. La primera necesita una respuesta; las otras se pueden dejar abiertas. */
export function PasoPregunta({
  paso,
  pregunta,
  valor,
  cambiar,
  volver,
  seguir,
}: {
  paso: number;
  pregunta: string;
  valor: string;
  cambiar: (v: string) => void;
  volver: () => void;
  seguir: () => void;
}) {
  const ultima = paso === 2;
  const motivo = paso === 0 && !valor.trim() ? 'Escribí al menos una frase para seguir.' : null;
  return (
    <section className="border-tinta/20 border-y py-5">
      <h3 tabIndex={-1} data-foco-paso className="font-anton text-[28px] leading-tight">
        {pregunta}
      </h3>
      <p className="text-tinta-75 mt-4 leading-relaxed">
        {paso === 0
          ? 'Una escena alcanza para empezar. Qué harías, con quién, cómo sería un día tuyo.'
          : 'Podés contestar, dejarla abierta o pasar a la siguiente.'}
      </p>
      <textarea
        aria-label={pregunta}
        rows={4}
        maxLength={LIMITE_APORTE}
        value={valor}
        onChange={(e) => {
          cambiar(e.target.value);
        }}
        className={CAMPO}
        placeholder={paso === 0 ? 'En mi Argentina ideal…' : 'Lo que para mí importa…'}
      />
      <p className="text-tinta-50 mt-2 text-xs">
        {valor.length} de {LIMITE_APORTE} caracteres. Es un borrador: todavía no se publicó.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {paso > 0 ? (
          <BotonAccion type="button" tono="papel" onClick={volver}>
            Volver
          </BotonAccion>
        ) : null}
        <BotonConMotivo type="button" motivo={motivo} onClick={seguir}>
          {ultima ? 'Revisar lo que voy a compartir' : 'Seguir imaginando'}
        </BotonConMotivo>
        {paso > 0 ? (
          <button type="button" className="min-h-11 underline" onClick={seguir}>
            Dejar esta pregunta abierta
          </button>
        ) : null}
      </div>
    </section>
  );
}

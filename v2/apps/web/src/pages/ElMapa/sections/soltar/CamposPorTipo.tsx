import { claseDe, type TipoSenal } from '~/lib/vocabulario';

/**
 * Los campos que sólo existen para algunos tipos.
 *
 * No son adornos: los cinco son CHECK de la migración `0022`. Un `compromiso`
 * sin `comprometido_para` no entra en la base, un `saber` sin `fuente` tampoco,
 * y una `práctica` sin `periodicidad` tampoco. Si el formulario no los pide, la
 * persona escribe, aprieta enviar, y recibe un error del servidor sobre un
 * campo que nunca vio.
 *
 * El de `periodicidad` es un `select` y no un campo de texto **porque la base
 * tiene un vocabulario cerrado de seis**. El horario concreto —«martes y jueves
 * a las 18»— va en el texto de la señal, que es donde alguien lo va a leer.
 */

export interface CamposPorTipoProps {
  readonly tipo: TipoSenal;
  readonly titulo: string;
  readonly fuente: string;
  readonly comprometidoPara: string;
  readonly periodicidad: string;
  readonly sostenidaPor: string;
  readonly onCambio: (campo: string, valor: string) => void;
}

const PERIODICIDADES = [
  ['diaria', 'Todos los días'],
  ['semanal', 'Una vez por semana'],
  ['quincenal', 'Cada quince días'],
  ['mensual', 'Una vez por mes'],
  ['eventual', 'Cuando se puede'],
  ['permanente', 'Siempre abierto'],
] as const;

const rotulo = 'font-space text-tinta-75 mb-1.5 mt-3.5 block text-[11px] uppercase tracking-[0.12em]';
const campo =
  'border-tinta bg-papel-crudo text-tinta placeholder:text-tinta-50 w-full border p-3 text-[14px]';

export function CamposPorTipo(p: CamposPorTipoProps) {
  const llevaTitulo = p.tipo === 'práctica' || p.tipo === 'propuesta';

  return (
    <>
      {llevaTitulo ? (
        <>
          <label htmlFor="voz-titulo" className={rotulo}>
            Ponele un nombre
          </label>
          <input
            id="voz-titulo"
            type="text"
            maxLength={120}
            value={p.titulo}
            onChange={(e) => {
              p.onCambio('titulo', e.target.value);
            }}
            placeholder={
              p.tipo === 'práctica' ? 'El comedor de la esquina' : 'Un semáforo en Rivadavia y Boedo'
            }
            className={campo}
          />
        </>
      ) : null}

      {p.tipo === 'saber' ? (
        <>
          <label htmlFor="voz-fuente" className={rotulo}>
            ¿Cómo lo sabés?
          </label>
          <input
            id="voz-fuente"
            type="text"
            maxLength={200}
            value={p.fuente}
            onChange={(e) => {
              p.onCambio('fuente', e.target.value);
            }}
            placeholder="Lo vi, me lo dijeron, lo leí en…"
            className={campo}
          />
          <p className="font-archivo text-tinta-75 mt-1.5 text-[13px] leading-snug">
            Un saber sin procedencia es un rumor. No hace falta que sea oficial: alcanza con que se
            pueda seguir.
          </p>
        </>
      ) : null}

      {claseDe(p.tipo) === 'acto' ? (
        <>
          <label htmlFor="voz-fecha" className={rotulo}>
            ¿Para cuándo?
          </label>
          <input
            id="voz-fecha"
            type="date"
            /* Hoy es el piso: una fecha pasada la rechaza el servidor, y es
               mejor que el calendario no la ofrezca a que la ofrezca y falle. */
            min={new Date().toISOString().slice(0, 10)}
            value={p.comprometidoPara}
            onChange={(e) => {
              p.onCambio('comprometidoPara', e.target.value);
            }}
            className={campo}
          />
          <p className="font-archivo text-tinta-75 mt-1.5 text-[13px] leading-snug">
            Sin fecha, un compromiso es un sueño con otro nombre. Prometé poco y que se pueda ver.
          </p>
        </>
      ) : null}

      {p.tipo === 'práctica' ? (
        <>
          <label htmlFor="voz-periodicidad" className={rotulo}>
            ¿Cada cuánto?
          </label>
          <div className="relative">
            <select
              id="voz-periodicidad"
              value={p.periodicidad}
              onChange={(e) => {
                p.onCambio('periodicidad', e.target.value);
              }}
              className={`${campo} font-space appearance-none`}
            >
              <option value="">Elegí una</option>
              {PERIODICIDADES.map(([clave, texto]) => (
                <option key={clave} value={clave}>
                  {texto}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="font-space text-tinta-50 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px]"
            >
              ▾
            </span>
          </div>
          <p className="font-archivo text-tinta-75 mt-1.5 text-[13px] leading-snug">
            El horario exacto ponelo arriba, en el texto: ahí lo va a leer una persona.
          </p>

          <label htmlFor="voz-sostenida" className={rotulo}>
            ¿Quién la sostiene? (opcional)
          </label>
          <input
            id="voz-sostenida"
            type="text"
            maxLength={120}
            value={p.sostenidaPor}
            onChange={(e) => {
              p.onCambio('sostenidaPor', e.target.value);
            }}
            placeholder="La cooperativa, la parroquia, los vecinos…"
            className={campo}
          />
        </>
      ) : null}
    </>
  );
}

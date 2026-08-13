import type { EstadoDelBarrido } from '../useBarrido';

/**
 * § El progreso del barrido — cinco estados, y cada uno dice lo suyo.
 *
 * La barra es decorativa; **el número es el dato**, y por eso va escrito al
 * lado con su cota. La cota se declara como cota y no como promesa: la
 * bisección corta apenas la ventana baja de la tolerancia, así que un barrido
 * de umbrales termina antes de llegar al tope y una barra que prometiera un
 * total exacto se quedaría a mitad de camino sin haber fallado en nada.
 *
 * Y «cancelado» dice cuántas corridas llevaba **y** que no quedó medio
 * resultado: el hilo se terminó entero, así que no hay una tabla a medio
 * llenar esperando que alguien la lea como si estuviera completa.
 */
export function Progreso({ estado }: { estado: EstadoDelBarrido }) {
  if (estado.fase === 'quieto') return null;

  if (estado.fase === 'corriendo') {
    const fraccion = Math.min(1, estado.previstas === 0 ? 0 : estado.hechas / estado.previstas);
    return (
      <div className="mt-4">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={estado.previstas}
          aria-valuenow={estado.hechas}
          aria-label="Corridas del barrido"
          className="bg-papel-presionado h-1.5 w-full max-w-[420px]"
        >
          <div className="bg-violeta h-full" style={{ width: `${String(fraccion * 100)}%` }} />
        </div>
        <p className="font-space text-tinta-50 mt-2 text-[12px] tabular-nums">
          {estado.hechas.toLocaleString('es-AR')} corridas de hasta{' '}
          {estado.previstas.toLocaleString('es-AR')} — la bisección corta antes cuando puede.
        </p>
      </div>
    );
  }

  if (estado.fase === 'cancelado') {
    return (
      <p className="font-space text-tinta-50 mt-4 text-[12px]">
        Cancelado a las {estado.hechas.toLocaleString('es-AR')} corridas. No queda medio resultado:
        el hilo se terminó entero.
      </p>
    );
  }

  if (estado.fase === 'fallo') {
    return (
      <p role="alert" className="text-sello mt-4 max-w-[70ch] text-[14px] leading-[1.5]">
        {estado.mensaje}
      </p>
    );
  }

  return (
    <p className="font-space text-tinta-50 mt-4 text-[12px] tabular-nums">
      Listo en {estado.ms.toLocaleString('es-AR')} ms.
    </p>
  );
}

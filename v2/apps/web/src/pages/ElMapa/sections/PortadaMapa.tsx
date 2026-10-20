import { Link } from 'wouter';

import { MI_ARGENTINA_IDEAL_HREF } from '~/components/papel/papel-nav';
import { Kicker } from '~/components/papel/primitives';

/**
 * § 1 — Portada, en corto.
 *
 * Kicker + titular + una bajada, para que el instrumento entre en la primera
 * pantalla (análisis del 8/9, objeción 4; D-080: nada de cifra gigante).
 *
 * Desde la entrega 3 de Mi Argentina ideal (spec 2026-10-19 §6 y §7) el mapa ya no
 * es la puerta de entrada: es la capa de **cómo está hoy** lo que la gente imaginó.
 * La portada lo dice así, ofrece volver a Mi Argentina ideal y no repite botones
 * para aportar: el único es el del instrumento, que abre el aporte puntual.
 */
export function PortadaMapa() {
  return (
    <header className="mx-auto max-w-[1440px] px-5 pb-3 pt-6 min-[961px]:px-10">
      <Kicker className="mb-2">El mapa de lo que pasa hoy</Kicker>
      <h1 className="font-anton text-[clamp(30px,4vw,52px)] leading-tight">
        Cómo está hoy lo que imaginamos
      </h1>
      <p className="text-tinta-75 mt-2 max-w-[62ch] text-[16px] leading-relaxed">
        Acá se cuenta y se comprueba, lugar por lugar, lo que ya pasa: un problema, algo que falta,
        algo que ya funciona. Cada punto es un aporte con su lugar.
      </p>
      <div className="mt-2 flex flex-wrap gap-x-5 text-sm">
        <Link
          className="text-violeta inline-flex min-h-11 items-center underline"
          href={MI_ARGENTINA_IDEAL_HREF}
        >
          ← Volver a Mi Argentina ideal
        </Link>
        <Link className="inline-flex min-h-11 items-center underline" href="/iniciativas">
          Sumarme a una tarea
        </Link>
        <Link
          className="inline-flex min-h-11 items-center underline"
          href="/recorridos/llegar-a-tiempo-a-la-escuela"
        >
          Cómo un aporte llega a una acción: el ejemplo escolar
        </Link>
      </div>
    </header>
  );
}

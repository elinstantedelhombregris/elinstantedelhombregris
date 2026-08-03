/**
 * El vacío de una lente — spec `2026-08-02-el-vacio-como-pieza.md` §3.
 *
 * No se disculpa y no dice «no hay datos»: contesta la misma pregunta que la
 * lente contestaría con datos, en su versión de cero. «Qué provincia habla
 * más» no se responde con «sin datos disponibles», se responde con «ninguna
 * todavía».
 *
 * Y no roba el puntero: un cartel que impide arrastrar el mapa convierte una
 * invitación en un estorbo. Solo el botón recupera el click.
 */
export function Vacio({
  titulo,
  cuerpo,
  accion,
}: {
  titulo: string;
  cuerpo: string;
  accion?: { href: string; etiqueta: string };
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="max-w-[38ch] text-center">
        <p className="font-anton text-papel text-[clamp(20px,2.6vw,30px)] leading-[1.1]">{titulo}</p>
        <p className="text-oscuro-secundario mt-2 text-[14px] leading-relaxed">{cuerpo}</p>
        {accion ? (
          <a
            href={accion.href}
            className="font-space text-tinta bg-papel pointer-events-auto mt-4 inline-block px-4 py-2 text-[11px] uppercase tracking-[0.14em]"
          >
            {accion.etiqueta}
          </a>
        ) : null}
      </div>
    </div>
  );
}
